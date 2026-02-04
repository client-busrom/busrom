"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1081

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-oem-odm) * ${designValue})`

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

interface OemOdmHeroSectionProps {
  // 主标题各行
  titleLine1?: string
  titleLine2?: string
  titleLine3?: string
  titleLine4?: string
  titleLine5?: string
  titleLine6?: string
  // 左侧描述文本
  description?: string
  // 右侧特性文字
  feature1?: string
  feature2?: string
  feature3?: string
  // 右侧描述文本
  rightDescription?: string
  // 图片
  leftImage?: MediaObject | null
  rightImage?: MediaObject | null
  // 顶部标签
  topLabel?: string
}

// 默认文本内容
const defaultContent = {
  titleLine1: "CUSTOMIZED",
  titleLine2: "GLASS",
  titleLine3: "HARDWARE",
  titleLine4: "SOLUTIONS FOR",
  titleLine5: "BUILDING",
  titleLine6: "PROJECTS",
  description: "We Are Committed To More Than Just Delivering Premium Glass Hardware Products—We Provide Comprehensive Support To Ensure A Smooth And Hassle-Free Experience. From Expert Guidance To Responsive After-Sales Assistance, Our Services Are Designed To Meet The Unique Needs Of Dealers, And Contractors Alike, Helping You Achieve The Best Results With Confidence.",
  feature1: "PROFESSIONAL",
  feature2: "EFFICIENT",
  feature3: "RELIABLE",
  rightDescription: "For Dealers, Contractors Or Architect, We Provide Bulk Order Assistance, Product Training, And Technical...",
  topLabel: "OEM/ODM",
}

export function OemOdmHeroSection({
  titleLine1 = defaultContent.titleLine1,
  titleLine2 = defaultContent.titleLine2,
  titleLine3 = defaultContent.titleLine3,
  titleLine4 = defaultContent.titleLine4,
  titleLine5 = defaultContent.titleLine5,
  titleLine6 = defaultContent.titleLine6,
  description = defaultContent.description,
  feature1 = defaultContent.feature1,
  feature2 = defaultContent.feature2,
  feature3 = defaultContent.feature3,
  rightDescription = defaultContent.rightDescription,
  leftImage,
  rightImage,
  topLabel = defaultContent.topLabel,
}: OemOdmHeroSectionProps) {
  // Calculate object position from focal point
  const getObjectPosition = (image?: MediaObject | null) =>
    image?.cropFocalPoint
      ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
      : "center"

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: rpx(DESIGN_HEIGHT),
        ["--rpx-oem-odm" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(600px / ${DESIGN_HEIGHT}), calc(100vh / ${DESIGN_HEIGHT})))`,
      }}
    >
      {/* 背景 - 左侧深色 + 右侧黄色 */}
      <div className="absolute inset-0">
        {/* 左侧深灰绿色背景 - 约60% */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: "60%",
            backgroundColor: "#4A4A3D",
          }}
        />
        {/* 右侧黄色背景 - 约40% */}
        <div
          className="absolute right-0 top-0 bottom-0"
          style={{
            width: "45%",
            backgroundColor: "#FFE511",
          }}
        />
      </div>

      {/* 顶部标签 OEM/ODM */}
      <motion.div
        className="absolute"
        style={{
          left: rpx(100),
          top: rpx(30),
          zIndex: 30,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span
          className="font-anaheim font-bold text-white/60"
          style={{ fontSize: rpx(24) }}
        >
          {topLabel}
        </span>
      </motion.div>

      {/* 左侧图片 - 带曲线裁剪 */}
      <motion.div
        className="absolute"
        style={{
          left: rpx(80),
          top: rpx(80),
          width: rpx(520),
          height: rpx(600),
          zIndex: 10,
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: "0 40% 10% 0",
            clipPath: "ellipse(100% 100% at 0% 50%)",
          }}
        >
          {leftImage ? (
            <OptimizedImage
              image={leftImage as any}
              alt="OEM Service"
              size="large"
              className="w-full h-full object-cover"
              objectPosition={getObjectPosition(leftImage)}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-600">
              <Image
                src="/placeholder-oem-left.jpg"
                alt="OEM Service"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* 主标题 - 黄色大字 */}
      <div
        className="absolute flex flex-col"
        style={{
          left: rpx(550),
          top: rpx(180),
          zIndex: 20,
        }}
      >
        {[titleLine1, titleLine2, titleLine3, titleLine4, `${titleLine5}`].map((line, index) => (
          <motion.span
            key={index}
            className="font-anaheim font-black text-[#FFE511] leading-none"
            style={{
              fontSize: rpx(index === 3 ? 54 : 60),
              letterSpacing: rpx(2),
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            {line}
          </motion.span>
        ))}
        <motion.span
          className="font-anaheim font-black text-[#FFE511] leading-none"
          style={{
            fontSize: rpx(60),
            letterSpacing: rpx(2),
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {titleLine6}
        </motion.span>
      </div>

      {/* 左侧描述文本 */}
      <motion.div
        className="absolute"
        style={{
          left: rpx(100),
          top: rpx(380),
          width: rpx(380),
          zIndex: 15,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p
          className="font-josefin-sans text-white leading-relaxed"
          style={{
            fontSize: rpx(16),
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </motion.div>

      {/* 右侧特性区域 - 带曲线箭头 */}
      <motion.div
        className="absolute"
        style={{
          right: rpx(180),
          top: rpx(140),
          zIndex: 20,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* 虚线曲线箭头 */}
        <svg
          width={rpx(180)}
          height={rpx(200)}
          viewBox="0 0 180 200"
          fill="none"
          className="absolute"
          style={{
            left: rpx(-160),
            top: rpx(20),
          }}
        >
          <path
            d="M10 180 Q 80 180 120 120 Q 160 60 140 20"
            stroke="#4A4A3D"
            strokeWidth="2"
            strokeDasharray="8 6"
            fill="none"
          />
          {/* 箭头 */}
          <path
            d="M135 30 L140 15 L150 25"
            stroke="#4A4A3D"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* 特性文字列表 */}
        <div className="flex flex-col items-end gap-1">
          {[feature1, feature2, feature3].map((feature, index) => (
            <motion.span
              key={index}
              className="font-anaheim font-bold text-[#4A4A3D]"
              style={{
                fontSize: rpx(36),
                letterSpacing: rpx(1),
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* 右侧图片 - 带曲线裁剪 */}
      <motion.div
        className="absolute"
        style={{
          right: rpx(80),
          top: rpx(320),
          width: rpx(480),
          height: rpx(500),
          zIndex: 10,
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: "40% 0 0 10%",
            clipPath: "ellipse(100% 100% at 100% 50%)",
          }}
        >
          {rightImage ? (
            <OptimizedImage
              image={rightImage as any}
              alt="Professional Service"
              size="large"
              className="w-full h-full object-cover"
              objectPosition={getObjectPosition(rightImage)}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-500">
              <Image
                src="/placeholder-oem-right.jpg"
                alt="Professional Service"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* 右侧描述文本 + 向下箭头 */}
      <motion.div
        className="absolute flex flex-col items-start gap-4"
        style={{
          right: rpx(120),
          bottom: rpx(180),
          width: rpx(300),
          zIndex: 15,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        {/* 向下箭头 */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
            <path
              d="M12 0 L12 35 M5 28 L12 38 L19 28"
              stroke="#4A4A3D"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        <p
          className="font-josefin-sans text-[#4A4A3D]"
          style={{
            fontSize: rpx(14),
            lineHeight: 1.5,
          }}
        >
          {rightDescription}
        </p>
      </motion.div>

      {/* 底部分割线/装饰 */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: rpx(4),
          backgroundColor: "#FFE511",
        }}
      />
    </section>
  )
}

export default OemOdmHeroSection
