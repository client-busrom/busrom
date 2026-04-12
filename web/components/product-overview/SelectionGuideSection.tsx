"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SelectionGuide } from "@/types/product-overview"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface SelectionGuideSectionProps {
  data: SelectionGuide;
}

export function SelectionGuideSection({ data }: SelectionGuideSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = data.slides;

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const CrossIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 185 185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M93.3235 53.2493C102.107 44.4659 110.707 35.8655 119.125 27.4481C127.908 19.0307 136.691 10.2473 145.475 1.09793C151.696 7.31949 157.918 13.907 164.139 20.8605C170.727 27.814 177.132 34.4016 183.353 40.6231C174.936 49.0406 166.335 57.641 157.552 66.4243C149.135 74.8417 140.9 83.4422 132.849 92.2255C141.632 101.009 150.232 109.792 158.65 118.576C167.067 127.359 175.851 136.325 185 145.475L144.377 185C135.959 176.217 127.176 167.616 118.027 159.199C109.243 150.415 100.277 141.632 91.1276 132.849C83.0762 141.266 74.6588 149.866 65.8754 158.65C57.092 167.067 48.4916 175.668 40.0742 184.451C33.4867 177.863 26.8991 171.459 20.3116 165.237C13.724 158.65 7.31949 152.062 1.09793 145.475C9.88131 136.691 18.4817 128.091 26.8991 119.674C35.6825 111.256 44.4659 102.473 53.2493 93.3235L0 40.6231L39.5252 0L93.3235 53.2493Z" fill="url(#paint0_linear_1_3451)"/>
      <defs>
        <linearGradient id="paint0_linear_1_3451" x1="92.5" y1="0" x2="92.5" y2="185" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBC382"/>
          <stop offset="1" stopColor="#9F9335"/>
        </linearGradient>
      </defs>
    </svg>
  )

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: vw(1000), paddingTop: vw(100), paddingBottom: vw(50) }}>
      <div className="mx-auto relative" style={{ width: vw(1920), height: vw(1000) }}>
        
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute z-[100] group cursor-pointer"
          style={{ left: vw(120), top: vw(800), width: vw(82), height: vw(82) }}
        >
          <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
            <ChevronLeft style={{ width: vw(32), height: vw(32) }} className="text-[#464010] group-hover:text-white transition-colors" />
          </div>
        </button>

        <button
          onClick={handleNext}
          className="absolute z-[100] group cursor-pointer"
          style={{ left: vw(1700), top: vw(800), width: vw(82), height: vw(82) }}
        >
          <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
            <ChevronRight style={{ width: vw(32), height: vw(32) }} className="text-[#464010] group-hover:text-white transition-colors" />
          </div>
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Decorative "X" Icon */}
            <div className="absolute opacity-90" style={{ left: vw(138), top: vw(20), width: vw(185), height: vw(185) }}>
              <CrossIcon />
            </div>

            {/* Titles: Corrected to 60px */}
            <h2 
              className="absolute font-limelight text-white leading-[1.1] whitespace-nowrap z-40" 
              style={{ fontSize: vw(80), left: vw(149), top: vw(-12) }}
            >
              {currentSlide.title1}
            </h2>
            <h2 
              className="absolute font-limelight text-white leading-[1.1] whitespace-nowrap z-40" 
              style={{ fontSize: vw(80), left: vw(246), top: vw(118) }}
            >
              {currentSlide.title2}
            </h2>

            {/* Highlight Box: Text corrected to 29px */}
            <motion.div 
               className="absolute rounded-[40px] overflow-hidden z-10 flex flex-col justify-start"
               style={{ 
                 left: vw(166), 
                 top: vw(301), 
                 minHeight: vw(342),
                 padding: `${vw(60)} ${vw(50)} ${vw(100)}`,
                 background: 'linear-gradient(180deg, rgba(255, 240, 122, 0.75) 0%, rgba(153, 141, 41, 0) 100%)',
                 backdropFilter: 'blur(12px)'
               }}
            >
               <p className="font-josefin-sans font-semibold text-[#635700] whitespace-pre-line text-left" style={{ fontSize: vw(29), lineHeight: 1.3 }}>
                 {currentSlide.highlightText}
               </p>
            </motion.div>

            {/* Small Image */}
            {currentSlide.images[1] && (
              <motion.div 
                className="absolute shadow-xl overflow-hidden z-20" 
                style={{ 
                  left: vw(605),
                  top: vw(350),
                  width: vw(517), 
                  height: vw(612), 
                  borderRadius: `${vw(258.5)} ${vw(258.5)} 0 0`,
                  border: `${vw(1)} solid rgba(255, 255, 255, 0.1)` 
                }}
              >
                <OptimizedImage 
                  image={currentSlide.images[1].url} 
                  alt="Guide 2" 
                  width={517} 
                  height={612} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 33.5%, rgba(0,0,0,0.8) 100%)' }} />
                
                {/* 1-5 Text: Corrected to 24px */}
                <div 
                  className="absolute z-30 flex flex-col justify-end" 
                  style={{ 
                    left: vw(665 - 605), 
                    bottom: vw(40), 
                    width: vw(413),
                    minHeight: vw(229)
                  }}
                >
                  <p className="font-josefin-sans text-white leading-relaxed" style={{ fontSize: vw(24), textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {currentSlide.content2}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Large Image */}
            {currentSlide.images[0] && (
              <motion.div 
                className="absolute overflow-hidden z-20" 
                style={{ 
                  left: vw(1193),
                  top: vw(-50),
                  width: vw(564), 
                  height: vw(933), 
                  borderRadius: vw(282), 
                  border: `${vw(1)} solid rgba(255, 255, 255, 0.2)` 
                }}
              >
                <OptimizedImage 
                  image={currentSlide.images[0].url} 
                  alt="Guide 1" 
                  width={564} 
                  height={933} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 26.5%, rgba(0,0,0,0.95) 100%)' }} />

                {/* 1-4 Text: Corrected to 24px */}
                <div 
                  className="absolute z-30 flex flex-col justify-end" 
                  style={{ 
                    left: vw(1266 - 1193), 
                    bottom: vw(100), 
                    width: vw(425),
                    minHeight: vw(384)
                  }}
                >
                  <p className="font-josefin-sans text-white leading-relaxed" style={{ fontSize: vw(24), textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
                    {currentSlide.content1}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
