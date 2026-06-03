"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { easings } from "./easings"

interface LenisProviderProps {
  easingKey: string
}

export function LenisProvider({ easingKey }: LenisProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lenisRef = useRef<any>(null)
  const rafCallbackRef = useRef<((time: number) => void) | null>(null)
  const gsapRef = useRef<any>(null)
  const scrollTriggerRef = useRef<any>(null)
  const idleCallbackIdRef = useRef<number | null>(null)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const isDestroyedRef = useRef(false)

  useEffect(() => {
    isDestroyedRef.current = false

    const initLenis = async () => {
      // 如果组件已卸载，不再初始化
      if (isDestroyedRef.current) return

      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])

      // 再次检查，因为 await 期间组件可能已卸载
      if (isDestroyedRef.current) return

      gsapRef.current = gsap
      scrollTriggerRef.current = ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      const selected = easings[easingKey]

      const lenis = new Lenis({
        duration: 1.2,
        easing: selected.fn,
        lerp: 0.08, // 略微调高，平衡平滑度与响应速度
        syncTouch: false, // 核心修复：禁用触屏同步。移动端原生滚动已非常平滑，开启此项会导致在缓慢滑动时产生严重的抖动（Feedback Loop）
        wheelMultiplier: 1,
        smoothWheel: true,
      })

      lenisRef.current = lenis
        ; (window as any).lenis = lenis

      lenis.on('scroll', ScrollTrigger.update)

      const rafCallback = (time: number) => {
        lenis.raf(time * 1000)
      }
      rafCallbackRef.current = rafCallback

      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)

      // Handle initial hash scroll after Lenis is ready
      const hash = window.location.hash
      if (hash) {
        const attemptScroll = (attemptsLeft: number) => {
          try {
            const target = document.querySelector(hash) as HTMLElement | null
            if (target) {
              if (target.getBoundingClientRect().height > 0 || attemptsLeft <= 1) {
                setTimeout(() => {
                  lenis.scrollTo(target, { offset: -50, immediate: true })
                }, 800)
              } else {
                setTimeout(() => attemptScroll(attemptsLeft - 1), 250)
              }
            } else if (attemptsLeft > 0) {
              setTimeout(() => attemptScroll(attemptsLeft - 1), 250)
            }
          } catch (e) {}
        }
        setTimeout(() => attemptScroll(20), 250)
      }
    }

    if ('requestIdleCallback' in window) {
      idleCallbackIdRef.current = (window as any).requestIdleCallback(initLenis, { timeout: 2000 })
    } else {
      timeoutIdRef.current = setTimeout(initLenis, 100)
    }

    return () => {
      isDestroyedRef.current = true

      // 取消待执行的初始化
      if (idleCallbackIdRef.current !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallbackIdRef.current)
      }
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current)
      }

      // 移除 GSAP ticker 回调 - 修复内存泄漏
      if (gsapRef.current && rafCallbackRef.current) {
        gsapRef.current.ticker.remove(rafCallbackRef.current)
      }

      // 清理 ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.getAll().forEach((trigger: any) => trigger.kill())
      }

      // 销毁 Lenis
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }

      // 清理全局引用
      if (typeof window !== 'undefined') {
        delete (window as any).lenis
      }
    }
  }, [easingKey])

  // Handle route changes and hash navigation
  useEffect(() => {
    if (!lenisRef.current) return

    const handleHashScroll = () => {
      if (!lenisRef.current) return
      
      const hash = window.location.hash
      
      if (!hash) {
        // 如果没有 hash，则回到顶部，防止页面残留前一个页面的滚动位置
        lenisRef.current.scrollTo(0, { immediate: true })
        return
      }
      
      const attemptScroll = (attemptsLeft: number) => {
        try {
          const target = document.querySelector(hash) as HTMLElement | null
          if (target) {
            // 只要找到元素，立即瞬间滚动到目标
            lenisRef.current.scrollTo(target, { offset: -50, immediate: true })
            
            // 为了防止图片、字体加载导致布局高度变化（把板块挤下去），在接下来的 800ms 内持续锁定该元素
            let lockCount = 0
            const lockInterval = setInterval(() => {
              if (lenisRef.current) {
                lenisRef.current.scrollTo(target, { offset: -50, immediate: true })
              }
              lockCount++
              if (lockCount >= 16) { // 16 * 50ms = 800ms
                clearInterval(lockInterval)
              }
            }, 50)
            
          } else if (attemptsLeft > 0) {
            setTimeout(() => attemptScroll(attemptsLeft - 1), 250)
          }
        } catch (e) {}
      }
      
      attemptScroll(20)
    }

    // 延迟一点执行，确保 Next.js 的 URL 状态（包含 hash）已经完全应用
    setTimeout(handleHashScroll, 50)
    
    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [pathname, searchParams])

  // Handle same-page hash links since Next.js Link intercepts them without firing hashchange
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      const hashIndex = href.indexOf('#')
      if (hashIndex === -1) return
      const hash = href.substring(hashIndex)

      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.pathname === window.location.pathname) {
          // It's on the same page, we intercept it!
          const target = document.querySelector(hash) as HTMLElement | null
          if (target && lenisRef.current) {
            e.preventDefault()
            lenisRef.current.scrollTo(target, { offset: -50 })
            // Update URL manually
            window.history.pushState(null, '', url.href)
          }
        }
      } catch (err) {
        // ignore invalid URLs
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return null
}
