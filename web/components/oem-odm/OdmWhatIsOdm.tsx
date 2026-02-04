"use client"

import React from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 490 // 700 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-what-is-odm) * ${designValue})`

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

interface OdmWhatIsOdmProps {
  // 左侧图片
  image?: MediaObject | null
  // 副标题 - We Design & Manufacture, You Brand
  subtitle?: string
  // 描述文字 - 支持格式化
  descriptionSegments?: TextSegment[]
}

const defaultContent = {
  subtitle: "We Design & Manufacture, You Brand",
  descriptionSegments: [
    { text: "If you need a complete ready-to-market product, Busrom can provide end-to-end solutions. Our in-house R&D team designs and engineers innovative glass hardware products. You can customize these designs further or adopt them as your own—under your brand. This approach speeds up time-to-market and reduces your development costs." },
  ] as TextSegment[],
}

export function OdmWhatIsOdm({
  image,
  subtitle = defaultContent.subtitle,
  descriptionSegments = defaultContent.descriptionSegments,
}: OdmWhatIsOdmProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-what-is-odm" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
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
            left: rpx(107), // 153 * 0.7
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
              alt="What Is ODM"
              size="large"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* 问号装饰 - 贴住 What Is ODM 标题右侧 */}
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

        {/* What Is ODM 标题 - 右对齐，text-shadow 模拟外描边 */}
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
              color: "#efecd0",
              textShadow: `
                -2px -2px 0 #5F5716,
                2px -2px 0 #5F5716,
                -2px 2px 0 #5F5716,
                2px 2px 0 #5F5716,
                0px -2px 0 #5F5716,
                0px 2px 0 #5F5716,
                -2px 0px 0 #5F5716,
                2px 0px 0 #5F5716
              `,
            }}
          >
            What Is ODM
          </span>
        </motion.div>

        {/* We Design & Manufacture, You Brand - 在 What Is ODM 下方 */}
        <motion.p
          className="absolute font-anaheim font-semibold text-right"
          style={{
            left: rpx(755), // 1079 * 0.7
            top: rpx(171), // 244 * 0.7
            width: rpx(475), // 678 * 0.7
            fontSize: rpx(28), // 40 * 0.7
            lineHeight: rpx(39), // 56 * 0.7
            color: "#756F3F",
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
            backgroundColor: "rgba(163, 153, 80, 0.64)",
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
            className="absolute font-anaheim"
            style={{
              left: rpx(31), // 44 * 0.7
              top: rpx(21), // 30 * 0.7
              width: rpx(665), // 950 * 0.7
              fontSize: rpx(17), // 24 * 0.7
              lineHeight: rpx(27), // 38 * 0.7
              textAlign: "justify",
              color: "#3B3529",
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
        {/* What Is ODM 标题 */}
        <h2
          className="font-anaheim font-bold text-3xl mb-4 text-right"
          style={{
            color: "#59542A",
            WebkitTextStroke: "1.5px #5F5716",
          }}
        >
          What Is ODM
        </h2>

        {/* 图片 */}
        {image && (
          <div className="relative w-full aspect-[724/537] rounded-2xl overflow-hidden mb-4">
            <OptimizedImage
              image={image as any}
              alt="What Is ODM"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 毛玻璃卡片 */}
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(163, 153, 80, 0.64)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          <p
            className="font-anaheim font-semibold text-lg mb-2"
            style={{ color: "#756F3F" }}
          >
            {subtitle}
          </p>
          <p
            className="font-anaheim text-sm leading-relaxed"
            style={{ color: "#3B3529" }}
          >
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

export default OdmWhatIsOdm
