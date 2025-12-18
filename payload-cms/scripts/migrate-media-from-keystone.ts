/**
 * Migrate Media from Keystone CMS to Payload CMS
 *
 * This script:
 * 1. Reads all Media records from Keystone PostgreSQL
 * 2. Creates corresponding Media records in Payload
 * 3. Points to the same S3 files (no re-upload needed)
 *
 * Usage:
 *   npx tsx scripts/migrate-media-from-keystone.ts
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// Keystone database connection
const keystonePool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'busrom_cms',
  user: 'busrom',
  password: 'busrom_dev_password',
})

// Payload database connection
const payloadPool = new Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://busrom_dev:busrom_dev_password@localhost:5432/busrom_payload',
})

interface KeystoneMedia {
  id: string
  filename: string
  file_id: string
  fileKey: string
  fileUrl: string
  fileSize: number
  width: number
  height: number
  mimeType: string
  primaryCategory: string | null
  altText: any
  metadata: any
  status: string
  createdAt: Date
  updatedAt: Date
}

interface MediaCategoryMap {
  [keystoneId: string]: number
}

async function main() {
  console.log('🚀 Starting Media migration from Keystone to Payload...\n')

  try {
    // Step 1: Build category mapping (Keystone UUID -> Payload ID)
    console.log('📁 Building category mapping...')
    const categoryMap = await buildCategoryMap()
    console.log(`   Found ${Object.keys(categoryMap).length} category mappings\n`)

    // Step 2: Get existing Payload media filenames to avoid duplicates
    console.log('📋 Checking existing Payload media...')
    const existingFilenames = await getExistingPayloadFilenames()
    console.log(`   Found ${existingFilenames.size} existing media records\n`)

    // Step 3: Get all Keystone media records
    console.log('📥 Fetching Keystone media records...')
    const keystoneMedia = await getKeystoneMedia()
    console.log(`   Found ${keystoneMedia.length} Keystone media records\n`)

    // Step 4: Migrate media records
    console.log('📤 Migrating media records to Payload...')
    let created = 0
    let skipped = 0
    let errors = 0

    for (const media of keystoneMedia) {
      // Use the S3 key (fileKey) as the filename in Payload
      const payloadFilename = media.fileKey

      if (existingFilenames.has(payloadFilename)) {
        skipped++
        continue
      }

      try {
        await createPayloadMedia(media, payloadFilename, categoryMap)
        created++
        if (created % 100 === 0) {
          console.log(`   Progress: ${created} created, ${skipped} skipped, ${errors} errors`)
        }
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          console.error(`   Error creating ${media.filename}: ${err.message}`)
        }
      }
    }

    console.log(`\n✅ Migration completed!`)
    console.log(`   Created: ${created}`)
    console.log(`   Skipped (already exists): ${skipped}`)
    console.log(`   Errors: ${errors}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await keystonePool.end()
    await payloadPool.end()
  }

  process.exit(0)
}

async function buildCategoryMap(): Promise<MediaCategoryMap> {
  const map: MediaCategoryMap = {}

  // Get Keystone categories
  const keystoneResult = await keystonePool.query(`
    SELECT id, slug FROM "MediaCategory"
  `)

  // Get Payload categories
  const payloadResult = await payloadPool.query(`
    SELECT id, name FROM media_categories
  `)

  // Build mapping based on slug/name match
  for (const kCat of keystoneResult.rows) {
    const pCat = payloadResult.rows.find((p: any) => p.name === kCat.slug)
    if (pCat) {
      map[kCat.id] = pCat.id
    }
  }

  return map
}

async function getExistingPayloadFilenames(): Promise<Set<string>> {
  const result = await payloadPool.query(`
    SELECT filename FROM media
  `)
  return new Set(result.rows.map((r: any) => r.filename))
}

async function getKeystoneMedia(): Promise<KeystoneMedia[]> {
  const result = await keystonePool.query(`
    SELECT
      id,
      filename,
      file_id,
      "fileKey",
      "fileUrl",
      "fileSize",
      width,
      height,
      "mimeType",
      "primaryCategory",
      "altText",
      metadata,
      status,
      "createdAt",
      "updatedAt"
    FROM "Media"
    WHERE status = 'ACTIVE'
    ORDER BY "createdAt" ASC
  `)
  return result.rows
}

async function createPayloadMedia(
  media: KeystoneMedia,
  payloadFilename: string,
  categoryMap: MediaCategoryMap
): Promise<void> {
  // Build the URL - for MinIO local dev
  const url = `http://localhost:9000/busrom-media/${payloadFilename}`

  // Get category ID if exists
  const categoryId = media.primaryCategory ? categoryMap[media.primaryCategory] : null

  // Extract alt text (Keystone stores as JSON with locale keys)
  let altTextEn = media.filename
  let altTextZh = media.filename
  if (media.altText && typeof media.altText === 'object') {
    altTextEn = media.altText.en || media.filename
    altTextZh = media.altText.zh || media.filename
  }

  // Insert into Payload media table
  const insertResult = await payloadPool.query(`
    INSERT INTO media (
      filename,
      url,
      mime_type,
      filesize,
      width,
      height,
      status,
      prefix,
      primary_category_id,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `, [
    payloadFilename,
    url,
    media.mimeType || 'image/jpeg',
    media.fileSize || 0,
    media.width || null,
    media.height || null,
    media.status === 'ACTIVE' ? 'active' : 'archived',
    'media',
    categoryId,
    media.createdAt || new Date(),
    media.updatedAt || new Date(),
  ])

  const payloadMediaId = insertResult.rows[0].id

  // Insert localized alt text
  await payloadPool.query(`
    INSERT INTO media_locales (_parent_id, _locale, alt)
    VALUES ($1, 'en', $2), ($1, 'zh', $3)
  `, [payloadMediaId, altTextEn, altTextZh])
}

// Run migration
main()
