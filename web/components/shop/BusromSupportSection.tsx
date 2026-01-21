"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-support) * ${designValue})`

// 内容居中偏移量 (原始1920宽度，缩放80%后内容宽度1536，左右各留192)
const CENTER_OFFSET = 192

// 自动轮播间隔 (ms)
const AUTO_PLAY_INTERVAL = 4000
// 鼠标不动后恢复轮播的时间 (ms)
const RESUME_DELAY = 4000

// 卡片配置
const CARD_CONFIGS = [
  {
    bgColor: "#E3D98D", // rgb(0.888, 0.851, 0.554)
    titleColor: "#46400F",
    titleStrokeColor: "#46400F",
    descColor: "#46400F",
    lineColor: "#46400F",
    ellipseColor: "#C4BB6C",
    numberColor: "#958B3A",
  },
  {
    bgColor: "#E2E0D6", // rgb(0.885, 0.877, 0.839)
    titleColor: "#46400F",
    titleStrokeColor: "#46400F",
    descColor: "#46400F",
    lineColor: "#46400F",
    ellipseColor: "#CDC8AF",
    numberColor: "#928B65",
  },
  {
    bgColor: "#756F3F", // rgb(0.459, 0.435, 0.247)
    titleColor: "#FFF7B5",
    titleStrokeColor: "#FFF7B5",
    descColor: "#FFF7B5",
    lineColor: "#E2D98D",
    ellipseColor: "#97915E",
    numberColor: "#756E38",
  },
  {
    bgColor: "#E2E0D6", // rgb(0.885, 0.877, 0.839)
    titleColor: "#46400F",
    titleStrokeColor: "#46400F",
    descColor: "#46400F",
    lineColor: "#46400F",
    ellipseColor: "#CCC8AF",
    numberColor: "#928B65",
  },
]

// 默认卡片数据
const defaultCards = [
  {
    id: 1,
    title: "Triple Quality Inspection",
    description: "Raw Materials, Parts And Finished Products",
    icon: "/busrom-support/Vector.svg",
  },
  {
    id: 2,
    title: "Trial Installation Report",
    description: "Pre-Assemble And Test The Product Before Shipment",
    icon: "/busrom-support/Vector-1.svg",
  },
  {
    id: 3,
    title: "Intact At Doorstep",
    description: "Fully Sealed Cardboard Box Packaging",
    icon: "/busrom-support/Vector-2.svg",
  },
  {
    id: 4,
    title: "Free Replacement",
    description: "For Non-Human-Caused Quality Issues Under Warranty",
    icon: "/busrom-support/Vector-3.svg",
  },
]

export interface SupportCardData {
  id: string | number
  title: string
  description?: string
  icon?: string
}

interface BusromSupportSectionProps {
  title?: string
  cards?: SupportCardData[]
}

export function BusromSupportSection({
  title = "Busrom Support",
  cards = defaultCards,
}: BusromSupportSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 卡片尺寸 (80%缩放)
  const cardWidth = 288   // 360 * 0.8
  const cardHeight = 519  // 649 * 0.8
  const cardGap = 12      // 15 * 0.8
  const cardStartX = 180  // 225 * 0.8
  const cardStartY = 199  // 249 * 0.8

  // 自动轮播
  useEffect(() => {
    if (isPaused || cards.length === 0) return

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(cards.length, 4))
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isPaused, cards.length])

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

  // 点击/悬停切换
  const handleCardInteraction = useCallback((index: number) => {
    setIsPaused(true)
    setActiveIndex(index)

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [])

  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-10">
      <h2 className="font-josefin-sans font-bold text-2xl text-[#46400F] mb-6 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.slice(0, 4).map((card, index) => {
          const config = CARD_CONFIGS[index] || CARD_CONFIGS[0]
          const iconSrc = card.icon || defaultCards[index]?.icon || defaultCards[0].icon
          const isActive = activeIndex === index
          const numberStr = String(index + 1).padStart(2, "0")

          return (
            <motion.div
              key={card.id}
              className="relative p-5 rounded-3xl cursor-pointer min-h-[180px] flex flex-col"
              style={{ backgroundColor: config.bgColor }}
              animate={{
                boxShadow: isActive
                  ? "0 10px 20px rgba(0, 0, 0, 0.15)"
                  : "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
              onClick={() => handleCardInteraction(index)}
            >
              {/* Title */}
              <div className="mb-3">
                {isActive ? (
                  <div className="relative">
                    <h3
                      className="font-josefin-sans font-bold text-base leading-tight text-transparent"
                      style={{ WebkitTextStroke: `1px ${config.titleStrokeColor}` }}
                    >
                      {card.title}
                    </h3>
                    <h3
                      className="absolute top-[1px] left-[1px] font-josefin-sans font-bold text-base leading-tight"
                      style={{ color: config.titleColor }}
                    >
                      {card.title}
                    </h3>
                  </div>
                ) : (
                  <h3
                    className="font-josefin-sans font-bold text-base leading-tight"
                    style={{ color: config.titleColor }}
                  >
                    {card.title}
                  </h3>
                )}
              </div>

              {/* Description */}
              <p
                className="font-josefin-sans text-sm leading-snug mb-auto"
                style={{ color: config.descColor }}
              >
                {card.description}
              </p>

              {/* Icon/Number */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mt-4"
                style={{ backgroundColor: config.ellipseColor }}
              >
                {isActive ? (
                  <span
                    className="font-josefin-sans font-bold text-xl"
                    style={{ color: config.numberColor }}
                  >
                    {numberStr}
                  </span>
                ) : (
                  <div className="relative w-7 h-7">
                    <Image src={iconSrc} alt="" fill className="object-contain" />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full bg-brand-main hidden md:block"
      style={{
        height: rpx(SECTION_HEIGHT),
        paddingBottom: rpx(32), // 40 * 0.8
        ["--rpx-support" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* 标题左侧装饰圆 */}
      <div
        className="absolute rounded-full"
        style={{
          left: rpx(569 + CENTER_OFFSET), // 711 * 0.8
          top: rpx(13),                    // 16 * 0.8
          width: rpx(130),                 // 163 * 0.8
          height: rpx(130),
          background: "linear-gradient(135deg, #EFE9BC 0%, #F6F4ED 100%)",
        }}
      />

      {/* 标题 */}
      <h2
        className="absolute font-josefin-sans font-bold"
        style={{
          left: rpx(626 + CENTER_OFFSET), // 782 * 0.8
          top: rpx(78),                    // 98 * 0.8
          fontSize: rpx(102),              // 128 * 0.8
          lineHeight: rpx(97),             // 121 * 0.8
          color: "#46400F",
        }}
      >
        {title}
      </h2>

      {/* 4个卡片 */}
      <div
        className="absolute flex"
        style={{
          left: rpx(cardStartX + CENTER_OFFSET),
          top: rpx(cardStartY),
          gap: rpx(cardGap),
        }}
      >
        {cards.slice(0, 4).map((card, index) => {
          const config = CARD_CONFIGS[index] || CARD_CONFIGS[0]
          const iconSrc = card.icon || defaultCards[index]?.icon || defaultCards[0].icon
          const isActive = activeIndex === index
          const numberStr = String(index + 1).padStart(2, "0")

          return (
            <motion.div
              key={card.id}
              className="relative flex-shrink-0 cursor-pointer"
              style={{
                width: rpx(cardWidth),
                height: rpx(cardHeight),
                backgroundColor: config.bgColor,
                borderRadius: rpx(48), // 60 * 0.8
              }}
              animate={{
                boxShadow: isActive
                  ? "0 20px 40px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15)"
                  : "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => handleCardInteraction(index)}
              onClick={() => handleCardInteraction(index)}
            >
              {/* 标题 - 激活时显示双层字效果 */}
              <div
                className="absolute"
                style={{
                  left: rpx(37),   // 46 * 0.8
                  top: rpx(47),    // 59 * 0.8
                  width: rpx(235), // 略微增加宽度
                }}
              >
                <h3
                  className="font-josefin-sans font-bold"
                  style={{
                    fontSize: rpx(29),
                    lineHeight: rpx(34),
                    color: config.titleColor,
                  }}
                >
                  {card.title}
                </h3>
              </div>

              {/* 描述 */}
              <p
                className="absolute font-josefin-sans"
                style={{
                  left: rpx(37),   // 46 * 0.8
                  top: rpx(122),   // 152 * 0.8
                  width: rpx(216), // 270 * 0.8
                  fontSize: rpx(19),  // 24 * 0.8
                  lineHeight: rpx(23), // 29 * 0.8
                  color: config.descColor,
                }}
              >
                {card.description}
              </p>

              {/* 图标椭圆背景 */}
              <div
                className="absolute rounded-full"
                style={{
                  left: rpx(39),  // 49 * 0.8
                  top: rpx(375),  // 469 * 0.8
                  width: rpx(93), // 116 * 0.8
                  height: rpx(86), // 108 * 0.8
                  backgroundColor: config.ellipseColor,
                }}
              />

              {/* 图标 或 数字 */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: rpx(39),
                  top: rpx(375),
                  width: rpx(93),
                  height: rpx(86),
                }}
              >
                {isActive ? (
                  <motion.span
                    className="font-josefin-sans font-bold"
                    style={{
                      fontSize: rpx(38), // 48 * 0.8
                      color: config.numberColor,
                      marginTop: rpx(6), // 8 * 0.8
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {numberStr}
                  </motion.span>
                ) : (
                  <motion.div
                    className="relative"
                    style={{
                      width: rpx(43), // 54 * 0.8
                      height: rpx(43),
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={iconSrc}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                )}
              </div>

              {/* 底部分割线 */}
              <div
                className="absolute"
                style={{
                  left: rpx(39),   // 49 * 0.8
                  top: rpx(477),   // 596 * 0.8
                  width: rpx(210), // 263 * 0.8
                  height: rpx(1),
                  backgroundColor: config.lineColor,
                  borderRadius: rpx(13), // 16 * 0.8
                }}
              />
            </motion.div>
          )
        })}
      </div>
    </section>
    </>
  )
}
