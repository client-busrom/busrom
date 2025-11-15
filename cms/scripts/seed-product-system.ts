/**
 * Seed Product System - Initial Data Migration
 *
 * 产品系统初始化数据迁移
 *
 * This script creates:
 * 1. Product Categories (10 flat categories, 1-to-1 with ProductSeries)
 * 2. ProductSeries (10 predefined product series)
 * 3. Links ProductSeries to their categories (1-to-1 mapping)
 *
 * Usage:
 * This will be automatically executed via keystone.ts onConnect hook.
 */

import type { Context } from '.keystone/types'

/**
 * Main Seed Function
 *
 * 主种子函数
 */
export async function seedProductSystem(context: Context) {
  console.log('🌱 开始初始化产品系统...')
  console.log('🌱 Starting Product System Initialization...\n')

  try {
    // 1. Create Categories and ProductSeries together (1-to-1)
    console.log('📁 创建产品分类和系列（1对1映射）...')
    console.log('📁 Creating Product Categories & Series (1-to-1 mapping)...')
    await createCategoriesAndSeries(context)
    console.log('✅ 产品系统创建完成！')
    console.log('✅ Product System Created!\n')

    console.log('🎉 产品系统初始化完成！')
    console.log('🎉 Product System Initialization Complete!')
    console.log('\n📊 Summary:')
    console.log('   - Categories: 10 flat categories')
    console.log('   - ProductSeries: 10 series (1-to-1 mapping)')
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    console.error('❌ Initialization Failed:', error)
    throw error
  }
}

/**
 * Create Categories and ProductSeries together (1-to-1 mapping)
 *
 * 创建分类和产品系列（1对1映射）
 */
async function createCategoriesAndSeries(context: Context) {
  // Check if already exists
  const existingCategoryCount = await context.query.Category.count({
    where: { type: { equals: 'PRODUCT' } },
  })
  const existingSeriesCount = await context.query.ProductSeries.count({})

  if (existingCategoryCount > 0 || existingSeriesCount > 0) {
    console.log(`  ⚠️  已存在 ${existingCategoryCount} 个分类和 ${existingSeriesCount} 个系列，跳过创建`)
    console.log(`  ⚠️  ${existingCategoryCount} categories and ${existingSeriesCount} series exist, skipping...`)
    return
  }

  // 10 Categories and ProductSeries (1-to-1 mapping)
  const data = [
    {
      slug: 'glass-standoff',
      name: { en: 'Glass Standoff', zh: '广告螺丝' },
      description: {
        en: 'Glass standoffs for signage and display applications',
        zh: '用于标识和展示应用的广告螺丝',
      },
      order: 1,
    },
    {
      slug: 'glass-connected-fitting',
      name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' },
      description: {
        en: 'Glass railing and handrail connection fittings covering various types of railing connection accessories',
        zh: '玻璃栏杆扶手连接件，覆盖多种栏杆连接类配件',
      },
      order: 2,
    },
    {
      slug: 'glass-fence-spigot',
      name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' },
      description: {
        en: 'Glass fence spigot base supports, also known as pool spigots',
        zh: '玻璃护栏支架底座，又称泳池夹',
      },
      order: 3,
    },
    {
      slug: 'guardrail-glass-clip',
      name: { en: 'Guardrail Glass Clip', zh: '护栏系列' },
      description: {
        en: 'Guardrail series mainly used for railings and glass connections',
        zh: '护栏系列，主要用于护栏或玻璃连接',
      },
      order: 4,
    },
    {
      slug: 'bathroom-glass-clip',
      name: { en: 'Bathroom Glass Clip', zh: '浴室系列' },
      description: {
        en: 'Bathroom series mainly used for bathroom glass connections',
        zh: '浴室系列，主要用于浴室玻璃连接',
      },
      order: 5,
    },
    {
      slug: 'glass-hinge',
      name: { en: 'Glass Hinge', zh: '浴室夹' },
      description: {
        en: 'Glass hinges, also known as bathroom clips, mainly used for glass doors and glass-to-wall connections',
        zh: '玻璃合页，又称浴室夹，主要用于玻璃门/玻璃与墙连接',
      },
      order: 6,
    },
    {
      slug: 'sliding-door-kit',
      name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' },
      description: {
        en: 'Sliding door roller kits mainly used for glass sliding doors, typically sold as complete sets',
        zh: '移门滑轮套装，主要用于玻璃推拉门，通常为整套套装',
      },
      order: 7,
    },
    {
      slug: 'bathroom-handle',
      name: { en: 'Bathroom Handle', zh: '浴室&大门拉手' },
      description: {
        en: 'Bathroom and door handles, mainly used on bathroom glass doors',
        zh: '浴室及大门拉手，主要用于浴室玻璃门',
      },
      order: 8,
    },
    {
      slug: 'door-handle',
      name: { en: 'Door Handle', zh: '大门拉手' },
      description: {
        en: 'Door handles mainly used on main doors, including glass doors and solid doors',
        zh: '大门拉手，主要用于大门，包括玻璃大门和实体大门',
      },
      order: 9,
    },
    {
      slug: 'hidden-hook',
      name: { en: 'Hidden Hook', zh: '挂钩' },
      description: {
        en: 'Hooks including rotating or non-rotating hidden hooks',
        zh: '挂钩，主要包含旋转式或非旋转式隐藏挂钩',
      },
      order: 10,
    },
  ]

  for (const item of data) {
    try {
      // Create Category
      const category = await context.query.Category.createOne({
        data: {
          slug: item.slug,
          name: item.name,
          description: item.description,
          type: 'PRODUCT',
          order: item.order,
          status: 'PUBLISHED',
        },
        query: 'id slug',
      })

      // Create ProductSeries with the same data
      const series = await context.query.ProductSeries.createOne({
        data: {
          slug: item.slug,
          name: item.name,
          description: item.description,
          category: { connect: { id: category.id } },
          order: item.order,
          status: 'PUBLISHED',
        },
        query: 'id slug',
      })

      console.log(`  ✓ ${item.name.en} (${item.name.zh})`)
      console.log(`    → Category ID: ${category.id}`)
      console.log(`    → Series ID: ${series.id}\n`)
    } catch (error: any) {
      if (error.message?.includes('Unique constraint')) {
        console.log(`  ⚠️  Skipping ${item.slug} (already exists)\n`)
      } else {
        throw error
      }
    }
  }
}
