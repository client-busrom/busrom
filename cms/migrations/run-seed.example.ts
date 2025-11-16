/**
 * Media System Seed Runner
 *
 * 媒体系统种子数据运行器
 *
 * Usage:
 * 1. Copy this file to `cms/run-seed.ts` (outside migrations folder)
 * 2. Run: npx tsx cms/run-seed.ts
 * 3. Delete the file after successful execution
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import { seedMediaSystem } from './migrations/seed-media-system'

async function main() {
  console.log('🌱 Running Media System Seed...\n')

  try {
    // Get Keystone context
    const context = getContext(config, await config.db.prisma())

    // Check if data already exists
    const categoryCount = await context.query.MediaCategory.count()
    const tagCount = await context.query.MediaTag.count()

    console.log(`📊 Current Data:`)
    console.log(`   - MediaCategory: ${categoryCount} items`)
    console.log(`   - MediaTag: ${tagCount} items\n`)

    if (categoryCount > 0 || tagCount > 0) {
      console.log('⚠️  Warning: Data already exists!')
      console.log('   To re-seed, delete existing data first.\n')
      process.exit(0)
    }

    // Run seed
    await seedMediaSystem(context)

    // Verify seeded data
    const newCategoryCount = await context.query.MediaCategory.count()
    const newTagCount = await context.query.MediaTag.count()

    console.log(`\n📊 Final Data:`)
    console.log(`   - MediaCategory: ${newCategoryCount} items`)
    console.log(`   - MediaTag: ${newTagCount} items\n`)

    console.log('✅ Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
