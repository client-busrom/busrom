"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Design reference dimensions (from Figma 1920x922)
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922

// Mobile design dimensions (portrait)
const MOBILE_WIDTH = 390
const MOBILE_HEIGHT = 600

// Responsive size function using CSS variable
const rpx = (designValue: number) => `calc(var(--rpx-product) * ${designValue})`
const mpx = (designValue: number) => `calc(var(--mpx-product) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface ProductHeroSectionProps {
  productName: string
  description?: string
  heroImage?: MediaObject | null
}

export function ProductHeroSection({
  productName,
  description,
  heroImage,
}: ProductHeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [dynamicFontSize, setDynamicFontSize] = useState(96)

  const handleScrollDown = () => {
    // Get the visible hero section (desktop or mobile)
    const heroSections = document.querySelectorAll('[data-product-hero]')
    let visibleHero: Element | null = null

    heroSections.forEach(section => {
      const rect = section.getBoundingClientRect()
      if (rect.height > 0 && rect.width > 0) {
        visibleHero = section
      }
    })

    if (visibleHero) {
      // Scroll by the height of the hero section
      const heroRect = (visibleHero as Element).getBoundingClientRect()
      const scrollTarget = window.scrollY + heroRect.bottom
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      })
    }
  }

  // Dynamic Font Size logic (Keep title within 3 lines)
  React.useLayoutEffect(() => {
    if (!titleRef.current) return

    const adjustFontSize = () => {
      if (!titleRef.current) return
      
      const isMobile = window.innerWidth < 768
      const base = isMobile ? 390 : DESIGN_WIDTH
      
      // Target sizes: 96px for desktop, around 48px for mobile
      let size = isMobile ? 48 : 96
      
      // Line height is roughly 1.1x of font size
      const lineH = size * 1.1
      const maxHeight = (lineH * 3 / base) * window.innerWidth
      
      titleRef.current.style.fontSize = `${(size / base) * 100}vw`
      
      // Gradually shrink if height exceeds 3 lines
      while (titleRef.current.offsetHeight > maxHeight && size > (isMobile ? 24 : 40)) {
        size -= 2
        titleRef.current.style.fontSize = `${(size / base) * 100}vw`
      }
      setDynamicFontSize(size)
    }

    adjustFontSize()
    window.addEventListener("resize", adjustFontSize)
    return () => window.removeEventListener("resize", adjustFontSize)
  }, [productName])

  // Calculate object position from focal point
  const objectPosition = heroImage?.cropFocalPoint
    ? `${heroImage.cropFocalPoint.x}% ${heroImage.cropFocalPoint.y}%`
    : "center"

  return (
    <>
      {/* Desktop Layout */}
      <section
        data-product-hero
        className="relative w-full overflow-hidden hidden md:block"
        style={{
          height: rpx(DESIGN_HEIGHT),
          ["--rpx-product" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(500px / ${DESIGN_HEIGHT}), calc((100vh - 46px) / ${DESIGN_HEIGHT})))`,
        }}
      >
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          {heroImage ? (
            <OptimizedImage
              image={heroImage as any}
              alt={heroImage.altText || heroImage.alt || productName}
              size="large"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
              priority
            />
          ) : (
            <div className="w-full h-full bg-brand-bg-cream" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content - Full Centering */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-full flex flex-col items-center text-center px-12"
            style={{ maxWidth: rpx(1200) }}
          >
            <motion.h1
              ref={titleRef}
              className="font-josefin-sans font-bold text-white tracking-tighter pointer-events-auto"
              style={{
                fontSize: `calc(${dynamicFontSize} * var(--rpx-product))`,
                lineHeight: 1.1,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {productName}
            </motion.h1>

            {description && (
              <motion.p
                className="font-josefin-sans font-bold mt-8 opacity-90 pointer-events-auto"
                style={{
                  fontSize: rpx(48),
                  lineHeight: 1.2,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent decoration-clone py-[0.1em]">
                  {description}
                </span>
              </motion.p>
            )}
          </div>
        </div>

        {/* Scroll Down Arrow Container - 用于居中定位 */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: rpx(62),
            width: rpx(82),
            height: rpx(82),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* 按钮本身 - 用于动画 */}
          <button
            onClick={handleScrollDown}
            className="relative w-full h-full cursor-pointer animate-bounce-slow hover:scale-110 active:scale-95 transition-transform group"
          >
            {/* 脉冲光环效果 */}
            <span
              className="absolute inset-0 rounded-full animate-ping-slow"
              style={{
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
              }}
            />
            <img
              src="/product-hero/scroll-arrow.svg"
              alt="Scroll down"
              className="object-contain group-hover:brightness-110"
            />
          </button>
        </motion.div>
      </section>

      {/* Mobile Layout - Portrait/Long screen */}
      <section
        data-product-hero
        data-header-theme="light"
        className="relative w-full overflow-hidden block md:hidden"
        style={{
          height: mpx(MOBILE_HEIGHT),
          ["--mpx-product" as string]: `calc(100vw / ${MOBILE_WIDTH})`,
        }}
      >
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          {heroImage ? (
            <OptimizedImage
              image={heroImage as any}
              alt={heroImage.altText || heroImage.alt || productName}
              size="medium"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          />
        </div>

        {/* Content Container - Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {/* Product Name */}
          <motion.h1
            className="font-josefin-sans font-bold text-white text-center"
            style={{
              fontSize: mpx(42),
              lineHeight: "1.1",
              marginBottom: mpx(16),
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {productName}
          </motion.h1>

          {/* Description - Gradient text */}
          <motion.p
            className="font-josefin-sans font-bold text-center"
            style={{
              fontSize: mpx(18),
              lineHeight: "1.3",
              background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: mpx(320),
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Scroll Down Arrow */}
        <motion.div
          className="absolute left-0 right-0 flex justify-center"
          style={{ bottom: mpx(40) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={handleScrollDown}
            className="relative cursor-pointer animate-bounce-slow hover:scale-110 active:scale-95 transition-transform group"
            style={{
              width: mpx(50),
              height: mpx(50),
            }}
          >
            {/* 脉冲光环效果 */}
            <span
              className="absolute inset-0 rounded-full animate-ping-slow"
              style={{
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
              }}
            />
            <img
              src="/product-hero/scroll-arrow.svg"
              alt="Scroll down"
              className="object-contain group-hover:brightness-110"
            />
          </button>
        </motion.div>
      </section>
    </>
  )
}
