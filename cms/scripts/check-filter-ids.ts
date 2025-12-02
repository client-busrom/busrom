/**
 * Check Filter IDs
 *
 * 检查过滤器ID对应的标签和分类
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查过滤器ID...\n')

  const tagId = '75a8b341-2048-459a-b148-7518afdcc173'
  const categoryId = 'ef23fc47-aac1-4652-ab76-f8bcafd7624a'

  // 检查标签
  const tag = await prisma.mediaTag.findUnique({
    where: { id: tagId }
  })

  if (tag) {
    console.log('📋 标签:')
    console.log(`   ID: ${tag.id}`)
    console.log(`   Slug: ${tag.slug}`)
    console.log(`   Name:`, tag.name)
  } else {
    console.log(`❌ 未找到标签 ID: ${tagId}`)
  }

  // 检查分类
  const category = await prisma.mediaCategory.findUnique({
    where: { id: categoryId }
  })

  if (category) {
    console.log('\n📂 分类:')
    console.log(`   ID: ${category.id}`)
    console.log(`   Slug: ${category.slug}`)
    console.log(`   Name:`, category.name)
  } else {
    console.log(`\n❌ 未找到分类 ID: ${categoryId}`)
  }

  // 列出所有 Glass Standoff 相关的标签
  console.log('\n📊 所有场景图相关标签:')
  const sceneTags = await prisma.mediaTag.findMany({
    where: {
      slug: {
        in: [
          'series-glass-standoff',
          'scene-rectangular',
          'scene-square',
          'scene-combination',
          'scene-standalone',
          'scene-series',
          'scene-single',
        ]
      }
    },
    select: {
      id: true,
      slug: true,
      name: true
    }
  })

  sceneTags.forEach(t => {
    console.log(`   ${t.slug}`)
    console.log(`      ID: ${t.id}`)
    console.log(`      Name:`, t.name)
  })

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
