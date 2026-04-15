import { getPayload } from 'payload'
import config from '../payload.config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../.env'),
})

async function run() {
  const payload = await getPayload({ config })

  console.log('Fetching shop navigation items...')
  
  const { docs: items } = await payload.find({
    collection: 'navigation-menus',
    where: {
      'parent.slug': {
        equals: 'shop',
      },
    },
    limit: 100,
  })

  console.log(`Found ${items.length} items to check.`)

  for (const item of items) {
    const currentLink = item.link
    if (currentLink && currentLink.startsWith('/shop/') && !currentLink.includes('?category=')) {
      const slug = currentLink.replace('/shop/', '')
      const newLink = `/shop?category=${slug}`
      
      console.log(`Updating ${item.name}: ${currentLink} -> ${newLink}`)
      
      await payload.update({
        collection: 'navigation-menus',
        id: item.id,
        data: {
          link: newLink,
        },
      })
    }
  }

  console.log('Done.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
