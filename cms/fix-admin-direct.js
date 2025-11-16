#!/usr/bin/env node
/**
 * Direct fix script using explicit Prisma client path
 */

// Use explicit path to avoid module resolution issues
const { PrismaClient } = require('./node_modules/.prisma/client')
const prisma = new PrismaClient()

const email = process.argv[2] || 'ljasperp@gmail.com'

async function main() {
  console.log(`Fixing user: ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isAdmin: true, status: true }
  })

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    process.exit(1)
  }

  console.log('Before:', user)

  const updated = await prisma.user.update({
    where: { email },
    data: { isAdmin: true, status: 'ACTIVE' }
  })

  console.log('After:', updated)
  console.log('✅ User successfully set as admin!')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
