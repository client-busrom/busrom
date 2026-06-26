import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'https://cms.busromhouse.com'
const CMS_COOKIE_NAME = 'payload-token'

function getPayloadSecret(): string {
  return process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION'
}

const ALLOWED_ROLES = ['admin', 'editor', 'analytics']

async function verifyPayloadToken(token: string) {
  try {
    const secret = new TextEncoder().encode(getPayloadSecret())
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      clockTolerance: 60,
    })
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

function extractToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(CMS_COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

function checkPermission(user: any): boolean {
  if (user.isAdmin === true || user.isAdmin === 'true') return true
  const roles = user.roles || []
  return roles.some((role: string) => ALLOWED_ROLES.includes(role))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/api/analytics')) {
    return NextResponse.next()
  }

  if (pathname === '/api/analytics/track' && request.method === 'POST') {
    return NextResponse.next()
  }

  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  const token = extractToken(request)

  console.log('[CDP Middleware] Request URL:', request.url)
  console.log('[CDP Middleware] Cookie header:', request.headers.get('cookie'))
  console.log('[CDP Middleware] Token found:', !!token)

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token provided' },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/admin/login', PAYLOAD_URL)
    loginUrl.searchParams.set('redirect', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const user = await verifyPayloadToken(token)

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token' },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/admin/login', PAYLOAD_URL)
    loginUrl.searchParams.set('redirect', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (!checkPermission(user)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/admin/unauthorized', PAYLOAD_URL))
  }

  const response = NextResponse.next()
  response.headers.set('x-cdp-user-id', (user.id as string) || '')
  response.headers.set('x-cdp-user-email', (user.email as string) || '')
  response.headers.set('x-cdp-user-roles', JSON.stringify(user.roles || []))

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
