/**
 * Seed SeriesIntroItems for Payload CMS
 *
 * This script creates SeriesIntroItems for each ProductSeries
 * with proper bilingual content (en/zh)
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

const seriesIntroItemsData = [
  {
    internalLabel: 'Glass Standoff Series Intro',
    productSeriesSlug: 'glass-standoff',
    title: {
      en: 'Glass Standoff',
      zh: '广告螺丝',
    },
    description: {
      en: 'Glass standoffs are elegant, modern architectural hardware that hold glass panels securely away from walls or surfaces, creating a floating effect. They consist of threaded metal rods that pass through the glass and attach to mounting surfaces. Available in various finishes including stainless steel, brass, and chrome, they support frameless glass railings, signs, shelving, and partitions while maintaining a minimalist aesthetic. Their standout feature is the illusion of floating glass panels with minimal visible hardware.',
      zh: '用于现代设计的高端建筑玻璃支撑件。我们的可定制极简玻璃支撑件以隐形强度、可调灵活性和卓越耐用性重新定义了透明度与现代设计。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [1], // Glass Standoff tag
    },
    order: 1,
    status: 'published',
  },
  {
    internalLabel: 'Glass Connected Fitting Series Intro',
    productSeriesSlug: 'glass-connected-fitting',
    title: {
      en: 'Glass Connected Fitting',
      zh: '玻璃栏杆扶手连接件',
    },
    description: {
      en: 'Glass connectors are innovative architectural hardware that seamlessly join glass panels at various angles without frames, enabling sleek modern designs. They offer secure connections while maintaining structural integrity and a minimalist look. These fittings eliminate bulky framing systems, create flowing glass installations with minimal visual interruption, and support creative architectural possibilities. Available in various finishes, they\'re commonly used in shower enclosures, display cases, and contemporary spaces. Their standout feature is the ability to create uninterrupted glass surfaces with minimal hardware visibility.',
      zh: '耐用坚固的玻璃连接件，用于清晰且安全的结构。具有高承重能力、卓越耐久性和增强的安全性，适用于建筑玻璃安装。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [2], // Glass Connected Fitting tag
    },
    order: 2,
    status: 'published',
  },
  {
    internalLabel: 'Glass Fence Spigot Series Intro',
    productSeriesSlug: 'glass-fence-spigot',
    title: {
      en: 'Glass Fence Spigot',
      zh: '玻璃护栏支架底座',
    },
    description: {
      en: 'Glass fence spigots are robust mounting hardware that anchor frameless glass railings to floors or surfaces, providing secure support while maintaining an elegant, minimalist appearance. Typically made from durable materials like stainless steel, they feature a base plate that mounts to the surface and a vertical post that holds the glass panel. These spigots create a clean floating glass effect without traditional posts or balusters. Their standout feature is their ability to support structural loads while appearing nearly invisible, making them perfect for unobstructed views in decks, balconies, and staircases.',
      zh: '建筑级玻璃围栏立柱 - 隐形支撑的艺术。耐盐雾、安装简便、无与伦比的稳定性，适用于室内外应用。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [3], // Glass Fence Spigot tag
    },
    order: 3,
    status: 'published',
  },
  {
    internalLabel: 'Guardrail Glass Clip Series Intro',
    productSeriesSlug: 'guardrail-glass-clip',
    title: {
      en: 'Guardrail Glass Clip',
      zh: '护栏系列',
    },
    description: {
      en: 'Glass railing clips are specialized mounting hardware designed to secure glass panels in railing systems, providing a sleek frameless look while ensuring structural integrity. These clips grip the edge of the glass, typically at the top or side, distributing weight evenly and allowing for secure installation without drilling through the glass. Made from high-quality stainless steel or aluminum, they offer durability and weather resistance. Their standout feature is the ability to create modern, minimalist railing systems with unobstructed views, perfect for balconies, staircases, and deck applications where safety and aesthetics are equally important.',
      zh: '奢华隐形玻璃栏杆夹，占地小且牢固抓握。全垂直化生产、易于安装、抗冲击设计，确保最大安全性和美观性。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [4], // Guardrail Glass Clip tag
    },
    order: 4,
    status: 'published',
  },
  {
    internalLabel: 'Bathroom Glass Clip Series Intro',
    productSeriesSlug: 'bathroom-glass-clip',
    title: {
      en: 'Bathroom Glass Clip',
      zh: '浴室系列',
    },
    description: {
      en: 'Bathroom glass clips are specialized mounting hardware designed for secure installation of glass panels in wet environments, particularly shower enclosures and bathroom partitions. These waterproof clips provide a sleek frameless look while ensuring structural integrity in high-moisture conditions. Engineered with corrosion-resistant materials like stainless steel or marine-grade aluminum, they grip glass edges firmly without drilling through panels. Their minimal contact design maximizes glass visibility while providing reliable support. The standout feature is the combination of elegant aesthetics with practical waterproofing, making them ideal for modern bathroom applications where both style and durability are essential.',
      zh: '设计前卫的防水浴室玻璃夹。最小接触面积与最大化玻璃视野、高品质、耐腐蚀、灵活兼容所有浴室应用。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [5], // Bathroom Glass Clip tag
    },
    order: 5,
    status: 'published',
  },
  {
    internalLabel: 'Glass Hinge Series Intro',
    productSeriesSlug: 'glass-hinge',
    title: {
      en: 'Glass Hinge',
      zh: '浴室夹',
    },
    description: {
      en: 'Glass hinges are specialized hardware that allow glass doors and panels to swing open and closed smoothly while maintaining a sleek, frameless appearance. Designed to mount directly onto glass edges or surfaces, they eliminate the need for traditional door frames. Made from durable materials like stainless steel or brass, they support various glass thicknesses and weights. Available in different styles including wall-mounted, glass-to-glass, and offset hinges, they\'re commonly used in shower enclosures, display cases, and modern architectural glass doors. Their standout feature is enabling smooth, reliable movement while keeping the hardware minimal and the glass as the focal point.',
      zh: '精心打造细节的玻璃合页 - 开启无形之门。静音操作、可调节设计、航空级材料，适用于高端门应用。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [6], // Glass Hinge tag
    },
    order: 6,
    status: 'published',
  },
  {
    internalLabel: 'Sliding Door Kit Series Intro',
    productSeriesSlug: 'sliding-door-kit',
    title: {
      en: 'Sliding Door Kit',
      zh: '移门滑轮套装',
    },
    description: {
      en: 'Sliding glass door kits are comprehensive hardware systems that enable smooth, effortless movement of glass doors along tracks. These kits typically include top-mounted or bottom-mounted tracks, rollers, handles, and all necessary mounting hardware. Designed for both interior and exterior applications, they support various glass weights and sizes while maintaining a modern, streamlined aesthetic. The kits can accommodate single or multiple glass panels and often feature soft-close mechanisms for gentle, quiet operation. Their standout feature is transforming spaces with space-saving functionality and contemporary design, making them ideal for closets, room dividers, shower enclosures, and patio entries.',
      zh: '静音缓关移门套件，实现静谧滑动与完美空间分隔。节省空间设计、耐用滑轮、静音滑动机制，适用于现代室内装饰。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [7], // Sliding Door Kit tag
    },
    order: 7,
    status: 'published',
  },
  {
    internalLabel: 'Bathroom & Door Handle Series Intro',
    productSeriesSlug: 'bathroom-door-handle',
    title: {
      en: 'Bathroom & Door Handle',
      zh: '浴室&大门拉手',
    },
    description: {
      en: 'Bathroom and door handles designed for glass applications combine functionality with elegant design, specifically engineered to work with glass doors and panels. These handles can be surface-mounted with back plates or designed to clamp directly onto glass edges, requiring specialized drilling and mounting hardware. Made from premium materials like stainless steel, brass, or aluminum with various finishes, they offer durability and resistance to moisture. Available in styles from minimalist bars to decorative pulls, they maintain the sleek appearance of frameless glass while providing comfortable, secure grip. Their standout feature is seamless integration with glass surfaces, enhancing both the aesthetic appeal and usability of modern glass doors, shower enclosures, and architectural installations.',
      zh: '华丽简约的浴室及门拉手 - 让每次触摸尽显优雅。全天候设计、高强度与硬度、易于维护，适用于奢华应用。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [8], // Bathroom & Door Handle tag
    },
    order: 8,
    status: 'published',
  },
  {
    internalLabel: 'Hidden Hook Series Intro',
    productSeriesSlug: 'hidden-hook',
    title: {
      en: 'Hidden Hook',
      zh: '挂钩',
    },
    description: {
      en: 'Hidden hooks are innovative architectural hardware that provide secure anchoring for glass panels while remaining concealed from view, creating a truly floating glass effect. These mounting systems are embedded within walls, floors, or ceilings, with only minimal connection points visible on the glass surface. Engineered for high load-bearing capacity, they support various glass thicknesses and installation angles. Made from high-strength materials like stainless steel, they ensure long-term durability and safety. Their standout feature is the ability to achieve an ultra-minimalist, seamless look where glass appears to float effortlessly, making them ideal for modern architectural installations, gallery displays, and contemporary interior design where visual lightness is paramount.',
      zh: '优雅流线型隐藏式挂钩，隐藏式安装与强大承重。可拆卸设计、快速安装、隐形收纳，适用于极简空间。',
    },
    images: {
      mode: 'auto',
      categories: [2], // scene category
      tags: [9], // Hidden Hook tag
    },
    order: 9,
    status: 'published',
  },
]

/**
 * Helper function to create localized document
 */
async function createLocalizedDocument(
  payload: any,
  collection: string,
  data: any,
): Promise<string> {
  // Extract localized fields (those with {en, zh} structure)
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Create document with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  const doc = await payload.create({
    collection,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = (value as any).zh
  }

  if (Object.keys(zhData).length > 0) {
    await payload.update({
      collection,
      id: doc.id,
      data: zhData,
      locale: 'zh',
    })
  }

  return doc.id
}

async function seedSeriesIntroItems() {
  console.log('🚀 Starting SeriesIntroItems seeding...\n')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    // First, get all ProductSeries to map slug to ID
    console.log('📦 Fetching ProductSeries...')
    const productSeriesResult = await payload.find({
      collection: 'product-series',
      limit: 100,
    })

    const slugToIdMap: Record<string, number> = {}
    for (const series of productSeriesResult.docs) {
      slugToIdMap[series.slug] = series.id
    }
    console.log(`✅ Found ${productSeriesResult.docs.length} ProductSeries\n`)

    // First, delete all existing SeriesIntroItems
    console.log('📦 Deleting existing SeriesIntroItems...')
    const existingItems = await payload.find({
      collection: 'series-intro-items',
      limit: 1000,
    })

    for (const item of existingItems.docs) {
      await payload.delete({
        collection: 'series-intro-items',
        id: item.id,
      })
    }
    console.log(`✅ Deleted ${existingItems.docs.length} existing items\n`)

    // Seed SeriesIntroItems
    console.log('📦 Seeding SeriesIntroItems...')
    let successCount = 0
    let skipCount = 0

    for (const item of seriesIntroItemsData) {
      const productSeriesId = slugToIdMap[item.productSeriesSlug]

      if (!productSeriesId) {
        console.log(`⚠️  Skipping "${item.internalLabel}" - ProductSeries "${item.productSeriesSlug}" not found`)
        skipCount++
        continue
      }

      // Remove productSeriesSlug and add productSeries ID
      const { productSeriesSlug, ...itemData } = item
      const dataWithRelation = {
        ...itemData,
        productSeries: productSeriesId,
      }

      await createLocalizedDocument(payload, 'series-intro-items', dataWithRelation)
      console.log(`  ✓ Created: ${item.internalLabel}`)
      successCount++
    }

    console.log(`\n✅ SeriesIntroItems seeding completed!`)
    console.log('📊 Summary:')
    console.log(`   - ${successCount} items created`)
    console.log(`   - ${skipCount} items skipped`)

  } catch (error) {
    console.error('❌ Error seeding SeriesIntroItems:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedSeriesIntroItems().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
