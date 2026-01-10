/**
 * Regenerate Media Sizes for Payload CMS
 *
 * This script regenerates image variants for all media records that were
 * migrated from Keystone and don't have Payload-generated sizes.
 *
 * Usage:
 *   DATABASE_URI="postgresql://..." npx tsx scripts/regenerate-media-sizes.ts --dry-run
 *   DATABASE_URI="postgresql://..." npx tsx scripts/regenerate-media-sizes.ts
 *   DATABASE_URI="postgresql://..." npx tsx scripts/regenerate-media-sizes.ts --limit=10
 *
 * Prerequisites:
 *   - AWS CLI configured with access to busrom-media-production bucket
 *   - sharp package installed
 */

import { Pool } from 'pg'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// Disable SSL certificate verification for AWS RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media-production'
const S3_REGION = process.env.S3_REGION || 'ap-southeast-1'
const USE_MINIO = process.env.USE_MINIO === 'true'
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000'

// CDN domain depends on environment
const CDN_DOMAIN = USE_MINIO
  ? 'http://localhost:8080'  // Local nginx proxy for MinIO
  : 'https://d2kqew3hn5wphn.cloudfront.net'

// Payload image sizes configuration (must match Media.ts)
// Now with WebP conversion for better performance
const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 300, quality: 80 },
  { name: 'card', width: 768, height: 512, quality: 80 },
  { name: 'tablet', width: 1024, height: undefined, quality: 80 },
  { name: 'desktop', width: 1920, height: undefined, quality: 85 },
]

// Always output WebP for better compression
const OUTPUT_FORMAT = 'webp' as const
const OUTPUT_EXT = 'webp'
const OUTPUT_MIME = 'image/webp'

// Initialize S3 client (supports both AWS S3 and MinIO)
// Uses default AWS credentials from ~/.aws/credentials if not provided via env
const s3Client = new S3Client({
  region: S3_REGION,
  ...(process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY && {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    }),
  ...(USE_MINIO && {
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
  }),
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

// Always convert to WebP for best compression
function getOutputFormat(_mimeType: string): { format: 'webp'; ext: string; outputMime: string } {
  return { format: OUTPUT_FORMAT, ext: OUTPUT_EXT, outputMime: OUTPUT_MIME }
}

async function generateSizes(
  sourceBuffer: Buffer,
  filename: string,
  mimeType: string,
  dryRun: boolean
): Promise<Record<string, SizeInfo>> {
  const sizes: Record<string, SizeInfo> = {}
  const { format, ext, outputMime } = getOutputFormat(mimeType)

  // Get base filename without extension
  const baseName = filename.replace(/\.[^.]+$/, '')

  for (const size of IMAGE_SIZES) {
    try {
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

      // Convert to WebP with quality setting
      const outputBuffer = await sharpInstance.webp({ quality: size.quality }).toBuffer()
      const metadata = await sharp(outputBuffer).metadata()

      // Generate filename for this size
      const sizeFilename = `${baseName}-${metadata.width}x${metadata.height}.${ext}`
      const s3Key = `media/${sizeFilename}`
      const url = `${CDN_DOMAIN}/${s3Key}`

      if (!dryRun) {
        await uploadToS3(s3Key, outputBuffer, outputMime)
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

// Process a single media record
async function processMediaRecord(
  pool: Pool,
  row: MediaRecord,
  index: number,
  total: number,
  dryRun: boolean
): Promise<{ success: boolean; id: number }> {
  const { id, filename, url, mime_type } = row

  try {
    // Determine S3 key - try /media/ path first
    let s3Key = `media/${filename}`

    // Download original image
    let sourceBuffer: Buffer
    try {
      sourceBuffer = await downloadFromS3(s3Key)
    } catch (e) {
      // Try to parse from URL if /media/ doesn't exist
      if (url) {
        const urlPath = url.replace(CDN_DOMAIN, '').replace(/^\//, '')
        s3Key = urlPath.split('?')[0] // Remove query params
        sourceBuffer = await downloadFromS3(s3Key)
      } else {
        throw new Error(`Cannot find source file for ${filename}`)
      }
    }

    // Generate all sizes
    const sizes = await generateSizes(sourceBuffer, filename, mime_type, dryRun)

    if (Object.keys(sizes).length === 0) {
      console.log(`[${index}/${total}] ⚠ ${filename} - No sizes generated`)
      return { success: false, id }
    }

    // Update database with new sizes and correct URL
    const newUrl = `${CDN_DOMAIN}/media/${filename}`

    if (!dryRun) {
      // Build UPDATE query for Payload's flat column structure
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
    }

    console.log(`[${index}/${total}] ✓ ${filename}`)
    return { success: true, id }
  } catch (error: any) {
    console.error(`[${index}/${total}] ✗ ${filename} - ${error.message}`)
    return { success: false, id }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const forceWebp = args.includes('--force-webp') // Force convert all to WebP
  const limitArg = args.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const offsetArg = args.find((a) => a.startsWith('--offset='))
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0
  const concurrencyArg = args.find((a) => a.startsWith('--concurrency='))
  const concurrency = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 10

  console.log('🔧 Regenerate Media Sizes Script')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Force WebP: ${forceWebp ? 'YES' : 'NO'}`)
  console.log(`   Bucket: ${S3_BUCKET}`)
  console.log(`   Concurrency: ${concurrency}`)
  if (limit) console.log(`   Limit: ${limit}`)
  if (offset) console.log(`   Offset: ${offset}`)
  console.log('')

  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri) {
    console.error('❌ DATABASE_URI environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: databaseUri,
    ssl: databaseUri.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Find media records that need sizes regenerated
    let query: string

    if (forceWebp) {
      // Force mode: regenerate all images that are not WebP
      query = `
        SELECT id, filename, url, mime_type, width, height
        FROM media
        WHERE mime_type LIKE 'image/%'
          AND (
            sizes_thumbnail_url IS NULL
            OR sizes_thumbnail_url NOT LIKE '%.webp'
          )
        ORDER BY id
      `
    } else {
      // Normal mode: only process images without sizes or with old /variants/ path
      query = `
        SELECT id, filename, url, mime_type, width, height
        FROM media
        WHERE mime_type LIKE 'image/%'
          AND (
            sizes_thumbnail_url IS NULL
            OR sizes_thumbnail_url = ''
            OR sizes_thumbnail_url LIKE '%/variants/%'
          )
        ORDER BY id
      `
    }

    if (limit) {
      query += ` LIMIT ${limit}`
    }
    if (offset) {
      query += ` OFFSET ${offset}`
    }

    const result = await pool.query<MediaRecord>(query)
    const total = result.rows.length
    console.log(`📊 Found ${total} media records to process`)
    console.log('')

    let succeeded = 0
    let failed = 0
    const startTime = Date.now()

    // Process in batches with concurrency
    for (let i = 0; i < result.rows.length; i += concurrency) {
      const batch = result.rows.slice(i, i + concurrency)
      const batchPromises = batch.map((row, batchIndex) =>
        processMediaRecord(pool, row, i + batchIndex + 1, total, dryRun)
      )

      const batchResults = await Promise.all(batchPromises)

      for (const r of batchResults) {
        if (r.success) succeeded++
        else failed++
      }

      // Progress update every batch
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const processed = Math.min(i + concurrency, total)
      const rate = (processed / (Date.now() - startTime) * 1000).toFixed(1)
      const eta = ((total - processed) / parseFloat(rate)).toFixed(0)
      console.log(`   Progress: ${processed}/${total} (${rate}/s, ETA: ${eta}s)`)
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('')
    console.log('📊 Summary:')
    console.log(`   Processed: ${succeeded + failed}`)
    console.log(`   Succeeded: ${succeeded}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Time: ${totalTime}s`)

    if (dryRun && succeeded > 0) {
      console.log('')
      console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.')
    }
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
