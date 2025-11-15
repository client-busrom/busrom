/**
 * Manually Re-seed Navigation Menu
 *
 * Usage:
 *   npx tsx scripts/reseed-navigation.ts
 *
 * This script will:
 * 1. Delete all existing navigation menus (including system menus)
 * 2. Re-create all navigation menus from seed data
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '.prisma/client'
import { seedNavigationSystem } from '../migrations/seed-navigation-system'

async function main() {
  console.log('🔄 Starting navigation menu re-seed...\n')

  // Get Keystone context
  const context = getContext(config, PrismaModule)

  try {
    // Step 1: Delete all existing navigation menus (using sudo to bypass access control)
    console.log('🗑️  Deleting existing navigation menus...')
    const existingMenus = await context.sudo().query.NavigationMenu.findMany({
      query: 'id slug',
    })

    console.log(`   Found ${existingMenus.length} existing menus`)

    for (const menu of existingMenus) {
      await context.sudo().query.NavigationMenu.deleteOne({
        where: { id: menu.id },
      })
      console.log(`   ✓ Deleted: ${menu.slug}`)
    }

    console.log(`   ✅ Deleted ${existingMenus.length} menus\n`)

    // Step 2: Run the navigation seed
    console.log('🌱 Seeding navigation menus...\n')
    await seedNavigationSystem(context.sudo())

    console.log('\n✅ Navigation menu re-seed completed successfully!')
  } catch (error) {
    console.error('\n❌ Error during re-seed:', error)
    process.exit(1)
  } finally {
    // Disconnect from database
    await context.prisma.$disconnect()
  }
}

main()
