"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { HeroCarouselData } from "@/lib/content-parser"

import { IconifyIcon } from "../ui/IconifyIcon"

/**
 * Pencil Design Specs (1920x968):
 * 浏览器窗口 1920x968
 *
 * Background: Full width with 23% black overlay
 */

// Design constants (based on 1920px width, 968px height)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 968

// 位置配置: 0=大图, 1-3=小图, -1=左侧出场位置, 4=右侧入场位置
const POSITIONS: Record<number, { left: number; top: number; width: number; height: number; opacity: number; zIndex: number }> = {
  [-1]: { left: 710, top: 420, width: 371, height: 369, opacity: 0, zIndex: 0 },  // 左侧出场
  [0]: { left: 960, top: 420, width: 371, height: 369, opacity: 1, zIndex: 10 },   // 大图
  [1]: { left: 1340, top: 505, width: 210, height: 364, opacity: 1, zIndex: 5 },  // 小图1
  [2]: { left: 1559, top: 505, width: 210, height: 364, opacity: 1, zIndex: 4 },  // 小图2
  [3]: { left: 1778, top: 505, width: 210, height: 364, opacity: 1, zIndex: 3 },  // 小图3
  [4]: { left: 1998, top: 505, width: 210, height: 364, opacity: 0, zIndex: 0 },  // 右侧入场
}

// 独立的虚拟影子卡片组件 (Ghost Card) - 用于承载平滑的离场与入场过渡，彻底消除跨屏飞行的残影
function GhostCard({ url, fromPos, toPos, alt }: { url: string; fromPos: number; toPos: number; alt: string }) {
  const [pos, setPos] = React.useState(fromPos)

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPos(toPos)
      })
    })
    return () => cancelAnimationFrame(timer)
  }, [toPos])

  const currentPos = POSITIONS[pos] || POSITIONS[fromPos]

  return (
    <div
      className="absolute overflow-hidden bg-gray-300 shadow-lg pointer-events-none"
      style={{
        left: `${(currentPos.left / DESIGN_WIDTH) * 100}%`,
        top: `${(currentPos.top / DESIGN_HEIGHT) * 100}%`,
        width: `${(currentPos.width / DESIGN_WIDTH) * 100}vw`,
        height: `${(currentPos.height / DESIGN_WIDTH) * 100}vw`,
        borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
        opacity: currentPos.opacity,
        zIndex: currentPos.zIndex,
        transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <OptimizedImage
        image={url}
        alt={alt}
        size="medium"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}

interface HeroCarouselProps {
  data: HeroCarouselData
  onQuoteClick?: () => void
  className?: string
}

export function HeroCarousel({ data, onQuoteClick, className }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null)

  // 虚拟影子节点队列
  const [ghosts, setGhosts] = React.useState<Array<{ id: string; url: string; fromPos: number; toPos: number; alt: string }>>([])

  // 记录正在隐藏的真实 DOM 节点（避免它们在瞬移重置时产生残影）
  const [hiddenRealSlides, setHiddenRealSlides] = React.useState<Record<number, boolean>>({})

  // 拖拽手势状态
  const [dragStartX, setDragStartX] = React.useState<number | null>(null)
  const [dragOffset, setDragOffset] = React.useState(0)

  const slides = data?.slides || []
  const slideCount = slides.length

  // 添加 Ghost 节点助手函数
  const addGhost = React.useCallback((url: string, fromPos: number, toPos: number) => {
    const id = `${Date.now()}-${Math.random()}`
    setGhosts((prev) => [...prev, { id, url, fromPos, toPos, alt: "" }])

    // 将 Ghost 存活时间延长至 680ms，为真实 DOM 卡片留出 180ms 的重叠交接缓冲期！
    setTimeout(() => {
      setGhosts((prev) => prev.filter((g) => g.id !== id))
    }, 680)
  }, [])

  // 执行切换动画
  const doTransition = React.useCallback((newSlide: number, direction: 'next' | 'prev') => {
    if (newSlide === currentSlide) return

    const currentData = slides[currentSlide]
    const nextData = slides[newSlide]
    if (!currentData || !nextData) return

    if (direction === 'next') {
      // 向左滚动 (Next): 大图 [0] 需要向左离场到 [-1]
      addGhost(currentData.productImages[0] || '', 0, -1)
      // 真实大图瞬间移动到 [4]，在此期间隐藏它避免飞行残影
      setHiddenRealSlides((prev) => ({ ...prev, [currentSlide]: true }))
      // 提前在 500ms 恢复真实卡片显示（此时真实卡片已在 [4] 就位，和 ghost 形成 180ms 完美重叠缓冲）
      setTimeout(() => {
        setHiddenRealSlides((prev) => ({ ...prev, [currentSlide]: false }))
      }, 500)
    } else {
      // 向右滚动 (Prev): 右侧末尾小图 [3] 需要向右离场到 [4]
      const lastSlideIndex = (currentSlide + 3) % slideCount
      const lastData = slides[lastSlideIndex]
      if (lastData) {
        addGhost(lastData.productImages[0] || '', 3, 4)
      }

      // 新的大图 (newSlide) 需要从左侧 [-1] 进场到 [0]
      addGhost(nextData.productImages[0] || '', -1, 0)
      // 真实大图在此期间隐藏，由 ghost 承载进场动画
      setHiddenRealSlides((prev) => ({ ...prev, [newSlide]: true }))
      // 提前在 500ms 恢复真实卡片显示，和存活 680ms 的 ghost 形成 180ms 的完美接力缓冲，彻底消灭卸载闪烁！
      setTimeout(() => {
        setHiddenRealSlides((prev) => ({ ...prev, [newSlide]: false }))
      }, 500)
    }

    setCurrentSlide(newSlide)
  }, [currentSlide, slides, slideCount, addGhost])

  // 自动播放的切换函数
  const autoTransition = React.useCallback(() => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slideCount
      const currentData = slides[prev]
      if (currentData) {
        addGhost(currentData.productImages[0] || '', 0, -1)
        setHiddenRealSlides((old) => ({ ...old, [prev]: true }))
        setTimeout(() => {
          setHiddenRealSlides((old) => ({ ...old, [prev]: false }))
        }, 500)
      }
      return next
    })
  }, [slideCount, slides, addGhost])

  // Auto-advance slides
  React.useEffect(() => {
    const startAutoplay = () => {
      autoplayRef.current = setInterval(autoTransition, 5000)
    }

    startAutoplay()
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [autoTransition])

  // 重置自动播放
  const resetAutoplay = React.useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(autoTransition, 5000)
  }, [autoTransition])

  const goToSlide = (index: number) => {
    // 判断方向
    const diff = (index - currentSlide + slideCount) % slideCount
    const direction = diff > slideCount / 2 ? 'prev' : 'next'
    doTransition(index, direction)
    resetAutoplay()
  }

  const goToPrev = () => {
    const newSlide = (currentSlide - 1 + slideCount) % slideCount
    doTransition(newSlide, 'prev')
    resetAutoplay()
  }

  const goToNext = () => {
    const newSlide = (currentSlide + 1) % slideCount
    doTransition(newSlide, 'next')
    resetAutoplay()
  }

  // 拖拽事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX === null) return
    const offset = e.clientX - dragStartX
    setDragOffset(offset)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return
    const offset = e.touches[0].clientX - dragStartX
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (dragStartX === null) return
    if (dragOffset < -50) {
      goToNext()
    } else if (dragOffset > 50) {
      goToPrev()
    }
    setDragStartX(null)
    setDragOffset(0)
  }

  // Early return if no slides
  if (slideCount === 0) return null

  const currentData = slides[currentSlide]
  if (!currentData) return null

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-black aspect-auto lg:aspect-[1920/968]", className)}
      data-header-theme="light"
    >
      {/* Background Image with Overlay */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {slide.backgroundImage && (
            <OptimizedImage
              image={slide.backgroundImage}
              alt=""
              size="xlarge"
              className="absolute inset-0 w-full h-full object-cover"
              priority={index === 0}
            />
          )}
          {/* 23% Black Overlay */}
          <div className="absolute inset-0 bg-black/[0.23]" />
        </div>
      ))}

      {/* 1. 桌面端专属视图 (hidden lg:block) - 100% 完美保留原有绝对定位与动画体系，绝对不影响现有桌面端效果！ */}
      <div className="relative z-10 h-full w-full hidden lg:block">
        {/* Title Section (centered) */}
        <div
          className="absolute left-0 right-0 flex justify-center z-30 pointer-events-none px-4"
          style={{
            top: `${(139 / DESIGN_HEIGHT) * 100}%`,
          }}
        >
          <div
            className="pointer-events-auto overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden text-center"
            data-lenis-prevent
            style={{
              maxHeight: `${(270 / DESIGN_WIDTH) * 100}vw`,
              overscrollBehavior: 'contain',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {currentData.title.map((line, lineIndex) => (
              <h2
                key={lineIndex}
                className={cn(
                  "font-josefin-sans text-white",
                  lineIndex === 0
                    ? "font-medium"
                    : "font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
                )}
                style={{
                  fontSize: lineIndex === 0
                    ? `${(84 / DESIGN_WIDTH) * 100}vw`
                    : `${(96 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: 1,
                }}
              >
                {line}
              </h2>
            ))}
          </div>
        </div>

        {/* Left Content - Description + Button (flex layout) */}
        <div
          className="absolute flex flex-col z-30 pointer-events-auto"
          style={{
            left: `${(189 / DESIGN_WIDTH) * 100}%`,
            top: `${(446 / DESIGN_HEIGHT) * 100}%`,
            width: `${(532 / DESIGN_WIDTH) * 100}%`,
            gap: `${(61 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          <p
            className="font-josefin-sans text-white overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
            data-lenis-prevent
            style={{
              fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: 1.52,
              maxHeight: `${(220 / DESIGN_WIDTH) * 100}vw`,
              overscrollBehavior: 'contain',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {currentData.description}
          </p>
          <motion.div
            className="inline-block"
            animate={{ translateY: [0, -10, 0] }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            whileHover={{ translateY: 0, transition: { duration: 0.3 } }}
          >
            <Link
              href={currentData.buttonLink}
              className="group relative inline-flex items-center justify-center font-josefin-sans font-medium text-white border border-white transition-colors duration-300 hover:bg-[#B6AB57] hover:border-[#B6AB57]"
              style={{
                height: `${(92 / DESIGN_WIDTH) * 100}vw`,
                borderRadius: `${(62.5 / DESIGN_WIDTH) * 100}vw`,
                fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
                paddingLeft: `${(32 / DESIGN_WIDTH) * 100}vw`,
                paddingRight: `${(8 / DESIGN_WIDTH) * 100}vw`,
                gap: `${(12 / DESIGN_WIDTH) * 100}vw`,
              }}
            >
              {/* 文字 */}
              <span className="whitespace-nowrap transition-colors duration-300">
                {currentData.buttonText}
              </span>

              {/* 圆形箭头图标 */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors duration-300 bg-white/20 group-hover:bg-white"
                style={{
                  width: `${(72 / DESIGN_WIDTH) * 100}vw`,
                  height: `${(72 / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                <IconifyIcon
                  name="lucide:arrow-up-right"
                  size={36}
                  className="text-white transition-colors duration-300 group-hover:text-[#756F3F]"
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Product Images (right side) - 队列式滚动动画 + 虚拟影子过渡 + 拖拽手势支持 */}
        {(() => {
          const allProductImages = slides.map((slide, idx) => ({
            url: slide.productImages[0] || '',
            slideIndex: idx,
          })).filter(img => img.url)

          const total = allProductImages.length
          if (total === 0) return null

          // 计算每个图片的队列位置
          const getQueuePosition = (imageIndex: number): number => {
            let pos = imageIndex - currentSlide
            if (pos < 0) pos += total
            if (pos > 3) return 4
            return pos
          }

          return (
            <div
              className="absolute inset-0 z-20 select-none overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleDragEnd}
            >
              {/* 1. 渲染真实的卡片队列 */}
              {allProductImages.map((img) => {
                const queuePos = getQueuePosition(img.slideIndex)
                const isHidden = hiddenRealSlides[img.slideIndex]
                const pos = POSITIONS[queuePos] || POSITIONS[4]

                return (
                  <div
                    key={img.slideIndex}
                    className={cn(
                      "absolute overflow-hidden bg-gray-300 shadow-lg",
                      queuePos === 0 ? "cursor-default" : "cursor-pointer"
                    )}
                    style={{
                      left: `${(pos.left / DESIGN_WIDTH) * 100}%`,
                      top: `${(pos.top / DESIGN_HEIGHT) * 100}%`,
                      width: `${(pos.width / DESIGN_WIDTH) * 100}vw`,
                      height: `${(pos.height / DESIGN_WIDTH) * 100}vw`,
                      borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
                      opacity: isHidden ? 0 : pos.opacity,
                      zIndex: pos.zIndex,
                      transform: dragStartX !== null ? `translateX(${dragOffset * 0.5}px)` : "translateX(0px)",
                      // 当卡片处于视口外入场位 [4] 或被隐藏重置时，取消 transition 实现无缝瞬移归位
                      // 保留 all 0.6s 确保位置与 z-index 完美过渡，同时单点覆盖 opacity 0s 实现 0ms 瞬间显示托底！
                      transition: (dragStartX !== null || queuePos === 4 || isHidden)
                        ? "none"
                        : "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0s",
                    }}
                    onClick={(e) => {
                      if (Math.abs(dragOffset) > 10) return
                      if (queuePos !== 0 && !isHidden) goToSlide(img.slideIndex)
                    }}
                  >
                    <OptimizedImage
                      image={img.url}
                      alt=""
                      size="medium"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                )
              })}

              {/* 2. 渲染独立的虚拟影子卡片 (Ghost Cards) */}
              {ghosts.map((ghost) => (
                <GhostCard
                  key={ghost.id}
                  url={ghost.url}
                  fromPos={ghost.fromPos}
                  toPos={ghost.toPos}
                  alt={ghost.alt}
                />
              ))}
            </div>
          )
        })()}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute cursor-pointer group z-30"
          style={{
            left: `${(1005 / DESIGN_WIDTH) * 100}%`,
            top: `${(890 / DESIGN_HEIGHT) * 100}%`,
            width: `${(60 / DESIGN_WIDTH) * 100}vw`,
            height: `${(60 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Previous slide"
        >
          {/* Default state - outline circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C18.8506 0.5 0.5 18.6382 0.5 41C0.5 63.3618 18.8506 81.5 41.5 81.5C64.1494 81.5 82.5 63.3618 82.5 41C82.5 18.6382 64.1494 0.5 41.5 0.5Z" stroke="white" />
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white" />
          </svg>
          {/* Hover state - filled circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white" />
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="black" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute cursor-pointer group z-30"
          style={{
            left: `${(1725 / DESIGN_WIDTH) * 100}%`,
            top: `${(890 / DESIGN_HEIGHT) * 100}%`,
            width: `${(60 / DESIGN_WIDTH) * 100}vw`,
            height: `${(60 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Next slide"
        >
          {/* Default state - outline circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C64.1494 0.5 82.5 18.6382 82.5 41C82.5 63.3618 64.1494 81.5 41.5 81.5C18.8506 81.5 0.5 63.3618 0.5 41C0.5 18.6382 18.8506 0.5 41.5 0.5Z" stroke="white" />
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white" />
          </svg>
          {/* Hover state - filled circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white" />
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="black" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div
          className="absolute overflow-hidden z-30"
          style={{
            left: `${(1106 / DESIGN_WIDTH) * 100}%`,
            top: `${(917 / DESIGN_HEIGHT) * 100}%`,
            width: `${(568 / DESIGN_WIDTH) * 100}vw`,
            height: `${(6 / DESIGN_WIDTH) * 100}vw`,
            borderRadius: `${(24 / DESIGN_WIDTH) * 100}vw`,
            backgroundColor: 'rgba(255, 255, 255, 0.52)',
          }}
        >
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / slideCount) * 100}%`,
              borderRadius: `${(24 / DESIGN_WIDTH) * 100}vw`,
            }}
          />
        </div>
      </div>

      {/* 2. 移动端专属视图 (block lg:hidden) - 针对 < 1024px 精心设计的流动式单列响应排版 */}
      <div className="relative z-10 w-full flex flex-col px-6 pt-16 pb-8 block lg:hidden select-none">
        {/* 主标题区 - 设定固定高度 h-24 (96px) 配合 flex 居中与紧凑字号，完美容纳3行标题且绝不截断、绝不跳动！ */}
        <div className="h-24 flex flex-col justify-center items-center text-center mb-3 overflow-hidden px-2">
          {currentData.title.map((line, lineIndex) => (
            <h2
              key={lineIndex}
              className={cn(
                "font-josefin-sans text-white leading-none tracking-tight",
                lineIndex === 0
                  ? "text-xl sm:text-2xl font-medium mb-1.5"
                  : "text-2xl sm:text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-1"
              )}
            >
              {line}
            </h2>
          ))}
        </div>

        {/* 中央大图展示区 (支持原生手势左右滑动切换) */}
        <div
          className="w-full aspect-[16/9] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl relative mb-3 bg-gray-800/50 border border-white/10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <OptimizedImage
            image={currentData.productImages[0] || ''}
            alt=""
            size="large"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500"
          />
        </div>

        {/* 描述文字 - 设定固定高度 h-20 (80px) 配合 flex 居中与紧凑字号，完美容纳3行描述且绝不截断、绝不跳动！ */}
        <div className="h-20 flex items-center justify-center px-2 mb-4 overflow-hidden">
          <p className="font-josefin-sans text-xs sm:text-sm text-white/90 text-center leading-normal line-clamp-3">
            {currentData.description}
          </p>
        </div>

        {/* CTA View More 按钮 (继承顶级呼吸漂浮与展开动效) */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="inline-block"
            animate={{ translateY: [0, -6, 0] }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            whileHover={{ translateY: 0, transition: { duration: 0.3 } }}
          >
            <Link
              href={currentData.buttonLink}
              className="group relative inline-flex items-center justify-center font-josefin-sans font-medium text-white border border-white overflow-hidden w-56 h-12 rounded-full text-base shadow-lg"
            >
              {/* 底层：背景放大圆圈 */}
              <span className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#B6AB57] rounded-full transition-all duration-500 ease-out scale-0 group-hover:scale-[10]" />

              {/* 顶层右侧：圆形箭头图标 */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                <img src="/icon-arrow-circle.svg" alt="" className="w-full h-full" />
              </div>

              {/* 核心层：文字自适应平滑居中 */}
              <span className="absolute top-1/2 left-6 -translate-y-1/2 z-10 transition-all duration-500 ease-out group-hover:text-black flex items-center leading-none group-hover:left-1/2 group-hover:-translate-x-1/2 whitespace-nowrap">
                {currentData.buttonText}
              </span>
            </Link>
          </motion.div>
        </div>

        {/* 底部分页导航与进度条 */}
        <div className="flex items-center justify-between gap-4 px-2 sm:px-6">
          <button
            onClick={goToPrev}
            className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white active:bg-white active:text-black transition-colors"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>

          {/* 进度条 */}
          <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }}
            />
          </div>

          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white active:bg-white active:text-black transition-colors"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
