import { db } from '@/db'
import { trafficSummary, visitorPaths, searchKeywords, pathInsights } from '@/db/schema'
import { eq, gte, lte, desc, and as drizzleAnd } from 'drizzle-orm'

export async function getTrafficSummary(
  date: string | null,
  startDate: string | null,
  endDate: string | null,
  pagePath: string | null,
  channel: string | null
) {
  let query = db.select().from(trafficSummary)

  const conditions = []

  if (date) {
    conditions.push(eq(trafficSummary.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(trafficSummary.date, startDate))
    conditions.push(lte(trafficSummary.date, endDate))
  }

  if (pagePath) {
    conditions.push(eq(trafficSummary.pagePath, pagePath))
  }

  if (channel) {
    conditions.push(eq(trafficSummary.channel, channel))
  }

  const results = await query
    .where(conditions.length > 0 ? drizzleAnd(...conditions) : undefined)
    .orderBy(desc(trafficSummary.date))
    .limit(100)

  return results
}

export async function getVisitorPaths(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const conditions = []

  if (date) {
    conditions.push(eq(visitorPaths.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(visitorPaths.date, startDate))
    conditions.push(lte(visitorPaths.date, endDate))
  }

  const results = await db
    .select()
    .from(visitorPaths)
    .where(conditions.length > 0 ? drizzleAnd(...conditions) : undefined)
    .orderBy(desc(visitorPaths.date))
    .limit(100)

  return results
}

export async function getPathInsights(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const conditions = []

  if (date) {
    conditions.push(eq(pathInsights.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(pathInsights.date, startDate))
    conditions.push(lte(pathInsights.date, endDate))
  }

  const results = await db
    .select()
    .from(pathInsights)
    .where(conditions.length > 0 ? drizzleAnd(...conditions) : undefined)
    .orderBy(desc(pathInsights.value))
    .limit(200)

  // 按 insightType 分组
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.insightType]) {
      acc[item.insightType] = []
    }
    acc[item.insightType].push(item)
    return acc
  }, {} as Record<string, typeof results>)

  return grouped
}

export async function getPathInsightsByType(
  insightType: string,
  date: string | null,
  startDate: string | null,
  endDate: string | null,
  limit = 10
) {
  const conditions = [eq(pathInsights.insightType, insightType)]

  if (date) {
    conditions.push(eq(pathInsights.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(pathInsights.date, startDate))
    conditions.push(lte(pathInsights.date, endDate))
  }

  const results = await db
    .select()
    .from(pathInsights)
    .where(drizzleAnd(...conditions))
    .orderBy(desc(pathInsights.value))
    .limit(limit)

  return results
}

export async function getPopularPaths(
  date: string | null,
  startDate: string | null,
  endDate: string | null,
  limit = 10
) {
  const conditions = [eq(pathInsights.insightType, 'top_paths')]

  if (date) {
    conditions.push(eq(pathInsights.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(pathInsights.date, startDate))
    conditions.push(lte(pathInsights.date, endDate))
  }

  const results = await db
    .select()
    .from(pathInsights)
    .where(drizzleAnd(...conditions))
    .orderBy(desc(pathInsights.value))
    .limit(limit)

  return results
}

export async function getSearchKeywords(
  date: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const conditions = []

  if (date) {
    conditions.push(eq(searchKeywords.date, date))
  }

  if (startDate && endDate) {
    conditions.push(gte(searchKeywords.date, startDate))
    conditions.push(lte(searchKeywords.date, endDate))
  }

  const results = await db
    .select()
    .from(searchKeywords)
    .where(conditions.length > 0 ? drizzleAnd(...conditions) : undefined)
    .orderBy(desc(searchKeywords.date))
    .limit(100)

  return results
}

export function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

export function getDefaultDateRange(days: number) {
  const endDate = getDateDaysAgo(0)
  const startDate = getDateDaysAgo(days)
  return { startDate, endDate }
}
