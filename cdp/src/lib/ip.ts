import { type NextRequest } from 'next/server'
import geoip from 'geoip-lite'

/**
 * 从请求中提取真实客户端 IP
 *
 * 优先顺序：x-forwarded-for -> x-real-ip -> request.ip
 */
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for 可能是逗号分隔的 IP 列表，取第一个（最靠近客户端）
    const firstIp = forwarded.split(',')[0].trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // NextRequest 没有原生 ip 属性，使用 request.ip（类型上可能不存在，但运行时可用）
  return (request as unknown as { ip?: string }).ip || null
}

/**
 * 判断 IP 是否为私有/内网/本地地址，这类地址不应进行 geo 解析
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 私有地址段
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^0\./,
    /^255\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
    /^::ffff:(127|0)\./,
    /^::ffff:(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./,
  ]

  return privateRanges.some((range) => range.test(ip))
}

/**
 * 使用 geoip-lite 解析 IP 获取国家/城市
 *
 * 解析失败或私有 IP 返回 null，不阻塞请求。
 */
export function lookupGeo(ip: string): { country?: string; city?: string } | null {
  try {
    if (isPrivateIp(ip)) return null

    const lookup = geoip.lookup(ip)
    if (!lookup) return null

    return {
      country: lookup.country || undefined,
      city: lookup.city || undefined,
    }
  } catch (error) {
    console.error('[Track API] GeoIP lookup failed:', error)
    return null
  }
}

function looksLikeIpv6(ip: string): boolean {
  if (!ip.includes(':')) return false
  const parts = ip.split(':')
  if (parts.length < 3 || parts.length > 8) return false
  return parts.every((part) => part === '' || /^[0-9a-fA-F]{1,4}$/.test(part))
}

/**
 * 对 IP 地址进行匿名化处理，满足 GDPR / 隐私合规要求。
 *
 * - IPv4：最后一组改为 0，如 1.2.3.4 -> 1.2.3.0
 * - IPv6：最后一组 hextet 改为 0
 * - 未知格式：返回 'anonymized'
 */
export function anonymizeIp(ip: string): string {
  if (typeof ip !== 'string' || ip.trim() === '') {
    return 'anonymized'
  }

  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return ip.replace(/\.\d{1,3}$/, '.0')
  }

  // IPv6（支持压缩表示 ::）
  if (looksLikeIpv6(ip)) {
    const parts = ip.split(':')
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] !== '') {
        parts[i] = '0'
        break
      }
    }
    return parts.join(':')
  }

  return 'anonymized'
}
