#!/usr/bin/env node

/**
 * 批量从 S3 导入图片记录到 CMS
 *
 * 使用场景：
 * 1. 先通过 AWS CLI 或 mc 批量上传图片到 MinIO/S3
 * 2. 再运行此脚本批量创建 CMS 数据库记录
 *
 * 使用方法：
 * 1. 准备 metadata 配置文件（JSON 格式）
 * 2. 从 cms 目录运行: npx tsx ../scripts/batch-import-from-s3.ts <metadata-file>
 *
 * 示例:
 *   cd cms
 *   npx tsx ../scripts/batch-import-from-s3.ts ../scripts/metadata/test-import.json
 */

// 动态导入 - 需要从 cms 目录运行
import('node:fs').then(() => {}).catch(() => {})

const { PrismaClient } = await import('.prisma/client')
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// S3 配置
const s3Config = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  },
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true, // MinIO 需要
}

const s3Client = new S3Client(s3Config)
const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'

interface MetadataConfig {
  // S3 路径配置
  s3Prefix?: string // S3 路径前缀，例如 "01-glass-standoff/product-images/s01/"
  s3Keys?: string[] // 直接指定 S3 key 列表

  // CMS 配置
  primaryCategory: string // MediaCategory slug
  tags: string[] // MediaTag slug 列表

  // 默认 metadata（应用到所有文件）
  defaultMetadata?: {
    seriesNumber?: number
    combinationNumber?: number
    sceneNumber?: number
    specs?: string[]
    colors?: string[]
    [key: string]: any
  }

  // 单个文件的 metadata 覆盖
  fileMetadata?: {
    [filename: string]: {
      seriesNumber?: number
      combinationNumber?: number
      sceneNumber?: number
      specs?: string[]
      colors?: string[]
      [key: string]: any
    }
  }

  // 批量命名规则（可选）
  namingPattern?: {
    prefix?: string // 文件名前缀
    suffix?: string // 文件名后缀
  }
}

/**
 * 从 S3 获取文件列表
 */
async function listS3Files(prefix?: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  })

  const response = await s3Client.send(command)
  const files = response.Contents || []

  return files
    .filter(file => {
      const key = file.Key || ''
      // 排除目录和 variants 文件夹
      return key && !key.endsWith('/') && !key.includes('variants/')
    })
    .map(file => file.Key!)
}

/**
 * 获取 S3 文件的元信息
 */
async function getS3FileInfo(key: string) {
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
 * 查找或创建 MediaCategory
 */
async function findOrCreateCategory(slug: string) {
  let category = await prisma.mediaCategory.findUnique({
    where: { slug },
  })

  if (!category) {
    console.warn(`⚠️  警告: 未找到 MediaCategory "${slug}"，跳过...`)
    return null
  }

  return category
}

/**
 * 查找 MediaTags
 */
async function findTags(slugs: string[]) {
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
async function createMediaRecord(
  s3Key: string,
  fileInfo: { size: number; contentType: string; lastModified?: Date },
  config: MetadataConfig
) {
  const filename = path.basename(s3Key)
  const ext = path.extname(filename).toLowerCase()
  const basename = path.basename(filename, ext)

  // 查找 category
  const category = await findOrCreateCategory(config.primaryCategory)
  if (!category) {
    console.error(`❌ 跳过文件 ${filename}: 未找到分类`)
    return null
  }

  // 查找 tags
  const tags = await findTags(config.tags)

  // 合并 metadata
  const fileSpecificMetadata = config.fileMetadata?.[filename] || {}
  const metadata = {
    ...config.defaultMetadata,
    ...fileSpecificMetadata,
  }

  // 生成唯一的 file_id (使用 basename 或 UUID)
  const fileId = basename

  // 检查是否已存在
  const existing = await prisma.mediaFile.findUnique({
    where: { file_id: fileId },
  })

  if (existing) {
    console.warn(`⚠️  文件已存在，跳过: ${filename}`)
    return existing
  }

  // 创建记录
  const mediaFile = await prisma.mediaFile.create({
    data: {
      file_id: fileId,
      file_extension: ext.replace('.', ''),
      filename,
      original_filename: filename,
      filesize: fileInfo.size,
      width: null, // 需要后续更新
      height: null, // 需要后续更新
      category: { connect: { id: category.id } },
      tags: { connect: tags.map(t => ({ id: t.id })) },
      metadata: metadata as any,
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
    console.log('  tsx scripts/batch-import-from-s3.ts <metadata-file>')
    console.log('\n示例:')
    console.log('  tsx scripts/batch-import-from-s3.ts metadata/glass-standoff-s01.json')
    process.exit(1)
  }

  const configFile = args[0]

  if (!fs.existsSync(configFile)) {
    console.error(`❌ 错误: 配置文件不存在: ${configFile}`)
    process.exit(1)
  }

  // 读取配置
  const config: MetadataConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'))

  console.log('📋 批量导入配置:')
  console.log(`  分类: ${config.primaryCategory}`)
  console.log(`  标签: ${config.tags.join(', ')}`)
  if (config.s3Prefix) {
    console.log(`  S3 路径: ${config.s3Prefix}`)
  }
  console.log()

  // 获取 S3 文件列表
  let s3Keys: string[] = []

  if (config.s3Keys && config.s3Keys.length > 0) {
    // 使用指定的文件列表
    s3Keys = config.s3Keys
    console.log(`📦 使用指定的文件列表 (${s3Keys.length} 个文件)`)
  } else if (config.s3Prefix) {
    // 从 S3 路径前缀获取
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
    } catch (error: any) {
      console.error(`❌ 错误: ${s3Key}`, error.message)
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
