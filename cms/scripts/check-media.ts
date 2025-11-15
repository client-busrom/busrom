/**
 * Check Media Record Script
 *
 * 检查指定的 Media 记录，对比批量上传和单个上传的差异
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 查询指定的图片 (使用 Keystone 上传的)
  console.log('🔍 查询使用 Keystone 上传的图片:')
  const keystoneMedia = await prisma.media.findUnique({
    where: { id: 'c2d4a92c-d478-4519-8b45-2412cff881b4' },
  })
  console.log(JSON.stringify(keystoneMedia, null, 2))

  console.log('\n' + '='.repeat(80) + '\n')

  // 查询最近的几条记录 (可能是批量上传的)
  console.log('🔍 查询最近上传的图片 (可能是批量上传的):')
  const recentMedia = await prisma.media.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    where: {
      id: { not: 'c2d4a92c-d478-4519-8b45-2412cff881b4' },
    },
  })

  recentMedia.forEach((media, index) => {
    console.log(`\n--- 图片 ${index + 1} ---`)
    console.log(JSON.stringify(media, null, 2))
  })

  console.log('\n' + '='.repeat(80) + '\n')

  // 对比关键字段
  console.log('📊 字段对比:')
  console.log('\nKeystone 上传的图片:')
  console.log('- file_id:', keystoneMedia?.file_id)
  console.log('- file_extension:', keystoneMedia?.file_extension)
  console.log('- file_filesize:', keystoneMedia?.file_filesize)
  console.log('- width:', keystoneMedia?.width)
  console.log('- height:', keystoneMedia?.height)
  console.log('- fileSize:', keystoneMedia?.fileSize)
  console.log('- mimeType:', keystoneMedia?.mimeType)
  console.log('- variants:', keystoneMedia?.variants)

  if (recentMedia.length > 0) {
    console.log('\n批量上传的图片 (第一个):')
    const batchMedia = recentMedia[0]
    console.log('- file_id:', batchMedia?.file_id)
    console.log('- file_extension:', batchMedia?.file_extension)
    console.log('- file_filesize:', batchMedia?.file_filesize)
    console.log('- width:', batchMedia?.width)
    console.log('- height:', batchMedia?.height)
    console.log('- fileSize:', batchMedia?.fileSize)
    console.log('- mimeType:', batchMedia?.mimeType)
    console.log('- variants:', batchMedia?.variants)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
