"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface TrustSectionProps {
  title?: string
  items?: any[]
  images?: any[]
  bgImage?: any
}

export function TrustSection({ title, items, images = [], bgImage }: TrustSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const SECTION_WIDTH = 1920
  const SECTION_HEIGHT = 1485
  const LEFT_MARGIN = 182
  
  const defaultItems = [
    { title: "One-stop Full-range Supply", description: "Cover all parts of hardware, saving coordination costs" },
    { title: "Customize It Your Way", description: "Flexible manufacturing capabilities for your unique designs" },
    { title: "Consistent Finished Appearance", description: "Unified surface treatment across all components" },
    { title: "Professional Engineer Technical Support", description: "Expert CAD reviews and architectural consulting" },
    { title: "Fast Response", description: "Quick quote turnaround and dedicated support team" },
    { title: "Rapid After-Sales Service & Spare Parts Support", description: "Global logistics for maintenance and replacements" }
  ]

  const displayItems = items && items.length > 0 ? items : defaultItems

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, displayItems.length])

  const getImage = (index: number) => {
    if (!images[index]) return null
    return images[index].image || images[index]
  }

  const getItemY = (globalY: number) => globalY - 10783

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center bg-black py-16 md:py-0 md:min-h-[850px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
         {bgImage && (
           <OptimizedImage image={bgImage} alt="Background" className="w-full h-full object-cover" size="xlarge" />
         )}
         <div 
           className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[10px]"
         />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-20 w-full flex flex-col md:flex-row items-center md:items-start justify-between px-10 md:pl-[140px] md:pr-[100px] gap-12 md:gap-0 md:pt-[100px]">
        
        {/* Left Column: Title & Accordion */}
        <div className="w-full md:w-[787px] shrink-0">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[96px] font-extrabold text-white leading-tight md:leading-[102px] tracking-tighter mb-8 md:mb-12 text-center md:text-left"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "Why Contractors<br />Trust Us?").replace(/\n/g, '<br />') }}
          />

          <div className="w-full max-w-[767px] mx-auto md:mx-0">
              {displayItems.slice(0, 6).map((item, i) => {
                  const isActive = activeIndex === i
                  return (
                      <div key={i} className="mb-6 md:mb-8 group border-b border-white/10">
                          <button 
                              onClick={() => setActiveIndex(i)}
                              className="w-full flex justify-between items-center text-left py-4 transition-all"
                          >
                              <h4 
                                  className={`text-[18px] md:text-[32px] font-bold leading-tight transition-colors duration-300 ${isActive ? 'text-[#FFF28E]' : 'text-white/60 group-hover:text-white'}`}
                                  style={{ fontFamily: "var(--font-anaheim)" }}
                              >
                                  {item.title}
                              </h4>
                              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${isActive ? 'border-[#FFF28E] bg-[#FFF28E] text-black rotate-180' : 'border-white/20 text-white'}`}>
                                  {isActive ? <Minus className="w-4 h-4 md:w-6 md:h-6" strokeWidth={3} /> : <Plus className="w-4 h-4 md:w-6 md:h-6" strokeWidth={3} />}
                              </div>
                          </button>

                          <AnimatePresence initial={false}>
                              {isActive && (
                                  <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.4 }}
                                      className="overflow-hidden"
                                  >
                                      <p className="text-[16px] md:text-[28px] font-semibold text-white/80 leading-relaxed md:leading-[44px] pb-8 md:pr-12" style={{ fontFamily: "var(--font-anaheim)" }}>
                                          {item.description || item.summary}
                                      </p>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>
                  )
              })}
          </div>
        </div>

        {/* Right Column: Dynamic Images Scatter - Adjust for mobile */}
        <div className="relative w-full md:w-auto h-[400px] md:h-full md:flex-grow flex items-center justify-center md:block">
            {/* Image 1 */}
            <motion.div 
                animate={{ rotate: 2.19 }}
                className="absolute shadow-2xl rounded-[30px] md:rounded-[54px] overflow-hidden border-2 md:border-4 border-white/10 z-30"
                style={{ 
                  left: typeof window !== 'undefined' && window.innerWidth < 768 ? "10%" : "200px", 
                  top: typeof window !== 'undefined' && window.innerWidth < 768 ? "20px" : "150px", 
                  width: typeof window !== 'undefined' && window.innerWidth < 768 ? "180px" : "356px", 
                  height: typeof window !== 'undefined' && window.innerWidth < 768 ? "130px" : "261px" 
                }}
            >
                {getImage(0) ? <OptimizedImage image={getImage(0)} alt="D1" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>

            {/* Image 2 - Main Large Image */}
            <motion.div 
                animate={{ rotate: 8.15 }}
                className="absolute shadow-2xl rounded-[30px] md:rounded-[54px] overflow-hidden border-2 md:border-4 border-white/10 z-20"
                style={{ 
                  right: typeof window !== 'undefined' && window.innerWidth < 768 ? "5%" : "20px", 
                  top: typeof window !== 'undefined' && window.innerWidth < 768 ? "80px" : "300px", 
                  width: typeof window !== 'undefined' && window.innerWidth < 768 ? "220px" : "500px", 
                  height: typeof window !== 'undefined' && window.innerWidth < 768 ? "300px" : "679px" 
                }}
            >
                {getImage(1) ? <OptimizedImage image={getImage(1)} alt="D2" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>

            {/* Hidden secondary images on small mobile to avoid chaos */}
            <motion.div 
                animate={{ rotate: -20.86 }}
                className="hidden md:block absolute shadow-2xl rounded-[54px] overflow-hidden border-4 border-white/10 z-10"
                style={{ right: "150px", bottom: "100px", width: "340px", height: "400px" }}
            >
                {getImage(2) ? <OptimizedImage image={getImage(2)} alt="D3" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>
        </div>
      </div>
    </section>
  )
}
