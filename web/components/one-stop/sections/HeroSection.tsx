"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MediaObject {
  id?: string
  url: string
  alt?: string
}

interface Slide {
  title: string
  description: string
  image: MediaObject | null
}

interface HeroSectionProps {
  slides: Slide[]
  locale: string
}

/**
 * HeroSection - One-Stop Shop Introduction
 * Scaled to 70% for container, but fonts adjusted down to avoid "enlarging".
 * Card (Rectangle 95) expands if text is too long.
 */
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

  // To keep font physical size stable while parent scale goes from 0.6 to 0.7:
  // FontSize_New = FontSize_Old * (0.6 / 0.7)
  const adjustedTitleSize = Math.round(70 * (0.6 / 0.7)) // ~60px
  const adjustedDescSize = Math.round(38 * (0.6 / 0.7)) // ~33px

  return (
    <section className="relative w-full overflow-hidden bg-[#352F03] flex justify-center items-center pt-[46px]" style={{ height: "968px" }}>
      {/* 1. Global Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.img
            key={getSlideInStack(0).image?.url || currentIndex}
            src={getSlideInStack(0).image?.url || ""}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full object-cover select-none"
            alt="Global BG"
          />
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
          
          {/* Back Cards */}
          <AnimatePresence>
            {[3, 2, 1].map((offset) => {
              const slide = getSlideInStack(offset)
              const rotation = cardRotations[offset - 1]
              
              return (
                <motion.div
                  key={`${slide.title}-${currentIndex}-${offset}`}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 0.7, rotate: rotation }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-[267px] overflow-hidden border border-white/10"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  {slide.image && (
                    <img
                      src={slide.image.url}
                      className="w-full h-full object-cover opacity-50 grayscale-[0.3]"
                      alt={`next-slide-${offset}`}
                    />
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Top Primary Card */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`active-${currentIndex}`}
              initial={{ opacity: 0, y: 100, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -150, rotate: 5 }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full min-h-[720px] h-auto rounded-[267px] border-[2px] border-[#FDF6C2] shadow-[18px_33px_17.4px_rgba(0,0,0,0.48)] overflow-hidden pointer-events-auto bg-[#272302]"
            >
               {/* Card Image and Gradient */}
               <div className="absolute inset-0 z-0">
                  <img
                    src={getSlideInStack(0).image?.url || ""}
                    className="w-full h-full object-cover"
                    alt="top-slide-img"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to bottom, rgba(198, 191, 137, 0) 0%, rgba(39, 35, 2, 1) 100%)",
                      opacity: 0.7
                    }}
                  />
               </div>

               {/* Content - Absolute/Relative hybrid logic but flow-safe */}
               <div className="relative z-10 w-full h-full pt-[297px] pb-[60px]">
                  {/* Rectangle 316 - Background Box (Dynamic) */}
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
                    {/* Title Area */}
                    <div className="mb-6">
                      <h1 
                        className="font-normal leading-tight"
                        style={{ 
                          fontSize: `${adjustedTitleSize}px`,
                          fontFamily: "var(--font-paytone-one)",
                          color: titleColor,
                          textShadow: `2px 2px 0px rgba(255,255,255,0.05), 0 4px 12.6px ${titleShadowColor}`
                        }}
                      >
                        {getSlideInStack(0).title}
                      </h1>
                    </div>

                    {/* Description Area */}
                    <div>
                      <p
                        className="text-white font-semibold leading-tight lg:leading-[45px] tracking-tight"
                        style={{ 
                          fontSize: `${adjustedDescSize}px`,
                          fontFamily: "var(--font-anaheim)",
                          textShadow: "0 4px 7.8px rgba(0,0,0,0.71)"
                        }}
                      >
                        {getSlideInStack(0).description}
                      </p>
                    </div>
                  </motion.div>
               </div>
            </motion.div>
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
