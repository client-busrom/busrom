import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

/**
 * GET /api/product-series/[slug]
 *
 * Fetch product series by slug from Payload CMS
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const { slug } = await params

    // Fetch from Payload CMS REST API
    const response = await fetch(
      `${CMS_URL}/api/product-series?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Payload API Error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch product series' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const seriesItems = data?.docs || []

    if (seriesItems.length === 0) {
      return NextResponse.json({ error: 'Product series not found' }, { status: 404 })
    }

    const series = seriesItems[0]

    // Get featured image URL
    const getFeaturedImageUrl = (featuredImage: any): string => {
      if (!featuredImage) return ''
      if (typeof featuredImage === 'string') return featuredImage
      const url = featuredImage.url || featuredImage.sizes?.large?.url || ''
      return url ? convertToCDNUrl(url) : ''
    }

    // Transform series data
    const transformedSeries = {
      id: series.id,
      slug: series.slug,
      name: series.name || '',
      description: series.description || '',
      featuredImage: getFeaturedImageUrl(series.featuredImage),
      order: series.order || 0,
      status: series.status,
      isFeatured: series.isFeatured || false,
      content: series.contentTranslation || null,
      locale,
    }

    return NextResponse.json(transformedSeries)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
