"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { IconifyIcon } from "@/components/ui/IconifyIcon"

// Design reference dimensions (from Figma 1920x712 for this section)
const DESIGN_WIDTH = 1920

// Responsive size function for desktop
const rpx = (designValue: number) => `calc(var(--rpx-attr) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface AttributeCard {
  icon?: string
  title: string
  description: string
}

interface ImageLinkData {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface ProductAttributesSectionProps {
  title: string
  image?: MediaObject | null
  imageLink?: ImageLinkData | null
  attributes: AttributeCard[]
}

// Card background colors from Figma (gradient effect)
const CARD_COLORS = [
  "rgb(240, 237, 225)", // #F0EDE1
  "rgb(240, 236, 219)", // #F0ECDB
  "rgb(236, 230, 207)", // #ECE6CF
  "rgb(232, 224, 195)", // #E8E0C3
  "rgb(228, 218, 183)", // #E4DAB7
]

// Render icon: Iconify icon name or fallback to default Zap icon
const AttributeIcon = ({ icon, className, style }: { icon?: string; className?: string; style?: React.CSSProperties }) => {
  if (icon) {
    return <IconifyIcon name={icon} className={className} style={style} />
  }
  return <Zap className={className} style={style} strokeWidth={1.5} />
}

export function ProductAttributesSection({
  title,
  image,
  imageLink,
  attributes,
}: ProductAttributesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Calculate max index based on visible area
  const visibleCards = 2
  const maxIndex = Math.max(0, attributes.length - visibleCards)
  const mobileMaxIndex = Math.max(0, attributes.length - 1)

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = (isMobile = false) => {
    const max = isMobile ? mobileMaxIndex : maxIndex
    setCurrentIndex((prev) => Math.min(max, prev + 1))
  }

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const diff = clientX - dragStartX
    setDragOffset(diff)
  }

  const handleDragEnd = (isMobile = false) => {
    if (!isDragging) return
    setIsDragging(false)

    // Threshold for switching cards
    const threshold = isMobile ? 50 : 100
    if (dragOffset > threshold) {
      handlePrev()
    } else if (dragOffset < -threshold) {
      handleNext(isMobile)
    }
    setDragOffset(0)
  }

  // Calculate object position from focal point
  const objectPosition = image?.cropFocalPoint
    ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
    : "center"

  // Card width + gap for carousel calculation
  const cardWidth = 393
  const cardGap = 12

  // Mobile card dimensions
  const mobileCardWidth = 280

  return (
    <section className="relative w-full overflow-hidden bg-brand-main">
      {/* Desktop Layout */}
      <div
        className="hidden md:flex flex-col py-20"
        style={{
          ["--rpx-attr" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        }}
      >
        <div className="flex">
          {/* Left Side - Image with drawer effect */}
          <div
            className="relative flex-shrink-0 z-10"
            style={{
              width: rpx(780),
              height: rpx(450),
              backgroundColor: "#F6F4ED",
              boxShadow: "34px 0 23.6px -19px rgba(0, 0, 0, 0.09)",
            }}
          >
            {/* Main Image - 600x370 */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: rpx(90),
                top: rpx(40),
                width: rpx(600),
                height: rpx(370),
                borderRadius: rpx(60),
              }}
            >
              {image ? (
                imageLink?.enableLink && imageLink.linkUrl ? (
                  <Link href={imageLink.linkUrl} target={imageLink.openInNewTab ? "_blank" : undefined} rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                    <OptimizedImage
                      image={image as any}
                      alt={image.altText || image.alt || title}
                      size="large"
                      className="w-full h-full object-cover"
                      objectPosition={objectPosition}
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={image as any}
                    alt={image.altText || image.alt || title}
                    size="large"
                    className="w-full h-full object-cover"
                    objectPosition={objectPosition}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </div>

          {/* Right Side - Cards Carousel */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              marginLeft: rpx(-72),
              paddingTop: rpx(40),
              paddingBottom: rpx(40),
            }}
          >
            {/* Cards Container */}
            <div
              ref={carouselRef}
              className="flex cursor-grab active:cursor-grabbing select-none"
              style={{
                gap: rpx(cardGap),
                paddingLeft: rpx(180),
                paddingRight: rpx(180),
                transform: `translateX(calc(${rpx(-(cardWidth + cardGap) * currentIndex)} + ${dragOffset}px))`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={() => handleDragEnd(false)}
              onMouseLeave={() => handleDragEnd(false)}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={() => handleDragEnd(false)}
            >
              {attributes.map((attr, index) => {
                return (
                  <motion.div
                    key={index}
                    className="flex-shrink-0"
                    style={{
                      width: rpx(cardWidth),
                      height: rpx(370),
                      borderRadius: rpx(60),
                      backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
                      padding: rpx(40),
                      display: "grid",
                      gridTemplateRows: `${rpx(96)} 1fr auto auto`,
                    }}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Icon with circle background */}
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: rpx(96),
                        height: rpx(96),
                        backgroundColor: "#C8BC8B",
                      }}
                    >
                      <AttributeIcon
                        icon={attr.icon}
                        className="text-white"
                        style={{
                          width: rpx(48),
                          height: rpx(48),
                        }}
                      />
                    </div>

                    {/* Spacer */}
                    <div />

                    {/* Title - aligned to bottom of its row */}
                    <h3
                      className="font-josefin-sans font-bold self-end"
                      style={{
                        fontSize: rpx(24),
                        lineHeight: rpx(28),
                        color: "#46401F",
                        paddingBottom: rpx(15),
                      }}
                    >
                      {attr.title}
                    </h3>

                    {/* Description - fixed at bottom */}
                    <p
                      className="font-josefin-sans"
                      style={{
                        fontSize: rpx(16),
                        lineHeight: rpx(22),
                        color: "#4D4D4D",
                        minHeight: rpx(84),
                      }}
                    >
                      {attr.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Title and Navigation */}
        <div
          className="relative flex items-center justify-between"
          style={{
            paddingLeft: rpx(145),
            paddingRight: rpx(263),
            paddingTop: rpx(23),
          }}
        >
          {/* Title */}
          <h2
            className="font-josefin-sans font-bold whitespace-pre-line"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(68),
              color: "#706934",
              maxWidth: rpx(960),
            }}
          >
            {title}
          </h2>

          {/* Navigation Arrows */}
          <div
            className="flex items-end"
            style={{
              gap: rpx(107),
            }}
          >
            {/* Left Arrow - positioned lower */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="relative group transition-opacity disabled:opacity-50"
              style={{
                width: rpx(107),
                height: rpx(61),
              }}
            >
              <Image
                src="/product-sections/arrow-left-normal.svg"
                alt="Previous"
                fill
                className="object-contain group-hover:hidden group-active:hidden"
              />
              <Image
                src="/product-sections/arrow-left-active.svg"
                alt="Previous"
                fill
                className="object-contain hidden group-hover:block group-active:block"
              />
            </button>

            {/* Right Arrow - positioned higher by button height */}
            <button
              onClick={() => handleNext(false)}
              disabled={currentIndex >= maxIndex}
              className="relative group transition-opacity disabled:opacity-50"
              style={{
                width: rpx(105),
                height: rpx(58),
                marginBottom: rpx(61),
              }}
            >
              <Image
                src="/product-sections/arrow-right-normal.svg"
                alt="Next"
                fill
                className="object-contain group-hover:hidden group-active:hidden"
              />
              <Image
                src="/product-sections/arrow-right-active.svg"
                alt="Next"
                fill
                className="object-contain hidden group-hover:block group-active:block"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden px-4 py-8">
        {/* Title */}
        <h2 className="font-josefin-sans font-bold text-2xl text-[#706934] mb-6 whitespace-pre-line">
          {title}
        </h2>

        {/* Image */}
        {image && (
          <div className="w-full h-48 rounded-2xl overflow-hidden mb-6">
            {imageLink?.enableLink && imageLink.linkUrl ? (
              <Link href={imageLink.linkUrl} target={imageLink.openInNewTab ? "_blank" : undefined} rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={image as any}
                  alt={image.altText || image.alt || title}
                  size="medium"
                  className="w-full h-full object-cover"
                  objectPosition={objectPosition}
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title}
                size="medium"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
              />
            )}
          </div>
        )}

        {/* Cards Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-3 cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${-(mobileCardWidth + 12) * currentIndex + dragOffset}px)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={() => handleDragEnd(true)}
          >
            {attributes.map((attr, index) => {
              return (
                <motion.div
                  key={index}
                  className="flex-shrink-0 p-5 rounded-2xl"
                  style={{
                    width: mobileCardWidth,
                    minHeight: 200,
                    backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
                  }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Icon with circle background */}
                  <div
                    className="flex items-center justify-center rounded-full w-12 h-12 mb-4"
                    style={{ backgroundColor: "#C8BC8B" }}
                  >
                    <AttributeIcon icon={attr.icon} className="text-white w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="font-josefin-sans font-bold text-base text-[#46401F] mb-2">
                    {attr.title}
                  </h3>

                  {/* Description */}
                  <p className="font-josefin-sans text-sm text-[#4D4D4D] leading-relaxed">
                    {attr.description}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full border-2 border-[#BAB489] flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-[#756F3F]" />
            </button>

            {/* Dots indicator */}
            <div className="flex gap-2">
              {attributes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-[#756F3F]" : "bg-[#BAB489]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => handleNext(true)}
              disabled={currentIndex >= mobileMaxIndex}
              className="w-10 h-10 rounded-full border-2 border-[#BAB489] flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-[#756F3F]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
