/**
 * SEO Settings API
 *
 * Fetches SEO settings from Payload CMS and matches them based on
 * current page path and type.
 */

import type { Metadata } from 'next'
import { getAlternateLanguages } from '../seo-utils'

// CMS URL for API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

// CDN URL for images
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.busromhouse.com'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

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
  isMainSeo?: boolean
  // Timestamps
  createdAt?: string
  updatedAt?: string
}

interface SeoSettingsResponse {
  docs: SeoSetting[]
  totalDocs: number
}

// Cache for SEO settings (revalidate every 5 minutes)
let seoPromiseCache: Record<string, Promise<SeoSetting[]> | undefined> = {}
let seoCacheTime: Record<string, number> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch all SEO settings from CMS
 */
export async function getAllSeoSettings(locale: string = 'en'): Promise<SeoSetting[]> {
  const now = Date.now()

  // Return cached promise if still valid for this specific locale
  if (seoPromiseCache[locale] && now - (seoCacheTime[locale] || 0) < CACHE_TTL) {
    return seoPromiseCache[locale]
  }

  // Create fetch promise and immediately cache it to prevent Cache Stampede
  const fetchPromise = (async () => {
    try {
      const response = await fetch(
        `${CMS_URL}/api/seo-settings?locale=${locale}&limit=500&depth=1`,
        {
          next: { revalidate: 300 }, // 5 minutes
        }
      )

      if (!response.ok) {
        console.error('[SeoSettings] Failed to fetch:', response.status)
        return []
      }

      const data: SeoSettingsResponse = await response.json()
      return data.docs || []
    } catch (error) {
      console.error('[SeoSettings] Error fetching SEO settings:', error)
      return []
    }
  })();

  seoPromiseCache[locale] = fetchPromise
  seoCacheTime[locale] = now
  return fetchPromise
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
  baseUrl: string = 'https://www.busromhouse.com',
  actualPath?: string
): Metadata {
  const metadata: Metadata = { ...baseMetadata }

  // Default cleanPath from actualPath if available
  const cleanPath = actualPath || (seoSetting ? seoSetting.exactPath : null) || '/';
  
  if (!seoSetting) {
    // Even if there is no CMS SEO setting, we MUST generate the correct canonical URL
    // Otherwise, Next.js falls back to layout.tsx's canonical ('./') which breaks SEO
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
  // Note: metaKeywords are NOT set here - they are distributed via SeoAttributeDistributor
  // to avoid creating a visible <meta name="keywords"> tag

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

  // Canonical - ensure it's an absolute URL
  // Only use explicitly set canonical URL if this is an EXACT PATH match
  // Global or Pattern matches should dynamically generate the canonical URL based on the actual path
  // to prevent canonical duplication across multiple pages
  if (seoSetting.canonicalUrl && seoSetting.scope === 'exact_path') {
    let canonicalUrl = seoSetting.canonicalUrl.trim()

    // If it doesn't start with http(s), make it absolute
    if (!canonicalUrl.startsWith('http://') && !canonicalUrl.startsWith('https://')) {
      // Remove leading www. if present (we'll add https://www.)
      if (canonicalUrl.startsWith('www.')) {
        canonicalUrl = 'https://' + canonicalUrl
      } else if (canonicalUrl.startsWith('/')) {
        // Path-only canonical, prepend base URL
        canonicalUrl = baseUrl + canonicalUrl
      } else {
        // Bare domain or path, assume it needs https://
        canonicalUrl = 'https://' + canonicalUrl
      }
    }

    metadata.alternates = {
      ...metadata.alternates,
      canonical: canonicalUrl,
      languages: getAlternateLanguages(actualPath || seoSetting.exactPath || '/'),
    }
  } else {
    // Dynamically generate the canonical URL using the clean path
    // This correctly handles global settings falling back to the current page's URL
    const cleanPath = actualPath || (seoSetting ? seoSetting.exactPath : null) || '/';
    // Ensure we don't have double slashes if baseUrl has trailing slash or cleanPath has leading slash
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
  return buildMetadata(seoSetting, pageMetadata, 'https://www.busromhouse.com', path)
}

/**
 * Get ALL matching SEO settings for a page (sorted by priority)
 * Used for hidden keyword injection
 */
export async function getAllMatchingSeoSettings(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<SeoSetting[]> {
  const allSettings = await getAllSeoSettings(locale)

  // Normalize path (remove locale prefix if present)
  const normalizedPath = path.replace(/^\/(en|zh|de|fr|es|pt|it|nl|pl|ru|ja|ko|ar|th|vi|id|ms|tr|hi|bn)/, '') || '/'

  // Find all matching settings with priority
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

  // Sort by priority (highest first) and return all settings
  matches.sort((a, b) => b.priority - a.priority)
  return matches.map(m => m.setting)
}

/**
 * Data structure for hidden SEO injection
 * @deprecated Use KeywordDistribution instead
 */
export interface HiddenSeoData {
  // For CSS pseudo-element injection (hidden from users, visible to crawlers)
  hiddenTitles: string[]
  hiddenDescriptions: string[]
  hiddenKeywords: string[]
  // All keywords combined and shuffled for distribution
  allKeywordsArray: string[]
}

/**
 * Keyword distribution strategy across HTML attributes
 * Distributes keywords into existing element attributes to avoid black-hat SEO
 */
export interface KeywordDistribution {
  // Image alt text (30% of keywords)
  imgAlts: string[]
  // Link title attributes (15% of keywords)
  linkTitles: string[]
  // ARIA labels for buttons/navigation (15% of keywords)
  ariaLabels: string[]
  // ARIA described-by with sr-only elements (10% of keywords)
  ariaDescribedby: string[]
  // Image title attributes (10% of keywords)
  imgTitles: string[]
  // Input/textarea placeholders (8% of keywords)
  placeholders: string[]
  // Screen reader only labels (5% of keywords)
  srOnlyLabels: string[]
  // Data attributes (5% of keywords)
  dataAttributes: string[]
  // Additional meta tags (2% of keywords)
  metaTags: string[]
  // Total count for reference
  totalKeywords: number
}

/**
 * Get SEO data for hidden injection
 * - Primary SEO setting is used for meta tags (title, description)
 * - All other titles, descriptions, and keywords are collected for hidden injection
 */
export async function getHiddenSeoData(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<HiddenSeoData> {
  const allSettings = await getAllMatchingSeoSettings(path, pageType, locale)

  const hiddenTitles: string[] = []
  const hiddenDescriptions: string[] = []
  const hiddenKeywords: string[] = []

  // First setting is primary (used for meta tags)
  // Skip it for hidden injection, collect the rest
  allSettings.forEach((setting, index) => {
    // For titles and descriptions, skip the first one (it's in meta tags)
    if (index > 0) {
      if (setting.metaTitle) {
        hiddenTitles.push(setting.metaTitle)
      }
      if (setting.metaDescription) {
        hiddenDescriptions.push(setting.metaDescription)
      }
    }

    // For keywords, collect from ALL settings (including primary)
    if (setting.metaKeywords) {
      const keywords = setting.metaKeywords
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
      hiddenKeywords.push(...keywords)
    }
  })

  // Remove duplicates and shuffle keywords for natural distribution
  const uniqueKeywords = [...new Set(hiddenKeywords)]
  const shuffledKeywords = shuffleArray(uniqueKeywords)

  return {
    hiddenTitles,
    hiddenDescriptions,
    hiddenKeywords: uniqueKeywords,
    allKeywordsArray: shuffledKeywords,
  }
}

/**
 * Fisher-Yates shuffle for random keyword distribution
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Get distributed keywords for attribute-based SEO
 * Dynamically distributes ALL keywords from matching SEO settings across different HTML attributes
 *
 * Distribution percentages (adjust based on total count):
 * - 30% → img alt
 * - 15% → a title
 * - 15% → aria-label
 * - 10% → aria-describedby
 * - 10% → img title
 * - 8% → placeholder
 * - 5% → sr-only labels
 * - 5% → data-* attributes
 * - 2% → meta tags
 */
export async function getDistributedKeywords(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<KeywordDistribution> {
  const allSettings = await getAllMatchingSeoSettings(path, pageType, locale)

  // Extract ALL keywords from all matching settings
  const allKeywords: string[] = []
  allSettings.forEach(setting => {
    if (setting.metaKeywords) {
      const keywords = setting.metaKeywords
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
      allKeywords.push(...keywords)
    }
  })

  // Remove duplicates and shuffle for natural distribution
  const uniqueKeywords = [...new Set(allKeywords)]
  const shuffled = shuffleArray(uniqueKeywords)

  const total = shuffled.length

  // If no keywords, return empty distribution
  if (total === 0) {
    return {
      imgAlts: [],
      linkTitles: [],
      ariaLabels: [],
      ariaDescribedby: [],
      imgTitles: [],
      placeholders: [],
      srOnlyLabels: [],
      dataAttributes: [],
      metaTags: [],
      totalKeywords: 0,
    }
  }

  // Dynamic distribution based on percentages
  let currentIndex = 0

  const imgAltsCount = Math.floor(total * 0.30)
  const imgAlts = shuffled.slice(currentIndex, currentIndex + imgAltsCount)
  currentIndex += imgAltsCount

  const linkTitlesCount = Math.floor(total * 0.15)
  const linkTitles = shuffled.slice(currentIndex, currentIndex + linkTitlesCount)
  currentIndex += linkTitlesCount

  const ariaLabelsCount = Math.floor(total * 0.15)
  const ariaLabels = shuffled.slice(currentIndex, currentIndex + ariaLabelsCount)
  currentIndex += ariaLabelsCount

  const ariaDescribedbyCount = Math.floor(total * 0.10)
  const ariaDescribedby = shuffled.slice(currentIndex, currentIndex + ariaDescribedbyCount)
  currentIndex += ariaDescribedbyCount

  const imgTitlesCount = Math.floor(total * 0.10)
  const imgTitles = shuffled.slice(currentIndex, currentIndex + imgTitlesCount)
  currentIndex += imgTitlesCount

  const placeholdersCount = Math.floor(total * 0.08)
  const placeholders = shuffled.slice(currentIndex, currentIndex + placeholdersCount)
  currentIndex += placeholdersCount

  const srOnlyLabelsCount = Math.floor(total * 0.05)
  const srOnlyLabels = shuffled.slice(currentIndex, currentIndex + srOnlyLabelsCount)
  currentIndex += srOnlyLabelsCount

  const dataAttributesCount = Math.floor(total * 0.05)
  const dataAttributes = shuffled.slice(currentIndex, currentIndex + dataAttributesCount)
  currentIndex += dataAttributesCount

  // Remaining keywords go to meta tags
  const metaTags = shuffled.slice(currentIndex)

  return {
    imgAlts,
    linkTitles,
    ariaLabels,
    ariaDescribedby,
    imgTitles,
    placeholders,
    srOnlyLabels,
    dataAttributes,
    metaTags,
    totalKeywords: total,
  }
}

// ============================================================================
// New SEO Logic - Global-based priority system
// ============================================================================

/**
 * Sort SEO settings by priority
 * Priority order:
 * 1. sitemapPriority (higher first)
 * 2. scope type (exact_path > path_pattern > page_type > global)
 * 3. createdAt (earlier first)
 */
function sortByPriority(settings: SeoSetting[]): SeoSetting[] {
  const scopePriority: Record<string, number> = {
    exact_path: 4,
    path_pattern: 3,
    page_type: 2,
    global: 1,
  }

  return settings.sort((a, b) => {
    // 1. Compare isMainSeo (true comes first)
    if (a.isMainSeo !== b.isMainSeo) {
      return a.isMainSeo ? -1 : 1
    }

    // 2. Compare scope type
    const scopeA = scopePriority[a.scope] || 0
    const scopeB = scopePriority[b.scope] || 0
    if (scopeA !== scopeB) {
      return scopeB - scopeA
    }

    // 3. Compare createdAt (earlier first)
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeA - timeB
  })
}

/**
 * Extract all text fields (title, description, keywords) from a SEO setting
 */
function extractAllTextFromSetting(setting: SeoSetting): string[] {
  const texts: string[] = []

  // Add title
  if (setting.metaTitle) {
    texts.push(setting.metaTitle)
  }

  // Add description
  if (setting.metaDescription) {
    texts.push(setting.metaDescription)
  }

  // Add keywords
  if (setting.metaKeywords) {
    const keywords = setting.metaKeywords
      .split(/[,\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
    texts.push(...keywords)
  }

  return texts
}

/**
 * Get SEO for homepage
 * - Title & Description: Use global's
 * - Keywords distribution: global keywords + all matching SEO data (title, description, keywords)
 */
export async function getHomePageSeo(
  locale: string = 'en'
): Promise<{
  setting: SeoSetting | null
  distributedKeywords: KeywordDistribution
}> {
  const allSettings = await getAllSeoSettings(locale)

  // Find global setting
  const globalSetting = allSettings.find(s => s.scope === 'global')

  // Find all matching settings for homepage
  const homeMatches = allSettings.filter(s => {
    if (s.scope === 'exact_path' && s.exactPath === '/') return true
    if (s.scope === 'page_type' && s.pageType === 'home') return true
    if (s.scope === 'path_pattern' && s.pathPattern && matchPathPattern(s.pathPattern, '/')) return true
    return false
  })

  // Extract keywords for distribution
  const allTexts: string[] = []

  // 1. Add global keywords
  if (globalSetting?.metaKeywords) {
    const keywords = globalSetting.metaKeywords
      .split(/[,\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
    allTexts.push(...keywords)
  }

  // 2. Add all text from other homepage matches
  homeMatches.forEach(setting => {
    allTexts.push(...extractAllTextFromSetting(setting))
  })

  // Distribute keywords
  const distribution = distributeKeywords(allTexts)

  return {
    setting: globalSetting || null,
    distributedKeywords: distribution,
  }
}

/**
 * Get SEO for non-homepage
 * - If has matching SEO: use highest priority's title/description + distribute (highest's keywords + others' all text)
 * - If no matching SEO: use global's title/description + distribute global's keywords only
 */
export async function getNonHomePageSeo(
  path: string,
  pageType?: string,
  locale: string = 'en'
): Promise<{
  setting: SeoSetting | null
  distributedKeywords: KeywordDistribution
}> {
  const allSettings = await getAllSeoSettings(locale)

  // Normalize path
  const normalizedPath = path.replace(/^\/(en|zh|es|fr|de|it|pt|nl|pl|ru|ja|ko|ar|tr|pl|sv|da|no|fi)/, '') || '/'

  // Find all matching settings (excluding global)
  const matches: SeoSetting[] = []

  for (const setting of allSettings) {
    if (setting.scope === 'global') continue

    if (setting.scope === 'exact_path' && setting.exactPath === normalizedPath) {
      matches.push(setting)
    } else if (setting.scope === 'path_pattern' && setting.pathPattern && matchPathPattern(setting.pathPattern, normalizedPath)) {
      matches.push(setting)
    } else if (setting.scope === 'page_type' && pageType && setting.pageType === pageType) {
      matches.push(setting)
    }
  }

  // If no matches, use global
  if (matches.length === 0) {
    const globalSetting = allSettings.find(s => s.scope === 'global')

    const allTexts: string[] = []
    if (globalSetting?.metaKeywords) {
      const keywords = globalSetting.metaKeywords
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
      allTexts.push(...keywords)
    }

    return {
      setting: globalSetting || null,
      distributedKeywords: distributeKeywords(allTexts),
    }
  }

  // Sort matches by priority
  const sorted = sortByPriority(matches)
  const highestPriority = sorted[0]
  const others = sorted.slice(1)

  // Extract keywords for distribution
  const allTexts: string[] = []

  // 1. Add highest priority's keywords
  if (highestPriority.metaKeywords) {
    const keywords = highestPriority.metaKeywords
      .split(/[,\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
    allTexts.push(...keywords)
  }

  // 2. Add all text from other matches
  others.forEach(setting => {
    allTexts.push(...extractAllTextFromSetting(setting))
  })

  return {
    setting: highestPriority,
    distributedKeywords: distributeKeywords(allTexts),
  }
}

/**
 * Helper: Distribute keywords across HTML attributes
 */
function distributeKeywords(texts: string[]): KeywordDistribution {
  // Remove duplicates and shuffle
  const uniqueTexts = [...new Set(texts)]
  const shuffled = shuffleArray(uniqueTexts)

  const total = shuffled.length

  if (total === 0) {
    return {
      imgAlts: [],
      linkTitles: [],
      ariaLabels: [],
      ariaDescribedby: [],
      imgTitles: [],
      placeholders: [],
      srOnlyLabels: [],
      dataAttributes: [],
      metaTags: [],
      totalKeywords: 0,
    }
  }

  // Dynamic distribution based on percentages
  let currentIndex = 0

  const imgAltsCount = Math.floor(total * 0.30)
  const imgAlts = shuffled.slice(currentIndex, currentIndex + imgAltsCount)
  currentIndex += imgAltsCount

  const linkTitlesCount = Math.floor(total * 0.15)
  const linkTitles = shuffled.slice(currentIndex, currentIndex + linkTitlesCount)
  currentIndex += linkTitlesCount

  const ariaLabelsCount = Math.floor(total * 0.15)
  const ariaLabels = shuffled.slice(currentIndex, currentIndex + ariaLabelsCount)
  currentIndex += ariaLabelsCount

  const ariaDescribedbyCount = Math.floor(total * 0.10)
  const ariaDescribedby = shuffled.slice(currentIndex, currentIndex + ariaDescribedbyCount)
  currentIndex += ariaDescribedbyCount

  const imgTitlesCount = Math.floor(total * 0.10)
  const imgTitles = shuffled.slice(currentIndex, currentIndex + imgTitlesCount)
  currentIndex += imgTitlesCount

  const placeholdersCount = Math.floor(total * 0.08)
  const placeholders = shuffled.slice(currentIndex, currentIndex + placeholdersCount)
  currentIndex += placeholdersCount

  const srOnlyLabelsCount = Math.floor(total * 0.05)
  const srOnlyLabels = shuffled.slice(currentIndex, currentIndex + srOnlyLabelsCount)
  currentIndex += srOnlyLabelsCount

  const dataAttributesCount = Math.floor(total * 0.05)
  const dataAttributes = shuffled.slice(currentIndex, currentIndex + dataAttributesCount)
  currentIndex += dataAttributesCount

  // Remaining go to meta tags
  const metaTags = shuffled.slice(currentIndex)

  return {
    imgAlts,
    linkTitles,
    ariaLabels,
    ariaDescribedby,
    imgTitles,
    placeholders,
    srOnlyLabels,
    dataAttributes,
    metaTags,
    totalKeywords: total,
  }
}
