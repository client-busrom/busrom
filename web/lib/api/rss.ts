import { locales } from '@/i18n.config'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'
const GRAPHQL_ENDPOINT = `${CMS_URL}/api/graphql`

export type FeedType = 'shop' | 'products' | 'all'

export interface FeedConfig {
  title: string
  description: string
  baseUrl: string
  feedUrl: string
  language: string
}

/**
 * Get feed configuration based on type
 */
export function getFeedConfig(type: FeedType, baseUrl: string, locale: string): FeedConfig {
  const titles: Record<string, any> = {
    all: { en: 'Busrom Blog & Updates', zh: 'Busrom 博客与动态' },
    shop: { en: 'Busrom Shop Products', zh: 'Busrom 商城产品' },
    products: { en: 'Busrom Product Series', zh: 'Busrom 产品系列' },
  }

  const descriptions: Record<string, any> = {
    all: { en: 'Latest industrial glass hardware solutions and industry news.', zh: '最新的工业玻璃五金解决方案和行业新闻。' },
    shop: { en: 'Explore our latest industrial glass hardware products.', zh: '浏览我们最新的工业玻璃五金产品。' },
    products: { en: 'Discover our comprehensive product series.', zh: '探索我们全面的产品系列。' },
  }

  return {
    title: titles[type]?.[locale] || titles[type]?.en,
    description: descriptions[type]?.[locale] || descriptions[type]?.en,
    baseUrl,
    feedUrl: `${baseUrl}/feed${type !== 'all' ? `?type=${type}` : ''}`,
    language: locale,
  }
}

/**
 * Fetch feed items from CMS
 */
export async function getFeedItems(type: FeedType, limit: number, locale: string) {
  // Simple implementation using existing logic, can be expanded for 'shop' and 'products'
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetLatestBlogs($locale: LocaleInputType!, $limit: Int!) {
          Blogs(where: { status: { equals: "published" }, publishedAt: { less_than_equal: "${new Date().toISOString()}" } }, limit: $limit, sort: "-updatedAt", locale: $locale) {
            docs {
              slug
              name
              updatedAt
              shortDescription
            }
          }
        }
      `,
      variables: { locale, limit }
    }),
    cache: 'no-store',
  })

  const { data } = await response.json()
  const blogs = data?.Blogs?.docs || []

  return blogs.map((blog: any) => ({
    title: blog.name,
    link: `/knowledge-base-blog/${blog.slug}`,
    guid: `/knowledge-base-blog/${blog.slug}`,
    pubDate: new Date(blog.updatedAt).toUTCString(),
    description: blog.shortDescription || '',
  }))
}

/**
 * Generate RSS XML string
 */
export function generateRSSXML(config: FeedConfig, items: any[], baseUrl: string, feedPath: string) {
  const lastBuildDate = new Date().toUTCString()
  const fullFeedUrl = `${baseUrl}${feedPath}`

  const itemXml = items.map((item: any) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${baseUrl}${item.link}</link>
      <guid>${baseUrl}${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description><![CDATA[${item.description}]]></description>
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${config.title}</title>
  <link>${config.baseUrl}</link>
  <description>${config.description}</description>
  <language>${config.language}</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${fullFeedUrl}" rel="self" type="application/rss+xml" />
  ${itemXml}
</channel>
</rss>`
}

// Backward compatibility
export async function generateRssXml(locale: string = 'en') {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  const config = getFeedConfig('all', baseUrl, locale)
  const items = await getFeedItems('all', 20, locale)
  return generateRSSXML(config, items, baseUrl, '/feed.xml')
}
