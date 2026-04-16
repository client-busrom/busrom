import type { Locale } from "@/i18n.config"

const PAYLOAD_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:3002'

export async function getBlogSettings(locale: Locale) {
  try {
    // Increased depth to 3 to ensure nested relationships (sections -> tags -> blogs -> images) are populated
    const res = await fetch(`${PAYLOAD_URL}/api/globals/knowledge-base-settings?locale=${locale}&depth=3`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("Error fetching blog settings:", err)
    return null
  }
}

export async function getInitialBlogs(locale: Locale, limit = 10) {
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/blogs?locale=${locale}&limit=${limit}&where[status][equals]=published`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch (err) {
    console.error("Error fetching initial blogs:", err)
    return []
  }
}
