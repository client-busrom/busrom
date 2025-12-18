/**
 * RSS Feed Generator
 *
 * Generates RSS 2.0 feeds for CMS content.
 * Supports multi-language feeds for global content syndication.
 *
 * Feed Types:
 * - Shop Feed: Products (CMS: Product) -> /shop/[slug]
 * - Applications Feed: Applications (CMS: Application) -> /service/application/[slug]
 * - Products Feed: Product Series (CMS: ProductSeries) -> /product/[slug]
 * - Blog Feed: Blog posts (CMS: Blog) -> /about-us/blog/[slug]
 * - Pages Feed: CMS Pages (CMS: Page) -> uses path field
 * - Combined Feed: All content types
 */

import { locales, defaultLocale } from '@/i18n.config'

const GRAPHQL_ENDPOINT = process.env.CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'

// Feed types that have actual frontend routes
// - shop: /shop/[slug] (CMS: Product)
// - products: /products/[slug] (CMS: ProductSeries)
// - blog: /blog/[slug] (CMS: Blog)
export type FeedType = 'shop' | 'products' | 'blog' | 'all'

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  category?: string
  image?: string
}

export interface FeedConfig {
  title: string
  description: string
  link: string
  language: string
  copyright: string
  managingEditor?: string
  webMaster?: string
  ttl: number
}

/**
 * Helper to get localized text from JSON field
 */
function getLocalizedText(field: any, locale: string): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[locale] || field['en'] || Object.values(field)[0] || ''
}

/**
 * Fetch Products for Shop feed (CMS: Product -> /shop/[slug])
 */
async function fetchShopProducts(limit: number = 50, locale: string = 'en'): Promise<FeedItem[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductsForFeed($take: Int) {
            products(
              where: { status: { equals: "PUBLISHED" } }
              orderBy: { updatedAt: desc }
              take: $take
            ) {
              slug
              name
              description
              updatedAt
              createdAt
              mainImage {
                url
              }
              series {
                name
              }
            }
          }
        `,
        variables: { take: limit },
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    const products = data?.products || []

    return products.map((product: any) => ({
      title: getLocalizedText(product.name, locale) || product.slug,
      link: `/shop/${product.slug}`,  // matches /[locale]/shop/[slug]
      description: getLocalizedText(product.description, locale) || '',
      pubDate: product.updatedAt || product.createdAt,
      guid: `shop-${product.slug}`,
      category: getLocalizedText(product.series?.name, locale) || 'Shop',
      image: product.mainImage?.url,
    }))
  } catch (error) {
    console.error('Error fetching shop products for RSS:', error)
    return []
  }
}

/**
 * Fetch Applications (CMS: Application -> /service/application/[slug])
 */
async function fetchApplications(limit: number = 50, locale: string = 'en'): Promise<FeedItem[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetApplicationsForFeed($take: Int) {
            applications(
              where: { status: { equals: "PUBLISHED" } }
              orderBy: { updatedAt: desc }
              take: $take
            ) {
              slug
              title
              summary
              updatedAt
              createdAt
              featuredImage {
                url
              }
            }
          }
        `,
        variables: { take: limit },
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    const applications = data?.applications || []

    return applications.map((app: any) => ({
      title: getLocalizedText(app.title, locale) || app.slug,
      link: `/service/application/${app.slug}`,
      description: getLocalizedText(app.summary, locale) || '',
      pubDate: app.updatedAt || app.createdAt,
      guid: `application-${app.slug}`,
      category: 'Applications',
      image: app.featuredImage?.url,
    }))
  } catch (error) {
    console.error('Error fetching applications for RSS:', error)
    return []
  }
}

/**
 * Fetch Product Series (CMS: ProductSeries -> /product/[slug])
 */
async function fetchProductSeries(limit: number = 50, locale: string = 'en'): Promise<FeedItem[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductSeriesForFeed($take: Int) {
            productSeries(
              where: { status: { equals: "PUBLISHED" } }
              orderBy: { updatedAt: desc }
              take: $take
            ) {
              slug
              name
              description
              updatedAt
              createdAt
              image {
                url
              }
            }
          }
        `,
        variables: { take: limit },
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    const series = data?.productSeries || []

    return series.map((s: any) => ({
      title: getLocalizedText(s.name, locale) || s.slug,
      link: `/products/${s.slug}`,  // matches /[locale]/products/[slug]
      description: getLocalizedText(s.description, locale) || '',
      pubDate: s.updatedAt || s.createdAt,
      guid: `product-series-${s.slug}`,
      category: 'Product Series',
      image: s.image?.url,
    }))
  } catch (error) {
    console.error('Error fetching product series for RSS:', error)
    return []
  }
}

/**
 * Fetch Blog posts (CMS: Blog -> /blog/[slug])
 */
async function fetchBlogs(limit: number = 50, locale: string = 'en'): Promise<FeedItem[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetBlogsForFeed($take: Int) {
            blogs(
              where: { status: { equals: "PUBLISHED" } }
              orderBy: { publishedAt: desc }
              take: $take
            ) {
              slug
              title
              excerpt
              author
              publishedAt
              updatedAt
              createdAt
              coverImage
              categories {
                name
              }
            }
          }
        `,
        variables: { take: limit },
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    const blogs = data?.blogs || []

    return blogs.map((blog: any) => {
      // coverImage is JSON, extract URL
      let imageUrl = ''
      if (blog.coverImage) {
        if (typeof blog.coverImage === 'string') {
          imageUrl = blog.coverImage
        } else if (blog.coverImage.url) {
          imageUrl = blog.coverImage.url
        }
      }

      return {
        title: getLocalizedText(blog.title, locale) || blog.slug,
        link: `/blog/${blog.slug}`,  // matches /[locale]/blog/[slug]
        description: getLocalizedText(blog.excerpt, locale) || '',
        pubDate: blog.publishedAt || blog.updatedAt || blog.createdAt,
        guid: `blog-${blog.slug}`,
        category: blog.categories?.[0]?.name ? getLocalizedText(blog.categories[0].name, locale) : 'Blog',
        image: imageUrl,
      }
    })
  } catch (error) {
    console.error('Error fetching blogs for RSS:', error)
    return []
  }
}

/**
 * Fetch CMS Pages (CMS: Page -> uses path field for URL)
 */
async function fetchPages(limit: number = 50, locale: string = 'en'): Promise<FeedItem[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPagesForFeed($take: Int) {
            pages(
              where: {
                status: { equals: "PUBLISHED" }
                isSystem: { equals: false }
              }
              orderBy: { updatedAt: desc }
              take: $take
            ) {
              slug
              path
              title
              heroText
              heroSubtitle
              pageType
              publishedAt
              updatedAt
              createdAt
            }
          }
        `,
        variables: { take: limit },
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    const pages = data?.pages || []

    return pages.map((page: any) => ({
      title: getLocalizedText(page.title, locale) || page.slug,
      link: page.path || `/${page.slug}`,
      description: getLocalizedText(page.heroText, locale) || getLocalizedText(page.heroSubtitle, locale) || '',
      pubDate: page.publishedAt || page.updatedAt || page.createdAt,
      guid: `page-${page.slug}`,
      category: page.pageType || 'Page',
    }))
  } catch (error) {
    console.error('Error fetching pages for RSS:', error)
    return []
  }
}

/**
 * Get feed items by type
 */
export async function getFeedItems(
  type: FeedType,
  limit: number = 50,
  locale: string = 'en'
): Promise<FeedItem[]> {
  switch (type) {
    case 'shop':
      return fetchShopProducts(limit, locale)
    case 'products':
      return fetchProductSeries(limit, locale)
    case 'blog':
      return fetchBlogs(limit, locale)
    case 'all':
    default:
      const [shop, products, blogs] = await Promise.all([
        fetchShopProducts(Math.floor(limit / 3), locale),
        fetchProductSeries(Math.floor(limit / 3), locale),
        fetchBlogs(Math.floor(limit / 3), locale),
      ])
      // Sort all items by date
      return [...shop, ...products, ...blogs].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
  }
}

/**
 * Get feed configuration
 */
export function getFeedConfig(
  type: FeedType,
  baseUrl: string,
  locale: string = 'en'
): FeedConfig {
  const titles: Record<FeedType, Record<string, string>> = {
    shop: {
      en: 'Busrom Shop - Latest Products',
      zh: 'Busrom商城 - 最新产品',
    },
    products: {
      en: 'Busrom Product Series',
      zh: 'Busrom产品系列',
    },
    blog: {
      en: 'Busrom Blog - Industry Insights',
      zh: 'Busrom博客 - 行业资讯',
    },
    all: {
      en: 'Busrom Updates',
      zh: 'Busrom更新',
    },
  }

  const descriptions: Record<FeedType, Record<string, string>> = {
    shop: {
      en: 'Latest products from Busrom Shop - Industrial Glass Hardware Solutions',
      zh: 'Busrom商城最新产品 - 工业玻璃五金解决方案',
    },
    products: {
      en: 'Busrom Product Series - Glass Hardware Categories',
      zh: 'Busrom产品系列 - 玻璃五金分类',
    },
    blog: {
      en: 'Industry insights and updates from Busrom Blog',
      zh: 'Busrom博客行业资讯和更新',
    },
    all: {
      en: 'All updates from Busrom - Shop, Product Series and Blog',
      zh: 'Busrom全部更新 - 商城、产品系列和博客',
    },
  }

  return {
    title: titles[type][locale] || titles[type]['en'],
    description: descriptions[type][locale] || descriptions[type]['en'],
    link: baseUrl,
    language: locale,
    copyright: `Copyright ${new Date().getFullYear()} Busrom. All rights reserved.`,
    managingEditor: 'info@busrom.com (Busrom)',
    webMaster: 'info@busrom.com (Busrom)',
    ttl: 60,
  }
}

/**
 * Generate RSS 2.0 XML
 */
export function generateRSSXML(
  config: FeedConfig,
  items: FeedItem[],
  baseUrl: string,
  feedPath: string = '/feed.xml'
): string {
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toUTCString()
  }

  const itemsXML = items
    .map((item) => {
      const fullLink = `${baseUrl}/${config.language}${item.link}`
      let itemXML = `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${fullLink}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${formatDate(item.pubDate)}</pubDate>
      <guid isPermaLink="true">${fullLink}</guid>`

      if (item.category) {
        itemXML += `\n      <category>${escapeXML(item.category)}</category>`
      }

      if (item.image) {
        itemXML += `\n      <enclosure url="${item.image}" type="image/jpeg" />`
      }

      itemXML += '\n    </item>'
      return itemXML
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(config.title)}</title>
    <link>${config.link}</link>
    <description>${escapeXML(config.description)}</description>
    <language>${config.language}</language>
    <copyright>${escapeXML(config.copyright)}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>${config.ttl}</ttl>
    <atom:link href="${baseUrl}${feedPath}" rel="self" type="application/rss+xml" />
${itemsXML}
  </channel>
</rss>`
}
