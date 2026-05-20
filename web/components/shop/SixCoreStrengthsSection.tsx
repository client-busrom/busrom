"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Design reference dimensions (from Figma 1920x922)
const DESIGN_WIDTH = 1920

// Responsive size function
const rpx = (designValue: number) => `calc(var(--rpx-strengths) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface StrengthItem {
  title: string
  description?: string
}

interface ImageLinkData {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface SixCoreStrengthsSectionProps {
  subtitle?: string
  title?: string
  items: StrengthItem[]
  image?: MediaObject | null
  imageLink?: ImageLinkData | null
}

// Card background colors from Figma (3 different colors, bottom to top)
const CARD_COLORS = [
  "#E1D99C", // Light gold (top card)
  "#A59D60", // Medium gold (middle card)
  "#756F3F", // Dark gold (bottom card)
]

// Card dimensions
const CARD_WIDTH = 437
const CARD_HEIGHT = 158
const CARD_OVERLAP = -40 // Negative gap for overlap

export function SixCoreStrengthsSection({
  subtitle,
  title,
  items,
  image,
  imageLink,
}: SixCoreStrengthsSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Split items into left (0-2) and right (3-5) groups
  const leftItems = items.slice(0, 3)
  const rightItems = items.slice(3, 6)

  // Calculate object position from focal point
  const objectPosition = image?.cropFocalPoint
    ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
    : "center"

  // Calculate displacement for non-hovered items
  const getItemTransform = (localIndex: number, isLeft: boolean) => {
    const globalIndex = isLeft ? localIndex : localIndex + 3

    // Base z-index: bottom card (index 2) has highest z-index
    const baseZIndex = localIndex + 1 // 1, 2, 3 (bottom card highest)

    if (hoveredIndex === null) {
      return { x: 0, y: 0, scale: 1, zIndex: baseZIndex, shadow: false }
    }

    const hoveredIsLeft = hoveredIndex < 3
    const currentIsLeft = isLeft

    // If hovered item is on the same side
    if (hoveredIsLeft === currentIsLeft) {
      const hoveredLocalIndex = isLeft ? hoveredIndex : hoveredIndex - 3

      if (localIndex === hoveredLocalIndex) {
        // This is the hovered item - bring to top with shadow
        return { x: 0, y: 0, scale: 1.2, zIndex: 10, shadow: true }
      } else {
        // Push other items away radially - increased distance for "bounce" effect
        const direction = localIndex < hoveredLocalIndex ? -1 : 1
        const xOffset = isLeft ? -45 : 45
        const yOffset = direction * 35
        return { x: xOffset, y: yOffset, scale: 0.95, zIndex: baseZIndex, shadow: false }
      }
    }

    return { x: 0, y: 0, scale: 1, zIndex: baseZIndex, shadow: false }
  }

  const renderCard = (item: StrengthItem, index: number, isLeft: boolean) => {
    const globalIndex = isLeft ? index : index + 3
    const colorIndex = index % 3
    const transform = getItemTransform(index, isLeft)
    const isHovered = hoveredIndex === globalIndex

    return (
      <motion.div
        key={globalIndex}
        className="absolute cursor-pointer"
        style={{
          width: rpx(CARD_WIDTH),
          height: rpx(CARD_HEIGHT),
          borderRadius: rpx(59),
          backgroundColor: CARD_COLORS[colorIndex],
          top: `calc(${rpx((CARD_HEIGHT + CARD_OVERLAP) * index)})`,
          zIndex: transform.zIndex,
        }}
        animate={{
          x: transform.x,
          y: transform.y,
          scale: transform.scale,
          boxShadow: transform.shadow
            ? "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)"
            : "0 0 0 rgba(0, 0, 0, 0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onMouseEnter={() => setHoveredIndex(globalIndex)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center px-6"
          animate={{
            y: isHovered ? 0 : -10,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.span
            className="font-inter text-white whitespace-pre-line text-center"
            style={{
              fontSize: rpx(20),
              lineHeight: rpx(26),
              fontWeight: isHovered ? 800 : 600,
            }}
          >
            {item.title}
          </motion.span>
        </motion.div>
      </motion.div>
    )
  }

  // Calculate total height of stacked cards
  const stackedHeight = CARD_HEIGHT + (CARD_HEIGHT + CARD_OVERLAP) * 2

  return (
    <>
      {/* Mobile Layout */}
      <section className="md:hidden bg-brand-main px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          {subtitle && (
            <p className="font-josefin-sans text-lg text-[#AB9F63] mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="font-josefin-sans font-bold text-2xl text-[#46401F]">
            {title}
          </h2>
        </div>

        {/* Center Image */}
        {image && (
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6">
            {imageLink?.enableLink && imageLink.linkUrl ? (
              <Link
                href={imageLink.linkUrl}
                target={imageLink.openInNewTab ? "_blank" : undefined}
                rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined}
                className="block w-full h-full"
              >
                <OptimizedImage
                  image={image as any}
                  alt={image.altText || image.alt || title || ""}
                  size="medium"
                  className="w-full h-full object-cover"
                  objectPosition={objectPosition}
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title || ""}
                size="medium"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
              />
            )}
          </div>
        )}

        {/* Cards - 2 columns, larger size */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="rounded-2xl p-4 min-h-[80px] flex items-center"
              style={{ backgroundColor: CARD_COLORS[index % 3] }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-inter font-semibold text-white text-sm leading-tight">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Desktop Layout */}
      <section
        className="relative w-full bg-brand-main overflow-hidden hidden md:block"
        style={{
          ["--rpx-strengths" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
          minHeight: rpx(922),
        }}
      >
        <div className="relative" style={{ minHeight: rpx(922) }}>
          {/* Header - centered in screen */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{
              top: rpx(62),
            }}
          >
            {/* Subtitle - right aligned with title, above title */}
            {subtitle && (
              <p
                className="font-josefin-sans self-end"
                style={{
                  fontSize: rpx(36),
                  lineHeight: rpx(42),
                  color: "#AB9F63",
                  marginBottom: rpx(10),
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Title - centered */}
            <h2
              className="font-josefin-sans font-bold text-center"
              style={{
                fontSize: rpx(60),
                lineHeight: rpx(56),
                color: "#46401F",
              }}
            >
              {title}
            </h2>
          </div>

          {/* Left Cards - stacked with overlap */}
          <div
            className="absolute"
            style={{
              left: rpx(150),
              top: rpx(316),
              width: rpx(CARD_WIDTH),
              height: rpx(stackedHeight),
            }}
          >
            {leftItems.map((item, index) => renderCard(item, index, true))}
          </div>

          {/* Center Image with SVG mask */}
          <div
            className="absolute"
            style={{
              left: rpx(643),
              top: rpx(250),
              width: rpx(624),
              height: rpx(524),
            }}
          >
            {/* SVG Mask Definition */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="image-mask" clipPathUnits="objectBoundingBox">
                  <path d="M0.875,0.5 C0.944,0.5 1,0.567 1,0.649 L1,0.851 C1,0.933 0.944,1 0.875,1 L0.125,1 C0.056,1 0,0.933 0,0.851 L0,0.649 C0,0.567 0.056,0.5 0.125,0.5 C0.056,0.5 0,0.433 0,0.351 L0,0.149 C0,0.067 0.056,0 0.125,0 L0.875,0 C0.944,0 1,0.067 1,0.149 L1,0.351 C1,0.433 0.944,0.5 0.875,0.5 Z" />
                </clipPath>
              </defs>
            </svg>

            <div
              className="w-full h-full overflow-hidden"
              style={{
                clipPath: "url(#image-mask)",
              }}
            >
              {image ? (
                imageLink?.enableLink && imageLink.linkUrl ? (
                  <Link
                    href={imageLink.linkUrl}
                    target={imageLink.openInNewTab ? "_blank" : undefined}
                    rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined}
                    className="block w-full h-full"
                  >
                    <OptimizedImage
                      image={image as any}
                      alt={image.altText || image.alt || title || ""}
                      size="large"
                      className="w-full h-full object-cover"
                      objectPosition={objectPosition}
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={image as any}
                    alt={image.altText || image.alt || title || ""}
                    size="large"
                    className="w-full h-full object-cover"
                    objectPosition={objectPosition}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </div>

          {/* Right Cards - stacked with overlap */}
          <div
            className="absolute"
            style={{
              left: rpx(1317),
              top: rpx(316),
              width: rpx(CARD_WIDTH),
              height: rpx(stackedHeight),
            }}
          >
            {rightItems.map((item, index) => renderCard(item, index, false))}
          </div>
        </div>
      </section>
    </>
  )
}
