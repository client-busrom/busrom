/**
 * Fix Media Metadata Format
 *
 * 修复媒体元数据格式问题
 *
 * Problem: metadata.group and metadata.sceneNumber are stored as strings like "g-2", "sn-3"
 * Expected: They should be numbers like 2, 3
 *
 * This script converts:
 * - "g-1", "g-2", etc. → 1, 2, etc.
 * - "sn-1", "sn-2", etc. → 1, 2, etc.
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function fixMediaMetadataFormat() {
  console.log('🔧 Starting media metadata format fix...\n')

  // Get all media with metadata
  const mediaFiles = await prisma.media.findMany({
    where: {
      metadata: {
        not: null
      }
    },
    select: {
      id: true,
      filename: true,
      metadata: true
    }
  })

  console.log(`📊 Found ${mediaFiles.length} media files with metadata\n`)

  let updatedCount = 0
  let skippedCount = 0

  for (const media of mediaFiles) {
    const metadata = media.metadata as Record<string, any> | null
    if (!metadata) {
      skippedCount++
      continue
    }

    let needsUpdate = false
    const newMetadata = { ...metadata }

    // Fix group: "g-1" → 1, "g-2" → 2, etc.
    if (typeof metadata.group === 'string' && metadata.group.startsWith('g-')) {
      const num = parseInt(metadata.group.replace('g-', ''), 10)
      if (!isNaN(num)) {
        newMetadata.group = num
        needsUpdate = true
        console.log(`  [${media.filename}] group: "${metadata.group}" → ${num}`)
      }
    }

    // Fix sceneNumber: "sn-1" → 1, "sn-2" → 2, etc.
    if (typeof metadata.sceneNumber === 'string' && metadata.sceneNumber.startsWith('sn-')) {
      const num = parseInt(metadata.sceneNumber.replace('sn-', ''), 10)
      if (!isNaN(num)) {
        newMetadata.sceneNumber = num
        needsUpdate = true
        console.log(`  [${media.filename}] sceneNumber: "${metadata.sceneNumber}" → ${num}`)
      }
    }

    // Fix subType if it contains useful info (optional - just log for now)
    if (metadata.subType) {
      console.log(`  [${media.filename}] has subType: "${metadata.subType}" (keeping as-is)`)
    }

    if (needsUpdate) {
      await prisma.media.update({
        where: { id: media.id },
        data: { metadata: newMetadata }
      })
      updatedCount++
    } else {
      skippedCount++
    }
  }

  console.log('\n✅ Migration complete!')
  console.log(`   Updated: ${updatedCount}`)
  console.log(`   Skipped: ${skippedCount}`)
}

fixMediaMetadataFormat()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
