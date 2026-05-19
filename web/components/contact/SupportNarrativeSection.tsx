"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Lightbulb,
  Settings,
  Calculator,
  Package,
  Layers,
} from "lucide-react"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922 // 调整为与 BusromMainFeaturesSection 一致

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-support) * ${designValue})`

// 边框尺寸 (240x353 * 0.8)
const FRAME_WIDTH = 192
const FRAME_HEIGHT = 282

// 跑道形轨道参数 (80%缩放)
const TRACK_RADIUS = 94      // 118 * 0.8
const TRACK_CENTER_X = 96    // 120 * 0.8
const TRACK_TOP_CENTER_Y = 96     // 120 * 0.8
const TRACK_BOTTOM_CENTER_Y = 186 // 233 * 0.8

// 卡片间距 (80%缩放)
const CARD_GAP = 48  // 从 22 增加到 48，适应更大的缩放

// 星星轨道运动一周的时间 (秒)
const STAR_ORBIT_DURATION = 4
// 轮播间隔 = 星星转一周 (ms)
const AUTO_PLAY_INTERVAL = STAR_ORBIT_DURATION * 1000
// 鼠标不动后恢复轮播的时间 (ms)
const RESUME_DELAY = 4000

// 图标映射
const iconMap: Record<string, React.ComponentType<any>> = {
  FileText,
  Lightbulb,
  Settings,
  Calculator,
  Package,
  Layers,
}

// 默认图标顺序
const defaultIcons = [FileText, Lightbulb, Settings, Calculator, Package, Layers]

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

export interface SupportCardData {
  id: string | number
  title: string
  icon?: string
}

interface SupportCardProps {
  card: SupportCardData
  index: number
  isActive: boolean
  onHover: () => void
}

function SupportCard({ card, index, isActive, onHover }: SupportCardProps) {
  // 根据icon字符串获取图标组件，否则使用默认顺序
  const Icon = card.icon ? iconMap[card.icon] || defaultIcons[index] : defaultIcons[index]

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
      {/* 整体放大容器 */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformOrigin: "center center" }}
          variants={{
            inactive: { scale: 1 },
            active: { scale: 1.3 },
          }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* 外部发光阴影层 - 采用分层结构避免污染内部元素 */}
          <motion.div
            className="absolute inset-0 rounded-full -z-10"
            variants={{
              inactive: { opacity: 0, scale: 0.8, filter: "blur(0px)" },
              active: { 
                opacity: 1, 
                scale: 1.1, 
                filter: "blur(25px)",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.4)" 
              },
            }}
          />
        {/* 椭圆边框 SVG */}
        <img
          src="/contact-support/rectangle-line.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* 大星星 */}
        <motion.div
          className="absolute"
          style={{
            width: rpx(35),   // 44 * 0.8
            height: rpx(34),  // 42 * 0.8
            marginLeft: rpx(-18), // -22 * 0.8
            marginTop: rpx(-17),  // -21 * 0.8
          }}
          animate={isActive ? {
            left: largeStarPath.x.map((v) => rpx(v)),
            top: largeStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          } : {
            left: rpx(largeStarInitialX),
            top: rpx(largeStarInitialY),
            rotate: 0,
          }}
          transition={isActive ? {
            left: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            top: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            rotate: { duration: STAR_ORBIT_DURATION / 2, ease: "linear", repeat: Infinity },
          } : {
            duration: 0.3,
          }}
        >
          <img
            src="/contact-support/large-star.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* 小星星 */}
        <motion.div
          className="absolute"
          style={{
            width: rpx(18),   // 23 * 0.8
            height: rpx(18),  // 22 * 0.8
            marginLeft: rpx(-9),  // -11.5 * 0.8
            marginTop: rpx(-9),   // -11 * 0.8
          }}
          animate={isActive ? {
            left: littleStarPath.x.map((v) => rpx(v)),
            top: littleStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          } : {
            left: rpx(littleStarInitialX),
            top: rpx(littleStarInitialY),
            rotate: 0,
          }}
          transition={isActive ? {
            left: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            top: { duration: STAR_ORBIT_DURATION, ease: "linear", repeat: Infinity },
            rotate: { duration: STAR_ORBIT_DURATION / 1.5, ease: "linear", repeat: Infinity },
          } : {
            duration: 0.3,
          }}
        >
          <img
            src="/contact-support/little-star.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* 图标 - 在边框中央 */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "40%",
            width: rpx(48),  // 60 * 0.8
            height: rpx(48),
          }}
          initial={{ x: "-50%", y: "-50%" }}
          variants={{
            inactive: { scale: 1, x: "-50%", y: "-50%" },
            active: { scale: 1.25, x: "-50%", y: "-50%" },
          }}
        >
          <Icon
            className="text-brand-light-olive"
            style={{
              width: rpx(48),  // 60 * 0.8
              height: rpx(48),
            }}
            strokeWidth={isActive ? 2 : 1.5}
          />
        </motion.div>

        {/* 标题 - 下方区域顶部对齐，支持换行 */}
        <div
          className={`absolute font-anaheim text-black text-center transition-all duration-300 ${isActive ? 'font-bold' : 'font-semibold'}`}
          style={{
            left: "50%",
            top: rpx(176),  // 220 * 0.8
            transform: "translateX(-50%)",
            width: rpx(160), // 200 * 0.8
            fontSize: rpx(19), // 24 * 0.8
            lineHeight: rpx(22), // 28 * 0.8
          }}
        >
          {card.title.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < card.title.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

interface SupportNarrativeSectionProps {
  title?: string
  cards?: SupportCardData[]
}

export function SupportNarrativeSection({
  title = "",
  cards = [],
}: SupportNarrativeSectionProps) {
  // 计算卡片总宽度
  const cardCount = cards.length || 6
  const totalCardsWidth = FRAME_WIDTH * cardCount + CARD_GAP * (cardCount - 1)

  // vw 尺寸计算
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 自动轮播
  useEffect(() => {
    if (isPaused || cards.length === 0) return

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
        <h2 className="font-josefin-sans font-bold text-2xl text-black mb-2">
          {title}
        </h2>
      </div>

      {/* 卡片网格 - 2列3行 */}
      <div className="grid grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon ? iconMap[card.icon] || defaultIcons[index] : defaultIcons[index]
          const isActive = index === activeIndex
          return (
            <div
              key={card.id}
              className={`relative bg-brand-main border-2 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[140px] transition-all duration-500 ${isActive ? 'border-[#756F3F] shadow-xl scale-110' : 'border-[#E3DEB8]'}`}
              onClick={() => handleHover(index)}
            >
              {/* 图标 */}
              <div className={`relative w-12 h-12 mb-3 flex items-center justify-center transition-transform duration-500 ${isActive ? 'scale-125' : 'scale-100'}`}>
                <Icon
                  className="text-brand-light-olive w-10 h-10"
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
              {/* 标题 */}
              <p className={`font-anaheim text-sm text-center text-black leading-tight transition-all duration-300 ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {card.title.split("\n").join(" ")}
              </p>
            </div>
          )
        })}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full flex-col items-center justify-center hidden md:flex"
      style={{
        height: rpx(SECTION_HEIGHT),
        ["--rpx-support" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* 标题区域 */}
      <div className="relative z-10" style={{ marginBottom: rpx(64) }}>
        {/* 问号装饰 - 贴在 Get 上，摇摆动效 */}
        <motion.div
          className="absolute"
          style={{
            right: rpx(-80),  // -100 * 0.8
            top: rpx(-64),    // -80 * 0.8
            width: rpx(88),   // 110 * 0.8
            height: rpx(134), // 167 * 0.8
            transformOrigin: "center bottom",
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
            src="/contact-support/why.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* 标题 - 字符跳动效果 */}
        <h2
          className="relative z-10 font-josefin-sans font-bold text-black text-center flex justify-center"
          style={{
            fontSize: rpx(62),  // 77 * 0.8
            lineHeight: rpx(64), // 80 * 0.8
          }}
        >
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              style={{ marginRight: char === " " ? rpx(16) : 0 }}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
                delay: index * 0.05,
              }}
            >
              {char}
            </motion.span>
          ))}
        </h2>
      </div>

      {/* 卡片容器 - 居中 */}
      {cards.length > 0 && (
        <div
          className="relative z-10 flex justify-center max-w-full"
          style={{
            gap: rpx(CARD_GAP),
            width: rpx(totalCardsWidth),
          }}
        >
          {cards.map((card, index) => (
            <SupportCard
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
