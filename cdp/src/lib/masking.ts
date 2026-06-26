import { anonymizeIp } from './ip'

export type UserRole = 'admin' | 'editor' | 'analytics'

/**
 * 根据用户角色对敏感字段进行脱敏。
 *
 * 敏感字段定义（基于 traffic_raw 等原始数据表）：
 * - ipAddress：非 admin 角色匿名化最后一组（IPv4）或最后一个 hextet（IPv6）。
 * - city：非 admin 角色替换为 'MASKED'，避免精确地理位置泄露。
 * - userAgent：非 admin 角色替换为 '[REDACTED]'，避免设备指纹泄露。
 *
 * admin 角色返回原始数据，editor / analytics 角色应用上述脱敏规则。
 */
export function maskSensitiveData<T>(data: T, userRole: string): T {
  if (userRole === 'admin') return data

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, userRole)) as unknown as T
  }

  if (data !== null && typeof data === 'object') {
    const masked: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (key === 'ipAddress' && typeof value === 'string') {
        masked[key] = anonymizeIp(value)
      } else if (key === 'city' && typeof value === 'string') {
        masked[key] = 'MASKED'
      } else if (key === 'userAgent' && typeof value === 'string') {
        masked[key] = '[REDACTED]'
      } else {
        masked[key] = maskSensitiveData(value, userRole)
      }
    }
    return masked as T
  }

  return data
}
