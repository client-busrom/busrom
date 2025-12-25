/**
 * Seed script to create sample products for all series
 * Run with: npx tsx src/seed/seed-products.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const series = [
  { id: 1, slug: 'glass-standoff', prefix: 'GS', name: 'Glass Standoff', start: 2 }, // already has 001
  { id: 2, slug: 'glass-connected-fitting', prefix: 'GCF', name: 'Glass Connected Fitting', start: 1 },
  { id: 3, slug: 'glass-fence-spigot', prefix: 'GFS', name: 'Glass Fence Spigot', start: 1 },
  { id: 4, slug: 'guardrail-glass-clip', prefix: 'GGC', name: 'Guardrail Glass Clip', start: 1 },
  { id: 5, slug: 'bathroom-glass-clip', prefix: 'BGC', name: 'Bathroom Glass Clip', start: 1 },
  { id: 6, slug: 'glass-hinge', prefix: 'GH', name: 'Glass Hinge', start: 1 },
  { id: 7, slug: 'sliding-door-kit', prefix: 'SDK', name: 'Sliding Door Kit', start: 1 },
  { id: 8, slug: 'bathroom-door-handle', prefix: 'BDH', name: 'Bathroom Door Handle', start: 1 },
  { id: 9, slug: 'hidden-hook', prefix: 'HH', name: 'Hidden Hook', start: 1 },
]

// Reference images from GS-001
const showImageId = 2060
const mainImageIds = [1789, 1788, 1787, 1786, 1785, 1793, 1792, 1791, 1790]

async function seed() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  const products: Array<{
    sku: string
    slug: string
    name: string
    localizedName: string
    shortDescription: string
    showImage: number
    mainImage: number[]
    series: number
    isFeatured: boolean
    order: number
    status: string
  }> = []

  series.forEach((s) => {
    const count = s.start === 2 ? 2 : 3 // GS needs 2 more, others need 3
    for (let i = 0; i < count; i++) {
      const num = String(s.start + i).padStart(3, '0')
      const sku = `${s.prefix}-${num}`
      const slug = `${s.slug}-${num}`
      const name = `${s.name} ${num}`

      products.push({
        sku,
        slug,
        name,
        localizedName: name,
        shortDescription: `Premium ${s.name.toLowerCase()} hardware`,
        showImage: showImageId,
        mainImage: mainImageIds,
        series: s.id,
        isFeatured: false,
        order: parseInt(num),
        status: 'DRAFT',
      })
    }
  })

  console.log(`Creating ${products.length} products...`)

  let success = 0
  let failed = 0

  for (const product of products) {
    try {
      // Check if product already exists
      const existing = await payload.find({
        collection: 'products',
        where: { sku: { equals: product.sku } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`⊘ Skipped: ${product.sku} (already exists)`)
        continue
      }

      await payload.create({
        collection: 'products',
        data: product as any,
      })
      console.log(`✓ Created: ${product.sku}`)
      success++
    } catch (error: any) {
      console.log(`✗ Failed: ${product.sku} - ${error.message}`)
      failed++
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
