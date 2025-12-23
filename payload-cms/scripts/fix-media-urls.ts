/**
 * Fix Media URLs Script
 *
 * This script fixes incorrect media URLs in the database.
 * Old Keystone data has URLs like /media/filename.jpg but actual S3 paths
 * are like /product-series/category/filename.jpg
 *
 * Usage:
 *   DATABASE_URI="postgresql://..." npx tsx scripts/fix-media-urls.ts
 *
 * Options:
 *   --dry-run    Only show what would be changed, don't update
 *   --limit N    Only process N records
 */

import { Pool } from 'pg'

// Disable SSL certificate verification for AWS RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const CDN_DOMAIN = 'https://d2kqew3hn5wphn.cloudfront.net'

// S3 file paths loaded from environment or file
const s3FilePaths: Map<string, string> = new Map()

async function loadS3FilePaths(): Promise<void> {
  // This should be run after exporting S3 paths to a file:
  // aws s3 ls s3://busrom-media-production/ --recursive | grep -v "variants/" | awk '{print $4}' > /tmp/s3_all_files.txt
  const fs = await import('fs')
  const path = '/tmp/s3_all_files.txt'

  if (!fs.existsSync(path)) {
    console.error('❌ S3 file list not found. Please run:')
    console.error('   aws s3 ls s3://busrom-media-production/ --recursive | grep -v "variants/" | awk \'{print $4}\' > /tmp/s3_all_files.txt')
    process.exit(1)
  }

  const content = fs.readFileSync(path, 'utf-8')
  const lines = content.trim().split('\n').filter(Boolean)

  for (const line of lines) {
    // Extract filename from path
    const parts = line.split('/')
    const filename = parts[parts.length - 1]
    // Store: filename -> full path
    s3FilePaths.set(filename, line)
  }

  console.log(`📁 Loaded ${s3FilePaths.size} S3 file paths`)
}

function getCorrectUrl(currentUrl: string, filename: string): string | null {
  // If URL already points to correct path (not /media/), skip
  if (!currentUrl.includes('/media/')) {
    return null
  }

  // Look up the correct path from S3
  const correctPath = s3FilePaths.get(filename)
  if (!correctPath) {
    // File might be in /media/ path which is correct for new uploads
    if (currentUrl.includes('/media/')) {
      // Check if this is a legitimate /media/ file
      const mediaPath = `media/${filename}`
      if (s3FilePaths.has(filename) || s3FilePaths.get(filename) === mediaPath) {
        return null // Already correct
      }
    }
    return null // Can't find correct path
  }

  // Build correct URL
  return `${CDN_DOMAIN}/${correctPath}`
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined

  console.log('🔧 Media URL Fix Script')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  if (limit) console.log(`   Limit: ${limit} records`)
  console.log('')

  // Load S3 file paths
  await loadS3FilePaths()

  // Connect to database
  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri) {
    console.error('❌ DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUri })

  try {
    // Get all media records with NULL URL
    const query = `
      SELECT id, filename, url
      FROM media
      WHERE url IS NULL
      ${limit ? `LIMIT ${limit}` : ''}
    `
    const result = await pool.query(query)
    console.log(`📊 Found ${result.rows.length} records with NULL URL`)

    let fixed = 0
    let skipped = 0
    let notFound = 0

    for (const row of result.rows) {
      const { id, filename, url } = row

      const correctUrl = getCorrectUrl(url, filename)

      if (!correctUrl) {
        // Check if file exists in /media/ path
        if (s3FilePaths.get(filename)?.startsWith('media/')) {
          skipped++
          continue
        }
        console.log(`   ⚠️ [${id}] ${filename} - Can't find correct path in S3`)
        notFound++
        continue
      }

      if (correctUrl === url) {
        skipped++
        continue
      }

      console.log(`   🔄 [${id}] ${filename}`)
      console.log(`      Old: ${url}`)
      console.log(`      New: ${correctUrl}`)

      if (!dryRun) {
        await pool.query(
          'UPDATE media SET url = $1 WHERE id = $2',
          [correctUrl, id]
        )
      }

      fixed++
    }

    console.log('')
    console.log('📊 Summary:')
    console.log(`   Fixed: ${fixed}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Not Found: ${notFound}`)

    if (dryRun && fixed > 0) {
      console.log('')
      console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.')
    }
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
