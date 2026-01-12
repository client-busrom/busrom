"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

// 卡片尺寸 (从 Figma，缩小到 85%)
const SCALE = 0.85

// 三个位置的配置：前（最大）、中、后（最小）
const POSITIONS = [
  { width: 535 * SCALE, height: 668 * SCALE, radius: 60 * SCALE, x: 900, y: 180, zIndex: 3 },      // 前面 - 最大
  { width: 471 * SCALE, height: 587 * SCALE, radius: 60 * SCALE, x: 1157, y: 215, zIndex: 2 },    // 中间
  { width: 367 * SCALE, height: 457 * SCALE, radius: 60 * SCALE, x: 1381, y: 270, zIndex: 1 },    // 后面 - 最小
]

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
  cropFocalPoint?: { x: number; y: number } | null
}

export interface TypicalCollaborationItem {
  id: string | number
  title: string
  image: MediaObject | null
}

interface TypicalCollaborationSectionProps {
  sectionTitle?: string
  items?: TypicalCollaborationItem[]
}

export function TypicalCollaborationSection({
  sectionTitle = "Typical Collaboration",
  items = [],
}: TypicalCollaborationSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // vw 尺寸计算 - 返回数值用于动画
  const vwNum = (v: number) => (v / DESIGN_WIDTH) * 100
  const vw = (v: number) => `${vwNum(v)}vw`

  // 左箭头点击 - 上一个（反向切牌）
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
  }, [items.length])

  // 右箭头点击 - 下一个（正向切牌）
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
  }, [items.length])

  // 计算每个 item 在哪个位置显示（0=前面最大, 1=中间, 2=后面最小, -1=不显示）
  const getPositionForItem = (itemIndex: number) => {
    if (items.length === 0) return -1

    const diff = (itemIndex - currentIndex + items.length) % items.length
    if (diff < 3) return diff
    return -1 // 不在显示范围内
  }

  const currentItem = items[currentIndex]

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
      }}
    >
      {/* 标题 - Kaushan Script 手写风格，支持换行 */}
      <h2
        className="absolute font-kaushan-script"
        style={{
          left: vw(147),  // 142+5
          top: vw(167),   // 5769-5602
          width: vw(726), // Figma 标题宽度
          fontSize: vw(108), // 缩小到 108px
          lineHeight: vw(102),
          color: "#46403F",
        }}
      >
        {(currentItem?.title || sectionTitle).split("\n").map((line, i, arr) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </h2>

      {/* 左箭头 - 空心虚线边框 */}
      <button
        onClick={handlePrev}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(197),  // 192+5
          top: vw(677),   // 6279-5602
          width: vw(146),
          height: vw(59),
        }}
      >
        {/* 默认状态 - 虚线边框 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 148 61"
          fill="none"
        >
          <path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/>
          <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
        </svg>
        {/* 悬停状态 - 实心填充 #756F3F */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 148 61"
          fill="none"
        >
          <rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/>
          <path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="white"/>
        </svg>
      </button>

      {/* 右箭头 - 默认虚线边框 */}
      <button
        onClick={handleNext}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(421),  // 416+5
          top: vw(606),   // 6208-5602
          width: vw(146),
          height: vw(58),
        }}
      >
        {/* 默认状态 - 虚线边框 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 148 61"
          fill="none"
        >
          <path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/>
          <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
        </svg>
        {/* 悬停状态 - 实心填充 #756F3F */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 148 61"
          fill="none"
        >
          <rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/>
          <path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="white"/>
        </svg>
      </button>

      {/* 堆叠的图片卡片 - 切牌动画 */}
      <div className="absolute inset-0">
        {items.map((item, itemIndex) => {
          const position = getPositionForItem(itemIndex)
          if (position === -1 || !item?.image) return null

          const pos = POSITIONS[position]

          return (
            <motion.div
              key={item.id}
              className="absolute overflow-hidden bg-white"
              initial={false}
              animate={{
                left: `${vwNum(pos.x)}vw`,
                top: `${vwNum(pos.y)}vw`,
                width: `${vwNum(pos.width)}vw`,
                height: `${vwNum(pos.height)}vw`,
                borderRadius: `${vwNum(pos.radius)}vw`,
                zIndex: pos.zIndex,
                boxShadow: position === 0
                  ? "11px 10px 27.6px rgba(0, 0, 0, 0.47)"
                  : "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <OptimizedImage
                image={item.image as any}
                alt={item.title}
                size="large"
                className="w-full h-full object-cover"
                objectPosition={
                  item.image.cropFocalPoint
                    ? `${item.image.cropFocalPoint.x}% ${item.image.cropFocalPoint.y}%`
                    : "center"
                }
              />
            </motion.div>
          )
        })}
      </div>

      {/* 指示器点 */}
      {items.length > 1 && (
        <div
          className="absolute flex gap-2"
          style={{
            left: vw(156),
            bottom: vw(80),
          }}
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-brand-dark-olive"
                  : "bg-brand-cream-border"
              }`}
              style={{
                width: vw(12),
                height: vw(12),
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
