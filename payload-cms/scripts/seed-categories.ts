/**
 * Seed Categories Script
 *
 * This script ensures the correct categories exist:
 * - 9 Product categories (matching ProductSeries)
 * - 9 Application categories (with 'application-' prefix)
 *
 * Usage:
 * npx tsx scripts/seed-categories.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// 9 Product Categories (1-to-1 with ProductSeries)
const productCategories = [
  {
    slug: 'glass-standoff',
    name: {
      en: 'Glass Standoff',
      zh: '广告螺丝',
    },
    description: {
      en: 'Glass standoffs for signage and display applications',
      zh: '用于标识和展示应用的广告螺丝',
    },
    order: 1,
  },
  {
    slug: 'glass-connected-fitting',
    name: {
      en: 'Glass Connected Fitting',
      zh: '玻璃栏杆扶手连接件',
    },
    description: {
      en: 'Glass railing and handrail connection fittings covering various types of railing connection accessories',
      zh: '玻璃栏杆扶手连接件，覆盖多种栏杆连接类配件',
    },
    order: 2,
  },
  {
    slug: 'glass-fence-spigot',
    name: {
      en: 'Glass Fence Spigot',
      zh: '玻璃护栏支架底座',
    },
    description: {
      en: 'Glass fence spigot base supports, also known as pool spigots',
      zh: '玻璃护栏支架底座，又称泳池夹',
    },
    order: 3,
  },
  {
    slug: 'guardrail-glass-clip',
    name: {
      en: 'Guardrail Glass Clip',
      zh: '护栏系列',
    },
    description: {
      en: 'Guardrail series mainly used for railings and glass connections',
      zh: '护栏系列，主要用于护栏或玻璃连接',
    },
    order: 4,
  },
  {
    slug: 'bathroom-glass-clip',
    name: {
      en: 'Bathroom Glass Clip',
      zh: '浴室系列',
    },
    description: {
      en: 'Bathroom series mainly used for bathroom glass connections',
      zh: '浴室系列，主要用于浴室玻璃连接',
    },
    order: 5,
  },
  {
    slug: 'glass-hinge',
    name: {
      en: 'Glass Hinge',
      zh: '浴室夹',
    },
    description: {
      en: 'Glass hinges, also known as bathroom clips, mainly used for glass doors and glass-to-wall connections',
      zh: '玻璃合页，又称浴室夹，主要用于玻璃门/玻璃与墙连接',
    },
    order: 6,
  },
  {
    slug: 'sliding-door-kit',
    name: {
      en: 'Sliding Door Kit',
      zh: '移门滑轮套装',
    },
    description: {
      en: 'Sliding door roller kits mainly used for glass sliding doors, typically sold as complete sets',
      zh: '移门滑轮套装，主要用于玻璃推拉门，通常为整套套装',
    },
    order: 7,
  },
  {
    slug: 'bathroom-door-handle',
    name: {
      en: 'Bathroom & Door Handle',
      zh: '浴室&大门拉手',
    },
    description: {
      en: 'Bathroom and door handles, mainly used on bathroom glass doors and main doors',
      zh: '浴室及大门拉手，主要用于浴室玻璃门及大门',
    },
    order: 8,
  },
  {
    slug: 'hidden-hook',
    name: {
      en: 'Hidden Hook',
      zh: '挂钩',
    },
    description: {
      en: 'Hooks including rotating or non-rotating hidden hooks',
      zh: '挂钩，主要包含旋转式或非旋转式隐藏挂钩',
    },
    order: 9,
  },
]

// 9 Application Categories (with 'application-' prefix)
const applicationCategories = productCategories.map((cat, index) => ({
  slug: `application-${cat.slug}`,
  name: cat.name, // Use same names
  description: {
    en: `${cat.name.en} applications`,
    zh: `${cat.name.zh}应用`,
  },
  order: index + 1,
}))

async function seedCategories() {
  console.log('🌱 Starting category seeding...\n')

  const payload = await getPayload({ config })

  try {
    // ==================================================================
    // 1. Seed Product Categories
    // ==================================================================
    console.log('📁 Creating/updating Product categories...')
    for (const cat of productCategories) {
      try {
        // Check if category exists
        const existing = await payload.find({
          collection: 'categories',
          where: {
            slug: { equals: cat.slug },
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          // Update existing
          await payload.update({
            collection: 'categories',
            id: existing.docs[0].id,
            data: {
              type: 'PRODUCT',
              order: cat.order,
              status: 'published',
            },
            locale: 'en',
          })
          console.log(`  ✓ Updated: ${cat.slug}`)
        } else {
          // Create new with English locale first (required field)
          const created = await payload.create({
            collection: 'categories',
            data: {
              slug: cat.slug,
              name: cat.name.en, // Required field
              description: cat.description.en,
              type: 'PRODUCT',
              order: cat.order,
              status: 'published',
            },
            locale: 'en',
          })

          // Then add Chinese translation
          await payload.update({
            collection: 'categories',
            id: created.id,
            data: {
              name: cat.name.zh,
              description: cat.description.zh,
            },
            locale: 'zh',
          })

          console.log(`  ✓ Created: ${cat.slug}`)
        }
      } catch (error: any) {
        console.error(`  ✗ Error processing ${cat.slug}:`, error.message)
      }
    }

    // ==================================================================
    // 2. Seed Application Categories
    // ==================================================================
    console.log('\n📁 Creating/updating Application categories...')
    for (const cat of applicationCategories) {
      try {
        // Check if category exists
        const existing = await payload.find({
          collection: 'categories',
          where: {
            slug: { equals: cat.slug },
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          // Update existing
          await payload.update({
            collection: 'categories',
            id: existing.docs[0].id,
            data: {
              type: 'APPLICATION',
              order: cat.order,
              status: 'published',
            },
            locale: 'en',
          })
          console.log(`  ✓ Updated: ${cat.slug}`)
        } else {
          // Create new with English locale first (required field)
          const created = await payload.create({
            collection: 'categories',
            data: {
              slug: cat.slug,
              name: cat.name.en, // Required field
              description: cat.description.en,
              type: 'APPLICATION',
              order: cat.order,
              status: 'published',
            },
            locale: 'en',
          })

          // Then add Chinese translation
          await payload.update({
            collection: 'categories',
            id: created.id,
            data: {
              name: cat.name.zh,
              description: cat.description.zh,
            },
            locale: 'zh',
          })

          console.log(`  ✓ Created: ${cat.slug}`)
        }
      } catch (error: any) {
        console.error(`  ✗ Error processing ${cat.slug}:`, error.message)
      }
    }

    console.log('\n✅ Category seeding completed!')
    console.log(`   - Product categories: 9`)
    console.log(`   - Application categories: 9`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Run the script
seedCategories()
