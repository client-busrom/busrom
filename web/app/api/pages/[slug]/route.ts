import { NextRequest, NextResponse } from 'next/server'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

/**
 * GET /api/pages/[slug]
 *
 * Fetch page content by slug from Payload CMS
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

    // Fetch from Payload CMS REST API
    const response = await fetch(
      `${CMS_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Payload API Error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const pages = data?.docs || []

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const page = pages[0]

    // Transform page data
    const transformedPage = {
      id: page.id,
      slug: page.slug,
      path: page.path || `/${page.slug}`,
      pageType: page.pageType || 'FREEFORM',
      template: page.template || null,
      title: page.title || '',
      status: page.status,
      content: page.contentTranslation || null,
      heroText: page.heroText || '',
      heroSubtitle: page.heroSubtitle || '',
      locale,
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
