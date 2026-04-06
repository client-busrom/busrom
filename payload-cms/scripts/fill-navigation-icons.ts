/**
 * Fill Icons for SUBMENU Navigation Menus
 *
 * This script automatically assigns appropriate Lucide icons to submenu navigation items
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// Icon mapping for submenu children
const iconMapping = {
  // About Us submenu
  'fraud-notice': 'AlertTriangle',
  'privacy-policy': 'Shield',
  'support': 'Headphones',
  'blog': 'FileText',
  'our-story': 'BookOpen',

  // Service submenu
  'application': 'Lightbulb',
  'faq': 'HelpCircle',
  'oem-odm': 'Settings',
  'one-stop-solution': 'Package',
  'service-overview': 'LayoutDashboard',
}

async function fillIcons() {
  console.log('🎨 Filling Icons for SUBMENU Navigation Menus...\n')

  const payload = await getPayload({ config })

  try {
    // Find all SUBMENU parent menus
    const submenuParents = await payload.find({
      collection: 'navigation-menus',
      where: { type: { equals: 'submenu' } },
      limit: 100,
    })

    console.log(`📋 Found ${submenuParents.docs.length} SUBMENU parent menus:`)
    submenuParents.docs.forEach((menu: any) => {
      console.log(`  - ${menu.slug}`)
    })

    console.log('\n🧭 Processing submenu children...\n')

    let updatedCount = 0
    let skippedCount = 0

    // Process each icon mapping
    for (const [menuSlug, iconName] of Object.entries(iconMapping)) {
      try {
        // Find the menu by slug
        const menus = await payload.find({
          collection: 'navigation-menus',
          where: { slug: { equals: menuSlug } },
          limit: 1,
        })

        if (menus.docs.length === 0) {
          console.log(`  ⚠️  Menu not found: ${menuSlug}`)
          continue
        }

        const menu = menus.docs[0]

        // Check if already has icon
        if (menu.icon && menu.icon === iconName) {
          console.log(`  ⏭️  ${menuSlug} already has icon: ${iconName}`)
          skippedCount++
        } else {
          await payload.update({
            collection: 'navigation-menus',
            id: menu.id,
            data: {
              icon: iconName,
            },
          })
          console.log(`  ✅ ${menuSlug} -> ${iconName}`)
          updatedCount++
        }
      } catch (error) {
        console.error(`  ❌ Error updating ${menuSlug}:`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Updated: ${updatedCount}`)
    console.log(`  ⏭️  Skipped (already correct): ${skippedCount}`)
    console.log(`  📋 Total processed: ${updatedCount + skippedCount}`)

    // Show current state
    console.log('\n📋 Current Icon Assignments:')
    console.log('\n  About Us submenu:')
    console.log('    - fraud-notice: AlertTriangle')
    console.log('    - privacy-policy: Shield')
    console.log('    - support: Headphones')
    console.log('    - blog: FileText')
    console.log('    - our-story: BookOpen')
    console.log('\n  Service submenu:')
    console.log('    - application: Lightbulb')
    console.log('    - faq: HelpCircle')
    console.log('    - oem-odm: Settings')
    console.log('    - one-stop-solution: Package')
    console.log('    - service-overview: LayoutDashboard')

    console.log('\n🎉 Done!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fillIcons()
