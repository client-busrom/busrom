import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

/**
 * Seed Navigation Menus from Keystone export
 *
 * Handles conversion from Keystone format to Payload format:
 * - Keystone: name is JSON {en: 'xxx', zh: 'xxx'}
 * - Payload: name is localized text field
 *
 * Menu types:
 * - standard: 普通链接
 * - product_cards: 图文卡片
 * - submenu: Icon+文字子菜单
 */

interface KeystoneNavigationMenu {
  slug: string
  type: 'standard' | 'product_cards' | 'submenu'
  name: { en: string; zh: string }
  parent?: any
  link?: string
  inquiryLink?: string
  icon?: string
  order: number
  isSystem: boolean
  visible: boolean
  mediaTags?: any[]
}

async function seedNavigationMenus() {
  console.log('🧭 Seeding Navigation Menus...\n')

  const payload = await getPayload({ config })

  // Load exported data
  const dataPath = path.join(process.cwd(), 'scripts/homepage-data-export.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Export file not found:', dataPath)
    process.exit(1)
  }

  const exportData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const keystoneMenus: KeystoneNavigationMenu[] = exportData.collections['navigation-menus']

  if (!keystoneMenus || keystoneMenus.length === 0) {
    console.log('⚠️  No navigation menus found in export')
    process.exit(0)
  }

  console.log(`📊 Found ${keystoneMenus.length} menus to import\n`)

  // First pass: create all menus without parent relationships
  const menuIdMap = new Map<string, string>() // Keystone ID -> Payload ID
  let successCount = 0
  let errorCount = 0

  console.log('📝 Phase 1: Creating menus (without parent references)...\n')

  for (const keystoneMenu of keystoneMenus) {
    try {
      // Check if menu already exists
      const existing = await payload.find({
        collection: 'navigation-menus',
        where: {
          slug: { equals: keystoneMenu.slug },
        },
        limit: 1,
      })

      // Prepare menu data (without parent for now)
      const menuData: any = {
        slug: keystoneMenu.slug,
        type: keystoneMenu.type,
        link: keystoneMenu.link || null,
        inquiryLink: keystoneMenu.inquiryLink || null,
        order: keystoneMenu.order,
        isSystem: keystoneMenu.isSystem,
        visible: keystoneMenu.visible,
      }

      // Add icon if exists (for submenu type children)
      if (keystoneMenu.icon) {
        menuData.icon = keystoneMenu.icon
        console.log(`    └─ icon: ${keystoneMenu.icon}`)
      }

      // Add mediaTags if exists (for product_cards type children)
      if (keystoneMenu.mediaTags && keystoneMenu.mediaTags.length > 0) {
        // Convert Keystone media tag objects to Payload IDs
        menuData.mediaTags = keystoneMenu.mediaTags.map((tag: any) => {
          if (typeof tag === 'object' && tag.id) {
            return tag.id
          }
          return tag
        })
        console.log(`    └─ mediaTags: ${menuData.mediaTags.length} tags`)
      }

      if (existing.docs.length > 0) {
        // Update existing menu
        const payloadId = existing.docs[0].id

        // Update English version
        await payload.update({
          collection: 'navigation-menus',
          id: payloadId,
          data: {
            ...menuData,
            name: keystoneMenu.name.en,
          },
          locale: 'en',
        })

        // Update Chinese version
        await payload.update({
          collection: 'navigation-menus',
          id: payloadId,
          data: {
            ...menuData,
            name: keystoneMenu.name.zh,
          },
          locale: 'zh',
        })

        menuIdMap.set(keystoneMenu.slug, payloadId)
        console.log(`  ✅ Updated: ${keystoneMenu.slug} (${keystoneMenu.type})`)
      } else {
        // Create new menu - English version first
        const created = await payload.create({
          collection: 'navigation-menus',
          data: {
            ...menuData,
            name: keystoneMenu.name.en,
          },
          locale: 'en',
        })

        // Update Chinese version
        await payload.update({
          collection: 'navigation-menus',
          id: created.id,
          data: {
            name: keystoneMenu.name.zh,
          },
          locale: 'zh',
        })

        menuIdMap.set(keystoneMenu.slug, created.id)
        console.log(`  ✅ Created: ${keystoneMenu.slug} (${keystoneMenu.type})`)
      }

      successCount++
    } catch (error) {
      console.log(`  ❌ ${keystoneMenu.slug}: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n📝 Phase 2: Setting parent relationships...\n`)

  // Second pass: update parent relationships
  for (const keystoneMenu of keystoneMenus) {
    if (keystoneMenu.parent && keystoneMenu.parent.slug) {
      try {
        const childPayloadId = menuIdMap.get(keystoneMenu.slug)
        const parentPayloadId = menuIdMap.get(keystoneMenu.parent.slug)

        if (childPayloadId && parentPayloadId) {
          await payload.update({
            collection: 'navigation-menus',
            id: childPayloadId,
            data: {
              parent: parentPayloadId,
            },
          })
          console.log(`  ✅ Linked: ${keystoneMenu.slug} -> ${keystoneMenu.parent.slug}`)
        } else {
          console.log(`  ⚠️  Skipped: ${keystoneMenu.slug} (missing parent or child ID)`)
        }
      } catch (error) {
        console.log(`  ❌ ${keystoneMenu.slug}: ${error.message}`)
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Navigation Menus Seeding Complete!')
  console.log(`   Success: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  process.exit(0)
}

seedNavigationMenus().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
