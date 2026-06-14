/**
 * Contact Popup API
 *
 * Fetches contact popup configuration from Payload CMS
 */

import { cmsFetch, CMS_URL } from "./client";

export interface ContactPopupOption {
  id: string
  icon?: {
    id: number
    url: string
    filename: string
    width: number
    height: number
    alt?: string
  } | null
  title: string
  description?: string
  linkType: 'url' | 'phone' | 'email' | 'chat'
  linkUrl: string
  openInNewTab: boolean
  sortOrder: number
}

export interface ContactPopupData {
  status: 'published' | 'draft'
  title: string
  options: ContactPopupOption[]
}

let contactPopupPromiseCache: Record<string, Promise<ContactPopupData | null> | undefined> = {}
let contactPopupCacheTime: Record<string, number> = {}
const CACHE_TTL = 5 * 60 * 1000

export async function getContactPopup(locale: string): Promise<ContactPopupData | null> {
  const now = Date.now()
  if (contactPopupPromiseCache[locale] && now - (contactPopupCacheTime[locale] || 0) < CACHE_TTL) {
    return contactPopupPromiseCache[locale]
  }

  const fetchPromise = (async () => {
    try {
      const response = await cmsFetch(
        `${CMS_URL}/api/globals/contact-popup?locale=${locale}&depth=1`,
        { next: { revalidate: 300 } }
      )

      if (!response.ok) {
        console.error('Failed to fetch contact popup:', response.status)
        return null
      }

      const data = await response.json()

      // Sort options by sortOrder
      const options = (data.options || []).sort((a: ContactPopupOption, b: ContactPopupOption) =>
        (a.sortOrder || 0) - (b.sortOrder || 0)
      )

      return {
        status: data.status,
        title: data.title || 'Find the support that works for you',
        options,
      }
    } catch (error) {
      console.error('Error fetching contact popup:', error)
      return null
    }
  })();

  contactPopupPromiseCache[locale] = fetchPromise
  contactPopupCacheTime[locale] = now
  return fetchPromise
}
