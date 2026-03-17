import { NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL ||
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'))

/**
 * GET /api/site-config
 *
 * Returns site configuration (public fields only, no secrets)
 */
export async function GET() {
  try {
    const response = await fetch(`${CMS_URL}/api/globals/site-config`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return NextResponse.json({
        turnstileSiteKey: null,
      })
    }

    const data = await response.json()

    // Build logo URL if available
    let logoUrl = null
    if (data.logo) {
      if (data.logo.url) {
        logoUrl = data.logo.url.startsWith('http') ? data.logo.url : `${CMS_URL}${data.logo.url}`
      }
    }

    // Return public config only (no secret keys)
    return NextResponse.json({
      // Turnstile (captcha)
      turnstileSiteKey: data.turnstileSiteKey || null,
      turnstileEnabled: data.turnstileEnabled || false,
      // Logo
      logoUrl,
    })
  } catch (error) {
    console.error('Error fetching site config:', error)
    return NextResponse.json({
      turnstileSiteKey: null,
    })
  }
}
