#!/usr/bin/env tsx

/**
 * 自动生成 metadata 配置文件
 *
 * 根据 products 文件夹结构自动生成所有的 metadata 配置文件
 *
 * 使用方法:
 *   tsx scripts/generate-metadata-configs.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const PRODUCTS_DIR = path.join(__dirname, '../../products')
const METADATA_DIR = path.join(__dirname, 'metadata')

// 产品系列映射
const PRODUCT_SERIES_MAP: Record<string, string> = {
  '01-glass-standoff': 'series-glass-standoff',
  '02-glass-connected-fitting': 'series-glass-connected-fitting',
  '03-glass-fence-spigot': 'series-glass-fence-spigot',
  '04-guardrail-glass-clip': 'series-guardrail-glass-clip',
  '05-bathroom-glass-clip': 'series-bathroom-glass-clip',
  '06-glass-hinge': 'series-glass-hinge',
  '07-sliding-door-kit': 'series-sliding-door-kit',
  '08-bathroom-handle': 'series-bathroom-handle',
  '09-door-handle': 'series-door-handle',
  '10-hidden-hook': 'series-hidden-hook',
}

// 图片类型映射
const IMAGE_TYPE_MAP: Record<string, string> = {
  'product-images': 'product-image',
  'scene-images': 'scene-image',
  'actual-photos': 'actual-photo',
  'dimension-images': 'dimension-image',
  'installation-images': 'installation-image',
  'detail-images': 'detail-image',
  'combined-images': 'combined-image',
  'multi-style-images': 'multi-style-image',
  'color-images': 'color-display',
  'common-images': 'common-image',
  'manufacturing': 'manufacturing',
  'packages': 'package-image',
}

// 规格映射 (子文件夹名 -> tag slug)
const SPEC_MAP: Record<string, string> = {
  'general': 'spec-general',
  'common': 'spec-common',
  'featured': 'spec-featured',
  // 玻璃连接件
  'combined-elbow-adjustable': 'spec-combined-elbow-adjustable',
  'combined-elbow-fixed': 'spec-combined-elbow-fixed',
  'combined-flat-fixed': 'spec-combined-flat-fixed',
  'integrated-elbow-adjustable': 'spec-integrated-elbow-adjustable',
  'integrated-elbow-fixed': 'spec-integrated-elbow-fixed',
  'integrated-flat-fixed': 'spec-integrated-flat-fixed',
  // 玻璃栏杆立柱
  'round-head': 'spec-round-head',
  'square-head': 'spec-square-head',
  // 角度
  'angle-0': 'spec-angle-0',
  'angle-90': 'spec-angle-90',
  'angle-90-single': 'spec-angle-90-single',
  'angle-90-double': 'spec-angle-90-double',
  'angle-90-beveled': 'spec-angle-90-beveled',
  'angle-135': 'spec-angle-135',
  'angle-180': 'spec-angle-180',
  'angle-360': 'spec-angle-360',
  // 形状
  'circle': 'spec-circle',
  'semicircle-arc': 'spec-semicircle-arc',
  'semicircle-flat': 'spec-semicircle-flat',
  'square-arc': 'spec-square-arc',
  'square-flat': 'spec-square-flat',
  'various': 'spec-various',
  // 门拉手
  'featured-bathroom': 'spec-featured-bathroom',
  'featured-combined': 'spec-featured-combined',
  'featured-cylinder': 'spec-featured-cylinder',
  'featured-glass-door': 'spec-featured-glass-door',
  'featured-square': 'spec-featured-square',
  'main-bathroom': 'spec-main-bathroom',
  'main-combined': 'spec-main-combined',
  'main-cylinder': 'spec-main-cylinder',
  'main-glass-door': 'spec-main-glass-door',
  'main-square': 'spec-main-square',
  // 挂钩
  'single-hook-economy': 'spec-single-hook-economy',
  'single-hook-premium': 'spec-single-hook-premium',
  'double-hook': 'spec-double-hook',
}

// 场景类型映射
const SCENE_MAP: Record<string, string> = {
  'handrail-fitting': 'scene-handrail-fitting',
  'glass-connector': 'scene-glass-connector',
  'bathroom-series': 'scene-bathroom',
  'guardrail-series': 'scene-guardrail',
  'outdoor': 'scene-outdoor',
  'indoor': 'scene-indoor',
  'standalone': 'scene-standalone',
  'closeup': 'scene-closeup',
  'rectangular': 'scene-rectangular',
  'square': 'scene-square',
}

interface MetadataConfig {
  s3Prefix: string
  primaryCategory: string
  tags: string[]
  defaultMetadata: {
    seriesNumber?: number
    [key: string]: any
  }
}

/**
 * 递归扫描目录，查找包含图片的最底层文件夹
 */
function findImageFolders(dir: string, basePath: string, productDir: string, imageTypeDir: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  // 检查当前目录是否有图片文件
  const hasImages = entries.some(entry =>
    entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)
  )

  if (hasImages) {
    // 当前目录有图片，返回相对路径
    const relativePath = path.relative(basePath, dir)
    results.push(relativePath || '.')
  }

  // 递归扫描子目录
  const subDirs = entries.filter(entry => entry.isDirectory())
  for (const subDir of subDirs) {
    const subPath = path.join(dir, subDir.name)
    results.push(...findImageFolders(subPath, basePath, productDir, imageTypeDir))
  }

  return results
}

/**
 * 从路径中提取标签
 */
function extractTags(pathParts: string[], seriesTag: string): string[] {
  const tags = [seriesTag]

  for (const part of pathParts) {
    // 检查规格映射
    if (SPEC_MAP[part]) {
      tags.push(SPEC_MAP[part])
    }
    // 检查场景映射
    if (SCENE_MAP[part]) {
      tags.push(SCENE_MAP[part])
    }
  }

  return tags
}

/**
 * 从路径中提取元数据
 */
function extractMetadata(pathParts: string[]): any {
  const metadata: any = {}

  for (const part of pathParts) {
    // 系列编号 (s01, s02, ...)
    const seriesMatch = part.match(/^s(\d+)$/)
    if (seriesMatch) {
      metadata.seriesNumber = parseInt(seriesMatch[1], 10)
    }

    // 场景编号 (scene-01, scene-02, ...)
    const sceneMatch = part.match(/^scene-(\d+)$/)
    if (sceneMatch) {
      metadata.sceneNumber = parseInt(sceneMatch[1], 10)
    }

    // 组合编号 (group-01, group-02, ...)
    const groupMatch = part.match(/^group-(\d+)$/)
    if (groupMatch) {
      metadata.combinationNumber = parseInt(groupMatch[1], 10)
    }

    // 系列编号 (series-01, series-02, ...)
    const seriesMatch2 = part.match(/^series-(\d+)$/)
    if (seriesMatch2) {
      metadata.seriesNumber = parseInt(seriesMatch2[1], 10)
    }
  }

  return metadata
}

/**
 * 扫描目录并生成配置
 */
function scanAndGenerateConfigs() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`❌ 产品目录不存在: ${PRODUCTS_DIR}`)
    process.exit(1)
  }

  if (!fs.existsSync(METADATA_DIR)) {
    fs.mkdirSync(METADATA_DIR, { recursive: true })
  }

  const productDirs = fs
    .readdirSync(PRODUCTS_DIR)
    .filter(name => {
      const fullPath = path.join(PRODUCTS_DIR, name)
      return fs.statSync(fullPath).isDirectory() && name.match(/^\d{2}-/)
    })
    .sort()

  console.log(`📦 找到 ${productDirs.length} 个产品系列`)
  console.log()

  let configCount = 0

  for (const productDir of productDirs) {
    const productPath = path.join(PRODUCTS_DIR, productDir)
    const seriesTag = PRODUCT_SERIES_MAP[productDir]

    if (!seriesTag) {
      console.warn(`⚠️  跳过未知产品: ${productDir}`)
      continue
    }

    console.log(`🔍 扫描: ${productDir}`)

    // 扫描图片类型文件夹
    const imageTypeDirs = fs
      .readdirSync(productPath)
      .filter(name => {
        const fullPath = path.join(productPath, name)
        return fs.statSync(fullPath).isDirectory() && IMAGE_TYPE_MAP[name]
      })

    for (const imageTypeDir of imageTypeDirs) {
      const imageTypePath = path.join(productPath, imageTypeDir)
      const categorySlug = IMAGE_TYPE_MAP[imageTypeDir]

      // 递归查找所有包含图片的文件夹
      const imageFolders = findImageFolders(imageTypePath, imageTypePath, productDir, imageTypeDir)

      for (const folder of imageFolders) {
        const folderPath = folder === '.' ? '' : folder + '/'
        const s3Prefix = `${productDir}/${imageTypeDir}/${folderPath}`

        // 从路径提取标签和元数据
        const pathParts = folder === '.' ? [] : folder.split(path.sep)
        const tags = extractTags(pathParts, seriesTag)
        const metadata = extractMetadata(pathParts)

        const config: MetadataConfig = {
          s3Prefix,
          primaryCategory: categorySlug,
          tags,
          defaultMetadata: metadata,
        }

        // 生成配置文件名
        const folderName = folder === '.' ? 'root' : folder.replace(/\//g, '-').replace(/\\/g, '-')
        const configFilename = `${productDir.replace(/^\d{2}-/, '')}-${imageTypeDir}-${folderName}.json`

        saveConfig(configFilename, config)
        configCount++
        console.log(`  ✅ ${configFilename}`)
      }
    }

    console.log()
  }

  console.log('═══════════════════════════════════════')
  console.log(`✅ 生成了 ${configCount} 个配置文件`)
  console.log(`📁 位置: ${METADATA_DIR}`)
  console.log('═══════════════════════════════════════')
}

/**
 * 保存配置文件
 */
function saveConfig(filename: string, config: MetadataConfig) {
  const filepath = path.join(METADATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(config, null, 2))
}

/**
 * 主函数
 */
function main() {
  console.log('════════════════════════════════════════════════════════════════')
  console.log('  自动生成 Metadata 配置文件')
  console.log('════════════════════════════════════════════════════════════════')
  console.log()
  console.log(`📁 产品目录: ${PRODUCTS_DIR}`)
  console.log(`💾 输出目录: ${METADATA_DIR}`)
  console.log()

  scanAndGenerateConfigs()
}

main()
