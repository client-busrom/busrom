import { CollectionAfterDeleteHook } from 'payload'
import { notifyGoogleOfUpdate } from '../lib/google-indexing'
import { notifyIndexNow } from '../lib/index-now'

/**
 * Notifies search engines when a published document is deleted.
 */
export const autoIndexDeleteHook: CollectionAfterDeleteHook = async ({
  doc,
}) => {
  // Only notify if the document was published
  if (doc.status === 'published') {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
    const locales = ['en', 'zh', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'vi', 'th', 'id', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu']
    
    const urls = locales.map(locale => `${siteUrl}/${locale}/blog/${doc.slug}`)
    console.log(`📡 [AutoIndex] Content deleted: ${doc.slug}. Notifying search engines...`)

    Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_DELETED'))).catch(e => {
      console.error('[AutoIndex] Google Delete error:', e.message)
    })

    notifyIndexNow(urls).catch(e => {
      console.error('[AutoIndex] IndexNow Delete error:', e.message)
    })
  }
}
