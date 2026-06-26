import { describe, expect, it, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { middleware } from './middleware'

const TEST_SECRET = process.env.PAYLOAD_SECRET as string

async function signToken(payload: Record<string, any>) {
  const secret = new TextEncoder().encode(TEST_SECRET)
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret)
}

function createRequest(
  path: string,
  options: { method?: string; token?: string; bearer?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {}
  if (options.bearer) {
    headers.authorization = `Bearer ${options.bearer}`
  }
  if (options.token) {
    headers.cookie = `payload-token=${options.token}`
  }

  return new NextRequest(`http://localhost${path}`, {
    method: options.method || 'GET',
    headers,
  })
}

describe('middleware', () => {
  it('passes through non-analytics routes', async () => {
    const request = createRequest('/some/other/path')
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('bypasses auth for POST /api/analytics/track', async () => {
    const request = createRequest('/api/analytics/track', { method: 'POST' })
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('bypasses auth for /api/health', async () => {
    const request = createRequest('/api/health')
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('returns 401 when no token is provided', async () => {
    const request = createRequest('/api/analytics/summary')
    const response = await middleware(request)

    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 401 for an invalid token', async () => {
    const request = createRequest('/api/analytics/summary', {
      token: 'invalid.token.here',
    })
    const response = await middleware(request)

    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.message).toBe('Invalid token')
  })

  it('returns 403 for a user with insufficient permissions', async () => {
    const token = await signToken({
      id: 'user-viewer',
      email: 'viewer@busrom.com',
      roles: ['viewer'],
    })

    const request = createRequest('/api/analytics/summary', { token })
    const response = await middleware(request)

    expect(response.status).toBe(403)
    const json = await response.json()
    expect(json.error).toBe('Forbidden')
  })

  it('allows requests with a valid token and allowed role', async () => {
    const token = await signToken({
      id: 'user-editor',
      email: 'editor@busrom.com',
      roles: ['editor'],
    })

    const request = createRequest('/api/analytics/summary', { token })
    const response = await middleware(request)

    expect(response.status).toBe(200)
    const requestHeaders = (response as any).request?.headers ?? response.headers
    expect(requestHeaders.get('x-cdp-user-id')).toBe('user-editor')
    expect(requestHeaders.get('x-cdp-user-email')).toBe('editor@busrom.com')
    expect(requestHeaders.get('x-cdp-user-roles')).toBe(JSON.stringify(['editor']))
  })

  it('allows admin users regardless of roles', async () => {
    const token = await signToken({
      id: 'user-admin',
      email: 'admin@busrom.com',
      roles: ['viewer'],
      isAdmin: true,
    })

    const request = createRequest('/api/analytics/summary', { token })
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })

  it('extracts token from Bearer authorization header', async () => {
    const token = await signToken({
      id: 'user-analytics',
      email: 'analytics@busrom.com',
      roles: ['analytics'],
    })

    const request = createRequest('/api/analytics/summary', { bearer: token })
    const response = await middleware(request)

    expect(response.status).toBe(200)
    const requestHeaders = (response as any).request?.headers ?? response.headers
    expect(requestHeaders.get('x-cdp-user-id')).toBe('user-analytics')
  })
})
