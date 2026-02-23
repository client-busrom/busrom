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
      className="relative w-full overflow-hidden flex flex-col items-center bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: `${SECTION_HEIGHT * 0.7}px` }}
    >
      {/* 1. Background Layer (Full Width - Outside Scale Container) */}
      <div className="absolute inset-0 z-0">
         {bgImage ? (
           <OptimizedImage image={bgImage} alt="Background" className="w-full h-full object-cover" size="xlarge" />
         ) : (
           <img src="/api/media/factory-bg.jpg" alt="Background" className="w-full h-full object-cover" />
         )}
         
         {/* Rectangle 311: Full-width Blur Overlay */}
         <div 
           className="absolute inset-0 z-10"
           style={{ 
             backgroundColor: "rgba(86, 76, 0, 0.5)", // #564C00 @ 50%
             backdropFilter: "blur(10px)",
             WebkitBackdropFilter: "blur(10px)"
           }}
         />
      </div>

      {/* 2. Content Container (Scaled Content) */}
      <div 
        className="relative flex-shrink-0 origin-top z-20"
        style={{ 
          width: `${SECTION_WIDTH}px`, 
          height: `${SECTION_HEIGHT}px`,
          transform: "scale(0.7)",
          marginBottom: `calc(${SECTION_HEIGHT}px * -0.3)`
        }}
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="absolute text-[96px] font-extrabold text-white leading-[102px] tracking-tighter"
          style={{ 
            left: `${LEFT_MARGIN}px`, 
            top: `${getItemY(10979)}px`,
            width: "787px",
            fontFamily: "var(--font-anaheim)"
          }}
          dangerouslySetInnerHTML={{ __html: (title || "Why Contractors<br />Trust Us?").replace(/\n/g, '<br />') }}
        />

        {/* Accordion List */}
        <div className="absolute" style={{ left: `${LEFT_MARGIN}px`, top: `${getItemY(11282)}px`, width: "767px" }}>
            {displayItems.slice(0, 6).map((item, i) => {
                const isActive = activeIndex === i
                return (
                    <div key={i} className="mb-8 group">
                        <button 
                            onClick={() => setActiveIndex(i)}
                            className="w-[738px] flex justify-between items-center text-left py-4 transition-all"
                        >
                            <h4 
                                className={`text-[32px] font-bold leading-tight transition-colors duration-300 ${isActive ? 'text-[#FFF28E]' : 'text-white/60 group-hover:text-white'}`}
                                style={{ fontFamily: "var(--font-anaheim)" }}
                            >
                                {item.title}
                            </h4>
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? 'border-[#FFF28E] bg-[#FFF28E] text-black rotate-180' : 'border-white/20 text-white'}`}>
                                {isActive ? <Minus className="w-6 h-6" strokeWidth={3} /> : <Plus className="w-6 h-6" strokeWidth={3} />}
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
                                    <p className="text-[28px] font-semibold text-white/80 leading-[44px] pb-8 pr-12" style={{ fontFamily: "var(--font-anaheim)" }}>
                                        {item.description || item.summary}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className={`w-[738px] h-[1px] transition-colors duration-300 ${isActive ? 'bg-[#FFF28E]/50' : 'bg-white/10'}`} />
                    </div>
                )
            })}
        </div>

        {/* Collage Photo Wall */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Rectangle 298 */}
            <motion.div 
                animate={{ rotate: 2.19 }}
                className="absolute shadow-2xl rounded-[54px] overflow-hidden border-4 border-white/10"
                style={{ left: "1097px", top: `${getItemY(10911)}px`, width: "356px", height: "261px" }}
            >
                {getImage(0) ? <OptimizedImage image={getImage(0)} alt="D1" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>

            {/* Rectangle 297 */}
            <motion.div 
                animate={{ rotate: 8.15 }}
                className="absolute shadow-2xl rounded-[54px] overflow-hidden border-4 border-white/10"
                style={{ left: "1398px", top: `${getItemY(11091)}px`, width: "500px", height: "679px" }}
            >
                {getImage(1) ? <OptimizedImage image={getImage(1)} alt="D2" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>

            {/* Rectangle 299 */}
            <motion.div 
                animate={{ rotate: -20.86 }}
                className="absolute shadow-2xl rounded-[54px] overflow-hidden border-4 border-white/10"
                style={{ left: "970px", top: `${getItemY(11445)}px`, width: "340px", height: "400px" }}
            >
                {getImage(2) ? <OptimizedImage image={getImage(2)} alt="D3" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>

            {/* Rectangle 306 */}
            <motion.div 
                animate={{ rotate: -5.5 }}
                className="absolute shadow-2xl rounded-[54px] overflow-hidden border-4 border-white/10"
                style={{ left: "1302px", top: `${getItemY(11807)}px`, width: "372px", height: "375px" }}
            >
                {getImage(3) ? <OptimizedImage image={getImage(3)} alt="D4" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
            </motion.div>
        </div>
      </div>
    </section>
  )
}
