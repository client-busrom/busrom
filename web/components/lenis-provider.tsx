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
      duration: 1,        // 尾部缓动时间略长
      easing: selected.fn,
      lerp: 0.05,           // 桌面端尾部跟随慢一点
      syncTouch: true,
      syncTouchLerp: isTouchDevice ? 0.1 : undefined,  // 移动端平滑跟随，加快响应速度
      touchMultiplier: isTouchDevice ? 2 : 1,    // 增加移动端滑动距离，提升滚动速度
      wheelMultiplier: 1,
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
