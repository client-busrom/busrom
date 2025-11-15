/**
 * Reset Navigation to Initial State
 *
 * This script:
 * 1. Deletes all existing navigation menus
 * 2. Re-runs the seed script to create initial data
 *
 * Usage:
 *   npx tsx scripts/reset-navigation-to-initial.ts
 */

import { PrismaClient } from '../node_modules/.prisma/client/index.js'
import { seedNavigationSystem } from '../migrations/seed-navigation-system.js'

const prisma = new PrismaClient()

async function resetNavigationToInitial() {
  console.log('🔄 Resetting navigation to initial state...\n')

  try {
    // Step 1: Delete all navigation menus
    console.log('🗑️  Deleting all existing navigation menus...')
    const deleteResult = await prisma.navigationMenu.deleteMany({})
    console.log(`   ✓ Deleted ${deleteResult.count} navigation menus\n`)

    // Step 2: Re-run seed script
    console.log('🌱 Re-creating initial navigation data...')

    // Create a minimal context object for the seed function
    const context = {
      query: {
        NavigationMenu: {
          count: async () => {
            return await prisma.navigationMenu.count()
          },
          createOne: async ({ data, query }: any) => {
            const result = await prisma.navigationMenu.create({ data })
            return result
          },
        },
        MediaTag: {
          findMany: async ({ where, query, orderBy }: any) => {
            return await prisma.mediaTag.findMany({
              where,
              orderBy,
            })
          },
        },
      },
    } as any

    await seedNavigationSystem(context)

    console.log('\n✅ Navigation reset to initial state successfully!')
    console.log('\n📌 Please refresh your CMS to see the changes.')

  } catch (error) {
    console.error('\n❌ Error resetting navigation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetNavigationToInitial()
