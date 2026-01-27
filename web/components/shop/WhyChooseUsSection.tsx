"use client"

import React from "react"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920

// 固定像素，不随窗口缩放
const px = (designValue: number) => `${designValue}px`

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

// 缩放比例 - 从1600缩小到900
const SCALE = 0.56

// 卡片间隔
const GAP = 38

// Item positions based on Figma - 4 rows x 3 columns (缩放后，居中)
// 卡片宽220，3列+2间隔 = 220*3 + 38*2 = 736，居中起始x = (1920-736)/2 = 592
// Row 1: 1, 2, 3 (left to right)
// Row 2: 6, 5, 4 (left to right, numbered right to left)
// Row 3: 7, 8, 9 (left to right)
// Row 4: 12, 11, 10 (left to right, numbered right to left)
const ITEM_POSITIONS = [
  // Row 1: items 0, 1, 2 (display as 1, 2, 3)
  { x: 592, y: 188, num: 1 },
  { x: 850, y: 188, num: 2 },
  { x: 1108, y: 188, num: 3 },
  // Row 2: items 3, 4, 5 (display as 4, 5, 6 - but positioned 6, 5, 4)
  { x: 1108, y: 367, num: 4 },
  { x: 850, y: 367, num: 5 },
  { x: 592, y: 367, num: 6 },
  // Row 3: items 6, 7, 8 (display as 7, 8, 9)
  { x: 592, y: 545, num: 7 },
  { x: 850, y: 545, num: 8 },
  { x: 1108, y: 545, num: 9 },
  // Row 4: items 9, 10, 11 (display as 10, 11, 12 - but positioned 12, 11, 10)
  { x: 1108, y: 724, num: 10 },
  { x: 850, y: 724, num: 11 },
  { x: 592, y: 724, num: 12 },
]

// Arrow positions and rotations (缩放后，居中)
// 水平箭头在卡片之间: x = 卡片右边缘 + gap/2 - 箭头宽度/2
// 592+220=812, 812+19=831 (第一个箭头x)
// 850+220=1070, 1070+19=1089 (第二个箭头x)
const ARROWS = [
  // Row 1: 1 -> 2 -> 3 (right arrows)
  { x: 823, y: 252, rotation: 0 },
  { x: 1081, y: 252, rotation: 0 },
  // Row 1 -> Row 2: 3 -> 4 (down arrow)
  { x: 1215, y: 339, rotation: 90 },
  // Row 2: 4 -> 5 -> 6 (left arrows)
  { x: 1081, y: 431, rotation: 180 },
  { x: 823, y: 431, rotation: 180 },
  // Row 2 -> Row 3: 6 -> 7 (down arrow)
  { x: 705, y: 518, rotation: 90 },
  // Row 3: 7 -> 8 -> 9 (right arrows)
  { x: 823, y: 609, rotation: 0 },
  { x: 1081, y: 609, rotation: 0 },
  // Row 3 -> Row 4: 9 -> 10 (down arrow)
  { x: 1215, y: 697, rotation: 90 },
  // Row 4: 10 -> 11 -> 12 (left arrows)
  { x: 1081, y: 788, rotation: 180 },
  { x: 823, y: 788, rotation: 180 },
]

const CARD_WIDTH = 220
const CARD_HEIGHT = 141
const TITLE_BAR_HEIGHT = 40
const NUMBER_COLOR = "#B4A741"

// Animation distance for arrows (in design pixels)
const ARROW_TRAVEL_DISTANCE = 45

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
    <>
    {/* Mobile Layout - 简化的网格布局 */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* Title */}
      <h2 className="font-josefin-sans font-bold text-2xl text-center text-[#464010] mb-1">
        {title}
      </h2>
      {/* Subtitle */}
      <p className="font-josefin-sans font-semibold text-base text-center text-[#464010] mb-6">
        {subtitle}
      </p>

      {/* Process Items Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 12).map((item, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden"
            style={{ aspectRatio: "220/141" }}
          >
            {/* Number Badge */}
            <span
              className="absolute font-montserrat italic text-lg z-10"
              style={{
                left: "6px",
                top: "-2px",
                color: NUMBER_COLOR,
              }}
            >
              {index + 1}
            </span>

            {/* Image */}
            {item.image ? (
              <OptimizedImage
                image={item.image as any}
                alt={item.title}
                size="small"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs">{item.title}</span>
              </div>
            )}

            {/* Title Bar Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.34)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h3 className="font-josefin-sans font-semibold text-white text-center text-xs leading-tight px-1">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Desktop Layout - 固定尺寸，居中显示 */}
    <section
      className="relative w-full bg-brand-main overflow-hidden hidden md:flex justify-center"
      style={{
        height: px(900),
      }}
    >
      {/* 固定宽度的内容容器，水平居中 */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: px(1920),
          height: px(900),
        }}
      >
        {/* Title */}
        <h2
          className="absolute font-josefin-sans font-bold text-center"
          style={{
            left: px(533),
            top: px(30),
            width: px(854),
            fontSize: px(54),
            lineHeight: px(62),
            color: "#464010",
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className="absolute font-josefin-sans font-semibold text-center"
          style={{
            left: px(533),
            top: px(110),
            width: px(854),
            fontSize: px(27),
            lineHeight: px(62),
            color: "#464010",
          }}
        >
          {subtitle}
        </p>

        {/* Flow Line SVG - positioned behind items */}
        <div
          className="absolute"
          style={{
            left: px(580),
            top: px(265),
            width: px(760),
            height: px(560),
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
                left: px(pos.x),
                top: px(pos.y),
                width: px(CARD_WIDTH),
                height: px(CARD_HEIGHT),
                zIndex: 2,
              }}
            >
              {/* Number Badge - positioned outside and above the card */}
              <span
                className="absolute font-montserrat italic"
                style={{
                  left: px(6),
                  top: px(-22),
                  fontSize: px(36),
                  lineHeight: px(24),
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
                  borderRadius: px(17),
                  border: `1px solid #bcb871`,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
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
                    height: px(TITLE_BAR_HEIGHT),
                    backgroundColor: "rgba(0, 0, 0, 0.34)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <h3
                    className="font-josefin-sans font-semibold text-white text-center"
                    style={{
                      fontSize: px(20),
                      lineHeight: px(24),
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
                left: px(arrow.x),
                top: px(arrow.y),
                width: px(13),
                height: px(17),
                transform: `rotate(${arrow.rotation}deg)`,
                ["--arrow-distance" as string]: px(ARROW_TRAVEL_DISTANCE),
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
      </div>
    </section>
    </>
  )
}
