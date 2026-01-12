"use client"

import React from "react"
import Image from "next/image"
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
const SECTION_HEIGHT = 890 // 调整为实际内容高度

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-support) * ${designValue})`

// 边框尺寸 (240x353)
const FRAME_WIDTH = 240
const FRAME_HEIGHT = 353

// 跑道形轨道参数（顶部半圆 + 直线 + 底部半圆）
const TRACK_RADIUS = 118 // 半圆半径 (120 - 2px边距)
const TRACK_CENTER_X = 120 // 中心x
const TRACK_TOP_CENTER_Y = 120 // 顶部半圆中心y
const TRACK_BOTTOM_CENTER_Y = 233 // 底部半圆中心y

// 卡片间距
const CARD_GAP = 27

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

export interface SupportCardData {
  id: string | number
  title: string
  icon?: string
}

interface SupportCardProps {
  card: SupportCardData
  index: number
}

function SupportCard({ card, index }: SupportCardProps) {
  // 根据icon字符串获取图标组件，否则使用默认顺序
  const Icon = card.icon ? iconMap[card.icon] || defaultIcons[index] : defaultIcons[index]

  // 生成跑道形路径上的关键帧 (顺时针)
  // 路径: 右侧直线向下 -> 底部半圆 -> 左侧直线向上 -> 顶部半圆
  const generateTrackPath = (startPercent: number) => {
    const xPoints: number[] = []
    const yPoints: number[] = []
    const steps = 72 // 总步数

    for (let i = 0; i <= steps; i++) {
      const percent = ((startPercent + (i / steps) * 100) % 100) / 100
      let x: number, y: number

      // 路径分段：
      // 0-0.16: 顶部半圆右半部分 (从顶部到右侧)
      // 0.16-0.34: 右侧直线向下
      // 0.34-0.66: 底部半圆 (从右到左)
      // 0.66-0.84: 左侧直线向上
      // 0.84-1.0: 顶部半圆左半部分 (从左侧到顶部)

      if (percent < 0.16) {
        // 顶部半圆右半部分 (270° -> 360°)
        const angle = (270 + (percent / 0.16) * 90) * Math.PI / 180
        x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
        y = TRACK_TOP_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
      } else if (percent < 0.34) {
        // 右侧直线向下
        const t = (percent - 0.16) / 0.18
        x = TRACK_CENTER_X + TRACK_RADIUS
        y = TRACK_TOP_CENTER_Y + t * (TRACK_BOTTOM_CENTER_Y - TRACK_TOP_CENTER_Y)
      } else if (percent < 0.66) {
        // 底部半圆 (0° -> 180°)
        const angle = ((percent - 0.34) / 0.32) * 180 * Math.PI / 180
        x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
        y = TRACK_BOTTOM_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
      } else if (percent < 0.84) {
        // 左侧直线向上
        const t = (percent - 0.66) / 0.18
        x = TRACK_CENTER_X - TRACK_RADIUS
        y = TRACK_BOTTOM_CENTER_Y - t * (TRACK_BOTTOM_CENTER_Y - TRACK_TOP_CENTER_Y)
      } else {
        // 顶部半圆左半部分 (180° -> 270°)
        const angle = (180 + ((percent - 0.84) / 0.16) * 90) * Math.PI / 180
        x = TRACK_CENTER_X + TRACK_RADIUS * Math.cos(angle)
        y = TRACK_TOP_CENTER_Y + TRACK_RADIUS * Math.sin(angle)
      }

      xPoints.push(x)
      yPoints.push(y)
    }
    return { x: xPoints, y: yPoints }
  }

  // 大星星从右上角开始 (约10%)，小星星从左下角开始 (约60%)
  const largeStarPath = generateTrackPath(10)
  const littleStarPath = generateTrackPath(60)

  return (
    <motion.div
      className="relative cursor-pointer flex-shrink-0"
      style={{
        width: rpx(FRAME_WIDTH),
        height: rpx(FRAME_HEIGHT),
      }}
      whileHover="hover"
      initial="initial"
    >
      {/* 整体放大容器 */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformOrigin: "center center" }}
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.15 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 椭圆边框 SVG */}
        <Image
          src="/contact-support/rectangle-line.svg"
          alt=""
          fill
          className="object-contain"
        />

        {/* 大星星 - 右上角起始，顺时针沿椭圆移动 */}
        <motion.div
          className="absolute"
          style={{
            width: rpx(44),
            height: rpx(42),
            marginLeft: rpx(-22),
            marginTop: rpx(-21),
          }}
          animate={{
            left: largeStarPath.x.map((v) => rpx(v)),
            top: largeStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          }}
          transition={{
            left: {
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            },
            top: {
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            },
            rotate: {
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            },
          }}
        >
          <Image
            src="/contact-support/large-star.svg"
            alt=""
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 小星星 - 左下角起始，顺时针沿椭圆移动 */}
        <motion.div
          className="absolute"
          style={{
            width: rpx(23),
            height: rpx(22),
            marginLeft: rpx(-11.5),
            marginTop: rpx(-11),
          }}
          animate={{
            left: littleStarPath.x.map((v) => rpx(v)),
            top: littleStarPath.y.map((v) => rpx(v)),
            rotate: 360,
          }}
          transition={{
            left: {
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            },
            top: {
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            },
            rotate: {
              duration: 4,
              ease: "linear",
              repeat: Infinity,
            },
          }}
        >
          <Image
            src="/contact-support/little-star.svg"
            alt=""
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 图标 - 在边框中央 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Icon
            className="text-brand-light-olive"
            style={{
              width: rpx(60),
              height: rpx(60),
            }}
            strokeWidth={1.5}
          />
        </div>

        {/* 标题 - 下方区域顶部对齐，支持换行 */}
        <div
          className="absolute font-anaheim font-semibold text-black text-center"
          style={{
            left: "50%",
            top: rpx(220),
            transform: "translateX(-50%)",
            width: rpx(200),
            fontSize: rpx(24),
            lineHeight: rpx(28),
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
  title = "What Support You Can Get",
  cards = [],
}: SupportNarrativeSectionProps) {
  // 计算卡片总宽度
  const cardCount = cards.length || 6
  const totalCardsWidth = FRAME_WIDTH * cardCount + CARD_GAP * (cardCount - 1)

  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  return (
    <section
      className="relative w-full flex flex-col items-center"
      style={{
        minHeight: rpx(SECTION_HEIGHT),
        paddingTop: rpx(100),
        paddingBottom: rpx(100),
        ["--rpx-support" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), calc(100vh / ${SECTION_HEIGHT}))`,
      }}
    >
      {/* 背景漂浮圆形 - Ellipse 145 大正圆 左下 */}
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

      {/* 背景漂浮圆形 - Ellipse 149 小正圆 右下 */}
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

      {/* 背景漂浮圆形 - Ellipse 147 椭圆 右上 */}
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
      <div className="relative" style={{ marginBottom: rpx(100) }}>
        {/* 问号装饰 - 贴在 Get 上，摇摆动效 */}
        <motion.div
          className="absolute"
          style={{
            right: rpx(-100),
            top: rpx(-80),
            width: rpx(110),
            height: rpx(167),
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
          <Image
            src="/contact-support/？.svg"
            alt=""
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 标题 - 字符跳动效果 */}
        <h2
          className="relative z-10 font-josefin-sans font-bold text-black text-center flex justify-center"
          style={{
            fontSize: rpx(77),
            lineHeight: rpx(80),
          }}
        >
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              style={{ marginRight: char === " " ? rpx(20) : 0 }}
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
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h2>
      </div>

      {/* 卡片容器 - 居中 */}
      {cards.length > 0 && (
        <div
          className="flex justify-center"
          style={{
            gap: rpx(CARD_GAP),
            width: rpx(totalCardsWidth),
          }}
        >
          {cards.map((card, index) => (
            <SupportCard key={card.id} card={card} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
