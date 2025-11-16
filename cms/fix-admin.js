const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  // Get the most recent user
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, isAdmin: true, status: true }
  })

  console.log('Current user:', JSON.stringify(user, null, 2))

  if (!user.isAdmin || user.status !== 'ACTIVE') {
    console.log('Updating user to be admin and active...')
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isAdmin: true,
        status: 'ACTIVE'
      }
    })
    console.log('Updated user:', JSON.stringify(updated, null, 2))
  } else {
    console.log('User is already admin and active')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
