/**
 * Sync tags to tagsFilter
 *
 * 将 tags 同步到 tagsFilter
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 同步 tags 到 tagsFilter...\n')

  // 获取所有新导入的场景图（有 tags 但没有 tagsFilter）
  const mediaToUpdate = await prisma.media.findMany({
    where: {
      OR: [
        { filename: { startsWith: '01-standoff-square-' } },
        { filename: { startsWith: '01-standoff-group01-' } },
        { filename: { startsWith: '01-standoff-group02-' } },
      ]
    },
    select: {
      id: true,
      filename: true,
      tags: { select: { id: true } },
      tagsFilter: { select: { id: true } }
    }
  })

  console.log(`📊 找到 ${mediaToUpdate.length} 张图片需要同步\n`)

  let updated = 0
  for (const media of mediaToUpdate) {
    // 如果 tagsFilter 为空，将 tags 复制到 tagsFilter
    if (media.tagsFilter.length === 0 && media.tags.length > 0) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          tagsFilter: {
            connect: media.tags.map(tag => ({ id: tag.id }))
          }
        }
      })
      console.log(`✅ ${media.filename} - 同步了 ${media.tags.length} 个标签`)
      updated++
    } else if (media.tagsFilter.length > 0) {
      console.log(`⏭️  ${media.filename} - 已有 tagsFilter`)
    }
  }

  console.log(`\n📊 同步统计:`)
  console.log(`   更新: ${updated} 张`)
  console.log(`   跳过: ${mediaToUpdate.length - updated} 张`)
  console.log(`   总计: ${mediaToUpdate.length} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
