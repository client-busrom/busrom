#!/usr/bin/env node

/**
 * 正确的Keystone批量导入脚本
 * 会复制S3文件到Keystone格式并创建正确的Media记录
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 加载环境变量
if (!process.env.DATABASE_URL && !process.env.S3_BUCKET_NAME) {
  console.log('📝 加载本地 .env 文件...')
  require('dotenv').config({ path: '/Users/cerfbaleine/workspace/busrom-work/cms/.env' })
} else {
  console.log('⚡ 使用环境变量 (production模式)')
}

const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION,
}

const { PrismaClient } = require('/Users/cerfbaleine/workspace/busrom-work/cms/node_modules/.prisma/client')
const { S3Client, CopyObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')

Object.assign(process.env, savedEnv)

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: savedEnv.DATABASE_URL || process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
})

const s3Config = {
  region: savedEnv.S3_REGION || 'us-east-1',
}

const s3Client = new S3Client(s3Config)
const bucketName = savedEnv.S3_BUCKET_NAME || 'busrom-media-production'

console.log(`🪣 Bucket: ${bucketName}`)

/**
 * 扫描S3 prefix获取所有文件
 */
async function listS3Files(prefix) {
  const files = []
  let continuationToken = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && !item.Key.endsWith('/')) {
          files.push(item.Key)
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return files
}

/**
 * 生成Keystone格式的随机ID (类似 j_9zSP_R-1rO2AH1cnm4rQ)
 */
function generateKeystoneId() {
  return crypto.randomBytes(16).toString('base64url').substring(0, 22)
}

/**
 * 获取S3文件信息
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
  }
}

/**
 * 复制S3文件到Keystone格式
 */
async function copyToKeystoneFormat(sourceKey, keystoneId, extension) {
  const destKey = `${keystoneId}.${extension}`
  
  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destKey,
  })
  
  await s3Client.send(command)
  return destKey
}

/**
 * 创建Media记录
 */
async function createMediaRecord(sourceKey, config) {
  const filename = path.basename(sourceKey)
  const ext = path.extname(filename).toLowerCase().replace('.', '')
  const keystoneId = generateKeystoneId()
  
  // 获取文件信息
  const fileInfo = await getS3FileInfo(sourceKey)
  
  // 复制文件到Keystone格式
  console.log(`  📋 复制: ${sourceKey} -> ${keystoneId}.${ext}`)
  await copyToKeystoneFormat(sourceKey, keystoneId, ext)
  
  // 查找category和tags
  const category = await prisma.mediaCategory.findUnique({
    where: { slug: config.primaryCategory },
  })
  
  if (!category) {
    console.error(`❌ 未找到分类: ${config.primaryCategory}`)
    return null
  }
  
  const tags = await prisma.mediaTag.findMany({
    where: { slug: { in: config.tags } },
  })
  
  // 合并metadata
  const fileSpecificMetadata = (config.fileMetadata && config.fileMetadata[filename]) || {}
  const metadata = {
    ...config.defaultMetadata,
    ...fileSpecificMetadata,
  }
  
  // 检查是否已存在
  const existing = await prisma.media.findFirst({
    where: { filename: filename },
  })
  
  if (existing) {
    console.warn(`⚠️  已存在: ${filename}`)
    return existing
  }
  
  // 创建记录
  const mediaFile = await prisma.media.create({
    data: {
      file_id: keystoneId,
      file_extension: ext,
      file_filesize: fileInfo.size,
      filename: filename,
      fileSize: fileInfo.size,
      mimeType: fileInfo.contentType || 'image/jpeg',
      width: null,
      height: null,
      primaryCategory: { connect: { id: category.id } },
      tags: { connect: tags.map(t => ({ id: t.id })) },
      metadata: metadata,
    },
  })
  
  console.log(`✅ 创建: ${filename} (ID: ${keystoneId})`)
  return mediaFile
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ 请提供配置文件路径')
    process.exit(1)
  }
  
  const configFile = args[0]
  
  if (!fs.existsSync(configFile)) {
    console.error(`❌ 配置文件不存在: ${configFile}`)
    process.exit(1)
  }
  
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))
  
  console.log('📋 导入配置:')
  console.log(`  分类: ${config.primaryCategory}`)
  console.log(`  标签: ${config.tags.join(', ')}`)
  console.log()
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  // 获取文件列表
  let s3Keys = []
  if (config.s3Keys && config.s3Keys.length > 0) {
    s3Keys = config.s3Keys
    console.log(`📦 处理指定的 ${s3Keys.length} 个文件...`)
  } else if (config.s3Prefix) {
    console.log(`🔍 扫描 S3 prefix: ${config.s3Prefix}`)
    s3Keys = await listS3Files(config.s3Prefix)
    console.log(`📦 找到 ${s3Keys.length} 个文件`)
  } else {
    console.log('⚠️  配置中没有文件列表或prefix')
  }

  // 处理文件
  if (s3Keys.length > 0) {
    for (const s3Key of s3Keys) {
      try {
        const result = await createMediaRecord(s3Key, config)
        if (result) {
          successCount++
        } else {
          skipCount++
        }
      } catch (error) {
        console.error(`❌ 错误: ${s3Key}`)
        console.error(error.message)
        errorCount++
      }
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
