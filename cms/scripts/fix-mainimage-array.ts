/**
 * Fix mainImage Format - 修复 mainImage 为数组格式
 * mainImage 使用 MultipleMediaField，需要数组格式 [{id: "..."}]
 *
 * Usage:
 * cd cms && npx tsx scripts/fix-mainimage-array.ts
 */

// 必须在导入 keystone 配置之前设置环境变量
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

interface ImageField {
  id?: string
}

async function main() {
  console.log('🔧 开始修复 mainImage 为数组格式...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有产品
  const products = await sudoContext.query.Product.findMany({
    query: 'id sku mainImage',
  })

  console.log(`📦 找到 ${products.length} 个产品\n`)

  let fixedCount = 0

  for (const product of products) {
    // 检查 mainImage 是否是单个对象（有 id 属性但不是数组）
    if (product.mainImage && !Array.isArray(product.mainImage)) {
      const mainImage = product.mainImage as ImageField
      if (mainImage.id) {
        try {
          // 将单个对象转为数组
          await sudoContext.query.Product.updateOne({
            where: { id: product.id },
            data: {
              mainImage: [{ id: mainImage.id }]
            },
          })
          fixedCount++
          console.log(`✅ 修复 ${product.sku}: mainImage 转为数组格式`)
        } catch (error: any) {
          console.error(`❌ 修复 ${product.sku} 失败: ${error.message}`)
        }
      }
    }
  }

  console.log('\n📊 修复完成!')
  console.log(`✅ 修复: ${fixedCount} 个产品`)
  console.log(`📦 总计: ${products.length} 个产品`)
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
