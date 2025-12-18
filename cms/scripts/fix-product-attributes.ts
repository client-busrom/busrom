/**
 * Fix Product Attributes Format
 *
 * 修复产品属性格式，从旧格式转换为正确的多语言格式
 *
 * 旧格式:
 * {
 *   brand: { en: 'Busrom', zh: 'Busrom' },
 *   material: { en: '304 Stainless Steel', zh: '304不锈钢' },
 *   ...
 * }
 *
 * 新格式:
 * {
 *   en: [
 *     { key: 'Brand', value: 'Busrom', isShow: true },
 *     { key: 'Material', value: '304 Stainless Steel', isShow: true },
 *     ...
 *   ],
 *   zh: [
 *     { key: '品牌', value: 'Busrom', isShow: true },
 *     { key: '材质', value: '304不锈钢', isShow: true },
 *     ...
 *   ]
 * }
 *
 * Usage:
 * cd cms && npx tsx scripts/fix-product-attributes.ts
 */

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms'

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

// 属性名称映射
const attributeKeyMap: Record<string, { en: string; zh: string }> = {
  brand: { en: 'Brand', zh: '品牌' },
  series: { en: 'Series', zh: '系列' },
  model: { en: 'Model', zh: '型号' },
  material: { en: 'Material', zh: '材质' },
  finish: { en: 'Finish', zh: '表面处理' },
  glassThickness: { en: 'Glass Thickness', zh: '玻璃厚度' },
  loadCapacity: { en: 'Load Capacity', zh: '承重能力' },
  warranty: { en: 'Warranty', zh: '质保' },
  origin: { en: 'Origin', zh: '产地' },
}

interface OldFormatValue {
  en?: string
  zh?: string
}

interface OldFormatAttributes {
  [key: string]: OldFormatValue | string
}

interface NewFormatAttribute {
  key: string
  value: string
  isShow: boolean
}

interface NewFormatAttributes {
  [locale: string]: NewFormatAttribute[]
}

function convertAttributes(oldAttrs: OldFormatAttributes): NewFormatAttributes | null {
  if (!oldAttrs || typeof oldAttrs !== 'object') return null

  // 检查是否已经是新格式
  if (Array.isArray(oldAttrs['en']) || Array.isArray(oldAttrs['zh'])) {
    console.log('    已经是新格式，跳过转换')
    return null
  }

  const newAttrs: NewFormatAttributes = {
    en: [],
    zh: [],
  }

  for (const [attrKey, attrValue] of Object.entries(oldAttrs)) {
    const keyName = attributeKeyMap[attrKey] || { en: attrKey, zh: attrKey }

    if (typeof attrValue === 'string') {
      // 简单字符串值
      newAttrs['en'].push({ key: keyName.en, value: attrValue, isShow: true })
      newAttrs['zh'].push({ key: keyName.zh, value: attrValue, isShow: true })
    } else if (attrValue && typeof attrValue === 'object') {
      // 多语言对象值
      const valueObj = attrValue as OldFormatValue
      if (valueObj.en) {
        newAttrs['en'].push({ key: keyName.en, value: valueObj.en, isShow: true })
      }
      if (valueObj.zh) {
        newAttrs['zh'].push({ key: keyName.zh, value: valueObj.zh, isShow: true })
      }
    }
  }

  return newAttrs
}

async function main() {
  console.log('🔧 开始修复产品属性格式...\n')

  const context = getContext(config, PrismaModule)
  const sudoContext = context.sudo()

  // 获取所有产品
  const products = await sudoContext.query.Product.findMany({
    query: 'id sku attributes',
  })

  console.log(`📦 找到 ${products.length} 个产品\n`)

  let fixedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const product of products) {
    const oldAttrs = product.attributes as OldFormatAttributes | null

    if (!oldAttrs) {
      console.log(`⚠️ ${product.sku}: 无 attributes，跳过`)
      skippedCount++
      continue
    }

    const newAttrs = convertAttributes(oldAttrs)

    if (!newAttrs) {
      skippedCount++
      continue
    }

    try {
      await sudoContext.query.Product.updateOne({
        where: { id: product.id },
        data: { attributes: newAttrs },
      })
      fixedCount++
      console.log(`✅ ${product.sku}: 已转换 (${newAttrs['en'].length} 个属性)`)
    } catch (error: any) {
      errorCount++
      console.error(`❌ ${product.sku}: 更新失败 - ${error.message}`)
    }
  }

  console.log('\n📊 修复完成!')
  console.log(`✅ 已修复: ${fixedCount}`)
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
