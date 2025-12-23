/**
 * Update Media URLs in Database
 *
 * This script updates all media URLs to use the /media/ path format.
 * Run this AFTER migrating S3 files to /media/ directory.
 *
 * Usage:
 *   DATABASE_URI="postgresql://..." npx tsx scripts/update-media-urls.ts --dry-run
 *   DATABASE_URI="postgresql://..." npx tsx scripts/update-media-urls.ts
 */

import { Pool } from 'pg'

// Disable SSL certificate verification for AWS RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const CDN_DOMAIN = 'https://d2kqew3hn5wphn.cloudfront.net'

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  console.log('🔧 Update Media URLs Script')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  console.log('')

  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri) {
    console.error('❌ DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUri })

  try {
    // Get all media records that need URL update
    const query = `
      SELECT id, filename, url
      FROM media
      WHERE url IS NULL
         OR url NOT LIKE '%/media/%'
      ORDER BY id
    `
    const result = await pool.query(query)
    console.log(`📊 Found ${result.rows.length} records to update`)
    console.log('')

    let updated = 0
    let skipped = 0

    for (const row of result.rows) {
      const { id, filename, url } = row
      const newUrl = `${CDN_DOMAIN}/media/${filename}`

      if (url === newUrl) {
        skipped++
        continue
      }

      if (dryRun) {
        console.log(`   [${id}] ${filename}`)
        console.log(`      Old: ${url || 'NULL'}`)
        console.log(`      New: ${newUrl}`)
      } else {
        await pool.query(
          'UPDATE media SET url = $1 WHERE id = $2',
          [newUrl, id]
        )
        if (updated < 10 || updated % 100 === 0) {
          console.log(`   ✓ [${id}] ${filename}`)
        }
      }
      updated++
    }

    console.log('')
    console.log('📊 Summary:')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)

    if (dryRun && updated > 0) {
      console.log('')
      console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.')
    }
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
