"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920

const rpx = (designValue: number) => `calc(var(--rpx-about) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
}

interface ServiceItem {
  title: string
  description: string
}

// 默认服务条目
const defaultServices: ServiceItem[] = [
  { title: "Pre-Sales", description: "One-Stop Shopping\nQuick Reply" },
  { title: "During-Sales", description: "3-Tiers Quality Inspection\nLogistics Tracking" },
  { title: "After-Sales", description: "Installation Guidance\nProduct Warranty" },
  { title: "Collaboration", description: "OEM&ODM\nOnline Marketing Support" },
]

interface AboutBusromSectionProps {
  title?: string
  image?: MediaObject | null
  services?: ServiceItem[]
}

export function AboutBusromSection({
  title = "About Busrom",
  image,
  services = defaultServices,
}: AboutBusromSectionProps) {
  return (
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
      {/* 标题 */}
      <h2 className="font-josefin-sans font-bold text-3xl text-[#464010] mb-6">
        {title}
      </h2>

      {/* 图片 */}
      {image && (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6">
          <OptimizedImage
            image={image as any}
            alt={image.altText || image.alt || "About Busrom"}
            size="medium"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 服务条目 */}
      <div className="flex flex-col gap-3">
        {services.slice(0, 4).map((service, index) => {
          const isOdd = index % 2 === 1
          const bgColor = isOdd ? "#756F3F" : "#E3DEB8"
          const textColor = isOdd ? "#FFFFFF" : "#464010"

          return (
            <div
              key={index}
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ backgroundColor: bgColor }}
            >
              {/* 左侧描述 */}
              <p
                className="font-josefin-sans font-semibold text-sm whitespace-pre-line leading-tight"
                style={{ color: textColor }}
              >
                {service.description}
              </p>
              {/* 右侧标题 */}
              <h3
                className="font-josefin-sans font-bold text-lg text-right"
                style={{ color: textColor }}
              >
                {service.title}
              </h3>
            </div>
          )
        })}
      </div>
    </section>

    {/* Desktop Layout */}
    <section
      className="w-full overflow-hidden hidden md:flex py-20 relative z-10"
      style={{
        ["--rpx-about" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* 左侧区域：标题和图片 */}
      <div
        className="flex-shrink-0 flex flex-col relative z-10"
        style={{
          width: rpx(600),
          paddingLeft: rpx(314),
        }}
      >
        {/* 标题 */}
        <h2
          className="font-josefin-sans font-bold whitespace-pre-line"
          style={{
            fontSize: rpx(60),
            lineHeight: rpx(68),
            color: "#464010",
            marginBottom: rpx(40),
          }}
        >
          {title}
        </h2>

        {/* 图片 */}
        {image && (
          <div
            className="overflow-hidden flex-shrink-0"
            style={{
              width: rpx(415),
              height: rpx(307),
              borderRadius: rpx(34),
            }}
          >
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || "About Busrom"}
              size="medium"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* 右侧服务条 */}
      <div
        className="flex-1 flex flex-col justify-center items-end"
        style={{ gap: rpx(28), paddingRight: rpx(200) }}
      >
        {services.slice(0, 4).map((service, index) => {
          const isOdd = index % 2 === 1
          const barWidth = index === 0 ? 664 : index === 2 ? 679 : 746
          const bgColor = isOdd ? "#756F3F" : "#E3DEB8"
          const textColor = isOdd ? "#FFFFFF" : "#464010"
          const hoverExtend = 64

          return (
            <div
              key={index}
              className="flex items-center justify-between cursor-pointer transition-all duration-300 ease-out hover:!w-[var(--hover-width)]"
              style={{
                ["--hover-width" as string]: rpx(barWidth + hoverExtend),
                width: rpx(barWidth),
                height: rpx(116),
                backgroundColor: bgColor,
                borderRadius: rpx(28),
                paddingLeft: rpx(48),
                paddingRight: rpx(48),
              }}
            >
              {/* 左侧描述文字 (value) */}
              <p
                className="font-josefin-sans font-semibold whitespace-pre-line"
                style={{
                  fontSize: rpx(20),
                  lineHeight: rpx(26),
                  color: textColor,
                }}
              >
                {service.description}
              </p>

              {/* 右侧标题 */}
              <h3
                className="font-josefin-sans font-bold text-right"
                style={{
                  fontSize: rpx(24),
                  lineHeight: rpx(30),
                  color: textColor,
                }}
              >
                {service.title}
              </h3>
            </div>
          )
        })}
      </div>
    </section>
    </>
  )
}
