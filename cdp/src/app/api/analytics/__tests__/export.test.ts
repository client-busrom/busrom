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

vi.mock('@/db', () => ({
  db: mockDb,
}))

import { GET } from '../export/route'

describe('GET /api/analytics/export', () => {
  beforeEach(() => {
    mockDb.setRows([])
    mockDb.select.mockClear()
  })

  it('returns 400 when type is missing', async () => {
    const request = new NextRequest(
      'http://localhost/api/analytics/export',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Bad request')
  })

  it('returns 400 for unsupported export type', async () => {
    const request = new NextRequest(
      'http://localhost/api/analytics/export?type=unsupported',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Bad request')
  })

  it('exports summary as CSV by default', async () => {
    mockDb.setRows([
      {
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
        deviceBreakdown: { desktop: 60 },
        browserBreakdown: { chrome: 60 },
        countryBreakdown: { US: 60 },
      },
    ])

    const request = new NextRequest(
      'http://localhost/api/analytics/export?type=summary&date=2026-06-23',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    const body = await response.text()
    expect(body).toContain('Date,Page Path,Channel,PV')
    expect(body).toContain('2026-06-23,/home,organic,100')
  })

  it('exports summary as JSON when requested', async () => {
    mockDb.setRows([
      {
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
        deviceBreakdown: { desktop: 60 },
        browserBreakdown: { chrome: 60 },
        countryBreakdown: { US: 60 },
      },
    ])

    const request = new NextRequest(
      'http://localhost/api/analytics/export?type=summary&format=json&date=2026-06-23',
      { method: 'GET' }
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    const json = await response.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].pagePath).toBe('/home')
  })
})
