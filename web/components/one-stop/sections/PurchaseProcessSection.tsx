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
      className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-center" 
      style={{ height: vw(922) }}
    >
      <div className="relative w-[1165px] h-[645px] shrink-0">
        
        {/* Decorative Dashed Curves - Bottom Layer (Behind Image) */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            left: "49px",
            top: "192px",
            width: "468px", 
            height: "317px" 
          }}
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

        {/* Decorative Dashed Curves - Top Layer (Above Image/Title) */}
        <div 
          className="absolute pointer-events-none z-20"
          style={{ 
            left: "49px",
            top: "192px",
            width: "468px", 
            height: "317px" 
          }}
        >
           <svg width="100%" height="100%" viewBox="0 0 672 457" fill="none" className="w-full h-full">
              <path 
                d="M20.7206 298.054C-7.14999 199.203 -25.9867 1.5 121.632 1.5C269.25 1.5 442.624 111.61 510.859 166.664" 
                stroke="#756F3F" strokeWidth="3" strokeDasharray="10 14" 
                className="animate-dash-flow"
              />
              <circle cx="645.649" cy="260.161" r="8.23762" fill="#756F3F"/>
              <circle cx="22.0609" cy="299.702" r="8.23762" fill="#756F3F"/>
              <circle cx="511.376" cy="166.252" r="8.23762" fill="#756F3F"/>
           </svg>
        </div>

        {/* 1. Title */}
        <div 
          className="absolute z-20 pointer-events-none"
          style={{ left: "0px", top: "0px" }}
        >
          <h2 
            className="font-semibold leading-[1.2] tracking-wide"
            style={{ 
              fontSize: "48px", 
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
          className="absolute z-10"
          style={{ left: "100px", top: "20px" }}
        >
          <AnimatePresence mode="wait">
             {slides.map((slide, i) => i === index && (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 14 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -14 }}
                 transition={{ duration: 0.8, ease: "easeInOut" }}
                 className="overflow-hidden shadow-2xl bg-white/50"
                 style={{ 
                   width: "365px", 
                   height: "620px", 
                   borderRadius: "183px" 
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

        {/* 3. Circular Flow Diagram */}
        <div 
          className="absolute"
          style={{ left: "569px", top: "48px", width: "596px", height: "596px" }}
        >
          <div className="absolute inset-0 rounded-full border border-[#756F3F] opacity-30 pointer-events-none" />
          <div className="absolute pointer-events-none" style={{ inset: "50px" }}> 
            <svg width="100%" height="100%" viewBox="0 0 710 710" fill="none">
               <circle 
                 cx="355" cy="355" r="354" 
                 stroke="#756F3F" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" 
                 className="animate-dash-flow"
               />
            </svg>
          </div>

          <div className="relative w-full h-full">
            {visibleSteps.map((step) => {
              let top = 298 
              let left = 50 
              if (step.pos === "top") { left = 122; top = 122; } 
              if (step.pos === "middle") { left = 50; top = 298; }
              if (step.pos === "bottom") { left = 122; top = 474; } 

              return (
                <div 
                  key={step.id} 
                  className="absolute" 
                  style={{ left: left + "px", top: top + "px" }}
                >
                  {step.active ? (
                    <>
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute bg-[#756F3F] rounded-full flex items-center justify-center shadow-xl z-20"
                        style={{ 
                          left: "-25px", 
                          top: "-25px", 
                          width: "50px", 
                          height: "50px" 
                        }}
                      >
                         <svg width="60%" height="60%" viewBox="0 0 40 40" fill="none">
                            <path d="M20 6C15 6 11 10 11 15C11 18.2 12.5 21.1 15 23V28H25V23C27.5 21.1 29 18.2 29 15C29 10 25 6 20 6Z" fill="white" />
                         </svg>
                      </motion.div>
                      
                      <div 
                        className="absolute flex flex-col"
                        style={{ left: "38px", top: "-11px", minWidth: "245px" }} 
                      >
                        <span 
                          className="font-bold text-[#141414] tracking-widest" 
                          style={{ fontSize: "24px", fontFamily: "var(--font-anaheim)" }}
                        >
                          {step.id}. {step.data.title}
                        </span>
                        
                        <AnimatePresence mode="wait">
                           {slides.map((slide, i) => i === index && (
                             <motion.p 
                               key={i}
                               initial={{ opacity: 0, x: -7 }}
                               animate={{ opacity: 1, x: 0 }}
                               exit={{ opacity: 0, x: 7 }}
                               className="font-medium text-[#7A7A7A] leading-[1.4] mt-1"
                               style={{ fontSize: "16px", fontFamily: "var(--font-anaheim)" }}
                             >
                               {slide.description}
                             </motion.p>
                           ))}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={step.onClick}
                      className="absolute group flex items-center"
                      style={{ left: "-17px", top: "-17px", width: "max-content" }} 
                    >
                      <div 
                        className="bg-[#F9F9F5] border border-[#756F3F]/40 group-hover:bg-[#756F3F] group-hover:border-[#756F3F] hover:shadow-md transition-all duration-300 rounded-full flex items-center justify-center z-10 shrink-0"
                        style={{ width: "34px", height: "34px" }} 
                      >
                         {step.pos === 'top' ? (
                           <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#756F3F] group-hover:text-white transition-colors duration-300">
                             <path d="M7 17L17 7M17 7H7M17 7V17" />
                           </svg>
                         ) : (
                           <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#756F3F] group-hover:text-white transition-colors duration-300">
                             <path d="M7 7L17 17M17 17V7M17 17H7" />
                           </svg>
                         )}
                      </div>
                      <div className="ml-3"> 
                        <span 
                          className="font-bold text-[#141414] tracking-widest uppercase transition-colors duration-300 group-hover:text-[#756F3F]" 
                          style={{ fontSize: "20px", fontFamily: "var(--font-anaheim)" }} 
                        >
                          {step.id}. {step.data.title}
                        </span>
                      </div>
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


