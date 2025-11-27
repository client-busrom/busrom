/**
 * Sync Media Tags to TagsFilter
 *
 * This script synchronizes the tags field to tagsFilter field for all Media items.
 * The tagsFilter field is used for filtering in the list view.
 *
 * Run this after deploying to fix existing media records.
 *
 * Usage:
 *   node cms/scripts/sync-media-tags-filter.js
 */

const { PrismaClient } = require('../node_modules/.prisma/client')

const prisma = new PrismaClient()

async function syncTagsToFilter() {
  console.log('🔄 Starting sync of tags to tagsFilter...\n')

  try {
    // Get all media items with their tags
    const mediaItems = await prisma.media.findMany({
      select: {
        id: true,
        filename: true,
        tags: {
          select: {
            id: true
          }
        },
        tagsFilter: {
          select: {
            id: true
          }
        }
      }
    })

    console.log(`📊 Found ${mediaItems.length} media items\n`)

    let syncedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const media of mediaItems) {
      const tagIds = media.tags.map(t => t.id)
      const filterIds = media.tagsFilter.map(t => t.id)

      // Check if they're already in sync
      const needsSync = tagIds.length !== filterIds.length ||
                        !tagIds.every(id => filterIds.includes(id))

      if (!needsSync) {
        skippedCount++
        continue
      }

      try {
        // Update tagsFilter to match tags
        await prisma.media.update({
          where: { id: media.id },
          data: {
            tagsFilter: {
              set: tagIds.map(id => ({ id }))
            }
          }
        })

        syncedCount++
        if (syncedCount % 50 === 0) {
          console.log(`✅ Synced ${syncedCount} items...`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Error syncing ${media.filename}:`, error.message)
      }
    }

    console.log('\n📈 Sync Summary:')
    console.log(`   ✅ Synced: ${syncedCount}`)
    console.log(`   ⏭️  Skipped (already in sync): ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log('\n✨ Done!')

  } catch (error) {
    console.error('❌ Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncTagsToFilter()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
