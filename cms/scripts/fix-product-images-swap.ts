/**
 * Fix Product Images - 交换 mainImage 和 showImage
 *
 * 问题: seed 脚本把图片搞反了
 * - mainImage 应该是场景图 (scene) - MultipleMediaField
 * - showImage 应该是白底图 (white) - SingleMediaField
 *
 * 此脚本交换两者的值
 *
 * Usage:
 * cd cms && npx tsx scripts/fix-product-images-swap.ts
 */

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

interface ImageField {
  id?: string
}

async function main() {
  console.log('🔧 开始交换 mainImage 和 showImage...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有产品
  const products = await sudoContext.query.Product.findMany({
    query: 'id sku mainImage showImage',
  })

  console.log(`📦 找到 ${products.length} 个产品\n`)

  let fixedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const product of products) {
    const oldMainImage = product.mainImage // 当前是白底图（需要变成场景图）
    const oldShowImage = product.showImage // 当前是场景图（需要变成白底图）

    // 如果两者都没有，跳过
    if (!oldMainImage && !oldShowImage) {
      console.log(`⚠️ ${product.sku}: 无图片，跳过`)
      skippedCount++
      continue
    }

    try {
      const updates: any = {}

      // showImage (白底图) <- 原来的 mainImage (数组格式取第一个)
      if (oldMainImage && Array.isArray(oldMainImage) && oldMainImage.length > 0) {
        const firstImage = oldMainImage[0] as ImageField
        if (firstImage.id) {
          updates.showImage = { id: firstImage.id }
        }
      } else if (oldMainImage && (oldMainImage as ImageField).id) {
        updates.showImage = { id: (oldMainImage as ImageField).id }
      }

      // mainImage (场景图) <- 原来的 showImage (单个对象转数组)
      if (oldShowImage && (oldShowImage as ImageField).id) {
        updates.mainImage = [{ id: (oldShowImage as ImageField).id }]
      }

      if (Object.keys(updates).length > 0) {
        await sudoContext.query.Product.updateOne({
          where: { id: product.id },
          data: updates,
        })
        fixedCount++
        console.log(`✅ ${product.sku}: 已交换图片`)
      } else {
        skippedCount++
        console.log(`⏭️ ${product.sku}: 无需交换`)
      }
    } catch (error: any) {
      errorCount++
      console.error(`❌ ${product.sku}: 更新失败 - ${error.message}`)
    }
  }

  console.log('\n📊 修复完成!')
  console.log(`✅ 已交换: ${fixedCount}`)
  console.log(`⏭️ 跳过: ${skippedCount}`)
  console.log(`❌ 失败: ${errorCount}`)
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
