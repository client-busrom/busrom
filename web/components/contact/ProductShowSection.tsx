"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"

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
  buttonText = "view more",
}: ProductShowSectionProps) {
  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 当前选中的索引
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // 切换到上一个
  const scrollPrev = useCallback(() => {
    if (isAnimating || items.length <= 1) return
    setIsAnimating(true)
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, items.length])

  // 切换到下一个
  const scrollNext = useCallback(() => {
    if (isAnimating || items.length <= 1) return
    setIsAnimating(true)
    setSelectedIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, items.length])

  // 跳转到指定索引
  const scrollTo = useCallback((index: number) => {
    if (isAnimating || index === selectedIndex) return
    setIsAnimating(true)
    setSelectedIndex(index)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, selectedIndex])

  // 自动轮播
  useEffect(() => {
    if (items.length <= 1) return

    autoplayRef.current = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [items.length])

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
        aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
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
      {visibleItems.map(({ item, position, index }) => {
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

      {/* 左侧箭头按钮 */}
      {items.length > 1 && (
        <button
          onClick={scrollPrev}
          className="absolute flex items-center justify-center cursor-pointer group"
          style={{
            left: vw(153),
            top: vw(163),
            width: vw(83),
            height: vw(82),
          }}
        >
          <div
            className="absolute inset-0 rounded-full transition-colors"
            style={{ backgroundColor: "#FFF49B" }}
          />
          <ChevronLeft
            className="relative z-10"
            style={{
              width: vw(32),
              height: vw(32),
              color: "#333",
            }}
            strokeWidth={2.5}
          />
        </button>
      )}

      {/* 右侧箭头按钮 */}
      {items.length > 1 && (
        <button
          onClick={scrollNext}
          className="absolute flex items-center justify-center cursor-pointer group"
          style={{
            left: vw(1674),
            top: vw(163),
            width: vw(83),
            height: vw(82),
          }}
        >
          <div
            className="absolute inset-0 rounded-full transition-colors"
            style={{ backgroundColor: "#FFF49B" }}
          />
          <ChevronRight
            className="relative z-10"
            style={{
              width: vw(32),
              height: vw(32),
              color: "#333",
            }}
            strokeWidth={2.5}
          />
        </button>
      )}

      {/* 产品名称/分类名称 - 显示中心项的标题 */}
      {centerItem && (centerItem.showName !== false || centerItem.showCategory) && (
        <h3
          className="absolute font-josefin-sans font-bold text-white text-center transition-opacity duration-300"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            top: vw(572),
            fontSize: vw(30),
            lineHeight: vw(38),
            zIndex: 50,
          }}
        >
          {centerItem.showName ? centerItem.title : (centerItem.categoryName || centerItem.title)}
        </h3>
      )}

      {/* Highlights - 随机显示亮点 */}
      {centerItem && centerItem.showHighlights && centerItem.displayHighlights?.length > 0 && (
        <div 
          className="absolute flex flex-wrap justify-center gap-4 transition-opacity duration-300"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            top: vw(630),
            width: vw(800),
          }}
        >
          {centerItem.displayHighlights.map((highlight: any, idx: number) => (
            <div 
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <div className="w-2 h-2 rounded-full bg-[#FFF49B]" />
              <span className="text-white font-josefin-sans text-sm md:text-base">
                {highlight.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* View More 按钮 - 链接到中间卡片 */}
      {centerItem && centerItem.showButton !== false && (
        <div
          className="absolute flex justify-center"
          style={{
            left: 0,
            right: 0,
            top: vw(711),
          }}
        >
          <Link
            href={centerItem.link || "#"}
            className="relative flex items-center justify-center group animate-pulse-scale"
            style={{
              width: vw(375),
              height: vw(92),
              borderRadius: vw(62.5),
              border: "1px solid #FFF077",
              transition: "all 0.3s ease",
            }}
          >
          {/* 悬停时的背景 */}
          <div
            className="absolute inset-0 rounded-full bg-[#FFF077] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ borderRadius: vw(62.5) }}
          />
          {/* 文字区域 - 占据除 icon 外的剩余空间并居中 */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: `calc(100% - ${vw(92)})`,
              height: "100%",
            }}
          >
            <span
              className="font-josefin-sans font-medium text-[#FFF077] group-hover:text-[#333] transition-colors duration-300"
              style={{
                fontSize: vw(32),
                lineHeight: vw(30),
              }}
            >
              {centerItem.buttonText || buttonText}
            </span>
          </div>
          {/* 圆形箭头图标 */}
          <svg
            className="relative z-10 flex-shrink-0"
            style={{
              width: vw(92),
              height: vw(92),
            }}
            viewBox="0 0 92 92"
            fill="none"
          >
            <path
              d="M25.4901 13.4437C43.4151 2.17188 67.0838 7.56529 78.3557 25.4902C89.6276 43.4152 84.2342 67.0838 66.3093 78.3557C48.3843 89.6277 24.7156 84.2343 13.4437 66.3093C2.17191 48.3843 7.56519 24.7156 25.4901 13.4437ZM57.0151 35.2466L56.9818 35.243L41.9885 34.01C41.007 33.9294 40.147 34.6599 40.0672 35.6415L40.0645 35.6709C40.0018 36.6403 40.7283 37.4859 41.7 37.566L52.6899 38.4697L34.3515 54.0394C33.7252 54.5712 33.6486 55.511 34.1808 56.1379L34.3158 56.2969C34.851 56.9063 35.7774 56.9761 36.3974 56.4497L54.7368 40.8802L53.8459 51.871C53.7663 52.8527 54.4973 53.7138 55.4788 53.7946C56.4605 53.8754 57.3213 53.1451 57.401 52.1633L58.6167 37.167L58.6189 37.1355C58.6255 37.0303 58.6226 36.9248 58.6106 36.8201L58.6077 36.7934L58.6076 36.7984C58.5859 36.4813 58.463 36.1792 58.2569 35.9372L58.1384 35.798L58.1234 35.7806C57.9244 35.5529 57.6609 35.3907 57.3676 35.3169L57.3553 35.3141C57.2444 35.2805 57.1304 35.2582 57.0151 35.2466Z"
              className="fill-[#FFF077] group-hover:fill-[#333] transition-colors duration-300"
            />
          </svg>
          </Link>
        </div>
      )}


      {/* 左下角圆形渐变阴影 - 在最上层 */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: vw(-100),
          bottom: vw(-76),
          width: vw(820),
          height: vw(626),
          zIndex: 20,
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

      {/* 右下角圆形渐变阴影 - 在最上层 */}
      <svg
        className="absolute pointer-events-none"
        style={{
          right: vw(-140),
          bottom: vw(0),
          width: vw(704),
          height: vw(698),
          zIndex: 20,
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
