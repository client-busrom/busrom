import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockDb = vi.hoisted(() => ({
  insert: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: mockDb,
}))

import { getAuditUserFromHeaders, getEffectiveUserRole, logAudit } from '../audit'

function makeRequest(headers: Record<string, string>) {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof getAuditUserFromHeaders>[0]
}

describe('getAuditUserFromHeaders', () => {
  it('parses user headers', () => {
    const request = makeRequest({
      'x-cdp-user-id': 'user-1',
      'x-cdp-user-email': 'admin@example.com',
      'x-cdp-user-roles': JSON.stringify(['admin', 'editor']),
    })
    const user = getAuditUserFromHeaders(request)
    expect(user).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      roles: ['admin', 'editor'],
    })
  })

  it('returns null when no user headers are present', () => {
    expect(getAuditUserFromHeaders(makeRequest({}))).toBeNull()
  })

  it('falls back to empty roles for invalid JSON', () => {
    const request = makeRequest({
      'x-cdp-user-id': 'user-2',
      'x-cdp-user-email': 'user@example.com',
      'x-cdp-user-roles': 'not-json',
    })
    const user = getAuditUserFromHeaders(request)
    expect(user?.roles).toEqual([])
  })
})

describe('getEffectiveUserRole', () => {
  it('returns admin when admin role is present', () => {
    const request = makeRequest({ 'x-cdp-user-roles': JSON.stringify(['editor', 'admin']) })
    expect(getEffectiveUserRole(request)).toBe('admin')
  })

  it('returns editor for editor-only roles', () => {
    const request = makeRequest({ 'x-cdp-user-roles': JSON.stringify(['editor']) })
    expect(getEffectiveUserRole(request)).toBe('editor')
  })

  it('returns analytics for analytics-only roles', () => {
    const request = makeRequest({ 'x-cdp-user-roles': JSON.stringify(['analytics']) })
    expect(getEffectiveUserRole(request)).toBe('analytics')
  })

  it('returns unknown for unrecognized roles', () => {
    const request = makeRequest({ 'x-cdp-user-roles': JSON.stringify(['guest']) })
    expect(getEffectiveUserRole(request)).toBe('unknown')
  })
})

describe('logAudit', () => {
  beforeEach(() => {
    mockDb.insert.mockReset()
    mockDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
  })

  it('writes a row with correct user/action/details', async () => {
    const request = makeRequest({
      'x-cdp-user-id': 'user-1',
      'x-cdp-user-email': 'admin@example.com',
      'x-cdp-user-roles': JSON.stringify(['admin']),
      'x-forwarded-for': '203.0.113.42',
      'user-agent': 'TestAgent/1.0',
    })

    await logAudit({
      request,
      action: 'export_summary',
      resourceType: 'summary',
      resourceId: '2026-06-23',
      details: { format: 'csv' },
    })

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
    const inserted = mockDb.insert.mock.results[0].value.values.mock.calls[0][0]
    expect(inserted).toMatchObject({
      userId: 'user-1',
      userEmail: 'admin@example.com',
      action: 'export_summary',
      resourceType: 'summary',
      resourceId: '2026-06-23',
      details: { format: 'csv' },
      userAgent: 'TestAgent/1.0',
    })
    // Admin role keeps raw IP
    expect(inserted.ipAddress).toBe('203.0.113.42')
  })

  it('anonymizes IP for non-admin users', async () => {
    const request = makeRequest({
      'x-cdp-user-id': 'user-2',
      'x-cdp-user-email': 'analyst@example.com',
      'x-cdp-user-roles': JSON.stringify(['analytics']),
      'x-forwarded-for': '203.0.113.42',
    })

    await logAudit({
      request,
      action: 'view_report',
      resourceType: 'report',
    })

    const inserted = mockDb.insert.mock.results[0].value.values.mock.calls[0][0]
    expect(inserted.ipAddress).toBe('203.0.113.0')
  })

  it('does not throw when db insert fails', async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('DB down')),
    })

    const request = makeRequest({
      'x-cdp-user-id': 'user-3',
      'x-cdp-user-roles': JSON.stringify(['editor']),
    })

    await expect(
      logAudit({
        request,
        action: 'run_etl',
        resourceType: 'etl',
      })
    ).resolves.toBeUndefined()
  })
})
