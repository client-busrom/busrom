/**
 * IndexNow API Service
 *
 * Supports notifying Bing, Yandex, and other search engines that support IndexNow.
 * Docs: https://www.indexnow.org/documentation
 */

export const INDEXNOW_LOCALES = [
  'en', 'zh', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'vi', 'th', 'id', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu',
]

export async function notifyIndexNow(urls: string | string[]) {
  const key = process.env.INDEXNOW_KEY
  const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'www.busromhouse.com'

  if (!key) {
    console.log('⚠️ [IndexNow] INDEXNOW_KEY not found. Skipping IndexNow notification.')
    return { success: false, message: 'Key not configured' }
  }

  const urlList = Array.isArray(urls) ? urls : [urls]

  try {
    // We notify Bing as the primary endpoint (they share it with other IndexNow partners)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList,
      }),
    })

    if (response.ok) {
      console.log(`🚀 [IndexNow] Successfully notified of ${urlList.length} URLs`)
      return { success: true, message: 'IndexNow notification sent' }
    } else {
      const error = await response.text()
      throw new Error(error)
    }
  } catch (error: any) {
    console.error('❌ [IndexNow] Failed:', error.message)
    return { success: false, message: error.message }
  }
}

/**
 * Generate the full list of localized URLs for a document to submit via IndexNow.
 */
export function getIndexNowDocUrls(doc: any, collectionSlug: string): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

  return INDEXNOW_LOCALES.map((locale) => {
    let path = ''
    switch (collectionSlug) {
      case 'blogs':
        path = `/knowledge-base-blog/${doc.slug}`
        break
      case 'products':
        path = `/shop/${doc.slug}`
        break
      case 'product-series':
        path = `/products/${doc.slug}`
        break
      case 'pages':
        path = doc.path || `/${doc.slug}`
        break
      default:
        path = `/${doc.slug}`
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const prefix = locale === 'en' ? '' : `/${locale}`
    return `${siteUrl}${prefix}${cleanPath}`
  })
}
