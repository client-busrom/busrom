import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    setRows: (rows: any[]) => {
      currentRows = rows
    },
  }
})

const mockRunETL = vi.hoisted(() => vi.fn())

vi.mock('@/db', () => ({
  db: mockDb,
}))

vi.mock('@/jobs/etl', () => ({
  runETL: mockRunETL,
}))

import { GET, POST } from '../summary/route'

describe('GET /api/analytics/summary', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('returns overview data aggregated from traffic_summary', async () => {
    mockDb.setRows([
      {
        id: 1,
        date: '2026-06-23',
        pagePath: 'all',
        channel: 'all',
        pv: 100,
        uv: 80,
        sessions: 60,
        bounceRate: 30,
        avgDuration: 120,
        conversions: 3,
        formSubmissions: 2,
        conversionRate: 5,
        formConversionRate: 3.33,
        leads: 4,
      },
      {
        id: 2,
        date: '2026-06-22',
        pagePath: 'all',
        channel: 'all',
        pv: 50,
        uv: 40,
        sessions: 30,
        bounceRate: 20,
        avgDuration: 90,
        conversions: 1,
        formSubmissions: 0,
        conversionRate: 3.33,
        formConversionRate: 0,
        leads: 1,
      },
    ])

    const request = new NextRequest(
      'http://localhost/api/analytics/summary?type=overview&startDate=2026-06-22&endDate=2026-06-23',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.totalPV).toBe(150)
    expect(json.data.totalUV).toBe(120)
    expect(json.data.totalSessions).toBe(90)
    expect(json.data.totalConversions).toBe(4)
    expect(json.data.totalFormSubmissions).toBe(2)
    expect(json.data.totalLeads).toBe(5)
    expect(json.data.records).toBe(2)
  })

  it('supports summary type with date filters', async () => {
    mockDb.setRows([
      {
        id: 1,
        date: '2026-06-23',
        pagePath: '/home',
        channel: 'organic',
        pv: 100,
        uv: 80,
        sessions: 60,
        bounceRate: 30,
        avgDuration: 120,
        conversions: 3,
        formSubmissions: 2,
        conversionRate: 5,
      },
    ])

    const request = new NextRequest(
      'http://localhost/api/analytics/summary?type=summary&date=2026-06-23',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(1)
    expect(json.count).toBe(1)
  })
})

describe('POST /api/analytics/summary?action=run-etl', () => {
  beforeEach(() => {
    mockRunETL.mockReset()
  })

  it('rejects invalid action', async () => {
    const request = new NextRequest(
      'http://localhost/api/analytics/summary?action=invalid',
      { method: 'POST' }
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Bad request')
  })

  it('rejects missing or invalid ETL_API_KEY', async () => {
    const request = new NextRequest(
      'http://localhost/api/analytics/summary?action=run-etl',
      {
        method: 'POST',
        headers: { 'x-etl-api-key': 'wrong-key' },
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('runs ETL with valid ETL_API_KEY header', async () => {
    mockRunETL.mockResolvedValue({
      date: '2026-06-23',
      recordsProcessed: 42,
      summaryRecords: 5,
      pathRecords: 10,
      pathInsightRecords: 8,
      keywordRecords: 3,
      errors: [],
    })

    const request = new NextRequest(
      'http://localhost/api/analytics/summary?action=run-etl&date=2026-06-23',
      {
        method: 'POST',
        headers: { 'x-etl-api-key': 'test-etl-key' },
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.result.recordsProcessed).toBe(42)
    expect(mockRunETL).toHaveBeenCalledWith('2026-06-23')
  })

  it('runs ETL with valid Bearer token authorization', async () => {
    mockRunETL.mockResolvedValue({
      date: '2026-06-23',
      recordsProcessed: 10,
      summaryRecords: 1,
      pathRecords: 2,
      pathInsightRecords: 1,
      keywordRecords: 0,
      errors: [],
    })

    const request = new NextRequest(
      'http://localhost/api/analytics/summary?action=run-etl',
      {
        method: 'POST',
        headers: { authorization: 'Bearer test-etl-key' },
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
  })

  it('returns 500 when ETL reports errors', async () => {
    mockRunETL.mockResolvedValue({
      date: '2026-06-23',
      recordsProcessed: 0,
      summaryRecords: 0,
      pathRecords: 0,
      pathInsightRecords: 0,
      keywordRecords: 0,
      errors: ['DB connection failed'],
    })

    const request = new NextRequest(
      'http://localhost/api/analytics/summary?action=run-etl',
      {
        method: 'POST',
        headers: { 'x-etl-api-key': 'test-etl-key' },
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.success).toBe(false)
    expect(json.errors).toContain('DB connection failed')
  })
})
