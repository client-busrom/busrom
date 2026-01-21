"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

const rpx = (designValue: number) => `calc(var(--rpx-transport) * ${designValue})`

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
          left: rpx(361),
          top: rpx(876),
          fontSize: rpx(90),
          lineHeight: rpx(84),
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
            left: rpx(511),
            top: rpx(122),
            width: rpx(1048),
            height: rpx(800),
            borderTopLeftRadius: rpx(400),
            borderTopRightRadius: rpx(400),
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
