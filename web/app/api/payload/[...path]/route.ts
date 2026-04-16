import { NextRequest, NextResponse } from 'next/server'

// Use runtime environment variable for server-side API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

/**
 * GET /api/payload/[...path]
 * 
 * Proxy requests to Payload CMS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const endpoint = path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    
    const targetUrl = `${CMS_URL}/api/${endpoint}${searchParams ? `?${searchParams}` : ''}`
    
    // console.log(`[Proxy] Fetching: ${targetUrl}`)
    
    const response = await fetch(targetUrl, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      // Return the error status and message
      return NextResponse.json(
        { error: `Payload API Error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Payload Proxy Error:', error)
    return NextResponse.json(
      { error: 'Internal server error while proxying to Payload' },
      { status: 500 }
    )
  }
}
