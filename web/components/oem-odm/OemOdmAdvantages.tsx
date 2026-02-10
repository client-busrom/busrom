"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 573 // 819 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-advantages) * ${designValue})`

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
  width?: number
  height?: number
}

interface AdvantageItem {
  title: string
  description: string
  image?: MediaObject | null
}

interface OemOdmAdvantagesProps {
  title?: string
  items?: AdvantageItem[]
}

const defaultContent = {
  title: "The Advantages of Our OEM Service",
  items: [
    {
      title: "Premium Manufacturing",
      description: "Select materials excel in corrosion resistance, durability, and load-bearing performance.",
    },
    {
      title: "Custom Solutions",
      description: "Tailored designs to meet your specific requirements and brand identity.",
    },
    {
      title: "Quality Assurance",
      description: "Rigorous testing and inspection at every stage of production.",
    },
  ],
}

// 冒泡文字组件 - 不断向上冒泡的效果
function BubbleText({ text, isActive }: { text: string; isActive: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; y: number; opacity: number }[]>([])
  const bubbleIdRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      setBubbles([])
      return
    }

    // 每500ms生成一个新气泡
    const interval = setInterval(() => {
      const newId = bubbleIdRef.current++
      setBubbles((prev) => [...prev, { id: newId, y: 0, opacity: 1 }])

      // 3秒后移除气泡
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newId))
      }, 3000)
    }, 500)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative text-left" style={{ height: rpx(74) }}> {/* 105 * 0.7 */}
      {/* 气泡层 - 向上飘动并渐变消失 */}
      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.id}
          className="absolute font-anaheim font-extrabold whitespace-nowrap text-left"
          style={{
            left: 0,
            fontSize: rpx(32), // 46 * 0.7
            lineHeight: rpx(74), // 105 * 0.7
            background: "linear-gradient(to top, rgba(255,244,166,1) 0%, rgba(85,79,36,0) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextStroke: `2px transparent`,
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: -21, opacity: 0 }} // -30 * 0.7
          transition={{ duration: 2.5, ease: "easeOut" }}
        >
          {text}
        </motion.span>
      ))}

      {/* 主文字层 - 实心填充 + 阴影 */}
      <span
        className="absolute font-anaheim font-extrabold whitespace-nowrap text-left"
        style={{
          left: 0,
          top: 0,
          fontSize: rpx(32), // 46 * 0.7
          lineHeight: rpx(74), // 105 * 0.7
          color: "#FFFB7D",
          textShadow: "0 4px 4px rgba(0,0,0,0.25)",
        }}
      >
        {text}
      </span>
    </div>
  )
}

export function OemOdmAdvantages({
  title = defaultContent.title,
  items = defaultContent.items,
}: OemOdmAdvantagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const currentItem = items[currentIndex]
  const nextIndex = (currentIndex + 1) % items.length
  const nextItem = items[nextIndex]

  // 大图 = 当前item的图片，小图 = 下一个item的图片
  const leftImage = currentItem?.image
  const middleImage = nextItem?.image

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-advantages" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div
        className="hidden md:block relative w-full"
        style={{ height: rpx(DESIGN_HEIGHT), marginTop: rpx(70), marginBottom: rpx(105) }} // 100*0.7, 150*0.7
      >
        {/* 居中内容容器 */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: rpx(1344), // 1920 * 0.7
            height: rpx(DESIGN_HEIGHT),
          }}
        >
        {/* 标题 - The Advantages of Our OEM Service - text-shadow 模拟外描边 */}
        <motion.h2
          className="absolute font-anaheim font-extrabold"
          style={{
            left: rpx(520), // 743 * 0.7
            top: rpx(5), // 7 * 0.7
            width: rpx(800),
            fontSize: rpx(60),
            lineHeight: rpx(68),
            letterSpacing: "0.03em",
            color: "#756f3f",
            whiteSpace: "pre-line",
            textShadow: `
              -2px -2px 0 #CAC386,
              2px -2px 0 #CAC386,
              -2px 2px 0 #CAC386,
              2px 2px 0 #CAC386,
              0px -2px 0 #CAC386,
              0px 2px 0 #CAC386,
              -2px 0px 0 #CAC386,
              2px 0px 0 #CAC386
            `,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>

        {/* 左侧大图片 - 当前item的图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(107), // 153 * 0.7
            top: rpx(0),
            width: rpx(387), // 553 * 0.7
            height: rpx(573), // 819 * 0.7
            borderRadius: rpx(21), // 30 * 0.7
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {leftImage ? (
                <OptimizedImage
                  image={leftImage as any}
                  alt={currentItem?.title || "Advantage Image"}
                  size="large"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#D9D9D9]" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 中间小图片 - 下一个item的图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(520), // 743 * 0.7
            top: rpx(204), // 291 * 0.7
            width: rpx(252), // 360 * 0.7
            height: rpx(334), // 477 * 0.7
            borderRadius: rpx(21), // 30 * 0.7
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={nextIndex}
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {middleImage ? (
                <OptimizedImage
                  image={middleImage as any}
                  alt={nextItem?.title || "Next Advantage Image"}
                  size="medium"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#D9D9D9]" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 右侧内容区域 */}
        <div
          className="absolute"
          style={{
            left: rpx(798), // 1140 * 0.7
            top: rpx(204), // 291 * 0.7
            width: rpx(420), // 600 * 0.7
          }}
        >
          {/* 冒泡标题 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BubbleText text={currentItem?.title || ""} isActive={true} />
            </motion.div>
          </AnimatePresence>

          {/* 描述文字背景框 - 左侧两个直角与图片右侧连接 */}
          <motion.div
            className="absolute flex items-center"
            style={{
              left: rpx(-26), // -37 * 0.7
              top: rpx(112), // 160 * 0.7
              width: rpx(480), // 686 * 0.7
              height: rpx(120), // 171 * 0.7
              backgroundColor: "#554F24",
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: rpx(21), // 30 * 0.7
              borderBottomRightRadius: rpx(21), // 30 * 0.7
              paddingLeft: rpx(26), // 与left偏移抵消，使文字左对齐title
              paddingRight: rpx(24), // 34 * 0.7
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 描述文字 */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                className="font-anaheim font-semibold text-white text-left"
                style={{
                  width: rpx(408), // 583 * 0.7
                  fontSize: rpx(20), // 28 * 0.7
                  lineHeight: rpx(30), // 43 * 0.7
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentItem?.description || ""}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 底部导航按钮 */}
        <div
          className="absolute flex gap-4"
          style={{
            left: rpx(1068), // 1526 * 0.7
            top: rpx(468), // 668 * 0.7
          }}
        >
          {/* 上一个按钮 */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center rounded-full border border-white transition-colors hover:bg-white/10"
            style={{
              width: rpx(52), // 74 * 0.7
              height: rpx(52), // 74 * 0.7
            }}
          >
            <svg
              style={{ width: rpx(12), height: rpx(20) }} // 17*0.7, 29*0.7
              viewBox="0 0 17 29"
              fill="none"
            >
              <path
                d="M15 2L3 14.5L15 27"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 下一个按钮 */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90"
            style={{
              width: rpx(52), // 74 * 0.7
              height: rpx(52), // 74 * 0.7
            }}
          >
            <svg
              style={{ width: rpx(12), height: rpx(20) }} // 17*0.7, 29*0.7
              viewBox="0 0 17 29"
              fill="none"
            >
              <path
                d="M2 2L14 14.5L2 27"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* 标题 */}
        <h2
          className="font-anaheim font-extrabold text-2xl mb-6"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px #CAC386",
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </h2>

        {/* 图片区域 */}
        <div className="flex gap-3 mb-6">
          {/* 左侧大图 - 当前item */}
          <div className="flex-1 aspect-[553/819] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {leftImage ? (
                  <OptimizedImage
                    image={leftImage as any}
                    alt={currentItem?.title || "Advantage Image"}
                    size="medium"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D9D9D9]" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* 中间小图 - 下一个item */}
          <div className="w-1/3 aspect-[360/477] rounded-2xl overflow-hidden self-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={nextIndex}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {middleImage ? (
                  <OptimizedImage
                    image={middleImage as any}
                    alt={nextItem?.title || "Next Advantage Image"}
                    size="small"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D9D9D9]" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="mb-4">
          {/* 标题 */}
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentIndex}
              className="font-anaheim font-extrabold text-xl mb-3"
              style={{
                color: "#FFFB7D",
                textShadow: "0 2px 4px rgba(0,0,0,0.25)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem?.title}
            </motion.h3>
          </AnimatePresence>

          {/* 描述 */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#554F24" }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                className="font-anaheim font-semibold text-white text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentItem?.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-white"
          >
            <svg width="12" height="20" viewBox="0 0 17 29" fill="none">
              <path
                d="M15 2L3 14.5L15 27"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white"
          >
            <svg width="12" height="20" viewBox="0 0 17 29" fill="none">
              <path
                d="M2 2L14 14.5L2 27"
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 指示器 */}
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-[#FFFB7D]" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default OemOdmAdvantages
