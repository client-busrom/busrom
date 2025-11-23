#!/usr/bin/env node

/**
 * 批量从 S3 导入图片记录到 CMS（简化版 - CommonJS）
 *
 * 使用方法：
 *   node scripts/batch-import-from-s3-simple.js scripts/metadata/test-import.json
 */

const fs = require('fs')
const path = require('path')

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../cms/.env') })

// 使用 CMS 目录的 Prisma Client
const { PrismaClient } = require('../cms/node_modules/.prisma/client')
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3')

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
 * 从 S3 获取文件列表
 */
async function listS3Files(prefix) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  })

  const response = await s3Client.send(command)
  const files = response.Contents || []

  return files
    .filter(file => {
      const key = file.Key || ''
      return key && !key.endsWith('/') && !key.includes('variants/')
    })
    .map(file => file.Key)
}

/**
 * 获取 S3 文件的元信息
 */
async function getS3FileInfo(key) {
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  const response = await s3Client.send(command)
  return {
    size: response.ContentLength || 0,
    contentType: response.ContentType || '',
    lastModified: response.LastModified,
  }
}

/**
 * 查找 MediaCategory
 */
async function findCategory(slug) {
  const category = await prisma.mediaCategory.findUnique({
    where: { slug },
  })

  if (!category) {
    console.warn(`⚠️  警告: 未找到 MediaCategory "${slug}"`)
    return null
  }

  return category
}

/**
 * 查找 MediaTags
 */
async function findTags(slugs) {
  const tags = await prisma.mediaTag.findMany({
    where: {
      slug: { in: slugs },
    },
  })

  const foundSlugs = tags.map(t => t.slug)
  const missingSlugs = slugs.filter(s => !foundSlugs.includes(s))

  if (missingSlugs.length > 0) {
    console.warn(`⚠️  警告: 未找到以下 MediaTag: ${missingSlugs.join(', ')}`)
  }

  return tags
}

/**
 * 创建 MediaFile 记录
 */
async function createMediaRecord(s3Key, fileInfo, config) {
  const filename = path.basename(s3Key)
  const ext = path.extname(filename).toLowerCase()
  const basename = path.basename(filename, ext)

  // file_id 是不含扩展名的 S3 key (Keystone 会自动添加扩展名)
  // 例如: s3Key = "test/image.jpg" -> file_id = "test/image"
  const fileId = s3Key.replace(ext, '')

  // 查找 category
  const category = await findCategory(config.primaryCategory)
  if (!category) {
    console.error(`❌ 跳过文件 ${filename}: 未找到分类`)
    return null
  }

  // 查找 tags
  const tags = await findTags(config.tags)

  // 合并 metadata
  const fileSpecificMetadata = (config.fileMetadata && config.fileMetadata[filename]) || {}
  const metadata = {
    ...config.defaultMetadata,
    ...fileSpecificMetadata,
  }

  // 检查是否已存在（使用 filename 查找）
  const existing = await prisma.media.findFirst({
    where: { filename: filename },
  })

  if (existing) {
    console.warn(`⚠️  文件已存在，跳过: ${filename}`)
    return existing
  }

  // 创建记录
  const mediaFile = await prisma.media.create({
    data: {
      file_id: fileId,
      file_extension: ext.replace('.', ''),
      filename: filename,
      file_filesize: fileInfo.size,
      fileSize: fileInfo.size,
      mimeType: fileInfo.contentType || 'image/jpeg',
      width: null,
      height: null,
      primaryCategory: { connect: { id: category.id } },
      tags: { connect: tags.map(t => ({ id: t.id })) },
      metadata: metadata,
    },
  })

  console.log(`✅ 创建: ${filename}`)
  return mediaFile
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('❌ 错误: 请提供 metadata 配置文件路径')
    console.log('\n使用方法:')
    console.log('  node scripts/batch-import-from-s3-simple.js <metadata-file>')
    console.log('\n示例:')
    console.log('  node scripts/batch-import-from-s3-simple.js scripts/metadata/test-import.json')
    process.exit(1)
  }

  const configFile = args[0]

  if (!fs.existsSync(configFile)) {
    console.error(`❌ 错误: 配置文件不存在: ${configFile}`)
    process.exit(1)
  }

  // 读取配置
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))

  console.log('📋 批量导入配置:')
  console.log(`  分类: ${config.primaryCategory}`)
  console.log(`  标签: ${config.tags.join(', ')}`)
  if (config.s3Prefix) {
    console.log(`  S3 路径: ${config.s3Prefix}`)
  }
  console.log()

  // 获取 S3 文件列表
  let s3Keys = []

  if (config.s3Keys && config.s3Keys.length > 0) {
    s3Keys = config.s3Keys
    console.log(`📦 使用指定的文件列表 (${s3Keys.length} 个文件)`)
  } else if (config.s3Prefix) {
    console.log(`🔍 正在扫描 S3: ${config.s3Prefix}`)
    s3Keys = await listS3Files(config.s3Prefix)
    console.log(`📦 找到 ${s3Keys.length} 个文件`)
  } else {
    console.error('❌ 错误: 必须指定 s3Prefix 或 s3Keys')
    process.exit(1)
  }

  if (s3Keys.length === 0) {
    console.log('⚠️  没有找到文件，退出')
    process.exit(0)
  }

  // 批量创建记录
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const s3Key of s3Keys) {
    try {
      const fileInfo = await getS3FileInfo(s3Key)
      const result = await createMediaRecord(s3Key, fileInfo, config)

      if (result) {
        successCount++
      } else {
        skipCount++
      }
    } catch (error) {
      console.error(`❌ 错误: ${s3Key}`)
      console.error('详细错误:', error)
      errorCount++
    }
  }

  console.log()
  console.log('═══════════════════════════════════════')
  console.log('  导入完成')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`⏭️  跳过: ${skipCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${s3Keys.length}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
