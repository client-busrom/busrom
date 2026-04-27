import { locales } from '@/i18n.config'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'
const GRAPHQL_ENDPOINT = `${CMS_URL}/api/graphql`

/**
 * Generate RSS feed for blogs and products
 */
export async function generateRssXml(locale: string = 'en') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  
  // Fetch latest blogs
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetLatestBlogs($locale: LocaleInputType!) {
          Blogs(where: { status: { equals: "published" } }, limit: 20, sort: "-updatedAt", locale: $locale) {
            docs {
              slug
              name
              updatedAt
              shortDescription
            }
          }
        }
      `,
      variables: { locale }
    }),
    cache: 'no-store',
  })

  const { data } = await response.json()
  const blogs = data?.Blogs?.docs || []

  const feedUrl = `${siteUrl}/feed.xml`
  const lastBuildDate = new Date().toUTCString()

  const items = blogs.map((blog: any) => `
    <item>
      <title><![CDATA[${blog.name}]]></title>
      <link>${siteUrl}/${locale === 'en' ? '' : locale + '/'}blog/${blog.slug}</link>
      <guid>${siteUrl}/blog/${blog.slug}</guid>
      <pubDate>${new Date(blog.updatedAt).toUTCString()}</pubDate>
      <description><![CDATA[${blog.shortDescription || ''}]]></description>
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Busrom Blog &amp; Updates</title>
  <link>${siteUrl}</link>
  <description>Latest industrial glass hardware solutions and industry news from Busrom.</description>
  <language>${locale}</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${items}
</channel>
</rss>`
}
