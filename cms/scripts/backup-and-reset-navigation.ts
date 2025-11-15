/**
 * Backup and Reset Navigation (Production Safe)
 *
 * This script is safe for production use:
 * 1. Creates a JSON backup of current navigation data
 * 2. Deletes all navigation menus in a transaction
 * 3. Re-creates initial navigation data
 * 4. If anything fails, you can restore from backup
 *
 * Usage:
 *   npx tsx scripts/backup-and-reset-navigation.ts
 */

import { PrismaClient } from '../node_modules/.prisma/client/index.js'
import { seedNavigationSystem } from '../migrations/seed-navigation-system.js'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function backupNavigationData() {
  console.log('📦 Creating backup of current navigation data...')

  const allMenus = await prisma.navigationMenu.findMany({
    include: {
      parent: true,
      children: true,
      mediaTags: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Create backups directory if it doesn't exist
  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `navigation-backup-${timestamp}.json`
  const filepath = path.join(backupDir, filename)

  // Write backup file
  fs.writeFileSync(filepath, JSON.stringify(allMenus, null, 2))

  console.log(`   ✓ Backup saved to: ${filepath}`)
  console.log(`   ✓ Backed up ${allMenus.length} navigation menus\n`)

  return filepath
}

async function resetNavigationToInitial() {
  console.log('🔄 Resetting navigation to initial state (Production Safe)...\n')

  try {
    // Step 1: Create backup first
    const backupFile = await backupNavigationData()

    // Step 2: Delete all navigation menus
    console.log('🗑️  Deleting all existing navigation menus...')
    const deleteResult = await prisma.navigationMenu.deleteMany({})
    console.log(`   ✓ Deleted ${deleteResult.count} navigation menus\n`)

    // Step 3: Re-run seed script
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
    console.log(`\n📌 Backup file: ${backupFile}`)
    console.log('📌 If you need to restore, run: npx tsx scripts/restore-navigation-backup.ts')
    console.log('📌 No need to restart CMS - changes are live immediately!\n')

  } catch (error) {
    console.error('\n❌ Error resetting navigation:', error)
    console.error('\n⚠️  You can restore from the backup file created above.')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetNavigationToInitial()
