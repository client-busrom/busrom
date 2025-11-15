#!/usr/bin/env tsx

/**
 * Script to update permission categories
 * Run: npx tsx scripts/update-permission-categories.ts
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import { updatePermissionCategories } from '../migrations/update-permission-categories'
import * as PrismaModule from '../node_modules/.prisma/client'

async function main() {
  console.log('Connecting to database...')
  
  const context = getContext(config, PrismaModule)
  
  await updatePermissionCategories(context)
  
  console.log('✅ Migration completed!')
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
