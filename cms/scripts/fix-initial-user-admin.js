#!/usr/bin/env node
/**
 * Fix Initial User Admin Status
 *
 * This script fixes the isAdmin and status fields for users created via the init page.
 * The createInitialUser mutation should set these automatically based on auth.ts config,
 * but this script ensures the first user is properly configured as an admin.
 *
 * Usage:
 *   npm run fix-initial-user
 *   # or directly:
 *   node scripts/fix-initial-user-admin.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for users without admin status...\n')

  // Find all users that should be admin but aren't
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      status: true,
      createdAt: true
    }
  })

  if (users.length === 0) {
    console.log('No users found in database.')
    return
  }

  console.log(`Found ${users.length} user(s):\n`)
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    console.log(`   isAdmin: ${user.isAdmin}, status: ${user.status}`)
    console.log(`   createdAt: ${user.createdAt}\n`)
  })

  // Fix the first user if they're not admin
  const firstUser = users[0]

  if (!firstUser.isAdmin || firstUser.status !== 'ACTIVE') {
    console.log(`Updating first user ${firstUser.email} to be admin and active...`)

    const updated = await prisma.user.update({
      where: { id: firstUser.id },
      data: {
        isAdmin: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        status: true
      }
    })

    console.log('\n✅ User updated successfully:')
    console.log(`   Name: ${updated.name}`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   isAdmin: ${updated.isAdmin}`)
    console.log(`   status: ${updated.status}`)
  } else {
    console.log('✅ First user is already admin and active. No changes needed.')
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
