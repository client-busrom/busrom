import { describe, expect, it, vi } from 'vitest'

const mockUpdates: any[] = []

vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

import { db } from '../../db'
import {
  calculateSessionMetrics,
  calculateSummary,
  calculateTrends,
  buildVisitorPaths,
  buildPathInsights,
  isLeadEvent,
} from '../etl'

const date = '2026-06-23'

function createRawEvent(overrides: Record<string, any>) {
  return {
    sessionId: 's1',
    visitorId: 'v1',
    pagePath: '/home',
    channel: 'direct',
    eventType: 'pageview',
    timestamp: `${date}T10:00:00Z`,
    ...overrides,
  }
}

const fixture = [
  createRawEvent({
    sessionId: 's1',
    visitorId: 'v1',
    pagePath: '/home',
    channel: 'organic',
    deviceType: 'desktop',
    browser: 'chrome',
    country: 'US',
    timestamp: `${date}T10:00:00Z`,
  }),
  createRawEvent({
    sessionId: 's1',
    visitorId: 'v1',
    pagePath: '/products',
    channel: 'organic',
    deviceType: 'desktop',
    browser: 'chrome',
    country: 'US',
    timestamp: `${date}T10:00:30Z`,
  }),
  createRawEvent({
    sessionId: 's1',
    visitorId: 'v1',
    pagePath: '/products',
    channel: 'organic',
    deviceType: 'desktop',
    browser: 'chrome',
    country: 'US',
    eventType: 'conversion',
    timestamp: `${date}T10:01:00Z`,
  }),
  createRawEvent({
    sessionId: 's2',
    visitorId: 'v2',
    pagePath: '/home',
    channel: 'direct',
    deviceType: 'mobile',
    browser: 'safari',
    country: 'CN',
    timestamp: `${date}T11:00:00Z`,
  }),
  createRawEvent({
    sessionId: 's3',
    visitorId: 'v3',
    pagePath: '/home',
    channel: 'ad',
    deviceType: 'tablet',
    browser: 'firefox',
    country: 'UK',
    timestamp: `${date}T12:00:00Z`,
  }),
  createRawEvent({
    sessionId: 's3',
    visitorId: 'v3',
    pagePath: '/contact',
    channel: 'ad',
    deviceType: 'tablet',
    browser: 'firefox',
    country: 'UK',
    eventType: 'form_submit',
    timestamp: `${date}T12:00:45Z`,
  }),
]

describe('isLeadEvent', () => {
  it('returns true for conversion events', () => {
    expect(isLeadEvent({ eventType: 'conversion' })).toBe(true)
  })

  it('returns true for WhatsApp click', () => {
    expect(
      isLeadEvent({
        eventType: 'click',
        eventData: { elementText: 'Chat on WhatsApp', href: 'https://wa.me/123' },
      })
    ).toBe(true)
  })

  it('returns true for email click', () => {
    expect(
      isLeadEvent({
        eventType: 'click',
        eventData: { href: 'mailto:sales@busrom.com' },
      })
    ).toBe(true)
  })

  it('returns true for online chat click', () => {
    expect(
      isLeadEvent({
        eventType: 'click',
        eventData: { elementText: '在线客服', elementId: 'chat-button' },
      })
    ).toBe(true)
  })

  it('returns false for generic click', () => {
    expect(
      isLeadEvent({
        eventType: 'click',
        eventData: { elementText: 'Read more' },
      })
    ).toBe(false)
  })

  it('returns false for pageview', () => {
    expect(isLeadEvent({ eventType: 'pageview' })).toBe(false)
  })
})

describe('calculateSessionMetrics', () => {
  it('groups raw events by session', () => {
    const sessions = calculateSessionMetrics(fixture)

    expect(sessions.size).toBe(3)
    expect(sessions.get('s1')).toMatchObject({
      sessionId: 's1',
      visitorId: 'v1',
      pages: ['/home', '/products', '/products'],
      pagePaths: ['/home', '/products'],
      events: ['pageview', 'pageview', 'conversion'],
      channels: ['organic'],
    })
    expect(sessions.get('s2')).toMatchObject({
      pages: ['/home'],
      pagePaths: ['/home'],
    })
  })
})

describe('calculateSummary', () => {
  it('returns correct PV/UV/sessions/bounce_rate/conversion_rate/form_submissions/avg_duration', () => {
    const sessions = calculateSessionMetrics(fixture)
    const summary = calculateSummary(fixture, sessions, date)

    const homeOrganic = summary.find(
      (r) => r.pagePath === '/home' && r.channel === 'organic'
    )
    const productsOrganic = summary.find(
      (r) => r.pagePath === '/products' && r.channel === 'organic'
    )
    const homeDirect = summary.find(
      (r) => r.pagePath === '/home' && r.channel === 'direct'
    )
    const homeAd = summary.find(
      (r) => r.pagePath === '/home' && r.channel === 'ad'
    )
    const contactAd = summary.find(
      (r) => r.pagePath === '/contact' && r.channel === 'ad'
    )

    expect(homeOrganic).toEqual(
      expect.objectContaining({
        date,
        pagePath: '/home',
        channel: 'organic',
        pv: 1,
        uv: 1,
        sessions: 1,
        bounceRate: 0,
        avgDuration: 60,
        conversions: 0,
        formSubmissions: 0,
        conversionRate: 0,
        deviceBreakdown: { desktop: 1 },
        browserBreakdown: { chrome: 1 },
        countryBreakdown: { US: 1 },
      })
    )

    expect(productsOrganic).toEqual(
      expect.objectContaining({
        date,
        pagePath: '/products',
        channel: 'organic',
        pv: 2,
        uv: 1,
        sessions: 1,
        bounceRate: 0,
        avgDuration: 60,
        conversions: 1,
        formSubmissions: 0,
        conversionRate: 100,
      })
    )

    expect(homeDirect).toEqual(
      expect.objectContaining({
        date,
        pagePath: '/home',
        channel: 'direct',
        pv: 1,
        uv: 1,
        sessions: 1,
        bounceRate: 100,
        avgDuration: 0,
        conversions: 0,
        formSubmissions: 0,
        conversionRate: 0,
        deviceBreakdown: { mobile: 1 },
        browserBreakdown: { safari: 1 },
        countryBreakdown: { CN: 1 },
      })
    )

    expect(homeAd).toEqual(
      expect.objectContaining({
        date,
        pagePath: '/home',
        channel: 'ad',
        pv: 1,
        uv: 1,
        sessions: 1,
        bounceRate: 0,
        avgDuration: 45,
        conversions: 0,
        formSubmissions: 0,
        conversionRate: 0,
      })
    )

    expect(contactAd).toEqual(
      expect.objectContaining({
        date,
        pagePath: '/contact',
        channel: 'ad',
        pv: 1,
        uv: 1,
        sessions: 1,
        bounceRate: 0,
        avgDuration: 45,
        conversions: 0,
        formSubmissions: 1,
        conversionRate: 0,
      })
    )
  })

  it('returns empty array for empty raw data', () => {
    const summary = calculateSummary([], new Map(), date)
    expect(summary).toEqual([])
  })
})

describe('calculateTrends', () => {
  it('computes day-over-day/week-over-month changes', async () => {
    const current = [
      {
        pagePath: '/home',
        channel: 'organic',
        pv: 200,
        uv: 100,
        sessions: 80,
        conversions: 4,
        formSubmissions: 2,
      },
    ]
    const previous = [
      {
        date: '2026-06-22',
        pagePath: '/home',
        channel: 'organic',
        pv: 100,
        uv: 50,
        sessions: 40,
        conversions: 2,
        formSubmissions: 1,
      },
      {
        date: '2026-06-16',
        pagePath: '/home',
        channel: 'organic',
        pv: 50,
        uv: 25,
        sessions: 20,
        conversions: 1,
        formSubmissions: 0,
      },
      {
        date: '2026-05-24',
        pagePath: '/home',
        channel: 'organic',
        pv: 400,
        uv: 200,
        sessions: 160,
        conversions: 8,
        formSubmissions: 4,
      },
    ]

    ;(db as any).select
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(current),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(previous),
        })),
      })

    ;(db as any).update.mockReturnValue({
      set: vi.fn((values: any) => {
        mockUpdates.push(values)
        return {
          where: vi.fn().mockResolvedValue(undefined),
        }
      }),
    })

    await calculateTrends(date)

    expect(mockUpdates).toHaveLength(1)
    expect(mockUpdates[0]).toMatchObject({
      pvChangeDay: 100,
      pvChangeWeek: 300,
      pvChangeMonth: -50,
      uvChangeDay: 100,
      uvChangeWeek: 300,
      uvChangeMonth: -50,
      sessionsChangeDay: 100,
      sessionsChangeWeek: 300,
      sessionsChangeMonth: -50,
      conversionsChangeDay: 100,
      conversionsChangeWeek: 300,
      conversionsChangeMonth: -50,
      formSubmissionsChangeDay: 100,
      formSubmissionsChangeMonth: -50,
    })
    expect(mockUpdates[0].formSubmissionsChangeWeek).toBeNull()
  })

  it('returns early when no current records exist', async () => {
    ;(db as any).select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })

    mockUpdates.length = 0
    await expect(calculateTrends(date)).resolves.toBeUndefined()
    expect(mockUpdates).toHaveLength(0)
  })
})

describe('buildVisitorPaths', () => {
  it('produces expected entry pages, exit pages, and conversion flags', () => {
    const sessions = calculateSessionMetrics(fixture)
    const paths = buildVisitorPaths(fixture, sessions, date)

    expect(paths).toHaveLength(3)

    const s1 = paths.find((p) => p.sessionId === 's1')
    const s2 = paths.find((p) => p.sessionId === 's2')
    const s3 = paths.find((p) => p.sessionId === 's3')

    expect(s1).toEqual(
      expect.objectContaining({
        sessionId: 's1',
        visitorId: 'v1',
        entryPage: '/home',
        exitPage: '/products',
        pageCount: 3,
        duration: 60,
        converted: true,
        conversionPage: '/products',
        date,
      })
    )
    expect(s1?.pathSequence).toEqual(['/home', '/products', '/products'])

    expect(s2).toEqual(
      expect.objectContaining({
        sessionId: 's2',
        entryPage: '/home',
        exitPage: '/home',
        pageCount: 1,
        duration: 0,
        converted: false,
        conversionPage: null,
      })
    )

    expect(s3).toEqual(
      expect.objectContaining({
        sessionId: 's3',
        entryPage: '/home',
        exitPage: '/contact',
        pageCount: 2,
        duration: 45,
        converted: true,
        conversionPage: '/contact',
      })
    )
  })
})

describe('buildPathInsights', () => {
  it('aggregates top paths, entry pages, exit pages, drop offs, and conversion paths', () => {
    const sessions = calculateSessionMetrics(fixture)
    const paths = buildVisitorPaths(fixture, sessions, date)
    const insights = buildPathInsights(paths, date)

    const byType = (type: string) =>
      insights.filter((i) => i.insightType === type)

    const entryPages = byType('entry_pages')
    expect(entryPages).toHaveLength(1)
    expect(entryPages[0]).toMatchObject({
      insightKey: '/home',
      value: 3,
      conversionCount: 2,
    })

    const exitPages = byType('exit_pages')
    expect(exitPages).toHaveLength(3)
    expect(exitPages.map((i) => i.insightKey).sort()).toEqual([
      '/contact',
      '/home',
      '/products',
    ])

    const dropOffs = byType('drop_offs')
    expect(dropOffs).toHaveLength(1)
    expect(dropOffs[0]).toMatchObject({
      insightKey: '/home',
      value: 1,
    })

    const topPaths = byType('top_paths')
    expect(topPaths).toHaveLength(3)

    const conversionPaths = byType('conversion_paths')
    expect(conversionPaths).toHaveLength(2)
    expect(conversionPaths.every((i) => i.conversionCount > 0)).toBe(true)
  })
})
