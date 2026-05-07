import { CollectionAfterDeleteHook } from 'payload'
import { notifyGoogleOfUpdate } from '../lib/google-indexing'
import { notifyIndexNow } from '../lib/index-now'

/**
 * Notifies search engines when a published document is deleted.
 * This is a factory function that returns a hook for a specific collection.
 */
export const autoIndexDeleteHook = (collectionSlug: string): CollectionAfterDeleteHook => {
  return async ({
    doc,
    req,
  }) => {
    // Only notify if the document was published
    if (doc.status === 'published') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
      const locales = ['en', 'zh', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'vi', 'th', 'id', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu']
      
      const urls = locales.map(locale => {
        let path = ''
        switch (collectionSlug) {
          case 'blogs':
            path = `/blog/${doc.slug}`
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
        return `${siteUrl}/${locale}${cleanPath}`
      })

      console.log(`📡 [AutoIndex] ${collectionSlug} deleted: ${doc.slug}. Notifying search engines...`)

      Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_DELETED'))).catch(e => {
        console.error('[AutoIndex] Google Delete error:', e.message)
      })

      notifyIndexNow(urls).catch(e => {
        console.error('[AutoIndex] IndexNow Delete error:', e.message)
      })
    }
  }
}
