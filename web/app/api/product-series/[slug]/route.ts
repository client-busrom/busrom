import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

/**
 * Extract all reusable block IDs from Lexical content
 */
function extractReusableBlockIds(content: any): string[] {
  const ids = new Set<string>()

  function traverse(node: any) {
    if (!node) return

    // Check for various reusable block types
    const isReusableBlock = node.type === 'reusableBlock' || 
                           node.type === 'seriesReusableBlock' || 
                           node.type === 'productReusableBlock'

    if (isReusableBlock) {
      const blockRef = node.data?.reusableBlock || node.data?.seriesReusableBlock || node.data?.productReusableBlock
      // Handle both { id: '2' } and direct string '2'
      const blockId = typeof blockRef === 'object' ? blockRef.id : blockRef
      if (blockId) {
        ids.add(String(blockId))
      }
    }

    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }

    if (node.root) {
      traverse(node.root)
    }
  }

  traverse(content)
  return Array.from(ids)
}

/**
 * Fetch reusable blocks and return a map of id -> content
 */
async function fetchReusableBlocks(ids: string[]): Promise<Map<string, any>> {
  const blockMap = new Map<string, any>()

  if (ids.length === 0) return blockMap

  const promises = ids.map(async (id) => {
    try {
      // Try series blocks first, then product, then general
      const collections = ['series-reusable-blocks', 'product-reusable-blocks', 'reusable-blocks']
      for (const col of collections) {
        const res = await fetch(`${CMS_URL}/api/${col}/${id}?depth=2`, {
          next: { revalidate: 3600 },
        })
        if (res.ok) {
          const data = await res.json()
          // Reusable blocks use contentTranslation or content
          const content = data.contentTranslation || data.content
          if (content) {
            blockMap.set(id, content)
            break
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch reusable block ${id}:`, e)
    }
  })
  await Promise.all(promises)

  return blockMap
}

/**
 * Transform image variants to use CDN URLs and standard keys
 * Maps Payload keys (card, tablet, desktop) to standard keys (small, medium, large)
 */
function transformImageVariants(variants: any) {
  if (!variants) return null

  const transformed: any = {}
  
  // Mapping for Payload CMS size keys to our internal standard keys
  const sizeMap: Record<string, string> = {
    card: 'small',
    tablet: 'medium',
    desktop: 'large',
    thumbnail: 'thumbnail',
  }

  for (const [key, value] of Object.entries(variants)) {
    const targetKey = sizeMap[key] || key
    
    if (value && typeof value === 'object' && 'url' in value) {
      transformed[targetKey] = {
        ...value,
        url: convertToCDNUrl((value as any).url)
      }
      // Also keep original key for compatibility
      if (targetKey !== key) transformed[key] = transformed[targetKey]
    } else if (typeof value === 'string') {
      transformed[targetKey] = convertToCDNUrl(value)
      if (targetKey !== key) transformed[key] = transformed[targetKey]
    } else {
      transformed[targetKey] = value
    }
  }
  return transformed
}

/**
 * Transform a media object to include CDN URLs
 */
function transformMediaObject(media: any) {
  if (!media || typeof media !== 'object') return media
  if (typeof media === 'string' || typeof media === 'number') return media

  return {
    ...media,
    url: media.url ? convertToCDNUrl(media.url) : undefined,
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

  // Also check fields for nested blocks / JSON attributes
  if (node.fields && typeof node.fields === 'object') {
    Object.values(node.fields).forEach(val => collectMediaIds(val, ids))
  }

  // Recursively process nested structures
  if (node.root) collectMediaIds(node.root, ids)
  if (node.children) collectMediaIds(node.children, ids)
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
 * Expand reusable block nodes in Lexical content
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
          console.warn(`[expandChildren] Block ${blockId} not found or empty in all collections.`)
        }
      } catch (err) {
        console.error(`[expandReusableBlocks] Error processing block ${blockId}:`, err)
      }
      continue
    }

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
 * Fetch media URLs in batch
 */
async function fetchMediaUrls(ids: string[]): Promise<Map<string, string>> {
  const mediaMap = new Map<string, string>()

  if (ids.length === 0) return mediaMap

  // Fetch media in parallel (batch of 10)
  const batchSize = 10
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const promises = batch.map(async (id) => {
      try {
        const res = await fetch(`${CMS_URL}/api/media/${id}`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })
        if (res.ok) {
          const data = await res.json()
          if (data.url) {
            mediaMap.set(id, convertToCDNUrl(data.url))
          }
        }
      } catch (e) {
        console.error(`Failed to fetch media ${id}:`, e)
      }
    })
    await Promise.all(promises)
  }

  return mediaMap
}

/**
 * GET /api/product-series/[slug]
 *
 * Fetch product series by slug from Payload CMS
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const { slug } = await params

    // Fetch from Payload CMS REST API
    const response = await fetch(
      `${CMS_URL}/api/product-series?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Payload API Error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch product series' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const seriesItems = data?.docs || []

    if (seriesItems.length === 0) {
      return NextResponse.json({ error: 'Product series not found' }, { status: 404 })
    }

    const series = seriesItems[0]

    // Get featured image URL
    const getFeaturedImageUrl = (featuredImage: any): string => {
      if (!featuredImage) return ''
      if (typeof featuredImage === 'string') return featuredImage
      const url = featuredImage.url || featuredImage.sizes?.large?.url || ''
      return url ? convertToCDNUrl(url) : ''
    }

    // CONTENT REDIRECT: Use seriesTemplate content if available
    const contentTranslationRaw = series.seriesTemplate?.content || series.contentTranslation || null
    
    // 1. Expand reusable blocks into a flat list of nodes
    const expandedContent = contentTranslationRaw ? await expandReusableBlocks(contentTranslationRaw, locale) : null

    // 2. Extract and fetch media data from expanded content
    const mediaIds = new Set<string>()
    if (expandedContent) {
      collectMediaIds(expandedContent, mediaIds)
    }
    const mediaMap = await batchFetchMedia(mediaIds)

    // Convert mediaMap to object for JSON serialization
    const mediaData: Record<string, any> = {}
    mediaMap.forEach((data, id) => {
      mediaData[id] = data
    })

    // Transform series data
    const transformedSeries = {
      id: series.id,
      slug: series.slug,
      name: series.name || '',
      description: series.description || '',
      featuredImage: getFeaturedImageUrl(series.featuredImage),
      order: series.order || 0,
      status: series.status,
      isFeatured: series.isFeatured || false,
      contentTranslation: expandedContent,
      mediaData, // Full Media objects including variants
      reusableBlocks: {}, // Already expanded at API level
      locale,
    }

    return NextResponse.json(transformedSeries)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
