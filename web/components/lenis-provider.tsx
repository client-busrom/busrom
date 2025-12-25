"use client"

import { useEffect, useRef } from "react"
import { easings } from "./easings"

interface LenisProviderProps {
  easingKey: string
}

export function LenisProvider({ easingKey }: LenisProviderProps) {
  const lenisRef = useRef<any>(null)
  const rafCallbackRef = useRef<((time: number) => void) | null>(null)

  useEffect(() => {
    // 延迟初始化 - 等待首屏渲染完成后再加载 GSAP
    // 使用 requestIdleCallback 在浏览器空闲时初始化，避免阻塞首屏
    const initLenis = async () => {
      // 动态导入 GSAP 和 Lenis，减少首屏 JS 体积
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])

      // 注册 GSAP 插件
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

      // Integrate Lenis with ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update)

      const rafCallback = (time: number) => {
        lenis.raf(time * 1000)
      }
      rafCallbackRef.current = rafCallback

      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
    }

    // 使用 requestIdleCallback 或 setTimeout 延迟初始化
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initLenis, { timeout: 2000 })
    } else {
      // Fallback: 延迟 100ms 初始化
      setTimeout(initLenis, 100)
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
      // 注意：GSAP ticker 清理需要在模块加载后进行
      // 由于是动态导入，这里简单返回
    }
  }, [easingKey])

  return null
}
