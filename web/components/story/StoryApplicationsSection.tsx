"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"
import { HollowText } from "@/components/common/HollowText"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface ApplicationItem {
  id?: number
  title: string
  image: MediaObject | null
  description?: string
}

interface MediaObject {
  url: string
  id: string
}

interface StoryApplicationsSectionProps {
  data: {
    title: string
    titleNodes?: any[]
    description: string
    descriptionNodes?: any[]
    viewButtonText?: string
    viewButtonLink?: string
    viewButtonNewTab?: boolean
    items: {
      slides: ApplicationItem[]
      autoplay: boolean
      interval: number
    }
  }
}

export function StoryApplicationsSection({ data }: StoryApplicationsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const lastActionTimeRef = React.useRef(0)
  const ACTION_THROTTLE = 300

  const slides = data.items.slides || []
  const totalSlides = slides.length

  const renderTitleNodes = (nodes?: any[]) => {
    if (!nodes || nodes.length === 0) return data.title;
    return nodes.map((n, i) => {
      if (n.type === "text") {
        const isBold = n.format & 1;
        const isEngineering = n.text.toLowerCase().includes("engineering");
        
        return (
          <div 
            key={i} 
            className="absolute whitespace-nowrap font-josefin-sans font-bold"
            style={{ 
              top: isEngineering ? vw(75) : vw(0),
              left: isEngineering ? 0 : vw(158),
              fontSize: isEngineering ? vw(90) : vw(140),
              zIndex: isBold ? 1 : 2,
            }}
          >
            {isBold ? (
              <HollowText strokeColor="#756f3f" strokeWidth={1}>
                {n.text}
              </HollowText>
            ) : (
              <span className="text-[#574f0e]">{n.text}</span>
            )}
          </div>
        )
      }
      return null;
    });
  };

  const renderDescriptionNodes = (nodes?: any[]) => {
    if (!nodes || nodes.length === 0) return data.description;
    return nodes.map((n, i) => {
      if (n.type === "text") {
        const isBold = n.format & 1;
        if (isBold) {
          return (
            <span key={i} className="text-[#ffbd23] font-bold" style={{ fontSize: vw(36) }}>
              {n.text}
            </span>
          )
        }
        return <span key={i} className="text-[#574f0e] font-semibold" style={{ fontSize: vw(32) }}>{n.text}</span>
      }
      if (n.type === "linebreak") return <br key={i} />
      return null;
    });
  };

  const handlePrev = () => {
    const now = Date.now()
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return
    lastActionTimeRef.current = now
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const handleNext = () => {
    const now = Date.now()
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return
    lastActionTimeRef.current = now
    setActiveIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  // Autoplay
  useEffect(() => {
    if (!data.items.autoplay || totalSlides <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
    }, (data.items.interval || 5) * 1000)
    return () => clearInterval(interval)
  }, [data.items.autoplay, data.items.interval, totalSlides])

  const visibleItems = useMemo(() => {
    if (totalSlides === 0) return []
    const list = []
    // Show current index and surrounding
    for (let i = -1; i <= 4; i++) {
        const idx = (activeIndex + i + totalSlides) % totalSlides
        list.push({ originalIdx: idx, relativeIdx: i })
    }
    return list
  }, [activeIndex, totalSlides])

  return (
    <section 
      id="applications"
      className="relative w-full bg-[#f6f4ed] overflow-hidden" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
         {/* 1. Title Area */}
         <div className="absolute" style={{ left: vw(179), top: vw(65) }}>
            <h2 className="relative" style={{ height: vw(140), width: vw(750) }}>
               {renderTitleNodes(data.titleNodes)}
            </h2>
         </div>

         {/* 2. Description Area */}
         <div className="absolute" style={{ left: vw(985), top: vw(72), width: vw(781) }}>
            <div className="font-josefin-sans leading-[1.4] text-left">
               {renderDescriptionNodes(data.descriptionNodes)}
            </div>
         </div>


         {/* 3. Carousel Area */}
         <div className="absolute w-full" style={{ left: vw(39), top: vw(303) }}>
            <AnimatePresence initial={false}>
              {slides.map((item, idx) => {
                 // Calculate the visual position relative to activeIndex
                 // We want the active item to be at visual index 1
                 const relativeIdx = (idx - activeIndex + totalSlides) % totalSlides
                 
                 // Show items in the visible range
                 const isVisible = relativeIdx >= 0 && relativeIdx <= 4
                 if (!isVisible) return null

                 const isActive = relativeIdx === 1

                 let xPos = 0
                 if (relativeIdx === 0) xPos = 0
                 else if (relativeIdx === 1) xPos = 467
                 else if (relativeIdx === 2) xPos = 934
                 else if (relativeIdx === 3) xPos = 1400
                 else xPos = 1400 + (relativeIdx - 3) * 467

                 return (
                   <motion.div 
                     key={`slide-${idx}`}
                     initial={false}
                     animate={{ 
                       height: isActive ? vw(575) : vw(403),
                       opacity: 1
                     }}
                     transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                     className="absolute overflow-hidden shadow-xl"
                     style={{ 
                       width: vw(442),
                       left: vw(xPos),
                       top: 0,
                       borderRadius: vw(30),
                       zIndex: isActive ? 10 : 1,
                       transition: `left 0.6s cubic-bezier(0.32, 0.72, 0, 1)`
                     }}
                   >
                      {item.image && (
                         <OptimizedImage 
                           image={item.image} 
                           alt={item.title} 
                           size="medium" 
                           loading="eager"
                           containerClassName="w-full h-full absolute inset-0"
                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                         />
                      )}
                   </motion.div>
                 )
              })}
            </AnimatePresence>

            {/* View Button - Fixed at bottom-right of item 2 position */}
            <motion.div 
              key={`view-btn-${activeIndex}`}
              className="absolute z-20"
              initial={{ scale: 0.85, opacity: 0.6, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
              style={{ 
                left: vw(940),
                top: vw(500),
              }}
            >
              <a 
                href={data.viewButtonLink || "#"}
                target={data.viewButtonNewTab ? "_blank" : undefined}
                rel={data.viewButtonNewTab ? "noopener noreferrer" : undefined}
                className="group/btn cursor-pointer transition-transform hover:scale-105 block"
              >
                <div 
                  className="relative flex items-center justify-between bg-[#756f3f] rounded-full border border-white/10"
                  style={{ width: vw(321), height: vw(71), paddingLeft: vw(24), paddingRight: vw(6) }}
                >
                  <span className="text-white font-josefin-sans font-medium whitespace-nowrap" style={{ fontSize: vw(20) }}>
                    {data.viewButtonText}
                  </span>
                  <div className="bg-white rounded-full flex items-center justify-center shrink-0" style={{ width: vw(58), height: vw(58) }}>
                    <svg style={{ width: vw(20), height: vw(20) }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#756f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </a>
            </motion.div>
         </div>

         {/* Navigation Controls */}
         <div className="absolute" style={{ left: vw(1555), top: vw(800) }}>
            <div className="flex" style={{ gap: vw(22) }}>
              <button 
                onClick={handlePrev}
                className="group rounded-full border border-[#b9b092] bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-[#c5b77e] hover:border-[#c5b77e] hover:shadow-lg hover:scale-105"
                style={{ width: vw(62), height: vw(62) }}
              >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="stroke-[#b9b092] group-hover:stroke-white transition-colors"
                    style={{ width: vw(14), height: vw(24), transform: "scale(1.2) rotate(180deg)" }}
                  >
                    <path d="M8.5 20.5l8-8.5-8-8.5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </button>
              <button 
                onClick={handleNext}
                className="group rounded-full border border-[#b9b092] bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-[#c5b77e] hover:border-[#c5b77e] hover:shadow-lg hover:scale-105"
                style={{ width: vw(62), height: vw(62) }}
              >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="stroke-[#b9b092] group-hover:stroke-white transition-colors duration-300"
                    style={{ width: vw(14), height: vw(24), transform: "scale(1.2)" }}
                  >
                    <path d="M8.5 20.5l8-8.5-8-8.5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </button>
            </div>
         </div>
      </div>
    </section>
  )
}
