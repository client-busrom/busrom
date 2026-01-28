/**
 * Create 10 SEO settings directly via fetch
 * Run: node scripts/create-seo-direct.mjs
 */

const API_URL = 'http://localhost:3002/api'

const homeSeoSettings = [
  // Priority 1: exact_path (HIGHEST - will be used for meta title/description)
  {
    identifier: 'home-primary-exact',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Busrom - Premium Glass Hardware Manufacturer | Global Leader',
    metaDescription: 'Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.',
    metaKeywords: 'glass hardware manufacturer, glass clamps supplier, premium glass fittings, stainless steel hardware, architectural glass hardware',
    ogTitle: 'Busrom Glass Hardware - Premium Quality Solutions',
    ogDescription: 'Global leader in manufacturing high-quality glass hardware products',
    robotsIndex: true,
    robotsFollow: true,
  },

  {
    identifier: 'home-keywords-glass-clamps',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Glass Clamps & Standoffs | Busrom Hardware Solutions',
    metaDescription: 'High-quality glass clamps, standoffs, and mounting hardware for commercial and residential applications.',
    metaKeywords: 'glass clamps, glass standoffs, glass mounting hardware, glass railing clamps, glass balustrade fittings, point fixing glass, spider glass fittings, frameless glass clamps',
  },

  {
    identifier: 'home-keywords-bathroom',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Bathroom Hardware & Shower Accessories | Busrom',
    metaDescription: 'Premium bathroom hardware including shower door hinges, handles, and glass accessories.',
    metaKeywords: 'bathroom hardware, shower door hinges, bathroom accessories, glass shower hardware, bathroom glass fittings, shower door handles, bathroom door hardware, shower glass clamps, frameless shower hardware',
  },

  {
    identifier: 'home-keywords-oem-odm',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'OEM ODM Glass Hardware Factory | Custom Manufacturing',
    metaDescription: 'Professional OEM ODM glass hardware manufacturing services with custom design capabilities and bulk production.',
    metaKeywords: 'OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing',
  },

  {
    identifier: 'home-keywords-materials',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Stainless Steel Glass Hardware | Durable Premium Quality',
    metaDescription: 'Durable 304 and 316 stainless steel glass hardware for modern architecture and interior design.',
    metaKeywords: 'stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings',
  },

  // Priority 6-8: page_type settings
  {
    identifier: 'home-type-keywords-doors',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Door Hardware & Handles | Busrom Solutions',
    metaDescription: 'Complete range of glass door hardware, handles, locks and accessories.',
    metaKeywords: 'glass door hardware, door handles, glass door locks, sliding door hardware, pivot door fittings, door handles stainless steel, glass door accessories, commercial door hardware, residential door hardware',
  },

  {
    identifier: 'home-type-keywords-railings',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Railing Systems & Balustrades | Busrom',
    metaDescription: 'Premium glass railing systems, balustrades and safety barriers.',
    metaKeywords: 'glass railing systems, glass balustrades, staircase glass railings, balcony glass railings, deck railing hardware, safety glass barriers, frameless glass railings, railing mounting brackets, glass handrail systems',
  },

  {
    identifier: 'home-type-keywords-connectors',
    scope: 'page_type',
    pageType: 'home',
    metaTitle: 'Glass Connectors & Brackets | Structural Hardware',
    metaDescription: 'Structural glass connectors, brackets and fixing systems for architectural applications.',
    metaKeywords: 'glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing',
  },

  // Priority 9: path_pattern
  {
    identifier: 'home-pattern-keywords-finish',
    scope: 'path_pattern',
    pathPattern: '/*',
    metaTitle: 'Polished & Brushed Finish Hardware | Busrom',
    metaDescription: 'Available in mirror polished, brushed satin, and matte black finishes.',
    metaKeywords: 'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
  },

  // Priority 10: global (LOWEST)
  {
    identifier: 'home-global-keywords-quality',
    scope: 'global',
    metaTitle: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
    metaDescription: 'ISO certified glass hardware manufacturer with worldwide shipping and quality guarantee.',
    metaKeywords: 'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
  },
]

async function main() {
  console.log('🚀 Creating 10 homepage SEO settings...\n')

  // Step 1: Delete existing home SEO settings
  console.log('🗑️  Checking for existing home SEO settings...\n')

  try {
    const listResponse = await fetch(`${API_URL}/seo-settings?limit=100`)
    const listData = await listResponse.json()

    const toDelete = listData.docs.filter(doc =>
      doc.exactPath === '/' ||
      doc.pageType === 'home' ||
      doc.scope === 'global' ||
      (doc.scope === 'path_pattern' && doc.pathPattern === '/*')
    )

    if (toDelete.length > 0) {
      console.log(`   Found ${toDelete.length} existing settings to delete\n`)
      for (const doc of toDelete) {
        try {
          await fetch(`${API_URL}/seo-settings/${doc.id}`, { method: 'DELETE' })
          console.log(`   ✅ Deleted: ${doc.identifier}`)
        } catch (err) {
          console.log(`   ⚠️  Could not delete: ${doc.identifier}`)
        }
      }
      console.log('')
    }
  } catch (err) {
    console.log('   ⚠️  Could not check existing settings (continuing...)\n')
  }

  // Step 2: Create new settings
  console.log('📝 Creating 10 new SEO settings...\n')

  let successCount = 0
  let failCount = 0

  for (const [index, seo] of homeSeoSettings.entries()) {
    try {
      const response = await fetch(`${API_URL}/seo-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seo),
      })

      const result = await response.json()

      if (result.errors) {
        console.log(`❌ [${index + 1}/10] Failed: ${seo.identifier}`)
        console.log(`   Error: ${result.errors[0]?.message || 'Unknown error'}`)
        failCount++
      } else {
        console.log(`✅ [${index + 1}/10] Created: ${seo.identifier}`)
        console.log(`   Scope: ${seo.scope}`)
        console.log(`   Title: ${seo.metaTitle}`)
        console.log(`   Keywords: ${seo.metaKeywords?.split(',').length || 0} keywords`)
        successCount++
      }
      console.log('')
    } catch (error) {
      console.error(`❌ [${index + 1}/10] Failed: ${seo.identifier}`)
      console.error(`   Error: ${error.message}`)
      failCount++
      console.log('')
    }
  }

  console.log('\n' + '═'.repeat(70))
  console.log(`📊 Summary: ${successCount} created, ${failCount} failed`)
  console.log('═'.repeat(70))

  if (successCount > 0) {
    console.log('\n✅ SEO settings created successfully!')
    console.log('\n📊 Expected behavior on homepage:')
    console.log('   1. Meta title/description: "home-primary-exact" (highest priority)')
    console.log('   2. Hidden titles: Settings #2-5 (other exact_path, skipping #1)')
    console.log('   3. Hidden keywords: ALL 10 settings combined and distributed')
    console.log('   4. Keywords distributed across 5 zones')
    console.log('\n🔍 To verify:')
    console.log('   1. Visit: http://localhost:3000/en')
    console.log('   2. View page source (Right-click → View Page Source)')
    console.log('   3. Search for:')
    console.log('      ✓ <title>Busrom - Premium Glass Hardware Manufacturer')
    console.log('      ✓ <div class="seo-hidden">')
    console.log('      ✓ <style>:root { --seo-header:')
    console.log('      ✓ <span data-seo-zone="header"></span>')
    console.log('')
  }

  if (failCount > 0 && failCount === homeSeoSettings.length) {
    console.log('\n⚠️  All requests failed. This is likely because:')
    console.log('   1. Payload CMS is not running (start with: npm run dev)')
    console.log('   2. API endpoint is not accessible at http://localhost:3002')
    console.log('   3. Authentication is required (unlikely for local dev)')
    console.log('\n💡 Workaround: Manually create the settings in Payload Admin')
    console.log('   Visit: http://localhost:3002/admin/collections/seo-settings/create')
    console.log('   Copy the JSON data from: scripts/create-home-seo-api.sh')
  }
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
