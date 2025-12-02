/**
 * Update Media Metadata for Combination 1
 *
 * This script:
 * 1. Connects to production database via Prisma
 * 2. Counts total Media records
 * 3. Updates all Media to have combinationNumber=1 and sequential sceneNumber
 * 4. Updates tag from "单独场景图" to "场景组合图"
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/update-combination-metadata.ts
 */

import { PrismaClient } from '../../node_modules/.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Connecting to database...')
  console.log('📊 DATABASE:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'))

  try {
    // Step 1: Count total Media
    const totalCount = await prisma.media.count()
    console.log(`\n✅ Total Media records: ${totalCount}`)

    if (totalCount !== 88) {
      console.log(`⚠️  Warning: Expected 88 records, but found ${totalCount}`)
      console.log('Continue anyway? (Ctrl+C to cancel, or wait 5 seconds)')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Step 2: Fetch all Media sorted by creation date
    console.log('\n📥 Fetching all Media records...')
    const allMedia = await prisma.media.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        filename: true,
        metadata: true,
        tags: {
          select: {
            id: true,
          },
        },
      },
    })

    console.log(`✅ Fetched ${allMedia.length} Media records`)

    // Step 3: Find tag IDs
    console.log('\n🔍 Looking for tags...')

    // Find old tag (单独场景图)
    const oldTags = await prisma.mediaTag.findMany({
      where: {
        OR: [
          {
            name: {
              path: ['zh'],
              string_contains: '单独场景图',
            },
          },
          {
            slug: {
              contains: 'single-scene',
            },
          },
        ],
      },
    })

    // Find new tag (场景组合图)
    const newTags = await prisma.mediaTag.findMany({
      where: {
        OR: [
          {
            name: {
              path: ['zh'],
              string_contains: '场景组合图',
            },
          },
          {
            slug: {
              contains: 'combination-scene',
            },
          },
        ],
      },
    })

    const oldTag = oldTags[0]
    const newTag = newTags[0]

    console.log('Old tag (单独场景图):', oldTag?.id || 'NOT FOUND')
    console.log('New tag (场景组合图):', newTag?.id || 'NOT FOUND')

    if (!newTag) {
      console.log('\n⚠️  Warning: "场景组合图" tag not found!')
      console.log('Will update metadata only (not tags)')
    }

    // Step 4: Update each Media
    console.log('\n🔄 Updating Media records...')
    let updateCount = 0

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      const sceneNumber = i + 1

      // Prepare new metadata
      const currentMetadata = media.metadata as any || {}

      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      // Prepare tag updates
      const tagOperations: any = {}
      const currentTagIds = media.tags.map(t => t.id)

      // Remove old tag if exists
      if (oldTag && currentTagIds.includes(oldTag.id)) {
        tagOperations.disconnect = [{ id: oldTag.id }]
      }

      // Add new tag if exists and not already connected
      if (newTag && !currentTagIds.includes(newTag.id)) {
        if (tagOperations.disconnect) {
          tagOperations.connect = [{ id: newTag.id }]
        } else {
          tagOperations.connect = [{ id: newTag.id }]
        }
      }

      // Update Media
      await prisma.media.update({
        where: { id: media.id },
        data: {
          metadata: newMetadata as any,
          ...(Object.keys(tagOperations).length > 0 && { tags: tagOperations }),
        },
      })

      updateCount++
      if (updateCount % 10 === 0) {
        console.log(`  Updated ${updateCount}/${allMedia.length} records...`)
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} Media records!`)
    console.log('\n📋 Summary:')
    console.log(`  - All Media now have: combinationNumber = 1`)
    console.log(`  - Scene numbers: 1 to ${allMedia.length}`)
    if (oldTag && newTag) {
      console.log(`  - Tag updated: "单独场景图" → "场景组合图"`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
