import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL query to get blog by slug
const GET_BLOG = gql`
  query GetBlog($slug: String!) {
    blogs(where: { slug: { equals: $slug }, status: { equals: "PUBLISHED" } }) {
      id
      slug
      title
      excerpt
      author
      status
      publishedAt
      createdAt
      updatedAt
      coverImage
      categories {
        id
        name
      }
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
 * GET /api/blog/[slug]
 *
 * Fetch blog post by slug
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
      query: GET_BLOG,
      variables: { slug },
    })

    if (error) {
      console.error('GraphQL Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blog' },
        { status: 500 }
      )
    }

    const blogs = data?.blogs || []

    if (blogs.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const blog = blogs[0]

    // Extract localized text from JSON field
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

    // Extract cover image URL
    const extractCoverImage = (coverImage: any): string => {
      if (!coverImage) return ''
      if (typeof coverImage === 'string') {
        try {
          coverImage = JSON.parse(coverImage)
        } catch {
          return coverImage
        }
      }
      return coverImage.url || coverImage.src || ''
    }

    // Find content translation for the requested locale
    const translation = blog.contentTranslations?.find(
      (t: any) => t.locale === locale
    ) || blog.contentTranslations?.find((t: any) => t.locale === 'en')

    // Transform blog data
    const transformedBlog = {
      id: blog.id,
      slug: blog.slug,
      title: extractLocalizedText(blog.title),
      excerpt: extractLocalizedText(blog.excerpt),
      author: blog.author,
      status: blog.status,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      coverImage: extractCoverImage(blog.coverImage),
      categories: blog.categories?.map((cat: any) => ({
        id: cat.id,
        name: extractLocalizedText(cat.name),
      })) || [],
      content: translation?.content || null,
      locale,
    }

    return NextResponse.json(transformedBlog)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
