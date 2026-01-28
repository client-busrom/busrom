/**
 * Browser Console Script - Create 10 SEO Settings for Homepage
 *
 * HOW TO USE:
 * 1. Open http://localhost:3002/admin in your browser
 * 2. Log in to Payload Admin
 * 3. Press F12 to open Developer Console
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 *
 * This script will create 10 SEO settings for testing the multi-SEO system
 */

(async function createHomeSeoSettings() {
  const API_URL = window.location.origin + '/api'

  const homeSeoSettings = [
    // #1: exact_path (HIGHEST priority - used for meta tags)
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

    // #2-5: exact_path (titles will be hidden, keywords distributed)
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

    // #6-8: page_type (lower priority)
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

    // #9: path_pattern
    {
      identifier: 'home-pattern-keywords-finish',
      scope: 'path_pattern',
      pathPattern: '/*',
      metaTitle: 'Polished & Brushed Finish Hardware | Busrom',
      metaDescription: 'Available in mirror polished, brushed satin, and matte black finishes.',
      metaKeywords: 'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
    },

    // #10: global (LOWEST priority)
    {
      identifier: 'home-global-keywords-quality',
      scope: 'global',
      metaTitle: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
      metaDescription: 'ISO certified glass hardware manufacturer with worldwide shipping and quality guarantee.',
      metaKeywords: 'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
    },
  ]

  console.log('🚀 Creating 10 homepage SEO settings...\n')
  console.log('🗑️  Deleting existing home SEO settings first...\n')

  // Delete existing settings
  try {
    const listResponse = await fetch(`${API_URL}/seo-settings?limit=100`)
    const listData = await listResponse.json()

    const toDelete = listData.docs.filter(doc =>
      doc.exactPath === '/' ||
      doc.pageType === 'home' ||
      doc.scope === 'global' ||
      (doc.scope === 'path_pattern' && doc.pathPattern === '/*')
    )

    for (const doc of toDelete) {
      await fetch(`${API_URL}/seo-settings/${doc.id}`, { method: 'DELETE' })
      console.log(`   ✅ Deleted: ${doc.identifier}`)
    }
    if (toDelete.length > 0) console.log('')
  } catch (err) {
    console.log('   ⚠️  Could not delete existing settings\n')
  }

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
        console.log(`   Error: ${result.errors[0]?.message}`)
        failCount++
      } else {
        console.log(`✅ [${index + 1}/10] Created: ${seo.identifier}`)
        console.log(`   Scope: ${seo.scope}, Keywords: ${seo.metaKeywords?.split(',').length || 0}`)
        successCount++
      }
    } catch (error) {
      console.error(`❌ [${index + 1}/10] Failed: ${seo.identifier} - ${error.message}`)
      failCount++
    }
  }

  console.log('\n' + '═'.repeat(70))
  console.log(`📊 SUMMARY: ${successCount} created, ${failCount} failed`)
  console.log('═'.repeat(70))

  if (successCount > 0) {
    console.log('\n✅ SEO settings created successfully!')
    console.log('\n📊 Expected Behavior:')
    console.log('   Priority Matching:')
    console.log('     • exact_path (priority 4): Settings #1-5')
    console.log('     • path_pattern (priority 3): Setting #9')
    console.log('     • page_type (priority 2): Settings #6-8')
    console.log('     • global (priority 1): Setting #10')
    console.log('')
    console.log('   On Homepage (http://localhost:3000/en):')
    console.log('     1. Meta Tags: From #1 (highest priority exact_path)')
    console.log('     2. Hidden Titles: From #2-5 (skipping #1)')
    console.log('     3. Hidden Keywords: ALL 10 combined & distributed in 5 zones')
    console.log('')
    console.log('🔍 Verification:')
    console.log('   1. Open: http://localhost:3000/en')
    console.log('   2. View Page Source (Right-click → View Page Source)')
    console.log('   3. Search for:')
    console.log('      ✓ <title>Busrom - Premium Glass Hardware Manufacturer')
    console.log('      ✓ <div class="seo-hidden"> (contains 4 hidden titles)')
    console.log('      ✓ <style>:root { --seo-header: (CSS variables for keywords)')
    console.log('      ✓ <span data-seo-zone="header"></span> (5 zone markers)')
    console.log('')
    console.log('📝 Test Complete! You can now verify the multi-SEO system.')
  }
})()
