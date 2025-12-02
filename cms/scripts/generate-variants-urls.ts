/**
 * Generate Variants URLs for New Images
 *
 * 为新图片生成变体URL
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

// MinIO URL
const minioUrl = 'http://localhost:9000/busrom-media'

async function main() {
  console.log('🖼️  为新导入的图片生成变体URL...\n')

  const newMedia = await prisma.media.findMany({
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
      fileKey: true,
      variants: true
    }
  })

  console.log(`📊 找到 ${newMedia.length} 张图片\n`)

  let updated = 0

  for (const media of newMedia) {
    if (!media.fileKey) {
      console.log(`⏭️  ${media.filename} - 没有 fileKey`)
      continue
    }

    // 检查是否已有 variants
    const variants = media.variants as any
    if (variants && Object.keys(variants).length > 0) {
      console.log(`⏭️  ${media.filename} - 已有 variants`)
      continue
    }

    // 使用默认尺寸
    // square 图片是正方形，其他是长方形
    let width: number
    let height: number

    if (media.filename.includes('square')) {
      width = 1024
      height = 1024
    } else {
      width = 1024
      height = 684
    }

    // 生成简单的变体URL（都指向同一个文件）
    const fileUrl = `${minioUrl}/${media.fileKey}`
    const variantsData = {
      original: fileUrl,
      large: fileUrl,
      medium: fileUrl,
      small: fileUrl,
      thumbnail: fileUrl,
    }

    // 更新数据库
    await prisma.media.update({
      where: { id: media.id },
      data: {
        variants: variantsData,
        width,
        height
      }
    })

    console.log(`✅ ${media.filename}`)
    console.log(`   尺寸: ${width}x${height}`)
    console.log(`   variants: ${Object.keys(variantsData).length} 个`)
    updated++
  }

  console.log(`\n📊 更新统计:`)
  console.log(`   更新: ${updated} 张`)
  console.log(`   总计: ${newMedia.length} 张`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
