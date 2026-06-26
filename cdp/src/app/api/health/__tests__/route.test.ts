import { describe, expect, it } from 'vitest'
import { GET } from '../route'

describe('GET /api/health', () => {
  it('returns ok status with service metadata', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    const json = await response.json()

    expect(json.status).toBe('ok')
    expect(json.service).toBe('busrom-cdp')
    expect(json.version).toBe('1.0.0')
    expect(json.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
