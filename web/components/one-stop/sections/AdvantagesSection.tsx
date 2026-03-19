"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, animate } from "framer-motion"

interface SectionSlide {
  title: string
  description: string
  image: { url: string } | null
}

interface AdvantagesSectionProps {
  title?: string
  advantages: SectionSlide[]
}

/**
 * AdvantagesSection - Advantages and features
 * Rebuilt to support Draggable Carousel and Conditional Shadow on Active Item.
 */
export function AdvantagesSection({ title, advantages }: AdvantagesSectionProps) {
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  
  // Card spacing from Figma: Card width 465 + gap 20 = 485px
  const cardWidthWithGap = 485
  const basePadding = 367 // Figma x coordinate for first card

  useEffect(() => {
    if (!advantages || advantages.length <= 3) return
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % advantages.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [advantages])

  useEffect(() => {
    const targetX = -(index * cardWidthWithGap)
    animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    })
  }, [index])

  if (!advantages || advantages.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden bg-[#F9F9F5] flex justify-center items-start" style={{ height: "922px" }}>
      
      {/* 70% Scale Container */}
      <div 
        className="relative w-[1920px] h-[1317px] origin-top flex-shrink-0"
        style={{ transform: "scale(0.7)" }}
      >
        
        {/* 1. Background Decoration */}
        <div 
          className="absolute left-[-469px] top-[0px] w-[1280px] h-[1280px] rounded-full pointer-events-none"
          style={{ 
            background: "linear-gradient(to bottom, rgba(236, 232, 216, 0.28) 0%, rgba(236, 232, 216, 1) 100%)" 
          }}
        />

        {/* 2. Section Title */}
        <div className="absolute left-[153px] top-[100px] w-[925px] z-20 pointer-events-none">
          <h2 
            className="text-[64px] font-semibold leading-[88px] tracking-tight text-[#756F3F]"
            style={{ 
              fontFamily: "var(--font-anaheim)",
              background: "linear-gradient(to right, #756F3F 0%, rgba(117, 111, 63, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            dangerouslySetInnerHTML={{ __html: (title || "Advantages And Features<br />Of Busrom's One-Stop Purchasing").replace(/\n/g, '<br />') }}
          />
        </div>

        {/* 3. Draggable Carousel Track */}
        <div className="absolute left-0 top-[380px] w-full h-[850px] z-10 cursor-grab active:cursor-grabbing">
          <motion.div
            style={{ x, left: basePadding }}
            drag="x"
            dragConstraints={{
              left: -((advantages.length - 1) * cardWidthWithGap),
              right: 0,
            }}
            onDragEnd={(_, info) => {
              const offset = info.offset.x
              const velocity = info.velocity.x
              
              if (offset < -100 || velocity < -500) {
                setIndex((prev) => Math.min(prev + 1, advantages.length - 1))
              } else if (offset > 100 || velocity > 500) {
                setIndex((prev) => Math.max(prev - 1, 0))
              }
            }}
            className="flex gap-[20px]"
          >
            {advantages.map((item, idx) => {
              const isActive = idx === index
              
              return (
                <motion.div
                  key={idx}
                  animate={{ 
                    // Figma Shadow: 0 78 105.8 rgba(0,0,0,0.15)
                    boxShadow: isActive 
                      ? "0px 78px 105.8px rgba(0, 0, 0, 0.15)" 
                      : "0px 4px 20px rgba(0, 0, 0, 0.05)",
                    scale: isActive ? 1 : 0.96,
                    opacity: isActive ? 1 : 0.8
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-[465px] h-[766px] bg-white rounded-[30px] flex-shrink-0 relative overflow-hidden p-10 select-none"
                  onClick={() => setIndex(idx)}
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-[81px] h-[81px] bg-[#BCB158] rounded-full shrink-0" />
                    <h3 
                      className="text-[32px] font-extrabold leading-[32px] text-black"
                      style={{ fontFamily: "var(--font-anaheim)" }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Card Image */}
                  <div className="w-[387px] h-[306px] rounded-[30px] shadow-[0_31px_38.4px_rgba(0,0,0,0.17)] overflow-hidden mb-12 bg-gray-50">
                    <img 
                      src={item.image?.url || "https://placehold.co/400x300/41412D/C5A059?text=Advantage"}
                      className="w-full h-full object-cover pointer-events-none"
                      alt={item.title}
                    />
                  </div>

                  {/* Description Text */}
                  <div className="w-[387px]">
                    <p 
                      className="text-[24px] font-medium leading-[29px] text-black text-justify"
                      style={{ fontFamily: "var(--font-anaheim)" }}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* 4. Progress Bar */}
        <div className="absolute left-[367px] bottom-[50px] flex gap-4 z-20">
           {advantages.map((_, i) => (
             <button
               key={i}
               onClick={() => setIndex(i)}
               className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-12 bg-[#756F3F]' : 'w-4 bg-[#756F3F]/20'}`}
             />
           ))}
        </div>

      </div>
    </section>
  )
}
