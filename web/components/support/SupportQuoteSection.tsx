"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Slide {
  image: {
    id: string
    url: string
  }
  title: string
  buttonLink?: string
  buttonText?: string
  showButton?: boolean
  openInNewTab?: boolean
}

interface SupportQuoteSectionProps {
  slides: Slide[]
  autoplay?: boolean
  interval?: number
}

const vw = (px: number) => `${(px / 1920) * 100}vw`

// Animation constants (aligned with Product Series ContactForm)
const FOLD_DURATION = 600
const MASK_SWITCH_TIME = 150
const AUTO_PLAY_INTERVAL = 5000

export const SupportQuoteSection: React.FC<SupportQuoteSectionProps> = ({
  slides = [],
  autoplay = true,
  interval = AUTO_PLAY_INTERVAL / 1000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isFolded, setIsFolded] = useState(false)
  const [showMask, setShowMask] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-play logic with Fold Animation
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return
    
    const cycle = () => {
      if (isAnimating) return
      
      setIsAnimating(true)
      setIsFolded(true)

      // Fold completes
      setTimeout(() => {
        setShowMask(true)
        
        // Switch content while masked
        setTimeout(() => {
          const nextIdx = (activeIndex + 1) % slides.length
          setActiveIndex(nextIdx)
          setDisplayIndex(nextIdx)

          // Hide mask
          setTimeout(() => {
            setShowMask(false)

            // Unfold
            setTimeout(() => {
              setIsFolded(false)
              
              // End animation state
              setTimeout(() => {
                setIsAnimating(false)
              }, FOLD_DURATION)
            }, 100)
          }, MASK_SWITCH_TIME)
        }, MASK_SWITCH_TIME)
      }, FOLD_DURATION)
    }

    const timer = setInterval(cycle, interval * 1000)
    return () => clearInterval(timer)
  }, [autoplay, interval, slides.length, activeIndex, isAnimating])

  if (slides.length === 0) return null

  const currentSlide = slides[activeIndex]
  const displaySlide = slides[displayIndex]

  const RightArrowCircle = () => (
    <svg width="100%" height="100%" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="56" cy="56" r="50" fill="#756F3F" />
       <path d="M45 56H67M67 56L60 49M67 56L60 63" stroke="#F4F2ED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center select-none"
      style={{ 
        height: vw(922),
        background: "linear-gradient(to bottom, #F6F4ED 0%, #F2EFD8 100%)"
      }}
    >
      <div className="relative w-full max-w-[1920px] h-full px-[8vw]">
        
        {/* LEFT COMPONENT - FIXED TOGGLE */}
        <div 
          className="absolute flex items-center"
          style={{ 
            left: '8vw',
            top: vw(160),
            width: vw(366), 
            height: vw(114), 
            backgroundColor: "#F3F3F3", 
            borderRadius: vw(57),
            border: `1px solid #ACA675`,
            padding: vw(6),
            zIndex: 30
          }}
        >
          <motion.div 
            className="absolute bg-[#E7DF98]"
            initial={false}
            animate={{ x: `calc(${activeIndex} * ${vw(169)})` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ 
              width: vw(180), 
              height: vw(102), 
              borderRadius: vw(51),
              left: vw(5)
            }}
          />
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className="flex-1 flex items-center justify-center cursor-pointer z-10"
              onClick={() => {
                if (idx !== activeIndex && !isAnimating) {
                  setActiveIndex(idx)
                  setDisplayIndex(idx)
                }
              }}
            >
              <span 
                className="font-normal"
                style={{ 
                  fontSize: vw(96), 
                  color: "#756F3F",
                  fontFamily: "serif",
                  lineHeight: 0.625
                }}
              >
                {idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* LEFT DYNAMIC CONTENT - MOVED DOWN */}
        <div 
          className="absolute flex flex-col" 
          style={{ 
            left: '8vw',
            top: vw(340), 
            zIndex: 10,
            // Removed fixed width to avoid auto-wrap
          }}
        >
          {/* TITLE */}
          <div className="h-[max-content] mb-[3vw]">
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-bold leading-[1.2] text-[#574F0E]"
                style={{ 
                  fontSize: vw(36), // Adjusted from 48 to 36 as requested
                  fontFamily: "Josefin Sans, sans-serif",
                }}
              >
                {currentSlide.title?.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < currentSlide.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* BUTTON */}
          <AnimatePresence mode="wait">
            {currentSlide.showButton && (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <Link 
                  href={currentSlide.buttonLink || "/"} 
                  target={currentSlide.openInNewTab ? "_blank" : "_self"}
                  className="group flex items-center relative"
                  style={{ width: vw(544), height: vw(125) }}
                >
                  <div 
                    className="absolute inset-0 bg-transparent rounded-full flex items-center px-[3vw] transition-all hover:bg-[#756F3F]/5"
                    style={{ 
                      border: `1px solid #756F3F`,
                      borderRadius: vw(62.5),
                    }}
                  >
                    <span 
                      className="font-medium text-[#565020]"
                      style={{ 
                        fontSize: vw(40),
                        fontFamily: "Josefin Sans, sans-serif",
                      }}
                    >
                      {currentSlide.buttonText}
                    </span>
                    
                    <div 
                      className="absolute right-0 flex items-center justify-center transition-transform group-hover:translate-x-1"
                      style={{ 
                        width: vw(112), 
                        height: vw(112),
                        marginRight: vw(6)
                      }}
                    >
                      <RightArrowCircle />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT IMAGES - PRODUCT SERIES STYLE */}
        <div className="absolute right-[8vw] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none" style={{ width: vw(600), height: vw(700) }}>
          <div
            className="relative overflow-hidden"
            style={{
              width: vw(438), 
              height: vw(542), 
              borderRadius: vw(30),
              backgroundColor: "#D9D9D9",
              boxShadow: "6px 9px 18.9px rgba(0,0,0,0.43)",
              // Exact "Fold" values from the product/[slug] form
              transform: isFolded
                ? `translate(${vw(131)}, ${vw(-18)}) rotate(6deg)`
                : `translate(0, 0) rotate(-3.23deg)`,
              transformOrigin: "center center",
              transition: `transform ${FOLD_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: 20
            }}
          >
             <img 
               src={displaySlide.image?.url} 
               alt="Gallery Item" 
               className="w-full h-full object-cover"
             />

             {/* Mask Overlay */}
             <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: "#756F3F",
                  opacity: showMask ? 1 : 0,
                  transition: "opacity 150ms ease-in-out",
                  borderRadius: vw(30),
                }}
              />
          </div>

          {/* Decorative Back Layer (Switching in sync) */}
          <div
            className="absolute overflow-hidden"
            style={{
              width: vw(438), 
              height: vw(542), 
              borderRadius: vw(30),
              backgroundColor: "#E2DFC2",
              boxShadow: "4px 6px 12px rgba(0,0,0,0.2)",
              transform: isFolded
                ? `translate(${vw(-131)}, ${vw(18)}) rotate(6deg)`
                : `translate(${vw(40)}, ${vw(30)}) rotate(15.15deg)`,
              transformOrigin: "center center",
              transition: `transform ${FOLD_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: 10
            }}
          >
             <img 
               src={slides[(displayIndex + 1) % slides.length].image?.url} 
               alt="Next Prev Slide Hint" 
               className="w-full h-full object-cover opacity-60"
             />
             <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: "#756F3F",
                  opacity: showMask ? 1 : 0,
                  transition: "opacity 150ms ease-in-out",
                  borderRadius: vw(30),
                }}
              />
          </div>
        </div>

      </div>
    </section>
  )
}
