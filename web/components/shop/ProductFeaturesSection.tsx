"use client"

import React from "react"
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

// Feature item component with hover effects
const FeatureItem = ({
  title,
  x,
  y,
  width,
  dotX,
  dotY,
  align,
}: {
  title: string
  x: number
  y: number
  width: number
  dotX: number
  dotY: number
  align: "left" | "right"
}) => (
  <motion.div
    className="absolute cursor-pointer group"
    style={{
      left: rpx(Math.min(x, dotX) - 10),
      top: rpx(Math.min(y, dotY) - 10),
      width: rpx(Math.abs(dotX - x) + width + 40),
      height: rpx(60),
    }}
    whileHover="hover"
    initial="idle"
  >
    {/* Dot - behind text */}
    <motion.div
      className="absolute rounded-full z-0"
      style={{
        left: rpx(dotX - Math.min(x, dotX) + 10),
        top: rpx(dotY - Math.min(y, dotY) + 10),
        width: rpx(30),
        height: rpx(30),
        backgroundColor: "#EDE8D9",
      }}
      variants={{
        idle: { scale: 1, backgroundColor: "#EDE8D9" },
        hover: { scale: 1.5, backgroundColor: "#A59D60" },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    />
    {/* Text - above dot */}
    <motion.p
      className={`absolute font-josefin-sans font-semibold z-10 whitespace-pre ${align === "right" ? "text-right" : "text-left"}`}
      style={{
        left: rpx(x - Math.min(x, dotX) + 10),
        top: rpx(y - Math.min(y, dotY) + 10),
        fontSize: rpx(20),
        lineHeight: rpx(26),
        color: "#46401F",
      }}
      variants={{
        idle: { x: 0 },
        hover: { x: align === "right" ? -8 : 8 },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {title}
    </motion.p>
  </motion.div>
)

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

// Feature positions from Figma (relative to section top at y=2957)
// Left features are right-aligned, so x + width should end near the dot
const LEFT_FEATURES = [
  { title: "Strong & Stable", x: 194, y: 3385 - 2957, width: 255, dotX: 435, dotY: 3380 - 2957 },
  { title: "Moisture & Rust Resistant", x: 131, y: 3520 - 2957, width: 255, dotX: 372, dotY: 3513 - 2957 },
  { title: "Minimalist Aesthetic", x: 259, y: 3652 - 2957, width: 175, dotX: 418, dotY: 3644 - 2957 },
]

const RIGHT_FEATURES = [
  { title: "Universal Compatibility", x: 1446, y: 3290 - 2957, width: 255, dotX: 1429, dotY: 3281 - 2957 },
  { title: "Hidden Load-Bearing", x: 1507, y: 3463 - 2957, width: 217, dotX: 1490, dotY: 3453 - 2957 },
  { title: "Quick & Easy Installation", x: 1470, y: 3623 - 2957, width: 222, dotX: 1456, dotY: 3613 - 2957 },
]

// Star positions from Figma
const STARS = [
  { x: 414, y: 3183 - 2957, size: 90 }, // Large star
  { x: 488, y: 3229 - 2957, size: 44 }, // Medium star near large
  { x: 1344, y: 3140 - 2957, size: 63 }, // Medium star right side
  { x: 1392, y: 3140 - 2957, size: 30 }, // Small star right side
]

export function ProductFeaturesSection({
  title = "Product Features",
  items,
  image,
  imageLink,
}: ProductFeaturesSectionProps) {
  // Use provided items or fallback to defaults
  const leftItems = items.slice(0, 3)
  const rightItems = items.slice(3, 6)

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
            className="flex items-center gap-3 p-4 rounded-2xl min-h-[60px]"
            style={{ backgroundColor: "rgba(237, 232, 217, 0.6)" }}
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#756F3F" }}
            />
            <span className="font-josefin-sans font-semibold text-sm text-[#46401F] leading-tight">
              {item.title}
            </span>
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
            className="w-full h-full overflow-hidden"
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
          </div>
        </div>

        {/* Moon (gradient circle) - orbits along image mask edge */}
        <Moon />

        {/* Left Features */}
        {leftItems.map((item, index) => {
          const position = LEFT_FEATURES[index]
          if (!position) return null
          return (
            <FeatureItem
              key={`left-${index}`}
              title={item.title}
              x={position.x}
              y={position.y}
              width={position.width}
              dotX={position.dotX}
              dotY={position.dotY}
              align="right"
            />
          )
        })}

        {/* Right Features */}
        {rightItems.map((item, index) => {
          const position = RIGHT_FEATURES[index]
          if (!position) return null
          return (
            <FeatureItem
              key={`right-${index}`}
              title={item.title}
              x={position.x}
              y={position.y}
              width={position.width}
              dotX={position.dotX}
              dotY={position.dotY}
              align="left"
            />
          )
        })}
      </div>
    </section>
    </>
  )
}
