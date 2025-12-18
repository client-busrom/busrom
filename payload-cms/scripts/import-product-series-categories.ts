/**
 * Import ProductSeries categories from Keystone to Payload
 *
 * This script maps Keystone Category UUIDs to Payload Category IDs
 * and updates ProductSeries with the correct category relationships
 */

import { Client } from 'pg'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const keystoneClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'busrom_cms',
  user: 'busrom',
  password: 'busrom_dev_password',
})

async function importProductSeriesCategories() {
  console.log('🚀 Starting ProductSeries category import...\n')

  // Connect to Keystone database
  await keystoneClient.connect()
  console.log('✅ Connected to Keystone database\n')

  // Initialize Payload
  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    // Step 1: Get all Categories from Keystone
    console.log('📦 Fetching Categories from Keystone...')
    const keystoneCategoriesResult = await keystoneClient.query(`
      SELECT id, name, type FROM "Category" WHERE type = 'PRODUCT' ORDER BY name
    `)
    console.log(`✅ Found ${keystoneCategoriesResult.rows.length} PRODUCT categories in Keystone\n`)

    // Step 2: Get all Categories from Payload
    console.log('📦 Fetching Categories from Payload...')
    const payloadCategories = await payload.find({
      collection: 'categories',
      where: {
        type: {
          equals: 'PRODUCT',
        },
      },
      limit: 100,
    })
    console.log(`✅ Found ${payloadCategories.docs.length} PRODUCT categories in Payload\n`)

    // Step 3: Create UUID to ID mapping by matching names
    console.log('📦 Creating Category UUID to ID mapping...')
    const uuidToIdMap: Record<string, number> = {}

    for (const keystoneCat of keystoneCategoriesResult.rows) {
      const keystoneName = keystoneCat.name
      const keystoneUuid = keystoneCat.id

      // Find matching Payload category by name (en or zh)
      const payloadCat = payloadCategories.docs.find((pc) => {
        return (
          pc.name === keystoneName.en ||
          pc.name === keystoneName.zh
        )
      })

      if (payloadCat) {
        uuidToIdMap[keystoneUuid] = payloadCat.id
        console.log(`  ✓ Mapped: ${keystoneName.en} (${keystoneUuid.substring(0, 8)}...) → ID ${payloadCat.id}`)
      } else {
        console.log(`  ⚠️  No match found for: ${keystoneName.en}`)
      }
    }
    console.log()

    // Step 4: Get ProductSeries with categories from Keystone
    console.log('📦 Fetching ProductSeries from Keystone...')
    const keystoneSeriesResult = await keystoneClient.query(`
      SELECT id, slug, name, category FROM "ProductSeries" ORDER BY "order"
    `)
    console.log(`✅ Found ${keystoneSeriesResult.rows.length} ProductSeries in Keystone\n`)

    // Step 5: Update ProductSeries in Payload with category relationships
    console.log('📦 Updating ProductSeries categories in Payload...')
    let successCount = 0
    let skipCount = 0

    for (const keystoneSeries of keystoneSeriesResult.rows) {
      if (!keystoneSeries.category) {
        console.log(`  ⊙ Skipping "${keystoneSeries.name.en}" - no category in Keystone`)
        skipCount++
        continue
      }

      const categoryId = uuidToIdMap[keystoneSeries.category]

      if (!categoryId) {
        console.log(`  ⚠️  Skipping "${keystoneSeries.name.en}" - category UUID not found in mapping`)
        skipCount++
        continue
      }

      // Find ProductSeries in Payload by slug
      const payloadSeriesResult = await payload.find({
        collection: 'product-series',
        where: {
          slug: {
            equals: keystoneSeries.slug,
          },
        },
        limit: 1,
      })

      if (payloadSeriesResult.docs.length === 0) {
        console.log(`  ⚠️  Skipping "${keystoneSeries.name.en}" - not found in Payload`)
        skipCount++
        continue
      }

      const payloadSeries = payloadSeriesResult.docs[0]

      // Update with category relationship
      await payload.update({
        collection: 'product-series',
        id: payloadSeries.id,
        data: {
          category: categoryId,
        },
      })

      console.log(`  ✓ Updated: ${keystoneSeries.name.en} → Category ID ${categoryId}`)
      successCount++
    }

    console.log(`\n✅ ProductSeries category import completed!`)
    console.log('📊 Summary:')
    console.log(`   - ${successCount} ProductSeries updated`)
    console.log(`   - ${skipCount} ProductSeries skipped`)

  } catch (error) {
    console.error('❌ Error importing categories:', error)
    throw error
  } finally {
    await keystoneClient.end()
    process.exit(0)
  }
}

importProductSeriesCategories().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
