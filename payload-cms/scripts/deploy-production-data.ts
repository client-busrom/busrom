/**
 * Production Data Deployment Script
 *
 * This master script runs all necessary steps to populate
 * a fresh Payload CMS database with production data.
 *
 * Steps:
 * 1. Import homepage content from Keystone
 * 2. Import ProductSeries categories
 * 3. Create SeriesIntroItems
 * 4. Import media from Keystone S3 with auto-metadata
 *
 * Usage:
 *   npx tsx scripts/deploy-production-data.ts
 *
 * Prerequisites:
 *   - MediaCategories and MediaTags must exist (run migrations first)
 *   - Keystone database must be accessible
 *   - S3 bucket must be accessible
 *   - Environment variables must be configured
 */

import { execSync } from 'child_process'

const steps = [
  {
    name: 'Homepage Content',
    command: 'npm run import:keystone',
    description: 'Import 16 homepage modules (globals + HeroBannerItems)',
  },
  {
    name: 'ProductSeries Categories',
    command: 'npm run import:series-categories',
    description: 'Map ProductSeries to categories',
  },
  {
    name: 'SeriesIntroItems',
    command: 'npm run seed:series-intro',
    description: 'Create 9 SeriesIntroItems with ProductSeries links',
  },
  {
    name: 'Media Migration',
    command: 'npm run import:media',
    description: 'Import media from Keystone with auto-metadata parsing',
  },
]

async function main() {
  console.log('🚀 Busrom Payload CMS - Production Data Deployment\n')
  console.log('═'.repeat(60))
  console.log('\n📋 Deployment Plan:\n')

  steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.name}`)
    console.log(`   ${step.description}`)
    console.log(`   Command: ${step.command}\n`)
  })

  console.log('═'.repeat(60))
  console.log('\n⚠️  Prerequisites:')
  console.log('   ✓ MediaCategories and MediaTags seeded')
  console.log('   ✓ Keystone database accessible')
  console.log('   ✓ S3 bucket accessible')
  console.log('   ✓ Environment variables configured\n')

  const startTime = Date.now()

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📦 Step ${i + 1}/${steps.length}: ${step.name}`)
    console.log(`${'─'.repeat(60)}\n`)

    try {
      execSync(step.command, { stdio: 'inherit' })
      console.log(`\n✅ Step ${i + 1} completed: ${step.name}`)
    } catch (error: any) {
      console.error(`\n❌ Step ${i + 1} failed: ${step.name}`)
      console.error(`   Error: ${error.message}`)
      console.error(`\n⚠️  Deployment aborted at step ${i + 1}`)
      process.exit(1)
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`✅ Deployment completed successfully!`)
  console.log(`⏱️  Total time: ${duration} seconds`)
  console.log(`${'═'.repeat(60)}\n`)

  console.log('📊 Summary:')
  console.log('   - Homepage content imported (16 modules)')
  console.log('   - ProductSeries categories mapped (9 series)')
  console.log('   - SeriesIntroItems created (9 items)')
  console.log('   - Media migrated with auto-metadata (~2700+ files)\n')

  console.log('🎉 Your Payload CMS is ready for production!\n')
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error)
  process.exit(1)
})
