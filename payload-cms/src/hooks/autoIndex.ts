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

    // Log function
    const logToDb = async (url: string, engine: 'google' | 'indexnow', action: 'update' | 'delete', result: any) => {
      try {
        await req.payload.create({
          collection: 'indexing-logs',
          data: {
            targetUrl: url,
            engine,
            action,
            status: result?.success ? 'success' : (result?.message?.includes('Credentials') || result?.message?.includes('Key') ? 'failed_keys' : 'failed_network'),
            triggerUser: req.user?.id || null,
            rawResponse: result,
          }
        })
      } catch(e) {
        console.error('Failed to write SEO log:', e)
      }
    }

    // 1. Trigger: Status change to Published (New or Updated from Draft)
    if (isPublished && (operation === 'create' || !wasPublished)) {
      const urls = getUrls(doc, collectionSlug)
      console.log(`📡 [AutoIndex] ${collectionSlug} published: ${doc.slug}. Notifying updates...`)
      
      // Check credentials once to avoid 24 identical warnings
      if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
        console.log('⚠️ [Google Indexing] Credentials not found. Skipping.')
      } else {
        urls.forEach(url => {
          notifyGoogleOfUpdate(url, 'URL_UPDATED')
            .then(res => logToDb(url, 'google', 'update', res))
            .catch(e => logToDb(url, 'google', 'update', { success: false, message: e.message }))
        })
      }
      
      const indexNowTarget = urls.length > 1 ? `${urls.length} URLs (e.g. ${urls[0]})` : urls[0]
      notifyIndexNow(urls)
        .then(res => logToDb(indexNowTarget, 'indexnow', 'update', res))
        .catch(e => logToDb(indexNowTarget, 'indexnow', 'update', { success: false, message: e.message }))
    }

    // 2. Trigger: Status change from Published to NOT Published (Unpublished, Archived)
    if (wasPublished && !isPublished) {
      const urls = getUrls(doc, collectionSlug)
      console.log(`📡 [AutoIndex] ${collectionSlug} unpublished: ${doc.slug}. Notifying deletions...`)
      
      if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
        console.log('⚠️ [Google Indexing] Credentials not found. Skipping.')
      } else {
        urls.forEach(url => {
          notifyGoogleOfUpdate(url, 'URL_DELETED')
            .then(res => logToDb(url, 'google', 'delete', res))
            .catch(e => logToDb(url, 'google', 'delete', { success: false, message: e.message }))
        })
      }
      
      const indexNowTarget = urls.length > 1 ? `${urls.length} URLs (e.g. ${urls[0]})` : urls[0]
      notifyIndexNow(urls)
        .then(res => logToDb(indexNowTarget, 'indexnow', 'delete', res))
        .catch(e => logToDb(indexNowTarget, 'indexnow', 'delete', { success: false, message: e.message }))
    }

    return doc
  }
}
