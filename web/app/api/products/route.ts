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
 * Normalize a slug: handles spaces, multiple hyphens, underscores, etc.
 * Example: "Glass- Standoff  Case" -> "glass-standoff-case"
 */
function toUrlSlug(s: string): string {
  if (!s) return ''
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')     // 把空格、下划线、连字号序列统统变成一个杠
    .replace(/^-+|-+$/g, '')      // 去头尾杠
    .replace(/[^a-z0-9-]/g, '')   // 删掉非法字符
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
    const categoryId = searchParams.get('category')
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const ignoreVisibility = searchParams.get('ignoreVisibility') === 'true'
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

    // If series slug is provided, first get the series ID
    let seriesId: string | null = null
    if (seriesSlug) {
      try {
        const seriesUrl = `${CMS_URL}/api/product-series?where[slug][equals]=${encodeURIComponent(seriesSlug)}&limit=1`
        const seriesRes = await fetch(seriesUrl, {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 }, // Cache for 5 minutes
        })
        if (seriesRes.ok) {
          const seriesData = await seriesRes.json()
          if (seriesData.docs && seriesData.docs.length > 0) {
            seriesId = seriesData.docs[0].id
            console.log('[Products API] Found series ID:', seriesId, 'for slug:', seriesSlug)
          }
        }
      } catch (e) {
        console.error('[Products API] Failed to fetch series by slug:', e)
      }
    }

    // 构建 Payload API URL
    const params = new URLSearchParams()
    params.append('locale', locale)
    params.append('limit', pageSize.toString())
    params.append('page', page.toString())
    params.append('depth', '2') // Include series relationship

    // Status filter - only published products
    // TODO: Re-enable after setting product status to 'published' in Payload CMS
    // params.append('where[status][equals]', 'published')

    // Series filter by ID
    if (seriesId) {
      params.append('where[series][equals]', seriesId)
    }

    // Category filter
    if (categoryId) {
      params.append('where[category][equals]', categoryId)
    }

    // Featured filter
    if (isFeatured) {
      params.append('where[isFeatured][equals]', 'true')
    }

    // Shop Visibility filter (default to showing only visible products in shop)
    if (!ignoreVisibility) {
      params.append('where[shopVisibility][equals]', 'true')
    }

    // Search filter (searches in name field)
    if (search) {
      params.append('where[name][contains]', search)
    }

    // Sorting
    const sortField = sortBy === 'createdAt' ? 'createdAt' : 
                     sortBy === 'updatedAt' ? 'updatedAt' : 
                     sortBy === 'shopOrder' ? 'shopOrder' : 'order'
    params.append('sort', sortDir === 'desc' ? `-${sortField}` : sortField)

    const url = `${CMS_URL}/api/products?${params.toString()}`
    console.log('[Products API] Request URL:', url)

    // 从 Payload CMS 获取产品数据
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // 禁用该路由的 Next.js 数据缓存，确保结果实时
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
              cropFocalPoint: getCropFocalPoint(product.showImage),
              variants: transformImageVariants(product.showImage.sizes),
            }
          : null,
        mainImage: product.mainImage && Array.isArray(product.mainImage)
          ? product.mainImage.map((img: any) => ({
              id: img.id,
              url: normalizeToCDN(img.url),
              altText: img.alt || '',
              cropFocalPoint: getCropFocalPoint(img),
              variants: transformImageVariants(img.sizes),
            }))
          : [],
        category: product.category
          ? {
              id: product.category.id || product.category,
              slug: toUrlSlug(product.category.slug || ''),
              name: product.category.name,
            }
          : null,
        series: product.series
          ? {
              id: product.series.id || product.series,
              slug: toUrlSlug(product.series.slug || ''),
              name: product.series.name,
              localizedName: product.series.name,
            }
          : null,
        isFeatured: product.isFeatured || false,
        isHot: product.isHot || false,
        isNew: product.isNew || false,
        order: product.order || 0,
        shopOrder: product.shopOrder || 0,
        status: product.status === 'published' ? 'PUBLISHED' : 'DRAFT',
        productAttributes: product.productAttributes || null,
        linkedForm: product.linkedForm || null,
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

    // 禁用 CDN 缓存，确保每次请求都获取最新数据
    // API 路由不应被 CDN 缓存，因为不同查询参数返回不同结果
    return NextResponse.json(apiResponse, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Surrogate-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('[Products API] Error:', error)
    console.error('[Products API] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
