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
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // 获取 AutoScroll 插件实例
  const autoScrollPlugin = React.useMemo(() => {
    return emblaApi?.plugins()?.autoScroll
  }, [emblaApi])

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

  // Size calculations in vw
  const cardWidthVw = (CARD_WIDTH / DESIGN_WIDTH) * 100
  const cardHeightVw = (CARD_HEIGHT / DESIGN_WIDTH) * 100
  const cardGapVw = (CARD_GAP / DESIGN_WIDTH) * 100

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-[#F6F4ED]", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* Title - "More series" */}
      <h2
        className="absolute font-josefin-sans font-bold text-center"
        style={{
          left: `${(602 / DESIGN_WIDTH) * 100}%`,
          top: `${(140 / DESIGN_WIDTH) * 100}vw`,  // 40 -> 140, 增加100px顶部留白
          width: `${(717 / DESIGN_WIDTH) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${(101 / DESIGN_WIDTH) * 100}vw`,
          color: "#46401F",
        }}
      >
        {title || "More series"}
      </h2>

      {/* Embla Viewport */}
      <div
        className="absolute overflow-x-clip overflow-y-visible"
        ref={emblaRef}
        style={{
          left: `${(100 / DESIGN_WIDTH) * 100}%`,
          right: `${(100 / DESIGN_WIDTH) * 100}%`,
          top: `${(260 / DESIGN_WIDTH) * 100}vw`,  // 160 -> 260, 增加100px顶部留白
          height: `${((CARD_HEIGHT + 120) / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        {/* Embla Container */}
        <div
          className="flex h-full items-start"
          style={{
            gap: `${cardGapVw}vw`,
            paddingTop: `${(20 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          {series.map((item, index) => {
            const isLast = index === series.length - 1

            return (
              <div
                key={`slide-${index}`}
                className="relative flex-shrink-0"
                style={{
                  width: `${cardWidthVw}vw`,
                  height: `${cardHeightVw}vw`,
                  marginRight: isLast ? `${cardGapVw}vw` : undefined,
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
                        className="absolute font-anaheim font-bold group-hover:font-extrabold text-black transition-all duration-300"
                        style={{
                          left: `${(44 / DESIGN_WIDTH) * 100}vw`,
                          top: `${(31 / DESIGN_WIDTH) * 100}vw`,
                          fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
                          lineHeight: `${(36 / DESIGN_WIDTH) * 100}vw`,
                          maxWidth: `${(260 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Arrow button - white circle with arrow, variants driven by motion */}
                    {/* 独立于卡片背景放大容器，整个圆形按钮（包含背景和内部图标）作为一个整体，在悬停时产生像“反复往右上角戳”一样的极其灵动循环弹跳动效 */}
                    <motion.div
                      className="absolute rounded-full overflow-hidden flex items-center justify-center"
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
                        right: `${(0 / DESIGN_WIDTH) * 100}vw`,
                        top: `${(0 / DESIGN_WIDTH) * 100}vw`,
                        width: `${(50 / DESIGN_WIDTH) * 100}vw`,
                        height: `${(50 / DESIGN_WIDTH) * 100}vw`,
                      }}
                    >
                      {/* 内部箭头图标：跟随外层一起运动，自身仅做极其丝滑的颜色渐变 */}
                      <motion.div
                        variants={{
                          rest: { color: "#5E571F" },
                          hover: { color: "#FFFFFF" }
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon icon="lucide:arrow-up-right" className="w-6 h-6" />
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
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(508 / DESIGN_WIDTH) * 100}%`,
          top: `${(720 / DESIGN_WIDTH) * 100}vw`,
          width: `${(83 / DESIGN_WIDTH) * 100}vw`,
          height: `${(82 / DESIGN_WIDTH) * 100}vw`,
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
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${(1338 / DESIGN_WIDTH) * 100}%`,
          top: `${(720 / DESIGN_WIDTH) * 100}vw`,
          width: `${(83 / DESIGN_WIDTH) * 100}vw`,
          height: `${(82 / DESIGN_WIDTH) * 100}vw`,
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
        className="absolute rounded-full overflow-hidden"
        style={{
          left: `${(630 / DESIGN_WIDTH) * 100}%`,
          top: `${(760 / DESIGN_WIDTH) * 100}vw`,  // 660 -> 760, 下移100px
          width: `${(669 / DESIGN_WIDTH) * 100}vw`,
          height: `${(6 / DESIGN_WIDTH) * 100}vw`,
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
