"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { ProductAdvantagesData } from "@/lib/content-parser"

// ============================================================================
// 甲方提供的系列渐变色与主题色配置表 (Series Color Chart)
// ============================================================================
export interface SeriesColorConfig {
  name: string
  rgb: string       // 用于顶部纯色起点
  rgba: string      // 用于渐变过渡点
  rgbaTransparent: string // 用于渐变终点
  dark: string      // 用于文字、图标、按钮的主题暗色
  lightBg: string   // 用于卡片底色
}

export const SERIES_COLORS: Record<string, SeriesColorConfig> = {
  'glass standoff': {
    name: '焦糖棕',
    rgb: 'rgb(117, 111, 63)',
    rgba: 'rgba(255, 227, 0, 0.35)',
    rgbaTransparent: 'rgba(255, 227, 0, 0)',
    dark: '#756F3F',
    lightBg: '#FFFDE9',
  },
  'glass connected fitting': {
    name: '橄榄绿',
    rgb: 'rgb(142, 158, 139)',
    rgba: 'rgba(142, 158, 139, 0.35)',
    rgbaTransparent: 'rgba(142, 158, 139, 0)',
    dark: '#586555',
    lightBg: '#F5F7F5',
  },
  'glass fence spigot': {
    name: '藕粉',
    rgb: 'rgb(191, 136, 146)',
    rgba: 'rgba(191, 136, 146, 0.35)',
    rgbaTransparent: 'rgba(191, 136, 146, 0)',
    dark: '#7A525A',
    lightBg: '#FAF5F6',
  },
  'guardrail glass clip': {
    name: '海盐蓝',
    rgb: 'rgb(134, 157, 187)',
    rgba: 'rgba(134, 157, 187, 0.35)',
    rgbaTransparent: 'rgba(134, 157, 187, 0)',
    dark: '#55647C',
    lightBg: '#F4F6F9',
  },
  'bathroom glass clip': {
    name: '姜黄',
    rgb: 'rgb(188, 157, 79)',
    rgba: 'rgba(188, 157, 79, 0.35)',
    rgbaTransparent: 'rgba(188, 157, 79, 0)',
    dark: '#756F3F',
    lightBg: '#FFFDE9',
  },
  'glass hinge': {
    name: '陶土橙',
    rgb: 'rgb(200, 112, 76)',
    rgba: 'rgba(200, 112, 76, 0.35)',
    rgbaTransparent: 'rgba(200, 112, 76, 0)',
    dark: '#80442D',
    lightBg: '#FAF2EE',
  },
  'sliding door kit': {
    name: '干枯玫瑰红',
    rgb: 'rgb(196, 112, 123)',
    rgba: 'rgba(196, 112, 123, 0.35)',
    rgbaTransparent: 'rgba(196, 112, 123, 0)',
    dark: '#7D434B',
    lightBg: '#FAF2F3',
  },
  'bathroom & door handle': {
    name: '灰青绿',
    rgb: 'rgb(106, 133, 129)',
    rgba: 'rgba(106, 133, 129, 0.35)',
    rgbaTransparent: 'rgba(106, 133, 129, 0)',
    dark: '#415451',
    lightBg: '#F2F5F5',
  },
  'hidden hook': {
    name: '奶橙',
    rgb: 'rgb(213, 160, 126)',
    rgba: 'rgba(213, 160, 126, 0.35)',
    rgbaTransparent: 'rgba(213, 160, 126, 0)',
    dark: '#87624A',
    lightBg: '#FAF5F2',
  },
}

export function getSeriesColorConfig(seriesNameOrSlug?: string): SeriesColorConfig {
  const defaultCfg = SERIES_COLORS['bathroom glass clip']
  if (!seriesNameOrSlug) return defaultCfg

  // 终极匹配算法：剔除所有空格、连字符、下划线及 & 符号，只保留纯字母数字进行无缝比对
  const cleanInput = seriesNameOrSlug.toLowerCase().replace(/[\s-_&]/g, '')

  for (const [key, config] of Object.entries(SERIES_COLORS)) {
    const cleanKey = key.toLowerCase().replace(/[\s-_&]/g, '')
    if (cleanInput === cleanKey) {
      return config
    }
  }

  for (const [key, config] of Object.entries(SERIES_COLORS)) {
    const cleanKey = key.toLowerCase().replace(/[\s-_&]/g, '')
    if (cleanInput.includes(cleanKey) || cleanKey.includes(cleanInput)) {
      return config
    }
  }

  return defaultCfg
}

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

interface ProductAdvantagesProps {
  data: ProductAdvantagesData
  seriesName?: string
  currentSlug?: string
  className?: string
}

export function ProductAdvantages({ data, seriesName, currentSlug, className }: ProductAdvantagesProps) {
  if (!data) return null

  const {
    advantagesTitle = '',
    advantagesImages = [],
    advantagesCategories = [],
  } = data

  const [currentCategory, setCurrentCategory] = React.useState(0)
  const [expandedCardIndex, setExpandedCardIndex] = React.useState(0)

  const colorCfg = getSeriesColorConfig(seriesName || currentSlug)

  const currentCategoryData = advantagesCategories[currentCategory] || { title: '', cards: [] }
  const currentImage = advantagesImages[currentCategory] || ''

  // Performance Optimization: Memoize the heavy Framer Motion character spans
  // so they don't re-render and cause lag when interacting with cards (expandedCardIndex changes).
  const desktopAnimatedTitle = React.useMemo(() => {
    return currentCategoryData.title.split('').map((char, index) => (
      <motion.span
        key={index}
        style={{ display: 'inline-block', whiteSpace: 'pre' }}
        variants={{
          initial: { y: 0 },
          animate: {
            y: [0, -12, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
          }
        }}
      >
        {char}
      </motion.span>
    ))
  }, [currentCategoryData.title])

  const mobileAnimatedTitle = React.useMemo(() => {
    return currentCategoryData.title.split('').map((char, index) => (
      <motion.span
        key={index}
        style={{ display: 'inline-block', whiteSpace: 'pre' }}
        variants={{
          initial: { y: 0 },
          animate: {
            y: [0, -8, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
          }
        }}
      >
        {char}
      </motion.span>
    ))
  }, [currentCategoryData.title])

  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const [dynamicTitleSize, setDynamicTitleSize] = React.useState(96)

  React.useEffect(() => {
    const el = titleRef.current
    if (!el) return

    const adjustSize = () => {
      let size = 96
      el.style.fontSize = `${(size / DESIGN_WIDTH) * 100}vw`
      
      let loopCount = 0
      while (loopCount < 30) {
        const fontSizePx = (size / DESIGN_WIDTH) * window.innerWidth
        const lineHeightPx = fontSizePx * (101 / 96)
        
        // If actual height exceeds ~3.2 times the current line height,
        // it means the text has wrapped to 4 or more lines.
        if (el.clientHeight > lineHeightPx * 3.2 && size > 24) {
          size -= 2
          el.style.fontSize = `${(size / DESIGN_WIDTH) * 100}vw`
          loopCount++
        } else {
          break
        }
      }
      setDynamicTitleSize(size)
    }

    const timer = setTimeout(adjustSize, 50)
    window.addEventListener("resize", adjustSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", adjustSize)
    }
  }, [advantagesTitle])

  // Drag and Wheel Scroll Refs
  const listRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)
  const startY = React.useRef(0)
  const scrollTop = React.useRef(0)

  // Prevent Lenis page scroll bubbling to enable smooth internal mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  // Mouse Drag Scroll Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!listRef.current) return
    isDragging.current = true
    startY.current = e.pageY - listRef.current.offsetTop
    scrollTop.current = listRef.current.scrollTop
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !listRef.current) return
    e.preventDefault()
    const y = e.pageY - listRef.current.offsetTop
    const walk = (y - startY.current) * 2 // Double scroll speed
    listRef.current.scrollTop = scrollTop.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDragging.current = false
  }

  const goToPrevCategory = () => {
    setCurrentCategory((prev) => (prev > 0 ? prev - 1 : advantagesCategories.length - 1))
    setExpandedCardIndex(0)
  }

  const goToNextCategory = () => {
    setCurrentCategory((prev) => (prev < advantagesCategories.length - 1 ? prev + 1 : 0))
    setExpandedCardIndex(0)
  }

  return (
    <div className={cn("w-full", className)} style={{ '--series-dark': colorCfg.dark, '--series-light-bg': colorCfg.lightBg } as React.CSSProperties}>
      {/* ===== DESKTOP LAYOUT (lg and above, pristine absolute positioning + scrollable right side) ===== */}
      <div className="hidden lg:block w-full">
        <section
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${colorCfg.rgba} 0%, ${colorCfg.rgbaTransparent} 100%)`,
            }}
          />

          {/* Advantages Title (behind image) */}
          <motion.h3
            ref={titleRef}
            className="absolute font-josefin-sans font-bold break-words whitespace-pre-wrap"
            style={{
              left: `${(153 / DESIGN_WIDTH) * 100}%`,
              top: `${(221 / DESIGN_HEIGHT) * 100}%`,
              width: `${(717 / DESIGN_WIDTH) * 100}%`,
              fontSize: `${(dynamicTitleSize / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${101 / 96}`,
              color: colorCfg.dark,
              willChange: "transform",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            initial={{ y: 0, z: 0 }}
            animate={{ y: [0, -15, 0], z: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {advantagesTitle}
          </motion.h3>

          {/* Advantages Main Image (overlaps title) */}
          {currentImage && (
            <motion.div
              className="absolute overflow-hidden shadow-2xl"
              style={{
                left: `${(468 / DESIGN_WIDTH) * 100}%`,
                top: `${(150 / DESIGN_HEIGHT) * 100}%`,
                width: `${(518 / DESIGN_WIDTH) * 100}vw`,
                height: `${(605 / DESIGN_WIDTH) * 100}vw`,
                borderRadius: `${(60 / DESIGN_WIDTH) * 100}vw`,
                willChange: "transform",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
                WebkitTransformStyle: "preserve-3d",
                transformStyle: "preserve-3d",
              }}
              initial={{ y: 0, z: 0 }}
              animate={{ y: [0, -15, 0], z: 0 }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <OptimizedImage image={currentImage} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
              {/* White title overlay on image */}
              <div
                className="absolute font-josefin-sans font-bold text-white pointer-events-none break-words whitespace-pre-wrap"
                style={{
                  left: `${((153 - 468) / 518) * 100}%`,
                  top: `${((221 - 150) / 605) * 100}%`,
                  width: `${(717 / 518) * 100}%`,
                  fontSize: `${(dynamicTitleSize / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: `${101 / 96}`,
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              >
                {advantagesTitle}
              </div>
            </motion.div>
          )}

          {/* Category Navigation Buttons (LEFT/RIGHT capsule style below image) */}
          {(() => {
            const NAV_BUTTON_LEFT_X = 153
            const NAV_BUTTON_LEFT_Y = 634
            const NAV_BUTTON_RIGHT_X = 360
            const NAV_BUTTON_RIGHT_Y = 564
            const NAV_BUTTON_WIDTH = 148
            const NAV_BUTTON_HEIGHT = 61

            return (
              <>
                <button
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(NAV_BUTTON_LEFT_X / DESIGN_WIDTH) * 100}%`,
                    top: `${(NAV_BUTTON_LEFT_Y / DESIGN_HEIGHT) * 100}%`,
                    width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
                    height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
                  }}
                  onClick={goToPrevCategory}
                >
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
                    viewBox="0 0 148 61"
                    fill="none"
                  >
                    <path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill={colorCfg.dark} />
                    <rect x="1" y="1" width="146" height="59" rx="29.5" stroke={colorCfg.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
                  </svg>
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 146 58"
                    fill="none"
                  >
                    <path d="M29 0C12.9837 1.35295e-06 0 12.9837 0 29C0 45.0163 12.9837 58 29 58H117C133.016 58 146 45.0163 146 29C146 12.9837 133.016 1.77172e-07 117 0H29ZM42.422 27.2812H125.423V31.7676H42.422V36.2539L19.99 29.5244L42.422 22.7949V27.2812Z" fill={colorCfg.dark} />
                  </svg>
                </button>

                <button
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(NAV_BUTTON_RIGHT_X / DESIGN_WIDTH) * 100}%`,
                    top: `${(NAV_BUTTON_RIGHT_Y / DESIGN_HEIGHT) * 100}%`,
                    width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
                    height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
                  }}
                  onClick={goToNextCategory}
                >
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
                    viewBox="0 0 148 61"
                    fill="none"
                  >
                    <path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill={colorCfg.dark} />
                    <rect x="1" y="1" width="146" height="59" rx="29.5" stroke={colorCfg.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
                  </svg>
                  <svg
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 146 58"
                    fill="none"
                  >
                    <path d="M117 0C133.016 1.35295e-06 146 12.9837 146 29C146 45.0163 133.016 58 117 58H29C12.9837 58 0 45.0163 0 29C0 12.9837 12.9837 1.77172e-07 29 0H117ZM103.578 27.2812H20.5771V31.7676H103.578V36.2539L126.01 29.5244L103.578 22.7949V27.2812Z" fill={colorCfg.dark} />
                  </svg>
                </button>
              </>
            )
          })()}

          {/* ===== Desktop Right Side Container (Category Title + Scrollable Cards List) ===== */}
          <div
            className="absolute flex flex-col"
            style={{
              left: `${(1076 / DESIGN_WIDTH) * 100}%`,
              top: `${(174 / DESIGN_HEIGHT) * 100}%`,
              width: `${(681 / DESIGN_WIDTH) * 100}vw`,
              height: `${(650 / DESIGN_HEIGHT) * 100}%`,
            }}
          >
            {/* Category Title (Elegant horizontal scroll with jumping characters) */}
            <div
              className="w-full overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pointer-events-auto cursor-grab active:cursor-grabbing mb-6 px-2"
              data-lenis-prevent
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <motion.h4
                key={currentCategoryData.title}
                className="font-jomhuria font-bold whitespace-nowrap px-4 w-max"
                style={{
                  fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: 0.95,
                  color: colorCfg.dark,
                  paddingBottom: '0.1em',
                }}
                initial="initial"
                animate="animate"
                variants={{
                  animate: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {desktopAnimatedTitle}
              </motion.h4>
            </div>

            {/* Scrollable Cards List Container (Supports Wheel & Drag Scroll, absolutely hidden scrollbar to prevent transition flash) */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 scrollbar-none [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                overscrollBehavior: 'contain',
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {currentCategoryData.cards.map((card, index) => {
                const isExpanded = expandedCardIndex === index

                return (
                  <div
                    key={`desktop-card-${currentCategory}-${index}`}
                    className={cn(
                      "w-full cursor-pointer transition-all duration-500 ease-out flex flex-col justify-center px-8 relative flex-shrink-0",
                    )}
                    style={{
                      minHeight: isExpanded ? `${(208 / DESIGN_WIDTH) * 100}vw` : `${(105 / DESIGN_WIDTH) * 100}vw`,
                      borderRadius: `${(38 / DESIGN_WIDTH) * 100}vw`,
                      paddingTop: `${(24 / DESIGN_WIDTH) * 100}vw`,
                      paddingBottom: `${(24 / DESIGN_WIDTH) * 100}vw`,
                      border: `2px solid ${colorCfg.dark}`,
                      backgroundColor: isExpanded ? colorCfg.lightBg : 'transparent',
                    }}
                    onClick={() => setExpandedCardIndex(index)}
                  >
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span
                        className="font-inter font-bold flex-1 leading-snug"
                        style={{
                          fontSize: `${(28 / DESIGN_WIDTH) * 100}vw`,
                          color: colorCfg.dark,
                        }}
                      >
                        {card.title}
                      </span>
                      <div
                        className="transition-transform duration-300 flex-shrink-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${isExpanded ? '180deg' : '0deg'})`,
                          width: `${(52 / DESIGN_WIDTH) * 100}vw`,
                          height: `${(52 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
                          <path d="M32 16C32 7.16344 24.8366 3.13124e-07 16 6.99382e-07C7.16344 1.08564e-06 -1.08564e-06 7.16345 -6.99382e-07 16C-3.13124e-07 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16ZM21.4863 19L16.2041 13.75L10.9229 19L10 18.1055L16.2041 11.8613L22.4082 18.1055L21.4863 19Z" fill={colorCfg.dark} />
                        </svg>
                      </div>
                    </div>

                    {isExpanded && card.content && (
                      <div
                        className="font-inter mt-4 border-t pt-4 leading-relaxed animate-fadeIn"
                        style={{
                          fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
                          color: colorCfg.dark,
                          borderTopColor: `${colorCfg.dark}33`,
                        }}
                      >
                        {card.content}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== MOBILE LAYOUT (below lg, premium flowing flex layout) ===== */}
      <div
        className="block lg:hidden w-full relative overflow-hidden py-12 px-4"
        style={{ background: `linear-gradient(180deg, ${colorCfg.rgba} 0%, ${colorCfg.rgbaTransparent} 100%)` }}
      >
        {/* Mobile Main Title */}
        <h3 className="font-josefin-sans font-bold text-center text-3xl sm:text-4xl mb-8" style={{ color: colorCfg.dark }}>
          {advantagesTitle}
        </h3>

        {/* Mobile Main Image with Levitation */}
        {currentImage && (
          <motion.div
            className="relative w-full max-w-md mx-auto aspect-[5/6] rounded-3xl overflow-hidden shadow-2xl mb-10 border-4 border-white"
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <OptimizedImage image={currentImage} alt="" size="medium" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Mobile Category Navigation Bar */}
        <div
          className="w-full max-w-xl mx-auto my-8 border-2 rounded-[2rem] p-2 flex items-center justify-between gap-3 shadow-lg"
          style={{ borderColor: colorCfg.dark, backgroundColor: colorCfg.lightBg }}
        >
          <button
            className="w-12 h-12 rounded-full text-white flex items-center justify-center active:scale-95 transition-all shadow-md flex-shrink-0"
            style={{ backgroundColor: colorCfg.dark }}
            onClick={goToPrevCategory}
            aria-label="Previous Category"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div
            className="flex-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pointer-events-auto mx-2"
            data-lenis-prevent
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <motion.h4 
              key={currentCategoryData.title}
              className="font-jomhuria text-4xl sm:text-5xl font-bold text-black py-1 select-none text-center leading-none whitespace-nowrap w-max mx-auto px-4"
              initial="initial"
              animate="animate"
              variants={{
                animate: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {mobileAnimatedTitle}
            </motion.h4>
          </div>

          <button
            className="w-12 h-12 rounded-full text-white flex items-center justify-center active:scale-95 transition-all shadow-md flex-shrink-0"
            style={{ backgroundColor: colorCfg.dark }}
            onClick={goToNextCategory}
            aria-label="Next Category"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Mobile Expandable Cards Accordion */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          {currentCategoryData.cards.map((card, index) => {
            const isExpanded = expandedCardIndex === index

            return (
              <div
                key={`mobile-card-${currentCategory}-${index}`}
                className={cn(
                  "w-full cursor-pointer border-2 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-md",
                )}
                style={{
                  borderColor: colorCfg.dark,
                  backgroundColor: isExpanded ? colorCfg.lightBg : 'rgba(255, 255, 255, 0.8)',
                }}
                onClick={() => setExpandedCardIndex(index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-inter font-bold text-lg sm:text-xl flex-1 leading-snug" style={{ color: colorCfg.dark }}>
                    {card.title}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform duration-300 flex-shrink-0",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}
                    style={{ backgroundColor: colorCfg.dark }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                      <path d="M21.4863 19L16.2041 13.75L10.9229 19L10 18.1055L16.2041 11.8613L22.4082 18.1055L21.4863 19Z" fill="white" />
                    </svg>
                  </div>
                </div>

                {isExpanded && card.content && (
                  <div className="mt-4 pt-4 border-t font-inter text-sm sm:text-base leading-relaxed animate-fadeIn" style={{ borderTopColor: `${colorCfg.dark}33`, color: colorCfg.dark }}>
                    {card.content}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProductAdvantages
