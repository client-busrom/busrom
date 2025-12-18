import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

/**
 * Seed Production Homepage Data to Payload CMS
 *
 * Imports all homepage-related data from exported JSON file including:
 * - 14 global configurations (service-features, brand-advantages, etc.)
 * - 34 navigation menus with icons and media tags
 * - Supports bilingual content (en/zh)
 *
 * Prerequisites:
 * - Run export-homepage-data.ts first to generate the data file
 * - Ensure media-tags collection is already populated
 *
 * Usage: npx tsx scripts/seed-production-homepage.ts
 * Input: scripts/homepage-data-export.json
 */

const LOCALES = ['en', 'zh']

// Chinese translations for missing fields
const zhTranslations = {
  'why-choose-busrom': {
    title2: 'Busrom',
    viewMoreButtonText: '查看更多信息',
  },
  footer: {
    contactEmailLabel: '电子邮箱',
    afterSalesLabel: '售后服务',
    whatsappLabel: 'WhatsApp',
    officialNoticeLine1: '官方邮箱联系方式：xxx@busromhouse.com。',
    officialNoticeLine2: '任何来自非官方来源的联系均为未经授权且可能存在欺诈行为——请勿参与或付款。',
    officialNoticeLine3: '如需验证或有任何疑问，请通过官方邮箱或访问我们的网站 www.busromhouse.com 联系我们',
    officialNoticeLine4: 'Busrom 团队',
    officialNoticeContent: '', // Not used in current schema
  },
  'brand-value': {
    param1Title: '品质', // Quality
    param2Title: '创新', // Innovation
  },
}

async function seedProductionHomepage() {
  console.log('🚀 Starting production homepage data seed...\n')

  const payload = await getPayload({ config })

  // Load exported data
  const dataPath = path.join(process.cwd(), 'scripts/homepage-data-export.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Export file not found:', dataPath)
    console.log('💡 Run: npx tsx scripts/export-homepage-data.ts first')
    process.exit(1)
  }

  const exportData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log('📦 Loaded export data:')
  console.log(`   - Globals: ${Object.keys(exportData.globals).length}`)
  console.log(`   - Collections: ${Object.keys(exportData.collections || {}).length}`)
  console.log()

  // Seed globals with translation补充
  console.log('🌱 Seeding globals...\n')

  for (const [globalSlug, globalData] of Object.entries(exportData.globals)) {
    try {
      let dataToSeed = JSON.parse(JSON.stringify(globalData)) // Deep clone

      // Apply missing translations
      if (zhTranslations[globalSlug]) {
        dataToSeed = applyTranslations(dataToSeed, zhTranslations[globalSlug])
      }

      // Remove system fields
      delete dataToSeed.id
      delete dataToSeed.createdAt
      delete dataToSeed.updatedAt

      // Seed for each locale
      for (const locale of LOCALES) {
        await payload.updateGlobal({
          slug: globalSlug,
          data: dataToSeed,
          locale,
        })
      }

      console.log(`  ✅ ${globalSlug}`)
    } catch (error) {
      console.log(`  ❌ ${globalSlug}: ${error.message}`)
    }
  }

  // Seed navigation menus
  if (exportData.collections && exportData.collections['navigation-menus']) {
    console.log('\n🧭 Seeding navigation menus...\n')
    await seedNavigationMenus(payload, exportData.collections['navigation-menus'])
  }

  console.log('\n✅ Production homepage data seeded successfully!')
  process.exit(0)
}

/**
 * Apply missing translations to data object
 */
function applyTranslations(data: any, translations: Record<string, any>): any {
  for (const [key, value] of Object.entries(translations)) {
    if (data[key] !== undefined) {
      // Check if it's a localized field
      if (typeof data[key] === 'object' && data[key].en !== undefined) {
        data[key].zh = value
      } else {
        data[key] = value
      }
    }
  }
  return data
}

/**
 * Seed navigation menus in two phases:
 * Phase 1: Create all menus without parent relationships
 * Phase 2: Update parent relationships
 */
async function seedNavigationMenus(payload: any, menus: any[]) {
  const idMap = new Map() // Map old ID -> new ID

  // Delete existing menus first
  const existing = await payload.find({
    collection: 'navigation-menus',
    limit: 1000,
  })

  if (existing.docs.length > 0) {
    console.log(`  🗑️  Deleting ${existing.docs.length} existing menus...`)
    for (const menu of existing.docs) {
      await payload.delete({
        collection: 'navigation-menus',
        id: menu.id,
      })
    }
  }

  // Phase 1: Create all menus without parent
  console.log('  📝 Phase 1: Creating menus...')
  for (const menu of menus) {
    try {
      const menuData: any = {
        slug: menu.slug,
        name: menu.name,
        type: menu.type,
        icon: menu.icon || null,
        link: menu.link || null,
        inquiryLink: menu.inquiryLink || null,
        order: menu.order,
        visible: menu.visible ?? true,
        isSystem: menu.isSystem ?? false,
      }

      // Handle mediaTags - extract IDs from populated objects
      if (menu.mediaTags && Array.isArray(menu.mediaTags) && menu.mediaTags.length > 0) {
        menuData.mediaTags = menu.mediaTags.map((tag: any) => {
          if (typeof tag === 'object' && tag.id) {
            return tag.id
          }
          return tag
        })
      }

      // Create menu (without parent for now)
      const created = await payload.create({
        collection: 'navigation-menus',
        data: menuData,
      })

      idMap.set(menu.id, created.id)

      const extras = []
      if (menuData.icon) extras.push(`icon: ${menuData.icon}`)
      if (menuData.mediaTags?.length > 0) extras.push(`mediaTags: ${menuData.mediaTags.length}`)
      const extraStr = extras.length > 0 ? ` (${extras.join(', ')})` : ''

      console.log(`    ✅ ${menu.slug}${extraStr}`)
    } catch (error) {
      console.log(`    ❌ ${menu.slug}: ${error.message}`)
    }
  }

  // Phase 2: Update parent relationships
  console.log('\n  🔗 Phase 2: Setting parent relationships...')
  for (const menu of menus) {
    if (menu.parent) {
      try {
        const oldParentId = typeof menu.parent === 'object' ? menu.parent.id : menu.parent
        const newId = idMap.get(menu.id)
        const newParentId = idMap.get(oldParentId)

        if (newId && newParentId) {
          await payload.update({
            collection: 'navigation-menus',
            id: newId,
            data: {
              parent: newParentId,
            },
          })

          const parentSlug = typeof menu.parent === 'object' ? menu.parent.slug : 'unknown'
          console.log(`    ✅ ${menu.slug} -> ${parentSlug}`)
        }
      } catch (error) {
        console.log(`    ❌ ${menu.slug}: ${error.message}`)
      }
    }
  }

  console.log(`\n  ✅ Seeded ${menus.length} navigation menus`)
}

seedProductionHomepage().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
