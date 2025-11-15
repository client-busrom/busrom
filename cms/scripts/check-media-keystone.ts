/**
 * Check Media Record Script
 *
 * 检查指定的 Media 记录，对比批量上传和单个上传的差异
 */

import type { Context } from '.keystone/types'

export async function checkMedia(context: Context) {
  console.log('\n🔍 检查 Media 记录...\n')

  try {
    // 查询指定的图片 (使用 Keystone 上传的)
    console.log('查询使用 Keystone 上传的图片:')
    const keystoneMedia = await context.db.Media.findOne({
      where: { id: 'c2d4a92c-d478-4519-8b45-2412cff881b4' },
    })

    if (!keystoneMedia) {
      console.log('❌ 未找到指定的图片')
      return
    }

    console.log('✅ 找到图片:', keystoneMedia.filename)
    console.log('- ID:', keystoneMedia.id)
    console.log('- file:', JSON.stringify(keystoneMedia.file, null, 2))
    console.log('- width:', keystoneMedia.width)
    console.log('- height:', keystoneMedia.height)
    console.log('- fileSize:', keystoneMedia.fileSize)
    console.log('- mimeType:', keystoneMedia.mimeType)
    console.log('- variants:', JSON.stringify(keystoneMedia.variants, null, 2))

    console.log('\n' + '='.repeat(80) + '\n')

    // 查询最近的几条记录 (可能是批量上传的)
    console.log('查询最近上传的图片 (可能是批量上传的):')
    const recentMedia = await context.db.Media.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        id: { not: { equals: 'c2d4a92c-d478-4519-8b45-2412cff881b4' } },
      },
    })

    recentMedia.forEach((media, index) => {
      console.log(`\n--- 图片 ${index + 1} ---`)
      console.log('- filename:', media.filename)
      console.log('- ID:', media.id)
      console.log('- file:', JSON.stringify(media.file, null, 2))
      console.log('- width:', media.width)
      console.log('- height:', media.height)
      console.log('- fileSize:', media.fileSize)
      console.log('- mimeType:', media.mimeType)
      console.log('- variants:', media.variants ? Object.keys(media.variants) : null)
    })

    console.log('\n' + '='.repeat(80) + '\n')

    // 对比关键字段
    console.log('📊 字段对比分析:')
    console.log('\nKeystone 上传的图片:')
    console.log('- 有 file 字段:', !!keystoneMedia.file)
    console.log('- 有 width:', !!keystoneMedia.width)
    console.log('- 有 height:', !!keystoneMedia.height)
    console.log('- 有 variants:', !!keystoneMedia.variants && Object.keys(keystoneMedia.variants as any).length > 0)

    if (recentMedia.length > 0) {
      console.log('\n批量上传的图片 (第一个):')
      const batchMedia = recentMedia[0]
      console.log('- filename:', batchMedia.filename)
      console.log('- 有 file 字段:', !!batchMedia.file)
      console.log('- 有 width:', !!batchMedia.width)
      console.log('- 有 height:', !!batchMedia.height)
      console.log('- 有 variants:', !!batchMedia.variants && Object.keys(batchMedia.variants as any).length > 0)

      console.log('\n🔍 差异分析:')
      if (!batchMedia.file && keystoneMedia.file) {
        console.log('❌ 批量上传的图片缺少 file 字段！这就是为什么无法预览')
        console.log('   原因: 批量上传 API 直接使用 Prisma 创建记录，没有通过 Keystone 的 image field')
      }
      if (!batchMedia.variants && keystoneMedia.variants) {
        console.log('❌ 批量上传的图片缺少 variants 字段！需要触发 hooks 来生成')
      }
    }
  } catch (error) {
    console.error('\n❌ 查询失败:', error)
    throw error
  }
}
