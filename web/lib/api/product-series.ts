import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia } from "@/lib/media-resolver"

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002')

/**
 * Fetch product series by slug (Server-side)
 */
export async function getProductSeriesBySlug(slug: string, locale: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/product-series?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('[ProductSeries API] Error:', response.status)
      return null
    }

    const data = await response.json()
    const items = data?.docs || []

    if (items.length === 0) return null

    const series = items[0]

    // Get featured image URL
    const getFeaturedImageUrl = (featuredImage: any): string => {
      if (!featuredImage) return ''
      if (typeof featuredImage === 'string') return featuredImage
      const url = featuredImage.url || featuredImage.sizes?.large?.url || ''
      return url ? convertToCDNUrl(url) : ''
    }

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
      contentTranslation: series.seriesTemplate?.content || series.contentTranslation || null,
      locale,
    }

    // Resolve media and reusable blocks if content exists
    if (transformedSeries.contentTranslation) {
      const normalize = (url: string) => {
        if (!url) return ''
        return url.startsWith('http') ? convertToCDNUrl(url) : convertToCDNUrl(`${PAYLOAD_URL}${url.startsWith('/') ? '' : '/'}${url}`)
      }

      // 1. Scan for reusable block IDs
      const reusableBlockIds = new Set<string>()
      const scanForBlocks = (nodes: any[]) => {
        if (!nodes || !Array.isArray(nodes)) return
        nodes.forEach(node => {
          if (node.type === 'reusableBlock' || node.type === 'seriesReusableBlock' || node.type === 'productReusableBlock') {
            const blockType = node.type
            const blockRef = node.data?.[blockType]
            const id = typeof blockRef === 'object' && blockRef !== null ? blockRef.id : blockRef
            if (id) reusableBlockIds.add(String(id))
          }
          if (node.children) scanForBlocks(node.children)
        })
      }
      
      const contentNodes = transformedSeries.contentTranslation?.root?.children || []
      scanForBlocks(contentNodes)

      // 2. Fetch reusable blocks in parallel
      const reusableBlocks: Record<string, any> = {}
      if (reusableBlockIds.size > 0) {
        const blockPromises = Array.from(reusableBlockIds).map(async (id) => {
          try {
            const res = await fetch(`${PAYLOAD_URL}/api/reusable-blocks/${id}?locale=${locale}&depth=2`, { next: { revalidate: 3600 } })
            if (res.ok) {
              const blockData = await res.json()
              reusableBlocks[id] = blockData.content || blockData.contentTranslation
            }
          } catch (e) {
            console.error(`[ProductSeries API] Error fetching reusable block ${id}:`, e)
          }
        })
        await Promise.all(blockPromises)
      }

      // 3. Resolve all media (main content + reusable blocks)
      const allContentToScan = [transformedSeries.contentTranslation, ...Object.values(reusableBlocks)]
      const { mediaData } = await resolveAllMedia(allContentToScan, PAYLOAD_URL, normalize)
      
      return { ...transformedSeries, mediaData, reusableBlocks }
    }

    return transformedSeries
  } catch (error) {
    console.error('[ProductSeries API] Exception:', error)
    return null
  }
}
