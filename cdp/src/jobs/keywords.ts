/**
 * 关键词提取与聚合
 *
 * 功能：
 * 1. 从 utmTerm 提取付费/ SEM 关键词
 * 2. 从 organic 搜索引擎 referrer 的查询参数解析关键词
 * 3. 按日期 + 关键词 + 页面路径 + 渠道 + 搜索引擎聚合
 * 4. 写入 search_keywords 表
 */

import { db } from '../db'
import { searchKeywords } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * 支持的搜索引擎域名与名称映射
 */
const SEARCH_ENGINES: { pattern: RegExp; name: string }[] = [
  { pattern: /(?:^|\.)google\./i, name: 'google' },
  { pattern: /(?:^|\.)bing\./i, name: 'bing' },
  { pattern: /(?:^|\.)baidu\./i, name: 'baidu' },
  { pattern: /(?:^|\.)duckduckgo\./i, name: 'duckduckgo' },
  { pattern: /(?:^|\.)yahoo\./i, name: 'yahoo' },
  { pattern: /(?:^|\.)yandex\./i, name: 'yandex' },
  { pattern: /(?:^|\.)sogou\./i, name: 'sogou' },
  { pattern: /(?:^|\.)360\.cn|(?:^|\.)so\.com/i, name: '360' },
]

/**
 * 搜索引擎关键词查询参数名
 */
const KEYWORD_PARAMS = ['q', 'query', 'wd', 'keyword', 'words']

/**
 * 检测 referrer 是否来自搜索引擎，返回搜索引擎名称
 */
export function detectSearchEngine(referrer: string): string | null {
  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    for (const engine of SEARCH_ENGINES) {
      if (engine.pattern.test(hostname)) {
        return engine.name
      }
    }
  } catch {
    // referrer 不是合法 URL，尝试字符串匹配
    const lower = referrer.toLowerCase()
    for (const engine of SEARCH_ENGINES) {
      if (engine.pattern.test(lower)) {
        return engine.name
      }
    }
  }

  return null
}

/**
 * 从 referrer URL 的查询参数中解析搜索关键词
 */
export function extractKeywordFromReferrer(referrer: string): string | null {
  try {
    const url = new URL(referrer)
    for (const param of KEYWORD_PARAMS) {
      const value = url.searchParams.get(param)
      if (value && value.trim()) {
        return decodeURIComponent(value.trim())
      }
    }
  } catch {
    // 退化为正则匹配
    for (const param of KEYWORD_PARAMS) {
      const match = referrer.match(new RegExp(`[?&]${param}=([^&]+)`, 'i'))
      if (match && match[1]) {
        try {
          return decodeURIComponent(match[1]).trim()
        } catch {
          return match[1].trim()
        }
      }
    }
  }

  return null
}

/**
 * 标准化关键词：去除首尾空白，统一小写便于聚合
 */
function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase()
}

/**
 * 关键词聚合项
 */
interface KeywordAggregate {
  keyword: string
  pagePath: string
  channel: string
  searchEngine: string | null
  clicks: number
}

/**
 * 从原始记录中提取并聚合关键词
 *
 * 关键词来源：
 * - utmTerm 非空的记录（通常对应 paid / sem 渠道）
 * - channel === 'organic' 且 referrer 来自搜索引擎的记录，从 referrer 解析关键词
 *
 * clicks 使用事件数计数；impressions 暂等于 clicks（目前无展示数据）。
 */
export function buildSearchKeywords(rawData: any[], date: string): KeywordAggregate[] {
  const groups = new Map<string, KeywordAggregate>()

  for (const record of rawData) {
    const pagePath = record.pagePath || '/'
    const channel = record.channel || 'direct'
    let keyword: string | null = null
    let searchEngine: string | null = null

    // 1. utmTerm 优先（付费关键词）
    if (record.utmTerm && typeof record.utmTerm === 'string') {
      keyword = normalizeKeyword(record.utmTerm)
      searchEngine = record.utmSource || null
    }

    // 2. organic 渠道 + 搜索引擎 referrer
    if (!keyword && channel === 'organic' && record.referrer) {
      searchEngine = detectSearchEngine(record.referrer)
      if (searchEngine) {
        keyword = extractKeywordFromReferrer(record.referrer)
      }
    }

    if (!keyword) continue

    const key = `${date}_${keyword}_${pagePath}_${channel}_${searchEngine || 'unknown'}`

    if (!groups.has(key)) {
      groups.set(key, {
        keyword,
        pagePath,
        channel,
        searchEngine,
        clicks: 0,
      })
    }

    groups.get(key)!.clicks++
  }

  return Array.from(groups.values())
}

/**
 * 将关键词聚合结果转换为可插入 search_keywords 表的记录
 */
export function toSearchKeywordRecords(
  aggregates: KeywordAggregate[],
  date: string
): {
  date: string
  keyword: string
  pagePath: string
  channel: string
  searchEngine: string | null
  impressions: number
  clicks: number
  ctr: number
  position: number
}[] {
  return aggregates.map((agg) => {
    const impressions = agg.clicks
    const ctr = impressions > 0 ? agg.clicks / impressions : 0

    return {
      date,
      keyword: agg.keyword,
      pagePath: agg.pagePath,
      channel: agg.channel,
      searchEngine: agg.searchEngine,
      impressions,
      clicks: agg.clicks,
      ctr,
      position: 0,
    }
  })
}

/**
 * 保存关键词数据到数据库
 *
 * 先删除该日期的旧关键词数据，再批量写入新数据。
 */
export async function saveSearchKeywords(keywords: KeywordAggregate[], date: string) {
  if (keywords.length === 0) return 0

  await db.delete(searchKeywords).where(eq(searchKeywords.date, date))

  const records = toSearchKeywordRecords(keywords, date)
  const batchSize = 500

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    await db.insert(searchKeywords).values(batch)
  }

  return records.length
}
