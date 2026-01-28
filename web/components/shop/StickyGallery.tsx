"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ProductGallery } from "./ProductGallery"
import type { ImageObject } from "@/lib/content-data"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface StickyGalleryProps {
  images: ImageObject[]
  productName: string
}

export function StickyGallery({ images, productName }: StickyGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    if (!galleryRef.current || !containerRef.current) return

    // 等待 DOM 完全加载和图片渲染
    const timeoutId = setTimeout(() => {
      if (!galleryRef.current || !containerRef.current) return

      // 找到主包装容器 (包含整个左右布局)
      const mainWrapper = containerRef.current.parentElement?.parentElement?.parentElement

      // 创建 sticky 效果
      triggerRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 96px", // 对应 top-24 (96px)
        endTrigger: mainWrapper || containerRef.current, // 使用整个主包装容器
        end: "bottom bottom",
        pin: galleryRef.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })

      // 刷新 ScrollTrigger 确保计算正确
      ScrollTrigger.refresh()
    }, 500) // 增加延迟确保 DOM 完全加载

    return () => {
      clearTimeout(timeoutId)
      if (triggerRef.current) {
        triggerRef.current.kill()
      }
    }
  }, [])

  return (
    <div ref={containerRef}>
      <div ref={galleryRef}>
        <ProductGallery images={images} productName={productName} />
      </div>
    </div>
  )
}
