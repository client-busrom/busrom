/**
 * Image Optimizer
 *
 * This module provides automatic image optimization functionality:
 * - Extract image metadata (width, height, fileSize, mimeType)
 * - Generate multiple size variants (thumbnail, small, medium, large)
 * - Convert to modern WebP format
 * - Upload optimized images to S3
 *
 * Dependencies:
 * - sharp: Image processing
 * - @aws-sdk/client-s3: AWS S3 operations
 */

import sharp from 'sharp'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// S3/MinIO Client - Lazy initialization to ensure env vars are loaded
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    const s3Config: any = {
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
      },
    }

    // Add endpoint for MinIO (local development)
    if (process.env.S3_ENDPOINT) {
      s3Config.endpoint = process.env.S3_ENDPOINT
      s3Config.forcePathStyle = true // Required for MinIO
      console.log(`[Image Optimizer] Initializing S3 client with MinIO endpoint: ${process.env.S3_ENDPOINT}`)
    } else {
      console.log(`[Image Optimizer] Initializing S3 client for AWS S3`)
    }

    s3Client = new S3Client(s3Config)
  }
  return s3Client
}

// Helper functions to get env vars at runtime
function getS3BucketName(): string {
  return process.env.S3_BUCKET_NAME || 'busrom-media'
}

function getCDNDomain(): string {
  return process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'
}

/**
 * Image Size Variants Configuration
 */
const SIZE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' as const },
  small: { width: 400, height: null, fit: 'inside' as const },
  medium: { width: 800, height: null, fit: 'inside' as const },
  large: { width: 1200, height: null, fit: 'inside' as const },
  xlarge: { width: 1920, height: null, fit: 'inside' as const },
}

/**
 * Image Metadata Interface
 */
export interface ImageMetadata {
  width: number
  height: number
  fileSize: number
  mimeType: string
  format: string
}

/**
 * Image Variants Interface
 */
export interface ImageVariants {
  thumbnail: string
  small: string
  medium: string
  large: string
  xlarge: string
  webp: string
}

/**
 * Download image from URL (S3 or HTTP)
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    // Download via HTTP (works for both S3 and regular URLs)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download image from ${url}: ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error)
    throw error
  }
}

/**
 * Extract S3 key from URL
 */
function extractS3KeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove leading slash
    return urlObj.pathname.substring(1)
  } catch {
    // If URL parsing fails, assume it's already a key
    return url
  }
}

/**
 * Get filename from URL
 */
function getFilename(url: string): string {
  const key = extractS3KeyFromUrl(url)
  const parts = key.split('/')
  return parts[parts.length - 1]
}

/**
 * Extract Image Metadata
 *
 * Extracts width, height, fileSize, mimeType from the image
 */
export async function extractImageMetadata(imageUrl: string): Promise<ImageMetadata> {
  try {
    const buffer = await downloadImage(imageUrl)
    const metadata = await sharp(buffer).metadata()

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      fileSize: buffer.length,
      mimeType: `image/${metadata.format}`,
      format: metadata.format || 'unknown',
    }
  } catch (error) {
    console.error('Error extracting image metadata:', error)
    throw error
  }
}

/**
 * Generate a single image variant
 */
async function generateVariant(
  buffer: Buffer,
  width: number | null,
  height: number | null,
  fit: 'cover' | 'inside' = 'inside'
): Promise<Buffer> {
  try {
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
  } catch (error) {
    console.error('Error generating image variant:', error)
    throw error
  }
}

/**
 * Generate WebP version
 */
async function generateWebP(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .webp({ quality: 90, effort: 6 })
      .toBuffer()
  } catch (error) {
    console.error('Error generating WebP:', error)
    throw error
  }
}

/**
 * Upload buffer to S3
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getS3BucketName(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )

    // Return CDN URL
    // Format: http://localhost:8080/busrom-media/variants/thumbnail/xxx.jpg
    return `${getCDNDomain()}/${getS3BucketName()}/${key}`
  } catch (error) {
    console.error(`Error uploading to S3 (${key}):`, error)
    throw error
  }
}

/**
 * Generate Image Variants
 *
 * Main function to generate all size variants and WebP version
 * Uploads all variants to S3 and returns their URLs
 */
export async function generateImageVariants(originalUrl: string): Promise<ImageVariants> {
  try {
    console.log(`🖼️  Generating variants for: ${originalUrl}`)

    // Download original image
    const originalBuffer = await downloadImage(originalUrl)
    const filename = getFilename(originalUrl)
    const baseFilename = filename.replace(/\.[^/.]+$/, '') // Remove extension

    // Generate all variants
    const variants: Partial<ImageVariants> = {}

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

      variants[sizeName as keyof typeof SIZE_VARIANTS] = variantUrl
      console.log(`  ✅ Generated ${sizeName}: ${variantUrl}`)
    }

    // Generate WebP version (from original)
    const webpBuffer = await generateWebP(originalBuffer)
    const webpKey = `variants/webp/${baseFilename}.webp`
    const webpUrl = await uploadToS3(webpBuffer, webpKey, 'image/webp')
    variants.webp = webpUrl
    console.log(`  ✅ Generated WebP: ${webpUrl}`)

    console.log(`✅ All variants generated successfully`)

    return variants as ImageVariants
  } catch (error) {
    console.error('Error generating image variants:', error)
    throw error
  }
}

/**
 * Check if variants already exist
 *
 * This can help avoid regenerating variants if they already exist
 */
export async function checkVariantsExist(originalUrl: string): Promise<boolean> {
  try {
    const filename = getFilename(originalUrl)
    const baseFilename = filename.replace(/\.[^/.]+$/, '')

    // Check if thumbnail exists (as a proxy for all variants)
    const thumbnailKey = `variants/thumbnail/${baseFilename}.jpg`

    await getS3Client().send(
      new HeadObjectCommand({
        Bucket: getS3BucketName(),
        Key: thumbnailKey,
      })
    )

    return true
  } catch {
    return false
  }
}

/**
 * Optimize existing image in-place
 *
 * This function can be used to optimize an existing image without generating variants
 */
export async function optimizeImage(
  imageUrl: string,
  options?: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
  }
): Promise<Buffer> {
  try {
    const buffer = await downloadImage(imageUrl)
    const quality = options?.quality || 85
    const maxWidth = options?.maxWidth
    const maxHeight = options?.maxHeight

    let sharpInstance = sharp(buffer)

    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    return await sharpInstance
      .jpeg({ quality, progressive: true })
      .toBuffer()
  } catch (error) {
    console.error('Error optimizing image:', error)
    throw error
  }
}
