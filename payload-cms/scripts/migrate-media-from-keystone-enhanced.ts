/**
 * Migrate Media from Keystone CMS to Payload CMS (Enhanced with Auto-Metadata)
 *
 * This script:
 * 1. Reads all Media records from Keystone PostgreSQL
 * 2. Creates corresponding Media records in Payload
 * 3. Points to the same S3 files (no re-upload needed)
 * 4. **AUTO-FILLS metadata, tags, category based on filename parsing rules**
 *
 * Usage:
 *   npx tsx scripts/migrate-media-from-keystone-enhanced.ts
 *
 * Environment variables:
 *   - DATABASE_URI: Payload database connection string
 *   - AWS_S3_BUCKET: S3 bucket name (default: busrom-media)
 *   - AWS_REGION: AWS region (default: us-east-1)
 *   - S3_ENDPOINT: S3 endpoint URL (for MinIO local dev, or leave empty for AWS production)
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// Keystone database connection
const keystonePool = new Pool({
  host: process.env.KEYSTONE_DB_HOST || 'localhost',
  port: parseInt(process.env.KEYSTONE_DB_PORT || '5432'),
  database: process.env.KEYSTONE_DB_NAME || 'busrom_cms',
  user: process.env.KEYSTONE_DB_USER || 'busrom',
  password: process.env.KEYSTONE_DB_PASSWORD || 'busrom_dev_password',
})

// Payload database connection
const payloadPool = new Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://busrom_dev:busrom_dev_password@localhost:5432/busrom_payload',
})

// S3 Configuration
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'busrom-media'
const S3_ENDPOINT = process.env.S3_ENDPOINT // For MinIO: http://localhost:9000, For AWS: leave empty
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

// Series name mapping (alt text format → MediaTag name)
const SERIES_MAPPING: Record<string, string> = {
  'glass-standoff': 'Glass Standoff',
  'glass-connected-fitting': 'Glass Connected Fitting',
  'glass-fence-spigot': 'Glass Fence Spigot',
  'guardrail-glass-clip': 'Guardrail Glass Clip',
  'bathroom-glass-clip': 'Bathroom Glass Clip',
  'glass-hinge': 'Glass Hinge',
  'sliding-door-kit': 'Sliding Door Kit',
  'bathroom-door-handle': 'Bathroom & Door Handle',
  'hidden-hook': 'Hidden Hook',
}

// Category mapping (type from filename → MediaCategory name)
const CATEGORY_MAPPING: Record<string, string> = {
  'white': 'white',
  'scene': 'scene',
  'real': 'real',
  'size': 'size',
  'general': 'general',
  'combo': 'combo',
  'multi-style': 'multi-style',
  'showcase': 'showcase',
  'effect': 'effect',
  'product': 'product',
  'craft': 'craft',
  'packaging': 'packaging',
  'color': 'color',
}

interface ParsedMetadata {
  seriesSlug: string
  seriesName: string
  categoryType: string
  imageNumber: number
  sceneGroup?: number
  sceneNumber?: number
  seriesNumber?: string  // Product series number (e.g., "BRS-001")
  colorFinish?: string   // Color/finish (e.g., "black", "gold", "ss-brushed")
  rawFilename: string
}

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
  [keystoneIdOrName: string]: number
}

interface MediaTagMap {
  [tagName: string]: number
}

/**
 * Parse filename to extract metadata
 *
 * Formats:
 * 1. Simple: {series}_{type}_{number}.jpg
 * 2. White with main subtype: {series}_white_main_{subtype}_{number}.jpg
 * 3. White with series number: {series}_white_s-10_{number}.jpg
 * 4. White with series + color: {series}_white_s-10_{color}_{number}.jpg
 * 5. White multi-level: {series}_white_{shape}_{number}.jpg
 * 6. Product type: {series}_product_s-1_{number}.jpg
 * 7. Scene with group: {series}_scene_{sceneType}_g-01_{view}_{number}.jpg
 * 8. Scene with letter: {series}_scene_{sceneType}_{letter}_{number}.jpg
 * 9. Common images: common_{type}_{number}.ext
 */
function parseFilename(altText: string): ParsedMetadata | null {
  if (!altText) return null

  // Remove file extension
  const nameWithoutExt = altText.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')

  // Split by underscore
  const parts = nameWithoutExt.split('_')

  if (parts.length < 3) {
    console.log(`⚠️  Cannot parse: ${altText} (too few parts)`)
    return null
  }

  const seriesSlug = parts[0]
  const categoryType = parts[1]

  // Handle common/general images (no product series)
  if (seriesSlug === 'common') {
    const imageNumber = parseInt(parts[parts.length - 1], 10)
    if (isNaN(imageNumber)) {
      return null
    }

    return {
      seriesSlug: 'common',
      seriesName: 'Common',
      categoryType: categoryType,
      imageNumber,
      rawFilename: altText,
    }
  }

  // Get series name
  const seriesName = SERIES_MAPPING[seriesSlug]
  if (!seriesName) {
    console.log(`⚠️  Unknown series: ${seriesSlug} in ${altText}`)
    return null
  }

  let imageNumber: number
  let sceneGroup: number | undefined
  let sceneNumber: number | undefined
  let seriesNumber: string | undefined
  let colorFinish: string | undefined

  // Check if it's a white image with series number (s-1, s-2, etc.)
  if (categoryType === 'white' && parts.length >= 4 && parts[2].match(/^s-\d+$/)) {
    const sNum = parts[2].match(/^s-(\d+)$/)![1]
    seriesNumber = `BRS-${sNum.padStart(3, '0')}`

    if (parts.length === 4) {
      imageNumber = parseInt(parts[3], 10)
    } else if (parts.length === 5) {
      colorFinish = parts[3]
      imageNumber = parseInt(parts[4], 10)
    } else {
      // Multi-color: skip specs
      imageNumber = parseInt(parts[parts.length - 1], 10)
      seriesNumber = undefined
    }
  }
  // Check if it's a white_main image
  else if (categoryType === 'white' && parts.length >= 4 && parts[2] === 'main') {
    imageNumber = parseInt(parts[4], 10)
  }
  // Check if it's a white image with multi-level hierarchy
  else if (categoryType === 'white' && parts.length >= 4) {
    imageNumber = parseInt(parts[parts.length - 1], 10)
  }
  // Check if it's a product type image
  else if (categoryType === 'product' && parts.length >= 4) {
    if (parts[2].match(/^s-\d+$/)) {
      const sNum = parts[2].match(/^s-(\d+)$/)![1]
      seriesNumber = `BRS-${sNum.padStart(3, '0')}`
      imageNumber = parseInt(parts[3], 10)
    } else {
      imageNumber = parseInt(parts[parts.length - 1], 10)
    }
  }
  // Check if it's a scene image
  else if (categoryType === 'scene') {
    // Scene formats:
    // 1. {series}_scene_g-{group}_sn-{sceneNumber}_{imageNumber}.jpg
    // 2. {series}_scene_sn-{sceneNumber}_{imageNumber}.jpg
    // 3. {series}_scene_{sceneType}_s-{seriesNum}_{number}.jpg
    // 4. {series}_scene_{sceneType}_g-{group}_{view?}_{number}.jpg
    // 5. {series}_scene_{letter}_{number}.jpg

    if (parts.length >= 4) {
      // Check for g-X_sn-Y format
      const part2 = parts[2] // e.g., "g-1"
      const part3 = parts[3] // e.g., "sn-1"

      const groupMatch = part2.match(/^g-(\d+)$/)
      const sceneNumMatch = part3.match(/^sn-(\d+)$/)

      if (groupMatch && sceneNumMatch) {
        // Format: {series}_scene_g-1_sn-1_007.jpg
        sceneGroup = parseInt(groupMatch[1], 10)
        sceneNumber = parseInt(sceneNumMatch[1], 10)
        imageNumber = parseInt(parts[4], 10)
      } else if (part2.match(/^sn-(\d+)$/)) {
        // Format: {series}_scene_sn-6_010.jpg (no group)
        const snMatch = part2.match(/^sn-(\d+)$/)!
        sceneNumber = parseInt(snMatch[1], 10)
        imageNumber = parseInt(parts[3], 10)
      } else if (parts.length >= 5) {
        // Old format: {series}_scene_{sceneType}_{...}
        const sceneType = part2
        const part3Val = parts[3]

        // Check for series number in scene
        if (part3Val.match(/^s-\d+$/)) {
          // Format: {series}_scene_door_s-6_003.jpg
          const sNum = part3Val.match(/^s-(\d+)$/)![1]
          seriesNumber = `BRS-${sNum.padStart(3, '0')}`
          imageNumber = parseInt(parts[4], 10)
        } else {
          const groupMatch2 = part3Val.match(/^g-(\d+)$/)
          if (groupMatch2) {
            sceneGroup = parseInt(groupMatch2[1], 10)
            imageNumber = parts.length >= 6
              ? parseInt(parts[parts.length - 1], 10)
              : parseInt(parts[4], 10)
          } else if (part3Val.match(/^[a-z]$/)) {
            // Single letter (n, a, b, etc.)
            imageNumber = parseInt(parts[4], 10)
          } else {
            imageNumber = parseInt(parts[parts.length - 1], 10)
          }
        }
      } else {
        // Fallback
        imageNumber = parseInt(parts[parts.length - 1], 10)
      }
    } else {
      // Fallback: last part is number
      imageNumber = parseInt(parts[parts.length - 1], 10)
    }
  } else {
    // Simple format
    imageNumber = parseInt(parts[2], 10)
  }

  if (isNaN(imageNumber)) {
    console.log(`⚠️  Invalid number in: ${altText}`)
    return null
  }

  // Map category type
  const categoryName = CATEGORY_MAPPING[categoryType]
  if (!categoryName) {
    console.log(`⚠️  Unknown category: ${categoryType} in ${altText}`)
    return null
  }

  return {
    seriesSlug,
    seriesName,
    categoryType: categoryName,
    imageNumber,
    sceneGroup,
    sceneNumber,
    seriesNumber,
    colorFinish,
    rawFilename: altText,
  }
}

async function buildCategoryMap(): Promise<MediaCategoryMap> {
  const result = await payloadPool.query(`
    SELECT id, name FROM media_categories
  `)

  const map: MediaCategoryMap = {}
  for (const row of result.rows) {
    map[row.name] = row.id
  }

  return map
}

async function buildTagMap(): Promise<MediaTagMap> {
  const result = await payloadPool.query(`
    SELECT id, name FROM media_tags
  `)

  const map: MediaTagMap = {}
  for (const row of result.rows) {
    map[row.name] = row.id
  }

  return map
}

async function getExistingPayloadFilenames(): Promise<Set<string>> {
  const result = await payloadPool.query(`
    SELECT filename FROM media
  `)
  return new Set(result.rows.map(r => r.filename))
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
  categoryMap: MediaCategoryMap,
  tagMap: MediaTagMap
): Promise<void> {
  // Build the URL
  const url = S3_ENDPOINT
    ? `${S3_ENDPOINT}/${S3_BUCKET}/${payloadFilename}`
    : `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${payloadFilename}`

  // Extract alt text (Keystone stores as JSON with locale keys)
  let altTextEn = media.filename
  let altTextZh = media.filename
  if (media.altText && typeof media.altText === 'object') {
    altTextEn = media.altText.en || media.filename
    altTextZh = media.altText.zh || media.filename
  }

  // Parse filename to extract metadata
  const parsed = parseFilename(altTextEn)

  // Determine category ID
  let categoryId: number | null = null
  if (parsed) {
    // Use parsed category (from filename)
    categoryId = categoryMap[parsed.categoryType] || null
  } else if (media.primaryCategory) {
    // Fallback to Keystone category if parse failed
    categoryId = categoryMap[media.primaryCategory] || null
  }

  // Insert into Payload media table with metadata fields
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
      metadata_image_number,
      metadata_group,
      metadata_scene_number,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
    parsed?.imageNumber || null,
    parsed?.sceneGroup || null,
    parsed?.sceneNumber || null,
    media.createdAt || new Date(),
    media.updatedAt || new Date(),
  ])

  const payloadMediaId = insertResult.rows[0].id

  // Insert localized alt text
  await payloadPool.query(`
    INSERT INTO media_locales (_parent_id, _locale, alt)
    VALUES ($1, 'en', $2), ($1, 'zh', $3)
  `, [payloadMediaId, altTextEn, altTextZh])

  // If parsed successfully, add tags and specs
  if (parsed) {
    // Insert tag (product series) - skip for common images
    if (parsed.seriesSlug !== 'common') {
      const tagId = tagMap[parsed.seriesName]
      if (tagId) {
        await payloadPool.query(`
          INSERT INTO media_rels (parent_id, path, media_tags_id, order)
          VALUES ($1, 'tags', $2, 1)
        `, [payloadMediaId, tagId])
      }
    }

    // Insert metadata specs (series number, color/finish)
    if (parsed.seriesNumber) {
      await payloadPool.query(`
        INSERT INTO media_metadata_specs (_parent_id, key, value, id)
        VALUES ($1, 'series', $2, gen_random_uuid())
      `, [payloadMediaId, parsed.seriesNumber])
    }

    if (parsed.colorFinish) {
      await payloadPool.query(`
        INSERT INTO media_metadata_specs (_parent_id, key, value, id)
        VALUES ($1, 'finish', $2, gen_random_uuid())
      `, [payloadMediaId, parsed.colorFinish])
    }
  }
}

async function main() {
  console.log('🚀 Starting Enhanced Media migration from Keystone to Payload...\n')
  console.log(`📦 S3 Configuration:`)
  console.log(`   Bucket: ${S3_BUCKET}`)
  console.log(`   Endpoint: ${S3_ENDPOINT || 'AWS S3'}`)
  console.log(`   Region: ${AWS_REGION}\n`)

  try {
    // Step 1: Build category mapping
    console.log('📁 Building category mapping...')
    const categoryMap = await buildCategoryMap()
    console.log(`   Found ${Object.keys(categoryMap).length} categories\n`)

    // Step 2: Build tag mapping
    console.log('🏷️  Building tag mapping...')
    const tagMap = await buildTagMap()
    console.log(`   Found ${Object.keys(tagMap).length} tags\n`)

    // Step 3: Get existing Payload media filenames
    console.log('📋 Checking existing Payload media...')
    const existingFilenames = await getExistingPayloadFilenames()
    console.log(`   Found ${existingFilenames.size} existing media records\n`)

    // Step 4: Get all Keystone media records
    console.log('📥 Fetching Keystone media records...')
    const keystoneMedia = await getKeystoneMedia()
    console.log(`   Found ${keystoneMedia.length} Keystone media records\n`)

    // Step 5: Migrate media records
    console.log('📤 Migrating media records with auto-metadata...')
    let created = 0
    let skipped = 0
    let errors = 0

    for (const media of keystoneMedia) {
      const payloadFilename = media.fileKey

      if (existingFilenames.has(payloadFilename)) {
        skipped++
        continue
      }

      try {
        await createPayloadMedia(media, payloadFilename, categoryMap, tagMap)
        created++
        if (created % 100 === 0) {
          console.log(`   Progress: ${created} created, ${skipped} skipped, ${errors} errors`)
        }
      } catch (err: any) {
        errors++
        if (errors <= 10) {
          console.error(`   ❌ Error creating ${media.filename}: ${err.message}`)
        }
      }
    }

    console.log('\n✅ Migration completed!')
    console.log(`📊 Summary:`)
    console.log(`   - ${created} media records created with auto-metadata`)
    console.log(`   - ${skipped} media records skipped (already exist)`)
    console.log(`   - ${errors} errors encountered`)

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await keystonePool.end()
    await payloadPool.end()
  }
}

// Run migration
main()
