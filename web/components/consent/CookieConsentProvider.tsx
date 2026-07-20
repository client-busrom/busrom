'use client'

/**
 * CookieConsentProvider
 *
 * 职责：
 * 1. 在客户端动态加载 Klaro 并按当前 locale 应用配置
 * 2. 注入 Klaro 官方 CSS
 * 3. 把 Klaro 的同意状态变化广播给全站（klaro-consent-change 事件）
 * 4. 同步 Google Consent Mode v2（gtag consent update）
 *
 * 放置位置：app/[locale]/layout.tsx 的 <body> 顶部，包裹整个应用。
 */

import { useEffect } from 'react'
import { buildKlaroConfig, CONSENT_COOKIE_NAME } from '@/lib/consent/klaro-config'
import { isConsentGiven, KLARO_CONSENT_EVENT } from '@/lib/consent/use-consent'
import type { Locale } from '@/i18n.config'

// Klaro 官方样式
import 'klaro/dist/klaro.css'
// 极简白底主题（覆盖官方默认黑底绿按钮）
import '@/components/consent/klaro-theme.css'

interface CookieConsentProviderProps {
  locale: Locale
  children: React.ReactNode
}

/**
 * 根据当前 Klaro 同意状态，同步：
 * 1. Google Consent Mode v2（gtag consent update）→ GA4 / Google Ads
 * 2. Microsoft UET Consent Mode（uetq push consent update）→ Bing Ads
 *
 * 两套独立的 consent 体系，必须分别推送。
 */
function syncConsentMode() {
  if (typeof window === 'undefined') return
  const w = window as any

  /* ---------- 1. Google Consent Mode v2 ---------- */
  w.dataLayer = w.dataLayer || []
  function gtag(...args: unknown[]) {
    w.dataLayer.push(args)
  }

  const marketingGranted = isConsentGiven('marketing')
  const analyticsGranted = isConsentGiven('analytics')
  const functionalGranted = isConsentGiven('functional')

  gtag('consent', 'update', {
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    functionality_storage: functionalGranted ? 'granted' : 'denied',
    // security_storage 恒为 granted（cookie banner 本身、CSRF 等）
    security_storage: 'granted',
  })

  /* ---------- 2. Microsoft UET Consent Mode ---------- */
  // UET 用 ad_storage 单信号；用户同意 marketing 才 granted
  // 注意：UET 加载是异步的，这里用 window.uetq 队列保证推送顺序
  w.uetq = w.uetq || []
  w.uetq.push('consent', 'update', {
    ad_storage: marketingGranted ? 'granted' : 'denied',
  })

  /* ---------- 3. Microsoft Clarity Consent ---------- */
  // Clarity 有自己的 consent API，必须显式调用 clarity('consent') 才能开启数据采集。
  // 当项目设置中启用了 consent mode 时，不调用此方法会导致 "Data not being collected" 提示。
  if (marketingGranted && typeof w.clarity === 'function') {
    try {
      w.clarity('consent')
    } catch {
      // Clarity 脚本可能尚未加载，忽略错误
    }
  }
}

export function CookieConsentProvider({ locale, children }: CookieConsentProviderProps) {
  useEffect(() => {
    let cancelled = false

    // 动态 import，避免 Klaro 进入 SSR bundle
    import('klaro')
      .then((klaro) => {
        if (cancelled) return

        const config = buildKlaroConfig(locale) as any

        // Klaro 回调：每次用户改动任意 service 的同意状态时触发
        config.callback = (_consent: unknown, _service: unknown) => {
          syncConsentMode()
          window.dispatchEvent(new Event(KLARO_CONSENT_EVENT))
        }

        // 初始化 Klaro（setup 不返回 manager，需要从组件树中提取）
        klaro.setup(config)

        // 从 Klaro Preact 组件树中找到 manager 并保存
        // window.klaro 会被 setup() 覆盖为 Preact 组件，不能用 getManager()
        const findManager = (node: any, depth = 0): any => {
          if (depth > 10 || !node) return null
          if (node.manager && typeof node.manager.getConsent === 'function') return node.manager
          if (node.props?.manager && typeof node.props.manager.getConsent === 'function') return node.props.manager
          if (node.__k) { const r = findManager(node.__k, depth + 1); if (r) return r }
          const children = node.props?.children
          if (children) {
            const arr = Array.isArray(children) ? children : [children]
            for (const child of arr) {
              if (child && typeof child === 'object') {
                const r = findManager(child, depth + 1); if (r) return r
              }
            }
          }
          return null
        }
        const manager = findManager(window.klaro)
        if (manager && typeof manager.getConsent === 'function') {
          (window as any).__klaroManager = manager
        }

        // 初始化后立即同步一次（处理"已经同意过"的回访用户）
        syncConsentMode()
        window.dispatchEvent(new Event(KLARO_CONSENT_EVENT))
      })
      .catch((err) => {
        console.error('[CookieConsent] Failed to load Klaro:', err)
      })

    return () => {
      cancelled = true
    }
  }, [locale])

  return <>{children}</>
}

export { CONSENT_COOKIE_NAME }
