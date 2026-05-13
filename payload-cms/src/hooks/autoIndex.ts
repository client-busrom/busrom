import { CollectionAfterChangeHook } from 'payload'
import { notifyGoogleOfUpdate } from '../lib/google-indexing'
import { notifyIndexNow } from '../lib/index-now'

/**
 * Automatically notifies search engines (Google, Bing, etc.) when content is published or unpublished.
 * This is a factory function that returns a hook for a specific collection.
 */
export const autoIndexHook = (collectionSlug: string): CollectionAfterChangeHook => {
  return async ({
    doc,
    previousDoc,
    operation,
    req,
  }) => {
    const isPublished = doc.status === 'published'
    const wasPublished = previousDoc?.status === 'published'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
    const locales = ['en', 'zh', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'vi', 'th', 'id', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu']

    // 0. Skip if in bulk sync/translation mode
    if (req.context?.isTranslationSave || req.context?.isSyncing) {
      return doc
    }

    // Helper to generate URLs based on collection
    const getUrls = (document: any, collection: string) => {
      return locales.map(locale => {
        let path = ''
        switch (collection) {
          case 'blogs':
            path = `/blog/${document.slug}`
            break
          case 'products':
            path = `/shop/${document.slug}`
            break
          case 'product-series':
            path = `/products/${document.slug}`
            break
          case 'pages':
            path = document.path || `/${document.slug}`
            break
          default:
            path = `/${document.slug}`
        }
        // Ensure path starts with / but not //
        const cleanPath = path.startsWith('/') ? path : `/${path}`
        return `${siteUrl}/${locale}${cleanPath}`
      })
    }

    // 1. Trigger: Status change to Published (New or Updated from Draft)
    if (isPublished && (operation === 'create' || !wasPublished)) {
      const urls = getUrls(doc, collectionSlug)
      console.log(`📡 [AutoIndex] ${collectionSlug} published: ${doc.slug}. Notifying updates...`)
      
      // Check credentials once to avoid 24 identical warnings
      if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
        console.log('⚠️ [Google Indexing] Credentials not found. Skipping.')
      } else {
        Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_UPDATED'))).catch(e => {
          console.error('[AutoIndex] Google Update error:', e.message)
        })
      }
      
      notifyIndexNow(urls).catch(e => {
        console.error('[AutoIndex] IndexNow Update error:', e.message)
      })
    }

    // 2. Trigger: Status change from Published to NOT Published (Unpublished, Archived)
    if (wasPublished && !isPublished) {
      const urls = getUrls(doc, collectionSlug)
      console.log(`📡 [AutoIndex] ${collectionSlug} unpublished: ${doc.slug}. Notifying deletions...`)
      
      if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
        console.log('⚠️ [Google Indexing] Credentials not found. Skipping.')
      } else {
        Promise.all(urls.map(url => notifyGoogleOfUpdate(url, 'URL_DELETED'))).catch(e => {
          console.error('[AutoIndex] Google Delete error:', e.message)
        })
      }
      
      notifyIndexNow(urls).catch(e => {
        console.error('[AutoIndex] IndexNow Delete error:', e.message)
      })
    }

    return doc
  }
}
