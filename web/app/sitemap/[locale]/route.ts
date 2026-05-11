/**
 * Locale-Specific Sitemap Route
 *
 * This route generates a sitemap for a specific locale with hreflang alternates.
 * Each URL in this sitemap includes links to all language versions.
 *
 * Route: /sitemap/[locale] (e.g., /sitemap/en, /sitemap/zh)
 *
 * Features:
 * - Generates URLs for all content types (products, shop, applications, blogs)
 * - Includes hreflang alternate links for each URL
 * - Supports x-default for fallback language
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSitemapUrlsForLocale, generateSitemapXML, SITEMAP_LOCALES } from '@/lib/api/sitemap'

// Force dynamic rendering - this route fetches from CMS at runtime
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

    // Validate locale
    if (!SITEMAP_LOCALES.includes(locale as any)) {
      return new NextResponse('Invalid locale', { status: 404 })
    }

    // Get URLs for this locale with hreflang alternates
    const urls = await getSitemapUrlsForLocale(locale, baseUrl)

    // Generate XML
    const xml = generateSitemapXML(urls, baseUrl)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating locale sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
