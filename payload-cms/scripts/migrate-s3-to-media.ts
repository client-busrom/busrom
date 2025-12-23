/**
 * Migrate S3 files to /media/ directory
 *
 * This script:
 * 1. Moves all files from /{product-series}/{category}/ to /media/
 * 2. Updates database URLs to point to new locations
 * 3. Optionally deletes old variants directory
 *
 * Usage:
 *   DATABASE_URI="postgresql://..." npx tsx scripts/migrate-s3-to-media.ts --dry-run
 *   DATABASE_URI="postgresql://..." npx tsx scripts/migrate-s3-to-media.ts
 *
 * Prerequisites:
 *   AWS CLI configured with access to busrom-media-production bucket
 */

import { Pool } from 'pg'
import { execSync } from 'child_process'

// Disable SSL certificate verification for AWS RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const S3_BUCKET = 'busrom-media-production'
const CDN_DOMAIN = 'https://d2kqew3hn5wphn.cloudfront.net'

interface S3File {
  key: string
  filename: string
}

async function listS3Files(): Promise<S3File[]> {
  console.log('📂 Listing S3 files...')

  const output = execSync(
    `aws s3 ls s3://${S3_BUCKET}/ --recursive | grep -v "variants/" | grep -v "^media/" | awk '{print $4}'`,
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
  )

  const files: S3File[] = []
  const lines = output.trim().split('\n').filter(Boolean)

  for (const line of lines) {
    // Skip files already in /media/ directory
    if (line.startsWith('media/')) continue
    // Skip empty lines
    if (!line.trim()) continue

    const parts = line.split('/')
    const filename = parts[parts.length - 1]

    files.push({
      key: line,
      filename
    })
  }

  console.log(`   Found ${files.length} files to migrate`)
  return files
}

async function moveS3File(sourceKey: string, filename: string, dryRun: boolean): Promise<boolean> {
  const targetKey = `media/${filename}`

  if (sourceKey === targetKey) {
    return false // Already in correct location
  }

  if (dryRun) {
    console.log(`   Would move: ${sourceKey} -> ${targetKey}`)
    return true
  }

  try {
    // Copy to new location
    execSync(
      `aws s3 cp "s3://${S3_BUCKET}/${sourceKey}" "s3://${S3_BUCKET}/${targetKey}"`,
      { encoding: 'utf-8', stdio: 'pipe' }
    )

    // Delete from old location
    execSync(
      `aws s3 rm "s3://${S3_BUCKET}/${sourceKey}"`,
      { encoding: 'utf-8', stdio: 'pipe' }
    )

    console.log(`   ✓ Moved: ${sourceKey} -> ${targetKey}`)
    return true
  } catch (error) {
    console.error(`   ✗ Failed to move: ${sourceKey}`, error)
    return false
  }
}

async function updateDatabaseUrls(pool: Pool, files: S3File[], dryRun: boolean): Promise<number> {
  console.log('\n📊 Updating database URLs...')

  let updated = 0

  for (const file of files) {
    const newUrl = `${CDN_DOMAIN}/media/${file.filename}`

    if (dryRun) {
      // Check if record exists
      const result = await pool.query(
        'SELECT id, url FROM media WHERE filename = $1',
        [file.filename]
      )
      if (result.rows.length > 0) {
        const row = result.rows[0]
        if (row.url !== newUrl) {
          console.log(`   Would update [${row.id}] ${file.filename}`)
          console.log(`      Old: ${row.url || 'NULL'}`)
          console.log(`      New: ${newUrl}`)
          updated++
        }
      }
    } else {
      const result = await pool.query(
        'UPDATE media SET url = $1 WHERE filename = $2 AND (url IS NULL OR url != $1) RETURNING id',
        [newUrl, file.filename]
      )
      if (result.rowCount && result.rowCount > 0) {
        console.log(`   ✓ Updated [${result.rows[0].id}] ${file.filename}`)
        updated++
      }
    }
  }

  return updated
}

async function deleteVariantsDirectory(dryRun: boolean): Promise<void> {
  console.log('\n🗑️  Cleaning up old variants directory...')

  if (dryRun) {
    // Count files in variants directory
    try {
      const output = execSync(
        `aws s3 ls s3://${S3_BUCKET}/variants/ --recursive | wc -l`,
        { encoding: 'utf-8', stdio: 'pipe' }
      )
      console.log(`   Would delete ${output.trim()} files from /variants/`)
    } catch {
      console.log('   No variants directory found')
    }
    return
  }

  try {
    execSync(
      `aws s3 rm s3://${S3_BUCKET}/variants/ --recursive`,
      { encoding: 'utf-8', stdio: 'pipe' }
    )
    console.log('   ✓ Deleted /variants/ directory')
  } catch (error) {
    console.log('   No variants directory to delete or already empty')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const skipS3 = args.includes('--skip-s3')
  const skipDb = args.includes('--skip-db')
  const skipVariants = args.includes('--skip-variants')

  console.log('🚀 S3 Media Migration Script')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')

  // Connect to database
  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri && !skipDb) {
    console.error('❌ DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const pool = databaseUri ? new Pool({ connectionString: databaseUri }) : null

  try {
    // Step 1: List files to migrate
    const files = await listS3Files()

    if (files.length === 0) {
      console.log('\n✅ No files to migrate!')
      return
    }

    // Step 2: Move S3 files
    if (!skipS3) {
      console.log('\n📦 Moving S3 files...')
      let moved = 0
      for (const file of files) {
        if (await moveS3File(file.key, file.filename, dryRun)) {
          moved++
        }
      }
      console.log(`   Total: ${moved} files ${dryRun ? 'would be' : ''} moved`)
    }

    // Step 3: Update database URLs
    if (!skipDb && pool) {
      const updated = await updateDatabaseUrls(pool, files, dryRun)
      console.log(`   Total: ${updated} records ${dryRun ? 'would be' : ''} updated`)
    }

    // Step 4: Delete old variants
    if (!skipVariants) {
      await deleteVariantsDirectory(dryRun)
    }

    console.log('\n✅ Migration complete!')

    if (dryRun) {
      console.log('\nℹ️  This was a dry run. Run without --dry-run to apply changes.')
    }

  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

main().catch(console.error)
