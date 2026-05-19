"use client"

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import AutoScroll from "embla-carousel-auto-scroll"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 850

// 移动端设计稿基准尺寸
const MOBILE_DESIGN_WIDTH = 375

// 卡片尺寸 - 桌面端
const CARD_WIDTH = 202
const CARD_HEIGHT = 252
const CARD_GAP = 12

// 放大后的尺寸 - 桌面端
const EXPANDED_WIDTH = 404
const EXPANDED_HEIGHT = 504

// 卡片尺寸 - 移动端（固定尺寸，不放大）
const MOBILE_CARD_WIDTH = 140
const MOBILE_CARD_HEIGHT = 180
const MOBILE_CARD_GAP = 12

// 图片大小（百分比）
const IMAGE_SIZE = "100%"

// 自动轮播间隔 (ms)
const AUTO_PLAY_INTERVAL = 4000
// 鼠标不动后恢复轮播的时间 (ms)
const RESUME_DELAY = 4000

// 箭头按钮位置（设计稿尺寸）
const LEFT_ARROW_RIGHT = 153 + 83 + 20 // 左箭头右边界 + 边距
const RIGHT_ARROW_LEFT = 1666 - 20 // 右箭头左边界 - 边距

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
}

export interface ProductSeriesItem {
  id: string | number
  title: string
  image: MediaObject | null
  link?: string
  buttonText?: string
}

interface ProductSeriesEntrySectionProps {
  titleLeft?: string
  titleLeftSuperscript?: string
  titleRightBold?: string
  titleRightNormal?: string
  products?: ProductSeriesItem[]
  viewMoreText?: string
  viewMoreLink?: string
}

export function ProductSeriesEntrySection({
  titleLeft = "",
  titleLeftSuperscript = "",
  titleRightBold = "",
  titleRightNormal = "",
  products = [],
  viewMoreText = "view more",
  viewMoreLink = "/products",
}: ProductSeriesEntrySectionProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 检测是否移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: "trimSnaps",
    },
    [WheelGesturesPlugin()]
  )

  // vw 尺寸计算 - 桌面端
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

  // vw 尺寸计算 - 移动端
  const mvw = useCallback((v: number) => `${(v / MOBILE_DESIGN_WIDTH) * 100}vw`, [])

  // 点击卡片切换放大状态
  const handleCardClick = useCallback((index: number) => {
    setIsPaused(true)
    setActiveIndex(index)

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [])

  // 自动轮播
  useEffect(() => {
    if (isPaused || products.length === 0) return

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length)
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isPaused, products.length])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
      }
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [])

  // 检查卡片是否在两个箭头按钮之间（仅桌面端）
  const isCardInVisibleArea = useCallback((index: number) => {
    if (!emblaApi || isMobile) return true

    const slideNodes = emblaApi.slideNodes()
    if (!slideNodes || !slideNodes[index]) return true

    const slideNode = slideNodes[index]
    const slideRect = slideNode.getBoundingClientRect()

    // 计算缩放比例
    const scale = window.innerWidth / DESIGN_WIDTH

    // 两个箭头之间的可视区域（实际像素）
    const leftBoundary = LEFT_ARROW_RIGHT * scale
    const rightBoundary = RIGHT_ARROW_LEFT * scale

    // 检查卡片是否完全在可视区域内（考虑放大后的宽度）
    const expandedWidth = EXPANDED_WIDTH * scale
    const cardLeft = slideRect.left
    const cardRight = cardLeft + expandedWidth

    return cardLeft >= leftBoundary && cardRight <= rightBoundary
  }, [emblaApi, isMobile])

  // 当 activeIndex 变化时，检查是否需要滚动
  useEffect(() => {
    if (!emblaApi || activeIndex === null) return

    // 检查卡片放大后是否在两个箭头之间
    if (!isCardInVisibleArea(activeIndex)) {
      emblaApi.scrollTo(activeIndex)
    }

    // 等卡片尺寸动画完成后（500ms），重新计算 Embla 的尺寸
    const timer = setTimeout(() => {
      emblaApi.reInit()
    }, 550)

    return () => clearTimeout(timer)
  }, [activeIndex, emblaApi, isCardInVisibleArea])

  // 左箭头点击 - 切换到上一个 item
  const handlePrev = useCallback(() => {
    setIsPaused(true)
    setActiveIndex((prev) => Math.max(0, prev - 1))

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [])

  // 右箭头点击 - 切换到下一个 item
  const handleNext = useCallback(() => {
    setIsPaused(true)
    setActiveIndex((prev) => Math.min(products.length - 1, prev + 1))

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [products.length])

  // 移动端布局 - 使用 AutoScroll 循环轮播
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel(
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

  // 获取 AutoScroll 插件实例
  const autoScrollPlugin = useMemo(() => {
    return mobileEmblaApi?.plugins()?.autoScroll
  }, [mobileEmblaApi])

  // 预计算标题字符，避免每次渲染都 split
  const boldChars = useMemo(() => titleRightBold.split(""), [titleRightBold])
  const normalChars = useMemo(() => titleRightNormal.split(""), [titleRightNormal])

  // 移动端导航
  const mobileGoToPrev = useCallback(() => {
    if (!mobileEmblaApi) return
    autoScrollPlugin?.stop()
    mobileEmblaApi.scrollPrev()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [mobileEmblaApi, autoScrollPlugin])

  const mobileGoToNext = useCallback(() => {
    if (!mobileEmblaApi) return
    autoScrollPlugin?.stop()
    mobileEmblaApi.scrollNext()
    setTimeout(() => autoScrollPlugin?.play(), 2000)
  }, [mobileEmblaApi, autoScrollPlugin])

  if (isMobile) {
    return (
      <section className="relative w-full py-10 overflow-hidden">
        {/* 移动端标题 - 放大 */}
        <div className="text-center mb-8 px-4">
          <h2 className="font-josefin-sans font-bold text-3xl text-black mb-2">
            {(titleLeft || "Which\nProducts").split("\n").join(" ")}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-sm font-josefin-sans font-bold text-black uppercase">
              {titleLeftSuperscript}
            </span>
            <div
              className="bg-brand-olive-dark"
              style={{
                width: "10px",
                height: "30px",
                transform: "skewX(-15deg)",
              }}
            />
          </div>
          <p className="font-josefin-sans font-bold text-2xl">
            <span className="text-brand-main text-stroke-dark-olive">
              {titleRightBold}
            </span>{" "}
            <span className="text-black">{titleRightNormal}</span>
          </p>
        </div>

        {/* 移动端循环轮播 */}
        <div className="relative px-2">
          {/* Embla 轮播 */}
          <div
            className="overflow-hidden py-4"
            ref={mobileEmblaRef}
          >
            <div
              className="flex"
              style={{ gap: `${MOBILE_CARD_GAP}px` }}
            >
              {products.map((product, index) => {
                const isLast = index === products.length - 1
                return (
                <Link
                  key={product.id}
                  href={product.link || viewMoreLink}
                  className="relative flex-shrink-0 group"
                  style={{
                    width: `${MOBILE_CARD_WIDTH}px`,
                    height: `${MOBILE_CARD_HEIGHT}px`,
                    marginRight: isLast ? `${MOBILE_CARD_GAP}px` : undefined,
                  }}
                >
                  {/* 卡片容器 */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-white transition-shadow duration-300 group-active:shadow-lg"
                    style={{
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {/* 图片 */}
                    {product.image && (
                      <div
                        className="absolute"
                        style={{
                          top: "10%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "75%",
                          height: "60%",
                        }}
                      >
                        <OptimizedImage
                          image={product.image}
                          alt={product.image.alt || product.title}
                          size="medium"
                          objectFit="contain"
                          className="w-full h-full"
                        />
                      </div>
                    )}

                    {/* View More - 常显 */}
                    <div
                      className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 text-xs font-josefin-sans font-bold text-brand-olive-dark"
                    >
                      <span>{product.buttonText || viewMoreText}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          </div>

          {/* 左右箭头 - 底部居中 */}
          <div className="flex justify-center items-center gap-6 mt-6">
            <button
              onClick={mobileGoToPrev}
              className="w-10 h-10 flex items-center justify-center"
            >
              <svg viewBox="0 0 83 82" fill="none" className="w-full h-full">
                <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="white"/>
                <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#464010"/>
              </svg>
            </button>
            <button
              onClick={mobileGoToNext}
              className="w-10 h-10 flex items-center justify-center"
            >
              <svg viewBox="0 0 83 82" fill="none" className="w-full h-full">
                <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="white"/>
                <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="#464010"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  }

  // 桌面端布局
  return (
    <section
      className="relative w-full overflow-hidden bg-brand-light-olive-bg"
      style={{
        height: vw(SECTION_HEIGHT),
        willChange: "transform",
      }}
    >
      {/* 标题区域 - 左侧 WHICH PRODUCTS */}
      <div
        className="absolute"
        style={{
          left: vw(200),
          top: vw(0),
        }}
      >
        <h2
          className="relative font-josefin-sans font-bold uppercase text-left"
        >
          {/* 底层：描边镂空，向下偏移 */}
          <span
            className="absolute"
            style={{
              top: "5px",
              left: "1px",
              fontSize: vw(96),
              lineHeight: vw(104),
              color: "transparent",
              WebkitTextStroke: "1px #464010",
            }}
          >
            <span style={{ display: "block" }}>{(titleLeft || "Which\nProducts").split("\n")[0]}</span>
            <span style={{ display: "block", paddingLeft: vw(80) }}>{(titleLeft || "Which\nProducts").split("\n")[1]}</span>
          </span>
          {/* 顶层：黑色填充 */}
          <span
            className="relative text-black"
            style={{
              fontSize: vw(96),
              lineHeight: vw(104),
              display: "block",
            }}
          >
            <span style={{ display: "block" }}>{(titleLeft || "Which\nProducts").split("\n")[0]}</span>
            <span style={{ display: "block", paddingLeft: vw(80) }}>{(titleLeft || "Which\nProducts").split("\n")[1]}</span>
          </span>
        </h2>
      </div>

      {/* series 小标签 */}
      {titleLeftSuperscript && (
        <span
          className="absolute font-josefin-sans font-bold text-black uppercase"
          style={{
            left: vw(831),
            top: vw(108),
            fontSize: vw(16),
            lineHeight: vw(21),
          }}
        >
          {titleLeftSuperscript}
        </span>
      )}

      {/* 斜杠 / */}
      <div
        className="absolute bg-brand-olive-dark"
        style={{
          left: vw(1001),
          top: vw(101),
          width: vw(18),
          height: vw(79),
          transform: "skewX(-15deg)",
        }}
      />

      {/* 标题区域 - 右侧 Are You Looking For? */}
      <div
        className="absolute font-josefin-sans font-bold"
        style={{
          left: vw(1265),
          top: vw(18),
          fontSize: vw(77),
          lineHeight: vw(86),
        }}
      >
        {/* Are You - 字符跳动效果 */}
        <div className="flex">
          {boldChars.map((char, index) => (
            <motion.span
              key={`bold-${index}`}
              className="inline-block text-brand-main text-stroke-dark-olive"
              style={{ 
                marginRight: char === " " ? vw(16) : 0,
                willChange: "transform"
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 4,
                delay: index * 0.05,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Looking For? - 实心填充 + 问号特殊动效 */}
        <div className="flex">
          {normalChars.map((char, index) => {
            if (char === "?") {
              return (
                <motion.div
                  key="question-mark"
                  className="inline-block relative"
                  style={{ 
                    width: vw(70),
                    height: vw(106),
                    transformOrigin: "center bottom",
                    willChange: "transform",
                    alignSelf: "flex-end",
                    marginLeft: vw(4),
                  }}
                  animate={{
                    rotate: [-18, -10, -18],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <img
                    src="/contact-support/?.svg"
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )
            }
            return (
              <motion.span
                key={`normal-${index}`}
                className="inline-block text-black"
                style={{ 
                  marginRight: char === " " ? vw(16) : 0,
                  willChange: "transform"
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 4,
                  delay: (boldChars.length + index) * 0.05,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            )
          })}
        </div>
      </div>

      {/* 左箭头 */}
      <button
        onClick={handlePrev}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(153),
          top: vw(400),
          width: vw(83),
          height: vw(82),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* 右箭头 */}
      <button
        onClick={handleNext}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(1666),
          top: vw(400),
          width: vw(83),
          height: vw(82),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* Embla 轮播区域 */}
      <div
        className="absolute !overflow-visible [&>*]:!overflow-visible"
        ref={emblaRef}
        style={{
          left: vw(100),
          right: vw(0),
          bottom: vw(80),
          height: vw(EXPANDED_HEIGHT + 100),
        }}
      >
        <div
          className="flex items-end h-full !overflow-visible"
          style={{
            gap: vw(CARD_GAP),
          }}
        >
          {products.map((product, index) => {
            const isActive = activeIndex === index
            const isFirst = index === 0
            const isLast = index === products.length - 1

            return (
              <motion.div
                key={product.id}
                className="embla__slide relative flex-shrink-0 cursor-pointer"
                style={{
                  width: isActive ? vw(EXPANDED_WIDTH) : vw(CARD_WIDTH),
                  height: isActive ? vw(EXPANDED_HEIGHT) : vw(CARD_HEIGHT),
                  transition: "width 0.5s ease, height 0.5s ease",
                  willChange: "width, height",
                  borderRadius: vw(30),
                  boxShadow: isActive
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.1)",
                  marginLeft: isFirst ? vw(200) : undefined,
                  marginRight: isLast ? vw(300) : undefined,
                }}
                onClick={() => handleCardClick(index)}
              >
                {/* 卡片容器 - 包含背景和图片 */}
                <div
                  className="absolute inset-0 overflow-hidden bg-white"
                  style={{
                    borderRadius: vw(30),
                  }}
                >
                  {/* 图片容器 - 上下居中，水平居中 */}
                  {product.image && (
                    <div
                      className="absolute"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                      }}
                    >
                      <OptimizedImage
                        image={product.image}
                        alt={product.image.alt || product.title}
                        size="medium"
                        objectFit="contain"
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>

                {/* 激活时显示右侧 - 箭头 + buttonText（顶对齐，在卡片右侧外面） */}
                {isActive && (
                  <Link
                    href={product.link || viewMoreLink}
                    className="absolute transition-opacity duration-300"
                    style={{
                      left: `calc(100% + ${vw(10)})`,
                      top: `calc(${vw(10)})`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      style={{ willChange: "transform" }}
                      animate={{
                        x: [vw(-8), vw(8)],
                        y: [vw(8), vw(-8)],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
                      {/* 箭头装饰 */}
                      <span
                        style={{
                          display: "block",
                          width: vw(100),
                          height: vw(100),
                          backgroundImage: "url(/contact-support/arrow-corner.svg)",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      {/* buttonText 文字 - 在箭头下方 */}
                      {product.buttonText && (
                        <span
                          className="absolute font-josefin-sans font-bold text-black whitespace-nowrap"
                          style={{
                            left: vw(0),
                            top: vw(110),
                            fontSize: vw(14),
                            lineHeight: vw(18),
                          }}
                        >
                          {product.buttonText}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
