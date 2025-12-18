/**
 * Fill Media Metadata from Filename - Production
 *
 * This script parses filenames and fills in empty metadata
 */

const { Client } = require('pg')

const DATABASE_URL = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms'

function parseFilename(filename) {
  if (!filename) return {}

  // 去掉扩展名
  const name = filename.replace(/\.[^.]+$/, '')
  const parts = name.split('_')

  const result = {}

  // 最后一个数字部分通常是图片编号
  const lastPart = parts[parts.length - 1]
  if (/^\d+$/.test(lastPart)) {
    result.imageNumber = parseInt(lastPart, 10)
  }

  // 检测图片类型
  if (parts.includes('scene')) {
    result.type = 'scene'
  } else if (parts.includes('effect')) {
    result.type = 'effect'
  } else {
    result.type = 'product'
  }

  // 解析其他部分
  const subTypes = []
  for (const part of parts) {
    // 系列编号 s-1, s-2, s-13 等
    if (/^s-\d+$/i.test(part)) {
      result.seriesNumber = parseInt(part.replace(/^s-/i, ''), 10)
    }
    // 场景编号 sn-1, sn-3 等
    else if (/^sn-\d+$/i.test(part)) {
      result.sceneNumber = parseInt(part.replace(/^sn-/i, ''), 10)
    }
    // 组编号 g-1, g-2, g-01 等
    else if (/^g-\d+$/i.test(part)) {
      result.group = parseInt(part.replace(/^g-/i, ''), 10)
    }
    // 颜色 black, silver, gold, white 等
    else if (['black', 'silver', 'gold', 'rose-gold', 'brushed', 'polished', 'chrome', 'white', 'matte'].includes(part.toLowerCase())) {
      result.color = part.toLowerCase()
    }
    // 角度 90deg 等
    else if (/^\d+deg$/i.test(part)) {
      result.angle = parseInt(part.replace(/deg$/i, ''), 10)
    }
    // 视角
    else if (['close', 'wide', 'detail', 'front', 'back', 'side'].includes(part.toLowerCase())) {
      result.view = part.toLowerCase()
    }
    // 类型标识
    else if (['flat', 'guardrail', 'bathroom', 'door', 'handle', 'combo', 'kitchen', 'living', 'bedroom', 'office', 'n'].includes(part.toLowerCase())) {
      subTypes.push(part.toLowerCase())
    }
  }

  if (subTypes.length === 1) {
    result.subType = subTypes[0]
  } else if (subTypes.length > 1) {
    result.subType = subTypes.join('-')
  }

  return result
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('🔧 Connected to production database\n')

    // 获取所有 metadata 为空的记录
    const result = await client.query(`
      SELECT id, filename
      FROM "Media"
      WHERE metadata IS NULL OR metadata = '{}'
    `)

    console.log(`📊 Found ${result.rows.length} media files with empty metadata\n`)

    let updatedCount = 0
    let skippedCount = 0
    const batchSize = 100

    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, i + batchSize)

      for (const media of batch) {
        const metadata = parseFilename(media.filename)

        if (Object.keys(metadata).length > 0) {
          await client.query(
            `UPDATE "Media" SET metadata = $1 WHERE id = $2`,
            [JSON.stringify(metadata), media.id]
          )
          updatedCount++
        } else {
          skippedCount++
        }
      }

      // 进度显示
      const progress = Math.round((i + batch.length) / result.rows.length * 100)
      process.stdout.write(`\r⏳ Progress: ${progress}% (${i + batch.length}/${result.rows.length})`)
    }

    console.log('\n\n✅ Migration complete!')
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Skipped: ${skippedCount}`)

    // 显示几个示例
    console.log('\n📋 Sample results:')
    const samples = await client.query(`
      SELECT id, filename, metadata
      FROM "Media"
      WHERE metadata IS NOT NULL AND metadata != '{}'
      LIMIT 5
    `)
    samples.rows.forEach(s => {
      console.log(`  ${s.filename}:`)
      console.log(`    ${JSON.stringify(s.metadata)}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
