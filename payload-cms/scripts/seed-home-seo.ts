/**
 * Seed multiple SEO settings for homepage testing
 *
 * Run: pnpm tsx scripts/seed-home-seo.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  console.log('🚀 Seeding homepage SEO settings...\n')

  const payload = await getPayload({ config })

  // SEO settings for homepage
  const homeSeoSettings = [
    {
      identifier: 'home-primary',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Busrom - Professional Glass Hardware Manufacturer | Premium Quality',
      metaDescription: 'Leading manufacturer of premium glass hardware products. Shop glass clamps, door handles, hinges and architectural hardware for global markets.',
      metaKeywords: `glass hardware manufacturer
glass clamps
door handles
architectural hardware
premium glass fittings
glass door hardware
stainless steel hardware`,
      robotsIndex: true,
      robotsFollow: true,
    },
    {
      identifier: 'home-keywords-1',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Glass Clamps & Standoffs | Busrom Hardware Solutions',
      metaDescription: 'High-quality glass clamps, standoffs, and mounting hardware for commercial and residential applications.',
      metaKeywords: `glass clamps supplier
glass standoffs
glass mounting hardware
glass railing clamps
glass balustrade fittings
point fixing glass
spider glass fittings`,
    },
    {
      identifier: 'home-keywords-2',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Bathroom Hardware & Accessories | Busrom',
      metaDescription: 'Premium bathroom hardware including shower door hinges, handles, and accessories.',
      metaKeywords: `bathroom hardware
shower door hinges
bathroom accessories
glass shower hardware
bathroom glass fittings
shower door handles
bathroom door hardware`,
    },
    {
      identifier: 'home-keywords-3',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'OEM ODM Glass Hardware Factory | Custom Manufacturing',
      metaDescription: 'Professional OEM ODM glass hardware manufacturing services with custom design capabilities.',
      metaKeywords: `OEM glass hardware
ODM hardware manufacturer
custom glass fittings
glass hardware factory
wholesale glass hardware
bulk hardware supplier
hardware manufacturing`,
    },
    {
      identifier: 'home-keywords-4',
      scope: 'exact_path' as const,
      exactPath: '/',
      metaTitle: 'Stainless Steel Glass Hardware | Durable Solutions',
      metaDescription: 'Durable stainless steel glass hardware for modern architecture and interior design.',
      metaKeywords: `stainless steel hardware
304 stainless steel fittings
316 stainless steel hardware
marine grade hardware
corrosion resistant hardware
modern glass hardware
contemporary glass fittings`,
    },
  ]

  // Create each SEO setting
  for (const seo of homeSeoSettings) {
    try {
      // Check if exists
      const existing = await payload.find({
        collection: 'seo-settings',
        where: { identifier: { equals: seo.identifier } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        // Update
        await payload.update({
          collection: 'seo-settings',
          id: existing.docs[0].id,
          data: seo,
        })
        console.log(`✅ Updated: ${seo.identifier}`)
      } else {
        // Create
        await payload.create({
          collection: 'seo-settings',
          data: seo,
        })
        console.log(`✅ Created: ${seo.identifier}`)
      }
    } catch (error) {
      console.error(`❌ Failed: ${seo.identifier}`, error)
    }
  }

  console.log('\n✅ Done! Processed', homeSeoSettings.length, 'SEO settings for homepage')
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
