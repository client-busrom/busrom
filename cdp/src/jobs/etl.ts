/**
 * ETL 数据处理 - 将原始访问数据汇总为统计指标
 *
 * 功能：
 * 1. 每日数据汇总（按日期、页面、渠道）
 * 2. 计算 PV、UV、Sessions、Bounce Rate、Avg Duration
 * 3. 计算设备分布、浏览器分布、国家分布
 * 4. 计算转化指标（conversions、formSubmissions、conversionRate）
 * 5. 计算趋势对比（日环比、周环比、月环比）
 * 6. 生成访问路径分析（visitorPaths）
 * 7. 记录 ETL 执行日志
 */

import { db } from '../db'
import { trafficRaw, trafficSummary, visitorPaths, pathInsights, etlLogs } from '../db/schema'
import { eq, and, gte, lte, inArray } from 'drizzle-orm'
import { buildSearchKeywords, saveSearchKeywords } from './keywords'

export interface ETLResult {
  date: string
  recordsProcessed: number
  summaryRecords: number
  pathRecords: number
  pathInsightRecords: number
  keywordRecords: number
  errors: string[]
}

/**
 * 执行 ETL 任务
 * @param targetDate - 目标日期（YYYY-MM-DD），默认为昨天
 */
export async function runETL(targetDate?: string): Promise<ETLResult> {
  const date = targetDate || getYesterday()
  const result: ETLResult = {
    date,
    recordsProcessed: 0,
    summaryRecords: 0,
    pathRecords: 0,
    pathInsightRecords: 0,
    keywordRecords: 0,
    errors: [],
  }

  const logId = await createETLLog(date)

  try {
    console.log(`[ETL] Starting ETL for date: ${date}`)

    // 1. 获取原始数据
    const rawData = await getRawData(date)
    result.recordsProcessed = rawData.length

    if (rawData.length === 0) {
      console.log(`[ETL] No data found for ${date}`)
      await finishETLLog(logId, 'success', 0, 0, 0, 0, 0)
      return result
    }

    // 2. 计算会话级指标（用于准确计算跳出率、时长、路径）
    const sessionMetrics = calculateSessionMetrics(rawData)

    // 3. 计算汇总指标
    const summary = calculateSummary(rawData, sessionMetrics, date)

    // 4. 写入汇总表（包含按页面/渠道的明细）
    await saveSummary(summary)

    // 4.1 写入汇总表（按日期聚合的 total 行，pagePath='all', channel='all'）
    const aggregateSummary = calculateAggregateSummary(rawData, sessionMetrics, date)
    await saveSummary(aggregateSummary)
    result.summaryRecords = summary.length + aggregateSummary.length

    // 5. 计算趋势对比
    await calculateTrends(date)

    // 6. 生成访问路径
    const paths = buildVisitorPaths(rawData, sessionMetrics, date)
    await saveVisitorPaths(paths, date)
    result.pathRecords = paths.length

    // 7. 生成路径洞察（热门路径、入口页、退出页、流失点、转化路径）
    const pathInsightsData = buildPathInsights(paths, date)
    await savePathInsights(pathInsightsData, date)
    result.pathInsightRecords = pathInsightsData.length

    // 8. 提取并保存搜索关键词
    const keywordAggregates = buildSearchKeywords(rawData, date)
    result.keywordRecords = await saveSearchKeywords(keywordAggregates, date)

    console.log(
      `[ETL] Completed for ${date}: ${result.recordsProcessed} raw, ${result.summaryRecords} summary, ${result.pathRecords} paths, ${result.pathInsightRecords} path insights, ${result.keywordRecords} keywords`
    )

    await finishETLLog(
      logId,
      'success',
      result.recordsProcessed,
      result.summaryRecords,
      result.pathRecords,
      result.pathInsightRecords,
      result.keywordRecords
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(errorMessage)
    console.error(`[ETL] Error:`, error)
    await finishETLLog(
      logId,
      'failed',
      result.recordsProcessed,
      result.summaryRecords,
      result.pathRecords,
      result.pathInsightRecords,
      result.keywordRecords,
      errorMessage
    )
  }

  return result
}

/**
 * 获取指定日期的原始数据（按时间排序）
 */
async function getRawData(date: string) {
  const startTime = `${date}T00:00:00Z`
  const endTime = `${date}T23:59:59Z`

  return db
    .select()
    .from(trafficRaw)
    .where(
      and(
        gte(trafficRaw.timestamp, new Date(startTime)),
        lte(trafficRaw.timestamp, new Date(endTime))
      )
    )
    .orderBy(trafficRaw.timestamp)
}

/**
 * 会话级指标
 */
interface SessionMetric {
  sessionId: string
  visitorId: string
  pages: string[] // 原始页面访问序列（保留重复和顺序）
  pagePaths: string[] // 去重后的页面路径（保留顺序）
  timestamps: Date[]
  events: string[]
  channels: string[]
  deviceType?: string
  browser?: string
  country?: string
  conversionPages: Set<string> // 发生 conversion 事件的页面
  formSubmitPages: Set<string> // 发生 form_submit 事件的页面
  leadPages: Set<string> // 发生 lead 事件的页面（WhatsApp/Email/在线聊天点击）
}

/**
 * 按会话聚合原始数据
 */
export function calculateSessionMetrics(rawData: any[]): Map<string, SessionMetric> {
  const sessions = new Map<string, SessionMetric>()

  for (const record of rawData) {
    const sessionId = record.sessionId

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        sessionId,
        visitorId: record.visitorId,
        pages: [],
        pagePaths: [],
        timestamps: [],
        events: [],
        channels: [],
        deviceType: record.deviceType,
        browser: record.browser,
        country: record.country,
        conversionPages: new Set(),
        formSubmitPages: new Set(),
        leadPages: new Set(),
      })
    }

    const session = sessions.get(sessionId)!
    const pagePath = record.pagePath || '/'
    const eventType = record.eventType || 'pageview'
    const channel = record.channel || 'direct'

    if (record.pagePath) {
      session.pages.push(record.pagePath)
      if (!session.pagePaths.includes(record.pagePath)) {
        session.pagePaths.push(record.pagePath)
      }
    }

    session.timestamps.push(new Date(record.timestamp))
    session.events.push(eventType)

    if (!session.channels.includes(channel)) {
      session.channels.push(channel)
    }

    // 按会话记录转化/表单提交/线索发生的页面，避免同一会话多次事件重复计数
    if (eventType === 'conversion') {
      session.conversionPages.add(pagePath)
    }
    if (eventType === 'form_submit') {
      session.formSubmitPages.add(pagePath)
    }
    if (isLeadEvent(record)) {
      session.leadPages.add(pagePath)
    }
  }

  return sessions
}

/**
 * 判断原始事件是否属于线索事件。
 *
 * 由于前端埋点目前只发送通用 click 事件，后端需要在 ETL 阶段识别关键交互：
 * - eventType === 'conversion' 时直接视为线索/转化
 * - eventType === 'click' 且元素文本、id、href 匹配 WhatsApp / Email / 在线聊天等模式
 */
export function isLeadEvent(record: any): boolean {
  const eventType = record.eventType || 'pageview'

  if (eventType === 'conversion') return true
  if (eventType !== 'click') return false

  const eventData = record.eventData || {}
  const text = String(eventData.elementText || '').toLowerCase()
  const id = String(eventData.elementId || '').toLowerCase()
  const href = String(eventData.href || record.href || '').toLowerCase()
  const className = String(eventData.className || '').toLowerCase()

  const whatsappPattern = /whatsapp|wa\.me/iu
  const emailPattern = /mailto:|@.*\.(com|net|org|co|hk|cn|io|ai|us)/iu
  const chatPattern = /chat|在线客服|在线聊天|客服|contact us|send inquiry|get quote/iu

  return (
    whatsappPattern.test(text) ||
    whatsappPattern.test(id) ||
    whatsappPattern.test(href) ||
    emailPattern.test(text) ||
    emailPattern.test(id) ||
    emailPattern.test(href) ||
    chatPattern.test(text) ||
    chatPattern.test(id) ||
    chatPattern.test(className)
  )
}

/**
 * 计算汇总指标
 */
export function calculateSummary(
  rawData: any[],
  sessionMetrics: Map<string, SessionMetric>,
  date: string
) {
  // 按页面和渠道分组
  const groups = new Map<
    string,
    {
      pagePath: string
      channel: string
      pv: number
      uv: Set<string>
      sessions: Set<string>
      bounces: number
      durations: number[]
      conversions: number
      formSubmissions: number
      leads: number
      devices: Map<string, number>
      browsers: Map<string, number>
      countries: Map<string, number>
    }
  >()

  for (const record of rawData) {
    const pagePath = record.pagePath || '/'
    const channel = record.channel || 'direct'
    const key = `${pagePath}_${channel}`

    if (!groups.has(key)) {
      groups.set(key, {
        pagePath,
        channel,
        pv: 0,
        uv: new Set(),
        sessions: new Set(),
        bounces: 0,
        durations: [],
        conversions: 0,
        formSubmissions: 0,
        leads: 0,
        devices: new Map(),
        browsers: new Map(),
        countries: new Map(),
      })
    }

    const group = groups.get(key)!

    group.pv++
    group.uv.add(record.visitorId)
    group.sessions.add(record.sessionId)

    const deviceType = record.deviceType || 'unknown'
    group.devices.set(deviceType, (group.devices.get(deviceType) || 0) + 1)

    const browser = record.browser || 'unknown'
    group.browsers.set(browser, (group.browsers.get(browser) || 0) + 1)

    const country = record.country || 'unknown'
    group.countries.set(country, (group.countries.get(country) || 0) + 1)

  }

  // 基于会话计算跳出率、平均时长、转化/表单提交
  for (const session of sessionMetrics.values()) {
    const isBounce = session.pagePaths.length <= 1
    const duration =
      session.timestamps.length > 1
        ? (session.timestamps[session.timestamps.length - 1].getTime() - session.timestamps[0].getTime()) / 1000
        : 0

    const channel = session.channels[0] || 'direct'

    // 每个页面路径只在该会话首次出现时计入一次跳出/时长
    const countedKeys = new Set<string>()
    for (let i = 0; i < session.pagePaths.length; i++) {
      const pagePath = session.pagePaths[i]
      const key = `${pagePath}_${channel}`

      if (!countedKeys.has(key) && groups.has(key)) {
        const group = groups.get(key)!
        if (isBounce) group.bounces++
        group.durations.push(duration)
        countedKeys.add(key)
      }
    }

    // 会话级转化统计：同一 session 在同一页面多次 conversion 只计一次
    for (const pagePath of session.conversionPages) {
      const key = `${pagePath}_${channel}`
      if (groups.has(key)) {
        groups.get(key)!.conversions++
      }
    }

    for (const pagePath of session.formSubmitPages) {
      const key = `${pagePath}_${channel}`
      if (groups.has(key)) {
        groups.get(key)!.formSubmissions++
      }
    }

    for (const pagePath of session.leadPages) {
      const key = `${pagePath}_${channel}`
      if (groups.has(key)) {
        groups.get(key)!.leads++
      }
    }
  }

  // 转换为汇总记录
  const summary = []
  for (const group of groups.values()) {
    const totalSessions = group.sessions.size
    const bounceRate = totalSessions > 0 ? (group.bounces / totalSessions) * 100 : 0
    const avgDuration =
      group.durations.length > 0
        ? group.durations.reduce((a, b) => a + b, 0) / group.durations.length
        : 0
    const conversionRate = totalSessions > 0 ? (group.conversions / totalSessions) * 100 : 0
    const formConversionRate = totalSessions > 0 ? (group.formSubmissions / totalSessions) * 100 : 0

    summary.push({
      date,
      pagePath: group.pagePath,
      channel: group.channel,
      pv: group.pv,
      uv: group.uv.size,
      sessions: totalSessions,
      bounceRate: Math.round(bounceRate * 100) / 100,
      avgDuration: Math.round(avgDuration * 100) / 100,
      conversions: group.conversions,
      formSubmissions: group.formSubmissions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      formConversionRate: Math.round(formConversionRate * 100) / 100,
      leads: group.leads,
      deviceBreakdown: Object.fromEntries(group.devices),
      browserBreakdown: Object.fromEntries(group.browsers),
      countryBreakdown: Object.fromEntries(group.countries),
    })
  }

  return summary
}

/**
 * 按日期聚合汇总行（pagePath='all', channel='all'）
 *
 * 用于 overview 等全站级指标查询，避免每次在 API 层面对明细做全量聚合。
 * 基于原始数据与会话指标计算，确保 UV/Sessions 不去重错误。
 */
function calculateAggregateSummary(
  rawData: any[],
  sessionMetrics: Map<string, SessionMetric>,
  date: string
) {
  const pv = rawData.length
  const uv = new Set(rawData.map((r) => r.visitorId)).size
  const sessions = sessionMetrics.size

  let bounces = 0
  let totalDuration = 0
  const conversionPages = new Set<string>()
  const formSubmitPages = new Set<string>()
  const leadPages = new Set<string>()

  const deviceBreakdown = new Map<string, number>()
  const browserBreakdown = new Map<string, number>()
  const countryBreakdown = new Map<string, number>()

  for (const record of rawData) {
    const deviceType = record.deviceType || 'unknown'
    deviceBreakdown.set(deviceType, (deviceBreakdown.get(deviceType) || 0) + 1)

    const browser = record.browser || 'unknown'
    browserBreakdown.set(browser, (browserBreakdown.get(browser) || 0) + 1)

    const country = record.country || 'unknown'
    countryBreakdown.set(country, (countryBreakdown.get(country) || 0) + 1)
  }

  for (const session of sessionMetrics.values()) {
    if (session.pagePaths.length <= 1) bounces++

    const duration =
      session.timestamps.length > 1
        ? (session.timestamps[session.timestamps.length - 1].getTime() - session.timestamps[0].getTime()) / 1000
        : 0
    totalDuration += duration

    for (const page of session.conversionPages) conversionPages.add(`${session.sessionId}_${page}`)
    for (const page of session.formSubmitPages) formSubmitPages.add(`${session.sessionId}_${page}`)
    if (session.leadPages.size > 0) leadPages.add(session.sessionId)
  }

  const bounceRate = sessions > 0 ? (bounces / sessions) * 100 : 0
  const avgDuration = sessions > 0 ? totalDuration / sessions : 0
  const conversions = conversionPages.size
  const formSubmissions = formSubmitPages.size
  const leads = leadPages.size
  const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0
  const formConversionRate = sessions > 0 ? (formSubmissions / sessions) * 100 : 0

  return [{
    date,
    pagePath: 'all',
    channel: 'all',
    pv,
    uv,
    sessions,
    bounceRate: Math.round(bounceRate * 100) / 100,
    avgDuration: Math.round(avgDuration * 100) / 100,
    conversions,
    formSubmissions,
    conversionRate: Math.round(conversionRate * 100) / 100,
    formConversionRate: Math.round(formConversionRate * 100) / 100,
    leads,
    deviceBreakdown: Object.fromEntries(deviceBreakdown),
    browserBreakdown: Object.fromEntries(browserBreakdown),
    countryBreakdown: Object.fromEntries(countryBreakdown),
  }]
}

/**
 * 保存汇总数据到数据库
 */
async function saveSummary(summary: any[]) {
  for (const record of summary) {
    // 先删除旧数据（如果存在）
    await db
      .delete(trafficSummary)
      .where(
        and(
          eq(trafficSummary.date, record.date),
          eq(trafficSummary.pagePath, record.pagePath),
          eq(trafficSummary.channel, record.channel)
        )
      )

    // 插入新数据
    await db.insert(trafficSummary).values(record)
  }
}

/**
 * 计算趋势对比（日环比、周环比、月环比）
 *
 * 对比逻辑：
 * - 日环比：与前一天同维度对比
 * - 周环比：与 7 天前同维度对比
 * - 月环比：与 30 天前同维度对比
 *
 * 支持指标：pv / uv / sessions / conversions / formSubmissions / leads
 */
export async function calculateTrends(date: string) {
  console.log(`[ETL] Calculating trends for ${date}`)

  type MetricKey = 'pv' | 'uv' | 'sessions' | 'conversions' | 'formSubmissions' | 'leads'

  const currentRecords = await db
    .select({
      pagePath: trafficSummary.pagePath,
      channel: trafficSummary.channel,
      pv: trafficSummary.pv,
      uv: trafficSummary.uv,
      sessions: trafficSummary.sessions,
      conversions: trafficSummary.conversions,
      formSubmissions: trafficSummary.formSubmissions,
      leads: trafficSummary.leads,
    })
    .from(trafficSummary)
    .where(eq(trafficSummary.date, date))

  if (currentRecords.length === 0) return

  const comparisonDates = {
    day: getOffsetDate(date, -1),
    week: getOffsetDate(date, -7),
    month: getOffsetDate(date, -30),
  }

  const previousRecords = await db
    .select({
      date: trafficSummary.date,
      pagePath: trafficSummary.pagePath,
      channel: trafficSummary.channel,
      pv: trafficSummary.pv,
      uv: trafficSummary.uv,
      sessions: trafficSummary.sessions,
      conversions: trafficSummary.conversions,
      formSubmissions: trafficSummary.formSubmissions,
      leads: trafficSummary.leads,
    })
    .from(trafficSummary)
    .where(inArray(trafficSummary.date, Object.values(comparisonDates)))

  const previousMap = new Map<string, Record<MetricKey, number>>()
  for (const record of previousRecords) {
    const key = `${record.date}_${record.pagePath}_${record.channel}`
    previousMap.set(key, {
      pv: record.pv,
      uv: record.uv,
      sessions: record.sessions,
      conversions: record.conversions,
      formSubmissions: record.formSubmissions,
      leads: record.leads,
    })
  }

  const metricToColumn: Record<MetricKey, [string, string, string]> = {
    pv: ['pvChangeDay', 'pvChangeWeek', 'pvChangeMonth'],
    uv: ['uvChangeDay', 'uvChangeWeek', 'uvChangeMonth'],
    sessions: ['sessionsChangeDay', 'sessionsChangeWeek', 'sessionsChangeMonth'],
    conversions: ['conversionsChangeDay', 'conversionsChangeWeek', 'conversionsChangeMonth'],
    formSubmissions: ['formSubmissionsChangeDay', 'formSubmissionsChangeWeek', 'formSubmissionsChangeMonth'],
    leads: ['leadsChangeDay', 'leadsChangeWeek', 'leadsChangeMonth'],
  }

  const periodToKey: Record<string, 'day' | 'week' | 'month'> = {
    pvChangeDay: 'day',
    pvChangeWeek: 'week',
    pvChangeMonth: 'month',
    uvChangeDay: 'day',
    uvChangeWeek: 'week',
    uvChangeMonth: 'month',
    sessionsChangeDay: 'day',
    sessionsChangeWeek: 'week',
    sessionsChangeMonth: 'month',
    conversionsChangeDay: 'day',
    conversionsChangeWeek: 'week',
    conversionsChangeMonth: 'month',
    formSubmissionsChangeDay: 'day',
    formSubmissionsChangeWeek: 'week',
    formSubmissionsChangeMonth: 'month',
    leadsChangeDay: 'day',
    leadsChangeWeek: 'week',
    leadsChangeMonth: 'month',
  }

  for (const record of currentRecords) {
    const updates: Record<string, number | null> = {}

    for (const [metric, columnNames] of Object.entries(metricToColumn) as [MetricKey, [string, string, string]][]) {
      const currentValue = record[metric]

      for (const columnName of columnNames) {
        const periodKey = periodToKey[columnName]
        const compareDate = comparisonDates[periodKey]
        const previous = previousMap.get(`${compareDate}_${record.pagePath}_${record.channel}`)
        const previousValue = previous?.[metric]

        if (previousValue !== undefined && previousValue > 0) {
          updates[columnName] = Math.round(((currentValue - previousValue) / previousValue) * 10000) / 100
        } else {
          updates[columnName] = null
        }
      }
    }

    await db
      .update(trafficSummary)
      .set(updates)
      .where(
        and(
          eq(trafficSummary.date, date),
          eq(trafficSummary.pagePath, record.pagePath),
          eq(trafficSummary.channel, record.channel)
        )
      )
  }
}

/**
 * 构建访问路径记录
 *
 * 使用原始页面序列（保留重复页面和访问顺序），而非去重后的 pagePaths，
 * 以真实反映用户浏览行为。
 */
export function buildVisitorPaths(
  rawData: any[],
  sessionMetrics: Map<string, SessionMetric>,
  date: string
) {
  const paths = []

  for (const session of sessionMetrics.values()) {
    if (session.pages.length === 0) continue

    const isConverted = session.events.some(
      (e) => e === 'conversion' || e === 'form_submit'
    ) || session.leadPages.size > 0

    const conversionIndex = session.events.findIndex(
      (e) => e === 'conversion' || e === 'form_submit'
    )
    const leadPage = session.leadPages.size > 0 ? Array.from(session.leadPages)[0] : null
    const conversionPage =
      conversionIndex >= 0
        ? session.pages[conversionIndex] || session.pages[0]
        : leadPage || null

    const duration =
      session.timestamps.length > 1
        ? (session.timestamps[session.timestamps.length - 1].getTime() - session.timestamps[0].getTime()) / 1000
        : 0

    paths.push({
      sessionId: session.sessionId,
      visitorId: session.visitorId,
      pathSequence: session.pages,
      entryPage: session.pages[0],
      exitPage: session.pages[session.pages.length - 1],
      pageCount: session.pages.length,
      duration: Math.round(duration * 100) / 100,
      converted: isConverted,
      conversionPage,
      date,
    })
  }

  return paths
}

/**
 * 访问路径聚合
 *
 * 计算最常出现的完整路径、入口页、退出页、转化路径等，
 * 供可视化展示和漏斗分析使用。
 */
export interface PathAggregate {
  pathKey: string
  pathSequence: string[]
  sessions: number
  convertedSessions: number
  conversionRate: number
  avgDuration: number
  entryPage: string
  exitPage: string
}

export function buildPathAggregates(
  paths: { pathSequence: string[]; converted: boolean; duration: number }[]
): PathAggregate[] {
  const aggregates = new Map<
    string,
    {
      pathSequence: string[]
      sessions: number
      convertedSessions: number
      totalDuration: number
      entryPage: string
      exitPage: string
    }
  >()

  for (const path of paths) {
    const pathKey = path.pathSequence.join(' -> ')
    const existing = aggregates.get(pathKey)

    if (existing) {
      existing.sessions++
      if (path.converted) existing.convertedSessions++
      existing.totalDuration += path.duration
    } else {
      aggregates.set(pathKey, {
        pathSequence: path.pathSequence,
        sessions: 1,
        convertedSessions: path.converted ? 1 : 0,
        totalDuration: path.duration,
        entryPage: path.pathSequence[0] || '/',
        exitPage: path.pathSequence[path.pathSequence.length - 1] || '/',
      })
    }
  }

  return Array.from(aggregates.values())
    .map((agg) => ({
      pathKey: agg.pathSequence.join(' -> '),
      pathSequence: agg.pathSequence,
      sessions: agg.sessions,
      convertedSessions: agg.convertedSessions,
      conversionRate: agg.sessions > 0 ? Math.round((agg.convertedSessions / agg.sessions) * 10000) / 100 : 0,
      avgDuration: agg.sessions > 0 ? Math.round((agg.totalDuration / agg.sessions) * 100) / 100 : 0,
      entryPage: agg.entryPage,
      exitPage: agg.exitPage,
    }))
    .sort((a, b) => b.sessions - a.sessions)
}

/**
 * 保存访问路径数据
 */
async function saveVisitorPaths(paths: any[], date: string) {
  // 先删除当天的旧路径数据
  await db.delete(visitorPaths).where(eq(visitorPaths.date, date))

  // 批量插入（每次 500 条）
  const batchSize = 500
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize)
    await db.insert(visitorPaths).values(batch)
  }
}

/**
 * 路径洞察项
 */
interface PathInsightItem {
  date: string
  insightType: 'top_paths' | 'entry_pages' | 'exit_pages' | 'drop_offs' | 'conversion_paths'
  insightKey: string
  value: number
  conversionCount: number
  conversionRate: number
  metadata?: Record<string, any>
}

/**
 * 基于访问路径构建路径洞察
 *
 * 计算：
 * - 热门访问路径（出现频次最高的完整路径）
 * - 热门入口页
 * - 热门退出页
 * - 流失点（进入后离开的页面）
 * - 高转化路径
 */
export function buildPathInsights(paths: any[], date: string): PathInsightItem[] {
  const insights: PathInsightItem[] = []

  // 1. 热门路径：按完整路径序列聚合
  const pathPatternMap = new Map<
    string,
    { count: number; converted: number; totalDuration: number; sequences: string[] }
  >()

  // 2. 入口页统计
  const entryPageMap = new Map<string, { count: number; converted: number }>()

  // 3. 退出页统计
  const exitPageMap = new Map<string, { count: number; converted: number }>()

  // 4. 流失点：单页访问的退出页
  const dropOffMap = new Map<string, { count: number; converted: number }>()

  for (const path of paths) {
    const sequence = Array.isArray(path.pathSequence) ? path.pathSequence : []
    const pathKey = sequence.join(' -> ')

    if (pathKey) {
      const existing = pathPatternMap.get(pathKey) || {
        count: 0,
        converted: 0,
        totalDuration: 0,
        sequences: sequence,
      }
      existing.count++
      if (path.converted) existing.converted++
      existing.totalDuration += path.duration || 0
      pathPatternMap.set(pathKey, existing)
    }

    if (path.entryPage) {
      const entry = entryPageMap.get(path.entryPage) || { count: 0, converted: 0 }
      entry.count++
      if (path.converted) entry.converted++
      entryPageMap.set(path.entryPage, entry)
    }

    if (path.exitPage) {
      const exit = exitPageMap.get(path.exitPage) || { count: 0, converted: 0 }
      exit.count++
      if (path.converted) exit.converted++
      exitPageMap.set(path.exitPage, exit)
    }

    // 单页访问即视为在入口页流失
    if (sequence.length === 1 && path.entryPage) {
      const drop = dropOffMap.get(path.entryPage) || { count: 0, converted: 0 }
      drop.count++
      if (path.converted) drop.converted++
      dropOffMap.set(path.entryPage, drop)
    }
  }

  // 取 Top 10 热门路径
  const topPaths = Array.from(pathPatternMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  for (const [key, data] of topPaths) {
    insights.push({
      date,
      insightType: 'top_paths',
      insightKey: key,
      value: data.count,
      conversionCount: data.converted,
      conversionRate: data.count > 0 ? Math.round((data.converted / data.count) * 10000) / 100 : 0,
      metadata: {
        sequence: data.sequences,
        avgDuration: data.count > 0 ? Math.round((data.totalDuration / data.count) * 100) / 100 : 0,
      },
    })
  }

  // 取 Top 10 入口页
  const topEntries = Array.from(entryPageMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  for (const [key, data] of topEntries) {
    insights.push({
      date,
      insightType: 'entry_pages',
      insightKey: key,
      value: data.count,
      conversionCount: data.converted,
      conversionRate: data.count > 0 ? Math.round((data.converted / data.count) * 10000) / 100 : 0,
    })
  }

  // 取 Top 10 退出页
  const topExits = Array.from(exitPageMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  for (const [key, data] of topExits) {
    insights.push({
      date,
      insightType: 'exit_pages',
      insightKey: key,
      value: data.count,
      conversionCount: data.converted,
      conversionRate: data.count > 0 ? Math.round((data.converted / data.count) * 10000) / 100 : 0,
    })
  }

  // 取 Top 10 流失点
  const topDropOffs = Array.from(dropOffMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  for (const [key, data] of topDropOffs) {
    insights.push({
      date,
      insightType: 'drop_offs',
      insightKey: key,
      value: data.count,
      conversionCount: data.converted,
      conversionRate: data.count > 0 ? Math.round((data.converted / data.count) * 10000) / 100 : 0,
    })
  }

  // 高转化路径：在热门路径中转化率最高的 Top 10
  const conversionPaths = Array.from(pathPatternMap.entries())
    .filter(([, data]) => data.converted > 0)
    .sort((a, b) => {
      const rateA = a[1].count > 0 ? a[1].converted / a[1].count : 0
      const rateB = b[1].count > 0 ? b[1].converted / b[1].count : 0
      return rateB - rateA
    })
    .slice(0, 10)

  for (const [key, data] of conversionPaths) {
    insights.push({
      date,
      insightType: 'conversion_paths',
      insightKey: key,
      value: data.count,
      conversionCount: data.converted,
      conversionRate: data.count > 0 ? Math.round((data.converted / data.count) * 10000) / 100 : 0,
      metadata: {
        sequence: data.sequences,
        avgDuration: data.count > 0 ? Math.round((data.totalDuration / data.count) * 100) / 100 : 0,
      },
    })
  }

  return insights
}

/**
 * 保存路径洞察数据
 */
async function savePathInsights(insights: PathInsightItem[], date: string) {
  // 先删除当天的旧数据
  await db.delete(pathInsights).where(eq(pathInsights.date, date))

  // 批量插入（每次 500 条）
  const batchSize = 500
  for (let i = 0; i < insights.length; i += batchSize) {
    const batch = insights.slice(i, i + batchSize)
    await db.insert(pathInsights).values(batch)
  }
}

/**
 * 创建 ETL 日志
 */
async function createETLLog(date: string) {
  const result = await db
    .insert(etlLogs)
    .values({
      taskName: `etl-${date}`,
      status: 'running',
    })
    .returning({ id: etlLogs.id })

  return result[0].id
}

/**
 * 完成 ETL 日志
 */
async function finishETLLog(
  id: number,
  status: string,
  recordsProcessed: number,
  summaryRecords: number,
  pathRecords: number,
  pathInsightRecords: number,
  keywordRecords: number,
  errorMessage?: string
) {
  await db
    .update(etlLogs)
    .set({
      status,
      endTime: new Date(),
      recordsProcessed,
      errorMessage,
      details: {
        summaryRecords,
        pathRecords,
        pathInsightRecords,
        keywordRecords,
      },
    })
    .where(eq(etlLogs.id, id))
}

/**
 * 获取偏移后的日期
 */
function getOffsetDate(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/**
 * 获取昨天日期
 */
function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export default runETL
