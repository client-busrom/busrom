/**
 * 清空 AWS Production 数据库表
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/clear-production-tables.ts
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  清空 AWS Production 数据库表...\n')

  // 按依赖顺序清空表
  const tables = [
    // Media 相关
    { name: 'Media', model: prisma.media },
    { name: 'MediaTag', model: prisma.mediaTag },
    { name: 'MediaCategory', model: prisma.mediaCategory },

    // 产品相关
    { name: 'Product', model: prisma.product },
    { name: 'ProductSeries', model: prisma.productSeries },

    // 应用相关
    { name: 'ApplicationContentTranslation', model: prisma.applicationContentTranslation },
    { name: 'Application', model: prisma.application },

    // 首页内容
    { name: 'HeroBannerItem', model: prisma.heroBannerItem },
    { name: 'HeroBanner', model: prisma.heroBanner },
    { name: 'SeriesIntro', model: prisma.seriesIntro },

    // 导航和分类
    { name: 'NavigationMenu', model: prisma.navigationMenu },
    { name: 'Category', model: prisma.category },
  ]

  for (const table of tables) {
    try {
      const count = await table.model.count()
      if (count > 0) {
        await table.model.deleteMany({})
        console.log(`✅ ${table.name}: 删除了 ${count} 条记录`)
      } else {
        console.log(`⏭️  ${table.name}: 已经是空的`)
      }
    } catch (error: any) {
      console.log(`⚠️  ${table.name}: ${error.message}`)
    }
  }

  console.log('\n🎉 清空完成!')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('Error:', e)
  await prisma.$disconnect()
  process.exit(1)
})
