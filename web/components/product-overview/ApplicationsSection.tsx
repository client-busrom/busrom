"use client"

import React, { useState, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

// Precise card slot definitions from .pen
const SLOTS = [
  { w: 390, h: 522, x: 0, y: 334, z: 10, opacity: 0.8 },   // Left
  { w: 512, h: 743, x: 451, y: 0, z: 30, opacity: 1 },     // Center
  { w: 307, h: 374, x: 1023, y: 184, z: 10, opacity: 0.6 }, // Right
]

import { ProductOverviewData } from "@/types/product-overview"

interface ApplicationsSectionProps {
  data: ProductOverviewData["applications"]
}

export function ApplicationsSection({ data }: ApplicationsSectionProps) {
  const [offset, setOffset] = useState(0)
  const isMoving = useRef(false)

  const { items, title, subtitle, cta } = data

  const handleNext = useCallback(() => {
    if (isMoving.current) return
    isMoving.current = true
    setOffset((prev) => prev + 1)
    setTimeout(() => { isMoving.current = false }, 600)
  }, [])

  const handlePrev = useCallback(() => {
    if (isMoving.current) return
    isMoving.current = true
    setOffset((prev) => prev - 1)
    setTimeout(() => { isMoving.current = false }, 600)
  }, [])

  const visibleItems = useMemo(() => {
    if (items.length === 0) return []
    return [-1, 0, 1].map((i) => {
      const pos = offset + i
      const index = ((pos % items.length) + items.length) % items.length
      return { pos, index, slotIdx: i + 1 }
    })
  }, [offset, items.length])

  if (items.length === 0) return null

  return (
    <section 
      className="relative w-full bg-[#f6f4ed] overflow-hidden select-none" 
      style={{ height: vw(922) }}
    >
      {/* ─── Titles (Limelight Staggered) ─── */}
      <div className="absolute left-0 top-0 w-full z-20 pointer-events-none">
        <h2 
          className="absolute font-limelight text-[#464010] uppercase"
          style={{ 
            fontSize: vw(96), 
            left: vw(156), 
            top: vw(74), 
            letterSpacing: '0.06em' 
          }}
        >
          {title}
        </h2>
        <h2 
          className="absolute font-limelight text-[#464010] uppercase"
          style={{ 
            fontSize: vw(96), 
            left: vw(373), 
            top: vw(183), 
            letterSpacing: '0.06em' 
          }}
        >
          {subtitle}
        </h2>
      </div>

      {/* ─── CTA Button ─── */}
      <div className="absolute z-30" style={{ left: vw(156), top: vw(385) }}>
        <Link 
          href={cta.url}
          target={cta.openInNewTab ? "_blank" : undefined}
          rel={cta.openInNewTab ? "noopener noreferrer" : undefined}
          className="group relative flex items-center bg-[#756f3f] rounded-[49.5px] px-[vw(29)] transition-all duration-300 hover:scale-105"
          style={{ width: vw(363), height: vw(99) }}
        >
          <span className="font-anaheim font-medium text-white uppercase" style={{ fontSize: vw(29) }}>
            {cta.title}
          </span>
          
          {/* Decorative Icon Group (Group 222) */}
          <div 
            className="absolute flex items-center justify-center transform -rotate-[12.8deg]"
            style={{ right: vw(4), top: vw(-0.5), width: vw(100), height: vw(100) }}
          >
             <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#464010" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
          </div>
        </Link>
      </div>

      {/* ─── Carousel (Asymmetrical Layout) ─── */}
      <div className="absolute" style={{ left: vw(590), top: vw(33), width: vw(1330), height: vw(800) }}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleItems.map(({ pos, index, slotIdx }) => {
            const item = items[index]
            const config = SLOTS[slotIdx]

            return (
              <motion.div
                key={`${item.id}-${pos}`}
                initial={{ 
                  x: pos > offset ? vw(1200) : vw(-600),
                  y: vw(config.y),
                  width: vw(config.w),
                  height: vw(config.h),
                  opacity: 0,
                  zIndex: 0,
                  borderRadius: vw(60)
                }}
                animate={{ 
                  x: vw(config.x),
                  y: vw(config.y),
                  width: vw(config.w),
                  height: vw(config.h),
                  zIndex: config.z,
                  opacity: config.opacity,
                  borderRadius: vw(60)
                }}
                exit={{ 
                  x: pos < offset ? vw(-600) : vw(1200),
                  opacity: 0,
                  zIndex: 0,
                  borderRadius: vw(60)
                }}
                transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.8 }}
                className="absolute overflow-hidden cursor-pointer"
                style={{ boxShadow: slotIdx === 1 ? `0 ${vw(40)} ${vw(80)} rgba(70, 64, 16, 0.2)` : 'none' }}
                onClick={() => {
                  if (slotIdx === 0) handlePrev()
                  if (slotIdx === 2) handleNext()
                }}
              >
                <div className="relative w-full h-full bg-[#D6D3C2] rounded-[vw(60)] overflow-hidden">
                  <OptimizedImage
                    image={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 rounded-[vw(60)]"
                    size="large"
                  />
                  {/* Overlay for center item */}
                  {slotIdx === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none">
                      <div className="absolute bottom-[vw(60)] left-[vw(60)]">
                        <h3 className="text-white font-josefin-sans font-bold uppercase" style={{ fontSize: vw(48) }}>
                          {item.title}
                        </h3>
                        <p className="text-white/70 font-montserrat uppercase tracking-[0.2em] mt-[vw(12)]" style={{ fontSize: vw(18) }}>
                          {item.subtitle || "Exploring Cases"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ─── Navigation Arrows ─── */}
      <div className="absolute left-0 w-full flex justify-between items-center pointer-events-none z-40" style={{ top: vw(694) }}>
        <button
          onClick={handlePrev}
          className="group pointer-events-auto flex items-center justify-center transition-all active:scale-95"
          style={{ width: vw(82), height: vw(82), marginLeft: '8vw' }}
        >
          <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
            <ChevronLeft style={{ width: vw(32), height: vw(32) }} className="text-[#464010] group-hover:text-white transition-colors" />
          </div>
        </button>

        <button
          onClick={handleNext}
          className="group pointer-events-auto flex items-center justify-center transition-all active:scale-95"
          style={{ width: vw(82), height: vw(82), marginRight: '8vw' }}
        >
          <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
            <ChevronRight style={{ width: vw(32), height: vw(32) }} className="text-[#464010] group-hover:text-white transition-colors" />
          </div>
        </button>
      </div>
    </section>
  )
}
