/**
 * Regenerate Media Sizes for Payload CMS (Local MinIO version)
 *
 * This script regenerates image variants for media records that are missing sizes.
 * Designed for local development with MinIO.
 *
 * Usage:
 *   cd payload-cms
 *   npx tsx scripts/regenerate-media-sizes-local.ts --dry-run
 *   npx tsx scripts/regenerate-media-sizes-local.ts
 *   npx tsx scripts/regenerate-media-sizes-local.ts --ids=676,2763,2764,2765
 */

import { Pool } from 'pg'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media'
const S3_REGION = process.env.S3_REGION || 'us-east-1'
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000'
const MEDIA_URL_PREFIX = 'http://localhost:8080' // nginx proxy

// Payload image sizes configuration (must match Media.ts)
const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 300 },
  { name: 'card', width: 768, height: 512 },
  { name: 'tablet', width: 1024, height: undefined },
  { name: 'desktop', width: 1920, height: undefined },
]

// Initialize S3 client for MinIO
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  },
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true, // Required for MinIO
})

interface MediaRecord {
  id: number
  filename: string
  url: string | null
  mime_type: string
  width: number | null
  height: number | null
}

interface SizeInfo {
  url: string
  width: number
  height: number
  mimeType: string
  filesize: number
  filename: string
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })
  const response = await s3Client.send(command)
  return streamToBuffer(response.Body as Readable)
}

async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })
  await s3Client.send(command)
}

function getOutputFormat(mimeType: string): { format: keyof sharp.FormatEnum; ext: string; outputMime: string } {
  if (mimeType === 'image/png') return { format: 'png', ext: 'png', outputMime: 'image/png' }
  if (mimeType === 'image/webp') return { format: 'webp', ext: 'webp', outputMime: 'image/webp' }
  if (mimeType === 'image/avif') return { format: 'avif', ext: 'avif', outputMime: 'image/avif' }
  return { format: 'jpeg', ext: 'jpg', outputMime: 'image/jpeg' }
}

async function generateSizes(
  sourceBuffer: Buffer,
  filename: string,
  mimeType: string,
  dryRun: boolean
): Promise<Record<string, SizeInfo>> {
  const sizes: Record<string, SizeInfo> = {}
  const { format, ext, outputMime } = getOutputFormat(mimeType)

  // Get original image metadata
  const originalMeta = await sharp(sourceBuffer).metadata()
  const originalWidth = originalMeta.width || 1920

  // Get base filename without extension
  const baseName = filename.replace(/\.[^.]+$/, '')

  for (const size of IMAGE_SIZES) {
    try {
      // Skip if original is smaller than target size
      if (originalWidth < size.width) {
        console.log(`      ⏭ Skipping ${size.name}: original (${originalWidth}px) smaller than target (${size.width}px)`)
        continue
      }

      let sharpInstance = sharp(sourceBuffer)

      // Resize with proper options
      if (size.height) {
        // Fixed dimensions - cover and crop
        sharpInstance = sharpInstance.resize(size.width, size.height, {
          fit: 'cover',
          position: 'centre',
        })
      } else {
        // Width only - maintain aspect ratio
        sharpInstance = sharpInstance.resize(size.width, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
      }

      // Convert to target format with quality optimization
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: 85 })
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ compressionLevel: 9 })
      }

      const outputBuffer = await sharpInstance.toBuffer()
      const metadata = await sharp(outputBuffer).metadata()

      // Generate filename for this size
      const sizeFilename = `${baseName}-${metadata.width}x${metadata.height}.${ext}`
      const s3Key = `media/${sizeFilename}`
      const url = `${MEDIA_URL_PREFIX}/media/${sizeFilename}`

      if (!dryRun) {
        await uploadToS3(s3Key, outputBuffer, outputMime)
        console.log(`      ✓ Uploaded ${size.name}: ${sizeFilename} (${(outputBuffer.length / 1024).toFixed(0)}KB)`)
      } else {
        console.log(`      [DRY] Would upload ${size.name}: ${sizeFilename} (${(outputBuffer.length / 1024).toFixed(0)}KB)`)
      }

      sizes[size.name] = {
        url,
        width: metadata.width || size.width,
        height: metadata.height || size.height || 0,
        mimeType: outputMime,
        filesize: outputBuffer.length,
        filename: sizeFilename,
      }
    } catch (error) {
      console.error(`      ✗ Failed to generate ${size.name}:`, error)
    }
  }

  return sizes
}

async function processMediaRecord(
  pool: Pool,
  row: MediaRecord,
  index: number,
  total: number,
  dryRun: boolean
): Promise<{ success: boolean; id: number }> {
  const { id, filename, mime_type } = row

  console.log(`\n[${index}/${total}] Processing: ${filename} (ID: ${id})`)

  try {
    // Determine S3 key
    const s3Key = `media/${filename}`

    // Download original image
    console.log(`   Downloading from S3: ${s3Key}`)
    const sourceBuffer = await downloadFromS3(s3Key)
    console.log(`   Downloaded: ${(sourceBuffer.length / 1024 / 1024).toFixed(2)}MB`)

    // Generate all sizes
    const sizes = await generateSizes(sourceBuffer, filename, mime_type, dryRun)

    if (Object.keys(sizes).length === 0) {
      console.log(`   ⚠ No sizes generated (image may be too small)`)
      return { success: false, id }
    }

    // Update database with new sizes
    const newUrl = `${MEDIA_URL_PREFIX}/media/${filename}`

    if (!dryRun) {
      const updateQuery = `
        UPDATE media SET
          url = $1,
          sizes_thumbnail_url = $2,
          sizes_thumbnail_width = $3,
          sizes_thumbnail_height = $4,
          sizes_thumbnail_mime_type = $5,
          sizes_thumbnail_filesize = $6,
          sizes_thumbnail_filename = $7,
          sizes_card_url = $8,
          sizes_card_width = $9,
          sizes_card_height = $10,
          sizes_card_mime_type = $11,
          sizes_card_filesize = $12,
          sizes_card_filename = $13,
          sizes_tablet_url = $14,
          sizes_tablet_width = $15,
          sizes_tablet_height = $16,
          sizes_tablet_mime_type = $17,
          sizes_tablet_filesize = $18,
          sizes_tablet_filename = $19,
          sizes_desktop_url = $20,
          sizes_desktop_width = $21,
          sizes_desktop_height = $22,
          sizes_desktop_mime_type = $23,
          sizes_desktop_filesize = $24,
          sizes_desktop_filename = $25
        WHERE id = $26
      `

      const thumbnail = sizes.thumbnail || { url: null, width: null, height: null, mimeType: null, filesize: null, filename: null }
      const card = sizes.card || { url: null, width: null, height: null, mimeType: null, filesize: null, filename: null }
      const tablet = sizes.tablet || { url: null, width: null, height: null, mimeType: null, filesize: null, filename: null }
      const desktop = sizes.desktop || { url: null, width: null, height: null, mimeType: null, filesize: null, filename: null }

      await pool.query(updateQuery, [
        newUrl,
        thumbnail.url, thumbnail.width, thumbnail.height, thumbnail.mimeType, thumbnail.filesize, thumbnail.filename,
        card.url, card.width, card.height, card.mimeType, card.filesize, card.filename,
        tablet.url, tablet.width, tablet.height, tablet.mimeType, tablet.filesize, tablet.filename,
        desktop.url, desktop.width, desktop.height, desktop.mimeType, desktop.filesize, desktop.filename,
        id,
      ])
      console.log(`   ✓ Database updated`)
    }

    console.log(`   ✓ Completed`)
    return { success: true, id }
  } catch (error: any) {
    console.error(`   ✗ Failed: ${error.message}`)
    return { success: false, id }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const idsArg = args.find((a) => a.startsWith('--ids='))
  const ids = idsArg ? idsArg.split('=')[1].split(',').map(Number) : null

  console.log('🔧 Regenerate Media Sizes Script (Local MinIO)')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   S3 Endpoint: ${S3_ENDPOINT}`)
  console.log(`   Bucket: ${S3_BUCKET}`)
  if (ids) console.log(`   Target IDs: ${ids.join(', ')}`)
  console.log('')

  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri) {
    console.error('❌ DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUri })

  try {
    let query: string
    let params: any[] = []

    if (ids && ids.length > 0) {
      // Process specific IDs
      query = `
        SELECT id, filename, url, mime_type, width, height
        FROM media
        WHERE id = ANY($1)
          AND mime_type LIKE 'image/%'
        ORDER BY id
      `
      params = [ids]
    } else {
      // Find media records that need sizes regenerated
      query = `
        SELECT id, filename, url, mime_type, width, height
        FROM media
        WHERE mime_type LIKE 'image/%'
          AND (
            sizes_desktop_url IS NULL
            OR sizes_desktop_url = ''
            OR sizes_desktop_url NOT LIKE '%/media/%'
          )
        ORDER BY id
      `
    }

    const result = await pool.query<MediaRecord>(query, params)
    const total = result.rows.length

    if (total === 0) {
      console.log('✅ No media records need processing')
      return
    }

    console.log(`📊 Found ${total} media records to process`)

    let succeeded = 0
    let failed = 0

    for (let i = 0; i < result.rows.length; i++) {
      const res = await processMediaRecord(pool, result.rows[i], i + 1, total, dryRun)
      if (res.success) succeeded++
      else failed++
    }

    console.log('\n📊 Summary:')
    console.log(`   Processed: ${succeeded + failed}`)
    console.log(`   Succeeded: ${succeeded}`)
    console.log(`   Failed: ${failed}`)

    if (dryRun && succeeded > 0) {
      console.log('\nℹ️  This was a dry run. Run without --dry-run to apply changes.')
    }
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
