import { NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL ||
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'))

/**
 * GET /api/site-config/turnstile
 *
 * Returns Turnstile configuration (without secret key for client-side use)
 */
export async function GET() {
  try {
    const response = await fetch(`${CMS_URL}/api/globals/site-config`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return NextResponse.json({
        enabled: false,
        siteKey: '',
        threshold: 2,
      })
    }

    const data = await response.json()

    // Return config WITHOUT secret key (client-side safe)
    return NextResponse.json({
      enabled: data.turnstileEnabled || false,
      siteKey: data.turnstileSiteKey || '',
      threshold: data.turnstileThreshold || 2,
    })
  } catch (error) {
    console.error('Error fetching turnstile config:', error)
    return NextResponse.json({
      enabled: false,
      siteKey: '',
      threshold: 2,
    })
  }
}
