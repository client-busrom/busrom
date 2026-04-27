import { CollectionAfterChangeHook } from 'payload'

/**
 * Hook to trigger sitemap ping on the frontend when content changes
 */
export const pingSitemap: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  // Only ping on publish/update of published content
  if (doc.status !== 'published') return

  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  const pingSecret = process.env.SITEMAP_PING_SECRET

  // We don't want to block the CMS response, so we don't 'await' the fetch
  // but we should catch errors
  try {
    const url = new URL(`${frontendUrl}/api/sitemap/ping`)
    
    // Determine the path of the changed content to notify IndexNow specifically
    let pagePath = ''
    const slug = collection.slug as string
    if (slug === 'products') pagePath = `/shop/${doc.slug}`
    else if (slug === 'blogs') pagePath = `/blog/${doc.slug}`
    else if (slug === 'applications') pagePath = `/application`
    else if (slug === 'product-series') pagePath = `/products/${doc.slug}`
    else if (slug === 'pages') {
      // Special case: if the page slug is 'application', the URL is just '/application'
      if (doc.slug === 'application') pagePath = `/application`
      else pagePath = `/${doc.slug}` // Usually pages are at /[slug]
    }

    const body: any = {}
    if (pagePath) {
      body.urls = [`${frontendUrl}${pagePath}`]
    }

    req.payload.logger.info(`🚀 [Sitemap Ping] Triggering ping for: ${pagePath || 'all'}`)

    fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(pingSecret && { 'Authorization': `Bearer ${pingSecret}` }),
      },
      body: JSON.stringify(body),
    }).catch(err => {
      req.payload.logger.error(`❌ [Sitemap Ping] Request failed: ${err.message}`)
    })
  } catch (err: any) {
    req.payload.logger.error(`❌ [Sitemap Ping] Setup failed: ${err.message}`)
  }
}
