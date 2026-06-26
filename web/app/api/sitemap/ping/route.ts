/**
 * Sitemap Ping API Route
 *
 * This API endpoint triggers pings to all search engines to notify them
 * about sitemap updates. Should be called after content changes.
 *
 * Route: POST /api/sitemap/ping
 *
 * Usage:
 * - Call this endpoint after publishing/updating content
 * - Can be triggered by CMS webhooks or scheduled jobs
 * - Optionally pass specific URLs that were changed
 *
 * Request Body (optional):
 * {
 *   "urls": ["https://busromhouse.com/en/shop/product-1", ...] // specific changed URLs
 * }
 *
 * Security: This endpoint should be protected in production
 */

import { NextRequest, NextResponse } from 'next/server'
import { pingSitemapToSearchEngines } from '@/lib/api/sitemap-ping'

// Simple auth check - in production, use proper authentication
const PING_SECRET = process.env.SITEMAP_PING_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Optional: Check authorization
    if (PING_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${PING_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busromhouse.com'

    // Parse request body for optional changed URLs
    let changedUrls: string[] | undefined
    try {
      const body = await request.json()
      if (body.urls && Array.isArray(body.urls)) {
        changedUrls = body.urls
      }
    } catch {
      // No body or invalid JSON - that's fine
    }

    // Ping all search engines
    const result = await pingSitemapToSearchEngines(siteUrl, changedUrls)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('Error pinging search engines:', error)
    return NextResponse.json(
      { error: 'Failed to ping search engines', details: error.message },
      { status: 500 }
    )
  }
}

// GET method for manual testing
export async function GET(request: NextRequest) {
  try {
    // Optional: Check authorization via query param for testing
    if (PING_SECRET) {
      const secret = request.nextUrl.searchParams.get('secret')
      if (secret !== PING_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busromhouse.com'
    const result = await pingSitemapToSearchEngines(siteUrl)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('Error pinging search engines:', error)
    return NextResponse.json(
      { error: 'Failed to ping search engines', details: error.message },
      { status: 500 }
    )
  }
}
