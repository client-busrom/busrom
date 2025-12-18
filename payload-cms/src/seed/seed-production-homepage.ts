import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Seed production homepage data
 * This imports all homepage globals with complete EN/ZH translations
 *
 * Usage:
 * 1. From main seed: import { seedProductionHomepage } from './seed-production-homepage'
 * 2. Standalone: npx tsx src/seed/seed-production-homepage.ts
 */

interface ExportedData {
  globals: Record<string, any>
  collections: Record<string, any[]>
  exportedAt: string
}

/**
 * Load exported homepage data from JSON file
 */
function loadExportedData(): ExportedData {
  // Try multiple possible paths
  const possiblePaths = [
    path.join(process.cwd(), 'scripts/homepage-data-export.json'),
    path.join(process.cwd(), 'src/seed/homepage-data-export.json'),
    path.join(__dirname, '../../scripts/homepage-data-export.json'),
  ]

  for (const dataPath of possiblePaths) {
    if (fs.existsSync(dataPath)) {
      console.log(`📂 Loading data from: ${dataPath}`)
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    }
  }

  throw new Error('❌ homepage-data-export.json not found. Run: npx tsx scripts/export-homepage-data.ts')
}

/**
 * Clean data object by removing system fields
 */
function cleanData(data: any): any {
  if (!data || typeof data !== 'object') return data

  const cleaned = Array.isArray(data) ? [...data] : { ...data }

  // Remove system fields
  delete cleaned.id
  delete cleaned.createdAt
  delete cleaned.updatedAt
  delete cleaned.__v

  // Recursively clean nested objects
  for (const [key, value] of Object.entries(cleaned)) {
    if (value && typeof value === 'object') {
      cleaned[key] = cleanData(value)
    }
  }

  return cleaned
}

/**
 * Main seed function for production homepage data
 */
export async function seedProductionHomepage(payload: Payload) {
  console.log('\n🏠 Seeding Production Homepage Data')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const exportData = loadExportedData()

    console.log('📊 Data loaded:')
    console.log(`   - Globals: ${Object.keys(exportData.globals).length}`)
    console.log(`   - Collections: ${Object.keys(exportData.collections).length}`)
    console.log(`   - Exported: ${new Date(exportData.exportedAt).toLocaleString()}\n`)

    // Seed globals
    console.log('🌱 Seeding globals...\n')
    let successCount = 0
    let errorCount = 0

    for (const [globalSlug, globalData] of Object.entries(exportData.globals)) {
      try {
        let cleanedData = cleanData(globalData)

        // Special handling for featured-products: remove categories
        if (globalSlug === 'featured-products') {
          delete cleanedData.categories
          console.log(`  ℹ️  ${globalSlug} (categories field cleared)`)
        }

        // Update global (works for all locales since data includes locale-specific values)
        await payload.updateGlobal({
          slug: globalSlug,
          data: cleanedData,
        })

        console.log(`  ✅ ${globalSlug}`)
        successCount++
      } catch (error) {
        console.log(`  ❌ ${globalSlug}: ${error.message}`)
        errorCount++
      }
    }

    // Seed navigation menus
    if (exportData.collections['navigation-menus']) {
      console.log('\n🧭 Seeding navigation menus...\n')

      const keystoneMenus = exportData.collections['navigation-menus']
      const menuIdMap = new Map<string, string>() // slug -> Payload ID

      // Phase 1: Create all menus without parent relationships
      console.log('   Phase 1: Creating menus...\n')

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

          // Prepare menu data (without parent)
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
          }

          // Add mediaTags if exists (for product_cards type children)
          if (keystoneMenu.mediaTags && keystoneMenu.mediaTags.length > 0) {
            // Convert Keystone media tag objects to Payload IDs
            menuData.mediaTags = keystoneMenu.mediaTags.map((tag: any) => {
              // If tag is an object with id, return just the id
              if (typeof tag === 'object' && tag.id) {
                return tag.id
              }
              return tag
            })
          }

          if (existing.docs.length > 0) {
            const payloadId = existing.docs[0].id

            // Update English
            await payload.update({
              collection: 'navigation-menus',
              id: payloadId,
              data: {
                ...menuData,
                name: keystoneMenu.name.en,
              },
              locale: 'en',
            })

            // Update Chinese
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
            console.log(`     ✅ ${keystoneMenu.slug}`)
          } else {
            // Create new - English first
            const created = await payload.create({
              collection: 'navigation-menus',
              data: {
                ...menuData,
                name: keystoneMenu.name.en,
              },
              locale: 'en',
            })

            // Update Chinese
            await payload.update({
              collection: 'navigation-menus',
              id: created.id,
              data: {
                name: keystoneMenu.name.zh,
              },
              locale: 'zh',
            })

            menuIdMap.set(keystoneMenu.slug, created.id)
            console.log(`     ✅ ${keystoneMenu.slug}`)
          }

          successCount++
        } catch (error) {
          console.log(`     ❌ ${keystoneMenu.slug}: ${error.message}`)
          errorCount++
        }
      }

      // Phase 2: Update parent relationships
      console.log('\n   Phase 2: Setting parent relationships...\n')

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
              console.log(`     ✅ ${keystoneMenu.slug} -> ${keystoneMenu.parent.slug}`)
            }
          } catch (error) {
            console.log(`     ❌ ${keystoneMenu.slug}: ${error.message}`)
          }
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Production Homepage Seeding Complete!')
    console.log(`   Success: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('❌ Failed to seed production homepage:', error)
    throw error
  }
}

/**
 * Standalone execution
 */
const isMainModule = import.meta.url === `file://${process.argv[1]}`

if (isMainModule) {
  ;(async () => {
    const { getPayload } = await import('payload')
    const config = await import('@payload-config')

    const payload = await getPayload({ config: config.default })

    await seedProductionHomepage(payload)

    process.exit(0)
  })().catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
}
