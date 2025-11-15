/**
 * Sitemap Data Fetcher
 *
 * This module fetches all dynamic routes from the CMS for sitemap generation
 */

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql'

interface SitemapUrl {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

/**
 * Fetch all products for sitemap
 */
async function fetchProducts(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductsForSitemap {
            products(where: { status: { equals: "PUBLISHED" } }) {
              sku
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    if (!data?.products) return []

    return data.products.map((product: any) => ({
      url: `/shop/${product.sku}`,
      lastmod: product.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

/**
 * Fetch all product series for sitemap
 */
async function fetchProductSeries(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductSeriesForSitemap {
            productSeries(where: { status: { equals: "PUBLISHED" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    if (!data?.productSeries) return []

    return data.productSeries.map((series: any) => ({
      url: `/product/${series.slug}`,
      lastmod: series.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.9,
    }))
  } catch (error) {
    console.error('Error fetching product series for sitemap:', error)
    return []
  }
}

/**
 * Fetch all blogs for sitemap
 */
async function fetchBlogs(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetBlogsForSitemap {
            blogs(where: { status: { equals: "PUBLISHED" } }) {
              slug
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    if (!data?.blogs) return []

    return data.blogs.map((blog: any) => ({
      url: `/about-us/blog/${blog.slug}`,
      lastmod: blog.updatedAt,
      changefreq: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
    return []
  }
}

/**
 * Fetch all applications (case studies) for sitemap
 */
async function fetchApplications(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetApplicationsForSitemap {
            applications(where: { status: { equals: "PUBLISHED" } }) {
              id
              updatedAt
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    if (!data?.applications) return []

    return data.applications.map((app: any) => ({
      url: `/service/application/${app.id}`,
      lastmod: app.updatedAt,
      changefreq: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching applications for sitemap:', error)
    return []
  }
}

/**
 * Get all static routes
 */
function getStaticRoutes(): SitemapUrl[] {
  const now = new Date().toISOString()

  return [
    // Home
    { url: '/', lastmod: now, changefreq: 'daily', priority: 1.0 },

    // Product pages
    { url: '/product', lastmod: now, changefreq: 'weekly', priority: 0.9 },

    // Shop pages
    { url: '/shop', lastmod: now, changefreq: 'weekly', priority: 0.9 },

    // Service pages
    { url: '/service', lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { url: '/service/one-stop-shop', lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { url: '/service/faq', lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { url: '/service/application', lastmod: now, changefreq: 'weekly', priority: 0.8 },

    // About Us pages
    { url: '/about-us/story', lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { url: '/about-us/blog', lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { url: '/about-us/support', lastmod: now, changefreq: 'monthly', priority: 0.6 },

    // Legal pages
    { url: '/privacy-policy', lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { url: '/fraud-notice', lastmod: now, changefreq: 'yearly', priority: 0.3 },

    // Contact
    { url: '/contact-us', lastmod: now, changefreq: 'monthly', priority: 0.7 },
  ]
}

/**
 * Get all URLs for sitemap
 */
export async function getAllSitemapUrls(): Promise<SitemapUrl[]> {
  try {
    // Fetch all dynamic routes in parallel
    const [products, productSeries, blogs, applications] = await Promise.all([
      fetchProducts(),
      fetchProductSeries(),
      fetchBlogs(),
      fetchApplications(),
    ])

    // Combine all routes
    const allUrls = [
      ...getStaticRoutes(),
      ...productSeries,
      ...products,
      ...blogs,
      ...applications,
    ]

    return allUrls
  } catch (error) {
    console.error('Error generating sitemap URLs:', error)
    // Return at least static routes
    return getStaticRoutes()
  }
}

/**
 * Generate XML sitemap
 */
export function generateSitemapXML(urls: SitemapUrl[], baseUrl: string = 'https://busrom.com'): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return xml
}
