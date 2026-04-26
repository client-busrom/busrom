/**
 * Sitemap Index Route
 *
 * This route generates a sitemap index file that references all locale-specific sitemaps.
 * This is the main entry point for search engines to discover all language versions.
 *
 * Route: /sitemaps.xml
 *
 * Features:
 * - Lists all locale-specific sitemaps (sitemap-en.xml, sitemap-zh.xml, etc.)
 * - Includes the main sitemap.xml for backward compatibility
 * - Supports multi-language SEO with hreflang tags in individual sitemaps
 */

import { NextResponse } from 'next/server'
import { generateSitemapIndexXML, SITEMAP_LOCALES } from '@/lib/api/sitemap'

// Force dynamic rendering - this route generates content at runtime
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busromhouse.com'

    // Generate sitemap index XML
    const xml = generateSitemapIndexXML(SITEMAP_LOCALES as unknown as string[], baseUrl)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap index:', error)
    return new NextResponse('Error generating sitemap index', { status: 500 })
  }
}
