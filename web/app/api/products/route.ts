import { NextRequest, NextResponse } from 'next/server'
import type { Product, ProductListResponse } from '@/lib/types/product'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

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
 * Transform image variants to use CDN URLs
 */
function transformImageVariants(variants: any) {
  if (!variants) return null
  const transformed: any = {}
  for (const [key, value] of Object.entries(variants)) {
    if (value && typeof value === 'object' && 'url' in value) {
      transformed[key] = {
        ...value,
        url: normalizeToCDN((value as any).url)
      }
    } else if (typeof value === 'string') {
      transformed[key] = normalizeToCDN(value)
    } else {
      transformed[key] = value
    }
  }
  return transformed
}

/**
 * GET /api/products
 *
 * Query parameters:
 * - locale: string (default: 'en')
 * - series: string (filter by series slug)
 * - isFeatured: boolean
 * - search: string (search in product name)
 * - page: number (default: 1)
 * - pageSize: number (default: 12)
 * - sortBy: string (default: 'order')
 * - sortDir: 'asc' | 'desc' (default: 'asc')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const seriesSlug = searchParams.get('series')
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const sortBy = searchParams.get('sortBy') || 'order'
    const sortDir = (searchParams.get('sortDir') || 'asc') as 'asc' | 'desc'

    console.log('[Products API] Fetching products from Payload CMS:', {
      locale,
      seriesSlug,
      isFeatured,
      search,
      page,
      pageSize,
      sortBy,
      sortDir,
    })

    // 构建 Payload API URL
    const params = new URLSearchParams()
    params.append('locale', locale)
    params.append('limit', pageSize.toString())
    params.append('page', page.toString())
    params.append('depth', '2') // Include series relationship

    // Status filter - only published products
    // TODO: Re-enable after setting product status to 'published' in Payload CMS
    // params.append('where[status][equals]', 'published')

    // Series filter - need to query series by slug first, then filter by ID
    // NOTE: Payload doesn't support nested where queries like where[series.slug][equals]
    // For now, skip this filter and we'll implement it differently if needed
    // if (seriesSlug) {
    //   params.append('where[series.slug][equals]', seriesSlug)
    // }

    // Featured filter
    if (isFeatured) {
      params.append('where[featured][equals]', 'true')
    }

    // Search filter (searches in name field)
    if (search) {
      params.append('where[name][contains]', search)
    }

    // Sorting
    const sortField = sortBy === 'createdAt' ? 'createdAt' : sortBy === 'updatedAt' ? 'updatedAt' : 'order'
    params.append('sort', sortDir === 'desc' ? `-${sortField}` : sortField)

    const url = `${CMS_URL}/api/products?${params.toString()}`
    console.log('[Products API] Request URL:', url)

    // 从 Payload CMS 获取产品数据
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // 缓存 60 秒
    })

    if (!response.ok) {
      console.error('[Products API] Payload CMS error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch products from CMS' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Products API] Received products:', data.totalDocs)

    // Transform data to match frontend expectations
    const products = data.docs.map((product: any) => {
      return {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name, // Already localized by Payload
        localizedName: product.name,
        shortDescription: product.shortDescription,
        showImage: product.showImage
          ? {
              id: product.showImage.id,
              url: normalizeToCDN(product.showImage.url),
              altText: product.showImage.alt || '',
              cropFocalPoint: product.showImage.focalPoint,
              variants: transformImageVariants(product.showImage.sizes),
            }
          : null,
        mainImage: product.mainImage && Array.isArray(product.mainImage)
          ? product.mainImage.map((img: any) => ({
              id: img.id,
              url: normalizeToCDN(img.url),
              altText: img.alt || '',
              cropFocalPoint: img.focalPoint,
              variants: transformImageVariants(img.sizes),
            }))
          : [],
        series: product.series
          ? {
              id: product.series.id,
              slug: product.series.slug,
              name: product.series.name,
              localizedName: product.series.name,
            }
          : null,
        isFeatured: product.featured || false,
        order: product.order || 0,
        status: product.status === 'published' ? 'PUBLISHED' : 'DRAFT',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    })

    const apiResponse: ProductListResponse = {
      products,
      total: data.totalDocs,
      page: data.page,
      pageSize: data.limit,
      totalPages: data.totalPages,
    }

    return NextResponse.json(apiResponse)
  } catch (error: any) {
    console.error('[Products API] Error:', error)
    console.error('[Products API] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
