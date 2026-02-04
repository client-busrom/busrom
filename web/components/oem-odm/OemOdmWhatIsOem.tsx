"use client"

import React from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 490 // 700 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-what-is-oem) * ${designValue})`

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

// 文本片段接口 - 支持格式化
interface TextSegment {
  text: string
  bold?: boolean
  underline?: boolean
}

interface OemOdmWhatIsOemProps {
  // 左侧图片
  image?: MediaObject | null
  // 副标题 - You Design, We Manufacture
  subtitle?: string
  // 描述文字 - 支持格式化
  descriptionSegments?: TextSegment[]
  // What Is OEM 标题
  title?: string
}

const defaultContent = {
  subtitle: "You Design, We Manufacture",
  descriptionSegments: [
    { text: "When you provide your own designs and technical specifications, we serve as your manufacturing partner. Busrom produces precision components—exactly to your requirements—ensuring consistency, quality, and reliability. You maintain full control over design and branding, while we bring your vision to life with our advanced manufacturing expertise." },
  ] as TextSegment[],
}

export function OemOdmWhatIsOem({
  image,
  subtitle = defaultContent.subtitle,
  descriptionSegments = defaultContent.descriptionSegments,
  title = "What Is OEM",
}: OemOdmWhatIsOemProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-what-is-oem" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(DESIGN_HEIGHT) }}>
        {/* 居中内容容器 */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: rpx(1344), // 1920 * 0.7
            height: rpx(DESIGN_HEIGHT),
          }}
        >
        {/* 左侧图片 */}
        <motion.div
          className="absolute overflow-hidden"
          style={{
            left: rpx(111), // 159 * 0.7
            top: rpx(64), // 92 * 0.7
            width: rpx(507), // 724 * 0.7
            height: rpx(376), // 537 * 0.7
            borderRadius: rpx(21), // 30 * 0.7
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {image && (
            <OptimizedImage
              image={image as any}
              alt="What Is OEM"
              size="large"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* 问号装饰 - 贴住 What Is OEM 标题右侧 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(1230), // 1757 * 0.7
            top: rpx(50), // 72 * 0.7
            width: rpx(74), // 106 * 0.7
            height: rpx(112), // 160 * 0.7
            zIndex: 15,
          }}
          initial={{ opacity: 0, scale: 0.8, rotate: -17 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
            rotate: [-17, -22, -12, -17],
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.2 },
            scale: { duration: 0.5, delay: 0.2 },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            },
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 106 160" fill="none" preserveAspectRatio="none">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#847D48"
              fontSize="160"
              fontFamily="Anaheim"
              fontWeight="bold"
            >
              ?
            </text>
          </svg>
        </motion.div>

        {/* What Is OEM 标题 - 右对齐，text-shadow 模拟外描边 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(715), // 1022 * 0.7
            top: rpx(64), // 92 * 0.7
            width: rpx(515), // 735 * 0.7
            height: rpx(116), // 165 * 0.7
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span
            className="font-anaheim font-bold block text-right"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(51), // 73 * 0.7
              color: "#756F3F",
              textShadow: `
                -2px -2px 0 #FFEE68,
                2px -2px 0 #FFEE68,
                -2px 2px 0 #FFEE68,
                2px 2px 0 #FFEE68,
                0px -2px 0 #FFEE68,
                0px 2px 0 #FFEE68,
                -2px 0px 0 #FFEE68,
                2px 0px 0 #FFEE68
              `,
            }}
          >
            {title}
          </span>
        </motion.div>

        {/* You Design, We Manufacture - 在 What Is OEM 下方 */}
        <motion.p
          className="absolute font-anaheim font-semibold text-white text-right"
          style={{
            left: rpx(890), // 1271 * 0.7
            top: rpx(171), // 244 * 0.7
            width: rpx(340), // 486 * 0.7
            fontSize: rpx(28), // 40 * 0.7
            lineHeight: rpx(39), // 56 * 0.7
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {subtitle}
        </motion.p>

        {/* 右下角毛玻璃卡片 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(503), // 719 * 0.7
            top: rpx(230), // 328 * 0.7
            width: rpx(727), // 1038 * 0.7
            height: rpx(169), // 241 * 0.7
            borderRadius: rpx(21), // 30 * 0.7
            backgroundColor: "rgba(57, 51, 7, 0.5)",
            backdropFilter: "blur(42px)", // 59.5 * 0.7
            WebkitBackdropFilter: "blur(42px)",
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* 描述文字 */}
          <p
            className="absolute font-anaheim text-white"
            style={{
              left: rpx(39), // 56 * 0.7
              top: rpx(25), // 36 * 0.7
              width: rpx(647), // 924 * 0.7
              fontSize: rpx(17), // 24 * 0.7
              lineHeight: rpx(23), // 33 * 0.7
              textAlign: "justify",
            }}
          >
            {descriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.bold) {
                return (
                  <span
                    key={index}
                    className="font-anaheim font-bold"
                    style={{
                      fontSize: rpx(20), // 28 * 0.7
                      color: "#FFEC50",
                    }}
                  >
                    {segment.text}
                  </span>
                )
              }
              return <span key={index}>{segment.text}</span>
            })}
          </p>
        </motion.div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* What Is OEM 标题 */}
        <h2
          className="font-anaheim font-bold text-3xl mb-4 text-right"
          style={{
            color: "transparent",
            WebkitTextStroke: "1.5px #FFEE68",
          }}
        >
          {title}
        </h2>

        {/* 图片 */}
        {image && (
          <div className="relative w-full aspect-[724/537] rounded-2xl overflow-hidden mb-4">
            <OptimizedImage
              image={image as any}
              alt="What Is OEM"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 毛玻璃卡片 */}
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(57, 51, 7, 0.5)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          <p className="font-anaheim font-semibold text-white text-lg mb-2">
            {subtitle}
          </p>
          <p className="font-anaheim text-white text-sm leading-relaxed">
            {descriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.bold) {
                return (
                  <span
                    key={index}
                    className="font-bold"
                    style={{ color: "#FFEC50" }}
                  >
                    {segment.text}
                  </span>
                )
              }
              return <span key={index}>{segment.text}</span>
            })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default OemOdmWhatIsOem
