"use client"

import React from "react"
import Image from "next/image"
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
  description = "Where Safety Meets Seamless Minimalist Design",
  heroImage,
}: ProductHeroSectionProps) {
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

  // Calculate object position from focal point
  const objectPosition = heroImage?.cropFocalPoint
    ? `${heroImage.cropFocalPoint.x}% ${heroImage.cropFocalPoint.y}%`
    : "center"

  return (
    <>
      {/* Desktop Layout */}
      <section
        data-product-hero
        data-header-theme="light"
        className="relative w-full overflow-hidden hidden md:block"
        style={{
          height: rpx(DESIGN_HEIGHT),
          // Define CSS variable for responsive scaling
          ["--rpx-product" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(500px / ${DESIGN_HEIGHT}), calc((100vh - 46px) / ${DESIGN_HEIGHT})))`,
        }}
      >
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          {heroImage ? (
            <OptimizedImage
              image={heroImage as any}
              alt={heroImage.altText || heroImage.alt || productName}
              size="xlarge"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          {/* Dark overlay - 13% opacity black as per Figma */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.13)" }}
          />
        </div>

        {/* Product Name - Centered */}
        <motion.h1
          className="absolute font-josefin-sans font-bold text-white text-center"
          style={{
            left: rpx(389),
            top: rpx(295),
            width: rpx(1203),
            fontSize: rpx(60),
            lineHeight: rpx(68),
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {productName}
        </motion.h1>

        {/* Description - Gradient text */}
        <motion.p
          className="absolute font-josefin-sans font-bold text-center"
          style={{
            left: rpx(389),
            top: rpx(461),
            width: rpx(1203),
            fontSize: rpx(24),
            lineHeight: rpx(32),
            background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {description}
        </motion.p>

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
            <Image
              src="/product-hero/scroll-arrow.svg"
              alt="Scroll down"
              fill
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
            <Image
              src="/product-hero/scroll-arrow.svg"
              alt="Scroll down"
              fill
              className="object-contain group-hover:brightness-110"
            />
          </button>
        </motion.div>
      </section>
    </>
  )
}
