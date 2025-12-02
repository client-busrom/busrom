/**
 * Service Features GraphQL Queries
 *
 * This module provides GraphQL queries for fetching ServiceFeaturesConfig data
 * from the Keystone CMS with multilingual support.
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { ServiceFeaturesData, ServiceFeature, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query to fetch ServiceFeaturesConfig
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Singleton configuration
 * - Fields: title, subtitle, 5 features with varying image counts
 * - Feature 1: 4 images, Feature 2: 2 images, Feature 3: 6 images, Feature 4: 2 images, Feature 5: 2 images
 */
const GET_SERVICE_FEATURES = gql`
  query GetServiceFeatures {
    serviceFeaturesConfig {
      title
      subtitle
      feature1Title
      feature1ShortTitle
      feature1Description
      feature1Image1
      feature1Image2
      feature1Image3
      feature1Image4
      feature2Title
      feature2ShortTitle
      feature2Description
      feature2Image1
      feature2Image2
      feature3Title
      feature3ShortTitle
      feature3Description
      feature3Image1
      feature3Image2
      feature3Image3
      feature3Image4
      feature3Image5
      feature3Image6
      feature4Title
      feature4ShortTitle
      feature4Description
      feature4Image1
      feature4Image2
      feature5Title
      feature5ShortTitle
      feature5Description
      feature5Image1
      feature5Image2
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
 * Interface for raw service features config from CMS
 */
interface RawServiceFeaturesConfig {
  title: Record<string, string>
  subtitle: Record<string, string>
  // Feature 1 (4 images)
  feature1Title: Record<string, string>
  feature1ShortTitle: Record<string, string>
  feature1Description: Record<string, string>
  feature1Image1: string
  feature1Image2: string
  feature1Image3: string
  feature1Image4: string
  // Feature 2 (2 images)
  feature2Title: Record<string, string>
  feature2ShortTitle: Record<string, string>
  feature2Description: Record<string, string>
  feature2Image1: string
  feature2Image2: string
  // Feature 3 (6 images)
  feature3Title: Record<string, string>
  feature3ShortTitle: Record<string, string>
  feature3Description: Record<string, string>
  feature3Image1: string
  feature3Image2: string
  feature3Image3: string
  feature3Image4: string
  feature3Image5: string
  feature3Image6: string
  // Feature 4 (2 images)
  feature4Title: Record<string, string>
  feature4ShortTitle: Record<string, string>
  feature4Description: Record<string, string>
  feature4Image1: string
  feature4Image2: string
  // Feature 5 (2 images)
  feature5Title: Record<string, string>
  feature5ShortTitle: Record<string, string>
  feature5Description: Record<string, string>
  feature5Image1: string
  feature5Image2: string
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
 * Fetch and transform ServiceFeaturesConfig for a specific locale
 *
 * @param locale - The language code (e.g., 'en', 'zh', 'es')
 * @returns ServiceFeaturesData for the specified locale
 *
 * @example
 * ```typescript
 * const serviceFeatures = await getServiceFeatures('en')
 * ```
 */
export async function getServiceFeatures(
  locale: string = 'en'
): Promise<ServiceFeaturesData> {
  try {
    // 1. Fetch service features config from CMS
    const { data } = await keystoneClient.query({
      query: GET_SERVICE_FEATURES,
    })

    const config = data?.serviceFeaturesConfig as RawServiceFeaturesConfig | undefined

    if (!config) {
      console.warn('No ServiceFeaturesConfig found')
      return {
        title: '',
        subtitle: '',
        features: [],
      }
    }

    // 2. Check if config is published
    if (config.status !== 'PUBLISHED') {
      console.warn('ServiceFeaturesConfig is not published')
      return {
        title: '',
        subtitle: '',
        features: [],
      }
    }

    // 3. Extract title and subtitle
    const title = extractLocale(config.title, locale)
    const subtitle = extractLocale(config.subtitle, locale)

    // 4. Transform each feature
    const features: ServiceFeature[] = []

    // Feature 1 (4 images)
    const feature1Images = await Promise.all([
      fetchMedia(config.feature1Image1, locale),
      fetchMedia(config.feature1Image2, locale),
      fetchMedia(config.feature1Image3, locale),
      fetchMedia(config.feature1Image4, locale),
    ])

    if (feature1Images.every(img => img !== null)) {
      features.push({
        title: extractLocale(config.feature1Title, locale),
        shortTitle: extractLocale(config.feature1ShortTitle, locale),
        description: extractLocale(config.feature1Description, locale),
        images: feature1Images as ImageObject[],
      })
    }

    // Feature 2 (2 images)
    const feature2Images = await Promise.all([
      fetchMedia(config.feature2Image1, locale),
      fetchMedia(config.feature2Image2, locale),
    ])

    if (feature2Images.every(img => img !== null)) {
      features.push({
        title: extractLocale(config.feature2Title, locale),
        shortTitle: extractLocale(config.feature2ShortTitle, locale),
        description: extractLocale(config.feature2Description, locale),
        images: feature2Images as ImageObject[],
      })
    }

    // Feature 3 (6 images)
    const feature3Images = await Promise.all([
      fetchMedia(config.feature3Image1, locale),
      fetchMedia(config.feature3Image2, locale),
      fetchMedia(config.feature3Image3, locale),
      fetchMedia(config.feature3Image4, locale),
      fetchMedia(config.feature3Image5, locale),
      fetchMedia(config.feature3Image6, locale),
    ])

    if (feature3Images.every(img => img !== null)) {
      features.push({
        title: extractLocale(config.feature3Title, locale),
        shortTitle: extractLocale(config.feature3ShortTitle, locale),
        description: extractLocale(config.feature3Description, locale),
        images: feature3Images as ImageObject[],
      })
    }

    // Feature 4 (2 images)
    const feature4Images = await Promise.all([
      fetchMedia(config.feature4Image1, locale),
      fetchMedia(config.feature4Image2, locale),
    ])

    if (feature4Images.every(img => img !== null)) {
      features.push({
        title: extractLocale(config.feature4Title, locale),
        shortTitle: extractLocale(config.feature4ShortTitle, locale),
        description: extractLocale(config.feature4Description, locale),
        images: feature4Images as ImageObject[],
      })
    }

    // Feature 5 (2 images)
    const feature5Images = await Promise.all([
      fetchMedia(config.feature5Image1, locale),
      fetchMedia(config.feature5Image2, locale),
    ])

    if (feature5Images.every(img => img !== null)) {
      features.push({
        title: extractLocale(config.feature5Title, locale),
        shortTitle: extractLocale(config.feature5ShortTitle, locale),
        description: extractLocale(config.feature5Description, locale),
        images: feature5Images as ImageObject[],
      })
    }

    return {
      title,
      subtitle,
      features,
    }
  } catch (error) {
    console.error('Error fetching ServiceFeatures:', error)
    return {
      title: '',
      subtitle: '',
      features: [],
    }
  }
}
