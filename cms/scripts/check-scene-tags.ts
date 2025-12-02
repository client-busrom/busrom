/**
 * Check Scene Images by Tags
 *
 * 按标签检查场景图
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查场景图（按标签）...\n')

  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  if (!standoffTag) {
    console.log('❌ 未找到 series-glass-standoff 标签')
    return
  }

  // 获取所有场景类型标签
  const sceneTags = await prisma.mediaTag.findMany({
    where: {
      slug: {
        in: [
          'scene-rectangular',
          'scene-square',
          'scene-combination',
          'scene-standalone',
          'scene-series',
          'scene-single',
        ]
      }
    }
  })

  console.log('📊 场景类型标签:')
  sceneTags.forEach(tag => {
    console.log(`   ${tag.slug}: ${tag.id}`)
  })

  // 统计每个标签的媒体数量
  console.log('\n📊 媒体数量统计:')

  for (const tag of sceneTags) {
    const count = await prisma.media.count({
      where: {
        AND: [
          { tags: { some: { id: standoffTag.id } } },
          { tags: { some: { id: tag.id } } }
        ]
      }
    })
    console.log(`   ${tag.slug}: ${count} 张`)
  }

  // 获取所有有场景标签的媒体
  const allSceneMedia = await prisma.media.findMany({
    where: {
      AND: [
        { tags: { some: { id: standoffTag.id } } },
        {
          tags: {
            some: {
              slug: {
                in: sceneTags.map(t => t.slug)
              }
            }
          }
        }
      ]
    },
    select: {
      filename: true,
      tags: {
        select: { slug: true }
      }
    },
    orderBy: { filename: 'asc' }
  })

  console.log(`\n📁 总计: ${allSceneMedia.length} 张场景图`)

  // 按文件名前缀分组
  const byPrefix = {
    rectangular: allSceneMedia.filter(m => m.filename.startsWith('01-standoff-scene-')),
    square: allSceneMedia.filter(m => m.filename.startsWith('01-standoff-square-')),
    group01: allSceneMedia.filter(m => m.filename.startsWith('01-standoff-group01-')),
    group02: allSceneMedia.filter(m => m.filename.startsWith('01-standoff-group02-')),
  }

  console.log('\n📂 按文件名前缀分组:')
  console.log(`   rectangular (01-standoff-scene-XXX): ${byPrefix.rectangular.length} 张`)
  console.log(`   square (01-standoff-square-XXX): ${byPrefix.square.length} 张`)
  console.log(`   group01 (01-standoff-group01-XXX): ${byPrefix.group01.length} 张`)
  console.log(`   group02 (01-standoff-group02-XXX): ${byPrefix.group02.length} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
