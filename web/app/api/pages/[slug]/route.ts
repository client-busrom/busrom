import { NextRequest, NextResponse } from "next/server"
import { resolveAllMedia } from "@/lib/media-resolver"
import { convertToCDNUrl } from "@/lib/cdn-url"

const getCmsUrl = () => {
  if (process.env.CMS_URL) return process.env.CMS_URL
  if (process.env.NEXT_PUBLIC_CMS_URL) return process.env.NEXT_PUBLIC_CMS_URL
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3002'
  return 'https://cms.busromhouse.com'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const locale = new URL(request.url).searchParams.get('locale') || 'en'
    const cmsUrl = getCmsUrl()
    
    // Standard normalizer for pages
    const normalize = (url: string) => {
      if (!url) return ''
      if (url.startsWith('http')) return convertToCDNUrl(url)
      const normalizedPath = url.startsWith('/') ? url : `/${url}`
      return convertToCDNUrl(`${cmsUrl}${normalizedPath}`)
    }

    const pageRes = await fetch(`${cmsUrl}/api/pages?where[slug][equals]=${slug}&locale=${locale}&depth=2`)
    if (!pageRes.ok) return NextResponse.json({ error: 'CMS Error' }, { status: 500 })
    const result = await pageRes.json()
    if (!result.docs?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const page = result.docs[0]

    // Use common utility better normalizer
    const { mediaData } = await resolveAllMedia(page, cmsUrl, normalize)

    return NextResponse.json({ ...page, mediaData })
  } catch (e) { 
    console.error('API Error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) 
  }
}
