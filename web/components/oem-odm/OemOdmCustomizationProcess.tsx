"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, animate, PanInfo } from "framer-motion"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922 // 目标高度
const CONTENT_WIDTH = 1344 // 1920 * 0.7 - 居中内容宽度
const CONTENT_OFFSET_Y = 26 // 内容垂直偏移，使内容居中 (922 - 870) / 2 ≈ 26

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-customization) * ${designValue})`

interface ProcessStep {
  title: string
  lines?: string[] // 支持多行标题
}

interface OemOdmCustomizationProcessProps {
  // 标题
  title?: string
  // 副标题（右侧大字 ENSURE YOUR EVERY STEP）
  tips?: string
  // 提示文字
  hint?: string
  // 流程步骤
  steps?: ProcessStep[]
}

const defaultContent = {
  title: "Customization\nprocess",
  tips: "ENSURE\nYOUR\nEVERY STEP",
  hint: "Hold and\n   slide to view",
  steps: [
    { title: "Talking Over\nWith Customers", lines: ["Talking Over", "With Customers"] },
    { title: "Understand Customers' Demand", lines: ["Understand", "Customers' Demand"] },
    { title: "Sign Sample Contract", lines: ["Sign Sample", "Contract"] },
    { title: "Produce Sample", lines: ["Produce", "Sample"] },
    { title: "Confirm Sample", lines: ["Confirm", "Sample"] },
    { title: "Mass Production", lines: ["Mass", "Production"] },
    { title: "Quality Check", lines: ["Quality", "Check"] },
    { title: "Delivery", lines: ["Delivery"] },
  ],
}

// 轮盘效果配置
// 卡片在虚线椭圆左侧，通过摇杆拖拽实现轮盘滚动效果

// 卡片贴着的椭圆参数（保持原位置，不跟随虚线右移）
// 椭圆圆心在虚线弧线右侧
const ELLIPSE_CENTER_X = 1050
const ELLIPSE_CENTER_Y = 436
const ELLIPSE_RADIUS_X = 218  // 虚线的完整宽度
const ELLIPSE_RADIUS_Y = 416  // 832 / 2

// 卡片距离虚线的间距
const CARD_GAP_FROM_LINE = 15

// 卡片尺寸
const CARD_SMALL = { width: 252, height: 146, fontSize: 22 }
const CARD_LARGE = { width: 326, height: 188, fontSize: 28 }

// 计算卡片在弧线上的位置
// angle: 角度（180度在最左侧中点）
function getCardPosition(angle: number, cardWidth: number) {
  const rad = (angle * Math.PI) / 180

  // 椭圆参数方程计算虚线上的点
  const arcX = ELLIPSE_CENTER_X + ELLIPSE_RADIUS_X * Math.cos(rad)
  const arcY = ELLIPSE_CENTER_Y + ELLIPSE_RADIUS_Y * Math.sin(rad)

  // 卡片右边缘贴着虚线，所以 x 就是弧线上的点减去间距
  const x = arcX - CARD_GAP_FROM_LINE

  return { x, y: arcY }
}

// 计算卡片旋转角度（沿弧线切线方向）
function getCardRotation(angle: number) {
  // 角度越大（上方）卡片向左倾斜，角度越小（下方）卡片向右倾斜
  return (angle - 180) * 0.6
}

export function OemOdmCustomizationProcess({
  title = defaultContent.title,
  tips = defaultContent.tips,
  hint = defaultContent.hint,
  steps = defaultContent.steps,
}: OemOdmCustomizationProcessProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // 轮盘旋转角度（度）
  const wheelRotation = useMotionValue(0)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  // 摇杆速度控制
  const [velocity, setVelocity] = useState(0)
  // 摇杆位置
  const joystickX = useMotionValue(0)
  const joystickY = useMotionValue(0)
  // 摇杆头旋转角度（指向拖拽方向）
  const joystickAngle = useMotionValue(0)

  // 监听旋转角度变化
  useEffect(() => {
    const unsubscribe = wheelRotation.on("change", (value) => {
      setCurrentRotation(value)
    })
    return unsubscribe
  }, [wheelRotation])

  // 使用 requestAnimationFrame 平滑更新轮盘角度（速度控制模式）
  useEffect(() => {
    let animationFrame: number

    const update = () => {
      if (isDragging && Math.abs(velocity) > 0.1) {
        // 摇杆偏移量越大，旋转速度越快
        const current = wheelRotation.get()
        wheelRotation.set(current + velocity)
      }
      animationFrame = requestAnimationFrame(update)
    }

    animationFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrame)
  }, [isDragging, velocity, wheelRotation])

  // 解析标题，按换行分割
  // 最后一行是描边效果，前面的行都是实心填充
  const titleLines = title.split("\n").filter(line => line.trim())
  const titleSolidLines = titleLines.slice(0, -1) // 前面的行 - 实心
  const titleStrokeLine = titleLines[titleLines.length - 1] || "process" // 最后一行 - 描边

  // 摇杆拖拽开始
  const handleJoystickDragStart = () => {
    setIsDragging(true)
  }

  // 摇杆拖拽处理 - 速度控制模式
  const handleJoystickDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // 限制摇杆移动范围（圆形区域）
    const maxRadius = 30
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2)
    const clampedDistance = Math.min(distance, maxRadius)
    const angle = Math.atan2(info.offset.y, info.offset.x)

    const clampedX = clampedDistance * Math.cos(angle)
    const clampedY = clampedDistance * Math.sin(angle)

    joystickX.set(clampedX)
    joystickY.set(clampedY)

    // 摇杆头指向拖拽方向
    const deg = (angle * 180) / Math.PI
    joystickAngle.set(deg + 90) // +90 修正 SVG 初始箭头指向

    // 核心改动：Y轴偏移映射为"速度"而不是"位置"
    // 向下推（正Y）顺时针转，向上推（负Y）逆时针转
    setVelocity(clampedY * 0.15) // 0.15 是灵敏度系数
  }

  // 摇杆拖拽结束 - 回弹到中心，轮盘惯性吸附
  const handleJoystickDragEnd = () => {
    setIsDragging(false)
    setVelocity(0) // 停止动力输入

    // 摇杆回弹到中心
    animate(joystickX, 0, { type: "spring", stiffness: 400, damping: 25 })
    animate(joystickY, 0, { type: "spring", stiffness: 400, damping: 25 })
    animate(joystickAngle, 0, { type: "spring", stiffness: 400, damping: 25 })

    // 轮盘惯性吸附到最近的卡片位置
    const anglePerCard = 26 // 每个卡片间隔的角度
    const currentValue = wheelRotation.get()
    const snappedAngle = Math.round(currentValue / anglePerCard) * anglePerCard

    animate(wheelRotation, snappedAngle, {
      type: "spring",
      stiffness: 150,
      damping: 20,
    })
  }

  // 计算所有卡片的位置和状态
  // 固定显示5张卡片，中间那张对齐椭圆中心
  const getCardPositions = () => {
    const totalSteps = steps.length
    const visibleCount = 5 // 固定显示5张卡片
    const anglePerCard = 26 // 每个卡片间隔的角度
    const centerAngle = 180 // 中心位置角度（椭圆左侧水平位置）

    const cards = []

    // 计算当前中心卡片的索引（基于旋转角度）
    const rotationOffset = currentRotation / anglePerCard
    const centerIndex = Math.round(rotationOffset)

    // 显示中心卡片及其上下各2张
    for (let offset = -2; offset <= 2; offset++) {
      // 计算实际的步骤索引（循环）
      let stepIndex = (centerIndex + offset) % totalSteps
      if (stepIndex < 0) stepIndex += totalSteps

      const step = steps[stepIndex]
      if (!step) continue

      // 计算卡片在弧线上的角度
      // offset=0 表示中心卡片，应该在 centerAngle
      // 加上当前旋转的小数部分实现平滑滚动
      const fractionalOffset = rotationOffset - centerIndex
      const angle = centerAngle - (offset - fractionalOffset) * anglePerCard

      // 中间位置判断
      const distanceFromCenter = Math.abs(offset - fractionalOffset)
      const isCenter = distanceFromCenter < 0.5

      // 确定卡片尺寸
      const cardSize = isCenter ? CARD_LARGE : CARD_SMALL

      // 计算位置（在虚线椭圆左侧）
      const pos = getCardPosition(angle, cardSize.width)

      // 计算卡片旋转（沿切线方向）
      const cardRotation = getCardRotation(angle)

      // 透明度（边缘渐隐）
      const opacity = Math.max(0.3, 1 - distanceFromCenter * 0.35)

      // 缩放（中间大，边缘小）
      const scale = isCenter ? 1 : Math.max(0.8, 1 - distanceFromCenter * 0.1)

      cards.push({
        index: stepIndex,
        step,
        x: pos.x,
        y: pos.y,
        rotation: cardRotation,
        opacity,
        scale,
        isCenter,
        ...cardSize,
        angle,
        offset, // 用于排序
      })
    }

    // 按offset排序，中间的在最上层
    return cards.sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset))
  }

  const cardPositions = getCardPositions()

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-customization" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(DESIGN_HEIGHT) }}>
        {/* 居中内容容器 */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: rpx(CONTENT_OFFSET_Y),
            transform: "translateX(-50%)",
            width: rpx(CONTENT_WIDTH),
            height: rpx(870), // 内容实际高度
          }}
        >
          {/* 右侧装饰椭圆 - 下层 (浅色 #f2f0e5) */}
          <div
            className="absolute rounded-full"
            style={{
              left: rpx(-45),
              top: rpx(92),
              width: rpx(487),
              height: rpx(718),
              backgroundColor: "rgba(236, 233, 213, 0.38)",
              zIndex: 1,
            }}
          />
          {/* 左侧装饰椭圆 - 上层 (深色 #e9e6d4) */}
          <div
            className="absolute rounded-full"
            style={{
              left: rpx(-204),
              top: rpx(92),
              width: rpx(487),
              height: rpx(718),
              backgroundColor: "#e9e6d4",
              zIndex: 2,
            }}
          />


          {/* 右侧渐变弧形 - Vector 3 (大) */}
          <div
            className="absolute"
            style={{
              left: rpx(749),
              top: rpx(270),
              width: rpx(262),
              height: rpx(335),
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 374 479" fill="none" preserveAspectRatio="none">
              <path d="M271.04 192.126C271.04 192.126 60.72 122.821 0 0V479C0 479 87.12 321.965 271.04 280.733V321.965L374 235.991L271.04 145.63V192.126Z" fill="url(#paint0_linear_vector3)" fillOpacity="0.36"/>
              <defs>
                <linearGradient id="paint0_linear_vector3" x1="359.5" y1="240" x2="-47" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D3CB84"/>
                  <stop offset="1" stopColor="#E9DCAD"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 右侧渐变弧形 - Vector 4 (小箭头) */}
          <div
            className="absolute"
            style={{
              left: rpx(793),
              top: rpx(342),
              width: rpx(149),
              height: rpx(191),
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 213 273" fill="none" preserveAspectRatio="none">
              <path d="M154 109.5C154 109.5 34.5 70 0 0V273C0 273 49.5 183.5 154 160V183.5L212.5 134.5L154 83V109.5Z" fill="url(#paint0_linear_vector4)"/>
              <defs>
                <linearGradient id="paint0_linear_vector4" x1="141.744" y1="136.527" x2="-255.256" y2="136.527" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFDC6"/>
                  <stop offset="1" stopColor="#D2CAAD" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 右侧渐变虚线半椭圆 - Subtract */}
          <div
            className="absolute"
            style={{
              left: rpx(852),
              top: rpx(20),
              width: rpx(218),
              height: rpx(832),
              zIndex: 5,
            }}
          >
            <img
              src="/images/oem-odm/subtract-arc.svg"
              alt=""
              className="w-full h-full"
            />
          </div>

          {/* 箭头上方的圆形按钮 - 在虚线上，与箭头垂直居中 */}
          <div
            className="absolute"
            style={{
              // 虚线左边缘 852，按钮宽度 66，居中放置在虚线上
              left: rpx(852 - 33),
              // 与两个箭头垂直居中对齐（箭头中心约 437）
              top: rpx(437 - 33),
              width: rpx(66),
              height: rpx(66),
              zIndex: 6,
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 94 94" fill="none">
              <defs>
                <filter id="filter0_d_button" x="0" y="0" width="93.2" height="93.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="4"/>
                  <feGaussianBlur stdDeviation="6.3"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <linearGradient id="paint0_button_outer" x1="46.6" y1="8.6" x2="46.6" y2="76.6" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D7CC74"/>
                  <stop offset="1" stopColor="#7D7643"/>
                </linearGradient>
                <linearGradient id="paint1_button_inner" x1="46.6" y1="24.6" x2="46.6" y2="60.6" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7D7643"/>
                  <stop offset="1" stopColor="#D7CC74"/>
                </linearGradient>
              </defs>
              <g filter="url(#filter0_d_button)">
                <circle cx="46.6" cy="42.6" r="34" fill="url(#paint0_button_outer)"/>
                <circle cx="46.6" cy="42.6" r="18" fill="url(#paint1_button_inner)"/>
              </g>
            </svg>
          </div>

          {/* 左侧标题 - 实心填充部分 (除最后一行外的所有行) */}
          <motion.div
            className="absolute"
            style={{
              left: rpx(107),
              top: rpx(50),
              zIndex: 5,
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-anaheim font-extrabold"
              style={{
                fontSize: rpx(90),
                lineHeight: rpx(90),
                color: "#413B06",
              }}
            >
              {titleSolidLines.map((line, index) => (
                <span key={index} className="flex items-baseline gap-2">
                  {line}
                  {/* 在最后一行文字后添加 X 图标 */}
                  {index === titleSolidLines.length - 1 && (
                    <svg
                      style={{
                        width: rpx(36),
                        height: rpx(36),
                        marginLeft: rpx(10),
                        flexShrink: 0,
                      }}
                      viewBox="0 0 52 52"
                      fill="none"
                    >
                      <path d="M36.5142 25.967L51.3344 40.6897C52.0601 41.4106 52.2166 42.4298 51.6839 42.9662L43.1354 51.5728C42.6027 52.1092 41.5826 51.9595 40.8569 51.2386L26.0368 36.5161L11.319 51.3344C10.5982 52.0601 9.5792 52.2166 9.04298 51.6839L0.438084 43.1355C-0.0981561 42.6027 0.0514422 41.5826 0.772211 40.8569L15.4899 26.0386L0.665549 11.3118C-0.0601414 10.5909 -0.216576 9.57167 0.316144 9.03533L8.86455 0.428656C9.39727 -0.107691 10.4174 0.0419398 11.1431 0.762852L25.9674 15.4896L40.6908 0.665554C41.4116 -0.0601398 42.4306 -0.216577 42.9668 0.316141L51.5717 8.86456C52.1079 9.39726 51.9583 10.4174 51.2376 11.1431L36.5142 25.967Z" fill="#756F3F"/>
                    </svg>
                  )}
                </span>
              ))}
            </h2>
          </motion.div>

          {/* 左侧标题 - 描边效果 (最后一行) - 双层实现 */}
          {/* 底层文字: #f2f0e5 颜色（浅色椭圆上显示） */}
          <motion.span
            className="absolute font-anaheim font-extrabold"
            style={{
              left: rpx(107),
              top: rpx(50 + titleSolidLines.length * 90 + 180),
              fontSize: rpx(90),
              lineHeight: rpx(46),
              color: "#f2f0e5",
              textShadow: `
                -1.5px -1.5px 0 #423B06,
                1.5px -1.5px 0 #423B06,
                -1.5px 1.5px 0 #423B06,
                1.5px 1.5px 0 #423B06,
                0px -1.5px 0 #423B06,
                0px 1.5px 0 #423B06,
                -1.5px 0px 0 #423B06,
                1.5px 0px 0 #423B06
              `,
              zIndex: 3,
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {titleStrokeLine}
          </motion.span>
          {/* 上层文字: #e9e6d4 颜色，用左侧深色椭圆 overflow-hidden 裁剪 */}
          <div
            className="absolute overflow-hidden pointer-events-none rounded-full"
            style={{
              left: rpx(-204),
              top: rpx(92),
              width: rpx(487),
              height: rpx(718),
              zIndex: 4,
            }}
          >
            <motion.span
              className="absolute font-anaheim font-extrabold whitespace-nowrap"
              style={{
                left: rpx(311), // 107 - (-204)
                top: rpx(50 + titleSolidLines.length * 90 + 180 - 92),
                fontSize: rpx(90),
                lineHeight: rpx(46),
                color: "#e9e6d4",
                textShadow: `
                  -1.5px -1.5px 0 #423B06,
                  1.5px -1.5px 0 #423B06,
                  -1.5px 1.5px 0 #423B06,
                  1.5px 1.5px 0 #423B06,
                  0px -1.5px 0 #423B06,
                  0px 1.5px 0 #423B06,
                  -1.5px 0px 0 #423B06,
                  1.5px 0px 0 #423B06
                `,
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {titleStrokeLine}
            </motion.span>
          </div>

          {/* 右侧副标题 */}
          <motion.div
            className="absolute"
            style={{
              left: rpx(978),
              top: rpx(379),
              width: rpx(220),
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 底层描边 */}
            <span
              className="absolute font-anaheim font-bold text-center whitespace-pre-line"
              style={{
                fontSize: rpx(45),
                lineHeight: rpx(39),
                color: "transparent",
                WebkitTextStroke: `0.7px #4F4705`,
                top: rpx(1),
                left: rpx(2),
              }}
            >
              {tips}
            </span>
            {/* 上层渐变填充 */}
            <span
              className="relative font-anaheim font-bold text-center block whitespace-pre-line"
              style={{
                fontSize: rpx(45),
                lineHeight: rpx(39),
                background: "linear-gradient(180deg, #756F3F 5.44%, #B3B08D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {tips}
            </span>
          </motion.div>

          {/* 提示文字 - Hold and slide to view */}
          <motion.div
            className="absolute"
            style={{
              left: rpx(978),
              top: rpx(736),
              width: rpx(129),
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p
              className="font-anaheim font-semibold whitespace-pre-line"
              style={{
                fontSize: rpx(17),
                lineHeight: rpx(22),
                color: "#BAB379",
              }}
            >
              {hint}
            </p>
          </motion.div>

          {/* 摇杆控制器 */}
          <motion.div
            className="absolute z-20"
            style={{
              left: rpx(990),
              top: rpx(650),
              width: rpx(80),
              height: rpx(80),
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* 摇杆底座（外圈） */}
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "#BAB379" }}
            />
            {/* 可拖拽的摇杆头 */}
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: "50%",
                top: "50%",
                width: rpx(54),
                height: rpx(54),
                marginLeft: `calc(${rpx(54)} / -2)`,
                marginTop: `calc(${rpx(54)} / -2)`,
                x: joystickX,
                y: joystickY,
                rotate: joystickAngle, // 摇杆头指向拖拽方向
              }}
              drag
              dragConstraints={{ top: -30, bottom: 30, left: -30, right: 30 }}
              dragElastic={0}
              onDragStart={handleJoystickDragStart}
              onDrag={handleJoystickDrag}
              onDragEnd={handleJoystickDragEnd}
              whileTap={{ scale: 1.1 }}
            >
              <svg width="100%" height="100%" viewBox="0 0 77 77" fill="none">
                <circle cx="38.5" cy="38.5" r="38" transform="matrix(-1 0 0 1 77 0)" stroke="#BAB379"/>
                <path d="M33.876 59.1771L57.063 53.1223L51.0082 29.9353L46.1133 38.2901C21.0489 23.6053 25.0788 11.9381 25.0788 11.9381C25.0788 11.9381 13.7065 36.1375 38.7709 50.8223L33.876 59.1771Z" fill="#BAB379"/>
              </svg>
            </motion.div>
          </motion.div>

          {/* 卡片容器 */}
          <div
            ref={containerRef}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {/* 流程卡片 - 轮盘滚动布局，固定5张 */}
            {cardPositions.map((card) => {
              if (!card.step) return null

              // 根据位置计算渐变效果（上方和下方的卡片有渐隐效果）
              const isTopEdge = card.offset <= -1.5
              const isBottomEdge = card.offset >= 1.5
              const gradientStyle = isTopEdge
                ? "linear-gradient(135deg, rgba(117, 111, 63, 0) 16.79%, rgba(117, 111, 63, 0.58) 29.14%, #7D7744 53.12%, #948B55 71.79%, #CC9B7D 100%)"
                : isBottomEdge
                ? "linear-gradient(135deg, #CC9B7D 0%, #948B55 28.2%, #7D7644 46.9%, #756F3F 70.9%, rgba(117, 111, 63, 0) 83.2%)"
                : "linear-gradient(135deg, #756F3F 0%, #CCC37D 100%)"

              // 计算旋转角度
              const rotation = (card.angle - 180) * 0.6

              return (
                <motion.div
                  key={`card-${card.index}-${card.offset}`}
                  className="absolute"
                  style={{
                    // left/top 设置为弧线上的点
                    left: rpx(card.x),
                    top: rpx(card.y),
                    width: rpx(card.width),
                    height: rpx(card.height),
                    borderRadius: rpx(21),
                    background: gradientStyle,
                    // 旋转中心设为右边缘中点，卡片像"挂"在虚线上
                    transformOrigin: "right center",
                    x: "-100%",  // 将卡片向左偏移，使其右侧紧贴弧线
                    y: "-50%",   // 垂直居中
                    rotate: rotation,
                    scale: card.scale,
                    opacity: card.opacity,
                    zIndex: card.isCenter ? 15 : 10 - Math.abs(card.offset),
                    boxShadow: card.isCenter ? "0px 10px 30px rgba(0,0,0,0.1)" : "none",
                  }}
                  whileHover={{ scale: card.scale * 1.03 }}
                >
                  {/* 卡片标题 */}
                  <div
                    className="absolute flex flex-col items-center justify-center"
                    style={{
                      top: rpx(card.isCenter ? 28 : 21),
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: rpx(card.isCenter ? 247 : 180),
                    }}
                  >
                    <p
                      className="font-anaheim font-semibold text-white text-center whitespace-pre-line"
                      style={{
                        fontSize: rpx(card.fontSize),
                        lineHeight: rpx(card.isCenter ? 27 : 23),
                      }}
                    >
                      {card.step.lines ? card.step.lines.join("\n") : card.step.title}
                    </p>
                  </div>

                  {/* 卡片底部箭头装饰 */}
                  <div
                    className="absolute"
                    style={{
                      bottom: rpx(14),
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: rpx(card.isCenter ? 31 : 24),
                      height: rpx(card.isCenter ? 31 : 24),
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 44 44" fill="none">
                      <path d="M32.5409 20.1681L22.8595 30.0545C22.7126 30.2059 22.536 30.3254 22.3408 30.4055C22.1457 30.4856 21.9361 30.5246 21.7252 30.5201C21.5143 30.5156 21.3065 30.4677 21.1149 30.3794C20.9234 30.291 20.752 30.1642 20.6117 30.0067L11.3785 19.6993C11.2436 19.5488 11.1397 19.3732 11.0727 19.1825C11.0058 18.9918 10.977 18.7898 10.9881 18.588C11.0105 18.1805 11.1938 17.7985 11.4979 17.5261C11.8019 17.2538 12.2016 17.1134 12.6092 17.1357C13.0167 17.1581 13.3987 17.3415 13.6711 17.6455L21.8334 26.7234L30.356 18.019C30.4971 17.8743 30.6654 17.7589 30.8511 17.6792C31.0369 17.5996 31.2365 17.5573 31.4386 17.5548C31.6407 17.5524 31.8413 17.5897 32.029 17.6647C32.2166 17.7398 32.3877 17.851 32.5323 17.9922C32.677 18.1333 32.7924 18.3016 32.8721 18.4873C32.9517 18.6731 32.994 18.8727 32.9965 19.0748C32.9989 19.2769 32.9616 19.4775 32.8866 19.6651C32.8115 19.8528 32.7003 20.0238 32.5591 20.1685L32.5409 20.1681ZM22.4022 0.00490742C18.0647 -0.0874211 13.7974 1.10852 10.1396 3.44148C6.48191 5.77445 3.59814 9.13967 1.85298 13.1116C0.107827 17.0835 -0.420329 21.4837 0.335303 25.7558C1.09094 30.0279 3.09642 33.98 6.09815 37.1123C9.09987 40.2446 12.963 42.4164 17.1991 43.3531C21.4351 44.2899 25.8538 43.9494 29.8964 42.3749C33.939 40.8003 37.4239 38.0624 39.9104 34.5072C42.3969 30.9521 43.7734 26.7395 43.8657 22.4021C43.9895 16.5858 41.7977 10.9585 37.7725 6.75825C33.7473 2.55797 28.2184 0.128716 22.4022 0.00490742Z" fill="#756F3F"/>
                    </svg>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-10">
        {/* 标题 */}
        <div className="mb-8">
          {/* 实心填充部分 */}
          <h2
            className="font-anaheim font-extrabold text-4xl mb-2"
            style={{ color: "#413B06" }}
          >
            {titleSolidLines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h2>
          {/* 描边部分 (最后一行) */}
          <span
            className="font-anaheim font-extrabold text-4xl"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px #423B06",
            }}
          >
            {titleStrokeLine}
          </span>
        </div>

        {/* 副标题 */}
        <p
          className="font-anaheim font-bold text-xl text-right mb-6 whitespace-pre-line"
          style={{
            background: "linear-gradient(180deg, #756F3F 5.44%, #B3B08D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {tips}
        </p>

        {/* 流程卡片 - 垂直列表 */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, #756F3F 0%, #CCC37D 100%)",
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-anaheim font-bold text-2xl"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-anaheim font-semibold text-white text-lg flex-1">
                  {step.lines ? step.lines.join(" ") : step.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OemOdmCustomizationProcess
