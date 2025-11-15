/**
 * Restore Navigation from Backup
 *
 * This script restores navigation data from a backup JSON file
 *
 * Usage:
 *   npx tsx scripts/restore-navigation-backup.ts backups/navigation-backup-2025-01-05.json
 */

import { PrismaClient } from '../node_modules/.prisma/client/index.js'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function restoreFromBackup(backupFilePath: string) {
  console.log('🔄 Restoring navigation from backup...\n')

  try {
    // Step 1: Read backup file
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }

    console.log(`📦 Reading backup: ${backupFilePath}`)
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'))
    console.log(`   ✓ Found ${backupData.length} navigation menus in backup\n`)

    // Step 2: Delete all current navigation menus
    console.log('🗑️  Deleting current navigation menus...')
    const deleteResult = await prisma.navigationMenu.deleteMany({})
    console.log(`   ✓ Deleted ${deleteResult.count} menus\n`)

    // Step 3: Restore menus
    // First restore top-level menus (no parent)
    console.log('📥 Restoring top-level menus...')
    const topLevelMenus = backupData.filter((menu: any) => !menu.parentId)
    const idMapping = new Map<string, string>() // old ID -> new ID

    for (const menu of topLevelMenus) {
      const { id, parentId, children, mediaTags, parent, ...menuData } = menu

      const created = await prisma.navigationMenu.create({
        data: {
          ...menuData,
          mediaTags: menu.mediaTags?.length
            ? {
                connect: menu.mediaTags.map((tag: any) => ({ id: tag.id })),
              }
            : undefined,
        },
      })

      idMapping.set(id, created.id)
      console.log(`   ✓ ${menu.slug}`)
    }

    // Then restore child menus
    console.log('\n📥 Restoring child menus...')
    const childMenus = backupData.filter((menu: any) => menu.parentId)

    for (const menu of childMenus) {
      const { id, parentId, children, mediaTags, parent, ...menuData } = menu

      const newParentId = idMapping.get(parentId)
      if (!newParentId) {
        console.warn(`   ⚠️  Parent not found for ${menu.slug}, skipping...`)
        continue
      }

      const created = await prisma.navigationMenu.create({
        data: {
          ...menuData,
          parent: { connect: { id: newParentId } },
          mediaTags: menu.mediaTags?.length
            ? {
                connect: menu.mediaTags.map((tag: any) => ({ id: tag.id })),
              }
            : undefined,
        },
      })

      idMapping.set(id, created.id)
      console.log(`   ✓ ${menu.slug}`)
    }

    console.log('\n✅ Navigation restored from backup successfully!')
    console.log('📌 No need to restart CMS - changes are live immediately!\n')

  } catch (error) {
    console.error('\n❌ Error restoring navigation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get backup file path from command line argument
const backupFilePath = process.argv[2]

if (!backupFilePath) {
  console.error('❌ Please provide a backup file path')
  console.error('\nUsage:')
  console.error('  npx tsx scripts/restore-navigation-backup.ts backups/navigation-backup-YYYY-MM-DD.json')
  console.error('\nAvailable backups:')

  const backupDir = path.join(process.cwd(), 'backups')
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter((f) => f.startsWith('navigation-backup-'))
    if (files.length > 0) {
      files.forEach((file) => console.error(`  - backups/${file}`))
    } else {
      console.error('  (no backups found)')
    }
  } else {
    console.error('  (no backups directory found)')
  }

  process.exit(1)
}

restoreFromBackup(backupFilePath)
