/**
 * UET (Microsoft Bing Ads) 转化追踪工具
 *
 * 所有 UET 事件统一走这里，自动带 GDPR consent 门控：
 * 用户未同意 marketing → 静默跳过，不上报。
 *
 * 用法：
 *   import { trackUetConversion } from '@/lib/analytics/uet'
 *
 *   // 表单提交成功后
 *   trackUetConversion('Submit', 'Request_Quote', 5, 'Lead')
 */

import { isConsentGiven } from '@/lib/consent/use-consent'

export interface UetEventOptions {
  /** 事件动作：'Submit' | 'Email Click' | 'WhatsApp Click' | 自定义 */
  event?: string
  /** 事件标签：标识具体来源，如 'Request_Quote' / 'Email_Floating_Sidebar' */
  event_label?: string
  /** 转化价值（数值） */
  event_value?: number
  /** 事件类别：'Lead' | 'Engagement' | 'Conversion' | 自定义 */
  event_category?: string
}

/**
 * 推送 UET 事件（带 GDPR consent 门控）。
 * - 未同意 marketing：静默跳过
 * - SSR 环境：静默跳过
 *
 * 默认值对应"表单提交转化"场景，可在调用时覆盖。
 */
export function trackUetConversion(
  event = 'Submit',
  event_label = 'Request_Quote',
  event_value = 5,
  event_category = 'Lead'
): void {
  if (typeof window === 'undefined') return
  if (!isConsentGiven('marketing')) return

  const w = window as any
  w.uetq = w.uetq || []
  w.uetq.push('event', event, {
    event_label,
    event_value,
    event_category,
  })
}

/**
 * 推送 UET 事件（对象参数版，适合复杂场景）。
 */
export function trackUetEvent(options: UetEventOptions): void {
  trackUetConversion(
    options.event,
    options.event_label,
    options.event_value,
    options.event_category
  )
}
