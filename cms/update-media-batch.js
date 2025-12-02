#!/usr/bin/env node
/**
 * Update Media Metadata for Combination 1
 *
 * Run from cms directory with:
 *   DATABASE_URL="postgresql://..." node update-media-batch.js
 */

const { PrismaClient } = require('./node_modules/.prisma/client/index.js')

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
      console.log('Continue anyway in 5 seconds... (Ctrl+C to cancel)')
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
      const currentMetadata = media.metadata || {}

      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      // Prepare tag operations
      const tagOperations = {}
      const currentTagIds = media.tags.map(t => t.id)

      // Remove old tag if exists
      if (oldTag && currentTagIds.includes(oldTag.id)) {
        tagOperations.disconnect = [{ id: oldTag.id }]
      }

      // Add new tag if exists and not already connected
      if (newTag && !currentTagIds.includes(newTag.id)) {
        tagOperations.connect = [{ id: newTag.id }]
      }

      // Update Media
      await prisma.media.update({
        where: { id: media.id },
        data: {
          metadata: newMetadata,
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
