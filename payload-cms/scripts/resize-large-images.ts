/**
 * Resize Large Images in S3
 *
 * This script finds images larger than 10MB and resizes them proportionally
 * (not cropping) to reduce file size while maintaining aspect ratio.
 *
 * Usage:
 *   # Dry run - only list large images
 *   DATABASE_URI="postgresql://..." npx tsx scripts/resize-large-images.ts --dry-run
 *
 *   # Actually resize (backs up originals first)
 *   DATABASE_URI="postgresql://..." npx tsx scripts/resize-large-images.ts
 *
 *   # Custom max dimension (default 3000px)
 *   DATABASE_URI="postgresql://..." npx tsx scripts/resize-large-images.ts --max-dimension=2000
 *
 *   # Custom size threshold (default 10MB)
 *   DATABASE_URI="postgresql://..." npx tsx scripts/resize-large-images.ts --min-size=5
 *
 *   # Limit number of images to process
 *   DATABASE_URI="postgresql://..." npx tsx scripts/resize-large-images.ts --limit=10
 *
 * Prerequisites:
 *   - DATABASE_URI environment variable set
 *   - S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY configured
 */

import { Pool } from 'pg'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// Disable SSL certificate verification for AWS RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media-production'
const S3_REGION = process.env.S3_REGION || 'ap-southeast-1'
const USE_MINIO = process.env.USE_MINIO === 'true'
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000'

const CDN_DOMAIN = USE_MINIO
  ? 'http://localhost:8080'
  : 'https://d2kqew3hn5wphn.cloudfront.net'

// Initialize S3 client
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
  filesize: number | null
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

async function backupToS3(sourceKey: string, backupKey: string): Promise<void> {
  const command = new CopyObjectCommand({
    Bucket: S3_BUCKET,
    CopySource: `${S3_BUCKET}/${sourceKey}`,
    Key: backupKey,
  })
  await s3Client.send(command)
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(bytes / 1024).toFixed(2)} KB`
}

async function resizeImage(
  sourceBuffer: Buffer,
  maxDimension: number,
  quality: number = 85
): Promise<{ buffer: Buffer; width: number; height: number; format: string }> {
  const metadata = await sharp(sourceBuffer).metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0

  // Determine output format based on original
  let format: 'jpeg' | 'png' | 'webp' = 'jpeg'
  if (metadata.format === 'png') {
    format = 'png'
  } else if (metadata.format === 'webp') {
    format = 'webp'
  }

  // Resize proportionally - fit inside max dimension
  let sharpInstance = sharp(sourceBuffer).resize(maxDimension, maxDimension, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  let outputBuffer: Buffer
  if (format === 'jpeg') {
    outputBuffer = await sharpInstance.jpeg({ quality }).toBuffer()
  } else if (format === 'png') {
    outputBuffer = await sharpInstance.png({ quality: Math.round(quality / 10) }).toBuffer()
  } else {
    outputBuffer = await sharpInstance.webp({ quality }).toBuffer()
  }

  const outputMetadata = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    format,
  }
}

async function processMediaRecord(
  pool: Pool,
  row: MediaRecord,
  index: number,
  total: number,
  maxDimension: number,
  quality: number,
  dryRun: boolean
): Promise<{ success: boolean; id: number; originalSize: number; newSize: number }> {
  const { id, filename, url, mime_type, filesize } = row

  try {
    // Determine S3 key
    let s3Key = `media/${filename}`

    // Download original image
    let sourceBuffer: Buffer
    try {
      sourceBuffer = await downloadFromS3(s3Key)
    } catch (e) {
      // Try to parse from URL if /media/ doesn't exist
      if (url) {
        const urlPath = url.replace(CDN_DOMAIN, '').replace(/^\//, '')
        s3Key = urlPath.split('?')[0]
        sourceBuffer = await downloadFromS3(s3Key)
      } else {
        throw new Error(`Cannot find source file for ${filename}`)
      }
    }

    const originalSize = sourceBuffer.length
    const originalMetadata = await sharp(sourceBuffer).metadata()

    if (dryRun) {
      console.log(
        `[${index}/${total}] 📊 ${filename}` +
          `\n         Size: ${formatSize(originalSize)}` +
          `\n         Dimensions: ${originalMetadata.width}x${originalMetadata.height}` +
          `\n         Would resize to max ${maxDimension}px`
      )
      return { success: true, id, originalSize, newSize: originalSize }
    }

    // Backup original to /backup/ folder
    const backupKey = `backup/large-images/${filename}`
    await backupToS3(s3Key, backupKey)
    console.log(`[${index}/${total}] 💾 Backed up: ${filename}`)

    // Resize the image
    const resized = await resizeImage(sourceBuffer, maxDimension, quality)

    // Upload resized image (overwrite original)
    const contentType =
      resized.format === 'jpeg'
        ? 'image/jpeg'
        : resized.format === 'png'
          ? 'image/png'
          : 'image/webp'
    await uploadToS3(s3Key, resized.buffer, contentType)

    // Update database with new dimensions and filesize
    // Also clear sizes to trigger regeneration if needed
    await pool.query(
      `UPDATE media SET
        width = $1,
        height = $2,
        filesize = $3,
        sizes_thumbnail_url = NULL,
        sizes_thumbnail_width = NULL,
        sizes_thumbnail_height = NULL,
        sizes_thumbnail_filesize = NULL,
        sizes_card_url = NULL,
        sizes_card_width = NULL,
        sizes_card_height = NULL,
        sizes_card_filesize = NULL,
        sizes_tablet_url = NULL,
        sizes_tablet_width = NULL,
        sizes_tablet_height = NULL,
        sizes_tablet_filesize = NULL,
        sizes_desktop_url = NULL,
        sizes_desktop_width = NULL,
        sizes_desktop_height = NULL,
        sizes_desktop_filesize = NULL
      WHERE id = $4`,
      [resized.width, resized.height, resized.buffer.length, id]
    )

    const reduction = ((1 - resized.buffer.length / originalSize) * 100).toFixed(1)

    console.log(
      `[${index}/${total}] ✅ ${filename}` +
        `\n         ${formatSize(originalSize)} → ${formatSize(resized.buffer.length)} (${reduction}% smaller)` +
        `\n         ${originalMetadata.width}x${originalMetadata.height} → ${resized.width}x${resized.height}`
    )

    return { success: true, id, originalSize, newSize: resized.buffer.length }
  } catch (error: any) {
    console.error(`[${index}/${total}] ❌ ${filename} - ${error.message}`)
    return { success: false, id, originalSize: filesize || 0, newSize: filesize || 0 }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  // Parse arguments
  const maxDimArg = args.find((a) => a.startsWith('--max-dimension='))
  const maxDimension = maxDimArg ? parseInt(maxDimArg.split('=')[1], 10) : 3000

  const minSizeArg = args.find((a) => a.startsWith('--min-size='))
  const minSizeMB = minSizeArg ? parseInt(minSizeArg.split('=')[1], 10) : 10
  const minSizeBytes = minSizeMB * 1024 * 1024

  const qualityArg = args.find((a) => a.startsWith('--quality='))
  const quality = qualityArg ? parseInt(qualityArg.split('=')[1], 10) : 85

  const limitArg = args.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  const offsetArg = args.find((a) => a.startsWith('--offset='))
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0

  console.log('🖼️  Resize Large Images Script')
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will resize images)'}`)
  console.log(`   Min Size: ${minSizeMB} MB`)
  console.log(`   Max Dimension: ${maxDimension}px`)
  console.log(`   Quality: ${quality}`)
  console.log(`   Bucket: ${S3_BUCKET}`)
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
    // Find large media records
    let query = `
      SELECT id, filename, url, mime_type, width, height, filesize
      FROM media
      WHERE mime_type LIKE 'image/%'
        AND filesize > $1
      ORDER BY filesize DESC
    `

    const queryParams: any[] = [minSizeBytes]

    if (limit) {
      query += ` LIMIT $2`
      queryParams.push(limit)
    }
    if (offset) {
      query += ` OFFSET $${queryParams.length + 1}`
      queryParams.push(offset)
    }

    const result = await pool.query<MediaRecord>(query, queryParams)
    const total = result.rows.length

    if (total === 0) {
      console.log(`✨ No images found larger than ${minSizeMB} MB`)
      return
    }

    console.log(`📊 Found ${total} images larger than ${minSizeMB} MB`)
    console.log('')

    // Calculate total size
    const totalOriginalSize = result.rows.reduce((sum, row) => sum + (row.filesize || 0), 0)
    console.log(`📦 Total size: ${formatSize(totalOriginalSize)}`)
    console.log('')

    let succeeded = 0
    let failed = 0
    let totalSavedBytes = 0
    const startTime = Date.now()

    // Process one at a time to avoid memory issues with large images
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i]
      const processResult = await processMediaRecord(
        pool,
        row,
        i + 1,
        total,
        maxDimension,
        quality,
        dryRun
      )

      if (processResult.success) {
        succeeded++
        totalSavedBytes += processResult.originalSize - processResult.newSize
      } else {
        failed++
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('')
    console.log('📊 Summary:')
    console.log(`   Processed: ${succeeded + failed}`)
    console.log(`   Succeeded: ${succeeded}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Time: ${totalTime}s`)

    if (!dryRun && totalSavedBytes > 0) {
      console.log(`   Space saved: ${formatSize(totalSavedBytes)}`)
    }

    if (dryRun && succeeded > 0) {
      console.log('')
      console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.')
      console.log('   Originals will be backed up to: s3://bucket/backup/large-images/')
    }
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
