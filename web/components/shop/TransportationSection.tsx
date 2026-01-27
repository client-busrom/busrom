"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

const rpx = (designValue: number) => `calc(var(--rpx-transport) * ${designValue})`

// 内容居中偏移量 (原始1920宽度，缩放80%后内容宽度1536，左右各留192)
const CENTER_OFFSET = 192

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface TransportationSectionProps {
  title?: string
  image?: MediaObject | null
}

export function TransportationSection({
  title = "transportation",
  image,
}: TransportationSectionProps) {
  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* 标题 */}
      <h2 className="font-josefin-sans font-bold text-2xl text-[#463F10] mb-4">
        {title}
      </h2>

      {/* 图片 */}
      {image && (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
          <OptimizedImage
            image={image as any}
            alt={image.altText || image.alt || title}
            size="medium"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full bg-brand-main overflow-hidden hidden md:block"
      style={{
        ["--rpx-transport" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        height: rpx(SECTION_HEIGHT),
      }}
    >
      {/* 左侧竖排文字 */}
      <h2
        className="absolute font-josefin-sans font-bold origin-top-left whitespace-pre-line"
        style={{
          left: rpx(289 + CENTER_OFFSET),  // 361 * 0.8 = 289
          top: rpx(701),                    // 876 * 0.8 = 701
          fontSize: rpx(72),                // 90 * 0.8 = 72
          lineHeight: rpx(67),              // 84 * 0.8 = 67
          color: "#463F10",
          transform: "rotate(-90deg)",
          transformOrigin: "left top",
        }}
      >
        {title}
      </h2>

      {/* 中间图片 */}
      {image && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(409 + CENTER_OFFSET),  // 511 * 0.8 = 409
            top: rpx(98),                     // 122 * 0.8 = 98
            width: rpx(838),                  // 1048 * 0.8 = 838
            height: rpx(640),                 // 800 * 0.8 = 640
            borderTopLeftRadius: rpx(320),    // 400 * 0.8 = 320
            borderTopRightRadius: rpx(320),
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <OptimizedImage
            image={image as any}
            alt={image.altText || image.alt || title}
            size="xlarge"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </section>
    </>
  )
}
