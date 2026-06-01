"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
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
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isChanging, setIsChanging] = useState(false)

  // vw 尺寸计算 - 返回数值用于动画
  const vwNum = (v: number) => (v / DESIGN_WIDTH) * 100
  const vw = (v: number) => `${vwNum(v)}vw`

  // 左箭头点击 - 上一个（反向切牌）
  const handlePrev = useCallback(() => {
    setIsChanging(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
      setTimeout(() => setIsChanging(false), 500)
    }, 150)
  }, [items.length])

  // 右箭头点击 - 下一个（正向切牌）
  const handleNext = useCallback(() => {
    setIsChanging(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
      setTimeout(() => setIsChanging(false), 500)
    }, 150)
  }, [items.length])

  // 计算每个 item 在哪个位置显示（0=前面最大, 1=中间, 2=后面最小, -1=不显示）
  const getPositionForItem = (itemIndex: number) => {
    if (items.length === 0) return -1

    const diff = (itemIndex - currentIndex + items.length) % items.length
    if (diff < 3) return diff
    return -1 // 不在显示范围内
  }

  // 移动端位置配置 (基于 375px) - 进一步压缩尺寸以适配小屏
  const MOBILE_POSITIONS = [
    { width: 220, height: 275, radius: 24, x: 25, y: 5, zIndex: 3 }, // 前
    { width: 190, height: 238, radius: 24, x: 65, y: 25, zIndex: 2 }, // 中
    { width: 160, height: 200, radius: 24, x: 95, y: 45, zIndex: 1 }, // 后
  ]

  const currentItem = items[currentIndex]

  // 通用的渲染卡片逻辑
  const renderCards = (isMobile: boolean) => {
    const config = isMobile ? MOBILE_POSITIONS : POSITIONS
    const vwBase = isMobile ? 375 : DESIGN_WIDTH
    const getVwNum = (v: number) => (v / vwBase) * 100

    return items.map((item, itemIndex) => {
      const position = getPositionForItem(itemIndex)
      if (position === -1 || !item?.image) return null

      const pos = config[position]
      const baseWidth = config[0].width
      const baseHeight = config[0].height
      const scale = pos.width / baseWidth

      return (
        <motion.div
          key={item.id}
          className="absolute overflow-hidden bg-white cursor-pointer"
          initial={false}
          animate={{
            x: `${getVwNum(pos.x)}vw`,
            y: `${getVwNum(pos.y + (pos.height / 2) - (baseHeight / 2))}vw`,
            width: `${getVwNum(baseWidth)}vw`,
            height: `${getVwNum(baseHeight)}vw`,
            scale: scale,
            borderRadius: `${getVwNum(config[0].radius)}vw`,
            zIndex: pos.zIndex,
            boxShadow: isChanging 
              ? "0 0 0 rgba(0, 0, 0, 0)" 
              : (position === 0
                  ? "11px 10px 27.6px rgba(0, 0, 0, 0.47)"
                  : "0 4px 12px rgba(0, 0, 0, 0.15)"),
          }}
          whileHover={!isMobile ? {
            y: `${getVwNum(pos.y + (pos.height / 2) - (baseHeight / 2) - 25)}vw`,
            scale: scale * 1.05,
            zIndex: 10,
            boxShadow: position === 0
              ? "15px 25px 45px rgba(0, 0, 0, 0.35)"
              : "0 15px 30px rgba(0, 0, 0, 0.25)",
          } : {}}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 26,
            mass: 1,
            boxShadow: { duration: 0.2 }
          }}
          style={{
            willChange: "transform",
            transformOrigin: "center center",
          }}
        >
          <OptimizedImage
            image={item.image as any}
            alt={item.title}
            size={isMobile ? "medium" : "large"}
            className="w-full h-full object-cover"
            objectPosition={
              item.image.cropFocalPoint
                ? `${item.image.cropFocalPoint.x}% ${item.image.cropFocalPoint.y}%`
                : "center"
            }
          />
        </motion.div>
      )
    })
  }

  // 通用的动态指示器逻辑 - 移动端增加左右按钮
  const renderIndicators = (isMobile: boolean) => (
    <div
      className={`absolute flex items-center justify-center z-20 ${isMobile ? 'gap-8' : 'gap-[8px] items-end'}`}
      style={isMobile ? {
        left: "0",
        width: "100%",
        bottom: "0"
      } : {
        left: vw(156),
        bottom: vw(80),
      }}
    >
      {/* 移动端：左按钮 */}
      {isMobile && (
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
          className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-secondary/20 active:bg-brand-secondary/10"
        >
          <svg className="w-4 h-4 rotate-180 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}

      {/* 动态指示器小球容器 */}
      <div className="flex items-end gap-[8px]">
        {items.map((_, index) => {
          const isActive = index === currentIndex
          const colors = ["#756F3F", "#DAC99E", "#F6F4ED"]
          const dotColor = colors[index % 3]
          const delays = [0, 0.3, 0.6]
          const delay = delays[index % 3]

          return (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              animate={{ 
                y: [0, -10, 0],
                scale: isActive ? 1.25 : 1,
              }}
              transition={{
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay },
                scale: { duration: 0.3 }
              }}
              className="rounded-full shadow-sm relative"
              style={{
                width: isMobile ? "10px" : vw(14),
                height: isMobile ? "10px" : vw(14),
                backgroundColor: dotColor,
                border: dotColor === "#F6F4ED" ? "1px solid rgba(0,0,0,0.1)" : "none",
                zIndex: isActive ? 10 : 1,
                boxShadow: isActive 
                  ? `0 0 ${isMobile ? 10 : vwNum(15)}px ${dotColor}66` 
                  : "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {isActive && (
                <motion.div 
                  layoutId={`active-dot-${isMobile ? 'mobile' : 'desktop'}`}
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* 移动端：右按钮 */}
      {isMobile && (
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }} 
          className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-secondary/20 active:bg-brand-secondary/10"
        >
          <svg className="w-4 h-4 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* 桌面端布局 */}
      <section
        className="hidden md:block relative w-full overflow-hidden"
        style={{
          aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
        }}
      >
        <h2
          className="absolute font-kaushan-script"
          style={{
            left: vw(147),
            top: vw(167),
            width: vw(726),
            fontSize: vw(108),
            lineHeight: vw(102),
            color: "#46403F",
          }}
        >
          {locale === "en" ? (
            (currentItem?.title || sectionTitle).split("\n").map((line, i) => (
              <span key={i} style={{ display: "block" }}>{line}</span>
            ))
          ) : (
            <span style={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}>
              {(currentItem?.title || sectionTitle).replace(/\n/g, " ")}
            </span>
          )}
        </h2>

        {/* 箭头控制 */}
        <button onClick={handlePrev} className="absolute cursor-pointer group z-10" style={{ left: vw(197), top: vw(677), width: vw(146), height: vw(59) }}>
          <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
          <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="white"/></svg>
        </button>
        <button onClick={handleNext} className="absolute cursor-pointer group z-10" style={{ left: vw(421), top: vw(606), width: vw(146), height: vw(58) }}>
          <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
          <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="white"/></svg>
        </button>

        <div className="absolute inset-0">{renderCards(false)}</div>
        {renderIndicators(false)}
      </section>

      {/* 移动端布局 */}
      <section className="block md:hidden w-full pb-20 overflow-hidden">
        <div className="px-6 flex flex-col gap-2">
          {/* 上部分：标题和指示器（带按钮） */}
          <div className="relative min-h-[90px] flex flex-col items-center justify-center">
            <h2 className="font-kaushan-script text-[36px] leading-tight text-brand-secondary text-center">
              {locale === "en" ? (
                (currentItem?.title || sectionTitle).split("\n").map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))
              ) : (
                <span className="block whitespace-normal break-words">
                  {(currentItem?.title || sectionTitle).replace(/\n/g, " ")}
                </span>
              )}
            </h2>
            <div className="mt-2 relative h-[45px] w-full">
              {renderIndicators(true)}
            </div>
          </div>

          {/* 中部分：切牌堆 */}
          <div className="relative w-full aspect-[1.35/1]">
            {renderCards(true)}
          </div>
        </div>
      </section>
    </>
  )
}
