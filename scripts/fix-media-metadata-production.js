/**
 * Fix Media Metadata Format - Production
 *
 * Run this script to fix metadata format in production database
 */

const { Client } = require('pg')

const DATABASE_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms'

async function fixMediaMetadataFormat() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('🔧 Connected to production database\n')

    // Get all media with metadata
    const result = await client.query(`
      SELECT id, filename, metadata
      FROM "Media"
      WHERE metadata IS NOT NULL
    `)

    console.log(`📊 Found ${result.rows.length} media files with metadata\n`)

    let updatedCount = 0
    let skippedCount = 0

    for (const media of result.rows) {
      const metadata = media.metadata
      if (!metadata) {
        skippedCount++
        continue
      }

      let needsUpdate = false
      const newMetadata = { ...metadata }

      // Fix group: "g-1" → 1, "g-2" → 2, "g-01" → 1, etc.
      if (typeof metadata.group === 'string' && metadata.group.match(/^g-\d+$/)) {
        const num = parseInt(metadata.group.replace('g-', ''), 10)
        if (!isNaN(num)) {
          newMetadata.group = num
          needsUpdate = true
          console.log(`  [${media.filename}] group: "${metadata.group}" → ${num}`)
        }
      }

      // Fix sceneNumber: "sn-1" → 1, "sn-2" → 2, etc.
      if (typeof metadata.sceneNumber === 'string' && metadata.sceneNumber.match(/^sn-\d+$/)) {
        const num = parseInt(metadata.sceneNumber.replace('sn-', ''), 10)
        if (!isNaN(num)) {
          newMetadata.sceneNumber = num
          needsUpdate = true
          console.log(`  [${media.filename}] sceneNumber: "${metadata.sceneNumber}" → ${num}`)
        }
      }

      if (needsUpdate) {
        await client.query(
          `UPDATE "Media" SET metadata = $1 WHERE id = $2`,
          [JSON.stringify(newMetadata), media.id]
        )
        updatedCount++
      } else {
        skippedCount++
      }
    }

    console.log('\n✅ Migration complete!')
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Skipped: ${skippedCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fixMediaMetadataFormat()
