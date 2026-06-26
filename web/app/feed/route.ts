/**
 * RSS Feed Route
 *
 * Main RSS feed endpoint that returns content with actual frontend detail pages.
 * Supports language and type filtering via query parameters.
 *
 * Route: /feed
 *
 * Query Parameters:
 * - type: 'shop' | 'products' | 'all' (default: 'all')
 * - locale: 'en' | 'zh' (default: 'en')
 * - limit: number (default: 50, max: 100)
 *
 * Content Type Mapping:
 * - shop: CMS Product -> /shop/[slug]
 * - products: CMS ProductSeries -> /products/[slug]
 *
 * Examples:
 * - /feed                    -> All content in English
 * - /feed?type=shop          -> Shop products only
 * - /feed?type=products      -> Product series only
 * - /feed?locale=zh          -> All content in Chinese
 * - /feed?type=shop&locale=zh -> Shop products in Chinese
 */

import { NextRequest, NextResponse } from 'next/server'
import { getFeedItems, getFeedConfig, generateRSSXML, FeedType } from '@/lib/api/rss'
import { locales } from '@/i18n.config'

// Force dynamic rendering - this route fetches from CMS at runtime
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busromhouse.com'

    // Parse query parameters
    const typeParam = searchParams.get('type') || 'all'
    const locale = searchParams.get('locale') || 'en'
    const limitParam = searchParams.get('limit')
    const limit = Math.min(parseInt(limitParam || '50', 10), 100)

    // Validate type - only include types with actual frontend detail pages
    const validTypes: FeedType[] = ['shop', 'products', 'all']
    const type: FeedType = validTypes.includes(typeParam as FeedType)
      ? (typeParam as FeedType)
      : 'all'

    // Validate locale
    const validLocale = locales.includes(locale as any) ? locale : 'en'

    // Get feed items and config
    const items = await getFeedItems(type, limit, validLocale)
    const config = getFeedConfig(type, baseUrl, validLocale)

    // Build feed path for self-reference
    const feedPath = `/feed${type !== 'all' ? `?type=${type}` : ''}${validLocale !== 'en' ? `${type !== 'all' ? '&' : '?'}locale=${validLocale}` : ''}`

    // Generate RSS XML
    const xml = generateRSSXML(config, items, baseUrl, feedPath)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
