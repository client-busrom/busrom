"use client"

import React from "react"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920

const rpx = (designValue: number) => `calc(var(--rpx-why-choose) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface ProcessItem {
  title: string
  image?: MediaObject | null
}

interface WhyChooseUsSectionProps {
  title?: string
  subtitle?: string
  items: ProcessItem[]
}

// Item positions based on Figma - 4 rows x 3 columns
// Row 1: 1, 2, 3 (left to right)
// Row 2: 6, 5, 4 (left to right, numbered right to left)
// Row 3: 7, 8, 9 (left to right)
// Row 4: 12, 11, 10 (left to right, numbered right to left)
const ITEM_POSITIONS = [
  // Row 1: items 0, 1, 2 (display as 1, 2, 3)
  { x: 318, y: 290, num: 1 },
  { x: 777, y: 290, num: 2 },
  { x: 1236, y: 290, num: 3 },
  // Row 2: items 3, 4, 5 (display as 4, 5, 6 - but positioned 6, 5, 4)
  { x: 1236, y: 610, num: 4 },
  { x: 777, y: 610, num: 5 },
  { x: 318, y: 610, num: 6 },
  // Row 3: items 6, 7, 8 (display as 7, 8, 9)
  { x: 318, y: 929, num: 7 },
  { x: 777, y: 929, num: 8 },
  { x: 1236, y: 929, num: 9 },
  // Row 4: items 9, 10, 11 (display as 10, 11, 12 - but positioned 12, 11, 10)
  { x: 1236, y: 1249, num: 10 },
  { x: 777, y: 1249, num: 11 },
  { x: 318, y: 1249, num: 12 },
]

// Arrow positions and rotations
// Arrows between items based on flow direction
// Card positions: x=318, 777, 1236 with width=392, height=252
// Row y positions: 290, 610, 929, 1249
// Horizontal arrows: between cards, vertically centered on cards
// Vertical arrows: on the flow line curve (at card edges), between rows
const ARROWS = [
  // Row 1: 1 -> 2 -> 3 (right arrows) - between cards, y = 290 + 252/2 = 416
  { x: 730, y: 400, rotation: 0 },
  { x: 1188, y: 400, rotation: 0 },
  // Row 1 -> Row 2: 3 -> 4 (down arrow) - on curve at right edge of card 3
  { x: 1420, y: 560, rotation: 90 },
  // Row 2: 4 -> 5 -> 6 (left arrows)
  { x: 1188, y: 720, rotation: 180 },
  { x: 730, y: 720, rotation: 180 },
  // Row 2 -> Row 3: 6 -> 7 (down arrow) - on curve at left edge of card 6
  { x: 500, y: 880, rotation: 90 },
  // Row 3: 7 -> 8 -> 9 (right arrows)
  { x: 730, y: 1040, rotation: 0 },
  { x: 1188, y: 1040, rotation: 0 },
  // Row 3 -> Row 4: 9 -> 10 (down arrow) - on curve at right edge of card 9
  { x: 1420, y: 1200, rotation: 90 },
  // Row 4: 10 -> 11 -> 12 (left arrows)
  { x: 1188, y: 1360, rotation: 180 },
  { x: 730, y: 1360, rotation: 180 },
]

const CARD_WIDTH = 392
const CARD_HEIGHT = 252
const TITLE_BAR_HEIGHT = 71
const NUMBER_COLOR = "#B4A741"

// Animation distance for arrows (in design pixels)
const ARROW_TRAVEL_DISTANCE = 80

export function WhyChooseUsSection({
  title = "Why Choose Us",
  subtitle = "Lost Wax Casting Process",
  items,
}: WhyChooseUsSectionProps) {
  // Reorder items to match the snake pattern display order
  // Input order: 1,2,3,4,5,6,7,8,9,10,11,12 (sequential)
  // Display order by position: 1,2,3,6,5,4,7,8,9,12,11,10
  const displayOrder = [0, 1, 2, 5, 4, 3, 6, 7, 8, 11, 10, 9]
  const orderedItems = displayOrder.map((idx) => items[idx]).filter(Boolean)

  return (
    <section
      className="relative w-full bg-brand-main overflow-hidden"
      style={{
        ["--rpx-why-choose" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        height: rpx(1600),
      }}
    >
      {/* Title */}
      <h2
        className="absolute font-josefin-sans font-bold text-center"
        style={{
          left: rpx(551),
          top: rpx(81),
          width: rpx(854),
          fontSize: rpx(96),
          lineHeight: rpx(110),
          color: "#464010",
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p
        className="absolute font-josefin-sans font-semibold text-center"
        style={{
          left: rpx(551),
          top: rpx(159),
          width: rpx(854),
          fontSize: rpx(48),
          lineHeight: rpx(110),
          color: "#464010",
        }}
      >
        {subtitle}
      </p>

      {/* Flow Line SVG - positioned behind items */}
      <div
        className="absolute"
        style={{
          left: rpx(245),
          top: rpx(439),
          width: rpx(1460),
          height: rpx(962),
        }}
      >
        <Image
          src="/why-choose-us/flow-line.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Process Items */}
      {orderedItems.map((item, index) => {
        const pos = ITEM_POSITIONS[index]
        if (!pos || !item) return null

        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: rpx(pos.x),
              top: rpx(pos.y),
              width: rpx(CARD_WIDTH),
              height: rpx(CARD_HEIGHT),
              zIndex: 2,
            }}
          >
            {/* Number Badge - positioned outside and above the card */}
            <span
              className="absolute font-montserrat italic"
              style={{
                left: rpx(10),
                top: rpx(-40),
                fontSize: rpx(64),
                lineHeight: rpx(43),
                color: NUMBER_COLOR,
                zIndex: 10,
              }}
            >
              {pos.num}
            </span>

            {/* Card Container with overflow hidden */}
            <div
              className="absolute inset-0 overflow-hidden group cursor-pointer"
              style={{
                borderRadius: rpx(30),
                border: `1px solid #bcb871`,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Image */}
              {item.image ? (
                <OptimizedImage
                  image={item.image as any}
                  alt={item.title}
                  size="medium"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <span className="text-muted-foreground">{item.title}</span>
                </div>
              )}

              {/* Title Bar Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                style={{
                  height: rpx(TITLE_BAR_HEIGHT),
                  backgroundColor: "rgba(0, 0, 0, 0.34)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3
                  className="font-josefin-sans font-semibold text-white text-center"
                  style={{
                    fontSize: rpx(36),
                    lineHeight: rpx(43),
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          </div>
        )
      })}

      {/* Arrows with animation - z-index 1 to be behind cards */}
      {ARROWS.map((arrow, index) => {
        // Determine animation class based on rotation
        // 0 = right, 90 = down, 180 = left
        const animationClass =
          arrow.rotation === 0 ? 'animate-arrow-right' :
          arrow.rotation === 90 ? 'animate-arrow-down' :
          'animate-arrow-left'

        return (
          <div
            key={`arrow-${index}`}
            className={`absolute ${animationClass}`}
            style={{
              left: rpx(arrow.x),
              top: rpx(arrow.y),
              width: rpx(24),
              height: rpx(30),
              transform: `rotate(${arrow.rotation}deg)`,
              ["--arrow-distance" as string]: rpx(ARROW_TRAVEL_DISTANCE),
              zIndex: 1,
            }}
          >
            <Image
              src="/why-choose-us/arrow-right.svg"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        )
      })}
    </section>
  )
}
