/**
 * Update Scene Images Primary Category
 *
 * 更新场景图的主分类
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 更新场景图的主分类...\n')

  // 1. 获取场景图分类
  const sceneCategory = await prisma.mediaCategory.findFirst({
    where: { slug: 'scene-image' }
  })

  if (!sceneCategory) {
    console.log('❌ 未找到 scene-image 分类')
    return
  }

  console.log('✅ 场景图分类:')
  console.log(`   ID: ${sceneCategory.id}`)
  console.log(`   Slug: ${sceneCategory.slug}`)
  console.log(`   Name:`, sceneCategory.name)

  // 2. 获取广告螺丝标签
  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  if (!standoffTag) {
    console.log('\n❌ 未找到 series-glass-standoff 标签')
    return
  }

  // 3. 获取所有场景类型标签
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

  console.log(`\n📋 场景类型标签: ${sceneTags.length} 个`)

  // 4. 获取所有有场景标签但没有主分类的媒体
  const mediaToUpdate = await prisma.media.findMany({
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
        },
        // 没有主分类 或 主分类不是 scene-image
        {
          OR: [
            { primaryCategoryId: null },
            { primaryCategoryId: { not: sceneCategory.id } }
          ]
        }
      ]
    },
    select: {
      id: true,
      filename: true,
      primaryCategoryId: true
    }
  })

  console.log(`\n📊 需要更新的媒体: ${mediaToUpdate.length} 张\n`)

  if (mediaToUpdate.length === 0) {
    console.log('✅ 所有场景图都已有正确的主分类')
    await prisma.$disconnect()
    return
  }

  // 5. 批量更新
  let updated = 0
  for (const media of mediaToUpdate) {
    await prisma.media.update({
      where: { id: media.id },
      data: { primaryCategoryId: sceneCategory.id }
    })
    console.log(`✅ ${media.filename}`)
    updated++
  }

  console.log(`\n📊 更新统计:`)
  console.log(`   更新: ${updated} 张`)
  console.log(`   总计: ${mediaToUpdate.length} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
