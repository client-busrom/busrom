/**
 * Delete All Products
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

async function main() {
  console.log('🗑️  删除所有产品...')
  console.log('🗑️  Deleting all products...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  try {
    // 获取所有产品
    const products = await sudoContext.query.Product.findMany({
      query: 'id sku',
    })

    console.log(`找到 ${products.length} 个产品`)
    console.log(`Found ${products.length} products\n`)

    // 删除所有产品
    for (const product of products) {
      await sudoContext.query.Product.deleteOne({
        where: { id: product.id },
      })
      console.log(`✓ 删除: ${product.sku}`)
    }

    console.log(`\n✅ 完成！删除了 ${products.length} 个产品`)
    console.log(`✅ Done! Deleted ${products.length} products`)
  } catch (error) {
    console.error('❌ 错误:', error)
    throw error
  }
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
