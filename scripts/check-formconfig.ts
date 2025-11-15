import { PrismaClient } from '../cms/node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  const formConfigs = await prisma.formConfig.findMany({
    take: 1,
  })

  if (formConfigs.length > 0) {
    console.log('✅ Found FormConfig:')
    console.log(JSON.stringify(formConfigs[0], null, 2))
  } else {
    console.log('❌ No FormConfig found')
  }
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
