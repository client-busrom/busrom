import { NextResponse } from 'next/server'
import { getIndexNowKeyContent } from '@/lib/api/sitemap-ping'

export const dynamic = 'force-dynamic'

/**
 * Route to serve the IndexNow verification key file
 * Pattern: /{key}.txt
 * 
 * Note: Since Next.js dynamic segments [slug] don't support file extensions easily,
 * we handle this via a rewrite or a specific route if the key is known.
 */
export async function GET(request: Request) {
  const key = process.env.INDEXNOW_KEY
  
  if (!key) {
    return new NextResponse('IndexNow Key not configured', { status: 404 })
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
