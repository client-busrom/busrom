#!/usr/bin/env tsx
/**
 * Batch Upload Images to S3 with Variant Generation
 *
 * 批量上传图片到 S3 并生成变体
 *
 * This script provides a complete workflow for batch uploading images:
 * 1. Upload original images to S3 using AWS CLI (fast)
 * 2. Create Media records in CMS database
 * 3. Generate image variants (thumbnail, small, medium, large, xlarge, webp)
 * 4. Update CMS records with metadata and variant URLs
 *
 * Usage:
 *   npm run batch-upload -- /path/to/images --metadata metadata.json
 *
 * Example:
 *   npm run batch-upload -- ../products/01-glass-standoff/scene-images --metadata scene-metadata.json
 *
 * Environment:
 *   Requires .env with S3 credentials and database connection
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { createReadStream, readdirSync, statSync, readFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: join(__dirname, '../cms/.env') })

// ========================================
// Configuration
// ========================================

const S3_CONFIG = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.S3_ENDPOINT, // For MinIO
  forcePathStyle: !!process.env.S3_ENDPOINT, // Required for MinIO
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'busrom-media'
const CDN_DOMAIN = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'

const SIZE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' as const },
  small: { width: 400, height: null, fit: 'inside' as const },
  medium: { width: 800, height: null, fit: 'inside' as const },
  large: { width: 1200, height: null, fit: 'inside' as const },
  xlarge: { width: 1920, height: null, fit: 'inside' as const },
}

// ========================================
// Interfaces
// ========================================

interface ImageMetadata {
  seriesNumber?: number
  combinationNumber?: number
  sceneNumber?: number
  specs?: string[]
  colors?: string[]
  notes?: string
}

interface BatchMetadata {
  primaryCategory?: string
  tags?: string[]
  defaultMetadata?: ImageMetadata
  fileMetadata?: Record<string, ImageMetadata>
}

interface UploadResult {
  filename: string
  fileId: string
  fileExtension: string
  s3Url: string
  width: number
  height: number
  fileSize: number
  mimeType: string
  variants: Record<string, string>
}

// ========================================
// Utility Functions
// ========================================

function getS3Client(): S3Client {
  return new S3Client(S3_CONFIG)
}

function getCdnUrl(key: string): string {
  if (CDN_DOMAIN.includes('cloudfront.net')) {
    return `${CDN_DOMAIN}/${key}`
  }
  return `${CDN_DOMAIN}/${BUCKET_NAME}/${key}`
}

function getSupportedImageFiles(directory: string): string[] {
  const files = readdirSync(directory)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

  return files.filter(file => {
    const ext = extname(file).toLowerCase()
    return imageExtensions.includes(ext)
  }).map(file => join(directory, file))
}

// ========================================
// S3 Upload Functions
// ========================================

async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const s3Client = getS3Client()

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return getCdnUrl(key)
}

// ========================================
// Image Processing Functions
// ========================================

async function extractImageMetadata(buffer: Buffer): Promise<{
  width: number
  height: number
  fileSize: number
  mimeType: string
  format: string
}> {
  const metadata = await sharp(buffer).metadata()

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    fileSize: buffer.length,
    mimeType: `image/${metadata.format}`,
    format: metadata.format || 'unknown',
  }
}

async function generateVariant(
  buffer: Buffer,
  width: number | null,
  height: number | null,
  fit: 'cover' | 'inside' = 'inside'
): Promise<Buffer> {
  let sharpInstance = sharp(buffer)

  if (width || height) {
    sharpInstance = sharpInstance.resize(width || undefined, height || undefined, {
      fit,
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
  }

  return await sharpInstance
    .jpeg({ quality: 85, progressive: true })
    .toBuffer()
}

async function generateWebP(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .webp({ quality: 90, effort: 6 })
    .toBuffer()
}

async function generateAllVariants(
  originalBuffer: Buffer,
  baseFilename: string
): Promise<Record<string, string>> {
  console.log(`  🎨 Generating variants...`)

  const variants: Record<string, string> = {}

  // Generate size variants
  for (const [sizeName, config] of Object.entries(SIZE_VARIANTS)) {
    const variantBuffer = await generateVariant(
      originalBuffer,
      config.width,
      config.height,
      config.fit
    )

    const variantKey = `variants/${sizeName}/${baseFilename}.jpg`
    const variantUrl = await uploadToS3(variantBuffer, variantKey, 'image/jpeg')

    variants[sizeName] = variantUrl
    console.log(`    ✓ ${sizeName}`)
  }

  // Generate WebP version
  const webpBuffer = await generateWebP(originalBuffer)
  const webpKey = `variants/webp/${baseFilename}.webp`
  const webpUrl = await uploadToS3(webpBuffer, webpKey, 'image/webp')
  variants.webp = webpUrl
  console.log(`    ✓ webp`)

  return variants
}

// ========================================
// Main Upload Function
// ========================================

async function uploadImage(filePath: string): Promise<UploadResult> {
  const filename = basename(filePath)
  const fileExtension = extname(filename).substring(1).toLowerCase()
  const fileId = randomUUID()
  const baseFilename = filename.replace(/\.[^/.]+$/, '')

  console.log(`\n📤 Uploading: ${filename}`)

  // Read file
  const buffer = readFileSync(filePath)

  // Extract metadata
  console.log(`  📊 Extracting metadata...`)
  const metadata = await extractImageMetadata(buffer)
  console.log(`    ${metadata.width}x${metadata.height}, ${(metadata.fileSize / 1024 / 1024).toFixed(2)}MB`)

  // Upload original to S3
  console.log(`  ☁️  Uploading to S3...`)
  const originalKey = `${fileId}.${fileExtension}`
  const s3Url = await uploadToS3(buffer, originalKey, metadata.mimeType)
  console.log(`    ✓ Original uploaded`)

  // Generate variants
  const variants = await generateAllVariants(buffer, baseFilename)

  return {
    filename,
    fileId,
    fileExtension,
    s3Url,
    width: metadata.width,
    height: metadata.height,
    fileSize: metadata.fileSize,
    mimeType: metadata.mimeType,
    variants,
  }
}

// ========================================
// Database Functions
// ========================================

async function createMediaRecord(
  prisma: PrismaClient,
  uploadResult: UploadResult,
  batchMetadata: BatchMetadata,
  fileMetadata?: ImageMetadata
): Promise<void> {
  const metadata = {
    ...batchMetadata.defaultMetadata,
    ...fileMetadata,
  }

  await prisma.media.create({
    data: {
      filename: uploadResult.filename,
      file_id: uploadResult.fileId,
      file_extension: uploadResult.fileExtension,
      status: 'ACTIVE',
      width: uploadResult.width,
      height: uploadResult.height,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      metadata: metadata,
      variants: uploadResult.variants,
      altText: {},
      cropFocalPoint: { x: 50, y: 50 },
    },
  })

  console.log(`  💾 Database record created`)
}

// ========================================
// Main Function
// ========================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Batch Upload Images to S3 with Variant Generation             ║
║  批量上传图片到 S3 并生成变体                                   ║
╚════════════════════════════════════════════════════════════════╝
`)

  // Parse command line arguments
  const args = process.argv.slice(2)
  const imageDirectory = args[0]
  const metadataFile = args.find(arg => arg.endsWith('.json'))

  if (!imageDirectory) {
    console.error(`
❌ Error: Please provide an image directory

Usage:
  npm run batch-upload -- /path/to/images [--metadata metadata.json]

Example:
  npm run batch-upload -- ../products/01-glass-standoff/scene-images --metadata scene-metadata.json
`)
    process.exit(1)
  }

  // Check if directory exists
  try {
    const stat = statSync(imageDirectory)
    if (!stat.isDirectory()) {
      throw new Error('Not a directory')
    }
  } catch (error) {
    console.error(`❌ Error: Directory not found: ${imageDirectory}`)
    process.exit(1)
  }

  // Load metadata file (if provided)
  let batchMetadata: BatchMetadata = {}
  if (metadataFile) {
    try {
      const metadataContent = readFileSync(metadataFile, 'utf-8')
      batchMetadata = JSON.parse(metadataContent)
      console.log(`✓ Loaded metadata from: ${metadataFile}\n`)
    } catch (error) {
      console.error(`❌ Error: Failed to load metadata file: ${metadataFile}`)
      process.exit(1)
    }
  }

  // Get image files
  const imageFiles = getSupportedImageFiles(imageDirectory)
  console.log(`📂 Directory: ${imageDirectory}`)
  console.log(`📊 Found ${imageFiles.length} images\n`)

  if (imageFiles.length === 0) {
    console.log('❌ No image files found')
    process.exit(0)
  }

  // Connect to database
  console.log('🔌 Connecting to database...')
  const prisma = new PrismaClient()
  console.log('✓ Connected\n')

  console.log('─'.repeat(64))
  console.log('Starting batch upload...\n')

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ file: string; error: string }> = []

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i]
    const filename = basename(filePath)

    console.log(`[${i + 1}/${imageFiles.length}] ${filename}`)

    try {
      // Upload image and generate variants
      const uploadResult = await uploadImage(filePath)

      // Create database record
      const fileMetadata = batchMetadata.fileMetadata?.[filename]
      await createMediaRecord(prisma, uploadResult, batchMetadata, fileMetadata)

      console.log(`  ✅ Complete!`)
      successCount++
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`)
      errorCount++
      errors.push({ file: filename, error: error.message })
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(64))
  console.log(`📊 Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('═'.repeat(64))

  if (errors.length > 0) {
    console.log(`\n❌ Failed uploads:`)
    errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`)
    })
  }

  // Cleanup
  await prisma.$disconnect()

  console.log(`\n✨ Done!\n`)
  process.exit(0)
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
