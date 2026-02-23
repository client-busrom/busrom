import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/revalidate
 * 
 * On-demand revalidation for frontend pages
 * 
 * Query params:
 * - secret: string (Required) - Must match REVALIDATE_SECRET env var
 * - path: string (Optional) - Path to revalidate (e.g., /shop)
 * - all: boolean (Optional) - If true, revalidates everything (/*)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')
  const all = searchParams.get('all') === 'true'

  // Validate secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    if (all) {
      // Revalidate everything
      console.log('[Revalidate API] Revalidating entire site (/*)')
      revalidatePath('/', 'layout')
      return NextResponse.json({ revalidated: true, now: Date.now(), scope: 'all' })
    }

    if (path) {
      console.log(`[Revalidate API] Revalidating path: ${path}`)
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, now: Date.now(), path })
    }

    return NextResponse.json({ 
      message: 'Missing path or all=true parameter',
      usage: '/api/revalidate?secret=...&path=/'
    }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 })
  }
}
