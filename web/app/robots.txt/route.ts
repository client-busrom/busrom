/**
 * Robots.txt Route
 *
 * This route generates a dynamic robots.txt file for search engine crawlers.
 * The content can be configured via SiteConfig in the CMS.
 *
 * Route: /robots.txt
 *
 * Features:
 * - Fetches robots.txt content from CMS (SiteConfig)
 * - Falls back to default robots.txt if CMS config is not available
 * - Automatically includes sitemap URL
 */

import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql'

/**
 * Fetch robots.txt content from CMS
 */
async function getRobotsTxtFromCMS(): Promise<string | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetSiteConfig {
            siteConfig {
              robotsTxtContent
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.siteConfig?.robotsTxtContent || null
  } catch (error) {
    console.error('Error fetching robots.txt from CMS:', error)
    return null
  }
}

/**
 * Get default robots.txt content
 */
function getDefaultRobotsTxt(siteUrl: string): string {
  return `# Busrom Robots.txt
# Updated: ${new Date().toISOString()}

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Disallow private routes
Disallow: /_next/
Disallow: /static/

# Crawl-delay for all bots
Crawl-delay: 1

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`
}

export async function GET() {
  try {
    // Get site URL from environment
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'

    // Try to fetch robots.txt from CMS
    let robotsTxt = await getRobotsTxtFromCMS()

    // If not found in CMS, use default
    if (!robotsTxt) {
      robotsTxt = getDefaultRobotsTxt(siteUrl)
    } else {
      // Ensure sitemap is included
      if (!robotsTxt.includes('Sitemap:')) {
        robotsTxt += `\n\nSitemap: ${siteUrl}/sitemap.xml\n`
      }
    }

    // Return text response
    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)

    // Return default robots.txt as fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
    return new NextResponse(getDefaultRobotsTxt(siteUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
