import { NextRequest, NextResponse } from 'next/server'
import { convertToCDNUrl } from '@/lib/cdn-url'

const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

interface SeriesData {
  id: string
  name: string
  images: string[]
}

/**
 * GET /api/more-cases
 * 
 * Fetches media grouped by tags for the "More Cases" section on application pages.
 * Proxies CMS requests server-side to avoid CORS/network issues from the browser.
 * 
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    // 1. Fetch tags to identify series names
    const tagsRes = await fetch(
      `${CMS_URL}/api/media-tags?limit=50&locale=${locale}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )
    if (!tagsRes.ok) {
      console.error('Failed to fetch media-tags:', tagsRes.status)
      return NextResponse.json({ series: [] })
    }

    const tagsData = await tagsRes.json()
    const tagMap = new Map<string, string>()
    tagsData.docs?.forEach((t: any) => {
      tagMap.set(String(t.id), t.name)
    })

    // 2. Fetch all media in Category 2 (Scene Image)
    const mediaRes = await fetch(
      `${CMS_URL}/api/media?where[primaryCategory][equals]=2&limit=500&depth=1`,
      { next: { revalidate: 300 } }
    )
    if (!mediaRes.ok) {
      console.error('Failed to fetch media:', mediaRes.status)
      return NextResponse.json({ series: [] })
    }

    const mediaData = await mediaRes.json()
    const grouped: Record<string, string[]> = {}

    mediaData.docs?.forEach((m: any) => {
      const mTags = m.tags || []
      const imageUrl = m.url ? convertToCDNUrl(m.url) : null
      if (!imageUrl) return

      mTags.forEach((t: any) => {
        const id = String(typeof t === 'object' ? t.id : t)
        if (tagMap.has(id)) {
          if (!grouped[id]) grouped[id] = []
          grouped[id].push(imageUrl)
        }
      })
    })

    const result: SeriesData[] = Array.from(tagMap.entries())
      .map(([id, name]) => {
        const images = grouped[id] || []
        // Ensure we have 5 slots (pad with the same image if needed)
        const finalImages = images.length >= 5
          ? images.slice(0, 5)
          : images.length > 0
            ? [...images, ...Array(5 - images.length).fill(images[0])]
            : []

        return { id, name, images: finalImages }
      })
      .filter(s => s.images.length === 5)

    return NextResponse.json({ series: result })
  } catch (error) {
    console.error('More cases API error:', error)
    return NextResponse.json({ series: [] }, { status: 500 })
  }
}
