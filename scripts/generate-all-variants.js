#!/usr/bin/env node

/**
 * 批量生成图片变体
 *
 * 由于批量导入脚本使用 Prisma 直接操作数据库，不会触发 Keystone hook
 * 因此需要单独运行此脚本来生成变体
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client')

// Import image optimizer functions directly from the compiled Keystone config
const path = require('path')
const configPath = path.join(__dirname, '../cms/.keystone/config.js')
const config = require(configPath)

// We'll implement these functions inline since we can't require TypeScript directly
const sharp = require('sharp')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

async function getImageBufferFromS3(s3Key) {
  const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media-production'

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

async function extractImageMetadata(s3Key) {
  const buffer = await getImageBufferFromS3(s3Key)
  const metadata = await sharp(buffer).metadata()

  return {
    width: metadata.width,
    height: metadata.height,
    fileSize: buffer.length,
    mimeType: `image/${metadata.format}`,
  }
}

async function generateImageVariants(s3Key) {
  const buffer = await getImageBufferFromS3(s3Key)

  const variants = {}
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 400 },
    medium: { width: 800, height: 800 },
    large: { width: 1200, height: 1200 },
    xlarge: { width: 2000, height: 2000 },
  }

  const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media-production'

  // Extract file_id from s3Key (remove extension)
  const fileId = s3Key.replace(/\.[^.]+$/, '')

  for (const [sizeName, size] of Object.entries(sizes)) {
    const resizedBuffer = await sharp(buffer)
      .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    const key = `variants/${sizeName}/${fileId}.jpg`

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: resizedBuffer,
      ContentType: 'image/jpeg',
    }))

    // Store only the S3 key (relative path), not the full URL
    // This allows CDN domain to be changed without updating database
    variants[sizeName] = key
  }

  // WebP variant
  const webpBuffer = await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer()

  const webpKey = `variants/webp/${fileId}.webp`

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: webpKey,
    Body: webpBuffer,
    ContentType: 'image/webp',
  }))

  // Store only the S3 key (relative path), not the full URL
  variants.webp = webpKey

  return variants
}

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL
    }
  }
})

// 并发数
const CONCURRENCY = 10

async function generateVariantsForMedia(media) {
  const { id, file_id, file_extension, filename } = media

  // 构造 S3 Key
  const s3Key = `${file_id}.${file_extension}`

  console.log(`🔄 处理: ${filename}`)
  console.log(`   S3 Key: ${s3Key}`)

  try {
    // 提取 metadata
    const metadata = await extractImageMetadata(s3Key)
    console.log(`   尺寸: ${metadata.width}x${metadata.height}, ${metadata.fileSize} bytes`)

    // 生成变体
    const variants = await generateImageVariants(s3Key)
    console.log(`   变体: ${Object.keys(variants).length} 个`)

    // 更新数据库
    await prisma.media.update({
      where: { id },
      data: {
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        variants: variants,
      },
    })

    console.log(`   ✅ 完成`)
    return { success: true, id, filename }
  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`)
    return { success: false, id, filename, error: error.message }
  }
}

async function processInBatches(items, batchSize, processFn) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    console.log(`\n📦 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} 个)`)

    const batchResults = await Promise.all(batch.map(processFn))
    results.push(...batchResults)

    const succeeded = batchResults.filter(r => r.success).length
    const failed = batchResults.filter(r => !r.success).length
    console.log(`   ✅ 成功: ${succeeded}, ❌ 失败: ${failed}`)
  }

  return results
}

async function main() {
  console.log('🚀 开始批量生成图片变体...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 查询所有需要生成变体的 Media
  const allMediaRaw = await prisma.media.findMany({
    where: {
      OR: [
        { width: null },
        { height: null }
      ]
    },
    select: {
      id: true,
      file_id: true,
      file_extension: true,
      filename: true,
      variants: true,
    }
  })

  // Filter in JavaScript for empty variants
  const allMedia = allMediaRaw.filter(m =>
    !m.variants ||
    Object.keys(m.variants).length === 0 ||
    !m.variants.thumbnail
  ).map(m => ({
    id: m.id,
    file_id: m.file_id,
    file_extension: m.file_extension,
    filename: m.filename,
  }))

  console.log(`📊 找到 ${allMedia.length} 条需要处理的记录\n`)

  if (allMedia.length === 0) {
    console.log('✨ 所有记录都已生成变体!')
    await prisma.$disconnect()
    return
  }

  console.log(`⚙️  并发数: ${CONCURRENCY}\n`)
  console.log(`⏱️  预计时间: 约 ${Math.ceil(allMedia.length / CONCURRENCY * 5 / 60)} 分钟\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 2. 批量处理
  const startTime = Date.now()
  const results = await processInBatches(allMedia, CONCURRENCY, generateVariantsForMedia)

  // 3. 统计结果
  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const duration = Math.ceil((Date.now() - startTime) / 1000)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 处理完成!\n')
  console.log(`   ✅ 成功: ${succeeded}`)
  console.log(`   ❌ 失败: ${failed}`)
  console.log(`   ⏱️  耗时: ${duration} 秒 (${Math.ceil(duration / 60)} 分钟)`)

  if (failed > 0) {
    console.log('\n失败的记录:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.filename}: ${r.error}`)
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await prisma.$disconnect()
}

main().catch(console.error)
