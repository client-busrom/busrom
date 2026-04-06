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
  const stepWidth = 550

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
    <section className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-center" style={{ height: "922px" }}>
      
      {/* 70% Scale Container */}
      <div 
        className="relative w-[1920px] h-[922px] origin-center flex-shrink-0"
        style={{ transform: "scale(0.7)" }}
      >
        
        {/* 1. Header Area */}
        <div className="absolute left-[153px] top-[0px] w-[1150px] z-50 pointer-events-none">
          <h2 
            className="text-[96px] font-extrabold leading-[102px] text-[#78713A] tracking-[0.05em]"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "The Value Of One-Stop<br />Procurement").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Sub-indicator Area */}
        <div className="absolute left-[1498px] top-[80px] flex flex-col items-end z-50 pointer-events-none">
           <div className="relative mb-2">
             <motion.div 
               animate={{ 
                 x: [0, 20, -20, 0],
                 y: [0, -15, 15, 0],
               }}
               transition={{ 
                 duration: 8, 
                 repeat: Infinity, 
                 ease: "easeInOut" 
               }}
               className="w-[120px] h-[120px] bg-[#EDEBD8] rounded-full absolute -top-8 -right-8 -z-10 blur-[10px] opacity-70" 
             />
             <h3 
               className="text-[48px] font-semibold leading-[58px] text-[#756F3F] text-right"
               style={{ 
                 fontFamily: "var(--font-anaheim)",
                 background: "linear-gradient(to bottom, #756F3F 0%, rgba(117, 111, 63, 0.35) 100%)",
                 WebkitBackgroundClip: "text",
                 WebkitTextFillColor: "transparent"
               }}
               dangerouslySetInnerHTML={{ __html: (subtitle || "Problems<br />To Be Solved").replace(/\n/g, '<br />') }}
             />
           </div>
        </div>

        {/* 3. Static Background Content Box */}
        <div 
          className="absolute left-[363px] top-[233px] w-[792px] h-[578px] rounded-[30px] shadow-[0_80px_70.2px_rgba(0,0,0,0.07)] bg-gradient-to-b from-[#F6F4ED] to-white z-0"
        />

        {/* 4. Scrolling Items Area */}
        <div className="absolute inset-0 z-10">
          <motion.div 
            className="absolute top-[282px] left-[455px] flex"
            animate={{ x: -(currentIndex * stepWidth) }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            {data.map((item, idx) => (
              <div 
                key={idx}
                className="w-[529px] h-[297px] rounded-[30px] overflow-hidden shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] mr-[21px] flex-shrink-0 relative group cursor-pointer"
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
                    className="absolute inset-0 border-[6px] border-[#756F3F] rounded-[30px] z-10"
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* 5. Active Text */}
          <div className="absolute left-[474px] top-[618px] w-[418px] h-[147px] pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-[24px] font-semibold leading-[32px] text-black"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {data[currentIndex].description}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 6. Navigation Controls - Individual Dashed Square Buttons */}
          <div className="absolute left-[960px] top-[710px] flex pointer-events-auto z-20">
            <button 
              onClick={handlePrev} 
              className="w-[78px] h-[77px] flex items-center justify-center border border-dashed border-[#B0B0B0]/60 hover:bg-black/5 transition-all"
            >
              <svg width="78" height="77" viewBox="0 0 78 77" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M30.4609 38.4697L45.6807 53.3662L47.8604 51.1514L35.0645 38.4697L47.8604 25.7881L45.6807 23.5732L30.4609 38.4697Z" fill="#B0B0B0"/>
              </svg>
            </button>
            <button 
              onClick={handleNext} 
              className="w-[78px] h-[77px] flex items-center justify-center border border-dashed border-[#756F3F]/60 hover:bg-[#756F3F]/5 transition-all"
            >
              <svg width="78" height="77" viewBox="0 0 78 77" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M47.5391 38.4697L32.3193 53.3662L30.1396 51.1514L42.9355 38.4697L30.1396 25.7881L32.3193 23.5732L47.5391 38.4697Z" fill="#756F3F"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 7. Footer Decorative Elements */}
        
        {/* Left Bottom Chevron Array */}
        <div className="absolute left-[160px] top-[740px] px-6 py-4 flex gap-1 opacity-50 z-20">
           {Array.from({ length: 11 }).map((_, i) => (
             <svg key={i} width="16" height="24" viewBox="0 0 16 24" fill="none" className="flex-shrink-0 animate-pulse-wave" style={{ animationDelay: `${i * 0.1}s` }}>
               <path d="M4 4L12 12L4 20" stroke="#756F3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
           ))}
        </div>

        <div className="absolute left-[1638px] top-[794px] w-[143px] h-[128px] z-20">
           <AnimatePresence mode="wait">
             <motion.span
               key={currentIndex}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="text-[120px] font-bold text-[#D7D1A8] leading-[102px]"
               style={{ fontFamily: "var(--font-anaheim)" }}
             >
               0{currentIndex + 1}
             </motion.span>
           </AnimatePresence>
        </div>

        <div className="absolute left-[1580px] top-[700px] w-[3.5px] h-[153px] bg-[#D7D1A8] origin-bottom rotate-[44deg] z-20" />
      </div>
    </section>
  )
}
