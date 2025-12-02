/**
 * Check Rectangular Format Media
 *
 * 检查长方形格式的媒体
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查广告螺丝 + 长方形格式的媒体...\n')

  // Find tags
  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  const rectangularTag = await prisma.mediaTag.findFirst({
    where: { slug: 'scene-rectangular' }
  })

  if (!standoffTag) {
    console.log('❌ 未找到 series-glass-standoff 标签')
    return
  }

  if (!rectangularTag) {
    console.log('❌ 未找到 scene-rectangular 标签')
    return
  }

  console.log('✅ 广告螺丝标签:', standoffTag.name)
  console.log('✅ 长方形格式标签:', rectangularTag.name)

  // Count media with both tags
  const media = await prisma.media.findMany({
    where: {
      AND: [
        { tags: { some: { id: standoffTag.id } } },
        { tags: { some: { id: rectangularTag.id } } }
      ]
    },
    select: {
      id: true,
      filename: true,
      tags: {
        select: {
          slug: true,
          name: true
        }
      }
    }
  })

  console.log('\n📊 广告螺丝 + 长方形格式:')
  console.log('   总数:', media.length)

  if (media.length > 0) {
    console.log('\n📋 文件列表:')
    media.slice(0, 15).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.filename}`)
    })

    if (media.length > 15) {
      console.log(`   ... 还有 ${media.length - 15} 张`)
    }
  }

  // Also check all scene type tags for Glass Standoff
  console.log('\n📊 广告螺丝的所有场景类型标签:')
  const allMedia = await prisma.media.findMany({
    where: {
      tags: { some: { id: standoffTag.id } }
    },
    select: {
      tags: {
        where: { type: 'SCENE_TYPE' },
        select: { slug: true, name: true }
      }
    }
  })

  const sceneTypeCounts = new Map<string, number>()
  allMedia.forEach(m => {
    m.tags.forEach(tag => {
      const count = sceneTypeCounts.get(tag.slug) || 0
      sceneTypeCounts.set(tag.slug, count + 1)
    })
  })

  sceneTypeCounts.forEach((count, slug) => {
    console.log(`   ${slug}: ${count} 张`)
  })

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
