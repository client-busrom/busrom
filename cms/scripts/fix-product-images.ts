/**
 * Fix Product Images - 修复产品图片格式
 * 将 { connect: { id: "..." } } 格式改为 { id: "..." } 格式
 *
 * Usage:
 * cd cms && npx tsx scripts/fix-product-images.ts
 */

// 必须在导入 keystone 配置之前设置环境变量
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

interface ImageField {
  connect?: { id: string }
  id?: string
}

async function main() {
  console.log('🔧 开始修复产品图片格式...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有产品
  const products = await sudoContext.query.Product.findMany({
    query: 'id sku mainImage showImage',
  })

  console.log(`📦 找到 ${products.length} 个产品\n`)

  let fixedCount = 0

  for (const product of products) {
    let needsUpdate = false
    const updates: any = {}

    // 检查 mainImage
    if (product.mainImage) {
      const mainImage = product.mainImage as ImageField
      if (mainImage.connect?.id) {
        updates.mainImage = { id: mainImage.connect.id }
        needsUpdate = true
      }
    }

    // 检查 showImage
    if (product.showImage) {
      const showImage = product.showImage as ImageField
      if (showImage.connect?.id) {
        updates.showImage = { id: showImage.connect.id }
        needsUpdate = true
      }
    }

    if (needsUpdate) {
      try {
        await sudoContext.query.Product.updateOne({
          where: { id: product.id },
          data: updates,
        })
        fixedCount++
        console.log(`✅ 修复 ${product.sku}: mainImage=${updates.mainImage?.id || '无'}, showImage=${updates.showImage?.id || '无'}`)
      } catch (error: any) {
        console.error(`❌ 修复 ${product.sku} 失败: ${error.message}`)
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
