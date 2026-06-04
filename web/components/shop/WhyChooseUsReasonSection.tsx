"use client"

import React, { useState, useEffect, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const SCALE = 0.8 // Scale factor for non-title elements

const rpx = (designValue: number) => `calc(var(--rpx-reason) * ${designValue})`
// Scaled rpx for non-title elements
const srpx = (designValue: number) => `calc(var(--rpx-reason) * ${designValue * SCALE})`

// CSS for animations
const animationStyles = `
  @keyframes floatUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeScaleIn {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-float-up {
    animation: floatUp 0.6s ease-out forwards;
  }

  .animate-fade-scale-in {
    animation: fadeScaleIn 0.5s ease-out forwards;
  }
`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface ReasonItem {
  title: string
  description: string
  image?: MediaObject | null
}

interface WhyChooseUsReasonSectionProps {
  items: ReasonItem[]
  nextButtonText?: string
  autoPlayInterval?: number
}

export function WhyChooseUsReasonSection({
  items,
  nextButtonText = "NEXT",
  autoPlayInterval = 5000,
}: WhyChooseUsReasonSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextIndex = (currentIndex + 1) % items.length

  const goToNext = useCallback(() => {
    if (isAnimating || items.length <= 1) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, items.length])

  const goToPrev = useCallback(() => {
    if (isAnimating || items.length <= 1) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, items.length])

  // Auto-play
  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(timer)
  }, [goToNext, autoPlayInterval, items.length])

  const currentItem = items[currentIndex]
  const nextItem = items[nextIndex]

  if (!currentItem) return null

  // Calculate centered content layout for desktop
  const CONTENT_WIDTH = 1500
  const LEFT_OFFSET = (DESIGN_WIDTH - CONTENT_WIDTH) / 2

  return (
    <>
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* Mobile Layout */}
      <section className="md:hidden bg-brand-main px-5 py-10">
        {/* Title */}
        <h2
          className="font-josefin-sans font-bold text-black text-2xl leading-tight mb-6 animate-float-up whitespace-pre-line"
          key={`mobile-title-${currentIndex}`}
        >
          {currentItem.title}
        </h2>

        {/* Image */}
        <div
          className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden mb-6 animate-fade-scale-in"
          key={`mobile-img-container-${currentIndex}`}
        >
          {currentItem.image ? (
            <OptimizedImage
              image={currentItem.image as any}
              alt={currentItem.title}
              size="medium"
              className="w-full h-full object-cover"
              key={`mobile-img-${currentIndex}`}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">{currentItem.title}</span>
            </div>
          )}

          {/* Next Card Overlay */}
          <div
            className="absolute bottom-4 right-4 w-24 h-32 rounded-2xl overflow-hidden cursor-pointer"
            onClick={goToNext}
            style={{ backgroundColor: "#756F3F" }}
          >
            <p className="font-josefin-sans font-semibold text-white text-xs text-center pt-2">
              {nextButtonText}
            </p>
            <div className="absolute bottom-2 left-2 right-2 h-16 rounded-xl overflow-hidden">
              {nextItem?.image ? (
                <OptimizedImage
                  image={nextItem.image as any}
                  alt={nextItem.title}
                  size="small"
                  className="w-full h-full object-cover"
                  key={`mobile-next-img-${nextIndex}`}
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <span className="text-white/70 text-xs">{nextItem?.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 mb-4">
          {/* Prev Button */}
          <button
            onClick={goToPrev}
            className="group relative w-16 h-10 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="white"/></svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="group relative w-16 h-10 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="white"/></svg>
          </button>
        </div>

        {/* Description */}
        <p
          className="font-josefin-sans text-black text-sm leading-relaxed whitespace-pre-line animate-float-up"
          style={{ animationDelay: "0.15s", opacity: 0 }}
          key={`mobile-desc-${currentIndex}`}
        >
          {currentItem.description}
        </p>
      </section>

      {/* Desktop Layout */}
      <section
        className="relative w-full bg-brand-main overflow-hidden hidden md:flex justify-center py-20"
        style={{
          ["--rpx-reason" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        }}
      >
        {/* Centered Container */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: rpx(CONTENT_WIDTH),
            minHeight: rpx(700),
          }}
        >
          {/* Left Side - Title and Description */}
          <div
            className="absolute"
            style={{
              left: 0,
              top: rpx(120),
              width: rpx(750),
            }}
          >
            {/* Title - max 3 lines with float-up animation (NOT scaled) */}
            <h2
              className="font-josefin-sans font-bold text-black animate-float-up whitespace-pre-line"
              style={{
                fontSize: rpx(60),
                lineHeight: rpx(68),
              }}
              key={`title-${currentIndex}`}
            >
              {currentItem.title}
            </h2>
          </div>

          {/* Next Arrow Button (Right arrow) - same row as description start, offset to the right */}
          <button
            onClick={goToNext}
            className="absolute group cursor-pointer z-10 transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              left: rpx(150),
              top: rpx(420),
              width: srpx(105),
              height: srpx(58),
            }}
            aria-label="Next slide"
          >
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="white"/></svg>
          </button>

          {/* Description - to the right of next button */}
          <div
            className="absolute"
            style={{
              left: rpx(250),
              top: rpx(420),
              width: srpx(550),
            }}
          >
            <p
              className="font-josefin-sans font-normal text-black animate-float-up whitespace-pre-line"
              style={{
                fontSize: rpx(20),
                lineHeight: rpx(26),
                animationDelay: "0.15s",
                opacity: 0,
              }}
              key={`desc-${currentIndex}`}
            >
              {currentItem.description}
            </p>
          </div>

          {/* Prev Arrow Button (Left arrow) - below next button */}
          <button
            onClick={goToPrev}
            className="absolute group cursor-pointer z-10 transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              left: 0,
              top: rpx(500),
              width: srpx(105),
              height: srpx(59),
            }}
            aria-label="Previous slide"
          >
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0" viewBox="0 0 148 61" fill="none"><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/><rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/></svg>
            <svg className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 148 61" fill="none"><rect x="1" y="1" width="146" height="59" rx="29.5" fill="#756F3F"/><path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="white"/></svg>
          </button>

          {/* Right Side - Images (scaled) */}
          {/* Main Large Image (Current Item) */}
          <div
            className="absolute overflow-hidden animate-fade-scale-in"
            style={{
              left: rpx(850),
              top: rpx(87),
              width: rpx(400),
              height: rpx(503),
              borderRadius: rpx(56),
            }}
            key={`main-container-${currentIndex}`}
          >
            {currentItem.image ? (
              <OptimizedImage
                image={currentItem.image as any}
                alt={currentItem.title}
                size="medium"
                className="w-full h-full object-cover"
                key={`main-img-${currentIndex}`}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-2xl">{currentItem.title}</span>
              </div>
            )}
          </div>

          {/* Small Image Card (Next Item) - overlapping on the right side of main image */}
          <div
            className="absolute cursor-pointer group"
            onClick={goToNext}
            style={{
              // Position: main image left + main image width - overlap
              left: rpx(850 + 400 - 60),
              top: rpx(87 + 139),
              width: rpx(174),
              height: rpx(281),
              borderRadius: rpx(41),
              backgroundColor: "#756F3F",
            }}
          >
            {/* "NEXT" Text */}
            <p
              className="absolute font-josefin-sans font-semibold text-white"
              style={{
                left: rpx(14),
                top: rpx(53),
                width: rpx(146),
                fontSize: rpx(24),
                lineHeight: rpx(36),
                textAlign: "center",
              }}
            >
              {nextButtonText}
            </p>

            {/* Small Image */}
            <div
              className="absolute overflow-hidden animate-fade-scale-in"
              style={{
                left: rpx(14),
                top: rpx(120),
                width: rpx(146),
                height: rpx(140),
                borderRadius: rpx(30),
              }}
              key={`next-container-${nextIndex}`}
            >
              {nextItem?.image ? (
                <OptimizedImage
                  image={nextItem.image as any}
                  alt={nextItem.title}
                  size="small"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  key={`next-img-${nextIndex}`}
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <span className="text-white/70 text-sm">{nextItem?.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
