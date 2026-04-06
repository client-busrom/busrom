"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface SectionSlide {
  title: string
  description: string
  image: { url: string } | any
}

interface ValuePropositionProps {
  title?: string
  subtitle?: string
  problems: SectionSlide[]
  advantages: SectionSlide[]
  autoplay?: boolean
  interval?: number
}

/**
 * ValuePropositionSection - The Value of One-Stop Procurement
 */
export function ValuePropositionSection({ title, subtitle, problems, advantages, autoplay, interval = 5 }: ValuePropositionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const data = problems.length > 0 ? problems : advantages
  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % data.length)
  }, [data.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  // Autoplay Effect
  useEffect(() => {
    if (!autoplay || data.length <= 1) return

    const timer = setInterval(() => {
      handleNext()
    }, (interval || 5) * 1000)

    return () => clearInterval(timer)
  }, [autoplay, interval, data.length, handleNext])

  if (data.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden bg-transparent flex justify-center items-center py-12 lg:py-0 lg:h-[922px]">
      
      {/* Unified Container */}
      <div 
        className="relative w-full max-w-[1920px] h-auto lg:h-[850px] flex-shrink-0 flex flex-col lg:block"
      >
        
        {/* === MOBILE ONLY CONTENT (< 1024px) === */}
        <div className="flex lg:hidden flex-col w-full px-6 gap-12">
            {/* ... Mobile list remains the same with its own px values ... */}
            <div className="w-full text-center">
              <h2 
                className="text-[32px] font-extrabold leading-tight text-[#78713A] tracking-[0.05em] mb-4"
                style={{ fontFamily: "var(--font-anaheim)" }}
                dangerouslySetInnerHTML={{ __html: (title || "The Value Of One-Stop Procurement").replace(/\n/g, '<br />') }}
              />
              <h3 
                 className="text-[18px] font-semibold leading-tight text-[#756F3F] opacity-60"
                 style={{ fontFamily: "var(--font-anaheim)" }}
                 dangerouslySetInnerHTML={{ __html: (subtitle || "Problems To Be Solved").replace(/\n/g, '<br />') }}
              />
            </div>

            {/* List Wrapper - Responsive Grid (1 col on mobile, 2 cols on tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
              {data.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="w-full h-[200px] sm:h-[180px] lg:h-[220px] rounded-[24px] overflow-hidden shadow-md">
                     <OptimizedImage 
                        image={item.image}
                        size="medium"
                        className="w-full h-full object-cover"
                        alt={`Slide ${idx}`}
                      />
                  </div>
                  <p className="text-[17px] font-semibold leading-relaxed text-black text-left px-1" style={{ fontFamily: "var(--font-anaheim)" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
        </div>

        {/* === DESKTOP ONLY CONTENT (>= 1024px) === */}
        
        {/* 1. Header Area */}
        <div 
           className="hidden lg:block absolute z-50 text-left"
           style={{ left: "10vw", top: 0, width: "1000px" }}
        >
          <h2 
            className="font-extrabold leading-[1.1] text-[#78713A] tracking-[0.05em]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              fontSize: "64px"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "The Value Of One-Stop<br />Procurement").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Sub-indicator Area */}
        <div 
          className="hidden lg:flex absolute flex-col items-end z-50 pointer-events-none"
          style={{ right: "7.8vw", top: "40px" }}
        >
           <div className="relative mb-2">
             <motion.div 
               animate={{ 
                 x: [0, 15, -15, 0],
                 y: [0, -10, 10, 0],
               }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="bg-[#EDEBD8] rounded-full absolute -top-4 -right-4 -z-10 blur-[8px] opacity-70" 
               style={{ width: "80px", height: "80px" }}
             />
             <h3 
               className="font-semibold leading-tight text-[#756F3F] text-right opacity-60"
               style={{ 
                 fontFamily: "var(--font-anaheim)",
                 fontSize: "32px"
               }}
               dangerouslySetInnerHTML={{ __html: (subtitle || "Problems<br />To Be Solved").replace(/\n/g, '<br />') }}
             />
           </div>
        </div>

        {/* 3. Static Background Box */}
        <div 
          className="hidden lg:block absolute shadow-[0_40px_35px_rgba(0,0,0,0.04)] bg-gradient-to-b from-[#F6F4ED] to-white z-0"
          style={{ 
            left: "15.6vw", 
            top: "180px", 
            width: "700px", 
            height: "500px", 
            borderRadius: "30px" 
          }}
        />

        {/* 4. Scrolling Area */}
        <div className="hidden lg:block absolute inset-0 z-10">
          <motion.div 
            className="absolute flex"
            style={{ top: "220px", left: "18.2vw" }}
            animate={{ x: -(currentIndex * 420) }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            {data.map((item, idx) => (
              <div 
                key={idx}
                className="overflow-hidden shadow-lg flex-shrink-0 relative group cursor-pointer"
                style={{ 
                  width: "400px", 
                  height: "260px", 
                  marginRight: "20px",
                  borderRadius: "30px" 
                }}
                onClick={() => setCurrentIndex(idx)}
              >
                <OptimizedImage 
                  image={item.image}
                  size="small"
                  className={`w-full h-full object-cover transition-all duration-700 ${idx !== currentIndex ? 'grayscale opacity-50' : 'grayscale-0 opacity-100'}`}
                  alt={`Slide ${idx}`}
                />
                {idx === currentIndex && (
                  <motion.div 
                    layoutId="active-border"
                    className="absolute inset-0 border-[#756F3F] z-10"
                    style={{ borderWidth: "4px", borderRadius: "30px" }}
                  />
                )}
              </div>
            ))}
          </motion.div>
 
          {/* 5. Active Text */}
          <div 
             className="absolute text-left"
             style={{ left: "19.2vw", top: "520px", width: "450px" }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="font-semibold leading-relaxed text-black"
                style={{ 
                  fontFamily: "var(--font-anaheim)",
                  fontSize: "20px"
                }}
              >
                {data[currentIndex].description}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 6. Navigation Controls */}
          <div 
             className="absolute flex justify-start z-20"
             style={{ left: "43.2vw", top: "530px" }}
          >
            <button 
              onClick={handlePrev} 
              className="flex items-center justify-center bg-transparent hover:bg-black/5 transition-colors"
              style={{ width: "78px", height: "77px" }}
            >
              <svg width="42px" height="42px" viewBox="0 0 78 77" fill="none">
                <path d="M30.4609 38.4697L45.6807 53.3662L47.8604 51.1514L35.0645 38.4697L47.8604 25.7881L45.6807 23.5732L30.4609 38.4697Z" fill="#B0B0B0"/>
              </svg>
            </button>
            <button 
              onClick={handleNext} 
              className="flex items-center justify-center bg-transparent hover:bg-black/5 transition-colors"
              style={{ width: "78px", height: "77px" }}
            >
              <svg width="42px" height="42px" viewBox="0 0 78 77" fill="none">
                <path d="M47.5391 38.4697L32.3193 53.3662L30.1396 51.1514L42.9355 38.4697L30.1396 25.7881L32.3193 23.5732L47.5391 38.4697Z" fill="#756F3F"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 7. Footer Decorative Elements */}
        <div 
           className="hidden lg:flex absolute py-4 gap-1 opacity-50 z-20"
           style={{ left: "7.3vw", bottom: "22%" }}
        >
           {Array.from({ length: 11 }).map((_, i) => (
             <motion.svg 
               key={i} 
               viewBox="0 0 16 24" fill="none" 
               className="flex-shrink-0"
               style={{ width: "16px", height: "24px" }}
               animate={{ opacity: [0.1, 0.6, 0.1] }}
               transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
             >
               <path d="M4 4L12 12L4 20" stroke="#756F3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             </motion.svg>
           ))}
        </div>

        {/* 8. Slide Number & Decorative Slash - Grouped for Locked Position */}
        <div 
           className="hidden lg:block absolute z-20 pointer-events-none"
           style={{ right: "7.3vw", bottom: "10%" }}
        >
          <div className="relative">
             {/* Slide Number */}
             <AnimatePresence mode="wait">
               <motion.span
                 key={currentIndex}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 className="block font-bold text-[#D7D1A8] leading-none"
                 style={{ 
                   fontFamily: "var(--font-anaheim)",
                   fontSize: "100px"
                 }}
               >
                 0{currentIndex + 1}
               </motion.span>
             </AnimatePresence>

             {/* Decorative Slash - Positioned relative to the number */}
             <div 
                className="absolute bg-[#D7D1A8] origin-bottom rotate-[44deg] z-10" 
                style={{ 
                  right: "140px", 
                  bottom: "35px", 
                  width: "3px", 
                  height: "120px" 
                }}
              />
          </div>
        </div>
      </div>
    </section>
  )
}
