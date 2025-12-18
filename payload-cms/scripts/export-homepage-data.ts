import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

/**
 * Export Homepage Data from Payload CMS
 *
 * Exports all homepage-related globals and collections data including:
 * - 14 global configurations (service-features, brand-advantages, etc.)
 * - Navigation menus with icons and media tags
 *
 * Usage: npx tsx scripts/export-homepage-data.ts
 * Output: scripts/homepage-data-export.json
 */

const LOCALES = ['en', 'zh']

async function exportHomepageData() {
  console.log('🚀 Starting homepage data export...')

  const payload = await getPayload({ config })

  const exportData: any = {
    globals: {},
    collections: {},
    exportedAt: new Date().toISOString(),
  }

  // List of homepage globals to export
  const globalsToExport = [
    'service-features',
    'sphere-3d',
    'simple-cta',
    'featured-products',
    'brand-advantages',
    'oem-odm',
    'quote-steps',
    'main-form',
    'why-choose-busrom',
    'case-studies',
    'brand-analysis',
    'brand-value',
    'footer',
    'product-series-carousel',
  ]

  // Export globals
  console.log('\n📦 Exporting globals...')
  for (const globalSlug of globalsToExport) {
    try {
      const data = await payload.findGlobal({
        slug: globalSlug as any,
        locale: 'all' as any, // Get all locales
      })

      exportData.globals[globalSlug] = data
      console.log(`  ✅ ${globalSlug}`)
    } catch (error) {
      console.log(`  ❌ ${globalSlug}: ${error.message}`)
    }
  }

  // Export collections related to homepage
  console.log('\n📦 Exporting collections...')

  // Export NavigationMenus with full relationships
  try {
    const navMenus = await payload.find({
      collection: 'navigation-menus',
      limit: 1000,
      locale: 'all' as any,
      depth: 2, // Include mediaTags and parent relationships
    })
    exportData.collections['navigation-menus'] = navMenus.docs
    console.log(`  ✅ navigation-menus (${navMenus.docs.length} items)`)

    // Log a sample to verify mediaTags are included
    const sampleWithTags = navMenus.docs.find(m => m.mediaTags && m.mediaTags.length > 0)
    if (sampleWithTags) {
      console.log(`     Sample with mediaTags: ${sampleWithTags.slug} has ${sampleWithTags.mediaTags.length} tags`)
    }
  } catch (error) {
    console.log(`  ❌ navigation-menus: ${error.message}`)
  }

  // Save to file
  const outputPath = path.join(process.cwd(), 'scripts/homepage-data-export.json')
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

  console.log(`\n✅ Data exported to: ${outputPath}`)
  console.log(`📊 Export summary:`)
  console.log(`   - Globals: ${Object.keys(exportData.globals).length}`)
  console.log(`   - Collections: ${Object.keys(exportData.collections).length}`)

  process.exit(0)
}

exportHomepageData().catch((error) => {
  console.error('❌ Export failed:', error)
  process.exit(1)
})
