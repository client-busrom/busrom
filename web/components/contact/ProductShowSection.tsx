"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

// ============================================
// 1. 全局常量定义 (PC 基准)
// ============================================
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922
const MOBILE_DESIGN_WIDTH = 390
const MOBILE_SECTION_HEIGHT = 700

// PC 端布局参数
const CENTER_X = 960
const CENTER_Y = 320
const CARD_WIDTH_SMALL = 320
const CARD_HEIGHT_SMALL = 243
const CARD_WIDTH_CENTER = 409
const CARD_HEIGHT_CENTER = 310
const OFFSET_X_FAR = 720
const OFFSET_X_NEAR = 400
const OFFSET_X_OUTERMOST = 1000
const OFFSET_Y_OUTERMOST = 350
const OFFSET_Y_FAR = 220
const OFFSET_Y_NEAR = 80
const OFFSET_Y_CENTER = -30
const ROTATION_FAR = 28
const ROTATION_NEAR = 17
const ROTATION_OUTERMOST = 40

const CARD_POSITIONS = [
  { offsetX: -OFFSET_X_OUTERMOST, offsetY: OFFSET_Y_OUTERMOST, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_OUTERMOST },
  { offsetX: -OFFSET_X_FAR, offsetY: OFFSET_Y_FAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_FAR },
  { offsetX: -OFFSET_X_NEAR, offsetY: OFFSET_Y_NEAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: -ROTATION_NEAR },
  { offsetX: 0, offsetY: OFFSET_Y_CENTER, width: CARD_WIDTH_CENTER, height: CARD_HEIGHT_CENTER, rotation: 0 },
  { offsetX: OFFSET_X_NEAR, offsetY: OFFSET_Y_NEAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_NEAR },
  { offsetX: OFFSET_X_FAR, offsetY: OFFSET_Y_FAR, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_FAR },
  { offsetX: OFFSET_X_OUTERMOST, offsetY: OFFSET_Y_OUTERMOST, width: CARD_WIDTH_SMALL, height: CARD_HEIGHT_SMALL, rotation: ROTATION_OUTERMOST },
]

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
  productAttributes?: any
  displayHighlights?: any[]
}

interface ProductShowSectionProps {
  backgroundImage?: MediaObject | null
  items?: ProductShowItem[]
  buttonText?: string
}

export function ProductShowSection({
  backgroundImage,
  items = [],
  buttonText = "view more",
}: ProductShowSectionProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dynamicFontSize, setDynamicFontSize] = useState(30)
  const titleRef = useRef<HTMLHeadingElement>(null)

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

  // 3. vw 计算 (切换基准)
  const vw = (v: number) => {
    const base = isMobile ? MOBILE_DESIGN_WIDTH : DESIGN_WIDTH
    return `${(v / base) * 100}vw`
  }

  // 4. 动态缩号逻辑
  React.useLayoutEffect(() => {
    if (!titleRef.current) return
    const adjustFontSize = () => {
      if (!titleRef.current) return
      let size = isMobile ? 24 : 30
      const base = isMobile ? MOBILE_DESIGN_WIDTH : DESIGN_WIDTH
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

  // 5. 切换逻辑 (适配桌面手动控制和移动端 API)
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

  // PC 端自动轮播 (如果不使用 Embla)
  useEffect(() => {
    if (isMobile || items.length <= 1) return
    const interval = setInterval(scrollNext, 5000)
    return () => clearInterval(interval)
  }, [isMobile, items.length, scrollNext])

  // 6. 预处理 Highlights
  const processedItems = useMemo(() => {
    return items.map(item => {
      if (!item.showHighlights || !item.productAttributes?.highlights) {
        return { ...item, displayHighlights: [] }
      }
      const shuffled = [...item.productAttributes.highlights].sort(() => Math.random() - 0.5)
      return { ...item, displayHighlights: shuffled.slice(0, item.highlightsCount || 3) }
    })
  }, [items])

  const centerItem = processedItems[selectedIndex]

  // 获取 PC 端可见卡片
  const pcVisibleItems = useMemo(() => {
    if (isMobile || items.length === 0) return []
    const result = []
    for (let pos = -3; pos <= 3; pos++) {
      const index = (selectedIndex + pos + items.length) % items.length
      result.push({ item: items[index], position: pos, index })
    }
    return result
  }, [isMobile, items, selectedIndex])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: isMobile ? undefined : `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
        height: isMobile ? vw(MOBILE_SECTION_HEIGHT) : undefined,
        backgroundColor: "#0C0C07"
      }}
    >
      {backgroundImage ? (
        <OptimizedImage image={backgroundImage as any} alt="Background" size="xlarge" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gray-800" />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }} />

      {/* 桌面端渲染逻辑: 扇形布局 */}
      {!isMobile && pcVisibleItems.map(({ item, position, index }) => {
        if (!item?.image) return null
        const absPos = Math.abs(position)
        const config = CARD_POSITIONS[position + 3]
        if (!config) return null
        const scale = position === 0 ? 1 : (absPos === 1 ? 0.95 : 0.85)
        const opacity = position === 0 ? 1 : (absPos === 1 ? 0.9 : (absPos === 2 ? 0.6 : 0))

        return (
          <div
            key={`${index}-${position}`}
            className="absolute overflow-hidden transition-all duration-700 ease-out cursor-pointer"
            onClick={() => position !== 0 && setSelectedIndex(index)}
            style={{
              left: vw(CENTER_X + config.offsetX - config.width / 2),
              top: vw(CENTER_Y + config.offsetY - config.height / 2),
              width: vw(config.width),
              height: vw(config.height),
              borderRadius: vw(30),
              transform: `rotate(${config.rotation}deg) scale(${scale})`,
              zIndex: position === 0 ? 10 : 5 - absPos,
              opacity,
            }}
          >
            <OptimizedImage image={item.image as any} alt={item.title} size="medium" className="w-full h-full object-cover" />
          </div>
        )
      })}

      {/* 移动端渲染逻辑: Embla 轮播 */}
      {isMobile && (
        <div className="embla overflow-hidden" ref={emblaRef} style={{ marginTop: vw(60) }}>
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
          <button onClick={scrollPrev} className="absolute flex items-center justify-center group z-50" style={{ left: isMobile ? vw(15) : vw(153), top: isMobile ? vw(160) : vw(163), width: vw(isMobile ? 50 : 83), height: vw(isMobile ? 50 : 82) }}>
            <div className="absolute inset-0 rounded-full border border-[#FFF49B] group-hover:border-transparent transition-all" />
            <div className="absolute inset-0 rounded-full bg-[#FFF49B] opacity-0 group-hover:opacity-100 transition-all" />
            <ChevronLeft className="relative z-10 text-[#FFF49B] group-hover:text-[#333] transition-colors" style={{ width: vw(isMobile ? 20 : 32), height: vw(isMobile ? 20 : 32) }} strokeWidth={2.5} />
          </button>
          <button onClick={scrollNext} className="absolute flex items-center justify-center group z-50" style={{ right: isMobile ? vw(15) : vw(153), left: isMobile ? "auto" : undefined, top: isMobile ? vw(160) : vw(163), width: vw(isMobile ? 50 : 83), height: vw(isMobile ? 50 : 82) }}>
            <div className="absolute inset-0 rounded-full border border-[#FFF49B] group-hover:border-transparent transition-all" />
            <div className="absolute inset-0 rounded-full bg-[#FFF49B] opacity-0 group-hover:opacity-100 transition-all" />
            <ChevronRight className="relative z-10 text-[#FFF49B] group-hover:text-[#333] transition-colors" style={{ width: vw(isMobile ? 20 : 32), height: vw(isMobile ? 20 : 32) }} strokeWidth={2.5} />
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
              <Link href={centerItem.link || "#"} className="relative flex items-center justify-center group" style={{ width: vw(isMobile ? 200 : 375), height: vw(isMobile ? 50 : 92), borderRadius: vw(62.5), border: "1px solid #FFF077" }}>
                <div className="absolute inset-0 rounded-full bg-[#FFF077] opacity-0 group-hover:opacity-100 transition-all" style={{ borderRadius: vw(62.5) }} />
                <div className="relative z-10 flex items-center justify-center" style={{ width: `calc(100% - ${vw(isMobile ? 50 : 92)})`, height: "100%" }}>
                  <span className="font-josefin-sans font-medium text-[#FFF077] group-hover:text-[#333] transition-colors" style={{ fontSize: vw(isMobile ? 18 : 32), lineHeight: vw(isMobile ? 16 : 30) }}>{centerItem.buttonText || buttonText}</span>
                </div>
                <svg className="relative z-10 flex-shrink-0" style={{ width: vw(isMobile ? 50 : 92), height: vw(isMobile ? 50 : 92) }} viewBox="0 0 92 92" fill="none">
                  <path d="M25.4901 13.4437C43.4151 2.17188 67.0838 7.56529 78.3557 25.4902C89.6276 43.4152 84.2342 67.0838 66.3093 78.3557C48.3843 89.6277 24.7156 84.2343 13.4437 66.3093C2.17191 48.3843 7.56519 24.7156 25.4901 13.4437ZM57.0151 35.2466L56.9818 35.243L41.9885 34.01C41.007 33.9294 40.147 34.6599 40.0672 35.6415L40.0645 35.6709C40.0018 36.6403 40.7283 37.4859 41.7 37.566L52.6899 38.4697L34.3515 54.0394C33.7252 54.5712 33.6486 55.511 34.1808 56.1379L34.3158 56.2969C34.851 56.9063 35.7774 56.9761 36.3974 56.4497L54.7368 40.8802L53.8459 51.871C53.7663 52.8527 54.4973 53.7138 55.4788 53.7946C56.4605 53.8754 57.3213 53.1451 57.401 52.1633L58.6167 37.167L58.6189 37.1355C58.6255 37.0303 58.6226 36.9248 58.6106 36.8201L58.6077 36.7934L58.6076 36.7984C58.5859 36.4813 58.463 36.1792 58.2569 35.9372L58.1384 35.798L58.1234 35.7806C57.9244 35.5529 57.6609 35.3907 57.3676 35.3169L57.3553 35.3141C57.2444 35.2805 57.1304 35.2582 57.0151 35.2466Z" className="fill-[#FFF077] group-hover:fill-[#333] transition-colors" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 装饰阴影 */}
      <svg className="absolute pointer-events-none" style={{ left: vw(-100), bottom: vw(-76), width: vw(820), height: vw(626), zIndex: 20, opacity: isMobile ? 0.3 : 1 }} viewBox="0 0 820 626" fill="none">
        <ellipse cx="516.201" cy="504.25" rx="516.201" ry="504.25" transform="matrix(-0.901241 -0.433318 -0.433318 0.901241 989.443 275.856)" fill="url(#shadow-left)" />
        <defs><linearGradient id="shadow-left" x1="304.199" y1="158.068" x2="534.302" y2="686.627" gradientUnits="userSpaceOnUse"><stop stopOpacity="0" /><stop offset="1" /></linearGradient></defs>
      </svg>
      <svg className="absolute pointer-events-none" style={{ right: vw(-140), bottom: vw(0), width: vw(704), height: vw(698), zIndex: 20, opacity: isMobile ? 0.3 : 1 }} viewBox="0 0 704 698" fill="none">
        <ellipse cx="514.1" cy="506.628" rx="516.201" ry="504.25" transform="rotate(-25.6783 514.1 506.628)" fill="url(#shadow-right)" />
        <defs><linearGradient id="shadow-right" x1="302.098" y1="160.446" x2="532.201" y2="689.006" gradientUnits="userSpaceOnUse"><stop stopOpacity="0" /><stop offset="1" /></linearGradient></defs>
      </svg>
    </section>
  )
}
