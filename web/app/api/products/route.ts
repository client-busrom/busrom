import { NextRequest, NextResponse } from 'next/server'
import type { Product, ProductListResponse } from '@/lib/types/product'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

import { convertToCDNUrl } from '@/lib/cdn-url'

/**
 * Transform image variants to use CDN URLs
 */
function transformImageVariants(variants: any, strategy?: string) {
  if (!variants) return null
  const transformed: any = {}
  for (const [key, value] of Object.entries(variants)) {
    if (value && typeof value === 'object' && 'url' in value) {
      transformed[key] = {
        ...value,
        url: convertToCDNUrl((value as any).url, strategy)
      }
    } else if (typeof value === 'string') {
      transformed[key] = convertToCDNUrl(value, strategy)
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
    const productIds = searchParams.get('ids')?.split(',').filter(Boolean)
    const seriesIds = searchParams.get('seriesIds')?.split(',').filter(Boolean)

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
    params.append('limit', (productIds?.length || seriesIds?.length) ? '100' : pageSize.toString())
    params.append('page', page.toString())
    params.append('depth', '2') // Include series relationship
    
    // 只选择展示需要的字段，排除沉重的 description/content 字段
    params.append('select[slug]', 'true')
    params.append('select[name]', 'true')
    params.append('select[shortDescription]', 'true')
    params.append('select[showImage]', 'true')
    params.append('select[mainImage]', 'true')
    params.append('select[category]', 'true')
    params.append('select[series]', 'true')
    params.append('select[isFeatured]', 'true')
    params.append('select[isHot]', 'true')
    params.append('select[isNew]', 'true')
    params.append('select[order]', 'true')
    params.append('select[shopOrder]', 'true')
    params.append('select[status]', 'true')
    params.append('select[attributePage]', 'true')
    params.append('select[linkedForm]', 'true')
    params.append('select[updatedAt]', 'true')
    params.append('select[createdAt]', 'true')

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

    // Specific IDs filter
    if (productIds && productIds.length > 0) {
      productIds.forEach((id, i) => {
        params.append(`where[or][${i}][id][equals]`, id)
      })
    }

    // Specific Series IDs filter
    if (seriesIds && seriesIds.length > 0) {
      seriesIds.forEach((id, i) => {
        const baseIdx = productIds?.length || 0
        params.append(`where[or][${baseIdx + i}][series][equals]`, id)
      })
    }

    // Sorting
    if (sortBy === 'shopOrder') {
      // 按照 CMS 定义的规则及置顶需求：isHot > isNew > isFeatured > Shop权重 > 全局显示顺序 > 更新时间
      params.append('sort', sortDir === 'desc' ? '-isHot,-isNew,-isFeatured,-shopOrder,-order,-updatedAt' : 'isHot,isNew,isFeatured,shopOrder,order,updatedAt')
    } else if (sortBy === 'name_asc') {
      params.append('sort', 'name')
    } else if (sortBy === 'name_desc') {
      params.append('sort', '-name')
    } else {
      const sortField = sortBy === 'createdAt' ? 'createdAt' : 
                       sortBy === 'updatedAt' ? 'updatedAt' : 'order'
      params.append('sort', sortDir === 'desc' ? `-${sortField}` : sortField)
    }

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

    const getName = (obj: any) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      if (typeof obj === 'object') {
        return obj.en || obj.zh || obj.zh_CN || obj.zh_HK || Object.values(obj).find(v => typeof v === 'string') || ''
      }
      return ''
    }

    const strategy = request.cookies.get('cdn_strategy')?.value

    // Transform data to match frontend expectations
    const products = data.docs.map((product: any) => {
      const productName = getName(product.name)
      const categoryName = product.category ? getName(product.category.name || product.category.fullTitle || product.category.title) : ''
      const seriesName = product.series ? getName(product.series.name) : ''

      return {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: productName,
        localizedName: productName,
        shortDescription: getName(product.shortDescription || product.description),
        showImage: product.showImage
          ? {
              id: product.showImage.id,
              url: convertToCDNUrl(product.showImage.url, strategy),
              altText: product.showImage.alt || '',
              cropFocalPoint: getCropFocalPoint(product.showImage),
              variants: transformImageVariants(product.showImage.sizes, strategy),
            }
          : null,
        mainImage: product.mainImage && Array.isArray(product.mainImage)
          ? product.mainImage.map((img: any) => ({
              id: img.id,
              url: convertToCDNUrl(img.url, strategy),
              altText: img.alt || '',
              cropFocalPoint: getCropFocalPoint(img),
              variants: transformImageVariants(img.sizes, strategy),
            }))
          : [],
        category: product.category
          ? {
              id: product.category.id || product.category,
              slug: toUrlSlug(product.category.slug || ''),
              name: categoryName,
            }
          : null,
        series: product.series
          ? {
              id: product.series.id || product.series,
              slug: toUrlSlug(product.series.slug || ''),
              name: seriesName,
              localizedName: seriesName,
            }
          : null,
        isFeatured: product.isFeatured || false,
        isHot: product.isHot || false,
        isNew: product.isNew || false,
        order: product.order || 0,
        shopOrder: product.shopOrder || 0,
        status: product.status === 'published' ? 'PUBLISHED' : 'DRAFT',
        productAttributes: Array.isArray(product.attributePage?.productAttributes)
          ? product.attributePage.productAttributes
              .filter((attr: any) => attr.showOnFrontEnd !== false && attr.value)
              .map((attr: any) => attr.value)
          : [],
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
