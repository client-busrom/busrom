#!/usr/bin/env node

/**
 * 完整修复已导入的Media记录
 * 填充所有缺失的字段:
 * - file_width, file_height (Keystone image字段内部的宽高)
 * - width, height (独立的宽高字段)
 * - fileSize, mimeType
 * - variants (优化后的图片变体)
 */

const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  CDN_DOMAIN: process.env.CDN_DOMAIN,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_REGION: process.env.S3_REGION,
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

// 动态加载Prisma Client
let PrismaClient

const fs = require('fs')
const isDocker = fs.existsSync('/app/cms')

if (isDocker) {
  console.log('🐳 Docker环境')
  PrismaClient = require('/app/cms/node_modules/.prisma/client').PrismaClient
} else {
  console.log('💻 本地环境')
  PrismaClient = require('/Users/cerfbaleine/workspace/busrom-work/cms/node_modules/.prisma/client').PrismaClient
}

const prisma = new PrismaClient()

// Inline image metadata extraction and variant generation
async function extractImageMetadata(fileUrl) {
  const sharp = require('sharp')

  // Download image
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Get metadata
  const metadata = await sharp(buffer).metadata()

  return {
    width: metadata.width,
    height: metadata.height,
    fileSize: buffer.length,
    mimeType: `image/${metadata.format}`,
    buffer: buffer, // Return buffer for variant generation
  }
}

async function generateImageVariants(buffer, fileId, fileExtension) {
  const sharp = require('sharp')
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

  // Initialize S3 client
  const s3Config = {
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
    },
  }

  // MinIO-specific configuration
  if (process.env.USE_MINIO === 'true' || process.env.S3_ENDPOINT) {
    s3Config.endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
    s3Config.forcePathStyle = true
  }

  const s3 = new S3Client(s3Config)
  const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'

  // Define variant sizes
  const variants = {
    thumbnail: { width: 150, height: 150, fit: 'cover' },
    small: { width: 400, fit: 'inside' },
    medium: { width: 800, fit: 'inside' },
    large: { width: 1200, fit: 'inside' },
    xlarge: { width: 1920, fit: 'inside' },
  }

  const results = {}

  // Get CDN domain for URL generation
  let cdnDomain = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'
  if (cdnDomain && !cdnDomain.startsWith('http') && cdnDomain.includes('cloudfront.net')) {
    cdnDomain = `https://${cdnDomain}`
  }

  // Generate each variant
  for (const [name, config] of Object.entries(variants)) {
    try {
      let resized = sharp(buffer).resize(config.width, config.height, {
        fit: config.fit || 'inside',
        withoutEnlargement: true,
      })

      const variantBuffer = await resized.toBuffer()

      // Upload to S3
      const s3Key = `variants/${name}/${fileId}.${fileExtension}`
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: variantBuffer,
          ContentType: `image/${fileExtension}`,
          // ACL removed - bucket uses policy for public access
        })
      )

      // Generate URL
      const variantUrl = cdnDomain.includes('cloudfront.net')
        ? `${cdnDomain}/${s3Key}`
        : `${cdnDomain}/${bucketName}/${s3Key}`

      results[name] = variantUrl
    } catch (err) {
      console.warn(`  ⚠️  Failed to generate ${name} variant: ${err.message}`)
    }
  }

  // Generate WebP version
  try {
    const webpBuffer = await sharp(buffer)
      .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const s3Key = `variants/webp/${fileId}.webp`
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        // ACL removed - bucket uses policy for public access
      })
    )

    const webpUrl = cdnDomain.includes('cloudfront.net')
      ? `${cdnDomain}/${s3Key}`
      : `${cdnDomain}/${bucketName}/${s3Key}`

    results.webp = webpUrl
  } catch (err) {
    console.warn(`  ⚠️  Failed to generate webp variant: ${err.message}`)
  }

  return results
}

async function processMedia(mediaItem) {
  // Construct the file URL
  let cdnDomain = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'

  if (cdnDomain && !cdnDomain.startsWith('http') && cdnDomain.includes('cloudfront.net')) {
    cdnDomain = `https://${cdnDomain}`
  }

  const fileUrl = cdnDomain.includes('cloudfront.net')
    ? `${cdnDomain}/${mediaItem.file_id}.${mediaItem.file_extension}`
    : `${cdnDomain}/${process.env.S3_BUCKET_NAME || 'busrom-media'}/${mediaItem.file_id}.${mediaItem.file_extension}`

  console.log(`🔄 处理: ${mediaItem.filename}`)
  console.log(`📁 URL: ${fileUrl}`)

  try {
    // Extract metadata
    const { width, height, fileSize, mimeType, buffer } = await extractImageMetadata(fileUrl)
    console.log(`  📊 Metadata: ${width}x${height}, ${Math.round(fileSize / 1024)}KB`)

    // Generate variants
    let variants = {}
    try {
      variants = await generateImageVariants(buffer, mediaItem.file_id, mediaItem.file_extension)
      console.log(`  ✨ Variants: ${Object.keys(variants).length} generated`)
    } catch (variantError) {
      console.warn(`  ⚠️  Variants failed: ${variantError.message}`)
    }

    // Update the media record with ALL fields
    await prisma.media.update({
      where: { id: mediaItem.id },
      data: {
        // Keystone image field internal fields
        file_width: width,
        file_height: height,
        file_filesize: fileSize,

        // Standalone metadata fields
        width: width,
        height: height,
        fileSize: fileSize,
        mimeType: mimeType,

        // Variants
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

  // 找出所有有file_id但file_width为null的记录
  const mediaItems = await prisma.media.findMany({
    where: {
      file_id: { not: null },
      file_width: null,
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
