/**
 * SEO Settings API
 *
 * Fetches SEO settings from Payload CMS /api/seo-settings/match
 */

import type { Metadata } from 'next'
import { cache } from 'react'
import { getAlternateLanguages } from '../seo-utils'

// CMS URL for API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

// CDN URL for images
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.busromhouse.com'

export interface SeoSetting {
  id: string
  identifier: string
  scope: 'global' | 'page_type' | 'exact_path' | 'path_pattern'
  pageType?: string
  exactPath?: string
  pathPattern?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    id: string
    url?: string
    filename?: string
  }
  ogType?: 'website' | 'article' | 'product'
  robotsIndex?: boolean
  robotsFollow?: boolean
  canonicalUrl?: string
  includeInSitemap?: boolean
  sitemapPriority?: number
  sitemapChangefreq?: string
  isMainSeo?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface KeywordDistribution {
  imgAlts: string[]
  ariaLabels: string[]
  ariaDescribedby: string[]
  srOnlyLabels: string[]
  dataAttributes: string[]
  totalKeywords: number
}

interface MatchResponse {
  setting: SeoSetting | null
  distributedKeywords: KeywordDistribution
}

const emptyDistribution: KeywordDistribution = {
  imgAlts: [],
  ariaLabels: [],
  ariaDescribedby: [],
  srOnlyLabels: [],
  dataAttributes: [],
  totalKeywords: 0,
}

import { fetchLimiter } from '../semaphore';

export const getMatchedSeo = cache(
  async (path: string, pageType?: string, locale: string = 'en'): Promise<MatchResponse> => {
    return fetchLimiter.run(async () => {
      try {
        const queryParams = new URLSearchParams({
          path: path || '/',
          locale: locale,
        })
        if (pageType) {
          queryParams.append('pageType', pageType)
        }

        const response = await fetch(`${CMS_URL}/api/seo-settings/match?${queryParams.toString()}`, {
          next: { revalidate: 300 }, // 5 minutes cache
        })

        if (!response.ok) {
          console.error('[SeoSettings] Failed to fetch matched SEO:', response.status)
          return {
            setting: null,
            distributedKeywords: emptyDistribution,
          }
        }

        const data: MatchResponse = await response.json()

        // Log keyword distribution quantities for debugging
        const dist = data.distributedKeywords
        console.log(`[SEO API] Path: ${path} | Total hidden keywords: ${dist?.totalKeywords || 0}`)
        if (dist && dist.totalKeywords > 0) {
          console.log(`  ↳ imgAlts: ${dist.imgAlts?.length || 0}`)
          console.log(`  ↳ ariaLabels: ${dist.ariaLabels?.length || 0}`)
          console.log(`  ↳ ariaDescribedby: ${dist.ariaDescribedby?.length || 0}`)
          console.log(`  ↳ srOnlyLabels: ${dist.srOnlyLabels?.length || 0}`)
          console.log(`  ↳ dataAttributes: ${dist.dataAttributes?.length || 0}`)
        }

        // Ensure the distribution fields are arrays, even if backend returns empty
        return {
          setting: data.setting,
          distributedKeywords: {
            ...emptyDistribution,
            ...data.distributedKeywords,
          }
        }
      } catch (error) {
        console.error('[SeoSettings] Error fetching matched SEO:', error)
        return {
          setting: null,
          distributedKeywords: emptyDistribution,
        }
      }
    });
  }
)

/**
 * Get SEO for homepage
 * Wraps getMatchedSeo for backward compatibility
 */
export async function getHomePageSeo(
  locale: string = 'en'
): Promise<MatchResponse> {
  return getMatchedSeo('/', 'home', locale)
}

/**
 * Get SEO for non-homepage
 * Wraps getMatchedSeo for backward compatibility
 */
export async function getNonHomePageSeo(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<MatchResponse> {
  return getMatchedSeo(path, pageType, locale)
}

/**
 * Get the best matching SEO setting for a page
 * @deprecated Use getMatchedSeo instead
 */
export async function getMatchingSeoSetting(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<SeoSetting | null> {
  const result = await getMatchedSeo(path, pageType, locale)
  return result.setting
}

/**
 * Get distributed keywords for attribute-based SEO
 * @deprecated Use getMatchedSeo instead
 */
export async function getDistributedKeywords(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<KeywordDistribution> {
  const result = await getMatchedSeo(path, pageType, locale)
  return result.distributedKeywords
}

/**
 * Build Next.js Metadata object from SEO setting
 */
export function buildMetadata(
  seoSetting: SeoSetting | null,
  baseMetadata: Metadata = {},
  baseUrl: string = 'https://www.busromhouse.com',
  actualPath?: string
): Metadata {
  const metadata: Metadata = { ...baseMetadata }

  const cleanPath = actualPath || (seoSetting ? seoSetting.exactPath : null) || '/';

  if (!seoSetting) {
    const finalCanonical = `${baseUrl.replace(/\/$/, '')}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    metadata.alternates = {
      ...metadata.alternates,
      canonical: finalCanonical,
      languages: getAlternateLanguages(cleanPath),
    }
    return metadata;
  }

  // Basic SEO
  if (seoSetting.metaTitle) {
    metadata.title = seoSetting.metaTitle
  }
  if (seoSetting.metaDescription) {
    metadata.description = seoSetting.metaDescription
  }

  // Robots
  const robotsIndex = seoSetting.robotsIndex !== false
  const robotsFollow = seoSetting.robotsFollow !== false
  metadata.robots = {
    index: robotsIndex,
    follow: robotsFollow,
    googleBot: {
      index: robotsIndex,
      follow: robotsFollow,
    },
  }

  // Canonical
  if (seoSetting.canonicalUrl && seoSetting.scope === 'exact_path') {
    let canonicalUrl = seoSetting.canonicalUrl.trim()

    if (!canonicalUrl.startsWith('http://') && !canonicalUrl.startsWith('https://')) {
      if (canonicalUrl.startsWith('www.')) {
        canonicalUrl = 'https://' + canonicalUrl
      } else if (canonicalUrl.startsWith('/')) {
        canonicalUrl = baseUrl + canonicalUrl
      } else {
        canonicalUrl = 'https://' + canonicalUrl
      }
    }

    metadata.alternates = {
      ...metadata.alternates,
      canonical: canonicalUrl,
      languages: getAlternateLanguages(actualPath || seoSetting.exactPath || '/'),
    }
  } else {
    const finalCanonical = `${baseUrl.replace(/\/$/, '')}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    metadata.alternates = {
      ...metadata.alternates,
      canonical: finalCanonical,
      languages: getAlternateLanguages(cleanPath),
    }
  }

  // Open Graph
  const ogTitle = seoSetting.ogTitle || seoSetting.metaTitle
  const ogDescription = seoSetting.ogDescription || seoSetting.metaDescription

  if (ogTitle || ogDescription || seoSetting.ogImage) {
    const ogType = seoSetting.ogType || 'website'

    const openGraphBase = {
      title: ogTitle || undefined,
      description: ogDescription || undefined,
    }

    if (ogType === 'article') {
      metadata.openGraph = {
        ...metadata.openGraph,
        ...openGraphBase,
        type: 'article' as const,
      }
    } else {
      metadata.openGraph = {
        ...metadata.openGraph,
        ...openGraphBase,
        type: 'website' as const,
      }
    }

    if (seoSetting.ogImage?.url) {
      const imageUrl = seoSetting.ogImage.url.startsWith('http')
        ? seoSetting.ogImage.url
        : `${CDN_URL}${seoSetting.ogImage.url}`

      metadata.openGraph.images = [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ]
    }
  }

  // Twitter Card
  if (ogTitle || ogDescription) {
    metadata.twitter = {
      card: 'summary_large_image',
      title: ogTitle || undefined,
      description: ogDescription || undefined,
    }
  }

  return metadata
}

/**
 * Get merged metadata for a page
 */
export async function getPageMetadata(
  path: string,
  pageType?: string,
  locale: string = 'en',
  pageMetadata: Metadata = {}
): Promise<Metadata> {
  const { setting } = await getMatchedSeo(path, pageType, locale)
  return buildMetadata(setting, pageMetadata, 'https://www.busromhouse.com', path)
}
