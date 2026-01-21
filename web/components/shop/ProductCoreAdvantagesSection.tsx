"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
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

  // Get the 3 images
  const image1 = images[0]
  const image2 = images[1]
  const image3 = images[2]

  return (
    <>
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
        {items.slice(0, 6).map((item, index) => {
          const style = CARD_STYLES[index] || CARD_STYLES[0]
          return (
            <div
              key={index}
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
      className="relative w-full bg-brand-main overflow-hidden hidden md:block"
      style={{
        ["--rpx-core-advantages" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        paddingBottom: rpx(80),
      }}
    >
      {/* Main Container */}
      <div
        className="relative mx-auto"
        style={{
          marginLeft: rpx(66),
          marginRight: rpx(66),
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Collapsed State */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
              style={{ height: rpx(648) }}
            >
              {/* Background SVG */}
              <Image
                src="/product-core-advantages/background-collapsed.svg"
                alt=""
                fill
                className="object-contain object-top"
                priority
              />

              {/* Content */}
              <div className="relative z-10 h-full flex">
                {/* Left: Title */}
                <div
                  className="flex items-end"
                  style={{
                    paddingLeft: rpx(89),
                    paddingBottom: rpx(150),
                  }}
                >
                  <h2
                    className="font-josefin-sans font-bold text-white whitespace-pre-line"
                    style={{
                      fontSize: rpx(96),
                      lineHeight: rpx(110),
                      width: rpx(800),
                    }}
                  >
                    {title}
                  </h2>
                </div>

                {/* Right: 3 Images */}
                <div
                  className="flex items-start ml-auto"
                  style={{
                    gap: rpx(6),
                    paddingTop: rpx(39),
                    paddingRight: rpx(42),
                  }}
                >
                  {/* Image 1 - tall */}
                  {image1 && (
                    <div
                      className="overflow-hidden flex-shrink-0"
                      style={{
                        width: rpx(243),
                        height: rpx(484),
                        borderRadius: rpx(69),
                      }}
                    >
                      <OptimizedImage
                        image={image1 as any}
                        alt={image1.altText || image1.alt || ""}
                        size="medium"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Image 2 - short */}
                  {image2 && (
                    <div
                      className="overflow-hidden flex-shrink-0"
                      style={{
                        width: rpx(243),
                        height: rpx(392),
                        borderRadius: rpx(69),
                      }}
                    >
                      <OptimizedImage
                        image={image2 as any}
                        alt={image2.altText || image2.alt || ""}
                        size="medium"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Image 3 - tall */}
                  {image3 && (
                    <div
                      className="overflow-hidden flex-shrink-0"
                      style={{
                        width: rpx(243),
                        height: rpx(484),
                        borderRadius: rpx(69),
                      }}
                    >
                      <OptimizedImage
                        image={image3 as any}
                        alt={image3.altText || image3.alt || ""}
                        size="medium"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow Button Container - 用于居中定位 */}
              <div
                className="absolute z-20 left-1/2 -translate-x-1/2"
                style={{
                  bottom: rpx(64),
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
                  <Image
                    src="/product-core-advantages/arrow-expand.svg"
                    alt="Expand"
                    fill
                    className="group-hover:brightness-110"
                  />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Expanded State */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: rpx(648) }}
              animate={{ opacity: 1, height: rpx(1166) }}
              exit={{ opacity: 0, height: rpx(648) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative overflow-hidden"
              style={{
                background: "linear-gradient(to bottom, #686230, #CEC25F)",
                borderRadius: rpx(75),
              }}
            >
              {/* Content */}
              <div className="relative z-10 h-full">
                {/* Top Section: Title and Images */}
                <div className="flex">
                  {/* Left: Title */}
                  <div
                    style={{
                      paddingLeft: rpx(89),
                      paddingTop: rpx(314),
                    }}
                  >
                    <h2
                      className="font-josefin-sans font-bold text-white whitespace-pre-line"
                      style={{
                        fontSize: rpx(96),
                        lineHeight: rpx(110),
                        width: rpx(800),
                      }}
                    >
                      {title}
                    </h2>
                  </div>

                  {/* Right: 3 Images */}
                  <div
                    className="flex items-start ml-auto"
                    style={{
                      gap: rpx(6),
                      paddingTop: rpx(39),
                      paddingRight: rpx(42),
                    }}
                  >
                    {/* Image 1 - tall */}
                    {image1 && (
                      <div
                        className="overflow-hidden flex-shrink-0"
                        style={{
                          width: rpx(243),
                          height: rpx(484),
                          borderRadius: rpx(69),
                        }}
                      >
                        <OptimizedImage
                          image={image1 as any}
                          alt={image1.altText || image1.alt || ""}
                          size="medium"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Image 2 - short */}
                    {image2 && (
                      <div
                        className="overflow-hidden flex-shrink-0"
                        style={{
                          width: rpx(243),
                          height: rpx(392),
                          marginTop: rpx(92),
                          borderRadius: rpx(69),
                        }}
                      >
                        <OptimizedImage
                          image={image2 as any}
                          alt={image2.altText || image2.alt || ""}
                          size="medium"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Image 3 - tall */}
                    {image3 && (
                      <div
                        className="overflow-hidden flex-shrink-0"
                        style={{
                          width: rpx(243),
                          height: rpx(484),
                          borderRadius: rpx(69),
                        }}
                      >
                        <OptimizedImage
                          image={image3 as any}
                          alt={image3.altText || image3.alt || ""}
                          size="medium"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Advantage Cards - 3 columns, 2 rows */}
                <div
                  className="flex flex-col"
                  style={{
                    paddingLeft: rpx(87),
                    paddingRight: rpx(87),
                    paddingTop: rpx(100),
                    paddingBottom: rpx(60),
                    gap: rpx(22),
                  }}
                >
                  {/* Row 1 */}
                  <div className="flex" style={{ gap: rpx(22) }}>
                    {items.slice(0, 3).map((item, index) => {
                      const style = CARD_STYLES[index] || CARD_STYLES[0]
                      return (
                        <motion.div
                          key={index}
                          className="flex flex-col overflow-hidden"
                          style={{
                            width: rpx(472),
                            height: rpx(236),
                            backgroundColor: style.bg,
                            borderRadius: rpx(41),
                          }}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        >
                          {/* Title - top half, text aligned to bottom */}
                          <div
                            className="flex items-end"
                            style={{
                              height: rpx(118),
                              paddingLeft: rpx(30),
                              paddingBottom: rpx(10),
                            }}
                          >
                            <h3
                              className="font-inter font-bold whitespace-pre-line"
                              style={{
                                fontSize: rpx(30),
                                lineHeight: rpx(36),
                                color: style.titleColor,
                              }}
                            >
                              {item.title}
                            </h3>
                          </div>

                          {/* Description with gradient background - bottom half, bottom corners rounded */}
                          <div
                            className="flex items-start"
                            style={{
                              width: rpx(472),
                              height: rpx(118),
                              background: `linear-gradient(to bottom, ${style.gradientFrom}, ${style.gradientTo})`,
                              borderBottomLeftRadius: rpx(41),
                              borderBottomRightRadius: rpx(41),
                              padding: rpx(20),
                              marginTop: 'auto',
                            }}
                          >
                            {item.description && (
                              <p
                                className="font-inter whitespace-pre-line"
                                style={{
                                  fontSize: rpx(20),
                                  lineHeight: rpx(25),
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

                  {/* Row 2 - offset 102px to the right */}
                  <div className="flex" style={{ gap: rpx(22), marginLeft: rpx(102) }}>
                    {items.slice(3, 6).map((item, index) => {
                      const style = CARD_STYLES[index + 3] || CARD_STYLES[0]
                      return (
                        <motion.div
                          key={index + 3}
                          className="flex flex-col overflow-hidden"
                          style={{
                            width: rpx(472),
                            height: rpx(236),
                            backgroundColor: style.bg,
                            borderRadius: rpx(41),
                          }}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 + (index + 3) * 0.1 }}
                        >
                          {/* Title - top half, text aligned to bottom */}
                          <div
                            className="flex items-end"
                            style={{
                              height: rpx(118),
                              paddingLeft: rpx(30),
                              paddingBottom: rpx(10),
                            }}
                          >
                            <h3
                              className="font-inter font-bold whitespace-pre-line"
                              style={{
                                fontSize: rpx(30),
                                lineHeight: rpx(36),
                                color: style.titleColor,
                              }}
                            >
                              {item.title}
                            </h3>
                          </div>

                          {/* Description with gradient background - bottom half, bottom corners rounded */}
                          <div
                            className="flex items-start"
                            style={{
                              width: rpx(472),
                              height: rpx(118),
                              background: `linear-gradient(to bottom, ${style.gradientFrom}, ${style.gradientTo})`,
                              borderBottomLeftRadius: rpx(41),
                              borderBottomRightRadius: rpx(41),
                              padding: rpx(20),
                              marginTop: 'auto',
                            }}
                          >
                            {item.description && (
                              <p
                                className="font-inter whitespace-pre-line"
                                style={{
                                  fontSize: rpx(20),
                                  lineHeight: rpx(25),
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
