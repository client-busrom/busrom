/**
 * Seed 10 SEO settings for homepage testing
 * Tests multi-SEO priority system and hidden keyword injection
 *
 * Run: npx tsx scripts/seed-home-seo-test.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  console.log('🚀 Seeding 10 homepage SEO settings for testing...\n')

  const payload = await getPayload({ config })

  // 10 SEO settings for homepage with different priorities
  const homeSeoSettings = [
    // Priority 1: exact_path (HIGHEST - will be used for meta title/description)
    {
      identifier: 'home-primary-exact',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Busrom - Premium Glass Hardware Manufacturer | Global Leader',
      metaDescription: 'Leading manufacturer of premium glass hardware products. Specializing in glass clamps, door handles, hinges and architectural hardware for global markets.',
      metaKeywords: `glass hardware manufacturer
glass clamps supplier
premium glass fittings
stainless steel hardware
architectural glass hardware`,
      ogTitle: 'Busrom Glass Hardware - Premium Quality Solutions',
      ogDescription: 'Global leader in manufacturing high-quality glass hardware products',
      robotsIndex: true,
      robotsFollow: true,
    },

    // Priority 2-5: More exact_path settings (titles/descriptions will be hidden)
    {
      identifier: 'home-keywords-glass-clamps',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Glass Clamps & Standoffs | Busrom Hardware Solutions',
      metaDescription: 'High-quality glass clamps, standoffs, and mounting hardware for commercial and residential applications.',
      metaKeywords: `glass clamps
glass standoffs
glass mounting hardware
glass railing clamps
glass balustrade fittings
point fixing glass
spider glass fittings
frameless glass clamps`,
    },

    {
      identifier: 'home-keywords-bathroom',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Bathroom Hardware & Shower Accessories | Busrom',
      metaDescription: 'Premium bathroom hardware including shower door hinges, handles, and glass accessories.',
      metaKeywords: `bathroom hardware
shower door hinges
bathroom accessories
glass shower hardware
bathroom glass fittings
shower door handles
bathroom door hardware
shower glass clamps
frameless shower hardware`,
    },

    {
      identifier: 'home-keywords-oem-odm',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'OEM ODM Glass Hardware Factory | Custom Manufacturing',
      metaDescription: 'Professional OEM ODM glass hardware manufacturing services with custom design capabilities and bulk production.',
      metaKeywords: `OEM glass hardware
ODM hardware manufacturer
custom glass fittings
glass hardware factory
wholesale glass hardware
bulk hardware supplier
hardware manufacturing
custom hardware design
contract manufacturing`,
    },

    {
      identifier: 'home-keywords-materials',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Stainless Steel Glass Hardware | Durable Premium Quality',
      metaDescription: 'Durable 304 and 316 stainless steel glass hardware for modern architecture and interior design.',
      metaKeywords: `stainless steel hardware
304 stainless steel fittings
316 stainless steel hardware
marine grade hardware
corrosion resistant hardware
modern glass hardware
contemporary glass fittings
rust-proof hardware
weather resistant fittings`,
    },

    // Priority 6-8: page_type settings (lower priority)
    {
      identifier: 'home-type-keywords-doors',
      scope: 'page_type' as const,
      pageType: 'home',
      metaTitle: 'Glass Door Hardware & Handles | Busrom Solutions',
      metaDescription: 'Complete range of glass door hardware, handles, locks and accessories.',
      metaKeywords: `glass door hardware
door handles
glass door locks
sliding door hardware
pivot door fittings
door handles stainless steel
glass door accessories
commercial door hardware
residential door hardware`,
    },

    {
      identifier: 'home-type-keywords-railings',
      scope: 'page_type' as const,
      pageType: 'home',
      metaTitle: 'Glass Railing Systems & Balustrades | Busrom',
      metaDescription: 'Premium glass railing systems, balustrades and safety barriers.',
      metaKeywords: `glass railing systems
glass balustrades
staircase glass railings
balcony glass railings
deck railing hardware
safety glass barriers
frameless glass railings
railing mounting brackets
glass handrail systems`,
    },

    {
      identifier: 'home-type-keywords-connectors',
      scope: 'page_type' as const,
      pageType: 'home',
      metaTitle: 'Glass Connectors & Brackets | Structural Hardware',
      metaDescription: 'Structural glass connectors, brackets and fixing systems for architectural applications.',
      metaKeywords: `glass connectors
structural hardware
glass brackets
fixing systems
architectural brackets
glass to glass connectors
glass to wall brackets
structural glass fittings
point fixed glazing`,
    },

    // Priority 9: path_pattern (for testing wildcard matching)
    {
      identifier: 'home-pattern-keywords-finish',
      scope: 'path_pattern' as const,
      pathPattern: '/*',
      metaTitle: 'Polished & Brushed Finish Hardware | Busrom',
      metaDescription: 'Available in mirror polished, brushed satin, and matte black finishes.',
      metaKeywords: `polished hardware
brushed finish hardware
mirror polish stainless steel
satin finish hardware
matte black hardware
chrome finish hardware
powder coated hardware
surface finishes
decorative hardware finishes`,
    },

    // Priority 10: global (LOWEST priority)
    {
      identifier: 'home-global-keywords-quality',
      scope: 'global' as const,
      metaTitle: 'Global Glass Hardware Supplier | Busrom Quality Assurance',
      metaDescription: 'ISO certified glass hardware manufacturer with worldwide shipping and quality guarantee.',
      metaKeywords: `ISO certified manufacturer
quality assurance
worldwide shipping
global supplier
certified hardware
quality control
international shipping
bulk orders
wholesale pricing
factory direct`,
    },
  ]

  // Delete existing home SEO settings first
  console.log('🗑️  Cleaning up existing home SEO settings...\n')
  const existing = await payload.find({
    collection: 'seo-settings',
    where: {
      or: [
        { exactPath: { equals: '/' } },
        { pageType: { equals: 'home' } },
        { scope: { equals: 'global' } },
      ],
    },
    limit: 100,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'seo-settings',
      id: doc.id,
    })
    console.log(`   Deleted: ${doc.identifier}`)
  }

  console.log('\n📝 Creating 10 new SEO settings...\n')

  // Create each SEO setting
  for (const [index, seo] of homeSeoSettings.entries()) {
    try {
      const created = await payload.create({
        collection: 'seo-settings',
        data: seo,
      })
      console.log(`✅ [${index + 1}/10] Created: ${seo.identifier}`)
      console.log(`   Scope: ${seo.scope}`)
      console.log(`   Title: ${seo.metaTitle}`)
      console.log(`   Keywords: ${seo.metaKeywords?.split('\n').length || 0} keywords`)
      console.log('')
    } catch (error) {
      console.error(`❌ Failed: ${seo.identifier}`, error)
    }
  }

  console.log('\n✅ Done! Created 10 SEO settings for homepage testing')
  console.log('\n📊 Expected behavior:')
  console.log('   1. Meta title/description: "home-primary-exact" (highest priority exact_path)')
  console.log('   2. Hidden titles: Settings #2-5 titles (other exact_path)')
  console.log('   3. Hidden keywords: ALL 10 settings combined and distributed')
  console.log('   4. Keywords distributed across 5 zones (header, main, product, sidebar, footer)')
  console.log('\n🔍 To verify:')
  console.log('   1. Visit: http://localhost:3000/en')
  console.log('   2. View page source')
  console.log('   3. Look for:')
  console.log('      - <title>Busrom - Premium Glass Hardware Manufacturer | Global Leader</title>')
  console.log('      - <div class="seo-hidden">...(hidden titles from #2-5)...</div>')
  console.log('      - <style>:root { --seo-header: "..."; --seo-main: "..."; }</style>')
  console.log('      - <span data-seo-zone="header"></span> (5 zones)')

  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
