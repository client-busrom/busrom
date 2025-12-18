/**
 * Seed Applications (Application Cases)
 *
 * Creates one application case for each of the 9 product series.
 * Images and detailed content can be filled manually later in Payload Admin.
 *
 * Usage: npx tsx scripts/seed-applications-simple.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// 9 Application cases - one per product series
const APPLICATIONS = [
  {
    slug: 'glass-standoff-commercial-signage',
    name: { en: 'Glass Standoff for Commercial Signage', zh: '商业标识玻璃固定件应用' },
    shortDescription: { en: 'High-end retail store uses our glass standoffs for elegant wall-mounted signage displays.', zh: '高端零售店使用我们的玻璃固定件打造优雅的墙面标识展示。' },
    description: { en: 'A luxury retail store showcases their brand identity using our premium glass standoffs.', zh: '豪华零售店使用我们的高端玻璃固定件展示品牌标识。' },
    categorySlug: 'application-glass-standoff',
  },
  {
    slug: 'glass-connected-fitting-staircase-railing',
    name: { en: 'Glass Connected Fitting for Staircase Railing', zh: '楼梯栏杆玻璃连接件应用' },
    shortDescription: { en: 'Modern office building features glass staircase railings connected with our precision fittings.', zh: '现代办公楼采用我们的精密连接件打造玻璃楼梯栏杆。' },
    description: { en: 'Tech company headquarters features an impressive glass staircase system with our fittings.', zh: '科技公司总部采用我们的连接件打造令人印象深刻的玻璃楼梯系统。' },
    categorySlug: 'application-glass-connected-fitting',
  },
  {
    slug: 'glass-fence-spigot-pool-area',
    name: { en: 'Glass Fence Spigot for Pool Area', zh: '泳池区域玻璃围栏立柱应用' },
    shortDescription: { en: 'Luxury resort pool features frameless glass fencing with our durable spigot system.', zh: '豪华度假村泳池采用我们耐用的立柱系统打造无框玻璃围栏。' },
    description: { en: 'Five-star beach resort installed our glass fence spigots around their infinity pool.', zh: '五星级海滨度假村在无边泳池周围安装了我们的玻璃围栏立柱。' },
    categorySlug: 'application-glass-fence-spigot',
  },
  {
    slug: 'guardrail-glass-clip-balcony',
    name: { en: 'Guardrail Glass Clip for Balcony', zh: '阳台护栏玻璃夹应用' },
    shortDescription: { en: 'High-rise residential building uses our guardrail clips for safe and elegant balcony railings.', zh: '高层住宅使用我们的护栏夹打造安全优雅的阳台栏杆。' },
    description: { en: 'Luxury condominium tower features floor-to-ceiling glass balcony railings with our clips.', zh: '豪华公寓大楼采用我们的护栏夹打造落地玻璃阳台栏杆。' },
    categorySlug: 'application-guardrail-glass-clip',
  },
  {
    slug: 'bathroom-glass-clip-hotel-suite',
    name: { en: 'Bathroom Glass Clip for Hotel Suite', zh: '酒店套房浴室玻璃夹应用' },
    shortDescription: { en: 'Boutique hotel bathrooms feature frameless glass shower enclosures with our waterproof clips.', zh: '精品酒店浴室采用我们的防水玻璃夹打造无框淋浴房。' },
    description: { en: 'Designer boutique hotel installed our bathroom glass clips in all suites.', zh: '设计精品酒店在所有套房中安装了我们的浴室玻璃夹。' },
    categorySlug: 'application-bathroom-glass-clip',
  },
  {
    slug: 'glass-hinge-restaurant-entrance',
    name: { en: 'Glass Hinge for Restaurant Entrance', zh: '餐厅入口玻璃合页应用' },
    shortDescription: { en: 'Fine dining restaurant entrance features frameless glass doors with our silent-close hinges.', zh: '高档餐厅入口采用我们的静音合页打造无框玻璃门。' },
    description: { en: 'Michelin-starred restaurant chose our premium glass hinges for their entrance doors.', zh: '米其林星级餐厅为其入口门选择了我们的高端玻璃合页。' },
    categorySlug: 'application-glass-hinge',
  },
  {
    slug: 'sliding-door-kit-office-partition',
    name: { en: 'Sliding Door Kit for Office Partition', zh: '办公室隔断移门套件应用' },
    shortDescription: { en: 'Modern office space uses our sliding door kits for flexible glass partition walls.', zh: '现代办公空间使用我们的移门套件打造灵活的玻璃隔断墙。' },
    description: { en: 'Tech startup office features movable glass partitions with our sliding door systems.', zh: '科技初创公司办公室采用我们的移门系统打造可移动玻璃隔断。' },
    categorySlug: 'application-sliding-door-kit',
  },
  {
    slug: 'bathroom-door-handle-spa',
    name: { en: 'Bathroom & Door Handle for Luxury Spa', zh: '豪华水疗中心浴室拉手应用' },
    shortDescription: { en: 'Premium spa facility features our elegant handles throughout bathrooms and treatment rooms.', zh: '高端水疗中心在浴室和理疗室中使用我们的优雅拉手。' },
    description: { en: 'Luxury wellness center installed our handles in all treatment rooms.', zh: '豪华健康中心在所有理疗室中安装了我们的拉手。' },
    categorySlug: 'application-bathroom-door-handle',
  },
  {
    slug: 'hidden-hook-gallery',
    name: { en: 'Hidden Hook for Art Gallery', zh: '艺术画廊隐藏式挂钩应用' },
    shortDescription: { en: 'Contemporary art gallery uses our hidden hooks for clean, minimalist artwork display.', zh: '当代艺术画廊使用我们的隐藏式挂钩打造简洁、极简的艺术品展示。' },
    description: { en: 'Prestigious art gallery installed our hidden hook system for their permanent collection.', zh: '著名艺术画廊为其永久收藏安装了我们的隐藏式挂钩系统。' },
    categorySlug: 'application-hidden-hook',
  },
]

async function seedApplications() {
  console.log('🌱 Seeding Applications...\n')

  const payload = await getPayload({ config })

  try {
    // Get all categories to map slugs to IDs
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    const categoryMap = new Map()
    categories.docs.forEach((cat: any) => {
      categoryMap.set(cat.slug, cat.id)
    })

    console.log(`📋 Found ${categories.totalDocs} categories\n`)

    // Check existing applications
    const existing = await payload.find({
      collection: 'applications',
      limit: 1000,
    })

    console.log(`📊 Current applications: ${existing.totalDocs}`)

    let createdCount = 0
    let skippedCount = 0

    for (const app of APPLICATIONS) {
      // Check if already exists
      const existingApp = existing.docs.find((doc: any) => doc.slug === app.slug)

      if (existingApp) {
        console.log(`  ⏭️  ${app.slug} already exists`)
        skippedCount++
        continue
      }

      // Get category ID
      const categoryId = categoryMap.get(app.categorySlug)

      if (!categoryId) {
        console.log(`  ⚠️  Category not found: ${app.categorySlug}, skipping ${app.slug}`)
        continue
      }

      try {
        // Create application with English content
        const created = await payload.create({
          collection: 'applications',
          locale: 'en',
          data: {
            slug: app.slug,
            name: app.name.en,
            shortDescription: app.shortDescription.en,
            description: app.description.en,
            category: categoryId,
            status: 'draft', // Set to draft so user can add images first
          },
        })

        // Update with Chinese content
        await payload.update({
          collection: 'applications',
          id: created.id,
          locale: 'zh',
          data: {
            name: app.name.zh,
            shortDescription: app.shortDescription.zh,
            description: app.description.zh,
          },
        })

        console.log(`  ✅ ${app.slug} (${app.name.en})`)
        createdCount++
      } catch (error) {
        console.log(`  ❌ ${app.slug}: ${error.message}`)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Created: ${createdCount}`)
    console.log(`  ⏭️  Skipped (already exists): ${skippedCount}`)
    console.log(`  📋 Total: ${createdCount + skippedCount}`)

    if (createdCount > 0) {
      console.log('\n💡 Next steps:')
      console.log('  1. Open Payload Admin: http://localhost:3002/admin')
      console.log('  2. Navigate to Applications')
      console.log('  3. Add scene gallery images to each application')
      console.log('  4. Change status from draft to published')
    }

    console.log('\n✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedApplications()
