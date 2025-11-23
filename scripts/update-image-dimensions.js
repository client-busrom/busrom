/**
 * 更新图片的宽度和高度信息
 * 
 * 从 S3 下载图片并使用 sharp 提取尺寸
 */

const { PrismaClient } = require('../cms/node_modules/.prisma/client')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
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

/**
 * 从 S3 下载图片到内存
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
 * 获取图片尺寸
 */
async function getImageDimensions(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata()
  return {
    width: metadata.width,
    height: metadata.height,
  }
}

/**
 * 更新媒体记录的尺寸
 */
async function updateMediaDimensions(id, s3Key) {
  console.log(`🔍 处理: ${s3Key}`)
  
  try {
    // 下载图片
    const imageBuffer = await downloadImage(s3Key)
    
    // 获取尺寸
    const { width, height } = await getImageDimensions(imageBuffer)
    
    // 更新数据库
    await prisma.media.update({
      where: { id },
      data: {
        width,
        height,
        file_width: width,
        file_height: height,
      },
    })
    
    console.log(`✅ 更新成功: ${width}x${height}`)
    return true
  } catch (error) {
    console.error(`❌ 错误:`, error.message)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📋 查找需要更新尺寸的图片...\n')
  
  const mediaFiles = await prisma.media.findMany({
    where: {
      OR: [
        { width: null },
        { height: null },
      ],
    },
  })
  
  console.log(`找到 ${mediaFiles.length} 个需要更新的文件\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const media of mediaFiles) {
    // 构建 S3 key
    const s3Key = `${media.file_id}.${media.file_extension}`
    
    const success = await updateMediaDimensions(media.id, s3Key)
    if (success) {
      successCount++
    } else {
      errorCount++
    }
    
    console.log('')
  }
  
  console.log('═══════════════════════════════════════')
  console.log('  更新完成')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${mediaFiles.length}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
