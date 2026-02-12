"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { AnimatedLinkButton } from "@/components/ui/animated-link-button"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 525 // 750 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-odm-product-series) * ${designValue})`

// 默认产品系列数据
const defaultProducts = [
  { name: "Glass Standoff", height: 379 },
  { name: "Glass Connected Fitting", height: 445 },
  { name: "Glass Fence Spigot", height: 379 },
  { name: "Guardrail Glass Clip", height: 442 },
  { name: "Bathroom Glass Clip", height: 379 },
  { name: "Glass Hinge", height: 445 },
  { name: "Sliding Door Kit", height: 442 },
  { name: "Bathroom & Door Handle", height: 379 },
  { name: "Hidden Hook", height: 379 },
]

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

interface OdmProductSeriesProps {
  // 标题
  title?: string
  // 描述文字
  description?: string
  // 产品系列（名称列表）
  products?: { name: string; height?: number }[]
  // VIEW MORE 链接
  viewMoreLink?: string
  // 背景图片
  image?: MediaObject | null
}

const defaultContent = {
  title: "Series Of Products",
  description: "We offer a full-process ODM solution for glass hardware from design and development to production and delivery, helping you efficiently create differentiated products. Its main products include",
}

export function OdmProductSeries({
  title = defaultContent.title,
  description = defaultContent.description,
  products = defaultProducts,
  viewMoreLink = "/products",
  image,
}: OdmProductSeriesProps) {
  // 条形图的基础位置和间距
  const barWidth = 116
  const barGap = 8
  const startX = 645 // 与 VIEW MORE 按钮右对齐 (1757 - 1112 = 645)

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-odm-product-series" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
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
        {/* 标题 - Series of products */}
        <motion.h2
          className="absolute font-anaheim font-extrabold"
          style={{
            left: rpx(106), // 152 * 0.7
            top: rpx(42), // 60 * 0.7
            width: rpx(789), // 1127 * 0.7
            fontSize: rpx(60),
            lineHeight: rpx(48), // 68 * 0.7
            color: "#59542A",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>

        {/* VIEW MORE 按钮 */}
        <motion.div
          className="absolute z-20"
          style={{
            right: rpx(106),
            top: rpx(35),
          }}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href={viewMoreLink}
            className="flex items-center"
            style={{ gap: rpx(16) }}
          >
            <AnimatedLinkButton>
              VIEW MORE
            </AnimatedLinkButton>
            <div className="relative" style={{ width: rpx(21), height: rpx(17.5) }}>
              <Image
                src="/images/service-icons/view-more-arrow.svg"
                alt="View more"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </motion.div>

        {/* 左侧描述文字 */}
        <motion.p
          className="absolute font-anaheim font-medium"
          style={{
            left: rpx(106), // 152 * 0.7
            top: rpx(191), // 273 * 0.7
            width: rpx(317), // 453 * 0.7
            fontSize: rpx(22), // 32 * 0.7
            lineHeight: rpx(35), // 50 * 0.7
            color: "#595429",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {description}
        </motion.p>

        {/* 产品系列条形图区域 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(452), // 645 * 0.7
            top: rpx(134), // 191 * 0.7
            width: rpx(778), // 1112 * 0.7
            height: rpx(356), // 508 * 0.7
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* SVG 定义 clipPath */}
          <svg className="absolute" style={{ width: 0, height: 0 }}>
            <defs>
              <clipPath id="odmProductSeriesClipPath" clipPathUnits="objectBoundingBox">
                <path
                  transform="scale(0.0008993, 0.001965)"
                  d="M335.427 63.2168C351.995 63.2169 365.427 76.6483 365.427 93.2168V478.217C365.427 494.785 351.995 508.217 335.427 508.217H278.885C262.316 508.217 248.885 494.785 248.885 478.217V93.2168C248.885 76.6483 262.316 63.2168 278.885 63.2168H335.427ZM708.674 63.2188C725.242 63.219 738.674 76.6504 738.674 93.2188V478.001C738.674 494.569 725.242 508.001 708.674 508.001H652.211C635.642 508.001 622.211 494.57 622.211 478.001V93.2188C622.211 76.6502 635.642 63.2188 652.211 63.2188H708.674ZM1082 66C1098.57 66.0002 1112 79.4316 1112 96V414.555C1112 431.123 1098.57 444.554 1082 444.555H1025.54C1008.97 444.555 995.538 431.123 995.538 414.555V96C995.538 79.4315 1008.97 66 1025.54 66H1082ZM957.559 64.001C974.127 64.0012 987.559 77.4326 987.559 94.001V412.556C987.558 429.124 974.127 442.555 957.559 442.556H901.096C884.527 442.556 871.096 429.124 871.096 412.556V94.001C871.096 77.4324 884.527 64.001 901.096 64.001H957.559ZM459.868 63.2158C476.437 63.216 489.868 76.6474 489.868 93.2158V412.216C489.868 428.784 476.437 442.216 459.868 442.216H403.326C386.758 442.216 373.326 428.784 373.326 412.216V93.2158C373.326 76.6473 386.758 63.2158 403.326 63.2158H459.868ZM86.4629 63.2188C103.031 63.219 116.463 76.6504 116.463 93.2188V411.773C116.463 428.342 103.031 441.773 86.4629 441.773H30C13.4316 441.773 0.000165268 428.342 0 411.773V93.2188C0 76.6502 13.4315 63.2188 30 63.2188H86.4629ZM584.231 63.2188C600.8 63.219 614.231 76.6504 614.231 93.2188V411.773C614.231 428.342 600.8 441.773 584.231 441.773H527.769C511.2 441.773 497.769 428.342 497.769 411.773V93.2188C497.769 76.6502 511.2 63.2188 527.769 63.2188H584.231ZM210.905 0C227.473 0.000236842 240.905 13.4318 240.905 30V411.772C240.905 428.341 227.474 441.772 210.905 441.772H154.442C137.874 441.772 124.442 428.341 124.442 411.772V30C124.443 13.4317 137.874 6.92555e-07 154.442 0H210.905ZM833.116 0C849.684 0.000236842 863.116 13.4318 863.116 30V411.772C863.116 428.341 849.685 441.772 833.116 441.772H776.653C760.085 441.772 746.653 428.341 746.653 411.772V30C746.654 13.4317 760.085 6.92555e-07 776.653 0H833.116Z"
                />
              </clipPath>
            </defs>
          </svg>

          {/* 图片容器 - 使用 SVG clipPath 遮罩 */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: "url(#odmProductSeriesClipPath)",
              WebkitClipPath: "url(#odmProductSeriesClipPath)",
            }}
          >
            {image && (
              image.enableLink && image.linkUrl ? (
                <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  <OptimizedImage
                    image={image as any}
                    alt="Product Series"
                    size="xlarge"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={image as any}
                  alt="Product Series"
                  size="xlarge"
                  className="w-full h-full object-cover"
                />
              )
            )}
          </div>

          {/* 渐变遮罩层 - 从上到下渐变变暗 */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              clipPath: "url(#odmProductSeriesClipPath)",
              WebkitClipPath: "url(#odmProductSeriesClipPath)",
              background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.68) 100%)",
            }}
          />

          {/* 产品名称文字 - 垂直旋转90度，从下往上读 */}
          {products.map((product, index) => {
            // 条形图中心 x 坐标（相对于 778 宽度的容器，已按0.7缩放）
            const barCenterX = [
              41,    // 58 * 0.7
              127,   // 182 * 0.7
              215,   // 307 * 0.7
              302,   // 431 * 0.7
              389,   // 556 * 0.7
              476,   // 680 * 0.7
              564,   // 805 * 0.7
              650,   // 929 * 0.7
              738,   // 1054 * 0.7
            ]

            const centerX = barCenterX[index] || 41 + index * 87

            // 基础底部位置，已按0.7缩放
            const bottomOffset = (index === 2 || index === 5) ? 21 : 70 // 30*0.7, 100*0.7

            return (
              <span
                key={index}
                className="absolute font-anaheim font-semibold text-white whitespace-nowrap"
                style={{
                  left: rpx(centerX + 13), // 18 * 0.7
                  bottom: rpx(bottomOffset),
                  fontSize: rpx(17), // 24 * 0.7
                  lineHeight: rpx(32), // 45 * 0.7
                  writingMode: "vertical-lr",
                  transform: "rotate(180deg)",
                }}
              >
                {product.name}
              </span>
            )
          })}
        </motion.div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* 标题和 VIEW MORE */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-anaheim font-extrabold text-2xl"
            style={{ color: "#59542A" }}
          >
            {title}
          </h2>
          <a
            href={viewMoreLink}
            className="inline-flex items-center gap-1"
          >
            <span
              className="font-anaheim font-medium text-sm"
              style={{ color: "#544D16" }}
            >
              VIEW MORE
            </span>
            <svg width="16" height="13" viewBox="0 0 32 26" fill="none">
              <path
                d="M14.8571 13L2 26L0 23.9778L10.8571 13L0 2.02222L2 0L14.8571 13ZM32 13L19.1429 26L17.1429 23.9778L28 13L17.1429 2.02222L19.1429 0L32 13Z"
                fill="#544D16"
              />
            </svg>
          </a>
        </div>

        {/* 描述文字 */}
        <p
          className="font-anaheim font-medium text-sm leading-relaxed mb-4"
          style={{ color: "#595429" }}
        >
          {description}
        </p>

        {/* 产品系列图片 - 带条形遮罩和产品名称 */}
        <div className="relative w-full h-[280px]">
          {/* SVG 定义移动端 clipPath */}
          <svg className="absolute" style={{ width: 0, height: 0 }}>
            <defs>
              <clipPath id="odmProductSeriesClipPathMobile" clipPathUnits="objectBoundingBox">
                <path
                  transform="scale(0.0008993, 0.001965)"
                  d="M335.427 63.2168C351.995 63.2169 365.427 76.6483 365.427 93.2168V478.217C365.427 494.785 351.995 508.217 335.427 508.217H278.885C262.316 508.217 248.885 494.785 248.885 478.217V93.2168C248.885 76.6483 262.316 63.2168 278.885 63.2168H335.427ZM708.674 63.2188C725.242 63.219 738.674 76.6504 738.674 93.2188V478.001C738.674 494.569 725.242 508.001 708.674 508.001H652.211C635.642 508.001 622.211 494.57 622.211 478.001V93.2188C622.211 76.6502 635.642 63.2188 652.211 63.2188H708.674ZM1082 66C1098.57 66.0002 1112 79.4316 1112 96V414.555C1112 431.123 1098.57 444.554 1082 444.555H1025.54C1008.97 444.555 995.538 431.123 995.538 414.555V96C995.538 79.4315 1008.97 66 1025.54 66H1082ZM957.559 64.001C974.127 64.0012 987.559 77.4326 987.559 94.001V412.556C987.558 429.124 974.127 442.555 957.559 442.556H901.096C884.527 442.556 871.096 429.124 871.096 412.556V94.001C871.096 77.4324 884.527 64.001 901.096 64.001H957.559ZM459.868 63.2158C476.437 63.216 489.868 76.6474 489.868 93.2158V412.216C489.868 428.784 476.437 442.216 459.868 442.216H403.326C386.758 442.216 373.326 428.784 373.326 412.216V93.2158C373.326 76.6473 386.758 63.2158 403.326 63.2158H459.868ZM86.4629 63.2188C103.031 63.219 116.463 76.6504 116.463 93.2188V411.773C116.463 428.342 103.031 441.773 86.4629 441.773H30C13.4316 441.773 0.000165268 428.342 0 411.773V93.2188C0 76.6502 13.4315 63.2188 30 63.2188H86.4629ZM584.231 63.2188C600.8 63.219 614.231 76.6504 614.231 93.2188V411.773C614.231 428.342 600.8 441.773 584.231 441.773H527.769C511.2 441.773 497.769 428.342 497.769 411.773V93.2188C497.769 76.6502 511.2 63.2188 527.769 63.2188H584.231ZM210.905 0C227.473 0.000236842 240.905 13.4318 240.905 30V411.772C240.905 428.341 227.474 441.772 210.905 441.772H154.442C137.874 441.772 124.442 428.341 124.442 411.772V30C124.443 13.4317 137.874 6.92555e-07 154.442 0H210.905ZM833.116 0C849.684 0.000236842 863.116 13.4318 863.116 30V411.772C863.116 428.341 849.685 441.772 833.116 441.772H776.653C760.085 441.772 746.653 428.341 746.653 411.772V30C746.654 13.4317 760.085 6.92555e-07 776.653 0H833.116Z"
                />
              </clipPath>
            </defs>
          </svg>

          {/* 图片容器 - 使用 SVG clipPath 遮罩 */}
          {image && (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                clipPath: "url(#odmProductSeriesClipPathMobile)",
                WebkitClipPath: "url(#odmProductSeriesClipPathMobile)",
              }}
            >
              {image.enableLink && image.linkUrl ? (
                <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  <OptimizedImage
                    image={image as any}
                    alt="Product Series"
                    size="large"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={image as any}
                  alt="Product Series"
                  size="large"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}

          {/* 渐变遮罩层 */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              clipPath: "url(#odmProductSeriesClipPathMobile)",
              WebkitClipPath: "url(#odmProductSeriesClipPathMobile)",
              background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.68) 100%)",
            }}
          />

          {/* 产品名称列表 */}
          <div className="absolute left-0 right-0 flex justify-between px-2" style={{ bottom: "60px" }}>
            {products.map((product, index) => {
              // 第3和第6个下移
              const extraBottom = (index === 2 || index === 5) ? -40 : 0
              return (
                <div
                  key={index}
                  className="flex items-end justify-center relative"
                  style={{
                    height: "80px",
                    width: "10%",
                    top: `${-extraBottom}px`,
                  }}
                >
                  <span
                    className="font-anaheim font-semibold text-white whitespace-nowrap"
                    style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                      fontSize: "10px",
                    }}
                  >
                    {product.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OdmProductSeries
