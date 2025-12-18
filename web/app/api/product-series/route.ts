import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

/**
 * GET /api/product-series
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    console.log('[Product Series API] Fetching from Payload CMS, locale:', locale)

    // 构建 Payload API URL
    const params = new URLSearchParams()
    params.append('locale', locale)
    params.append('limit', '100') // Get all series
    params.append('depth', '1')
    // TODO: Re-enable after setting series status to 'published' in Payload CMS
    // params.append('where[status][equals]', 'published')
    params.append('sort', 'order')

    const url = `${CMS_URL}/api/product-series?${params.toString()}`
    console.log('[Product Series API] Request URL:', url)

    // 从 Payload CMS 获取系列数据
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // 缓存 60 秒
    })

    if (!response.ok) {
      console.error('[Product Series API] Payload CMS error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch product series from CMS' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Product Series API] Received series:', data.totalDocs)

    // Transform data to match frontend expectations
    const series = data.docs.map((s: any) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      localizedName: s.name, // Already localized by Payload
      description: s.description,
      localizedDescription: s.description, // Already localized by Payload
      featuredImage: s.featuredImage
        ? {
            id: s.featuredImage.id,
            url: s.featuredImage.url,
            altText: s.featuredImage.alt || '',
            filename: s.featuredImage.filename,
            variants: s.featuredImage.sizes,
          }
        : null,
      order: s.order || 0,
      status: s.status === 'published' ? 'PUBLISHED' : 'DRAFT',
    }))

    return NextResponse.json({ series })
  } catch (error) {
    console.error('[Product Series API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
