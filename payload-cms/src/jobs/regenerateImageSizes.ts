/**
 * Regenerate Image Sizes Job Task
 *
 * This job regenerates image size variants when focal point changes.
 * It downloads the original image from S3, crops each size variant
 * using the new focal point, uploads to S3, and updates the database.
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { Readable } from 'stream'

// S3 Configuration
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  region: process.env.S3_REGION || 'us-east-1',
  ...(process.env.USE_MINIO === 'true' && {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    forcePathStyle: true,
  }),
})

const USE_MINIO = process.env.USE_MINIO === 'true'
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media'

// Get Base URL for images
const getBaseUrl = () => {
  if (USE_MINIO) {
    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
    return `${endpoint}/${S3_BUCKET}`
  }
  const cdnDomain = process.env.CDN_DOMAIN
  const region = process.env.S3_REGION || 'us-east-1'
  return cdnDomain && cdnDomain !== 'NONE'
    ? `https://${cdnDomain}`
    : `https://${S3_BUCKET}.s3.${region}.amazonaws.com`
}

const BASE_URL = getBaseUrl()

// Image sizes configuration
const FOCAL_IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 300, quality: 80 },
  { name: 'card', width: 768, height: 512, quality: 80 },
  { name: 'tablet', width: 1024, height: undefined, quality: 80 },
  { name: 'desktop', width: 1920, height: undefined, quality: 85 },
]

// Helper: Stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

// Define the task input type
interface RegenerateImageSizesInput {
  mediaId: number
  filename: string
  focalX: number
  focalY: number
}

// Task configuration - using 'inline' task pattern for simpler typing
export const regenerateImageSizesTask = {
  slug: 'regenerateImageSizes',
  retries: 3,
  handler: async ({ input, req }: { input: RegenerateImageSizesInput; req: any }) => {
    const { mediaId, filename, focalX, focalY } = input
    const { payload } = req

    payload.logger.info(`🎯 [Job] Starting image regeneration for ${filename} (ID: ${mediaId})`)
    payload.logger.info(`   Focal point: (${focalX}, ${focalY})`)

    try {
      // Download original image from S3
      const s3Key = `media/${filename}`
      let sourceBuffer: Buffer

      try {
        const response = await s3Client.send(new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: s3Key,
        }))
        sourceBuffer = await streamToBuffer(response.Body as Readable)
      } catch {
        payload.logger.error(`❌ [Job] Failed to download original image: ${s3Key}`)
        return {
          output: {
            success: false,
            sizesGenerated: 0,
            error: `Failed to download original image: ${s3Key}`,
          },
        }
      }

      // Get original image metadata
      const originalMeta = await sharp(sourceBuffer).metadata()
      const originalWidth = originalMeta.width || 1920
      const originalHeight = originalMeta.height || 1080

      // Calculate focal point position in pixels
      const focalXPx = Math.round((focalX / 100) * originalWidth)
      const focalYPx = Math.round((focalY / 100) * originalHeight)

      const baseName = filename.replace(/\.[^.]+$/, '')
      const sizesUpdate: Record<string, any> = {}

      // Cache buster timestamp
      const cacheBuster = Date.now()
      let sizesGenerated = 0

      for (const size of FOCAL_IMAGE_SIZES) {
        try {
          let outputBuffer: Buffer
          let outputWidth: number
          let outputHeight: number

          if (size.height && !['thumbnail', 'card'].includes(size.name)) {
            // Fixed dimensions - need to crop with focal point
            // Strategy: Scale up image if needed, then crop to exact dimensions
            // This ensures focal point is always centered and aspect ratio is correct

            const targetAspect = size.width / size.height
            const originalAspect = originalWidth / originalHeight

            // Calculate the scale factor needed to ensure we can crop the target area
            // We need the scaled image to be at least as large as the target in both dimensions
            let scaleFactor: number

            if (originalAspect > targetAspect) {
              // Original is wider than target - height is the limiting factor
              // Scale so that height matches target, then crop width
              scaleFactor = size.height / originalHeight
            } else {
              // Original is taller than target - width is the limiting factor
              // Scale so that width matches target, then crop height
              scaleFactor = size.width / originalWidth
            }

            // Ensure scale factor is at least 1 to avoid unnecessary downscaling before crop
            // (we want to upscale small images, not downscale large ones before cropping)
            const effectiveScale = Math.max(scaleFactor, 1)

            // Calculate scaled dimensions
            const scaledWidth = Math.round(originalWidth * effectiveScale)
            const scaledHeight = Math.round(originalHeight * effectiveScale)

            // Calculate focal point position in scaled image
            const scaledFocalX = Math.round(focalXPx * effectiveScale)
            const scaledFocalY = Math.round(focalYPx * effectiveScale)

            // Calculate crop region centered on focal point
            let cropLeft = Math.round(scaledFocalX - size.width / 2)
            let cropTop = Math.round(scaledFocalY - size.height / 2)

            // Clamp crop region to image bounds
            cropLeft = Math.max(0, Math.min(cropLeft, scaledWidth - size.width))
            cropTop = Math.max(0, Math.min(cropTop, scaledHeight - size.height))

            // Ensure crop dimensions don't exceed scaled image
            const cropWidth = Math.min(size.width, scaledWidth)
            const cropHeight = Math.min(size.height, scaledHeight)

            // Build the sharp pipeline
            let pipeline = sharp(sourceBuffer)

            // Only resize if we need to scale up
            if (effectiveScale > 1) {
              pipeline = pipeline.resize(scaledWidth, scaledHeight, {
                fit: 'fill', // Exact dimensions
              })
            }

            // Extract the crop region
            pipeline = pipeline.extract({
              left: cropLeft,
              top: cropTop,
              width: cropWidth,
              height: cropHeight,
            })

            // If the crop is smaller than target (edge case), resize to exact target
            if (cropWidth < size.width || cropHeight < size.height) {
              pipeline = pipeline.resize(size.width, size.height, {
                fit: 'cover',
              })
            }

            outputBuffer = await pipeline
              .webp({ quality: size.quality })
              .toBuffer()

            outputWidth = size.width
            outputHeight = size.height
          } else {
            // Width or both dimensions - fit: 'inside' ensures no cropping
            const resized = await sharp(sourceBuffer)
              .resize(size.width, size.height, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality: size.quality })
              .toBuffer()

            const meta = await sharp(resized).metadata()
            outputBuffer = resized
            outputWidth = meta.width || size.width
            outputHeight = meta.height || 0
          }

          // Upload to S3
          const sizeFilename = `${baseName}-${outputWidth}x${outputHeight}.webp`
          const sizeS3Key = `media/${sizeFilename}`

          await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: sizeS3Key,
            Body: outputBuffer,
            ContentType: 'image/webp',
          }))

          // Prepare update data (add cache-busting version)
          sizesUpdate[size.name] = {
            url: `${BASE_URL}/media/${sizeFilename}?v=${cacheBuster}`,
            width: outputWidth,
            height: outputHeight,
            mimeType: 'image/webp',
            filesize: outputBuffer.length,
            filename: sizeFilename,
          }

          sizesGenerated++
          payload.logger.info(`   ✓ [Job] Generated ${size.name}: ${sizeFilename}`)
        } catch (err) {
          payload.logger.error(`   ✗ [Job] Failed to generate ${size.name}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      // Update sizes in database
      if (Object.keys(sizesUpdate).length > 0) {
        await payload.update({
          collection: 'media',
          id: mediaId,
          data: {
            sizes: sizesUpdate,
          },
          context: {
            skipFocalPointRegeneration: true,
          },
        })

        payload.logger.info(`✅ [Job] Image sizes regenerated for ${filename} (${sizesGenerated} sizes)`)
      }

      return {
        output: {
          success: true,
          sizesGenerated,
          error: '',
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      payload.logger.error(`❌ [Job] Error regenerating image sizes for ${filename}: ${errorMessage}`)

      return {
        output: {
          success: false,
          sizesGenerated: 0,
          error: errorMessage,
        },
      }
    }
  },
}
