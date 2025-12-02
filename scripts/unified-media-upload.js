#!/usr/bin/env node

/**
 * 统一的Media上传脚本
 * 一次性完成: 导入 + 元数据提取 + 变体生成
 *
 * 功能:
 * 1. 从本地文件夹或S3 prefix读取图片
 * 2. 上传原图到S3 (Keystone格式: 随机ID)
 * 3. 提取元数据 (width, height, fileSize, mimeType)
 * 4. 生成变体 (thumbnail, small, medium, large, xlarge, webp)
 * 5. 创建完整的Media记录
 *
 * 使用方法:
 *
 * 1. 本地 + MinIO:
 *    node scripts/unified-media-upload.js --config config.json
 *
 * 2. AWS Production:
 *    DATABASE_URL="postgresql://..." \
 *    S3_BUCKET_NAME="busrom-media-production" \
 *    S3_REGION="us-east-1" \
 *    CDN_DOMAIN="d2example.cloudfront.net" \
 *    node scripts/unified-media-upload.js --config config.json
 *
 * 配置文件格式 (config.json):
 * {
 *   "source": "local",          // "local" 或 "s3"
 *   "localPath": "./images",    // source=local时的本地路径
 *   "s3Prefix": "08-series/",   // source=s3时的S3前缀
 *   "primaryCategory": "scene",  // 分类slug: white, scene, real, size, general, combo, multi-style, showcase, effect, product, craft, packaging, color
 *   "tags": ["series-glass-standoff", "color-silver"],  // 标签slug: series-xxx (9种产品系列) 和 color-xxx (6种颜色)
 *   "defaultMetadata": {
 *     "group": 1,               // 场景分组编号 (用于场景图)
 *     "sceneNumber": 1,         // 场景编号
 *     "imageNumber": 1,         // 图片编号 (用于白底图系列编号)
 *     "specs": ["12x25mm"],     // 规格信息
 *     "notes": ""               // 备注
 *   },
 *   "fileMetadata": {
 *     "specific-file.jpg": { "sceneNumber": 2, "imageNumber": 3 }
 *   }
 * }
 *
 * 分类 (primaryCategory) 可选值:
 *   - white: 白底图
 *   - scene: 场景图
 *   - real: 实拍图
 *   - size: 尺寸图
 *   - general: 通用产品图
 *   - combo: 组合展示图
 *   - multi-style: 多款式图
 *   - showcase: 橱窗展示图
 *   - effect: 效果图
 *   - product: 产品主图
 *   - craft: 工艺图
 *   - packaging: 包装图
 *   - color: 颜色展示图
 *
 * 标签 (tags) 可选值:
 *   产品系列:
 *     - series-glass-standoff: 广告螺丝
 *     - series-glass-connected-fitting: 玻璃栏杆扶手连接件
 *     - series-glass-fence-spigot: 玻璃护栏支架底座
 *     - series-guardrail-glass-clip: 护栏系列
 *     - series-bathroom-glass-clip: 浴室系列
 *     - series-glass-hinge: 浴室夹
 *     - series-sliding-door-kit: 移门滑轮套装
 *     - series-bathroom-door-handle: 浴室门拉手
 *     - series-hidden-hook: 挂钩
 *   颜色:
 *     - color-silver: 银色
 *     - color-black: 黑色
 *     - color-gold: 金色
 *     - color-rose-gold: 玫瑰金
 *     - color-brushed: 拉丝
 *     - color-polished: 抛光
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// ============================================================
// 环境变量处理
// ============================================================
const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  CDN_DOMAIN: process.env.CDN_DOMAIN,
  USE_MINIO: process.env.USE_MINIO,
}

// 判断运行环境
const isDocker = fs.existsSync('/app/cms')
const isProduction = !!savedEnv.DATABASE_URL && savedEnv.DATABASE_URL.includes('rds.amazonaws.com')

if (!savedEnv.DATABASE_URL) {
  console.log('📝 加载本地 .env 文件...')
  const envPath = isDocker ? '/app/.env' : path.join(__dirname, '../cms/.env')
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath })
  }
} else {
  console.log('⚡ 使用环境变量 (production模式)')
  Object.keys(savedEnv).forEach(key => {
    if (savedEnv[key]) process.env[key] = savedEnv[key]
  })
}

// ============================================================
// 动态加载依赖
// ============================================================
let PrismaClient
if (isDocker) {
  console.log('🐳 Docker环境')
  PrismaClient = require('/app/cms/node_modules/.prisma/client').PrismaClient
} else {
  console.log('💻 本地环境')
  const prismaPath = path.join(__dirname, '../cms/node_modules/.prisma/client')
  PrismaClient = require(prismaPath).PrismaClient
}

const sharp = require('sharp')
const {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand
} = require('@aws-sdk/client-s3')

// ============================================================
// 初始化客户端
// ============================================================
const dbUrl = savedEnv.DATABASE_URL || process.env.DATABASE_URL
console.log(`🔗 Database: ${dbUrl?.substring(0, 50)}...`)

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: dbUrl,
    },
  },
  log: ['error', 'warn'],
})

// S3配置
const s3Config = {
  region: savedEnv.S3_REGION || process.env.S3_REGION || 'us-east-1',
}

// 本地MinIO配置
if (process.env.USE_MINIO === 'true' || process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
  s3Config.forcePathStyle = true
  s3Config.credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',
  }
}

const s3Client = new S3Client(s3Config)
const bucketName = savedEnv.S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'busrom-media'

console.log(`🪣 Bucket: ${bucketName}`)

// CDN域名
let cdnDomain = savedEnv.CDN_DOMAIN || process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'
if (cdnDomain && !cdnDomain.startsWith('http') && cdnDomain.includes('cloudfront.net')) {
  cdnDomain = `https://${cdnDomain}`
}
console.log(`🌐 CDN: ${cdnDomain}`)

// ============================================================
// 工具函数
// ============================================================

/**
 * 生成Keystone格式的随机ID
 */
function generateKeystoneId() {
  return crypto.randomBytes(16).toString('base64url').substring(0, 22)
}

/**
 * 从文件名解析 metadata
 * 文件名格式示例:
 *   - glass-standoff_white_106.jpg -> { imageNumber: 106 }
 *   - bathroom-door-handle_scene_g-01_close_001.jpg -> { group: "g-01", imageNumber: 1 }
 *   - glass-connected-fitting_white_s-3_black_001.jpg -> { seriesNumber: "s-3", color: "black", imageNumber: 1 }
 */
function parseFilenameMetadata(filename) {
  // 去掉扩展名
  const name = filename.replace(/\.[^.]+$/, '')
  const parts = name.split('_')

  const result = {}

  // 最后一个数字部分通常是图片编号
  const lastPart = parts[parts.length - 1]
  if (/^\d+$/.test(lastPart)) {
    result.imageNumber = parseInt(lastPart)
  }

  const subTypes = []

  // 解析其他部分
  for (const part of parts) {
    // 系列编号 s-1, s-2, s-13 等
    if (/^s-\d+$/i.test(part)) {
      result.seriesNumber = part
    }
    // 场景编号 sn-1, sn-3 等
    else if (/^sn-\d+$/i.test(part)) {
      result.sceneNumber = part
    }
    // 组编号 g-1, g-2, g-01, g-02 等
    else if (/^g-\d+$/i.test(part)) {
      result.group = part
    }
    // 颜色 black, silver, gold 等
    else if (['black', 'silver', 'gold', 'rose-gold', 'brushed', 'polished', 'chrome'].includes(part.toLowerCase())) {
      result.color = part.toLowerCase()
    }
    // 角度 90deg 等
    else if (/^\d+deg$/i.test(part)) {
      result.angle = part
    }
    // 类型标识
    else if (['flat', 'guardrail', 'bathroom', 'n', 'door', 'handle', 'combo', 'close', 'far', 'detail'].includes(part.toLowerCase())) {
      subTypes.push(part.toLowerCase())
    }
  }

  // 如果有 subTypes，合并
  if (subTypes.length === 1) {
    result.subType = subTypes[0]
  } else if (subTypes.length > 1) {
    result.subType = subTypes.join('-')
  }

  return result
}

/**
 * 从本地文件获取所有图片
 */
function getLocalFiles(localPath) {
  const files = []
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  function walkDir(dir) {
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if (supportedExtensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walkDir(localPath)
  return files
}

/**
 * 从S3获取文件列表
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
 * 从S3下载文件
 */
async function downloadFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  const response = await s3Client.send(command)
  const chunks = []
  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/**
 * 上传文件到S3
 */
async function uploadToS3(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })
  await s3Client.send(command)
}

/**
 * 提取图片元数据
 */
async function extractImageMetadata(buffer) {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width,
    height: metadata.height,
    fileSize: buffer.length,
    mimeType: `image/${metadata.format}`,
    format: metadata.format,
  }
}

/**
 * 生成图片变体
 */
async function generateVariants(buffer, fileId, fileExtension) {
  const variants = {
    thumbnail: { width: 150, height: 150, fit: 'cover' },
    small: { width: 400, fit: 'inside' },
    medium: { width: 800, fit: 'inside' },
    large: { width: 1200, fit: 'inside' },
    xlarge: { width: 1920, fit: 'inside' },
  }

  const results = {}

  // 生成各尺寸变体
  for (const [name, config] of Object.entries(variants)) {
    try {
      const resized = sharp(buffer).resize(config.width, config.height, {
        fit: config.fit || 'inside',
        withoutEnlargement: true,
      })

      const variantBuffer = await resized.toBuffer()
      const s3Key = `variants/${name}/${fileId}.${fileExtension}`

      await uploadToS3(s3Key, variantBuffer, `image/${fileExtension}`)

      // 生成URL
      const variantUrl = cdnDomain.includes('cloudfront.net')
        ? `${cdnDomain}/${s3Key}`
        : `${cdnDomain}/${bucketName}/${s3Key}`

      results[name] = variantUrl
    } catch (err) {
      console.warn(`  ⚠️  ${name} variant失败: ${err.message}`)
    }
  }

  // 生成WebP版本
  try {
    const webpBuffer = await sharp(buffer)
      .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const s3Key = `variants/webp/${fileId}.webp`
    await uploadToS3(s3Key, webpBuffer, 'image/webp')

    const webpUrl = cdnDomain.includes('cloudfront.net')
      ? `${cdnDomain}/${s3Key}`
      : `${cdnDomain}/${bucketName}/${s3Key}`

    results.webp = webpUrl
  } catch (err) {
    console.warn(`  ⚠️  webp variant失败: ${err.message}`)
  }

  return results
}

/**
 * 处理单个文件 - 核心函数
 */
async function processFile(filePath, config, isS3Source) {
  const filename = path.basename(filePath)
  const ext = path.extname(filename).toLowerCase().replace('.', '')
  const keystoneId = generateKeystoneId()

  console.log(`\n📄 处理: ${filename}`)

  // 检查是否已存在
  const existing = await prisma.media.findFirst({
    where: { filename: filename },
  })

  if (existing) {
    console.log(`  ⏭️  已存在,跳过`)
    return { success: false, skipped: true }
  }

  try {
    // Step 1: 获取原图buffer
    let buffer
    if (isS3Source) {
      console.log(`  📥 从S3下载...`)
      buffer = await downloadFromS3(filePath)
    } else {
      console.log(`  📥 从本地读取...`)
      buffer = fs.readFileSync(filePath)
    }

    // Step 2: 提取元数据
    console.log(`  📊 提取元数据...`)
    const metadata = await extractImageMetadata(buffer)
    console.log(`     ${metadata.width}x${metadata.height}, ${Math.round(metadata.fileSize / 1024)}KB`)

    // Step 3: 上传原图到S3 (Keystone格式)
    console.log(`  📤 上传原图: ${keystoneId}.${ext}`)
    await uploadToS3(`${keystoneId}.${ext}`, buffer, metadata.mimeType)

    // Step 4: 生成变体
    console.log(`  ✨ 生成变体...`)
    const variants = await generateVariants(buffer, keystoneId, ext)
    console.log(`     生成 ${Object.keys(variants).length} 个变体`)

    // Step 5: 查找category和tags
    const category = await prisma.mediaCategory.findUnique({
      where: { slug: config.primaryCategory },
    })

    if (!category) {
      throw new Error(`未找到分类: ${config.primaryCategory}`)
    }

    const tags = await prisma.mediaTag.findMany({
      where: { slug: { in: config.tags || [] } },
    })

    // Step 6: 合并metadata (从文件名解析 + 配置文件)
    const parsedMetadata = parseFilenameMetadata(filename)
    const fileSpecificMetadata = (config.fileMetadata && config.fileMetadata[filename]) || {}
    const combinedMetadata = {
      ...parsedMetadata,           // 从文件名解析的 metadata (最低优先级)
      ...config.defaultMetadata,   // 配置文件的默认 metadata
      ...fileSpecificMetadata,     // 配置文件的文件特定 metadata (最高优先级)
    }
    console.log(`  📋 metadata: ${JSON.stringify(combinedMetadata)}`)

    // Step 7: 生成fileUrl
    const fileUrl = cdnDomain.includes('cloudfront.net')
      ? `${cdnDomain}/${keystoneId}.${ext}`
      : `${cdnDomain}/${bucketName}/${keystoneId}.${ext}`

    // Step 8: 创建完整的Media记录
    console.log(`  💾 创建Media记录...`)
    const mediaFile = await prisma.media.create({
      data: {
        // Keystone file字段
        file_id: keystoneId,
        file_extension: ext,
        file_filesize: metadata.fileSize,
        file_width: metadata.width,
        file_height: metadata.height,

        // 独立字段
        filename: filename,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        width: metadata.width,
        height: metadata.height,
        fileUrl: fileUrl,
        fileKey: `${keystoneId}.${ext}`,

        // 变体
        variants: variants,

        // 分类和标签
        primaryCategory: { connect: { id: category.id } },
        tags: tags.length > 0 ? { connect: tags.map(t => ({ id: t.id })) } : undefined,
        tagsFilter: tags.length > 0 ? { connect: tags.map(t => ({ id: t.id })) } : undefined,

        // 元数据
        metadata: combinedMetadata,
      },
    })

    console.log(`  ✅ 完成: ID=${mediaFile.id}`)
    return { success: true, id: mediaFile.id }

  } catch (error) {
    console.error(`  ❌ 错误: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// ============================================================
// 主函数
// ============================================================
async function main() {
  const args = process.argv.slice(2)

  // 解析参数
  let configFile = null
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configFile = args[i + 1]
      i++
    } else if (args[i] === '--dry-run') {
      dryRun = true
    }
  }

  if (!configFile) {
    console.error('❌ 请提供配置文件: --config config.json')
    console.log('\n配置文件格式:')
    console.log(JSON.stringify({
      source: "local",
      localPath: "./products/glass-standoff/white",
      primaryCategory: "white",
      tags: ["series-glass-standoff"],
      defaultMetadata: {
        group: 1,
        imageNumber: 1,
        specs: ["12x25mm"]
      }
    }, null, 2))
    console.log('\n分类: white, scene, real, size, general, combo, multi-style, showcase, effect, product, craft, packaging, color')
    console.log('产品系列标签: series-glass-standoff, series-glass-connected-fitting, series-glass-fence-spigot, ...')
    console.log('颜色标签: color-silver, color-black, color-gold, color-rose-gold, color-brushed, color-polished')
    process.exit(1)
  }

  if (!fs.existsSync(configFile)) {
    console.error(`❌ 配置文件不存在: ${configFile}`)
    process.exit(1)
  }

  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))

  console.log('\n═══════════════════════════════════════')
  console.log('  统一Media上传脚本')
  console.log('═══════════════════════════════════════')
  console.log(`📋 配置文件: ${configFile}`)
  console.log(`📂 来源: ${config.source}`)
  console.log(`🏷️  分类: ${config.primaryCategory}`)
  console.log(`🔖 标签: ${(config.tags || []).join(', ')}`)
  if (dryRun) {
    console.log(`🔍 模式: DRY RUN (不会实际上传)`)
  }
  console.log('═══════════════════════════════════════\n')

  // 获取文件列表
  let files = []
  let isS3Source = false

  if (config.source === 'local') {
    if (!config.localPath) {
      console.error('❌ 本地模式需要提供 localPath')
      process.exit(1)
    }
    const absolutePath = path.resolve(config.localPath)
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ 路径不存在: ${absolutePath}`)
      process.exit(1)
    }
    console.log(`🔍 扫描本地目录: ${absolutePath}`)
    files = getLocalFiles(absolutePath)
    console.log(`📦 找到 ${files.length} 个图片文件\n`)
  } else if (config.source === 's3') {
    if (!config.s3Prefix) {
      console.error('❌ S3模式需要提供 s3Prefix')
      process.exit(1)
    }
    console.log(`🔍 扫描S3 prefix: ${config.s3Prefix}`)
    files = await listS3Files(config.s3Prefix)
    console.log(`📦 找到 ${files.length} 个文件\n`)
    isS3Source = true
  } else {
    console.error(`❌ 未知来源类型: ${config.source}`)
    process.exit(1)
  }

  if (files.length === 0) {
    console.log('⚠️  没有找到文件')
    return
  }

  if (dryRun) {
    console.log('🔍 DRY RUN - 以下文件将被处理:')
    files.forEach((f, i) => console.log(`  ${i + 1}. ${path.basename(f)}`))
    console.log('\n运行时不带 --dry-run 来实际执行')
    return
  }

  // 处理文件
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`\n[${i + 1}/${files.length}]`)

    const result = await processFile(file, config, isS3Source)

    if (result.success) {
      successCount++
    } else if (result.skipped) {
      skipCount++
    } else {
      errorCount++
    }

    // 每处理10个文件暂停一下
    if ((i + 1) % 10 === 0 && i + 1 < files.length) {
      console.log(`\n⏸️  已处理 ${i + 1} 个,暂停1秒...\n`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log('  处理完成')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`⏭️  跳过: ${skipCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${files.length}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch(err => {
    console.error('❌ 致命错误:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
