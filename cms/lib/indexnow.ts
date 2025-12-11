/**
 * IndexNow Protocol Implementation
 *
 * This module provides functionality to submit URL updates to search engines
 * that support the IndexNow protocol (Bing, Yandex, Seznam).
 *
 * Features:
 * - Rate limiting to prevent being blocked
 * - Mode-based control (disabled, manual, auto_important, auto_all)
 * - Queue tracking for batch submissions
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
  seoPingMode?: string | null
  seoPingRateLimit?: string | null
  lastSeoPingTime?: Date | null
  seoPingQueueCount?: string | null
}

/**
 * Content types considered "important" for auto_important mode
 */
const IMPORTANT_CONTENT_TYPES = ['Product', 'ProductSeries', 'Blog']

/**
 * All content types that can trigger ping
 */
const ALL_CONTENT_TYPES = ['Product', 'ProductSeries', 'Blog', 'Page', 'Application']

/**
 * Fetch SEO Config (from new SeoConfig model)
 */
async function getSiteConfig(context: KeystoneContext): Promise<SiteConfig | null> {
  try {
    // Use new SeoConfig model instead of SiteConfig
    const seoConfig = await context.db.SeoConfig.findMany({
      take: 1,
    })
    const config = seoConfig[0]
    if (!config) return null

    return {
      enableIndexNow: config.enableIndexNow,
      indexNowKey: config.indexNowKey,
      seoPingMode: config.seoPingMode,
      seoPingRateLimit: config.seoPingRateLimit,
      lastSeoPingTime: config.lastSeoPingTime,
      seoPingQueueCount: config.seoPingQueueCount,
    } as SiteConfig
  } catch (error) {
    console.error('Error fetching SEO config:', error)
    return null
  }
}

/**
 * Check if ping is allowed based on rate limit
 */
function isPingAllowed(config: SiteConfig): boolean {
  const rateLimit = parseInt(config.seoPingRateLimit || '3600', 10)

  // No rate limit
  if (rateLimit === 0) return true

  // No last ping time recorded
  if (!config.lastSeoPingTime) return true

  const lastPingTime = new Date(config.lastSeoPingTime).getTime()
  const now = Date.now()
  const elapsed = (now - lastPingTime) / 1000 // seconds

  return elapsed >= rateLimit
}

/**
 * Check if content type should trigger ping based on mode
 */
export function shouldPingForContentType(mode: string | null | undefined, contentType: string): boolean {
  if (!mode || mode === 'disabled') return false
  if (mode === 'manual') return false
  if (mode === 'auto_important') return IMPORTANT_CONTENT_TYPES.includes(contentType)
  if (mode === 'auto_all') return ALL_CONTENT_TYPES.includes(contentType)
  return false
}

/**
 * Update last ping time in SeoConfig
 */
async function updateLastPingTime(context: KeystoneContext): Promise<void> {
  try {
    const seoConfig = await context.db.SeoConfig.findMany({ take: 1 })
    if (seoConfig[0]) {
      await context.db.SeoConfig.updateOne({
        where: { id: seoConfig[0].id },
        data: { lastSeoPingTime: new Date() },
      })
    }
  } catch (error) {
    console.error('Error updating last ping time:', error)
  }
}

/**
 * Submit URLs to IndexNow
 *
 * @param urls - Array of full URLs to submit (e.g., ["https://busrom.com/shop/product-1"])
 * @param context - Keystone context
 * @param options - Optional settings
 */
export async function submitToIndexNow(
  urls: string[],
  context: KeystoneContext,
  options: { force?: boolean; contentType?: string } = {}
): Promise<boolean> {
  try {
    console.log(`📡 IndexNow: Attempting to submit ${urls.length} URLs...`)

    // Fetch site config
    const config = await getSiteConfig(context)

    if (!config?.enableIndexNow) {
      console.log('⏭️  IndexNow is disabled in SiteConfig. Skipping submission.')
      return false
    }

    if (!config?.indexNowKey) {
      console.warn('⚠️  IndexNow API key not configured. Skipping submission.')
      return false
    }

    // Check ping mode (unless forced)
    if (!options.force) {
      const mode = config.seoPingMode
      if (mode === 'disabled') {
        console.log('⏭️  SEO Ping mode is disabled. Skipping submission.')
        return false
      }

      // Check content type for auto modes
      if (options.contentType && !shouldPingForContentType(mode, options.contentType)) {
        console.log(`⏭️  Content type "${options.contentType}" not included in ping mode "${mode}". Skipping.`)
        return false
      }

      // Check rate limit
      if (!isPingAllowed(config)) {
        const rateLimit = parseInt(config.seoPingRateLimit || '3600', 10)
        console.log(`⏭️  Rate limit active (${rateLimit}s). Skipping submission. Last ping: ${config.lastSeoPingTime}`)
        return false
      }
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

    if (response.ok || response.status === 202) {
      console.log(`✅ IndexNow: Successfully submitted ${urls.length} URLs`)
      console.log(`   URLs: ${urls.join(', ')}`)

      // Update last ping time
      await updateLastPingTime(context)

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
 * @param contentType - Optional content type for mode checking
 */
export async function submitUrlToIndexNow(
  url: string,
  context: KeystoneContext,
  contentType?: string
): Promise<boolean> {
  return submitToIndexNow([url], context, { contentType })
}

/**
 * Force submit URLs to IndexNow (bypasses mode and rate limit checks)
 * Use this for manual ping triggered by admin
 *
 * @param urls - Array of full URLs to submit
 * @param context - Keystone context
 */
export async function forceSubmitToIndexNow(
  urls: string[],
  context: KeystoneContext
): Promise<boolean> {
  return submitToIndexNow(urls, context, { force: true })
}

/**
 * Get current SEO Ping configuration status
 */
export async function getSeoPingStatus(context: KeystoneContext): Promise<{
  enabled: boolean
  mode: string
  rateLimit: string
  lastPingTime: Date | null
  canPingNow: boolean
}> {
  const config = await getSiteConfig(context)

  if (!config) {
    return {
      enabled: false,
      mode: 'disabled',
      rateLimit: '3600',
      lastPingTime: null,
      canPingNow: false,
    }
  }

  return {
    enabled: !!config.enableIndexNow && !!config.indexNowKey,
    mode: config.seoPingMode || 'disabled',
    rateLimit: config.seoPingRateLimit || '3600',
    lastPingTime: config.lastSeoPingTime || null,
    canPingNow: isPingAllowed(config),
  }
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
