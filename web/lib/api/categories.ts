import type { Locale } from "@/i18n.config"

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002')

/**
 * Check if a slug matches a published PRODUCT category
 * Returns the category object if found, null otherwise
 */
export async function getCategoryBySlug(slug: string, locale: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/categories?where[slug][equals]=${encodeURIComponent(slug)}&where[type][equals]=PRODUCT&where[status][equals]=published&locale=${locale}&depth=0&limit=1`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('[Categories API] Error:', response.status)
      return null
    }

    const data = await response.json()
    const items = data?.docs || []

    if (items.length === 0) return null

    return items[0]
  } catch (error) {
    console.error('[Categories API] Exception:', error)
    return null
  }
}
