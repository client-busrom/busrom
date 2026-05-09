import { getPayload } from 'payload'
import config from './payload.config'

async function fix() {
  const payload = await getPayload({ config })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
  })

  console.log(`Found ${categories.docs.length} categories. Repairing fullTitle...`)

  let success = 0
  let failed = 0

  for (const doc of categories.docs) {
    try {
      // Empty data update simply triggers beforeChange hooks, which will now use originalDoc to generate fullTitle
      await payload.update({
        collection: 'categories',
        id: doc.id,
        data: {},
      })
      success++
      console.log(`Updated category ${doc.id} successfully.`)
    } catch (e: any) {
      console.error(`Failed to update category ${doc.id}:`, e.message)
      failed++
    }
  }

  console.log(`\nRepair completed. Success: ${success}, Failed: ${failed}`)
  process.exit(0)
}

fix().catch(console.error)
