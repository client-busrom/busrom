"use client"

import { useEffect, useRef } from "react"
import { easings } from "./easings"

interface LenisProviderProps {
  easingKey: string
}

export function LenisProvider({ easingKey }: LenisProviderProps) {
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
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      const lenis = new Lenis({
        duration: 1,
        easing: selected.fn,
        lerp: 0.05,
        syncTouch: true,
        syncTouchLerp: isTouchDevice ? 0.15 : undefined,
        touchMultiplier: isTouchDevice ? 1.5 : 1,
        wheelMultiplier: 0.8,
        smoothWheel: true,
      })

      lenisRef.current = lenis
      ;(window as any).lenis = lenis

      lenis.on('scroll', ScrollTrigger.update)

      const rafCallback = (time: number) => {
        lenis.raf(time * 1000)
      }
      rafCallbackRef.current = rafCallback

      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
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

  return null
}
