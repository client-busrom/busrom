import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'

/**
 * GET /api/form-configs/[id]
 * Supports both database ID and form name (slug)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const queryString = searchParams.toString()

    // 1. Check if identifier is a mongo-like ID (24 hex chars), UUID, or numeric ID (e.g. "4")
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier) || 
                 /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier) ||
                 /^\d+$/.test(identifier);

    let url = ''
    if (isId) {
      // Fetch by direct ID
      url = `${CMS_URL}/api/form-configs/${identifier}?${queryString}`
    } else {
      // Fetch by name/slug (e.g. service-overview-form)
      // Note: We search by the 'name' field which is typically the slug in our forms collection
      url = `${CMS_URL}/api/form-configs?where[name][equals]=${identifier}&locale=${locale}&depth=2`
    }

    console.log('[Form Config API] Request URL:', url)

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error('[Form Config API] Payload CMS error:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch form config from CMS' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // If we searched by query, the result is in data.docs[0]
    const config = isId ? data : (data.docs && data.docs.length > 0 ? data.docs[0] : null)

    if (!config) {
      return NextResponse.json({ error: 'Form config not found' }, { status: 404 })
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('[Form Config API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
