#!/usr/bin/env node

/**
 * Import Missing Scene Images from S3 to Keystone
 *
 * 从 S3 导入缺失的场景图到 Keystone
 *
 * 导入规则：
 * - square/ -> scene-square, scene-standalone
 * - group-01/common/ -> scene-combination, scene-series
 * - group-01/scene-XX/ -> scene-combination, scene-single, sceneNumber=XX, combinationNumber=01
 * - group-02/scene-XX/ -> scene-combination, scene-single, sceneNumber=XX, combinationNumber=02
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 加载环境变量
if (!process.env.DATABASE_URL && !process.env.S3_BUCKET_NAME) {
  console.log('📝 加载本地 .env 文件...')
  require('dotenv').config({ path: '/Users/cerfbaleine/workspace/busrom-work/cms/.env' })
} else {
  console.log('⚡ 使用环境变量')
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
const bucketName = 'busrom-media-production' // 强制使用 production bucket

console.log(`🪣 Bucket: ${bucketName}\n`)

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
 * 生成Keystone格式的随机ID
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
 * 根据S3路径解析标签和元数据
 */
function parsePathInfo(s3Key) {
  // s3Key: 01-glass-standoff/scene-images/group-01/scene-03/01-standoff-scene-001.jpg
  const parts = s3Key.split('/')
  const filename = parts[parts.length - 1]

  let tags = ['series-glass-standoff'] // 默认产品系列标签
  let metadata = {}

  if (s3Key.includes('/square/')) {
    tags.push('scene-square', 'scene-standalone')
    // 提取场景编号 (01-standoff-scene-XXX.jpg -> XXX)
    const match = filename.match(/scene-(\d+)/)
    if (match) metadata.sceneNumber = match[1]
  } else if (s3Key.includes('/group-01/common/')) {
    tags.push('scene-combination', 'scene-series')
    metadata.combinationNumber = '01'
  } else if (s3Key.includes('/group-01/scene-')) {
    tags.push('scene-combination', 'scene-single')
    // 提取场景编号 (group-01/scene-03/ -> 03)
    const sceneMatch = s3Key.match(/scene-(\d+)\//)
    if (sceneMatch) metadata.sceneNumber = sceneMatch[1]
    metadata.combinationNumber = '01'
  } else if (s3Key.includes('/group-02/common/')) {
    tags.push('scene-combination', 'scene-series')
    metadata.combinationNumber = '02'
  } else if (s3Key.includes('/group-02/scene-')) {
    tags.push('scene-combination', 'scene-single')
    const sceneMatch = s3Key.match(/scene-(\d+)\//)
    if (sceneMatch) metadata.sceneNumber = sceneMatch[1]
    metadata.combinationNumber = '02'
  }

  return { tags, metadata }
}

/**
 * 生成唯一文件名
 */
function generateUniqueFilename(s3Key) {
  const parts = s3Key.split('/')
  const originalFilename = parts[parts.length - 1]
  const ext = path.extname(originalFilename)
  const base = path.basename(originalFilename, ext)

  // s3Key: 01-glass-standoff/scene-images/square/01-standoff-scene-001.jpg
  //   -> 01-standoff-square-001.jpg
  // s3Key: 01-glass-standoff/scene-images/group-01/scene-03/01-standoff-scene-001.jpg
  //   -> 01-standoff-group01-scene03-001.jpg

  if (s3Key.includes('/square/')) {
    // 提取编号
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-square-${num}${ext}`
  } else if (s3Key.includes('/group-01/common/')) {
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-group01-common-${num}${ext}`
  } else if (s3Key.includes('/group-01/scene-')) {
    const sceneMatch = s3Key.match(/scene-(\d+)\//)
    const sceneNum = sceneMatch ? sceneMatch[1] : '01'
    const fileMatch = originalFilename.match(/scene-(\d+)/)
    const fileNum = fileMatch ? fileMatch[1] : '001'
    return `01-standoff-group01-scene${sceneNum}-${fileNum}${ext}`
  } else if (s3Key.includes('/group-02/common/')) {
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-group02-common-${num}${ext}`
  } else if (s3Key.includes('/group-02/scene-')) {
    const sceneMatch = s3Key.match(/scene-(\d+)\//)
    const sceneNum = sceneMatch ? sceneMatch[1] : '01'
    const fileMatch = originalFilename.match(/scene-(\d+)/)
    const fileNum = fileMatch ? fileMatch[1] : '001'
    return `01-standoff-group02-scene${sceneNum}-${fileNum}${ext}`
  }

  return originalFilename
}

/**
 * 导入单个文件
 */
async function importFile(s3Key, tagCache) {
  const filename = generateUniqueFilename(s3Key)

  // 检查是否已存在
  const existing = await prisma.media.findFirst({
    where: { filename }
  })

  if (existing) {
    console.log(`⏭️  跳过: ${filename} (已存在)`)
    return { status: 'skipped' }
  }

  // 获取文件信息
  const fileInfo = await getS3FileInfo(s3Key)

  // 生成Keystone ID和目标路径
  const keystoneId = generateKeystoneId()
  const ext = path.extname(filename)
  const destKey = `${keystoneId}${ext}`

  // 复制到Keystone格式路径
  const copyCommand = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${s3Key}`,
    Key: destKey,
  })

  try {
    await s3Client.send(copyCommand)
  } catch (error) {
    console.error(`❌ 复制失败: ${filename}`, error.message)
    return { status: 'failed', error: error.message }
  }

  // 解析标签和元数据
  const { tags: tagSlugs, metadata } = parsePathInfo(s3Key)

  // 获取标签ID
  const tagIds = []
  for (const slug of tagSlugs) {
    if (tagCache[slug]) {
      tagIds.push(tagCache[slug])
    }
  }

  // 创建Media记录
  try {
    await prisma.media.create({
      data: {
        filename,
        fileSize: fileInfo.size,
        fileKey: destKey,
        file_extension: ext.replace('.', ''),
        mimeType: fileInfo.contentType,
        tags: {
          connect: tagIds.map(id => ({ id }))
        },
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      }
    })

    console.log(`✅ ${filename}`)
    console.log(`   标签: ${tagSlugs.join(', ')}`)
    if (Object.keys(metadata).length > 0) {
      console.log(`   元数据: ${JSON.stringify(metadata)}`)
    }

    return { status: 'imported' }
  } catch (error) {
    console.error(`❌ 创建记录失败: ${filename}`, error.message)
    return { status: 'failed', error: error.message }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📥 导入缺失的场景图...\n')

  // 1. 获取所有需要的标签
  console.log('🏷️  加载标签...')
  const tagSlugs = [
    'series-glass-standoff',
    'scene-square',
    'scene-standalone',
    'scene-combination',
    'scene-series',
    'scene-single',
  ]

  const tagCache = {}
  for (const slug of tagSlugs) {
    const tag = await prisma.mediaTag.findFirst({
      where: { slug }
    })
    if (tag) {
      tagCache[slug] = tag.id
      console.log(`   ✓ ${slug}`)
    } else {
      console.log(`   ⚠️  未找到: ${slug}`)
    }
  }

  // 2. 列出要导入的文件
  console.log('\n📂 扫描 S3 文件...')

  const prefixes = [
    '01-glass-standoff/scene-images/square/',
    '01-glass-standoff/scene-images/group-01/',
    '01-glass-standoff/scene-images/group-02/',
  ]

  let allFiles = []
  for (const prefix of prefixes) {
    const files = await listS3Files(prefix)
    allFiles = allFiles.concat(files)
  }

  console.log(`   找到 ${allFiles.length} 个文件\n`)

  // 3. 导入文件
  console.log('📥 开始导入...\n')

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const s3Key of allFiles) {
    const result = await importFile(s3Key, tagCache)

    if (result.status === 'imported') imported++
    else if (result.status === 'skipped') skipped++
    else failed++
  }

  console.log('\n📊 导入统计:')
  console.log(`   ✅ 导入: ${imported}`)
  console.log(`   ⏭️  跳过: ${skipped}`)
  console.log(`   ❌ 失败: ${failed}`)
  console.log(`   📁 总计: ${allFiles.length}`)

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
