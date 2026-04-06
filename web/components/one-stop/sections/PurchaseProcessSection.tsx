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
      className="relative w-full overflow-hidden bg-transparent flex justify-center items-center py-12 lg:py-0 lg:h-[48vw]" 
    >
      <div className="relative w-full lg:w-[75.2vw] h-auto lg:h-[35vw] flex flex-col lg:block items-center px-10 lg:px-0 mx-auto">
        
        {/* Decorative Dashed Curves - Bottom Layer - PROPORTIONAL */}
        <div 
          className="hidden lg:block absolute pointer-events-none z-0"
          style={{ left: vw(189), top: vw(192), width: vw(468), height: vw(317) }}
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

        {/* Decorative Dashed Curves - TOP Layer - PROPORTIONAL */}
        <div 
          className="hidden lg:block absolute pointer-events-none z-20"
          style={{ left: vw(189), top: vw(192), width: vw(468), height: vw(317) }}
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

        {/* === MOBILE ONLY CONTENT (< 1024px) === */}
        <div className="flex lg:hidden flex-col w-full px-6 gap-12">
            {/* Header */}
            <div className="w-full text-center">
              <h2 
                className="text-[32px] font-extrabold leading-tight text-[#78713A] tracking-[0.05em] mb-4"
                style={{ 
                  fontFamily: "var(--font-anaheim)",
                  background: "linear-gradient(135deg, #756F3F 40%, rgba(117, 111, 63, 0.35) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
                dangerouslySetInnerHTML={{ __html: (title || 'How To Make<br />One-Stop Purchases').replace(/\n/g, '<br />') }}
              />
              <div className="w-16 h-1 bg-[#756F3F] mx-auto rounded-full opacity-60" />
            </div>

            {/* Steps Grid - Direct List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
              {slides.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-5 group">
                  {/* Step Image */}
                  <div className="w-full h-[220px] sm:h-[180px] rounded-[30px] overflow-hidden shadow-lg border-2 border-transparent group-hover:border-[#756F3F]/20 transition-all">
                     <OptimizedImage 
                        image={step.image}
                        size="medium"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={`Step ${idx + 1}`}
                      />
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex flex-col gap-2 px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[18px] font-bold text-[#756F3F]/40" style={{ fontFamily: "var(--font-anaheim)" }}>
                        0{idx + 1}
                      </span>
                      <h4 className="text-[20px] font-bold text-[#141414] tracking-wider" style={{ fontFamily: "var(--font-anaheim)" }}>
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-[15px] font-medium text-[#7A7A7A] leading-relaxed text-left" style={{ fontFamily: "var(--font-anaheim)" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* 1. Title - Fluid & Aligned */}
        <div 
          className="hidden lg:block relative lg:absolute z-30 lg:pointer-events-none mb-10 lg:mb-0 text-center lg:text-left"
          style={{ left: vw(140), top: "0px" }}
        >
          <h2 
            className="font-semibold tracking-wide text-[32px] lg:text-[2.5vw] lg:leading-[1.2]"
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

        {/* 2. Central Image (Capsule) - DESKTOP ONLY */}
        <div 
          className="hidden lg:block absolute z-10"
          style={{ left: vw(240), top: vw(20), perspective: "1200px" }}
        >
          <AnimatePresence mode="wait">
             {slides.map((slide, i) => i === index && (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, rotateY: 90 }}
                 animate={{ opacity: 1, rotateY: 0 }}
                 exit={{ opacity: 0, rotateY: -90 }}
                 transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                 className="overflow-hidden shadow-2xl bg-white/50"
                 style={{ 
                   width: vw(365), 
                   height: vw(620), 
                   borderRadius: vw(183),
                   backfaceVisibility: "hidden"
                 }}
               >
                  <OptimizedImage 
                    image={slide.image} 
                    size="large"
                    className="w-full h-full object-cover"
                    alt={`Step ${i}`}
                  />
               </motion.div>
             ))}
          </AnimatePresence>
        </div>

        {/* 3. Circular Flow Diagram - DESKTOP ONLY */}
        <div 
          className="hidden lg:block absolute w-[596px] h-[31.1vw]"
          style={{ 
            left: vw(709), 
            top: vw(48), 
            width: vw(596) 
          }}
        >
          {/* SOLID OUTER RING */}
          <div className="absolute inset-0 rounded-full border border-[#756F3F] opacity-30 pointer-events-none" />
          
          {/* SMALL DASHED INNER RING */}
          <div className="absolute pointer-events-none z-0" style={{ inset: vw(60) }}> 
            <svg width="100%" height="100%" viewBox="0 0 710 710" fill="none" className="rotate-infinite">
               <circle 
                 cx="355" cy="355" r="350" 
                 stroke="#756F3F" strokeWidth="2.5" strokeDasharray="12 16" opacity="0.45" 
                 className="animate-dash-flow"
               />
            </svg>
          </div>

          <div className="relative block">
            {visibleSteps.map((step) => {
              let top = 298 
              let left = 60 
              if (step.pos === "top") { left = 120; top = 110; } 
              if (step.pos === "middle") { left = 70; top = 280; }
              if (step.pos === "bottom") { left = 120; top = 460; } 

              return (
                <div 
                  key={step.id} 
                  className="absolute" 
                  style={{ 
                    left: vw(left), 
                    top: vw(top) 
                  }}
                >
                  {step.active ? (
                    <div className="flex flex-col items-start relative">
                        <motion.div 
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex absolute bg-[#756F3F] rounded-full items-center justify-center shadow-xl z-20"
                          style={{ 
                            left: vw(-32), 
                            top: vw(-5), 
                            width: vw(48), 
                            height: vw(48) 
                          }}
                        >
                           <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2C10.9 2 10 2.9 10 4V6H7C5.9 6 5 6.9 5 8V11C5 12.1 5.9 13 7 13H17C18.1 13 19 12.1 19 11V8C19 6.9 18.1 6 17 6H14V4C14 2.9 13.1 2 12 2Z" fill="white" />
                               <rect x="7" y="14" width="10" height="8" rx="1" fill="white" />
                           </svg>
                        </motion.div>

                      <div className="flex items-center gap-4 mb-2 pl-[1.7vw]">
                        <span 
                          className="font-bold text-[#141414] tracking-widest lg:text-[1.46vw]" 
                          style={{ fontFamily: "var(--font-anaheim)" }}
                        >
                          {step.id}. {step.data.title}
                        </span>
                      </div>
                      <div className="pl-[1.7vw]">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, x: -7 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-medium text-[#7A7A7A] leading-[1.6] text-left max-w-[16.6vw]"
                            style={{ fontSize: vw(16), fontFamily: "var(--font-anaheim)" }}
                          >
                            {step.data.description}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={step.onClick}
                      className="group flex items-center justify-start gap-4 transition-opacity duration-300 opacity-100"
                    >
                      <div 
                        className="bg-white border border-[#756F3F]/40 group-hover:bg-[#756F3F] group-hover:border-[#756F3F] rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                        style={{ 
                          width: vw(34), 
                          height: vw(34) 
                        }} 
                      >
                         <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#756F3F] group-hover:text-white transition-colors duration-300">
                           <path d={step.pos === 'top' ? "M7 17L17 7M17 7H7M17 7V17" : "M7 7L17 17M17 17V7M17 17H7"} />
                         </svg>
                      </div>
                      <span 
                        className="font-bold text-[#141414] tracking-widest uppercase transition-colors duration-300 group-hover:text-[#756F3F] text-[1.15vw]" 
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
