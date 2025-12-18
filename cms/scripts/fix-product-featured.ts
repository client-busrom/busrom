/**
 * Fix Product isFeatured - 设置每个系列前3个产品为推荐
 *
 * Usage:
 * cd cms && npx tsx scripts/fix-product-featured.ts
 */

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

async function main() {
  console.log('🔧 开始设置每个系列前3个产品为推荐...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有系列
  const allSeries = await sudoContext.query.ProductSeries.findMany({
    query: 'id name',
  })

  console.log(`📦 找到 ${allSeries.length} 个系列\n`)

  let updatedCount = 0

  for (const series of allSeries) {
    const seriesName = series.name?.en || series.name?.zh || series.id

    // 获取该系列的所有产品，按 order 排序
    const products = await sudoContext.query.Product.findMany({
      where: { series: { id: { equals: series.id } } },
      orderBy: { order: 'asc' },
      query: 'id sku isFeatured order',
    })

    console.log(`\n📂 ${seriesName}: ${products.length} 个产品`)

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const shouldBeFeatured = i < 3

      if (product.isFeatured !== shouldBeFeatured) {
        try {
          await sudoContext.query.Product.updateOne({
            where: { id: product.id },
            data: { isFeatured: shouldBeFeatured },
          })
          updatedCount++
          console.log(`  ✅ ${product.sku}: isFeatured = ${shouldBeFeatured}`)
        } catch (error: any) {
          console.error(`  ❌ ${product.sku}: 更新失败 - ${error.message}`)
        }
      }
    }
  }

  console.log('\n📊 修复完成!')
  console.log(`✅ 更新: ${updatedCount} 个产品`)
}

main()
  .then(() => {
    console.log('\n✅ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })
