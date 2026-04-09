import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// CDN Domain configuration
import { convertToCDNUrl } from '@/lib/cdn-url'

/**
 * Transform Payload sizes to frontend variants format
 * Payload sizes: thumbnail (400x300), card (768x512), tablet (1024w), desktop (1920w)
 * Frontend variants: thumbnail, small, medium, large, xlarge
 */
function transformImageVariants(sizes: any, strategy?: string) {
  if (!sizes) return null

  const variants: any = {}

  // Map Payload sizes to frontend variants
  if (sizes.thumbnail?.url) {
    variants.thumbnail = convertToCDNUrl(sizes.thumbnail.url, strategy)
  }
  if (sizes.card?.url) {
    variants.small = convertToCDNUrl(sizes.card.url, strategy)
  }
  if (sizes.tablet?.url) {
    variants.medium = convertToCDNUrl(sizes.tablet.url, strategy)
  }
  if (sizes.desktop?.url) {
    variants.large = convertToCDNUrl(sizes.desktop.url, strategy)
  }

  return Object.keys(variants).length > 0 ? variants : null
}

/**
 * Convert Payload's focalX/focalY to cropFocalPoint format
 */
function getCropFocalPoint(media: any): { x: number; y: number } | undefined {
  if (media?.focalX !== undefined && media?.focalX !== null &&
      media?.focalY !== undefined && media?.focalY !== null) {
    return { x: media.focalX, y: media.focalY }
  }
  return undefined
}

/**
 * GET /api/applications
 *
 * Query parameters:
 * - locale: string (default: 'en')
 * - limit: number (default: 10)
 * - page: number (default: 1)
 * - category: string (filter by category slug)
 * - ids: string (comma-separated list of application IDs)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const ids = searchParams.get('ids')
    const strategy = request.cookies.get('cdn_strategy')?.value

    console.log('[Applications API] Fetching applications from Payload CMS:', {
      locale,
      limit,
      page,
      category,
      ids,
      strategy
    })

    // 构建 Payload API URL
    const params = new URLSearchParams()
    params.append('locale', locale)
    params.append('depth', '2')
    params.append('where[status][equals]', 'published')

    // If specific IDs provided, fetch those applications
    if (ids) {
      const idArray = ids.split(',').filter(Boolean)
      params.append('limit', idArray.length.toString())
      // Use 'in' operator to fetch multiple IDs
      idArray.forEach((id, index) => {
        params.append(`where[id][in][${index}]`, id)
      })
    } else {
      params.append('limit', Math.min(limit, 20).toString()) // 限制最大拉取 20 条，防止体积超限
      params.append('page', page.toString())
      // Category filter
      if (category) {
        params.append('where[category.slug][equals]', category)
      }
    }

    const url = `${CMS_URL}/api/applications?${params.toString()}`
    console.log('[Applications API] Request URL:', url)

    // 从 Payload CMS 获取应用案例数据
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // 缓存 60 秒
    })

    if (!response.ok) {
      console.error('[Applications API] Payload CMS error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch applications from CMS' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Applications API] Received applications:', data.totalDocs)

    // Server-side Pooled Random Selection & Data Thinning
    const optimizedDocs = (data.docs || []).map((app: any) => {
      // 1. Collect all potential images into a flat pool
      const pool: any[] = []
      
      // Root images
      if (app.images && Array.isArray(app.images)) {
        app.images.forEach((item: any) => {
          const img = item.image || item
          if (img && (img.url || img.file?.url)) pool.push(img)
        })
      }
      
      // Scene gallery images
      if (app.sceneGallery && Array.isArray(app.sceneGallery)) {
        app.sceneGallery.forEach((scene: any) => {
          if (scene.images && Array.isArray(scene.images)) {
            scene.images.forEach((item: any) => {
              const img = item.image || item
              if (img && (img.url || img.file?.url)) pool.push(img)
            })
          }
        })
      }
      
      // Main image fallback
      if (app.mainImage && (app.mainImage.url || app.mainImage.file?.url)) {
        pool.push(app.mainImage)
      }

      // 2. Pick ONE random image
      const selectedImage = pool.length > 0 
        ? pool[Math.floor(Math.random() * pool.length)] 
        : null

      // 3. Construct a lean object for the frontend
      return {
        id: app.id,
        slug: app.slug,
        name: app.title || app.name || "",
        category: app.category?.name || app.category?.title || "",
        // Just return the one selected image with its essential metadata
        image: selectedImage ? {
          id: selectedImage.id,
          url: convertToCDNUrl(selectedImage.url || selectedImage.file?.url, strategy),
          alt: selectedImage.alt || app.name,
          variants: transformImageVariants(selectedImage.sizes, strategy)
        } : null
      }
    })

    return NextResponse.json({
      docs: optimizedDocs,
      totalDocs: data.totalDocs,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage,
      hasPrevPage: data.hasPrevPage,
    })
  } catch (error: any) {
    console.error('[Applications API] Error:', error)
    console.error('[Applications API] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
