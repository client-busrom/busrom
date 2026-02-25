import { getPayload } from 'payload'
import config from '../../payload.config'

async function run() {
  const payload = await getPayload({ config })
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  })
  
  console.log('Categories found:', categories.docs.length)
  categories.docs.forEach((cat: any) => {
    console.log(`ID: ${cat.id}, Slug: ${cat.slug}, FullTitle: ${cat.fullTitle}, Type: ${cat.type}, Parent: ${cat.parent}`)
  })
  
  process.exit(0)
}

run().catch(console.error)
