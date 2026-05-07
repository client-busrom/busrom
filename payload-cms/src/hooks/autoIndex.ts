import { CollectionAfterChangeHook } from 'payload'
import { notifyGoogleOfUpdate } from '../lib/google-indexing'
import { notifyIndexNow } from '../lib/index-now'

/**
 * Automatically notifies search engines (Google, Bing, etc.) when content is published or unpublished.
 */
export const autoIndexHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  const isPublished = doc.status === 'published'
  const wasPublished = previousDoc?.status === 'published'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  const locales = ['en', 'zh', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'vi', 'th', 'id', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu']

  // 1. Trigger: Status change to Published (New or Updated from Draft)
  if (isPublished && (operation === 'create' || !wasPublished)) {
    const urls = locales.map(locale => `${siteUrl}/${locale}/blog/${doc.slug}`)
    console.log(`📡 [AutoIndex] Content published: ${doc.slug}. Notifying updates...`)
    
    Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_UPDATED'))).catch(e => {
      console.error('[AutoIndex] Google Update error:', e.message)
    })
    
    notifyIndexNow(urls).catch(e => {
      console.error('[AutoIndex] IndexNow Update error:', e.message)
    })
  }

  // 2. Trigger: Status change from Published to NOT Published (Unpublished, Archived, or Deleted)
  // Note: For actual deletion, we handle it in afterDelete hook
  if (wasPublished && !isPublished) {
    const urls = locales.map(locale => `${siteUrl}/${locale}/blog/${doc.slug}`)
    console.log(`📡 [AutoIndex] Content unpublished: ${doc.slug}. Notifying deletions...`)
    
    Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_DELETED'))).catch(e => {
      console.error('[AutoIndex] Google Delete error:', e.message)
    })
    
    // IndexNow also suggests notifying about deletions
    notifyIndexNow(urls).catch(e => {
      console.error('[AutoIndex] IndexNow Delete error:', e.message)
    })
  }

  return doc
}
