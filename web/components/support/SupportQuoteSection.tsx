"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface Slide {
  image: {
    id: string
    url: string
  }
  title: string
  description?: string
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

const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`
const vwm = (px: number) => `calc(${px} * 100vw / 390)`

// OdmPartner style card configurations (Simplified for 2-card stack)
const cardConfigs = [
  { rotate: -3.23, x: 0, y: 0, zIndex: 3, shadow: "6px 9px 18.9px rgba(0,0,0,0.43)" },
  { rotate: 10, x: 20, y: 15, zIndex: 2, shadow: "4px 6px 12px rgba(0,0,0,0.2)" },
]

// Animation constants
const AUTO_PLAY_INTERVAL = 5000


const formatBalancedText = (text?: string) => {
  if (!text || text.length < 25) return text;
  
  const mid = Math.floor(text.length / 2);
  const leftSpace = text.lastIndexOf(' ', mid);
  const rightSpace = text.indexOf(' ', mid + 1);
  
  let breakIndex = -1;
  if (leftSpace === -1) breakIndex = rightSpace;
  else if (rightSpace === -1) breakIndex = leftSpace;
  else breakIndex = (mid - leftSpace) <= (rightSpace - mid) ? leftSpace : rightSpace;

  if (breakIndex === -1) return text;

  return (
    <React.Fragment>
      {text.slice(0, breakIndex)}
      <br />
      {text.slice(breakIndex + 1)}
    </React.Fragment>
  );
};

export const SupportQuoteSection: React.FC<SupportQuoteSectionProps> = ({
  slides = [],
  autoplay = true,
  interval = AUTO_PLAY_INTERVAL / 1000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Track mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-play logic with Fold Animation
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return
    
    const cycle = () => {
      if (isAnimating) return
      
      setIsAnimating(true)
      const nextIdx = (activeIndex + 1) % slides.length
      setActiveIndex(nextIdx)
      setTimeout(() => setIsAnimating(false), 800)
    }

    const timer = setInterval(cycle, interval * 1000)
    return () => clearInterval(timer)
  }, [autoplay, interval, slides.length, activeIndex, isAnimating])

  if (slides.length === 0) return null

  const currentSlide = slides[activeIndex]

  const RightArrowCircle = () => (
    <svg width="100%" height="100%" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="56" cy="56" r="50" className="fill-[#756F3F] group-hover:fill-[#F4F2ED] transition-colors duration-300" />
       <path d="M45 56H67M67 56L60 49M67 56L60 63" className="stroke-[#F4F2ED] group-hover:stroke-[#756F3F] transition-colors duration-300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center select-none"
      style={{ 
        height: isMobile ? 'auto' : vw(800),
        background: "linear-gradient(to bottom, #F6F4ED 0%, #F2EFD8 100%)"
      }}
    >
      {/* DESKTOP VIEW */}
      <div className="hidden md:block relative w-full max-w-[1920px] h-full px-[8vw]">
        
        {/* LEFT COMPONENT - FIXED TOGGLE */}
        <div 
          className="absolute flex items-center"
          style={{ 
            left: '8vw',
            top: vw(40),
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
                  setIsAnimating(true)
                  setActiveIndex(idx)
                  setTimeout(() => setIsAnimating(false), 800)
                }
              }}
            >
              <span 
                className="font-normal"
                style={{ 
                  fontSize: vw(96), 
                  color: "#756F3F",
                  fontFamily: "var(--font-gwendolyn)",
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
          className="absolute flex flex-col pointer-events-auto" 
          style={{ 
            left: '8vw',
            top: vw(220), 
            zIndex: 10,
            maxWidth: vw(900)
          }}
        >
          {/* TITLE */}
          <div className="relative mb-[1.5vw]">
            <AnimatePresence>
              <motion.h2
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, position: "absolute", top: 0, left: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-bold leading-[1.2] text-[#574F0E] font-josefin-sans"
                style={{ 
                  fontSize: vw(36), 
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

          {/* DESCRIPTION */}
          <div className="relative mb-[3vw]">
            <AnimatePresence>
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, position: "absolute", top: 0, left: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="font-semibold leading-[1.5] text-[#756F3F] font-josefin-sans opacity-80"
                style={{ 
                  fontSize: vw(24),
                }}
              >
                {(currentSlide.description || "").split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.p>
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
                  className="group flex items-center bg-transparent transition-all duration-300 hover:bg-[#756F3F] border border-[#756F3F] w-fit"
                  style={{ 
                    minHeight: vw(125),
                    borderRadius: vw(62.5),
                    paddingLeft: vw(57.6),
                    paddingRight: vw(6),
                    paddingTop: vw(6),
                    paddingBottom: vw(6),
                    maxWidth: "100%"
                  }}
                >
                  <div className="shrink min-w-0" style={{ marginRight: vw(20) }}>
                    <span 
                      className="font-medium text-[#565020] transition-colors duration-300 group-hover:text-[#F4F2ED]"
                      style={{ 
                        fontSize: vw(40),
                        fontFamily: "Josefin Sans, sans-serif",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.2,
                      }}
                    >
                      {formatBalancedText(currentSlide.buttonText)}
                    </span>
                  </div>
                  
                  <div 
                    className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 ml-auto"
                    style={{ 
                      width: vw(112), 
                      height: vw(112),
                    }}
                  >
                    <RightArrowCircle />
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT IMAGES - STACKED CARD EFFECT */}
        <div className="absolute right-[8vw] top-0 flex items-center justify-center pointer-events-none" style={{ width: vw(600), height: vw(700) }}>
          {[0, 1].slice(0, slides.length).map((offset) => {
            const index = (activeIndex + offset) % slides.length
            const slide = slides[index]
            if (!slide) return null
            const config = cardConfigs[offset] || cardConfigs[0]

            return (
              <motion.div
                key={slide.image.id}
                className="absolute overflow-hidden"
                style={{
                  width: vw(438), 
                  height: vw(542), 
                  borderRadius: vw(30),
                  backgroundColor: "#D9D9D9",
                  transformOrigin: "center center",
                }}
                animate={{
                  x: vw(config.x),
                  y: vw(config.y),
                  rotate: config.rotate,
                  zIndex: config.zIndex,
                  boxShadow: config.shadow,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <OptimizedImage
                  image={slide.image}
                  alt={slide.title}
                  size="medium"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )
          })}
        </div>

      </div>

      {/* MOBILE VIEW */}
      <div className="block md:hidden w-full flex flex-col items-center pt-[40px] pb-[40px] px-[20px]">
        {/* TOGGLE */}
        <div 
          className="relative flex items-center mb-[20px]"
          style={{ 
            width: vwm(183), 
            height: vwm(57), 
            backgroundColor: "#F3F3F3", 
            borderRadius: vwm(28.5),
            border: `1px solid #ACA675`,
            padding: vwm(3),
          }}
        >
          <motion.div 
            className="absolute bg-[#E7DF98]"
            initial={false}
            animate={{ x: `calc(${activeIndex} * ${vwm(84.5)})` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ 
              width: vwm(90), 
              height: vwm(51), 
              borderRadius: vwm(25.5),
              left: vwm(2.5)
            }}
          />
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className="flex-1 flex items-center justify-center cursor-pointer z-10"
              onClick={() => {
                if (idx !== activeIndex && !isAnimating) {
                  setIsAnimating(true)
                  setActiveIndex(idx)
                  setTimeout(() => setIsAnimating(false), 800)
                }
              }}
            >
              <span 
                className="font-normal"
                style={{ 
                  fontSize: vwm(48), 
                  color: "#756F3F",
                  fontFamily: "var(--font-gwendolyn)",
                  lineHeight: 0.625
                }}
              >
                {idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* IMAGE STACK - MOBILE SCALED */}
        <div className="relative mb-[20px] flex items-center justify-center" style={{ width: vwm(219 * 1.2), height: vwm(271 * 1.2) }}>
          {[0, 1].slice(0, slides.length).map((offset) => {
            const index = (activeIndex + offset) % slides.length
            const slide = slides[index]
            if (!slide) return null
            const config = cardConfigs[offset] || cardConfigs[0]

            return (
              <motion.div
                key={slide.image.id}
                className="absolute overflow-hidden"
                style={{
                  width: vwm(219), 
                  height: vwm(271), 
                  borderRadius: vwm(15),
                  backgroundColor: "#D9D9D9",
                  transformOrigin: "center center",
                }}
                animate={{
                  x: vwm(config.x / 4), // Further tighten offset for mobile
                  y: vwm(config.y / 4),
                  rotate: config.rotate,
                  zIndex: config.zIndex,
                  boxShadow: config.shadow,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <OptimizedImage
                  image={slide.image}
                  alt={slide.title}
                  size="medium"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )
          })}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col items-center text-center px-4">
           {/* TITLE */}
           <div className="relative mb-2">
             <h2
                className="font-bold leading-[1.2] text-[#574F0E] font-josefin-sans"
                style={{ fontSize: vwm(24) }}
              >
                {currentSlide.title}
              </h2>
          </div>

          {/* DESCRIPTION */}
          <div className="relative mb-6">
            <p
                className="font-semibold leading-[1.4] text-[#756F3F] font-inter opacity-80"
                style={{ fontSize: vwm(13) }}
              >
                {currentSlide.description}
              </p>
          </div>

          {/* BUTTON */}
          {currentSlide.showButton && (
            <Link 
              href={currentSlide.buttonLink || "/"} 
              target={currentSlide.openInNewTab ? "_blank" : "_self"}
              className="group flex items-center bg-transparent border border-[#756F3F] w-fit"
              style={{ 
                minHeight: vwm(62),
                borderRadius: vwm(31),
                paddingLeft: vwm(16),
                paddingRight: vwm(4),
                paddingTop: vwm(4),
                paddingBottom: vwm(4),
                maxWidth: "100%"
              }}
            >
                <div className="shrink min-w-0" style={{ marginRight: vwm(10) }}>
                  <span 
                    className="font-medium text-[#565020] font-josefin-sans"
                    style={{ 
                      fontSize: vwm(18),
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.2,
                    }}
                  >
                    {formatBalancedText(currentSlide.buttonText)}
                  </span>
                </div>
                <div 
                  className="flex-shrink-0 flex items-center justify-center ml-auto"
                  style={{ width: vwm(40), height: vwm(40) }}
                >
                  <RightArrowCircle />
                </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
