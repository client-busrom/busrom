/**
 * SEO Settings API
 *
 * Fetches SEO settings from Payload CMS and matches them based on
 * current page path and type.
 */

import type { Metadata } from 'next'

// CMS URL for API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

// CDN URL for images
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://d2kqew3hn5wphn.cloudfront.net'

export interface SeoSetting {
  id: string
  identifier: string
  scope: 'global' | 'page_type' | 'exact_path' | 'path_pattern'
  pageType?: string
  exactPath?: string
  pathPattern?: string
  // Basic SEO
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    id: string
    url?: string
    filename?: string
  }
  ogType?: 'website' | 'article' | 'product'
  // Robots
  robotsIndex?: boolean
  robotsFollow?: boolean
  canonicalUrl?: string
  // Sitemap
  includeInSitemap?: boolean
  sitemapPriority?: number
  sitemapChangefreq?: string
}

interface SeoSettingsResponse {
  docs: SeoSetting[]
  totalDocs: number
}

// Cache for SEO settings (revalidate every 5 minutes)
let seoCache: SeoSetting[] | null = null
let seoCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch all SEO settings from CMS
 */
export async function getAllSeoSettings(locale: string = 'en'): Promise<SeoSetting[]> {
  const now = Date.now()

  // Return cached data if still valid
  if (seoCache && now - seoCacheTime < CACHE_TTL) {
    return seoCache
  }

  try {
    const response = await fetch(
      `${CMS_URL}/api/seo-settings?locale=${locale}&limit=100&depth=1`,
      {
        next: { revalidate: 300 }, // 5 minutes
      }
    )

    if (!response.ok) {
      console.error('[SeoSettings] Failed to fetch:', response.status)
      return seoCache || []
    }

    const data: SeoSettingsResponse = await response.json()
    seoCache = data.docs || []
    seoCacheTime = now

    return seoCache
  } catch (error) {
    console.error('[SeoSettings] Error fetching SEO settings:', error)
    return seoCache || []
  }
}

/**
 * Match a path against a wildcard pattern
 */
function matchPathPattern(pattern: string, path: string): boolean {
  const normalizedPattern = pattern.replace(/^\/|\/$/g, '')
  const normalizedPath = path.replace(/^\/|\/$/g, '')

  const regexPattern = normalizedPattern
    .split('/')
    .map(segment => {
      if (segment === '**') return '.*'
      if (segment === '*') return '[^/]+'
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(normalizedPath)
}

/**
 * Get the best matching SEO setting for a page
 * Priority: exact_path > path_pattern > page_type > global
 */
export async function getMatchingSeoSetting(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<SeoSetting | null> {
  const allSettings = await getAllSeoSettings(locale)

  // Normalize path (remove locale prefix if present)
  const normalizedPath = path.replace(/^\/(en|zh|de|fr|es|pt|it|nl|pl|ru|ja|ko|ar|th|vi|id|ms|tr|hi|bn)/, '') || '/'

  // Find all matching settings
  const matches: { setting: SeoSetting; priority: number }[] = []

  for (const setting of allSettings) {
    switch (setting.scope) {
      case 'exact_path':
        if (setting.exactPath === normalizedPath) {
          matches.push({ setting, priority: 4 })
        }
        break

      case 'path_pattern':
        if (setting.pathPattern && matchPathPattern(setting.pathPattern, normalizedPath)) {
          matches.push({ setting, priority: 3 })
        }
        break

      case 'page_type':
        if (pageType && setting.pageType === pageType) {
          matches.push({ setting, priority: 2 })
        }
        break

      case 'global':
        matches.push({ setting, priority: 1 })
        break
    }
  }

  // Return the highest priority match
  if (matches.length === 0) return null

  matches.sort((a, b) => b.priority - a.priority)
  return matches[0].setting
}

/**
 * Build Next.js Metadata object from SEO setting
 */
export function buildMetadata(
  seoSetting: SeoSetting | null,
  baseMetadata: Metadata = {},
  baseUrl: string = 'https://www.busromhouse.com'
): Metadata {
  if (!seoSetting) return baseMetadata

  const metadata: Metadata = { ...baseMetadata }

  // Basic SEO
  if (seoSetting.metaTitle) {
    metadata.title = seoSetting.metaTitle
  }
  if (seoSetting.metaDescription) {
    metadata.description = seoSetting.metaDescription
  }
  if (seoSetting.metaKeywords) {
    metadata.keywords = seoSetting.metaKeywords.split(',').map(k => k.trim())
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
  if (seoSetting.canonicalUrl) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: seoSetting.canonicalUrl,
    }
  }

  // Open Graph
  const ogTitle = seoSetting.ogTitle || seoSetting.metaTitle
  const ogDescription = seoSetting.ogDescription || seoSetting.metaDescription

  if (ogTitle || ogDescription || seoSetting.ogImage) {
    // Build OpenGraph metadata based on type
    const ogType = seoSetting.ogType || 'website'

    // Create base OpenGraph object
    const openGraphBase = {
      title: ogTitle || undefined,
      description: ogDescription || undefined,
    }

    // Handle different OG types (Next.js requires specific type structures)
    if (ogType === 'article') {
      metadata.openGraph = {
        ...metadata.openGraph,
        ...openGraphBase,
        type: 'article' as const,
      }
    } else {
      // Default to website for all other types (including 'product' which is not a valid OG type)
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
 * Combines CMS SEO settings with page-specific metadata
 */
export async function getPageMetadata(
  path: string,
  pageType?: string,
  locale: string = 'en',
  pageMetadata: Metadata = {}
): Promise<Metadata> {
  const seoSetting = await getMatchingSeoSetting(path, pageType, locale)
  return buildMetadata(seoSetting, pageMetadata)
}
