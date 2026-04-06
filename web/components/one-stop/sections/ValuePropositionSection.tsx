"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
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
}

/**
 * ValuePropositionSection - The Value of One-Stop Procurement
 */
export function ValuePropositionSection({ title, subtitle, problems, advantages }: ValuePropositionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const data = problems.length > 0 ? problems : advantages
  if (data.length === 0) return null
  
  const stepWidth = 550

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-center" style={{ height: "922px" }}>
      
      {/* 70% Scale Container */}
      <div 
        className="relative w-[1920px] h-[922px] origin-center flex-shrink-0"
        style={{ transform: "scale(0.7)" }}
      >
        
        {/* 1. Header Area */}
        <div className="absolute left-[153px] top-[0px] w-[1009px] z-20">
          <h2 
            className="text-[96px] font-extrabold leading-[102px] text-[#78713A] tracking-tighter"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "The Value Of One-Stop<br />Procurement").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Sub-indicator Area */}
        <div className="absolute left-[1498px] top-[80px] flex flex-col items-end z-20">
           <div className="relative mb-2">
             <div className="w-[101px] h-[101px] bg-[#EDEBD8] rounded-full absolute -top-4 -right-4 -z-10" />
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

          {/* 6. Navigation Controls */}
          <div className="absolute left-[1030px] top-[648px] flex gap-4 pointer-events-auto">
            <button 
              onClick={handlePrev}
              className="w-[78px] h-[77px] flex items-center justify-center text-[#756F3F] border border-[#756F3F]/20 rounded-full hover:bg-[#756F3F]/5 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={handleNext}
              className="w-[78px] h-[77px] flex items-center justify-center bg-[#756F3F] text-white rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* 7. Footer Decorative Elements */}
        <div className="absolute left-[1638px] top-[794px] w-[143px] h-[128px]">
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

        <div className="absolute left-[1658px] top-[748px] w-[3.5px] h-[153px] bg-[#D7D1A8] origin-bottom -rotate-[44deg]" />
      </div>
    </section>
  )
}
