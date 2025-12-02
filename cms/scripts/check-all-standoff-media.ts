/**
 * Check All Glass Standoff Media
 *
 * 检查广告螺丝系列所有媒体
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查广告螺丝系列所有媒体...\n')

  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  if (!standoffTag) {
    console.log('❌ 未找到标签')
    return
  }

  // Get all Glass Standoff media
  const media = await prisma.media.findMany({
    where: {
      tags: { some: { id: standoffTag.id } }
    },
    select: {
      id: true,
      filename: true,
      fileKey: true
    },
    orderBy: { filename: 'asc' }
  })

  console.log('📊 广告螺丝系列所有媒体 (总数:', media.length, ')\n')

  // Group by path pattern
  const sceneImages = media.filter(m => m.filename.includes('scene'))
  const productImages = media.filter(m => m.filename.includes('product') || m.filename.includes('white'))
  const dimensionImages = media.filter(m => m.filename.includes('dimension') || m.filename.includes('size'))
  const detailImages = media.filter(m => m.filename.includes('detail'))
  const otherImages = media.filter(m =>
    !m.filename.includes('scene') &&
    !m.filename.includes('product') &&
    !m.filename.includes('white') &&
    !m.filename.includes('dimension') &&
    !m.filename.includes('size') &&
    !m.filename.includes('detail')
  )

  console.log('📸 场景图 (scene):', sceneImages.length, '张')
  sceneImages.slice(0, 15).forEach(m => console.log('   -', m.filename))
  if (sceneImages.length > 15) console.log('   ... 还有', sceneImages.length - 15, '张')

  console.log('\n📦 产品图 (product/white):', productImages.length, '张')
  productImages.slice(0, 5).forEach(m => console.log('   -', m.filename))
  if (productImages.length > 5) console.log('   ... 还有', productImages.length - 5, '张')

  console.log('\n📏 尺寸图 (dimension/size):', dimensionImages.length, '张')
  console.log('🔍 细节图 (detail):', detailImages.length, '张')
  console.log('❓ 其他:', otherImages.length, '张')

  if (otherImages.length > 0) {
    console.log('\n其他文件:')
    otherImages.slice(0, 10).forEach(m => console.log('   -', m.filename))
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
