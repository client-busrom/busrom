"use client"

import React from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

const rpx = (designValue: number) => `calc(var(--rpx-about) * ${designValue})`

// 内容居中偏移量 (原始1920宽度，缩放80%后内容宽度1536，左右各留192)
const CENTER_OFFSET = 192

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
      className="relative w-full overflow-hidden hidden md:block"
      style={{
        ["--rpx-about" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        height: rpx(SECTION_HEIGHT),
      }}
    >
      {/* 左侧标题 */}
      <h2
        className="absolute font-josefin-sans font-bold whitespace-pre-line"
        style={{
          left: rpx(122 + CENTER_OFFSET),
          top: rpx(63),
          width: rpx(506),
          fontSize: rpx(112),
          lineHeight: rpx(103),
          color: "#464010",
        }}
      >
        {title}
      </h2>

      {/* 左侧图片 */}
      {image && (
        <div
          className="absolute overflow-hidden flex-shrink-0"
          style={{
            left: rpx(119 + CENTER_OFFSET),
            top: rpx(308),
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

      {/* 右侧服务条 */}
      {services.slice(0, 4).map((service, index) => {
        const isOdd = index % 2 === 1
        // 80%缩放后的宽度: 830*0.8=664, 933*0.8=746, 849*0.8=679
        const barWidth = index === 0 ? 664 : index === 2 ? 679 : 746
        // 80%缩放后的左侧位置: 927*0.8=742, 824*0.8=659, 908*0.8=726
        const barLeft = index === 0 ? 742 : index === 2 ? 726 : 659
        // 80%缩放后的顶部位置: 84*0.8=67, 间隔180*0.8=144
        const barTop = 67 + index * 144
        const bgColor = isOdd ? "#756F3F" : "#E3DEB8"
        const textColor = isOdd ? "#FFFFFF" : "#464010"
        const hoverExtend = 64 // 80*0.8

        return (
          <div
            key={index}
            className="absolute flex items-center justify-between cursor-pointer transition-all duration-300 ease-out hover:!w-[var(--hover-width)] hover:!left-[var(--hover-left)]"
            style={{
              ["--hover-width" as string]: rpx(barWidth + hoverExtend),
              ["--hover-left" as string]: rpx(barLeft - hoverExtend + CENTER_OFFSET),
              left: rpx(barLeft + CENTER_OFFSET),
              top: rpx(barTop),
              width: rpx(barWidth),
              height: rpx(116), // 145*0.8
              backgroundColor: bgColor,
              borderRadius: rpx(28), // 35*0.8
              paddingLeft: rpx(48), // 60*0.8
              paddingRight: rpx(48),
            }}
          >
            {/* 左侧描述文字 */}
            <p
              className="font-josefin-sans font-semibold whitespace-pre-line"
              style={{
                fontSize: rpx(26), // 32*0.8
                lineHeight: rpx(34), // 42*0.8
                color: textColor,
              }}
            >
              {service.description}
            </p>

            {/* 右侧标题 */}
            <h3
              className="font-josefin-sans font-bold text-right"
              style={{
                fontSize: rpx(38), // 48*0.8
                lineHeight: rpx(46), // 58*0.8
                color: textColor,
              }}
            >
              {service.title}
            </h3>
          </div>
        )
      })}
    </section>
    </>
  )
}
