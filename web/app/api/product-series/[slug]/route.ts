import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

/**
 * Extract all reusable block IDs from contentTranslation
 */
function extractReusableBlockIds(content: any): string[] {
  const ids = new Set<string>()

  function traverse(node: any) {
    if (!node) return

    // Check for reusableBlock nodes
    // Structure: { type: 'reusableBlock', data: { reusableBlock: { id: '2' } } }
    if (node.type === 'reusableBlock' && node.data?.reusableBlock) {
      const blockRef = node.data.reusableBlock
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
 * Fetch reusable blocks and return a map of id -> contentTranslation
 */
async function fetchReusableBlocks(ids: string[]): Promise<Map<string, any>> {
  const blockMap = new Map<string, any>()

  if (ids.length === 0) return blockMap

  const promises = ids.map(async (id) => {
    try {
      const res = await fetch(`${CMS_URL}/api/reusable-blocks/${id}?depth=2`, {
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.contentTranslation) {
          blockMap.set(id, data.contentTranslation)
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
 * Extract all media IDs from contentTranslation (including reusable block content)
 */
function extractMediaIds(content: any, reusableBlockMap: Map<string, any> = new Map()): string[] {
  const ids = new Set<string>()

  function traverse(node: any) {
    if (!node) return

    // Check for image gallery
    if (node.type === 'custom-image-gallery' && node.data?.images) {
      for (const img of node.data.images) {
        if (img.image) ids.add(String(img.image))
      }
    }

    // Check for carousel
    if (node.type === 'carousel' && node.data?.slides) {
      for (const slide of node.data.slides) {
        if (slide.image?.id) ids.add(String(slide.image.id))
      }
    }

    // Check for singleImage nodes
    if (node.type === 'singleImage' && node.data?.image?.id) {
      ids.add(String(node.data.image.id))
    }

    // Check for upload nodes (direct media references)
    if (node.type === 'upload' && node.value?.id) {
      ids.add(String(node.value.id))
    }

    // Check for block nodes (sidebar, etc.)
    if (node.type === 'block' && node.fields) {
      // Traverse mainContent
      if (node.fields.mainContent?.root) {
        traverse(node.fields.mainContent.root)
      }
      // Traverse sidebarContent
      if (node.fields.sidebarContent?.root) {
        traverse(node.fields.sidebarContent.root)
      }
    }

    // Check for reusableBlock - traverse the fetched content
    if (node.type === 'reusableBlock' && node.data?.reusableBlock) {
      const blockRef = node.data.reusableBlock
      // Handle both { id: '2' } and direct string '2'
      const blockId = typeof blockRef === 'object' ? blockRef.id : blockRef
      if (blockId) {
        const blockContent = reusableBlockMap.get(String(blockId))
        if (blockContent) {
          traverse(blockContent)
        }
      }
    }

    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }

    // Check root
    if (node.root) {
      traverse(node.root)
    }
  }

  traverse(content)
  return Array.from(ids)
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

    // Extract and fetch reusable blocks from contentTranslation
    const contentTranslation = series.contentTranslation || null
    const reusableBlockIds = extractReusableBlockIds(contentTranslation)
    const reusableBlockMap = await fetchReusableBlocks(reusableBlockIds)

    // Extract and fetch media URLs from contentTranslation (including reusable block content)
    const mediaIds = extractMediaIds(contentTranslation, reusableBlockMap)
    const mediaMap = await fetchMediaUrls(mediaIds)

    // Convert mediaMap to object for JSON serialization
    const mediaUrls: Record<string, string> = {}
    mediaMap.forEach((url, id) => {
      mediaUrls[id] = url
    })

    // Convert reusableBlockMap to object for JSON serialization
    const reusableBlocks: Record<string, any> = {}
    reusableBlockMap.forEach((content, id) => {
      reusableBlocks[id] = content
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
      contentTranslation,
      mediaUrls, // Media ID -> CDN URL mapping
      reusableBlocks, // Reusable block ID -> contentTranslation mapping
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
