
import { getPayload } from 'payload'
import config from '../payload.config.ts'

async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('Payload initialized')
    const locale = 'en'
    
    const queries = [
      { name: 'hero-banner-items', fn: () => payload.find({ collection: 'hero-banner-items', locale, depth: 2, limit: 1 }) },
      { name: 'product-series-carousel', fn: () => payload.findGlobal({ slug: 'product-series-carousel', locale, depth: 2 }) },
      { name: 'service-features', fn: () => payload.findGlobal({ slug: 'service-features', locale, depth: 2 }) },
      { name: 'simple-cta', fn: () => payload.findGlobal({ slug: 'simple-cta', locale, depth: 2 }) },
      { name: 'series-intro-items', fn: () => payload.find({ collection: 'series-intro-items', locale, depth: 2, limit: 1 }) },
      { name: 'featured-products', fn: () => payload.findGlobal({ slug: 'featured-products', locale, depth: 2 }) },
      { name: 'footer', fn: () => payload.findGlobal({ slug: 'footer', locale, depth: 2 }) },
    ]

    for (const q of queries) {
      try {
        await q.fn()
        console.log(`✅ ${q.name} OK`)
      } catch (err: any) {
        console.error(`❌ ${q.name} FAILED: ${err.message}`)
      }
    }
    
    process.exit(0)
  } catch (e: any) {
    console.error('CRITICAL FAILED:', e.message)
    process.exit(1)
  }
}

run()
