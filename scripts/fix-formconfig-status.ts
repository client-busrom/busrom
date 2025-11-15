import { PrismaClient } from '../cms/node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.formConfig.updateMany({
    where: {
      status: 'ACTIVE' as any
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    }
  })

  console.log(`✅ Updated ${result.count} FormConfig records to PUBLISHED status`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
