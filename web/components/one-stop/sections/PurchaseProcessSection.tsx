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

/**
 * PurchaseProcessSection - How to make one-stop purchases
 */
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

  // Calculate the 3 items to show on the circular path
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
    <section className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-center" style={{ height: "922px" }}>
      
      {/* 70% Scale Container to match other sections */}
      <div 
        className="relative w-[1920px] h-[922px] origin-center flex-shrink-0"
        style={{ transform: "scale(0.7)" }}
      >
        
        {/* Decorative Dashed Curves */}
        <div className="absolute left-[399px] top-[275px] w-[668px] h-[453px] pointer-events-none z-20">
           <svg width="668" height="453" viewBox="0 0 672 457" fill="none" className="w-full h-full">
              <path 
                d="M20.7206 298.054C-7.14999 199.203 -25.9867 1.5 121.632 1.5C269.25 1.5 442.624 111.61 510.859 166.664" 
                stroke="#756F3F" strokeWidth="3" strokeDasharray="10 14" 
              />
              <path 
                d="M477.085 415.852C567.699 467.2 728.744 508.855 648.016 264.692" 
                stroke="#756F3F" strokeWidth="3" strokeDasharray="10 14" 
              />
              <circle cx="645.649" cy="260.161" r="8.23762" fill="#756F3F"/>
              <circle cx="22.0609" cy="299.702" r="8.23762" fill="#756F3F"/>
              <circle cx="475.954" cy="415.029" r="8.23762" fill="#756F3F"/>
              <circle cx="511.376" cy="166.252" r="8.23762" fill="#756F3F"/>
           </svg>
        </div>

        {/* 1. Title (Top Left) */}
        <div className="absolute left-[329px] top-[140px] z-20 pointer-events-none">
          <h2 
            className="text-[64px] font-bold leading-[1.2] tracking-wide"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || '<span class="text-[#A5A075]">How To Make</span><br /><span class="text-[#656030]">One-Stop<br />Purchases</span>').replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 2. Central Image (Capsule shape) - Optimized Variant */}
        <div className="absolute left-[472px] top-[69px] z-10">
          <AnimatePresence mode="wait">
             {slides.map((slide, i) => i === index && (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.8, ease: "easeInOut" }}
                 className="w-[522px] h-[852px] rounded-full overflow-hidden shadow-2xl bg-white/50"
               >
                  <OptimizedImage 
                    image={slide.image} 
                    size="small"
                    className="w-full h-full"
                    objectFit="cover"
                  />
               </motion.div>
             ))}
          </AnimatePresence>
        </div>

        {/* 3. Circular Flow Diagram (Right) */}
        <div className="absolute left-[1141px] top-[68px] w-[852px] h-[852px]">
          <div className="absolute inset-0 rounded-full border border-[#756F3F] opacity-30 pointer-events-none" />
          <div className="absolute inset-[71px] pointer-events-none">
            <svg width="710" height="710" viewBox="0 0 710 710" fill="none">
               <circle cx="355" cy="355" r="354" stroke="#756F3F" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
            </svg>
          </div>

          <div className="relative w-full h-full">
            {visibleSteps.map((step) => {
              let top = 426
              let left = 71
              if (step.pos === "top") { left = 175; top = 175; }
              if (step.pos === "middle") { left = 71; top = 426; }
              if (step.pos === "bottom") { left = 175; top = 677; }

              return (
                <div key={step.id} className="absolute" style={{ left, top }}>
                  {step.active ? (
                    <>
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -left-[36px] -top-[36px] w-[72px] h-[72px] bg-[#756F3F] rounded-full flex items-center justify-center shadow-xl z-20"
                      >
                         <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                            <path d="M20 6C15 6 11 10 11 15C11 18.2 12.5 21.1 15 23V28H25V23C27.5 21.1 29 18.2 29 15C29 10 25 6 20 6Z" fill="white" />
                         </svg>
                      </motion.div>
                      
                      <div className="absolute left-[54px] -top-[16px] flex flex-col min-w-[350px]">
                        <span className="text-[26px] font-bold text-[#141414] tracking-widest" style={{ fontFamily: "var(--font-anaheim)" }}>
                          {step.id}. {step.data.title}
                        </span>
                        
                        <AnimatePresence mode="wait">
                           {slides.map((slide, i) => i === index && (
                             <motion.p 
                               key={i}
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               exit={{ opacity: 0, x: 10 }}
                               className="text-[20px] font-medium text-[#7A7A7A] leading-[1.4] mt-1"
                               style={{ fontFamily: "var(--font-anaheim)" }}
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
                      style={{ left: -24, top: -24, width: "max-content" }}
                    >
                      <div className="w-[48px] h-[48px] bg-[#F9F9F5] border border-[#756F3F]/40 hover:border-[#756F3F] hover:shadow-md transition-all duration-300 rounded-full flex items-center justify-center z-10 shrink-0">
                         {step.pos === 'top' ? (
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#756F3F" strokeWidth="2.5">
                             <path d="M7 17L17 7M17 7H7M17 7V17" />
                           </svg>
                         ) : (
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#756F3F" strokeWidth="2.5">
                             <path d="M7 7L17 17M17 17V7M17 17H7" />
                           </svg>
                         )}
                      </div>
                      <div className="ml-4">
                        <span className="text-[24px] font-bold text-[#141414] tracking-widest uppercase" style={{ fontFamily: "var(--font-anaheim)" }}>
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
