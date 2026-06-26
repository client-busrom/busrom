import { describe, expect, it } from 'vitest'
import { maskSensitiveData } from '../masking'

describe('maskSensitiveData', () => {
  const rawEvent = {
    id: 1,
    sessionId: 'sess-123',
    visitorId: 'vis-456',
    pagePath: '/home',
    ipAddress: '203.0.113.42',
    city: 'Shanghai',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    country: 'CN',
  }

  it('returns full data for admin role', () => {
    expect(maskSensitiveData(rawEvent, 'admin')).toEqual(rawEvent)
  })

  it('masks ipAddress, city and userAgent for analytics role', () => {
    const masked = maskSensitiveData(rawEvent, 'analytics')
    expect(masked.ipAddress).toBe('203.0.113.0')
    expect(masked.city).toBe('MASKED')
    expect(masked.userAgent).toBe('[REDACTED]')
    expect(masked.country).toBe('CN')
    expect(masked.sessionId).toBe('sess-123')
  })

  it('masks editor role the same way as analytics', () => {
    const masked = maskSensitiveData(rawEvent, 'editor')
    expect(masked.ipAddress).toBe('203.0.113.0')
    expect(masked.city).toBe('MASKED')
    expect(masked.userAgent).toBe('[REDACTED]')
  })

  it('recursively masks arrays of objects', () => {
    const rows = [rawEvent, { ...rawEvent, id: 2, ipAddress: '198.51.100.7' }]
    const masked = maskSensitiveData(rows, 'analytics') as typeof rows
    expect(masked[0].ipAddress).toBe('203.0.113.0')
    expect(masked[1].ipAddress).toBe('198.51.100.0')
  })

  it('anonymizes IPv6 addresses', () => {
    const row = { ipAddress: '2001:db8::1' }
    const masked = maskSensitiveData(row, 'analytics')
    expect(masked.ipAddress).toBe('2001:db8::0')
  })

  it('leaves non-sensitive primitives unchanged', () => {
    expect(maskSensitiveData('plain-string', 'analytics')).toBe('plain-string')
    expect(maskSensitiveData(42, 'analytics')).toBe(42)
    expect(maskSensitiveData(null, 'analytics')).toBeNull()
  })
})
