/**
 * Sitemap Data Fetcher
 *
 * This module fetches all dynamic routes from the CMS for sitemap generation
 * Supports multi-language sitemaps for global search engine indexing
 *
 * Targets:
 * - Google (Google Search Console)
 * - Bing (Bing Webmaster Tools)
 * - Yandex (Yandex.Webmaster)
 * - Naver (Naver Search Advisor) - Korean
 * - Yahoo Japan (Yahoo Japan Webmaster) - Japanese
 * - Seznam (Seznam Webmaster) - Czech
 * - And other search engines that crawl Google/Bing index
 */

import { locales, defaultLocale } from '@/i18n.config'

// Use the public CMS domain to avoid internal networking issues in Docker/ECS
// Use environment variable for CMS URL with a fallback
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'

const GRAPHQL_ENDPOINT = `${CMS_URL}/api/graphql`

// Pagination config for sitemap fetching
const SITEMAP_PAGE_SIZE = 1000
const SITEMAP_MAX_PAGES = 20

// Unified canonical domain for all sitemap outputs
export const BASE_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

// Static pages don't have a real updatedAt, use a stable build-time date
const STATIC_LASTMOD = new Date().toISOString()

/**
 * Generic GraphQL pagination helper for sitemap data.
 * Payload caps limit at 1000 by default, so we loop through pages.
 */
async function fetchAllGraphQLDocs<T>(
  buildQuery: (page: number, limit: number) => string,
  resultPath: string
): Promise<T[]> {
  const all: T[] = []
  let page = 1
  let hasMore = true

  while (hasMore && page <= SITEMAP_MAX_PAGES) {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: buildQuery(page, SITEMAP_PAGE_SIZE) }),
        cache: 'no-store',
      })

      if (!response.ok) {
        console.error(`[Sitemap] GraphQL error on ${resultPath} page ${page}:`, response.status)
        break
      }

      const json = await response.json()
      const docs = json?.data?.[resultPath]?.docs || []
      const totalDocs = json?.data?.[resultPath]?.totalDocs || 0

      all.push(...docs)
      hasMore = docs.length === SITEMAP_PAGE_SIZE && all.length < totalDocs
      page++
    } catch (error) {
      console.error(`[Sitemap] Error fetching ${resultPath} page ${page}:`, error)
      break
    }
  }

  return all
}

// Supported languages for sitemap
export const SITEMAP_LOCALES = locales

// Language to region mapping for hreflang
export const LOCALE_REGIONS: Record<string, string[]> = {
  en: ['en', 'en-US', 'en-GB', 'en-AU', 'en-CA'],
  zh: ['zh', 'zh-CN', 'zh-TW', 'zh-HK'],
  es: ['es', 'es-ES', 'es-MX'],
  fr: ['fr', 'fr-FR', 'fr-CA'],
  de: ['de', 'de-DE', 'de-AT', 'de-CH'],
  ar: ['ar', 'ar-SA', 'ar-AE'],
  ja: ['ja', 'ja-JP'],
  ko: ['ko', 'ko-KR'],
  ru: ['ru', 'ru-RU'],
  pt: ['pt', 'pt-BR', 'pt-PT'],
}

export interface SitemapUrl {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: { locale: string; url: string }[]
}

/**
 * Fetch all products for sitemap
 */
async function fetchProducts(): Promise<{ slug: string; updatedAt: string }[]> {
  return fetchAllGraphQLDocs(
    (page, limit) => `
      query GetProductsForSitemap {
        Products(where: { status: { equals: published } }, limit: ${limit}, page: ${page}) {
          docs {
            slug
            updatedAt
          }
          totalDocs
        }
      }
    `,
    'Products'
  )
}

/**
 * Fetch all product series for sitemap
 */
async function fetchProductSeries(): Promise<{ slug: string; updatedAt: string }[]> {
  return fetchAllGraphQLDocs(
    (page, limit) => `
      query GetProductSeriesForSitemap {
        ProductSeries(where: { status: { equals: published } }, limit: ${limit}, page: ${page}) {
          docs {
            slug
            updatedAt
          }
          totalDocs
        }
      }
    `,
    'ProductSeries'
  )
}

/**
 * Fetch all blogs for sitemap
 */
async function fetchBlogs(): Promise<{ slug: string; updatedAt: string }[]> {
  const now = new Date().toISOString()
  return fetchAllGraphQLDocs(
    (page, limit) => `
      query GetBlogsForSitemap {
        Blogs(where: { status: { equals: published }, publishedAt: { less_than_equal: "${now}" } }, limit: ${limit}, page: ${page}) {
          docs {
            slug
            updatedAt
          }
          totalDocs
        }
      }
    `,
    'Blogs'
  )
}


/**
 * Fetch all blog categories for sitemap
 */
async function fetchBlogCategories(): Promise<{ slug: string; updatedAt: string }[]> {
  return fetchAllGraphQLDocs(
    (page, limit) => `
      query GetBlogCategoriesForSitemap {
        Categories(where: { status: { equals: published }, type: { equals: BLOG } }, limit: ${limit}, page: ${page}) {
          docs {
            slug
            updatedAt
          }
          totalDocs
        }
      }
    `,
    'Categories'
  )
}

/**
 * Fetch all CMS pages for sitemap
 * These are custom pages created by operators
 */
async function fetchPages(): Promise<{ slug: string; path: string; updatedAt: string; isSystem: boolean }[]> {
  return fetchAllGraphQLDocs(
    (page, limit) => `
      query GetPagesForSitemap {
        Pages(where: { status: { equals: published } }, limit: ${limit}, page: ${page}) {
          docs {
            slug
            path
            isSystem
            updatedAt
          }
          totalDocs
        }
      }
    `,
    'Pages'
  )
}

/**
 * Get all static routes with their configuration
 * These must match actual frontend routes in /app/[locale]/
 */
function getStaticRoutes(): { path: string; changefreq: SitemapUrl['changefreq']; priority: number }[] {
  return [
    // Home - highest priority
    { path: '', changefreq: 'daily', priority: 1.0 },

    // Product pages (ProductSeries)
    { path: '/products', changefreq: 'weekly', priority: 0.9 },

    // Shop pages (Product items)
    { path: '/shop', changefreq: 'weekly', priority: 0.9 },

    // Blog list page
    { path: '/knowledge-base-blog', changefreq: 'weekly', priority: 0.8 },

    // Alternate blog list & category page
    { path: '/knowledge-base-blogs', changefreq: 'weekly', priority: 0.8 },

    // Application list page
    { path: '/application', changefreq: 'weekly', priority: 0.8 },

    // Service pages
    { path: '/service/overview', changefreq: 'monthly', priority: 0.7 },
    { path: '/service/one-stop-solution', changefreq: 'monthly', priority: 0.7 },
    { path: '/service/oem-odm', changefreq: 'monthly', priority: 0.7 },
    { path: '/faq', changefreq: 'monthly', priority: 0.6 },

    // About pages
    { path: '/about/story', changefreq: 'monthly', priority: 0.6 },

    // Support
    { path: '/support', changefreq: 'monthly', priority: 0.6 },

    // Contact
    { path: '/contact-us', changefreq: 'monthly', priority: 0.7 },

    // Legal pages - lowest priority
    { path: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
    { path: '/fraud-notice', changefreq: 'yearly', priority: 0.3 },
  ]
}

/**
 * 生成带 hreflang alternates 的 URL
 *
 * URL 策略:
 * - 英文(默认): busromhouse.com/about (无前缀)
 * - 其他语言: busromhouse.com/zh/about (有前缀)
 */
function getLocalizedPath(path: string, locale: string): string {
  // 默认语言不需要前缀
  if (locale === defaultLocale) {
    return path || '/'
  }
  // 非默认语言添加前缀
  return `/${locale}${path}`
}

/**
 * Check whether a CMS page path collides with a statically-defined route.
 * System pages that match static routes should be excluded from the pages sitemap.
 */
function isStaticRoutePath(path: string): boolean {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return getStaticRoutes().some((route) => {
    const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`
    return routePath === normalized
  })
}

/**
 * Resolve a CMS Page to a sitemap path that actually exists in the App Router.
 * - Single-segment paths map to /[slug]
 * - Multi-segment paths fall back to /page/[slug] so they are still indexable
 * - Slugs without a leading / are normalized
 */
function resolvePageSitemapPath(page: { slug: string; path: string }): string {
  const cleanPath = page.path?.startsWith('/') ? page.path : `/${page.path || page.slug}`
  const segments = cleanPath.split('/').filter(Boolean)

  // Single segment -> /[slug]
  if (segments.length === 1) {
    return cleanPath
  }

  // Multi segment -> fallback to /page/[slug] which is a real route
  return `/page/${page.slug}`
}

function generateUrlWithAlternates(
  path: string,
  lastmod: string,
  changefreq: SitemapUrl['changefreq'],
  priority: number,
  locale: string,
  baseUrl: string
): SitemapUrl {
  // Ensure path is relative and starts with /
  const cleanPath = path.startsWith('http') ? new URL(path).pathname : (path.startsWith('/') ? path : `/${path}`)

  // Generate alternate URLs for all locales
  const alternates: { locale: string; url: string }[] = SITEMAP_LOCALES.map((loc) => ({
    locale: loc as string,
    url: `${baseUrl}${getLocalizedPath(cleanPath, loc)}`,
  }))

  // Add x-default (points to default locale)
  alternates.push({
    locale: 'x-default',
    url: `${baseUrl}${getLocalizedPath(cleanPath, defaultLocale)}`,
  })

  return {
    url: getLocalizedPath(cleanPath, locale),
    lastmod,
    changefreq,
    priority,
    alternates,
  }
}

/**
 * Get all URLs for sitemap for a specific locale
 */
export async function getSitemapUrlsForLocale(locale: string, baseUrl: string): Promise<SitemapUrl[]> {
  try {
    // Fetch all dynamic routes
    const [products, productSeries, blogs, blogCategories, pages] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchBlogCategories(),
      fetchPages(),
    ])

    const urls: SitemapUrl[] = []

    // Add static routes
    for (const route of getStaticRoutes()) {
      urls.push(generateUrlWithAlternates(route.path, STATIC_LASTMOD, route.changefreq, route.priority, locale, baseUrl))
    }

    // Add product series -> /products/[slug]
    for (const series of productSeries) {
      urls.push(
        generateUrlWithAlternates(
          `/products/${series.slug}`,
          series.updatedAt,
          'weekly',
          0.9,
          locale,
          baseUrl
        )
      )
    }

    // Add products (shop items) -> /shop/[slug]
    for (const product of products) {
      urls.push(
        generateUrlWithAlternates(
          `/shop/${product.slug}`,
          product.updatedAt,
          'weekly',
          0.8,
          locale,
          baseUrl
        )
      )
    }

    // Add blogs -> /knowledge-base-blog/[slug]
    for (const blog of blogs) {
      urls.push(
        generateUrlWithAlternates(
          `/knowledge-base-blog/${blog.slug}`,
          blog.updatedAt,
          'weekly',
          0.7,
          locale,
          baseUrl
        )
      )
    }

    // Add alternate blog category pages -> /knowledge-base-blogs/[slug]
    for (const category of blogCategories) {
      urls.push(
        generateUrlWithAlternates(
          `/knowledge-base-blogs/${category.slug}`,
          category.updatedAt,
          'weekly',
          0.7,
          locale,
          baseUrl
        )
      )
    }

    // Add CMS pages -> resolve to an actually routable path
    // Filter out system pages and static-route collisions as they are already included in getStaticRoutes()
    for (const page of pages) {
      if (page.isSystem) continue
      const pagePath = resolvePageSitemapPath(page)
      if (isStaticRoutePath(pagePath)) continue

      urls.push(
        generateUrlWithAlternates(
          pagePath,
          page.updatedAt,
          'monthly',
          0.6,
          locale,
          baseUrl
        )
      )
    }


    return urls
  } catch (error) {
    console.error('Error generating sitemap URLs:', error)
    // Return at least static routes
    return getStaticRoutes().map((route) =>
      generateUrlWithAlternates(route.path, STATIC_LASTMOD, route.changefreq, route.priority, locale, baseUrl)
    )
  }
}

/**
 * Get all URLs for legacy sitemap (without locale prefix, for backward compatibility)
 */
export async function getAllSitemapUrls(): Promise<SitemapUrl[]> {
  const baseUrl = BASE_SITE_URL

  try {
    const [products, productSeries, blogs, blogCategories, pages] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchBlogCategories(),
      fetchPages(),
    ])

    const urls: SitemapUrl[] = []

    // Add static routes (without locale prefix)
    for (const route of getStaticRoutes()) {
      urls.push({
        url: route.path || '/',
        lastmod: STATIC_LASTMOD,
        changefreq: route.changefreq,
        priority: route.priority,
      })
    }

    // Add product series -> /products/[slug]
    for (const series of productSeries) {
      urls.push({
        url: `/products/${series.slug}`,
        lastmod: series.updatedAt,
        changefreq: 'weekly',
        priority: 0.9,
      })
    }

    // Add products (shop items) -> /shop/[slug]
    for (const product of products) {
      urls.push({
        url: `/shop/${product.slug}`,
        lastmod: product.updatedAt,
        changefreq: 'weekly',
        priority: 0.8,
      })
    }

    // Add blogs -> /knowledge-base-blog/[slug]
    for (const blog of blogs) {
      urls.push({
        url: `/knowledge-base-blog/${blog.slug}`,
        lastmod: blog.updatedAt,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }

    // Add alternate blog category pages -> /knowledge-base-blogs/[slug]
    for (const category of blogCategories) {
      urls.push({
        url: `/knowledge-base-blogs/${category.slug}`,
        lastmod: category.updatedAt,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }

    // Add CMS pages -> resolve to an actually routable path
    for (const page of pages) {
      if (page.isSystem) continue
      const pagePath = resolvePageSitemapPath(page)
      if (isStaticRoutePath(pagePath)) continue

      urls.push({
        url: pagePath,
        lastmod: page.updatedAt,
        changefreq: 'monthly',
        priority: 0.6,
      })
    }

    return urls
  } catch (error) {
    console.error('Error generating sitemap URLs:', error)
    return getStaticRoutes().map((route) => ({
      url: route.path || '/',
      lastmod: STATIC_LASTMOD,
      changefreq: route.changefreq,
      priority: route.priority,
    }))
  }
}

export const SITEMAP_TYPES = [
  'static',
  'products',
  'series',
  'blogs',
  'blog-categories',
  'pages',
] as const

export type SitemapType = (typeof SITEMAP_TYPES)[number]

export function isSitemapType(value: string): value is SitemapType {
  return SITEMAP_TYPES.includes(value as SitemapType)
}

/**
 * Get URLs for a specific content-type sitemap.
 * Each URL includes hreflang alternates for all locales.
 */
export async function getSitemapUrlsByType(
  type: SitemapType,
  baseUrl: string
): Promise<SitemapUrl[]> {
  try {
    const [products, productSeries, blogs, blogCategories, pages] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchBlogCategories(),
      fetchPages(),
    ])

    switch (type) {
      case 'static':
        return getStaticRoutes().map((route) =>
          generateUrlWithAlternates(route.path, STATIC_LASTMOD, route.changefreq, route.priority, defaultLocale, baseUrl)
        )

      case 'series':
        return productSeries.map((series) =>
          generateUrlWithAlternates(
            `/products/${series.slug}`,
            series.updatedAt,
            'weekly',
            0.9,
            defaultLocale,
            baseUrl
          )
        )

      case 'products':
        return products.map((product) =>
          generateUrlWithAlternates(
            `/shop/${product.slug}`,
            product.updatedAt,
            'weekly',
            0.8,
            defaultLocale,
            baseUrl
          )
        )

      case 'blogs':
        return blogs.map((blog) =>
          generateUrlWithAlternates(
            `/knowledge-base-blog/${blog.slug}`,
            blog.updatedAt,
            'weekly',
            0.7,
            defaultLocale,
            baseUrl
          )
        )

      case 'blog-categories':
        return blogCategories.map((category) =>
          generateUrlWithAlternates(
            `/knowledge-base-blogs/${category.slug}`,
            category.updatedAt,
            'weekly',
            0.7,
            defaultLocale,
            baseUrl
          )
        )

      case 'pages':
        return pages
          .filter((page) => {
            if (page.isSystem) return false
            const pagePath = resolvePageSitemapPath(page)
            return !isStaticRoutePath(pagePath)
          })
          .map((page) =>
            generateUrlWithAlternates(
              resolvePageSitemapPath(page),
              page.updatedAt,
              'monthly',
              0.6,
              defaultLocale,
              baseUrl
            )
          )

      default:
        return []
    }
  } catch (error) {
    console.error(`Error generating ${type} sitemap URLs:`, error)
    if (type === 'static') {
      return getStaticRoutes().map((route) =>
        generateUrlWithAlternates(route.path, STATIC_LASTMOD, route.changefreq, route.priority, defaultLocale, baseUrl)
      )
    }
    return []
  }
}

/**
 * Generate sitemap index XML for content-type sitemaps
 */
export function generateTypeSitemapIndexXML(types: readonly SitemapType[], baseUrl: string = 'https://www.busromhouse.com'): string {
  const now = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${types
  .map(
    (type) => `  <sitemap>
    <loc>${baseUrl}/sitemap/${type}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`
}

/**
 * Generate XML sitemap with hreflang support
 */
export function generateSitemapXML(urls: SitemapUrl[], baseUrl: string = 'https://www.busromhouse.com'): string {
  const hasAlternates = urls.some((url) => url.alternates && url.alternates.length > 0)

  const xmlHeader = hasAlternates
    ? `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`
    : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  const xml = `${xmlHeader}
${urls
  .map((item) => {
    const alternateLinks = item.alternates
      ? item.alternates
          .map(
            (alt) =>
              `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${alt.url}"/>`
          )
          .join('\n')
      : ''

    return `  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
${alternateLinks}
  </url>`
  })
  .join('\n')}
</urlset>`

  return xml
}

/**
 * Generate sitemap index XML
 */
export function generateSitemapIndexXML(locales: string[], baseUrl: string = 'https://www.busromhouse.com'): string {
  const now = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locales
  .map(
    (locale) => `  <sitemap>
    <loc>${baseUrl}/sitemap/${locale}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`
}
