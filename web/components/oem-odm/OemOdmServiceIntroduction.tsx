"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-service-intro) * ${designValue})`

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

interface OemOdmServiceIntroductionProps {
  // 右侧图片
  image?: MediaObject | null
  // 右上角格式化文本片段
  topDescriptionSegments?: TextSegment[]
  // 左下角格式化文本片段
  leftDescriptionSegments?: TextSegment[]
}

const defaultContent = {
  topDescriptionSegments: [
    { text: "Relying on years of industry accumulation and professional technical capabilities, we provide customers with comprehensive " },
    { text: "OEM cooperation", bold: true },
    { text: " services to help brands create differentiated high-quality products." },
  ] as TextSegment[],
  leftDescriptionSegments: [
    { text: "As a brand dedicated to high-end glass mechanical hardware manufacturing, " },
    { text: "Busrom", underline: true },
    { text: " deeply understands that in modern life, Spaces composed of glass are everywhere. They are not only functional Spaces but also private places for physical and mental relaxation." },
  ] as TextSegment[],
}

export function OemOdmServiceIntroduction({
  image,
  topDescriptionSegments = defaultContent.topDescriptionSegments,
  leftDescriptionSegments = defaultContent.leftDescriptionSegments,
}: OemOdmServiceIntroductionProps) {
  const [isArrowHovered, setIsArrowHovered] = useState(false)

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-service-intro" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), calc(100vh / ${DESIGN_HEIGHT}))`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(DESIGN_HEIGHT * 0.7) }}>
        {/* 70% scaled centered content wrapper */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%) scale(0.7)",
            transformOrigin: "top center",
            width: rpx(DESIGN_WIDTH),
            height: rpx(DESIGN_HEIGHT),
          }}
        >
        {/* 背景矩形 - 渐变背景 */}
        <div
          className="absolute"
          style={{
            left: rpx(30),
            top: rpx(74),
            width: rpx(1860),
            height: rpx(823),
            background: "linear-gradient(180deg, #756F3F 0%, #58522B 100%)",
            borderRadius: rpx(30),
          }}
        />

        {/* 左上角 OEM 大标题 - text-shadow 模拟外描边 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(153),
            top: rpx(26),
            zIndex: 10,
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="font-anaheim font-bold uppercase"
            style={{
              fontSize: rpx(180),
              lineHeight: rpx(171),
              color: "#756F3F",
              textShadow: `
                -2px -2px 0 #ffffff,
                2px -2px 0 #ffffff,
                -2px 2px 0 #ffffff,
                2px 2px 0 #ffffff,
                0px -2px 0 #ffffff,
                0px 2px 0 #ffffff,
                -2px 0px 0 #ffffff,
                2px 0px 0 #ffffff,
                -3px 0px 0 #ffffff,
                3px 0px 0 #ffffff,
                0px -3px 0 #ffffff,
                0px 3px 0 #ffffff
              `,
            }}
          >
            OEM
          </span>
        </motion.div>

        {/* Service Introduction 标题 - 渐变文字 + 双层叠字 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(153),
            top: rpx(172),
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            className="font-anaheim font-extrabold text-white"
            style={{
              fontSize: rpx(64),
              lineHeight: rpx(75),
            }}
          >
            Service
          </div>
          {/* Introduction 双层叠字 */}
          <div className="relative">
            {/* 下层阴影 - 下移2px */}
            <div
              className="absolute font-anaheim font-extrabold"
              style={{
                fontSize: rpx(64),
                lineHeight: rpx(75),
                backgroundImage: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                top: rpx(2),
                opacity: 0.5,
              }}
            >
              Introduction
            </div>
            {/* 上层主文字 */}
            <div
              className="relative font-anaheim font-extrabold"
              style={{
                fontSize: rpx(64),
                lineHeight: rpx(75),
                backgroundImage: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Introduction
            </div>
          </div>
        </motion.div>

        {/* 装饰线条 - 渐变横线 */}
        <div
          className="absolute"
          style={{
            left: rpx(155),
            top: rpx(265),
            width: rpx(404),
            height: rpx(43),
            zIndex: 10,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 404 43" fill="none" preserveAspectRatio="none">
            <path
              d="M0 21.5H404"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeOpacity="0.52"
            />
            <defs>
              <linearGradient id="gradient-line" x1="0" y1="0" x2="404" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 圆形装饰箭头 - 虚线圆圈 + 斜向右下箭头 (层级在Introduction下层) */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            left: rpx(458),
            top: rpx(262),
            width: rpx(128),
            height: rpx(128),
            zIndex: 5,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onMouseEnter={() => setIsArrowHovered(true)}
          onMouseLeave={() => setIsArrowHovered(false)}
        >
          <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none">
            {/* 旋转的虚线圆圈 */}
            <circle
              cx="64"
              cy="64"
              r="63"
              stroke={isArrowHovered ? "#FFF3BD" : "#514B1A"}
              strokeWidth="2"
              strokeDasharray="9 9"
              className="animate-spin-slow transition-colors duration-300"
              style={{ transformOrigin: 'center' }}
            />
            {/* 静止的箭头 */}
            <path
              d="M84.9806 80.1714L85.0033 80.141C85.3002 79.7327 85.4653 79.2435 85.4766 78.7388L85.4771 78.7093L85.4765 78.7175C85.4901 78.5243 85.4849 78.3303 85.461 78.1381L85.4537 78.0836L81.9007 53.2242C81.6681 51.5963 80.1598 50.4667 78.5322 50.7013L78.4835 50.7088C76.8823 50.9662 75.7766 52.4618 76.0068 54.0731L78.6112 72.2946L46.4689 48.2213C45.3712 47.3992 43.8141 47.6237 42.9912 48.7224L42.7825 49.0011C41.9888 50.0981 42.2178 51.6325 43.3045 52.4464L75.4468 76.5197L57.2285 79.1458C55.601 79.3804 54.4705 80.8899 54.7031 82.5177C54.9357 84.1455 56.4439 85.2752 58.0715 85.0406L82.9287 81.4574L82.9809 81.4494C83.1546 81.4212 83.3255 81.3776 83.4916 81.3193L83.5337 81.3042L83.5256 81.3067C84.0338 81.1538 84.4795 80.8418 84.797 80.4165L84.9806 80.1714Z"
              fill={isArrowHovered ? "#FFF3BD" : "#514B1A"}
              className="transition-colors duration-300"
            />
          </svg>
        </motion.div>

        {/* 垂直分隔线 */}
        <div
          className="absolute"
          style={{
            left: rpx(797),
            top: rpx(74),
            width: rpx(2),
            height: rpx(158),
            backgroundColor: "rgba(255,255,255,0.27)",
            borderRadius: rpx(27),
          }}
        />

        {/* 右上角描述文字 */}
        <motion.p
          className="absolute font-anaheim text-white"
          style={{
            left: rpx(828),
            top: rpx(85),
            width: rpx(1035),
            fontSize: rpx(32),
            lineHeight: rpx(51),
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {topDescriptionSegments.map((segment, index) => {
            if (segment.text === "\n") {
              return <br key={index} />
            }
            if (segment.underline) {
              return (
                <span
                  key={index}
                  className="relative inline-block font-anaheim font-extrabold"
                  style={{ fontSize: rpx(36), lineHeight: rpx(51) }}
                >
                  {/* 下层 - 深色 + 外描边，向右下偏移2rpx */}
                  <span
                    className="absolute font-anaheim font-extrabold"
                    style={{
                      fontSize: rpx(36),
                      color: "#413A03",
                      left: rpx(4),
                      top: rpx(4),
                      textShadow: `
                        -2px -2px 0 #FFF392,
                        2px -2px 0 #FFF392,
                        -2px 2px 0 #FFF392,
                        2px 2px 0 #FFF392,
                        0px -2px 0 #FFF392,
                        0px 2px 0 #FFF392,
                        -2px 0px 0 #FFF392,
                        2px 0px 0 #FFF392
                      `,
                    }}
                  >
                    {segment.text}
                  </span>
                  {/* 上层 - 白色 */}
                  <span
                    className="relative font-anaheim font-extrabold"
                    style={{
                      fontSize: rpx(36),
                      color: "#FFFFFF",
                    }}
                  >
                    {segment.text}
                  </span>
                </span>
              )
            }
            if (segment.bold) {
              return (
                <span
                  key={index}
                  className="font-anaheim font-bold"
                  style={{
                    fontSize: rpx(32),
                    color: "#FFDB4B",
                  }}
                >
                  {segment.text}
                </span>
              )
            }
            return (
              <span key={index} className="text-white">
                {segment.text}
              </span>
            )
          })}
        </motion.p>

        {/* 右侧大图 */}
        <motion.div
          className="absolute overflow-hidden"
          style={{
            left: rpx(789),
            top: rpx(284),
            width: rpx(1101),
            height: rpx(559),
            zIndex: 5,
            borderTopLeftRadius: rpx(46),
            borderBottomLeftRadius: rpx(46),
          }}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {image && (
            <OptimizedImage
              image={image as any}
              alt="OEM Service"
              size="xlarge"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* 左下角文字区域 - 支持格式化文本 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(159),
            top: rpx(437),
            width: rpx(560),
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p
            className="font-anaheim"
            style={{
              fontSize: rpx(32),
              lineHeight: rpx(56),
            }}
          >
            {leftDescriptionSegments.map((segment, index) => {
              // 换行
              if (segment.text === "\n") {
                return <br key={index} />
              }
              // 下划线文字 - 双层字体
              if (segment.underline) {
                return (
                  <span
                    key={index}
                    className="relative inline-block font-anaheim font-extrabold"
                    style={{ fontSize: rpx(36), lineHeight: rpx(56) }}
                  >
                    {/* 下层 - 深色 + 外描边，向右下偏移2rpx */}
                    <span
                      className="absolute font-anaheim font-extrabold"
                      style={{
                        fontSize: rpx(36),
                        color: "#413A03",
                        left: rpx(2),
                        top: rpx(2),
                        textShadow: `
                          -2px -2px 0 #FFF392,
                          2px -2px 0 #FFF392,
                          -2px 2px 0 #FFF392,
                          2px 2px 0 #FFF392,
                          0px -2px 0 #FFF392,
                          0px 2px 0 #FFF392,
                          -2px 0px 0 #FFF392,
                          2px 0px 0 #FFF392
                        `,
                      }}
                    >
                      {segment.text}
                    </span>
                    {/* 上层 - 白色 */}
                    <span
                      className="relative font-anaheim font-extrabold"
                      style={{
                        fontSize: rpx(36),
                        color: "#FFFFFF",
                      }}
                    >
                      {segment.text}
                    </span>
                  </span>
                )
              }
              // 加粗文字
              if (segment.bold) {
                return (
                  <span
                    key={index}
                    className="font-anaheim font-bold"
                    style={{
                      fontSize: rpx(32),
                      color: "#FFDB4B",
                    }}
                  >
                    {segment.text}
                  </span>
                )
              }
              // 普通文字
              return (
                <span
                  key={index}
                  className="text-white"
                >
                  {segment.text}
                </span>
              )
            })}
          </p>
        </motion.div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-10">
        <div
          className="relative rounded-2xl overflow-hidden p-6"
          style={{
            background: "linear-gradient(180deg, #756F3F 0%, #58522B 100%)",
          }}
        >
          {/* OEM 标题 */}
          <div className="mb-4">
            <span
              className="font-anaheim font-bold text-6xl"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px #ffffff",
              }}
            >
              OEM
            </span>
          </div>

          {/* Service Introduction */}
          <div
            className="font-anaheim font-extrabold text-2xl mb-6"
            style={{
              backgroundImage: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Service
            <br />
            Introduction
          </div>

          {/* 图片 */}
          {image && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
              <OptimizedImage
                image={image as any}
                alt="OEM Service"
                size="large"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 描述文字 */}
          <p className="text-white text-sm leading-relaxed mb-4">
            {topDescriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.underline) {
                return (
                  <span key={index} className="font-bold text-[#FFF392]">
                    {segment.text}
                  </span>
                )
              }
              if (segment.bold) {
                return (
                  <span key={index} className="font-bold text-[#FFDB4B]">
                    {segment.text}
                  </span>
                )
              }
              return <span key={index}>{segment.text}</span>
            })}
          </p>

          <p className="text-white text-sm leading-relaxed">
            {leftDescriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.underline) {
                return (
                  <span key={index} className="font-bold text-[#FFF392]">
                    {segment.text}
                  </span>
                )
              }
              if (segment.bold) {
                return (
                  <span key={index} className="font-bold text-[#FFDB4B]">
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

export default OemOdmServiceIntroduction
