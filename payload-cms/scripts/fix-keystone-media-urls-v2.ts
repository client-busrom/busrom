/**
 * Fix Keystone Media URLs - Version 2 (Query S3 for actual paths)
 *
 * This script:
 * 1. Fetches all media records from PostgreSQL
 * 2. For each Keystone-migrated image (has _scene_, _effect_, _combo_, _product_ in filename)
 * 3. Searches S3 for the actual file location
 * 4. Updates the database URL to match the real S3 path
 *
 * Usage:
 *   # Dry run (default)
 *   npx tsx scripts/fix-keystone-media-urls-v2.ts
 *
 *   # Apply changes
 *   npx tsx scripts/fix-keystone-media-urls-v2.ts --apply
 */

import pg from 'pg'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Disable SSL certificate validation for RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const { Client } = pg

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=require'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net'
const S3_BUCKET = process.env.S3_BUCKET || 'busrom-media-production'
const S3_REGION = process.env.S3_REGION || 'us-east-1'

// Patterns that identify Keystone-migrated images
const KEYSTONE_PATTERNS = ['_scene_', '_effect_', '_combo_', '_product_']

function isKeystoneMigratedImage(filename: string): boolean {
  return KEYSTONE_PATTERNS.some((pattern) => filename.includes(pattern))
}

async function buildS3FileIndex(s3Client: S3Client): Promise<Map<string, string>> {
  console.log('📦 Building S3 file index...')
  const fileIndex = new Map<string, string>() // filename -> full S3 key

  let continuationToken: string | undefined
  let totalFiles = 0

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key && obj.Key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          // Extract filename from path
          const filename = obj.Key.split('/').pop()
          if (filename && !obj.Key.startsWith('variants/') && !obj.Key.startsWith('media/')) {
            // Only index non-variant, non-media files (original Keystone files)
            fileIndex.set(filename, obj.Key)
          }
        }
      }
      totalFiles += response.Contents.length
    }

    continuationToken = response.NextContinuationToken

    if (totalFiles % 1000 === 0) {
      console.log(`   Indexed ${totalFiles} files...`)
    }
  } while (continuationToken)

  console.log(`   Total files indexed: ${fileIndex.size}\n`)
  return fileIndex
}

async function main() {
  const applyChanges = process.argv.includes('--apply')

  console.log('🔧 Fix Keystone Media URLs Script (V2 - S3 Lookup)')
  console.log('===================================================\n')
  console.log(`Mode: ${applyChanges ? '⚠️  APPLY CHANGES' : '🔍 DRY RUN (use --apply to actually update)'}`)
  console.log(`CDN Domain: ${CDN_DOMAIN}`)
  console.log(`S3 Bucket: ${S3_BUCKET}`)
  console.log(`Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

  // Initialize S3 client
  const s3Client = new S3Client({ region: S3_REGION })

  // Build file index from S3
  const fileIndex = await buildS3FileIndex(s3Client)

  // Connect to database
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await client.connect()
  console.log('✅ Connected to database\n')

  // Fetch all media items
  console.log('📥 Fetching all media items...')
  const result = await client.query('SELECT id, filename, url FROM media ORDER BY id')
  const allMedia = result.rows

  console.log(`   Found ${allMedia.length} media items\n`)

  // Analyze and categorize
  const needsUpdate: Array<{
    id: number
    filename: string
    currentUrl: string
    correctUrl: string
  }> = []

  const alreadyCorrect: string[] = []
  const payloadUploaded: string[] = []
  const notFoundInS3: string[] = []

  for (const media of allMedia) {
    const filename = media.filename as string
    const currentUrl = media.url as string

    if (!isKeystoneMigratedImage(filename)) {
      payloadUploaded.push(filename)
      continue
    }

    // Look up the actual S3 path
    const s3Key = fileIndex.get(filename)
    if (!s3Key) {
      notFoundInS3.push(filename)
      continue
    }

    const correctUrl = `https://${CDN_DOMAIN}/${s3Key}`

    if (currentUrl === correctUrl) {
      alreadyCorrect.push(filename)
      continue
    }

    needsUpdate.push({
      id: media.id as number,
      filename,
      currentUrl,
      correctUrl,
    })
  }

  // Report
  console.log('📊 Analysis Results:')
  console.log(`   ✅ Already correct: ${alreadyCorrect.length}`)
  console.log(`   📦 Payload uploads (no change needed): ${payloadUploaded.length}`)
  console.log(`   ❌ Not found in S3: ${notFoundInS3.length}`)
  console.log(`   🔄 Needs update: ${needsUpdate.length}\n`)

  if (notFoundInS3.length > 0 && notFoundInS3.length <= 20) {
    console.log('   Files not found in S3:')
    notFoundInS3.forEach((f) => console.log(`      - ${f}`))
    console.log('')
  } else if (notFoundInS3.length > 20) {
    console.log(`   First 20 files not found in S3:`)
    notFoundInS3.slice(0, 20).forEach((f) => console.log(`      - ${f}`))
    console.log(`   ... and ${notFoundInS3.length - 20} more\n`)
  }

  if (needsUpdate.length === 0) {
    console.log('✅ No updates needed!')
    await client.end()
    process.exit(0)
  }

  // Show sample updates
  console.log('📝 Sample updates (first 10):')
  needsUpdate.slice(0, 10).forEach((item, i) => {
    console.log(`   ${i + 1}. [ID: ${item.id}] ${item.filename}`)
    console.log(`      FROM: ${item.currentUrl}`)
    console.log(`      TO:   ${item.correctUrl}`)
    console.log('')
  })

  if (!applyChanges) {
    console.log('ℹ️  This was a dry run. Run with --apply to actually update the database.')
    await client.end()
    process.exit(0)
  }

  // Apply updates
  console.log(`\n🚀 Applying ${needsUpdate.length} updates...`)

  let success = 0
  let failed = 0

  // Use a transaction for safety
  await client.query('BEGIN')

  try {
    for (const item of needsUpdate) {
      try {
        await client.query('UPDATE media SET url = $1 WHERE id = $2', [item.correctUrl, item.id])
        success++

        if (success % 100 === 0) {
          console.log(`   Progress: ${success}/${needsUpdate.length}`)
        }
      } catch (error: any) {
        console.error(`   ❌ Failed to update ID ${item.id}: ${error.message}`)
        failed++
      }
    }

    if (failed === 0) {
      await client.query('COMMIT')
      console.log('\n✅ Transaction committed!')
    } else {
      await client.query('ROLLBACK')
      console.log('\n⚠️  Transaction rolled back due to errors!')
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }

  console.log(`\n✅ Update completed!`)
  console.log(`   Success: ${success}`)
  console.log(`   Failed: ${failed}`)

  await client.end()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
