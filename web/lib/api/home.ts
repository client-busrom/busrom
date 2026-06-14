/**
 * Home Page Content API
 *
 * Unified API for fetching all home page content from Payload CMS
 */

import { cmsFetch, CMS_URL } from "./client";

/**
 * Fetch raw home page data from CMS
 *
 * @param locale - Language code (e.g., 'en', 'zh')
 * @returns Raw CMS response
 */
export async function getHomeRawData(locale: string = 'en'): Promise<any> {
  try {
    const response = await cmsFetch(`${CMS_URL}/api/home?locale=${locale}`, {
      next: { revalidate: 60, tags: ['home'] }, // Cache for 60 seconds to optimize TTFB
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch home content: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching home raw data:', error)
    return null
  }
}

// Deprecated: Moving to standardized SSR pattern (fetchHomeRawData -> parseHomeData)
import { parseHomeData } from '@/lib/parsers/home-parser'
import { HomeContent } from '@/lib/content-data'

/**
 * @deprecated Use getHomeRawData and parseHomeData instead
 */
export async function getHomeContent(locale: string = 'en', strategy?: string): Promise<HomeContent | null> {
  const data = await getHomeRawData(locale)
  if (!data) return null
  return parseHomeData(data, locale, strategy)
}
