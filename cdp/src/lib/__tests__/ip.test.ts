import { describe, expect, it } from 'vitest'
import { anonymizeIp, getClientIp, isPrivateIp } from '../ip'

function makeRequest(headers: Record<string, string>) {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof getClientIp>[0]
}

describe('getClientIp', () => {
  it('correctly parses X-Forwarded-For with multiple IPs', () => {
    const request = makeRequest({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
    })
    expect(getClientIp(request)).toBe('1.2.3.4')
  })

  it('trims whitespace around the first IP', () => {
    const request = makeRequest({
      'x-forwarded-for': '  8.8.8.8  , 1.1.1.1',
    })
    expect(getClientIp(request)).toBe('8.8.8.8')
  })

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const request = makeRequest({ 'x-real-ip': '2.2.2.2' })
    expect(getClientIp(request)).toBe('2.2.2.2')
  })

  it('prefers x-forwarded-over x-real-ip', () => {
    const request = makeRequest({
      'x-forwarded-for': '3.3.3.3',
      'x-real-ip': '4.4.4.4',
    })
    expect(getClientIp(request)).toBe('3.3.3.3')
  })

  it('returns null when no IP header is present', () => {
    expect(getClientIp(makeRequest({}))).toBeNull()
  })
})

describe('anonymizeIp', () => {
  it('anonymizes IPv4 by zeroing the last octet', () => {
    expect(anonymizeIp('1.2.3.4')).toBe('1.2.3.0')
    expect(anonymizeIp('192.168.1.100')).toBe('192.168.1.0')
  })

  it('anonymizes full IPv6 by zeroing the last hextet', () => {
    expect(anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(
      '2001:0db8:85a3:0000:0000:8a2e:0370:0'
    )
  })

  it('anonymizes compressed IPv6 by zeroing the last hextet', () => {
    expect(anonymizeIp('2001:db8::1')).toBe('2001:db8::0')
    expect(anonymizeIp('::1')).toBe('::0')
  })

  it('returns "anonymized" for unknown formats', () => {
    expect(anonymizeIp('not-an-ip')).toBe('anonymized')
    expect(anonymizeIp('')).toBe('anonymized')
  })
})

describe('isPrivateIp', () => {
  it('recognizes loopback addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
    expect(isPrivateIp('::1')).toBe(true)
  })

  it('recognizes 10.x.x.x private range', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
    expect(isPrivateIp('10.255.255.255')).toBe(true)
  })

  it('recognizes 192.168.x.x private range', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true)
    expect(isPrivateIp('192.168.0.0')).toBe(true)
  })

  it('returns false for public addresses', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
    expect(isPrivateIp('1.2.3.4')).toBe(false)
  })
})
