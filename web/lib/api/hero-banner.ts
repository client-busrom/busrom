/**
 * Hero Banner GraphQL Queries
 *
 * This module provides GraphQL queries for fetching HeroBannerItem data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { HeroBannerItem, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query to fetch HeroBannerItems
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Filter: status = PUBLISHED, enabled = true
 * - Order by: order ASC
 * - Fields: title, feature1-5, image1-4
 */
const GET_HERO_BANNER_ITEMS = gql`
  query GetHeroBannerItems {
    heroBannerItems(
      where: {
        status: { equals: "PUBLISHED" }
        enabled: { equals: true }
      }
      orderBy: { order: asc }
    ) {
      id
      title
      feature1
      feature2
      feature3
      feature4
      feature5
      image1
      image2
      image3
      image4
      order
    }
  }
`

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
      altText
    }
  }
`

/**
 * Interface for raw hero banner item from CMS
 */
interface RawHeroBannerItem {
  id: string
  title: Record<string, string> // { en: "...", zh: "..." }
  feature1: Record<string, string>
  feature2: Record<string, string>
  feature3: Record<string, string>
  feature4: Record<string, string>
  feature5: Record<string, string>
  image1: string // Media ID
  image2: string // Media ID
  image3: string // Media ID
  image4: string // Media ID
  order: number
}

/**
 * Extract locale value from multilingual field
 */
function extractLocale(
  field: Record<string, string> | null | undefined,
  locale: string,
  fallback: string = 'en'
): string {
  if (!field) return ''
  return field[locale] || field[fallback] || ''
}

/**
 * Fetch media information by ID
 */
async function fetchMedia(mediaId: string, locale: string): Promise<ImageObject | null> {
  if (!mediaId) return null

  try {
    const { data } = await keystoneClient.query({
      query: GET_MEDIA,
      variables: { id: mediaId },
    })

    const media = data?.media
    if (!media) return null

    // Extract alt text from multilingual field
    const altText = extractLocale(media.altText, locale) || media.filename || ''

    return {
      url: media.variants?.large || media.variants?.medium || media.file?.url || '',
      altText,
      thumbnailUrl: media.variants?.thumbnail || media.file?.url || '',
      variants: media.variants || undefined,
    }
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

/**
 * Transform raw hero banner item to frontend format
 */
async function transformHeroBannerItem(
  item: RawHeroBannerItem,
  locale: string
): Promise<HeroBannerItem | null> {
  try {
    // Extract title and features for the specified locale
    const title = extractLocale(item.title, locale)
    const features = [
      extractLocale(item.feature1, locale),
      extractLocale(item.feature2, locale),
      extractLocale(item.feature3, locale),
      extractLocale(item.feature4, locale),
      extractLocale(item.feature5, locale),
    ]

    // Fetch all 4 images
    const imagePromises = [
      fetchMedia(item.image1, locale),
      fetchMedia(item.image2, locale),
      fetchMedia(item.image3, locale),
      fetchMedia(item.image4, locale),
    ]

    const images = await Promise.all(imagePromises)

    // Validate that all images are present
    if (images.some(img => img === null)) {
      console.warn(`Missing images for hero banner item ${item.id}`)
      return null
    }

    return {
      title,
      features,
      images: images as ImageObject[], // We validated all are non-null
    }
  } catch (error) {
    console.error(`Error transforming hero banner item ${item.id}:`, error)
    return null
  }
}

/**
 * Fetch and transform HeroBannerItems for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns Array of HeroBannerItem for the specified locale (max 9 items)
 *
 * @example
 * ```typescript
 * const heroBannerItems = await getHeroBannerItems('en')
 * ```
 */
export async function getHeroBannerItems(
  locale: string = 'en'
): Promise<HeroBannerItem[]> {
  try {
    // 1. Fetch hero banner items from CMS
    const { data } = await keystoneClient.query({
      query: GET_HERO_BANNER_ITEMS,
    })

    const rawItems = (data?.heroBannerItems || []) as RawHeroBannerItem[]

    if (rawItems.length === 0) {
      console.warn('No published HeroBannerItems found')
      return []
    }

    // 2. Transform items and fetch media data
    const transformedItems = await Promise.all(
      rawItems.map(item => transformHeroBannerItem(item, locale))
    )

    // 3. Filter out null items (missing images or errors)
    const validItems = transformedItems
      .filter((item): item is HeroBannerItem => item !== null)

    return validItems
  } catch (error) {
    console.error('Error fetching HeroBannerItems:', error)
    return []
  }
}
