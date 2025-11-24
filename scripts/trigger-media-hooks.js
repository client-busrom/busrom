#!/usr/bin/env node

/**
 * 触发所有Media记录的afterOperation hook
 * 通过更新每条记录来触发图片优化和metadata提取
 */

const savedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
}

if (!savedEnv.DATABASE_URL) {
  console.log('📝 加载本地 .env 文件...')
  const envPath = require('fs').existsSync('/app/.env') ? '/app/.env' : '/Users/cerfbaleine/workspace/busrom-work/cms/.env'
  require('dotenv').config({ path: envPath })
} else {
  console.log('⚡ 使用环境变量 (production模式)')
  process.env.DATABASE_URL = savedEnv.DATABASE_URL
}

let PrismaClient
try {
  PrismaClient = require('/app/cms/node_modules/.prisma/client').PrismaClient
} catch (e) {
  PrismaClient = require('/Users/cerfbaleine/workspace/busrom-work/cms/node_modules/.prisma/client').PrismaClient
}

const prisma = new PrismaClient()

async function triggerHooks() {
  console.log('🔍 查找需要处理的Media记录...')

  // 找出所有有file_id但width为null的记录 (说明没有经过hook处理)
  const mediaItems = await prisma.media.findMany({
    where: {
      file_id: { not: null },
      width: null,
    },
    select: {
      id: true,
      filename: true,
      file_id: true,
    },
  })

  console.log(`📊 找到 ${mediaItems.length} 条需要处理的记录`)

  if (mediaItems.length === 0) {
    console.log('✅ 没有需要处理的记录')
    return
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  开始触发hooks (通过GraphQL API)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let successCount = 0
  let errorCount = 0

  for (const item of mediaItems) {
    try {
      console.log(`处理: ${item.filename} (ID: ${item.file_id})`)

      // 使用GraphQL API来更新记录,这会触发afterOperation hook
      // 我们只需要做一个小的更新,比如设置metadata为它自己
      const fetch = require('node-fetch')

      const mutation = `
        mutation UpdateMedia($id: ID!) {
          updateMedia(
            where: { id: $id }
            data: { filename: "${item.filename}" }
          ) {
            id
            filename
            width
            height
          }
        }
      `

      const response = await fetch('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: item.id },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      console.log(`  ✅ 成功: ${result.data.updateMedia.width}x${result.data.updateMedia.height}`)
      successCount++

    } catch (error) {
      console.error(`  ❌ 失败: ${error.message}`)
      errorCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  处理完成')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`📊 总计: ${mediaItems.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

triggerHooks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
