"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { easings } from "./easings"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface LenisProviderProps {
  easingKey: string
}

export function LenisProvider({ easingKey }: LenisProviderProps) {
  useEffect(() => {
    const selected = easings[easingKey]

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const lenis = new Lenis({
      duration: 1,          // 尾部缓动时间略长
      easing: selected.fn,
      lerp: 0.05,           // 桌面端尾部跟随慢一点
      syncTouch: true,
      syncTouchLerp: isTouchDevice ? 0.15 : undefined,  // 移动端更快响应
      touchMultiplier: isTouchDevice ? 1.5 : 1,    // 降低移动端滑动距离
      wheelMultiplier: 0.8,  // 降低滚轮灵敏度，减少滑过头
      smoothWheel: true,
    })

    // Expose lenis to window for page-level control
    ;(window as any).lenis = lenis

    // Integrate Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [easingKey])

  return null
}
