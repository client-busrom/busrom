"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface SectionSlide {
  title: string
  description: string
  image: { url: string } | any
}

interface PurchaseProcessSectionProps {
  title?: string
  slides: SectionSlide[]
}

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

export function PurchaseProcessSection({ title, slides }: PurchaseProcessSectionProps) {
  const [index, setIndex] = useState(0)
  
  // Auto-play interval
  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides])

  if (!slides || slides.length === 0) return null

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length)

  // 0.7 Scaled Coordinates - Visual Balancing Re-calculation
  // Offset everything by -329 (original title left) to make content left-aligned in its block
  const getVisibleSteps = () => {
    const prev = (index - 1 + slides.length) % slides.length
    const next = (index + 1) % slides.length
    return [
      { id: prev + 1, data: slides[prev], active: false, pos: "top", onClick: prevSlide },
      { id: index + 1, data: slides[index], active: true, pos: "middle", onClick: undefined },
      { id: next + 1, data: slides[next], active: false, pos: "bottom", onClick: nextSlide },
    ]
  }

  const visibleSteps = getVisibleSteps()

  return (
    <section 
      className="relative w-full overflow-hidden bg-transparent flex justify-center items-center py-12 md:py-0 md:h-[922px]" 
    >
      <div className="relative w-full md:w-[1165px] h-auto md:h-[645px] flex flex-col md:block items-center px-10 md:px-0">
        
        {/* Decorative Dashed Curves - Hide on mobile if they disrupt flow */}
        <div 
          className="hidden md:block absolute pointer-events-none z-0"
          style={{ left: "49px", top: "192px", width: "468px", height: "317px" }}
        >
           <svg width="100%" height="100%" viewBox="0 0 672 457" fill="none" className="w-full h-full">
              <path 
                d="M477.085 415.852C567.699 467.2 728.744 508.855 648.016 264.692" 
                stroke="#756F3F" strokeWidth="3" strokeDasharray="10 14" 
                className="animate-dash-flow-reverse"
              />
              <circle cx="475.954" cy="415.029" r="8.23762" fill="#756F3F"/>
           </svg>
        </div>

        {/* 1. Title */}
        <div 
          className="relative md:absolute z-20 md:pointer-events-none mb-10 md:mb-0 text-center md:text-left"
          style={{ left: typeof window !== 'undefined' && window.innerWidth < 768 ? "0" : "0px", top: typeof window !== 'undefined' && window.innerWidth < 768 ? "0" : "0px" }}
        >
          <h2 
            className="font-semibold leading-tight tracking-wide text-[32px] md:text-[48px]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(135deg, #756F3F 40%, rgba(117, 111, 63, 0.35) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
            dangerouslySetInnerHTML={{ __html: (title || '<span class="opacity-100">How To Make</span><br /><span class="opacity-100">One-Stop<br />Purchases</span>').replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Central Image (Capsule shape) */}
        <div 
          className="relative md:absolute z-10 mb-10 md:mb-0"
          style={{ left: typeof window !== 'undefined' && window.innerWidth < 768 ? "auto" : "100px", top: typeof window !== 'undefined' && window.innerWidth < 768 ? "auto" : "20px" }}
        >
          <AnimatePresence mode="wait">
             {slides.map((slide, i) => i === index && (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.8 }}
                 className="overflow-hidden shadow-2xl bg-white/50"
                 style={{ 
                   width: typeof window !== 'undefined' && window.innerWidth < 768 ? "260px" : "365px", 
                   height: typeof window !== 'undefined' && window.innerWidth < 768 ? "440px" : "620px", 
                   borderRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? "130px" : "183px" 
                 }}
               >
                  <OptimizedImage 
                    image={slide.image} 
                    size="small"
                    className="w-full h-full object-cover"
                    alt={`Step ${i}`}
                  />
               </motion.div>
             ))}
          </AnimatePresence>
        </div>

        {/* 3. Circular Flow Diagram & Steps Stacking */}
        <div 
          className="relative md:absolute w-full max-w-[400px] md:max-w-none h-auto md:h-[596px]"
          style={{ left: typeof window !== 'undefined' && window.innerWidth < 768 ? "auto" : "569px", top: typeof window !== 'undefined' && window.innerWidth < 768 ? "auto" : "48px", width: typeof window !== 'undefined' && window.innerWidth < 768 ? "100%" : "596px" }}
        >
          {/* Background circle decorative - only for desktop */}
          <div className="hidden md:block absolute inset-0 rounded-full border border-[#756F3F] opacity-30 pointer-events-none" />
          
          <div className="relative flex flex-col md:block items-center md:items-start gap-8 md:gap-0">
            {visibleSteps.map((step) => {
              let top = 298 
              let left = 50 
              if (step.pos === "top") { left = 122; top = 122; } 
              if (step.pos === "middle") { left = 50; top = 298; }
              if (step.pos === "bottom") { left = 122; top = 474; } 

              return (
                <div 
                  key={step.id} 
                  className="relative md:absolute w-full md:w-auto" 
                  style={{ 
                    left: typeof window !== 'undefined' && window.innerWidth < 768 ? "0" : left + "px", 
                    top: typeof window !== 'undefined' && window.innerWidth < 768 ? "0" : top + "px" 
                  }}
                >
                  {step.active ? (
                    <div className="flex flex-col items-center md:items-start">
                      <div className="flex items-center gap-4 mb-2">
                        <motion.div 
                          className="bg-[#756F3F] rounded-full flex items-center justify-center shadow-xl z-20 shrink-0"
                          style={{ width: "40px", height: "40px" }}
                        >
                           <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                              <path d="M20 6C15 6 11 10 11 15C11 18.2 12.5 21.1 15 23V28H25V23C27.5 21.1 29 18.2 29 15C29 10 25 6 20 6Z" fill="white" />
                           </svg>
                        </motion.div>
                        <span 
                          className="font-bold text-[#141414] tracking-widest text-[20px] md:text-[24px]" 
                          style={{ fontFamily: "var(--font-anaheim)" }}
                        >
                          {step.id}. {step.data.title}
                        </span>
                      </div>
                      <p 
                        className="font-medium text-[#7A7A7A] leading-[1.4] text-center md:text-left max-w-[280px] md:max-w-[245px]"
                        style={{ fontSize: "16px", fontFamily: "var(--font-anaheim)" }}
                      >
                        {step.data.description}
                      </p>
                    </div>
                  ) : (
                    <button 
                      onClick={step.onClick}
                      className="group flex items-center justify-center md:justify-start gap-4 transition-opacity duration-300 hover:opacity-100 opacity-60 md:opacity-100"
                    >
                      <div 
                        className="bg-white border border-[#756F3F]/40 group-hover:bg-[#756F3F] group-hover:border-[#756F3F] rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                        style={{ width: "34px", height: "34px" }} 
                      >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#756F3F] group-hover:text-white">
                           <path d={step.pos === 'top' ? "M7 17L17 7M17 7H7M17 7V17" : "M7 7L17 17M17 17V7M17 17H7"} />
                         </svg>
                      </div>
                      <span 
                        className="font-bold text-[#141414] tracking-widest uppercase transition-colors duration-300 group-hover:text-[#756F3F] text-[18px] md:text-[20px]" 
                        style={{ fontFamily: "var(--font-anaheim)" }} 
                      >
                        {step.id}. {step.data.title}
                      </span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}


