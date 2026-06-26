import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(),
  },
}))

import { db } from '@/db'
import { POST } from '../track/route'

describe('POST /api/analytics/track', () => {
  beforeEach(() => {
    ;(db as any).insert.mockReset()
    ;(db as any).insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
  })

  it('accepts a valid payload and inserts a row', async () => {
    const body = {
      sessionId: 'sess-1',
      visitorId: 'visit-1',
      pagePath: '/home',
      channel: 'organic',
      deviceType: 'desktop',
      browser: 'chrome',
      country: 'US',
      eventType: 'pageview',
    }

    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ success: true })

    expect((db as any).insert).toHaveBeenCalledTimes(1)
    const inserted = (db as any).insert.mock.results[0].value.values.mock.calls[0][0]
    expect(inserted).toMatchObject({
      sessionId: 'sess-1',
      visitorId: 'visit-1',
      pagePath: '/home',
      channel: 'organic',
      eventType: 'pageview',
    })
  })

  it('returns 400 for invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Invalid or missing JSON body')
  })

  it('returns 400 when required fields are missing', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ visitorId: 'visit-1', pagePath: '/home' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Missing required fields')
  })

  it('falls back to default channel and event type', async () => {
    const body = {
      sessionId: 'sess-2',
      visitorId: 'visit-2',
      pagePath: '/contact',
    }

    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const inserted = (db as any).insert.mock.results[0].value.values.mock.calls[0][0]
    expect(inserted.channel).toBe('direct')
    expect(inserted.eventType).toBe('pageview')
  })
})
