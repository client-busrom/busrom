import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

/**
 * Extract all media IDs from contentTranslation
 */
function extractMediaIds(content: any): string[] {
  const ids = new Set<string>()

  function traverse(node: any) {
    if (!node) return

    // Check for image gallery
    if (node.type === 'custom-image-gallery' && node.data?.images) {
      for (const img of node.data.images) {
        if (img.image) ids.add(String(img.image))
      }
    }

    // Check for carousel
    if (node.type === 'carousel' && node.data?.slides) {
      for (const slide of node.data.slides) {
        if (slide.image?.id) ids.add(String(slide.image.id))
        else if (typeof slide.image === 'string') ids.add(slide.image)
      }
    }

    // Check for singleImage nodes
    if (node.type === 'singleImage' && node.data?.image) {
      const img = node.data.image
      if (img.id) ids.add(String(img.id))
      else if (typeof img === 'string') ids.add(img)
    }

    // Check for upload nodes (direct media references)
    if (node.type === 'upload' && node.value?.id) {
      ids.add(String(node.value.id))
    }

    // Check for block nodes (sidebar, etc.)
    if (node.type === 'block' && node.fields) {
      // Traverse mainContent
      if (node.fields.mainContent?.root) {
        traverse(node.fields.mainContent.root)
      }
      // Traverse sidebarContent
      if (node.fields.sidebarContent?.root) {
        traverse(node.fields.sidebarContent.root)
      }
    }

    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }

    // Check root
    if (node.root) {
      traverse(node.root)
    }
  }

  traverse(content)
  return Array.from(ids)
}

/**
 * Media object format compatible with OptimizedImage component
 */
interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string  // 400x300
    small?: string      // 768x512 (from Payload card)
    medium?: string     // 1024px (from Payload tablet)
    large?: string      // 1920px (from Payload desktop)
    xlarge?: string     // Original
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

/**
 * Fetch media data in batch with size variants (compatible with OptimizedImage)
 */
async function fetchMediaData(ids: string[]): Promise<Record<string, MediaObject>> {
  const mediaMap: Record<string, MediaObject> = {}

  if (ids.length === 0) return mediaMap

  // Fetch media in parallel (batch of 10)
  const batchSize = 10
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const promises = batch.map(async (id) => {
      try {
        const res = await fetch(`${CMS_URL}/api/media/${id}`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })
        if (res.ok) {
          const data = await res.json()
          if (data.url) {
            mediaMap[id] = {
              id,
              url: convertToCDNUrl(data.url),
              alt: data.alt || '',
              variants: {
                thumbnail: data.sizes?.thumbnail?.url ? convertToCDNUrl(data.sizes.thumbnail.url) : undefined,
                small: data.sizes?.card?.url ? convertToCDNUrl(data.sizes.card.url) : undefined,
                medium: data.sizes?.tablet?.url ? convertToCDNUrl(data.sizes.tablet.url) : undefined,
                large: data.sizes?.desktop?.url ? convertToCDNUrl(data.sizes.desktop.url) : undefined,
                xlarge: convertToCDNUrl(data.url),
              },
              cropFocalPoint: data.focalX != null && data.focalY != null
                ? { x: data.focalX, y: data.focalY }
                : null,
              width: data.width || undefined,
              height: data.height || undefined,
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch media ${id}:`, e)
      }
    })
    await Promise.all(promises)
  }

  return mediaMap
}

/**
 * Fetch form config by ID
 */
async function fetchFormConfigById(id: string, locale: string): Promise<any | null> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/form-configs/${id}?locale=${locale}&depth=1`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.id) {
        return data
      }
    }
  } catch (e) {
    console.error(`Failed to fetch form config by ID ${id}:`, e)
  }
  return null
}

/**
 * Extract formBlock formConfig ID from content
 */
function extractFormConfigId(content: any): string | null {
  function traverse(node: any): string | null {
    if (!node) return null

    // Check for formBlock
    if (node.type === 'formBlock' && node.data?.formConfig?.id) {
      return String(node.data.formConfig.id)
    }

    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const result = traverse(child)
        if (result) return result
      }
    }

    // Check root
    if (node.root) {
      return traverse(node.root)
    }

    return null
  }

  return traverse(content)
}

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

    // Extract and fetch media data
    const mediaIds = extractMediaIds(page.contentTranslation)
    const mediaData = await fetchMediaData(mediaIds)

    // Fetch form config if formBlock exists in content
    let formConfig = null
    const formConfigId = extractFormConfigId(page.contentTranslation)
    if (formConfigId) {
      formConfig = await fetchFormConfigById(formConfigId, locale)
    }

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
      mediaData,
      formConfig,
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
