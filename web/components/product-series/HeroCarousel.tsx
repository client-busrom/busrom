"use client"

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { HeroCarouselData } from "@/lib/content-parser"

/**
 * Figma Design Specs (1920x922):
 * 浏览器窗口 1920x968，header 46px，内容区域 1920x922
 *
 * Original design was 1920x1347, scaled by 922/1347 ≈ 0.684
 *
 * Background: Full width with 23% black overlay
 */

// Design constants (based on 1920px width, 922px height)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

// 缩放比例 (从原始 1347 到新的 922)
const SCALE = DESIGN_HEIGHT / 1347  // ≈ 0.684

interface HeroCarouselProps {
  data: HeroCarouselData
  className?: string
}

export function HeroCarousel({ data, className }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [prevSlide, setPrevSlide] = React.useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  // 出场动画阶段: 'exit'=左侧出场, 'teleport'=瞬移到右侧(无动画), 'enter'=从右侧滑入
  const [exitPhase, setExitPhase] = React.useState<'exit' | 'teleport' | 'enter' | null>(null)
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null)

  const slides = data?.slides || []
  const slideCount = slides.length

  // Early return if no slides
  if (slideCount === 0) return null

  // 执行切换动画 - 两阶段动画
  const doTransition = React.useCallback((newSlide: number) => {
    if (isTransitioning || newSlide === currentSlide) return

    setPrevSlide(currentSlide)
    setIsTransitioning(true)
    setExitPhase('exit')  // 第一阶段：左侧出场
    setCurrentSlide(newSlide)

    // 第一阶段完成后（300ms），瞬移到右侧
    setTimeout(() => {
      setExitPhase('teleport')
      // 等待一帧让 transition: none 生效，然后开始入场动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setExitPhase('enter')
        })
      })
    }, 300)

    // 第二阶段完成后（600ms），重置状态
    setTimeout(() => {
      setPrevSlide(null)
      setIsTransitioning(false)
      setExitPhase(null)
    }, 650)
  }, [currentSlide, isTransitioning])

  // 自动播放的切换函数
  const autoTransition = React.useCallback(() => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slideCount
      setPrevSlide(prev)
      setIsTransitioning(true)
      setExitPhase('exit')

      setTimeout(() => {
        setExitPhase('teleport')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setExitPhase('enter')
          })
        })
      }, 300)

      setTimeout(() => {
        setPrevSlide(null)
        setIsTransitioning(false)
        setExitPhase(null)
      }, 650)

      return next
    })
  }, [slideCount])

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
    doTransition(index)
    resetAutoplay()
  }

  const goToPrev = () => {
    const newSlide = (currentSlide - 1 + slideCount) % slideCount
    doTransition(newSlide)
    resetAutoplay()
  }

  const goToNext = () => {
    const newSlide = (currentSlide + 1) % slideCount
    doTransition(newSlide)
    resetAutoplay()
  }

  const currentData = slides[currentSlide]
  if (!currentData) return null

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-black mt-[46px]", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      data-header-theme="light"
    >
      {/* Background Image with Overlay */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === currentSlide ? "opacity-100" : "opacity-0"
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

      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        {/* Title Section (centered) */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{
            top: `${(180 / DESIGN_HEIGHT) * 100}%`,
          }}
        >
          {/* Title Lines */}
          {currentData.title.map((line, lineIndex) => (
            <h1
              key={lineIndex}
              className={cn(
                "font-josefin-sans text-white",
                lineIndex === 0
                  ? "font-medium"
                  : "font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
              )}
              style={{
                fontSize: lineIndex === 0
                  ? `${(96 / DESIGN_WIDTH) * 100}vw`
                  : `${(110 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: 1.1,
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Left Content - Description + Button (flex layout) */}
        <div
          className="absolute flex flex-col"
          style={{
            left: `${(153 / DESIGN_WIDTH) * 100}%`,
            top: `${(480 / DESIGN_HEIGHT) * 100}%`,
            width: `${(532 / DESIGN_WIDTH) * 100}%`,
            gap: `${(40 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          <p
            className="font-josefin-sans text-white"
            style={{
              fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: 1.52,
            }}
          >
            {currentData.description}
          </p>
          <Link
            href={currentData.buttonLink}
            className="group relative inline-flex items-center justify-between font-josefin-sans font-medium text-white border border-white overflow-hidden"
            style={{
              width: `${(284 / DESIGN_WIDTH) * 100}vw`,
              height: `${(92 / DESIGN_WIDTH) * 100}vw`,
              borderRadius: `${(62.5 / DESIGN_WIDTH) * 100}vw`,
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              paddingLeft: `${(24 / DESIGN_WIDTH) * 100}vw`,
              paddingRight: `${(8 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#B6AB57] rounded-full transition-all duration-500 ease-out scale-0 group-hover:scale-[10]"
              style={{
                width: `${(77 / DESIGN_WIDTH) * 100}vw`,
                height: `${(77 / DESIGN_WIDTH) * 100}vw`,
                marginRight: `${(8 / DESIGN_WIDTH) * 100}vw`,
              }}
            />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-black flex items-center leading-none">
              {currentData.buttonText}
            </span>
            <img
              src="/icon-arrow-circle.svg"
              alt=""
              className="relative z-10 transition-opacity duration-300 group-hover:opacity-0"
              style={{
                width: `${(77 / DESIGN_WIDTH) * 100}vw`,
                height: `${(77 / DESIGN_WIDTH) * 100}vw`,
              }}
            />
          </Link>
        </div>

        {/* Product Images (right side) - 队列式滚动动画 */}
        {(() => {
          // 获取所有产品图片
          const allProductImages = slides.map((slide, idx) => ({
            url: slide.productImages[0] || '',
            slideIndex: idx,
          })).filter(img => img.url)

          const total = allProductImages.length
          if (total === 0) return null

          // 位置配置: 0=大图, 1-3=小图, -1=左侧出场位置, 4=右侧入场位置
          // 新设计：1920x922，图片区域放在右侧
          const positions: Record<number, { left: number; top: number; width: number; height: number; opacity: number; zIndex: number }> = {
            [-1]: { left: 575, top: 445, width: 424, height: 290, opacity: 0, zIndex: 0 },  // 左侧出场
            [0]: { left: 825, top: 445, width: 424, height: 290, opacity: 1, zIndex: 10 },   // 大图
            [1]: { left: 1259, top: 510, width: 240, height: 285, opacity: 1, zIndex: 5 },  // 小图1
            [2]: { left: 1509, top: 510, width: 240, height: 285, opacity: 1, zIndex: 4 },  // 小图2
            [3]: { left: 1759, top: 510, width: 240, height: 285, opacity: 1, zIndex: 3 },  // 小图3
            [4]: { left: 1999, top: 510, width: 240, height: 285, opacity: 0, zIndex: 0 },  // 右侧入场
          }

          // 计算每个图片的队列位置
          const getQueuePosition = (imageIndex: number): number => {
            let pos = imageIndex - currentSlide
            if (pos < 0) pos += total
            if (pos > 3) return 4
            return pos
          }

          // 判断图片是否正在从队首移出（prevSlide 对应的图片）
          const isExiting = (imageIndex: number): boolean => {
            if (prevSlide === null) return false
            return imageIndex === prevSlide
          }

          return allProductImages.map((img) => {
            const queuePos = getQueuePosition(img.slideIndex)
            const exiting = isExiting(img.slideIndex)

            // 如果正在出场，使用左侧出场位置
            const pos = exiting ? positions[-1] : (positions[queuePos] || positions[4])

            return (
              <div
                key={img.slideIndex}
                className={cn(
                  "absolute overflow-hidden bg-gray-300",
                  queuePos === 0 && !exiting ? "cursor-default" : "cursor-pointer"
                )}
                style={{
                  left: `${(pos.left / DESIGN_WIDTH) * 100}%`,
                  top: `${(pos.top / DESIGN_HEIGHT) * 100}%`,
                  width: `${(pos.width / DESIGN_WIDTH) * 100}vw`,
                  height: `${(pos.height / DESIGN_WIDTH) * 100}vw`,
                  borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                  transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
                }}
                onClick={() => queuePos !== 0 && !exiting && goToSlide(img.slideIndex)}
              >
                <OptimizedImage
                  image={img.url}
                  alt=""
                  size="medium"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )
          })
        })()}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute cursor-pointer group"
          style={{
            left: `${(844 / DESIGN_WIDTH) * 100}%`,
            top: `${(830 / DESIGN_HEIGHT) * 100}%`,
            width: `${(83 / DESIGN_WIDTH) * 100}vw`,
            height: `${(82 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Previous slide"
        >
          {/* Default state - outline circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C18.8506 0.5 0.5 18.6382 0.5 41C0.5 63.3618 18.8506 81.5 41.5 81.5C64.1494 81.5 82.5 63.3618 82.5 41C82.5 18.6382 64.1494 0.5 41.5 0.5Z" stroke="white"/>
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
          </svg>
          {/* Hover state - filled circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white"/>
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="black"/>
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute cursor-pointer group"
          style={{
            left: `${(1674 / DESIGN_WIDTH) * 100}%`,
            top: `${(830 / DESIGN_HEIGHT) * 100}%`,
            width: `${(83 / DESIGN_WIDTH) * 100}vw`,
            height: `${(82 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Next slide"
        >
          {/* Default state - outline circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C64.1494 0.5 82.5 18.6382 82.5 41C82.5 63.3618 64.1494 81.5 41.5 81.5C18.8506 81.5 0.5 63.3618 0.5 41C0.5 18.6382 18.8506 0.5 41.5 0.5Z" stroke="white"/>
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white"/>
          </svg>
          {/* Hover state - filled circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white"/>
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="black"/>
          </svg>
        </button>

        {/* Progress Bar */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${(1016 / DESIGN_WIDTH) * 100}%`,
            top: `${(1253 * SCALE / DESIGN_HEIGHT) * 100}%`,
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
    </section>
  )
}

export default HeroCarousel
