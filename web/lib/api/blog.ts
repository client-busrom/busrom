import { cmsFetch, CMS_URL } from "./client";
import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia } from "@/lib/media-resolver"

const PAYLOAD_URL = CMS_URL

export async function getBlogSettings(locale: Locale) {
  try {
    const res = await cmsFetch(`${PAYLOAD_URL}/api/globals/knowledge-base-settings?locale=${locale}&depth=1`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("Error fetching blog settings:", err)
    return null
  }
}

export async function getInitialBlogs(locale: Locale, limit = 10) {
  try {
    const res = await cmsFetch(`${PAYLOAD_URL}/api/blogs?locale=${locale}&limit=${limit}&where[status][equals]=published&depth=1`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch (err) {
    console.error("Error fetching initial blogs:", err)
    return []
  }
}

export async function getBlogBySlug(slug: string, locale: string) {
  try {
    const response = await cmsFetch(
      `${PAYLOAD_URL}/api/blogs?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=1`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      console.error('Payload API Error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    const blogs = data?.docs || []

    if (blogs.length === 0) {
      return null
    }

    const blog = blogs[0]

    const getCoverImageUrl = (coverImage: any): string => {
      if (!coverImage) return ''
      if (typeof coverImage === 'string') return coverImage
      const url = coverImage.url || coverImage.sizes?.large?.url || ''
      return url ? convertToCDNUrl(url) : ''
    }

    const transformedBlog: any = {
      ...blog, // Preserve all raw fields first
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

    const normalize = (url: string) => {
      if (!url) return ''
      return url.startsWith('http') ? convertToCDNUrl(url) : convertToCDNUrl(`${PAYLOAD_URL}${url.startsWith('/') ? '' : '/'}${url}`)
    }

    if (transformedBlog.content) {
      const { mediaData } = await resolveAllMedia(transformedBlog.content, PAYLOAD_URL, normalize)
      transformedBlog.mediaData = mediaData
    }

    return transformedBlog
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}

