import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// CDN Domain configuration
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
 * Transform a media object to include CDN URLs
 */
function transformMediaObject(media: any, strategy?: string) {
  if (!media || typeof media !== 'object') return media
  if (typeof media === 'string' || typeof media === 'number') return media

  return {
    ...media,
    url: media.url ? convertToCDNUrl(media.url, strategy) : undefined,
    variants: transformImageVariants(media.sizes || media.variants, strategy),
  }
}

/**
 * Extract media ID from various formats
 */
function extractMediaId(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value.id) return String(value.id)
  return null
}

/**
 * Recursively collect all media IDs from Lexical content
 */
function collectMediaIds(node: any, ids: Set<string>): void {
  if (!node || typeof node !== 'object') return

  if (Array.isArray(node)) {
    node.forEach(item => collectMediaIds(item, ids))
    return
  }

  // 1. Check known single image fields at any level
  const knownFields = ['image', 'media', 'mediaIcon', 'backgroundImage', 'mediaMobile']
  knownFields.forEach(field => {
    const id = extractMediaId(node[field])
    if (id) ids.add(id)
  })

  // 2. Check visual.image pattern (AttributeItem)
  if (node.visual?.image) {
    const id = extractMediaId(node.visual.image)
    if (id) ids.add(id)
  }

  // 3. Check data blocks (Lexical)
  if (node.data && typeof node.data === 'object') {
    collectMediaIds(node.data, ids)
  }

  // 4. Recursive scan for all other object properties
  Object.keys(node).forEach(key => {
    // Skip already processed fields and standard non-media fields
    if (knownFields.includes(key) || key === 'data' || key === 'visual') return
    
    const value = node[key]
    if (value && typeof value === 'object') {
      collectMediaIds(value, ids)
    }
  })
}

/**
 * Batch fetch all media by IDs in parallel
 */
async function batchFetchMedia(ids: Set<string>, strategy?: string): Promise<Map<string, any>> {
  const cache = new Map<string, any>()
  if (ids.size === 0) return cache

  const fetchPromises = Array.from(ids).map(async (id) => {
    try {
      const res = await fetch(`${CMS_URL}/api/media/${id}`)
      if (res.ok) {
        const data = await res.json()
        return { id, data: transformMediaObject(data, strategy) }
      }
    } catch (err) {
      console.error(`[batchFetchMedia] Failed to fetch media ${id}:`, err)
    }
    return null
  })

  const results = await Promise.all(fetchPromises)
  results.forEach(result => {
    if (result) cache.set(result.id, result.data)
  })

  return cache
}

/**
 * Populate media references in Lexical content using pre-fetched cache
 */
function populateMediaFromCache(node: any, cache: Map<string, any>): any {
  if (!node || typeof node !== 'object') return node

  if (Array.isArray(node)) {
    return node.map(item => populateMediaFromCache(item, cache))
  }

  // Create a new object to avoid mutating original (though it's usually already a copy)
  const populated = { ...node }

  // 1. Check known single image fields
  const knownFields = ['image', 'media', 'mediaIcon', 'backgroundImage', 'mediaMobile']
  knownFields.forEach(field => {
    const id = extractMediaId(populated[field])
    if (id && cache.has(id)) {
      populated[field] = cache.get(id)
    }
  })

  // 2. Check visual.image pattern (AttributeItem)
  if (populated.visual?.image) {
    const id = extractMediaId(populated.visual.image)
    if (id && cache.has(id)) {
      populated.visual = { ...populated.visual, image: cache.get(id) }
    }
  }

  // 3. Recursive scan for all other object properties
  Object.keys(populated).forEach(key => {
    // Skip already processed fields
    if (knownFields.includes(key) || key === 'visual') return
    
    const value = populated[key]
    if (value && typeof value === 'object') {
      populated[key] = populateMediaFromCache(value, cache)
    }
  })

  return populated
}

/**
 * Expand reusableBlock nodes in Lexical content by fetching the referenced
 * reusable block and splicing its children into the parent array.
 * This runs before populateLexicalImages so expanded content gets image population.
 */
async function expandReusableBlocks(content: any, locale: string): Promise<any> {
  if (!content?.root?.children) return content

  const result = { ...content, root: { ...content.root } }
  result.root.children = await expandChildren(result.root.children, locale)
  return result
}

async function expandChildren(children: any[], locale: string): Promise<any[]> {
  const expanded: any[] = []

  for (const node of children) {
    if (!node) continue

    const isReusableBlock = node?.type === 'reusableBlock' || 
                           node?.type === 'seriesReusableBlock' || 
                           node?.type === 'productReusableBlock'

    if (isReusableBlock) {
      const blockData = node.data?.reusableBlock || node.data?.seriesReusableBlock || node.data?.productReusableBlock
      const blockId = typeof blockData === 'object' ? blockData?.id : blockData
      
      if (!blockId) {
        console.warn(`[expandChildren] Reusable block missing ID:`, node.type)
        continue
      }

      try {
        let collection = 'reusable-blocks'
        if (node.type === 'seriesReusableBlock') collection = 'series-reusable-blocks'
        if (node.type === 'productReusableBlock') collection = 'product-reusable-blocks'

        const url = `${CMS_URL}/api/${collection}/${blockId}?locale=${locale}&depth=1`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        
        let blockContent = null
        if (res.ok) {
          const block = await res.json()
          blockContent = block?.contentTranslation?.root?.children || block?.content?.root?.children
        }

        if (Array.isArray(blockContent) && blockContent.length > 0) {
          const nestedExpanded = await expandChildren(blockContent, locale)
          expanded.push(...nestedExpanded)
          continue
        } else {
          console.warn(`[expandChildren] Block ${blockId} not found or empty in collection ${collection}.`)
        }
      } catch (err) {
        console.error(`[expandReusableBlocks] Error processing block ${blockId}:`, err)
      }
      continue
    }

    // Recursively handle children of non-reusableBlock nodes
    if (Array.isArray(node?.children) && node.children.length > 0) {
      const expandedNode = { ...node, children: await expandChildren(node.children, locale) }
      expanded.push(expandedNode)
    } else {
      expanded.push(node)
    }
  }

  return expanded
}

/**
 * Populate all image references in Lexical content
 * Optimized: collects all IDs first, fetches in parallel, then populates
 */
async function populateLexicalImages(content: any, strategy?: string): Promise<{ content: any; mediaCount: number }> {
  // Step 1: Collect all media IDs
  const mediaIds = new Set<string>()
  collectMediaIds(content, mediaIds)

  console.log(`[populateLexicalImages] Found ${mediaIds.size} unique media references`)

  // Step 2: Batch fetch all media in parallel
  const mediaCache = await batchFetchMedia(mediaIds, strategy)

  // Step 3: Populate content with cached media
  const populated = populateMediaFromCache(content, mediaCache)

  return { content: populated, mediaCount: mediaCache.size }
}

/**
 * GET /api/products/[slug]
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const strategy = request.cookies.get('cdn_strategy')?.value

    console.log('[Product Detail API] Fetching product from Payload CMS:', { slug, locale, strategy })

    // 从 Payload CMS 获取单个产品
    // TODO: Re-enable status filter after setting product status to 'published' in Payload CMS
    // const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&where[status][equals]=published&limit=1&locale=${locale}&depth=3`
    const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&limit=1&locale=${locale}&depth=2`
    console.log('[Product Detail API] Request URL:', productUrl)

    const productResponse = await fetch(productUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    })

    if (!productResponse.ok) {
      console.error('[Product Detail API] Payload CMS error:', productResponse.status)
      return NextResponse.json(
        { error: 'Failed to fetch product from CMS' },
        { status: productResponse.status }
      )
    }

    const productData = await productResponse.json()

    if (!productData.docs || productData.docs.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = productData.docs[0]
    console.log('[Product Detail API] Product found:', product.id)

    // 0. Ensure we have the full product data and its associated templates
    let contentToRender = product.contentTemplate?.content || null
    let templateSource = product.contentTemplate ? 'product' : null

    // Fallback to direct content if no template found
    if (!contentToRender) {
      contentToRender = product.contentTranslation || null
    }


    const originalContentRaw = product.contentTranslation || null
    console.log(`[Product Detail API] Content source selected: ${templateSource || 'direct'}`)

    // 1. Process main content (template or direct)
    if (contentToRender) {
      console.log('[Product Detail API] Expanding reusable blocks for main content...')
      const expanded = await expandReusableBlocks(contentToRender, locale)
      const { content } = await populateLexicalImages(expanded, strategy)
      product.contentTranslation = content
    }

    // 2. Process original product content if it's different (to preserve highlights)
    let processedProductContent = null
    const hasTemplate = !!(product.contentTemplate || product.series?.seriesTemplate)
    
    if (originalContentRaw && hasTemplate) {
      console.log('[Product Detail API] Expanding reusable blocks for original content...')
      const expanded = await expandReusableBlocks(originalContentRaw, locale)
      const { content } = await populateLexicalImages(expanded, strategy)
      processedProductContent = content
    } else {
      processedProductContent = product.contentTranslation
    }

    // 3. Extract and populate media for JSON attribute fields
    const attributeFields = ['productAttributes', 'specifications', 'customAttributes']
    const attrMediaIds = new Set<string>()
    
    // Check both product and attributePage
    attributeFields.forEach(field => {
      // @ts-ignore - access by string index
      const data = product[field] || product.attributePage?.[field]
      if (data) collectMediaIds(data, attrMediaIds)
    })

    if (attrMediaIds.size > 0) {
      console.log(`[Product Detail API] Found ${attrMediaIds.size} media in JSON attributes`)
      const attrCache = await batchFetchMedia(attrMediaIds, strategy)
      
      attributeFields.forEach(field => {
        // @ts-ignore
        if (product[field]) {
          // @ts-ignore
          product[field] = populateMediaFromCache(product[field], attrCache)
        }
        if (product.attributePage?.[field]) {
          product.attributePage[field] = populateMediaFromCache(product.attributePage[field], attrCache)
        }
      })
    }

    // 获取同系列的相关产品
    let relatedProducts = []
    if (product.series?.id) {
      // TODO: Re-enable status filter after setting product status to 'published' in Payload CMS
      // const relatedUrl = `${CMS_URL}/api/products?where[series][equals]=${product.series.id}&where[id][not_equals]=${product.id}&where[status][equals]=published&limit=4&sort=order&locale=${locale}&depth=2`
      const relatedUrl = `${CMS_URL}/api/products?where[series][equals]=${product.series.id}&where[id][not_equals]=${product.id}&limit=4&sort=order&locale=${locale}&depth=2`

      try {
        const relatedResponse = await fetch(relatedUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        })

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          relatedProducts = relatedData.docs.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            slug: p.slug,
            name: p.name,
            localizedName: p.name,
            showImage: p.showImage
              ? {
                  id: p.showImage.id,
                  url: convertToCDNUrl(p.showImage.url, strategy),
                  altText: p.showImage.alt || '',
                  filename: p.showImage.filename,
                  variants: transformImageVariants(p.showImage.sizes, strategy),
                  cropFocalPoint: getCropFocalPoint(p.showImage),
                }
              : null,
            mainImage: p.mainImage && Array.isArray(p.mainImage)
              ? p.mainImage.map((img: any) => ({
                  id: img.id,
                  url: convertToCDNUrl(img.url, strategy),
                  altText: img.alt || '',
                  filename: img.filename,
                  variants: transformImageVariants(img.sizes, strategy),
                  cropFocalPoint: getCropFocalPoint(img),
                }))
              : [],
            isFeatured: p.featured || false,
          }))
          console.log('[Product Detail API] Found related products:', relatedProducts.length)
        }
      } catch (error) {
        console.error('[Product Detail API] Failed to fetch related products:', error)
      }
    }

    // Transform product data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      localizedName: product.name,
      shortDescription: product.shortDescription,
      localizedShortDescription: product.shortDescription,
      description: product.description,
      localizedDescription: product.description,
      // Content (rich text from Payload)
      content: product.contentTranslation, // Lexical rich text content
      productContent: processedProductContent, // Original product content (useful for highlights)
      contentTranslation: product.contentTranslation
        ? {
            locale,
            content: {
              document: product.contentTranslation, // Payload rich text content
            },
            productContent: processedProductContent,
          }
        : null,
      // Specifications (JSON field) - From product or linked attributePage
      specifications: product.specifications || product.attributePage?.specifications || null,
      // Images (with CDN URL transformation)
      showImage: product.showImage
        ? {
            id: product.showImage.id,
            url: convertToCDNUrl(product.showImage.url, strategy),
            altText: product.showImage.alt || '',
            filename: product.showImage.filename,
            variants: transformImageVariants(product.showImage.sizes, strategy),
            cropFocalPoint: getCropFocalPoint(product.showImage),
          }
        : null,
      mainImage: product.mainImage && Array.isArray(product.mainImage)
        ? product.mainImage.map((img: any) => ({
            id: img.id,
            url: convertToCDNUrl(img.url, strategy),
            altText: img.alt || '',
            filename: img.filename,
            variants: transformImageVariants(img.sizes, strategy),
            cropFocalPoint: getCropFocalPoint(img),
          }))
        : [],
      // Series
      series: product.series
        ? {
            id: product.series.id,
            slug: product.series.slug,
            name: product.series.name,
            localizedName: product.series.name,
            description: product.series.description,
            localizedDescription: product.series.description,
          }
        : null,
      // Metadata
      isFeatured: product.featured || false,
      order: product.order || 0,
      status: product.status === 'published' ? 'PUBLISHED' : 'DRAFT',
      productAttributes: product.productAttributes || product.attributePage?.productAttributes || null,
      customAttributes: product.customAttributes || product.attributePage?.customAttributes || null,
      linkedForm: product.linkedForm || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Related products
      relatedProducts,
    }

    return NextResponse.json(transformedProduct)
  } catch (error: any) {
    console.error('[Product Detail API] Error:', error)
    console.error('[Product Detail API] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
