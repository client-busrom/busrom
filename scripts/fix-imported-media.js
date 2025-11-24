#!/usr/bin/env node

/**
 * 修复已导入的Media记录
 * 为所有有file_id但缺少width/height的记录提取metadata并生成variants
 */

const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  CDN_DOMAIN: process.env.CDN_DOMAIN,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
}

if (!savedEnv.DATABASE_URL) {
  console.log('📝 加载本地 .env 文件...')
  const envPath = require('fs').existsSync('/app/.env') ? '/app/.env' : '/Users/cerfbaleine/workspace/busrom-work/cms/.env'
  require('dotenv').config({ path: envPath })
  Object.assign(process.env, savedEnv)
} else {
  console.log('⚡ 使用环境变量 (production模式)')
  Object.keys(savedEnv).forEach(key => {
    if (savedEnv[key]) process.env[key] = savedEnv[key]
  })
}

// 动态加载Prisma Client和utils
let PrismaClient, extractImageMetadata, generateImageVariants

const fs = require('fs')
const isDocker = fs.existsSync('/app/cms')

if (isDocker) {
  console.log('🐳 Docker环境')
  PrismaClient = require('/app/cms/node_modules/.prisma/client').PrismaClient
  const utils = require('/app/cms/utils/imageProcessing')
  extractImageMetadata = utils.extractImageMetadata
  generateImageVariants = utils.generateImageVariants
} else {
  console.log('💻 本地环境')
  PrismaClient = require('/Users/cerfbaleine/workspace/busrom-work/cms/node_modules/.prisma/client').PrismaClient
  const utils = require('/Users/cerfbaleine/workspace/busrom-work/cms/utils/imageProcessing')
  extractImageMetadata = utils.extractImageMetadata
  generateImageVariants = utils.generateImageVariants
}

const prisma = new PrismaClient()

async function processMedia(mediaItem) {
  // Construct the file URL (same logic as in Media.ts hook)
  let cdnDomain = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'

  // Add https:// for CloudFront domains without protocol
  if (cdnDomain && !cdnDomain.startsWith('http') && cdnDomain.includes('cloudfront.net')) {
    cdnDomain = `https://${cdnDomain}`
  }

  // CloudFront doesn't need bucket name in URL
  const fileUrl = cdnDomain.includes('cloudfront.net')
    ? `${cdnDomain}/${mediaItem.file_id}.${mediaItem.file_extension}`
    : `${cdnDomain}/${process.env.S3_BUCKET_NAME || 'busrom-media'}/${mediaItem.file_id}.${mediaItem.file_extension}`

  console.log(`🔄 处理: ${mediaItem.filename}`)
  console.log(`📁 URL: ${fileUrl}`)

  try {
    // Extract metadata
    const metadata = await extractImageMetadata(fileUrl)
    console.log(`  📊 Metadata: ${metadata.width}x${metadata.height}, ${Math.round(metadata.fileSize / 1024)}KB`)

    // Generate variants
    let variants = {}
    try {
      variants = await generateImageVariants(fileUrl)
      console.log(`  ✨ Variants: ${Object.keys(variants).length} generated`)
    } catch (variantError) {
      console.warn(`  ⚠️  Variants failed: ${variantError.message}`)
    }

    // Update the media record
    await prisma.media.update({
      where: { id: mediaItem.id },
      data: {
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        variants: variants,
      },
    })

    console.log(`  ✅ 完成`)
    return { success: true }

  } catch (error) {
    console.error(`  ❌ 错误: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🔍 查找需要修复的Media记录...\n')

  // 找出所有有file_id但width为null的记录
  const mediaItems = await prisma.media.findMany({
    where: {
      file_id: { not: null },
      width: null,
    },
    select: {
      id: true,
      filename: true,
      file_id: true,
      file_extension: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`📊 找到 ${mediaItems.length} 条需要处理的记录\n`)

  if (mediaItems.length === 0) {
    console.log('✅ 没有需要处理的记录')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  开始处理')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i]
    console.log(`[${i + 1}/${mediaItems.length}]`)

    const result = await processMedia(item)

    if (result.success) {
      successCount++
    } else {
      errorCount++
    }

    console.log()

    // 每处理10条记录暂停一下,避免过载
    if ((i + 1) % 10 === 0) {
      console.log(`⏸️  已处理 ${i + 1} 条,暂停1秒...\n`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  处理完成')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${mediaItems.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
