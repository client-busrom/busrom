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
    <section className="relative w-full overflow-hidden bg-[#352F03] flex justify-center items-center pt-[20px] md:pt-[46px] h-screen max-h-[968px] min-h-[600px]">
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
                size="xlarge" 
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

      {/* 3. Stacked Items Container - Scaled on Desktop */}
      <div className="relative z-20 w-full max-w-[1920px] h-full flex items-center justify-center pointer-events-none px-4 md:px-0">
        <div 
          className="relative w-full md:w-[1429px] h-auto min-h-[500px] md:min-h-[720px] origin-center transition-all duration-500 scale-[0.85] md:scale-[0.7]"
        >
          
          {/* Back Cards - Hide on mobile if too cluttered */}
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
                  className="absolute inset-0 rounded-[100px] md:rounded-[267px] overflow-hidden border border-white/10 hidden md:block"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  {slide.image && (
                    <OptimizedImage 
                      image={slide.image}
                      size="xlarge"
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
                initial={{ opacity: 0, y: 50, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -100, rotate: 2 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full min-h-[550px] md:min-h-[720px] h-auto rounded-[60px] md:rounded-[267px] border-[2px] border-[#FDF6C2] shadow-[18px_33px_17.4px_rgba(0,0,0,0.48)] overflow-hidden pointer-events-auto bg-[#272302]"
              >
                 {/* Card Image and Gradient */}
                 <div className="absolute inset-0 z-0">
                    <OptimizedImage 
                      image={slide.image}
                      size="xlarge"
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
                  <div className="relative z-10 w-full h-full pt-[180px] md:pt-[297px] pb-[60px] px-6 md:px-0">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative md:ml-[-36px] flex flex-col justify-start w-full md:w-[958px] min-h-[220px] md:min-h-[285px] backdrop-blur-[10px]"
                      style={{ 
                        backgroundColor: textBoxColor,
                        padding: "48px",
                        paddingLeft: typeof window !== 'undefined' && window.innerWidth < 768 ? "48px" : "140px", 
                      }}
                    >
                      <div className="mb-6 relative">
                        {/* 1. Behind Layer (Shadow/Stroke) - Synchronize with Top layer */}
                        <h1 
                          className="absolute inset-0 font-normal leading-tight text-center md:text-left"
                          style={{ 
                            fontSize: "clamp(32px, 8vw, 60px)", // Synced size
                            fontFamily: "var(--font-paytone-one)",
                            color: "#8E5B10",
                            WebkitTextStroke: "1.5px #ffffff", 
                            transform: "translateY(8px)",
                            zIndex: 0
                          }}
                        >
                          {slide.title}
                        </h1>

                        {/* 2. Top Primary Layer */}
                        <h1 
                          className="relative font-normal leading-tight text-center md:text-left"
                          style={{ 
                            fontSize: "clamp(32px, 8vw, 60px)",
                            fontFamily: "var(--font-paytone-one)",
                            color: titleColor,
                            textShadow: `0 4px 12.6px ${titleShadowColor}`,
                            zIndex: 1
                          }}
                        >
                          {slide.title}
                        </h1>
                      </div>

                      <div className="text-center md:text-left">
                        <p
                          className="text-white font-semibold leading-normal tracking-tight"
                          style={{ 
                            fontSize: "clamp(16px, 4vw, 33px)",
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
      <div className="absolute bottom-12 z-30 flex items-center gap-6 bg-black/20 backdrop-blur-md px-6 py-4 rounded-full border border-white/10 scale-90">
        <button 
          onClick={() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)}
          className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
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
          className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
