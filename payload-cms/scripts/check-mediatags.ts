import { getPayload } from 'payload'
import config from '../payload.config'

async function checkMediaTags() {
  const payload = await getPayload({ config })

  const tags = await payload.find({
    collection: 'media-tags',
    where: { type: { equals: 'product_series' } },
    limit: 20,
  })

  console.log('Media Tags:', JSON.stringify(tags.docs, null, 2))
  process.exit(0)
}

checkMediaTags()
