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

  // 计算从缩略图到主图的偏移量 (x = 153 - 1171, y = 746 - 141)
  const flyOffsetX = -1018
  const flyOffsetY = 605
  const flyScale = 282 / 777 // 0.363

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center pt-[120px] pb-[200px]">
      
      {/* 70% Scale Container */}
      <div className="relative w-[1920px] h-[1207px] origin-top flex flex-col flex-shrink-0" 
        style={{ 
          transform: "scale(0.7)",
          marginBottom: "-362px" 
        }}
      >
        
        {/* Decorative Ellipses */}
        <div 
          className="absolute left-[859px] top-[0px] w-[503px] h-[503px] rounded-full bg-[#EBE8D8] opacity-[0.31]"
        />
        <div 
          className="absolute left-[337px] top-[674px] w-[195px] h-[195px] rounded-full bg-[#ECE8D8]"
        />

        {/* 1. Section Title */}
        <div className="absolute left-[153px] top-[114px] flex flex-col">
          <h2 
            className="text-[128px] font-[800] leading-[0.74]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              color: "#F6F4ED",
              WebkitTextStroke: "2px #756F3F",
              paintOrder: "stroke fill",
              marginBottom: "10px"
            }}
            dangerouslySetInnerHTML={{ __html: (titleLine1 || "").replace(/\n/g, '<br />') }}
          />
          <h2 
            className="text-[96px] font-[800] leading-[1.09] text-black"
            style={{ fontFamily: "var(--font-anaheim)" }}
          >
            {titleLine2}
          </h2>
        </div>

        {/* 2. Main Description */}
        <div className="absolute left-[153px] top-[376px] w-[819px] h-[253px]">
          <AnimatePresence mode="wait">
            {items.map((item, i) => i === index && (
              <motion.p 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-[24px] font-[600] leading-[39px] text-black"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {item.description}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* 3. Navigation Buttons */}
        <div className="absolute left-[819px] top-[1049px] flex gap-[46px] z-30">
           {/* Prev */}
           <button 
             onClick={handlePrev}
             className="w-[104px] h-[104px] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white hover:scale-110 transition-all active:scale-95"
           >
              <svg width="23" height="40" viewBox="0 0 23 40" fill="none">
                <path d="M21 2L2 20L21 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </button>
           {/* Next */}
           <button 
             onClick={handleNext}
             className="w-[104px] h-[104px] rounded-full bg-[#756F3F] flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
           >
              <svg width="23" height="40" viewBox="0 0 23 40" fill="none">
                <path d="M2 2L21 20L2 38" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </button>
        </div>

        {/* 4. Large Main Image (Right Side) */}
        <div className="absolute left-[1171px] top-[141px] w-[777px] h-[1066px] z-10 pointer-events-none">
          <AnimatePresence mode="popLayout" custom={direction}>
            {items.map((item, i) => i === index && (
              <motion.div
                key={item.id}
                initial={direction === 1 ? {
                  x: flyOffsetX,
                  y: flyOffsetY,
                  scale: flyScale,
                  opacity: 1
                } : { opacity: 0, x: 100 }}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                exit={direction === 1 ? { opacity: 0, scale: 1.1 } : {
                  x: flyOffsetX,
                  y: flyOffsetY,
                  scale: flyScale,
                  opacity: 0.5
                }}
                transition={{ 
                  duration: 0.9, 
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.4 }
                }}
                className="w-full h-full rounded-[30px] overflow-hidden shadow-2xl"
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
        <div className="absolute left-[153px] top-[746px] w-[282px] flex flex-col gap-[32px] z-20">
           {/* Thumbnail Image */}
           <div className="w-[282px] h-[375px] rounded-[30px] overflow-hidden shadow-xl">
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
           <div className="h-[52px]">
             <AnimatePresence mode="wait">
                {items.map((item, i) => i === nextIndex && (
                  <motion.p 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-[20px] font-[600] leading-[26px] text-[#626262] line-clamp-2"
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
         <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
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
         <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#EBE8D8]">
           <div className="flex-1 mr-4">
             <p className="text-xs text-[#756F3F] uppercase font-bold mb-1">Next Slide</p>
             <p className="text-sm font-semibold line-clamp-1">{previewItem.summary}</p>
           </div>
           <div className="flex gap-2">
             <button onClick={handlePrev} className="w-12 h-12 rounded-full border border-[#756F3F] flex items-center justify-center">
               <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M8 2L2 8L8 14" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
             <button onClick={handleNext} className="w-12 h-12 rounded-full bg-[#756F3F] text-white flex items-center justify-center">
               <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M2 2L8 8L2 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
           </div>
         </div>
      </div>
    </section>
  )
}
