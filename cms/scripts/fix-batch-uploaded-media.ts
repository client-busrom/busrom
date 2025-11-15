/**
 * Fix Batch Uploaded Media
 *
 * 修复批量上传的媒体文件
 *
 * This script fixes media files that were uploaded via the batch upload API
 * but are missing the `file` field and image metadata.
 *
 * It regenerates the metadata and variants for these files.
 */

import type { Context } from '.keystone/types'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'

export async function fixBatchUploadedMedia(context: Context) {
  console.log('\n🔧 Fixing batch uploaded media files...\n')

  try {
    // Find all media files that have file_id but missing width/height/variants
    // These are likely from the old batch upload API
    const brokenMedia = await context.prisma.media.findMany({
      where: {
        AND: [
          { file_id: { not: null } },
          {
            OR: [
              { width: null },
              { height: null },
              { variants: { equals: null } },
              { variants: { equals: {} } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Found ${brokenMedia.length} media files to fix\n`)

    if (brokenMedia.length === 0) {
      console.log('✅ All media files are already fixed!')
      return
    }

    let successCount = 0
    let errorCount = 0

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
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Summary: ${successCount} success, ${errorCount} errors`)
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('\n❌ Failed to fix batch uploaded media:', error)
    throw error
  }
}
