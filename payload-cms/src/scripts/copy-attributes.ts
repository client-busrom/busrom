// @ts-nocheck
import { getPayload } from 'payload'
import config from '../../payload.config.ts'

const copyAttributes = async () => {
  const payload = await getPayload({ config })

  console.log('--- Fetching Source Attribute Page (ID: 3) ---')
  const source = await payload.findByID({
    collection: 'product-attributes',
    id: 3,
    locale: 'all', // Fetch all translations
  })

  if (!source) {
    console.error('Source attribute page ID 3 not found!')
    process.exit(1)
  }

  console.log('--- Cleaning up existing Attribute Pages (except ID 3) ---')
  await payload.delete({
    collection: 'product-attributes',
    where: {
      id: { not_equals: 3 }
    }
  })

  console.log('--- Fetching Categories of type PRODUCT ---')
  const categories = await payload.find({
    collection: 'categories',
    where: {
      type: { equals: 'PRODUCT' }
    },
    limit: 100,
  })

  console.log(`Found ${categories.docs.length} categories.`)

  for (const cat of categories.docs) {
    console.log(`\n--- Processing Category: ${cat.name} (ID: ${cat.id}) ---`)

    // 1. Create a new product-attributes doc for this category
    const attrData = source.productAttributes || {}
    if (attrData.en && !attrData.zh) {
      attrData.zh = attrData.en
    }
    
    const specData = source.specifications || {}
    if (specData.en && !specData.zh) {
      specData.zh = specData.en
    }

    const customData = source.customAttributes || {}
    if (customData.en && !customData.zh) {
      customData.zh = customData.en
    }

    const newAttrPage = await payload.create({
      collection: 'product-attributes',
      data: {
        name: `Attributes - ${cat.name}`,
        category: cat.id,
        productAttributes: attrData,
        specifications: specData,
        customAttributes: customData,
      }
    })

    console.log(`Created new Attribute Page [ID: ${newAttrPage.id}] for category ${cat.name}`)

    // 2. Find products in this category
    const products = await payload.find({
      collection: 'products',
      where: {
        category: { equals: cat.id }
      },
      limit: 500,
    })

    console.log(`Found ${products.docs.length} products in this category. Linking them...`)

    // 3. Update products to link to the new attribute page
    for (const prod of products.docs) {
      await payload.update({
        collection: 'products',
        id: prod.id,
        data: {
          attributePage: newAttrPage.id
        }
      })
    }
    console.log(`Updated ${products.docs.length} products for category ${cat.name}`)
  }

  console.log('\n--- Done! ---')
  process.exit(0)
}

copyAttributes().catch(console.error)
