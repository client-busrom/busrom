import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL query to get product series by slug with content translation
const GET_PRODUCT_SERIES_BY_SLUG = gql`
  query GetProductSeriesBySlug($slug: String!) {
    productSeriesItems(where: { slug: { equals: $slug }, status: { equals: "PUBLISHED" } }) {
      id
      slug
      name
      description
      featuredImage
      order
      status
      contentTranslations {
        id
        locale
        content {
          document
        }
      }
    }
  }
`

/**
 * GET /api/product-series/[slug]
 *
 * Fetch product series by slug with content translation
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const slug = params.slug

    // Execute GraphQL query
    const { data, error } = await keystoneClient.query({
      query: GET_PRODUCT_SERIES_BY_SLUG,
      variables: {
        slug,
      },
    })

    if (error) {
      console.error('GraphQL Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product series' },
        { status: 500 }
      )
    }

    const seriesItems = data?.productSeriesItems || []

    if (seriesItems.length === 0) {
      return NextResponse.json({ error: 'Product series not found' }, { status: 404 })
    }

    const series = seriesItems[0]

    // Extract localized text
    const extractLocalizedText = (jsonField: any): string => {
      if (!jsonField) return ''
      if (typeof jsonField === 'string') {
        try {
          jsonField = JSON.parse(jsonField)
        } catch {
          return jsonField
        }
      }
      return jsonField[locale] || jsonField['en'] || ''
    }

    // Find content translation for the requested locale
    const translation = series.contentTranslations.find(
      (t: any) => t.locale === locale
    ) || series.contentTranslations.find((t: any) => t.locale === 'en')

    if (!translation) {
      return NextResponse.json(
        { error: 'No content translation found' },
        { status: 404 }
      )
    }

    // Transform series data
    const transformedSeries = {
      id: series.id,
      slug: series.slug,
      name: extractLocalizedText(series.name),
      description: extractLocalizedText(series.description),
      featuredImage: series.featuredImage,
      order: series.order,
      status: series.status,
      content: translation.content,
      locale: translation.locale,
    }

    return NextResponse.json(transformedSeries)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
