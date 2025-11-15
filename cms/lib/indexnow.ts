/**
 * IndexNow Protocol Implementation
 *
 * This module provides functionality to submit URL updates to search engines
 * that support the IndexNow protocol (Bing, Yandex, Seznam).
 *
 * Documentation: https://www.indexnow.org/documentation
 */

import type { KeystoneContext } from '@keystone-6/core/types'

/**
 * Site Config Interface
 */
interface SiteConfig {
  enableIndexNow?: boolean | null
  indexNowKey?: string | null
}

/**
 * Fetch Site Config
 */
async function getSiteConfig(context: KeystoneContext): Promise<SiteConfig | null> {
  try {
    const siteConfig = await context.db.SiteConfig.findMany({
      take: 1,
    })
    const config = siteConfig[0]
    if (!config) return null

    return {
      enableIndexNow: config.enableIndexNow,
      indexNowKey: config.indexNowKey,
    } as SiteConfig
  } catch (error) {
    console.error('Error fetching site config:', error)
    return null
  }
}

/**
 * Submit URLs to IndexNow
 *
 * @param urls - Array of full URLs to submit (e.g., ["https://busrom.com/shop/product-1"])
 * @param context - Keystone context
 */
export async function submitToIndexNow(
  urls: string[],
  context: KeystoneContext
): Promise<boolean> {
  try {
    console.log(`📡 IndexNow: Submitting ${urls.length} URLs...`)

    // Fetch site config
    const config = await getSiteConfig(context)

    if (!config?.enableIndexNow) {
      console.log('⏭️  IndexNow is disabled. Skipping submission.')
      return false
    }

    if (!config?.indexNowKey) {
      console.warn('⚠️  IndexNow API key not configured. Skipping submission.')
      return false
    }

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
    const hostname = new URL(baseUrl).hostname

    // Prepare request body
    const requestBody = {
      host: hostname,
      key: config.indexNowKey,
      keyLocation: `${baseUrl}/indexnow-${config.indexNowKey}.txt`,
      urlList: urls,
    }

    // Submit to IndexNow endpoint
    // This endpoint is supported by Bing, Yandex, and Seznam
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) {
      console.log(`✅ IndexNow: Successfully submitted ${urls.length} URLs`)
      console.log(`   URLs: ${urls.join(', ')}`)
      return true
    } else {
      const statusText = response.statusText
      console.error(`❌ IndexNow: Submission failed (${response.status}: ${statusText})`)

      // Log response body for debugging
      try {
        const responseText = await response.text()
        if (responseText) {
          console.error(`   Response: ${responseText}`)
        }
      } catch (e) {
        // Ignore if response has no body
      }

      return false
    }
  } catch (error) {
    console.error('❌ IndexNow: Error submitting URLs:', error)
    return false
  }
}

/**
 * Submit a single URL to IndexNow
 *
 * @param url - Full URL to submit
 * @param context - Keystone context
 */
export async function submitUrlToIndexNow(
  url: string,
  context: KeystoneContext
): Promise<boolean> {
  return submitToIndexNow([url], context)
}

/**
 * Helper: Build full URL from path
 *
 * @param path - URL path (e.g., "/shop/product-1")
 * @returns Full URL (e.g., "https://busrom.com/shop/product-1")
 */
export function buildFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
  return `${baseUrl}${path}`
}
