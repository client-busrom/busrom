/**
 * Fill MediaTags for Product/Shop Navigation Menus
 *
 * This script automatically assigns the correct media tags to product and shop navigation menus
 * based on their slug patterns.
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// Mapping of menu slug suffix -> media tag name
const seriesMapping = {
  'glass-standoff': 'Glass Standoff',
  'glass-connected-fitting': 'Glass Connected Fitting',
  'glass-fence-spigot': 'Glass Fence Spigot',
  'guardrail-glass-clip': 'Guardrail Glass Clip',
  'bathroom-glass-clip': 'Bathroom Glass Clip',
  'glass-hinge': 'Glass Hinge',
  'sliding-door-kit': 'Sliding Door Kit',
  'bathroom-door-handle': 'Bathroom & Door Handle',
  'hidden-hook': 'Hidden Hook',
}

async function fillMediaTags() {
  console.log('🔧 Filling MediaTags for Product/Shop Navigation Menus...\n')

  const payload = await getPayload({ config })

  try {
    // Get all media tags with type 'product_series'
    const mediaTags = await payload.find({
      collection: 'media-tags',
      where: { type: { equals: 'product_series' } },
      limit: 100,
    })

    console.log(`📦 Found ${mediaTags.docs.length} product series media tags`)

    // Create a map of name -> tag id
    const tagMap = new Map()
    mediaTags.docs.forEach((tag: any) => {
      tagMap.set(tag.name, tag.id)
      console.log(`  - ${tag.name} (id: ${tag.id})`)
    })

    console.log('\n🧭 Processing navigation menus...\n')

    let updatedCount = 0
    let skippedCount = 0

    // Process each series
    for (const [seriesSlug, tagName] of Object.entries(seriesMapping)) {
      const tagId = tagMap.get(tagName)

      if (!tagId) {
        console.log(`  ⚠️  No media tag found for: ${tagName}`)
        continue
      }

      // Update product-{series}
      const productSlug = `product-${seriesSlug}`
      try {
        const productMenus = await payload.find({
          collection: 'navigation-menus',
          where: { slug: { equals: productSlug } },
          limit: 1,
        })

        if (productMenus.docs.length > 0) {
          const menu = productMenus.docs[0]

          // Check if already has this tag
          const existingTags = Array.isArray(menu.mediaTags)
            ? menu.mediaTags.map((t: any) => typeof t === 'string' ? t : t.id)
            : []

          if (existingTags.includes(tagId)) {
            console.log(`  ⏭️  ${productSlug} already has tag`)
            skippedCount++
          } else {
            await payload.update({
              collection: 'navigation-menus',
              id: menu.id,
              data: {
                mediaTags: [tagId],
              },
            })
            console.log(`  ✅ ${productSlug} -> ${seriesSlug} tag`)
            updatedCount++
          }
        } else {
          console.log(`  ⚠️  Menu not found: ${productSlug}`)
        }
      } catch (error) {
        console.error(`  ❌ Error updating ${productSlug}:`, error.message)
      }

      // Update shop-{series}
      const shopSlug = `shop-${seriesSlug}`
      try {
        const shopMenus = await payload.find({
          collection: 'navigation-menus',
          where: { slug: { equals: shopSlug } },
          limit: 1,
        })

        if (shopMenus.docs.length > 0) {
          const menu = shopMenus.docs[0]

          // Check if already has this tag
          const existingTags = Array.isArray(menu.mediaTags)
            ? menu.mediaTags.map((t: any) => typeof t === 'string' ? t : t.id)
            : []

          if (existingTags.includes(tagId)) {
            console.log(`  ⏭️  ${shopSlug} already has tag`)
            skippedCount++
          } else {
            await payload.update({
              collection: 'navigation-menus',
              id: menu.id,
              data: {
                mediaTags: [tagId],
              },
            })
            console.log(`  ✅ ${shopSlug} -> ${seriesSlug} tag`)
            updatedCount++
          }
        } else {
          console.log(`  ⚠️  Menu not found: ${shopSlug}`)
        }
      } catch (error) {
        console.error(`  ❌ Error updating ${shopSlug}:`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Updated: ${updatedCount}`)
    console.log(`  ⏭️  Skipped (already has tag): ${skippedCount}`)
    console.log(`  📋 Total processed: ${updatedCount + skippedCount}`)

    console.log('\n🎉 Done!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fillMediaTags()
