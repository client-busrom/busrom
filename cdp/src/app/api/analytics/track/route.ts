import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { trafficRaw } from '@/db/schema'
import { anonymizeIp, getClientIp, lookupGeo } from '@/lib/ip'

/**
 * GDPR / EEA 国家代码集合。
 * 来源包含欧盟成员国、欧洲经济区（EEA）及瑞士、英国等常见需匿名化区域。
 */
const GDPR_COUNTRY_CODES = new Set([
  // 欧盟成员国
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // 欧洲经济区（EEA）
  'IS', 'LI', 'NO',
  // 其他常见需匿名化区域
  'CH', 'UK',
])

/**
 * POST /api/analytics/track
 *
 * 接收前端埋点数据并写入数据库
 */
export async function POST(request: NextRequest) {
  try {
    let data: any
    try {
      data = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing JSON body' },
        { status: 400 }
      )
    }

    // 数据验证
    if (!data.sessionId || !data.visitorId || !data.pagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 客户端传了 country/city 时优先使用客户端值；否则使用服务端解析值
    let country = data.country
    let city = data.city

    // 先用真实 IP 解析 geo（国家/城市），用于 fallback 与 GDPR 判断
    const rawIp = getClientIp(request) || data.ipAddress || null
    if (rawIp && (!country || !city)) {
      const geo = lookupGeo(rawIp)
      if (geo) {
        country = country || geo.country
        city = city || geo.city
      }
    }

    // 若开启全局匿名化，或解析出的国家属于 GDPR/EEA 范围，则对 IP 做匿名化
    const resolvedCountry = country || undefined
    const shouldAnonymize =
      process.env.CDP_ANONYMIZE_IP === 'true' ||
      (resolvedCountry && GDPR_COUNTRY_CODES.has(resolvedCountry))

    let ipAddress = rawIp
    if (ipAddress && shouldAnonymize) {
      ipAddress = anonymizeIp(ipAddress)
    }

    // 写入数据库
    await db.insert(trafficRaw).values({
      sessionId: data.sessionId,
      visitorId: data.visitorId,
      pagePath: data.pagePath,
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      channel: data.channel || 'direct',
      deviceType: data.deviceType,
      browser: data.browser,
      os: data.os,
      country,
      city,
      ipAddress,
      userAgent: data.userAgent,
      screenResolution: data.screenResolution,
      language: data.language,
      eventType: data.eventType || 'pageview',
      eventData: data.eventData,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Track API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
