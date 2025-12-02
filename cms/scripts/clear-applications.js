/**
 * Clear all Application and ApplicationContentTranslation records
 */

const { PrismaClient } = require('../node_modules/.prisma/client')

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log('🗑️  Clearing Applications and translations...')

    // Delete all ApplicationContentTranslations first (due to foreign key)
    const deletedTranslations = await prisma.applicationContentTranslation.deleteMany({})
    console.log(`  ✅ Deleted ${deletedTranslations.count} ApplicationContentTranslations`)

    // Delete all Applications
    const deletedApplications = await prisma.application.deleteMany({})
    console.log(`  ✅ Deleted ${deletedApplications.count} Applications`)

    console.log('✅ Clear complete!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
