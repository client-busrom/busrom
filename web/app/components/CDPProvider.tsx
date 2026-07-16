'use client'

/**
 * CDP Provider
 *
 * 在 Busrom Web 应用挂载时自动初始化 CDP Analytics SDK，
 * 并在 Next.js App Router 路由切换时补发 pageview 事件。
 */

import { ReactNode, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getCDPAnalytics } from '@/lib/analytics'
import { useConsent } from '@/lib/consent/use-consent'

interface CDPProviderProps {
  children?: ReactNode
}

const CDP_ENDPOINT =
  process.env.NEXT_PUBLIC_CDP_ENDPOINT || 'http://localhost:3003/api/analytics/track'

const CDP_DEBUG = process.env.NEXT_PUBLIC_CDP_DEBUG === 'true'

export default function CDPProvider({ children }: CDPProviderProps) {
  const pathname = usePathname()
  const initializedRef = useRef(false)
  // GDPR 门控：用户未同意 analytics 前，不初始化 CDP SDK
  const analyticsAllowed = useConsent('analytics')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!analyticsAllowed) return

    const analytics = getCDPAnalytics({
      endpoint: CDP_ENDPOINT,
      debug: CDP_DEBUG,
    })

    if (!initializedRef.current) {
      analytics.init()
      initializedRef.current = true
    } else {
      analytics.trackPageView()
    }
  }, [pathname, analyticsAllowed])

  return <>{children}</>
}
