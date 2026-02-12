"use client"

import React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920

const rpx = (designValue: number) => `calc(var(--rpx-transport) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface ImageLinkData {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface TransportationSectionProps {
  title?: string
  image?: MediaObject | null
  imageLink?: ImageLinkData | null
}

export function TransportationSection({
  title = "transportation",
  image,
  imageLink,
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
          {imageLink?.enableLink && imageLink.linkUrl ? (
            <Link href={imageLink.linkUrl} target={imageLink.openInNewTab ? "_blank" : undefined} rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title}
                size="medium"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || title}
              size="medium"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full bg-brand-main overflow-hidden hidden md:flex justify-center items-end pt-20 pb-0"
      style={{
        ["--rpx-transport" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* 左侧竖排文字 */}
      <h2
        className="absolute font-josefin-sans font-bold origin-bottom-left whitespace-pre-line"
        style={{
          fontSize: rpx(60),
          lineHeight: rpx(56),
          color: "#463F10",
          transform: "rotate(-90deg)",
          transformOrigin: "left bottom",
          left: rpx(481),
          bottom: rpx(40),
        }}
      >
        {title}
      </h2>

      {/* 中间图片 - 水平居中 */}
      {image && (
        <div
          className="overflow-hidden flex-shrink-0"
          style={{
            width: rpx(838),
            height: rpx(640),
            borderTopLeftRadius: rpx(320),
            borderTopRightRadius: rpx(320),
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {imageLink?.enableLink && imageLink.linkUrl ? (
            <Link href={imageLink.linkUrl} target={imageLink.openInNewTab ? "_blank" : undefined} rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title}
                size="xlarge"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || title}
              size="xlarge"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </section>
    </>
  )
}
