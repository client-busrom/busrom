import { getPayload } from 'payload'
import config from '../payload.config.ts'

async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('Payload initialized')
    
    const { docs: products } = await payload.find({
      collection: 'products',
      limit: 100, // fetching all products
    })
    
    console.log(`Found ${products.length} products. Beginning random distribution of tags and order...`)

    let index = 0
    for (const product of products) {
      // Create some differentiated data
      // We want some HOT, some NEW, some FEATURED, and varying orders
      const isHot = index % 5 === 0 // 20%
      const isNew = index % 4 === 1 // 25%
      const isFeatured = index % 6 === 2 // 16%
      
      const shopOrder = Math.floor(Math.random() * 100)
      const order = index * 10

      await payload.update({
        collection: 'products',
        id: product.id,
        req: {
          user: { id: 1, email: 'admin@busrom.com', collection: 'users', roles: ['admin'] } as any
        },
        data: {
          isHot,
          isNew,
          isFeatured,
          shopOrder,
          order,
        },
      })
      
      console.log(`Updated product ${product.sku} -> HOT: ${isHot}, NEW: ${isNew}, FEAT: ${isFeatured}, shopOrder: ${shopOrder}`)
      index++
    }

    console.log('✅ Successfully updated all products with differentiated values.')
    process.exit(0)
  } catch (e: any) {
    console.error('CRITICAL FAILED:', e.message)
    process.exit(1)
  }
}

run()
