/**
 * Import Media from AWS S3 to Payload CMS
 *
 * This script:
 * 1. Lists all files in AWS S3 bucket (busrom-media-production)
 * 2. Parses filenames to extract metadata based on MIGRATION_GUIDE.md rules
 * 3. Creates Media records in Payload PostgreSQL database
 * 4. Auto-fills tags, primaryCategory, metadata (imageNumber, group, sceneNumber, specs)
 *
 * Usage:
 *   cd payload-cms
 *   npx tsx scripts/import-media-from-aws-s3.ts
 *
 * Environment variables:
 *   - DATABASE_URI: Payload database connection string
 *   - AWS_S3_BUCKET: S3 bucket name (default: busrom-media-production)
 *   - AWS_REGION: AWS region (default: us-east-1)
 *   - AWS_ACCESS_KEY_ID: AWS access key
 *   - AWS_SECRET_ACCESS_KEY: AWS secret key
 *   - CDN_DOMAIN: CloudFront domain (optional, for URL generation)
 */

import 'dotenv/config'
import pg from 'pg'
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'
import path from 'path'

const { Pool } = pg

// Payload database connection
const payloadPool = new Pool({
  connectionString: process.env.DATABASE_URI || 'postgresql://payload_user:payload_dev_password@localhost:5432/payload_dev',
  ssl: process.env.DATABASE_URI?.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
})

// S3 Configuration
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'busrom-media-production'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net'

// S3 Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
})

// Series name mapping (filename prefix → MediaTag name)
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

interface S3Object {
  key: string
  size: number
  lastModified: Date
}

interface MediaCategoryMap {
  [name: string]: number
}

interface MediaTagMap {
  [name: string]: number
}

/**
 * Parse filename to extract metadata
 * Based on MIGRATION_GUIDE.md 16 filename formats
 */
function parseFilename(filename: string): ParsedMetadata | null {
  if (!filename) return null

  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')

  // Split by underscore
  const parts = nameWithoutExt.split('_')

  if (parts.length < 3) {
    // Not enough parts to parse
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
      rawFilename: filename,
    }
  }

  // Get series name
  const seriesName = SERIES_MAPPING[seriesSlug]
  if (!seriesName) {
    // Unknown series - still try to parse
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
  else if (categoryType === 'white' && parts.length >= 5 && parts[2] === 'main') {
    imageNumber = parseInt(parts[parts.length - 1], 10)
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
    imageNumber = parseInt(parts[parts.length - 1], 10)
  }

  if (isNaN(imageNumber)) {
    return null
  }

  // Map category type
  const categoryName = CATEGORY_MAPPING[categoryType]
  if (!categoryName) {
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
    rawFilename: filename,
  }
}

/**
 * List all objects in S3 bucket
 */
async function listAllS3Objects(): Promise<S3Object[]> {
  const objects: S3Object[] = []
  let continuationToken: string | undefined

  console.log(`🔍 Listing objects in S3 bucket: ${S3_BUCKET}`)

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key && !obj.Key.endsWith('/')) {
          // Skip directories and variant files
          if (obj.Key.includes('variants/')) continue

          // Only include image files
          if (!obj.Key.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue

          objects.push({
            key: obj.Key,
            size: obj.Size || 0,
            lastModified: obj.LastModified || new Date(),
          })
        }
      }
    }

    continuationToken = response.NextContinuationToken

    if (objects.length % 500 === 0 && objects.length > 0) {
      console.log(`   Found ${objects.length} images so far...`)
    }
  } while (continuationToken)

  return objects
}

/**
 * Build category name -> ID mapping from Payload database
 */
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

/**
 * Build tag name -> ID mapping from Payload database
 */
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

/**
 * Get existing filenames in Payload database
 */
async function getExistingPayloadFilenames(): Promise<Set<string>> {
  const result = await payloadPool.query(`
    SELECT filename FROM media
  `)
  return new Set(result.rows.map(r => r.filename))
}

/**
 * Get mime type from filename extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }
  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * Create a Media record in Payload database
 */
async function createPayloadMedia(
  s3Object: S3Object,
  categoryMap: MediaCategoryMap,
  tagMap: MediaTagMap
): Promise<void> {
  const filename = path.basename(s3Object.key)

  // Build the URL (use CloudFront CDN if available, otherwise direct S3)
  const url = CDN_DOMAIN
    ? `https://${CDN_DOMAIN}/${s3Object.key}`
    : `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Object.key}`

  // Parse filename to extract metadata
  const parsed = parseFilename(filename)

  // Determine category ID
  let categoryId: number | null = null
  if (parsed) {
    categoryId = categoryMap[parsed.categoryType] || null
  }

  // Insert into Payload media table
  const insertResult = await payloadPool.query(`
    INSERT INTO media (
      filename,
      url,
      mime_type,
      filesize,
      status,
      prefix,
      primary_category_id,
      metadata_image_number,
      metadata_group,
      metadata_scene_number,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `, [
    filename,
    url,
    getMimeType(filename),
    s3Object.size,
    'active',
    'media',
    categoryId,
    parsed?.imageNumber || null,
    parsed?.sceneGroup || null,
    parsed?.sceneNumber || null,
    s3Object.lastModified,
    new Date(),
  ])

  const payloadMediaId = insertResult.rows[0].id

  // Insert localized alt text (use filename as alt text)
  await payloadPool.query(`
    INSERT INTO media_locales (_parent_id, _locale, alt)
    VALUES ($1, 'en', $2), ($1, 'zh', $3)
    ON CONFLICT (_parent_id, _locale) DO NOTHING
  `, [payloadMediaId, filename, filename])

  // If parsed successfully, add tags and specs
  if (parsed) {
    // Insert tag (product series) - skip for common images
    if (parsed.seriesSlug !== 'common') {
      const tagId = tagMap[parsed.seriesName]
      if (tagId) {
        await payloadPool.query(`
          INSERT INTO media_rels (parent_id, path, media_tags_id, "order")
          VALUES ($1, 'tags', $2, 1)
          ON CONFLICT DO NOTHING
        `, [payloadMediaId, tagId])
      }
    }

    // Insert metadata specs (series number, color/finish)
    let specOrder = 1
    if (parsed.seriesNumber) {
      await payloadPool.query(`
        INSERT INTO media_metadata_specs (_parent_id, key, value, id, _order)
        VALUES ($1, 'series', $2, gen_random_uuid(), $3)
        ON CONFLICT DO NOTHING
      `, [payloadMediaId, parsed.seriesNumber, specOrder++])
    }

    if (parsed.colorFinish) {
      await payloadPool.query(`
        INSERT INTO media_metadata_specs (_parent_id, key, value, id, _order)
        VALUES ($1, 'finish', $2, gen_random_uuid(), $3)
        ON CONFLICT DO NOTHING
      `, [payloadMediaId, parsed.colorFinish, specOrder++])
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  Import Media from AWS S3 to Payload CMS')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()
  console.log(`📦 S3 Configuration:`)
  console.log(`   Bucket: ${S3_BUCKET}`)
  console.log(`   Region: ${AWS_REGION}`)
  console.log(`   CDN: ${CDN_DOMAIN || 'None (direct S3)'}`)
  console.log()

  try {
    // Step 1: Build category mapping
    console.log('📁 Building category mapping...')
    const categoryMap = await buildCategoryMap()
    console.log(`   Found ${Object.keys(categoryMap).length} categories`)
    if (Object.keys(categoryMap).length === 0) {
      console.log('   ⚠️  No categories found! Run seed:categories first.')
    }
    console.log()

    // Step 2: Build tag mapping
    console.log('🏷️  Building tag mapping...')
    const tagMap = await buildTagMap()
    console.log(`   Found ${Object.keys(tagMap).length} tags`)
    if (Object.keys(tagMap).length === 0) {
      console.log('   ⚠️  No tags found! Run seed:categories first.')
    }
    console.log()

    // Step 3: Get existing Payload media filenames
    console.log('📋 Checking existing Payload media...')
    const existingFilenames = await getExistingPayloadFilenames()
    console.log(`   Found ${existingFilenames.size} existing media records`)
    console.log()

    // Step 4: List all S3 objects
    console.log('☁️  Fetching S3 objects...')
    const s3Objects = await listAllS3Objects()
    console.log(`   Found ${s3Objects.length} image files in S3`)
    console.log()

    // Step 5: Import media records
    console.log('📤 Importing media records with auto-metadata...')
    let created = 0
    let skipped = 0
    let errors = 0
    const errorMessages: string[] = []

    for (let i = 0; i < s3Objects.length; i++) {
      const s3Object = s3Objects[i]
      const filename = path.basename(s3Object.key)

      if (existingFilenames.has(filename)) {
        skipped++
        continue
      }

      try {
        await createPayloadMedia(s3Object, categoryMap, tagMap)
        created++

        if (created % 100 === 0) {
          console.log(`   Progress: ${created} created, ${skipped} skipped, ${errors} errors (${i + 1}/${s3Objects.length})`)
        }
      } catch (err: any) {
        errors++
        if (errorMessages.length < 10) {
          errorMessages.push(`${filename}: ${err.message}`)
        }
      }
    }

    console.log()
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('  Import Completed!')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()
    console.log(`📊 Summary:`)
    console.log(`   ✅ Created: ${created}`)
    console.log(`   ⏭️  Skipped: ${skipped} (already exist)`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📊 Total processed: ${s3Objects.length}`)

    if (errorMessages.length > 0) {
      console.log()
      console.log('❌ First 10 errors:')
      errorMessages.forEach(msg => console.log(`   - ${msg}`))
    }

    // Verify count
    const countResult = await payloadPool.query('SELECT COUNT(*) FROM media')
    console.log()
    console.log(`📊 Total Media records in database: ${countResult.rows[0].count}`)

  } catch (err: any) {
    console.error('❌ Import failed:', err.message)
    process.exit(1)
  } finally {
    await payloadPool.end()
  }
}

// Run import
main()
