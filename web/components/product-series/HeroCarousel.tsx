"use client"

import * as React from "react"
// Using native img instead of next/image to avoid CDN caching issues
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { HeroCarouselData } from "@/lib/content-parser"

/**
 * Figma Design Specs (1920x1347):
 *
 * Background: Full width with 23% black overlay
 *
 * Title (centered):
 * - Line 1: y:257, 96px, Josefin Sans Medium, white
 * - Line 2: y:378, 110px, Josefin Sans Bold, gradient white->gray
 *
 * Description + Button (left):
 * - Description: x:153, y:696, 36px, line-height 152%, width 532px
 * - Button: x:153, y:955, 284x92, rounded border
 *
 * Product Images (right):
 * - Main: x:825, y:650, 424x422, rounded-30
 * - Small 1-3: x:1259/1509/1759, y:747, 240x416, rounded-30
 *
 * Controls:
 * - Progress bar: x:1016, y:1253, 568x6
 * - Prev button: x:844, y:1212, 83x82
 * - Next button: x:1674, y:1212, 83x82
 */

// Design constants (based on 1920px width)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1347

interface HeroCarouselProps {
  data: HeroCarouselData
  className?: string
}

export function HeroCarousel({ data, className }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null)

  const slides = data?.slides || []
  const slideCount = slides.length

  // Early return if no slides
  if (slideCount === 0) return null

  // Auto-advance slides
  React.useEffect(() => {
    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideCount)
      }, 5000)
    }

    startAutoplay()
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [slideCount])

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)

    // Reset autoplay
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount)
    }, 5000)

    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToPrev = () => {
    goToSlide((currentSlide - 1 + slideCount) % slideCount)
  }

  const goToNext = () => {
    goToSlide((currentSlide + 1) % slideCount)
  }

  const currentData = slides[currentSlide]
  if (!currentData) return null

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-black", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      data-header-theme="transparent"
    >
      {/* Background Image with Overlay */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {slide.backgroundImage && (
            <img
              src={slide.backgroundImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* 23% Black Overlay */}
          <div className="absolute inset-0 bg-black/[0.23]" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        {/* Title Section (centered) */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{
            top: `${(257 / DESIGN_HEIGHT) * 100}%`,
          }}
        >
          {/* Title Lines */}
          {currentData.title.map((line, lineIndex) => (
            <h1
              key={lineIndex}
              className={cn(
                "font-josefin-sans text-white",
                lineIndex === 0
                  ? "font-medium"
                  : "font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
              )}
              style={{
                fontSize: lineIndex === 0
                  ? `${(96 / DESIGN_WIDTH) * 100}vw`
                  : `${(110 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: 1.1,
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Description (left side) */}
        <div
          className="absolute"
          style={{
            left: `${(153 / DESIGN_WIDTH) * 100}%`,
            top: `${(696 / DESIGN_HEIGHT) * 100}%`,
            width: `${(532 / DESIGN_WIDTH) * 100}%`,
          }}
        >
          <p
            className="font-josefin-sans text-white"
            style={{
              fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: 1.52,
            }}
          >
            {currentData.description}
          </p>
        </div>

        {/* View More Button */}
        <div
          className="absolute"
          style={{
            left: `${(153 / DESIGN_WIDTH) * 100}%`,
            top: `${(955 / DESIGN_HEIGHT) * 100}%`,
          }}
        >
          <Link
            href={currentData.buttonLink}
            className="group relative inline-flex items-center justify-between font-josefin-sans font-medium text-white border border-white overflow-hidden"
            style={{
              width: `${(284 / DESIGN_WIDTH) * 100}vw`,
              height: `${(92 / DESIGN_WIDTH) * 100}vw`,
              borderRadius: `${(62.5 / DESIGN_WIDTH) * 100}vw`,
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              paddingLeft: `${(24 / DESIGN_WIDTH) * 100}vw`,
              paddingRight: `${(8 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {/* Background expansion from icon position */}
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#B6AB57] rounded-full transition-all duration-500 ease-out scale-0 group-hover:scale-[10]"
              style={{
                width: `${(77 / DESIGN_WIDTH) * 100}vw`,
                height: `${(77 / DESIGN_WIDTH) * 100}vw`,
                marginRight: `${(8 / DESIGN_WIDTH) * 100}vw`,
              }}
            />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
              {currentData.buttonText}
            </span>
            {/* Arrow Icon */}
            <img
              src="/icon-arrow-circle.svg"
              alt=""
              className="relative z-10 transition-opacity duration-300 group-hover:opacity-0"
              style={{
                width: `${(77 / DESIGN_WIDTH) * 100}vw`,
                height: `${(77 / DESIGN_WIDTH) * 100}vw`,
              }}
            />
          </Link>
        </div>

        {/* Product Images (right side) - All 4 images displayed, active one is larger */}
        {(() => {
          // Get all product images from all slides (one image per slide)
          const allProductImages = slides.map((slide, idx) => ({
            url: slide.productImages[0] || '',
            slideIndex: idx,
          })).filter(img => img.url)

          // Calculate positions based on which image is active
          // Active image: 424x422 at position 0
          // Other images: 240x416, positioned after
          const getImageStyle = (imageIndex: number) => {
            const isActive = imageIndex === currentSlide

            if (isActive) {
              // Large active image
              return {
                left: 825,
                top: 650,
                width: 424,
                height: 422,
                zIndex: 10,
              }
            }

            // Calculate position for small images
            // Small images go to positions 1259, 1509, 1759
            const smallPositions = [1259, 1509, 1759]
            let smallIndex = 0

            // Count how many images before this one are not active
            for (let i = 0; i < imageIndex; i++) {
              if (i !== currentSlide) smallIndex++
            }

            // If this image comes after active, adjust index
            if (imageIndex > currentSlide) {
              smallIndex = imageIndex - 1
              if (currentSlide < imageIndex) smallIndex = imageIndex - 1
            } else {
              smallIndex = imageIndex
            }

            // Ensure we don't exceed available positions
            const posIndex = Math.min(smallIndex, smallPositions.length - 1)

            return {
              left: smallPositions[posIndex] || 1759,
              top: 747,
              width: 240,
              height: 416,
              zIndex: 1,
            }
          }

          // Reorder images: active first, then others in order
          const orderedImages = [
            ...allProductImages.filter(img => img.slideIndex === currentSlide),
            ...allProductImages.filter(img => img.slideIndex !== currentSlide),
          ]

          return orderedImages.map((img, displayIndex) => {
            const style = displayIndex === 0
              ? { left: 825, top: 650, width: 424, height: 422, zIndex: 10 }
              : {
                  left: [1259, 1509, 1759][displayIndex - 1] || 1759,
                  top: 747,
                  width: 240,
                  height: 416,
                  zIndex: 1,
                }

            return (
              <div
                key={img.slideIndex}
                className="absolute overflow-hidden bg-gray-300 transition-all duration-500 cursor-pointer"
                style={{
                  left: `${(style.left / DESIGN_WIDTH) * 100}%`,
                  top: `${(style.top / DESIGN_HEIGHT) * 100}%`,
                  width: `${(style.width / DESIGN_WIDTH) * 100}vw`,
                  height: `${(style.height / DESIGN_WIDTH) * 100}vw`,
                  borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
                  zIndex: style.zIndex,
                }}
                onClick={() => goToSlide(img.slideIndex)}
              >
                <img
                  src={img.url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )
          })
        })()}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute cursor-pointer group"
          style={{
            left: `${(844 / DESIGN_WIDTH) * 100}%`,
            top: `${(1212 / DESIGN_HEIGHT) * 100}%`,
            width: `${(83 / DESIGN_WIDTH) * 100}vw`,
            height: `${(82 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Previous slide"
        >
          {/* Default state - outline circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C18.8506 0.5 0.5 18.6382 0.5 41C0.5 63.3618 18.8506 81.5 41.5 81.5C64.1494 81.5 82.5 63.3618 82.5 41C82.5 18.6382 64.1494 0.5 41.5 0.5Z" stroke="white"/>
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="white"/>
          </svg>
          {/* Hover state - filled circle with left arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white"/>
            <path d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z" fill="black"/>
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute cursor-pointer group"
          style={{
            left: `${(1674 / DESIGN_WIDTH) * 100}%`,
            top: `${(1212 / DESIGN_HEIGHT) * 100}%`,
            width: `${(83 / DESIGN_WIDTH) * 100}vw`,
            height: `${(82 / DESIGN_WIDTH) * 100}vw`,
          }}
          aria-label="Next slide"
        >
          {/* Default state - outline circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 83 82"
            fill="none"
          >
            <path d="M41.5 0.5C64.1494 0.5 82.5 18.6382 82.5 41C82.5 63.3618 64.1494 81.5 41.5 81.5C18.8506 81.5 0.5 63.3618 0.5 41C0.5 18.6382 18.8506 0.5 41.5 0.5Z" stroke="white"/>
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="white"/>
          </svg>
          {/* Hover state - filled circle with right arrow */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            viewBox="0 0 83 82"
            fill="none"
          >
            <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="white"/>
            <path d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z" fill="black"/>
          </svg>
        </button>

        {/* Progress Bar */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${(1016 / DESIGN_WIDTH) * 100}%`,
            top: `${(1253 / DESIGN_HEIGHT) * 100}%`,
            width: `${(568 / DESIGN_WIDTH) * 100}vw`,
            height: `${(6 / DESIGN_WIDTH) * 100}vw`,
            borderRadius: `${(24 / DESIGN_WIDTH) * 100}vw`,
            backgroundColor: 'rgba(255, 255, 255, 0.52)',
          }}
        >
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / slideCount) * 100}%`,
              borderRadius: `${(24 / DESIGN_WIDTH) * 100}vw`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
