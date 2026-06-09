/**
 * Site Config API
 *
 * Fetches global site configuration from Payload CMS
 */

const CMS_URL =
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'))

export interface TurnstileConfig {
  enabled: boolean
  siteKey: string
  secretKey: string
  threshold: number
}

export interface MediaImage {
  id: string
  url?: string
  filename?: string
  mimeType?: string
  width?: number
  height?: number
}

export interface SiteConfigData {
  siteName?: string
  siteTagline?: string
  siteDescription?: string
  logo?: MediaImage | null
  favicon?: MediaImage | null
  turnstile: TurnstileConfig
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const response = await fetch(`${CMS_URL}/api/globals/site-config`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Failed to fetch site config:', response.status)
      return getDefaultConfig()
    }

    const data = await response.json()

    return {
      siteName: data.siteName || 'Busrom',
      siteTagline: data.siteTagline || '',
      siteDescription: data.siteDescription || '',
      logo: data.logo || null,
      favicon: data.favicon || null,
      turnstile: {
        enabled: data.turnstileEnabled || false,
        siteKey: data.turnstileSiteKey || '',
        secretKey: data.turnstileSecretKey || '',
        threshold: data.turnstileThreshold || 2,
      },
    }
  } catch (error) {
    console.error('Error fetching site config:', error)
    return getDefaultConfig()
  }
}

function getDefaultConfig(): SiteConfigData {
  return {
    siteName: 'Busrom',
    siteTagline: '',
    siteDescription: '',
    logo: null,
    favicon: null,
    turnstile: {
      enabled: false,
      siteKey: '',
      secretKey: '',
      threshold: 2,
    },
  }
}

/**
 * Get full URL for a media image
 */
export function getMediaUrl(media: MediaImage | null | undefined): string | null {
  if (!media) return null
  if (media.url) {
    // If URL is absolute, return as-is
    if (media.url.startsWith('http')) return media.url
    // Otherwise prepend CMS URL
    return `${CMS_URL}${media.url}`
  }
  return null
}

// Client-side function to get turnstile config (without secret key)
export async function getTurnstileConfig(): Promise<Omit<TurnstileConfig, 'secretKey'>> {
  try {
    const response = await fetch('/api/site-config/turnstile')
    if (!response.ok) {
      return { enabled: false, siteKey: '', threshold: 2 }
    }
    return response.json()
  } catch {
    return { enabled: false, siteKey: '', threshold: 2 }
  }
}
