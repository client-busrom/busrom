import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { trafficSummary } from '@/db/schema'
import { eq, gte, lte, and as drizzleAnd } from 'drizzle-orm'
import { runETL, type ETLResult } from '@/jobs/etl'
import {
  getTrafficSummary,
  getVisitorPaths,
  getPathInsights,
  getPathInsightsByType,
  getPopularPaths,
  getSearchKeywords,
  getDefaultDateRange,
  getDateDaysAgo,
} from '@/lib/analytics-queries'
import { logAudit, getEffectiveUserRole } from '@/lib/audit'
import { maskSensitiveData } from '@/lib/masking'

/**
 * GET /api/analytics/summary
 *
 * 查询汇总数据
 * Query params:
 * - date: 指定日期 (YYYY-MM-DD)
 * - startDate: 开始日期
 * - endDate: 结束日期
 * - pagePath: 页面路径（可选）
 * - channel: 渠道（可选）
 * - type: 数据类型 (summary | paths | path-insights | keywords | overview |
 *                  top-pages | device-breakdown | browser-breakdown | country-breakdown |
 *                  channel-bounce | lead-stats | entry-pages | exit-pages | popular-paths)
 *         注：export 不是本端点支持的数据类型，文件导出请使用 /api/analytics/export。
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const pagePath = searchParams.get('pagePath')
    const channel = searchParams.get('channel')
    const type = searchParams.get('type') || 'summary'

    const userRole = getEffectiveUserRole(request)

    // 根据类型返回不同数据
    if (type === 'paths') {
      const results = await getVisitorPaths(date, startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'keywords') {
      const results = await getSearchKeywords(date, startDate, endDate)
      await logAudit({
        request,
        action: 'view_report',
        resourceType: 'keywords',
        details: { type, date, startDate, endDate },
      })
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'path-insights') {
      const results = await getPathInsights(date, startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: Object.values(results).flat().length })
    }

    if (type === 'overview') {
      const overview = await getOverview(date, startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(overview, userRole) })
    }

    if (type === 'top-pages') {
      const results = await getTopPages(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'device-breakdown') {
      const results = await getDeviceBreakdown(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole) })
    }

    if (type === 'browser-breakdown') {
      const results = await getBrowserBreakdown(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole) })
    }

    if (type === 'country-breakdown') {
      const results = await getCountryBreakdown(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole) })
    }

    if (type === 'channel-bounce') {
      const results = await getChannelBounce(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'lead-stats') {
      const results = await getLeadStats(startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole) })
    }

    if (type === 'entry-pages') {
      const results = await getEntryPages(date, startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'exit-pages') {
      const results = await getExitPages(date, startDate, endDate)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    if (type === 'popular-paths') {
      const results = await getPopularPaths(date, startDate, endDate, 10)
      return NextResponse.json({ success: true, data: maskSensitiveData(results, userRole), count: results.length })
    }

    // 默认 summary
    const results = await getTrafficSummary(date, startDate, endDate, pagePath, channel)

    return NextResponse.json({
      success: true,
      data: maskSensitiveData(results, userRole),
      count: results.length,
    })

  } catch (error) {
    console.error('[Summary API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOverview(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  // 如果没有指定日期，使用最近7天
  const effectiveStartDate = startDate || getDateDaysAgo(6)
  const effectiveEndDate = endDate || getDateDaysAgo(0)

  const current = await getOverviewMetrics(effectiveStartDate, effectiveEndDate)

  // 计算前一个等长日期范围的变化
  const periodDays = diffDaysInclusive(effectiveStartDate, effectiveEndDate)
  const prevStartDate = addDays(effectiveStartDate, -periodDays)
  const prevEndDate = addDays(effectiveStartDate, -1)
  const previous = await getOverviewMetrics(prevStartDate, prevEndDate)

  return {
    dateRange: { startDate: effectiveStartDate, endDate: effectiveEndDate },
    totalPV: current.totalPV,
    totalUV: current.totalUV,
    totalSessions: current.totalSessions,
    totalConversions: current.totalConversions,
    totalFormSubmissions: current.totalFormSubmissions,
    totalLeads: current.totalLeads,
    avgBounceRate: current.avgBounceRate,
    avgConversionRate: current.avgConversionRate,
    avgFormConversionRate: current.avgFormConversionRate,
    avgDuration: current.avgDuration,
    pvPerSession: current.pvPerSession,
    records: current.records,
    pvChange: computeChange(current.totalPV, previous.totalPV),
    uvChange: computeChange(current.totalUV, previous.totalUV),
    sessionsChange: computeChange(current.totalSessions, previous.totalSessions),
    conversionsChange: computeChange(current.totalConversions, previous.totalConversions),
    formSubmissionsChange: computeChange(current.totalFormSubmissions, previous.totalFormSubmissions),
    leadsChange: computeChange(current.totalLeads, previous.totalLeads),
    conversionRateChange: computeChange(current.avgConversionRate, previous.avgConversionRate),
    formConversionRateChange: computeChange(current.avgFormConversionRate, previous.avgFormConversionRate),
    bounceRateChange: computeChange(current.avgBounceRate, previous.avgBounceRate),
    avgDurationChange: computeChange(current.avgDuration, previous.avgDuration),
    // 每日趋势明细（含各指标日环比/周环比/月环比）
    dailyTrends: current.dailyTrends,
  }
}

async function getOverviewMetrics(startDate: string, endDate: string) {
  const conditions = [
    gte(trafficSummary.date, startDate),
    lte(trafficSummary.date, endDate),
    eq(trafficSummary.pagePath, 'all'),
    eq(trafficSummary.channel, 'all'),
  ]

  const results = await db
    .select()
    .from(trafficSummary)
    .where(drizzleAnd(...conditions))

  const totalPV = results.reduce((sum, r) => sum + r.pv, 0)
  const totalUV = results.reduce((sum, r) => sum + r.uv, 0)
  const totalSessions = results.reduce((sum, r) => sum + r.sessions, 0)
  const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0)
  const totalFormSubmissions = results.reduce((sum, r) => sum + r.formSubmissions, 0)
  const totalLeads = results.reduce((sum, r) => sum + r.leads, 0)

  const avgBounceRate = totalSessions > 0
    ? results.reduce((sum, r) => sum + (r.bounceRate || 0) * r.sessions, 0) / totalSessions
    : 0
  const avgConversionRate = totalSessions > 0 ? totalConversions / totalSessions : 0
  const avgFormConversionRate = totalSessions > 0 ? totalFormSubmissions / totalSessions : 0
  const avgDuration = totalSessions > 0
    ? results.reduce((sum, r) => sum + (r.avgDuration || 0) * r.sessions, 0) / totalSessions
    : 0
  const pvPerSession = totalSessions > 0 ? totalPV / totalSessions : 0

  return {
    totalPV,
    totalUV,
    totalSessions,
    totalConversions,
    totalFormSubmissions,
    totalLeads,
    avgBounceRate: Math.round(avgBounceRate * 100) / 100,
    avgConversionRate: Math.round(avgConversionRate * 10000) / 10000,
    avgFormConversionRate: Math.round(avgFormConversionRate * 10000) / 10000,
    avgDuration: Math.round(avgDuration * 100) / 100,
    pvPerSession: Math.round(pvPerSession * 100) / 100,
    records: results.length,
    dailyTrends: results
      .filter((r) => r.pagePath === 'all' && r.channel === 'all')
      .map((r) => ({
        date: r.date,
        pv: r.pv,
        uv: r.uv,
        sessions: r.sessions,
        bounceRate: r.bounceRate,
        avgDuration: r.avgDuration,
        conversions: r.conversions,
        formSubmissions: r.formSubmissions,
        leads: r.leads,
        conversionRate: r.conversionRate,
        formConversionRate: r.formConversionRate,
        pvChangeDay: r.pvChangeDay,
        pvChangeWeek: r.pvChangeWeek,
        pvChangeMonth: r.pvChangeMonth,
        uvChangeDay: r.uvChangeDay,
        uvChangeWeek: r.uvChangeWeek,
        uvChangeMonth: r.uvChangeMonth,
        sessionsChangeDay: r.sessionsChangeDay,
        sessionsChangeWeek: r.sessionsChangeWeek,
        sessionsChangeMonth: r.sessionsChangeMonth,
        conversionsChangeDay: r.conversionsChangeDay,
        conversionsChangeWeek: r.conversionsChangeWeek,
        conversionsChangeMonth: r.conversionsChangeMonth,
        formSubmissionsChangeDay: r.formSubmissionsChangeDay,
        formSubmissionsChangeWeek: r.formSubmissionsChangeWeek,
        formSubmissionsChangeMonth: r.formSubmissionsChangeMonth,
        leadsChangeDay: r.leadsChangeDay,
        leadsChangeWeek: r.leadsChangeWeek,
        leadsChangeMonth: r.leadsChangeMonth,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function diffDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00').getTime()
  const end = new Date(endDate + 'T00:00:00').getTime()
  return Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1
}

function computeChange(current: number, previous: number): number {
  if (!previous || previous === 0) return 0
  return Math.round(((current - previous) / previous) * 10000) / 10000
}

async function getTopPages(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({
      pagePath: trafficSummary.pagePath,
      pv: trafficSummary.pv,
      uv: trafficSummary.uv,
      sessions: trafficSummary.sessions,
      bounceRate: trafficSummary.bounceRate,
    })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd),
      )
    )

  const map = new Map<string, { pv: number; uv: number; sessions: number; bounceRateSum: number; bounceRateSessions: number }>()
  for (const item of results) {
    const existing = map.get(item.pagePath) || {
      pv: 0,
      uv: 0,
      sessions: 0,
      bounceRateSum: 0,
      bounceRateSessions: 0,
    }
    existing.pv += item.pv
    existing.uv += item.uv
    existing.sessions += item.sessions
    if (item.bounceRate !== null && item.sessions > 0) {
      existing.bounceRateSum += item.bounceRate * item.sessions
      existing.bounceRateSessions += item.sessions
    }
    map.set(item.pagePath, existing)
  }

  return Array.from(map.entries())
    .map(([pagePath, values]) => ({
      pagePath,
      pv: values.pv,
      uv: values.uv,
      sessions: values.sessions,
      bounceRate:
        values.bounceRateSessions > 0
          ? Math.round((values.bounceRateSum / values.bounceRateSessions) * 100) / 100
          : 0,
    }))
    .filter((item) => item.pagePath !== 'all')
    .sort((a, b) => b.pv - a.pv)
    .slice(0, 10)
}

async function getDeviceBreakdown(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({ deviceBreakdown: trafficSummary.deviceBreakdown })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd)
      )
    )

  const map = new Map<string, number>()
  for (const item of results) {
    if (!item.deviceBreakdown || typeof item.deviceBreakdown !== 'object') continue
    for (const [device, count] of Object.entries(item.deviceBreakdown)) {
      map.set(device, (map.get(device) || 0) + (Number(count) || 0))
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

async function getBrowserBreakdown(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({ browserBreakdown: trafficSummary.browserBreakdown })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd)
      )
    )

  const map = new Map<string, number>()
  for (const item of results) {
    if (!item.browserBreakdown || typeof item.browserBreakdown !== 'object') continue
    for (const [browser, count] of Object.entries(item.browserBreakdown)) {
      map.set(browser, (map.get(browser) || 0) + (Number(count) || 0))
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

async function getCountryBreakdown(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({ countryBreakdown: trafficSummary.countryBreakdown })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd)
      )
    )

  const map = new Map<string, number>()
  for (const item of results) {
    if (!item.countryBreakdown || typeof item.countryBreakdown !== 'object') continue
    for (const [country, count] of Object.entries(item.countryBreakdown)) {
      map.set(country, (map.get(country) || 0) + (Number(count) || 0))
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

async function getChannelBounce(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({
      channel: trafficSummary.channel,
      bounceRate: trafficSummary.bounceRate,
      sessions: trafficSummary.sessions,
    })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd)
      )
    )

  const map = new Map<
    string,
    { sessions: number; bounceRateSum: number }
  >()
  for (const item of results) {
    if (item.channel === 'all') continue
    const existing = map.get(item.channel) || { sessions: 0, bounceRateSum: 0 }
    existing.sessions += item.sessions
    if (item.bounceRate !== null && item.sessions > 0) {
      existing.bounceRateSum += item.bounceRate * item.sessions
    }
    map.set(item.channel, existing)
  }

  return Array.from(map.entries())
    .map(([channel, values]) => ({
      channel,
      sessions: values.sessions,
      bounceRate:
        values.sessions > 0
          ? Math.round((values.bounceRateSum / values.sessions) * 10000) / 10000
          : 0,
    }))
    .sort((a, b) => b.bounceRate - a.bounceRate)
}

async function getLeadStats(
  startDate: string | null,
  endDate: string | null
) {
  const { startDate: effectiveStart, endDate: effectiveEnd } =
    startDate && endDate
      ? { startDate, endDate }
      : getDefaultDateRange(6)

  const results = await db
    .select({
      date: trafficSummary.date,
      pagePath: trafficSummary.pagePath,
      channel: trafficSummary.channel,
      sessions: trafficSummary.sessions,
      leads: trafficSummary.leads,
      formSubmissions: trafficSummary.formSubmissions,
    })
    .from(trafficSummary)
    .where(
      drizzleAnd(
        gte(trafficSummary.date, effectiveStart),
        lte(trafficSummary.date, effectiveEnd)
      )
    )

  // 全站 totals 使用聚合行（pagePath='all', channel='all'）避免按页面汇总时重复计数
  const aggregateRows = results.filter(
    (r) => r.pagePath === 'all' && r.channel === 'all'
  )
  const totalLeads = aggregateRows.reduce((sum, r) => sum + r.leads, 0)
  const totalSessions = aggregateRows.reduce((sum, r) => sum + r.sessions, 0)
  const totalFormSubmissions = aggregateRows.reduce(
    (sum, r) => sum + r.formSubmissions,
    0
  )

  const byPage = new Map<string, { leads: number; sessions: number }>()
  const byChannel = new Map<string, { leads: number; sessions: number }>()

  for (const item of results) {
    if (item.pagePath !== 'all') {
      const existing = byPage.get(item.pagePath) || { leads: 0, sessions: 0 }
      existing.leads += item.leads
      existing.sessions += item.sessions
      byPage.set(item.pagePath, existing)
    }

    if (item.channel !== 'all') {
      const existing = byChannel.get(item.channel) || { leads: 0, sessions: 0 }
      existing.leads += item.leads
      existing.sessions += item.sessions
      byChannel.set(item.channel, existing)
    }
  }

  return {
    totalLeads,
    totalSessions,
    leadRate: totalSessions > 0 ? Math.round((totalLeads / totalSessions) * 10000) / 10000 : 0,
    totalFormSubmissions,
    byPage: Array.from(byPage.entries())
      .map(([pagePath, values]) => ({
        pagePath,
        leads: values.leads,
        sessions: values.sessions,
        leadRate: values.sessions > 0 ? Math.round((values.leads / values.sessions) * 10000) / 10000 : 0,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10),
    byChannel: Array.from(byChannel.entries())
      .map(([channel, values]) => ({
        channel,
        leads: values.leads,
        sessions: values.sessions,
        leadRate: values.sessions > 0 ? Math.round((values.leads / values.sessions) * 10000) / 10000 : 0,
      }))
      .sort((a, b) => b.leads - a.leads),
  }
}

async function getEntryPages(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const items = await getPathInsightsByType('entry_pages', date, startDate, endDate, 10)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return items.map((item) => ({
    pagePath: item.insightKey,
    count: item.value,
    share: total > 0 ? Math.round((item.value / total) * 10000) / 10000 : 0,
    conversionCount: item.conversionCount,
    conversionRate: item.conversionRate,
  }))
}

async function getExitPages(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const items = await getPathInsightsByType('exit_pages', date, startDate, endDate, 10)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return items.map((item) => ({
    pagePath: item.insightKey,
    count: item.value,
    share: total > 0 ? Math.round((item.value / total) * 10000) / 10000 : 0,
    conversionCount: item.conversionCount,
    conversionRate: item.conversionRate,
  }))
}

/**
 * POST /api/analytics/summary?action=run-etl
 *
 * 手动触发 ETL 任务。需要 Payload CMS JWT 认证（middleware 已保护 /api/analytics）
 * 或提供 ETL_API_KEY header（供内部 cron/CI 使用）。
 *
 * Query params:
 * - action: 必须为 'run-etl'
 * - date: 目标日期 (YYYY-MM-DD)，默认昨天
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 仅允许显式触发 ETL 的动作
    if (searchParams.get('action') !== 'run-etl') {
      return NextResponse.json(
        { error: 'Bad request', message: "Invalid action. Use '?action=run-etl'" },
        { status: 400 }
      )
    }

    // 如果 middleware 未通过 JWT 认证，则校验内部 ETL_API_KEY
    const apiKey = request.headers.get('x-etl-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
    const expectedKey = process.env.ETL_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing ETL API key' },
        { status: 401 }
      )
    }

    const date = searchParams.get('date') || undefined
    const result: ETLResult = await runETL(date)

    await logAudit({
      request,
      action: 'run_etl',
      resourceType: 'etl',
      details: { date, recordsProcessed: result.recordsProcessed, errors: result.errors },
    })

    if (result.errors.length > 0) {
      return NextResponse.json(
        { success: false, errors: result.errors, result },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('[Summary API / run-etl] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    )
  }
}
