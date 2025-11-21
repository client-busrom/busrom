#!/usr/bin/env node
/**
 * Fix failed migration records in _prisma_migrations table
 * This script marks failed migrations as completed if the schema changes were already applied
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFailedMigration() {
  try {
    console.log('🔍 Checking for failed migrations...')

    // Update failed migration to mark as completed
    const result = await prisma.$executeRaw`
      UPDATE "_prisma_migrations"
      SET "finished_at" = NOW(),
          "logs" = NULL,
          "rolled_back_at" = NULL
      WHERE "migration_name" = '20251121220000_add_footer_navigation_menus'
        AND "finished_at" IS NULL;
    `

    if (result > 0) {
      console.log(`✅ Fixed ${result} failed migration record(s)`)
    } else {
      console.log('✅ No failed migrations found')
    }

  } catch (error) {
    console.error('❌ Error fixing migration:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixFailedMigration()
