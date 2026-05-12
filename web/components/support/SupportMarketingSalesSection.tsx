"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { 
  MarketingSalesNextBtn, 
  MarketingSalesPrevBtn 
} from "./MarketingSalesIcons"

interface ImageObject {
  url: string
  alt?: string
}

interface CarouselItem {
  id: string
  title: string
  description: string
  image?: ImageObject | null
}

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

const Area1Component = ({ title, items }: { title: string; items: CarouselItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const n = items.length

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % n)
  }, [n])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + n) % n)
  }, [n])

  if (n === 0) return null

  // [small, small, ACTIVE]
  const displayIndices = [(activeIndex - 2 + n) % n, (activeIndex - 1 + n) % n, activeIndex]
  const activeItem = items[activeIndex]

  return (
    <div className="relative w-full rounded-[30px] overflow-hidden flex flex-row"
         style={{
           height: vw(884),
           background: "linear-gradient(180deg, #756F3F 0%, #D4CA77 100%)"
         }}
    >
      {/* Photos (Moved inside root for better control) */}
      <div className="absolute inset-0 pointer-events-none z-10">
            {displayIndices.map((idx, i) => {
                const item = items[idx]
                const isActive = i === 2
                const xPositions = [129, 301, 484]
                const yPositions = [595, 595, 139]

                return (
                    <motion.div
                        key={`area1-${item.id}`}
                        layoutId={`area1-${item.id}`}
                        initial={false}
                        animate={{
                            left: vw(xPositions[i]),
                            top: vw(yPositions[i]),
                            width: isActive ? vw(513) : vw(153),
                            height: isActive ? vw(612) : vw(156),
                            borderRadius: isActive ? vw(61) : vw(30),
                            y: isActive ? [0, -15, 0] : 0
                        }}
                        transition={{ 
                            type: "spring", stiffness: 260, damping: 20,
                            y: isActive ? {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            } : { type: "spring" }
                        }}
                        className="bg-gray-300 absolute overflow-hidden shadow-2xl z-10 pointer-events-auto"
                    >
                        {item.image?.url && (
                          <motion.img 
                            layoutId={`area1-${item.id}-img`}
                            src={item.image.url} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {!item.image?.url && <div className="w-full h-full bg-[#D9D9D9]" />}
                    </motion.div>
                )
            })}
      </div>

      {/* Decorative Title + Bar Stack (x: 123, top: 220) */}
      <div className="absolute z-20 flex flex-col items-start"
           style={{ top: vw(220), left: vw(123), width: vw(302), gap: vw(24) }}>
        <h3 className="text-white font-bold font-josefin-sans uppercase text-left"
            style={{ fontSize: vw(48), lineHeight: 1.525 }}>
          {title}
        </h3>
        <div className="bg-[#FFED77] rounded-sm" 
             style={{ width: vw(72), height: vw(17) }} />
      </div>

      {/* Controls (x: 1516, 1636, y: 799 - 130 = 669) */}
      <div className="absolute z-50" style={{ left: vw(1516), top: vw(669) }}>
        <MarketingSalesPrevBtn onClick={handlePrev} size={vw(83)} />
      </div>
      <div className="absolute z-50" style={{ left: vw(1636), top: vw(669) }}>
        <MarketingSalesNextBtn onClick={handleNext} size={vw(83)} />
      </div>

      {/* Interactive Content Stack (Title, Description, Indicators) - Anchored Bottom-Up */}
      <div className="absolute flex flex-col-reverse items-start z-30"
           style={{ left: vw(1069), bottom: vw(148), width: vw(690) }}>
          
          {/* Indicators (x: 1075 = 1069 + ML 6) */}
          <div className="flex items-center" style={{ gap: vw(12), marginLeft: vw(6) }}>
              {items.map((_, idx) => (
                  <div key={idx}
                      className={`rounded-full transition-all duration-300 ${idx === activeIndex ? "bg-white" : "bg-white/50"}`}
                      style={{ width: idx === activeIndex ? vw(30) : vw(18), height: idx === activeIndex ? vw(30) : vw(18) }} />
              ))}
          </div>

          {/* Description Block */}
          <div className="w-full bg-black/30 border border-[#DED47F]"
               style={{ borderRadius: vw(30), padding: vw(38), marginBottom: vw(100) }}>
              <p className="text-[#FFF394] font-semibold leading-normal font-josefin-sans text-left"
                 style={{ fontSize: vw(28), lineHeight: 1.714 }}>
                  {activeItem.description}
              </p>
          </div>

          {/* Title */}
          <h4 className="text-white font-bold leading-tight font-josefin-sans text-left w-full"
              style={{ fontSize: vw(42), lineHeight: 1.285, marginBottom: vw(24) }}>
              {activeItem.title}
          </h4>
      </div>
    </div>
  )
}

const Area2Component = ({ title, items }: { title: string; items: CarouselItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const n = items.length

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % n)
  }, [n])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + n) % n)
  }, [n])

  if (n === 0) return null

  // Photos: [Active (x:860, y:126), Item2 (x:1402, y:582), Item3 (x:1574, y:582)]
  const displayIndices = [activeIndex, (activeIndex + 1) % n, (activeIndex + 2) % n]
  const activeItem = items[activeIndex]

  return (
    <div className="relative w-full overflow-hidden" 
         style={{ height: vw(870) }}>
      {/* Background (y: 0 in design) */}
      <div className="absolute left-0 rounded-[30px] overflow-hidden"
           style={{
             top: 0,
             width: vw(1860),
             height: vw(870),
             background: "linear-gradient(180deg, #D4CA77 0%, #756F3F 100%)"
           }}
      />

      {/* Decorative Title + Bar Stack (x: 1425, top: 207) */}
      <div className="absolute z-20 flex flex-col items-start"
           style={{ top: vw(207), left: vw(1425), width: vw(302), gap: vw(24) }}>
        <h3 className="text-white font-bold font-josefin-sans uppercase text-left"
            style={{ fontSize: vw(48), lineHeight: 1.525 }}>
          {title}
        </h3>
        <div className="bg-[#FFED77] rounded-sm" 
             style={{ width: vw(72), height: vw(17) }} />
      </div>

      {/* Photos Row */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {displayIndices.map((idx, i) => {
            const item = items[idx]
            const isActive = i === 0
            
            const xPositions = [860, 1402, 1574]
            const yPositions = [126, 582, 582]

            return (
                <motion.div
                    key={`area2-${item.id}`}
                    layoutId={`area2-${item.id}`}
                    initial={false}
                    animate={{
                        left: vw(xPositions[i]),
                        top: vw(yPositions[i]),
                        width: isActive ? vw(513) : vw(153),
                        height: isActive ? vw(612) : vw(156),
                        borderRadius: isActive ? vw(61) : vw(30),
                        y: isActive ? [0, -15, 0] : 0
                    }}
                    transition={{ 
                        type: "spring", stiffness: 260, damping: 20,
                        y: isActive ? {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : { type: "spring" }
                    }}
                    className="bg-gray-300 absolute overflow-hidden shadow-2xl z-10 pointer-events-auto"
                >
                    {item.image?.url && (
                        <motion.img 
                        layoutId={`area2-${item.id}-img`}
                        src={item.image.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        />
                    )}
                    {!item.image?.url && <div className="w-full h-full bg-[#D9D9D9]" />}
                </motion.div>
            )
        })}
      </div>

      {/* Controls (x: 129, 249, y: 656) */}
      <div className="absolute z-30" style={{ left: vw(129), top: vw(656) }}>
        <MarketingSalesPrevBtn onClick={handlePrev} size={vw(83)} />
      </div>
      <div className="absolute z-30" style={{ left: vw(249), top: vw(656) }}>
        <MarketingSalesNextBtn onClick={handleNext} size={vw(83)} />
      </div>

      {/* Interactive Content Stack (Title, Description, Indicators) - Anchored Bottom-Up */}
      <div className="absolute flex flex-col-reverse items-start z-30"
           style={{ left: vw(123), bottom: vw(191), width: vw(663) }}>
          
          {/* Indicators (Aligned to right edge of container) */}
          <div className="flex items-center self-end" style={{ gap: vw(12) }}>
              {items.map((_, idx) => (
                  <div key={idx}
                      className={`rounded-full transition-all duration-300 ${idx === activeIndex ? "bg-white" : "bg-white/50"}`}
                      style={{ width: idx === activeIndex ? vw(30) : vw(18), height: idx === activeIndex ? vw(30) : vw(18) }} />
              ))}
          </div>

          {/* Description Block */}
          <div className="w-full bg-black/30 border border-[#DED47F]"
               style={{ borderRadius: vw(30), padding: vw(38), marginBottom: vw(100) }}>
              <p className="text-[#FFF394] font-semibold leading-normal font-josefin-sans text-left"
                 style={{ fontSize: vw(28), lineHeight: 1.714 }}>
                  {activeItem.description}
              </p>
          </div>

          {/* Title */}
          <h4 className="text-white font-bold leading-tight font-josefin-sans uppercase text-left w-full"
              style={{ fontSize: vw(29), lineHeight: 1.285, marginBottom: vw(24) }}>
              {activeItem.title}
          </h4>
      </div>
    </div>
  )
}

export const SupportMarketingSalesSection = ({ data }: { data: any }) => {
  if (!data) return null

  return (
    <section className="relative w-full bg-[#f6f4ed] overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
            background: "linear-gradient(180deg, #756F3F 25%, #DBD076 100%)"
        }}
      />

      {/* --- DESKTOP VIEW (md and above) --- */}
      <div className="hidden md:block relative w-full" style={{ minHeight: vw(1800) }}>
        <div className="relative mx-auto"
             style={{ maxWidth: vw(1920), paddingTop: vw(120) }}>
          {/* Header */}
          <div className="px-[vw(314.4)]" 
               style={{ marginBottom: vw(-40), paddingLeft: vw(314.4) }}>
                <h2 className="relative text-[#FFE82F] font-bold font-josefin-sans whitespace-pre-wrap z-[30]"
                   style={{ fontSize: vw(60), lineHeight: 1, width: vw(1000) }}>
                  {data.title}
                </h2>
          </div>

          {/* Absolute Background Decorator Text */}
          <div className="absolute font-bold font-josefin-sans"
               style={{ 
                   top: vw(120), 
                   right: 0, 
                   pointerEvents: 'none' 
               }}>
               <span className="relative text-white/40 z-[30]"
                     style={{ fontSize: vw(120), lineHeight: 0.8 }}>
                  {data.decoratorText}
               </span>
          </div>

          {/* Areas - scaled to 80% */}
          <div className="flex flex-col items-center w-full" style={{ gap: vw(10) }}>
             <div style={{ width: vw(1860), transform: "scale(0.8)", transformOrigin: "top center" }}>
               <Area1Component 
                 title={data.area1?.title || "Marketing Assets & Promotion"} 
                 items={data.area1?.items || []} 
               />
             </div>
             <div style={{ width: vw(1860), marginTop: vw(-166.8), transform: "scale(0.8)", transformOrigin: "top center" }}>
               <Area2Component 
                 title={data.area2?.title || "Sales Enablement & Channel Support"} 
                 items={data.area2?.items || []} 
               />
             </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW (Below md) --- */}
      <div className="md:hidden relative w-full flex flex-col py-16 px-6 space-y-12">
        {/* Mobile Header */}
        <div className="text-center space-y-2">
            <h2 className="text-[#FFE82F] font-bold font-josefin-sans text-4xl leading-tight">
                {data.title}
            </h2>
            <p className="text-white/60 font-josefin-sans text-xl font-bold uppercase tracking-widest">
                {data.decoratorText}
            </p>
        </div>

        {/* Area 1 Mobile */}
        <Area1Mobile 
            title={data.area1?.title || "Marketing Assets"} 
            items={data.area1?.items || []} 
        />

        {/* Area 2 Mobile */}
        <Area2Mobile 
            title={data.area2?.title || "Sales Enablement"} 
            items={data.area2?.items || []} 
        />
      </div>
    </section>
  )
}

const Area1Mobile = ({ title, items }: { title: string; items: CarouselItem[] }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const n = items.length
    if (n === 0) return null

    const activeItem = items[activeIndex]

    return (
        <div className="w-full rounded-[24px] p-8 space-y-8 overflow-hidden shadow-2xl"
             style={{ background: "linear-gradient(180deg, #756F3F 0%, #D4CA77 100%)" }}>
            
            {/* Header */}
            <div className="space-y-3">
                <h3 className="text-white font-bold font-josefin-sans uppercase text-2xl leading-tight">
                    {title}
                </h3>
                <div className="bg-[#FFED77] w-12 h-2 rounded-sm" />
            </div>

            {/* Active Image */}
            <div className="relative w-full aspect-[4/5] flex justify-center items-center">
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gray-300 rounded-[30px] overflow-hidden shadow-xl"
                >
                    {activeItem.image?.url && (
                        <img src={activeItem.image.url} alt={activeItem.title} className="w-full h-full object-cover" />
                    )}
                </motion.div>
            </div>

            {/* Navigation & Info */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <MarketingSalesPrevBtn onClick={() => setActiveIndex((activeIndex - 1 + n) % n)} size="60px" />
                    {/* Indicators */}
                    <div className="flex gap-2">
                        {items.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-white w-4" : "bg-white/40"} transition-all`} />
                        ))}
                    </div>
                    <MarketingSalesNextBtn onClick={() => setActiveIndex((activeIndex + 1) % n)} size="60px" />
                </div>

                <div className="bg-black/20 border border-[#DED47F] rounded-[20px] p-5 space-y-2">
                    <h4 className="text-white font-bold font-josefin-sans text-xl uppercase">{activeItem.title}</h4>
                    <p className="text-[#FFF394] font-semibold font-josefin-sans text-sm leading-relaxed">
                        {activeItem.description}
                    </p>
                </div>
            </div>
        </div>
    )
}

const Area2Mobile = ({ title, items }: { title: string; items: CarouselItem[] }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const n = items.length
    if (n === 0) return null

    const activeItem = items[activeIndex]

    return (
        <div className="w-full rounded-[24px] p-8 space-y-8 overflow-hidden shadow-2xl"
             style={{ background: "linear-gradient(180deg, #D4CA77 0%, #756F3F 100%)" }}>
            
            {/* Header */}
            <div className="space-y-3">
                <h3 className="text-white font-bold font-josefin-sans uppercase text-2xl leading-tight">
                    {title}
                </h3>
                <div className="bg-[#FFED77] w-12 h-2 rounded-sm" />
            </div>

            {/* Active Image */}
            <div className="relative w-full aspect-[4/5] flex justify-center items-center">
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gray-300 rounded-[30px] overflow-hidden shadow-xl"
                >
                    {activeItem.image?.url && (
                        <img src={activeItem.image.url} alt={activeItem.title} className="w-full h-full object-cover" />
                    )}
                </motion.div>
            </div>

            {/* Navigation & Info */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <MarketingSalesPrevBtn onClick={() => setActiveIndex((activeIndex - 1 + n) % n)} size="60px" />
                    {/* Indicators */}
                    <div className="flex gap-2">
                        {items.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-white w-4" : "bg-white/40"} transition-all`} />
                        ))}
                    </div>
                    <MarketingSalesNextBtn onClick={() => setActiveIndex((activeIndex + 1) % n)} size="60px" />
                </div>

                <div className="bg-black/20 border border-[#DED47F] rounded-[20px] p-5 space-y-2">
                    <h4 className="text-white font-bold font-josefin-sans text-xl uppercase">{activeItem.title}</h4>
                    <p className="text-[#FFF394] font-semibold font-josefin-sans text-sm leading-relaxed">
                        {activeItem.description}
                    </p>
                </div>
            </div>
        </div>
    )
}