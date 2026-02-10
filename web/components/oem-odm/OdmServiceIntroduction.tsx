"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 645 // 922 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-odm-service-intro) * ${designValue})`

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

interface OdmServiceIntroductionProps {
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
    { text: "ODM cooperation", bold: true },
    { text: " services to help brands create differentiated high-quality products." },
  ] as TextSegment[],
  leftDescriptionSegments: [
    { text: "As a brand dedicated to high-end glass mechanical hardware manufacturing, " },
    { text: "Busrom", underline: true },
    { text: " deeply understands that in modern life, Spaces composed of glass are everywhere. They are not only functional Spaces but also private places for physical and mental relaxation." },
  ] as TextSegment[],
}

export function OdmServiceIntroduction({
  image,
  topDescriptionSegments = defaultContent.topDescriptionSegments,
  leftDescriptionSegments = defaultContent.leftDescriptionSegments,
}: OdmServiceIntroductionProps) {
  const [isArrowHovered, setIsArrowHovered] = useState(false)

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-odm-service-intro" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
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
        {/* 背景矩形 - 渐变背景（与外层渐变顶部一致） */}
        <div
          className="absolute"
          style={{
            left: rpx(21), // 30 * 0.7
            top: rpx(52), // 74 * 0.7
            width: rpx(1302), // 1860 * 0.7
            height: rpx(576), // 823 * 0.7
            background: "linear-gradient(180deg, #EDE9C7 0%, #D1CB93 100%)",
            borderRadius: rpx(21), // 30 * 0.7
          }}
        />

        {/* 左上角 ODM 大标题 - 镂空效果（两层叠加） */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(107), // 153 * 0.7
            top: rpx(18), // 26 * 0.7
            zIndex: 10,
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 底层 - 描边色填充 + text-shadow 扩展 */}
          <span
            className="absolute font-anaheim font-bold uppercase"
            style={{
              fontSize: rpx(120),
              lineHeight: rpx(120), // 171 * 0.7
              color: "#464010",
              textShadow: `
                -2px -2px 0 #464010,
                2px -2px 0 #464010,
                -2px 2px 0 #464010,
                2px 2px 0 #464010,
                0px -2px 0 #464010,
                0px 2px 0 #464010,
                -2px 0px 0 #464010,
                2px 0px 0 #464010
              `,
            }}
          >
            ODM
          </span>
          {/* 上层 - 背景色填充，挖空中间 */}
          <span
            className="relative font-anaheim font-bold uppercase"
            style={{
              fontSize: rpx(120),
              lineHeight: rpx(120), // 171 * 0.7
              color: "#EDE9C7",
            }}
          >
            ODM
          </span>
        </motion.div>

        {/* Service Introduction 标题 - 渐变文字 + 双层叠字 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(107), // 153 * 0.7
            top: rpx(120), // 172 * 0.7
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            className="font-anaheim font-extrabold"
            style={{
              fontSize: rpx(40),
              lineHeight: rpx(53), // 75 * 0.7
              color: "#59542A",
            }}
          >
            Service
          </div>
          {/* Introduction 双层叠字 */}
          <div className="relative">
            {/* 下层阴影 - 下移 */}
            <div
              className="absolute font-anaheim font-extrabold"
              style={{
                fontSize: rpx(40),
                lineHeight: rpx(53), // 75 * 0.7
                backgroundImage: "linear-gradient(180deg, #59542A 0%, rgba(89,84,42,0) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                top: rpx(4),
                opacity: 0.3,
              }}
            >
              Introduction
            </div>
            {/* 上层主文字 */}
            <div
              className="relative font-anaheim font-extrabold"
              style={{
                fontSize: rpx(40),
                lineHeight: rpx(53), // 75 * 0.7
                backgroundImage: "linear-gradient(180deg, #59542A 0%, rgba(89,84,42,0) 100%)",
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
            left: rpx(109), // 155 * 0.7
            top: rpx(186), // 265 * 0.7
            width: rpx(283), // 404 * 0.7
            height: rpx(30), // 43 * 0.7
            zIndex: 10,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 283 30" fill="none" preserveAspectRatio="none">
            <path
              d="M0 15H283"
              stroke="url(#odm-gradient-line)"
              strokeWidth="2"
              strokeOpacity="0.52"
            />
            <defs>
              <linearGradient id="odm-gradient-line" x1="0" y1="0" x2="283" y2="0">
                <stop offset="0%" stopColor="#59542A" stopOpacity="0" />
                <stop offset="100%" stopColor="#59542A" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 圆形装饰箭头 - 虚线圆圈 + 斜向右下箭头 (层级在Introduction下层) */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            left: rpx(321), // 458 * 0.7
            top: rpx(183), // 262 * 0.7
            width: rpx(90), // 128 * 0.7
            height: rpx(90), // 128 * 0.7
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
              stroke={isArrowHovered ? "#756F3F" : "#9B9565"}
              strokeWidth="2"
              strokeDasharray="9 9"
              className="animate-spin-slow transition-colors duration-300"
              style={{ transformOrigin: 'center' }}
            />
            {/* 静止的箭头 */}
            <path
              d="M84.9806 80.1714L85.0033 80.141C85.3002 79.7327 85.4653 79.2435 85.4766 78.7388L85.4771 78.7093L85.4765 78.7175C85.4901 78.5243 85.4849 78.3303 85.461 78.1381L85.4537 78.0836L81.9007 53.2242C81.6681 51.5963 80.1598 50.4667 78.5322 50.7013L78.4835 50.7088C76.8823 50.9662 75.7766 52.4618 76.0068 54.0731L78.6112 72.2946L46.4689 48.2213C45.3712 47.3992 43.8141 47.6237 42.9912 48.7224L42.7825 49.0011C41.9888 50.0981 42.2178 51.6325 43.3045 52.4464L75.4468 76.5197L57.2285 79.1458C55.601 79.3804 54.4705 80.8899 54.7031 82.5177C54.9357 84.1455 56.4439 85.2752 58.0715 85.0406L82.9287 81.4574L82.9809 81.4494C83.1546 81.4212 83.3255 81.3776 83.4916 81.3193L83.5337 81.3042L83.5256 81.3067C84.0338 81.1538 84.4795 80.8418 84.797 80.4165L84.9806 80.1714Z"
              fill={isArrowHovered ? "#756F3F" : "#9B9565"}
              className="transition-colors duration-300"
            />
          </svg>
        </motion.div>

        {/* 垂直分隔线 */}
        <div
          className="absolute"
          style={{
            left: rpx(558), // 797 * 0.7
            top: rpx(52), // 74 * 0.7
            width: rpx(1), // 2 * 0.7
            height: rpx(111), // 158 * 0.7
            backgroundColor: "rgba(89,84,42,0.27)",
            borderRadius: rpx(19), // 27 * 0.7
          }}
        />

        {/* 右上角描述文字 */}
        <motion.p
          className="absolute font-anaheim"
          style={{
            left: rpx(580), // 828 * 0.7
            top: rpx(60), // 85 * 0.7
            width: rpx(725), // 1035 * 0.7
            fontSize: rpx(20),
            lineHeight: rpx(36), // 51 * 0.7
            color: "#59542A",
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
                  style={{ fontSize: rpx(24), lineHeight: rpx(36) }}
                >
                  {/* 下层 - #9E8C00 填充 + #FFF392 外描边，向右下偏移 */}
                  <span
                    className="absolute font-anaheim font-extrabold"
                    style={{
                      fontSize: rpx(24),
                      color: "#9E8C00",
                      left: rpx(3), // 4 * 0.7
                      top: rpx(3), // 4 * 0.7
                      textShadow: `
                        -1px -1px 0 #FFF392,
                        1px -1px 0 #FFF392,
                        -1px 1px 0 #FFF392,
                        1px 1px 0 #FFF392
                      `,
                    }}
                  >
                    {segment.text}
                  </span>
                  {/* 上层 - 深色 */}
                  <span
                    className="relative font-anaheim font-extrabold"
                    style={{
                      fontSize: rpx(24),
                      color: "#59542A",
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
                    fontSize: rpx(20),
                    color: "#756F3F",
                  }}
                >
                  {segment.text}
                </span>
              )
            }
            return (
              <span key={index} style={{ color: "#59542A" }}>
                {segment.text}
              </span>
            )
          })}
        </motion.p>

        {/* 右侧大图 */}
        <motion.div
          className="absolute overflow-hidden"
          style={{
            left: rpx(552), // 789 * 0.7
            top: rpx(199), // 284 * 0.7
            width: rpx(771), // 1101 * 0.7
            height: rpx(391), // 559 * 0.7
            zIndex: 5,
            borderTopLeftRadius: rpx(32), // 46 * 0.7
            borderBottomLeftRadius: rpx(32), // 46 * 0.7
          }}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {image && (
            <OptimizedImage
              image={image as any}
              alt="ODM Service"
              size="xlarge"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* 左下角文字区域 - 支持格式化文本 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(111), // 159 * 0.7
            top: rpx(306), // 437 * 0.7
            width: rpx(392), // 560 * 0.7
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p
            className="font-anaheim"
            style={{
              fontSize: rpx(20),
              lineHeight: rpx(39), // 56 * 0.7
            }}
          >
            {leftDescriptionSegments.map((segment, index) => {
              // 换行
              if (segment.text === "\n") {
                return <br key={index} />
              }
              // 下划线文字 - 双层字体叠字效果
              if (segment.underline) {
                return (
                  <span
                    key={index}
                    className="relative inline-block font-anaheim font-extrabold"
                    style={{ fontSize: rpx(24), lineHeight: rpx(39) }}
                  >
                    {/* 下层 - #9E8C00 填充 + #FFF392 外描边，向右下偏移 */}
                    <span
                      className="absolute font-anaheim font-extrabold"
                      style={{
                        fontSize: rpx(24),
                        color: "#9E8C00",
                        left: rpx(1), // 2 * 0.7
                        top: rpx(1), // 2 * 0.7
                        textShadow: `
                          -1px -1px 0 #FFF392,
                          1px -1px 0 #FFF392,
                          -1px 1px 0 #FFF392,
                          1px 1px 0 #FFF392
                        `,
                      }}
                    >
                      {segment.text}
                    </span>
                    {/* 上层 - 深色 */}
                    <span
                      className="relative font-anaheim font-extrabold"
                      style={{
                        fontSize: rpx(24),
                        color: "#59542A",
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
                      fontSize: rpx(20),
                      color: "#756F3F",
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
                  style={{ color: "#59542A" }}
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
            background: "linear-gradient(180deg, #EDE9C7 0%, #D1CB93 100%)",
          }}
        >
          {/* ODM 标题 - 镂空效果 */}
          <div className="mb-4 relative">
            {/* 底层 - 描边 */}
            <span
              className="absolute font-anaheim font-bold text-6xl"
              style={{
                color: "#464010",
                textShadow: `
                  -1px -1px 0 #464010,
                  1px -1px 0 #464010,
                  -1px 1px 0 #464010,
                  1px 1px 0 #464010
                `,
              }}
            >
              ODM
            </span>
            {/* 上层 - 背景色挖空 */}
            <span
              className="relative font-anaheim font-bold text-6xl"
              style={{
                color: "#EDE9C7",
              }}
            >
              ODM
            </span>
          </div>

          {/* Service Introduction */}
          <div
            className="font-anaheim font-extrabold text-2xl mb-6"
            style={{
              backgroundImage: "linear-gradient(180deg, #59542A 0%, rgba(89,84,42,0.3) 100%)",
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
                alt="ODM Service"
                size="large"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 描述文字 */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#59542A" }}>
            {topDescriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.underline) {
                return (
                  <span key={index} className="font-bold" style={{ color: "#756F3F" }}>
                    {segment.text}
                  </span>
                )
              }
              if (segment.bold) {
                return (
                  <span key={index} className="font-bold" style={{ color: "#756F3F" }}>
                    {segment.text}
                  </span>
                )
              }
              return <span key={index}>{segment.text}</span>
            })}
          </p>

          <p className="text-sm leading-relaxed" style={{ color: "#59542A" }}>
            {leftDescriptionSegments.map((segment, index) => {
              if (segment.text === "\n") {
                return <br key={index} />
              }
              if (segment.underline) {
                return (
                  <span key={index} className="font-bold" style={{ color: "#756F3F" }}>
                    {segment.text}
                  </span>
                )
              }
              if (segment.bold) {
                return (
                  <span key={index} className="font-bold" style={{ color: "#756F3F" }}>
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

export default OdmServiceIntroduction
