/**
 * Update Status Values Migration
 *
 * Updates existing ACTIVE status to PUBLISHED for:
 * - Category
 * - ProductSeries
 * - ReusableBlock
 *
 * Run with: npx tsx migrations/update-status-values.ts
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'

async function updateStatusValues() {
  console.log('🔄 Starting status values migration...\n')

  const context = getContext(config, PrismaModule)

  try {
    // Update Category status from ACTIVE to PUBLISHED
    console.log('📁 Updating Category status...')
    const categories = await context.query.Category.findMany({
      where: { status: { equals: 'ACTIVE' } },
      query: 'id slug',
    })

    for (const category of categories) {
      await context.query.Category.updateOne({
        where: { id: category.id },
        data: { status: 'PUBLISHED' },
      })
    }
    console.log(`  ✓ Updated ${categories.length} categories\n`)

    // Update ProductSeries status from ACTIVE to PUBLISHED
    console.log('📦 Updating ProductSeries status...')
    const series = await context.query.ProductSeries.findMany({
      where: { status: { equals: 'ACTIVE' } },
      query: 'id slug',
    })

    for (const item of series) {
      await context.query.ProductSeries.updateOne({
        where: { id: item.id },
        data: { status: 'PUBLISHED' },
      })
    }
    console.log(`  ✓ Updated ${series.length} product series\n`)

    // Update ReusableBlock status from ACTIVE to PUBLISHED
    console.log('🔄 Updating ReusableBlock status...')
    const blocks = await context.query.ReusableBlock.findMany({
      where: { status: { equals: 'ACTIVE' } },
      query: 'id identifier',
    })

    for (const block of blocks) {
      await context.query.ReusableBlock.updateOne({
        where: { id: block.id },
        data: { status: 'PUBLISHED' },
      })
    }
    console.log(`  ✓ Updated ${blocks.length} reusable blocks\n`)

    console.log('✅ Status values migration completed successfully!')

    // Print summary
    console.log('\n📊 Summary:')
    console.log(`  - Categories: ${categories.length}`)
    console.log(`  - Product Series: ${series.length}`)
    console.log(`  - Reusable Blocks: ${blocks.length}`)
    console.log(`  - Total: ${categories.length + series.length + blocks.length}`)

  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    await context.prisma.$disconnect()
  }
}

// Run migration
updateStatusValues()
  .then(() => {
    console.log('\n✨ Migration finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
