/**
 * Debug Media Query
 *
 * 调试媒体查询
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🔍 调试媒体查询...\n')

  const standoffTagId = '75a8b341-2048-459a-b148-7518afdcc173'
  const sceneCategoryId = 'ef23fc47-aac1-4652-ab76-f8bcafd7624a'

  // 方法1：使用 Prisma 查询
  console.log('方法1：Prisma 查询')
  const prismaCount = await prisma.media.count({
    where: {
      AND: [
        { tags: { some: { id: standoffTagId } } },
        { primaryCategoryId: sceneCategoryId }
      ]
    }
  })
  console.log(`   结果: ${prismaCount} 张\n`)

  // 方法2：直接 SQL 查询
  console.log('方法2：原始 SQL 查询')
  const sqlResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT m.id) as count
    FROM "Media" m
    INNER JOIN "_Media_tags" mt ON m.id = mt."A"
    WHERE mt."B" = ${standoffTagId}::uuid
    AND m."primaryCategory" = ${sceneCategoryId}::uuid
  `
  console.log(`   结果: ${sqlResult[0].count} 张\n`)

  // 方法3：检查有 standoff 标签的所有媒体
  console.log('方法3：所有广告螺丝媒体')
  const allStandoff = await prisma.media.count({
    where: {
      tags: { some: { id: standoffTagId } }
    }
  })
  console.log(`   结果: ${allStandoff} 张\n`)

  // 方法4：检查有场景图分类的所有媒体
  console.log('方法4：所有场景图分类的媒体')
  const allSceneCategory = await prisma.media.count({
    where: {
      primaryCategoryId: sceneCategoryId
    }
  })
  console.log(`   结果: ${allSceneCategory} 张\n`)

  // 方法5：列出最近导入的文件（按文件名）
  console.log('方法5：检查新导入的文件是否在数据库中')
  const newFiles = [
    '01-standoff-square-001.jpg',
    '01-standoff-square-022.jpg',
    '01-standoff-group01-common-001.jpg',
    '01-standoff-group01-scene01-001.jpg',
    '01-standoff-group02-scene01-001.jpg',
  ]

  for (const filename of newFiles) {
    const media = await prisma.media.findFirst({
      where: { filename },
      select: {
        id: true,
        filename: true,
        primaryCategoryId: true,
        tags: {
          select: { slug: true }
        }
      }
    })

    if (media) {
      console.log(`   ✅ ${filename}`)
      console.log(`      分类: ${media.primaryCategoryId === sceneCategoryId ? 'scene-image ✓' : media.primaryCategoryId || '无'}`)
      console.log(`      标签: ${media.tags.map(t => t.slug).join(', ')}`)
    } else {
      console.log(`   ❌ ${filename} - 未找到`)
    }
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
