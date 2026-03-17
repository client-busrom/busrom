import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

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
    params.append('limit', '100')
    params.append('depth', '2') // Increase depth to get product images
    params.append('sort', 'order')

    const url = `${CMS_URL}/api/product-series?${params.toString()}`
    console.log('[Product Series API] Request URL:', url)

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status })
    }

    const data = await response.json()

    // Transform data
    const series = data.docs.map((s: any) => {
      // Logic: Prefer the first product's showImage (white backdrop) for this section.
      // Fallback to series featuredImage (lifestyle) or first product's mainImage.
      let finalImage = null;
      
      const firstProd = s.products?.docs?.length > 0 ? s.products.docs[0] : null;

      if (firstProd) {
        finalImage = firstProd.showImage || firstProd.mainImage?.[0];
      }

      // If no product image found, use the series image
      if (!finalImage) {
        finalImage = s.featuredImage;
      }

      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        featuredImage: finalImage && finalImage.url ? {
          id: finalImage.id,
          url: finalImage.url,
          altText: finalImage.alt || s.name,
          filename: finalImage.filename,
          variants: finalImage.sizes,
        } : null,
        order: s.order || 0,
        status: s.status === 'published' ? 'PUBLISHED' : 'DRAFT',
      }
    })

    return NextResponse.json({ series })
  } catch (error) {
    console.error('[Product Series API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
