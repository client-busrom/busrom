"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface SectionSlide {
  title: string
  description: string
  image: { url: string } | any
}

interface AdvantagesSectionProps {
  title?: string
  advantages: SectionSlide[]
}

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

export function AdvantagesSection({ title, advantages }: AdvantagesSectionProps) {
  const [index, setIndex] = useState(0)
  
  // Responsive measurements
  const [layout, setLayout] = useState({ 
    type: 'mobile', 
    width: 0, 
    gap: 16, 
    padding: 24, 
    cardH: 450
  })

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 640) {
        // MOBILE: Dynamic Heights
        setLayout({ type: 'mobile', width: w * 0.66, gap: 16, padding: 30, cardH: 400 })
      } else if (w < 1024) {
        // TABLET: Dynamic Heights
        setLayout({ type: 'tablet', width: w * 0.35, gap: 20, padding: 60, cardH: 450 })
      } else {
        // DESKTOP: Precise Design Parity (465x766)
        setLayout({ 
          type: 'desktop', 
          width: (465 / 1920) * w, 
          gap: (30 / 1920) * w, 
          padding: (140 / 1920) * w, 
          cardH: (766 / 1920) * w
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate dynamic scroll offset - Centering logic for Mobile/Tablet
  const scrollValue = layout.type === 'desktop' 
    ? -index * (layout.width + layout.gap)
    : (typeof window !== 'undefined' ? window.innerWidth / 2 - layout.width / 2 : 0) - (index * (layout.width + layout.gap))

  if (!advantages || advantages.length === 0) return null

  return (
    <section 
      className="relative w-full bg-transparent select-none py-12 lg:py-0 lg:h-[48vw]"
    >
      <div className="flex flex-col w-full h-full justify-center">
        
        {/* 1. Background decorative circular element */}
        <div 
          className="absolute rounded-full pointer-events-none opacity-40 lg:opacity-80"
          style={{ 
            left: layout.type === 'desktop' ? vw(-328.3) : '-20vw', 
            top: layout.type === 'desktop' ? vw(-280) : '-10vw',    
            width: layout.type === 'desktop' ? vw(896) : '100vw',   
            height: layout.type === 'desktop' ? vw(896) : '100vw',
            background: "linear-gradient(to bottom, rgba(236, 232, 216, 0.28) 0%, rgba(236, 232, 216, 1) 100%)",
          }}
        />

        {/* 2. Section Title */}
        <div className="relative z-20 pointer-events-none px-10 lg:pl-[140px] mb-8 lg:mb-[16px] w-full lg:w-[1000px] text-center lg:text-left">
          <h2 
            className="font-semibold leading-tight tracking-tight text-[#756F3F] text-[32px] lg:text-[60px]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(to right, #756F3F 0%, rgba(117, 111, 63, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Advantages And Features<br />Of Busrom's One-Stop Purchasing").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 3. Carousel - Dynamic Height (Tallest Wins) */}
        <div className="relative w-full h-auto pb-20">
            <motion.div
                className="flex relative items-stretch"
                style={{ 
                    left: layout.type === 'desktop' ? layout.padding : 0,
                    gap: layout.gap,
                    paddingTop: layout.type === 'desktop' ? vw(50) : '20px',     
                }}
                animate={{ x: scrollValue }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {advantages.map((item, idx) => {
                const isActive = idx === index
                
                return (
                    <motion.div
                    key={idx}
                    animate={{ 
                        boxShadow: isActive 
                        ? "0px 78px 105.8px rgba(0, 0, 0, 0.15)" 
                        : "0px 4px 20px rgba(0, 0, 0, 0.05)",
                        scale: isActive ? 1 : 0.96,
                        opacity: isActive ? 1 : 0.8
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-white flex-shrink-0 relative overflow-hidden select-none cursor-pointer flex flex-col"
                    style={{ 
                        width: layout.width,
                        minHeight: layout.cardH,
                        height: 'auto',
                        borderRadius: vw(21), 
                        padding: layout.type === 'desktop' ? vw(30) : "24px"     
                    }}
                    onClick={() => setIndex(idx)}
                    >
                    {/* Card Header */}
                    <div className="relative" style={{ height: layout.type === 'desktop' ? vw(105) : "80px", marginBottom: vw(5) }}>
                        <motion.div 
                            className="absolute left-0 top-0 bg-[#BCB158] rounded-full shrink-0 z-0" 
                            style={{ width: layout.type === 'desktop' ? vw(56.7) : "40px", height: layout.type === 'desktop' ? vw(56.7) : "40px" }}
                            animate={isActive ? { 
                                scale: [1, 1.1, 1.05, 1],
                                y: [0, -6, 2, 0],
                                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            } : {}}
                        />
                        <h3 
                            className={`relative z-10 leading-tight transition-all duration-500 ${isActive ? 'font-extrabold text-black' : 'font-medium text-[#4A4A4A]'}`}
                            style={{ 
                                fontSize: layout.type === 'desktop' ? vw(24) : "18px", 
                                fontFamily: "var(--font-anaheim)",
                                paddingTop: layout.type === 'desktop' ? vw(20) : "12px",
                                paddingLeft: layout.type === 'desktop' ? vw(30) : "20px" 
                            }}
                        >
                            {item.title}
                        </h3>
                    </div>

                    {/* Card Image */}
                    <div 
                        className="rounded-[20px] lg:rounded-[30px] shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] overflow-hidden bg-gray-50"
                        style={{ 
                        width: "100%", 
                        height: layout.type === 'desktop' ? vw(300) : "185px", 
                        marginBottom: layout.type === 'desktop' ? vw(15) : "10px", 
                        }}
                    >
                        <OptimizedImage 
                            image={item.image}
                            size="medium"
                            className="w-full h-full object-cover"
                            alt={item.title}
                        />
                    </div>

                    {/* Description Text */}
                    <div className="w-full">
                        <p 
                        className="font-medium leading-normal text-black text-justify"
                        style={{ 
                          fontSize: layout.type === 'desktop' ? vw(20) : "15px", 
                          fontFamily: "var(--font-anaheim)" 
                        }}
                        >
                        {item.description}
                        </p>
                    </div>
                    </motion.div>
                )
                })}
            </motion.div>
        </div>
      </div>
    </section>
  )
}
