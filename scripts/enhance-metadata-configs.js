#!/usr/bin/env node

/**
 * 增强 metadata config 文件
 * 从 s3Prefix 自动提取 seriesNumber, combinationNumber, sceneNumber (数字格式)
 */

const fs = require('fs')
const path = require('path')

const METADATA_DIR = path.join(__dirname, 'metadata-generated')

function extractMetadataFromPath(s3Prefix) {
  // 示例路径:
  // "02-glass-connected-fitting/scene-images/handrail-fitting-group-03-scene-04/"
  // "01-glass-standoff/product-images/s01/"

  const parts = s3Prefix.split('/')
  const metadata = {}

  // 提取系列编号 (第一部分) - 数字格式
  const seriesMatch = parts[0]?.match(/^(\d{2})/)
  if (seriesMatch) {
    metadata.seriesNumber = parseInt(seriesMatch[1], 10)  // 转为数字
  }

  // 检查是否是场景图片
  if (parts[1] === 'scene-images') {
    // 提取组合编号和场景编号
    // 格式: "handrail-fitting-group-03-scene-04"
    const lastPart = parts[parts.length - 2] // 倒数第二个（最后是空字符串）

    const groupMatch = lastPart?.match(/group-(\d+)/)
    if (groupMatch) {
      metadata.combinationNumber = parseInt(groupMatch[1], 10)  // 转为数字
    }

    const sceneMatch = lastPart?.match(/scene-(\d+)/)
    if (sceneMatch) {
      metadata.sceneNumber = parseInt(sceneMatch[1], 10)  // 转为数字
    }
  }

  // 保存原始路径（字符串）
  metadata.originalPath = s3Prefix

  return metadata
}

async function enhanceConfigs() {
  console.log('🔄 开始增强 metadata config 文件...\n')

  const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'))
  console.log(`📁 找到 ${files.length} 个配置文件\n`)

  let updated = 0
  let skipped = 0

  for (const file of files) {
    const filepath = path.join(METADATA_DIR, file)
    const config = JSON.parse(fs.readFileSync(filepath, 'utf-8'))

    // 提取 metadata
    const extractedMetadata = extractMetadataFromPath(config.s3Prefix)

    // 检查是否需要更新
    const needsUpdate = Object.keys(extractedMetadata).some(
      key => !config.defaultMetadata[key]
    )

    if (!needsUpdate && config.defaultMetadata.originalPath) {
      skipped++
      continue
    }

    // 合并 metadata
    config.defaultMetadata = {
      ...config.defaultMetadata,
      ...extractedMetadata
    }

    // 写回文件
    fs.writeFileSync(filepath, JSON.stringify(config, null, 2) + '\n')

    console.log(`✅ ${file}`)
    console.log(`   ${JSON.stringify(extractedMetadata)}`)
    updated++
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✨ 完成! 更新了 ${updated} 个文件, 跳过 ${skipped} 个`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

enhanceConfigs().catch(console.error)
