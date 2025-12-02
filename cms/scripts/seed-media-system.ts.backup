/**
 * Seed Media System - Initial Data Migration
 *
 * 媒体系统初始化数据迁移
 *
 * This script creates:
 * 1. MediaCategory (flat structure - 6 predefined categories for image purpose)
 * 2. MediaTag (flat tags for product series, specs, colors, etc.)
 *
 * Usage:
 * Run this script once after deploying the schema to populate initial data.
 * It will be automatically executed via keystone.ts onConnect hook.
 */

import type { Context } from '.keystone/types'

/**
 * Main Seed Function
 *
 * 主种子函数
 */
export async function seedMediaSystem(context: Context) {
  console.log('🌱 开始初始化媒体分类系统...')
  console.log('🌱 Starting Media System Initialization...\n')

  try {
    // 1. Create Media Categories (Flat)
    console.log('📁 创建媒体分类...')
    console.log('📁 Creating Media Categories...')
    await createCategories(context)
    console.log('✅ 媒体分类创建完成！')
    console.log('✅ Media Categories Created!\n')

    // 2. Create Media Tags
    console.log('🏷️  创建标签...')
    console.log('🏷️  Creating Media Tags...')
    await createTags(context)
    console.log('✅ 标签创建完成！')
    console.log('✅ Media Tags Created!\n')

    console.log('🎉 媒体分类系统初始化完成！')
    console.log('🎉 Media System Initialization Complete!')
    console.log('\n📊 Summary:')
    console.log('   - MediaCategory: 6 flat categories for image purpose')
    console.log('   - MediaTag: Product series, specs, colors, etc.')
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    console.error('❌ Initialization Failed:', error)
    throw error
  }
}

/**
 * Create Media Categories (Flat Structure)
 *
 * 创建媒体分类（扁平结构）
 *
 * Predefined categories for image purpose:
 * - 场景图 (Scene Photo)
 * - 白底图 (White Background)
 * - 合用图 (Composite Use)
 * - 通用图 (Common)
 * - 尺寸图 (Dimension Drawing)
 * - 实拍图 (Real Shot)
 */
async function createCategories(context: Context) {
  const categories = [
    {
      en: 'Scene Photo',
      zh: '场景图',
      slug: 'scene-photo',
      icon: 'image',
      order: 1,
      desc: {
        en: 'Product photos in real-world scenes',
        zh: '产品在实际场景中的照片',
      },
    },
    {
      en: 'White Background',
      zh: '白底图',
      slug: 'white-background',
      icon: 'file-image',
      order: 2,
      desc: {
        en: 'Product photos on white background for catalog',
        zh: '用于目录的白底产品照片',
      },
    },
    {
      en: 'Composite Use',
      zh: '合用图',
      slug: 'composite-use',
      icon: 'layers',
      order: 3,
      desc: {
        en: 'Photos showing combined use of multiple products',
        zh: '展示多个产品组合使用的照片',
      },
    },
    {
      en: 'Common',
      zh: '通用图',
      slug: 'common',
      icon: 'folder',
      order: 4,
      desc: {
        en: 'Common media files not specific to products',
        zh: '通用媒体文件，不特定于产品',
      },
    },
    {
      en: 'Dimension Drawing',
      zh: '尺寸图',
      slug: 'dimension-drawing',
      icon: 'ruler',
      order: 5,
      desc: {
        en: 'Technical drawings with dimensions',
        zh: '带有尺寸的技术图纸',
      },
    },
    {
      en: 'Real Shot',
      zh: '实拍图',
      slug: 'real-shot',
      icon: 'camera',
      order: 6,
      desc: {
        en: 'Real product photography',
        zh: '真实产品摄影',
      },
    },
  ]

  for (const cat of categories) {
    const created = await context.query.MediaCategory.createOne({
      data: {
        name: JSON.stringify({ en: cat.en, zh: cat.zh }),
        slug: cat.slug,
        order: cat.order,
        icon: cat.icon,
        description: JSON.stringify(cat.desc),
      },
      query: 'id slug',
    })
    console.log(`  ✓ ${cat.en} (${cat.zh}): ${created.id}`)
  }
}

/**
 * Create Media Tags (Flat Structure)
 *
 * 创建媒体标签（扁平结构）
 *
 * Tag Types:
 * 1. PRODUCT_SERIES: Product series tags (10 tags)
 * 2. FUNCTION_TYPE: Function type tags (5 tags)
 * 3. SCENE_TYPE: Scene type tags (4 tags)
 * 4. SPEC: Specification tags (3 sample tags)
 * 5. COLOR: Color tags (3 sample tags)
 */
async function createTags(context: Context) {
  // ================================================================
  // 1. Product Series Tags (PRODUCT_SERIES)
  // ================================================================

  console.log('  → Creating Product Series tags...')

  const productSeries = [
    { en: 'Glass Standoff', zh: '广告螺丝', slug: 'glass-standoff', order: 1 },
    { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件', slug: 'glass-connected-fitting', order: 2 },
    { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座', slug: 'glass-fence-spigot', order: 3 },
    { en: 'Guardrail Glass Clip', zh: '护栏系列', slug: 'guardrail-glass-clip', order: 4 },
    { en: 'Bathroom Glass Clip', zh: '浴室系列', slug: 'bathroom-glass-clip', order: 5 },
    { en: 'Glass Hinge', zh: '浴室夹', slug: 'glass-hinge', order: 6 },
    { en: 'Sliding Door Kit', zh: '移门滑轮套装', slug: 'sliding-door-kit', order: 7 },
    { en: 'Bathroom Handle', zh: '浴室&大门拉手', slug: 'bathroom-handle', order: 8 },
    { en: 'Door Handle', zh: '大门拉手', slug: 'door-handle', order: 9 },
    { en: 'Hidden Hook', zh: '挂钩', slug: 'hidden-hook', order: 10 },
  ]

  for (const series of productSeries) {
    const created = await context.query.MediaTag.createOne({
      data: {
        name: JSON.stringify({ en: series.en, zh: series.zh }),
        slug: series.slug,
        type: 'PRODUCT_SERIES',
        order: series.order,
      },
      query: 'id slug',
    })
    console.log(`     ✓ ${series.en}: ${created.id}`)
  }

  // ================================================================
  // 2. Function Type Tags (FUNCTION_TYPE)
  // ================================================================

  console.log('  → Creating Function Type tags...')

  const functionTypes = [
    { en: 'Scene Photo', zh: '场景图', slug: 'func-scene-photo', order: 1 },
    { en: 'White Background', zh: '白底图', slug: 'func-white-background', order: 2 },
    { en: 'Dimension Drawing', zh: '尺寸图', slug: 'func-dimension-drawing', order: 3 },
    { en: 'Real Shot', zh: '实拍图', slug: 'func-real-shot', order: 4 },
    { en: 'Composite Use', zh: '合用图', slug: 'func-composite-use', order: 5 },
  ]

  for (const func of functionTypes) {
    const created = await context.query.MediaTag.createOne({
      data: {
        name: JSON.stringify({ en: func.en, zh: func.zh }),
        slug: func.slug,
        type: 'FUNCTION_TYPE',
        order: func.order,
      },
      query: 'id slug',
    })
    console.log(`     ✓ ${func.en}: ${created.id}`)
  }

  // ================================================================
  // 3. Scene Type Tags (SCENE_TYPE)
  // ================================================================

  console.log('  → Creating Scene Type tags...')

  const sceneTypes = [
    { en: 'Normal Scene', zh: '普通场景图', slug: 'scene-normal', order: 1 },
    { en: 'Single Scene', zh: '单独场景图', slug: 'scene-single', order: 2 },
    { en: 'Combination Scene', zh: '场景组合图', slug: 'scene-combination', order: 3 },
    { en: 'Series Scene', zh: '系列场景图', slug: 'scene-series', order: 4 },
  ]

  for (const scene of sceneTypes) {
    const created = await context.query.MediaTag.createOne({
      data: {
        name: JSON.stringify({ en: scene.en, zh: scene.zh }),
        slug: scene.slug,
        type: 'SCENE_TYPE',
        order: scene.order,
      },
      query: 'id slug',
    })
    console.log(`     ✓ ${scene.en}: ${created.id}`)
  }

  // ================================================================
  // 4. Sample Specification Tags (SPEC)
  // ================================================================

  console.log('  → Creating Sample Specification tags...')

  const specs = [
    { value: '50mm', order: 1 },
    { value: '100mm', order: 2 },
    { value: '150mm', order: 3 },
  ]

  for (const spec of specs) {
    const created = await context.query.MediaTag.createOne({
      data: {
        name: JSON.stringify({ en: spec.value, zh: spec.value }),
        slug: `spec-${spec.value.toLowerCase()}`,
        type: 'SPEC',
        order: spec.order,
      },
      query: 'id slug',
    })
    console.log(`     ✓ ${spec.value}: ${created.id}`)
  }

  // ================================================================
  // 5. Sample Color Tags (COLOR)
  // ================================================================

  console.log('  → Creating Sample Color tags...')

  const colors = [
    { en: 'Black', zh: '黑色', slug: 'color-black', order: 1 },
    { en: 'Silver', zh: '银色', slug: 'color-silver', order: 2 },
    { en: 'Gold', zh: '金色', slug: 'color-gold', order: 3 },
  ]

  for (const color of colors) {
    const created = await context.query.MediaTag.createOne({
      data: {
        name: JSON.stringify({ en: color.en, zh: color.zh }),
        slug: color.slug,
        type: 'COLOR',
        order: color.order,
      },
      query: 'id slug',
    })
    console.log(`     ✓ ${color.en}: ${created.id}`)
  }
}
