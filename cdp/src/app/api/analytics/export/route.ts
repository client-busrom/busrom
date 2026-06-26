import { NextRequest, NextResponse } from 'next/server'
import {
  getTrafficSummary,
  getSearchKeywords,
  getPathInsights,
  getPathInsightsByType,
  getPopularPaths,
  getDefaultDateRange,
} from '@/lib/analytics-queries'
import { toCsv } from '@/lib/csv'
import { logAudit, getEffectiveUserRole } from '@/lib/audit'
import { maskSensitiveData } from '@/lib/masking'
import type { PathInsight } from '@/db/schema'

/**
 * GET /api/analytics/export
 *
 * 导出 analytics 数据为 CSV 或 JSON，供运营人员下载。
 *
 * Query params:
 * - type: 数据类型（必填）
 *         - keywords
 *         - summary
 *         - path-insights
 *         - overview
 *         - lead-stats
 *         - entry-pages
 *         - exit-pages
 *         - popular-paths
 *         - channel-bounce
 * - format: 导出格式（可选，默认 csv）
 *           - csv
 *           - json
 * - date: 指定日期 (YYYY-MM-DD)
 * - startDate: 开始日期
 * - endDate: 结束日期
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type')
    const formatParam = searchParams.get('format') || 'csv'
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!type) {
      return NextResponse.json(
        { error: 'Bad request', message: "Missing required 'type' parameter" },
        { status: 400 }
      )
    }

    const format = formatParam === 'json' ? 'json' : 'csv'
    const userRole = getEffectiveUserRole(request)

    let data: unknown
    let filename: string
    let auditAction:
      | 'export_summary'
      | 'export_keywords'
      | 'export_path_insights'
      | 'export_lead_stats'
      | 'export_channel_bounce'

    if (type === 'summary') {
      const rows = await getTrafficSummary(date, startDate, endDate, null, null)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('summary', startDate, endDate, date, format)
      auditAction = 'export_summary'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], summaryHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'keywords') {
      const rows = await getSearchKeywords(date, startDate, endDate)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('keywords', startDate, endDate, date, format)
      auditAction = 'export_keywords'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], keywordsHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'path-insights') {
      const grouped = await getPathInsights(date, startDate, endDate)
      data = maskSensitiveData(grouped, userRole)
      filename = buildFilename('path-insights', startDate, endDate, date, format)
      auditAction = 'export_path_insights'

      if (format === 'csv') {
        const rows = flattenPathInsights(data as Record<string, PathInsight[]>)
        const csv = toCsv(rows, pathInsightsHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'overview') {
      const rows = await getTrafficSummary(date, startDate, endDate, null, null)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('overview', startDate, endDate, date, format)
      auditAction = 'export_summary'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], overviewHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'lead-stats') {
      const grouped = await getPathInsights(date, startDate, endDate)
      data = maskSensitiveData(grouped, userRole)
      filename = buildFilename('lead-stats', startDate, endDate, date, format)
      auditAction = 'export_lead_stats'

      if (format === 'csv') {
        const rows = await getLeadStatsRows(date, startDate, endDate)
        const csv = toCsv(maskSensitiveData(rows, userRole), leadStatsHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'entry-pages') {
      const rows = await getPathInsightsByType('entry_pages', date, startDate, endDate, 50)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('entry-pages', startDate, endDate, date, format)
      auditAction = 'export_path_insights'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], entryExitHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'exit-pages') {
      const rows = await getPathInsightsByType('exit_pages', date, startDate, endDate, 50)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('exit-pages', startDate, endDate, date, format)
      auditAction = 'export_path_insights'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], entryExitHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'popular-paths') {
      const rows = await getPopularPaths(date, startDate, endDate, 50)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('popular-paths', startDate, endDate, date, format)
      auditAction = 'export_path_insights'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], popularPathsHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else if (type === 'channel-bounce') {
      const rows = await getChannelBounceRows(date, startDate, endDate)
      data = maskSensitiveData(rows, userRole)
      filename = buildFilename('channel-bounce', startDate, endDate, date, format)
      auditAction = 'export_channel_bounce'

      if (format === 'csv') {
        const csv = toCsv(data as Record<string, unknown>[], channelBounceHeaders)
        await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
        return csvResponse(csv, filename)
      }
    } else {
      return NextResponse.json(
        { error: 'Bad request', message: `Unsupported export type: ${type}` },
        { status: 400 }
      )
    }

    await logExportAudit(request, auditAction, { type, format, date, startDate, endDate })
    return jsonResponse(data, filename)
  } catch (error) {
    console.error('[Export API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function logExportAudit(
  request: NextRequest,
  action:
    | 'export_summary'
    | 'export_keywords'
    | 'export_path_insights'
    | 'export_lead_stats'
    | 'export_channel_bounce',
  details: Record<string, unknown>
) {
  await logAudit({
    request,
    action,
    resourceType: 'analytics',
    details,
  })
}

const summaryHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'pagePath', label: 'Page Path' },
  { key: 'channel', label: 'Channel' },
  { key: 'pv', label: 'PV' },
  { key: 'uv', label: 'UV' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'bounceRate', label: 'Bounce Rate' },
  { key: 'avgDuration', label: 'Avg Duration' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'formSubmissions', label: 'Form Submissions' },
  { key: 'conversionRate', label: 'Conversion Rate' },
  { key: 'formConversionRate', label: 'Form Conversion Rate' },
  { key: 'leads', label: 'Leads' },
  { key: 'deviceBreakdown', label: 'Device Breakdown' },
  { key: 'browserBreakdown', label: 'Browser Breakdown' },
  { key: 'countryBreakdown', label: 'Country Breakdown' },
]

const overviewHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'pagePath', label: 'Page Path' },
  { key: 'channel', label: 'Channel' },
  { key: 'pv', label: 'PV' },
  { key: 'uv', label: 'UV' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'bounceRate', label: 'Bounce Rate' },
  { key: 'avgDuration', label: 'Avg Duration' },
  { key: 'pvChangeDay', label: 'PV Change Day' },
  { key: 'pvChangeWeek', label: 'PV Change Week' },
  { key: 'pvChangeMonth', label: 'PV Change Month' },
  { key: 'uvChangeDay', label: 'UV Change Day' },
  { key: 'uvChangeWeek', label: 'UV Change Week' },
  { key: 'uvChangeMonth', label: 'UV Change Month' },
  { key: 'sessionsChangeDay', label: 'Sessions Change Day' },
  { key: 'sessionsChangeWeek', label: 'Sessions Change Week' },
  { key: 'sessionsChangeMonth', label: 'Sessions Change Month' },
  { key: 'formSubmissions', label: 'Form Submissions' },
  { key: 'formSubmissionsChangeDay', label: 'Form Submissions Change Day' },
  { key: 'formSubmissionsChangeWeek', label: 'Form Submissions Change Week' },
  { key: 'formSubmissionsChangeMonth', label: 'Form Submissions Change Month' },
  { key: 'leads', label: 'Leads' },
  { key: 'leadsChangeDay', label: 'Leads Change Day' },
  { key: 'leadsChangeWeek', label: 'Leads Change Week' },
  { key: 'leadsChangeMonth', label: 'Leads Change Month' },
]

const keywordsHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'keyword', label: 'Keyword' },
  { key: 'pagePath', label: 'Page Path' },
  { key: 'channel', label: 'Channel' },
  { key: 'searchEngine', label: 'Search Engine' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'position', label: 'Position' },
]

const pathInsightsHeaders = [
  { key: 'insightType', label: 'Insight Type' },
  { key: 'date', label: 'Date' },
  { key: 'insightKey', label: 'Insight Key' },
  { key: 'value', label: 'Value' },
  { key: 'conversionCount', label: 'Conversion Count' },
  { key: 'conversionRate', label: 'Conversion Rate' },
  { key: 'metadata', label: 'Metadata' },
]

const leadStatsHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'pagePath', label: 'Page Path' },
  { key: 'channel', label: 'Channel' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'leads', label: 'Leads' },
  { key: 'formSubmissions', label: 'Form Submissions' },
]

const entryExitHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'insightKey', label: 'Page Path' },
  { key: 'value', label: 'Count' },
  { key: 'conversionCount', label: 'Conversion Count' },
  { key: 'conversionRate', label: 'Conversion Rate' },
]

const popularPathsHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'insightKey', label: 'Path' },
  { key: 'value', label: 'Sessions' },
  { key: 'conversionCount', label: 'Conversion Count' },
  { key: 'conversionRate', label: 'Conversion Rate' },
  { key: 'metadata', label: 'Metadata' },
]

const channelBounceHeaders = [
  { key: 'channel', label: 'Channel' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'bounceRate', label: 'Bounce Rate' },
]

function flattenPathInsights(
  grouped: Record<string, PathInsight[]>
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []

  for (const [insightType, items] of Object.entries(grouped)) {
    for (const item of items) {
      rows.push({ ...item, insightType })
    }
  }

  return rows
}

async function getLeadStatsRows(
  date: string | null,
  startDate: string | null,
  endDate: string | null
): Promise<Record<string, unknown>[]> {
  const rows = await getTrafficSummary(date, startDate, endDate, null, null)
  return rows.map((r) => ({
    date: r.date,
    pagePath: r.pagePath,
    channel: r.channel,
    sessions: r.sessions,
    leads: r.leads,
    formSubmissions: r.formSubmissions,
  }))
}

async function getChannelBounceRows(
  date: string | null,
  startDate: string | null,
  endDate: string | null
): Promise<Record<string, unknown>[]> {
  const { getTrafficSummary: getSummaryForBounce } = await import('@/lib/analytics-queries')
  const rows = await getSummaryForBounce(date, startDate, endDate, null, null)

  const map = new Map<string, { sessions: number; bounceRateSum: number }>()
  for (const item of rows) {
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
    .sort((a, b) => Number(b.bounceRate) - Number(a.bounceRate))
}

function buildFilename(
  type: string,
  startDate: string | null,
  endDate: string | null,
  date: string | null,
  format: 'csv' | 'json'
): string {
  const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange(6)

  const effectiveStart = startDate || date || defaultStart
  const effectiveEnd = endDate || date || defaultEnd

  return `cdp-${type}-${effectiveStart}-${effectiveEnd}.${format}`
}

function csvResponse(csv: string, filename: string): NextResponse {
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function jsonResponse(data: unknown, filename: string): NextResponse {
  const response = NextResponse.json({ data })
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  )
  return response
}
