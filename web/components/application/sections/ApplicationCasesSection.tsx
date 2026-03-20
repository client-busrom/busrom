"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 996px tall section in design = 51.875vw
const vw = (px: number) => `${(px / 1920) * 100}vw`

export interface ApplicationCase {
  id: string
  title: string
  category?: string
  image: string
}

interface Props {
  title?: string
  subtitle?: string
  titleImage?: string
  cases?: ApplicationCase[]
}

const DEFAULT_CASES: ApplicationCase[] = [
  { id: "1", title: "Glass Railing Solution", category: "Commercial", image: "" },
  { id: "2", title: "Spider Fitting Project", category: "Hospitality", image: "" },
  { id: "3", title: "Floor Spring System", category: "Retail", image: "" },
  { id: "4", title: "Shower Door Hardware", category: "Residential", image: "" },
  { id: "5", title: "Patch Fitting Office", category: "Corporate", image: "" },
]

export function ApplicationCasesSection({ title, subtitle = "Busrom", titleImage, cases = DEFAULT_CASES }: Props) {
  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState(1)
  const [dragDirection, setDragDirection] = useState<'none' | 'left' | 'right'>('none')

  const handleNext = useCallback(() => {
    setDirection(1)
    setOffset((o) => o + 1)
  }, [])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setOffset((o) => o - 1)
  }, [])

  const visibleItems = useMemo(() => {
    if (cases.length === 0) return []
    // Always render 5 predictable positions to ensure slots are never empty 
    // and complex custom SVG masks map safely to DOM positions.
    return [-2, -1, 0, 1, 2].map((i) => {
      const p = offset + i
      // safe modulo for negative numbers
      const caseIdx = ((p % cases.length) + cases.length) % cases.length
      return { p, caseIdx, slotIdx: i + 2 }
    })
  }, [offset, cases.length])

  const activeCaseIdx = useMemo(() => {
    if (cases.length === 0) return 0
    return ((offset % cases.length) + cases.length) % cases.length
  }, [offset, cases.length])

  if (cases.length === 0) return null

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ height: vw(996) }}
    >

      {/* Background "Busrom" Ghost Text - SVG for Gradient Stroke support */}
      <div 
        id="applications-subtitle"
        className="absolute font-anaheim select-none pointer-events-none" 
        style={{ 
          left: vw(328), 
          top: vw(60), 
          zIndex: 1,
          transform: 'scaleY(1)',
          transformOrigin: 'top'
        }}
      >
        <svg width="100%" height={vw(120)} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="100%" stopColor="#B3B3B3" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y={vw(90)}
            style={{
              fontSize: vw(120),
              fill: '#f6f4ed',
              stroke: 'url(#strokeGradient)',
              strokeWidth: vw(1.5),
              paintOrder: 'stroke fill'
            }}
          >
            {subtitle}
          </text>
        </svg>
      </div>

      {/* Content Wrapper to push everything towards center while maintaining hierarchy */}
      <div className="flex flex-col items-center w-full">
        {/* Main Title "OUR CASES" - applications-title */}
        <div 
          id="applications-title"
          className="relative mb-[vw(40)] flex flex-col items-center z-10" 
          style={{ paddingTop: vw(0), transform: `translateX(${vw(100)})  translateY(${vw(-120)})` }}
        >
          {titleImage && (
            <img 
              src={titleImage} 
              alt={title || "Applications Title"} 
              className="object-contain"
              style={{ 
                width: vw(896.54), 
                height: 'auto',
                filter: `drop-shadow(0 ${vw(12)} ${vw(12)} rgba(84, 79, 37, 0.2))` 
              }}
            />
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative w-full flex justify-center items-center" style={{ height: vw(420) }}>
        <AnimatePresence initial={false}>
          {visibleItems.map(({ p, caseIdx, slotIdx }) => {
            const item = cases[caseIdx]
            const isCenter = slotIdx === 2
            
            // Precise Configuration from User's Vector JSON
            const configs = [
              { x: -506.14, y: -92.24, w: 200.28, h: 395.28, z: 1, mask: 'url(/images/application/cases/mask1.png)' },
              { x: -278.38, y: -77.18, w: 222.11, h: 451.00, z: 4, mask: 'url(/images/application/cases/mask2.png)' },
              { x: 0,       y: 0,      w: 300.42, h: 475.85, z: 10, mask: 'url(/images/application/cases/mask3.png)' },
              { x: 278.38,  y: -77.18, w: 222.11, h: 451.00, z: 4, mask: 'url(/images/application/cases/mask4.png)' },
              { x: 506.14,  y: -92.24, w: 200.28, h: 395.28, z: 1, mask: 'url(/images/application/cases/mask5.png)' },
            ]

            const config = configs[slotIdx]

            return (
              <motion.div
                key={p} 
                initial={{
                  x: direction > 0 ? vw(800) : vw(-800),
                  y: vw(-92.24), // entering from lower sides
                  width: vw(200.28),
                  height: vw(395.28),
                  zIndex: 0,
                  opacity: 0,
                  scale: 0.8
                }}
                animate={{ 
                  x: vw(config.x),
                  y: vw(config.y),
                  width: vw(config.w),
                  height: vw(config.h),
                  zIndex: config.z,
                  opacity: 1,
                  scale: 1
                }}
                exit={{
                  x: direction > 0 ? vw(-800) : vw(800),
                  y: vw(-92.24),
                  width: vw(200.28),
                  height: vw(395.28),
                  zIndex: 0,
                  opacity: 0,
                  scale: 0.8
                }}
                transition={{ type: "spring", stiffness: 180, damping: 25, mass: 1 }}
                className="absolute overflow-hidden cursor-pointer"
                style={{ 
                  WebkitMaskImage: config.mask,
                  WebkitMaskSize: '100% 100%',
                  WebkitMaskRepeat: 'no-repeat',
                  maskImage: config.mask,
                  maskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  // Ensure fallbacks for smooth rounded behavior
                  borderRadius: vw(30), 
                  boxShadow: isCenter 
                    ? `0 ${vw(20)} ${vw(40)} rgba(84, 79, 37, 0.45)` 
                    : 'none'
                }}
                onClick={() => {
                  if (slotIdx < 2) handlePrev()
                  if (slotIdx > 2) handleNext()
                }}
              >
                {/* Image Component */}
                <div className="relative w-full h-full bg-[#D6D3C2]">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 border-2 border-[#756F3F]/20 rounded-full mb-4 animate-pulse" />
                      <span className="text-[#544F25]/30 uppercase font-anaheim text-[vw(12)] text-center tracking-widest">
                        {item.title}
                      </span>
                    </div>
                  )}
                  {/* Info Overlay - DISABLED per user request for CMS setting */}
                  {/* <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-[vw(30)] transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                    {item.category && (
                      <span className="text-[#FFEE53] font-anaheim uppercase tracking-widest mb-[vw(5)]" style={{ fontSize: vw(16) }}>
                        {item.category}
                      </span>
                    )}
                    <h3 className="text-white font-anaheim font-bold" style={{ fontSize: vw(24), lineHeight: 1.2 }}>
                      {item.title}
                    </h3>
                  </div> */}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* Navigation Arc & Controls */}
      <div className="absolute bottom-0 w-full flex justify-center items-center" style={{ height: vw(360), marginBottom: vw(20) }}>
        
        {/* Arc Visual Rail - Actual design image */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-0">
          <img src="/images/application/cases/nav-line.png" alt="line" className="w-[85vw] object-contain opacity-80" />
        </div>

        {/* UI Controls Container - Absolutely positioned over the line's gaps */}
        <div className="absolute inset-0 flex justify-center items-center z-20">
          
          {/* PREV: Left Button */}
          <button 
            onClick={handlePrev} 
            className="group absolute flex items-center justify-center transition-transform duration-300 active:scale-95"
            aria-label="Previous Case"
            // Adjust this offset specifically to sit inside the nav-line left gap
            style={{ width: vw(160), height: vw(100), left: `calc(50% - ${vw(400)})`, top: `calc(50% + ${vw(50)})`, transform: `translateY(-50%) ${dragDirection === 'left' ? 'scale(1.1)' : ''}` }}
          >
            {/* Base state (inactive) */}
            <img 
              src="/images/application/cases/nav-prev.png" 
              className={`absolute w-[45%] h-[45%] object-contain transition-opacity duration-300 group-hover:opacity-0 ${dragDirection === 'left' ? 'opacity-0' : 'opacity-100'}`} 
              alt="Prev" 
            />
            {/* Active state (hover or drag) */}
            <img 
              src="/images/application/cases/nav-next-active.png" 
              className={`absolute w-[110%] h-[110%] object-contain scale-x-[-1] transition-opacity duration-300 group-hover:opacity-100 ${dragDirection === 'left' ? 'opacity-100' : 'opacity-0'}`} 
              alt="Active Prev" 
            />
          </button>

          {/* DECORATIVE HANDLE (NO DRAG) */}
          <div 
            className="absolute z-30 pointer-events-none" 
            style={{ width: vw(75), height: vw(75), left: '50%', top: `calc(50% + ${vw(60)})`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img src="/images/application/cases/nav-handle.png" className="w-full h-full object-contain drop-shadow-lg opacity-90" alt="Decoration Handle" />
            </div>
          </div>

          {/* NEXT: Right Button */}
          <button 
            onClick={handleNext} 
            className="group absolute flex items-center justify-center transition-transform duration-300 active:scale-95"
            aria-label="Next Case"
            // Adjust this offset specifically to sit inside the nav-line right gap
            style={{ width: vw(160), height: vw(100), left: `calc(50% + ${vw(380)})`, top: `calc(50% + ${vw(50)})`, transform: `translate(-100%, -50%) ${dragDirection === 'right' ? 'scale(1.1)' : ''}` }}
          >
            {/* Base state (inactive) */}
            <img 
              src="/images/application/cases/nav-prev.png" 
              className={`absolute w-[45%] h-[45%] object-contain scale-x-[-1] transition-opacity duration-300 group-hover:opacity-0 ${dragDirection === 'right' ? 'opacity-0' : 'opacity-100'}`} 
              alt="Next" 
            />
            {/* Active state (hover or drag) */}
            <img 
              src="/images/application/cases/nav-next-active.png" 
              className={`absolute w-[110%] h-[110%] object-contain transition-opacity duration-300 group-hover:opacity-100 ${dragDirection === 'right' ? 'opacity-100' : 'opacity-0'}`} 
              alt="Active Next" 
            />
          </button>
        </div>
      </div>
    </section>
  )
}
