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

/** Klaro Manager 接口 */
interface KlaroManager {
  confirmed: boolean
  getConsent: (name: string) => boolean
}

declare global {
  interface Window {
    /** Klaro setup() 返回的 manager 引用（window.klaro 会被 Preact 组件覆盖） */
    __klaroManager?: KlaroManager
  }
}

/** Klaro consent 变化时派发的事件名（在 CookieConsentProvider 里 dispatch） */
export const KLARO_CONSENT_EVENT = 'klaro-consent-change'

/**
 * purpose → 对应的 service 名映射。
 * Klaro 的 getConsent() 只接受 service 名，不接受 purpose 名。
 * 需要将 purpose 名转换为对应的 service 名来检查。
 */
const PURPOSE_TO_SERVICES: Record<ConsentPurpose, ConsentServiceName[]> = {
  necessary: [],
  functional: ['tawk'],
  analytics: ['cdp', 'gtm'],
  marketing: ['gtm', 'cms-scripts'],
}

/**
 * 判断某个 purpose 或 service 是否已同意。
 * 在 SSR / Klaro 尚未初始化时返回 false（保守拒绝）。
 *
 * Klaro 的 getConsent() 只接受 service 名（如 'gtm'、'cms-scripts'），
 * 不接受 purpose 名（如 'marketing'）。当传入 purpose 名时，检查该 purpose
 * 下所有关联的 service 是否都已同意。
 *
 * 注意：不能用 window.klaro.getManager()，因为 Klaro 的 setup() 会把 window.klaro
 * 覆盖为 Preact 组件。manager 引用通过 CookieConsentProvider 存在 window.__klaroManager。
 */
export function isConsentGiven(target: ConsentPurpose | ConsentServiceName): boolean {
  if (typeof window === 'undefined') return false
  const manager = window.__klaroManager
  if (!manager || !manager.confirmed) return false

  // 先尝试直接作为 service 名查询
  if (manager.consents && target in manager.consents) {
    return manager.consents[target] === true
  }

  // 如果是 purpose 名，检查该 purpose 下所有关联的 service
  const services = PURPOSE_TO_SERVICES[target as ConsentPurpose]
  if (services && services.length > 0) {
    return services.every(service => manager.consents?.[service] === true)
  }

  return false
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
