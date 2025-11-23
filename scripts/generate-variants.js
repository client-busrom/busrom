/**
 * 为已导入的图片生成变体
 *
 * 生成 thumbnail, small, medium, large, xlarge, webp 变体
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client')
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../cms/.env') })

const prisma = new PrismaClient()

// S3 配置
const s3Config = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  },
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true,
}

const s3Client = new S3Client(s3Config)
const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'
const cdnDomain = process.env.CDN_DOMAIN || 'http://localhost:8080'
const useMinio = process.env.USE_MINIO === 'true'

// 变体配置
const SIZE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  small: { width: 400, height: null, fit: 'inside' },
  medium: { width: 800, height: null, fit: 'inside' },
  large: { width: 1200, height: null, fit: 'inside' },
  xlarge: { width: 1920, height: null, fit: 'inside' },
}

/**
 * 从 S3 下载图片
 */
async function downloadImage(s3Key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  })

  const response = await s3Client.send(command)
  const chunks = []

  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/**
 * 上传图片到 S3
 */
async function uploadImage(s3Key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  })

  await s3Client.send(command)
}

/**
 * 生成单个变体
 */
async function generateVariant(imageBuffer, variantName, config) {
  let transformer = sharp(imageBuffer)

  if (config.width || config.height) {
    transformer = transformer.resize({
      width: config.width,
      height: config.height,
      fit: config.fit,
      withoutEnlargement: true,
    })
  }

  return await transformer.toBuffer()
}

/**
 * 生成所有变体
 */
async function generateAllVariants(media) {
  const fileId = media.file_id
  const fileExt = media.file_extension
  const s3Key = `${fileId}.${fileExt}`

  console.log(`\n🔍 处理: ${media.filename}`)
  console.log(`  S3 Key: ${s3Key}`)

  try {
    // 下载原图
    console.log('  📥 下载原图...')
    const originalBuffer = await downloadImage(s3Key)

    const variants = {}

    // 生成各种尺寸变体
    for (const [variantName, config] of Object.entries(SIZE_VARIANTS)) {
      console.log(`  🎨 生成 ${variantName}...`)

      const variantBuffer = await generateVariant(originalBuffer, variantName, config)
      const variantKey = `variants/${variantName}/${fileId}.${fileExt}`

      // 上传变体到 S3
      await uploadImage(variantKey, variantBuffer, `image/${fileExt}`)

      // 构建 URL
      // For MinIO (local), include bucket name in URL
      // For CloudFront (production), bucket name is not needed
      const variantUrl = useMinio
        ? `${cdnDomain}/${bucketName}/${variantKey}`
        : `${cdnDomain}/${variantKey}`
      variants[variantName] = variantUrl

      console.log(`    ✓ ${variantUrl}`)
    }

    // 生成 WebP 版本
    console.log('  🎨 生成 webp...')
    const webpBuffer = await sharp(originalBuffer).webp({ quality: 85 }).toBuffer()
    const webpKey = `variants/webp/${fileId}.webp`
    await uploadImage(webpKey, webpBuffer, 'image/webp')

    const webpUrl = useMinio
      ? `${cdnDomain}/${bucketName}/${webpKey}`
      : `${cdnDomain}/${webpKey}`
    variants.webp = webpUrl
    console.log(`    ✓ ${webpUrl}`)

    // 更新数据库
    console.log('  💾 更新数据库...')
    await prisma.media.update({
      where: { id: media.id },
      data: { variants },
    })

    console.log('  ✅ 完成!')
    return true
  } catch (error) {
    console.error('  ❌ 错误:', error.message)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📋 查找需要生成变体的图片...\n')

  // 获取所有媒体文件，然后在客户端过滤没有变体的
  const allMedia = await prisma.media.findMany()

  const mediaFiles = allMedia.filter(media => {
    return !media.variants || Object.keys(media.variants).length === 0
  })

  console.log(`找到 ${mediaFiles.length} 个需要生成变体的文件\n`)

  if (mediaFiles.length === 0) {
    console.log('✨ 所有图片都已有变体！')
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const media of mediaFiles) {
    const success = await generateAllVariants(media)
    if (success) {
      successCount++
    } else {
      errorCount++
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log('  生成变体完成')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${mediaFiles.length}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
