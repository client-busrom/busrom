/**
 * Populate fileUrl from variants or fileKey
 *
 * 从 variants 或 fileKey 填充 fileUrl
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

// MinIO URL
const minioUrl = 'http://localhost:9000/busrom-media'

async function main() {
  console.log('🔄 填充 fileUrl 字段...\n')

  // 查找所有 fileUrl 为 null 但有 fileKey 或 variants 的 Media
  const mediaToUpdate = await prisma.media.findMany({
    where: {
      fileUrl: null,
      OR: [
        { fileKey: { not: null } },
        { variants: { not: {} } }
      ]
    },
    select: {
      id: true,
      filename: true,
      fileKey: true,
      variants: true,
    }
  })

  console.log(`📊 找到 ${mediaToUpdate.length} 张图片需要更新 fileUrl\n`)

  let updated = 0

  for (const media of mediaToUpdate) {
    let fileUrl: string | null = null

    // 优先从 variants.original 获取
    const variants = media.variants as any
    if (variants?.original) {
      fileUrl = variants.original
    }
    // 如果没有 variants.original，从 fileKey 生成
    else if (media.fileKey) {
      fileUrl = `${minioUrl}/${media.fileKey}`
    }

    if (fileUrl) {
      await prisma.media.update({
        where: { id: media.id },
        data: { fileUrl }
      })

      console.log(`✅ ${media.filename}`)
      console.log(`   fileUrl: ${fileUrl}`)
      updated++
    } else {
      console.log(`⏭️  ${media.filename} - 无法生成 fileUrl`)
    }
  }

  console.log(`\n📊 更新统计:`)
  console.log(`   更新: ${updated} 张`)
  console.log(`   跳过: ${mediaToUpdate.length - updated} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
