/**
 * Regenerate Variants API Endpoint
 *
 * POST /api/regenerate-variants
 *
 * This endpoint regenerates image variants for existing media files.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/regenerate-variants
 */

import type { Request, Response } from 'express'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'

export async function regenerateVariantsHandler(req: Request, res: Response) {
  console.log('\n🔄 API: Starting variant regeneration...\n')

  try {
    // Get Keystone context from request
    const context = (req as any).context

    if (!context) {
      return res.status(500).json({
        success: false,
        error: 'Keystone context not available',
      })
    }

    // Parse options from request body
    const { forceRegenerate = false, mediaId } = req.body || {}

    // Build query filter
    const where: any = {}

    if (mediaId) {
      where.id = { equals: mediaId }
    } else if (!forceRegenerate) {
      // Only process media without width/height (indicates no metadata extracted)
      where.OR = [
        { width: { equals: null } },
        { height: { equals: null } },
      ]
    }

    // Fetch media files
    const mediaFiles = await context.db.Media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Found ${mediaFiles.length} media files to process\n`)

    if (mediaFiles.length === 0) {
      return res.json({
        success: true,
        message: 'No media files need processing',
        processed: 0,
        successCount: 0,
        errorCount: 0,
      })
    }

    // Process each media file
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i]
      console.log(`[${i + 1}/${mediaFiles.length}] Processing: ${media.filename}`)

      try {
        // Construct file URL from file_id
        // Keystone stores image with signed URLs, we need to construct the base URL
        if (!media.file || !media.file.url) {
          // Try to construct URL manually from file_id
          const fileId = (media as any).file_id || (media as any).fileId
          const fileExtension = (media as any).file_extension || (media as any).fileExtension || 'jpg'

          if (!fileId) {
            console.log(`  ⚠️  Skipped: No file ID\n`)
            continue
          }

          // Construct URL based on storage configuration
          const cdnDomain = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'
          const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'
          media.file = {
            url: `${cdnDomain}/${bucketName}/${fileId}.${fileExtension}`,
            filename: `${fileId}.${fileExtension}`,
          } as any

          console.log(`  📝 Constructed URL: ${media.file.url}`)
        }

        // Extract metadata
        const metadata = await extractImageMetadata(media.file.url)
        console.log(`  📊 Metadata: ${metadata.width}x${metadata.height}`)

        // Generate variants
        const variants = await generateImageVariants(media.file.url)
        console.log(`  ✅ Generated ${Object.keys(variants).length} variants`)

        // Update database
        await context.db.Media.updateOne({
          where: { id: media.id },
          data: {
            width: metadata.width,
            height: metadata.height,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
            variants: variants,
          },
        })

        console.log(`  ✅ Database updated\n`)
        successCount++
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`)
        errorCount++
        errors.push({
          filename: media.filename,
          id: media.id,
          error: error.message,
        })
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Summary: ${successCount} success, ${errorCount} errors`)
    console.log(`${'='.repeat(60)}\n`)

    return res.json({
      success: true,
      message: 'Variant regeneration completed',
      processed: mediaFiles.length,
      successCount: successCount,
      errorCount: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('\n❌ API Error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
