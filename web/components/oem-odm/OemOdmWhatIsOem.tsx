"use client"

import React from "react"
import Link from "next/link"
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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
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
            image.enableLink && image.linkUrl ? (
              <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={image as any}
                  alt="What Is OEM"
                  size="large"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt="What Is OEM"
                size="large"
                className="w-full h-full object-cover"
              />
            )
          )}
        </motion.div>

        {/* 问号装饰 - 贴住 What Is OEM 标题右侧 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(1230),
            top: rpx(20),
            width: rpx(53), // 缩小问号
            height: rpx(80),
            zIndex: 15,
            transformOrigin: "left bottom",
          }}
          initial={{ opacity: 0, scale: 0.8, rotate: 17 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: [17, 22, 12, 17],
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.2 },
            scale: { duration: 0.5, delay: 0.2 },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            },
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 106 160" fill="none">
            <path d="M36.8605 104.655C36.1663 99.1071 36.5828 94.2523 38.11 90.091C39.776 85.9298 42.0668 82.1847 44.9823 78.8557C48.0367 75.5267 51.3687 72.4751 54.9784 69.7009C58.7269 66.9267 62.1978 64.2219 65.391 61.5865C68.723 58.951 71.4303 56.2462 73.5128 53.472C75.5953 50.6979 76.6366 47.6463 76.6366 44.3173C76.6366 40.156 75.5953 36.619 73.5128 33.7061C71.4303 30.7932 68.3759 28.5739 64.3497 27.0481C60.4623 25.5223 55.742 24.7594 50.1886 24.7594C43.8022 24.7594 37.9712 26.1465 32.6955 28.9207C27.4198 31.6948 22.2135 35.7867 17.0766 41.1964L0 25.3836C6.66405 17.7547 14.5082 11.6515 23.5324 7.07413C32.6955 2.35804 42.761 0 53.7289 0C63.8638 0 72.8186 1.52579 80.5933 4.57737C88.5069 7.62896 94.685 12.2757 99.1277 18.5176C103.709 24.6207 106 32.319 106 41.6125C106 46.7447 104.889 51.2527 102.668 55.1365C100.585 58.8817 97.8088 62.28 94.3379 65.3316C91.0059 68.2445 87.4656 71.088 83.7171 73.8622C79.9686 76.4976 76.4977 79.2718 73.3045 82.1847C70.1113 85.0975 67.6123 88.3572 65.8075 91.9636C64.0026 95.57 63.3084 99.8006 63.725 104.655H36.8605ZM50.3969 160C45.1212 160 40.7479 158.266 37.277 154.798C33.8062 151.331 32.0707 146.961 32.0707 141.69C32.0707 136.281 33.8062 131.842 37.277 128.374C40.7479 124.907 45.1212 123.173 50.3969 123.173C55.6726 123.173 60.0458 124.907 63.5167 128.374C66.9876 131.842 68.723 136.281 68.723 141.69C68.723 146.961 66.9876 151.331 63.5167 154.798C60.0458 158.266 55.6726 160 50.3969 160Z" fill="#847D48"/>
          </svg>
        </motion.div>

        {/* What Is OEM 标题 - 右对齐，text-shadow 模拟外描边 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(500),
            top: rpx(84),
            width: rpx(730),
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
              fontSize: rpx(96),
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
            left: rpx(630), // 1271 * 0.7
            top: rpx(171), // 244 * 0.7
            width: rpx(600), // 486 * 0.7
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
            className="absolute font-anaheim text-white overflow-y-auto"
            style={{
              left: rpx(29), // 56 * 0.7
              top: rpx(25), // 36 * 0.7
              width: rpx(667), // 924 * 0.7
              maxHeight: rpx(120),
              fontSize: rpx(17), // 24 * 0.7
              lineHeight: rpx(23), // 33 * 0.7
              textAlign: "justify",
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.3) transparent',
              overscrollBehavior: 'contain',
              paddingRight: rpx(10), // 给滚动条留出空间
              paddingLeft: rpx(10), // 内边距，避免文字贴边
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
            {image.enableLink && image.linkUrl ? (
              <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={image as any}
                  alt="What Is OEM"
                  size="large"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt="What Is OEM"
                size="large"
                className="w-full h-full object-cover"
              />
            )}
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
