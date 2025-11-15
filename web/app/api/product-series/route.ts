import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL query to get product series
const GET_PRODUCT_SERIES = gql`
  query GetProductSeries($where: ProductSeriesWhereInput, $orderBy: [ProductSeriesOrderByInput!]) {
    productSeriesItems(where: $where, orderBy: $orderBy) {
      id
      slug
      name
      description
      featuredImage
      order
      status
    }
  }
`

/**
 * GET /api/product-series
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    // Build where clause - only published series
    const where = {
      status: { equals: 'PUBLISHED' },
    }

    // Build orderBy
    const orderBy = [{ order: 'asc' as const }]

    // Execute GraphQL query
    const { data, error } = await keystoneClient.query({
      query: GET_PRODUCT_SERIES,
      variables: {
        where,
        orderBy,
      },
    })

    if (error) {
      console.error('GraphQL error:', error)
      return NextResponse.json({ error: 'Failed to fetch product series' }, { status: 500 })
    }

    // Transform data
    const series = data.productSeriesItems.map((s: any) => ({
      ...s,
      localizedName: s.name?.[locale] || s.name?.['en'] || s.slug,
      localizedDescription: s.description?.[locale] || s.description?.['en'] || null,
    }))

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Product Series API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
