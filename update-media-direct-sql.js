#!/usr/bin/env node
/**
 * Update Media Metadata for Combination 1 (Direct SQL)
 *
 * This script:
 * 1. Connects directly to PostgreSQL database
 * 2. Counts total Media records
 * 3. Updates all Media to have combinationNumber=1 and sequential sceneNumber
 * 4. Updates tag from "单独场景图" to "场景组合图"
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node update-media-direct-sql.js
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://busrom_admin:mlnbOSunprOSr02x4Wom@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms'

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // For AWS RDS with self-signed certificates
    },
  })

  console.log('🔍 Connecting to production database...')
  console.log('📊 DATABASE:', DATABASE_URL.replace(/:[^:]*@/, ':****@'))

  try {
    await client.connect()
    console.log('✅ Connected successfully')

    // Step 1: Count total Media
    console.log('\n📊 Counting Media records...')
    const countResult = await client.query('SELECT COUNT(*) FROM "Media"')
    const totalCount = parseInt(countResult.rows[0].count)
    console.log(`✅ Total Media records: ${totalCount}`)

    if (totalCount !== 88) {
      console.log(`⚠️  Warning: Expected 88 records, but found ${totalCount}`)
      console.log('Continue anyway in 5 seconds... (Ctrl+C to cancel)')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Step 2: Fetch all Media sorted by creation date
    console.log('\n📥 Fetching all Media records...')
    const mediaResult = await client.query(`
      SELECT id, filename, metadata
      FROM "Media"
      ORDER BY "createdAt" ASC
    `)
    const allMedia = mediaResult.rows
    console.log(`✅ Fetched ${allMedia.length} Media records`)

    // Step 3: Find tag IDs
    console.log('\n🔍 Looking for tags...')

    // Find old tag (单独场景图)
    const oldTagResult = await client.query(`
      SELECT id, name
      FROM "MediaTag"
      WHERE name::jsonb->>'zh' LIKE '%单独场景图%'
      LIMIT 1
    `)
    const oldTag = oldTagResult.rows[0]

    // Find new tag (场景组合图)
    const newTagResult = await client.query(`
      SELECT id, name
      FROM "MediaTag"
      WHERE name::jsonb->>'zh' LIKE '%场景组合图%'
      LIMIT 1
    `)
    const newTag = newTagResult.rows[0]

    console.log('Old tag (单独场景图):', oldTag?.id || 'NOT FOUND')
    console.log('New tag (场景组合图):', newTag?.id || 'NOT FOUND')

    if (!newTag) {
      console.log('\n⚠️  Warning: "场景组合图" tag not found!')
      console.log('Will update metadata only (not tags)')
    }

    // Step 4: Update each Media
    console.log('\n🔄 Updating Media records...')
    let updateCount = 0

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      const sceneNumber = i + 1

      // Parse current metadata
      let currentMetadata = {}
      if (media.metadata) {
        currentMetadata = typeof media.metadata === 'string'
          ? JSON.parse(media.metadata)
          : media.metadata
      }

      // Prepare new metadata
      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      // Update Media metadata
      await client.query(`
        UPDATE "Media"
        SET metadata = $1
        WHERE id = $2
      `, [JSON.stringify(newMetadata), media.id])

      // Update tags if both old and new tags exist
      if (oldTag && newTag) {
        // Check if media has old tag
        const hasOldTagResult = await client.query(`
          SELECT 1
          FROM "_Media_tags"
          WHERE "A" = $1 AND "B" = $2
          LIMIT 1
        `, [media.id, oldTag.id])

        if (hasOldTagResult.rows.length > 0) {
          // Remove old tag
          await client.query(`
            DELETE FROM "_Media_tags"
            WHERE "A" = $1 AND "B" = $2
          `, [media.id, oldTag.id])

          // Check if media already has new tag
          const hasNewTagResult = await client.query(`
            SELECT 1
            FROM "_Media_tags"
            WHERE "A" = $1 AND "B" = $2
            LIMIT 1
          `, [media.id, newTag.id])

          // Add new tag if not already present
          if (hasNewTagResult.rows.length === 0) {
            await client.query(`
              INSERT INTO "_Media_tags" ("A", "B")
              VALUES ($1, $2)
            `, [media.id, newTag.id])
          }
        }
      }

      updateCount++
      if (updateCount % 10 === 0) {
        console.log(`  Updated ${updateCount}/${allMedia.length} records...`)
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} Media records!`)
    console.log('\n📋 Summary:')
    console.log(`  - All Media now have: combinationNumber = 1`)
    console.log(`  - Scene numbers: 1 to ${allMedia.length}`)
    if (oldTag && newTag) {
      console.log(`  - Tag updated: "单独场景图" → "场景组合图"`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
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
