/**
 * Generate Missing Image Variants
 *
 * 为已存在的图片生成缺失的 variants
 *
 * This script processes all existing Media records that don't have variants
 * and generates optimized image variants for them.
 *
 * Usage:
 *   node --loader tsx cms/scripts/generate-missing-variants.ts
 *   or
 *   npx keystone build && node cms/.keystone/config.js (then call from admin UI)
 *
 * Options:
 *   --force : Regenerate variants even if they already exist
 *   --id=<uuid> : Process only specific media ID
 */

import type { Context } from '.keystone/types'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'

/**
 * Main function to regenerate variants
 */
export async function regenerateVariants(context: Context, options: {
  forceRegenerate?: boolean
  specificId?: string
} = {}) {
  console.log('🔄 Starting variant generation process...\n')

  try {
    const { forceRegenerate = false, specificId } = options

    // Parse command line arguments
    const args = process.argv.slice(2)
    const forceRegenerate = args.includes('--force')
    const specificId = args.find(arg => arg.startsWith('--id='))?.split('=')[1]

    // Build query filter
    const where: any = {}
    if (specificId) {
      where.id = { equals: specificId }
      console.log(`🎯 Processing specific media ID: ${specificId}\n`)
    } else if (!forceRegenerate) {
      // Only process media without variants
      where.OR = [
        { variants: { equals: null } },
        { variants: { equals: {} } },
      ]
    }

    // Fetch media files
    const mediaFiles = await context.db.Media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Found ${mediaFiles.length} media files to process\n`)

    if (mediaFiles.length === 0) {
      console.log('✅ No media files need processing!')
      process.exit(0)
    }

    // Process each media file
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i]
      console.log(`\n[${i + 1}/${mediaFiles.length}] Processing: ${media.filename}`)
      console.log(`   ID: ${media.id}`)

      try {
        // Check if file URL exists
        if (!media.file?.url) {
          console.log(`   ⚠️  Skipped: No file URL`)
          skipCount++
          continue
        }

        console.log(`   📥 File URL: ${media.file.url}`)

        // Extract metadata
        console.log(`   📊 Extracting metadata...`)
        const metadata = await extractImageMetadata(media.file.url)
        console.log(`   ✅ Metadata: ${metadata.width}x${metadata.height}, ${Math.round(metadata.fileSize / 1024)}KB`)

        // Generate variants
        console.log(`   🖼️  Generating variants...`)
        const variants = await generateImageVariants(media.file.url)
        console.log(`   ✅ Generated ${Object.keys(variants).length} variants`)

        // Update the media record
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

        console.log(`   ✅ Successfully updated database`)
        successCount++
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`)
        errorCount++
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Processing Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ⚠️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📦 Total: ${mediaFiles.length}`)
    console.log(`${'='.repeat(60)}\n`)

    if (errorCount > 0) {
      console.log('⚠️  Some files failed to process. Check the logs above.')
      process.exit(1)
    } else {
      console.log('✅ All files processed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  }
}

main()
