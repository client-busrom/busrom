"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Viewport width helper matching the 1920px design base
const vw = (px: number) => `${(px / 1920) * 100}vw`

interface Series {
  id: string
  name: string
  images: string[]
}

interface ApplicationMoreCasesSectionProps {
  locale: string
}

export function ApplicationMoreCasesSection({ locale }: ApplicationMoreCasesSectionProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Use our own API route (server-side proxy) instead of direct CMS calls
        const res = await fetch(`/api/more-cases?locale=${locale}`)
        const data = await res.json()
        const result: Series[] = data.series || []

        setSeriesList(result)
        if (result.length === 0) {
          console.warn("MoreCases: No series found for this category/tags")
        }
      } catch (e) {
        console.error("Failed to fetch more cases data", e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [locale])

  const currentSeries = seriesList[activeIndex] || null

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % seriesList.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + seriesList.length) % seriesList.length)
  }

  // Ensure section exists in DOM even if no data, to avoid empty scrolling or layout jumps
  // Use a fallback if data is missing but section is triggered
  if (loading) {
    return (
      <section className="w-full flex items-center justify-center bg-[#F6F4ED]" style={{ height: vw(600) }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#756F3F]"></div>
      </section>
    )
  }

  if (seriesList.length === 0 || !currentSeries) {
    // If marker is present but no data found, return empty space but not crashing
    return <div className="h-[20vh] bg-[#F6F4ED]" id="more-applications-empty" />
  }

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#F6F4ED] flex flex-col items-center select-none"
      style={{ height: vw(1190) }}
    >
      {/* Background Container for Grid */}
      <div className="relative w-full h-full max-w-[1920px]">
        {/* Slot 0: Main Large Image (Left) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSeries.id + "-img0"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: vw(959), height: vw(1190) }}
          >
            <img 
              src={currentSeries.images[0]} 
              className="w-full h-full object-cover" 
              alt="Main Case" 
            />
          </motion.div>
        </AnimatePresence>

        {/* Small Images Grid (Right) */}
        <div className="absolute top-0 right-0 w-[vw(961)] h-full">
          {/* Slot 1: Rectangle 436 */}
          <div className="absolute" style={{ left: vw(1518 - 959), top: vw(205), width: vw(237), height: vw(327), zIndex: 10 }}>
            <ImageBox src={currentSeries.images[1]} id={currentSeries.id + "1"} />
          </div>

          {/* Slot 2: Rectangle 437 */}
          <div className="absolute" style={{ left: vw(1172 - 959), top: vw(406), width: vw(481), height: vw(519), zIndex: 5 }}>
            <ImageBox src={currentSeries.images[2]} id={currentSeries.id + "2"} />
          </div>

          {/* Slot 3: Rectangle 439 */}
          <div className="absolute" style={{ left: vw(1490 - 959), top: vw(632), width: vw(304), height: vw(469), zIndex: 8 }}>
            <ImageBox src={currentSeries.images[3]} id={currentSeries.id + "3"} />
          </div>

          {/* Slot 4: Rectangle 438 */}
          <div className="absolute" style={{ left: vw(1052 - 959), top: vw(708), width: vw(241), height: vw(354), zIndex: 6 }}>
            <ImageBox src={currentSeries.images[4]} id={currentSeries.id + "4"} />
          </div>
        </div>

        {/* Floating Decorative Petals/Vectors (Approximated) */}
        <div className="absolute inset-0 pointer-events-none z-20">
            <Petal style={{ left: vw(1044), top: vw(6989 - 6693), width: vw(182), opacity: 0.6 }} />
            <Petal style={{ left: vw(1433), top: vw(7778 - 6693), width: vw(129), transform: 'rotate(16deg)' }} />
            <Petal style={{ left: vw(1269), top: vw(7663 - 6693), width: vw(75), transform: 'rotate(10deg)' }} />
            <Petal style={{ left: vw(1145), top: vw(7135 - 6693), width: vw(69), transform: 'rotate(-12deg)' }} />
        </div>

        {/* Overlapping Title "Application   cases" */}
        <div className="absolute" style={{ left: vw(233), top: vw(532), zIndex: 30 }}>
          <h2 
            className="font-berkshire-swash text-[#F6F4ED] whitespace-pre select-none pointer-events-none drop-shadow-2xl"
            style={{ fontSize: vw(128), lineHeight: 1.1 }}
          >
            {"Application   cases"}
          </h2>
          {/* Active Series Tag/Label */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={currentSeries.name}
            className="mt-[vw(10)] bg-[#756F3F] text-white px-[vw(20)] py-[vw(5)] rounded-full w-fit uppercase font-anaheim tracking-widest text-[vw(20)]"
          >
            {currentSeries.name}
          </motion.div>
        </div>

        {/* Navigation Section (Top Right) */}
        <div className="absolute" style={{ right: vw(1920 - 1757), top: vw(6750 - 6693), zIndex: 40 }}>
          <div className="flex items-center gap-[vw(20)]">
             <span className="font-anaheim font-semibold uppercase text-[vw(32)] text-[#000000]">
                VIEW MORE
             </span>
             <button 
                onClick={handleNext}
                className="w-[vw(102)] h-[vw(66)] bg-[#CFC573] rounded-full flex items-center justify-center transition-all hover:bg-[#756F3F] active:scale-95 group"
             >
                <svg className="w-[vw(33)] h-[vw(18)] transition-transform group-hover:translate-x-1" viewBox="0 0 33 18" fill="none">
                  <path d="M1 9H31M31 9L23 1M31 9L23 17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
             </button>
          </div>
        </div>

      </div>
    </section>
  )
}

function ImageBox({ src, id }: { src: string, id: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id + src}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full overflow-hidden shadow-2xl"
        style={{ borderRadius: vw(30) }}
      >
        <img src={src} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt="Detail Case" />
      </motion.div>
    </AnimatePresence>
  )
}

function Petal({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute" style={style}>
      <svg viewBox="0 0 100 100" fill="#CEC19A" opacity="0.4">
        <path d="M50 0 C70 30 100 50 100 100 C 50 100 30 70 0 50 C 0 0 30 0 50 0 Z" />
      </svg>
    </div>
  )
}
