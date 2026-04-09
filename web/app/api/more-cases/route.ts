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
    const grouped: Record<string, any[]> = {}

    mediaData.docs?.forEach((m: any) => {
      const mTags = m.tags || []
      
      const mediaObj = {
        id: m.id,
        url: convertToCDNUrl(m.url),
        alt: m.alt || '',
        variants: m.sizes // No transformation needed here, OptimizedImage handles it
      }

      if (!mediaObj.url) return

      mTags.forEach((t: any) => {
        const id = String(typeof t === 'object' ? t.id : t)
        if (tagMap.has(id)) {
          if (!grouped[id]) grouped[id] = []
          grouped[id].push(mediaObj)
        }
      })
    })

    const result = Array.from(tagMap.entries())
      .map(([id, name]) => {
        const images = grouped[id] || []
        
        // 3. Randomize selection if we have surplus images
        let selectedImages = [...images]
        if (selectedImages.length > 5) {
          // Shuffle and pick 5
          selectedImages = selectedImages
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
        } else if (selectedImages.length > 0 && selectedImages.length < 5) {
          // Pad to 5 using the first image
          while (selectedImages.length < 5) {
            selectedImages.push(selectedImages[0])
          }
        }

        return { id, name, images: selectedImages }
      })
      .filter(s => s.images.length === 5)

    return NextResponse.json({ series: result })
  } catch (error) {
    console.error('More cases API error:', error)
    return NextResponse.json({ series: [] }, { status: 500 })
  }
}
