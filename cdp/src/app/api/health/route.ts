import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 * Used by Docker and monitoring systems
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'busrom-cdp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
}
