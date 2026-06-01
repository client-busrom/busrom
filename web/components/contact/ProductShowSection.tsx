"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: {
    thumbnail?: string | { url: string }
    small?: string | { url: string }
    medium?: string | { url: string }
    large?: string | { url: string }
    xlarge?: string | { url: string }
  }
  cropFocalPoint?: { x: number; y: number } | null
}

export interface ProductShowItem {
  id: string | number
  sku?: string
  title: string
  categoryName?: string
  image: MediaObject | null
  link?: string
  buttonText?: string
  showName?: boolean
  showCategory?: boolean
  showButton?: boolean
  showHighlights?: boolean
  highlightsCount?: number
  openInNewTab?: boolean
  productAttributes?: any
}

interface ProductShowSectionProps {
  backgroundImage?: MediaObject | null
  items?: ProductShowItem[]
  buttonText?: string
}

// ============================================
// 可调整参数 - 修改这里来调整卡片布局
// ============================================

// 中心点位置 (基于 1920 宽度)
const CENTER_X = 960
const CENTER_Y = 320

// 卡片尺寸 (全部横向)
const CARD_WIDTH_SMALL = 320      // 左右两侧小卡片宽度
const CARD_HEIGHT_SMALL = 243     // 左右两侧小卡片高度
const CARD_WIDTH_CENTER = 409     // 中间大卡片宽度
const CARD_HEIGHT_CENTER = 310    // 中间大卡片高度

// 位置偏移 (相对于中心点)
const OFFSET_X_FAR = 720          // 最外侧卡片 X 偏移
const OFFSET_X_NEAR = 400         // 内侧卡片 X 偏移
const OFFSET_Y_FAR = 220          // 最外侧卡片 Y 偏移 (越大越靠下)
const OFFSET_Y_NEAR = 80          // 内侧卡片 Y 偏移
const OFFSET_Y_CENTER = -30       // 中间卡片 Y 偏移 (负数表示靠上)

// 旋转角度 (正数=顺时针，负数=逆时针)
const ROTATION_FAR = 28           // 最外侧卡片旋转角度
const ROTATION_NEAR = 17          // 内侧卡片旋转角度

// ============================================
// 根据上面参数生成卡片配置 (7张: -3 到 3)
// ============================================
const OFFSET_X_OUTERMOST = 1000    // 最最外侧卡片 X 偏移 (屏幕外)
const OFFSET_Y_OUTERMOST = 350     // 最最外侧卡片 Y 偏移
const ROTATION_OUTERMOST = 40      // 最最外侧卡片旋转角度

const CARD_POSITIONS = [
  // position -3: 最最左侧 (屏幕外，准备进入)
  { offsetX: -OFFSET_X_OUTERMOST, offsetY: OFFSET_Y_OUTERMOST, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_OUTERMOST },
  // position -2: 最左侧 - 向左倾斜(负角度)
  { offsetX: -OFFSET_X_FAR, offsetY: OFFSET_Y_FAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_FAR },
  // position -1: 左侧 - 向左倾斜(负角度)
  { offsetX: -OFFSET_X_NEAR, offsetY: OFFSET_Y_NEAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_NEAR },
  // position 0: 中间主图
  { offsetX: 0, offsetY: OFFSET_Y_CENTER, width: CARD_WIDTH_CENTER, height: CARD_HEIGHT_CENTER, rotation: 0 },
  // position 1: 右侧 - 向右倾斜(正角度)
  { offsetX: OFFSET_X_NEAR, offsetY: OFFSET_Y_NEAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_NEAR },
  // position 2: 最右侧 - 向右倾斜(正角度)
  { offsetX: OFFSET_X_FAR, offsetY: OFFSET_Y_FAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_FAR },
  // position 3: 最最右侧 (屏幕外，准备进入)
  { offsetX: OFFSET_X_OUTERMOST, offsetY: OFFSET_Y_OUTERMOST, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_OUTERMOST },
]

export function ProductShowSection({
  backgroundImage,
  items = [],
  buttonText = "",
}: ProductShowSectionProps) {
  const [isMobile, setIsMobile] = useState(false)
  // 当前选中的索引
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dynamicFontSize, setDynamicFontSize] = useState(30)
  
  console.log("[ProductShowSection] items:", items, "selectedIndex:", selectedIndex)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // 1. 移动端检测
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 2. Embla Carousel 配置 (仅用于移动端)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }
    emblaApi.on("select", onSelect)
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])

  // 3. vw 尺寸计算
  const vw = (v: number) => {
    const base = isMobile ? 390 : DESIGN_WIDTH
    return `${(v / base) * 100}vw`
  }

  // 4. 动态缩号逻辑
  React.useLayoutEffect(() => {
    if (!titleRef.current) return
    const adjustFontSize = () => {
      if (!titleRef.current) return
      let size = isMobile ? 24 : 30
      const base = isMobile ? 390 : DESIGN_WIDTH
      const lineH = isMobile ? 28 : 38
      const maxHeight = (lineH * 3 / base) * window.innerWidth
      titleRef.current.style.fontSize = `${(size / base) * 100}vw`
      while (titleRef.current.offsetHeight > maxHeight && size > (isMobile ? 14 : 18)) {
        size -= 1
        titleRef.current.style.fontSize = `${(size / base) * 100}vw`
      }
      setDynamicFontSize(size)
    }
    adjustFontSize()
    window.addEventListener("resize", adjustFontSize)
    return () => window.removeEventListener("resize", adjustFontSize)
  }, [selectedIndex, items, isMobile])

  // 5. 切换逻辑
  const scrollPrev = useCallback(() => {
    if (isMobile) {
      emblaApi?.scrollPrev()
    } else {
      if (isAnimating || items.length <= 1) return
      setIsAnimating(true)
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }, [isMobile, emblaApi, isAnimating, items.length])

  const scrollNext = useCallback(() => {
    if (isMobile) {
      emblaApi?.scrollNext()
    } else {
      if (isAnimating || items.length <= 1) return
      setIsAnimating(true)
      setSelectedIndex((prev) => (prev + 1) % items.length)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }, [isMobile, emblaApi, isAnimating, items.length])

  // 自动轮播 (仅限 PC)
  useEffect(() => {
    if (isMobile || items.length <= 1) return
    autoplayRef.current = setInterval(scrollNext, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [isMobile, items.length, scrollNext])

  // 获取当前显示的 7 张卡片 (中心 + 左右各3张，包含进出场的)
  const getVisibleItems = useCallback(() => {
    if (items.length === 0) return []

    const result: { item: ProductShowItem; position: number; index: number }[] = []
    const total = items.length

    // position: -3, -2, -1, 0, 1, 2, 3 (0 是中心)
    for (let pos = -3; pos <= 3; pos++) {
      const index = (selectedIndex + pos + total) % total
      result.push({ item: items[index], position: pos, index })
    }

    return result
  }, [items, selectedIndex])

  const visibleItems = getVisibleItems()

  // 预处理 highlights，确保随机性且在轮播时保持稳定
  const processedItems = useMemo(() => {
    return items.map(item => {
      if (!item.showHighlights || !item.productAttributes?.highlights) {
        return { ...item, displayHighlights: [] }
      }

      const shuffled = [...item.productAttributes.highlights]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      return {
        ...item,
        displayHighlights: shuffled.slice(0, item.highlightsCount || 3)
      }
    })
  }, [items])

  const centerItem = processedItems[selectedIndex]

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: isMobile ? undefined : `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
        height: isMobile ? vw(700) : undefined,
        backgroundColor: "#0C0C07"
      }}
    >
      {/* 背景图 */}
      {backgroundImage ? (
        <OptimizedImage
          image={backgroundImage as any}
          alt="Product showcase background"
          size="xlarge"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-800" />
      )}

      {/* 黑色遮罩层 72% */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }}
      />

      {/* 产品卡片组 - 基于当前选中索引显示，带扇形动画 */}
      {!isMobile && visibleItems.map(({ item, position, index }) => {
        if (!item?.image) return null
        // position: -3, -2, -1, 0, 1, 2, 3 -> config index: 0, 1, 2, 3, 4, 5, 6
        const configIndex = position + 3
        const config = CARD_POSITIONS[configIndex]
        if (!config) return null

        const centerX = CENTER_X + config.offsetX
        const centerY = CENTER_Y + config.offsetY

        // 根据位置计算透明度和缩放
        const absPos = Math.abs(position)
        let opacity = 1
        let scale = 1
        if (absPos === 0) {
          opacity = 1
          scale = 1
        } else if (absPos === 1) {
          opacity = 0.9
          scale = 0.95
        } else if (absPos === 2) {
          opacity = 0.6
          scale = 0.85
        } else {
          // position ±3: 进出场的卡片，完全透明
          opacity = 0
          scale = 0.7
        }

        return (
          <div
            key={`card-${index}`}
            className="absolute overflow-hidden"
            style={{
              left: vw(centerX - config.width / 2),
              top: vw(centerY - config.height / 2),
              width: vw(config.width),
              height: vw(config.height),
              borderRadius: vw(30),
              transform: `rotate(${config.rotation}deg) scale(${scale})`,
              transformOrigin: "center center",
              zIndex: position === 0 ? 10 : 5 - absPos,
              opacity,
              transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            <OptimizedImage
              image={item.image as any}
              alt={item.title}
              size="medium"
              className="w-full h-full object-cover"
            />
          </div>
        )
      })}

      {/* 移动端渲染逻辑: Embla 轮播 */}
      {isMobile && (
        <div className="embla overflow-hidden relative z-50" ref={emblaRef} style={{ marginTop: vw(60) }}>
          <div className="embla__container flex">
            {items.map((item, idx) => (
              <div key={idx} className="embla__slide flex-[0_0_100%] flex justify-center px-4">
                <div
                  className="overflow-hidden bg-gray-800"
                  style={{ width: vw(320), height: vw(242), borderRadius: vw(20) }}
                >
                  {item.image && (
                    <OptimizedImage image={item.image as any} alt={item.title} size="medium" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 共享 UI: 导航按钮 */}
      {items.length > 1 && (
        <>
          <button onClick={scrollPrev} className="absolute flex items-center justify-center group z-[60]" style={{ left: isMobile ? vw(15) : vw(153), top: isMobile ? vw(160) : vw(163), width: vw(isMobile ? 50 : 83), height: vw(isMobile ? 50 : 82) }}>
            <div className="absolute inset-0 rounded-full border border-[#FFF49B] group-hover:border-transparent transition-all" style={{ backgroundColor: isMobile ? "#FFF49B" : "transparent" }} />
            {!isMobile && <div className="absolute inset-0 rounded-full bg-[#FFF49B] opacity-0 group-hover:opacity-100 transition-all" />}
            <ChevronLeft className={`relative z-10 transition-colors duration-300 ${isMobile ? "text-[#333]" : "text-[#FFF49B] group-hover:text-[#333]"}`} style={{ width: vw(isMobile ? 20 : 32), height: vw(isMobile ? 20 : 32) }} strokeWidth={2.5} />
          </button>
          <button onClick={scrollNext} className="absolute flex items-center justify-center group z-[60]" style={{ right: isMobile ? vw(15) : vw(153), left: isMobile ? "auto" : undefined, top: isMobile ? vw(160) : vw(163), width: vw(isMobile ? 50 : 83), height: vw(isMobile ? 50 : 82) }}>
            <div className="absolute inset-0 rounded-full border border-[#FFF49B] group-hover:border-transparent transition-all" style={{ backgroundColor: isMobile ? "#FFF49B" : "transparent" }} />
            {!isMobile && <div className="absolute inset-0 rounded-full bg-[#FFF49B] opacity-0 group-hover:opacity-100 transition-all" />}
            <ChevronRight className={`relative z-10 transition-colors duration-300 ${isMobile ? "text-[#333]" : "text-[#FFF49B] group-hover:text-[#333]"}`} style={{ width: vw(isMobile ? 20 : 32), height: vw(isMobile ? 20 : 32) }} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* 共享 UI: 文本、亮点和按钮 */}
      {centerItem && (
        <div className="relative z-50 flex flex-col items-center pointer-events-none" style={{ marginTop: isMobile ? vw(30) : vw(572) }}>
          <h3 ref={titleRef} className="font-josefin-sans font-bold text-white text-center pointer-events-auto" style={{ width: vw(isMobile ? 320 : 613), fontSize: vw(dynamicFontSize), lineHeight: isMobile ? vw(28) : vw(38) }}>
            {centerItem.showName ? centerItem.title : (centerItem.categoryName || centerItem.title)}
          </h3>

          {centerItem.showHighlights && centerItem.displayHighlights?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4 px-4 pointer-events-auto" style={{ width: isMobile ? vw(350) : vw(800) }}>
              {centerItem.displayHighlights.map((highlight: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1 md:gap-2 px-3 py-1 md:px-4 md:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#FFF49B]" />
                  <span className="text-white font-josefin-sans text-[10px] sm:text-xs md:text-base">{highlight.text}</span>
                </div>
              ))}
            </div>
          )}

          {centerItem.showButton !== false && (
            <div className="mt-8 pointer-events-auto">
              <Link 
                href={centerItem.link || "#"} 
                target={centerItem.openInNewTab ? "_blank" : undefined}
                className="relative inline-flex items-center group overflow-hidden" 
                style={{ 
                  height: vw(isMobile ? 50 : 92), 
                  borderRadius: vw(62.5), 
                  border: "1px solid #FFF077"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-[#FFF077] opacity-0 group-hover:opacity-100 transition-all" style={{ borderRadius: vw(62.5) }} />
                
                <span 
                  className="relative z-10 font-josefin-sans font-medium text-[#FFF077] group-hover:text-[#333] transition-colors whitespace-nowrap text-center flex-1" 
                  style={{ 
                    fontSize: vw(isMobile ? 18 : 32), 
                    lineHeight: vw(isMobile ? 16 : 30),
                    paddingLeft: vw(isMobile ? 24 : 48),
                    paddingRight: vw(isMobile ? 24 : 48)
                  }}
                >
                  {centerItem.buttonText || buttonText}
                </span>

                <svg className="relative z-10 flex-shrink-0" style={{ width: vw(isMobile ? 50 : 92), height: vw(isMobile ? 50 : 92) }} viewBox="0 0 92 92" fill="none">
                  <path
                    d="M25.4901 13.4437C43.4151 2.17188 67.0838 7.56529 78.3557 25.4902C89.6276 43.4152 84.2342 67.0838 66.3093 78.3557C48.3843 89.6277 24.7156 84.2343 13.4437 66.3093C2.17191 48.3843 7.56519 24.7156 25.4901 13.4437ZM57.0151 35.2466L56.9818 35.243L41.9885 34.01C41.007 33.9294 40.147 34.6599 40.0672 35.6415L40.0645 35.6709C40.0018 36.6403 40.7283 37.4859 41.7 37.566L52.6899 38.4697L34.3515 54.0394C33.7252 54.5712 33.6486 55.511 34.1808 56.1379L34.3158 56.2969C34.851 56.9063 35.7774 56.9761 36.3974 56.4497L54.7368 40.8802L53.8459 51.871C53.7663 52.8527 54.4973 53.7138 55.4788 53.7946C56.4605 53.8754 57.3213 53.1451 57.401 52.1633L58.6167 37.167L58.6189 37.1355C58.6255 37.0303 58.6226 36.9248 58.6106 36.8201L58.6077 36.7934L58.6076 36.7984C58.5859 36.4813 58.463 36.1792 58.2569 35.9372L58.1384 35.798L58.1234 35.7806C57.9244 35.5529 57.6609 35.3907 57.3676 35.3169L57.3553 35.3141C57.2444 35.2805 57.1304 35.2582 57.0151 35.2466Z"
                    fill="#FFF077"
                    className="group-hover:fill-[#333] transition-colors duration-300"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}


      {/* 左下角圆形渐变阴影 */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: vw(isMobile ? -50 : -100),
          bottom: vw(isMobile ? -38 : -76),
          width: vw(isMobile ? 410 : 820),
          height: vw(isMobile ? 313 : 626),
          zIndex: 20,
          opacity: isMobile ? 0.3 : 1
        }}
        viewBox="0 0 820 626"
        fill="none"
      >
        <ellipse
          cx="516.201"
          cy="504.25"
          rx="516.201"
          ry="504.25"
          transform="matrix(-0.901241 -0.433318 -0.433318 0.901241 989.443 275.856)"
          fill="url(#shadow-left)"
        />
        <defs>
          <linearGradient
            id="shadow-left"
            x1="304.199"
            y1="158.068"
            x2="534.302"
            y2="686.627"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* 右下角圆形渐变阴影 */}
      <svg
        className="absolute pointer-events-none"
        style={{
          right: vw(isMobile ? -70 : -140),
          bottom: vw(0),
          width: vw(isMobile ? 352 : 704),
          height: vw(isMobile ? 349 : 698),
          zIndex: 20,
          opacity: isMobile ? 0.3 : 1
        }}
        viewBox="0 0 704 698"
        fill="none"
      >
        <ellipse
          cx="514.1"
          cy="506.628"
          rx="516.201"
          ry="504.25"
          transform="rotate(-25.6783 514.1 506.628)"
          fill="url(#shadow-right)"
        />
        <defs>
          <linearGradient
            id="shadow-right"
            x1="302.098"
            y1="160.446"
            x2="532.201"
            y2="689.006"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  )
}
