/**
 * Seed Applications (Application Cases)
 *
 * Creates one application case for each of the 9 product series.
 * Images can be filled manually later in Payload Admin.
 *
 * Usage: npx tsx scripts/seed-applications.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// 9 Application cases - one per product series
const APPLICATIONS = [
  {
    slug: 'glass-standoff-commercial-signage',
    name: {
      en: 'Glass Standoff for Commercial Signage',
      zh: '商业标识玻璃固定件应用',
    },
    shortDescription: {
      en: 'High-end retail store uses our glass standoffs for elegant wall-mounted signage displays.',
      zh: '高端零售店使用我们的玻璃固定件打造优雅的墙面标识展示。',
    },
    shortDescription: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A luxury retail store in downtown showcases their brand identity using our premium glass standoffs. The minimalist design allows the signage to appear floating, creating a modern and sophisticated atmosphere.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '市中心的一家奢侈品零售店使用我们的高端玻璃固定件展示品牌标识。极简设计让标识看起来像悬浮在空中，营造出现代而精致的氛围。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-glass-standoff',
    seriesSlug: 'glass-standoff',
    location: {
      en: 'New York, USA',
      zh: '美国纽约',
    },
    projectType: {
      en: 'Commercial',
      zh: '商业',
    },
    featured: true,
    order: 1,
  },
  {
    slug: 'glass-connected-fitting-staircase-railing',
    name: {
      en: 'Glass Connected Fitting for Staircase Railing',
      zh: '楼梯栏杆玻璃连接件应用',
    },
    shortDescription: {
      en: 'Modern office building features glass staircase railings connected with our precision fittings.',
      zh: '现代办公楼采用我们的精密连接件打造玻璃楼梯栏杆。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A tech company headquarters features an impressive glass staircase system. Our glass connected fittings ensure structural integrity while maintaining visual transparency throughout the multi-story atrium.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家科技公司总部打造了令人印象深刻的玻璃楼梯系统。我们的玻璃连接件确保结构完整性，同时在多层中庭中保持视觉通透。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-glass-connected-fitting',
    seriesSlug: 'glass-connected-fitting',
    location: {
      en: 'San Francisco, USA',
      zh: '美国旧金山',
    },
    projectType: {
      en: 'Commercial',
      zh: '商业',
    },
    featured: true,
    order: 2,
  },
  {
    slug: 'glass-fence-spigot-pool-area',
    name: {
      en: 'Glass Fence Spigot for Pool Area',
      zh: '泳池区域玻璃围栏立柱应用',
    },
    shortDescription: {
      en: 'Luxury resort pool features frameless glass fencing with our durable spigot system.',
      zh: '豪华度假村泳池采用我们耐用的立柱系统打造无框玻璃围栏。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A five-star beach resort installed our glass fence spigots around their infinity pool. The frameless design provides unobstructed ocean views while ensuring guest safety with superior strength and corrosion resistance.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家五星级海滨度假村在无边泳池周围安装了我们的玻璃围栏立柱。无框设计提供无遮挡的海景，同时以卓越的强度和耐腐蚀性确保客人安全。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-glass-fence-spigot',
    seriesSlug: 'glass-fence-spigot',
    location: {
      en: 'Miami, USA',
      zh: '美国迈阿密',
    },
    projectType: {
      en: 'Hospitality',
      zh: '酒店',
    },
    featured: true,
    order: 3,
  },
  {
    slug: 'guardrail-glass-clip-balcony',
    name: {
      en: 'Guardrail Glass Clip for Balcony',
      zh: '阳台护栏玻璃夹应用',
    },
    shortDescription: {
      en: 'High-rise residential building uses our guardrail clips for safe and elegant balcony railings.',
      zh: '高层住宅使用我们的护栏夹打造安全优雅的阳台栏杆。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A luxury condominium tower features floor-to-ceiling glass balcony railings secured with our premium guardrail clips. The system meets strict building codes while providing residents with panoramic city views.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一栋豪华公寓大楼采用我们的高端护栏夹固定落地玻璃阳台栏杆。该系统符合严格的建筑规范，同时为居民提供全景城市视野。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-guardrail-glass-clip',
    seriesSlug: 'guardrail-glass-clip',
    location: {
      en: 'Dubai, UAE',
      zh: '阿联酋迪拜',
    },
    projectType: {
      en: 'Residential',
      zh: '住宅',
    },
    featured: false,
    order: 4,
  },
  {
    slug: 'bathroom-glass-clip-hotel-suite',
    name: {
      en: 'Bathroom Glass Clip for Hotel Suite',
      zh: '酒店套房浴室玻璃夹应用',
    },
    shortDescription: {
      en: 'Boutique hotel bathrooms feature frameless glass shower enclosures with our waterproof clips.',
      zh: '精品酒店浴室采用我们的防水玻璃夹打造无框淋浴房。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A designer boutique hotel installed our bathroom glass clips in all 50 suites. The corrosion-resistant finish maintains its appearance despite constant exposure to moisture and steam.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家设计精品酒店在所有 50 间套房中安装了我们的浴室玻璃夹。耐腐蚀表面处理即使在持续暴露于潮湿和蒸汽中也能保持外观。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-bathroom-glass-clip',
    seriesSlug: 'bathroom-glass-clip',
    location: {
      en: 'Paris, France',
      zh: '法国巴黎',
    },
    projectType: {
      en: 'Hospitality',
      zh: '酒店',
    },
    featured: false,
    order: 5,
  },
  {
    slug: 'glass-hinge-restaurant-entrance',
    name: {
      en: 'Glass Hinge for Restaurant Entrance',
      zh: '餐厅入口玻璃合页应用',
    },
    shortDescription: {
      en: 'Fine dining restaurant entrance features frameless glass doors with our silent-close hinges.',
      zh: '高档餐厅入口采用我们的静音合页打造无框玻璃门。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A Michelin-starred restaurant chose our premium glass hinges for their entrance doors. The silent operation and smooth movement create an upscale first impression for guests.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家米其林星级餐厅为其入口门选择了我们的高端玻璃合页。静音操作和平稳运动为客人营造高档的第一印象。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-glass-hinge',
    seriesSlug: 'glass-hinge',
    location: {
      en: 'Tokyo, Japan',
      zh: '日本东京',
    },
    projectType: {
      en: 'Commercial',
      zh: '商业',
    },
    featured: false,
    order: 6,
  },
  {
    slug: 'sliding-door-kit-office-partition',
    name: {
      en: 'Sliding Door Kit for Office Partition',
      zh: '办公室隔断移门套件应用',
    },
    shortDescription: {
      en: 'Modern office space uses our sliding door kits for flexible glass partition walls.',
      zh: '现代办公空间使用我们的移门套件打造灵活的玻璃隔断墙。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A tech startup office features movable glass partitions with our sliding door systems. The space-saving design allows for quick room reconfiguration while maintaining acoustic separation.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家科技初创公司办公室采用我们的移门系统打造可移动玻璃隔断。节省空间的设计允许快速重新配置房间，同时保持隔音效果。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-sliding-door-kit',
    seriesSlug: 'sliding-door-kit',
    location: {
      en: 'London, UK',
      zh: '英国伦敦',
    },
    projectType: {
      en: 'Commercial',
      zh: '商业',
    },
    featured: false,
    order: 7,
  },
  {
    slug: 'bathroom-door-handle-spa',
    name: {
      en: 'Bathroom & Door Handle for Luxury Spa',
      zh: '豪华水疗中心浴室拉手应用',
    },
    shortDescription: {
      en: 'Premium spa facility features our elegant handles throughout bathrooms and treatment rooms.',
      zh: '高端水疗中心在浴室和理疗室中使用我们的优雅拉手。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A luxury wellness center installed our bathroom and door handles in all 20 treatment rooms. The ergonomic design and premium finishes complement the spa\'s sophisticated aesthetic.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家豪华健康中心在所有 20 间理疗室中安装了我们的浴室和门拉手。符合人体工程学的设计和高端表面处理与水疗中心的精致美学相得益彰。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-bathroom-door-handle',
    seriesSlug: 'bathroom-door-handle',
    location: {
      en: 'Singapore',
      zh: '新加坡',
    },
    projectType: {
      en: 'Hospitality',
      zh: '酒店',
    },
    featured: false,
    order: 8,
  },
  {
    slug: 'hidden-hook-gallery',
    name: {
      en: 'Hidden Hook for Art Gallery',
      zh: '艺术画廊隐藏式挂钩应用',
    },
    shortDescription: {
      en: 'Contemporary art gallery uses our hidden hooks for clean, minimalist artwork display.',
      zh: '当代艺术画廊使用我们的隐藏式挂钩打造简洁、极简的艺术品展示。',
    },
    content: {
      en: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A prestigious art gallery installed our hidden hook system for their permanent collection. The invisible mounting solution allows artworks to appear floating on walls, enhancing the viewing experience.',
            },
          ],
        },
      ],
      zh: [
        {
          type: 'paragraph',
          children: [
            {
              text: '一家著名艺术画廊为其永久收藏安装了我们的隐藏式挂钩系统。隐形安装解决方案让艺术品看起来像悬浮在墙上，增强观赏体验。',
            },
          ],
        },
      ],
    },
    categorySlug: 'application-hidden-hook',
    seriesSlug: 'hidden-hook',
    location: {
      en: 'Los Angeles, USA',
      zh: '美国洛杉矶',
    },
    projectType: {
      en: 'Commercial',
      zh: '商业',
    },
    featured: false,
    order: 9,
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
            title: app.title.en,
            description: app.description.en,
            content: app.content.en,
            categories: [categoryId],
            location: app.location.en,
            projectType: app.projectType.en,
            featured: app.featured,
            status: 'published',
            _status: 'published',
          },
        })

        // Update with Chinese content
        await payload.update({
          collection: 'applications',
          id: created.id,
          locale: 'zh',
          data: {
            title: app.title.zh,
            description: app.description.zh,
            content: app.content.zh,
            location: app.location.zh,
            projectType: app.projectType.zh,
          },
        })

        console.log(`  ✅ ${app.slug} (${app.title.en})`)
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
      console.log('  3. Add images to each application')
      console.log('  4. Publish the applications')
    }

    console.log('\n✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedApplications()
