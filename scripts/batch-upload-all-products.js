#!/usr/bin/env node

/**
 * 批量上传所有产品图片到本地 MinIO + CMS
 *
 * 使用方法: node scripts/batch-upload-all-products.js
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

const PRODUCTS_DIR = '/Users/cerfbaleine/workspace/products'
const SCRIPT_DIR = path.dirname(__filename)
const CONFIG_DIR = path.join(SCRIPT_DIR, 'upload-configs')

// 确保配置目录存在
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
}

// 产品系列映射
const SERIES_TAG_MAP = {
  'glass-standoff': 'series-glass-standoff',
  'glass-connected-fitting': 'series-glass-connected-fitting',
  'glass-fence-spigot': 'series-glass-fence-spigot',
  'guardrail-glass-clip': 'series-guardrail-glass-clip',
  'bathroom-glass-clip': 'series-bathroom-glass-clip',
  'glass-hinge': 'series-glass-hinge',
  'sliding-door-kit': 'series-sliding-door-kit',
  'bathroom-door-handle': 'series-bathroom-door-handle',
  'hidden-hook': 'series-hidden-hook',
}

// 分类映射
const CATEGORY_MAP = {
  'white': 'white',
  'scene': 'scene',
  'real': 'real',
  'size': 'size',
  'general': 'general',
  'combo': 'combo',
  'multi-style': 'multi-style',
  'showcase': 'showcase',
  'effect': 'effect',
  'product': 'product',
  'craft': 'craft',
  'packaging': 'packaging',
  'color': 'color',
}

let totalUploaded = 0
let totalFailed = 0

console.log('==========================================')
console.log('  批量上传产品图片到本地 MinIO + CMS')
console.log('==========================================')
console.log('')

// 获取所有系列文件夹
const seriesDirs = fs.readdirSync(PRODUCTS_DIR)
  .filter(name => {
    const stat = fs.statSync(path.join(PRODUCTS_DIR, name))
    return stat.isDirectory() && !name.startsWith('.')
  })
  .sort()

console.log(`找到 ${seriesDirs.length} 个产品系列: ${seriesDirs.join(', ')}\n`)

// 遍历每个产品系列
for (const seriesName of seriesDirs) {
  const seriesDir = path.join(PRODUCTS_DIR, seriesName)
  const seriesTag = SERIES_TAG_MAP[seriesName]

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📦 处理系列: ${seriesName}`)
  if (seriesTag) {
    console.log(`   标签: ${seriesTag}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 获取分类文件夹
  const categoryDirs = fs.readdirSync(seriesDir)
    .filter(name => {
      const stat = fs.statSync(path.join(seriesDir, name))
      return stat.isDirectory() && !name.startsWith('.')
    })

  for (const categoryName of categoryDirs) {
    const categoryDir = path.join(seriesDir, categoryName)
    const categorySlug = CATEGORY_MAP[categoryName]

    if (!categorySlug) {
      console.log(`   ⚠️  未知分类: ${categoryName}, 跳过`)
      continue
    }

    // 统计图片数量
    const files = getImageFiles(categoryDir)
    const imageCount = files.length

    if (imageCount === 0) {
      continue
    }

    console.log('')
    console.log(`   📁 ${categoryName} (${categorySlug}): ${imageCount} 张图片`)

    // 构建标签数组
    const tags = seriesTag ? [seriesTag] : []

    // 创建配置文件
    const configFile = path.join(CONFIG_DIR, `${seriesName}-${categoryName}.json`)
    const config = {
      source: 'local',
      localPath: categoryDir,
      primaryCategory: categorySlug,
      tags: tags,
      defaultMetadata: {},
    }

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
    console.log(`      配置: ${configFile}`)

    // 执行上传
    console.log(`      上传中...`)
    try {
      const result = spawnSync('node', [
        path.join(SCRIPT_DIR, 'unified-media-upload.js'),
        '--config',
        configFile,
      ], {
        cwd: path.join(SCRIPT_DIR, '..', 'cms'),
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 600000, // 10分钟超时
      })

      if (result.status === 0) {
        // 解析输出获取成功数
        const output = result.stdout.toString()
        const match = output.match(/✅ 成功: (\d+)/)
        const successCount = match ? parseInt(match[1]) : imageCount
        totalUploaded += successCount
        console.log(`      ✅ 完成 (${successCount}张)`)

        // 显示最后几行输出
        const lines = output.trim().split('\n')
        const lastLines = lines.slice(-5)
        lastLines.forEach(line => {
          if (line.trim()) console.log(`         ${line.trim()}`)
        })
      } else {
        totalFailed += imageCount
        console.log(`      ❌ 失败`)
        if (result.stderr) {
          console.log(`      错误: ${result.stderr.toString().slice(0, 200)}`)
        }
      }
    } catch (error) {
      totalFailed += imageCount
      console.log(`      ❌ 执行失败: ${error.message}`)
    }
  }

  console.log('')
}

console.log('')
console.log('==========================================')
console.log('  上传完成!')
console.log('==========================================')
console.log(`  ✅ 成功上传: ${totalUploaded} 张`)
console.log(`  ❌ 失败: ${totalFailed} 张`)
console.log('==========================================')

function getImageFiles(dir) {
  const files = []
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir)
    for (const item of items) {
      if (item.startsWith('.')) continue
      const fullPath = path.join(currentDir, item)
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

  walkDir(dir)
  return files
}
