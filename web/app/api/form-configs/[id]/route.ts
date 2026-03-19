import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

/**
 * GET /api/form-configs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    const url = `${CMS_URL}/api/form-configs/${id}${queryString ? `?${queryString}` : ''}`
    console.log('[Form Config API] Request URL:', url)

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('[Form Config API] Payload CMS error:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch form config from CMS' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Form Config API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
