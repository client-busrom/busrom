"use client"

import React, { useState } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"

// 自定义鼠标指针 SVG (base64 编码)
const CUSTOM_CURSOR_SVG = `<svg width="49" height="66" viewBox="0 0 49 66" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.000295865 4.42946L0.539055 50.4774C0.567373 52.8953 2.57735 54.8327 5.02862 54.8049C6.07898 54.7929 7.09098 54.4139 7.8847 53.7352L19.2422 44.0239L30.8233 63.8102C32.049 65.9042 34.7635 66.6217 36.8864 65.4127L41.7526 62.6414C43.8756 61.4324 44.6029 58.7547 43.3772 56.6607L31.7962 36.8743L46.0112 32.0243C48.3278 31.2339 49.5563 28.7406 48.7549 26.4554C48.412 25.4774 47.729 24.6508 46.827 24.1223L6.70535 0.614656C4.59772 -0.620196 1.87437 0.0640426 0.622412 2.14303C0.206126 2.83436 -0.00911459 3.62542 0.000295865 4.42946Z" fill="#587AFF"/></svg>`
const CUSTOM_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(CUSTOM_CURSOR_SVG)}") 0 0, pointer`

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 922

// 原始内容高度（用于计算垂直居中）
const ORIGINAL_CONTENT_HEIGHT = 1083

// 内容缩放比例
const CONTENT_SCALE = 0.9

// 图片区域位置和尺寸
const IMAGE_LEFT = 152
const IMAGE_TOP = 176
const IMAGE_WIDTH = 1604
const IMAGE_HEIGHT = 693
const IMAGE_RADIUS = 346.5

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface QuoteImageSectionProps {
  image?: MediaObject | null
  titleLine1?: string
  titleLine2?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}

export function QuoteImageSection({
  image,
  titleLine1 = "Need A Quote Or",
  titleLine2 = "Technical Support",
  subtitle = "Let Us Provide You With A Professional Solution.",
  buttonText = "Get A Solution",
  buttonLink = "#contact-form",
}: QuoteImageSectionProps) {
  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 标题1位置
  const title1Left = 130
  const title1Top = 119
  const title1Width = 1659

  // 标题2位置
  const title2Left = 76
  const title2Top = 785
  const title2Width = 1766

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: vw(SECTION_HEIGHT),
        background: "linear-gradient(180deg, #FFF9E8 0%, #F9E9A7 100%)",
      }}
    >
      {/* 内容容器 - 整体缩小到90%并垂直居中 */}
      {/* 缩放后内容高度: 1083 * 0.9 = 974.7, 垂直偏移: (922 - 974.7) / 2 = -26.35 */}
      <div
        className="absolute left-0 w-full"
        style={{
          height: vw(ORIGINAL_CONTENT_HEIGHT),
          top: `calc(50% - ${vw(ORIGINAL_CONTENT_HEIGHT * CONTENT_SCALE / 2)})`,
          transform: `scale(${CONTENT_SCALE})`,
          transformOrigin: "top center",
        }}
      >
      {/* 底层：黑色标题文字 */}
      <h2
        className="absolute font-josefin-sans font-bold text-center"
        style={{
          left: vw(title1Left),
          top: vw(title1Top),
          width: vw(title1Width),
          fontSize: vw(150),
          lineHeight: vw(165),
          color: "#000000",
        }}
      >
        {titleLine1}
      </h2>
      <h2
        className="absolute font-josefin-sans font-bold text-center"
        style={{
          left: vw(title2Left),
          top: vw(title2Top),
          width: vw(title2Width),
          fontSize: vw(150),
          lineHeight: vw(167),
          color: "#000000",
        }}
      >
        {titleLine2}
      </h2>

      {/* 图片区域 - 带遮罩和浅色文字 */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: vw(IMAGE_LEFT),
          top: vw(IMAGE_TOP),
          width: vw(IMAGE_WIDTH),
          height: vw(IMAGE_HEIGHT),
          borderRadius: vw(IMAGE_RADIUS),
        }}
      >
        {/* 背景图片 */}
        {image ? (
          image.enableLink && image.linkUrl ? (
            <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block absolute inset-0 w-full h-full">
              <OptimizedImage
                image={image as any}
                alt="Quote background"
                size="xlarge"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </Link>
          ) : (
            <OptimizedImage
              image={image as any}
              alt="Quote background"
              size="xlarge"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gray-600" />
        )}
        {/* 黑色遮罩 29% */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(2, 2, 2, 0.29)" }}
        />

        {/* 图片内的浅色标题 - 相对于图片容器定位 */}
        <h2
          className="absolute font-josefin-sans font-bold text-center"
          style={{
            left: vw(title1Left - IMAGE_LEFT),
            top: vw(title1Top - IMAGE_TOP),
            width: vw(title1Width),
            fontSize: vw(150),
            lineHeight: vw(165),
            color: "#F6F4ED",
          }}
        >
          {titleLine1}
        </h2>
        <h2
          className="absolute font-josefin-sans font-bold text-center"
          style={{
            left: vw(title2Left - IMAGE_LEFT),
            top: vw(title2Top - IMAGE_TOP),
            width: vw(title2Width),
            fontSize: vw(150),
            lineHeight: vw(167),
            color: "#F6F4ED",
          }}
        >
          {titleLine2}
        </h2>

        {/* 右下角副标题 - 在图片内 */}
        <p
          className="absolute font-josefin-sans font-medium text-white"
          style={{
            left: vw(995 - IMAGE_LEFT),
            top: vw(489 - IMAGE_TOP),
            width: vw(412),
            fontSize: vw(36),
            lineHeight: vw(47),
          }}
        >
          {subtitle}
        </p>

        {/* Get A Solution 按钮区域 - 在图片内 */}
        <Link
          href={buttonLink}
          className="absolute group transition-opacity hover:opacity-80"
          style={{
            left: vw(1436 - IMAGE_LEFT),
            top: vw(478 - IMAGE_TOP),  // 10083 - 9605 = 478
            cursor: CUSTOM_CURSOR,
          }}
        >
          {/* 圆环 */}
          <div
            className="absolute rounded-full border transition-colors group-hover:bg-white/10"
            style={{
              left: 0,
              top: 0,
              width: vw(104),
              height: vw(104),
              borderColor: "white",
            }}
          >
            {/* 黄色小圆点 */}
            <div
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: vw(12),
                height: vw(12),
                backgroundColor: "#FFCC4A",
              }}
            />
          </div>
          {/* 按钮文字 - 从圆环内开始 */}
          <span
            className="absolute font-anaheim font-medium text-white whitespace-nowrap"
            style={{
              left: vw(70),   // 1506 - 1436
              top: vw(27),    // 10110 - 10083
              fontSize: vw(32),
              lineHeight: vw(49),
            }}
          >
            {buttonText}
          </span>
        </Link>
      </div>
      </div>
    </section>
  )
}
