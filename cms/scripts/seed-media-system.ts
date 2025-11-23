/**
 * Seed Media System - Merged & Complete Version
 *
 * 媒体系统初始化数据 - 合并完整版
 *
 * This script creates:
 * 1. MediaCategory (12 categories based on actual product structure)
 * 2. MediaTag (150+ tags: product series, specs, colors, scene types, etc.)
 *
 * Features:
 * - Complete EN/ZH bilingual support
 * - Based on actual products folder structure
 * - Merged from seed-media-system.ts and seed-media-taxonomy.ts
 * - Avoids all conflicts and duplicates
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
 * 12 categories based on actual product folder structure
 */
async function createCategories(context: Context) {
  const categories = [
    {
      name: { en: 'Product Image', zh: '产品图' },
      slug: 'product-image',
      icon: 'package',
      order: 1,
      description: { en: 'Product display images with white or solid background', zh: '纯产品展示图(白底或纯色背景)' },
    },
    {
      name: { en: 'Scene Image', zh: '场景图' },
      slug: 'scene-image',
      icon: 'image',
      order: 2,
      description: { en: 'Product photos in real-world usage scenes', zh: '产品在实际使用场景中的照片' },
    },
    {
      name: { en: 'Actual Photo', zh: '实拍图' },
      slug: 'actual-photo',
      icon: 'camera',
      order: 3,
      description: { en: 'Real product photography', zh: '真实产品摄影' },
    },
    {
      name: { en: 'Dimension Image', zh: '尺寸图' },
      slug: 'dimension-image',
      icon: 'ruler',
      order: 4,
      description: { en: 'Technical drawings with dimensions and measurements', zh: '带有尺寸标注的技术图纸' },
    },
    {
      name: { en: 'Installation Image', zh: '安装图' },
      slug: 'installation-image',
      icon: 'wrench',
      order: 5,
      description: { en: 'Installation instruction and demonstration images', zh: '安装说明和示范图片' },
    },
    {
      name: { en: 'Detail Image', zh: '细节图' },
      slug: 'detail-image',
      icon: 'zoom-in',
      order: 6,
      description: { en: 'Close-up detail shots of product features', zh: '产品细节特写' },
    },
    {
      name: { en: 'Combined Image', zh: '组合展示图' },
      slug: 'combined-image',
      icon: 'grid',
      order: 7,
      description: { en: 'Multiple products combined display', zh: '多个产品组合展示' },
    },
    {
      name: { en: 'Multi-style Image', zh: '多款式图' },
      slug: 'multi-style-image',
      icon: 'layers',
      order: 8,
      description: { en: 'Multiple styles comparison and display', zh: '多款式对比展示' },
    },
    {
      name: { en: 'Color Display', zh: '颜色展示' },
      slug: 'color-display',
      icon: 'palette',
      order: 9,
      description: { en: 'Color options and variations display', zh: '颜色选项和变化展示' },
    },
    {
      name: { en: 'Common Image', zh: '通用图' },
      slug: 'common-image',
      icon: 'folder',
      order: 10,
      description: { en: 'Common media files shared across products', zh: '产品间共享的通用媒体文件' },
    },
    {
      name: { en: 'Manufacturing', zh: '生产图' },
      slug: 'manufacturing',
      icon: 'factory',
      order: 11,
      description: { en: 'Manufacturing, production process, and logistics images', zh: '生产制造、工艺流程和物流相关图片' },
    },
    {
      name: { en: 'Package Image', zh: '包装图' },
      slug: 'package-image',
      icon: 'box',
      order: 12,
      description: { en: 'Product packaging and box display', zh: '产品包装和盒子展示' },
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
 */
async function createTags(context: Context) {
  // 1. Product Series Tags
  console.log('  → 创建产品系列标签 (Creating Product Series tags)...')

  const productSeries = [
    { name: { en: 'Glass Standoff', zh: '玻璃固定夹' }, slug: 'series-glass-standoff', type: 'PRODUCT_SERIES', order: 1 },
    { name: { en: 'Glass Connected Fitting', zh: '玻璃连接件' }, slug: 'series-glass-connected-fitting', type: 'PRODUCT_SERIES', order: 2 },
    { name: { en: 'Glass Fence Spigot', zh: '玻璃栏杆立柱' }, slug: 'series-glass-fence-spigot', type: 'PRODUCT_SERIES', order: 3 },
    { name: { en: 'Guardrail Glass Clip', zh: '护栏玻璃夹' }, slug: 'series-guardrail-glass-clip', type: 'PRODUCT_SERIES', order: 4 },
    { name: { en: 'Bathroom Glass Clip', zh: '浴室玻璃夹' }, slug: 'series-bathroom-glass-clip', type: 'PRODUCT_SERIES', order: 5 },
    { name: { en: 'Glass Hinge', zh: '玻璃合页' }, slug: 'series-glass-hinge', type: 'PRODUCT_SERIES', order: 6 },
    { name: { en: 'Sliding Door Kit', zh: '滑动门套件' }, slug: 'series-sliding-door-kit', type: 'PRODUCT_SERIES', order: 7 },
    { name: { en: 'Bathroom Handle', zh: '浴室拉手' }, slug: 'series-bathroom-handle', type: 'PRODUCT_SERIES', order: 8 },
    { name: { en: 'Door Handle', zh: '门拉手' }, slug: 'series-door-handle', type: 'PRODUCT_SERIES', order: 9 },
    { name: { en: 'Hidden Hook', zh: '隐藏式挂钩' }, slug: 'series-hidden-hook', type: 'PRODUCT_SERIES', order: 10 },
  ]

  await createTagBatch(context, productSeries)

  // 2. Scene Type Tags
  console.log('  → 创建场景类型标签 (Creating Scene Type tags)...')

  const sceneTypes = [
    // 基础场景类型
    { name: { en: 'Normal Scene', zh: '普通场景图' }, slug: 'scene-normal', type: 'SCENE_TYPE', order: 1 },
    { name: { en: 'Single Scene', zh: '单独场景图' }, slug: 'scene-single', type: 'SCENE_TYPE', order: 2 },
    { name: { en: 'Combination Scene', zh: '场景组合图' }, slug: 'scene-combination', type: 'SCENE_TYPE', order: 3 },
    { name: { en: 'Series Scene', zh: '系列场景图' }, slug: 'scene-series', type: 'SCENE_TYPE', order: 4 },

    // 具体应用场景类型（基于文件夹结构）
    { name: { en: 'Handrail Fitting', zh: '扶手连接件场景' }, slug: 'scene-handrail-fitting', type: 'SCENE_TYPE', order: 10 },
    { name: { en: 'Glass Connector', zh: '玻璃连接件场景' }, slug: 'scene-glass-connector', type: 'SCENE_TYPE', order: 11 },
    { name: { en: 'Bathroom', zh: '浴室场景' }, slug: 'scene-bathroom', type: 'SCENE_TYPE', order: 12 },
    { name: { en: 'Guardrail', zh: '护栏场景' }, slug: 'scene-guardrail', type: 'SCENE_TYPE', order: 13 },
    { name: { en: 'Outdoor', zh: '室外场景' }, slug: 'scene-outdoor', type: 'SCENE_TYPE', order: 14 },
    { name: { en: 'Indoor', zh: '室内场景' }, slug: 'scene-indoor', type: 'SCENE_TYPE', order: 15 },
    { name: { en: 'Standalone', zh: '独立场景' }, slug: 'scene-standalone', type: 'SCENE_TYPE', order: 16 },
    { name: { en: 'Closeup', zh: '特写场景' }, slug: 'scene-closeup', type: 'SCENE_TYPE', order: 17 },

    // 场景格式
    { name: { en: 'Rectangular Format', zh: '长方形格式' }, slug: 'scene-rectangular', type: 'SCENE_TYPE', order: 20 },
    { name: { en: 'Square Format', zh: '正方形格式' }, slug: 'scene-square', type: 'SCENE_TYPE', order: 21 },
  ]

  await createTagBatch(context, sceneTypes)

  // 3. Specification Tags
  console.log('  → 创建规格标签 (Creating Specification tags)...')

  const specs = [
    // General/Common
    { name: { en: 'General', zh: '通用款' }, slug: 'spec-general', type: 'SPEC', order: 1 },
    { name: { en: 'Common', zh: '公共' }, slug: 'spec-common', type: 'SPEC', order: 2 },
    { name: { en: 'Featured', zh: '精选' }, slug: 'spec-featured', type: 'SPEC', order: 3 },

    // Glass Connected Fitting
    { name: { en: 'Combined Elbow Adjustable', zh: '组合款-弯头-可调' }, slug: 'spec-combined-elbow-adjustable', type: 'SPEC', order: 200 },
    { name: { en: 'Combined Elbow Fixed', zh: '组合款-弯头-固定' }, slug: 'spec-combined-elbow-fixed', type: 'SPEC', order: 201 },
    { name: { en: 'Combined Flat Fixed', zh: '组合款-平面-固定' }, slug: 'spec-combined-flat-fixed', type: 'SPEC', order: 202 },
    { name: { en: 'Integrated Elbow Adjustable', zh: '一体款-弯头-可调' }, slug: 'spec-integrated-elbow-adjustable', type: 'SPEC', order: 203 },
    { name: { en: 'Integrated Elbow Fixed', zh: '一体款-弯头-固定' }, slug: 'spec-integrated-elbow-fixed', type: 'SPEC', order: 204 },
    { name: { en: 'Integrated Flat Fixed', zh: '一体款-平面-固定' }, slug: 'spec-integrated-flat-fixed', type: 'SPEC', order: 205 },

    // Glass Fence Spigot
    { name: { en: 'Round Head', zh: '圆头款' }, slug: 'spec-round-head', type: 'SPEC', order: 300 },
    { name: { en: 'Square Head', zh: '方头款' }, slug: 'spec-square-head', type: 'SPEC', order: 301 },

    // Angles
    { name: { en: 'Angle 0°', zh: '0度角' }, slug: 'spec-angle-0', type: 'SPEC', order: 400 },
    { name: { en: 'Angle 90°', zh: '90度角' }, slug: 'spec-angle-90', type: 'SPEC', order: 401 },
    { name: { en: 'Angle 90° Single', zh: '90度-单边' }, slug: 'spec-angle-90-single', type: 'SPEC', order: 402 },
    { name: { en: 'Angle 90° Double', zh: '90度-双边' }, slug: 'spec-angle-90-double', type: 'SPEC', order: 403 },
    { name: { en: 'Angle 90° Beveled', zh: '90度-斜边' }, slug: 'spec-angle-90-beveled', type: 'SPEC', order: 404 },
    { name: { en: 'Angle 135°', zh: '135度角' }, slug: 'spec-angle-135', type: 'SPEC', order: 405 },
    { name: { en: 'Angle 180°', zh: '180度角' }, slug: 'spec-angle-180', type: 'SPEC', order: 406 },
    { name: { en: 'Angle 360°', zh: '360度' }, slug: 'spec-angle-360', type: 'SPEC', order: 407 },

    // Shapes
    { name: { en: 'Circle', zh: '圆形款' }, slug: 'spec-circle', type: 'SPEC', order: 500 },
    { name: { en: 'Semicircle Arc', zh: '半圆-弧形' }, slug: 'spec-semicircle-arc', type: 'SPEC', order: 501 },
    { name: { en: 'Semicircle Flat', zh: '半圆-平面' }, slug: 'spec-semicircle-flat', type: 'SPEC', order: 502 },
    { name: { en: 'Square Arc', zh: '方形-弧形' }, slug: 'spec-square-arc', type: 'SPEC', order: 503 },
    { name: { en: 'Square Flat', zh: '方形-平面' }, slug: 'spec-square-flat', type: 'SPEC', order: 504 },
    { name: { en: 'Various', zh: '多款式' }, slug: 'spec-various', type: 'SPEC', order: 505 },

    // Door Handle - Featured
    { name: { en: 'Featured Bathroom', zh: '精选浴室款' }, slug: 'spec-featured-bathroom', type: 'SPEC', order: 700 },
    { name: { en: 'Featured Combined', zh: '精选组合款' }, slug: 'spec-featured-combined', type: 'SPEC', order: 701 },
    { name: { en: 'Featured Cylinder', zh: '精选圆柱款' }, slug: 'spec-featured-cylinder', type: 'SPEC', order: 702 },
    { name: { en: 'Featured Glass Door', zh: '精选玻璃门款' }, slug: 'spec-featured-glass-door', type: 'SPEC', order: 703 },
    { name: { en: 'Featured Square', zh: '精选方形款' }, slug: 'spec-featured-square', type: 'SPEC', order: 704 },

    // Door Handle - Main
    { name: { en: 'Main Bathroom', zh: '主图-浴室拉手' }, slug: 'spec-main-bathroom', type: 'SPEC', order: 710 },
    { name: { en: 'Main Combined', zh: '主图-组合' }, slug: 'spec-main-combined', type: 'SPEC', order: 711 },
    { name: { en: 'Main Cylinder', zh: '主图-圆柱' }, slug: 'spec-main-cylinder', type: 'SPEC', order: 712 },
    { name: { en: 'Main Glass Door', zh: '主图-玻璃门' }, slug: 'spec-main-glass-door', type: 'SPEC', order: 713 },
    { name: { en: 'Main Square', zh: '主图-方形' }, slug: 'spec-main-square', type: 'SPEC', order: 714 },

    // Hidden Hook
    { name: { en: 'Single Hook Economy', zh: '单钩-经济款' }, slug: 'spec-single-hook-economy', type: 'SPEC', order: 800 },
    { name: { en: 'Single Hook Premium', zh: '单钩-高级款' }, slug: 'spec-single-hook-premium', type: 'SPEC', order: 801 },
    { name: { en: 'Double Hook', zh: '双钩' }, slug: 'spec-double-hook', type: 'SPEC', order: 802 },
  ]

  // Batch create specs (silent mode for large quantity)
  let specCount = 0
  for (const spec of specs) {
    const existing = await context.query.MediaTag.findMany({
      where: { slug: { equals: spec.slug } },
      query: 'id',
    })

    if (existing.length === 0) {
      await context.query.MediaTag.createOne({
        data: {
          name: spec.name,
          slug: spec.slug,
          type: spec.type,
          order: spec.order,
        },
        query: 'id',
      })
      specCount++
    }
  }
  console.log(`     ✓ Created ${specCount} specification tags`)

  // 4. Color Tags
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

  // 5. Custom Tags
  console.log('  → 创建自定义标签 (Creating Custom tags)...')

  const customTags = [
    { name: { en: 'Logistics', zh: '物流' }, slug: 'custom-logistics', type: 'CUSTOM', order: 1 },
    { name: { en: 'Process', zh: '工艺流程' }, slug: 'custom-process', type: 'CUSTOM', order: 2 },
  ]

  await createTagBatch(context, customTags)
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
      // Skip silently
      continue
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
