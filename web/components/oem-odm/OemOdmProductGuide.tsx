"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import type { Locale } from "@/i18n.config"

// 设计稿基准尺寸 1920
const DESIGN_WIDTH = 1920

// 70% 缩放
const SCALE = 0.7

// 响应式尺寸函数（带缩放）
const rpx = (designValue: number) => `calc(var(--rpx-product-guide) * ${designValue * SCALE})`

// 图片卡片配置 - 3个位置的旋转角度、位置和层级
const cardConfigs = [
  { rotate: -6, left: 155, top: 0, zIndex: 3, opacity: 1, overlay: 0 },      // 最上层
  { rotate: -10, left: 85, top: 25, zIndex: 2, opacity: 0.65, overlay: 0.75 }, // 中间层
  { rotate: -20, left: 0, top: 80, zIndex: 1, opacity: 0.65, overlay: 0.4 },  // 最底层
]

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
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

interface OemOdmProductGuideProps {
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  exploreText?: string
  locale?: Locale
}

export function OemOdmProductGuide({
  title = "More Product\nPossibilities",
  description = "In addition to OEM/ODM services, Busrom also offers you a full range of finished glass hardware and architectural accessories to choose from. Welcome to visit our product center to discover more innovative designs and mature solutions.",
  buttonText = "View More",
  buttonLink = "/products",
  exploreText = "EXPLORE",
  locale = "en",
}: OemOdmProductGuideProps) {
  // 从产品 API 获取的随机图片
  const [selectedImages, setSelectedImages] = useState<MediaObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // 管理图片顺序 [0, 1, 2] 表示 images[0] 在最上层, images[1] 在中间, images[2] 在最底层
  const [imageOrder, setImageOrder] = useState([0, 1, 2])

  useEffect(() => {
    // 从产品 API 获取随机产品图片（从 mainImage 数组中随机选取）
    const fetchProductImages = async () => {
      try {
        const response = await fetch(`/api/products?locale=${locale}&pageSize=50`)
        if (response.ok) {
          const data = await response.json()
          const products = data.products || []

          // 收集所有 mainImage 图片
          const allMainImages: MediaObject[] = []
          for (const product of products) {
            if (product.mainImage && Array.isArray(product.mainImage)) {
              for (const img of product.mainImage) {
                if (img?.url) {
                  allMainImages.push({
                    id: img.id,
                    url: img.url,
                    alt: img.altText || product.name,
                    altText: img.altText || product.name,
                    variants: img.variants,
                    cropFocalPoint: img.cropFocalPoint,
                    width: img.width,
                    height: img.height,
                  })
                }
              }
            }
          }

          // 随机打乱并取前3张
          const shuffled = [...allMainImages].sort(() => Math.random() - 0.5)
          setSelectedImages(shuffled.slice(0, 3))
        }
      } catch (error) {
        console.error("Failed to fetch product images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductImages()
  }, [locale])

  // 自动轮播 - 每3秒切换一次
  useEffect(() => {
    if (selectedImages.length < 3) return

    const interval = setInterval(() => {
      setImageOrder((prev) => {
        // 最上层的牌移到最底层: [0,1,2] -> [1,2,0] -> [2,0,1] -> [0,1,2]
        return [prev[1], prev[2], prev[0]]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedImages.length])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-product-guide" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        backgroundColor: "#F6F4ED",
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div className="hidden md:block relative w-full" style={{ height: rpx(1474) }}>
        {/* 居中容器 - 70%宽度居中 */}
        <div
          className="relative mx-auto h-full"
          style={{ width: rpx(1920) }}
        >
          {/* 左上角渐变光晕 */}
          <div
            className="absolute"
            style={{
              left: rpx(-119),
              top: 0,
              width: rpx(790),
              height: rpx(771),
              background: "radial-gradient(circle, rgba(255,225,137,0.73) 0%, rgba(255,226,116,0) 100%)",
              filter: "blur(200px)",
            }}
          />

          {/* 右下角渐变光晕 */}
          <div
            className="absolute"
            style={{
              left: rpx(1070),
              top: rpx(169),
              width: rpx(1338),
              height: rpx(1305),
              background: "radial-gradient(circle, rgba(255,225,112,0.84) 0%, rgba(255,226,116,0) 100%)",
              filter: "blur(200px)",
            }}
          />

          {/* 左侧图片堆叠区域 - 自动轮播切牌效果 */}
          <div
            className="absolute"
            style={{
              left: rpx(14),
              top: rpx(154),
              width: rpx(750),
              height: rpx(700),
            }}
          >
            {/* 循环切牌效果 - imageOrder[0] = 最上层的图片索引 */}
            {imageOrder.map((imageIndex, position) => {
              const image = selectedImages[imageIndex]
              if (!image) return null
              const config = cardConfigs[position]

              return (
                <motion.div
                  key={imageIndex}
                  className="absolute overflow-hidden"
                  style={{
                    width: rpx(575),
                    height: rpx(560),
                    borderRadius: `${rpx(150)} ${rpx(150)} 0 ${rpx(150)}`,
                    transformOrigin: "bottom right",
                    boxShadow: "-2px 7px 19px rgba(0,0,0,0.4)",
                  }}
                  animate={{
                    left: rpx(config.left),
                    top: rpx(config.top),
                    rotate: config.rotate,
                    zIndex: config.zIndex,
                    opacity: config.opacity,
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
                        alt="Product"
                        size="medium"
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ) : (
                    <OptimizedImage
                      image={image as any}
                      alt="Product"
                      size="medium"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* 白色遮罩 - 根据层级显示不同透明度 */}
                  {config.overlay > 0 && (
                    <div
                      className="absolute inset-0 bg-white"
                      style={{ opacity: config.overlay }}
                    />
                  )}
                </motion.div>
              )
            })}

            {/* 无图片时显示占位 */}
            {selectedImages.length === 0 && (
              <>
                <div
                  className="absolute bg-gray-300"
                  style={{
                    left: 0,
                    top: rpx(80),
                    width: rpx(575),
                    height: rpx(560),
                    borderRadius: `${rpx(150)} ${rpx(150)} 0 ${rpx(150)}`,
                    transformOrigin: "bottom right",
                    transform: "rotate(-20deg)",
                    opacity: 0.65,
                  }}
                />
                <div
                  className="absolute bg-gray-200"
                  style={{
                    left: rpx(85),
                    top: rpx(25),
                    width: rpx(575),
                    height: rpx(560),
                    borderRadius: `${rpx(150)} ${rpx(150)} 0 ${rpx(150)}`,
                    transformOrigin: "bottom right",
                    transform: "rotate(-10deg)",
                    opacity: 0.65,
                  }}
                />
                <div
                  className="absolute bg-gray-100"
                  style={{
                    left: rpx(155),
                    top: 0,
                    width: rpx(575),
                    height: rpx(560),
                    borderRadius: `${rpx(150)} ${rpx(150)} 0 ${rpx(150)}`,
                    transformOrigin: "bottom right",
                    transform: "rotate(-6deg)",
                  }}
                />
              </>
            )}
          </div>

        {/* Explore 竖排文字 - 用两层实现渐变描边，从下到上显示 */}
        <motion.div
          className="absolute"
          style={{
            left: rpx(815),
            top: rpx(650),
          }}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* 描边层 - 渐变 */}
          <span
            className="absolute font-anaheim font-extrabold whitespace-nowrap"
            style={{
              fontSize: rpx(128),
              lineHeight: rpx(89),
              transform: "rotate(-90deg)",
              transformOrigin: "top left",
              WebkitTextStroke: "3px",
              color: "transparent",
              background: "linear-gradient(135deg, #756F3F 34%, rgba(219,208,118,0) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            {exploreText}
          </span>
          {/* 填充层 */}
          <span
            className="absolute font-anaheim font-extrabold whitespace-nowrap"
            style={{
              fontSize: rpx(128),
              lineHeight: rpx(89),
              transform: "rotate(-90deg)",
              transformOrigin: "top left",
              color: "#f7f2e2",
            }}
          >
            {exploreText}
          </span>
        </motion.div>

        {/* 圆形箭头图标 */}
        <motion.svg
          className="absolute"
          style={{
            left: rpx(705),
            top: rpx(535),
            width: rpx(273),
            height: rpx(273),
          }}
          viewBox="0 0 383 383"
          fill="none"
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path d="M150.188 158.962C149.936 159.282 149.75 159.65 149.641 160.044C149.532 160.438 149.502 160.85 149.553 161.257C149.605 161.664 149.736 162.059 149.939 162.417C150.142 162.776 150.414 163.092 150.739 163.347L224.96 221.751L197.319 224.873C196.495 224.966 195.746 225.382 195.236 226.03C194.727 226.677 194.499 227.503 194.602 228.326C194.705 229.148 195.131 229.9 195.787 230.416C196.443 230.932 197.274 231.169 198.098 231.076L233.236 227.107C233.644 227.061 234.038 226.935 234.395 226.737C234.753 226.538 235.066 226.271 235.319 225.95C235.571 225.63 235.757 225.262 235.866 224.868C235.974 224.474 236.004 224.062 235.953 223.654L231.547 188.568C231.496 188.16 231.365 187.766 231.162 187.408C230.958 187.049 230.687 186.733 230.362 186.477C230.037 186.222 229.666 186.032 229.27 185.919C228.873 185.806 228.459 185.771 228.051 185.817C227.644 185.863 227.25 185.989 226.892 186.187C226.535 186.386 226.221 186.653 225.969 186.974C225.717 187.294 225.531 187.662 225.422 188.056C225.313 188.45 225.284 188.862 225.335 189.27L228.801 216.869L154.58 158.465C154.256 158.21 153.884 158.02 153.488 157.907C153.092 157.794 152.678 157.759 152.27 157.805C151.862 157.851 151.468 157.977 151.111 158.175C150.754 158.374 150.44 158.641 150.188 158.962Z" fill="#D9CEA9"/>
          <circle cx="191.376" cy="191.376" r="136.283" transform="rotate(-51.8011 191.376 191.376)" stroke="#D9CEA9" strokeWidth="2"/>
        </motion.svg>

        {/* 右侧内容区域 */}
        <div
          className="absolute"
          style={{
            left: rpx(1031),
            top: rpx(154),
          }}
        >
          {/* 标题容器 */}
          <div className="relative">
            {/* 标题 - 阴影层（右下偏移） */}
            <h2
              className="absolute font-anaheim font-extrabold whitespace-pre-line"
              style={{
                left: rpx(2),
                top: rpx(5),
                fontSize: rpx(600 / 7),
                lineHeight: rpx(99),
                color: "#DAC062",
              }}
            >
              {title}
            </h2>

            {/* 标题 - 主层 */}
            <motion.h2
              className="relative font-anaheim font-extrabold whitespace-pre-line"
              style={{
                fontSize: rpx(600 / 7),
                lineHeight: rpx(99),
                color: "#6F6200",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h2>
          </div>

          {/* 描述文字 */}
          <motion.p
            className="font-anaheim font-semibold"
            style={{
              marginTop: rpx(35),
              width: rpx(706),
              fontSize: rpx(28),
              lineHeight: rpx(40),
              color: "#78776D",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {description}
          </motion.p>

          {/* View More 按钮 */}
          <motion.a
            href={buttonLink}
            className="flex items-center justify-center font-anaheim font-semibold text-white"
            style={{
              marginTop: rpx(80),
              width: rpx(407),
              height: rpx(102),
              backgroundColor: "#756F3F",
              borderRadius: rpx(63),
              fontSize: rpx(48),
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.a>
        </div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-12">
        {/* 图片区域 */}
        <div className="relative w-full h-64 mb-8">
          {selectedImages[0] && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: "80%",
                aspectRatio: "1/1",
                borderRadius: "20px 20px 0 20px",
                overflow: "hidden",
                transform: "translateX(-50%) rotate(-5deg)",
                transformOrigin: "bottom right",
                boxShadow: "-2px 7px 19px rgba(0,0,0,0.3)",
              }}
            >
              {selectedImages[0].enableLink && selectedImages[0].linkUrl ? (
                <Link href={selectedImages[0].linkUrl} target={selectedImages[0].openInNewTab ? "_blank" : undefined} rel={selectedImages[0].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  <OptimizedImage
                    image={selectedImages[0] as any}
                    alt="Product"
                    size="medium"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={selectedImages[0] as any}
                  alt="Product"
                  size="medium"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* 标题 */}
        <h2
          className="font-anaheim font-extrabold text-3xl mb-4"
          style={{ color: "#6F6200" }}
        >
          {title.replace("\n", " ")}
        </h2>

        {/* 描述 */}
        <p
          className="font-anaheim font-semibold text-base mb-6 leading-relaxed"
          style={{ color: "#78776D" }}
        >
          {description}
        </p>

        {/* 按钮 */}
        <a
          href={buttonLink}
          className="inline-flex items-center justify-center font-anaheim font-semibold text-white py-3 px-8 rounded-full text-xl"
          style={{ backgroundColor: "#756F3F" }}
        >
          {buttonText}
        </a>
      </div>
    </section>
  )
}

export default OemOdmProductGuide
