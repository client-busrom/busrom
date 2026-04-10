import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const vw = (px: number) => `${(px / 1920) * 100}vw`

interface ApplicationMoreCasesSectionProps {
  locale: string
  data: {
    title: { text: string; bold?: boolean }[]
    tips?: string
    ctaText?: string
    ctaHref?: string
    applications?: any[]
  }
}

interface SeriesData {
  id: string
  name: string
  images: any[]
}

export function ApplicationMoreCasesSection({ locale, data }: ApplicationMoreCasesSectionProps) {
  const [seriesList, setSeriesList] = useState<SeriesData[]>(() => {
    // Initialize from props if available
    if (data.applications && data.applications.length > 0) {
      return data.applications.map(app => ({
        id: String(app.id),
        name: app.title || "",
        images: Array.isArray(app.image) ? app.image : [app.image]
      }))
    }
    return []
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const lastClickTime = React.useRef(0)

  useEffect(() => {
    // Only fetch if we don't have data from props
    if (data.applications && data.applications.length > 0) return

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/more-cases?locale=${locale}`)
        const json = await res.json()
        if (json.series && json.series.length > 0) {
          setSeriesList(json.series)
        }
      } catch (e) {
        console.error("Failed to fetch more cases data", e)
      }
    }
    fetchData()
  }, [locale, data.applications])

  const handleNext = () => {
    if (seriesList.length === 0) return
    const now = Date.now()
    if (now - lastClickTime.current < 200) return
    lastClickTime.current = now
    setActiveIndex((prev) => (prev + 1) % seriesList.length)
  }

  const currentSeries = seriesList[activeIndex] || null

  const baseLineY = 6693
  const S = 922 / 1190 // Height scale factor

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#FFFDF8] flex flex-col items-center select-none"
      style={{ height: vw(922) }}
    >
      <div className="relative w-full h-full max-w-[1920px]">
        
        {/* Slot 0: Main Large Image */}
        <AnimatePresence mode="wait">
          {currentSeries && (
            <motion.div
              key={currentSeries.id + "-main"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute left-0 top-0 overflow-hidden"
              style={{ 
                width: vw(959), 
                height: vw(922), 
                zIndex: 10,
                borderTopRightRadius: vw(60),
                borderBottomRightRadius: vw(60)
              }}
            >
              <OptimizedImage 
                image={currentSeries.images[0]} 
                className="w-full h-full object-cover" 
                alt={currentSeries.name || "Main Case"} 
                size="xlarge"
                loading="eager"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Images - ZIndex 15 (Below decorative and title) */}
        {currentSeries && (
          <div className="absolute inset-0 z-[15] pointer-events-none">
            {/* Slot 1: Rectangle 436 */}
            <div 
              className="absolute pointer-events-auto" 
              style={{ 
                left: vw(1518), 
                top: vw(205 * S), 
                width: vw(237), 
                height: vw(327 * S),
                zIndex: 15
              }}
            >
              <ImageBox src={currentSeries.images[1]} id={currentSeries.id + "1"} />
            </div>

            {/* Slot 2: Rectangle 437 */}
            <div 
              className="absolute pointer-events-auto" 
              style={{ 
                left: vw(1172), 
                top: vw(406 * S), 
                width: vw(481), 
                height: vw(519 * S),
                zIndex: 16
              }}
            >
              <ImageBox src={currentSeries.images[2]} id={currentSeries.id + "2"} />
            </div>

            {/* Slot 3: Rectangle 439 */}
            <div 
              className="absolute pointer-events-auto" 
              style={{ 
                left: vw(1490), 
                top: vw(632 * S), 
                width: vw(304), 
                height: vw(469 * S),
                zIndex: 17
              }}
            >
              <ImageBox src={currentSeries.images[3]} id={currentSeries.id + "3"} />
            </div>

            {/* Slot 4: Rectangle 438 */}
            <div 
              className="absolute pointer-events-auto" 
              style={{ 
                left: vw(1052), 
                top: vw(708 * S), 
                width: vw(241), 
                height: vw(354 * S),
                zIndex: 18
              }}
            >
              <ImageBox src={currentSeries.images[4]} id={currentSeries.id + "4"} />
            </div>
          </div>
        )}

        {/* Decorative Assets - ZIndex 30 (Above images) */}
        <div className="absolute inset-0 pointer-events-none z-30">
            <img 
              src="/assets/images/application/More.svg" 
              className="absolute" 
              style={{ left: vw(497), top: vw(6914 - baseLineY), width: vw(411.8), height: vw(154.7), opacity: 1 }} 
              alt=""
            />
            <img 
              src="/assets/images/application/BusromIcon.svg" 
              className="absolute" 
              style={{ left: vw(1167), top: vw(6853 - baseLineY), width: vw(574.9), height: vw(694.2), opacity: 1 }} 
              alt=""
            />
        </div>

        {/* Floating Tips Text */}
        {data.tips && (
           <div 
             className="absolute font-berkshire-swash text-[#756F3F] opacity-70 pointer-events-none"
             style={{ 
               left: vw(1044), 
               top: vw(6989 - baseLineY), 
               width: vw(182.3), 
               height: vw(26.4),
               fontSize: vw(26), 
               lineHeight: 1
             }}
           >
             {data.tips}
           </div>
        )}

        {/* Split Title Layout - ZIndex 50 */}
        <div className="absolute inset-0 pointer-events-none z-50 text-shadow-sm">
          <h2 
            className="absolute font-berkshire-swash text-[#FFFFFF] select-none text-right"
            style={{ 
              left: vw(240), 
              top: vw(7144 - baseLineY), 
              width: vw(669),
              fontSize: vw(128), 
              lineHeight: 1.1,
              textShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {data.title?.[0]?.text?.split(" ")?.[0] || "Application"}
          </h2>
          
          <h2 
            className="absolute font-berkshire-swash text-[#000000] select-none"
            style={{ 
              left: vw(1039), 
              top: vw(7144 - baseLineY), 
              fontSize: vw(128), 
              lineHeight: 1.1,
              textShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}
          >
            {data.title?.[0]?.text?.split(" ")?.slice(1).join(" ") || "cases"}
          </h2>
        </div>

        {/* Navigation Section (Top Right) - Unified Interactive Group */}
        <div className="absolute z-60" style={{ left: vw(1471), top: vw(6732 - baseLineY) }}>
          <a 
            href={data?.ctaHref || "#"} 
            className="flex items-center group cursor-pointer no-underline"
            style={{ gap: vw(18) }}
          >
            <span 
              className="font-anaheim font-semibold uppercase text-[#000000] group-hover:text-[#756F3F] transition-colors"
              style={{ fontSize: vw(32), lineHeight: vw(30) }}
            >
              {data?.ctaText || "view more"}
            </span>
            <div 
              onClick={(e) => {
                // If you want the arrow to ONLY switch cases, stop propagation:
                // e.preventDefault() 
                // e.stopPropagation()
                handleNext()
              }}
              className="flex items-center justify-center transition-all group-hover:bg-[#5D5732] active:scale-95"
              style={{ width: vw(102.4), height: vw(66), backgroundColor: '#756F3F', borderRadius: vw(39) }}
            >
              <svg className="transition-transform group-hover:translate-x-1" style={{ width: vw(33), height: vw(18) }} viewBox="0 0 33 18" fill="none">
                <path d="M1 9H31M31 9L23 1M31 9L23 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </a>
        </div>

      </div>
    </section>
  )
}

function ImageBox({ src, id }: { src: any, id: string }) {
  const imageUrl = typeof src === 'string' ? src : src?.url
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id + imageUrl}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full overflow-hidden shadow-2xl"
        style={{ borderRadius: vw(30), backgroundColor: '#F0F0F0' }}
      >
        <OptimizedImage 
          image={src} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          alt="Detail Case"
          size="large"
          loading="eager"
        />
      </motion.div>
    </AnimatePresence>
  )
}
