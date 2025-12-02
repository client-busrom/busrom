/**
 * Series Intro GraphQL Queries
 *
 * This module provides GraphQL queries for fetching SeriesIntro data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { SeriesIntroItem, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query to fetch SeriesIntros
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Multiple records
 * - Filter: status = PUBLISHED
 * - Fields: title, description, images (tag-based random selection), productSeries relationship
 */
const GET_SERIES_INTROS = gql`
  query GetSeriesIntros {
    seriesIntros(where: { status: { equals: "PUBLISHED" } }) {
      id
      title
      description
      images
      productSeries {
        id
        slug
        name
      }
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
 * Interface for raw series intro from CMS
 */
interface RawSeriesIntro {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  images: {
    tags: string[] // MediaTag IDs
    images: string[] // Selected Media IDs (5 images)
  }
  productSeries: {
    id: string
    slug: string
    name: Record<string, string>
  } | null
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
 * Transform raw series intro to frontend format
 */
async function transformSeriesIntro(
  item: RawSeriesIntro,
  locale: string
): Promise<SeriesIntroItem | null> {
  try {
    // Extract title and description
    const title = extractLocale(item.title, locale)
    const description = extractLocale(item.description, locale)

    // Fetch all images (5 images selected by tags)
    const imageIds = item.images?.images || []
    const imagePromises = imageIds.map(id => fetchMedia(id, locale))
    const images = await Promise.all(imagePromises)

    // Filter out null images
    const validImages = images.filter((img): img is ImageObject => img !== null)

    // Get href from productSeries slug
    const href = item.productSeries?.slug
      ? `/product-series/${item.productSeries.slug}`
      : '#'

    return {
      title,
      description,
      images: validImages,
      href,
    }
  } catch (error) {
    console.error(`Error transforming series intro ${item.id}:`, error)
    return null
  }
}

/**
 * Fetch and transform SeriesIntros for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns Array of SeriesIntroItem for the specified locale
 *
 * @example
 * ```typescript
 * const seriesIntros = await getSeriesIntros('en')
 * ```
 */
export async function getSeriesIntros(
  locale: string = 'en'
): Promise<SeriesIntroItem[]> {
  try {
    // 1. Fetch series intros from CMS
    const { data } = await keystoneClient.query({
      query: GET_SERIES_INTROS,
    })

    const rawItems = (data?.seriesIntros || []) as RawSeriesIntro[]

    if (rawItems.length === 0) {
      console.warn('No published SeriesIntros found')
      return []
    }

    // 2. Transform items and fetch media data
    const transformedItems = await Promise.all(
      rawItems.map(item => transformSeriesIntro(item, locale))
    )

    // 3. Filter out null items (errors or missing data)
    const validItems = transformedItems
      .filter((item): item is SeriesIntroItem => item !== null)

    return validItems
  } catch (error) {
    console.error('Error fetching SeriesIntros:', error)
    return []
  }
}
