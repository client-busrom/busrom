import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

// CDN Domain configuration
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || 'http://localhost:8080'

/**
 * Normalize image URL to use CDN domain
 * Converts MinIO URLs (localhost:9000) to CDN URLs (localhost:8080)
 */
function normalizeToCDN(url: string): string {
  if (!url) return url

  // Already using CDN domain
  if (url.includes(CDN_DOMAIN) || url.includes('cloudfront.net')) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // MinIO URL: http://localhost:9000/busrom-media/...
    if (url.includes('localhost:9000')) {
      return `${CDN_DOMAIN}${urlObj.pathname}`
    }

    // S3 URL: https://xxx.s3.amazonaws.com/bucket/...
    if (urlObj.hostname.includes('amazonaws.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length > 1) {
        pathParts.shift() // Remove bucket name
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
 * Transform a media object to include CDN URLs
 */
function transformMediaObject(media: any) {
  if (!media || typeof media !== 'object') return media
  if (typeof media === 'string' || typeof media === 'number') return media

  return {
    ...media,
    url: media.url ? normalizeToCDN(media.url) : undefined,
    variants: transformImageVariants(media.sizes || media.variants),
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

  // Check data fields for media references
  if (node.data && typeof node.data === 'object') {
    const data = node.data

    // Single image fields
    const singleFields = ['image', 'mediaIcon', 'backgroundImage']
    singleFields.forEach(field => {
      const id = extractMediaId(data[field])
      if (id) ids.add(id)
    })

    // Array fields with image/media
    if (Array.isArray(data.images)) {
      data.images.forEach((item: any) => {
        const id = extractMediaId(item?.image)
        if (id) ids.add(id)
      })
    }

    if (Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        const mediaId = extractMediaId(item?.media)
        const iconId = extractMediaId(item?.mediaIcon)
        if (mediaId) ids.add(mediaId)
        if (iconId) ids.add(iconId)
      })
    }

    if (Array.isArray(data.slides)) {
      data.slides.forEach((slide: any) => {
        const id = extractMediaId(slide?.image)
        if (id) ids.add(id)
      })
    }
  }

  // Recursively process nested structures
  if (node.root) collectMediaIds(node.root, ids)
  if (node.children) collectMediaIds(node.children, ids)
  if (node.fields) {
    Object.values(node.fields).forEach(value => collectMediaIds(value, ids))
  }
}

/**
 * Batch fetch all media by IDs in parallel
 */
async function batchFetchMedia(ids: Set<string>): Promise<Map<string, any>> {
  const cache = new Map<string, any>()
  if (ids.size === 0) return cache

  const fetchPromises = Array.from(ids).map(async (id) => {
    try {
      const res = await fetch(`${CMS_URL}/api/media/${id}`)
      if (res.ok) {
        const data = await res.json()
        return { id, data: transformMediaObject(data) }
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

  const populated = { ...node }

  if (populated.data && typeof populated.data === 'object') {
    populated.data = { ...populated.data }

    // Single image fields
    const singleFields = ['image', 'mediaIcon', 'backgroundImage']
    singleFields.forEach(field => {
      const id = extractMediaId(populated.data[field])
      if (id && cache.has(id)) {
        populated.data[field] = cache.get(id)
      }
    })

    // Images array
    if (Array.isArray(populated.data.images)) {
      populated.data.images = populated.data.images.map((item: any) => {
        if (!item || typeof item !== 'object') return item
        const id = extractMediaId(item.image)
        return id && cache.has(id) ? { ...item, image: cache.get(id) } : item
      })
    }

    // Items array (carousel/marquee)
    if (Array.isArray(populated.data.items)) {
      populated.data.items = populated.data.items.map((item: any) => {
        if (!item || typeof item !== 'object') return item
        const result = { ...item }
        const mediaId = extractMediaId(item.media)
        const iconId = extractMediaId(item.mediaIcon)
        if (mediaId && cache.has(mediaId)) result.media = cache.get(mediaId)
        if (iconId && cache.has(iconId)) result.mediaIcon = cache.get(iconId)
        return result
      })
    }

    // Slides array
    if (Array.isArray(populated.data.slides)) {
      populated.data.slides = populated.data.slides.map((slide: any) => {
        if (!slide || typeof slide !== 'object') return slide
        const id = extractMediaId(slide.image)
        return id && cache.has(id) ? { ...slide, image: cache.get(id) } : slide
      })
    }
  }

  // Recursively process nested structures
  if (populated.root) {
    populated.root = populateMediaFromCache(populated.root, cache)
  }
  if (populated.children) {
    populated.children = populateMediaFromCache(populated.children, cache)
  }
  if (populated.fields) {
    populated.fields = { ...populated.fields }
    for (const [key, value] of Object.entries(populated.fields)) {
      if (value && typeof value === 'object') {
        populated.fields[key] = populateMediaFromCache(value, cache)
      }
    }
  }

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
    if (node?.type === 'reusableBlock') {
      const blockData = node.data?.reusableBlock
      const blockId = typeof blockData === 'object' ? blockData?.id : blockData
      if (!blockId) continue

      try {
        const res = await fetch(
          `${CMS_URL}/api/reusable-blocks/${blockId}?locale=${locale}&depth=1`
        )
        if (res.ok) {
          const block = await res.json()
          const blockChildren = block?.contentTranslation?.root?.children
          if (Array.isArray(blockChildren) && blockChildren.length > 0) {
            // Recursively expand in case of nested reusableBlocks
            const nestedExpanded = await expandChildren(blockChildren, locale)
            expanded.push(...nestedExpanded)
            continue
          }
        }
      } catch (err) {
        console.error(`[expandReusableBlocks] Failed to fetch reusable block ${blockId}:`, err)
      }
      // If fetch failed or no content, skip the node
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
async function populateLexicalImages(content: any): Promise<{ content: any; mediaCount: number }> {
  // Step 1: Collect all media IDs
  const mediaIds = new Set<string>()
  collectMediaIds(content, mediaIds)

  console.log(`[populateLexicalImages] Found ${mediaIds.size} unique media references`)

  // Step 2: Batch fetch all media in parallel
  const mediaCache = await batchFetchMedia(mediaIds)

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

    console.log('[Product Detail API] Fetching product from Payload CMS:', { slug, locale })

    // 从 Payload CMS 获取单个产品
    // TODO: Re-enable status filter after setting product status to 'published' in Payload CMS
    // const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&where[status][equals]=published&limit=1&locale=${locale}&depth=3`
    const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&limit=1&locale=${locale}&depth=3`
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

    // Expand reusableBlock nodes, then populate image references
    if (product.contentTranslation) {
      console.log('[Product Detail API] Expanding reusable blocks...')
      product.contentTranslation = await expandReusableBlocks(product.contentTranslation, locale)

      console.log('[Product Detail API] Populating Lexical images...')
      const { content, mediaCount } = await populateLexicalImages(product.contentTranslation)
      product.contentTranslation = content
      console.log('[Product Detail API] Populated', mediaCount, 'unique images')
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
                  url: normalizeToCDN(p.showImage.url),
                  altText: p.showImage.alt || '',
                  filename: p.showImage.filename,
                  variants: transformImageVariants(p.showImage.sizes),
                  cropFocalPoint: getCropFocalPoint(p.showImage),
                }
              : null,
            mainImage: p.mainImage && Array.isArray(p.mainImage)
              ? p.mainImage.map((img: any) => ({
                  id: img.id,
                  url: normalizeToCDN(img.url),
                  altText: img.alt || '',
                  filename: img.filename,
                  variants: transformImageVariants(img.sizes),
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
      contentTranslation: product.contentTranslation
        ? {
            locale,
            content: {
              document: product.contentTranslation, // Payload rich text content
            },
          }
        : null,
      // Specifications (JSON field)
      specifications: product.specifications || null,
      // Images (with CDN URL transformation)
      showImage: product.showImage
        ? {
            id: product.showImage.id,
            url: normalizeToCDN(product.showImage.url),
            altText: product.showImage.alt || '',
            filename: product.showImage.filename,
            variants: transformImageVariants(product.showImage.sizes),
            cropFocalPoint: getCropFocalPoint(product.showImage),
          }
        : null,
      mainImage: product.mainImage && Array.isArray(product.mainImage)
        ? product.mainImage.map((img: any) => ({
            id: img.id,
            url: normalizeToCDN(img.url),
            altText: img.alt || '',
            filename: img.filename,
            variants: transformImageVariants(img.sizes),
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
