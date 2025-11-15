/**
 * Product Series Carousel GraphQL Queries
 *
 * This module provides GraphQL queries for fetching ProductSeriesCarousel data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { ProductSeriesItem } from '@/lib/content-data'

/**
 * GraphQL Query to fetch ProductSeriesCarousel data
 *
 * The CMS stores carousel items in a multilingual structure:
 * {
 *   en: [{ isShow, title, image, sceneImage, buttonText, linkUrl }, ...],
 *   zh: [{ isShow, title, image, sceneImage, buttonText, linkUrl }, ...],
 *   ...
 * }
 */
const GET_PRODUCT_SERIES_CAROUSEL = gql`
  query GetProductSeriesCarousel {
    productSeriesCarousels {
      items
      autoPlay
      autoPlaySpeed
      status
    }
  }
`

/**
 * Interface for the raw carousel item from CMS
 */
interface RawCarouselItem {
  isShow: boolean
  title: string
  image: string // Media ID
  sceneImage: string // Media ID
  buttonText: string
  linkUrl: string
}

/**
 * Interface for the raw carousel data from CMS
 */
interface RawCarouselData {
  items: Record<string, RawCarouselItem[]>
  autoPlay: boolean
  autoPlaySpeed: number
  status: 'ACTIVE' | 'INACTIVE'
}

/**
 * GraphQL Query to fetch Media by ID
 */
const GET_MEDIA = gql`
  query GetMedia($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file {
        url
      }
      variants
    }
  }
`

/**
 * Fetch media information by ID
 */
async function fetchMedia(mediaId: string) {
  if (!mediaId) return null

  try {
    const { data } = await keystoneClient.query({
      query: GET_MEDIA,
      variables: { id: mediaId },
    })

    const media = data?.media
    if (!media) return null

    return {
      url: media.variants?.medium || media.file?.url || '',
      altText: media.filename || '',
      thumbnailUrl: media.variants?.thumbnail || media.file?.url || '',
    }
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

/**
 * Transform raw carousel item to frontend format
 */
async function transformCarouselItem(
  item: RawCarouselItem,
  index: number,
  locale: string
): Promise<ProductSeriesItem | null> {
  if (!item.isShow) return null // Skip hidden items

  // Fetch image data
  const image = await fetchMedia(item.image)
  if (!image) {
    console.warn(`Missing image for carousel item at index ${index}`)
    return null
  }

  return {
    key: `${locale}-carousel-${index}`,
    order: index,
    name: item.title,
    image: image,
    href: item.linkUrl || '#',
  }
}

/**
 * Fetch and transform ProductSeriesCarousel data for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns Array of ProductSeriesItem for the specified locale
 *
 * @example
 * ```typescript
 * const carouselItems = await getProductSeriesCarousel('en')
 * ```
 */
export async function getProductSeriesCarousel(
  locale: string = 'en'
): Promise<ProductSeriesItem[]> {
  try {
    // 1. Fetch carousel data from CMS
    const { data } = await keystoneClient.query({
      query: GET_PRODUCT_SERIES_CAROUSEL,
    })

    const carouselData = data?.productSeriesCarousels?.[0] as RawCarouselData | undefined

    if (!carouselData) {
      console.warn('No ProductSeriesCarousel data found')
      return []
    }

    // 2. Check if carousel is active
    if (carouselData.status !== 'ACTIVE') {
      console.warn('ProductSeriesCarousel is not active')
      return []
    }

    // 3. Get items for the specified locale
    const localeItems = carouselData.items?.[locale] || []

    if (localeItems.length === 0) {
      console.warn(`No carousel items found for locale: ${locale}`)
      return []
    }

    // 4. Transform items and fetch media data
    const transformedItems = await Promise.all(
      localeItems.map((item, index) => transformCarouselItem(item, index, locale))
    )

    // 5. Filter out null items (hidden or missing images) and sort by order
    const validItems = transformedItems
      .filter((item): item is ProductSeriesItem => item !== null)
      .sort((a, b) => a.order - b.order)

    return validItems
  } catch (error) {
    console.error('Error fetching ProductSeriesCarousel:', error)
    return []
  }
}

/**
 * Fetch ProductSeriesCarousel configuration
 *
 * @returns Carousel configuration (autoPlay, autoPlaySpeed)
 *
 * @example
 * ```typescript
 * const config = await getCarouselConfig()
 * // { autoPlay: true, autoPlaySpeed: 5000 }
 * ```
 */
export async function getCarouselConfig(): Promise<{
  autoPlay: boolean
  autoPlaySpeed: number
}> {
  try {
    const { data } = await keystoneClient.query({
      query: GET_PRODUCT_SERIES_CAROUSEL,
    })

    const carouselData = data?.productSeriesCarousels?.[0] as RawCarouselData | undefined

    return {
      autoPlay: carouselData?.autoPlay ?? true,
      autoPlaySpeed: carouselData?.autoPlaySpeed ?? 5000,
    }
  } catch (error) {
    console.error('Error fetching carousel config:', error)
    return {
      autoPlay: true,
      autoPlaySpeed: 5000,
    }
  }
}
