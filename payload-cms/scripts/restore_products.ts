import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  const payload = await getPayload({ config })
  
  const { docs } = await payload.find({
    collection: 'products',
    where: { sku: { equals: 'WIPE-SKU' } },
    limit: 100,
  })

  console.log(`Deleting ${docs.length} corrupted products...`)
  for (const d of docs) {
    await payload.delete({ collection: 'products', id: d.id })
  }
  console.log('Deleted successfully.')
}

run().catch(console.error).finally(() => process.exit(0))
