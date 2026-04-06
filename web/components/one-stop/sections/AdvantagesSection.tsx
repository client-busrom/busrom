"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
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
  
  // 1920 Design scaling - Ultra-wide and tall to restore image proportions
  const cardWidth = 480
  const cardHeight = 650
  const gap = 30
  const basePadding = 140
  // Scaling basePadding to match the vw logic used in the layout
  const basePaddingVW = (basePadding / DESIGN_WIDTH) * 100

  // Logic: Active item slides into the 2nd slot (offset by basePadding)
  const scrollOffset = -index * (cardWidth + gap)

  if (!advantages || advantages.length === 0) return null

  return (
    <section 
      className="relative w-full overflow-hidden bg-transparent select-none py-12 md:py-0 md:min-h-[922px]"
    >
      <div className="flex flex-col w-full h-full">
        
        {/* 1. Background decorative circular element */}
        <div 
          className="absolute rounded-full pointer-events-none opacity-40 md:opacity-80"
          style={{ 
            left: typeof window !== 'undefined' && window.innerWidth < 768 ? '-20vw' : vw(-328.3), 
            top: typeof window !== 'undefined' && window.innerWidth < 768 ? '-10vw' : vw(-280),    
            width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : vw(896),   
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vw' : vw(896),
            background: "linear-gradient(to bottom, rgba(236, 232, 216, 0.28) 0%, rgba(236, 232, 216, 1) 100%)",
          }}
        />

        {/* 2. Section Title */}
        <div className="relative z-20 pointer-events-none px-10 md:pl-[140px] mb-8 md:mb-[16px] w-full md:w-[1000px] text-center md:text-left">
          <h2 
            className="font-semibold leading-tight tracking-tight text-[#756F3F] text-[32px] md:text-[60px]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(to right, #756F3F 0%, rgba(117, 111, 63, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Advantages And Features<br />Of Busrom's One-Stop Purchasing").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 3. Carousel Wrap */}
        <div className="relative w-full overflow-hidden" style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? '550px' : vw(1000) }}>
            <motion.div
                className="flex absolute top-0"
                style={{ 
                    left: typeof window !== 'undefined' && window.innerWidth < 768 ? '7.5vw' : vw(basePadding),
                    gap: typeof window !== 'undefined' && window.innerWidth < 768 ? '4vw' : vw(gap),
                    paddingTop: typeof window !== 'undefined' && window.innerWidth < 768 ? '20px' : vw(50),     
                }}
                animate={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? -(index * (window.innerWidth * 0.85 + window.innerWidth * 0.04)) : scrollOffset / 19.2 + "vw" }}
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
                    className="bg-white flex-shrink-0 relative overflow-hidden select-none cursor-pointer"
                    style={{ 
                        width: typeof window !== 'undefined' && window.innerWidth < 768 ? "85vw" : vw(cardWidth),
                        height: typeof window !== 'undefined' && window.innerWidth < 768 ? "450px" : vw(cardHeight),
                        borderRadius: vw(21), 
                        padding: typeof window !== 'undefined' && window.innerWidth < 768 ? "24px" : vw(30)     
                    }}
                    onClick={() => setIndex(idx)}
                    >
                    {/* Card Header */}
                    <div className="relative" style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? "80px" : vw(105), marginBottom: vw(15) }}>
                        <motion.div 
                            className="absolute left-0 top-0 bg-[#BCB158] rounded-full shrink-0 z-0" 
                            style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? "40px" : vw(56.7), height: typeof window !== 'undefined' && window.innerWidth < 768 ? "40px" : vw(56.7) }}
                            animate={isActive ? { 
                                scale: [1, 1.1, 1.05, 1],
                                y: [0, -6, 2, 0],
                                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            } : {}}
                        />
                        <h3 
                            className={`relative z-10 leading-tight transition-all duration-500 ${isActive ? 'font-extrabold text-black' : 'font-medium text-[#4A4A4A]'}`}
                            style={{ 
                                fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? "18px" : vw(24), 
                                fontFamily: "var(--font-anaheim)",
                                paddingTop: typeof window !== 'undefined' && window.innerWidth < 768 ? "12px" : vw(20),
                                paddingLeft: typeof window !== 'undefined' && window.innerWidth < 768 ? "20px" : vw(30) 
                            }}
                        >
                            {item.title}
                        </h3>
                    </div>

                    {/* Card Image */}
                    <div 
                        className="rounded-[20px] md:rounded-[30px] shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] overflow-hidden bg-gray-50"
                        style={{ 
                        width: "100%", 
                        height: typeof window !== 'undefined' && window.innerWidth < 768 ? "220px" : vw(332), 
                        marginBottom: typeof window !== 'undefined' && window.innerWidth < 768 ? "20px" : vw(35), 
                        }}
                    >
                        <OptimizedImage 
                            image={item.image}
                            size="small"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Description Text */}
                    <div className="w-full">
                        <p 
                        className="font-medium leading-normal text-black text-justify"
                        style={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? "14px" : vw(16), fontFamily: "var(--font-anaheim)" }}
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
