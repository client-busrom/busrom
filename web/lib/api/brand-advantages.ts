/**
 * Brand Advantages GraphQL Queries
 *
 * This module provides GraphQL queries for fetching BrandAdvantages data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { BrandAdvantagesData, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query to fetch BrandAdvantages
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Singleton configuration
 * - 9 advantages with lucide-react icon names
 * - 1 main image
 */
const GET_BRAND_ADVANTAGES = gql`
  query GetBrandAdvantages {
    brandAdvantagesConfigs {
      advantage1
      icon1
      advantage2
      icon2
      advantage3
      icon3
      advantage4
      icon4
      advantage5
      icon5
      advantage6
      icon6
      advantage7
      icon7
      advantage8
      icon8
      advantage9
      icon9
      image
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
 * Interface for raw brand advantages from CMS
 */
interface RawBrandAdvantages {
  advantage1: Record<string, string>
  icon1: string
  advantage2: Record<string, string>
  icon2: string
  advantage3: Record<string, string>
  icon3: string
  advantage4: Record<string, string>
  icon4: string
  advantage5: Record<string, string>
  icon5: string
  advantage6: Record<string, string>
  icon6: string
  advantage7: Record<string, string>
  icon7: string
  advantage8: Record<string, string>
  icon8: string
  advantage9: Record<string, string>
  icon9: string
  image: string // Media ID
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
 * Fetch and transform BrandAdvantages for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns BrandAdvantagesData for the specified locale
 *
 * @example
 * ```typescript
 * const brandAdvantages = await getBrandAdvantages('en')
 * ```
 */
export async function getBrandAdvantages(
  locale: string = 'en'
): Promise<BrandAdvantagesData> {
  try {
    // 1. Fetch brand advantages from CMS
    const { data } = await keystoneClient.query({
      query: GET_BRAND_ADVANTAGES,
    })

    const config = data?.brandAdvantagesConfigs?.[0] as RawBrandAdvantages | undefined

    if (!config) {
      console.warn('No BrandAdvantages found')
      return {
        advantages: [],
        icons: [],
        image: { url: '', altText: '' },
      }
    }

    // 2. Check if config is published
    if (config.status !== 'PUBLISHED') {
      console.warn('BrandAdvantages is not published')
      return {
        advantages: [],
        icons: [],
        image: { url: '', altText: '' },
      }
    }

    // 3. Extract advantages and icons (9 items each)
    const advantages = [
      extractLocale(config.advantage1, locale),
      extractLocale(config.advantage2, locale),
      extractLocale(config.advantage3, locale),
      extractLocale(config.advantage4, locale),
      extractLocale(config.advantage5, locale),
      extractLocale(config.advantage6, locale),
      extractLocale(config.advantage7, locale),
      extractLocale(config.advantage8, locale),
      extractLocale(config.advantage9, locale),
    ]

    const icons = [
      config.icon1,
      config.icon2,
      config.icon3,
      config.icon4,
      config.icon5,
      config.icon6,
      config.icon7,
      config.icon8,
      config.icon9,
    ]

    // 4. Fetch main image
    const image = await fetchMedia(config.image, locale)

    return {
      advantages,
      icons,
      image: image || { url: '', altText: '' },
    }
  } catch (error) {
    console.error('Error fetching BrandAdvantages:', error)
    return {
      advantages: [],
      icons: [],
      image: { url: '', altText: '' },
    }
  }
}
