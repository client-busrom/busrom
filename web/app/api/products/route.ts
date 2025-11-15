import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'
import type { Product, ProductListResponse } from '@/lib/types/product'

// GraphQL query to get products
const GET_PRODUCTS = gql`
  query GetProducts(
    $where: ProductWhereInput
    $orderBy: [ProductOrderByInput!]
    $take: Int
    $skip: Int
  ) {
    products(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      sku
      slug
      name
      shortDescription
      showImage
      mainImage
      series {
        id
        slug
        name
      }
      isFeatured
      order
      status
      createdAt
      updatedAt
    }
    productsCount(where: $where)
  }
`

/**
 * GET /api/products
 *
 * Query parameters:
 * - locale: string (default: 'en')
 * - series: string (filter by series slug)
 * - isFeatured: boolean
 * - search: string (search in product name)
 * - page: number (default: 1)
 * - pageSize: number (default: 12)
 * - sortBy: string (default: 'order')
 * - sortDir: 'asc' | 'desc' (default: 'asc')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const seriesSlug = searchParams.get('series')
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const sortBy = searchParams.get('sortBy') || 'order'
    const sortDir = searchParams.get('sortDir') || 'asc'

    // Build where clause
    const where: any = {
      status: { equals: 'PUBLISHED' },
    }

    if (seriesSlug) {
      where.series = {
        slug: { equals: seriesSlug },
      }
    }

    if (isFeatured) {
      where.isFeatured = { equals: true }
    }

    // Note: Full-text search would require a backend implementation
    // For now, we'll skip the search filter and rely on client-side filtering
    // or implement search in a separate endpoint

    // Build orderBy
    const orderBy: any = []
    if (sortBy === 'order') {
      orderBy.push({ order: sortDir })
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: sortDir })
    } else if (sortBy === 'updatedAt') {
      orderBy.push({ updatedAt: sortDir })
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Execute GraphQL query
    const { data, error } = await keystoneClient.query({
      query: GET_PRODUCTS,
      variables: {
        where,
        orderBy,
        take: pageSize,
        skip,
      },
    })

    if (error) {
      console.error('GraphQL error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Helper function to fetch media by ID
    const fetchMediaById = async (mediaId: string) => {
      try {
        const { data: mediaData } = await keystoneClient.query({
          query: gql`
            query GetMedia($id: ID!) {
              media(where: { id: $id }) {
                id
                file {
                  url
                }
                altText
                cropFocalPoint
                variants
              }
            }
          `,
          variables: { id: mediaId },
        })

        const media = mediaData?.media
        if (!media) return null

        // Transform to match expected format
        return {
          id: media.id,
          url: media.file?.url,
          altText: media.altText,
          cropFocalPoint: media.cropFocalPoint,
          variants: media.variants,
        }
      } catch (error) {
        console.error(`Failed to fetch media ${mediaId}:`, error)
        return null
      }
    }

    // Transform data and fetch media
    const products = await Promise.all(
      data.products.map(async (product: any) => {
        // Fetch showImage if it exists (it's a string ID)
        let showImage = null
        if (product.showImage && typeof product.showImage === 'string') {
          showImage = await fetchMediaById(product.showImage)
        }

        // Fetch mainImage array if it exists (array of objects with id)
        let mainImage = []
        if (product.mainImage && Array.isArray(product.mainImage)) {
          mainImage = await Promise.all(
            product.mainImage
              .filter((img: any) => img?.id)
              .map((img: any) => fetchMediaById(img.id))
          )
          mainImage = mainImage.filter(Boolean) // Remove nulls
        }

        return {
          ...product,
          showImage,
          mainImage,
          // Extract localized name
          localizedName: product.name?.[locale] || product.name?.['en'] || product.sku,
          // Keep original multilingual data
          name: product.name,
          shortDescription: product.shortDescription,
          // Extract series name
          series: product.series
            ? {
                ...product.series,
                localizedName:
                  product.series.name?.[locale] ||
                  product.series.name?.['en'] ||
                  product.series.slug,
              }
            : null,
        }
      })
    )

    const total = data.productsCount
    const totalPages = Math.ceil(total / pageSize)

    const response: ProductListResponse = {
      products,
      total,
      page,
      pageSize,
      totalPages,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
