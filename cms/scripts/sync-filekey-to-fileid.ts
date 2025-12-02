/**
 * Sync fileKey to file_id
 *
 * 将 fileKey 同步到 file_id
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 同步 fileKey 到 file_id...\n')

  const newMedia = await prisma.media.findMany({
    where: {
      AND: [
        { file_id: null },
        { fileKey: { not: null } }
      ]
    },
    select: {
      id: true,
      filename: true,
      fileKey: true
    }
  })

  console.log(`📊 找到 ${newMedia.length} 张图片需要同步\n`)

  let updated = 0

  for (const media of newMedia) {
    if (!media.fileKey) continue

    // 从 fileKey 中提取文件ID（去掉扩展名）
    const fileId = media.fileKey.replace(/\.[^.]+$/, '')

    await prisma.media.update({
      where: { id: media.id },
      data: { file_id: fileId }
    })

    console.log(`✅ ${media.filename}`)
    console.log(`   fileKey: ${media.fileKey}`)
    console.log(`   file_id: ${fileId}`)
    updated++
  }

  console.log(`\n📊 同步统计:`)
  console.log(`   更新: ${updated} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
