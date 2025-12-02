#!/usr/bin/env node

/**
 * Clear All Media Data Script
 *
 * 清空所有媒体相关数据（用于重新初始化）
 *
 * 此脚本会清空:
 * 1. Media 表（所有媒体记录）
 * 2. MediaTag 表（所有标签）
 * 3. MediaCategory 表（所有分类）
 * 4. S3 bucket 中的所有图片和变体
 *
 * 使用方法:
 *
 * 1. 本地 MinIO:
 *    node scripts/clear-all-media-data.js
 *
 * 2. AWS Staging:
 *    DATABASE_URL="postgresql://..." \
 *    S3_BUCKET_NAME="busrom-media-staging" \
 *    S3_REGION="us-east-1" \
 *    AWS_ACCESS_KEY_ID="..." \
 *    AWS_SECRET_ACCESS_KEY="..." \
 *    node scripts/clear-all-media-data.js
 *
 * 3. AWS Production:
 *    DATABASE_URL="postgresql://..." \
 *    S3_BUCKET_NAME="busrom-media-production" \
 *    S3_REGION="us-east-1" \
 *    AWS_ACCESS_KEY_ID="..." \
 *    AWS_SECRET_ACCESS_KEY="..." \
 *    node scripts/clear-all-media-data.js
 *
 * 安全提示:
 * - 脚本会等待 10 秒让你确认
 * - 添加 --force 跳过确认
 * - 添加 --dry-run 只显示将要删除的内容
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ============================================================
// 环境变量处理
// ============================================================
const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  USE_MINIO: process.env.USE_MINIO,
}

// 判断运行环境
const isProduction = savedEnv.DATABASE_URL && savedEnv.DATABASE_URL.includes('rds.amazonaws.com')
const isStaging = savedEnv.DATABASE_URL && savedEnv.DATABASE_URL.includes('staging')

if (!savedEnv.DATABASE_URL) {
  console.log('📝 加载本地 .env 文件...')
  const envPath = path.join(__dirname, '../cms/.env')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
  }
} else {
  console.log('⚡ 使用环境变量')
  Object.keys(savedEnv).forEach(key => {
    if (savedEnv[key]) process.env[key] = savedEnv[key]
  })
}

// ============================================================
// 动态加载依赖
// ============================================================
let PrismaClient
const prismaPath = path.join(__dirname, '../cms/node_modules/.prisma/client')
PrismaClient = require(prismaPath).PrismaClient

const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3')

// ============================================================
// 初始化客户端
// ============================================================
const dbUrl = savedEnv.DATABASE_URL || process.env.DATABASE_URL
const bucketName = savedEnv.S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'busrom-media'

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: dbUrl,
    },
  },
  log: ['error', 'warn'],
})

// S3 配置
const s3Config = {
  region: savedEnv.S3_REGION || process.env.S3_REGION || 'us-east-1',
}

// MinIO 配置
if (process.env.USE_MINIO === 'true' || process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
  s3Config.forcePathStyle = true
  s3Config.credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  }
} else if (savedEnv.S3_ACCESS_KEY_ID) {
  // AWS 凭证
  s3Config.credentials = {
    accessKeyId: savedEnv.S3_ACCESS_KEY_ID,
    secretAccessKey: savedEnv.S3_SECRET_ACCESS_KEY,
  }
}

const s3Client = new S3Client(s3Config)

// ============================================================
// 解析参数
// ============================================================
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isForce = args.includes('--force')

// ============================================================
// 工具函数
// ============================================================

/**
 * 列出 S3 bucket 中的所有对象
 */
async function listAllS3Objects() {
  const objects = []
  let continuationToken = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      objects.push(...response.Contents)
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return objects
}

/**
 * 批量删除 S3 对象 (每次最多 1000 个)
 */
async function deleteS3Objects(keys) {
  if (keys.length === 0) return 0

  let deletedCount = 0
  const batchSize = 1000

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize)
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: batch.map(key => ({ Key: key })),
        Quiet: true,
      },
    })

    await s3Client.send(command)
    deletedCount += batch.length
    console.log(`   已删除 ${deletedCount}/${keys.length} 个文件...`)
  }

  return deletedCount
}

/**
 * 用户确认
 */
async function confirmAction() {
  if (isForce) return true

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    console.log('\n⚠️  警告: 此操作将删除所有媒体数据且不可恢复!')
    console.log('请输入 "DELETE" 确认删除，或按 Ctrl+C 取消:\n')

    rl.question('> ', (answer) => {
      rl.close()
      resolve(answer.trim() === 'DELETE')
    })
  })
}

// ============================================================
// 主函数
// ============================================================
async function main() {
  console.log('\n' + '═'.repeat(60))
  console.log('  清空所有媒体数据')
  console.log('  Clear All Media Data')
  console.log('═'.repeat(60))

  // 显示环境信息
  const envLabel = isProduction ? '🔴 PRODUCTION' : isStaging ? '🟡 STAGING' : '🟢 LOCAL'
  console.log(`\n📍 环境: ${envLabel}`)
  console.log(`🔗 数据库: ${dbUrl?.substring(0, 50)}...`)
  console.log(`🪣 S3 Bucket: ${bucketName}`)

  if (isDryRun) {
    console.log(`\n🔍 模式: DRY RUN (只显示，不实际删除)`)
  }

  // 获取当前数据统计
  console.log('\n📊 当前数据统计:')

  const mediaCount = await prisma.media.count()
  const tagCount = await prisma.mediaTag.count()
  const categoryCount = await prisma.mediaCategory.count()

  console.log(`   Media: ${mediaCount} 条`)
  console.log(`   MediaTag: ${tagCount} 条`)
  console.log(`   MediaCategory: ${categoryCount} 条`)

  // 获取 S3 对象统计
  console.log('\n   正在统计 S3 文件...')
  const s3Objects = await listAllS3Objects()
  console.log(`   S3 文件: ${s3Objects.length} 个`)

  // 计算总大小
  const totalSize = s3Objects.reduce((sum, obj) => sum + (obj.Size || 0), 0)
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
  console.log(`   S3 总大小: ${totalSizeMB} MB`)

  if (isDryRun) {
    console.log('\n✅ DRY RUN 完成，以上数据将被删除')
    console.log('   运行时不带 --dry-run 来实际执行删除\n')
    return
  }

  // 确认删除
  const confirmed = await confirmAction()
  if (!confirmed) {
    console.log('\n❌ 操作已取消\n')
    return
  }

  console.log('\n🗑️  开始清空数据...\n')

  // Step 1: 删除 Media 表的关联关系
  console.log('1️⃣  清空 Media 关联关系...')
  try {
    await prisma.$executeRaw`DELETE FROM "_Media_tags"`
    console.log('   ✅ _Media_tags 已清空')
  } catch (e) {
    console.log('   ⚠️  _Media_tags 表不存在或已清空')
  }

  try {
    await prisma.$executeRaw`DELETE FROM "_Media_tagsFilter"`
    console.log('   ✅ _Media_tagsFilter 已清空')
  } catch (e) {
    console.log('   ⚠️  _Media_tagsFilter 表不存在或已清空')
  }

  // Step 2: 删除 Media 记录
  console.log('\n2️⃣  清空 Media 表...')
  const mediaResult = await prisma.media.deleteMany({})
  console.log(`   ✅ 已删除 ${mediaResult.count} 条 Media 记录`)

  // Step 3: 删除 MediaTag 记录
  console.log('\n3️⃣  清空 MediaTag 表...')
  const tagResult = await prisma.mediaTag.deleteMany({})
  console.log(`   ✅ 已删除 ${tagResult.count} 条 MediaTag 记录`)

  // Step 4: 删除 MediaCategory 记录
  console.log('\n4️⃣  清空 MediaCategory 表...')
  const categoryResult = await prisma.mediaCategory.deleteMany({})
  console.log(`   ✅ 已删除 ${categoryResult.count} 条 MediaCategory 记录`)

  // Step 5: 清空 S3 bucket
  console.log('\n5️⃣  清空 S3 bucket...')
  if (s3Objects.length > 0) {
    const keys = s3Objects.map(obj => obj.Key)
    const deletedCount = await deleteS3Objects(keys)
    console.log(`   ✅ 已删除 ${deletedCount} 个 S3 文件`)
  } else {
    console.log('   ✅ S3 bucket 已经是空的')
  }

  // 完成
  console.log('\n' + '═'.repeat(60))
  console.log('  ✨ 清空完成!')
  console.log('═'.repeat(60))
  console.log('\n下一步:')
  console.log('  1. 重启 CMS 服务，让 seed 脚本自动创建新的分类和标签')
  console.log('  2. 使用批量上传脚本导入新的媒体文件\n')
}

main()
  .catch(err => {
    console.error('\n❌ 错误:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
