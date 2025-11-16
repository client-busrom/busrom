/**
 * Sync existing Media tags to tagsFilter field
 *
 * This script copies all tags from the tags field to the tagsFilter field
 * for existing Media records.
 */

import { PrismaClient } from '.prisma/client'

export async function syncTagsToFilter() {
  const prisma = new PrismaClient()

  console.log('\n🔄 Starting tags synchronization...\n')

  try {
    // Fetch all Media records with their tags
    const medias = await prisma.media.findMany({
      include: {
        tags: true,
      },
    })

    console.log(`📊 Found ${medias.length} media records`)

    let syncedCount = 0
    let skippedCount = 0

    for (const media of medias) {
      if (!media.tags || media.tags.length === 0) {
        console.log(`  ⊙ Skipping ${media.filename} (no tags)`)
        skippedCount++
        continue
      }

      console.log(`  ✓ Syncing ${media.filename} (${media.tags.length} tags)`)

      // Update tagsFilter with the same tags using Prisma
      await prisma.media.update({
        where: { id: media.id },
        data: {
          tagsFilter: {
            set: media.tags.map((tag) => ({ id: tag.id })),
          },
        },
      })

      syncedCount++
    }

    console.log(`\n✅ Synchronization completed!`)
    console.log(`   Synced: ${syncedCount} records`)
    console.log(`   Skipped: ${skippedCount} records (no tags)\n`)

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Error during synchronization:', error)
    throw error
  }
}
