/**
 * 临时脚本：验证新增的 CDP analytics API 端点
 *
 * 直接导入 Next.js route handlers 并构造 NextRequest 调用，
 * 避免依赖运行中的 dev server。
 */
import 'dotenv/config'
import { NextRequest } from 'next/server'
import { GET as summaryGet } from '../src/app/api/analytics/summary/route'
import { GET as exportGet } from '../src/app/api/analytics/export/route'

const baseUrl = 'http://localhost/api/analytics'

async function callSummary(type: string, extra = '') {
  const request = new NextRequest(`${baseUrl}/summary?type=${type}${extra}`, { method: 'GET' })
  const response = await summaryGet(request)
  const json = await response.json()
  return { status: response.status, json }
}

async function callExport(type: string, extra = '') {
  const request = new NextRequest(`${baseUrl}/export?type=${type}${extra}`, { method: 'GET' })
  const response = await exportGet(request)
  const contentType = response.headers.get('content-type') || ''
  let body: unknown
  if (contentType.includes('application/json')) {
    body = await response.json()
  } else {
    body = await response.text()
  }
  return { status: response.status, contentType, body }
}

function assertShape(name: string, data: any, shape: Record<string, string>) {
  for (const [key, type] of Object.entries(shape)) {
    if (!(key in data)) {
      throw new Error(`${name}: missing field ${key}`)
    }
    if (typeof data[key] !== type) {
      throw new Error(`${name}: field ${key} expected ${type}, got ${typeof data[key]}`)
    }
  }
}

async function main() {
  console.log('=== Verifying new CDP analytics APIs ===\n')

  // 1. overview - should include formConversionRate, leads, trends
  const overview = await callSummary('overview', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('overview:', overview.status, JSON.stringify(overview.json, null, 2).slice(0, 400))
  if (overview.status !== 200 || !overview.json.success) throw new Error('overview failed')
  assertShape('overview.data', overview.json.data, {
    totalPV: 'number',
    totalUV: 'number',
    totalSessions: 'number',
    totalLeads: 'number',
    avgFormConversionRate: 'number',
    pvPerSession: 'number',
    avgDuration: 'number',
    dailyTrends: 'object',
  })
  if (overview.json.data.dailyTrends.length === 0) {
    throw new Error('overview dailyTrends is empty')
  }
  console.log('✅ overview OK\n')

  // 2. lead-stats
  const leadStats = await callSummary('lead-stats', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('lead-stats:', leadStats.status, JSON.stringify(leadStats.json, null, 2).slice(0, 400))
  if (leadStats.status !== 200 || !leadStats.json.success) throw new Error('lead-stats failed')
  assertShape('lead-stats.data', leadStats.json.data, {
    totalLeads: 'number',
    totalSessions: 'number',
    leadRate: 'number',
    totalFormSubmissions: 'number',
    byPage: 'object',
    byChannel: 'object',
  })
  console.log('✅ lead-stats OK\n')

  // 3. entry-pages
  const entryPages = await callSummary('entry-pages', '&date=2026-06-23')
  console.log('entry-pages:', entryPages.status, JSON.stringify(entryPages.json, null, 2).slice(0, 400))
  if (entryPages.status !== 200 || !entryPages.json.success) throw new Error('entry-pages failed')
  if (!Array.isArray(entryPages.json.data) || entryPages.json.data.length === 0) {
    throw new Error('entry-pages data empty')
  }
  assertShape('entry-pages[0]', entryPages.json.data[0], {
    pagePath: 'string',
    count: 'number',
    share: 'number',
  })
  console.log('✅ entry-pages OK\n')

  // 4. exit-pages
  const exitPages = await callSummary('exit-pages', '&date=2026-06-23')
  console.log('exit-pages:', exitPages.status, JSON.stringify(exitPages.json, null, 2).slice(0, 400))
  if (exitPages.status !== 200 || !exitPages.json.success) throw new Error('exit-pages failed')
  if (!Array.isArray(exitPages.json.data) || exitPages.json.data.length === 0) {
    throw new Error('exit-pages data empty')
  }
  assertShape('exit-pages[0]', exitPages.json.data[0], {
    pagePath: 'string',
    count: 'number',
    share: 'number',
  })
  console.log('✅ exit-pages OK\n')

  // 5. popular-paths
  const popularPaths = await callSummary('popular-paths', '&date=2026-06-23')
  console.log('popular-paths:', popularPaths.status, JSON.stringify(popularPaths.json, null, 2).slice(0, 400))
  if (popularPaths.status !== 200 || !popularPaths.json.success) throw new Error('popular-paths failed')
  if (!Array.isArray(popularPaths.json.data) || popularPaths.json.data.length === 0) {
    throw new Error('popular-paths data empty')
  }
  assertShape('popular-paths[0]', popularPaths.json.data[0], {
    insightKey: 'string',
    value: 'number',
  })
  console.log('✅ popular-paths OK\n')

  // 6. channel-bounce (existing, ensure still works)
  const channelBounce = await callSummary('channel-bounce', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('channel-bounce:', channelBounce.status, JSON.stringify(channelBounce.json, null, 2).slice(0, 400))
  if (channelBounce.status !== 200 || !channelBounce.json.success) throw new Error('channel-bounce failed')
  console.log('✅ channel-bounce OK\n')

  // 7. export - overview
  const exportOverview = await callExport('overview', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('export overview:', exportOverview.status, exportOverview.contentType)
  if (exportOverview.status !== 200) throw new Error('export overview failed')
  console.log('✅ export overview OK\n')

  // 8. export - lead-stats
  const exportLeads = await callExport('lead-stats', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('export lead-stats:', exportLeads.status, exportLeads.contentType)
  if (exportLeads.status !== 200) throw new Error('export lead-stats failed')
  console.log('✅ export lead-stats OK\n')

  // 9. export - entry-pages
  const exportEntry = await callExport('entry-pages', '&date=2026-06-23')
  console.log('export entry-pages:', exportEntry.status, exportEntry.contentType)
  if (exportEntry.status !== 200) throw new Error('export entry-pages failed')
  console.log('✅ export entry-pages OK\n')

  // 10. export - exit-pages
  const exportExit = await callExport('exit-pages', '&date=2026-06-23')
  console.log('export exit-pages:', exportExit.status, exportExit.contentType)
  if (exportExit.status !== 200) throw new Error('export exit-pages failed')
  console.log('✅ export exit-pages OK\n')

  // 11. export - popular-paths
  const exportPaths = await callExport('popular-paths', '&date=2026-06-23')
  console.log('export popular-paths:', exportPaths.status, exportPaths.contentType)
  if (exportPaths.status !== 200) throw new Error('export popular-paths failed')
  console.log('✅ export popular-paths OK\n')

  // 12. export - channel-bounce
  const exportBounce = await callExport('channel-bounce', '&startDate=2026-06-17&endDate=2026-06-23')
  console.log('export channel-bounce:', exportBounce.status, exportBounce.contentType)
  if (exportBounce.status !== 200) throw new Error('export channel-bounce failed')
  console.log('✅ export channel-bounce OK\n')

  console.log('=== All new APIs verified successfully ===')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
