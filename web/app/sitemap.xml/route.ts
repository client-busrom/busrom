/**
 * Main Sitemap Index Route
 *
 * This route generates the main sitemap.xml index file that references
 * content-type sitemaps (products, blogs, pages, etc.).
 *
 * Route: /sitemap.xml
 *
 * Features:
 * - Lists all content-type sitemaps
 * - Each child sitemap contains URLs with hreflang alternates for all locales
 * - Follows the pattern used by pergoluxshop.com and other large e-commerce sites
 */

import { NextResponse } from 'next/server'
import { generateTypeSitemapIndexXML, SITEMAP_TYPES, BASE_SITE_URL } from '@/lib/api/sitemap'

// Force dynamic rendering - this route generates content at runtime
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const baseUrl = BASE_SITE_URL

    // Generate type-based sitemap index XML
    const xml = generateTypeSitemapIndexXML(SITEMAP_TYPES, baseUrl)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating main sitemap index:', error)
    return new NextResponse('Error generating sitemap index', { status: 500 })
  }
}
