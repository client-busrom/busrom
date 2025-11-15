/**
 * Featured Products API
 *
 * Query helper for FeaturedProducts configuration
 */

import { gql } from '@apollo/client'
import { getClient } from '@keystone-6/core/admin-ui/apollo'

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
      description
      featuredImage
      status
      products(where: { status: { equals: "PUBLISHED" } }, take: 3) {
        id
        slug
        name
        thumbnail
        specifications
      }
    }
  }
`

/**
 * Featured Product Item (frontend format)
 */
export interface FeaturedProductItem {
  id: string
  slug: string
  name: string
  thumbnail?: string
  specifications: Array<{
    label: string
    value: string
  }>
}

/**
 * Featured Series (frontend format)
 */
export interface FeaturedSeries {
  id: string
  slug: string
  name: string
  description?: string
  featuredImage?: string
  products: FeaturedProductItem[]
}

/**
 * Featured Products Config (frontend format)
 */
export interface FeaturedProductsConfig {
  title: string
  description: string
  viewAllButtonText: string
  series: FeaturedSeries[]
}

/**
 * Parse multilingual JSON field
 */
function parseMultilingualField(field: any, locale: string = 'en'): string {
  if (!field) return ''

  try {
    const parsed = typeof field === 'string' ? JSON.parse(field) : field
    return parsed[locale] || parsed['en'] || parsed['zh'] || ''
  } catch {
    return ''
  }
}

/**
 * Parse product specifications
 */
function parseSpecifications(specs: any, locale: string = 'en'): Array<{ label: string; value: string }> {
  if (!specs) return []

  try {
    const parsed = typeof specs === 'string' ? JSON.parse(specs) : specs
    const localeSpecs = parsed[locale] || parsed['en'] || []

    // Take first 3 specs
    return localeSpecs.slice(0, 3).map((spec: any) => ({
      label: spec.label || '',
      value: spec.value || '',
    }))
  } catch {
    return []
  }
}

/**
 * Fetch Featured Products Configuration
 *
 * @param locale - Language locale (default: 'en')
 * @returns Featured products configuration with series and products
 *
 * @example
 * ```typescript
 * // In Server Component
 * import { getFeaturedProducts } from '@/lib/api/featured-products'
 *
 * const config = await getFeaturedProducts('zh')
 * ```
 *
 * @example
 * ```typescript
 * // In Client Component
 * 'use client'
 * import { useQuery, gql } from '@apollo/client'
 *
 * const { data, loading } = useQuery(GET_FEATURED_PRODUCTS, {
 *   variables: { locale: 'zh' }
 * })
 * ```
 */
export async function getFeaturedProducts(locale: string = 'en'): Promise<FeaturedProductsConfig | null> {
  const client = getClient()

  try {
    // Step 1: Fetch FeaturedProducts config
    const { data: configData } = await client.query({
      query: GET_FEATURED_PRODUCTS,
      variables: { locale },
    })

    const config = configData?.featuredProductsConfigs?.[0]

    if (!config || config.status !== 'PUBLISHED') {
      return null
    }

    // Step 2: Parse category IDs
    const categoryIds: string[] = Array.isArray(config.categories)
      ? config.categories
      : []

    if (categoryIds.length === 0) {
      return {
        title: parseMultilingualField(config.title, locale),
        description: parseMultilingualField(config.description, locale),
        viewAllButtonText: parseMultilingualField(config.viewAllButtonText, locale),
        series: [],
      }
    }

    // Step 3: Fetch ProductSeries by IDs (preserving order)
    const { data: seriesData } = await client.query({
      query: GET_PRODUCT_SERIES_BY_IDS,
      variables: { ids: categoryIds },
    })

    const seriesMap = new Map(
      (seriesData?.productSeriesItems || []).map((s: any) => [s.id, s])
    )

    // Step 4: Map series in the correct order
    const series: FeaturedSeries[] = categoryIds
      .map(id => seriesMap.get(id))
      .filter(Boolean)
      .filter((s: any) => s.status === 'PUBLISHED')
      .map((s: any) => ({
        id: s.id,
        slug: s.slug,
        name: parseMultilingualField(s.name, locale),
        description: parseMultilingualField(s.description, locale),
        featuredImage: s.featuredImage,
        products: (s.products || []).map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: parseMultilingualField(p.name, locale),
          thumbnail: p.thumbnail,
          specifications: parseSpecifications(p.specifications, locale),
        })),
      }))

    return {
      title: parseMultilingualField(config.title, locale),
      description: parseMultilingualField(config.description, locale),
      viewAllButtonText: parseMultilingualField(config.viewAllButtonText, locale),
      series,
    }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return null
  }
}

/**
 * Export GraphQL queries for client-side usage
 */
export { GET_FEATURED_PRODUCTS, GET_PRODUCT_SERIES_BY_IDS }
