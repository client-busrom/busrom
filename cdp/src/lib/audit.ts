import { NextRequest } from 'next/server'
import { db } from '@/db'
import { auditLogs } from '@/db/schema'
import { anonymizeIp, getClientIp } from './ip'

export type AuditAction =
  | 'export_summary'
  | 'export_keywords'
  | 'export_path_insights'
  | 'export_lead_stats'
  | 'export_channel_bounce'
  | 'view_report'
  | 'run_etl'

export interface AuditEvent {
  request: NextRequest
  action: AuditAction
  resourceType: string
  resourceId?: string | null
  details?: Record<string, unknown>
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export interface AuditUser {
  id: string
  email: string
  roles: string[]
}

export function getAuditUserFromHeaders(request: NextRequest): AuditUser | null {
  const id = request.headers.get('x-cdp-user-id')
  const email = request.headers.get('x-cdp-user-email')
  const roles = safeJsonParse<string[]>(request.headers.get('x-cdp-user-roles'), [])

  if (!id && !email && roles.length === 0) return null

  return {
    id: id || '',
    email: email || '',
    roles,
  }
}

export function getEffectiveUserRole(request: NextRequest): string {
  const user = getAuditUserFromHeaders(request)
  const roles = user?.roles || []
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('editor')) return 'editor'
  if (roles.includes('analytics')) return 'analytics'
  return 'unknown'
}

function hasRole(user: AuditUser | null, role: string): boolean {
  return user?.roles.includes(role) ?? false
}

/**
 * 写入审计日志。
 *
 * 隐私策略：
 * - admin 角色的访问日志保留原始 IP，便于安全审计。
 * - editor / analytics / 未知用户写入的审计日志中的 ip_address 会被匿名化，
 *   与 track 接口的 GDPR 匿名化策略保持一致。
 */
export async function logAudit(event: AuditEvent): Promise<void> {
  try {
    const user = getAuditUserFromHeaders(event.request)
    const rawIp = getClientIp(event.request)

    const isAdmin = hasRole(user, 'admin')
    const ipAddress = rawIp ? (isAdmin ? rawIp : anonymizeIp(rawIp)) : null

    await db.insert(auditLogs).values({
      userId: user?.id || null,
      userEmail: user?.email || null,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId || null,
      details: event.details || {},
      ipAddress,
      userAgent: event.request.headers.get('user-agent') || null,
    })
  } catch (error) {
    // 审计日志失败不应影响主业务，记录错误即可
    console.error('[Audit] Failed to write audit log:', error)
  }
}
