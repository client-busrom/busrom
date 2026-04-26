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
const CMS_URL = 'https://cms.busromhouse.com'

const GRAPHQL_ENDPOINT = `${CMS_URL}/api/graphql`


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
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductsForSitemap {
            products(where: { status: { equals: "published" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.products || []
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

/**
 * Fetch all product series for sitemap
 */
async function fetchProductSeries(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductSeriesForSitemap {
            productSeries(where: { status: { equals: "published" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.productSeries || []
  } catch (error) {
    console.error('Error fetching product series for sitemap:', error)
    return []
  }
}

/**
 * Fetch all blogs for sitemap
 */
async function fetchBlogs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetBlogsForSitemap {
            blogs(where: { status: { equals: "published" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.blogs || []
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
    return []
  }
}

/**
 * Fetch all applications (case studies) for sitemap
 */
async function fetchApplications(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetApplicationsForSitemap {
            applications(where: { status: { equals: "published" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.applications || []
  } catch (error) {
    console.error('Error fetching applications for sitemap:', error)
    return []
  }
}

/**
 * Fetch all CMS pages for sitemap
 * These are custom pages created by operators -> /page/[slug]
 */
async function fetchPages(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPagesForSitemap {
            pages(where: {
              status: { equals: "published" }
              isSystem: { equals: false }
            }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.pages || []
  } catch (error) {
    console.error('Error fetching pages for sitemap:', error)
    return []
  }
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
    { path: '/blog', changefreq: 'weekly', priority: 0.8 },

    // Applications list page
    { path: '/applications', changefreq: 'weekly', priority: 0.8 },

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

function generateUrlWithAlternates(
  path: string,
  lastmod: string,
  changefreq: SitemapUrl['changefreq'],
  priority: number,
  locale: string,
  baseUrl: string
): SitemapUrl {
  // Generate alternate URLs for all locales (使用新的 URL 策略)
  const alternates: { locale: string; url: string }[] = SITEMAP_LOCALES.map((loc) => ({
    locale: loc as string,
    url: `${baseUrl}${getLocalizedPath(path, loc)}`,
  }))

  // Add x-default (points to default locale - now without prefix)
  alternates.push({
    locale: 'x-default',
    url: `${baseUrl}${getLocalizedPath(path, defaultLocale)}`,
  })

  return {
    url: getLocalizedPath(path, locale),
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
  const now = new Date().toISOString()

  try {
    // Fetch all dynamic routes
    const [products, productSeries, blogs, pages, applications] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchPages(),
      fetchApplications(),
    ])

    const urls: SitemapUrl[] = []

    // Add static routes
    for (const route of getStaticRoutes()) {
      urls.push(generateUrlWithAlternates(route.path, now, route.changefreq, route.priority, locale, baseUrl))
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

    // Add blogs -> /blog/[slug]
    for (const blog of blogs) {
      urls.push(
        generateUrlWithAlternates(
          `/blog/${blog.slug}`,
          blog.updatedAt,
          'weekly',
          0.7,
          locale,
          baseUrl
        )
      )
    }

    // Add applications -> /applications/[slug]
    for (const app of applications) {
      urls.push(
        generateUrlWithAlternates(
          `/applications/${app.slug}`,
          app.updatedAt,
          'weekly',
          0.7,
          locale,
          baseUrl
        )
      )
    }

    // Add CMS pages -> /page/[slug]
    for (const page of pages) {
      urls.push(
        generateUrlWithAlternates(
          `/page/${page.slug}`,
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
      generateUrlWithAlternates(route.path, now, route.changefreq, route.priority, locale, baseUrl)
    )
  }
}

/**
 * Get all URLs for legacy sitemap (without locale prefix, for backward compatibility)
 */
export async function getAllSitemapUrls(): Promise<SitemapUrl[]> {
  const now = new Date().toISOString()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'

  try {
    const [products, productSeries, blogs, pages, applications] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchPages(),
      fetchApplications(),
    ])

    const urls: SitemapUrl[] = []

    // Add static routes (without locale prefix)
    for (const route of getStaticRoutes()) {
      urls.push({
        url: route.path || '/',
        lastmod: now,
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

    // Add blogs -> /blog/[slug]
    for (const blog of blogs) {
      urls.push({
        url: `/blog/${blog.slug}`,
        lastmod: blog.updatedAt,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }

    // Add applications -> /applications/[slug]
    for (const app of applications) {
      urls.push({
        url: `/applications/${app.slug}`,
        lastmod: app.updatedAt,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }

    // Add CMS pages -> /page/[slug]
    for (const page of pages) {
      urls.push({
        url: `/page/${page.slug}`,
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
      lastmod: now,
      changefreq: route.changefreq,
      priority: route.priority,
    }))
  }
}

/**
 * Generate XML sitemap with hreflang support
 */
export function generateSitemapXML(urls: SitemapUrl[], baseUrl: string = 'https://busrom.com'): string {
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
export function generateSitemapIndexXML(locales: string[], baseUrl: string = 'https://busrom.com'): string {
  const now = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locales
  .map(
    (locale) => `  <sitemap>
    <loc>${baseUrl}/sitemap/${locale}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join('\n')}
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`
}
