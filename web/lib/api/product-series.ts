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

    // Resolve media if content exists
    if (transformedSeries.contentTranslation) {
      const normalize = (url: string) => {
        if (!url) return ''
        return url.startsWith('http') ? convertToCDNUrl(url) : convertToCDNUrl(`${PAYLOAD_URL}${url.startsWith('/') ? '' : '/'}${url}`)
      }
      const { mediaData } = await resolveAllMedia(transformedSeries.contentTranslation, PAYLOAD_URL, normalize)
      return { ...transformedSeries, mediaData }
    }

    return transformedSeries
  } catch (error) {
    console.error('[ProductSeries API] Exception:', error)
    return null
  }
}
