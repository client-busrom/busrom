"use client"

import React, { useState, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface MediaObject {
  url: string
  id: string
}

interface BrandHighlightItem {
  title: string
  content: string
  images: MediaObject[]
}

interface StoryBrandHighlightsSectionProps {
  data: {
    title: string
    slides: BrandHighlightItem[]
  }
}

export function StoryBrandHighlightsSection({ data }: StoryBrandHighlightsSectionProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)
  const [activeImageIdx, setActiveImageIdx] = useState(0) 

  const slides = (data?.slides || []).slice(0, 4) 
  const currentSlide = slides[activeSlideIdx]
  const images = currentSlide?.images || []
  const imageCount = images.length
  const totalSlides = slides.length

  const handleNextSlide = useCallback(() => {
    if (slides.length <= 1) return
    setActiveSlideIdx(prev => (prev + 1) % slides.length)
    setActiveImageIdx(0)
  }, [slides.length])

  const handlePrevSlide = useCallback(() => {
    if (slides.length <= 1) return
    setActiveSlideIdx(prev => (prev - 1 + slides.length) % slides.length)
    setActiveImageIdx(0)
  }, [slides.length])

  const toggleImage = () => {
    if (imageCount <= 1) return
    setActiveImageIdx(prev => (prev === 0 ? 1 : 0))
  }

  const formatIndex = (idx: number) => (idx + 1).toString().padStart(2, '0')

  return (
    <section 
      className="relative w-full bg-[#f2efd8] overflow-hidden" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        
        {/* Section Title */}
        <div 
          className="absolute font-josefin-sans font-bold text-[#3b3b3b] text-left" 
          style={{ left: vw(196), top: vw(50), fontSize: vw(96) }}
        >
          {data?.title || "Brand Highlights"}
        </div>

        {/* 2. Left Double-Layered Image Area */}
        <div 
          className="absolute" 
          style={{ 
            left: vw(196), 
            top: vw(198), 
            width: vw(504), 
            height: vw(664), 
          }}
        >
          {/* Layer 1: Blurred Backdrop Rail */}
          <div 
             className="absolute inset-0 overflow-hidden"
             style={{ borderRadius: vw(60) }}
          >
            <motion.div 
               className="absolute inset-x-0 h-full flex"
               animate={{ x: `-${(activeImageIdx * 100)}%` }}
               transition={{ type: "spring", stiffness: 200, damping: 25 }}
               style={{ width: "100%" }}
            >
              {(images || []).map((img, i) => (
                <div key={`bg-${activeSlideIdx}-${i}`} className="relative flex-shrink-0 w-full h-full">
                  <div className="absolute inset-0 z-0">
                    <OptimizedImage image={img} alt="" size="medium" className="object-cover w-full h-full blur-[10px] scale-110 opacity-70" priority={i === 0} />
                  </div>
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-[40.25px]" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Layer 2: Pill-Shaped Clear Image Rail */}
          <div 
            className="absolute shadow-2xl z-10 overflow-hidden cursor-pointer"
            style={{ 
              left: vw(101.3), 
              top: vw(148.9), 
              width: vw(285), 
              height: vw(420),
              borderRadius: vw(248) 
            }}
            onClick={toggleImage}
          >
            <motion.div
              className="absolute inset-x-0 h-full flex"
              animate={{ x: `-${(activeImageIdx * 100)}%` }}
              drag={imageCount > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -30 && activeImageIdx < imageCount - 1) setActiveImageIdx(1)
                else if (info.offset.x > 30 && activeImageIdx > 0) setActiveImageIdx(0)
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ width: "100%" }}
            >
              {(images || []).map((img, i) => (
                <div key={`fg-${activeSlideIdx}-${i}`} className="relative flex-shrink-0 w-full h-full">
                  <OptimizedImage image={img} alt="" size="medium" className="object-cover w-full h-full" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Index Counter - White, semi-bold, 36px */}
          <div 
            className="absolute z-20 font-josefin-sans font-semibold text-white" 
            style={{ right: vw(25), bottom: vw(35), fontSize: vw(36) }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={activeSlideIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {formatIndex(activeSlideIdx)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute inset-x-0 w-full flex justify-between px-10 z-30 pointer-events-none" style={{ top: vw(39) }}>
            <button onClick={handlePrevSlide} className="w-[51px] h-[51px] rounded-full border border-black flex items-center justify-center hover:bg-black group transition-colors pointer-events-auto shadow-sm" style={{ width: vw(51), height: vw(51) }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-180 group-hover:stroke-white stroke-black"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleNextSlide} className="w-[51px] h-[51px] rounded-full border border-black/50 flex items-center justify-center hover:bg-black group transition-colors pointer-events-auto shadow-sm" style={{ width: vw(51), height: vw(51) }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:stroke-white stroke-black/50"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-16 w-full flex justify-center gap-6 z-20">
            {images.map((_, i) => (
               <div key={i} onClick={() => setActiveImageIdx(i)} className={`rounded-full transition-all duration-300 cursor-pointer ${activeImageIdx === i ? "bg-white" : "bg-white/50"}`} style={{ width: vw(14), height: vw(14) }} />
            ))}
          </div>
        </div>

        {/* 3. Right Content Area (Centered) */}
        <div className="absolute flex flex-col items-center" style={{ left: vw(811), top: vw(198), width: vw(919) }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeSlideIdx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="w-full flex flex-col items-center text-center">
              <div 
                className="font-josefin-sans font-semibold text-[#574f0e] leading-[1] mb-6" 
                style={{ fontSize: vw(70) }}
              >
                {currentSlide?.title}
              </div>
              <div 
                className="font-josefin-sans font-semibold text-[#756f3f] whitespace-pre-wrap max-w-[90%]" 
                style={{ fontSize: vw(20), lineHeight: 1.4 }}
              >
                {currentSlide?.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Thumbnail Preview Area (Portrait: 173x200, 19px gap) */}
          <div 
            className="absolute w-full flex justify-center" 
            style={{ top: vw(440), gap: vw(19) }}
          >
             {slides.map((item, index) => {
               const isActive = index === activeSlideIdx
               return (
                 <div key={index} className="relative flex flex-col items-center" style={{ width: vw(173) }}>
                   <div 
                     onClick={() => !isActive && setActiveSlideIdx(index)}
                     className={`relative w-full flex flex-col items-center transition-all duration-300 ${isActive ? "opacity-0 pointer-events-none" : "cursor-pointer group"}`}
                   >
                     <div className="relative w-full aspect-[173/200] overflow-hidden mb-3 border border-black/5" style={{ borderRadius: vw(31) }}>
                        {item.images?.[0] && <OptimizedImage image={item.images[0]} alt="" size="small" className="object-cover w-full h-full" />}
                     </div>
                     {/* Item Title: Scaled down even further to 12vw as per user feedback */}
                     <div 
                        className="font-josefin-sans font-bold text-[#574f0e] uppercase text-center" 
                        style={{ fontSize: vw(12), lineHeight: 1.2 }}
                     >
                        {item.title}
                     </div>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </section>
  )
}
