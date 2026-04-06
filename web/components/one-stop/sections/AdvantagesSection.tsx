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
  const cardHeight = 700
  const gap = 30
  const basePadding = 256.9

  // Logic: Active item slides into the 2nd slot (offset by basePadding)
  const scrollOffset = -index * (cardWidth + gap)

  if (!advantages || advantages.length === 0) return null

  return (
    <section 
      className="relative w-full overflow-visible select-none"
      style={{ minHeight: vw(922)}}
    >
      <div className="flex flex-col w-full h-full">
        
        {/* 1. Background decorative circular element */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{ 
            left: vw(-328.3), 
            top: vw(-280),    
            width: vw(896),   
            height: vw(896),
            background: "linear-gradient(to bottom, rgba(236, 232, 216, 0.28) 0%, rgba(236, 232, 216, 1) 100%)",
            opacity: 0.8
          }}
        />

        {/* 2. Section Title - Using Golden Scale (60px) */}
        <div className="relative z-20 pointer-events-none" style={{ paddingLeft: vw(107.1), marginBottom: vw(56), width: vw(1000) }}>
          <h2 
            className="font-semibold leading-tight tracking-tight text-[#756F3F]"
            style={{ 
              fontSize: vw(60), 
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(to right, #756F3F 0%, rgba(117, 111, 63, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Advantages And Features<br />Of Busrom's One-Stop Purchasing").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 3. Carousel Wrap */}
        <div className="relative w-full overflow-hidden" style={{ height: vw(1000) }}>
            <motion.div
                className="flex absolute top-0"
                style={{ 
                    left: vw(basePadding),
                    gap: vw(gap),
                    paddingTop: vw(50),     
                    paddingBottom: vw(230), 
                }}
                animate={{ x: `${scrollOffset / 19.2}vw` }}
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
                        width: vw(cardWidth),
                        height: vw(cardHeight),
                        borderRadius: vw(21), 
                        padding: vw(30)     
                    }}
                    onClick={() => setIndex(idx)}
                    >
                    {/* Card Header - Locked 2nd/3rd Quadrant Start */}
                    <div className="relative" style={{ height: vw(105), marginBottom: vw(15) }}>
                        <div 
                            className="absolute left-0 top-0 bg-[#BCB158] rounded-full shrink-0" 
                            style={{ width: vw(56.7), height: vw(56.7) }}
                        />
                        <h3 
                            className="relative z-10 font-extrabold leading-tight text-black"
                            style={{ 
                                fontSize: vw(24), 
                                fontFamily: "var(--font-anaheim)",
                                paddingTop: vw(28),
                                paddingLeft: vw(35) 
                            }}
                        >
                            {item.title}
                        </h3>
                    </div>

                    {/* Card Image - Proportional Scaling with OptimizedImage */}
                    <div 
                        className="rounded-[30px] shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] overflow-hidden bg-gray-50"
                        style={{ 
                        width: vw(420), 
                        height: vw(332), 
                        marginBottom: vw(35), 
                        borderRadius: vw(21)
                        }}
                    >
                        <OptimizedImage 
                            image={item.image}
                            size="small"
                            className="w-full h-full"
                        />
                    </div>

                    {/* Description Text */}
                    <div style={{ width: vw(420) }}>
                        <p 
                        className="font-medium leading-normal text-black text-justify"
                        style={{ fontSize: vw(16), fontFamily: "var(--font-anaheim)" }}
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
