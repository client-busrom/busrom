/**
 * Regenerate Image Sizes Job Task
 *
 * This job regenerates image size variants when focal point changes.
 * It downloads the original image from S3, crops each size variant
 * using the new focal point, uploads to S3, and updates the database.
 */

import type { TaskConfig } from 'payload'
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

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media'
const USE_MINIO = process.env.USE_MINIO === 'true'
const CDN_DOMAIN = USE_MINIO
  ? 'http://localhost:8080'
  : (process.env.CDN_DOMAIN || 'https://d2kqew3hn5wphn.cloudfront.net')

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

// Define the task input schema type
type RegenerateImageSizesInput = {
  mediaId: number
  filename: string
  focalX: number
  focalY: number
}

export const regenerateImageSizesTask: TaskConfig<'regenerateImageSizes'> = {
  slug: 'regenerateImageSizes',

  // Retry up to 3 times if failed
  retries: 3,

  // Input schema definition
  inputSchema: [
    { name: 'mediaId', type: 'number', required: true },
    { name: 'filename', type: 'text', required: true },
    { name: 'focalX', type: 'number', required: true },
    { name: 'focalY', type: 'number', required: true },
  ],

  // Output schema definition
  outputSchema: [
    { name: 'success', type: 'checkbox', required: true },
    { name: 'sizesGenerated', type: 'number' },
    { name: 'error', type: 'text' },
  ],

  // The actual job handler
  handler: async ({ input, req }) => {
    const { mediaId, filename, focalX, focalY } = input as RegenerateImageSizesInput
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
      } catch (error) {
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

          if (size.height) {
            // Fixed dimensions - need to crop with focal point
            const targetAspect = size.width / size.height
            const originalAspect = originalWidth / originalHeight

            let cropWidth: number, cropHeight: number
            let cropLeft: number, cropTop: number

            if (originalAspect > targetAspect) {
              // Original is wider - crop horizontally
              cropHeight = originalHeight
              cropWidth = Math.round(cropHeight * targetAspect)
              cropTop = 0
              // Center crop around focal point X
              cropLeft = Math.max(0, Math.min(
                focalXPx - Math.round(cropWidth / 2),
                originalWidth - cropWidth
              ))
            } else {
              // Original is taller - crop vertically
              cropWidth = originalWidth
              cropHeight = Math.round(cropWidth / targetAspect)
              cropLeft = 0
              // Center crop around focal point Y
              cropTop = Math.max(0, Math.min(
                focalYPx - Math.round(cropHeight / 2),
                originalHeight - cropHeight
              ))
            }

            outputBuffer = await sharp(sourceBuffer)
              .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
              .resize(size.width, size.height)
              .webp({ quality: size.quality })
              .toBuffer()

            outputWidth = size.width
            outputHeight = size.height
          } else {
            // Width only - just resize, no crop needed
            const resized = await sharp(sourceBuffer)
              .resize(size.width, undefined, {
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
            url: `${CDN_DOMAIN}/${sizeS3Key}?v=${cacheBuster}`,
            width: outputWidth,
            height: outputHeight,
            mimeType: 'image/webp',
            filesize: outputBuffer.length,
            filename: sizeFilename,
          }

          sizesGenerated++
          payload.logger.info(`   ✓ [Job] Generated ${size.name}: ${sizeFilename}`)
        } catch (error) {
          payload.logger.error(`   ✗ [Job] Failed to generate ${size.name}:`, error)
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
      payload.logger.error(`❌ [Job] Error regenerating image sizes for ${filename}:`, error)

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
