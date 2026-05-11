import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia } from "@/lib/media-resolver"

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002')

/**
 * Fetch product by slug (Server-side)
 */
export async function getProductBySlug(slug: string, locale: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/products?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('[Products API] Error:', response.status)
      return null
    }

    const data = await response.json()
    const items = data?.docs || []

    if (items.length === 0) return null

    const product = items[0]

    // Transform logic similar to Client component but on server
    const transformedProduct = {
      ...product,
      locale,
    }

    return transformedProduct
  } catch (error) {
    console.error('[Products API] Exception:', error)
    return null
  }
}
