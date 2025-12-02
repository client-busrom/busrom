/**
 * Featured Products API
 *
 * Query helper for FeaturedProducts configuration
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { FeaturedProductsData, FeaturedProduct, ImageObject } from '@/lib/content-data'

/**
 * GraphQL Query for FeaturedProducts
 */
const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($locale: String = "en") {
    featuredProductsConfigs {
      id
      title
      description
      viewAllButtonText
      categories
      status
    }
  }
`

/**
 * GraphQL Query for ProductSeries by IDs
 */
const GET_PRODUCT_SERIES_BY_IDS = gql`
  query GetProductSeriesByIds($ids: [ID!]!) {
    productSeriesItems(where: { id: { in: $ids } }) {
      id
      slug
      name
      status
      products(where: { status: { equals: "PUBLISHED" } }, take: 3) {
        id
        name
        primaryImage
        combination {
          id
          spec1Value
          spec2Value
          spec3Value
        }
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
 * Fetch Featured Products Configuration
 *
 * According to docs/HOME_API_FIELD_MAPPING.md:
 * - Reads FeaturedProducts config (singleton)
 * - Gets categories (ProductSeries IDs)
 * - For each series: fetches 3 random products
 * - For each product: gets 3 specs from combination
 *
 * @param locale - Language locale (default: 'en')
 * @returns Featured products data
 *
 * @example
 * ```typescript
 * const featuredProducts = await getFeaturedProducts('en')
 * ```
 */
export async function getFeaturedProducts(locale: string = 'en'): Promise<FeaturedProductsData> {
  try {
    // Step 1: Fetch FeaturedProducts config
    const { data: configData } = await keystoneClient.query({
      query: GET_FEATURED_PRODUCTS,
    })

    const config = configData?.featuredProductsConfigs?.[0]

    if (!config || config.status !== 'PUBLISHED') {
      console.warn('FeaturedProducts config not found or not published')
      return {
        title: '',
        description: '',
        viewAllButton: '',
        categories: '',
        series: [],
      }
    }

    // Step 2: Extract config fields
    const title = extractLocale(config.title, locale)
    const description = extractLocale(config.description, locale)
    const viewAllButton = extractLocale(config.viewAllButtonText, locale)

    // Step 3: Parse category IDs (ProductSeries IDs)
    const categoryIds: string[] = Array.isArray(config.categories)
      ? config.categories
      : []

    if (categoryIds.length === 0) {
      return {
        title,
        description,
        viewAllButton,
        categories: '',
        series: [],
      }
    }

    // Step 4: Fetch ProductSeries by IDs (preserving order)
    const { data: seriesData } = await keystoneClient.query({
      query: GET_PRODUCT_SERIES_BY_IDS,
      variables: { ids: categoryIds },
    })

    const seriesMap = new Map(
      (seriesData?.productSeriesItems || []).map((s: any) => [s.id, s])
    )

    // Step 5: Transform to frontend format
    const series = await Promise.all(
      categoryIds
        .map(id => seriesMap.get(id))
        .filter(Boolean)
        .filter((s: any) => s.status === 'PUBLISHED')
        .map(async (s: any) => {
          const seriesTitle = extractLocale(s.name, locale)

          // Transform products
          const products: FeaturedProduct[] = await Promise.all(
            (s.products || []).map(async (p: any) => {
              // Fetch product image
              const image = await fetchMedia(p.primaryImage, locale)

              // Extract 3 specs from combination
              const features: string[] = []
              if (p.combination) {
                if (p.combination.spec1Value) {
                  features.push(extractLocale(p.combination.spec1Value, locale))
                }
                if (p.combination.spec2Value) {
                  features.push(extractLocale(p.combination.spec2Value, locale))
                }
                if (p.combination.spec3Value) {
                  features.push(extractLocale(p.combination.spec3Value, locale))
                }
              }

              return {
                image: image || { url: '', altText: '' },
                title: extractLocale(p.name, locale),
                features,
              }
            })
          )

          return {
            seriesTitle,
            products: products.filter(p => p.image.url), // Filter out products without images
          }
        })
    )

    return {
      title,
      description,
      viewAllButton,
      categories: series.map(s => s.seriesTitle).join(', '),
      series: series.filter(s => s.products.length > 0), // Filter out series without products
    }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return {
      title: '',
      description: '',
      viewAllButton: '',
      categories: '',
      series: [],
    }
  }
}

/**
 * Export GraphQL queries for client-side usage
 */
export { GET_FEATURED_PRODUCTS, GET_PRODUCT_SERIES_BY_IDS }
