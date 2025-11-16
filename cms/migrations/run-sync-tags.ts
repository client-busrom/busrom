/**
 * Runner script to sync tags to tagsFilter
 *
 * Usage: npx tsx migrations/run-sync-tags.ts
 */

import { syncTagsToFilter } from './sync-tags-to-filter'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function main() {
  console.log('🚀 Starting synchronization...')

  await syncTagsToFilter()

  console.log('✅ Done!')
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
