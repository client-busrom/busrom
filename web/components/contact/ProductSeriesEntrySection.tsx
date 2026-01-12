"use client"

import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 850

// 卡片尺寸
const CARD_WIDTH = 202
const CARD_HEIGHT = 252
const CARD_GAP = 12

// 放大后的尺寸
const EXPANDED_WIDTH = 400
const EXPANDED_HEIGHT = 500

// 图片大小（百分比）
const IMAGE_SIZE = "80%"

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
}

export interface ProductSeriesItem {
  id: string | number
  title: string
  image: MediaObject | null
  link?: string
  buttonText?: string
}

interface ProductSeriesEntrySectionProps {
  titleLeft?: string
  titleLeftSuperscript?: string
  titleRightBold?: string
  titleRightNormal?: string
  products?: ProductSeriesItem[]
  viewMoreText?: string
  viewMoreLink?: string
}

export function ProductSeriesEntrySection({
  titleLeft = "WHICH\n    PRODUCTS",
  titleLeftSuperscript = "SERIES",
  titleRightBold = "Are You",
  titleRightNormal = "Looking For?",
  products = [],
  viewMoreText = "view more",
  viewMoreLink = "/products",
}: ProductSeriesEntrySectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: "trimSnaps",
    },
    [WheelGesturesPlugin()]
  )

  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 点击卡片切换放大状态
  const handleCardClick = useCallback((index: number) => {
    setActiveIndex(prev => prev === index ? null : index)
  }, [])

  // 当 activeIndex 变化时，重新计算 embla
  useEffect(() => {
    if (emblaApi) {
      // 延迟一下让 DOM 更新完成
      setTimeout(() => emblaApi.reInit(), 50)
    }
  }, [activeIndex, emblaApi])

  // 左箭头点击
  const handlePrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  // 右箭头点击
  const handleNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
      }}
    >
      {/* 标题区域 - 左侧 WHICH PRODUCTS */}
      <div
        className="absolute"
        style={{
          left: vw(200),
          top: vw(0),
        }}
      >
        <h2
          className="relative font-josefin-sans font-bold uppercase text-left"
        >
          {/* 底层：描边镂空，向下偏移 */}
          <span
            className="absolute"
            style={{
              top: "5px",
              left: "1px",
              fontSize: vw(96),
              lineHeight: vw(104),
              color: "transparent",
              WebkitTextStroke: "1px #464010",
            }}
          >
            <span style={{ display: "block" }}>{(titleLeft || "Which\nProducts").split("\n")[0]}</span>
            <span style={{ display: "block", paddingLeft: vw(80) }}>{(titleLeft || "Which\nProducts").split("\n")[1]}</span>
          </span>
          {/* 顶层：黑色填充 */}
          <span
            className="relative text-black"
            style={{
              fontSize: vw(96),
              lineHeight: vw(104),
              display: "block",
            }}
          >
            <span style={{ display: "block" }}>{(titleLeft || "Which\nProducts").split("\n")[0]}</span>
            <span style={{ display: "block", paddingLeft: vw(80) }}>{(titleLeft || "Which\nProducts").split("\n")[1]}</span>
          </span>
        </h2>
      </div>

      {/* series 小标签 */}
      {titleLeftSuperscript && (
        <span
          className="absolute font-josefin-sans font-bold text-black uppercase"
          style={{
            left: vw(831),
            top: vw(108),
            fontSize: vw(16),
            lineHeight: vw(21),
          }}
        >
          {titleLeftSuperscript}
        </span>
      )}

      {/* 斜杠 / */}
      <div
        className="absolute bg-brand-olive-dark"
        style={{
          left: vw(1001),
          top: vw(101),
          width: vw(18),
          height: vw(79),
          transform: "skewX(-15deg)",
        }}
      />

      {/* 小圆点 */}
      <div
        className="absolute rounded-full bg-brand-olive-dark"
        style={{
          left: vw(1033),
          top: vw(161),
          width: vw(9),
          height: vw(9),
        }}
      />

      {/* 标题区域 - 右侧 Are You Looking For? */}
      <div
        className="absolute font-josefin-sans font-bold"
        style={{
          left: vw(1265),
          top: vw(18),
          fontSize: vw(77),
          lineHeight: vw(86),
        }}
      >
        {/* Are You - 四向描边效果，类似 text-stroke-black */}
        <span className="text-brand-main text-stroke-dark-olive">
          {titleRightBold}
        </span>
        <br />
        {/* Looking For? - 实心填充 */}
        <span className="text-black">
          {titleRightNormal}
        </span>
      </div>

      {/* 左箭头 */}
      <button
        onClick={handlePrev}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(153),
          top: vw(400),
          width: vw(83),
          height: vw(82),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* 右箭头 */}
      <button
        onClick={handleNext}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(1666),
          top: vw(400),
          width: vw(83),
          height: vw(82),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="#464010"/>
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F"/>
          <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white"/>
        </svg>
      </button>

      {/* Embla 轮播区域 */}
      <div
        className="absolute overflow-x-clip overflow-y-visible"
        ref={emblaRef}
        style={{
          left: vw(100),
          right: vw(100),
          bottom: vw(80),
          height: vw(EXPANDED_HEIGHT + 100),
        }}
      >
        <div
          className="flex items-end h-full"
          style={{
            gap: vw(CARD_GAP),
          }}
        >
          {products.map((product, index) => {
            const isActive = activeIndex === index
            const isFirst = index === 0
            const isLast = index === products.length - 1

            return (
              <div
                key={product.id}
                className="relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out"
                style={{
                  width: isActive ? vw(EXPANDED_WIDTH) : vw(CARD_WIDTH),
                  height: isActive ? vw(EXPANDED_HEIGHT) : vw(CARD_HEIGHT),
                  borderRadius: vw(30),
                  boxShadow: isActive
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.1)",
                  marginLeft: isFirst ? vw(100) : undefined,
                  marginRight: isLast ? vw(100) : undefined,
                }}
                onClick={() => handleCardClick(index)}
              >
                {/* 卡片容器 - 包含背景和图片 */}
                <div
                  className="absolute inset-0 overflow-hidden bg-white"
                  style={{
                    borderRadius: vw(30),
                  }}
                >
                  {/* 图片容器 - 底部对齐，水平居中 */}
                  {product.image && (
                    <div
                      className="absolute"
                      style={{
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                      }}
                    >
                      <Image
                        src={product.image.variants?.large || product.image.url}
                        alt={product.image.alt || product.title}
                        fill
                        className="object-contain object-bottom"
                      />
                    </div>
                  )}
                </div>

                {/* 激活时显示右上角 - 箭头 + buttonText（在卡片内部） */}
                {isActive && (
                  <Link
                    href={product.link || viewMoreLink}
                    className="absolute transition-all duration-300"
                    style={{
                      right: vw(10),
                      top: vw(10),
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 箭头装饰 */}
                    <Image
                      src="/contact-support/arrow-corner.svg"
                      alt=""
                      width={129}
                      height={129}
                      style={{
                        width: vw(80),
                        height: vw(80),
                      }}
                    />
                    {/* buttonText 文字 - 在箭头下方 */}
                    {product.buttonText && (
                      <span
                        className="absolute font-josefin-sans font-bold text-black whitespace-nowrap"
                        style={{
                          left: vw(0),
                          top: vw(85),
                          fontSize: vw(14),
                          lineHeight: vw(18),
                        }}
                      >
                        {product.buttonText}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
