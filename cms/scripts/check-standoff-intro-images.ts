/**
 * Check Glass Standoff Intro Images
 *
 * 检查 Glass Standoff SeriesIntro 的图片
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查 Glass Standoff SeriesIntro 图片...\n')

  const standoffIntro = await prisma.seriesIntro.findFirst({
    where: {
      productSeries: {
        slug: 'glass-standoff'
      }
    },
    select: {
      id: true,
      internalLabel: true,
      images: true,
    }
  })

  if (!standoffIntro) {
    console.log('❌ 未找到 Glass Standoff SeriesIntro')
    return
  }

  console.log(`📝 ${standoffIntro.internalLabel}`)
  console.log(`   ID: ${standoffIntro.id}\n`)

  const imagesData = standoffIntro.images as any
  if (!imagesData?.images || imagesData.images.length === 0) {
    console.log('❌ 没有图片数据')
    return
  }

  console.log(`📊 图片数量: ${imagesData.images.length}\n`)

  // 检查每张图片的详情
  for (let i = 0; i < imagesData.images.length; i++) {
    const mediaId = imagesData.images[i]

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        fileKey: true,
        variants: true,
      }
    })

    if (!media) {
      console.log(`${i + 1}. ❌ Media not found: ${mediaId}`)
      continue
    }

    console.log(`${i + 1}. ${media.filename}`)
    console.log(`   ID: ${media.id}`)
    console.log(`   fileUrl: ${media.fileUrl || 'NULL'}`)
    console.log(`   fileKey: ${media.fileKey || 'NULL'}`)

    const variants = media.variants as any
    if (variants && Object.keys(variants).length > 0) {
      console.log(`   variants: ✓ (${Object.keys(variants).length} variants)`)
      console.log(`     - thumbnail: ${variants.thumbnail ? '✓' : '✗'}`)
    } else {
      console.log(`   variants: ✗ (empty)`)
    }
    console.log()
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
