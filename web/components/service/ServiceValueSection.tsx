"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage, OptimizedBackgroundImage } from "@/components/ui/OptimizedImage"
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  Lightbulb,
  Settings,
  Gauge,
  Leaf,
  ClipboardCheck,
  Globe,
  type LucideIcon,
} from "lucide-react"

const DESIGN_WIDTH = 1920

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
  width?: number
  height?: number
}

interface ServiceValueSlide {
  title: string
  description: string
  image: MediaObject | null
}

interface ServiceValueSectionProps {
  title?: string
  slides: ServiceValueSlide[]
  backgroundImage?: MediaObject | null
  autoplay?: boolean
  interval?: number
}

// SVG Path for the curve
const CURVE_PATH = "M3.61588 7.13622C252.484 133.236 376.917 328.836 584.585 342.569C790.649 356.197 1098.55 120.334 1321.62 48.7532"

// Base positions along the path (0-1) for the 4 visible dots
// These are the relative offsets from each other
const DOT_SPACING = 0.23 // Spacing between dots
const ACTIVE_POSITION = 0.38 // Position where the active dot should be

// Map slide titles to appropriate Lucide icons
const getIconForTitle = (title: string): LucideIcon => {
  const titleLower = title.toLowerCase()

  // More specific matches first
  if (titleLower.includes("rigorous") || titleLower.includes("inspection")) return ClipboardCheck
  if (titleLower.includes("quality")) return Award
  if (titleLower.includes("safety") || titleLower.includes("comfort")) return Shield
  if (titleLower.includes("innovation")) return Lightbulb
  if (titleLower.includes("custom")) return Settings
  if (titleLower.includes("precision") || titleLower.includes("machining")) return Gauge
  if (titleLower.includes("sustainab") || titleLower.includes("cost")) return Leaf
  if (titleLower.includes("global") || titleLower.includes("partnership")) return Globe

  // Default icon
  return Award
}

export function ServiceValueSection({
  title = "Service Value",
  slides,
  backgroundImage,
  autoplay = true,
  interval = 5,
}: ServiceValueSectionProps) {
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0) // For smooth path animation
  const displayIndexRef = useRef(0) // Ref to track current display index for animation
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shrink' | 'move' | 'grow'>('idle')
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([])
  const pathRef = useRef<SVGPathElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // Calculate points along the SVG path
  useEffect(() => {
    if (pathRef.current) {
      const path = pathRef.current
      const totalLength = path.getTotalLength()

      // Calculate positions for many points along the path for smooth animation
      const points: { x: number; y: number }[] = []
      for (let i = 0; i <= 100; i++) {
        const point = path.getPointAtLength((i / 100) * totalLength)
        points.push({ x: point.x, y: point.y })
      }
      setPathPoints(points)
    }
  }, [])

  // Get point at a specific position (0-1) along the path with linear interpolation
  const getPointAtPosition = useCallback((position: number) => {
    if (pathPoints.length === 0) return { x: 0, y: 0 }

    // Use linear interpolation between points for smoother animation
    const exactIndex = position * 100
    const lowerIndex = Math.max(0, Math.min(Math.floor(exactIndex), 99))
    const upperIndex = Math.min(lowerIndex + 1, 100)
    const fraction = exactIndex - lowerIndex

    const lowerPoint = pathPoints[lowerIndex] || { x: 0, y: 0 }
    const upperPoint = pathPoints[upperIndex] || lowerPoint

    return {
      x: lowerPoint.x + (upperPoint.x - lowerPoint.x) * fraction,
      y: lowerPoint.y + (upperPoint.y - lowerPoint.y) * fraction,
    }
  }, [pathPoints])

  // Auto-play
  useEffect(() => {
    if (!autoplay || isAnimating) return

    const timer = setInterval(() => {
      handleNext()
    }, interval * 1000)

    return () => clearInterval(timer)
  }, [autoplay, interval, isAnimating, currentIndex])

  // Animate displayIndex smoothly along the path
  const animateToIndex = useCallback((targetIndex: number, direction: 1 | -1) => {
    const startIndex = displayIndexRef.current // Use ref for current value
    const startTime = performance.now()
    const duration = 500 // ms for move phase

    // Calculate the actual distance considering wrapping
    let distance = targetIndex - startIndex
    if (direction === 1 && distance < 0) {
      distance += slides.length
    } else if (direction === -1 && distance > 0) {
      distance -= slides.length
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const currentDisplayIndex = startIndex + distance * eased
      displayIndexRef.current = currentDisplayIndex // Update ref
      setDisplayIndex(currentDisplayIndex)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        displayIndexRef.current = targetIndex // Update ref
        setDisplayIndex(targetIndex)
        // Phase 3: Grow new active dot
        setAnimationPhase('grow')
        setTimeout(() => {
          setAnimationPhase('idle')
          setIsAnimating(false)
        }, 300)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [slides.length])

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    // Phase 1: Shrink current dot
    setAnimationPhase('shrink')

    setTimeout(() => {
      // Phase 2: Move dots along path
      setAnimationPhase('move')
      const nextIndex = (currentIndex + 1) % slides.length
      setCurrentIndex(nextIndex)
      animateToIndex(nextIndex, 1)
    }, 300)
  }, [isAnimating, slides.length, currentIndex, animateToIndex])

  const handlePrev = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    // Phase 1: Shrink current dot
    setAnimationPhase('shrink')

    setTimeout(() => {
      // Phase 2: Move dots along path
      setAnimationPhase('move')
      const prevIndex = (currentIndex - 1 + slides.length) % slides.length
      setCurrentIndex(prevIndex)
      animateToIndex(prevIndex, -1)
    }, 300)
  }, [isAnimating, slides.length, currentIndex, animateToIndex])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Get the 4 visible slide indices
  const getVisibleIndices = () => {
    const indices: number[] = []
    for (let i = -1; i <= 2; i++) {
      indices.push((currentIndex + i + slides.length) % slides.length)
    }
    return indices
  }

  const visibleIndices = getVisibleIndices()
  const activeSlide = slides[currentIndex]

  // If no slides, don't render the section
  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden mt-[46px]"
      style={{ height: typeof window !== 'undefined' && window.innerWidth >= 1024 ? vw(922) : undefined }}
    >
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden relative min-h-[500px] py-6">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, #756F3F 0%, transparent 100%)" }}
          />
          {backgroundImage && (
            <div className="absolute inset-0">
              <OptimizedImage
                image={backgroundImage as any}
                size="medium"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 60%)" }}
          />
        </div>

        {/* Content */}
        <div className="relative px-6">
          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="font-anaheim font-extrabold text-[32px] leading-[38px] text-white"
              style={{ textShadow: "0px 2px 12px rgba(54, 54, 54, 0.25)" }}
            >
              {title}
            </h1>
          </div>

          {/* Slide Content Card */}
          <div
            className="rounded-[18px] overflow-hidden mx-auto max-w-[320px]"
            style={{ backgroundColor: "rgba(222, 214, 152, 0.5)" }}
          >
            <div className="flex flex-col p-4 gap-2.5">
              {/* Image */}
              {activeSlide?.image && (
                <div className="relative w-full h-[150px] rounded-[12px] overflow-hidden">
                  <OptimizedImage
                    image={activeSlide.image as any}
                    alt={activeSlide.title}
                    size="small"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  {(() => {
                    const IconComponent = getIconForTitle(activeSlide?.title || "")
                    return <IconComponent className="w-5 h-5 text-[#756F3F]" strokeWidth={1.5} />
                  })()}
                  <h3 className="font-anaheim font-extrabold text-[16px] leading-[22px] text-black">
                    {activeSlide?.title}
                  </h3>
                </div>
                <p className="font-anaheim font-medium text-[13px] leading-[18px] text-[#3C3C3C] line-clamp-4">
                  {activeSlide?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={handlePrev}
              disabled={isAnimating}
              className="w-[44px] h-[44px] rounded-full border-2 border-[#756F3F] bg-white/50 flex items-center justify-center transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-[#756F3F]" strokeWidth={3} />
            </button>
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="w-[44px] h-[44px] rounded-full bg-[#756F3F] flex items-center justify-center transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
          </div>

          {/* Mobile Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating && index !== currentIndex) {
                    setIsAnimating(true)
                    setCurrentIndex(index)
                    setDisplayIndex(index)
                    displayIndexRef.current = index
                    setTimeout(() => setIsAnimating(false), 300)
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-[#756F3F] w-4" : "bg-[#756F3F]/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==================== Desktop Layout ==================== */}
      <div className="hidden lg:block relative w-full h-full">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        {/* Layer 1 (bottom): Green gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #756F3F 0%, transparent 100%)",
          }}
        />

        {/* Layer 2 (top): Background image with 79% opacity */}
        {backgroundImage && (
          <div className="absolute inset-0" style={{ opacity: 0.79 }}>
            <OptimizedImage
              image={backgroundImage as any}
              size="large"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* White gradient overlay from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Title - Double layer effect */}
      <div
        className="absolute left-1/2 text-center whitespace-nowrap"
        style={{
          top: vw(77),
          transform: "translateX(-50%)",
        }}
      >
        {/* Shadow layer */}
        <h1
          className="font-anaheim font-extrabold text-[#756F3F] select-none whitespace-nowrap"
          style={{
            fontSize: vw(120),
            lineHeight: vw(137),
            position: "absolute",
            left: "50%",
            transform: `translateX(-50%) translateX(${vw(6)}) translateY(${vw(6)})`,
          }}
        >
          {title}
        </h1>
        {/* Main layer */}
        <h1
          className="font-anaheim font-extrabold text-white select-none relative whitespace-nowrap"
          style={{
            fontSize: vw(120),
            lineHeight: vw(137),
            textShadow: `0px ${vw(4)} ${vw(25)} rgba(54, 54, 54, 0.25)`,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Hidden SVG for path calculation */}
      <svg
        className="absolute opacity-0 pointer-events-none"
        style={{
          width: vw(1325),
          height: vw(352),
        }}
        viewBox="0 0 1325 352"
      >
        <path ref={pathRef} d={CURVE_PATH} />
      </svg>

      {/* Visible curve with gradient stroke */}
      <svg
        className="absolute"
        style={{
          left: vw(301),
          top: vw(153),
          width: vw(1325),
          height: vw(352),
        }}
        viewBox="0 0 1325 352"
        fill="none"
      >
        <defs>
          <linearGradient id="curveGradient" x1="19.43" y1="175.69" x2="1305.8" y2="64.57" gradientUnits="userSpaceOnUse">
            <stop stopColor="#756F3F" stopOpacity="0" />
            <stop offset="0.144" stopColor="#756F3F" stopOpacity="0.49" />
            <stop offset="0.395" stopColor="#756F3F" />
            <stop offset="0.563" stopColor="#756F3F" stopOpacity="0.83" />
            <stop offset="0.870" stopColor="#756F3F" stopOpacity="0.45" />
            <stop offset="1" stopColor="#756F3F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={CURVE_PATH}
          stroke="url(#curveGradient)"
          strokeWidth="16"
          fill="none"
        />
      </svg>

      {/* Animated dots along the curve - each dot represents a slide and moves along the path */}
      {pathPoints.length > 0 && slides.map((slide, slideIndex) => {
        // Calculate distance from display index (animated value) for smooth path following
        let distanceFromActive = slideIndex - displayIndex

        // Handle circular wrapping
        if (distanceFromActive > slides.length / 2) {
          distanceFromActive -= slides.length
        } else if (distanceFromActive < -slides.length / 2) {
          distanceFromActive += slides.length
        }

        // Calculate position along the path
        // Active slide is at ACTIVE_POSITION, others are spaced by DOT_SPACING
        const position = ACTIVE_POSITION + (distanceFromActive * DOT_SPACING)

        // Only render dots that are within visible range (roughly 0-1 on the path)
        if (position < -0.1 || position > 1.1) {
          return null
        }

        const clampedPosition = Math.max(0, Math.min(1, position))
        const point = getPointAtPosition(clampedPosition)
        const isActive = slideIndex === currentIndex

        // Offset to match the SVG position in the layout (scaled)
        const offsetX = (301 / DESIGN_WIDTH) * 100
        const offsetY = (153 / DESIGN_WIDTH) * 100

        const IconComponent = getIconForTitle(slide.title)

        // Determine dot size based on animation phase
        // During 'shrink' and 'move' phases, all dots are small (48px)
        // During 'grow' and 'idle' phases, active dot is large (140px)
        const shouldBeLarge = isActive && (animationPhase === 'idle' || animationPhase === 'grow')
        const dotSize = shouldBeLarge ? 140 : 48

        // Scale the point coordinates to vw units
        const centerX = `calc(${(point.x / DESIGN_WIDTH) * 100}vw + ${offsetX}vw)`
        const centerY = `calc(${(point.y / DESIGN_WIDTH) * 100}vw + ${offsetY}vw)`

        return (
          <div
            key={`dot-${slideIndex}`}
            className="absolute pointer-events-none"
            style={{
              // Position at center point, use transform for centering so size animation is from center
              left: centerX,
              top: centerY,
              transform: 'translate(-50%, -50%)',
              width: vw(dotSize),
              height: vw(dotSize),
              opacity: position < 0 || position > 1 ? 0 : 1,
              // Only transition size and opacity, not position (position is animated via requestAnimationFrame)
              transition: 'width 300ms, height 300ms, opacity 300ms',
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: shouldBeLarge
                  ? "linear-gradient(180deg, #756F70 0%, #B8B05E 100%)"
                  : "transparent",
              }}
            >
              {shouldBeLarge ? (
                // Active dot icon
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent
                    className="text-white"
                    style={{ width: vw(64), height: vw(64) }}
                    strokeWidth={1.5}
                  />
                </motion.div>
              ) : (
                // Inactive dot - SVG for crisp rendering with 2px outer stroke
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="w-full h-full">
                  <circle cx="26" cy="26" r="24" fill="#E4E4E4" stroke="#756F3F" strokeWidth="2" />
                  <circle cx="26" cy="26" r="13.5" stroke="#756F3F" strokeWidth="21" />
                </svg>
              )}
            </div>
          </div>
        )
      })}

      {/* Content Card - Fixed position per design */}
      {/* Card centered below active dot at ACTIVE_POSITION 0.38 on curve */}
      {/* Design: 571x342, scaled by 284/342 = 0.83 → 474x284 */}
      {/* Visual alignment: active dot at ~750, card width 474, left = 750 - 237 = 513 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute overflow-hidden"
          style={{
            left: vw(513),
            top: vw(550),
            width: vw(474),
            height: vw(284),
            borderRadius: vw(30),
            backgroundColor: "rgba(222, 214, 152, 0.5)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex h-full"
            style={{
              padding: vw(24),
              gap: vw(16),
            }}
          >
            {/* Image */}
            {activeSlide?.image && (
              <div
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: vw(129),
                  height: "100%",
                  borderRadius: vw(20),
                }}
              >
                <OptimizedImage
                  image={activeSlide.image as any}
                  alt={activeSlide.title}
                  size="small"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Text content - scaled by 0.83 from design (32/47, 22/31) */}
            <div className="flex flex-col justify-start flex-1 overflow-hidden">
              <h3
                className="font-anaheim font-extrabold text-black"
                style={{
                  fontSize: vw(24),
                  lineHeight: vw(32),
                  marginBottom: vw(6),
                }}
              >
                {activeSlide?.title}
              </h3>
              <p
                className="font-anaheim font-medium text-[#3C3C3C]"
                style={{
                  fontSize: vw(16),
                  lineHeight: vw(24),
                }}
              >
                {activeSlide?.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div
        className="absolute flex"
        style={{
          right: vw(117),
          bottom: vw(73),
          gap: vw(77),
        }}
      >
        {/* Previous button */}
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="border-2 border-[#756F3F] bg-transparent flex items-center justify-center transition-all hover:bg-[#756F3F]/10 disabled:opacity-50"
          style={{
            width: vw(74),
            height: vw(74),
            borderRadius: vw(37),
            boxShadow: `0px ${vw(4)} ${vw(4)} rgba(0, 0, 0, 0.25)`,
          }}
        >
          <ChevronLeft className="text-[#756F3F]" style={{ width: vw(24), height: vw(24) }} strokeWidth={3} />
        </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="bg-[#756F3F] flex items-center justify-center transition-all hover:bg-[#756F3F]/90 disabled:opacity-50"
          style={{
            width: vw(74),
            height: vw(74),
            borderRadius: vw(37),
          }}
        >
          <ChevronRight className="text-white" style={{ width: vw(24), height: vw(24) }} strokeWidth={3} />
        </button>
      </div>
      </div>
    </section>
  )
}
