"use client"

import React, { useState, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

const HEX_RATIO = 0.866

interface SupportRemoteSectionProps {
  titleNodes?: any[]
  descriptionNodes?: any[]
  cta?: {
    title: string
    description: string
    url: string
  }
  image?: any
}

export function SupportRemoteSection({ 
  titleNodes = [], 
  descriptionNodes = [], 
  cta = { title: "24H Response", description: "Lightning-Fast Resolution", url: "/support" },
  image 
}: SupportRemoteSectionProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const renderNodes = (nodes: any[]): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null
    return nodes.map((node, i) => {
      if (node.type === "linebreak") return <br key={i} />
      if (node.type === "text") {
        return (
          <span 
            key={i} 
            className={(node.format & 1) ? "font-bold" : ""} 
            style={{ whiteSpace: "pre-wrap" }}
          >
            {node.text}
          </span>
        )
      }
      if (node.children) {
        return <Fragment key={i}>{renderNodes(node.children)}</Fragment>
      }
      return null
    })
  }

  const hexagonPath = "M 0.5,0.01 Q 0.5,0 0.53,0.015 L 0.96,0.24 Q 1,0.25 1,0.28 L 1,0.72 Q 1,0.75 0.96,0.76 L 0.53,0.985 Q 0.5,1 0.47,0.985 L 0.04,0.76 Q 0,0.75 0,0.72 L 0,0.28 Q 0,0.25 0.04,0.24 L 0.47,0.015 Q 0.5,0 0.5,0.01 Z"
  const arrowPath = "M314.06024 0.00004l-0.578 0c-7.69757 0.10974-15.17822 2.56654-21.44199 7.042l-0.36401 0.263 0.10501-0.067c-2.48227 1.59986-4.80316 3.43716-6.92999 5.486l-0.59803 0.587-270.94598 270.61999c-17.743 17.72101-17.743 46.45599 0 64.17801l0.536 0.526c17.78 17.19 46.142 17.01498 63.705-0.526l198.59698-198.36 0 612.38402c0 20.914 16.97403 37.867 37.90802 37.867l5.30899 0c20.64499-0.34003 37.28003-17.16199 37.28003-37.867l0-612.38503 198.59796 198.36c17.73999 17.72 46.5 17.72 64.24103 0 17.74298-17.72 17.74396-46.45501 0.00196-64.177l-270.96796-270.64199-0.57501-0.564c-1.93302-1.86265-4.02686-3.55088-6.25702-5.045l-0.56897-0.375 0.104 0.076c-6.51166-4.80527-14.39425-7.3926-22.487-7.381l-4.67102 0z"

  const mainHeight = 758
  const mainWidth = mainHeight * HEX_RATIO
  const ctaHeight = 423
  const ctaWidth = ctaHeight * HEX_RATIO
  const btnHeight = 115
  const btnWidth = btnHeight * HEX_RATIO

  const titleContent = renderNodes(titleNodes)
  const descContent = renderNodes(descriptionNodes)

  // Use explicit literal types or 'as const' to satisfy Transition interface
  const loopTransition: any = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }

  const springSettings: any = { 
    type: "spring", 
    stiffness: 200, 
    damping: 15 
  }

  return (
    <section className="relative w-full bg-[#f6f4ed] overflow-hidden">
      {/* Shared SVG Clips */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hexagon-pure-rounded" clipPathUnits="objectBoundingBox">
            <path d={hexagonPath} />
          </clipPath>
        </defs>
      </svg>

      {/* --- DESKTOP VIEW (md and above) --- */}
      <div 
        className="hidden md:flex relative w-full overflow-hidden" 
        style={{ height: vw(780), paddingLeft: vw(153) }}
      >
        {/* 1. Left Content Area */}
        <div className="relative z-50 flex flex-col" style={{ paddingTop: vw(132), width: vw(849) }}>
          <div className="h-[550px]" style={{ height: vw(550) }}>
             <AnimatePresence mode="wait">
                  {isVisible && (
                      <motion.div
                          key="content-root"
                          initial={{ opacity: 0, y: 120 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 120 }}
                          transition={{ 
                              type: "spring", 
                              stiffness: 120, 
                              damping: 8, 
                              mass: 0.8,
                              duration: 1.2
                          }}
                      >
                          <motion.div
                              animate={isHovering ? { y: [-15, 0] } : { y: 0 }}
                              transition={isHovering ? loopTransition : springSettings}
                          >
                              <h2 
                                  className="font-josefin-sans font-bold text-[#494106]"
                                  style={{ fontSize: vw(80), lineHeight: 0.91 }}
                              >
                                  {titleContent || "Remote Support Installation"}
                              </h2>

                              <div style={{ marginTop: vw(81) }}>
                                  <p 
                                      className="font-josefin-sans font-semibold text-[#756f3f]"
                                      style={{ fontSize: vw(36), lineHeight: 1.33, maxWidth: vw(706) }}
                                  >
                                      {descContent || "Professional technical support available at your fingertips."}
                                  </p>
                              </div>
                          </motion.div>
                      </motion.div>
                  )}
             </AnimatePresence>
          </div>
        </div>

        {/* 2. Right Visual Area */}
        <div className="absolute right-0 top-0 h-full flex items-center z-10" style={{ width: vw(1000) }}>
          <div 
            className="absolute bg-[#e3deb3] overflow-hidden"
            style={{ 
              width: vw(mainWidth), 
              height: vw(mainHeight),
              right: vw(-100),
              top: vw(0),
              clipPath: "url(#hexagon-pure-rounded)"
            }}
          >
              <OptimizedImage 
                  image={image} 
                  size="large"
                  className="w-full h-full object-cover"
              />
          </div>

          <div 
            className="absolute z-20 flex flex-col items-center justify-center"
            style={{ 
              width: vw(ctaWidth), 
              height: vw(ctaHeight),
              right: vw(460),
              top: vw(50)
            }}
          >
              {/* Rotating Hexagon Background */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[#fae5ac]"
                style={{ 
                  clipPath: "url(#hexagon-pure-rounded)"
                }}
              />

              {/* Static Text Content */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                  <span className="font-josefin-sans font-bold text-[#383417] text-center" style={{ fontSize: vw(60), lineHeight: 0.85 }}>
                      {cta.title.split("\n").map((t, i) => <Fragment key={i}>{t}<br/></Fragment>)}
                  </span>
                  <span className="font-josefin-sans font-semibold text-[#756f3f] text-center mt-[18px]" style={{ fontSize: vw(40), lineHeight: 1.15, marginTop: vw(18), maxWidth: vw(280) }}>
                      {cta.description.split("\n").map((t, i) => <Fragment key={i}>{t}<br/></Fragment>)}
                  </span>
              </div>
          </div>

          <div
            className="absolute z-30 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleVisibility}
            style={{ 
              width: vw(btnWidth), 
              height: vw(btnHeight),
              right: vw(520),
              top: vw(580)
            }}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              animate={{ 
                rotate: isVisible ? 0 : 180,
                backgroundColor: isHovering ? "#756f3f" : "#EEE7AD"
              }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center"
              style={{ 
                clipPath: "url(#hexagon-pure-rounded)"
              }}
            >
               <svg 
                 viewBox="0 0 620 650" 
                 className="w-1/3 h-1/3" 
                 style={{ transform: "rotate(45deg)" }}
               >
                 <motion.path 
                   d={arrowPath} 
                   animate={{ fill: isHovering ? "#EEE7AD" : "#fffdeaff" }}
                   transition={{ duration: 0.3 }}
                 />
               </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW (Below md) --- */}
      <div className="md:hidden flex flex-col items-center py-16 px-6 space-y-12">
        {/* Mobile Header (Top) */}
        <div className="text-center space-y-6">
            <h2 className="font-josefin-sans font-bold text-[#494106] text-4xl leading-tight">
                {titleContent || "Remote Support Installation"}
            </h2>
            <p className="font-josefin-sans font-semibold text-[#756f3f] text-lg leading-relaxed max-w-md mx-auto">
                {descContent || "Professional technical support available at your fingertips."}
            </p>
        </div>

        {/* Mobile Visual (Bottom) */}
        <div className="relative w-full flex flex-col items-center space-y-8">
            {/* Main Hexagon Image */}
            <div 
              className="relative bg-[#e3deb3] overflow-hidden shadow-xl"
              style={{ 
                  width: '277px', 
                  height: '320px',
                  clipPath: "url(#hexagon-pure-rounded)" 
              }}
            >
                <OptimizedImage 
                    image={image} 
                    size="large"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* CTA Ornament */}
            <div 
                className="relative flex items-center justify-center"
                style={{ width: '208px', height: '240px' }}
            >
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[#fae5ac]"
                    style={{ clipPath: "url(#hexagon-pure-rounded)" }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                    <span className="font-josefin-sans font-bold text-[#383417] text-2xl leading-none">
                        {cta.title}
                    </span>
                    <span className="font-josefin-sans font-semibold text-[#756f3f] text-[10px] mt-1 leading-tight uppercase tracking-wider">
                        {cta.description}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </section>
  )
}