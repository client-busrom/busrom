#!/usr/bin/env node
/**
 * Update Media Metadata for Combination 1
 *
 * This script:
 * 1. Connects to production database
 * 2. Counts total Media records
 * 3. Updates all Media to have combinationNumber=1 and sequential sceneNumber
 * 4. Updates tag from "单独场景图" to "场景组合图"
 */

const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://busrom_admin:mlnbOSunprOSr02x4Wom@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

async function main() {
  console.log('🔍 Connecting to production database...')
  console.log('📊 DATABASE:', DATABASE_URL.replace(/:[^:]*@/, ':****@'))

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
      include: {
        tags: true,
      },
    })

    console.log(`✅ Fetched ${allMedia.length} Media records`)

    // Step 3: Find tag IDs
    console.log('\n🔍 Looking for tags...')
    const oldTag = await prisma.mediaTag.findFirst({
      where: {
        name: {
          path: ['zh'],
          string_contains: '单独场景图',
        },
      },
    })

    const newTag = await prisma.mediaTag.findFirst({
      where: {
        name: {
          path: ['zh'],
          string_contains: '场景组合图',
        },
      },
    })

    console.log('Old tag (单独场景图):', oldTag?.id || 'NOT FOUND')
    console.log('New tag (场景组合图):', newTag?.id || 'NOT FOUND')

    if (!newTag) {
      console.log('❌ Error: "场景组合图" tag not found!')
      console.log('Please create this tag first in the CMS.')
      process.exit(1)
    }

    // Step 4: Update each Media
    console.log('\n🔄 Updating Media records...')
    let updateCount = 0

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      const sceneNumber = i + 1

      // Prepare new metadata
      const currentMetadata = media.metadata ?
        (typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata) : {}

      const newMetadata = {
        ...currentMetadata,
        combinationNumber: 1,
        sceneNumber: sceneNumber,
      }

      // Prepare tag updates
      const tagUpdates = {}
      const currentTagIds = media.tags.map(t => t.id)

      // Remove old tag if exists, add new tag
      if (oldTag && currentTagIds.includes(oldTag.id)) {
        tagUpdates.disconnect = [{ id: oldTag.id }]
      }
      if (newTag && !currentTagIds.includes(newTag.id)) {
        tagUpdates.connect = [{ id: newTag.id }]
      }

      // Update Media
      await prisma.media.update({
        where: { id: media.id },
        data: {
          metadata: newMetadata,
          ...(Object.keys(tagUpdates).length > 0 && { tags: tagUpdates }),
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
    console.log(`  - Tag updated: "单独场景图" → "场景组合图" (if applicable)`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
