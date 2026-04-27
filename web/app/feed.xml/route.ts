import { NextResponse } from 'next/server'
import { generateRssXml } from '@/lib/api/rss'
import { defaultLocale } from '@/i18n.config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const xml = await generateRssXml(defaultLocale)
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
