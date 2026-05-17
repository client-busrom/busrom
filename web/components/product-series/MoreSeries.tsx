"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import { cn } from "@/lib/utils"
import type { MoreSeriesData, MoreSeriesItem } from "@/lib/content-parser"

/**
 * More Series Section
 *
 * Based on Figma design:
 * - Title "More series" centered at top
 * - Carousel of cards that can be scrolled
 * - Cards scale up on hover
 * - Navigation buttons and progress bar at bottom
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 884  // 增加100px顶部留白
const CARD_WIDTH = 391
const CARD_HEIGHT = 360
const CARD_GAP = 35

// Image position - adjust top value to move image down (e.g., '20%' = start 20% from top)
const CARD_IMAGE_TOP = '25%'
// Image size - width/height as percentage of card (e.g., '80%' = 80% of card size)
const CARD_IMAGE_SIZE = '75%'

// 极其优雅、完美的桌面端等比缩放辅助函数
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

interface MoreSeriesProps {
  data: MoreSeriesData
  currentSlug?: string  // Current product series slug to exclude
  className?: string
}

export function MoreSeries({ data, currentSlug, className }: MoreSeriesProps) {
  if (!data) return null

  const { title = 'More series', series: dataSeries = [] } = data

  // Filter out current series from the list
  const series = React.useMemo(() => {
    return (dataSeries || []).filter(item => item.slug !== currentSlug)
  }, [dataSeries, currentSlug])

  // Embla carousel with auto-scroll
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
        stopOnInteraction: true, // 极其重要：设为 true，用户拖拽或点击时立刻无条件停止自动滚动，赋予拖拽最高优先级
        stopOnMouseEnter: true,  // 鼠标悬停时停止
        stopOnFocusIn: true,
      }),
    ]
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // 获取 AutoScroll 插件实例
  const autoScrollPlugin = React.useMemo(() => {
    return emblaApi?.plugins()?.autoScroll
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    // 极其健壮的拖拽与触控交互恢复机制
    const onPointerDown = () => {
      autoScrollPlugin?.stop()
    }
    const onPointerUp = () => {
      // 拖拽释放后，延迟 2 秒极其丝滑地尝试恢复播放（如果鼠标已不在容器内）
      setTimeout(() => {
        if (autoScrollPlugin && !autoScrollPlugin.isPlaying()) {
          autoScrollPlugin.play()
        }
      }, 2000)
    }

    emblaApi.on("pointerDown", onPointerDown)
    emblaApi.on("pointerUp", onPointerUp)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
      emblaApi.off("pointerDown", onPointerDown)
      emblaApi.off("pointerUp", onPointerUp)
    }
  }, [emblaApi, onSelect, autoScrollPlugin])

  // 导航 - 点击时先停止自动滚动，滚动完成后恢复
  const goToPrev = React.useCallback(() => {
    if (!emblaApi) return
    autoScrollPlugin?.stop()
    emblaApi.scrollPrev()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  const goToNext = React.useCallback(() => {
    if (!emblaApi) return
    autoScrollPlugin?.stop()
    emblaApi.scrollNext()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [emblaApi, autoScrollPlugin])

  // Progress calculation
  const progressPercent = series.length > 0
    ? ((selectedIndex + 1) / series.length) * 100
    : 0

  if (!series || series.length === 0) {
    return null
  }

  return (
    <section
      className={cn("relative w-full h-auto md:h-full overflow-hidden bg-[#F6F4ED]  md:aspect-[1920/884] max-md:py-12", className)}
    >
      {/* Title - "More series" */}
      <h2
        className="absolute font-josefin-sans font-bold text-center max-md:!static max-md:!w-full max-md:!text-4xl max-md:!line-clamp-none max-md:!leading-tight max-md:px-4 max-md:mb-8"
        style={{
          left: vw(602),
          top: vw(140),  // 40 -> 140, 增加100px顶部留白
          width: vw(717),
          fontSize: vw(96),
          lineHeight: vw(101),
          color: "#46401F",
        }}
      >
        {title || "More series"}
      </h2>

      {/* Embla Viewport */}
      <div
        className="absolute overflow-x-clip overflow-y-visible max-md:!static max-md:!h-auto max-md:!w-full max-md:mb-8"
        ref={emblaRef}
        style={{
          left: 0,
          right: 0,
          top: vw(260),  // 160 -> 260, 增加100px顶部留白
          height: vw(CARD_HEIGHT + 120),
        }}
      >
        {/* Embla Container */}
        <div
          className="flex h-full items-start max-md:!pt-0 max-md:px-4"
          style={{
            paddingTop: vw(20),
          }}
        >
          {series.map((item, index) => {
            return (
              <div
                key={`slide-${index}`}
                className="relative flex-shrink-0 max-md:!w-[360px] max-md:!h-[320px] max-md:!mr-4"
                style={{
                  width: vw(CARD_WIDTH),
                  height: vw(CARD_HEIGHT),
                  marginRight: vw(CARD_GAP), // 极其重要：Embla 的 loop 克隆算法完美测量 marginRight，彻底取代 flex gap 避免首尾重叠异常！
                }}
              >
                <Link
                  href={item.link || "#"}
                  className="block w-full h-full"
                >
                  <motion.div
                    className="w-full h-full group"
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                  >
                    {/* Card background with special shape */}
                    <div
                      className="absolute inset-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        transformOrigin: "center center",
                      }}
                    >
                      {/* Shadow layer */}
                      <div
                        className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
                        style={{
                          filter: "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.3))",
                        }}
                      >
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 391 361"
                          preserveAspectRatio="none"
                        >
                          <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                        </svg>
                      </div>
                      {/* SVG clip path for card shape */}
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 391 361"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <clipPath id={`card-clip-${index}`}>
                            <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" />
                          </clipPath>
                        </defs>
                        <path d="M300.447 0C318.599 0.000263884 333.314 14.7153 333.314 32.8672V37.1211C333.315 52.9239 346.125 65.7342 361.928 65.7344C377.731 65.7344 390.542 78.5456 390.542 94.3486V320.382C390.542 342.473 372.633 360.382 350.542 360.382H40C17.9087 360.382 0.000214435 342.473 0 320.382V40C0 17.9086 17.9086 0 40 0H300.447Z" fill="white"/>
                      </svg>

                      {/* Image with clip path */}
                      {item.image && (
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            clipPath: `url(#card-clip-${index})`,
                            top: CARD_IMAGE_TOP,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: CARD_IMAGE_SIZE,
                            height: CARD_IMAGE_SIZE,
                          }}
                        >
                          <OptimizedImage
                            image={item.image}
                            alt={item.name}
                            size="small"
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {/* Card title */}
                      <span
                        className="absolute font-anaheim font-bold group-hover:font-extrabold text-black transition-all duration-300 max-md:!left-6 max-md:!top-6 max-md:!text-2xl max-md:!max-w-[60vw]"
                        style={{
                          left: vw(44),
                          top: vw(31),
                          fontSize: vw(32),
                          lineHeight: vw(36),
                          maxWidth: vw(260),
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Arrow button - white circle with arrow, variants driven by motion */}
                    {/* 独立于卡片背景放大容器，整个圆形按钮（包含背景和内部图标）作为一个整体，在悬停时产生像“反复往右上角戳”一样的极其灵动循环弹跳动效 */}
                    <motion.div
                      className="absolute rounded-full overflow-hidden flex items-center justify-center max-md:!w-10 max-md:!h-10 max-md:!right-4 max-md:!top-4"
                      variants={{
                        rest: { 
                          backgroundColor: "#FFFFFF",
                          x: 10,
                          y: -5,
                        },
                        hover: { 
                          backgroundColor: "#564E16",
                          x: [10, 20, 10],
                          y: [-5, -15, -5],
                          transition: {
                            x: { repeat: Infinity, repeatType: "loop", duration: 0.8, ease: "easeInOut" },
                            y: { repeat: Infinity, repeatType: "loop", duration: 0.8, ease: "easeInOut" },
                            backgroundColor: { duration: 0.3 }
                          }
                        }
                      }}
                      style={{
                        right: vw(0),
                        top: vw(0),
                        width: vw(50),
                        height: vw(50),
                      }}
                    >
                      {/* 内部箭头图标：跟随外层一起运动，自身仅做极其丝滑的颜色渐变 */}
                      <motion.div
                        className="max-md:!w-5 max-md:!h-5 flex items-center justify-center"
                        variants={{
                          rest: { color: "#5E571F" },
                          hover: { color: "#FFFFFF" }
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: vw(24),
                          height: vw(24),
                        }}
                      >
                        <Icon icon="lucide:arrow-up-right" className="w-full h-full" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Left Navigation Button */}
      <button
        className="absolute cursor-pointer group z-10 max-md:hidden"
        style={{
          left: vw(508),
          top: vw(720),
          width: vw(83),
          height: vw(82),
        }}
        onClick={goToPrev}
        aria-label="Previous"
      >
        {/* 默认状态 - 空心圆 + 深色箭头 */}
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
        className="absolute cursor-pointer group z-10 max-md:hidden"
        style={{
          left: vw(1338),
          top: vw(720),
          width: vw(83),
          height: vw(82),
        }}
        onClick={goToNext}
        aria-label="Next"
      >
        {/* 默认状态 - 空心圆 + 深色箭头 */}
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
        className="absolute rounded-full overflow-hidden max-md:!static max-md:!w-[60vw] max-md:!h-1.5 max-md:mx-auto max-md:mt-4"
        style={{
          left: vw(630),
          top: vw(760),  // 660 -> 760, 下移100px
          width: vw(669),
          height: vw(6),
          backgroundColor: "rgba(209, 209, 209, 0.52)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: "#3F3F3F",
          }}
        />
      </div>
    </section>
  )
}

export default MoreSeries
