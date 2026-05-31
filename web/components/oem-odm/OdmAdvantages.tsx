"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { getOptimizedImageUrl } from "@/lib/image-utils"
import useEmblaCarousel from "embla-carousel-react"

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 573 // 819 * 0.7

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-odm-advantages) * ${designValue})`

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

interface AdvantageItem {
  title: string
  description: string
  image?: MediaObject | null
}

interface OdmAdvantagesProps {
  title?: string
  items?: AdvantageItem[]
}

const defaultContent = {
  title: "The Advantages of Our ODM Service",
  items: [
    {
      title: "Product Design Support",
      description: "Our team offers structural, aesthetic, and functional design, delivering market-ready solutions.",
    },
    {
      title: "Custom Solutions",
      description: "Tailored designs to meet your specific requirements and brand identity.",
    },
    {
      title: "Quality Assurance",
      description: "Rigorous testing and inspection at every stage of production.",
    },
  ],
}

// 冒泡文字组件 - 不断向上冒泡的效果
function BubbleText({ text, isActive }: { text: string; isActive: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; y: number; opacity: number }[]>([])
  const bubbleIdRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      setBubbles([])
      return
    }

    // 每 600ms 生成一个新气泡
    const interval = setInterval(() => {
      const newId = bubbleIdRef.current++;
      setBubbles((prev) => [...prev, { id: newId, y: 0, opacity: 1 }]);
    }, 600);

    return () => clearInterval(interval);
  }, [isActive])

  return (
    <div className="relative" style={{ height: rpx(84), width: rpx(375) }}>
      {/* 气泡层 - 向上飘动并渐变消失 */}
      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.id}
          className="absolute font-anaheim font-extrabold"
          style={{
            left: 0,
            width: rpx(375),
            fontSize: rpx(32),
            lineHeight: rpx(36),
            background: "linear-gradient(to top, rgba(96,89,35,1) 0%, rgba(243,239,215,0) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextStroke: `2px transparent`,
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: -40, opacity: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          onAnimationComplete={() => {
            // 动画播放完成后，将气泡从数组中移除，避免内存泄漏
            setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
          }}
        >
          {text}
        </motion.span>
      ))}

      {/* 主文字层 - 实心填充 + 阴影 */}
      <span
        className="absolute font-anaheim font-extrabold text-left"
        style={{
          left: 0,
          top: 0,
          width: rpx(375),
          fontSize: rpx(32),
          lineHeight: rpx(36),
          color: "#605923",
          textShadow: "0 3px 3px rgba(0,0,0,0.25)",
        }}
      >
        {text}
      </span>
    </div>
  )
}

export function OdmAdvantages({
  title = defaultContent.title,
  items = defaultContent.items,
}: OdmAdvantagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Embla Carousels
  const [desktopEmblaRef, desktopEmblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: false,
    watchDrag: false,
  })

  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: false,
    watchDrag: true,
  })

  // Sync index and handle autoplay
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return

    const interval = setInterval(() => {
      if (window.innerWidth >= 768 && desktopEmblaApi) {
        desktopEmblaApi.scrollNext()
      } else if (mobileEmblaApi) {
        mobileEmblaApi.scrollNext()
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length, desktopEmblaApi, mobileEmblaApi])

  // Sync Desktop Embla to state and Mobile
  useEffect(() => {
    if (!desktopEmblaApi) return
    const onSelect = () => {
      const index = desktopEmblaApi.selectedScrollSnap()
      setCurrentIndex(index)
      if (mobileEmblaApi && mobileEmblaApi.selectedScrollSnap() !== index) {
        mobileEmblaApi.scrollTo(index, true)
      }
    }
    desktopEmblaApi.on("select", onSelect)
    return () => {
      desktopEmblaApi.off("select", onSelect)
    }
  }, [desktopEmblaApi, mobileEmblaApi])

  // Sync Mobile Embla to state and Desktop
  useEffect(() => {
    if (!mobileEmblaApi) return
    const onSelect = () => {
      const index = mobileEmblaApi.selectedScrollSnap()
      setCurrentIndex(index)
      if (desktopEmblaApi && desktopEmblaApi.selectedScrollSnap() !== index) {
        desktopEmblaApi.scrollTo(index, true)
      }
    }
    mobileEmblaApi.on("select", onSelect)
    return () => {
      mobileEmblaApi.off("select", onSelect)
    }
  }, [mobileEmblaApi, desktopEmblaApi])

  // Re-init Embla on item size changes to update snap points
  useEffect(() => {
    const timer = setTimeout(() => {
      if (desktopEmblaApi) desktopEmblaApi.reInit()
      if (mobileEmblaApi) mobileEmblaApi.reInit()
    }, 550)
    return () => clearTimeout(timer)
  }, [currentIndex, desktopEmblaApi, mobileEmblaApi])

  // Preload only sizes relevant to screen width
  useEffect(() => {
    if (typeof window === "undefined" || !items || items.length === 0) return
    items.forEach((item) => {
      if (item?.image) {
        const sizesToPreload = window.innerWidth >= 768 ? ["medium"] : ["small"]
        sizesToPreload.forEach((size) => {
          const url = getOptimizedImageUrl(item.image as any, size as any)
          if (url) {
            const img = new window.Image()
            img.src = url
          }
        })
      }
    })
  }, [items])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    if (window.innerWidth >= 768 && desktopEmblaApi) {
      desktopEmblaApi.scrollPrev()
    } else if (mobileEmblaApi) {
      mobileEmblaApi.scrollPrev()
    }
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    if (window.innerWidth >= 768 && desktopEmblaApi) {
      desktopEmblaApi.scrollNext()
    } else if (mobileEmblaApi) {
      mobileEmblaApi.scrollNext()
    }
  }

  const currentItem = items[currentIndex]
  const nextIndex = (currentIndex + 1) % items.length
  const nextItem = items[nextIndex]

  // 大图 = 当前item的图片，小图 = 下一个item的图片
  const leftImage = currentItem?.image
  const middleImage = nextItem?.image

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-odm-advantages" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div
        className="hidden md:block relative w-full"
        style={{ height: rpx(DESIGN_HEIGHT), marginTop: rpx(70), marginBottom: rpx(105) }}
      >
        {/* 居中内容容器 */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: rpx(1344), // 1920 * 0.7
            height: rpx(DESIGN_HEIGHT),
          }}
        >
        {/* 标题 - The Advantages of Our ODM Service - 渐变填充 */}
        <motion.h2
          className="absolute font-anaheim font-extrabold"
          style={{
            left: rpx(520), // 743 * 0.7
            top: rpx(5), // 7 * 0.7
            fontSize: rpx(60),
            lineHeight: rpx(68),
            width: rpx(800),
            letterSpacing: "0.03em",
            whiteSpace: "pre-line",
            background: "linear-gradient(to bottom, #D8D2A2 0%, #756F3F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxHeight: rpx(136),
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(117, 111, 63, 0.5) transparent",
            paddingRight: rpx(10),
            paddingBottom: rpx(6),
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>

        {/* 优势图片轮播区域 - 包含可见的当前（大）和下一个（小）图片 */}
        <div
          className="absolute overflow-hidden"
          ref={desktopEmblaRef}
          style={{
            left: rpx(107),
            top: rpx(0),
            width: rpx(665), // 387 (active) + 26 (gap) + 252 (next) = 665
            height: rpx(573),
          }}
        >
          <div
            className="flex items-end h-full !overflow-visible"
          >
            {items.map((item, index) => {
              const isActive = currentIndex === index
              const isNext = (currentIndex + 1) % items.length === index
              const isVisible = isActive || isNext

              return (
                <div
                  key={index}
                  className="embla__slide relative flex-shrink-0"
                  style={{
                    width: rpx(387),
                    height: rpx(573),
                    marginRight: rpx(26),
                  }}
                >
                  <div
                    className="overflow-hidden bg-[#D9D9D9]"
                    style={{
                      width: isActive ? rpx(387) : rpx(252),
                      height: isActive ? rpx(573) : rpx(334),
                      marginTop: isActive ? 0 : rpx(204),
                      borderRadius: rpx(21),
                      opacity: isVisible ? 1 : 0,
                      transition: "all 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                    }}
                  >
                    {item.image ? (
                      item.image.enableLink && item.image.linkUrl ? (
                        <Link href={item.image.linkUrl} target={item.image.openInNewTab ? "_blank" : undefined} rel={item.image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                          <div
                            className="w-full h-full"
                            style={{
                              transform: isActive ? "scale(1)" : "scale(1.08)",
                              transition: "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                            }}
                          >
                            <OptimizedImage
                              image={item.image as any}
                              alt={item.title || "Advantage Image"}
                              size="medium"
                              className="w-full h-full object-cover"
                              priority={isActive}
                            />
                          </div>
                        </Link>
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            transform: isActive ? "scale(1)" : "scale(1.08)",
                            transition: "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                          }}
                        >
                          <OptimizedImage
                            image={item.image as any}
                            alt={item.title || "Advantage Image"}
                            size="medium"
                            className="w-full h-full object-cover"
                            priority={isActive}
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div
          className="absolute"
          style={{
            left: rpx(798), // 1140 * 0.7
            top: rpx(204), // 291 * 0.7
            width: rpx(420), // 600 * 0.7
          }}
        >
          {/* 冒泡标题 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BubbleText text={currentItem?.title || ""} isActive={true} />
            </motion.div>
          </AnimatePresence>

          {/* 描述文字背景框 - 左侧两个直角与图片右侧连接 */}
          <motion.div
            className="absolute flex items-center overflow-hidden"
            style={{
              left: rpx(-26), // -37 * 0.7
              top: rpx(112), // 160 * 0.7
              width: rpx(480), // 686 * 0.7
              height: rpx(120), // 171 * 0.7
              backgroundColor: "#F3EFD7",
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: rpx(21), // 30 * 0.7
              borderBottomRightRadius: rpx(21), // 30 * 0.7
              paddingLeft: rpx(26), // aligned with title
              paddingRight: rpx(24), // 34 * 0.7
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 描述文字 */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                className="font-anaheim font-semibold overflow-y-auto w-full"
                style={{
                  maxHeight: rpx(100),
                  fontSize: rpx(20), // 28 * 0.7
                  lineHeight: rpx(26), // 37 * 0.7
                  color: "#5D5727",
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(93,87,39,0.3) transparent',
                  overscrollBehavior: 'contain',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentItem?.description || ""}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 底部导航按钮 */}
        <div
          className="absolute flex gap-3"
          style={{
            left: rpx(1068), // 1526 * 0.7
            top: rpx(468), // 668 * 0.7
          }}
        >
          {/* 上一个按钮 */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center rounded-full border border-[#756F3F] bg-transparent text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white"
            style={{
              width: rpx(52), // 74 * 0.7
              height: rpx(52), // 74 * 0.7
            }}
          >
            <svg
              style={{ width: rpx(12), height: rpx(20) }}
              viewBox="0 0 17 29"
              fill="none"
            >
              <path
                d="M15 2L3 14.5L15 27"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 下一个按钮 */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center rounded-full border border-[#756F3F] bg-transparent text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white"
            style={{
              width: rpx(52), // 74 * 0.7
              height: rpx(52), // 74 * 0.7
            }}
          >
            <svg
              style={{ width: rpx(12), height: rpx(20) }}
              viewBox="0 0 17 29"
              fill="none"
            >
              <path
                d="M2 2L14 14.5L2 27"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-8">
        {/* 标题 */}
        <h2
          className="font-anaheim font-extrabold text-2xl mb-6 overflow-y-auto"
          style={{
            background: "linear-gradient(to bottom, #D8D2A2 0%, #756F3F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxHeight: "4.2rem",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(117, 111, 63, 0.5) transparent",
            paddingRight: "8px",
            paddingBottom: "4px",
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </h2>

        {/* 优势图片轮播区域 */}
        <div
          className="w-full overflow-hidden mb-6"
          ref={mobileEmblaRef}
          style={{
            height: "calc((100vw - 40px) * 0.62 * (819 / 553))",
          }}
        >
          <div
            className="flex items-end h-full !overflow-visible"
          >
            {items.map((item, index) => {
              const isActive = currentIndex === index
              const isNext = (currentIndex + 1) % items.length === index
              const isVisible = isActive || isNext

              return (
                <div
                  key={index}
                  className="embla__slide relative flex-shrink-0 h-full"
                  style={{
                    width: "62%",
                    marginRight: "12px",
                  }}
                >
                  <div
                    className="overflow-hidden bg-[#D9D9D9]"
                    style={{
                      width: isActive ? "100%" : "51.6%",
                      height: isActive ? "100%" : "46.2%",
                      marginTop: isActive ? 0 : "53.8%",
                      borderRadius: "16px",
                      opacity: isVisible ? 1 : 0,
                      transition: "all 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                    }}
                  >
                    {item.image ? (
                      item.image.enableLink && item.image.linkUrl ? (
                        <Link href={item.image.linkUrl} target={item.image.openInNewTab ? "_blank" : undefined} rel={item.image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                          <div
                            className="w-full h-full"
                            style={{
                              transform: isActive ? "scale(1)" : "scale(1.08)",
                              transition: "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                            }}
                          >
                            <OptimizedImage
                              image={item.image as any}
                              alt={item.title || "Advantage Image"}
                              size="small"
                              className="w-full h-full object-cover"
                              priority={isActive}
                            />
                          </div>
                        </Link>
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            transform: isActive ? "scale(1)" : "scale(1.08)",
                            transition: "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                          }}
                        >
                          <OptimizedImage
                            image={item.image as any}
                            alt={item.title || "Advantage Image"}
                            size="small"
                            className="w-full h-full object-cover"
                            priority={isActive}
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="mb-4">
          {/* 标题 */}
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentIndex}
              className="font-anaheim font-extrabold text-xl mb-3"
              style={{
                color: "#605923",
                textShadow: "0 2px 4px rgba(0,0,0,0.25)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem?.title}
            </motion.h3>
          </AnimatePresence>

          {/* 描述 */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#F3EFD7" }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                className="font-anaheim font-semibold text-sm"
                style={{ color: "#5D5727" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentItem?.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-[#756F3F] bg-transparent text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white"
          >
            <svg width="12" height="20" viewBox="0 0 17 29" fill="none">
              <path
                d="M15 2L3 14.5L15 27"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-[#756F3F] bg-transparent text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white"
          >
            <svg width="12" height="20" viewBox="0 0 17 29" fill="none">
              <path
                d="M2 2L14 14.5L2 27"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 指示器 */}
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                if (window.innerWidth >= 768 && desktopEmblaApi) {
                  desktopEmblaApi.scrollTo(index)
                } else if (mobileEmblaApi) {
                  mobileEmblaApi.scrollTo(index)
                }
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-[#605923]" : "bg-[#C0B88A]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default OdmAdvantages
