"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface BrandHighlightItem {
  id: string
  image: any
  description: string
  summary: string
}

interface BrandHighlightsSectionProps {
  items: BrandHighlightItem[]
  titleLine1?: string // "Brand"
  titleLine2?: string // "Highlights"
}

export function BrandHighlightsSection({ 
  items, 
  titleLine1 = "Brand", 
  titleLine2 = "Highlights" 
}: BrandHighlightsSectionProps) {
  const [[index, direction], setIndex] = useState([0, 0])

  const total = items.length
  const nextIndex = (index + 1) % total
  const prevIndex = (index - 1 + total) % total

  const handleNext = () => {
    setIndex([nextIndex, 1])
  }

  const handlePrev = () => {
    setIndex([prevIndex, -1])
  }

  if (!items || items.length === 0) return null

  const currentItem = items[index]
  const previewItem = items[nextIndex]

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-[120px] pb-[80px] md:h-[62.79vw] xl:h-[1205.7px]">
      
      {/* 1. DESKTOP/TABLET CONTENT (Visible on MD and above) */}
      <div className="hidden md:block relative w-full max-w-[1536px] mx-auto aspect-[1344/845] h-[50.3vw] xl:h-[965.7px] shrink-0">
        
        {/* Decorative Ellipses (Animated) */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[42.7%] top-0 w-[26.2%] aspect-square rounded-full bg-[#EBE8D8] opacity-[0.31]"
        />
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[15.5%] top-[55.8%] w-[10.1%] aspect-square rounded-full bg-[#ECE8D8]"
        />

        {/* 1. Section Title */}
        <div className="absolute left-[5.96%] top-[9.45%] flex flex-col">
          <h2 
            className="text-[6.66vw] xl:text-[102.4px] font-[800] leading-[0.74]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              color: "#F6F4ED",
              WebkitTextStroke: "4px #756F3F",
              paintOrder: "stroke fill",
              marginBottom: "10px"
            }}
            dangerouslySetInnerHTML={{ __html: (titleLine1 || "").replace(/\n/g, '<br />') }}
          />
          <h2 
            className="text-[5vw] xl:text-[76.8px] font-[800] leading-[1.09] text-black"
            style={{ fontFamily: "var(--font-anaheim)" }}
          >
            {titleLine2}
          </h2>
        </div>

        {/* 2. Main Description */}
        <div className="absolute left-[5.96%] top-[36%] w-[42.6%] h-[21%]">
          <AnimatePresence mode="wait">
            {items.map((item, i) => i === index && (
              <motion.p 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-[1.25vw] xl:text-[19.2px] font-[600] leading-[1.6] text-black"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {item.description}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* 3. Navigation Buttons */}
        <div className="absolute left-[40.6%] top-[92%] flex gap-8 z-30">
           {/* Prev */}
           <button 
             onClick={handlePrev}
             className="w-[5.4vw] h-[5.4vw] xl:w-[83.2px] xl:h-[83.2px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95 group"
           >
              <svg width="40%" height="40%" viewBox="0 0 23 40" fill="none">
                <path d="M21 2L2 20L21 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </button>
           {/* Next */}
           <button 
             onClick={handleNext}
             className="w-[5.4vw] h-[5.4vw] xl:w-[83.2px] xl:h-[83.2px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95 group"
           >
              <svg width="40%" height="40%" viewBox="0 0 23 40" fill="none">
                <path d="M2 2L21 20L2 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </button>
        </div>

        {/* 4. Large Main Image (Right Side) */}
        <div className="absolute left-[59%] top-[11.7%] w-[40.4%] h-[88.3%] z-10 pointer-events-none">
          <AnimatePresence mode="popLayout" custom={direction}>
            {items.map((item, i) => i === index && (
              <motion.div
                key={item.id}
                initial={direction === 1 ? {
                  x: "-70%",
                  y: "50%",
                  scale: 0.36,
                  opacity: 1
                } : { opacity: 0, x: 100 }}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                exit={direction === 1 ? { opacity: 0, scale: 1.1 } : {
                  x: "-70%",
                  y: "50%",
                  scale: 0.36,
                  opacity: 0
                }}
                transition={{ 
                  duration: 0.9, 
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.4 }
                }}
                className="w-full h-full rounded-[2vw] xl:rounded-[34.2px] overflow-hidden shadow-2xl"
              >
                <OptimizedImage 
                  image={item.image} 
                  alt="Highlight Main" 
                  className="w-full h-full object-cover"
                  size="large"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 5. Thumbnail Preview Group (Bottom Left) */}
        <div className="absolute left-[5.96%] top-[66%] w-[14.7%] flex flex-col gap-[10%] z-20">
           {/* Thumbnail Image */}
           <div className="w-full aspect-[282/375] rounded-[1.5vw] xl:rounded-[22.8px] overflow-hidden shadow-xl">
             <AnimatePresence mode="popLayout">
                {items.map((item, i) => i === nextIndex && (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <OptimizedImage 
                      image={item.image} 
                      alt="Next Preview" 
                      className="w-full h-full object-cover"
                      size="small"
                    />
                  </motion.div>
                ))}
             </AnimatePresence>
           </div>
           
           {/* Thumbnail Text Summary */}
           <div className="mt-4">
             <AnimatePresence mode="wait">
                {items.map((item, i) => i === nextIndex && (
                  <motion.p 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-[1.1vw] xl:text-[16px] font-[600] leading-[1.3] text-[#626262] line-clamp-2"
                    style={{ fontFamily: "var(--font-anaheim)" }}
                  >
                    {item.summary}
                  </motion.p>
                ))}
             </AnimatePresence>
           </div>
        </div>

      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-6 w-full flex flex-col gap-6 mt-12">
         <div className="flex flex-col">
           <h2 
             className="text-3xl font-bold" 
             style={{ color: "#F6F4ED", WebkitTextStroke: "1px #756F3F", paintOrder: "stroke fill" }}
             dangerouslySetInnerHTML={{ __html: (titleLine1 || "").replace(/\n/g, '<br />') }}
           />
           <h2 
             className="text-4xl font-bold text-black"
             dangerouslySetInnerHTML={{ __html: (titleLine2 || "").replace(/\n/g, '<br />') }}
           />
         </div>
         <p className="text-base text-gray-700 leading-relaxed font-semibold">{currentItem.description}</p>
         <div className="relative w-full max-w-[320px] mx-auto aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
           <AnimatePresence mode="wait">
             <motion.div
               key={index}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="w-full h-full"
             >
               <OptimizedImage image={currentItem.image} alt="Mobile Main" className="w-full h-full object-cover" />
             </motion.div>
           </AnimatePresence>
         </div>
         
         {/* Centered Buttons */}
         <div className="flex justify-center items-center gap-8 pt-4">
           <button 
             onClick={handlePrev} 
             className="w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] active:bg-[#756F3F] active:text-white transition-all shadow-sm"
           >
             <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
               <path d="M8 2L2 8L8 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
           <button 
             onClick={handleNext} 
             className="w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] active:bg-[#756F3F] active:text-white transition-all shadow-sm"
           >
             <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
               <path d="M2 2L8 8L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
         </div>
      </div>
    </section>
  )
}
