/**
 * Cleanup Wrong Scene Image Imports
 *
 * 清理错误导入的场景图记录（这些记录指向AWS S3，但本地MinIO没有文件）
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 清理错误导入的场景图记录...\n')

  // 这些是刚才错误导入的文件名模式
  const patterns = [
    '01-standoff-square-',
    '01-standoff-group01-',
    '01-standoff-group02-',
  ]

  let totalDeleted = 0

  for (const pattern of patterns) {
    const deleted = await prisma.media.deleteMany({
      where: {
        filename: { contains: pattern }
      }
    })

    console.log(`删除 ${pattern}* : ${deleted.count} 条`)
    totalDeleted += deleted.count
  }

  console.log(`\n✅ 总共删除: ${totalDeleted} 条记录`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
