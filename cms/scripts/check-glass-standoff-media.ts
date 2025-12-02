/**
 * Check Glass Standoff Media
 *
 * 检查广告螺丝系列的媒体数据
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查广告螺丝系列的媒体数据...\n')

  // 1. Find Glass Standoff tag
  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  if (!standoffTag) {
    console.log('❌ 未找到 series-glass-standoff 标签')
    return
  }

  console.log('✅ 找到标签:', standoffTag.name)
  console.log('   ID:', standoffTag.id)

  // 2. Find all scene type tags
  const sceneTag = await prisma.mediaTag.findFirst({
    where: { slug: 'func-scene-photo' }
  })

  console.log('\n场景图标签:', sceneTag?.name)
  console.log('   ID:', sceneTag?.id)

  // 3. Count media with Glass Standoff tag
  const allStandoffMedia = await prisma.media.findMany({
    where: {
      tags: {
        some: {
          id: standoffTag.id
        }
      }
    },
    select: {
      id: true,
      filename: true,
      tags: {
        select: {
          id: true,
          slug: true,
          name: true
        }
      }
    }
  })

  console.log('\n📊 广告螺丝系列所有媒体:')
  console.log('   总数:', allStandoffMedia.length)

  // 4. Count media with both Glass Standoff and Scene Photo tags
  const sceneMedia = allStandoffMedia.filter(media =>
    media.tags.some(tag => tag.slug === 'func-scene-photo')
  )

  console.log('\n📊 广告螺丝系列场景图:')
  console.log('   总数:', sceneMedia.length)

  // 5. List all scene media
  console.log('\n📋 场景图列表:')
  sceneMedia.forEach((media, index) => {
    console.log(`   ${index + 1}. ${media.filename}`)
    const tagSlugs = media.tags.map(t => t.slug).join(', ')
    console.log(`      标签: ${tagSlugs}`)
  })

  // 6. Check for other function types
  console.log('\n📋 按功能类型分类:')
  const funcTypes = new Map<string, number>()

  allStandoffMedia.forEach(media => {
    media.tags.forEach(tag => {
      if (tag.slug?.startsWith('func-')) {
        const count = funcTypes.get(tag.slug) || 0
        funcTypes.set(tag.slug, count + 1)
      }
    })
  })

  funcTypes.forEach((count, funcType) => {
    console.log(`   ${funcType}: ${count} 张`)
  })

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
