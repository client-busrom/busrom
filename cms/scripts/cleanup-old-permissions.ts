#!/usr/bin/env tsx

/**
 * Cleanup Old Permissions Script
 * 
 * This script removes old permissions for HomeContent and ReusableBlockVersion
 * and removes them from any roles that reference them.
 */

import { getContext } from '@keystone-6/core/context'
import config from '../keystone'
import * as PrismaModule from '../node_modules/.prisma/client'

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 Cleaning up old permissions')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const context = getContext(config, PrismaModule).sudo()
  
  try {
    // Find permissions with old resources
    const oldPermissions = await context.query.Permission.findMany({
      where: {
        OR: [
          { resource: { equals: 'HomeContent' } },
          { resource: { equals: 'ReusableBlockVersion' } },
        ],
      },
      query: 'id identifier resource action roles { id name }',
    })

    console.log(`Found ${oldPermissions.length} old permissions:\n`)
    
    for (const perm of oldPermissions) {
      console.log(`  - ${perm.identifier} (${perm.resource}:${perm.action})`)
      if (perm.roles && perm.roles.length > 0) {
        console.log(`    Used by roles: ${perm.roles.map((r: any) => r.name).join(', ')}`)
      }
    }

    if (oldPermissions.length === 0) {
      console.log('✅ No old permissions found!')
      return
    }

    console.log('\n🔓 Unmarking as system permissions...\n')

    // First, unmark as system permissions
    for (const perm of oldPermissions) {
      try {
        await context.query.Permission.updateOne({
          where: { id: perm.id },
          data: { isSystem: false },
        })
        console.log(`  ✓ Unmarked: ${perm.identifier}`)
      } catch (error: any) {
        console.error(`  ✗ Failed to unmark ${perm.identifier}:`, error.message)
      }
    }

    console.log('\n🗑️  Deleting old permissions...\n')

    // Now delete each permission
    for (const perm of oldPermissions) {
      try {
        await context.query.Permission.deleteOne({
          where: { id: perm.id },
        })
        console.log(`  ✓ Deleted: ${perm.identifier}`)
      } catch (error: any) {
        console.error(`  ✗ Failed to delete ${perm.identifier}:`, error.message)
      }
    }

    console.log('\n✅ Cleanup completed!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

main()
