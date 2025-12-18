/**
 * Update Media URLs to use Payload's 'media/' prefix
 *
 * After copying files to media/ prefix in S3, this script updates
 * the database URLs to match the new paths.
 *
 * Usage:
 *   npx tsx scripts/update-media-urls-for-prefix.ts
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const payloadPool = new Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://busrom_dev:busrom_dev_password@localhost:5432/busrom_payload',
})

// MinIO base URL
const MINIO_BASE_URL = process.env.USE_MINIO === 'true'
  ? `${process.env.S3_ENDPOINT || 'http://localhost:9000'}/${process.env.S3_BUCKET_NAME || 'busrom-media'}`
  : `https://${process.env.S3_BUCKET_NAME || 'busrom-media'}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`

async function main() {
  console.log('🔧 Updating media URLs to use media/ prefix...\n')
  console.log(`   Base URL: ${MINIO_BASE_URL}`)

  try {
    // Get all migrated media (those with URL set)
    const result = await payloadPool.query(`
      SELECT id, filename, url
      FROM media
      WHERE url IS NOT NULL AND url <> ''
    `)

    console.log(`\n📋 Found ${result.rows.length} records to update\n`)

    let updated = 0
    let errors = 0

    for (const row of result.rows) {
      const { id, filename } = row

      // New URL with media/ prefix
      const newUrl = `${MINIO_BASE_URL}/media/${filename}`
      const newThumbnailUrl = `${MINIO_BASE_URL}/media/${filename}` // Use same as main for now

      try {
        await payloadPool.query(`
          UPDATE media SET
            url = $1,
            thumbnail_u_r_l = $2,
            sizes_thumbnail_url = $2,
            sizes_card_url = $1,
            sizes_tablet_url = $1,
            sizes_desktop_url = $1
          WHERE id = $3
        `, [newUrl, newThumbnailUrl, id])

        updated++
        if (updated % 100 === 0) {
          console.log(`   Progress: ${updated} updated`)
        }
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          console.error(`   Error updating ID ${id}: ${err.message}`)
        }
      }
    }

    console.log(`\n✅ Update completed!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Errors: ${errors}`)

  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  } finally {
    await payloadPool.end()
  }

  process.exit(0)
}

main()
