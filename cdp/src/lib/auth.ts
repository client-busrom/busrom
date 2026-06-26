import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Payload CMS 配置
const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3002'
const CMS_COOKIE_NAME = 'payload-token'

function getPayloadSecret(): string {
  return process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION'
}

// 允许访问 CDP 的角色
const ALLOWED_ROLES = ['admin', 'editor', 'analytics']

export interface CDPUser {
  id: string
  email: string
  name: string
  roles: string[]
  isAdmin: boolean
  collection: string
}

/**
 * 验证 Payload CMS JWT Token
 */
export async function verifyPayloadToken(token: string): Promise<CDPUser | null> {
  try {
    const secret = new TextEncoder().encode(getPayloadSecret())
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      clockTolerance: 60,
    })

    const user = payload as any

    return {
      id: user.id || user.sub || '',
      email: user.email || '',
      name: user.name || user.email || '',
      roles: user.roles || [],
      isAdmin: user.isAdmin === true || user.isAdmin === 'true',
      collection: user.collection || 'users',
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * 从请求中提取 token
 */
function extractToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(CMS_COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * 检查用户是否有权限访问 CDP
 */
export function checkPermission(user: CDPUser): boolean {
  if (user.isAdmin) return true
  return user.roles.some(role => ALLOWED_ROLES.includes(role))
}

export const isAllowedRole = checkPermission

/**
 * 认证中间件 - 用于 API 路由
 */
export async function withAuth(
  request: NextRequest,
  handler: (user: CDPUser, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = extractToken(request)

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No token provided' },
      { status: 401 }
    )
  }

  const user = await verifyPayloadToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid token' },
      { status: 401 }
    )
  }

  if (!checkPermission(user)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  return handler(user, request)
}

/**
 * 获取当前用户信息（用于页面组件）
 */
export async function getCurrentUser(request: NextRequest): Promise<CDPUser | null> {
  const token = extractToken(request)
  if (!token) return null

  const user = await verifyPayloadToken(token)
  if (!user || !checkPermission(user)) return null

  return user
}

/**
 * 重定向到 CMS 登录页
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/admin/login', PAYLOAD_URL)
  loginUrl.searchParams.set('redirect', request.url)
  return NextResponse.redirect(loginUrl)
}

/**
 * 中间件函数 - 用于 Next.js middleware
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/admin/cdp') && !pathname.startsWith('/api/analytics')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/analytics')) {
    const token = extractToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token provided' },
        { status: 401 }
      )
    }

    const user = await verifyPayloadToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token' },
        { status: 401 }
      )
    }

    if (!checkPermission(user)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-cdp-user', JSON.stringify(user))

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const user = await getCurrentUser(request)
  if (!user) {
    return redirectToLogin(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/cdp/:path*', '/api/analytics/:path*'],
}
