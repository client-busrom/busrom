#!/usr/bin/env -S npx tsx

/**
 * Import Local Scene Images to MinIO and Keystone
 *
 * 从本地文件系统导入场景图到 MinIO 和 Keystone
 *
 * 导入规则：
 * - square/ -> scene-square, scene-standalone
 * - group-01/common/ -> scene-combination, scene-series
 * - group-01/scene-XX/ -> scene-combination, scene-single, sceneNumber=XX, combinationNumber=01
 * - group-02/scene-XX/ -> scene-combination, scene-single, sceneNumber=XX, combinationNumber=02
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { PrismaClient } from '.prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

// 本地MinIO配置
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123',
  },
  forcePathStyle: true,
})

const bucketName = 'busrom-media'
const baseDir = '/Users/cerfbaleine/workspace/products/01-glass-standoff/scene-images'

/**
 * 生成Keystone格式的随机ID
 */
function generateKeystoneId() {
  return crypto.randomBytes(16).toString('base64url').substring(0, 22)
}

/**
 * 根据文件路径解析标签和元数据
 */
function parsePathInfo(relativePath: string) {
  const parts = relativePath.split('/')
  const filename = parts[parts.length - 1]

  let tags = ['series-glass-standoff'] // 默认产品系列标签
  let metadata: any = {}

  if (relativePath.includes('rectangular/')) {
    tags.push('scene-rectangular', 'scene-standalone')
    // 提取场景编号 (01-standoff-scene-XXX.jpg -> XXX)
    const match = filename.match(/scene-(\d+)/)
    if (match) metadata.sceneNumber = match[1]
  } else if (relativePath.includes('square/')) {
    tags.push('scene-square', 'scene-standalone')
    // 提取场景编号 (01-standoff-scene-XXX.jpg -> XXX)
    const match = filename.match(/scene-(\d+)/)
    if (match) metadata.sceneNumber = match[1]
  } else if (relativePath.includes('group-01/common/')) {
    tags.push('scene-combination', 'scene-series')
    metadata.combinationNumber = '01'
  } else if (relativePath.includes('group-01/scene-')) {
    tags.push('scene-combination', 'scene-single')
    // 提取场景编号 (group-01/scene-03/ -> 03)
    const sceneMatch = relativePath.match(/scene-(\d+)\//)
    if (sceneMatch) metadata.sceneNumber = sceneMatch[1]
    metadata.combinationNumber = '01'
  } else if (relativePath.includes('group-02/common/')) {
    tags.push('scene-combination', 'scene-series')
    metadata.combinationNumber = '02'
  } else if (relativePath.includes('group-02/scene-')) {
    tags.push('scene-combination', 'scene-single')
    const sceneMatch = relativePath.match(/scene-(\d+)\//)
    if (sceneMatch) metadata.sceneNumber = sceneMatch[1]
    metadata.combinationNumber = '02'
  }

  return { tags, metadata }
}

/**
 * 生成唯一文件名
 */
function generateUniqueFilename(relativePath: string) {
  const parts = relativePath.split('/')
  const originalFilename = parts[parts.length - 1]
  const ext = path.extname(originalFilename)

  // rectangular/ 文件保持原文件名 (01-standoff-scene-XXX.jpg)
  if (relativePath.includes('rectangular/')) {
    return originalFilename
  } else if (relativePath.includes('square/')) {
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-square-${num}${ext}`
  } else if (relativePath.includes('group-01/common/')) {
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-group01-common-${num}${ext}`
  } else if (relativePath.includes('group-01/scene-')) {
    const sceneMatch = relativePath.match(/scene-(\d+)\//)
    const sceneNum = sceneMatch ? sceneMatch[1] : '01'
    const fileMatch = originalFilename.match(/scene-(\d+)/)
    const fileNum = fileMatch ? fileMatch[1] : '001'
    return `01-standoff-group01-scene${sceneNum}-${fileNum}${ext}`
  } else if (relativePath.includes('group-02/common/')) {
    const match = originalFilename.match(/scene-(\d+)/)
    const num = match ? match[1] : '001'
    return `01-standoff-group02-common-${num}${ext}`
  } else if (relativePath.includes('group-02/scene-')) {
    const sceneMatch = relativePath.match(/scene-(\d+)\//)
    const sceneNum = sceneMatch ? sceneMatch[1] : '01'
    const fileMatch = originalFilename.match(/scene-(\d+)/)
    const fileNum = fileMatch ? fileMatch[1] : '001'
    return `01-standoff-group02-scene${sceneNum}-${fileNum}${ext}`
  }

  return originalFilename
}

/**
 * 递归扫描目录获取所有图片文件
 */
function scanDirectory(dir: string, baseDir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath, baseDir))
    } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }

  return files
}

/**
 * 导入单个文件
 */
async function importFile(relativePath: string, tagCache: Record<string, string>) {
  const filename = generateUniqueFilename(relativePath)

  // 检查是否已存在
  const existing = await prisma.media.findFirst({
    where: { filename }
  })

  if (existing) {
    console.log(`⏭️  跳过: ${filename} (已存在)`)
    return { status: 'skipped' }
  }

  // 读取文件
  const fullPath = path.join(baseDir, relativePath)
  const fileBuffer = fs.readFileSync(fullPath)
  const stats = fs.statSync(fullPath)
  const ext = path.extname(filename)

  // 生成Keystone ID和目标路径
  const keystoneId = generateKeystoneId()
  const destKey = `${keystoneId}${ext}`

  // 上传到MinIO
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: destKey,
      Body: fileBuffer,
      ContentType: `image/${ext.replace('.', '')}`,
    }))
  } catch (error: any) {
    console.error(`❌ 上传失败: ${filename}`, error.message)
    return { status: 'failed', error: error.message }
  }

  // 解析标签和元数据
  const { tags: tagSlugs, metadata } = parsePathInfo(relativePath)

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
        fileSize: stats.size,
        fileKey: destKey,
        file_extension: ext.replace('.', ''),
        mimeType: `image/${ext.replace('.', '')}`,
        tags: {
          connect: tagIds.map(id => ({ id }))
        },
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      }
    })

    console.log(`✅ ${filename}`)
    console.log(`   标签: ${tagSlugs.join(', ')}`)
    if (Object.keys(metadata).length > 0) {
      console.log(`   元数据: ${JSON.stringify(metadata)}`)
    }

    return { status: 'imported' }
  } catch (error: any) {
    console.error(`❌ 创建记录失败: ${filename}`, error.message)
    return { status: 'failed', error: error.message }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📥 从本地文件系统导入场景图...\n')

  // 1. 获取所有需要的标签
  console.log('🏷️  加载标签...')
  const tagSlugs = [
    'series-glass-standoff',
    'scene-rectangular',
    'scene-square',
    'scene-standalone',
    'scene-combination',
    'scene-series',
    'scene-single',
  ]

  const tagCache: Record<string, string> = {}
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

  // 2. 扫描本地文件
  console.log(`\n📂 扫描本地文件: ${baseDir}`)
  const allFiles = scanDirectory(baseDir, baseDir)
  console.log(`   找到 ${allFiles.length} 个文件\n`)

  // 3. 导入文件
  console.log('📥 开始导入...\n')

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const relativePath of allFiles) {
    const result = await importFile(relativePath, tagCache)

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
