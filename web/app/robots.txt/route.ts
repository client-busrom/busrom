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
import { SITEMAP_LOCALES } from '@/lib/api/sitemap'

// Force dynamic rendering - this route fetches from CMS at runtime
export const dynamic = 'force-dynamic'

// Use the public CMS domain to avoid internal networking issues in Docker/ECS
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'

const GRAPHQL_ENDPOINT = `${CMS_URL}/api/graphql`


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
  // Generate sitemap entries for all locales
  const localeSitemaps = (SITEMAP_LOCALES as unknown as string[])
    .map((locale) => `Sitemap: ${siteUrl}/sitemap/${locale}`)
    .join('\n')

  return `# Busrom Robots.txt
# Multi-language B2B industrial hardware website

User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/

# Sitemaps
Sitemap: ${siteUrl}/sitemaps.xml
Sitemap: ${siteUrl}/sitemap.xml
${localeSitemaps}
`
}

export async function GET() {
  try {
    // Get site URL from environment
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
    return new NextResponse(getDefaultRobotsTxt(siteUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
