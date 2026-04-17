import { getPayload } from 'payload'
import config from './payload.config'

async function scanForBadData() {
  const payload = await getPayload({ config })
  const collections = ['blogs', 'products', 'categories', 'pages', 'hero-banner-items', 'blog-tags']
  
  console.log('--- Scanning for "package" in relationship/upload fields ---')
  
  for (const collection of collections) {
    try {
      const result = await payload.find({
        collection: collection as any,
        limit: 1000,
        depth: 0,
        locale: 'all',
      })
      
      for (const doc of result.docs) {
        // Iterate through all fields in the doc
        for (const [key, value] of Object.entries(doc)) {
          if (value === 'package') {
            console.log(`[FOUND] Collection: ${collection}, ID: ${doc.id}, Field: ${key}, Value: ${value}`)
          }
          if (Array.isArray(value) && value.includes('package')) {
            console.log(`[FOUND in Array] Collection: ${collection}, ID: ${doc.id}, Field: ${key}, Value: contains "package"`)
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${collection}:`, e.message)
    }
  }
  
  process.exit(0)
}

scanForBadData()
