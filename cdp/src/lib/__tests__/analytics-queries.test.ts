import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockDb = vi.hoisted(() => {
  let currentRows: any[] = []
  function chain(rows: any[]): any {
    return new Proxy(() => rows, {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: any) => any) => Promise.resolve(resolve(rows))
        }
        return chain(rows)
      },
      apply(_target, _thisArg, _args) {
        return chain(rows)
      },
    })
  }
  return {
    select: vi.fn(() => chain(currentRows)),
    setRows: (rows: any[]) => {
      currentRows = rows
    },
  }
})

vi.mock('@/db', () => ({
  db: mockDb,
}))

import {
  getTrafficSummary,
  getVisitorPaths,
  getPathInsights,
  getSearchKeywords,
  getDateDaysAgo,
  getDefaultDateRange,
} from '../analytics-queries'

describe('getTrafficSummary', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('filters by date and orders by date desc', async () => {
    const rows = [
      { id: 1, date: '2026-06-23', pagePath: '/home', channel: 'organic' },
      { id: 2, date: '2026-06-22', pagePath: '/products', channel: 'ad' },
    ]
    mockDb.setRows(rows)

    const result = await getTrafficSummary('2026-06-23', null, null, null, null)

    expect(result).toEqual(rows)
  })

  it('filters by pagePath and channel', async () => {
    mockDb.setRows([
      { id: 1, date: '2026-06-23', pagePath: '/home', channel: 'organic' },
    ])

    const result = await getTrafficSummary(
      null,
      '2026-06-01',
      '2026-06-23',
      '/home',
      'organic'
    )

    expect(result).toHaveLength(1)
    expect(result[0].pagePath).toBe('/home')
    expect(result[0].channel).toBe('organic')
  })
})

describe('getVisitorPaths', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('returns paths for a date range', async () => {
    const rows = [
      {
        id: 1,
        sessionId: 's1',
        pathSequence: ['/home', '/products'],
        entryPage: '/home',
        exitPage: '/products',
        date: '2026-06-23',
      },
    ]
    mockDb.setRows(rows)

    const result = await getVisitorPaths(null, '2026-06-22', '2026-06-23')

    expect(result).toEqual(rows)
  })
})

describe('getPathInsights', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('groups results by insightType', async () => {
    const rows = [
      { id: 1, insightType: 'entry_pages', insightKey: '/home', value: 10, date: '2026-06-23' },
      { id: 2, insightType: 'exit_pages', insightKey: '/contact', value: 5, date: '2026-06-23' },
      { id: 3, insightType: 'entry_pages', insightKey: '/products', value: 3, date: '2026-06-23' },
    ]
    mockDb.setRows(rows)

    const result = await getPathInsights('2026-06-23', null, null)

    expect(result.entry_pages).toHaveLength(2)
    expect(result.exit_pages).toHaveLength(1)
    expect(result.entry_pages[0].insightKey).toBe('/home')
  })
})

describe('getSearchKeywords', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('returns keywords for a specific date', async () => {
    const rows = [
      { id: 1, date: '2026-06-23', keyword: 'running shoes', clicks: 5 },
    ]
    mockDb.setRows(rows)

    const result = await getSearchKeywords('2026-06-23', null, null)

    expect(result).toEqual(rows)
  })
})

describe('date helpers', () => {
  it('getDateDaysAgo returns YYYY-MM-DD string', () => {
    const result = getDateDaysAgo(0)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('getDefaultDateRange returns start and end dates', () => {
    const range = getDefaultDateRange(6)
    expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
