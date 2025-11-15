/**
 * Regenerate Image Variants for Existing Media
 *
 * 为已存在的图片重新生成 variants
 *
 * This is a migration script that can be called from keystone.ts
 * to regenerate variants for all existing media files.
 */

import type { Context } from '.keystone/types'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'

export async function regenerateAllVariants(context: Context) {
  console.log('\n🔄 Starting variant regeneration for all media...\n')

  try {
    // Fetch all media files without variants
    const mediaFiles = await context.db.Media.findMany({
      where: {
        OR: [
          { variants: { equals: null } },
          { variants: { equals: {} } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Found ${mediaFiles.length} media files without variants\n`)

    if (mediaFiles.length === 0) {
      console.log('✅ All media files already have variants!')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i]
      console.log(`[${i + 1}/${mediaFiles.length}] Processing: ${media.filename}`)

      try {
        if (!media.file?.url) {
          console.log(`  ⚠️  Skipped: No file URL\n`)
          continue
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
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Summary: ${successCount} success, ${errorCount} errors`)
    console.log(`${'='.repeat(60)}\n`)
  } catch (error) {
    console.error('\n❌ Failed to regenerate variants:', error)
    throw error
  }
}
