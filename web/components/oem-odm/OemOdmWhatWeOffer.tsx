"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 644 // 920 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-what-we-offer) * ${designValue})`

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

interface OfferItem {
  number: string
  title: string
  description: string
  image?: MediaObject | null
}

interface OemOdmWhatWeOfferProps {
  // 主标题
  title?: string
  // 三个服务项
  items?: OfferItem[]
}

const defaultContent = {
  title: "What We Offer You",
  items: [
    {
      number: "01",
      title: "Product Development",
      description: "We constantly develop new products based on market feedback and customer demand.",
    },
    {
      number: "02",
      title: "Experienced Experts",
      description: "Our team of experienced experts provides professional guidance and support.",
    },
    {
      number: "03",
      title: "Marketing Support",
      description: "We offer comprehensive marketing support to help you succeed in the market.",
    },
  ],
}

export function OemOdmWhatWeOffer({
  title = defaultContent.title,
  items = defaultContent.items,
}: OemOdmWhatWeOfferProps) {
  // 当前悬停的卡片索引 (null表示没有悬停)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section
      className="relative w-full"
      style={{
        ["--rpx-what-we-offer" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(DESIGN_HEIGHT) }}>
        {/* 背景层 - 全屏宽度背景图片 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/oem-odm/what-we-offer-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* 半透明遮罩层 - 全屏 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(32, 30, 14, 0.84)",
          }}
        />

        {/* 标题 - What We Offer You - 双层文字效果 (在遮罩层之上) */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            top: rpx(53), // 75 * 0.7
            width: rpx(688), // 983 * 0.7
            height: rpx(74), // 106 * 0.7
            zIndex: 10,
          }}
        >
          {/* 下层 - 描边效果，向下偏移4px */}
          <motion.h2
            className="absolute font-anaheim font-extrabold text-center w-full"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(68),
              color: "transparent",
              WebkitTextStroke: `2px #FFDB4A`,
              top: rpx(3), // 4 * 0.7
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          {/* 上层 - 白色填充 */}
          <motion.h2
            className="absolute font-anaheim font-extrabold text-white text-center w-full"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(68),
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
        </div>

        {/* 居中内容容器 */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: rpx(1344), // 1920 * 0.7
            height: rpx(DESIGN_HEIGHT),
          }}
        >
          {/* 第一个卡片 - 左侧 Product Development (上圆下方) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(237),
              top: rpx(153),
              width: rpx(280),
              height: rpx(490),
              borderRadius: `${rpx(140)} ${rpx(140)} 0 0`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[0]?.image?.url
                  ? `url(${items[0].image.variants?.large || items[0].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[0]?.image?.url ? undefined : "#92400e",
              }}
              animate={{ scale: hoveredCard === 0 ? 1.1 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, transparent 0%, rgba(42, 50, 35, 1) 100%)",
              }}
            />
          </motion.div>
          {/* 第一个卡片文字内容 - 独立定位避免被overflow-hidden截断 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: rpx(237 + 102), // 卡片left + 内容left
              top: rpx(153), // 与卡片top对齐
              width: rpx(218), // 312 * 0.7
              zIndex: 20,
            }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90), // 128 * 0.7
                lineHeight: rpx(93), // 133 * 0.7
              }}
            >
              {items[0]?.number || "01"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34), // 48 * 0.7
                lineHeight: rpx(38), // 54 * 0.7
                marginTop: rpx(13), // 18 * 0.7
                width: rpx(224), // 320 * 0.7
                marginLeft: rpx(-6), // -8 * 0.7
              }}
            >
              {items[0]?.title || "Product Development"}
            </h3>
          </div>
          {/* 第一个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 0 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(237 + 99), // 卡片left + 描述left
                  top: rpx(153 + 194), // 卡片top + 描述top
                  width: rpx(221), // 316 * 0.7
                  fontSize: rpx(14), // 20 * 0.7
                  lineHeight: rpx(26), // 37 * 0.7
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {items[0]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 第二个卡片 - 中间 Experienced Experts (上方下圆) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(529),
              top: rpx(153),
              width: rpx(280),
              height: rpx(490),
              borderRadius: `0 0 ${rpx(140)} ${rpx(140)}`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[1]?.image?.url
                  ? `url(${items[1].image.variants?.large || items[1].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[1]?.image?.url ? undefined : "#b45309",
              }}
              animate={{ scale: hoveredCard === 1 ? 1.1 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, rgba(46, 46, 29, 1) 100%)",
              }}
            />
          </motion.div>
          {/* 第二个卡片文字内容 - 独立定位避免被overflow-hidden截断 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: rpx(529 + 107), // 卡片left + 内容left
              top: rpx(153 + 127), // 卡片top + 内容top
              width: rpx(218), // 312 * 0.7
              zIndex: 20,
            }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90), // 128 * 0.7
                lineHeight: rpx(93), // 133 * 0.7
              }}
            >
              {items[1]?.number || "02"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34), // 48 * 0.7
                lineHeight: rpx(38), // 54 * 0.7
                marginTop: rpx(0),
                width: rpx(224), // 320 * 0.7
                marginLeft: rpx(-6), // -8 * 0.7
              }}
            >
              {items[1]?.title || "Experienced Experts"}
            </h3>
          </div>
          {/* 第二个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 1 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(529 + 102), // 卡片left + 描述left
                  top: rpx(153 + 321), // 卡片top + 描述top
                  width: rpx(221), // 316 * 0.7
                  fontSize: rpx(14), // 20 * 0.7
                  lineHeight: rpx(26), // 37 * 0.7
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {items[1]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 第三个卡片 - 右侧 Marketing Support (上圆下方) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(820),
              top: rpx(153),
              width: rpx(280),
              height: rpx(490),
              borderRadius: `${rpx(140)} ${rpx(140)} 0 0`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[2]?.image?.url
                  ? `url(${items[2].image.variants?.large || items[2].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[2]?.image?.url ? undefined : "#92400e",
              }}
              animate={{ scale: hoveredCard === 2 ? 1.1 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, transparent 0%, rgba(39, 43, 28, 1) 100%)",
              }}
            />
          </motion.div>
          {/* 第三个卡片文字内容 - 独立定位避免被overflow-hidden截断 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: rpx(820 + 116), // 卡片left + 内容left
              top: rpx(153), // 与卡片top对齐
              width: rpx(218), // 311 * 0.7
              zIndex: 20,
            }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90), // 128 * 0.7
                lineHeight: rpx(93), // 133 * 0.7
              }}
            >
              {items[2]?.number || "03"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34), // 48 * 0.7
                lineHeight: rpx(38), // 54 * 0.7
                marginTop: rpx(13), // 18 * 0.7
                width: rpx(224), // 320 * 0.7
                marginLeft: rpx(-6), // -9 * 0.7
              }}
            >
              {items[2]?.title || "Marketing Support"}
            </h3>
          </div>
          {/* 第三个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 2 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(820 + 109), // 卡片left + 描述left
                  top: rpx(153 + 194), // 卡片top + 描述top
                  width: rpx(221), // 316 * 0.7
                  fontSize: rpx(14), // 20 * 0.7
                  lineHeight: rpx(26), // 37 * 0.7
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {items[2]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-10">
        {/* 背景 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(32, 30, 14, 0.95)",
          }}
        />

        {/* 内容 */}
        <div className="relative z-10">
          {/* 标题 */}
          <h2 className="font-anaheim font-extrabold text-white text-2xl text-center mb-8">
            {title}
          </h2>

          {/* 卡片列表 */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden"
                style={{ height: "280px" }}
              >
                {/* 背景图片 */}
                {item.image ? (
                  <OptimizedImage
                    image={item.image as any}
                    alt={item.title}
                    size="medium"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900" />
                )}
                {/* 渐变遮罩 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, transparent 30%, rgba(32, 30, 14, 0.95) 100%)",
                  }}
                />
                {/* 内容 */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-anaheim font-extrabold text-white text-5xl leading-none">
                      {item.number}
                    </span>
                    <h3 className="font-anaheim font-extrabold text-white text-xl leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-anaheim font-semibold text-white text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OemOdmWhatWeOffer
