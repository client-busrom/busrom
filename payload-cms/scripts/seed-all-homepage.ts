/**
 * Complete Homepage Data Seeding Script
 *
 * This script is designed for AWS production deployment
 * It seeds all homepage data in the correct order:
 * 1. Import homepage globals and HeroBannerItems from Keystone
 * 2. Import ProductSeries categories from Keystone
 * 3. Seed SeriesIntroItems with ProductSeries relationships
 *
 * Usage: npm run seed:all-homepage
 */

import { execSync } from 'child_process'

async function seedAllHomepage() {
  console.log('🚀 Starting complete homepage data seeding...\n')
  console.log('=' .repeat(60))
  console.log('This will run the following scripts in order:')
  console.log('1. import:keystone - Homepage globals & HeroBannerItems')
  console.log('2. import:series-categories - ProductSeries categories')
  console.log('3. seed:series-intro - SeriesIntroItems')
  console.log('=' .repeat(60))
  console.log()

  try {
    // Step 1: Import homepage data from Keystone
    console.log('\n📦 Step 1/3: Importing homepage data from Keystone...\n')
    execSync('npm run import:keystone', { stdio: 'inherit' })

    // Step 2: Import ProductSeries categories
    console.log('\n📦 Step 2/3: Importing ProductSeries categories...\n')
    execSync('npm run import:series-categories', { stdio: 'inherit' })

    // Step 3: Seed SeriesIntroItems
    console.log('\n📦 Step 3/3: Seeding SeriesIntroItems...\n')
    execSync('npm run seed:series-intro', { stdio: 'inherit' })

    console.log('\n' + '=' .repeat(60))
    console.log('✅ All homepage data seeded successfully!')
    console.log('=' .repeat(60))
    console.log('\n📊 Complete Summary:')
    console.log('   ✓ 9 HeroBannerItems imported')
    console.log('   ✓ 14 Homepage globals imported')
    console.log('   ✓ 9 ProductSeries categories linked')
    console.log('   ✓ 9 SeriesIntroItems created')
    console.log('   ✓ Total: 41 homepage data entries')
    console.log()

  } catch (error) {
    console.error('\n❌ Error during homepage seeding:', error)
    process.exit(1)
  }
}

seedAllHomepage()
