"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Design reference dimensions (from Figma 1920)
const DESIGN_WIDTH = 1920

// Responsive size function
const rpx = (designValue: number) => `calc(var(--rpx-core-advantages) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface AdvantageItem {
  title: string
  description?: string
}

interface ProductCoreAdvantagesSectionProps {
  title?: string
  images: MediaObject[]
  items: AdvantageItem[]
}

// Card styles for the 6 advantage cards
// Row 1: light, light, yellow
// Row 2: green(dark), light, light
const CARD_STYLES = [
  // Row 1
  { bg: "#FFF9C7", titleColor: "#363107", descColor: "#614714", gradientFrom: "#F4EB9A", gradientTo: "#FFF9C7" },
  { bg: "#FFF9C7", titleColor: "#363107", descColor: "#614714", gradientFrom: "#F4EB9A", gradientTo: "#FFF9C7" },
  { bg: "#FFED5D", titleColor: "#363107", descColor: "#614714", gradientFrom: "#E1CB17", gradientTo: "#FFF5A1" },
  // Row 2
  { bg: "#897F37", titleColor: "#FFFFFF", descColor: "#F3EA9F", gradientFrom: "#6D6420", gradientTo: "#D3C551" },
  { bg: "#FFF9C7", titleColor: "#46401F", descColor: "#706714", gradientFrom: "#F4EB9A", gradientTo: "#FFF9C7" },
  { bg: "#FFF9C7", titleColor: "#46401F", descColor: "#706714", gradientFrom: "#F4EB9A", gradientTo: "#FFF9C7" },
]

export function ProductCoreAdvantagesSection({
  title = "Product Core Advantages",
  images,
  items,
}: ProductCoreAdvantagesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  const itemsWithIndex = items.map((item, idx) => ({ ...item, originalIndex: idx }))
  const row1Items = itemsWithIndex.filter((_, i) => i % 2 === 0)
  const row2Items = itemsWithIndex.filter((_, i) => i % 2 === 1)

  // Get the 3 images
  const image1 = images[0]
  const image2 = images[1]
  const image3 = images[2]

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-show-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .hover-show-scrollbar:hover {
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .hover-show-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .hover-show-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }
        `
      }} />
      {/* Mobile Layout */}
      <section className="md:hidden bg-brand-main px-4 py-8">
        {/* Title */}
        <h2 className="font-josefin-sans font-bold text-2xl text-white text-center mb-6 px-4 py-6 rounded-3xl"
          style={{ background: "linear-gradient(to bottom, #686230, #9A9255)" }}
        >
          {title}
        </h2>

        {/* Images Row */}
        <div className="flex gap-2 mb-6">
          {image1 && (
            <div className="flex-1 h-40 rounded-2xl overflow-hidden">
              <OptimizedImage
                image={image1 as any}
                alt={image1.altText || image1.alt || ""}
                size="medium"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {image2 && (
            <div className="flex-1 h-32 mt-4 rounded-2xl overflow-hidden">
              <OptimizedImage
                image={image2 as any}
                alt={image2.altText || image2.alt || ""}
                size="medium"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {image3 && (
            <div className="flex-1 h-40 rounded-2xl overflow-hidden">
              <OptimizedImage
                image={image3 as any}
                alt={image3.altText || image3.alt || ""}
                size="medium"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Advantage Cards - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {itemsWithIndex.map((item) => {
            const style = CARD_STYLES[item.originalIndex % CARD_STYLES.length]
            return (
              <div
                key={item.originalIndex}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: style.bg }}
              >
                {/* Title */}
                <div className="p-4 pb-2">
                  <h3
                    className="font-inter font-bold text-sm leading-tight"
                    style={{ color: style.titleColor }}
                  >
                    {item.title}
                  </h3>
                </div>
                {/* Description */}
                {item.description && (
                  <div
                    className="px-4 py-3"
                    style={{ background: `linear-gradient(to bottom, ${style.gradientFrom}, ${style.gradientTo})` }}
                  >
                    <p
                      className="font-inter text-xs leading-snug"
                      style={{ color: style.descColor }}
                    >
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Desktop Layout */}
      <section
        className="relative w-full bg-brand-main overflow-hidden hidden md:block py-20"
        style={{
          ["--rpx-core-advantages" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        }}
      >
        {/* Main Container - 缩小宽度 (0.755倍) */}
        <div
          className="relative mx-auto"
          style={{
            marginLeft: rpx(260),
            marginRight: rpx(260),
          }}
        >
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              /* Collapsed State - 与展开状态比例一致 */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
                style={{ height: rpx(489) }}
              >
                {/* Background SVG */}
                <img
                  src="/product-core-advantages/background-collapsed.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain object-top"
                  style={{ objectPosition: "center top" }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex">
                  {/* Left: Title */}
                  <div
                    className="flex items-start"
                    style={{
                      paddingLeft: rpx(64),
                      paddingTop: rpx(120),
                    }}
                  >
                    <motion.h2
                      layoutId="advantage-title"
                      className="font-josefin-sans font-bold text-white whitespace-pre-line"
                      style={{
                        fontSize: rpx(72),
                        lineHeight: rpx(83),
                        width: rpx(600),
                      }}
                    >
                      {title}
                    </motion.h2>
                  </div>

                  {/* Right: 3 Images */}
                  <div
                    className="flex items-start ml-auto"
                    style={{
                      gap: rpx(12),
                      paddingTop: rpx(40),
                      paddingRight: rpx(40),
                    }}
                  >
                    {[image1, image2, image3].map((img, idx) => {
                      if (!img) return null
                      const isShort = idx === 1
                      return (
                        <motion.div
                          key={`collapsed-img-${idx}`}
                          layoutId={`advantage-img-${idx}`}
                          className="overflow-hidden flex-shrink-0"
                          style={{
                            width: rpx(175),
                            height: rpx(isShort ? 284 : 350),
                            borderRadius: rpx(53),
                          }}
                        >
                          <OptimizedImage
                            image={img as any}
                            alt={img.altText || img.alt || ""}
                            size="medium"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Arrow Button Container - 用于居中定位 */}
                <div
                  className="absolute z-20 left-1/2 -translate-x-1/2"
                  style={{
                    bottom: rpx(20),
                    width: rpx(126),
                    height: rpx(126),
                  }}
                >
                  {/* 按钮本身 - 用于动画 */}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="relative w-full h-full cursor-pointer animate-bounce-slow hover:scale-110 active:scale-95 transition-transform group"
                  >
                    {/* 脉冲光环效果 */}
                    <span
                      className="absolute inset-0 rounded-full animate-ping-slow"
                      style={{
                        background: "radial-gradient(circle, rgba(255, 238, 99, 0.4) 0%, transparent 70%)",
                      }}
                    />
                    <img
                      src="/product-core-advantages/arrow-expand.svg"
                      alt="Expand"
                      className="absolute inset-0 w-full h-full group-hover:brightness-110"
                    />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Expanded State - 缩小到880高度 (0.755倍)，字体保持原大小 */
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: rpx(489) }}
                animate={{ opacity: 1, height: rpx(880) }}
                exit={{ opacity: 0, height: rpx(489) }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative overflow-hidden"
                style={{
                  background: "linear-gradient(to bottom, #686230, #CEC25F)",
                  borderRadius: rpx(43),
                }}
              >
                {/* Content */}
                <div className="relative z-10 h-full">
                  {/* Top Section: Title and Images - 展开态下齐 */}
                  <div className="flex items-end">
                    {/* Left: Title - 字体缩小，下对齐 */}
                    <div
                      className="flex items-end"
                      style={{
                        paddingLeft: rpx(64),
                      }}
                    >
                      <motion.h2
                        layoutId="advantage-title"
                        className="font-josefin-sans font-bold text-white whitespace-pre-line"
                        style={{
                          fontSize: rpx(60),
                          lineHeight: rpx(68),
                          width: rpx(600),
                        }}
                      >
                        {title}
                      </motion.h2>
                    </div>

                    {/* Right: 3 Images - 展开态下齐 */}
                    <div
                      className="flex items-end ml-auto"
                      style={{
                        gap: rpx(12),
                        paddingTop: rpx(22),
                        paddingRight: rpx(40),
                      }}
                    >
                      {[image1, image2, image3].map((img, idx) => {
                        if (!img) return null
                        const isShort = idx === 1
                        return (
                          <motion.div
                            key={`expanded-img-${idx}`}
                            layoutId={`advantage-img-${idx}`}
                            className="overflow-hidden flex-shrink-0"
                            style={{
                              width: rpx(175),
                              height: rpx(isShort ? 284 : 350),
                              borderRadius: rpx(53),
                            }}
                          >
                            <OptimizedImage
                              image={img as any}
                              alt={img.altText || img.alt || ""}
                              size="medium"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom Section: Advantage Cards - 3 columns, 2 rows - 保持原尺寸 */}
                  <div
                    ref={scrollContainerRef}
                    className="flex flex-col overflow-x-auto hover-show-scrollbar"
                    data-lenis-prevent="true"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    style={{
                      paddingLeft: rpx(66),
                      paddingRight: rpx(66),
                      paddingTop: rpx(50),
                      paddingBottom: rpx(30),
                      gap: rpx(17),
                      cursor: isDragging ? "grabbing" : "grab",
                      userSelect: isDragging ? "none" : "auto",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {/* Row 1 */}
                    <div className="flex flex-row flex-nowrap" style={{ gap: rpx(17), width: "max-content" }}>
                      {row1Items.map((item) => {
                        const style = CARD_STYLES[item.originalIndex % CARD_STYLES.length]
                        return (
                          <motion.div
                            key={item.originalIndex}
                            className="flex flex-col overflow-hidden flex-shrink-0"
                            style={{
                              width: rpx(356),
                              height: rpx(200),
                              backgroundColor: style.bg,
                              borderRadius: rpx(31),
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + item.originalIndex * 0.05 }}
                          >
                            {/* Title - top half, text aligned to bottom */}
                            <div
                              className="flex flex-col overflow-y-auto hover-show-scrollbar"
                              data-lenis-prevent="true"
                              style={{
                                height: rpx(100),
                                paddingLeft: rpx(23),
                                paddingBottom: rpx(8),
                                paddingRight: rpx(23),
                                paddingTop: rpx(16),
                              }}
                            >
                              <h3
                                className="font-inter font-bold whitespace-pre-line mt-auto"
                                style={{
                                  fontSize: rpx(24),
                                  lineHeight: rpx(30),
                                  color: style.titleColor,
                                }}
                              >
                                {item.title}
                              </h3>
                            </div>

                            {/* Description with gradient background - bottom half, bottom corners rounded */}
                            <div
                              className="flex items-start overflow-y-auto hover-show-scrollbar"
                              data-lenis-prevent="true"

                              style={{
                                width: rpx(356),
                                height: rpx(100),
                                background: `linear-gradient(to bottom, ${style.gradientFrom}, ${style.gradientTo})`,
                                borderBottomLeftRadius: rpx(31),
                                borderBottomRightRadius: rpx(31),
                                padding: rpx(15),
                                marginTop: 'auto',
                                overscrollBehavior: "contain",
                              }}
                            >
                              {item.description && (
                                <p
                                  className="font-inter whitespace-pre-line w-full"
                                  style={{
                                    fontSize: rpx(16),
                                    lineHeight: rpx(23),
                                    color: style.descColor,
                                  }}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Row 2 - offset to the right */}
                    <div className="flex flex-row flex-nowrap" style={{ gap: rpx(17), marginLeft: rpx(77), width: "max-content" }}>
                      {row2Items.map((item) => {
                        const style = CARD_STYLES[item.originalIndex % CARD_STYLES.length]
                        return (
                          <motion.div
                            key={item.originalIndex}
                            className="flex flex-col overflow-hidden flex-shrink-0"
                            style={{
                              width: rpx(356),
                              height: rpx(200),
                              backgroundColor: style.bg,
                              borderRadius: rpx(31),
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + item.originalIndex * 0.05 }}
                          >
                            {/* Title - top half, text aligned to bottom */}
                            <div
                              className="flex flex-col overflow-y-auto hover-show-scrollbar"
                              data-lenis-prevent="true"
                              style={{
                                height: rpx(100),
                                paddingLeft: rpx(23),
                                paddingBottom: rpx(8),
                                paddingRight: rpx(23),
                                paddingTop: rpx(16),
                              }}
                            >
                              <h3
                                className="font-inter font-bold whitespace-pre-line mt-auto"
                                style={{
                                  fontSize: rpx(24),
                                  lineHeight: rpx(30),
                                  color: style.titleColor,
                                }}
                              >
                                {item.title}
                              </h3>
                            </div>

                            {/* Description with gradient background - bottom half, bottom corners rounded */}
                            <div
                              className="flex items-start overflow-y-auto hover-show-scrollbar"
                              data-lenis-prevent="true"

                              style={{
                                width: rpx(356),
                                height: rpx(100),
                                background: `linear-gradient(to bottom, ${style.gradientFrom}, ${style.gradientTo})`,
                                borderBottomLeftRadius: rpx(31),
                                borderBottomRightRadius: rpx(31),
                                padding: rpx(15),
                                marginTop: 'auto',
                                overscrollBehavior: "contain",
                              }}
                            >
                              {item.description && (
                                <p
                                  className="font-inter whitespace-pre-line w-full"
                                  style={{
                                    fontSize: rpx(16),
                                    lineHeight: rpx(23),
                                    color: style.descColor,
                                  }}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
