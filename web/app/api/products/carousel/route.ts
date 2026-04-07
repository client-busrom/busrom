import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API base URL
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
 * Extract simple text highlights from productAttributes Lexical JSON
 */
function extractHighlights(productAttributes: any): { text: string; icon?: string }[] {
  if (!productAttributes?.root?.children) return []
  
  const highlights: { text: string; icon?: string }[] = []
  const nodes = productAttributes.root.children

  for (const node of nodes) {
    // 1. iconList nodes
    if (node.type === 'iconList' && node.data?.items) {
      node.data.items.forEach((item: any) => {
        if (item.title) {
          highlights.push({ text: item.title, icon: item.icon })
        }
      })
    }
    // 2. Standard list nodes
    else if (node.type === 'list' && node.children) {
      node.children.forEach((item: any) => {
        if (item.children) {
          const text = item.children.map((c: any) => c.text || '').join('').split('|')[0]
          if (text.trim()) {
            highlights.push({ text: text.trim() })
          }
        }
      })
    }
  }
  return highlights
}

/**
 * Transform product data to frontend format
 */
function transformProduct(product: any, locale: string = 'en') {
  const getName = (obj: any) => {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    if (typeof obj === 'object') {
      return obj.en || obj.zh || obj.zh_CN || obj.zh_HK || Object.values(obj).find(v => typeof v === 'string') || ''
    }
    return ''
  }

  const categoryName = product.category ? getName(product.category.name || product.category.fullTitle || product.category.title) : ''
  const productName = getName(product.name)

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: productName,
    shortDescription: getName(product.shortDescription || product.description),
    showImage: product.showImage
      ? {
          id: product.showImage.id,
          url: normalizeToCDN(product.showImage.url),
          altText: product.showImage.alt || '',
          cropFocalPoint: getCropFocalPoint(product.showImage),
          variants: transformImageVariants(product.showImage.sizes),
        }
      : null,
    mainImage: Array.isArray(product.mainImage)
      ? product.mainImage.map((img: any) => ({
          id: img.id,
          url: normalizeToCDN(img.url),
          altText: img.alt || '',
          cropFocalPoint: getCropFocalPoint(img),
          variants: transformImageVariants(img.sizes),
        }))
      : [],
    series: product.series
      ? {
          id: typeof product.series === 'string' ? product.series : product.series.id,
          slug: typeof product.series === 'string' ? '' : product.series.slug,
          name: getName(product.series.name),
        }
      : null,
    category: product.category
      ? {
          id: typeof product.category === 'string' ? product.category : product.category.id,
          slug: typeof product.category === 'string' ? '' : product.category.slug,
          name: categoryName,
        }
      : null,
    productAttributes: (() => {
      // 这里的 attributePage 可能是被深层 populated 后的对象也可能是个 ID
      const page = product.attributePage
      if (!page || typeof page !== 'object') return []
      
      // JSON 字段可能因为配置了 localized: true 而变成了 { en: [], zh: [] } 格式
      let sourceArray = page.productAttributes
      if (sourceArray && !Array.isArray(sourceArray) && typeof sourceArray === 'object') {
        sourceArray = sourceArray[locale] || sourceArray['en'] || []
      }

      return Array.isArray(sourceArray)
        ? sourceArray
            .filter((attr: any) => attr.showOnFrontEnd !== false && attr.value)
            .map((attr: any) => attr.value)
        : []
    })(),
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface CarouselItem {
  id: string
  selectionMode: 'manual' | 'auto'
  product?: string
  productSeries?: string
  showName: boolean
  showCategory: boolean
  showDescription: boolean
  showButton: boolean
  showHighlights: boolean
  highlightsCount: number
  buttonText: string
  openInNewTab: boolean
}

/**
 * POST /api/products/carousel
 *
 * Request body:
 * {
 *   items: CarouselItem[],
 *   locale: string
 * }
 *
 * Response:
 * {
 *   products: Product[] // Products in the same order as items, with resolved auto selections
 * }
 *
 * This API handles:
 * 1. Fetching manual products by ID
 * 2. Randomly selecting products from series for auto items
 * 3. Ensuring no duplicate products across all items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, locale = 'en' } = body as { items: CarouselItem[]; locale: string }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // Track used product IDs to avoid duplicates
    const usedProductIds = new Set<string>()

    // First, collect all manual product IDs
    const manualProductIds: string[] = []
    for (const item of items) {
      if (item.selectionMode === 'manual' && item.product) {
        manualProductIds.push(item.product)
        usedProductIds.add(item.product)
      }
    }

    // Fetch manual products
    const manualProducts = new Map<string, any>()
    if (manualProductIds.length > 0) {
      const params = new URLSearchParams()
      params.append('locale', locale)
      params.append('depth', '2')
      params.append('limit', manualProductIds.length.toString())
      manualProductIds.forEach((id, index) => {
        params.append(`where[id][in][${index}]`, id)
      })

      const url = `${CMS_URL}/api/products?${params.toString()}`
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      })

      if (response.ok) {
        const data = await response.json()
        for (const product of data.docs || []) {
          manualProducts.set(product.id, product)
        }
      }
    }

    // Collect all unique series IDs for auto items
    const seriesIds = new Set<string>()
    for (const item of items) {
      if (item.selectionMode === 'auto' && item.productSeries) {
        seriesIds.add(item.productSeries)
      }
    }

    // Fetch products from each series (for auto selection)
    const seriesProducts = new Map<string, any[]>()
    for (const seriesId of seriesIds) {
      const params = new URLSearchParams()
      params.append('locale', locale)
      params.append('depth', '2')
      params.append('limit', '100') // Get enough products for random selection
      params.append('where[series][equals]', seriesId)
      params.append('where[status][equals]', 'published')

      const url = `${CMS_URL}/api/products?${params.toString()}`
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      })

      if (response.ok) {
        const data = await response.json()
        seriesProducts.set(seriesId, data.docs || [])
      } else {
        seriesProducts.set(seriesId, [])
      }
    }

    // Build the result array in order
    const result: any[] = []

    for (const item of items) {
      if (item.selectionMode === 'manual' && item.product) {
        // Manual selection - use the specific product
        const product = manualProducts.get(item.product)
        if (product) {
          result.push({
            ...transformProduct(product, locale),
            _carouselItem: {
              showName: item.showName,
              showCategory: item.showCategory,
              showDescription: item.showDescription,
              showButton: item.showButton,
              showHighlights: item.showHighlights,
              highlightsCount: item.highlightsCount,
              buttonText: item.buttonText,
              openInNewTab: item.openInNewTab,
            },
          })
        } else {
          result.push(null)
        }
      } else if (item.selectionMode === 'auto' && item.productSeries) {
        // Auto selection - randomly pick from series, avoiding duplicates
        const availableProducts = (seriesProducts.get(item.productSeries) || [])
          .filter(p => !usedProductIds.has(p.id))

        if (availableProducts.length > 0) {
          // Shuffle and pick first
          const shuffled = shuffleArray(availableProducts)
          const selectedProduct = shuffled[0]
          usedProductIds.add(selectedProduct.id)

          result.push({
            ...transformProduct(selectedProduct, locale),
            _carouselItem: {
              showName: item.showName,
              showCategory: item.showCategory,
              showDescription: item.showDescription,
              showButton: item.showButton,
              showHighlights: item.showHighlights,
              highlightsCount: item.highlightsCount,
              buttonText: item.buttonText,
              openInNewTab: item.openInNewTab,
            },
          })
        } else {
          // No available products in this series
          result.push(null)
        }
      } else {
        result.push(null)
      }
    }

    return NextResponse.json({ products: result.filter(Boolean) })
  } catch (error: any) {
    console.error('[Products Carousel API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
