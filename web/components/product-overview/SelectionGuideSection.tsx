"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionGuide } from "@/types/product-overview";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

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
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 185 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M93.3235 53.2493C102.107 44.4659 110.707 35.8655 119.125 27.4481C127.908 19.0307 136.691 10.2473 145.475 1.09793C151.696 7.31949 157.918 13.907 164.139 20.8605C170.727 27.814 177.132 34.4016 183.353 40.6231C174.936 49.0406 166.335 57.641 157.552 66.4243C149.135 74.8417 140.9 83.4422 132.849 92.2255C141.632 101.009 150.232 109.792 158.65 118.576C167.067 127.359 175.851 136.325 185 145.475L144.377 185C135.959 176.217 127.176 167.616 118.027 159.199C109.243 150.415 100.277 141.632 91.1276 132.849C83.0762 141.266 74.6588 149.866 65.8754 158.65C57.092 167.067 48.4916 175.668 40.0742 184.451C33.4867 177.863 26.8991 171.459 20.3116 165.237C13.724 158.65 7.31949 152.062 1.09793 145.475C9.88131 136.691 18.4817 128.091 26.8991 119.674C35.6825 111.256 44.4659 102.473 53.2493 93.3235L0 40.6231L39.5252 0L93.3235 53.2493Z"
        fill="url(#paint0_linear_1_3451)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_3451"
          x1="92.5"
          y1="0"
          x2="92.5"
          y2="185"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CBC382" />
          <stop offset="1" stopColor="#9F9335" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <section className="relative w-full overflow-hidden" id="selection-guide">
      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:block w-full"
        style={{
          minHeight: vw(922),
          paddingTop: vw(40),
          paddingBottom: vw(0),
        }}
      >
        <div
          className="mx-auto relative"
          style={{ width: vw(1500), height: vw(855) }}
        >
          {/* Decorative "X" Icon */}
          <motion.div
            className="absolute opacity-90"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: vw(285 - 210),
              top: vw(89 - 40),
              width: vw(144),
              height: vw(141),
            }}
          >
            <CrossIcon />
          </motion.div>

          {/* Titles - Precise Staggered Positioning */}
          <h2
            className="absolute font-limelight text-white leading-[1.33] z-40"
            style={{
              fontSize: vw(72),
              left: vw(294 - 210),
              top: vw(44 - 40),
              whiteSpace: 'pre-wrap'
            }}
          >
            {currentSlide.title1 + "\n     " + currentSlide.title2}
          </h2>

          {/* Highlight Box - Layered Sandwich Effect */}
          {/* 1. Background Layer (Bottom) */}
          <motion.div
            className="absolute overflow-hidden z-10 flex flex-col justify-start"
            style={{
              left: vw(115),
              top: vw(286 - 40),
              width: vw(440),
              height: vw(347),
              borderRadius: `${vw(40)} ${vw(40)} 0 0`,
              background:
                "linear-gradient(180deg, rgba(255, 240, 122, 0.75) 0%, rgba(153, 141, 41, 0) 100%)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* 2. Text Layer (Top) */}
          <div
            className="absolute z-30 flex flex-col justify-start pointer-events-none"
            style={{
              left: vw(115),
              top: vw(286 - 40),
              width: vw(440),
              height: vw(347),
              padding: `${vw(30)} ${vw(30)}`,
            }}
          >
            <p
              className="font-josefin-sans font-semibold text-[#635700] text-left whitespace-pre-line"
              style={{ fontSize: vw(32), lineHeight: 1.67 }}
              dangerouslySetInnerHTML={{ __html: currentSlide.highlightText }}
            />
          </div>

          {/* Navigation Buttons - Aligned with Pencil X: 298 and 1489 */}
          <button
            onClick={handlePrev}
            className="absolute z-[100] group cursor-pointer"
            style={{
              left: vw(298 - 210),
              top: vw(740),
              width: vw(80),
              height: vw(80),
            }}
          >
            <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
              <ChevronLeft
                style={{ width: vw(40), height: vw(40) }}
                className="text-[#464010] group-hover:text-white transition-colors"
              />
            </div>
          </button>

          <button
            onClick={handleNext}
            className="absolute z-[100] group cursor-pointer"
            style={{
              left: vw(1489 - 210),
              top: vw(740),
              width: vw(80),
              height: vw(80),
            }}
          >
            <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
              <ChevronRight
                style={{ width: vw(40), height: vw(40) }}
                className="text-[#464010] group-hover:text-white transition-colors"
              />
            </div>
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 z-10"
            >
              {/* Small Image (Arch) - Pencil Node c1X9Jb */}
              {currentSlide.images[1] && (
                <motion.div
                  className="absolute shadow-xl overflow-hidden z-20"
                  style={{
                    left: vw(640 - 210),
                    top: vw(398),
                    width: vw(417),
                    height: vw(440),
                    borderRadius: `${vw(258.5)} ${vw(258.5)} 0 0`,
                    border: `${vw(1)} solid rgba(255, 255, 255, 0.1)`,
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <OptimizedImage
                      image={currentSlide.images[1]}
                      alt="Guide 2"
                      className="w-full h-full object-cover scale-110" // Slightly scaled to avoid edge gaps during float
                      size="large"
                    />
                  </motion.div>
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
                    }}
                  />
                  <div
                    className="absolute z-30 flex flex-col justify-end"
                    style={{
                      left: vw(682 - 640),
                      bottom: vw(50),
                      width: vw(334),
                    }}
                  >
                    <p
                      className="font-josefin-sans text-white whitespace-pre-line"
                      style={{
                        fontSize: vw(24),
                        lineHeight: 1.28
                      }}
                      dangerouslySetInnerHTML={{ __html: currentSlide.content2 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Large Image (Capsule) - Pencil Node K4XSs */}
              {currentSlide.images[0] && (
                <motion.div
                  className="absolute overflow-hidden z-20"
                  style={{
                    left: vw(1173 - 210),
                    top: vw(10),
                    width: vw(450),
                    height: vw(700),
                    borderRadius: vw(282),
                    border: `${vw(1)} solid rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      y: [0, 20, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <OptimizedImage
                      image={currentSlide.images[0]}
                      alt="Guide 1"
                      className="w-full h-full object-cover scale-110" // Slightly scaled to avoid edge gaps
                      size="large"
                    />
                  </motion.div>
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
                    }}
                  />
                  <div
                    className="absolute z-30 flex flex-col justify-end"
                    style={{
                      left: vw(1220 - 1173),
                      bottom: vw(140),
                      width: vw(360),
                    }}
                  >
                    <p
                      className="font-josefin-sans text-white whitespace-pre-line"
                      style={{
                        fontSize: vw(24),
                        lineHeight: 1.28
                      }}
                      dangerouslySetInnerHTML={{ __html: currentSlide.content1 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout (< md) ==================== */}
      <div
        className="md:hidden w-full flex flex-col items-center py-16 px-6 relative overflow-hidden rounded-t-[32px]"
        style={{ background: '#756f3f' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col w-full"
          >
            {/* Header Area with Icon and Titles */}
            <div className="relative mb-10 pt-4 flex flex-col items-center">
              {/* Keep the icon centered near the title */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 opacity-20 pointer-events-none"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CrossIcon />
              </motion.div>
              <h2
                className="relative z-10 font-limelight text-white text-3xl leading-[1.3] whitespace-pre-wrap text-center"
              >
                {currentSlide.title1 + "\n" + currentSlide.title2}
              </h2>
            </div>

            {/* Highlight Box */}
            <div className="rounded-[24px] p-6 mb-10 bg-gradient-to-b from-yellow-200/50 to-transparent backdrop-blur-md border border-white/10">
              <p className="font-josefin-sans font-semibold text-[#464010] text-lg leading-relaxed">
                {currentSlide.highlightText}
              </p>
            </div>

            {/* Content Cards - Single Column Vertical Flow */}
            <div className="flex flex-col gap-10">
              {/* Image 1 Card */}
              {currentSlide.images[0] && (
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-[24px] overflow-hidden shadow-lg border border-white/10 mb-4">
                    <OptimizedImage
                      image={currentSlide.images[0]}
                      alt="Guide Mobile 1"
                      className="w-full h-full object-cover"
                      size="large"
                    />
                  </div>
                  <p
                    className="font-josefin-sans text-white/90 text-base leading-relaxed whitespace-pre-line px-1"
                    dangerouslySetInnerHTML={{ __html: currentSlide.content1 }}
                  />
                </div>
              )}

              {/* Image 2 Card */}
              {currentSlide.images[1] && (
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-[24px] overflow-hidden shadow-lg border border-white/10 mb-4">
                    <OptimizedImage
                      image={currentSlide.images[1]}
                      alt="Guide Mobile 2"
                      className="w-full h-full object-cover"
                      size="large"
                    />
                  </div>
                  <p
                    className="font-josefin-sans text-white/90 text-base leading-relaxed whitespace-pre-line px-1"
                    dangerouslySetInnerHTML={{ __html: currentSlide.content2 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Navigation Controls */}
        <div className="flex justify-between items-center mt-12 px-2">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white active:bg-white/10"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
