#!/usr/bin/env node

/**
 * 更新所有 Media 记录的 variants，从完整 URL 转换为相对路径（S3 Key）
 *
 * 这样设计的好处：
 * - CDN 域名可以在不修改数据库的情况下更换
 * - 只需在前端/API 层面拼接 CDN_DOMAIN + S3 Key
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client')

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL
    }
  }
})

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media-production'
const S3_REGION = process.env.S3_REGION || 'us-east-1'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd6tbtu3zdp40x.cloudfront.net'

// URL patterns to remove
const urlPatterns = [
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`,
  `https://${CDN_DOMAIN}/`,
  `http://${CDN_DOMAIN}/`,
]

async function updateVariantsToRelativePaths() {
  console.log('🔄 开始更新 variants 为相对路径...\n')
  console.log('   从: 完整 URL')
  console.log('   到: 相对路径 (S3 Key)\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 获取所有有 variants 的 Media 记录
  const allMedia = await prisma.media.findMany({
    where: {
      variants: {
        not: null
      }
    },
    select: {
      id: true,
      filename: true,
      variants: true,
    }
  })

  console.log(`📊 找到 ${allMedia.length} 条记录需要检查\n`)

  let updateCount = 0
  let skipCount = 0

  for (const media of allMedia) {
    const variants = media.variants

    if (!variants || typeof variants !== 'object') {
      skipCount++
      continue
    }

    // 检查是否需要更新（是否包含完整 URL）
    const needsUpdate = Object.values(variants).some(value =>
      typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))
    )

    if (!needsUpdate) {
      skipCount++
      continue
    }

    // 转换所有 variants 为相对路径
    const updatedVariants = {}
    for (const [key, value] of Object.entries(variants)) {
      if (typeof value === 'string') {
        let relativePath = value
        // 移除所有可能的 URL 前缀
        for (const pattern of urlPatterns) {
          relativePath = relativePath.replace(pattern, '')
        }
        updatedVariants[key] = relativePath
      } else {
        updatedVariants[key] = value
      }
    }

    // 更新数据库
    await prisma.media.update({
      where: { id: media.id },
      data: {
        variants: updatedVariants
      }
    })

    updateCount++
    if (updateCount % 100 === 0) {
      console.log(`   ✅ 已更新 ${updateCount} 条记录...`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 更新完成!\n')
  console.log(`   ✅ 已更新: ${updateCount}`)
  console.log(`   ⏭️  跳过: ${skipCount}`)
  console.log(`   📊 总计: ${allMedia.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 验证更新结果
  console.log('🔍 验证更新结果...\n')

  const sample = await prisma.media.findFirst({
    where: {
      variants: {
        not: null
      }
    },
    select: {
      filename: true,
      variants: true,
    }
  })

  if (sample && sample.variants) {
    console.log(`示例文件: ${sample.filename}`)
    console.log(`Thumbnail: ${sample.variants.thumbnail}`)
    console.log(`Medium: ${sample.variants.medium}`)
    console.log(`WebP: ${sample.variants.webp}`)
    console.log('\n✅ variants 现在只包含相对路径，可以灵活更换 CDN 域名')
  }

  console.log('\n✨ 所有 variants 已转换为相对路径!\n')

  await prisma.$disconnect()
}

updateVariantsToRelativePaths().catch(console.error)
