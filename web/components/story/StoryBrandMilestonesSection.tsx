"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

const PATH_D = "M77.45302 316.1879c22.76916-11.90189 89.73976-28.56458 175.46881 0 107.1613 35.70572 386.658-84.5661 501.96611-241.17006 115.3081-156.60396 518.88636-30.06797 595.34056 38.21136 61.1635 54.62346 44.1496 296.32305 18.6648 467.33458-67.0542-114.42529-226.3446-131.1998-462.97686-34.4812-295.79022 120.89825-149.1485 285.01923-488.80594 386.4986-339.65747 101.47932-534.55319-320.0987-339.65748-616.39328z"

const TimelineIcon = () => (
  <div className="flex-shrink-0 flex items-center justify-center" style={{ width: vw(20), height: vw(20) }}>
    <div className="w-full h-full rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center">
      <div className="w-[45%] h-[45%] rounded-full bg-[#C9B832]" />
    </div>
  </div>
)

interface CarouselSlide {
  title: string
  description: string
  image: any
}

interface StoryBrandMilestonesSectionProps {
  data: {
    title: string 
    image: any
    items: CarouselSlide[]
  }
}

export function StoryBrandMilestonesSection({ data }: StoryBrandMilestonesSectionProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [focusSlideIndex, setFocusSlideIndex] = useState(3)
  const [direction, setDirection] = useState(0)
  const [pathLength, setPathLength] = useState(0)
  
  const pathRef = useRef<SVGPathElement>(null)
  const [lut, setLut] = useState<{ x: number; y: number }[]>([])
  const slides = (data?.items || [])

  const pathRatios = useMemo(() => [0, 0.12, 0.20, 0.96, 0.7, 0.56], [])
  const slotSizes = useMemo(() => [410, 320, 190, 542, 425, 278], [])

  useEffect(() => {
    setIsMounted(true)
    const timeout = setTimeout(() => {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength()
        setPathLength(length)
        const points = []
        const RESOLUTION = 300 
        for (let i = 0; i <= RESOLUTION; i++) {
          const pt = pathRef.current.getPointAtLength((i / RESOLUTION) * length)
          points.push({ x: pt.x, y: pt.y })
        }
        setLut(points)
      }
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  const getPointAtRatio = (ratio: number) => {
    if (lut.length === 0) return { x: 0, y: 0 }
    const r = ((ratio % 1) + 1) % 1
    const idx = r * (lut.length - 1)
    const base = Math.floor(idx)
    const ceil = Math.min(base + 1, lut.length - 1)
    const f = idx - base
    const p1 = lut[base]
    const p2 = lut[ceil]
    return {
      x: p1.x + (p2.x - p1.x) * f,
      y: p1.y + (p2.y - p1.y) * f
    }
  }

  const handleNext = () => {
    setDirection(1)
    setFocusSlideIndex(prev => (prev + 1) % (slides.length || 1))
  }

  const handlePrev = () => {
    setDirection(-1)
    setFocusSlideIndex(prev => (prev - 1 + slides.length) % (slides.length || 1))
  }

  const activeSlideInBox = slides[focusSlideIndex] || slides[0]

  if (!isMounted) return null

  // Path Arrow positions (User manual overrides)
  const arrow1Pos = getPointAtRatio(0.24)
  const arrow2Pos = getPointAtRatio(0.62)

  return (
    <section className="relative w-full bg-[#f6f4ed] overflow-hidden" style={{ height: vw(1690) }}>
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto overflow-hidden">
        
        {/* Console Part (User manual overrides preserved) */}
        <div className="absolute z-20" style={{ left: vw(147), top: vw(187) }}>
          <div className="absolute" style={{ left: vw(0), top: vw(550) }}>
            <h2 className="font-moul font-bold text-[#756f3f] origin-left -rotate-90 uppercase tracking-[0.2em] leading-none whitespace-nowrap" style={{ fontSize: vw(74) }}>
              {data.title}
            </h2>
          </div>
          <div className="absolute" style={{ left: vw(180), top: vw(0), width: vw(300), height: vw(1000) }}>
             <OptimizedImage image={data.image} alt="" size="medium" className="object-cover" priority />
          </div>
          <div className="absolute" style={{ left: vw(250), top: vw(50), width: vw(300), height: vw(800) }}>
             {/* DETACHED NAVIGATION ARROWS (User manual overrides) */}
             <div className="absolute inset-x-0 top-0 -translate-y-full flex justify-center pb-12">
                <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className="cursor-pointer" onClick={handleNext}>
                  <img src="/assets/story/A8lvX.png" alt="" style={{ width: vw(85) }} />
                </motion.div>
             </div>
             
             <div className="absolute inset-x-0 bottom-0 translate-y-full flex justify-center pt-20">
                <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className="cursor-pointer" onClick={handlePrev}>
                  <img src="/assets/story/xlzAP.png" alt="" style={{ width: vw(85) }} />
                </motion.div>
             </div>
          </div>
        </div>

        {/* Path-Based Trajectory Area */}
        <div className="absolute overflow-visible" style={{ left: vw(729), top: vw(50), width: vw(1392), height: vw(948) }}>
           <svg width="100%" height="100%" viewBox="0 0 1392 948" className="absolute opacity-0 pointer-events-none">
             <path ref={pathRef} d={PATH_D} />
           </svg>

           <div className="absolute inset-x-[-40px] top-[-40px] pointer-events-none">
             <img src="/assets/story/brand-travel-line.svg" style={{ width: vw(1473), height: vw(1028) }} alt="" />
           </div>

           {/* Kinetic Path Arrows (User manual overrides) */}
           <motion.div 
              className="absolute z-40" 
              animate={{ left: vw(arrow1Pos.x), top: vw(arrow1Pos.y), rotate: direction * 180 }}
              style={{ width: vw(120), height: vw(120), marginLeft: vw(-60), marginTop: vw(-70) }}
           >
              <img src="/assets/story/xwx2U.png" alt="" className="w-full h-full object-contain pointer-events-none" />
           </motion.div>

           <motion.div 
              className="absolute z-40" 
              animate={{ left: vw(arrow2Pos.x), top: vw(arrow2Pos.y), rotate: -direction * 180 }}
              style={{ width: vw(120), height: vw(120), marginLeft: vw(-60), marginTop: vw(-70) }}
           >
              <img src="/assets/story/FHyxi.png" alt="" className="w-full h-full object-contain pointer-events-none" />
           </motion.div>

           {/* 6-Grid Matrix Glide */}
           {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const n = slides.length || 1
              const slideIdx = (focusSlideIndex + (slotIdx - 3) + n * 10) % n
              const item = slides[slideIdx]
              
              const isActiveHighlight = (slotIdx === 3) // Slot 4 - Bottom-Left
              const distance = Math.abs(slotIdx - 3)
              const ratio = pathRatios[slotIdx]
              const pos = getPointAtRatio(ratio)
              const size = slotSizes[slotIdx]

              return (
                <motion.div
                  key={`slot-${slotIdx}`}
                  className="absolute"
                  animate={{ 
                    left: vw(pos.x), 
                    top: vw(pos.y),
                    scale: 1, 
                    zIndex: isActiveHighlight ? 400 : 200 - distance,
                  }}
                  transition={{ type: "spring", stiffness: 45, damping: 22, mass: 0.8 }}
                  style={{ 
                    width: vw(size), 
                    height: vw(size),
                    // USER MANUAL MARGINS PRESERVED
                    marginLeft: isActiveHighlight ? vw(-160) : vw(-size / 2),
                    marginTop: isActiveHighlight ? vw(160) : vw(-size / 2),
                  }}
                >
                   {/* Active Line Arrow (RP2gE) - exported from Pencil, shown only for active slot */}
                   {isActiveHighlight && (
                     <img
                       src="/active-line-arrow.png"
                       alt=""
                       className="absolute pointer-events-none"
                       style={{
                         width: vw(120),
                         right: '40%',
                         top: '96%',
                         zIndex: -1,
                       }}
                     />
                   )}
                   <div className={`w-full h-full rounded-full transition-all duration-700 flex items-center justify-center p-2 ${isActiveHighlight ? "bg-[#fff5a8] shadow-2xl" : "bg-white/10"}`}>
                     <div className={`w-full h-full rounded-full overflow-hidden relative border-4 ${isActiveHighlight ? "border-white" : "border-[#756f3f]"}`}>
                        <OptimizedImage image={item?.image || "/BusromFooterBg_original.webp"} alt="" size="medium" className="object-cover w-full h-full" />
                     </div>
                   </div>
                </motion.div>
              )
           })}
        </div>

         {/* Information Narrative Box (0vzSH) - Dynamic Width (w-fit) */}
         <div className="absolute z-[600] pointer-events-none" style={{ left: vw(930), top: vw(1227) }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={focusSlideIndex} 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }} 
                className="relative w-fit min-w-[33.9vw] h-full pointer-events-auto overflow-visible"
                style={{ height: vw(340) }}
              >
                 {/* Main Yellow Background (Base 0vzSH) - Auto 100% Width */}
                 <div className="absolute inset-0 bg-[#FDF4D7] rounded-[30px] shadow-2xl w-full" />
                 
                 {/* Rectangle 489 - White/Cream Section (qATxI) - Auto 100% Width */}
                 <div 
                   className="absolute bg-[#FFFCF0] w-full" 
                   style={{ 
                     left: 0, 
                     top: vw(125), 
                     height: vw(215), 
                     borderRadius: `0 0 ${vw(30)} ${vw(30)}` 
                   }} 
                 />

                 <div className="relative z-10 pt-10 px-6 h-full flex flex-col w-fit">
                    {/* Header: Title Area (on Yellow, 125px height area) */}
                    <div className="flex flex-col gap-2 mb-2 w-fit" style={{ height: vw(105) }}>
                       {activeSlideInBox?.title.split('\n').map((line, idx) => (
                         <div key={idx} className="flex items-center gap-4 whitespace-nowrap">
                            <TimelineIcon />
                            <h3 className="font-josefin-sans font-bold text-black" style={{ fontSize: vw(26.5), lineHeight: 1.1 }}>
                              {line}
                            </h3>
                         </div>
                       ))}
                    </div>
                    
                    {/* Content: Description Area (on White) */}
                    <div className="relative flex-1">
                       <p className="font-josefin-sans font-medium text-[#323232] leading-snug" style={{ fontSize: vw(22), maxWidth: vw(536) }}>
                         {activeSlideInBox?.description}
                       </p>
                    </div>

                    {/* Milestone Year Marker */}
                    <div className="absolute -top-12 -right-4 z-0">
                       <span className="font-josefin-sans font-bold text-[#BBB47F] select-none" style={{ fontSize: vw(120), lineHeight: 1 }}>
                          {2013 + (focusSlideIndex % 12)}
                       </span>
                    </div>
                 </div>
              </motion.div>
            </AnimatePresence>
         </div>

      </div>
    </section>
  )
}
