"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface MediaObject {
  id?: string
  url: string
  alt?: string
}

interface Slide {
  title: string
  description: string
  image: MediaObject | null | any
}

interface HeroSectionProps {
  slides: Slide[]
  locale: string
}

export function HeroSection({ slides, locale }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (!slides || slides.length === 0) return null

  // Card stack rotations from Figma
  const cardRotations = [11.02, 5.41, -12.4, -6.65, 0]
  
  // Design values
  const overlayColor = "rgba(53, 47, 3, 0.47)"
  const titleColor = "#FFF499"
  const titleShadowColor = "rgba(86, 80, 31, 1)"
  const textBoxColor = "rgba(39, 35, 2, 0.48)"

  const getSlideInStack = (offset: number) => {
    return slides[(currentIndex + offset) % slides.length]
  }

  const adjustedTitleSize = Math.round(70 * (0.6 / 0.7)) // ~60px
  const adjustedDescSize = Math.round(38 * (0.6 / 0.7)) // ~33px

  return (
    <section className="relative w-full overflow-hidden bg-[#352F03] flex justify-center items-center pt-[46px]" style={{ height: "968px" }}>
      {/* 1. Global Background Image - Large Optimized Variant */}
      <div className="absolute inset-0 z-0 w-full h-full max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={getSlideInStack(0).image?.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <OptimizedImage 
                image={getSlideInStack(0).image} 
                size="large" 
                className="w-full h-full object-cover select-none"
                priority // LCP element
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Global Blur Overlay */}
      <div 
        className="absolute inset-0 z-10 backdrop-blur-[8px]" 
        style={{ backgroundColor: overlayColor }}
      />

      {/* 3. Stacked Items Container - Scaled to 70% */}
      <div className="relative z-20 w-full max-w-[1920px] h-full flex items-center justify-center pointer-events-none">
        <div 
          className="relative w-[1429px] h-auto min-h-[720px] origin-center transition-all duration-500"
          style={{ transform: "scale(0.7)" }}
        >
          
          {/* Back Cards - Small Optimized Variants */}
          <AnimatePresence>
            {[3, 2, 1].map((offset) => {
              const slide = getSlideInStack(offset)
              const rotation = cardRotations[offset - 1]
              
              return (
                <motion.div
                  key={`${slide.title}-${currentIndex}-${offset}`}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 0.5, rotate: rotation }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-[267px] overflow-hidden border border-white/10"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  {slide.image && (
                    <OptimizedImage 
                      image={slide.image}
                      size="small"
                      className="w-full h-full object-cover opacity-50 grayscale-[0.3]"
                    />
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Top Primary Card - Large Optimized Variant */}
          <AnimatePresence mode="popLayout" initial={false}>
            {slides.map((slide, i) => i === currentIndex && (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -150, rotate: 5 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full min-h-[720px] h-auto rounded-[267px] border-[2px] border-[#FDF6C2] shadow-[18px_33px_17.4px_rgba(0,0,0,0.48)] overflow-hidden pointer-events-auto bg-[#272302]"
              >
                 {/* Card Image and Gradient */}
                 <div className="absolute inset-0 z-0">
                    <OptimizedImage 
                      image={slide.image}
                      size="large"
                      className="w-full h-full object-cover"
                      priority
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to bottom, rgba(198, 191, 137, 0) 0%, rgba(39, 35, 2, 1) 100%)",
                        opacity: 0.7
                      }}
                    />
                 </div>

                 {/* Content */}
                 <div className="relative z-10 w-full h-full pt-[297px] pb-[60px]">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative ml-[-36px] rounded-[40px] flex flex-col justify-start"
                      style={{ 
                        width: "958px", 
                        minHeight: "285px",
                        backgroundColor: textBoxColor,
                        paddingLeft: "116px", 
                        paddingTop: "33px",
                        paddingRight: "60px",
                        paddingBottom: "40px",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      <div className="mb-6 relative">
                        {/* 1. Behind Layer (Shadow/Stroke) */}
                        <h1 
                          className="absolute inset-0 font-normal leading-tight"
                          style={{ 
                            fontSize: `${adjustedTitleSize}px`,
                            fontFamily: "var(--font-paytone-one)",
                            color: "#8E5B10",
                            WebkitTextStroke: "1.5px #ffffff", // Slightly more than 1px to compensate for visual shrink
                            transform: "translateY(8px)",
                            zIndex: 0
                          }}
                        >
                          {slide.title}
                        </h1>

                        {/* 2. Top Primary Layer */}
                        <h1 
                          className="relative font-normal leading-tight"
                          style={{ 
                            fontSize: `${adjustedTitleSize}px`,
                            fontFamily: "var(--font-paytone-one)",
                            color: titleColor,
                            textShadow: `0 4px 12.6px ${titleShadowColor}`,
                            zIndex: 1
                          }}
                        >
                          {slide.title}
                        </h1>
                      </div>

                      <div>
                        <p
                          className="text-white font-semibold leading-tight lg:leading-[45px] tracking-tight"
                          style={{ 
                            fontSize: `${adjustedDescSize}px`,
                            fontFamily: "var(--font-anaheim)",
                            textShadow: "0 4px 7.8px rgba(0,0,0,0.71)"
                          }}
                          dangerouslySetInnerHTML={{ __html: (slide.description || "").replace(/\n/g, '<br />') }}
                        />
                      </div>
                    </motion.div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="absolute bottom-12 z-30 flex items-center gap-6 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 scale-90">
        <button 
          onClick={() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)}
          className="text-white/60 hover:text-white transition-colors uppercase text-sm font-bold"
        >
          PREV
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-8 bg-[#FFF499]' : 'w-2 bg-white/20'}`} 
            />
          ))}
        </div>
        <button 
          onClick={() => setCurrentIndex(prev => (prev + 1) % slides.length)}
          className="text-white/60 hover:text-white transition-colors uppercase text-sm font-bold"
        >
          NEXT
        </button>
      </div>
    </section>
  )
}
