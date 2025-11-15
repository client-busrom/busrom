"use client"

import { useEffect, useRef, ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface StickyProductInfoProps {
  children: ReactNode
}

export function StickyProductInfo({ children }: StickyProductInfoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return

    // 检查是否是 md 以上屏幕尺寸 (768px)
    const checkScreenSize = () => {
      return window.innerWidth >= 768
    }

    let trigger: ScrollTrigger | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const setupSticky = () => {
      if (!wrapperRef.current || !contentRef.current) return

      // 检查屏幕尺寸
      if (!checkScreenSize()) {
        console.log('📱 Screen size < md, sticky disabled')
        // 清理已有的 trigger
        if (trigger) {
          trigger.kill()
          trigger = null
        }
        // 清理样式
        if (contentRef.current) {
          gsap.set(contentRef.current, { clearProps: 'all' })
        }
        return
      }

      // 找到父容器和右侧列
      const parentContainer = wrapperRef.current.parentElement
      const rightColumn = parentContainer?.querySelector('[data-right-column]') as HTMLElement

      if (!rightColumn) {
        console.warn('⚠️ Right column not found')
        return
      }

      const wrapper = wrapperRef.current
      const content = contentRef.current

      const wrapperTop = wrapper.offsetTop
      const leftHeight = content.offsetHeight
      const rightHeight = rightColumn.offsetHeight

      console.log('📐 Measurements:', {
        wrapperTop,
        leftHeight,
        rightHeight,
        heightDiff: rightHeight - leftHeight
      })

      // 如果右侧比左侧短，不启用磁吸
      if (rightHeight <= leftHeight) {
        console.log('⚠️ Right column shorter than left, sticky disabled')
        // 清理已有的 trigger
        if (trigger) {
          trigger.kill()
          trigger = null
        }
        // 清理样式
        if (contentRef.current) {
          gsap.set(contentRef.current, { clearProps: 'all' })
        }
        return
      }

      // 清理旧的 trigger
      if (trigger) {
        trigger.kill()
      }

      // 使用 ScrollTrigger 但不用 pin,改用手动控制
      trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: `top ${wrapperTop}px`,
        end: () => {
          // 当左侧底部对齐右侧底部时结束
          if (rightHeight > leftHeight) {
            return `+=${rightHeight - leftHeight}`
          }
          return "+=10" // 最小值,避免立即结束
        },
        onUpdate: (self) => {
          const progress = self.progress

          if (self.isActive) {
            // 激活状态:固定在顶部
            gsap.set(content, {
              position: 'fixed',
              top: wrapperTop,
              width: wrapper.offsetWidth,
              zIndex: 10
            })
          } else if (progress >= 1) {
            // 结束状态:恢复到容器底部
            gsap.set(content, {
              position: 'absolute',
              top: 'auto',
              bottom: 0,
              width: '100%',
              zIndex: 'auto'
            })
          } else {
            // 初始状态:正常定位
            gsap.set(content, {
              position: 'relative',
              top: 0,
              width: '100%',
              zIndex: 'auto'
            })
          }
        },
        invalidateOnRefresh: true
      })

      console.log('✅ Sticky left column created')
    }

    // 初始化设置
    timeoutId = setTimeout(() => {
      setupSticky()
      ScrollTrigger.refresh()
    }, 500)

    // 监听窗口 resize 事件
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setupSticky()
        ScrollTrigger.refresh()
      }, 300)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (trigger) {
        trigger.kill()
      }
      // 清理样式
      if (contentRef.current) {
        gsap.set(contentRef.current, { clearProps: 'all' })
      }
    }
  }, [])

  return (
    <div ref={wrapperRef} className="w-full md:w-[70%] flex-shrink-0 relative">
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  )
}
