'use client'

/**
 * ConsentGatedScripts
 *
 * 客户端包装组件：只在用户已同意 marketing consent 后才渲染子组件。
 * 用于包裹 GlobalScripts 中的 marketing 类脚本（GA4、Clarity、UET 等）。
 *
 * 用途：
 *   <ConsentGatedScripts purpose="marketing">
 *     <ScriptRenderer ... />
 *   </ConsentGatedScripts>
 *
 * 行为：
 *   - SSR / 未确认 consent → 不渲染（脚本不加载）
 *   - 用户拒绝 → 不渲染
 *   - 用户同意 → 渲染子组件
 */

import { useConsent } from '@/lib/consent/use-consent'
import type { ConsentPurpose, ConsentServiceName } from '@/lib/consent/klaro-config'

interface ConsentGatedScriptsProps {
  /** 要检查的 consent 目的或服务名 */
  purpose: ConsentPurpose | ConsentServiceName
  /** 当 consent 未授权时是否渲染 fallback（默认 null = 不渲染） */
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function ConsentGatedScripts({ purpose, fallback = null, children }: ConsentGatedScriptsProps) {
  const granted = useConsent(purpose)

  if (!granted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
