"use client"

import React, { useState, useEffect } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion, AnimatePresence } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface QuoteSlide {
  title: string
  description: string
  buttonText: string
  buttonLink: string
  showButton: boolean
  openInNewTab: boolean
  image: any
}

interface StoryQuoteSectionProps {
  data: {
    slides: QuoteSlide[]
    autoplay: boolean
    interval: number
  }
}

export function StoryQuoteSection({ data }: StoryQuoteSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = data.slides || []
  const activeSlide = slides[activeIndex]

  useEffect(() => {
    if (!data.autoplay || slides.length <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, data.interval * 1000)

    return () => clearInterval(timer)
  }, [data.autoplay, data.interval, slides.length])

  if (slides.length === 0) return null

  return (
    <section 
      className="relative w-full bg-[#f2efd8] overflow-hidden" 
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex items-center">
         
         {/* Left Side: Navigation Titles (quote-item-list) */}
         <div className="w-[40%] flex flex-col justify-center" style={{ paddingLeft: vw(124) }}>
            <div className="flex flex-col items-start" style={{ gap: vw(22) }}>
               {slides.map((slide, idx) => {
                  const isActive = activeIndex === idx
                  return (
                    <motion.button 
                      key={idx}
                      layout
                      onClick={() => setActiveIndex(idx)}
                      className="flex items-center justify-center relative transition-all duration-500 overflow-hidden"
                      style={{ 
                        width: isActive ? vw(600) : vw(520), 
                        height: isActive ? vw(122) : vw(76),
                        borderRadius: vw(20),
                        backgroundColor: isActive ? "#756f3f" : "transparent",
                        border: isActive ? "none" : `${vw(2)} solid #756f3f`,
                        marginLeft: isActive ? 0 : vw(40),
                        cursor: "pointer",
                        padding: `0 ${vw(30)}`
                      }}
                      initial={false}
                    >
                       <motion.span 
                         layout="position"
                         className="font-josefin-sans transition-colors duration-500 whitespace-normal line-clamp-2"
                         style={{ 
                           fontSize: isActive ? vw(38) : vw(26), 
                           fontWeight: isActive ? 700 : 600,
                           color: isActive ? "#ffffff" : "#000000",
                           textAlign: "center",
                           lineHeight: 1.1
                         }}
                       >
                         {slide.title}
                       </motion.span>
                    </motion.button>
                  )
               })}
            </div>
         </div>

         {/* Middle: Featured Image */}
         <div className="w-[30%] h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={activeIndex}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.05 }}
                 transition={{ duration: 0.4 }}
                 className="relative overflow-hidden shadow-2xl"
                 style={{ width: vw(400), height: vw(600), borderRadius: vw(24) }}
               >
                  <OptimizedImage 
                    image={activeSlide?.image} 
                    alt={activeSlide?.title} 
                    size="medium"
                    className="object-cover w-full h-full" 
                  />
                  <div className="absolute inset-0 bg-black/5" />
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Right Side: Content (Title, Description, Button) */}
         <div className="w-[35%] flex flex-col justify-center" style={{ paddingRight: vw(124), paddingLeft: vw(40) }}>
            <AnimatePresence mode="wait">
               <motion.div 
                 key={activeIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.4 }}
                 className="flex flex-col"
               >
                  <h2 className="font-josefin-sans font-bold text-[#574f0e]" style={{ fontSize: vw(48), lineHeight: 1.1 }}>
                     {activeSlide?.title}
                  </h2>
                  <p className="font-josefin-sans font-medium text-[#574f0e]/80 mt-12" style={{ fontSize: vw(20), lineHeight: 1.6, maxWidth: vw(450) }}>
                     {activeSlide?.description}
                  </p>
                  
                  {activeSlide?.showButton && activeSlide?.buttonText && (
                    <a 
                      href={activeSlide.buttonLink || "#"}
                      target={activeSlide.openInNewTab ? "_blank" : undefined}
                      rel={activeSlide.openInNewTab ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative flex items-center bg-transparent border border-[#756f3f] transition-all duration-300 hover:bg-[#756f3f]/5"
                        style={{ 
                          width: vw(350), 
                          minHeight: vw(82), 
                          height: "auto",
                          borderRadius: vw(41),
                          marginTop: vw(50),
                          paddingTop: vw(15),
                          paddingBottom: vw(15)
                        }}
                      >
                         <span 
                           className="font-josefin-sans text-[#565020] whitespace-normal leading-tight" 
                           style={{ 
                             fontSize: vw(18), 
                             fontWeight: 500,
                             paddingLeft: vw(40),
                             paddingRight: vw(90),
                             textAlign: "left"
                           }}
                         >
                           {activeSlide.buttonText}
                         </span>
                         
                         {/* Circle Arrow Icon at the Right Edge - Centered Vertically */}
                         <div 
                           className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center bg-[#756f3f] rounded-full shadow-lg transition-transform"
                           style={{ 
                             width: vw(70), 
                             height: vw(70), 
                             right: 5 
                           }}
                         >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                               <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                         </div>
                      </motion.button>
                    </a>
                  )}
               </motion.div>
            </AnimatePresence>
         </div>

      </div>
      
      {/* Background Decorative Element */}
      <div 
        className="absolute w-full h-full bg-[#f2efd8]/30 z-0 bottom-0 translate-y-1/2 rounded-[50%]" 
        style={{ height: vw(2000), width: vw(3000), left: vw(-500) }}
      />
    </section>
  )
}

