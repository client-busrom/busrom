"use client"

import * as React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { cn } from "@/lib/utils"
import type { ApplicationsData } from "@/lib/content-parser"

/**
 * Applications Carousel Section
 *
 * 使用 Embla Carousel 实现无限循环轮播
 * 卡片有不同的高度和Y偏移，形成波浪效果
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 950  // 增加高度，留出更多上下空间
const CARD_WIDTH = 420
const CARD_GAP = 12
const TOP_PADDING = 60     // 顶部间距
const BOTTOM_PADDING = 120 // 底部间距（给按钮和进度条留空间）

// 卡片样式配置：每个位置的 Y 偏移和高度（循环模式 0-5）
const CARD_STYLES = [
  { yOffset: 0, height: 562 },   // Style 0
  { yOffset: 70, height: 562 },  // Style 1 - 下移
  { yOffset: 0, height: 562 },   // Style 2
  { yOffset: 0, height: 425 },   // Style 3 - 中间，较短
  { yOffset: 69, height: 562 },  // Style 4 - 下移
  { yOffset: 0, height: 562 },   // Style 5
]

interface ApplicationsProps {
  data: ApplicationsData
  className?: string
}

export function Applications({ data, className }: ApplicationsProps) {
  if (!data) return null

  const images = data.images || []
  const totalImages = images.length

  // Embla carousel - 无限循环模式 + 自动滚动
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  )

  // 当前选中的索引
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollProgress, setScrollProgress] = React.useState(0)

  // 监听选中变化
  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // 监听滚动进度
  const onScroll = React.useCallback(() => {
    if (!emblaApi) return
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress)
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    onScroll()
    emblaApi.on("select", onSelect)
    emblaApi.on("scroll", onScroll)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("reInit", onScroll)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("scroll", onScroll)
      emblaApi.off("reInit", onSelect)
      emblaApi.off("reInit", onScroll)
    }
  }, [emblaApi, onSelect, onScroll])

  // 导航
  const goToPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const goToNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // 获取卡片样式
  const getCardStyle = (index: number) => {
    return CARD_STYLES[index % CARD_STYLES.length]
  }

  // 计算进度条
  const progressPercent = totalImages > 0
    ? ((selectedIndex + 1) / totalImages) * 100
    : 0

  if (totalImages === 0) return null

  // 尺寸计算
  const cardWidthVw = (CARD_WIDTH / DESIGN_WIDTH) * 100
  const cardGapVw = (CARD_GAP / DESIGN_WIDTH) * 100

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-[#F6F4ED]", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* Embla Viewport */}
      <div
        className="absolute overflow-hidden"
        ref={emblaRef}
        style={{
          left: 0,
          right: 0,
          top: `${(TOP_PADDING / DESIGN_WIDTH) * 100}vw`,
          height: `${((562 + 70 + 30) / DESIGN_WIDTH) * 100}vw`, // 使用 vw 与卡片一致
        }}
      >
        {/* Embla Container */}
        <div
          className="flex h-full"
          style={{
            gap: `${cardGapVw}vw`,
            marginLeft: `${(-200 / DESIGN_WIDTH) * 100}vw`, // 让第一张卡片部分露出左边
          }}
        >
          {images.map((imageUrl, index) => {
            const style = getCardStyle(index)
            const isLast = index === images.length - 1

            return (
              <div
                key={`slide-${index}`}
                className="relative flex-shrink-0 overflow-hidden bg-[#D9D9D9]"
                style={{
                  width: `${cardWidthVw}vw`,
                  height: `${(style.height / DESIGN_WIDTH) * 100}vw`,
                  marginTop: `${(style.yOffset / DESIGN_WIDTH) * 100}vw`,
                  marginRight: isLast ? `${cardGapVw}vw` : undefined, // 最后一张添加右边距
                  borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                <OptimizedImage
                  image={imageUrl}
                  alt=""
                  size="medium"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Left Navigation Button */}
      <button
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(508 / DESIGN_WIDTH) * 100}%`,
          bottom: `${(BOTTOM_PADDING / DESIGN_WIDTH) * 100}vw`,
          width: `${(83 / DESIGN_WIDTH) * 100}vw`,
          height: `${(82 / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToPrev}
        aria-label="Previous slide"
      >
        {/* 默认状态 - 空心圆 + 描边箭头 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 + 白色箭头 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* Right Navigation Button */}
      <button
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(1338 / DESIGN_WIDTH) * 100}%`,
          bottom: `${(BOTTOM_PADDING / DESIGN_WIDTH) * 100}vw`,
          width: `${(83 / DESIGN_WIDTH) * 100}vw`,
          height: `${(82 / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToNext}
        aria-label="Next slide"
      >
        {/* 默认状态 - 空心圆 + 描边箭头 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 + 白色箭头 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* Progress Bar */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          left: `${(630 / DESIGN_WIDTH) * 100}%`,
          bottom: `${((BOTTOM_PADDING + 40) / DESIGN_WIDTH) * 100}vw`,
          width: `${(669 / DESIGN_WIDTH) * 100}vw`,
          height: `${(6 / DESIGN_WIDTH) * 100}vw`,
          backgroundColor: 'rgba(209, 209, 209, 0.52)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: '#3F3F3F',
          }}
        />
      </div>
    </section>
  )
}

export default Applications
