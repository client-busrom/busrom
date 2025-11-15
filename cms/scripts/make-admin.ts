/**
 * Make User Super Admin Script
 *
 * This script promotes an existing user to super admin by setting isAdmin=true
 *
 * Usage:
 *   npx tsx scripts/make-admin.ts admin@busrom.com
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  console.log(`\n🔍 Looking for user: ${email}`)

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        status: true,
      },
    })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      console.log('\n💡 Available users:')
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true },
      })
      allUsers.forEach((u) => console.log(`   - ${u.email} (${u.name})`))
      process.exit(1)
    }

    console.log(`✓ Found user: ${user.name} (${user.email})`)

    // Check if already admin
    if (user.isAdmin) {
      console.log(`✓ User is already a super admin!`)
      process.exit(0)
    }

    // Update user to super admin
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isAdmin: true,
        status: 'ACTIVE',
      },
    })

    console.log(`✅ Successfully promoted ${user.email} to super admin!`)
    console.log(`\n🎉 User now has full system access\n`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('\nUsage:')
  console.log('  npx tsx scripts/make-admin.ts admin@busrom.com')
  process.exit(1)
}

makeAdmin(email)
