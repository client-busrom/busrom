"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1360

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-partner) * ${designValue})`

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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface PartnerItem {
  title: string
}

interface OemOdmPartnerProps {
  // 标题
  title?: string
  // 合作理由列表
  items?: PartnerItem[]
  // 右侧图片（3张堆叠）
  images?: (MediaObject | null)[]
}

const defaultContent = {
  title: "Why Partner with Busrom OEM?",
  items: [
    { title: "Innovative Products Backed by Busrom Expert R&D" },
    { title: "Relentless Quality Assurance Driven by Rigorous Standards" },
    { title: "Customization Flexibility Through Agile Manufacturing" },
    { title: "Proven Solutions Trusted in Global Markets" },
    { title: "Sustainable Manufacturing Rooted in Eco-Conscious Practices" },
  ],
}

// 图片卡片配置 - 3个位置的旋转角度和层级
const cardConfigs = [
  { rotate: -2.4, top: 510, zIndex: 3, shadow: "0 4px 37px rgba(0,0,0,0.33)" }, // 最上层
  { rotate: 5, top: 490, zIndex: 2, shadow: "0 4px 24px rgba(0,0,0,0.26)" },    // 中间层
  { rotate: 11, top: 483, zIndex: 1, shadow: "0 4px 24px rgba(0,0,0,0.26)" },   // 最底层
]

export function OemOdmPartner({
  title = defaultContent.title,
  items = defaultContent.items,
  images = [],
}: OemOdmPartnerProps) {
  // 管理图片顺序 [0, 1, 2] 表示 images[0] 在最上层, images[1] 在中间, images[2] 在最底层
  const [imageOrder, setImageOrder] = useState([0, 1, 2])
  // 当前高亮的item索引
  const [activeItemIndex, setActiveItemIndex] = useState(0)
  // 是否暂停自动轮播（悬停时暂停）
  const [isPaused, setIsPaused] = useState(false)

  // 循环切牌效果 - 每3秒切换一次
  useEffect(() => {
    if (images.length < 3) return

    const interval = setInterval(() => {
      setImageOrder((prev) => {
        // 最上层的牌移到最底层: [0,1,2] -> [1,2,0] -> [2,0,1] -> [0,1,2]
        return [prev[1], prev[2], prev[0]]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  // 左侧item自动轮播 - 每2秒切换一次
  useEffect(() => {
    if (isPaused || items.length === 0) return

    const interval = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % items.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

  return (
    <section
      className="relative w-full"
      style={{
        ["--rpx-partner" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(DESIGN_HEIGHT) }}>
        {/* 左上角装饰 SVG - 连接上一个板块 */}
        <div
          className="absolute overflow-visible"
          style={{
            left: rpx(-100),
            top: rpx(-200),
            width: rpx(600),
            height: rpx(600),
            opacity: 0.3,
          }}
        >
          {/* 外圈虚线 - 旋转动画 */}
          <svg
            className="absolute animate-spin-slow"
            width="100%"
            height="100%"
            viewBox="0 0 600 600"
            fill="none"
            style={{ transformOrigin: 'center center' }}
          >
            <circle
              cx="300"
              cy="300"
              r="288"
              stroke="#4D460D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40 40"
            />
          </svg>
          {/* 中间箭头 - 浮动动画 */}
          <motion.svg
            className="absolute"
            width="100%"
            height="100%"
            viewBox="0 0 600 600"
            fill="none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              transform="translate(105, 8)"
              d="M288.51 364.863L288.613 364.726C289.949 362.888 290.692 360.686 290.743 358.415L290.745 358.282L290.742 358.319C290.804 357.449 290.78 356.576 290.673 355.711L290.64 355.466L274.647 243.57C273.6 236.242 266.811 231.158 259.485 232.214L259.266 232.247C252.059 233.406 247.081 240.138 248.118 247.391L259.841 329.408L115.163 221.051C110.223 217.351 103.214 218.361 99.5098 223.307L98.5704 224.561C94.9977 229.499 96.0285 236.405 100.92 240.069L245.597 348.426L163.594 360.247C156.269 361.303 151.18 368.097 152.227 375.424C153.274 382.751 160.062 387.836 167.388 386.78L279.274 370.652L279.509 370.616C280.291 370.488 281.061 370.293 281.808 370.03L281.997 369.962L281.961 369.973C284.249 369.285 286.255 367.88 287.684 365.966L288.51 364.863Z"
              fill="#4D460D"
            />
          </motion.svg>
        </div>

        {/* 标题 - Why Partner with Busrom OEM? */}
        <motion.h2
          className="absolute font-anaheim font-bold text-white text-center w-full"
          style={{
            left: 0,
            top: rpx(342),
            fontSize: rpx(60),
            lineHeight: rpx(71), // 101 * 0.7
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>

        {/* 左侧列表项 - 整体缩放70%，自动轮播/悬停高亮 */}
        {items.map((item, index) => {
          const isActive = index === activeItemIndex

          return (
            <motion.div
              key={index}
              className="absolute cursor-pointer"
              style={{
                left: rpx(253),
                top: rpx(540 + index * 109),
                width: rpx(800),
                height: rpx(130 * 0.7),
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => {
                setIsPaused(true)
                setActiveItemIndex(index)
              }}
              onMouseLeave={() => {
                setIsPaused(false)
              }}
            >
              {/* 背景条 */}
              <motion.div
                className="absolute inset-0"
                style={{
                  borderRadius: rpx(21),
                }}
                animate={{
                  backgroundColor: isActive ? "#6B6530" : "#544F24",
                }}
                transition={{ duration: 0.3 }}
              />
              {/* 文字 */}
              <motion.p
                className="absolute font-anaheim text-white"
                style={{
                  left: rpx(27),
                  top: "50%",
                  transform: "translateY(-50%)",
                  lineHeight: rpx(32),
                }}
                animate={{
                  fontSize: isActive ? `calc(var(--rpx-partner) * 24)` : `calc(var(--rpx-partner) * 20)`,
                  fontWeight: isActive ? 700 : 500,
                }}
                transition={{ duration: 0.3 }}
              >
                {item.title}
              </motion.p>
              {/* 序号 */}
              <motion.span
                className="absolute font-anaheim font-bold"
                style={{
                  left: rpx(740),
                  top: rpx(-35),
                  fontSize: rpx(70),
                  lineHeight: rpx(71),
                }}
                animate={{
                  color: isActive ? "#C4BC7A" : "#9B9359",
                }}
                transition={{ duration: 0.3 }}
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>
              {/* 竖线装饰 - 锚点在中心，逆时针旋转65度 */}
              <motion.div
                className="absolute"
                style={{
                  left: rpx(758),
                  top: rpx(10),
                  width: rpx(2),
                  height: rpx(80),
                  transform: "rotate(-65deg)",
                  transformOrigin: "center center",
                }}
                animate={{
                  backgroundColor: isActive ? "#C4BC7A" : "#9B9359",
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )
        })}

        {/* 右侧堆叠图片 - 循环切牌效果 */}
        {/* imageOrder[0] = 最上层的图片索引, imageOrder[1] = 中间层, imageOrder[2] = 最底层 */}
        {imageOrder.map((imageIndex, position) => {
          const image = images[imageIndex]
          if (!image) return null
          const config = cardConfigs[position]

          return (
            <motion.div
              key={imageIndex}
              className="absolute overflow-hidden"
              style={{
                left: rpx(1200),
                width: rpx(622 * 0.7),
                height: rpx(775 * 0.7),
                borderRadius: rpx(21),
                transformOrigin: "left bottom",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                top: `calc(var(--rpx-partner) * ${config.top})`,
                rotate: config.rotate,
                zIndex: config.zIndex,
                boxShadow: config.shadow,
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {image.enableLink && image.linkUrl ? (
                <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  <OptimizedImage
                    image={image as any}
                    alt={`Partner Image ${imageIndex + 1}`}
                    size="large"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={image as any}
                  alt={`Partner Image ${imageIndex + 1}`}
                  size="large"
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* 标题 */}
        <h2 className="font-anaheim font-bold text-white text-2xl mb-6 text-right">
          {title}
        </h2>

        {/* 图片堆叠 - 循环切牌效果 */}
        <div className="relative h-[300px] mb-8">
          {imageOrder.map((imageIndex, position) => {
            const image = images[imageIndex]
            if (!image) return null
            // 移动端配置
            const mobileConfigs = [
              { rotate: 2, right: "20%", top: "0%", zIndex: 3, shadow: "0 4px 20px rgba(0,0,0,0.33)" },
              { rotate: -4, right: "15%", top: "5%", zIndex: 2, shadow: "0 4px 16px rgba(0,0,0,0.26)" },
              { rotate: -8, right: "10%", top: "10%", zIndex: 1, shadow: "0 4px 16px rgba(0,0,0,0.26)" },
            ]
            const config = mobileConfigs[position]

            return (
              <motion.div
                key={imageIndex}
                className="absolute overflow-hidden rounded-2xl"
                style={{
                  width: "70%",
                  height: "80%",
                }}
                animate={{
                  right: config.right,
                  top: config.top,
                  rotate: config.rotate,
                  zIndex: config.zIndex,
                  boxShadow: config.shadow,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {image.enableLink && image.linkUrl ? (
                  <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                    <OptimizedImage
                      image={image as any}
                      alt={`Partner Image ${imageIndex + 1}`}
                      size="medium"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={image as any}
                    alt={`Partner Image ${imageIndex + 1}`}
                    size="medium"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 列表项 - 自动轮播高亮 */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isActive = index === activeItemIndex

            return (
              <motion.div
                key={index}
                className="relative rounded-xl px-4 py-3"
                animate={{
                  backgroundColor: isActive ? "#6B6530" : "#544F24",
                }}
                transition={{ duration: 0.3 }}
                onTouchStart={() => {
                  setIsPaused(true)
                  setActiveItemIndex(index)
                }}
                onTouchEnd={() => {
                  setIsPaused(false)
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="font-anaheim font-bold text-2xl"
                    animate={{
                      color: isActive ? "#C4BC7A" : "#9B9359",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>
                  <motion.p
                    className="font-anaheim text-white flex-1"
                    animate={{
                      fontSize: isActive ? "16px" : "14px",
                      fontWeight: isActive ? 700 : 500,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.title}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default OemOdmPartner
