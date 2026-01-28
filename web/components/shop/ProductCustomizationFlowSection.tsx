"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 738 // 922 * 0.8

const rpx = (designValue: number) => `calc(var(--rpx-flow) * ${designValue})`

// 自动轮播间隔 (ms)
const AUTO_PLAY_INTERVAL = 3000
// 鼠标不动后恢复轮播的时间 (ms)
const RESUME_DELAY = 3000

// 内容居中偏移量 (原始1920宽度，缩放80%后内容宽度1536，左右各留192)
const CENTER_OFFSET = 192

// 默认流程步骤
const defaultSteps = [
  { id: 1, title: "Submit Form" },
  { id: 2, title: "Customize Request" },
  { id: 3, title: "Customer Confirmation" },
  { id: 4, title: "Order Payment" },
  { id: 5, title: "Production Confirmation" },
  { id: 6, title: "Waiting To Receive Goods" },
]

// 默认描述点
const defaultDescriptions = [
  "Quality Comes From Details",
  "Word Of Mouth Comes From Quality",
  "Refuse To Sell Inferior Goods As Good Ones",
]

export interface FlowStepData {
  id: string | number
  title: string
}

interface ProductCustomizationFlowSectionProps {
  title?: string
  descriptions?: string[]
  steps?: FlowStepData[]
}

export function ProductCustomizationFlowSection({
  title = "Product\nCustomization Flow",
  descriptions = defaultDescriptions,
  steps = defaultSteps,
}: ProductCustomizationFlowSectionProps) {
  const [activeIndex, setActiveIndex] = useState(1) // 默认第2个激活
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 步骤条位置配置 (所有值 * 0.8)
  const stepConfigs = [
    { y: 90, width: 433, height: 90 },
    { y: 186, width: 433, height: 88 },
    { y: 279, width: 433, height: 90 },
    { y: 374, width: 433, height: 90 },
    { y: 470, width: 433, height: 88 },
    { y: 563, width: 433, height: 90 },
  ]

  // 自动轮播
  useEffect(() => {
    if (isPaused || steps.length === 0) return

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(steps.length, 6))
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
      }
    }
  }, [isPaused, steps.length])

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

  // 悬停/点击处理
  const handleStepInteraction = useCallback((index: number) => {
    setIsPaused(true)
    setActiveIndex(index)

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
    }

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, RESUME_DELAY)
  }, [])

  // 左侧竖条位置 (所有值 * 0.8 + CENTER_OFFSET)
  const verticalBarLeft = 884 + CENTER_OFFSET  // 1105 * 0.8 = 884
  const verticalBarTop = 58                     // 73 * 0.8
  const verticalBarWidth = 116                  // 145 * 0.8
  const verticalBarHeight = 621                 // 776 * 0.8

  // 步骤条起始位置
  const stepBarLeft = 931 + CENTER_OFFSET       // 1164 * 0.8 = 931

  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* 标题 */}
      <h2 className="font-josefin-sans font-bold text-2xl text-black mb-4 whitespace-pre-line">
        {title}
      </h2>

      {/* 描述点 */}
      <div className="mb-6 space-y-2">
        {descriptions.map((desc, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#756F3F" }}
            />
            <p className="font-josefin-sans font-semibold text-sm text-[#625C2C]">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* 流程步骤 */}
      <div className="flex flex-col gap-3">
        {steps.slice(0, 6).map((step, index) => {
          const isActive = activeIndex === index
          return (
            <motion.div
              key={step.id}
              className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer"
              style={{
                backgroundColor: isActive ? "#E1D784" : "#BEB88B",
              }}
              animate={{
                scale: isActive ? 1.02 : 1,
                boxShadow: isActive
                  ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                  : "0 0 0 rgba(0, 0, 0, 0)",
              }}
              transition={{ duration: 0.2 }}
              onClick={() => handleStepInteraction(index)}
            >
              <span className="font-montserrat font-bold text-2xl text-black">
                {index + 1}
              </span>
              <span className="font-josefin-sans font-semibold text-base text-black">
                {step.title}
              </span>
            </motion.div>
          )
        })}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full bg-brand-main overflow-hidden hidden md:block"
      style={{
        ["--rpx-flow" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        minHeight: rpx(738),
      }}
    >
      {/* 左侧标题 */}
      <h2
        className="absolute font-josefin-sans font-bold whitespace-pre-line"
        style={{
          left: rpx(124 + CENTER_OFFSET),
          top: rpx(130),
          width: rpx(752),
          fontSize: rpx(60),
          lineHeight: rpx(56),
          color: "#000000",
        }}
      >
        {title}
      </h2>

      {/* 左侧描述点 */}
      {descriptions.map((desc, index) => (
        <div
          key={index}
          className="absolute flex items-center"
          style={{
            left: rpx(133 + CENTER_OFFSET),
            top: rpx(428 + index * 50),
          }}
        >
          {/* 圆点 */}
          <div
            className="rounded-full"
            style={{
              width: rpx(10),
              height: rpx(10),
              backgroundColor: "#756F3F",
            }}
          />
          {/* 文字 */}
          <p
            className="font-josefin-sans font-semibold"
            style={{
              marginLeft: rpx(24),
              fontSize: rpx(20),
              lineHeight: rpx(30),
              color: "#625C2C",
            }}
          >
            {desc}
          </p>
        </div>
      ))}

      {/* 右侧竖条 */}
      <div
        className="absolute"
        style={{
          left: rpx(verticalBarLeft),
          top: rpx(verticalBarTop),
          width: rpx(verticalBarWidth),
          height: rpx(verticalBarHeight),
          backgroundColor: "#756F3F",
          borderRadius: rpx(24),
        }}
      />

      {/* 步骤条 */}
      {steps.slice(0, 6).map((step, index) => {
        const config = stepConfigs[index]
        const isActive = activeIndex === index
        const currentWidth = isActive ? config.width + 54 : config.width
        const bgColor = isActive ? "#E1D784" : "#BEB88B"

        return (
          <motion.div
            key={step.id}
            className="absolute flex items-end cursor-pointer"
            style={{
              left: rpx(stepBarLeft),
              top: rpx(config.y),
              height: rpx(config.height),
              borderRadius: rpx(24),
            }}
            animate={{
              width: rpx(currentWidth),
              backgroundColor: bgColor,
              boxShadow: isActive
                ? "0 6px 20px rgba(0, 0, 0, 0.15)"
                : "0 0 0 rgba(0, 0, 0, 0)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={() => handleStepInteraction(index)}
            onClick={() => handleStepInteraction(index)}
          >
            {/* 序号 */}
            <motion.span
              className="font-montserrat font-bold text-black"
              style={{
                marginLeft: rpx(36),
                marginBottom: rpx(18),
                fontSize: rpx(36),
                lineHeight: 1,
              }}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {index + 1}
            </motion.span>

            {/* 标题 */}
            <motion.span
              className="font-josefin-sans font-semibold text-black"
              style={{
                marginLeft: rpx(20),
                marginBottom: rpx(22),
                fontSize: isActive ? rpx(22) : rpx(20),
                lineHeight: 1,
              }}
              animate={{
                x: isActive ? 4 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              {step.title}
            </motion.span>
          </motion.div>
        )
      })}
    </section>
    </>
  )
}
