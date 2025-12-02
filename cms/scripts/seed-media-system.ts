/**
 * Seed Media System - Simplified Version
 *
 * 媒体系统初始化数据 - 简化版
 *
 * This script creates:
 * 1. MediaCategory (13 categories based on actual product folder structure)
 * 2. MediaTag (15 tags: 9 product series + 6 colors)
 *
 * Features:
 * - Complete EN/ZH bilingual support
 * - Based on actual products folder structure
 * - Simplified tags - only product series and colors
 * - Other attributes (group, sceneNumber, imageNumber) stored in metadata
 *
 * Usage:
 * This will be automatically executed via keystone.ts onConnect hook.
 */

import type { Context } from '.keystone/types'

/**
 * Main Seed Function
 */
export async function seedMediaSystem(context: Context) {
  console.log('🌱 开始初始化媒体分类系统...')
  console.log('🌱 Starting Media System Initialization...\n')

  try {
    // 1. Create Media Categories
    console.log('📁 创建媒体分类 (Creating Media Categories)...')
    await createCategories(context)
    console.log('✅ 媒体分类创建完成！(Media Categories Created!)\n')

    // 2. Create Media Tags
    console.log('🏷️  创建标签 (Creating Media Tags)...')
    await createTags(context)
    console.log('✅ 标签创建完成！(Media Tags Created!)\n')

    console.log('🎉 媒体分类系统初始化完成！')
    console.log('🎉 Media System Initialization Complete!')
    console.log('\n📊 Summary:')

    const categoryCount = await context.query.MediaCategory.count()
    const tagCount = await context.query.MediaTag.count()

    console.log(`   - MediaCategory: ${categoryCount} categories`)
    console.log(`   - MediaTag: ${tagCount} tags`)
  } catch (error) {
    console.error('❌ 初始化失败 (Initialization Failed):', error)
    throw error
  }
}

/**
 * Create Media Categories
 *
 * 创建媒体分类
 *
 * 13 categories based on actual product folder structure:
 * - white: 白底图
 * - scene: 场景图
 * - real: 实拍图
 * - size: 尺寸图
 * - general: 通用产品图
 * - combo: 组合展示图
 * - multi-style: 多款式图
 * - showcase: 橱窗展示图
 * - effect: 效果图
 * - product: 产品主图
 * - craft: 工艺图
 * - packaging: 包装图
 * - color: 颜色展示图
 */
async function createCategories(context: Context) {
  const categories = [
    {
      name: { en: 'White Background', zh: '白底图' },
      slug: 'white',
      icon: 'image',
      order: 1,
      description: { en: 'Product images with white background', zh: '白底产品展示图' },
    },
    {
      name: { en: 'Scene Image', zh: '场景图' },
      slug: 'scene',
      icon: 'image',
      order: 2,
      description: { en: 'Product photos in real-world usage scenes', zh: '产品在实际使用场景中的照片' },
    },
    {
      name: { en: 'Real Photo', zh: '实拍图' },
      slug: 'real',
      icon: 'camera',
      order: 3,
      description: { en: 'Real product photography', zh: '真实产品摄影' },
    },
    {
      name: { en: 'Size Image', zh: '尺寸图' },
      slug: 'size',
      icon: 'ruler',
      order: 4,
      description: { en: 'Technical drawings with dimensions and measurements', zh: '带有尺寸标注的技术图纸' },
    },
    {
      name: { en: 'General Image', zh: '通用产品图' },
      slug: 'general',
      icon: 'package',
      order: 5,
      description: { en: 'General product display images', zh: '通用产品展示图片' },
    },
    {
      name: { en: 'Combo Image', zh: '组合展示图' },
      slug: 'combo',
      icon: 'grid',
      order: 6,
      description: { en: 'Multiple products combined display', zh: '多个产品组合展示' },
    },
    {
      name: { en: 'Multi-style Image', zh: '多款式图' },
      slug: 'multi-style',
      icon: 'layers',
      order: 7,
      description: { en: 'Multiple styles comparison and display', zh: '多款式对比展示' },
    },
    {
      name: { en: 'Showcase Image', zh: '橱窗展示图' },
      slug: 'showcase',
      icon: 'presentation',
      order: 8,
      description: { en: 'Showcase and display images', zh: '橱窗和展示图片' },
    },
    {
      name: { en: 'Effect Image', zh: '效果图' },
      slug: 'effect',
      icon: 'sparkles',
      order: 9,
      description: { en: 'Effect and rendering images', zh: '效果和渲染图' },
    },
    {
      name: { en: 'Product Image', zh: '产品主图' },
      slug: 'product',
      icon: 'package',
      order: 10,
      description: { en: 'Main product display images', zh: '产品主展示图' },
    },
    {
      name: { en: 'Craft Image', zh: '工艺图' },
      slug: 'craft',
      icon: 'wrench',
      order: 11,
      description: { en: 'Manufacturing and craft process images', zh: '生产制造和工艺流程图片' },
    },
    {
      name: { en: 'Packaging Image', zh: '包装图' },
      slug: 'packaging',
      icon: 'box',
      order: 12,
      description: { en: 'Product packaging and box display', zh: '产品包装和盒子展示' },
    },
    {
      name: { en: 'Color Display', zh: '颜色展示图' },
      slug: 'color',
      icon: 'palette',
      order: 13,
      description: { en: 'Color options and variations display', zh: '颜色选项和变化展示' },
    },
  ]

  for (const cat of categories) {
    const existing = await context.query.MediaCategory.findMany({
      where: { slug: { equals: cat.slug } },
      query: 'id',
    })

    if (existing.length > 0) {
      console.log(`  ⏭️  ${cat.name.en} (${cat.name.zh}) - already exists`)
    } else {
      await context.query.MediaCategory.createOne({
        data: {
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          icon: cat.icon,
          description: cat.description,
        },
        query: 'id slug',
      })
      console.log(`  ✓ ${cat.name.en} (${cat.name.zh})`)
    }
  }
}

/**
 * Create Media Tags
 *
 * 创建媒体标签
 *
 * 15 tags total:
 * - 9 PRODUCT_SERIES tags (based on folder names)
 * - 6 COLOR tags
 *
 * Note: Other attributes like group, sceneNumber, imageNumber
 * are stored in the metadata JSON field instead of tags
 */
async function createTags(context: Context) {
  // 1. Product Series Tags (9 tags)
  console.log('  → 创建产品系列标签 (Creating Product Series tags)...')

  const productSeries = [
    { name: { en: 'Glass Standoff', zh: '广告螺丝' }, slug: 'series-glass-standoff', type: 'PRODUCT_SERIES', order: 1 },
    { name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' }, slug: 'series-glass-connected-fitting', type: 'PRODUCT_SERIES', order: 2 },
    { name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' }, slug: 'series-glass-fence-spigot', type: 'PRODUCT_SERIES', order: 3 },
    { name: { en: 'Guardrail Glass Clip', zh: '护栏系列' }, slug: 'series-guardrail-glass-clip', type: 'PRODUCT_SERIES', order: 4 },
    { name: { en: 'Bathroom Glass Clip', zh: '浴室系列' }, slug: 'series-bathroom-glass-clip', type: 'PRODUCT_SERIES', order: 5 },
    { name: { en: 'Glass Hinge', zh: '浴室夹' }, slug: 'series-glass-hinge', type: 'PRODUCT_SERIES', order: 6 },
    { name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' }, slug: 'series-sliding-door-kit', type: 'PRODUCT_SERIES', order: 7 },
    { name: { en: 'Bathroom & Door Handle', zh: '浴室&大门拉手' }, slug: 'series-bathroom-door-handle', type: 'PRODUCT_SERIES', order: 8 },
    { name: { en: 'Hidden Hook', zh: '挂钩' }, slug: 'series-hidden-hook', type: 'PRODUCT_SERIES', order: 9 },
  ]

  await createTagBatch(context, productSeries)

  // 2. Color Tags (6 tags)
  console.log('  → 创建颜色标签 (Creating Color tags)...')

  const colors = [
    { name: { en: 'Silver', zh: '银色' }, slug: 'color-silver', type: 'COLOR', order: 1 },
    { name: { en: 'Black', zh: '黑色' }, slug: 'color-black', type: 'COLOR', order: 2 },
    { name: { en: 'Gold', zh: '金色' }, slug: 'color-gold', type: 'COLOR', order: 3 },
    { name: { en: 'Rose Gold', zh: '玫瑰金' }, slug: 'color-rose-gold', type: 'COLOR', order: 4 },
    { name: { en: 'Brushed', zh: '拉丝' }, slug: 'color-brushed', type: 'COLOR', order: 5 },
    { name: { en: 'Polished', zh: '抛光' }, slug: 'color-polished', type: 'COLOR', order: 6 },
  ]

  await createTagBatch(context, colors)

  console.log('  ✅ 共创建 15 个标签 (Created 15 tags total)')
}

/**
 * Helper: Create tags in batch with existence check
 */
async function createTagBatch(context: Context, tags: any[]) {
  for (const tag of tags) {
    const existing = await context.query.MediaTag.findMany({
      where: { slug: { equals: tag.slug } },
      query: 'id',
    })

    if (existing.length > 0) {
      console.log(`     ⏭️ ${tag.name.en} (${tag.name.zh}) - already exists`)
    } else {
      await context.query.MediaTag.createOne({
        data: {
          name: tag.name,
          slug: tag.slug,
          type: tag.type,
          order: tag.order,
        },
        query: 'id',
      })
      console.log(`     ✓ ${tag.name.en} (${tag.name.zh})`)
    }
  }
}
