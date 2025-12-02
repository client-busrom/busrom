#!/usr/bin/env node

const { PrismaClient } = require('../cms/node_modules/.prisma/client')

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL
    }
  }
})

async function clearMediaOnly() {
  console.log('⚠️  警告: 即将清空 Media 表!')
  console.log('✅ MediaCategory 和 MediaTag 将保留\n')
  console.log('按 Ctrl+C 取消, 或等待 5 秒自动继续...\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('🗑️  开始清空...\n')

  // 1. 删除关联关系
  await prisma.$executeRaw`DELETE FROM "_Media_tags"`
  console.log('✅ 已清空 Media-Tags 关联')

  // 2. 删除 Media 记录
  const result = await prisma.media.deleteMany({})
  console.log(`✅ 已删除 ${result.count} 条 Media 记录`)

  // 3. 验证 MediaCategory 和 MediaTag 未受影响
  const categoryCount = await prisma.mediaCategory.count()
  const tagCount = await prisma.mediaTag.count()

  console.log(`\n✅ MediaCategory: ${categoryCount} 条（保留）`)
  console.log(`✅ MediaTag: ${tagCount} 条（保留）`)

  console.log('\n✨ 清空完成!')

  await prisma.$disconnect()
}

clearMediaOnly().catch(console.error)
