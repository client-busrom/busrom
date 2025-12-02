/**
 * Fix Existing Scene Images - Add Tags and Metadata
 *
 * 修复现有场景图 - 添加标签和元数据
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 修复现有场景图的标签和元数据...\n')

  // 1. Find tags
  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  const rectangularTag = await prisma.mediaTag.findFirst({
    where: { slug: 'scene-rectangular' }
  })

  const standaloneTag = await prisma.mediaTag.findFirst({
    where: { slug: 'scene-standalone' }
  })

  if (!standoffTag || !rectangularTag || !standaloneTag) {
    console.log('❌ 缺少必要的标签')
    console.log('standoffTag:', standoffTag?.slug)
    console.log('rectangularTag:', rectangularTag?.slug)
    console.log('standaloneTag:', standaloneTag?.slug)
    return
  }

  console.log('✅ 找到必要的标签')

  // 2. Find all scene images (01-standoff-scene-001.jpg to 022.jpg)
  const sceneImages = await prisma.media.findMany({
    where: {
      AND: [
        { filename: { contains: 'standoff-scene' } },
        { tags: { some: { id: standoffTag.id } } }
      ]
    },
    select: {
      id: true,
      filename: true,
      metadata: true,
      tags: {
        select: {
          id: true,
          slug: true
        }
      }
    }
  })

  console.log(`\n📊 找到 ${sceneImages.length} 张场景图\n`)

  let updated = 0
  let skipped = 0

  for (const media of sceneImages) {
    // Extract scene number from filename (01-standoff-scene-XXX.jpg -> XXX)
    const match = media.filename.match(/scene-(\d+)/)
    const sceneNumber = match ? match[1] : null

    // Check if already has all tags
    const tagIds = media.tags.map(t => t.id)
    const hasRectangular = tagIds.includes(rectangularTag.id)
    const hasStandalone = tagIds.includes(standaloneTag.id)
    const hasMetadata = media.metadata && (media.metadata as any).sceneNumber

    if (hasRectangular && hasStandalone && hasMetadata) {
      console.log(`⏭️  跳过 ${media.filename} - 已有完整标签和元数据`)
      skipped++
      continue
    }

    // Add missing tags
    const tagsToConnect = []
    if (!hasRectangular) tagsToConnect.push({ id: rectangularTag.id })
    if (!hasStandalone) tagsToConnect.push({ id: standaloneTag.id })

    // Update metadata
    const newMetadata = {
      ...(media.metadata as any || {}),
      sceneNumber: sceneNumber || (media.metadata as any)?.sceneNumber,
    }

    try {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          tags: {
            connect: tagsToConnect
          },
          metadata: newMetadata
        }
      })

      console.log(`✅ ${media.filename}`)
      console.log(`   添加标签: ${tagsToConnect.map(t => t.id === rectangularTag.id ? 'rectangular' : 'standalone').join(', ')}`)
      console.log(`   场景编号: ${sceneNumber}`)
      updated++
    } catch (error) {
      console.error(`❌ 更新失败: ${media.filename}`, error)
    }
  }

  console.log('\n📊 统计:')
  console.log(`   更新: ${updated} 张`)
  console.log(`   跳过: ${skipped} 张`)
  console.log(`   总计: ${sceneImages.length} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
