/**
 * Generate Image Variants Hook
 *
 * After a media file is uploaded, this hook:
 * 1. Downloads the original image from S3
 * 2. Generates variants (thumbnail, small, medium, large) using sharp
 * 3. Uploads variants to S3 at variants/{size}/ path
 * 4. Updates the media document with variant URLs
 *
 * S3 Structure:
 * - Original: media/{filename}
 * - Variants: variants/thumbnail/{filename}, variants/small/{filename}, etc.
 */

import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import type { CollectionAfterChangeHook } from 'payload'

// Variant size configurations
const VARIANT_SIZES = [
  { name: 'thumbnail', width: 400, height: 300, folder: 'thumbnail' },
  { name: 'card', width: 768, height: 512, folder: 'small' },
  { name: 'tablet', width: 1024, height: undefined, folder: 'medium' },
  { name: 'desktop', width: 1920, height: undefined, folder: 'large' },
] as const

// Initialize S3 client
function getS3Client() {
  const isMinIO = process.env.USE_MINIO === 'true'

  return new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || 'us-east-1',
    ...(isMinIO && {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true,
    }),
  })
}

function getBucket() {
  return process.env.S3_BUCKET_NAME || 'busrom-media'
}

function getBaseUrl() {
  const isMinIO = process.env.USE_MINIO === 'true'

  if (isMinIO) {
    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
    return `${endpoint}/${getBucket()}`
  }

  const cdnDomain = process.env.CDN_DOMAIN
  if (cdnDomain && cdnDomain !== 'NONE') {
    return `https://${cdnDomain}`
  }

  return `https://${getBucket()}.s3.${process.env.S3_REGION}.amazonaws.com`
}

/**
 * Download file from S3 as buffer
 */
async function downloadFromS3(key: string): Promise<Buffer> {
  const s3Client = getS3Client()

  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    throw new Error(`Failed to download ${key} from S3`)
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/**
 * Upload file to S3
 */
async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<void> {
  const s3Client = getS3Client()

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(command)
}

/**
 * Generate a single variant
 */
async function generateVariant(
  imageBuffer: Buffer,
  config: typeof VARIANT_SIZES[number]
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let sharpInstance = sharp(imageBuffer)

  // Get original metadata
  const metadata = await sharpInstance.metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0

  // Skip if original is smaller than target
  if (originalWidth <= config.width) {
    // Return original resized to fit
    const resized = await sharp(imageBuffer)
      .resize(config.width, config.height, {
        fit: config.height ? 'cover' : 'inside',
        position: 'centre',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer()

    const resizedMeta = await sharp(resized).metadata()

    return {
      buffer: resized,
      width: resizedMeta.width || originalWidth,
      height: resizedMeta.height || originalHeight,
    }
  }

  // Resize with cover/inside based on whether height is specified
  const resized = await sharp(imageBuffer)
    .resize(config.width, config.height, {
      fit: config.height ? 'cover' : 'inside',
      position: 'centre',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer()

  const resizedMeta = await sharp(resized).metadata()

  return {
    buffer: resized,
    width: resizedMeta.width || config.width,
    height: resizedMeta.height || (config.height || Math.round(config.width * (originalHeight / originalWidth))),
  }
}

/**
 * Main hook: Generate variants after media upload
 */
export const generateVariantsHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only process on create (new uploads)
  if (operation !== 'create') {
    return doc
  }

  // Only process images
  const mimeType = doc.mimeType || ''
  if (!mimeType.startsWith('image/')) {
    return doc
  }

  // Skip if no filename
  const filename = doc.filename
  if (!filename) {
    return doc
  }

  const { payload } = req

  try {
    payload.logger.info(`🖼️ Generating variants for: ${filename}`)

    // Download original from S3
    const originalKey = `media/${filename}`
    const originalBuffer = await downloadFromS3(originalKey)

    // Generate and upload each variant
    const sizes: Record<string, { url: string; width: number; height: number; mimeType: string; filename: string }> = {}
    const baseUrl = getBaseUrl()

    for (const config of VARIANT_SIZES) {
      try {
        // Generate variant
        const { buffer, width, height } = await generateVariant(originalBuffer, config)

        // Upload to S3 at variants/{folder}/{filename}
        const variantKey = `variants/${config.folder}/${filename}`
        await uploadToS3(variantKey, buffer, 'image/jpeg')

        // Build URL
        const variantUrl = `${baseUrl}/variants/${config.folder}/${filename}`

        // Store size info
        sizes[config.name] = {
          url: variantUrl,
          width,
          height,
          mimeType: 'image/jpeg',
          filename,
        }

        payload.logger.info(`   ✅ ${config.name}: ${width}x${height}`)
      } catch (err: any) {
        payload.logger.error(`   ❌ Failed to generate ${config.name}: ${err.message}`)
      }
    }

    // Update the media document with variant URLs
    if (Object.keys(sizes).length > 0) {
      try {
        payload.logger.info(`📝 Updating media ${doc.id} with sizes...`)
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: {
            sizes,
          },
        })
        payload.logger.info(`✅ Variants generated and saved for: ${filename}`)
      } catch (updateErr: any) {
        payload.logger.error(`❌ Failed to update media ${doc.id}: ${updateErr.message}`)
        // Don't throw - variants are uploaded, just URL update failed
      }
    }

    return doc
  } catch (err: any) {
    payload.logger.error(`❌ Failed to generate variants for ${filename}: ${err.message}`)
    return doc
  }
}
