/**
 * Fix Batch Media API Endpoint
 *
 * 修复批量上传媒体文件 API
 *
 * This endpoint fixes media files that were uploaded via the old batch upload API
 * and are missing the proper file metadata.
 */

import { Request, Response } from 'express'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'

export const fixBatchMediaHandler = async (req: Request, res: Response) => {
  try {
    const context = (req as any).context

    console.log('\n🔧 Starting to fix batch uploaded media files...\n')

    // Find all media files that have file_id but missing width/height/variants
    const brokenMedia = await context.prisma.media.findMany({
      where: {
        AND: [
          { file_id: { not: null } },
          {
            OR: [
              { width: null },
              { height: null },
              { variants: { equals: null } },
              { variants: { equals: {} as any } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Found ${brokenMedia.length} media files to fix\n`)

    if (brokenMedia.length === 0) {
      return res.json({
        success: true,
        message: 'All media files are already fixed!',
        fixed: 0,
        errors: 0,
      })
    }

    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < brokenMedia.length; i++) {
      const media = brokenMedia[i]
      console.log(`[${i + 1}/${brokenMedia.length}] Processing: ${media.filename}`)

      try {
        if (!media.file_id || !media.file_extension) {
          console.log(`  ⚠️  Skipped: Missing file_id or file_extension\n`)
          continue
        }

        // Construct the file URL
        const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'
        const fileUrl = `${process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'}/${bucketName}/${media.file_id}.${media.file_extension}`

        console.log(`  📁 File URL: ${fileUrl}`)

        // Extract metadata
        const metadata = await extractImageMetadata(fileUrl)
        console.log(`  📊 Metadata: ${metadata.width}x${metadata.height}`)

        // Generate variants
        let variants = {}
        try {
          variants = await generateImageVariants(fileUrl)
          console.log(`  ✅ Generated ${Object.keys(variants).length} variants`)
        } catch (variantError) {
          console.warn(`  ⚠️  Warning: Could not generate variants:`, variantError)
        }

        // Update database
        await context.prisma.media.update({
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
          error: error.message,
        })
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Summary: ${successCount} success, ${errorCount} errors`)
    console.log(`${'='.repeat(60)}\n`)

    res.json({
      success: true,
      message: `Fixed ${successCount} media files`,
      fixed: successCount,
      errors: errorCount,
      errorDetails: errors,
    })
  } catch (error) {
    console.error('❌ Fix batch media error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Fix failed',
    })
  }
}
