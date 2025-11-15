import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL query to get page by slug
const GET_PAGE = gql`
  query GetPage($slug: String!) {
    pages(where: { slug: { equals: $slug }, status: { equals: "PUBLISHED" } }) {
      id
      slug
      path
      pageType
      template
      title
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
 * GET /api/pages/[slug]
 *
 * Fetch page content by slug
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const { slug } = await params

    // Execute GraphQL query
    const { data, error } = await keystoneClient.query({
      query: GET_PAGE,
      variables: {
        slug,
      },
    })

    if (error) {
      console.error('GraphQL Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }

    const pages = data?.pages || []

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const page = pages[0]

    // Extract localized title
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
    const translation = page.contentTranslations.find(
      (t: any) => t.locale === locale
    ) || page.contentTranslations.find((t: any) => t.locale === 'en')

    if (!translation) {
      return NextResponse.json(
        { error: 'No content translation found' },
        { status: 404 }
      )
    }

    // Transform page data
    const transformedPage = {
      id: page.id,
      slug: page.slug,
      path: page.path,
      pageType: page.pageType,
      template: page.template,
      title: extractLocalizedText(page.title),
      status: page.status,
      content: translation.content,
      locale: translation.locale,
    }

    return NextResponse.json(transformedPage)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
