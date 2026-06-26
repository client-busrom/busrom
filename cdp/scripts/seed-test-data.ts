#!/usr/bin/env node
/**
 * Seed test data for CDP dashboard
 *
 * Usage:
 *   DATABASE_URL=postgresql://user:pass@localhost:5432/busrom_cdp npx tsx scripts/seed-test-data.ts
 */

import 'dotenv/config'
import { randomUUID } from 'crypto'
import { db } from '../src/db'
import { trafficRaw } from '../src/db/schema'
import { runETL } from '../src/jobs/etl'

const PAGES = [
  '/',
  '/home',
  '/products',
  '/products/series-a',
  '/products/series-b',
  '/about',
  '/contact',
  '/blog',
  '/blog/outdoor-design-trends',
  '/faq',
]

const CHANNELS = [
  { key: 'organic', weight: 40 },
  { key: 'direct', weight: 25 },
  { key: 'social', weight: 15 },
  { key: 'ad', weight: 10 },
  { key: 'referral', weight: 10 },
]

const DEVICES = [
  { key: 'desktop', weight: 60 },
  { key: 'mobile', weight: 35 },
  { key: 'tablet', weight: 5 },
]

const BROWSERS = [
  { key: 'Chrome', weight: 55 },
  { key: 'Safari', weight: 25 },
  { key: 'Firefox', weight: 10 },
  { key: 'Edge', weight: 8 },
  { key: 'Other', weight: 2 },
]

const COUNTRIES = [
  { key: 'US', city: 'New York', weight: 35 },
  { key: 'CN', city: 'Shanghai', weight: 20 },
  { key: 'DE', city: 'Berlin', weight: 10 },
  { key: 'GB', city: 'London', weight: 8 },
  { key: 'FR', city: 'Paris', weight: 7 },
  { key: 'CA', city: 'Toronto', weight: 6 },
  { key: 'AU', city: 'Sydney', weight: 5 },
  { key: 'JP', city: 'Tokyo', weight: 4 },
  { key: 'SG', city: 'Singapore', weight: 3 },
  { key: 'IN', city: 'Mumbai', weight: 2 },
]

const SEARCH_KEYWORDS = [
  'patio cover',
  'pergola',
  'outdoor kitchen',
  'aluminum pergola',
  'gazebo',
  'retractable roof',
]

const UTM_SOURCES = ['google', 'facebook', 'instagram', 'linkedin', 'newsletter']

function weightedPick<T extends { key: string; weight: number }>(items: T[]): string {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let rand = Math.random() * total
  for (const item of items) {
    rand -= item.weight
    if (rand <= 0) return item.key
  }
  return items[items.length - 1].key
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInDay(dateStr: string): Date {
  const base = new Date(`${dateStr}T00:00:00Z`)
  const offsetMs = randomInt(0, 23 * 60 * 60 * 1000) + randomInt(0, 59 * 60 * 1000)
  return new Date(base.getTime() + offsetMs)
}

function buildReferrer(channel: string, keyword?: string): string | undefined {
  if (channel === 'organic') {
    const engine = Math.random() > 0.5 ? 'https://www.google.com/search' : 'https://www.bing.com/search'
    const q = keyword || weightedPick(SEARCH_KEYWORDS.map((k) => ({ key: k, weight: 1 })))
    return `${engine}?q=${encodeURIComponent(q)}`
  }
  if (channel === 'social') {
    const networks = ['https://facebook.com', 'https://instagram.com', 'https://linkedin.com']
    return networks[randomInt(0, networks.length - 1)]
  }
  if (channel === 'referral') {
    const refs = ['https://example.com', 'https://partner-site.com', 'https://news.com/article']
    return refs[randomInt(0, refs.length - 1)]
  }
  if (channel === 'ad') {
    return `https://www.google.com/search?q=${encodeURIComponent(keyword || 'patio cover')}`
  }
  return undefined
}

interface SeedRecord {
  sessionId: string
  visitorId: string
  pagePath: string
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  channel: string
  deviceType: string
  browser: string
  os: string
  country: string
  city: string
  ipAddress: string
  userAgent: string
  screenResolution: string
  language: string
  eventType: string
  eventData: Record<string, unknown> | null
  timestamp: Date
  createdAt: Date
}

function generateSession(dateStr: string): SeedRecord[] {
  const records: SeedRecord[] = []
  const sessionId = randomUUID()
  const visitorId = Math.random() > 0.7 ? sessionId : randomUUID()
  const channel = weightedPick(CHANNELS)
  const deviceType = weightedPick(DEVICES)
  const browser = weightedPick(BROWSERS)
  const countryItem = COUNTRIES.find((c) => c.key === weightedPick(COUNTRIES)) || COUNTRIES[0]
  const country = countryItem.key
  const city = countryItem.city
  const os = Math.random() > 0.5 ? 'Windows' : Math.random() > 0.5 ? 'macOS' : 'iOS'
  const language = country === 'CN' ? 'zh-CN' : country === 'JP' ? 'ja-JP' : 'en-US'
  const screenResolution = deviceType === 'mobile' ? '390x844' : deviceType === 'tablet' ? '768x1024' : '1920x1080'

  const keyword =
    channel === 'organic' || channel === 'ad'
      ? weightedPick(SEARCH_KEYWORDS.map((k) => ({ key: k, weight: 1 })))
      : null

  const referrer = buildReferrer(channel, keyword ?? undefined) || null
  const utmSource = channel === 'ad' ? weightedPick(UTM_SOURCES.map((s) => ({ key: s, weight: 1 }))) : null
  const utmMedium = channel === 'ad' ? 'cpc' : null
  const utmCampaign = channel === 'ad' ? 'summer-sale' : null
  const utmTerm = keyword
  const utmContent = channel === 'ad' ? 'banner-a' : null

  const pageCount = randomInt(1, 5)
  const visitedPages: string[] = []
  for (let i = 0; i < pageCount; i++) {
    const pagePath = i === 0 ? PAGES[randomInt(0, 2)] : PAGES[randomInt(0, PAGES.length - 1)]
    visitedPages.push(pagePath)

    records.push({
      sessionId,
      visitorId,
      pagePath,
      referrer: i === 0 ? referrer : null,
      utmSource: i === 0 ? utmSource : null,
      utmMedium: i === 0 ? utmMedium : null,
      utmCampaign: i === 0 ? utmCampaign : null,
      utmTerm: i === 0 ? utmTerm : null,
      utmContent: i === 0 ? utmContent : null,
      channel,
      deviceType,
      browser,
      os,
      country,
      city,
      ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
      userAgent: `${browser}/${randomInt(100, 130)}.0`,
      screenResolution,
      language,
      eventType: 'pageview',
      eventData: null,
      timestamp: randomDateInDay(dateStr),
      createdAt: randomDateInDay(dateStr),
    })
  }

  // Random click events on some sessions
  if (Math.random() > 0.7) {
    const pagePath = visitedPages[randomInt(0, visitedPages.length - 1)]
    records.push({
      ...records[records.length - 1],
      pagePath,
      eventType: 'click',
      eventData: { element: 'cta-button', text: 'Get Quote' },
      timestamp: randomDateInDay(dateStr),
      createdAt: randomDateInDay(dateStr),
    })
  }

  // Form submissions / conversions
  if (Math.random() > 0.85) {
    const pagePath = '/contact'
    records.push({
      ...records[records.length - 1],
      pagePath,
      eventType: 'form_submit',
      eventData: { formId: 'contact-form' },
      timestamp: randomDateInDay(dateStr),
      createdAt: randomDateInDay(dateStr),
    })
  }

  // Lead events (WhatsApp / Email clicks)
  if (Math.random() > 0.9) {
    const pagePath = visitedPages[randomInt(0, visitedPages.length - 1)]
    const leadChannel = Math.random() > 0.5 ? 'whatsapp' : 'email'
    records.push({
      ...records[records.length - 1],
      pagePath,
      eventType: 'conversion',
      eventData: { type: 'lead', channel: leadChannel },
      timestamp: randomDateInDay(dateStr),
      createdAt: randomDateInDay(dateStr),
    })
  }

  return records
}

async function seedDay(dateStr: string, sessionCount: number) {
  const allRecords: SeedRecord[] = []
  for (let i = 0; i < sessionCount; i++) {
    allRecords.push(...generateSession(dateStr))
  }

  // Batch insert in chunks of 500
  const chunkSize = 500
  for (let i = 0; i < allRecords.length; i += chunkSize) {
    const chunk = allRecords.slice(i, i + chunkSize)
    await db.insert(trafficRaw).values(chunk)
  }

  console.log(`[seed] ${dateStr}: inserted ${allRecords.length} raw events for ${sessionCount} sessions`)
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed] 错误：未设置 DATABASE_URL 环境变量')
    process.exit(1)
  }

  const dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  console.log('[seed] Generating 30 days of test data...')

  for (const date of dates) {
    const sessionCount = randomInt(80, 200)
    await seedDay(date, sessionCount)
  }

  console.log('[seed] Running ETL for seeded dates...')
  for (const date of dates) {
    const result = await runETL(date)
    if (result.errors.length > 0) {
      console.error(`[seed] ETL failed for ${date}:`, result.errors)
    } else {
      console.log(
        `[seed] ETL ${date}: raw=${result.recordsProcessed}, summary=${result.summaryRecords}, paths=${result.pathRecords}, insights=${result.pathInsightRecords}, keywords=${(result as any).keywordRecords ?? 0}`
      )
    }
  }

  console.log('[seed] Done')
  process.exit(0)
}

main().catch((error) => {
  console.error('[seed] Unhandled error:', error)
  process.exit(1)
})
