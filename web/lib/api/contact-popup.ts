/**
 * Contact Popup API
 *
 * Fetches contact popup configuration from Payload CMS
 */

const CMS_URL =
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'))

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

export async function getContactPopup(locale: string): Promise<ContactPopupData | null> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/globals/contact-popup?locale=${locale}&depth=2`,
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
}
