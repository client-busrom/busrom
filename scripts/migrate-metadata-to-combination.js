#!/usr/bin/env node
/**
 * Migrate Media Metadata: Remove sceneType, Add combinationNumber
 *
 * This script:
 * 1. Connects to production database
 * 2. Finds all Media records with metadata.sceneType
 * 3. Removes sceneType field
 * 4. Sets combinationNumber = 1 for all records
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate-metadata-to-combination.js
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required')
  console.log('\nUsage:')
  console.log('  DATABASE_URL="postgresql://user:password@host:5432/database" node scripts/migrate-metadata-to-combination.js')
  process.exit(1)
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // For AWS RDS
    },
  })

  console.log('🔍 Connecting to database...')
  console.log('📊 DATABASE:', DATABASE_URL.replace(/:[^:]*@/, ':****@'))

  try {
    await client.connect()
    console.log('✅ Connected successfully\n')

    // Step 1: Count total Media
    console.log('📊 Counting Media records...')
    const countResult = await client.query('SELECT COUNT(*) FROM "Media"')
    const totalCount = parseInt(countResult.rows[0].count)
    console.log(`✅ Total Media records: ${totalCount}\n`)

    // Step 2: Find Media with sceneType
    console.log('🔍 Finding Media records with metadata.sceneType...')
    const withSceneTypeResult = await client.query(`
      SELECT id, filename, metadata
      FROM "Media"
      WHERE metadata IS NOT NULL
        AND metadata::jsonb ? 'sceneType'
      ORDER BY "createdAt" ASC
    `)

    const mediaWithSceneType = withSceneTypeResult.rows
    console.log(`✅ Found ${mediaWithSceneType.length} records with sceneType\n`)

    if (mediaWithSceneType.length === 0) {
      console.log('✅ No records to migrate. Exiting.')
      return
    }

    // Step 3: Show sample data
    console.log('📋 Sample of current metadata:')
    mediaWithSceneType.slice(0, 3).forEach((media, i) => {
      const metadata = typeof media.metadata === 'string'
        ? JSON.parse(media.metadata)
        : media.metadata
      console.log(`  ${i + 1}. ${media.filename}`)
      console.log(`     Current: ${JSON.stringify(metadata)}`)
    })
    console.log()

    // Step 4: Confirm migration
    console.log('⚠️  MIGRATION PLAN:')
    console.log(`   - Will update ${mediaWithSceneType.length} records`)
    console.log('   - Remove: sceneType field')
    console.log('   - Add: combinationNumber = 1')
    console.log()
    console.log('📝 Example transformation:')
    console.log('   Before: { sceneNumber: 5, sceneType: "组合", ... }')
    console.log('   After:  { seriesNumber: undefined, combinationNumber: 1, sceneNumber: 5, ... }')
    console.log()

    console.log('⏳ Starting migration in 5 seconds... (Ctrl+C to cancel)')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Step 5: Migrate each record
    console.log('\n🔄 Migrating records...')
    let updateCount = 0

    for (const media of mediaWithSceneType) {
      // Parse current metadata
      let currentMetadata = {}
      if (media.metadata) {
        currentMetadata = typeof media.metadata === 'string'
          ? JSON.parse(media.metadata)
          : media.metadata
      }

      // Create new metadata
      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1, // Set all to combination 1
      }

      // Remove sceneType
      delete newMetadata.sceneType

      // Update in database
      await client.query(`
        UPDATE "Media"
        SET metadata = $1
        WHERE id = $2
      `, [JSON.stringify(newMetadata), media.id])

      updateCount++
      if (updateCount % 10 === 0) {
        console.log(`  ✓ Updated ${updateCount}/${mediaWithSceneType.length} records...`)
      }
    }

    console.log(`\n✅ Successfully migrated ${updateCount} Media records!\n`)

    // Step 6: Verify migration
    console.log('🔍 Verifying migration...')

    const stillHaveSceneType = await client.query(`
      SELECT COUNT(*)
      FROM "Media"
      WHERE metadata IS NOT NULL
        AND metadata::jsonb ? 'sceneType'
    `)

    const haveCombinationNumber = await client.query(`
      SELECT COUNT(*)
      FROM "Media"
      WHERE metadata IS NOT NULL
        AND metadata::jsonb ? 'combinationNumber'
    `)

    console.log(`✅ Records with sceneType: ${stillHaveSceneType.rows[0].count} (should be 0)`)
    console.log(`✅ Records with combinationNumber: ${haveCombinationNumber.rows[0].count}`)

    // Show sample after migration
    console.log('\n📋 Sample of migrated metadata:')
    const sampleResult = await client.query(`
      SELECT filename, metadata
      FROM "Media"
      WHERE metadata::jsonb ? 'combinationNumber'
      LIMIT 3
    `)

    sampleResult.rows.forEach((media, i) => {
      const metadata = typeof media.metadata === 'string'
        ? JSON.parse(media.metadata)
        : media.metadata
      console.log(`  ${i + 1}. ${media.filename}`)
      console.log(`     New: ${JSON.stringify(metadata)}`)
    })

    console.log('\n✅ Migration completed successfully!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    throw error
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
