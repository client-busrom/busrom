/**
 * Check Base Data Status
 *
 * Checks the current status of base data in Payload CMS:
 * - Media Tags
 * - Media Categories
 * - Categories
 * - Product Series
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function checkBaseData() {
  const payload = await getPayload({ config })

  console.log('🔍 Checking Base Data Status...\n')

  // Check Media Tags
  const mediaTags = await payload.find({
    collection: 'media-tags',
    limit: 100,
  })
  console.log(`📦 Media Tags: ${mediaTags.totalDocs}`)
  if (mediaTags.totalDocs > 0) {
    console.log('   Sample:')
    mediaTags.docs.slice(0, 5).forEach((tag: any) => {
      console.log(`   - ${tag.name} (type: ${tag.type || 'N/A'})`)
    })
  }

  // Check Media Categories
  const mediaCategories = await payload.find({
    collection: 'media-categories',
    limit: 100,
  })
  console.log(`\n📁 Media Categories: ${mediaCategories.totalDocs}`)
  if (mediaCategories.totalDocs > 0) {
    console.log('   Sample:')
    mediaCategories.docs.slice(0, 5).forEach((cat: any) => {
      console.log(`   - ${cat.name} (slug: ${cat.slug})`)
    })
  }

  // Check Categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  })
  console.log(`\n🏷️  Categories: ${categories.totalDocs}`)
  if (categories.totalDocs > 0) {
    console.log('   Sample:')
    categories.docs.slice(0, 5).forEach((cat: any) => {
      console.log(`   - ${cat.name?.en || cat.name} (slug: ${cat.slug})`)
    })
  }

  // Check Product Series
  const productSeries = await payload.find({
    collection: 'product-series',
    limit: 100,
  })
  console.log(`\n📦 Product Series: ${productSeries.totalDocs}`)
  if (productSeries.totalDocs > 0) {
    console.log('   Sample:')
    productSeries.docs.slice(0, 5).forEach((series: any) => {
      console.log(`   - ${series.name?.en || series.name} (slug: ${series.slug})`)
    })
  }

  console.log('\n✅ Check complete!')
  process.exit(0)
}

checkBaseData()
