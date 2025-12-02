/**
 * 从文件名解析并更新 Media 的 metadata 字段
 *
 * Usage: npx tsx scripts/update-media-metadata-from-filename.ts
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

function parseFilename(filename: string): Record<string, any> {
  // 去掉扩展名
  const name = filename.replace(/\.[^.]+$/, '')
  const parts = name.split('_')

  const result: Record<string, any> = {}

  // 最后一个数字部分通常是图片编号
  const lastPart = parts[parts.length - 1]
  if (/^\d+$/.test(lastPart)) {
    result.imageNumber = parseInt(lastPart)
  }

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
    // 组编号 g-1, g-2 等
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
    else if (['flat', 'guardrail', 'bathroom', 'n', 'door', 'handle', 'combo'].includes(part.toLowerCase())) {
      if (!result.subTypes) result.subTypes = []
      result.subTypes.push(part.toLowerCase())
    }
  }

  // 如果有多个 subTypes，合并为字符串
  if (result.subTypes && result.subTypes.length === 1) {
    result.subType = result.subTypes[0]
    delete result.subTypes
  } else if (result.subTypes) {
    result.subType = result.subTypes.join('-')
    delete result.subTypes
  }

  return result
}

async function main() {
  console.log('🔄 从文件名解析并更新 Media metadata...\n')

  // 获取所有 Media 记录
  const allMedia = await prisma.media.findMany({
    select: { id: true, filename: true, metadata: true }
  })

  console.log(`📦 找到 ${allMedia.length} 条 Media 记录\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  // 批量处理
  const batchSize = 100
  for (let i = 0; i < allMedia.length; i += batchSize) {
    const batch = allMedia.slice(i, i + batchSize)

    const updates = batch.map(media => {
      const parsed = parseFilename(media.filename || '')

      // 如果解析出了有效的 metadata
      if (Object.keys(parsed).length > 0) {
        return prisma.media.update({
          where: { id: media.id },
          data: { metadata: parsed }
        })
      }
      return null
    }).filter(Boolean)

    if (updates.length > 0) {
      try {
        await Promise.all(updates)
        updated += updates.length
        skipped += batch.length - updates.length
      } catch (error: any) {
        console.error(`❌ 批量更新失败:`, error.message)
        failed += batch.length
      }
    } else {
      skipped += batch.length
    }

    // 进度显示
    const progress = Math.round((i + batch.length) / allMedia.length * 100)
    process.stdout.write(`\r⏳ 进度: ${progress}% (${i + batch.length}/${allMedia.length})`)
  }

  console.log('\n')
  console.log('==========================================')
  console.log('  更新完成!')
  console.log('==========================================')
  console.log(`  ✅ 更新: ${updated} 条`)
  console.log(`  ⏭️  跳过: ${skipped} 条`)
  console.log(`  ❌ 失败: ${failed} 条`)
  console.log('==========================================')

  // 显示几个示例
  console.log('\n示例:')
  const samples = await prisma.media.findMany({
    take: 5,
    select: { filename: true, metadata: true }
  })
  samples.forEach(s => {
    console.log(`  ${s.filename}: ${JSON.stringify(s.metadata)}`)
  })

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
