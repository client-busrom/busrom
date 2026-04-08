import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// CDN Domain configuration
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || 'http://localhost:8080'

/**
 * Normalize image URL to use CDN domain
 */
function normalizeToCDN(url: string): string {
  if (!url) return url
  if (url.includes(CDN_DOMAIN) || url.includes('cloudfront.net')) {
    return url
  }
  try {
    const urlObj = new URL(url)
    if (url.includes('localhost:9000')) {
      return `${CDN_DOMAIN}${urlObj.pathname}`
    }
    if (urlObj.hostname.includes('amazonaws.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length > 1) {
        pathParts.shift()
      }
      return `${CDN_DOMAIN}/${pathParts.join('/')}`
    }
    return url
  } catch {
    return url
  }
}

/**
 * Transform Payload sizes to frontend variants format
 * Payload sizes: thumbnail (400x300), card (768x512), tablet (1024w), desktop (1920w)
 * Frontend variants: thumbnail, small, medium, large, xlarge
 */
function transformImageVariants(sizes: any) {
  if (!sizes) return null

  const variants: any = {}

  // Map Payload sizes to frontend variants
  if (sizes.thumbnail?.url) {
    variants.thumbnail = normalizeToCDN(sizes.thumbnail.url)
  }
  if (sizes.card?.url) {
    variants.small = normalizeToCDN(sizes.card.url)
  }
  if (sizes.tablet?.url) {
    variants.medium = normalizeToCDN(sizes.tablet.url)
  }
  if (sizes.desktop?.url) {
    variants.large = normalizeToCDN(sizes.desktop.url)
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

    console.log('[Applications API] Fetching applications from Payload CMS:', {
      locale,
      limit,
      page,
      category,
      ids,
    })

    // 构建 Payload API URL
    const params = new URLSearchParams()
    params.append('locale', locale)
    params.append('depth', '1') // 减少深度，只获取一层关联
    params.append('where[status][equals]', 'published')
    
    // 只选择需要的字段，大幅减少 JSON 体积
    params.append('select[name]', 'true')
    params.append('select[slug]', 'true')
    params.append('select[subtitle]', 'true')
    params.append('select[shortDescription]', 'true')
    params.append('select[mainImage]', 'true')
    params.append('select[sceneGallery]', 'true')
    params.append('select[category]', 'true')
    params.append('select[status]', 'true')
    params.append('select[updatedAt]', 'true')

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

    // Transform data to match frontend expectations
    const docs = data.docs.map((app: any) => {
      // Transform sceneGallery images
      const sceneGallery = app.sceneGallery?.map((scene: any) => ({
        sceneName: scene.sceneName,
        images: scene.images?.map((img: any) => ({
          id: img.id,
          url: normalizeToCDN(img.url),
          alt: img.alt || '',
          cropFocalPoint: getCropFocalPoint(img),
          variants: transformImageVariants(img.sizes),
          width: img.width,
          height: img.height,
        })) || [],
      })) || []

      return {
        id: app.id,
        slug: app.slug,
        name: app.name,
        shortDescription: app.shortDescription,
        description: app.description,
        category: app.category
          ? {
              id: app.category.id,
              slug: app.category.slug,
              name: app.category.name,
            }
          : null,
        sceneGallery,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }
    })

    return NextResponse.json({
      docs,
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
