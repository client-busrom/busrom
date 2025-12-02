#!/usr/bin/env node

const { PrismaClient } = require('../cms/node_modules/.prisma/client')

const prisma = new PrismaClient({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL
    }
  }
})

async function verifyImport() {
  console.log('🔍 验证导入结果...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 统计总数
  const totalMedia = await prisma.media.count()
  console.log(`📊 总记录数: ${totalMedia}`)
  console.log(`   预期: 2771`)
  console.log(`   ${totalMedia === 2771 ? '✅ 正确' : '❌ 不匹配'}\n`)

  // 2. 检查 file_id 唯一性
  const duplicateFileIds = await prisma.$queryRaw`
    SELECT file_id, COUNT(*) as count
    FROM "Media"
    GROUP BY file_id
    HAVING COUNT(*) > 1
  `
  console.log(`🔍 file_id 重复检查: ${duplicateFileIds.length === 0 ? '✅ 无重复' : `❌ 发现 ${duplicateFileIds.length} 个重复`}\n`)

  // 3. 检查 filename 重复情况
  const filenameStats = await prisma.$queryRaw`
    SELECT filename, COUNT(*) as count
    FROM "Media"
    GROUP BY filename
    ORDER BY count DESC
    LIMIT 10
  `
  console.log(`📊 filename 重复统计 (前10个):`)
  filenameStats.forEach(row => {
    console.log(`   ${row.count}x ${row.filename}`)
  })
  console.log()

  // 4. 检查 metadata 字段
  const withMetadata = await prisma.media.count({
    where: {
      NOT: { metadata: null }
    }
  })
  console.log(`📊 有 metadata 的记录: ${withMetadata}/${totalMedia}`)
  console.log(`   ${withMetadata === totalMedia ? '✅ 全部' : '⚠️ 部分缺失'}\n`)

  // 5. 检查 metadata 数字格式
  const sampleMetadata = await prisma.media.findFirst({
    where: {
      NOT: { metadata: null }
    },
    select: { metadata: true, filename: true }
  })
  if (sampleMetadata) {
    console.log(`📊 metadata 格式检查:`)
    console.log(`   示例文件: ${sampleMetadata.filename}`)
    console.log(`   seriesNumber: ${sampleMetadata.metadata.seriesNumber} (${typeof sampleMetadata.metadata.seriesNumber})`)
    if (sampleMetadata.metadata.combinationNumber) {
      console.log(`   combinationNumber: ${sampleMetadata.metadata.combinationNumber} (${typeof sampleMetadata.metadata.combinationNumber})`)
    }
    if (sampleMetadata.metadata.sceneNumber) {
      console.log(`   sceneNumber: ${sampleMetadata.metadata.sceneNumber} (${typeof sampleMetadata.metadata.sceneNumber})`)
    }
    console.log(`   ${typeof sampleMetadata.metadata.seriesNumber === 'number' ? '✅ 数字格式' : '❌ 非数字格式'}\n`)
  }

  // 6. 检查 variants 字段
  const withVariants = await prisma.media.count({
    where: {
      NOT: [
        { variants: null },
        { variants: {} }
      ]
    }
  })
  console.log(`📊 有 variants 的记录: ${withVariants}/${totalMedia}`)
  console.log(`   ${withVariants === totalMedia ? '✅ 全部' : '⚠️ 部分缺失'}\n`)

  // 7. 检查尺寸信息
  const withDimensions = await prisma.media.count({
    where: {
      AND: [
        { NOT: { width: null } },
        { NOT: { height: null } },
        { NOT: { fileSize: null } }
      ]
    }
  })
  console.log(`📊 有尺寸信息的记录: ${withDimensions}/${totalMedia}`)
  console.log(`   ${withDimensions === totalMedia ? '✅ 全部' : '⚠️ 部分缺失'}\n`)

  // 8. 抽样检查
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📝 抽样检查 (3条记录):\n')

  const samples = await prisma.media.findMany({
    take: 3,
    include: {
      primaryCategory: true,
      tags: true
    }
  })

  samples.forEach((record, i) => {
    console.log(`记录 ${i + 1}:`)
    console.log(`  filename: ${record.filename}`)
    console.log(`  file_id: ${record.file_id}`)
    console.log(`  尺寸: ${record.width}x${record.height}`)
    console.log(`  文件大小: ${record.fileSize} bytes`)
    console.log(`  primaryCategory: ${record.primaryCategory?.name || 'null'}`)
    console.log(`  tags: ${record.tags?.length || 0} 个`)
    console.log(`  metadata: ${JSON.stringify(record.metadata).substring(0, 100)}...`)
    console.log(`  variants: ${record.variants ? Object.keys(record.variants).join(', ') : 'null'}`)
    console.log()
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n✨ 验证完成!`)

  await prisma.$disconnect()
}

verifyImport().catch(console.error)
