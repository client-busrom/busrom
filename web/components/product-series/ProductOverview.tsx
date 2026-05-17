"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { ProductOverviewData } from "@/lib/content-parser"

/**
 * Figma Design Specs (1920x968):
 *
 * Background: Light beige/cream (#F6F4ED)
 * Decorative circle: x:544, y:312, 177x177, #F7F1DB
 *
 * Title (left side):
 * - Main title: x:157, y:200, 96px, Josefin Sans Bold, #706933
 * - Subtitle: x:157, y:415, 48px, Josefin Sans SemiBold, black
 *
 * Description:
 * - Brand name (bold): 32px, orange #FFAA2B
 * - Content: 24px, black, line-height 32px
 * - x:157, y:623, width 581px
 *
 * Images (right side, stacked):
 * - 4 background images at various positions
 * - Main white card: x:1322, y:442, 523x540, rounded-30, shadow
 * - Circle image inside: x:1343, y:485, 472x472
 *
 * CTA Button:
 * - x:1464, y:150, circle border 104x104 + dot + text
 * - Border: #756F3F, Dot: #FFCC4A, Text: #756F3F
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

// Mobile breakpoint
const MOBILE_BREAKPOINT = 1024

interface ProductOverviewProps {
  data: ProductOverviewData
  className?: string
}

// Image position configurations with z-index based on Figma layer order (demo-1.pen specs)
// Coordinates are absolute relative to DESIGN_WIDTH (1920) and DESIGN_HEIGHT (922)
const IMAGE_POSITIONS = {
  // Main position (layer1, white card with circle image) - z-index 5
  main: { x: 1399, y: 367, w: 420, h: 434, isMain: true, zIndex: 5, innerW: 379, innerH: 379 },
  // Background positions with their z-index from Figma
  bg: [
    { x: 1023, y: 486, w: 272, h: 268, zIndex: 4, innerW: 268, innerH: 268 },  // layer2
    { x: 1241, y: 215, w: 460, h: 480, zIndex: 3, innerW: 402, innerH: 399 },  // layer3
    { x: 1083, y: 132, w: 420, h: 380, zIndex: 2, innerW: 350, innerH: 351, opacity: 0.8 }, // layer4
    { x: 1743, y: 66, w: 205, h: 244, zIndex: 1, innerW: 206, innerH: 206 },   // layer5
  ],
}

export function ProductOverview({ data, className }: ProductOverviewProps) {
  if (!data) return null

  const { titleLines = [], subtitleLines = [], brandName = '', description = '', images = [], ctaButton } = data

  // 安全提取图片 URL 字符串，防止传入 Object 导致 React 运行时渲染崩溃及 DOM 卸载
  const getImageUrl = (img: any): string => {
    if (!img) return ''
    if (typeof img === 'string') return img
    return img?.file?.url || img?.fileUrl || img?.url || ''
  }

  // Track which image index is at which position (for desktop)
  // positions[positionIndex] = imageIndex
  // Position 0 = main, Position 1-4 = bg positions
  const [positions, setPositions] = React.useState<number[]>(() =>
    images.slice(0, 5).map((_, i) => i)
  )

  // 记录当前鼠标悬浮在哪个位置索引的卡片上（positionIndex: 0代表main，1-4代表bg[0]-bg[3]）
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // 移动端专属横向轮播当前激活索引
  const [mobileActiveIndex, setMobileActiveIndex] = React.useState(0)
  const mobileImages = images.slice(0, 5)

  // Embla Carousel 初始化 (支持循环与丝滑原生惯性滑动)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" })

  React.useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setMobileActiveIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)
    onSelect() // 初始化同步

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  // Handle clicking on an image - swap with main position (for desktop)
  const handleImageClick = (positionIndex: number) => {
    if (positionIndex === 0) return // Already main, do nothing

    setPositions(prev => {
      const newPositions = [...prev]
      const temp = newPositions[0]
      newPositions[0] = newPositions[positionIndex]
      newPositions[positionIndex] = temp
      return newPositions
    })
  }

  // Get position style for each image based on its current position index (for desktop)
  const getPositionStyle = (positionIndex: number): { x: number; y: number; w: number; h: number; zIndex: number; innerW: number; innerH: number; opacity?: number; isMain?: boolean } => {
    if (positionIndex === 0) {
      return IMAGE_POSITIONS.main
    }
    return IMAGE_POSITIONS.bg[positionIndex - 1] || IMAGE_POSITIONS.bg[0]
  }

  return (
    <>
      {/* Mobile Layout */}
      <section className={cn("lg:hidden relative w-full bg-[#F6F4ED] px-6 py-12", className)}>
        <div className="w-full max-w-3xl mx-auto">
          {/* Horizontal Carousel (Mobile) - 置顶 Top 0 */}
          {mobileImages.length > 0 && (
            <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl mb-8 bg-white">
              {/* 极其强壮的 1:1 物理占位容器（Padding-Bottom 100% 撑高法，绝对不会塌陷！） */}
              <div className="relative w-full h-0 pb-[100%] overflow-hidden bg-[#F7F1DB]/30" ref={emblaRef}>
                <div className="absolute inset-0 flex touch-pan-y">
                  {mobileImages.map((imgObj, idx) => (
                    <div key={idx} className="relative flex-[0_0_100%] h-full min-w-0">
                      <OptimizedImage
                        image={imgObj}
                        alt=""
                        size="medium"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        containerClassName="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 精美胶囊点指示器 Dots */}
              {mobileImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 z-20 bg-gradient-to-t from-black/40 via-black/20 to-transparent py-3">
                  {mobileImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollTo(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300 shadow-md",
                        mobileActiveIndex === idx ? "w-6 bg-[#FFAA2B]" : "w-2 bg-white/80 hover:bg-white"
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className="font-josefin-sans font-bold text-[#706933] text-3xl leading-tight mb-4">
            {titleLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h2>

          {/* Subtitle */}
          <h3 className="font-josefin-sans font-semibold text-black text-xl mb-6">
            {subtitleLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < subtitleLines.length - 1 && <br />}
              </span>
            ))}
          </h3>

          {/* Description */}
          <p className="font-josefin-sans text-base leading-relaxed mb-8">
            <span className="text-[#FFAA2B] font-bold text-lg">{brandName}</span>
            <span className="text-black">{description}</span>
          </p>

          {/* CTA Button - Mobile */}
          {ctaButton && (
            <Link
              href={ctaButton.url}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 border-2 border-[#756F3F] rounded-full font-anaheim font-medium text-[#756F3F] hover:bg-[#756F3F] hover:text-white transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-[#FFCC4A]" />
              {ctaButton.text}
            </Link>
          )}
        </div>
      </section>

      {/* Desktop Layout */}
      <section
        className={cn("hidden lg:block relative w-full bg-[#F6F4ED] overflow-hidden", className)}
        style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      >
      {/* Decorative background circle - bouncing animation */}
      <div
        className="absolute rounded-full bg-[#F7F1DB]"
        style={{
          left: `${(544 / DESIGN_WIDTH) * 100}%`,
          top: `${(312 / DESIGN_HEIGHT) * 100}%`,
          width: `${(177 / DESIGN_WIDTH) * 100}vw`,
          height: `${(177 / DESIGN_WIDTH) * 100}vw`,
          animation: 'bounceAround 20s linear infinite',
        }}
      />

      {/* Left Content - using absolute positioning for each element */}
      {/* Main Title (96px, olive green) - y:134 relative to section */}
      <h2
        className="absolute font-josefin-sans font-bold text-[#706933]"
        style={{
          left: `${(180 / DESIGN_WIDTH) * 100}%`,
          top: `${(134 / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${101 / 96}`,
        }}
      >
        {titleLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < titleLines.length - 1 && <br />}
          </span>
        ))}
      </h2>

      {/* Subtitle (48px, black) - y:349 relative to section */}
      <h3
        className="absolute font-josefin-sans font-semibold text-black"
        style={{
          left: `${(180 / DESIGN_WIDTH) * 100}%`,
          top: `${(349 / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(48 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${57 / 48}`,
        }}
      >
        {subtitleLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < subtitleLines.length - 1 && <br />}
          </span>
        ))}
      </h3>

      {/* Description - y:526 relative to section */}
      <div
        className="absolute"
        style={{
          left: `${(180 / DESIGN_WIDTH) * 100}%`,
          top: `${(526 / DESIGN_HEIGHT) * 100}%`,
          width: `${(581 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        <p
          className="font-josefin-sans"
          style={{
            lineHeight: `${32 / 24}`,
          }}
        >
          <span
            className="text-[#FFAA2B] font-bold"
            style={{
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${32 / 32}`,
            }}
          >
            {brandName}
          </span>
          <span
            className="text-black font-normal"
            style={{
              fontSize: `${(24 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {description}
          </span>
        </p>
      </div>

      {/* Right Side - Stacked Images with Framer Motion Spring Repulsion Engine */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* All images - each tracks its own position and animates between positions */}
        {images.slice(0, 5).map((img, imageIndex) => {
          if (!img) return null

          // Find which position this image is currently at
          const positionIndex = positions.indexOf(imageIndex)
          if (positionIndex === -1) return null

          const isMain = positionIndex === 0
          const pos = getPositionStyle(positionIndex)
          const isHovered = hoveredIndex === positionIndex

          // 计算 Framer Motion 的动态推开与位置飞行双重动效属性 (animate)
          const animateProps: {
            left: string
            top: string
            width: string
            height: string
            x: string
            y: string
            scale: number
            rotate: number
            zIndex: number
            opacity: number
          } = {
            left: `${(pos.x / DESIGN_WIDTH) * 100}%`,
            top: `${(pos.y / DESIGN_HEIGHT) * 100}%`,
            width: `${(pos.w / DESIGN_WIDTH) * 100}vw`,
            height: `${(pos.h / DESIGN_WIDTH) * 100}vw`,
            x: "0vw",
            y: "0vw",
            scale: 1,
            rotate: 0,
            zIndex: pos.zIndex,
            opacity: pos.opacity || 1,
          }

          if (hoveredIndex !== null) {
            if (isHovered) {
              // 当前正在悬浮的卡片：放大浮出，置于顶层预览
              animateProps.scale = 1.08
              animateProps.zIndex = 30
              animateProps.opacity = 1
            } else if (isMain) {
              // 主卡片：极其丝滑地向左上方避让推开
              animateProps.x = "-8vw"
              animateProps.y = "-4vw"
              animateProps.scale = 0.95
              animateProps.rotate = -3
              animateProps.opacity = 0.9
            } else {
              // 其他背景卡片：根据各自位置向外侧水波纹散开
              if (positionIndex === 1) {
                // bg[0] (layer2) -> 向左下方推开
                animateProps.x = "-4vw"
                animateProps.y = "4vw"
                animateProps.rotate = -2
              } else if (positionIndex === 2) {
                // bg[1] (layer3) -> 向右上方推开
                animateProps.x = "5vw"
                animateProps.y = "-3vw"
                animateProps.rotate = 3
              } else if (positionIndex === 3) {
                // bg[2] (layer4) -> 向左上方推开
                animateProps.x = "-5vw"
                animateProps.y = "-5vw"
                animateProps.rotate = -4
              } else if (positionIndex === 4) {
                // bg[3] (layer5) -> 向右侧推开
                animateProps.x = "6vw"
                animateProps.y = "2vw"
                animateProps.rotate = 4
              }
            }
          }

          const springTransition = { type: "spring", stiffness: 120, damping: 15, mass: 1 } as const

          if (isMain) {
            // Render as main card with white background and inner circle image
            return (
              <motion.div
                key={`img-${imageIndex}`}
                className="absolute bg-white rounded-[30px] shadow-2xl pointer-events-auto flex items-center justify-center overflow-hidden cursor-pointer"
                style={{ boxShadow: '0 4px 60px rgba(0, 0, 0, 0.25)' }}
                animate={animateProps}
                transition={springTransition}
                onHoverStart={() => setHoveredIndex(0)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <motion.div 
                  className="relative rounded-[20px] overflow-hidden"
                  animate={{
                    width: `${(pos.innerW / DESIGN_WIDTH) * 100}vw`,
                    height: `${(pos.innerH / DESIGN_WIDTH) * 100}vw`,
                  }}
                  transition={springTransition}
                >
                  <OptimizedImage
                    image={img}
                    alt=""
                    size="medium"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            )
          }

          // Render as background image card with white background and inner circle image
          return (
            <motion.div
              key={`img-${imageIndex}`}
              className="absolute bg-white/90 rounded-[30px] cursor-pointer pointer-events-auto flex items-center justify-center shadow-lg overflow-hidden"
              animate={animateProps}
              transition={springTransition}
              onHoverStart={() => setHoveredIndex(positionIndex)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => handleImageClick(positionIndex)}
            >
              <motion.div 
                className="relative rounded-[20px] overflow-hidden"
                animate={{
                  width: `${(pos.innerW / DESIGN_WIDTH) * 100}vw`,
                  height: `${(pos.innerH / DESIGN_WIDTH) * 100}vw`,
                }}
                transition={springTransition}
              >
                <OptimizedImage
                  image={img}
                  alt=""
                  size="small"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* CTA Button - Get A Solution */}
      {ctaButton && (() => {
        const circleSize = (70 / DESIGN_WIDTH) * 100
        const dotSize = (12 / DESIGN_WIDTH) * 100
        const fontSize = (24 / DESIGN_WIDTH) * 100
        const dotGap = (8 / DESIGN_WIDTH) * 100 // 文字距离黄点的间距
        // 文字起始位置 = 圆心位置 + 黄点半径 + 间距 = circleSize/2 + dotSize/2 + dotGap
        const textMarginLeft = circleSize / 2 + dotSize / 2 + dotGap

        return (
          <Link
            href={ctaButton.url}
            className="absolute flex items-center group pointer-events-auto"
            style={{
              left: `${(1529 / DESIGN_WIDTH) * 100}%`,
              top: `${(120 / DESIGN_HEIGHT) * 100}%`,
              zIndex: 20,
            }}
          >
            {/* Circle border - visible in default state, hidden on hover */}
            <div
              className="relative border-2 border-[#756F3F] transition-all duration-500 ease-out group-hover:opacity-0"
              style={{
                width: `${circleSize}vw`,
                height: `${circleSize}vw`,
                borderRadius: `${circleSize / 2}vw`,
              }}
            >
              {/* Orbit container - rotates around center */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: 'orbitSpin 4s linear infinite',
                }}
              >
                {/* Radius container - moves dot from center to edge */}
                <div
                  style={{
                    animation: 'orbitRadius 4s ease-in-out infinite',
                  }}
                >
                  {/* Yellow dot */}
                  <div
                    className="rounded-full bg-[#FFCC4A]"
                    style={{
                      width: `${dotSize}vw`,
                      height: `${dotSize}vw`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Text - positioned 8px right of the yellow dot (at center), breathing effect */}
            <span
              className="absolute font-anaheim font-medium text-[#756F3F] whitespace-nowrap transition-all duration-500 group-hover:opacity-0 cta-text-breathe"
              style={{
                fontSize: `${fontSize}vw`,
                left: `${textMarginLeft}vw`,
                animation: 'breathe 2s ease-in-out infinite',
              }}
            >
              {ctaButton.text}
            </span>

            {/* Hover state: expanding capsule from left edge */}
            <div
              className="absolute left-0 top-0 border-2 border-[#756F3F] bg-[#756F3F] transition-all duration-500 ease-out pointer-events-none opacity-0 group-hover:opacity-100 flex items-center cta-capsule-breathe"
              style={{
                height: `${circleSize}vw`,
                borderRadius: `${circleSize / 2}vw`,
                paddingLeft: `${textMarginLeft}vw`,
                paddingRight: `${circleSize / 2}vw`,
              }}
            >
              <span
                className="font-anaheim font-medium text-white whitespace-nowrap"
                style={{
                  fontSize: `${fontSize}vw`,
                }}
              >
                {ctaButton.text}
              </span>
            </div>
          </Link>
        )
      })()}

      </section>
    </>
  )
}

export default ProductOverview
