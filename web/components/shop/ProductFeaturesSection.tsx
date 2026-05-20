"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Design reference dimensions (from Figma 1920x922)
const DESIGN_WIDTH = 1920

// Responsive size function
const rpx = (designValue: number) => `calc(var(--rpx-features) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface FeatureItem {
  title: string
  description?: string
}

interface ImageLinkData {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface ProductFeaturesSectionProps {
  title?: string
  items: FeatureItem[]
  image?: MediaObject | null
  imageLink?: ImageLinkData | null
}

// Star component with twinkling animation
const TwinklingStar = ({
  x,
  y,
  size,
  delay = 0,
}: {
  x: number
  y: number
  size: number
  delay?: number
}) => {
  // Scale factor for different star sizes
  const scale = size / 90

  return (
    <motion.svg
      className="absolute"
      style={{
        left: rpx(x),
        top: rpx(y),
        width: rpx(size),
        height: rpx(size),
      }}
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <path
        d="M45 90C45 62.775 45 45 0 45C30.9938 45.0506 45 45 45 0C45 45 61.3463 45.0506 90 45C64.7438 45.0506 45 45 45 90Z"
        fill="#756F3F"
      />
    </motion.svg>
  )
}

const FeatureItem = ({
  title,
  dotX,
  dotY,
  align,
  isSelected,
  onHoverStart,
  onHoverEnd,
  onClick,
}: {
  title: string
  dotX: number
  dotY: number
  align: "left" | "right"
  isSelected: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: (e: React.MouseEvent) => void
}) => {
  const dotRadius = 15
  const maxWidth = 320
  const lineHeight = 28
  const overlap = -3 // Text overlaps into dot center by 5px

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: rpx(dotX),
        top: rpx(dotY),
        width: 0,
        height: 0,
        zIndex: 10,
      }}
      whileHover="hover"
      animate={isSelected ? "hover" : "idle"}
      initial="idle"
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
    >
      {/* Dot - centered on anchor */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: rpx(-dotRadius),
          top: rpx(-dotRadius),
          width: rpx(dotRadius * 2),
          height: rpx(dotRadius * 2),
          backgroundColor: "#EDE8D9",
        }}
        variants={{
          idle: { scale: 1, backgroundColor: "#EDE8D9" },
          hover: { scale: 1.5, backgroundColor: "#A59D60" },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      />
      
      {/* Text - positioned relative to anchor */}
      <motion.p
        className={`absolute font-josefin-sans font-semibold whitespace-pre-wrap ${
          align === "right" ? "text-right" : "text-left"
        }`}
        style={{
          ...(align === "right" ? { right: rpx(-overlap) } : { left: rpx(-overlap) }),
          top: rpx(-lineHeight / 2 - overlap * 2),
          width: "max-content",
          maxWidth: rpx(maxWidth),
          fontSize: rpx(24),
          lineHeight: rpx(lineHeight),
          color: "#46401F",
        }}
        variants={{
          idle: { x: 0 },
          hover: { x: align === "right" ? -8 : 8 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <span className="block font-bold">{title}</span>
      </motion.p>
    </motion.div>
  )
}

// Moon component (gradient circle) - orbits along image mask edge using SVG animateMotion
const Moon = () => (
  <div
    className="absolute"
    style={{
      left: rpx(498),
      top: rpx(183),
      width: rpx(924),
      height: rpx(669),
      pointerEvents: "none",
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 924 669"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="moon-gradient-features" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#756F3F" />
          <stop offset="100%" stopColor="#DBD076" />
        </linearGradient>
      </defs>
      {/* Moon circle with animateMotion - using keySplines for easing */}
      <circle r="61" fill="url(#moon-gradient-features)">
        <animateMotion
          path="M0 340C0 152.223 152.223 0 340 0H584C771.777 0 924 152.223 924 340V561C924 620.647 875.647 669 816 669H108C48.3532 669 0 620.647 0 561V340Z"
          dur="25s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
        />
        {/* Subtle pulse animation for the moon */}
        <animate
          attributeName="r"
          values="61;65;61"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.85;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
)

// We now calculate feature positions dynamically in the component to support 5-8 items
// keeping the original curved layout around the moon.

// Star positions from Figma
const STARS = [
  { x: 414, y: 226, size: 90 }, // Large star
  { x: 488, y: 272, size: 44 }, // Medium star near large
  { x: 1344, y: 183, size: 63 }, // Medium star right side
  { x: 1392, y: 183, size: 30 }, // Small star right side
]

export function ProductFeaturesSection({
  title = "Product Features",
  items,
  image,
  imageLink,
}: ProductFeaturesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Distribute items roughly evenly, left gets slightly more if odd
  const midPoint = Math.ceil(items.length / 2)
  const leftItems = items.slice(0, midPoint)
  const rightItems = items.slice(midPoint)

  // Calculate dynamic positions for any number of items to follow the moon's curve
  const getDynamicPositions = (leftCount: number, rightCount: number, side: "left" | "right") => {
    const positions = []
    const startY = 320
    const endY = 700
    const count = side === "left" ? leftCount : rightCount
    
    // Base step size on maxCount so both sides are aligned from top to bottom
    const maxCount = Math.max(leftCount, rightCount)
    const step = maxCount > 1 ? (endY - startY) / (maxCount - 1) : 0
    
    for (let i = 0; i < count; i++) {
      const dotY = maxCount === 1 ? (startY + endY) / 2 : startY + step * i
      // Center of the moon vertically is roughly 510
      const offsetFromCenter = Math.abs(dotY - 510)
      // Bulge is max (~60px) at the center, tapering to 0 at the edges
      const bulge = Math.max(0, 60 - (offsetFromCenter * offsetFromCenter) / 600)
      
      // Shift outwards at the bottom (left side moves left/outwards, right side moves right/outwards)
      const bottomShift = dotY > 510 ? ((dotY - 510) / (endY - 510)) * 45 : 0
      const dotX = side === "left" 
        ? 430 - bulge - bottomShift 
        : 1450 + bulge + bottomShift
      
      positions.push({ dotX, dotY })
    }
    return positions
  }

  const leftPositions = getDynamicPositions(leftItems.length, rightItems.length, "left")
  const rightPositions = getDynamicPositions(leftItems.length, rightItems.length, "right")

  // Calculate object position from focal point
  const objectPosition = image?.cropFocalPoint
    ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
    : "center"

  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* Title */}
      <h2 className="font-josefin-sans font-bold text-2xl text-center text-[#46401F] mb-6">
        {title}
      </h2>

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

      {/* Features Grid - 2 columns with larger items */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col p-4 rounded-2xl min-h-[60px]"
            style={{ backgroundColor: "rgba(237, 232, 217, 0.6)" }}
          >
            <h3 className="font-inter font-bold text-lg text-[#46401F] mb-1">
              {item.title}
            </h3>
            {item.description && (
              <p className="font-inter text-sm text-[#46401F] opacity-80 leading-snug">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full overflow-hidden bg-brand-main hidden md:block"
      style={{
        ["--rpx-features" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        minHeight: rpx(922),
      }}
      onClick={() => setHoveredIndex(null)}
    >
      <div className="relative" style={{ minHeight: rpx(922) }}>
        {/* Title */}
        <h2
          className="absolute font-josefin-sans font-bold text-center"
          style={{
            left: rpx(288),
            top: rpx(51),
            width: rpx(1344),
            fontSize: rpx(60),
            lineHeight: rpx(56),
            color: "#46401F",
          }}
        >
          {title}
        </h2>

        {/* Twinkling Stars */}
        {STARS.map((star, index) => (
          <TwinklingStar
            key={index}
            x={star.x}
            y={star.y}
            size={star.size}
            delay={index * 0.5}
          />
        ))}

        {/* Center Image with SVG mask */}
        <div
          className="absolute"
          style={{
            left: rpx(498),
            top: rpx(183),
            width: rpx(924),
            height: rpx(669),
          }}
        >
          {/* SVG Mask Definition */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="features-image-mask" clipPathUnits="objectBoundingBox">
                <path d="M0,0.508 C0,0.228 0.165,0 0.368,0 L0.632,0 C0.835,0 1,0.228 1,0.508 L1,0.839 C1,0.928 0.948,1 0.883,1 L0.117,1 C0.052,1 0,0.928 0,0.839 L0,0.508 Z" />
              </clipPath>
            </defs>
          </svg>

          <div
            className="w-full h-full overflow-hidden relative"
            style={{
              clipPath: "url(#features-image-mask)",
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
                    size="xlarge"
                    className="w-full h-full object-cover"
                    objectPosition={objectPosition}
                  />
                </Link>
              ) : (
                <OptimizedImage
                  image={image as any}
                  alt={image.altText || image.alt || title || ""}
                  size="xlarge"
                  className="w-full h-full object-cover"
                  objectPosition={objectPosition}
                />
              )
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}

            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 flex items-center justify-center p-12 text-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredIndex !== null && items[hoveredIndex]?.description ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white font-inter text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                {hoveredIndex !== null ? items[hoveredIndex]?.description : ""}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Moon (gradient circle) - orbits along image mask edge */}
        <Moon />

        {/* Left Features */}
        {leftItems.map((item, index) => {
          const pos = leftPositions[index]
          if (!pos) return null
          return (
            <FeatureItem
              key={`left-${index}`}
              title={item.title}
              dotX={pos.dotX}
              dotY={pos.dotY}
              align="right"
              isSelected={hoveredIndex === index}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.stopPropagation()
                setHoveredIndex(hoveredIndex === index ? null : index)
              }}
            />
          )
        })}

        {/* Right Features */}
        {rightItems.map((item, index) => {
          const pos = rightPositions[index]
          if (!pos) return null
          const targetIndex = midPoint + index
          return (
            <FeatureItem
              key={`right-${index}`}
              title={item.title}
              dotX={pos.dotX}
              dotY={pos.dotY}
              align="left"
              isSelected={hoveredIndex === targetIndex}
              onHoverStart={() => setHoveredIndex(targetIndex)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.stopPropagation()
                setHoveredIndex(hoveredIndex === targetIndex ? null : targetIndex)
              }}
            />
          )
        })}
      </div>
    </section>
    </>
  )
}
