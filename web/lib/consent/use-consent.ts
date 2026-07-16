'use client'

/**
 * useConsent —— 统一的"是否已同意某服务"判断 hook
 *
 * 用法：
 *   const allowed = useConsent('analytics')            // 按 purpose 判断（推荐）
 *   const allowed = useConsent('cdp')                   // 按具体 service 名判断
 *
 * 返回值：
 *   - undefined: SSR 阶段或尚未挂载（默认当作 false 处理，保守拒绝）
 *   - true:      用户已同意
 *   - false:     用户未同意 / 已拒绝
 *
 * 实现说明：
 *   Klaro 把同意状态写入 cookie（busrom_consent）和 localStorage，
 *   本 hook 监听 window 的 'klaro-consent-change' 事件来触发重渲染。
 */

import { useEffect, useState, useCallback } from 'react'
import type { ConsentPurpose, ConsentServiceName } from './klaro-config'

/** Klaro 全局对象形态（仅用到的字段） */
interface KlaroGlobal {
  getManager?: () => {
    confirmed: boolean
    getConsent: (name: string) => boolean
  }
}

declare global {
  interface Window {
    klaro?: KlaroGlobal
  }
}

/** Klaro consent 变化时派发的事件名（在 CookieConsentProvider 里 dispatch） */
export const KLARO_CONSENT_EVENT = 'klaro-consent-change'

/**
 * 判断某个 purpose 或 service 是否已同意。
 * 在 SSR / Klaro 尚未初始化时返回 false（保守拒绝）。
 */
export function isConsentGiven(target: ConsentPurpose | ConsentServiceName): boolean {
  if (typeof window === 'undefined' || !window.klaro) return false
  const manager = window.klaro.getManager?.()
  if (!manager || !manager.confirmed) return false
  // purpose 名与 service 名共用同一个 getConsent 入参，Klaro 内部会自动识别
  return manager.getConsent(target)
}

/**
 * React hook：订阅 consent 变化并返回当前同意状态。
 *
 * @param target purpose 名（'analytics' | 'marketing' | 'functional' | 'necessary'）
 *               或 service 名（'cdp' | 'gtm' | 'tawk' | 'cms-scripts'）
 */
export function useConsent(target: ConsentPurpose | ConsentServiceName): boolean {
  const [granted, setGranted] = useState<boolean>(() => isConsentGiven(target))

  const refresh = useCallback(() => {
    setGranted(isConsentGiven(target))
  }, [target])

  useEffect(() => {
    refresh()
    window.addEventListener(KLARO_CONSENT_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(KLARO_CONSENT_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return granted
}

/** 是否已经完成首次同意确认（用于决定是否要拦截第三方脚本初始化） */
export function useConsentConfirmed(): boolean {
  const [confirmed, setConfirmed] = useState<boolean>(false)

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined' || !window.klaro) return
      setConfirmed(!!window.klaro.getManager?.().confirmed)
    }
    check()
    window.addEventListener(KLARO_CONSENT_EVENT, check)
    return () => window.removeEventListener(KLARO_CONSENT_EVENT, check)
  }, [])

  return confirmed
}

/**
 * 主动重新打开 Klaro 偏好设置面板（用于 footer 的"Cookie 设置"链接）。
 */
export function reopenConsent() {
  if (typeof window === 'undefined' || !window.klaro) return
  // Klaro 在 window.klaro 上暴露 show / manage 方法
  const k = window.klaro as any
  if (typeof k.show === 'function') k.show()
  else if (typeof k.manage === 'function') k.manage()
}
