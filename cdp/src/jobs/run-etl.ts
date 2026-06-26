#!/usr/bin/env node
/**
 * ETL 手动运行脚本
 *
 * Usage:
 *   npx tsx src/jobs/run-etl.ts
 *   npx tsx src/jobs/run-etl.ts 2026-06-22
 */

import 'dotenv/config'
import { runETL } from './etl'
// ETL runner entry point

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      '[run-etl] 错误：未设置 DATABASE_URL 环境变量。' +
        '请在 cdp/.env 中配置 DATABASE_URL 后再运行。'
    )
    process.exit(1)
  }

  const targetDate = process.argv[2]

  console.log(`[run-etl] Starting ETL${targetDate ? ` for ${targetDate}` : ' for yesterday'}`)

  const result = await runETL(targetDate)

  console.log('[run-etl] Result:', JSON.stringify(result, null, 2))

  if (result.errors.length > 0) {
    console.error('[run-etl] Completed with errors')
    process.exit(1)
  }

  console.log('[run-etl] Completed successfully')
  process.exit(0)
}

main().catch((error) => {
  console.error('[run-etl] Unhandled error:', error)
  process.exit(1)
})
