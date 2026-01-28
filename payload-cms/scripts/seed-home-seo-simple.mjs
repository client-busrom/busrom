/**
 * Simple SEO seeder - bypasses tsx/CSS issues
 * Run: node scripts/seed-home-seo-simple.mjs
 */

const API_URL = 'http://localhost:3002/api'

const settings = [
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
    metaDescription: 'High-quality glass clamps, standoffs, and mounting hardware.',
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
    metaDescription: 'Professional OEM ODM glass hardware manufacturing services.',
    metaKeywords: 'OEM glass hardware, ODM hardware manufacturer, custom glass fittings, glass hardware factory, wholesale glass hardware, bulk hardware supplier, hardware manufacturing, custom hardware design, contract manufacturing',
  },
  {
    identifier: 'home-keywords-materials',
    scope: 'exact_path',
    exactPath: '/',
    metaTitle: 'Stainless Steel Glass Hardware | Durable Premium Quality',
    metaDescription: 'Durable 304 and 316 stainless steel glass hardware.',
    metaKeywords: 'stainless steel hardware, 304 stainless steel fittings, 316 stainless steel hardware, marine grade hardware, corrosion resistant hardware, modern glass hardware, contemporary glass fittings, rust-proof hardware, weather resistant fittings',
  },
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
    metaDescription: 'Structural glass connectors, brackets and fixing systems.',
    metaKeywords: 'glass connectors, structural hardware, glass brackets, fixing systems, architectural brackets, glass to glass connectors, glass to wall brackets, structural glass fittings, point fixed glazing',
  },
  {
    identifier: 'home-pattern-keywords-finish',
    scope: 'path_pattern',
    pathPattern: '/*',
    metaTitle: 'Polished & Brushed Finish Hardware | Busrom',
    metaDescription: 'Available in mirror polished, brushed satin, and matte black finishes.',
    metaKeywords: 'polished hardware, brushed finish hardware, mirror polish stainless steel, satin finish hardware, matte black hardware, chrome finish hardware, powder coated hardware, surface finishes, decorative hardware finishes',
  },
  {
    identifier: 'home-global-keywords-quality',
    scope: 'global',
    metaTitle: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
    metaDescription: 'ISO certified glass hardware manufacturer with worldwide shipping.',
    metaKeywords: 'ISO certified manufacturer, quality assurance, worldwide shipping, global supplier, certified hardware, quality control, international shipping, bulk orders, wholesale pricing, factory direct',
  },
]

console.log('🚀 Testing API connection...\n')

try {
  const testRes = await fetch(`${API_URL}/seo-settings?limit=1`)
  if (!testRes.ok) {
    console.log('❌ API not accessible. Please ensure:')
    console.log('   1. Payload CMS is running on http://localhost:3002')
    console.log('   2. Run: npm run dev (in payload-cms directory)\n')
    process.exit(1)
  }
  console.log('✅ API is accessible\n')
  console.log('⚠️  Note: API requires authentication')
  console.log('   This script will fail with "You are not allowed to perform this action."\n')
  console.log('📝 SOLUTION: Use the browser console method instead:\n')
  console.log('   1. Open: http://localhost:3002/admin')
  console.log('   2. Log in to Payload')
  console.log('   3. Press F12 to open console')
  console.log('   4. Copy/paste: payload-cms/scripts/create-seo-browser.js')
  console.log('   5. Press Enter\n')
  console.log('   The browser script will work because you\'re authenticated!\n')
} catch (err) {
  console.log('❌ Cannot connect to API:', err.message)
  console.log('   Start Payload: npm run dev\n')
  process.exit(1)
}

// Show the data that would be created
console.log('═'.repeat(70))
console.log('📊 10 SEO Settings Ready to Create:')
console.log('═'.repeat(70))
settings.forEach((s, i) => {
  console.log(`\n${i + 1}. ${s.identifier}`)
  console.log(`   Scope: ${s.scope}${s.exactPath ? ` (${s.exactPath})` : ''}${s.pageType ? ` (${s.pageType})` : ''}`)
  console.log(`   Title: ${s.metaTitle}`)
  console.log(`   Keywords: ${s.metaKeywords.split(',').length}`)
})

console.log('\n' + '═'.repeat(70))
console.log('💡 To create these settings, use the browser console method above.')
console.log('═'.repeat(70))
