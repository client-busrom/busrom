"use client"

import React, { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface QualityItem {
  id: string
  title: string
  description: string
  buttonText?: string
  image: any
}

interface SupportQualityControlSectionProps {
  title: any[]
  items: QualityItem[]
}

const renderNodes = (nodes: any[], vwFunc: (px: number) => string) => {
  return nodes.map((node, i) => {
    if (node.type === "linebreak") return <br key={i} />
    if (node.children) return <React.Fragment key={i}>{renderNodes(node.children, vwFunc)}</React.Fragment>
    
    if (node.text !== undefined) {
      const isBold = (node.format & 1) !== 0
      const isUnderline = (node.format & 8) !== 0
      
      const style: React.CSSProperties = {
          fontSize: isBold ? vwFunc(96) : vwFunc(64),
          color: isBold ? "#000000" : "#574F0E",
          fontWeight: isBold ? 700 : "normal",
          textDecoration: isUnderline ? "underline" : "none"
      }
      
      return <span key={i} style={{ ...style, whiteSpace: "pre-wrap" }}>{node.text}</span>
    }
    return null
  })
}

export function SupportQualityControlSection({ title, items }: SupportQualityControlSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const scrollTranslateX = useMemo(() => {
    const step = 457 + 32
    if (activeIndex <= 1) return 0
    let base = - (activeIndex - 1) * step
    if (activeIndex === items.length - 1 && items.length > 3) {
      base -= 150
    }
    return base
  }, [activeIndex, items.length])

  return (
    <section className="relative w-full overflow-hidden flex flex-col py-[10vw]" style={{ backgroundColor: "#f6f4ed" }}>
        {/* SVG Mask Definition */}
        <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
                <clipPath id="active-image-mask" clipPathUnits="objectBoundingBox">
                    <path d="M0.826,0.5 C0.922,0.5,1,0.557,1,0.628 L1,0.872 C1,0.943,0.922,1,0.826,1 L0.174,1 C0.078,1,0,0.943,0,0.872 L0,0.628 C0,0.557,0.078,0.5,0.174,0.5 C0.078,0.5,0,0.443,0,0.372 L0,0.128 C0,0.057,0.078,0,0.174,0 L0.826,0 C0.922,0,1,0.057,1,0.128 L1,0.372 C1,0.443,0.922,0.5,0.826,0.5 Z" />
                </clipPath>
            </defs>
        </svg>

        {/* Title Section */}
        <div className="relative z-10 w-full px-[8vw] mb-[6vw]">
            <h2 className="font-josefin-sans leading-tight whitespace-pre-wrap">
                {renderNodes(title, vw)}
            </h2>
        </div>

        {/* Carousel Section */}
        <div className="relative w-full overflow-visible">
            <motion.div 
              className="flex items-start"
              style={{ paddingLeft: vw(150), gap: vw(32) }}
              animate={{ x: `${(scrollTranslateX / 1920) * 100}vw` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {items.map((item, idx) => {
                    const isActive = idx === activeIndex
                    const isHovered = hoveredIndex === idx
                    
                    return (
                        <motion.div
                          key={item.id}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setActiveIndex(idx)}
                          className="relative flex-shrink-0 cursor-pointer overflow-hidden"
                          animate={{ 
                            width: isActive ? vw(849) : vw(457),
                          }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          style={{ 
                            height: vw(465),
                            borderRadius: vw(50),
                            backgroundColor: "#f6ebc5"
                          }}
                        >
                            {/* Inactive View */}
                            <motion.div 
                                className="absolute inset-0 flex flex-col pointer-events-none"
                                animate={{ opacity: isActive ? 0 : 1 }}
                            >
                                <div className="p-[2vw] pl-[3.1vw] pt-[2vw]">
                                    <h4 className="font-montserrat font-bold transition-all duration-300 whitespace-pre-wrap"
                                        style={{ 
                                            fontSize: vw(29), 
                                            lineHeight: 1.3, 
                                            width: vw(400),
                                            color: isHovered ? "#000000" : "#ffffff",
                                            WebkitTextStroke: isHovered ? "0" : "1px #000000",
                                            paintOrder: "stroke fill"
                                        }}
                                    >
                                        {item.title}
                                    </h4>
                                </div>

                                {/* Layout adjustment for Decorator and Buttons based on Design */}
                                <div className="mt-auto relative w-full" style={{ height: vw(224) }}>
                                    {/* Circles positioned via absolute x/y from design */}
                                    <div className="absolute" style={{ left: vw(-80), bottom: vw(-100), width: vw(457), height: vw(457) }}>
                                        {/* Small Circle (Ellipse 134) */}
                                        <div 
                                            className="absolute rounded-full border border-black/5"
                                            style={{ left: vw(207), top: vw(130), width: vw(102), height: vw(102), backgroundColor: "#fbf2d3" }}
                                        />
                                        {/* Large Circle (Ellipse 133) */}
                                        <div 
                                            className="absolute rounded-full border border-black/5"
                                            style={{ left: vw(60), bottom: vw(60), width: vw(224), height: vw(224), backgroundColor: "#fff6d4", boxShadow: "0 4px 15px rgba(0,0,0,0.07)" }}
                                        />
                                    </div>

                                    {/* Hover Content Labels & Button Click */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                {/* read more text - centered on large circle in design */}
                                                <div className="absolute" style={{ left: vw(40), top: vw(120) }}>
                                                    <span className="font-montserrat text-[#000000] font-medium" style={{ fontSize: vw(24) }}>
                                                        {item.buttonText}
                                                    </span>
                                                </div>

                                                {/* Button Hover Click - Position 330, 108 */}
                                                <div className="absolute" style={{ left: vw(330), top: vw(108), width: vw(80), height: vw(80) }}>
                                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                        {/* Precise Arrow Path from Design */}
                                                        <svg width="40%" height="40%" viewBox="0 0 32 33" fill="none">
                                                            <path 
                                                                d="M10 23L22 11M22 11H12M22 11V21" 
                                                                stroke="#464010" 
                                                                strokeWidth="3" 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round" 
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* Active View */}
                            {isActive && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                    className="absolute inset-0 p-[2.5vw] flex items-center justify-between pointer-events-none"
                                >
                                    <div className="flex flex-col" style={{ width: vw(400), gap: vw(20) }}>
                                        <h4 className="font-montserrat font-bold text-[#000000] whitespace-pre-wrap" style={{ fontSize: vw(29), lineHeight: 1.25, width: vw(400) }}>
                                            {item.title}
                                        </h4>
                                        <p className="font-montserrat font-light text-[#5c4c15] whitespace-pre-wrap" style={{ fontSize: vw(20), lineHeight: 1.4 }}>
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="relative flex-shrink-0" style={{ width: vw(288), height: vw(390) }}>
                                        <div 
                                            className="w-full h-full bg-[#d9d9d9]"
                                            style={{ clipPath: "url(#active-image-mask)" }}
                                        >
                                            <OptimizedImage 
                                                image={item.image} 
                                                size="medium"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    </section>
  )
}
