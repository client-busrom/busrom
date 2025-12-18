/**
 * Simple CTA GraphQL Queries
 *
 * This module provides GraphQL queries for fetching SimpleCta data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { SimpleCtaData, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query to fetch SimpleCta
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Singleton configuration
 * - Fields: title, title2, subtitle, description, buttonText, 3 images
 */
const GET_SIMPLE_CTA = gql`
  query GetSimpleCta {
    simpleCta {
      title
      title2
      subtitle
      description
      buttonText
      image1
      image2
      image3
      status
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
 * Interface for raw simple CTA from CMS
 */
interface RawSimpleCta {
  title: Record<string, string>
  title2: Record<string, string>
  subtitle: Record<string, string>
  description: Record<string, string>
  buttonText: Record<string, string>
  image1: string // Media ID
  image2: string // Media ID
  image3: string // Media ID
  status: string
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
 * Fetch and transform SimpleCta for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns SimpleCtaData for the specified locale
 *
 * @example
 * ```typescript
 * const simpleCta = await getSimpleCta('en')
 * ```
 */
export async function getSimpleCta(
  locale: string = 'en'
): Promise<SimpleCtaData> {
  try {
    // 1. Fetch simple CTA from CMS
    const { data } = await keystoneClient.query({
      query: GET_SIMPLE_CTA,
    })

    const cta = data?.simpleCta as RawSimpleCta | undefined

    if (!cta) {
      console.warn('No SimpleCta found')
      return {
        title: '',
        title2: '',
        subtitle: '',
        description: '',
        ctaText: '',
        images: [],
      }
    }

    // 2. Check if CTA is published
    if (cta.status !== 'PUBLISHED') {
      console.warn('SimpleCta is not published')
      return {
        title: '',
        title2: '',
        subtitle: '',
        description: '',
        ctaText: '',
        images: [],
      }
    }

    // 3. Extract text fields for the specified locale
    const title = extractLocale(cta.title, locale)
    const title2 = extractLocale(cta.title2, locale)
    const subtitle = extractLocale(cta.subtitle, locale)
    const description = extractLocale(cta.description, locale)
    const buttonText = extractLocale(cta.buttonText, locale)

    // 4. Fetch all 3 images
    const imagePromises = [
      fetchMedia(cta.image1, locale),
      fetchMedia(cta.image2, locale),
      fetchMedia(cta.image3, locale),
    ]

    const images = await Promise.all(imagePromises)

    // Filter out null images (in case some are missing)
    const validImages = images.filter((img): img is ImageObject => img !== null)

    return {
      title,
      title2,
      subtitle,
      description,
      ctaText: buttonText,
      images: validImages,
    }
  } catch (error) {
    console.error('Error fetching SimpleCta:', error)
    return {
      title: '',
      title2: '',
      subtitle: '',
      description: '',
      ctaText: '',
      images: [],
    }
  }
}
