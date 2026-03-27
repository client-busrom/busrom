"use client"

import React, { useState, useCallback, useMemo } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface BrandStrengthItem {
  title: string
  description?: string
  image: MediaObject | null
}

interface MediaObject {
  url: string
  id: string
}

interface StoryBrandStrengthsSectionProps {
  data: {
    title: string 
    items: {
      slides: BrandStrengthItem[]
    }
  }
}

export function StoryBrandStrengthsSection({ data }: StoryBrandStrengthsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const slides = (data?.items?.slides || [])

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev + 1) % slides.length)
  }, [slides.length, isAnimating])

  const handlePrev = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length, isAnimating])

  const visibleSlides = useMemo(() => {
    if (slides.length === 0) return []
    const prev = (activeIndex - 1 + slides.length) % slides.length
    const next = (activeIndex + 1) % slides.length
    return [
      { ...slides[prev], originalIdx: prev, type: 'left' },
      { ...slides[activeIndex], originalIdx: activeIndex, type: 'middle' },
      { ...slides[next], originalIdx: next, type: 'right' }
    ]
  }, [activeIndex, slides])

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#f6f4ed]" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto text-black">
        
        {/* 1. Header Title - Case Sensitive and Line-Break Persistent */}
        <div className="absolute z-20 pointer-events-none" style={{ left: vw(166), top: vw(51.5) }}>
          <h2 
            className="font-josefin-sans font-bold text-[#574f0e] whitespace-pre-wrap" 
            style={{ fontSize: vw(80), lineHeight: 0.9, textTransform: 'none' }}
          >
            {data?.title}
          </h2>
        </div>

        {/* Three colored balls - top left decoration (Floating staggered animation) */}
        <div className="absolute flex gap-[0px]" style={{ left: vw(1263), top: vw(62) }}>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#756F3F' }} 
          />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="rounded-full shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#DAC99E' }} 
          />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="rounded-full border border-black/10 shadow-sm" style={{ width: vw(18), height: vw(18), backgroundColor: '#F6F4ED' }} 
          />
        </div>

        {/* 2. Navigation Buttons */}
        <div 
          className="absolute z-[100] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform" 
          style={{ left: vw(237.1), top: vw(294.6), width: vw(79.5), height: vw(79.5) }} 
          onClick={handlePrev}
        >
           <div className="absolute inset-0 border border-[#756f3f] rounded-full" />
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-180 stroke-[#756f3f]"><path d="M9 18l6-6-6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div 
          className="absolute z-[100] flex items-center justify-center cursor-pointer active:scale-95" 
          style={{ right: vw(380), bottom: vw(84), width: vw(79), height: vw(79) }} 
          onClick={handleNext}
        >
           <div className="absolute inset-0 bg-[#756f3f] rounded-full shadow-lg" />
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-white"><path d="M9 18l6-6-6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* 3. Ladder Carousel */}
        <div className="absolute inset-0 w-full h-full">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleSlides.map((slide) => {
                 const isMiddle = slide.type === 'middle'
                 const isLeft = slide.type === 'left'
                 const isRight = slide.type === 'right'

                 const width = isMiddle ? 1068 : 586
                 const height = isMiddle ? 628 : 344
                 const imageWidth = isMiddle ? 469 : 586
                 
                 let top = 242.5
                 if (isLeft) top = 526.5

                 let leftPos = 352
                 if (isLeft) leftPos = -269
                 if (isRight) leftPos = 1461

                 return (
                   <motion.div
                     key={slide.originalIdx}
                     initial={{ 
                       opacity: 0, 
                       left: vw(leftPos + (isRight ? 100 : isLeft ? -100 : 0)),
                       top: vw(top) 
                     }}
                     animate={{ 
                       opacity: 1,
                       left: vw(leftPos), 
                       top: vw(top), 
                       width: vw(width), 
                       height: vw(height),
                       zIndex: isMiddle ? 50 : 20,
                     }}
                     exit={{ opacity: 0, scale: 0.95, zIndex: 0 }}
                     transition={{ type: "spring", stiffness: 120, damping: 20 }}
                     onAnimationComplete={() => isMiddle && setIsAnimating(false)}
                     className="absolute pointer-events-auto cursor-pointer"
                   >
                     <div 
                        className="absolute inset-0 bg-white shadow-xl overflow-hidden" 
                        style={{ borderRadius: vw(60) }}
                        onClick={() => {
                          if (isAnimating) return
                          if (isLeft) handlePrev()
                          if (isRight) handleNext()
                        }}
                     >
                        <div className="flex w-full h-full">
                           <motion.div 
                              className="relative h-full flex-shrink-0 bg-[#d9d9d9]"
                              animate={{ width: vw(imageWidth) }}
                              transition={{ type: "spring", stiffness: 120, damping: 20 }}
                           >
                              <OptimizedImage image={slide.image || "/BusromFooterBg_original.webp"} alt="" size="medium" className="object-cover w-full h-full" />
                              
                              {!isMiddle && (
                                <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
                                   <h4 className="font-josefin-sans font-bold text-white/50" style={{ fontSize: vw(32) }}>
                                      {slide.title}
                                   </h4>
                                </div>
                              )}
                              
                              {!isMiddle && (
                                 <div className="absolute top-8 right-8 text-[#eee8b3] opacity-60" style={{ width: 26, height: 26 }}>
                                    <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="currentColor">
                                      <path d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" />
                                    </svg>
                                 </div>
                               )}
                           </motion.div>

                           {isMiddle && (
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: vw(599) }}
                                 transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                 className="h-full flex flex-col justify-center bg-white relative overflow-hidden"
                               >
                                  <div style={{ width: vw(599), paddingLeft: vw(51), paddingRight: vw(40) }}>
                                     <AnimatePresence mode="wait">
                                       <motion.div 
                                          key={slide.originalIdx}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                       >
                                          <h3 
                                            className="font-josefin-sans font-bold text-black mb-6" 
                                            style={{ fontSize: vw(28), lineHeight: 1.1, maxWidth: vw(483) }}
                                          >
                                             {slide.title}
                                          </h3>
                                          <p 
                                            className="font-josefin-sans font-light text-black/80" 
                                            style={{ fontSize: vw(36), lineHeight: 1.1, maxWidth: vw(508) }}
                                          >
                                             {slide.description}
                                          </p>
                                       </motion.div>
                                     </AnimatePresence>
                                  </div>
                               </motion.div>
                           )}
                        </div>
                     </div>

                     {/* Orbiting Star Effect inside Middle Item but z-parented correctly */}
                     {isMiddle && (
                        <div 
                          className="absolute pointer-events-none"
                          style={{ 
                            left: vw(690),
                            top: vw(-50),
                            width: vw(408),
                            height: vw(168),
                            zIndex: 100
                          }}
                        >
                          <div 
                            className="absolute inset-0 border border-[#C9C177]" 
                            style={{ 
                              borderRadius: "50%",
                              transform: "rotate(-22.02deg)",
                            }}
                          />

                          <motion.div
                            className="absolute"
                            style={{ 
                              width: vw(38), 
                              height: vw(38),
                              marginLeft: vw(-19),
                              marginTop: vw(-19),
                              zIndex: 110
                            }}
                            animate={{ 
                              left: Array.from({ length: 61 }).map((_, i) => {
                                const t = (i / 60) * 2 * Math.PI
                                const a = 204 // 408/2
                                const b = 84 // 168/2
                                const rot = -22.02 * (Math.PI / 180)
                                const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot)
                                return vw(204 + x)
                              }),
                              top: Array.from({ length: 61 }).map((_, i) => {
                                const t = (i / 60) * 2 * Math.PI
                                const a = 204
                                const b = 84
                                const rot = -22.02 * (Math.PI / 180)
                                const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot)
                                return vw(84 + y)
                              }),
                              rotate: 360
                            }}
                            transition={{ 
                              duration: 8, 
                              ease: "linear", 
                              repeat: Infinity 
                            }}
                          >
                            <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
                               <path 
                                 d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" 
                                 fill="#C9C177" 
                               />
                            </svg>
                          </motion.div>
                        </div>
                     )}
                   </motion.div>
                 )
              })}
            </AnimatePresence>
        </div>

      </div>
    </section>
  )
}
