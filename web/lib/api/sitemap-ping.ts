/**
 * Sitemap Ping Service
 *
 * This module provides functionality to ping search engines when sitemap is updated.
 * Used to notify search engines about new/updated content for faster indexing.
 *
 * Supported Search Engines:
 * - Google (deprecated but may still work)
 * - Bing (IndexNow protocol)
 * - Yandex (ping endpoint)
 * - Seznam (ping endpoint)
 *
 * Note: Most modern search engines prefer:
 * 1. IndexNow protocol (Bing, Yandex, Seznam share index)
 * 2. Webmaster Tools API (Google Search Console, Bing Webmaster)
 * 3. Regular crawling via robots.txt sitemap directive
 */

// IndexNow API key - should be stored in a file at /{key}.txt on your domain
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ''

export interface PingResult {
  engine: string
  success: boolean
  message: string
  statusCode?: number
}

export interface PingAllResult {
  timestamp: string
  results: PingResult[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}

/**
 * Ping Google (deprecated but may still work)
 * Google no longer officially supports ping, but the endpoint may still work
 */
async function pingGoogle(sitemapUrl: string): Promise<PingResult> {
  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Busrom-Sitemap-Ping/1.0' },
    })

    return {
      engine: 'Google',
      success: response.ok,
      message: response.ok ? 'Ping sent successfully' : `HTTP ${response.status}`,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      engine: 'Google',
      success: false,
      message: error.message || 'Network error',
    }
  }
}

/**
 * Ping Bing using IndexNow protocol
 * IndexNow is shared between Bing, Yandex, Seznam, and Naver
 */
async function pingIndexNow(siteUrl: string, urls: string[]): Promise<PingResult> {
  if (!INDEXNOW_KEY) {
    return {
      engine: 'IndexNow (Bing/Yandex/Seznam)',
      success: false,
      message: 'INDEXNOW_KEY not configured',
    }
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000), // IndexNow supports up to 10,000 URLs per request
      }),
    })

    return {
      engine: 'IndexNow (Bing/Yandex/Seznam)',
      success: response.ok || response.status === 202,
      message:
        response.ok || response.status === 202
          ? `Submitted ${urls.length} URLs`
          : `HTTP ${response.status}`,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      engine: 'IndexNow (Bing/Yandex/Seznam)',
      success: false,
      message: error.message || 'Network error',
    }
  }
}

/**
 * Ping Bing directly (legacy method)
 */
async function pingBing(sitemapUrl: string): Promise<PingResult> {
  try {
    const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Busrom-Sitemap-Ping/1.0' },
    })

    return {
      engine: 'Bing (Legacy)',
      success: response.ok,
      message: response.ok ? 'Ping sent successfully' : `HTTP ${response.status}`,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      engine: 'Bing (Legacy)',
      success: false,
      message: error.message || 'Network error',
    }
  }
}

/**
 * Ping Yandex
 */
async function pingYandex(sitemapUrl: string): Promise<PingResult> {
  try {
    const pingUrl = `https://webmaster.yandex.ru/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Busrom-Sitemap-Ping/1.0' },
    })

    return {
      engine: 'Yandex',
      success: response.ok,
      message: response.ok ? 'Ping sent successfully' : `HTTP ${response.status}`,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      engine: 'Yandex',
      success: false,
      message: error.message || 'Network error',
    }
  }
}

/**
 * Ping all search engines
 */
export async function pingSitemapToSearchEngines(
  siteUrl: string,
  changedUrls?: string[]
): Promise<PingAllResult> {
  const sitemapUrl = `${siteUrl}/sitemaps.xml`
  const results: PingResult[] = []

  // Run all pings in parallel
  const pingPromises = [
    pingGoogle(sitemapUrl),
    pingBing(sitemapUrl),
    pingYandex(sitemapUrl),
  ]

  // If we have changed URLs and IndexNow key, use IndexNow
  if (changedUrls && changedUrls.length > 0 && INDEXNOW_KEY) {
    pingPromises.push(pingIndexNow(siteUrl, changedUrls))
  }

  const pingResults = await Promise.all(pingPromises)
  results.push(...pingResults)

  const successful = results.filter((r) => r.success).length

  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      successful,
      failed: results.length - successful,
    },
  }
}

/**
 * Ping a single URL to IndexNow
 * Useful for notifying about a single page update (e.g., new product)
 */
export async function pingUrlToIndexNow(siteUrl: string, url: string): Promise<PingResult> {
  return pingIndexNow(siteUrl, [url])
}

/**
 * Generate the content for IndexNow key verification file
 * This file should be placed at /{key}.txt on your domain
 */
export function getIndexNowKeyContent(): string {
  return INDEXNOW_KEY
}
