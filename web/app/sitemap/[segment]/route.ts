import { NextRequest, NextResponse } from 'next/server'
import {
  BASE_SITE_URL,
  generateSitemapXML,
  getSitemapUrlsByType,
  getSitemapUrlsForLocale,
  isSitemapType,
  SITEMAP_TYPES,
} from '@/lib/api/sitemap'
import { isValidLocale, locales } from '@/i18n.config'

export const dynamic = 'force-dynamic'

function stripXmlExtension(segment: string): string {
  return segment.replace(/\.xml$/i, '')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segment: string }> }
) {
  try {
    const rawSegment = (await params).segment
    const segment = stripXmlExtension(rawSegment)

    // Type-based sitemap: /sitemap/products.xml, /sitemap/blogs.xml, etc.
    if (isSitemapType(segment)) {
      const urls = await getSitemapUrlsByType(segment, BASE_SITE_URL)
      const xml = generateSitemapXML(urls, BASE_SITE_URL)
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Locale-based sitemap: /sitemap/en, /sitemap/zh.xml, etc.
    if (isValidLocale(segment)) {
      const urls = await getSitemapUrlsForLocale(segment, BASE_SITE_URL)
      const xml = generateSitemapXML(urls, BASE_SITE_URL)
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    return new NextResponse(
      `Invalid sitemap segment "${segment}". Valid types: ${SITEMAP_TYPES.join(', ')} or locales: ${locales.join(', ')}`,
      { status: 404 }
    )
  } catch (error) {
    console.error('Sitemap segment route error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
