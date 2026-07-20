'use client'

/**
 * ConsentAwareScript
 *
 * 客户端包装组件：只在用户已同意指定 consent 后才渲染 next/script。
 * 用于 GlobalScripts 中的 marketing 类脚本。
 *
 * 行为：
 *   - SSR / 未确认 consent → 不渲染（脚本不加载）
 *   - 用户拒绝 → 不渲染
 *   - 用户同意 → 渲染 Script 组件
 */

import Script from 'next/script'
import { useConsent } from '@/lib/consent/use-consent'
import type { ConsentPurpose, ConsentServiceName } from '@/lib/consent/klaro-config'

interface ConsentAwareScriptProps {
  /** 要检查的 consent 目的或服务名 */
  purpose: ConsentPurpose | ConsentServiceName
  /** Script id */
  id?: string
  /** 外部脚本 URL */
  src?: string
  /** Script 策略 */
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload'
  /** 内联脚本内容 */
  dangerouslySetInnerHTML?: { __html: string }
  /** async 属性 */
  async?: boolean
  /** defer 属性 */
  defer?: boolean
}

export function ConsentAwareScript({
  purpose,
  id,
  src,
  strategy = 'afterInteractive',
  dangerouslySetInnerHTML,
  async: asyncAttr,
  defer: deferAttr,
}: ConsentAwareScriptProps) {
  const granted = useConsent(purpose)

  if (!granted) {
    return null
  }

  return (
    <Script
      id={id}
      src={src}
      strategy={strategy as any}
      async={asyncAttr}
      defer={deferAttr}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    />
  )
}
