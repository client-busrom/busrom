"use client"

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn } from "@/lib/utils"
import type { ProductOverviewData } from "@/lib/content-parser"

/**
 * Figma Design Specs (1920x968):
 *
 * Background: Light beige/cream (#F6F4ED)
 * Decorative circle: x:544, y:312, 177x177, #F7F1DB
 *
 * Title (left side):
 * - Main title: x:157, y:200, 96px, Josefin Sans Bold, #706933
 * - Subtitle: x:157, y:415, 48px, Josefin Sans SemiBold, black
 *
 * Description:
 * - Brand name (bold): 32px, orange #FFAA2B
 * - Content: 24px, black, line-height 32px
 * - x:157, y:623, width 581px
 *
 * Images (right side, stacked):
 * - 4 background images at various positions
 * - Main white card: x:1322, y:442, 523x540, rounded-30, shadow
 * - Circle image inside: x:1343, y:485, 472x472
 *
 * CTA Button:
 * - x:1464, y:150, circle border 104x104 + dot + text
 * - Border: #756F3F, Dot: #FFCC4A, Text: #756F3F
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1159

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768

interface ProductOverviewProps {
  data: ProductOverviewData
  className?: string
}

// Image position configurations with z-index based on Figma layer order
const IMAGE_POSITIONS = {
  // Main position (white card with circle image) - z-index 3
  main: { x: 1322 - 820, y: 442, w: 523, h: 540, isMain: true, zIndex: 3 },
  // Background positions with their z-index from Figma
  bg: [
    { x: 929 - 820, y: 150, w: 525, h: 474, zIndex: 1 },   // Bottom layer
    { x: 1125 - 820, y: 253, w: 571, h: 600, zIndex: 2 },  // Above first
    { x: 854 - 820, y: 591, w: 339, h: 334, zIndex: 4 },   // Above main card
    { x: 1749 - 820, y: 68, w: 271, h: 306, zIndex: 5 },   // Top layer
  ],
}

export function ProductOverview({ data, className }: ProductOverviewProps) {
  if (!data) return null

  const { titleLines = [], subtitleLines = [], brandName = '', description = '', images = [], ctaButton } = data

  // Track which image index is at which position (for desktop)
  // positions[positionIndex] = imageIndex
  // Position 0 = main, Position 1-4 = bg positions
  const [positions, setPositions] = React.useState<number[]>(() =>
    images.slice(0, 5).map((_, i) => i)
  )

  // Handle clicking on an image - swap with main position
  const handleImageClick = (positionIndex: number) => {
    if (positionIndex === 0) return // Already main, do nothing

    setPositions(prev => {
      const newPositions = [...prev]
      // Swap the clicked position with main (position 0)
      const temp = newPositions[0]
      newPositions[0] = newPositions[positionIndex]
      newPositions[positionIndex] = temp
      return newPositions
    })
  }

  // Get position style for each image based on its current position index
  const getPositionStyle = (positionIndex: number): { x: number; y: number; w: number; h: number; zIndex: number; isMain?: boolean } => {
    if (positionIndex === 0) {
      return IMAGE_POSITIONS.main
    }
    return IMAGE_POSITIONS.bg[positionIndex - 1] || IMAGE_POSITIONS.bg[0]
  }

  return (
    <>
      {/* Mobile Layout */}
      <section className={cn("md:hidden relative w-full bg-[#F6F4ED] px-6 py-12", className)}>
        {/* Title */}
        <h2 className="font-josefin-sans font-bold text-[#706933] text-3xl leading-tight mb-4">
          {titleLines.map((line, index) => (
            <span key={index}>
              {line}
              {index < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h2>

        {/* Subtitle */}
        <h3 className="font-josefin-sans font-semibold text-black text-xl mb-6">
          {subtitleLines.map((line, index) => (
            <span key={index}>
              {line}
              {index < subtitleLines.length - 1 && <br />}
            </span>
          ))}
        </h3>

        {/* Description */}
        <p className="font-josefin-sans text-base leading-relaxed mb-8">
          <span className="text-[#FFAA2B] font-bold text-lg">{brandName}</span>
          <span className="text-black">{description}</span>
        </p>

        {/* Main Image */}
        {images?.[positions[0]] && (
          <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-4">
            <img
              src={images[positions[0]]}
              alt=""
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Thumbnail Images Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {positions.slice(1, 5).map((imageIndex, posIndex) => {
              const img = images[imageIndex]
              if (!img) return null
              return (
                <div
                  key={`thumb-${imageIndex}`}
                  className="rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(posIndex + 1)}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-auto object-cover"
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* CTA Button - Mobile */}
        {ctaButton && (
          <Link
            href={ctaButton.url}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 border-2 border-[#756F3F] rounded-full font-anaheim font-medium text-[#756F3F] hover:bg-[#756F3F] hover:text-white transition-colors"
          >
            <div className="w-3 h-3 rounded-full bg-[#FFCC4A]" />
            {ctaButton.text}
          </Link>
        )}
      </section>

      {/* Desktop Layout */}
      <section
        className={cn("hidden md:block relative w-full bg-[#F6F4ED] overflow-hidden", className)}
        style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      >
      {/* Decorative background circle - bouncing animation */}
      <div
        className="absolute rounded-full bg-[#F7F1DB]"
        style={{
          left: `${(544 / DESIGN_WIDTH) * 100}%`,
          top: `${(312 / DESIGN_HEIGHT) * 100}%`,
          width: `${(177 / DESIGN_WIDTH) * 100}vw`,
          height: `${(177 / DESIGN_WIDTH) * 100}vw`,
          animation: 'bounceAround 20s linear infinite',
        }}
      />

      {/* Left Content - using absolute positioning for each element */}
      {/* Main Title (96px, olive green) - y:1547 relative to section */}
      <h2
        className="absolute font-josefin-sans font-bold text-[#706933]"
        style={{
          left: `${(157 / DESIGN_WIDTH) * 100}%`,
          top: `${(200 / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${101 / 96}`,
        }}
      >
        {titleLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < titleLines.length - 1 && <br />}
          </span>
        ))}
      </h2>

      {/* Subtitle (48px, black) - y:1762, gap from title = 49px */}
      <h3
        className="absolute font-josefin-sans font-semibold text-black"
        style={{
          left: `${(157 / DESIGN_WIDTH) * 100}%`,
          top: `${(415 / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(48 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${57 / 48}`,
        }}
      >
        {subtitleLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < subtitleLines.length - 1 && <br />}
          </span>
        ))}
      </h3>

      {/* Description - y:1970, brand name (32px orange) + description (24px black) */}
      <div
        className="absolute"
        style={{
          left: `${(157 / DESIGN_WIDTH) * 100}%`,
          top: `${(623 / DESIGN_HEIGHT) * 100}%`,
          width: `${(581 / DESIGN_WIDTH) * 100}vw`,
        }}
      >
        <p
          className="font-josefin-sans"
          style={{
            lineHeight: `${32 / 24}`,
          }}
        >
          <span
            className="text-[#FFAA2B] font-bold"
            style={{
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${32 / 32}`,
            }}
          >
            {brandName}
          </span>
          <span
            className="text-black font-normal"
            style={{
              fontSize: `${(24 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {description}
          </span>
        </p>
      </div>

      {/* Right Side - Stacked Images */}
      <div className="absolute right-0 top-0 h-full" style={{ width: `${(1100 / DESIGN_WIDTH) * 100}%` }}>
        {/* All images - each tracks its own position and animates between positions */}
        {images.slice(0, 5).map((img, imageIndex) => {
          if (!img) return null

          // Find which position this image is currently at
          const positionIndex = positions.indexOf(imageIndex)
          if (positionIndex === -1) return null

          const isMain = positionIndex === 0
          const pos = getPositionStyle(positionIndex)

          if (isMain) {
            // Render as main card with white background
            return (
              <div
                key={`img-${imageIndex}`}
                className="absolute bg-white rounded-[30px] shadow-2xl transition-all duration-700 ease-in-out overflow-hidden"
                style={{
                  left: `${(pos.x / 1100) * 100}%`,
                  top: `${(pos.y / DESIGN_HEIGHT) * 100}%`,
                  width: `${(pos.w / DESIGN_WIDTH) * 100}vw`,
                  height: `${(pos.h / DESIGN_WIDTH) * 100}vw`,
                  boxShadow: '0 4px 69px rgba(0, 0, 0, 0.25)',
                  zIndex: pos.zIndex,
                }}
              >
                <OptimizedImage
                  image={img}
                  alt=""
                  size="medium"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )
          }

          // Render as background image
          return (
            <div
              key={`img-${imageIndex}`}
              className="absolute overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-in-out hover:scale-105"
              style={{
                left: `${(pos.x / 1100) * 100}%`,
                top: `${(pos.y / DESIGN_HEIGHT) * 100}%`,
                width: `${(pos.w / DESIGN_WIDTH) * 100}vw`,
                height: `${(pos.h / DESIGN_WIDTH) * 100}vw`,
                zIndex: pos.zIndex,
              }}
              onClick={() => handleImageClick(positionIndex)}
            >
              <OptimizedImage
                image={img}
                alt=""
                size="small"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )
        })}
      </div>

      {/* CTA Button - Get A Solution */}
      {ctaButton && (() => {
        const circleSize = (104 / DESIGN_WIDTH) * 100
        const dotSize = (12 / DESIGN_WIDTH) * 100
        const fontSize = (32 / DESIGN_WIDTH) * 100
        const dotGap = (8 / DESIGN_WIDTH) * 100 // 文字距离黄点的间距
        // 文字起始位置 = 圆心位置 + 黄点半径 + 间距 = circleSize/2 + dotSize/2 + dotGap
        const textMarginLeft = circleSize / 2 + dotSize / 2 + dotGap

        return (
          <Link
            href={ctaButton.url}
            className="absolute flex items-center group"
            style={{
              left: `${(1464 / DESIGN_WIDTH) * 100}%`,
              top: `${(150 / DESIGN_HEIGHT) * 100}%`,
              zIndex: 20,
            }}
          >
            {/* Circle border - visible in default state, hidden on hover */}
            <div
              className="relative border-2 border-[#756F3F] transition-all duration-500 ease-out group-hover:opacity-0"
              style={{
                width: `${circleSize}vw`,
                height: `${circleSize}vw`,
                borderRadius: `${circleSize / 2}vw`,
              }}
            >
              {/* Orbit container - rotates around center */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: 'orbitSpin 4s linear infinite',
                }}
              >
                {/* Radius container - moves dot from center to edge */}
                <div
                  style={{
                    animation: 'orbitRadius 4s ease-in-out infinite',
                  }}
                >
                  {/* Yellow dot */}
                  <div
                    className="rounded-full bg-[#FFCC4A]"
                    style={{
                      width: `${dotSize}vw`,
                      height: `${dotSize}vw`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Text - positioned 8px right of the yellow dot (at center), breathing effect */}
            <span
              className="absolute font-anaheim font-medium text-[#756F3F] whitespace-nowrap transition-all duration-500 group-hover:opacity-0 cta-text-breathe"
              style={{
                fontSize: `${fontSize}vw`,
                left: `${textMarginLeft}vw`,
                animation: 'breathe 2s ease-in-out infinite',
              }}
            >
              {ctaButton.text}
            </span>

            {/* Hover state: expanding capsule from left edge */}
            <div
              className="absolute left-0 top-0 border-2 border-[#756F3F] bg-[#756F3F] transition-all duration-500 ease-out pointer-events-none opacity-0 group-hover:opacity-100 flex items-center cta-capsule-breathe"
              style={{
                height: `${circleSize}vw`,
                borderRadius: `${circleSize / 2}vw`,
                paddingLeft: `${textMarginLeft}vw`,
                paddingRight: `${circleSize / 2}vw`,
              }}
            >
              <span
                className="font-anaheim font-medium text-white whitespace-nowrap"
                style={{
                  fontSize: `${fontSize}vw`,
                }}
              >
                {ctaButton.text}
              </span>
            </div>
          </Link>
        )
      })()}
      </section>
    </>
  )
}

export default ProductOverview
