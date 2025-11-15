/**
 * Seed Test Products - Add Sample Products for Testing
 *
 * 添加测试产品数据
 *
 * Usage:
 * pnpm tsx cms/scripts/seed-test-products.ts
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

async function main() {
  console.log('🌱 开始添加测试产品...')
  console.log('🌱 Starting to add test products...\n')

  const context = getContext(config, PrismaModule)

  // Use sudo context to bypass permissions
  const sudoContext = context.sudo()

  try {
    // 获取所有已创建的 ProductSeries
    const allSeries = await sudoContext.query.ProductSeries.findMany({
      query: 'id slug name',
    })

    if (allSeries.length === 0) {
      console.log('❌ 没有找到产品系列，请先运行产品系统初始化')
      console.log('❌ No product series found. Please run product system initialization first.')
      return
    }

    console.log(`✓ 找到 ${allSeries.length} 个产品系列`)
    console.log(`✓ Found ${allSeries.length} product series\n`)

    // 为每个系列创建 3-5 个产品
    let totalCreated = 0

    for (const series of allSeries.slice(0, 3)) {
      // 只为前3个系列创建产品以便测试
      console.log(`\n📦 为系列 "${series.name.en}" 创建产品...`)
      console.log(`📦 Creating products for series "${series.name.en}"...`)

      const products = generateProductsForSeries(series)

      for (const productData of products) {
        try {
          // 检查产品是否已存在
          const existing = await sudoContext.query.Product.findMany({
            where: { sku: { equals: productData.sku } },
            query: 'id',
          })

          if (existing.length > 0) {
            console.log(`  ⚠️  产品 ${productData.sku} 已存在，跳过`)
            continue
          }

          const product = await sudoContext.query.Product.createOne({
            data: productData,
            query: 'id sku',
          })

          console.log(`  ✓ 创建产品: ${productData.sku} - ${productData.name.en}`)
          totalCreated++
        } catch (error: any) {
          console.error(`  ❌ 创建产品失败 ${productData.sku}:`, error.message)
        }
      }
    }

    console.log(`\n✅ 完成！共创建 ${totalCreated} 个测试产品`)
    console.log(`✅ Done! Created ${totalCreated} test products`)
  } catch (error) {
    console.error('❌ 错误:', error)
    throw error
  }
}

/**
 * 为指定系列生成产品数据
 */
function generateProductsForSeries(series: any) {
  const seriesSlug = series.slug
  const seriesName = series.name.en

  // 根据系列类型生成不同的产品
  const products = []

  // 材质选项
  const materials = ['Stainless Steel 304', 'Stainless Steel 316', 'Brass', 'Aluminum']
  const finishes = ['Polished', 'Brushed', 'Satin', 'Mirror']
  const sizes = ['12mm', '15mm', '19mm', '25mm']

  // 为每个系列创建 4 个产品变体
  for (let i = 0; i < 4; i++) {
    const material = materials[i % materials.length]
    const finish = finishes[i % finishes.length]
    const size = sizes[i % sizes.length]

    const sku = `${seriesSlug.toUpperCase().replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`

    const product = {
      sku: sku,
      slug: `${seriesSlug}-${size.toLowerCase()}-${finish.toLowerCase()}`.replace(/\s+/g, '-'),

      // 多语言名称
      name: {
        en: `${seriesName} - ${size} ${finish}`,
        zh: `${series.name.zh} - ${size} ${finish}`,
      },

      // 简短描述
      shortDescription: {
        en: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `High-quality ${material} ${seriesName.toLowerCase()} with ${finish.toLowerCase()} finish. Perfect for modern architectural applications.`,
                },
              ],
            },
          ],
        }),
        zh: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `优质${material}${series.name.zh}，${finish}表面处理。适用于现代建筑应用。`,
                },
              ],
            },
          ],
        }),
      },

      // 完整描述
      description: {
        en: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Product Description' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `This ${size} ${seriesName.toLowerCase()} is crafted from premium ${material}, offering exceptional durability and corrosion resistance. The ${finish.toLowerCase()} finish provides an elegant appearance suitable for both residential and commercial installations.`,
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Key Features' }],
            },
            {
              type: 'unorderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: `Premium ${material} construction` }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: `${finish} finish for lasting beauty` }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Corrosion resistant' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Easy installation' }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },

      // 产品属性
      attributes: [
        {
          key: { en: 'Material', zh: '材质' },
          value: { en: material, zh: material },
        },
        {
          key: { en: 'Finish', zh: '表面处理' },
          value: { en: finish, zh: finish },
        },
        {
          key: { en: 'Size', zh: '尺寸' },
          value: { en: size, zh: size },
        },
        {
          key: { en: 'Weight', zh: '重量' },
          value: { en: `${50 + i * 10}g`, zh: `${50 + i * 10}克` },
        },
      ],

      // 产品规格
      specifications: {
        'Thread Size': size,
        Material: material,
        Finish: finish,
        'Load Capacity': '50kg',
        'Temperature Range': '-40°C to +120°C',
        'Corrosion Resistance': 'Grade 5',
      },

      // 关联到系列
      series: { connect: { id: series.id } },

      // 标记前两个产品为推荐
      isFeatured: i < 2,

      // 排序
      order: i + 1,

      // 状态
      status: 'PUBLISHED',
    }

    products.push(product)
  }

  return products
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
