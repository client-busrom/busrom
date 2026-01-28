"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-features) * ${designValue})`

// 边框尺寸 (240x353 * 0.8)
const FRAME_WIDTH = 192
const FRAME_HEIGHT = 282

// 跑道形轨道参数 (80%缩放)
const TRACK_RADIUS = 94      // 118 * 0.8
const TRACK_CENTER_X = 96    // 120 * 0.8
const TRACK_TOP_CENTER_Y = 96     // 120 * 0.8
const TRACK_BOTTOM_CENTER_Y = 186 // 233 * 0.8

// 卡片间距 (80%缩放)
const CARD_GAP = 22  // 27 * 0.8

// 星星轨道运动一周的时间 (秒)
const STAR_ORBIT_DURATION = 4
// 轮播间隔 = 星星转一周 (ms)
const AUTO_PLAY_INTERVAL = STAR_ORBIT_DURATION * 1000
// 鼠标不动后恢复轮播的时间 (ms)
const RESUME_DELAY = 4000

// 默认图标
const defaultIcons = [
  "/busrom-main-features/Vector.svg",      // Years Of Focus
  "/busrom-main-features/Vector-1.svg",    // Promise Of Quality
  "/busrom-main-features/Vector-2.svg",    // Customized Service
  "/busrom-main-features/Vector-3.svg",    // Peace Of Mind
  "/busrom-main-features/Vector-4.svg",    // Worry-Free
  "/busrom-main-features/Vector-5.svg",    // Global Trust
]

// 默认卡片数据
const defaultCards = [
  { id: 1, title: "Years Of Focus" },
  { id: 2, title: "Promise Of Quality" },
  { id: 3, title: "Customized Service" },
  { id: 4, title: "Peace Of Mind" },
  { id: 5, title: "Worry-Free" },
  { id: 6, title: "Global Trust" },
]

export interface FeatureCardData {
  id: string | number
  title: string
  icon?: string
}

// 生成跑道形路径
const generateTrackPath = (startPercent: number) => {
  const xPoints: number[] = []
  const yPoints: number[] = []
  const steps = 72

  for (let i = 0; i <= steps; i++) {
    const percent = ((startPercent + (i / steps) * 100) % 100) / 100
    let x: number, y: number

    if (percent < 0.16) {
      const angle = (270 + (percent / 0.16) * 90) * Math.PI / 180
      x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
      y = TRACK_TOP_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
    } else if (percent < 0.34) {
      const t = (percent - 0.16) / 0.18
      x = TRACK_CENTER_X + TRACK_RADIUS
      y = TRACK_TOP_CENTER_Y + t * (TRACK_BOTTOM_CENTER_Y - TRACK_TOP_CENTER_Y)
    } else if (percent < 0.66) {
      const angle = ((percent - 0.34) / 0.32) * 180 * Math.PI / 180
      x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
      y = TRACK_BOTTOM_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
    } else if (percent < 0.84) {
      const t = (percent - 0.66) / 0.18
      x = TRACK_CENTER_X - TRACK_RADIUS
      y = TRACK_BOTTOM_CENTER_Y - t * (TRACK_BOTTOM_CENTER_Y - TRACK_TOP_CENTER_Y)
    } else {
      const angle = (180 + ((percent - 0.84) / 0.16) * 90) * Math.PI / 180
      x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
      y = TRACK_TOP_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
    }

    xPoints.push(x)
    yPoints.push(y)
  }
  return { x: xPoints, y: yPoints }
}

// 预计算路径
const largeStarPath = generateTrackPath(10)
const littleStarPath = generateTrackPath(60)

// 星星初始位置
const largeStarInitialX = largeStarPath.x[0]
const largeStarInitialY = largeStarPath.y[0]
const littleStarInitialX = littleStarPath.x[0]
const littleStarInitialY = littleStarPath.y[0]

interface FeatureCardProps {
  card: FeatureCardData
  index: number
  isActive: boolean
  onHover: () => void
}

function FeatureCard({ card, index, isActive, onHover }: FeatureCardProps) {
  const iconSrc = card.icon || defaultIcons[index] || defaultIcons[0]

  return (
    <motion.div
      className="relative cursor-pointer flex-shrink-0"
      style={{
        width: rpx(FRAME_WIDTH),
        height: rpx(FRAME_HEIGHT),
      }}
      onMouseEnter={onHover}
      animate={isActive ? "active" : "inactive"}
      initial="inactive"
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformOrigin: "center center" }}
        variants={{
          inactive: { scale: 1 },
          active: { scale: 1.15 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 椭圆边框 SVG */}
        <Image
          src="/busrom-main-features/rectangle-line.svg"
          alt=""
          fill
          className="object-contain"
        />

        {/* 大星星 - 使用 key 强制在 isActive 变化时重新挂载 */}
        <motion.div
          key={`large-star-${isActive ? 'active' : 'inactive'}`}
          className="absolute"
          style={{
            width: rpx(35),   // 44 * 0.8
            height: rpx(34),  // 42 * 0.8
            marginLeft: rpx(-18), // -22 * 0.8
            marginTop: rpx(-17),  // -21 * 0.8
            left: rpx(largeStarInitialX),
            top: rpx(largeStarInitialY),
          }}
          animate={isActive ? {
            left: largeStarPath.x.map((v) => rpx(v)),
            top: largeStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          } : {}}
          transition={isActive ? {
            left: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            top: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            rotate: { duration: STAR_ORBIT_DURATION / 2, ease: "linear", repeat: Infinity },
          } : {}}
        >
          <Image
            src="/busrom-main-features/large-star.svg"
            alt=""
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 小星星 - 使用 key 强制在 isActive 变化时重新挂载 */}
        <motion.div
          key={`little-star-${isActive ? 'active' : 'inactive'}`}
          className="absolute"
          style={{
            width: rpx(18),   // 23 * 0.8
            height: rpx(18),  // 22 * 0.8
            marginLeft: rpx(-9),  // -11.5 * 0.8
            marginTop: rpx(-9),   // -11 * 0.8
            left: rpx(littleStarInitialX),
            top: rpx(littleStarInitialY),
          }}
          animate={isActive ? {
            left: littleStarPath.x.map((v) => rpx(v)),
            top: littleStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          } : {}}
          transition={isActive ? {
            left: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            top: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            rotate: { duration: STAR_ORBIT_DURATION / 1.5, ease: "linear", repeat: Infinity },
          } : {}}
        >
          <Image
            src="/busrom-main-features/little-star.svg"
            alt=""
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 图标 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            width: rpx(64),  // 80 * 0.8
            height: rpx(64),
          }}
        >
          <Image
            src={iconSrc}
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* 标题 */}
        <div
          className="absolute font-josefin-sans font-medium text-center whitespace-pre-line"
          style={{
            left: "50%",
            top: rpx(176),  // 220 * 0.8
            transform: "translateX(-50%)",
            width: rpx(160), // 200 * 0.8
            fontSize: rpx(24),
            lineHeight: rpx(30),
            color: "#3B360B",
          }}
        >
          {card.title}
        </div>
      </motion.div>
    </motion.div>
  )
}

interface BusromMainFeaturesSectionProps {
  title?: string
  subtitle?: string
  cards?: FeatureCardData[]
}

export function BusromMainFeaturesSection({
  title = "Busrom Main Features",
  subtitle = "Increase New-Style To Your Life",
  cards = defaultCards,
}: BusromMainFeaturesSectionProps) {
  const cardCount = cards.length || 6
  const totalCardsWidth = FRAME_WIDTH * cardCount + CARD_GAP * (cardCount - 1)
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 自动轮播
  useEffect(() => {
    if (isPaused) return

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isPaused, cards.length])

  // 鼠标悬停处理
  const handleHover = useCallback((index: number) => {
    // 暂停自动轮播
    setIsPaused(true)
    setActiveIndex(index)

    // 清除之前的恢复计时器
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }

    // 设置新的恢复计时器
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [])

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

  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <h2 className="font-josefin-sans font-bold text-2xl text-[#464010] mb-2">
          {title}
        </h2>
        <p className="font-josefin-sans font-semibold text-lg text-[#464010]">
          {subtitle}
        </p>
      </div>

      {/* 卡片网格 - 2列3行 */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => {
          const iconSrc = card.icon || defaultIcons[index] || defaultIcons[0]
          const isActive = index === activeIndex
          return (
            <div
              key={card.id}
              className={`relative bg-brand-main border-2 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[140px] transition-all duration-300 ${isActive ? 'border-[#756F3F] shadow-lg scale-105' : 'border-[#E3DEB8]'}`}
              onClick={() => handleHover(index)}
            >
              {/* 图标 */}
              <div className="relative w-12 h-12 mb-3">
                <Image
                  src={iconSrc}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              {/* 标题 */}
              <p className="font-josefin-sans font-medium text-sm text-center text-[#3B360B] leading-tight">
                {card.title}
              </p>
            </div>
          )
        })}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full flex-col items-center bg-brand-main hidden md:flex py-20"
      style={{
        ["--rpx-features" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* 背景漂浮圆形 - 左下 */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-0"
        style={{
          width: vw(792),
          height: vw(792),
          left: vw(-207),
          top: vw(398),
          backgroundColor: "rgb(255 245 168 / 0.38)",
          filter: `blur(${vw(104)})`,
        }}
        animate={{
          x: [0, 200, 100, 0],
          y: [0, -100, 50, 0],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* 背景漂浮圆形 - 右下 */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-0"
        style={{
          width: vw(150),
          height: vw(148),
          left: vw(1196),
          top: vw(724),
          backgroundColor: "rgb(255 245 168 / 0.54)",
          filter: `blur(${vw(104)})`,
        }}
        animate={{
          x: [0, -150, 80, 0],
          y: [0, -120, 60, 0],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* 背景漂浮圆形 - 右上 */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-0"
        style={{
          width: vw(550),
          height: vw(406),
          left: vw(1450),
          top: vw(0),
          backgroundColor: "rgb(255 245 168 / 0.30)",
          filter: `blur(${vw(104)})`,
        }}
        animate={{
          x: [0, -200, 100, 0],
          y: [0, 150, -80, 0],
        }}
        transition={{
          duration: 14,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* 标题区域 */}
      <div className="relative z-10 text-center" style={{ marginBottom: rpx(64) }}>
        {/* 主标题 */}
        <h2
          className="font-josefin-sans font-bold text-center whitespace-pre-line"
          style={{
            fontSize: rpx(60),
            lineHeight: rpx(56),
            color: "#464010",
          }}
        >
          {title}
        </h2>

        {/* 副标题 */}
        <p
          className="font-josefin-sans font-semibold text-center whitespace-pre-line"
          style={{
            fontSize: rpx(24),
            lineHeight: rpx(32),
            color: "#464010",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* 卡片容器 */}
      {cards.length > 0 && (
        <div
          className="relative z-10 flex justify-center"
          style={{
            gap: rpx(CARD_GAP),
            width: rpx(totalCardsWidth),
          }}
        >
          {cards.map((card, index) => (
            <FeatureCard
              key={card.id}
              card={card}
              index={index}
              isActive={index === activeIndex}
              onHover={() => handleHover(index)}
            />
          ))}
        </div>
      )}
    </section>
    </>
  )
}
