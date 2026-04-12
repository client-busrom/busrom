"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

// Dynamic Stacked Subtitle component with downward motion
function StackedSubtitle({ text }: { text: string }) {
  const [layers, setLayers] = useState<{ id: number }[]>([])
  const layerIdRef = useRef(0)

  useEffect(() => {
    // Generate a new 'stack' layer every 700ms
    const interval = setInterval(() => {
      const newId = layerIdRef.current++
      setLayers((prev) => [...prev, { id: newId }])
      
      // Remove layer after animation
      setTimeout(() => {
        setLayers((prev) => prev.filter((l) => l.id !== newId))
      }, 3000)
    }, 700)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex justify-center items-center" style={{ height: vw(180) }}>
      {/* Dynamic layers animating downwards */}
      <AnimatePresence>
        {layers.map((layer) => (
          <motion.div
            key={layer.id}
            className="absolute"
            initial={{ y: 0, opacity: 0.6 }}
            animate={{ y: 50, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: "easeOut" }}
          >
            <HollowText
              strokeColor="#464010"
              strokeWidth={0.5}
              className="font-josefin-sans font-extrabold select-none pointer-events-none"
              style={{ fontSize: vw(72), letterSpacing: "0.02em" }}
            >
              {text}
            </HollowText>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main solid text with stroke layer */}
      <span 
        className="relative z-10 text-[#f6f4ed] font-josefin-sans font-extrabold"
        style={{ 
          fontSize: vw(72), 
          letterSpacing: "0.02em",
          WebkitTextStroke: `${vw(2)} #464010`,
          paintOrder: "stroke fill"
        }}
      >
        {text}
      </span>
      
      {/* Subtle background layer for better baseline visibility */}
      <span 
        className="absolute font-josefin-sans font-extrabold text-[#464010] opacity-5 select-none pointer-events-none z-0"
        style={{ fontSize: vw(72), letterSpacing: "0.02em" }}
      >
        {text}
      </span>
    </div>
  )
}

interface SeriesItem {
  id: string;
  title: string;
  image: any;
  href: string;
}

interface SeriesOverviewSectionProps {
  data: {
    title: string;
    subtitle: string;
    items: SeriesItem[];
    config: {
      autoplay: boolean;
      interval: number;
      itemsPerView: number;
    }
  }
}

function circularDist(index: number, active: number, total: number) {
  let dist = index - active
  if (dist > total / 2) dist -= total
  if (dist < -total / 2) dist += total
  return dist
}

const CIRCLE_SIZES = [484, 328, 268, 214, 158]
const OFFSETS = [0, 260, 460, 620, 750]

export function SeriesOverviewSection({ data }: SeriesOverviewSectionProps) {
  const { title, subtitle, items, config } = data
  const [activeIndex, setActiveIndex] = useState(0)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevActiveRef = useRef(0)

  const total = items.length

  const goNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + total) % total)
  }, [total])

  useEffect(() => {
    prevActiveRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    if (!config.autoplay || total === 0) return
    autoplayRef.current = setInterval(goNext, config.interval * 1000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [config.autoplay, config.interval, goNext, total])

  const handleMouseEnter = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
  }
  const handleMouseLeave = () => {
    if (config.autoplay && total > 0) {
      autoplayRef.current = setInterval(goNext, config.interval * 1000)
    }
  }

  if (!items || items.length === 0) return null

  const prevActive = prevActiveRef.current

  return (
    <section
      className="relative w-full flex flex-col items-center overflow-hidden z-[10]"
      style={{ 
        height: vw(1120), 
        paddingTop: vw(300), // Increase top space for Hero assets overlap
      }}
      id="series-overview"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 
         Title (Product Series) 
         Solid black, Josefin Sans per design node 5zFPB
      */}
      <div className="relative z-[60] text-center mb-[4vw]">
        <h2 
          className="font-josefin-sans font-bold text-black leading-none" 
          style={{ fontSize: vw(60) }}
        >
          {title}
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full flex items-center justify-center" style={{ height: vw(550) }}>
        {items.map((item, index) => {
          const newDist = circularDist(index, activeIndex, total)
          const oldDist = circularDist(index, prevActive, total)
          const absDist = Math.abs(newDist)
          const isActive = newDist === 0
          const isVisible = absDist <= 4
          const isWrapping = Math.abs(newDist - oldDist) > total / 2
          
          const xOffset = Math.sign(newDist) * (OFFSETS[absDist] ?? 0)
          const outerSize = CIRCLE_SIZES[absDist] ?? 120
          
          const transition = isWrapping
            ? 'opacity 300ms ease'
            : 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 500ms ease, background-color 800ms ease, border-color 800ms ease, box-shadow 800ms ease'

          const imageSize = isActive ? 364 : outerSize
          const imageLeft = isActive ? 60 : 0
          const imageTop = isActive ? 34 : 0

          return (
            <div
              key={`item-${item.id}`}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateX(${vw(xOffset)})`,
                zIndex: 100 - absDist,
                opacity: isVisible ? 1 : 0,
                transition,
              }}
            >
              <Link href={item.href} className={cn("relative block", isActive && "pointer-events-auto")}>
                <div
                  className="relative rounded-full transition-all duration-800"
                  style={{
                    width: vw(outerSize),
                    height: vw(outerSize),
                    backgroundColor: isActive ? 'white' : 'transparent',
                    border: isActive ? `1px solid #ffea44` : '1px solid transparent',
                    boxShadow: isActive ? '0 10px 40px rgba(70, 64, 16, 0.25)' : 'none',
                    transition: isWrapping ? 'none' : 'width 800ms cubic-bezier(0.34, 1.56, 0.64, 1), height 800ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 800ms, border-color 800ms, box-shadow 800ms',
                  }}
                >
                  <div
                    className="absolute rounded-full overflow-hidden transition-all duration-800"
                    style={{
                      width: vw(imageSize),
                      height: vw(imageSize),
                      left: vw(imageLeft),
                      top: vw(imageTop),
                      transition: isWrapping ? 'none' : 'width 800ms cubic-bezier(0.34, 1.56, 0.64, 1), height 800ms cubic-bezier(0.34, 1.56, 0.64, 1), left 800ms cubic-bezier(0.34, 1.56, 0.64, 1), top 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {item.image ? (
                      <OptimizedImage
                        image={item.image}
                        alt={item.title}
                        size="medium"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E5D98B]/20 flex items-center justify-center">
                        <span className="text-[#464010]/20 font-bold" style={{ fontSize: vw(40) }}>B</span>
                      </div>
                    )}
                    
                    <div 
                      className="absolute inset-0 bg-[#FFFCE2]/35 opacity-0 transition-opacity duration-800"
                      style={{ opacity: isActive ? 0 : 1 }}
                    />
                  </div>

                  <div
                    className="absolute flex items-center justify-center pointer-events-none transition-opacity duration-500"
                    style={{
                      bottom: vw(20),
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: vw(320),
                      height: vw(100),
                      opacity: isActive ? 1 : 0,
                    }}
                  >
                    <span
                      className="text-black font-inter font-semibold text-center leading-tight"
                      style={{ fontSize: vw(30) }}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}

        {/* Navigation Buttons: Positioned between Title and Carousel */}
        <button
          onClick={goPrev}
          className="absolute left-[8vw] z-[110] group"
          style={{ width: vw(82), height: vw(82), top: vw(-85) }}
        >
          <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-colors group-hover:bg-[#464010]/10">
            <ChevronLeft style={{ width: vw(32), height: vw(32) }} className="text-[#464010]" />
          </div>
        </button>

        <button
          onClick={goNext}
          className="absolute right-[8vw] z-[110] group"
          style={{ width: vw(82), height: vw(82), top: vw(-85) }}
        >
          <div className="w-full h-full rounded-full bg-[#756F3F] flex items-center justify-center transition-transform group-hover:scale-110">
            <ChevronRight style={{ width: vw(32), height: vw(32) }} className="text-white" />
          </div>
        </button>
      </div>

      {/* 
         Subtitle (Overview)
         Positioned below the carousel with HollowText and Stacked effect
      */}
      <div className="relative mt-8 text-center pb-20 overflow-visible">
         <StackedSubtitle text={subtitle} />
      </div>
    </section>
  )
}
