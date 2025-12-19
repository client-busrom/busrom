/**
 * Site Config API
 *
 * Fetches global site configuration from Payload CMS
 */

const CMS_URL = process.env.CMS_URL ||
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : 'http://localhost:3002')

export interface TurnstileConfig {
  enabled: boolean
  siteKey: string
  secretKey: string
  threshold: number
}

export interface SiteConfigData {
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
    turnstile: {
      enabled: false,
      siteKey: '',
      secretKey: '',
      threshold: 2,
    },
  }
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
