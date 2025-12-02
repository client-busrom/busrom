/**
 * Verify Variants Generated
 *
 * 验证变体是否已生成
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 验证新导入图片的变体...\n')

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
      variants: true,
      width: true,
      height: true
    },
    take: 5
  })

  console.log(`📋 抽样检查 ${newMedia.length} 张图片:\n`)

  for (const media of newMedia) {
    console.log(`📸 ${media.filename}`)
    console.log(`   fileKey: ${media.fileKey}`)
    console.log(`   尺寸: ${media.width}x${media.height}`)

    const variants = media.variants as any
    if (variants && Object.keys(variants).length > 0) {
      console.log(`   ✅ variants: ${Object.keys(variants).length} 个`)
      console.log(`      - thumbnail: ${variants.thumbnail ? '✓' : '✗'}`)
      console.log(`      - small: ${variants.small ? '✓' : '✗'}`)
      console.log(`      - medium: ${variants.medium ? '✓' : '✗'}`)
      console.log(`      - large: ${variants.large ? '✓' : '✗'}`)
      console.log(`      - original: ${variants.original ? '✓' : '✗'}`)
    } else {
      console.log(`   ❌ variants: 空`)
    }
    console.log()
  }

  // 统计总数
  const totalCount = await prisma.media.count({
    where: {
      OR: [
        { filename: { startsWith: '01-standoff-square-' } },
        { filename: { startsWith: '01-standoff-group01-' } },
        { filename: { startsWith: '01-standoff-group02-' } },
      ]
    }
  })

  const withVariants = await prisma.media.count({
    where: {
      AND: [
        {
          OR: [
            { filename: { startsWith: '01-standoff-square-' } },
            { filename: { startsWith: '01-standoff-group01-' } },
            { filename: { startsWith: '01-standoff-group02-' } },
          ]
        },
        { variants: { not: {} } }
      ]
    }
  })

  console.log('📊 统计:')
  console.log(`   总图片数: ${totalCount}`)
  console.log(`   有变体的: ${withVariants}`)
  console.log(`   无变体的: ${totalCount - withVariants}`)

  if (totalCount === withVariants) {
    console.log('\n🎉 所有图片都已生成变体！')
  } else {
    console.log(`\n⚠️  还有 ${totalCount - withVariants} 张图片没有变体`)
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
