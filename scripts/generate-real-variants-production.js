#!/usr/bin/env node

/**
 * Generate Real Image Variants for Batch-Imported Media
 *
 * 为批量导入的媒体文件生成真正的变体：
 * - thumbnail (150x150)
 * - small (400px)
 * - medium (800px)
 * - large (1200px)
 * - xlarge (1920px)
 * - webp
 *
 * Run:
 *   DATABASE_URL="..." S3_BUCKET_NAME="busrom-media-production" S3_REGION="us-east-1" \
 *   CDN_DOMAIN="d2kqew3hn5wphn.cloudfront.net" node scripts/generate-real-variants-production.js
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')

const prisma = new PrismaClient()

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'busrom-media-production'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd2kqew3hn5wphn.cloudfront.net'

// Size variants configuration
const SIZE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  small: { width: 400, height: null, fit: 'inside' },
  medium: { width: 800, height: null, fit: 'inside' },
  large: { width: 1200, height: null, fit: 'inside' },
  xlarge: { width: 1920, height: null, fit: 'inside' },
}

// Concurrency
const CONCURRENCY = 5

/**
 * Download image from S3
 */
async function downloadFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const response = await s3Client.send(command)
  const chunks = []

  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/**
 * Upload buffer to S3
 */
async function uploadToS3(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  })

  await s3Client.send(command)
  return `https://${CDN_DOMAIN}/${key}`
}

/**
 * Generate variants for a single media record
 */
async function generateVariantsForMedia(media) {
  const { id, filename, fileKey, fileUrl } = media

  // Determine S3 key
  let s3Key = fileKey
  if (!s3Key && fileUrl) {
    // Extract key from CDN URL
    const url = new URL(fileUrl)
    s3Key = url.pathname.replace(/^\//, '')
  }

  if (!s3Key) {
    return { success: false, id, filename, error: 'No fileKey or fileUrl' }
  }

  console.log(`\n[${filename}]`)
  console.log(`  S3 Key: ${s3Key}`)

  try {
    // Download original image
    const originalBuffer = await downloadFromS3(s3Key)
    const metadata = await sharp(originalBuffer).metadata()

    console.log(`  Size: ${metadata.width}x${metadata.height}`)

    // Generate base filename (without extension)
    const baseFilename = filename.replace(/\.[^/.]+$/, '')

    const variants = {}

    // Generate size variants
    for (const [sizeName, config] of Object.entries(SIZE_VARIANTS)) {
      let transformer = sharp(originalBuffer)

      if (config.width || config.height) {
        transformer = transformer.resize({
          width: config.width,
          height: config.height,
          fit: config.fit,
          withoutEnlargement: true,
        })
      }

      const resizedBuffer = await transformer
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()

      const variantKey = `variants/${sizeName}/${baseFilename}.jpg`
      const variantUrl = await uploadToS3(variantKey, resizedBuffer, 'image/jpeg')
      variants[sizeName] = variantUrl

      console.log(`  ✓ ${sizeName}`)
    }

    // Generate WebP variant
    const webpBuffer = await sharp(originalBuffer)
      .webp({ quality: 85 })
      .toBuffer()

    const webpKey = `variants/webp/${baseFilename}.webp`
    const webpUrl = await uploadToS3(webpKey, webpBuffer, 'image/webp')
    variants.webp = webpUrl

    console.log(`  ✓ webp`)

    // Also keep the original URL
    variants.original = fileUrl || `https://${CDN_DOMAIN}/${s3Key}`

    // Update database
    await prisma.media.update({
      where: { id },
      data: {
        width: metadata.width,
        height: metadata.height,
        fileSize: originalBuffer.length,
        mimeType: `image/${metadata.format}`,
        variants,
      },
    })

    console.log(`  ✅ Done`)
    return { success: true, id, filename }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`)
    return { success: false, id, filename, error: error.message }
  }
}

/**
 * Process items in batches with concurrency
 */
async function processInBatches(items, batchSize, processFn) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    console.log(`\n=== Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} ===`)

    const batchResults = await Promise.all(batch.map(processFn))
    results.push(...batchResults)

    const succeeded = batchResults.filter(r => r.success).length
    const failed = batchResults.filter(r => !r.success).length
    console.log(`Batch complete: ${succeeded} success, ${failed} failed`)
  }

  return results
}

/**
 * Main function
 */
async function main() {
  console.log('=== Generate Real Variants for Production ===')
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`CDN: ${CDN_DOMAIN}`)
  console.log(`Concurrency: ${CONCURRENCY}`)
  console.log('')

  // Find media that needs real variants
  // Check for records where variants all point to the same URL (fake variants)
  const allMedia = await prisma.media.findMany({
    select: {
      id: true,
      filename: true,
      fileKey: true,
      fileUrl: true,
      variants: true,
    },
  })

  // Filter: find media where all variant URLs are the same (fake variants)
  const needsVariants = allMedia.filter(media => {
    if (!media.variants) return true

    const variantUrls = Object.values(media.variants)
    if (variantUrls.length === 0) return true

    // Check if all URLs are the same (fake variants)
    const uniqueUrls = new Set(variantUrls)
    return uniqueUrls.size === 1
  })

  console.log(`Found ${needsVariants.length} media records needing real variants`)
  console.log(`(Total media: ${allMedia.length})`)

  if (needsVariants.length === 0) {
    console.log('\nAll media already have real variants!')
    return
  }

  const estimatedMinutes = Math.ceil(needsVariants.length / CONCURRENCY * 3 / 60)
  console.log(`\nEstimated time: ~${estimatedMinutes} minutes`)
  console.log('')

  // Process
  const startTime = Date.now()
  const results = await processInBatches(needsVariants, CONCURRENCY, generateVariantsForMedia)

  // Summary
  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const duration = Math.ceil((Date.now() - startTime) / 1000)

  console.log('\n=== Complete ===')
  console.log(`Success: ${succeeded}`)
  console.log(`Failed: ${failed}`)
  console.log(`Duration: ${duration}s (${Math.ceil(duration / 60)} min)`)

  if (failed > 0) {
    console.log('\nFailed records:')
    results.filter(r => !r.success).slice(0, 20).forEach(r => {
      console.log(`  - ${r.filename}: ${r.error}`)
    })
    if (failed > 20) {
      console.log(`  ... and ${failed - 20} more`)
    }
  }

  // Verify
  const withRealVariants = await prisma.media.count({
    where: {
      NOT: [
        { variants: { equals: null } },
        { variants: { equals: {} } },
      ],
    },
  })
  console.log(`\nMedia with variants: ${withRealVariants}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
