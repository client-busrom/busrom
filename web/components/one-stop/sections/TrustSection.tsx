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
      className="relative w-full overflow-hidden flex flex-col items-center bg-black py-16 lg:py-0 lg:min-h-[850px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
         {bgImage && (
           <OptimizedImage image={bgImage} alt="Background" className="w-full h-full object-cover opacity-70" size="xlarge" />
         )}
         <div 
           className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[8px]"
         />
      </div>

      {/* 2. Content Container - Centered Rail */}
      <div className="relative z-20 w-full max-w-[1536px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between px-6 lg:pl-[112px] lg:pr-[80px] gap-12 lg:gap-0 lg:pt-[100px] h-full">
        
        {/* Left Column: Title & Accordion */}
        <div className="w-full lg:w-[629.6px] shrink-0">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[32px] lg:text-[60px] font-extrabold text-white leading-tight lg:leading-[70px] tracking-[0.05em] mb-8 lg:mb-12 text-center lg:text-left"
            style={{ fontFamily: "var(--font-anaheim)" }}
            dangerouslySetInnerHTML={{ __html: (title || "Why Contractors<br />Trust Us?").replace(/\n/g, '<br />') }}
          />

          <div className="w-full lg:max-w-[640px] mx-auto lg:mx-0">
              {displayItems.slice(0, 6).map((item, i) => {
                  const isActive = activeIndex === i
                  return (
                      <div key={i} className="mb-6 lg:mb-8 group border-b border-white/10">
                          <button 
                              onClick={() => setActiveIndex(i)}
                              className="w-full flex justify-between items-center text-left py-4 transition-all"
                          >
                              <h4 
                                  className={`text-[18px] lg:text-[24px] font-bold leading-tight transition-colors duration-300 ${isActive ? 'text-[#FFF28E]' : 'text-white/60 group-hover:text-white'}`}
                                  style={{ fontFamily: "var(--font-anaheim)" }}
                              >
                                  {item.title}
                              </h4>
                              <div className={`w-8 h-8 lg:w-[48px] lg:h-[48px] rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${isActive ? 'border-[#FFF28E] bg-[#FFF28E] text-black rotate-180' : 'border-white/20 text-white'}`}>
                                  {isActive ? <Minus className="w-4 h-4 lg:w-[24px] lg:h-[24px]" strokeWidth={3} /> : <Plus className="w-4 h-4 lg:w-[24px] lg:h-[24px]" strokeWidth={3} />}
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
                                      <p className="text-[16px] lg:text-[20px] font-semibold text-white/80 leading-relaxed lg:leading-[32px] pb-8 lg:pr-[180px]" style={{ fontFamily: "var(--font-anaheim)" }}>
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

        {/* Right Column: Scatter Images */}
        <div className="relative w-full lg:w-auto h-[450px] lg:h-full lg:flex-grow flex items-center justify-center lg:block min-h-[750px] lg:min-h-[900px]">
            {/* Image 1 - top scatter (Pencil: image1) */}
            <motion.div 
                initial={{ rotate: 2.19 }}
                animate={{ 
                    y: [0, -15]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                className="absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-30 lg:left-[135px] lg:top-[40px]"
                style={{ 
                  left: "calc(50% - 200px)",
                  top: "20px",
                }}
            >
                <div className="w-[180px] h-[124px] lg:w-[235px] lg:h-[162px]">
                    {getImage(0) ? <OptimizedImage image={getImage(0)} alt="image1" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 2 - Main Large Image (Pencil: image2) */}
            <motion.div 
                initial={{ rotate: 8.15 }}
                animate={{ 
                    y: [0, 15]
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.5
                }}
                className="absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-0 lg:left-[333px] lg:top-[152px]"
                style={{ 
                  left: "calc(50% - 60px)",
                  top: "180px",
                }}
            >
                <div className="w-[220px] h-[280px] lg:w-[331px] lg:h-[425px]">
                    {getImage(1) ? <OptimizedImage image={getImage(1)} alt="image2" className="w-full h-full object-cover" size="large" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 3 - mid left scatter (Pencil: image3) */}
            <motion.div 
                initial={{ rotate: -20.86 }}
                animate={{ 
                    y: [0, -20]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 1
                }}
                className="hidden lg:block absolute shadow-2xl rounded-[40px] lg:rounded-[54px] overflow-hidden z-20"
                style={{ 
                  left: "50px", 
                  top: "372px"
                }}
            >
                <div className="w-[229px] h-[258px]">
                    {getImage(2) ? <OptimizedImage image={getImage(2)} alt="image3" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>

            {/* Image 4 - bottom scatter (Pencil: image4) */}
            <motion.div 
                initial={{ rotate: -5.5 }}
                animate={{ 
                    y: [0, 10]
                }}
                transition={{
                    duration: 2.25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.2
                }}
                className="hidden lg:block absolute shadow-2xl rounded-[30px] lg:rounded-[54px] overflow-hidden z-10"
                style={{ 
                  left: "268px", 
                  top: "597px"
                }}
            >
                <div className="w-[245px] h-[234px]">
                    {getImage(3) ? <OptimizedImage image={getImage(3)} alt="image4" className="w-full h-full object-cover" size="small" /> : <div className="w-full h-full bg-white/10" />}
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  )
}
