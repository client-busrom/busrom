/**
 * Script to seed homepage data
 *
 * Usage:
 *   pnpm tsx scripts/seed-homepage.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import { seedHomepageData } from '../src/seed/seed-homepage-data'

async function main() {
  console.log('🚀 Starting homepage data seeding...\n')

  const payload = await getPayload({ config })

  try {
    await seedHomepageData(payload)
    console.log('\n✅ All done!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
