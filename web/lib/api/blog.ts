import { cmsFetch, CMS_URL } from "./client";
import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia } from "@/lib/media-resolver"

const PAYLOAD_URL = CMS_URL

/**
 * Returns the current UTC time truncated to the minute for stable cache keys
 * when filtering blogs by publishedAt. A blog is only visible once
 * `current time >= publishedAt`.
 */
function getPublishedAtFilterValue() {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.toISOString()
}

/**
 * Build the publishedAt query parameter for Payload's `where` filter.
 */
function getPublishedAtQueryParam(prefix = '&') {
  return `${prefix}where[publishedAt][less_than_equal]=${encodeURIComponent(getPublishedAtFilterValue())}`
}

/**
 * Resolve a coverImage value to a CDN URL string.
 * Handles: string URL, populated media object, numeric ID (fetches from CMS).
 */
async function resolveCoverImageUrl(coverImage: any): Promise<string> {
  if (!coverImage) return ''
  
  // Already a string URL
  if (typeof coverImage === 'string') return coverImage
  
  // Populated media object
  if (typeof coverImage === 'object' && coverImage !== null) {
    const url = coverImage.url || coverImage.sizes?.large?.url || ''
    return url ? convertToCDNUrl(url) : ''
  }
  
  // Numeric ID - fetch from CMS using same URL pattern as getBlogSettings
  if (typeof coverImage === 'number' || (typeof coverImage === 'string' && /^\d+$/.test(coverImage))) {
    try {
      const mediaRes = await cmsFetch(`${PAYLOAD_URL}/api/media/${coverImage}?depth=0`, {
        next: { revalidate: 3600 },
      })
      if (mediaRes.ok) {
        const media = await mediaRes.json()
        const url = media.url || media.sizes?.large?.url || ''
        return url ? convertToCDNUrl(url) : ''
      }
    } catch (e) {
      console.error('[resolveCoverImageUrl] Failed to fetch media:', e)
    }
  }
  
  return ''
}

/**
 * Resolve an author avatar value to a CDN URL string.
 * Handles: string URL, populated media object, numeric ID.
 */
async function resolveAuthorAvatar(avatar: any): Promise<string> {
  if (!avatar) return ''

  // Already a string URL
  if (typeof avatar === 'string') return avatar

  // Populated media object
  if (typeof avatar === 'object' && avatar !== null) {
    const url =
      avatar.url ||
      avatar.sizes?.thumbnail?.url ||
      avatar.sizes?.small?.url ||
      avatar.sizes?.medium?.url ||
      avatar.sizes?.large?.url ||
      ''
    return url ? convertToCDNUrl(url) : ''
  }

  // Numeric ID - fetch from CMS
  if (typeof avatar === 'number' || (typeof avatar === 'string' && /^\d+$/.test(avatar))) {
    try {
      const mediaRes = await cmsFetch(`${PAYLOAD_URL}/api/media/${avatar}?depth=0`, {
        next: { revalidate: 3600 },
      })
      if (mediaRes.ok) {
        const media = await mediaRes.json()
        const url =
          media.url ||
          media.sizes?.thumbnail?.url ||
          media.sizes?.small?.url ||
          media.sizes?.medium?.url ||
          media.sizes?.large?.url ||
          ''
        return url ? convertToCDNUrl(url) : ''
      }
    } catch (e) {
      console.error('[resolveAuthorAvatar] Failed to fetch media:', e)
    }
  }

  return ''
}

function isBlogVisible(post: any): boolean {
  if (!post || !post.publishedAt) return false
  return new Date(post.publishedAt).getTime() <= Date.now()
}

export async function getBlogSettings(locale: Locale) {
  try {
    const res = await cmsFetch(`${PAYLOAD_URL}/api/globals/knowledge-base-settings?locale=${locale}&depth=1`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null
    const data = await res.json()

    // Future-dated featured posts should not appear on the frontend
    if (data?.featuredPost && !isBlogVisible(data.featuredPost)) {
      data.featuredPost = null
    }

    // Hydrate coverImage for featuredPost (may be ID if depth is insufficient)
    if (data?.featuredPost?.coverImage) {
      data.featuredPost.coverImage = await resolveCoverImageUrl(data.featuredPost.coverImage)
    }

    // Hydrate hero background image URL
    if (data?.heroBackgroundImage) {
      data.heroBackgroundImage = await resolveCoverImageUrl(data.heroBackgroundImage)
    }

    return data
  } catch (err) {
    console.error("Error fetching blog settings:", err)
    return null
  }
}

export async function getInitialBlogs(locale: Locale, limit = 10) {
  try {
    const publishedAtFilter = getPublishedAtQueryParam()
    const res = await cmsFetch(`${PAYLOAD_URL}/api/blogs?locale=${locale}&limit=${limit}&where[status][equals]=published${publishedAtFilter}&depth=1`, {
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

export async function getBlogBySlug(slug: string, locale: string, isDraft = false) {
  try {
    const draftQuery = isDraft ? '&draft=true' : '&where[status][equals]=published';
    const publishedAtFilter = isDraft ? '' : getPublishedAtQueryParam()
    const response = await cmsFetch(
      `${PAYLOAD_URL}/api/blogs?where[slug][equals]=${encodeURIComponent(slug)}${draftQuery}&locale=${locale}${publishedAtFilter}&depth=1`,
      { 
        cache: isDraft ? 'no-store' : undefined,
        next: { revalidate: isDraft ? 0 : 60 } 
      }
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

    const transformedBlog: any = {
      ...blog, // Preserve all raw fields first
      id: blog.id,
      slug: blog.slug,
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      author:
        typeof blog.author === 'object' && blog.author !== null
          ? {
              ...blog.author,
              title: blog.author.role || blog.author.title || 'Editorial Team',
              avatar: {
                url: await resolveAuthorAvatar(blog.author.avatar),
              },
            }
          : 'Busrom Team',
      status: blog.status,
      publishedAt: blog.publishedAt || blog.createdAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      coverImage: await resolveCoverImageUrl(blog.coverImage),
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
        coverImage: await resolveCoverImageUrl(blog.prevPost.coverImage)
      } : null,
      nextPost: blog.nextPost ? {
        id: blog.nextPost.id,
        slug: blog.nextPost.slug,
        title: blog.nextPost.title,
        coverImage: await resolveCoverImageUrl(blog.nextPost.coverImage)
      } : null,
    }

    const normalize = (url: string) => {
      if (!url) return ''
      if (url.startsWith('http')) return convertToCDNUrl(url)
      const isMediaPath = url.startsWith('/api/media') || url.startsWith('/media') || /\.(jpg|jpeg|png|gif|svg|webp|avif|pdf|docx|zip)$/i.test(url)
      if (isMediaPath) {
        const normalizedPath = url.startsWith('/') ? url : `/${url}`
        return convertToCDNUrl(`${PAYLOAD_URL}${normalizedPath}`)
      }
      return url.startsWith('/') ? url : `/${url}`
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

