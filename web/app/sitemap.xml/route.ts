/**
 * Sitemap XML Route
 *
 * This route generates a dynamic sitemap.xml file containing all pages of the website.
 * The sitemap helps search engines discover and index all pages.
 *
 * Route: /sitemap.xml
 *
 * Features:
 * - Includes all static pages
 * - Fetches dynamic routes from CMS (products, blogs, applications)
 * - Sets appropriate lastmod, changefreq, and priority for each URL
 * - Caches the result for performance
 */

import { NextResponse } from 'next/server'
import { getAllSitemapUrls, generateSitemapXML } from '@/lib/api/sitemap'

export async function GET() {
  try {
    // Get base URL from environment or default
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'

    // Fetch all URLs
    const urls = await getAllSitemapUrls()

    // Generate XML
    const xml = generateSitemapXML(urls, baseUrl)

    // Return XML response
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)

    // Return error response
    return new NextResponse('Error generating sitemap', {
      status: 500,
    })
  }
}
