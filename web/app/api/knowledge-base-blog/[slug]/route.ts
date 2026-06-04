import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'
import { resolveAllMedia } from '@/lib/media-resolver'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

/**
 * GET /api/blog/[slug]
 *
 * Fetch blog post by slug from Payload CMS
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
      `${CMS_URL}/api/blogs?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Payload API Error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch blog' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const blogs = data?.docs || []

    if (blogs.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const blog = blogs[0]

    // Get cover image URL
    const getCoverImageUrl = (coverImage: any): string => {
      if (!coverImage) return ''
      if (typeof coverImage === 'string') return coverImage
      const url = coverImage.url || coverImage.sizes?.large?.url || ''
      return url ? convertToCDNUrl(url) : ''
    }

    // Transform blog data
    const transformedBlog: any = {
      id: blog.id,
      slug: blog.slug,
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      author: blog.author || 'Busrom Team',
      status: blog.status,
      publishedAt: blog.publishedAt || blog.createdAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      coverImage: getCoverImageUrl(blog.coverImage),
      categories: (blog.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name || '',
      })),
      content: blog.contentTranslation || null,
      templateType: blog.templateType || 'template1',
      locale,
      // Include pagination data from afterRead hook
      prevPost: blog.prevPost ? {
        id: blog.prevPost.id,
        slug: blog.prevPost.slug,
        title: blog.prevPost.title,
        coverImage: getCoverImageUrl(blog.prevPost.coverImage)
      } : null,
      nextPost: blog.nextPost ? {
        id: blog.nextPost.id,
        slug: blog.nextPost.slug,
        title: blog.nextPost.title,
        coverImage: getCoverImageUrl(blog.nextPost.coverImage)
      } : null,
    }

    // Resolve mediaData for Lexical blocks
    const normalize = (url: string) => {
      if (!url) return ''
      return url.startsWith('http') ? convertToCDNUrl(url) : convertToCDNUrl(`${CMS_URL}${url.startsWith('/') ? '' : '/'}${url}`)
    }

    if (transformedBlog.content) {
      const { mediaData } = await resolveAllMedia(transformedBlog.content, CMS_URL, normalize)
      transformedBlog.mediaData = mediaData
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
