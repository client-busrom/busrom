"use client";

import React, { useState, useEffect } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { motion, AnimatePresence } from "framer-motion";
import { HollowText } from "@/components/common/HollowText";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqPopularItem {
  id: string;
  question: any;
  answer: any;
  image1: any;
  image2: any;
  image3: any;
}

interface FaqPopularSectionProps {
  data: {
    title: any;
    subtitle: any;
    carousel: {
      slides: FaqPopularItem[];
    };
  };
  locale?: string;
}

const getNodesText = (nodes: any): string => {
  if (!nodes) return "";
  if (typeof nodes === "string") return nodes;
  if (Array.isArray(nodes)) {
    return nodes.map((n) => getNodesText(n)).join("");
  }
  if (nodes.text) return nodes.text;
  if (nodes.children) return getNodesText(nodes.children);
  return "";
};

export function FaqPopularSection({ data }: FaqPopularSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const slides = data?.carousel?.slides || [];
  const currentSlide =
    slides[((activeIndex % slides.length) + slides.length) % slides.length];

  const handlePrev = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = React.useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setActiveIndex((prev) => prev + 1);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext, slides.length, activeIndex]);

  if (!currentSlide || slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f4ed]"
      style={{ height: vw(1032) }}
    >
      {/* Background Main Card */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[30px] shadow-2xl overflow-hidden"
        style={{
          width: vw(1460),
          height: vw(900),
          top: vw(11.5),
          background: "linear-gradient(180deg, #756f3f 0%, #c0b985 100%)",
        }}
      >
        {/* Decorative background Q & A Letters */}
        <div
          className="absolute font-anaheim font-black select-none pointer-events-none text-[#d7d1a8] opacity-40"
          style={{ fontSize: vw(250), right: vw(630), bottom: vw(180) }}
        >
          Q
        </div>
        <div
          className="absolute font-anaheim font-black select-none pointer-events-none text-[#d7d1a8] opacity-40"
          style={{ fontSize: vw(350), right: vw(30), bottom: vw(-120) }}
        >
          A
        </div>

        {/* Header Title & Subtitle Group */}
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: vw(140), top: vw(80) }}
        >
          <div className="relative">
            {/* Hollow Subtitle Background */}
            <div
              className="absolute left-0"
              style={{ top: vw(4), left: vw(4) }}
            >
              <HollowText
                strokeColor="#c6c091"
                strokeWidth={1}
                className="font-anaheim font-bold pointer-events-none"
                style={{ fontSize: vw(80), letterSpacing: vw(9) }}
              >
                {getNodesText(data.title) || ""}
              </HollowText>
            </div>

            {/* Foreground Title Text */}
            <div className="relative z-10 flex flex-col">
              <h3
                className="font-black font-anaheim text-[#58542f]"
                style={{
                  fontSize: vw(80),
                  letterSpacing: vw(7),
                  WebkitTextStroke: `${vw(3)} #fff23e`,
                  paintOrder: "stroke fill",
                }}
              >
                {getNodesText(data.title) || ""}
              </h3>
              <span
                className="font-extrabold font-anaheim text-white tracking-widest"
                style={{
                  fontSize: vw(60),
                  marginTop: vw(-30),
                  letterSpacing: vw(10),
                }}
              >
                {getNodesText(data.subtitle) || ""}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div
          className="absolute flex z-50"
          style={{ right: vw(100), top: vw(150), gap: vw(50) }}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="relative flex items-center justify-center rounded-full transition-all duration-300 group overflow-hidden"
            style={{ width: vw(88), height: vw(88), border: `${vw(2)} solid rgba(255, 255, 255, 0.7)` }}
          >
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 bg-white/70 transition-all duration-300 group-hover:bg-[#756f3f]"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E")`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: vw(48),
              }}
            />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="relative flex items-center justify-center rounded-full transition-all duration-300 group overflow-hidden"
            style={{ width: vw(88), height: vw(88), border: `${vw(2)} solid rgba(255, 255, 255, 0.7)` }}
          >
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 bg-white/70 transition-all duration-300 group-hover:bg-[#756f3f]"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: vw(48),
              }}
            />
          </button>
        </div>

        {/* Carousel Image Cards Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence initial={false}>
            {[-1, 0, 1, 2, 3].map((vIdx) => {
              const visualIndex = activeIndex + vIdx;
              const realIdx =
                ((visualIndex % slides.length) + slides.length) % slides.length;
              const item = slides[realIdx];
              if (!item) return null;

              let centerX = 0,
                y = 287,
                w = 0,
                h = 0,
                opacity = 1,
                zIndex = 10;

              if (vIdx === -1) {
                centerX = -30;
                w = 240;
                h = 188;
                opacity = 0;
                zIndex = 5;
              } else if (vIdx === 0) {
                centerX = 432.5;
                w = 605;
                h = 531;
                opacity = 1;
                zIndex = 30;
              } else if (vIdx === 1) {
                centerX = 991;
                w = 240;
                h = 188;
                opacity = 1;
                zIndex = 20;
              } else if (vIdx === 2) {
                centerX = 1255;
                w = 240;
                h = 188;
                opacity = 1;
                zIndex = 10;
              } else if (vIdx === 3) {
                centerX = 1520;
                w = 240;
                h = 188;
                opacity = 0;
                zIndex = 5;
              }

              // Logic for staggered animation
              const isBecomingActive = vIdx === 0;
              const isLeavingActive =
                (direction === 1 && vIdx === -1) ||
                (direction === -1 && vIdx === 1);

              return (
                <motion.div
                  key={visualIndex}
                  initial={{
                    left: vw(direction === 1 ? 1600 : -400),
                    top: vw(287),
                    width: vw(240),
                    height: vw(188),
                    opacity: 0,
                    zIndex: 5,
                  }}
                  animate={{
                    left: vw(centerX),
                    top: vw(y),
                    width: vw(w),
                    height: vw(h),
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1],
                    // Enlarge: Move then Size
                    width: {
                      delay: isBecomingActive ? 0.3 : 0,
                      duration: isBecomingActive ? 0.5 : 0.8,
                    },
                    height: {
                      delay: isBecomingActive ? 0.3 : 0,
                      duration: isBecomingActive ? 0.5 : 0.8,
                    },
                    // Shrink: Size then Move (Delay pos)
                    left: {
                      delay: isLeavingActive ? 0.3 : 0,
                      duration: isLeavingActive ? 0.5 : 0.8,
                    },
                    top: {
                      delay: isLeavingActive ? 0.3 : 0,
                      duration: isLeavingActive ? 0.5 : 0.8,
                    },
                  }}
                  className="absolute rounded-[30px] overflow-hidden shadow-2xl -translate-x-1/2"
                >
                  <OptimizedImage
                    image={item.image1}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dynamic Text Information Layer */}
        <AnimatePresence>
          <motion.div
            key={`text-${activeIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, position: "absolute" }}
            transition={{ duration: 0.5 }}
            className="absolute flex flex-col pointer-events-none"
            style={{
              left: vw(780),
              top: vw(524),
              width: vw(593),
              gap: vw(12),
            }}
          >
            <div
              className="font-extrabold text-[#3c3607] font-anaheim [&_p]:m-0 [&_p]:leading-[1.1]"
              style={{ fontSize: vw(36), lineHeight: 1.1 }}
            >
              <LexicalRenderer content={currentSlide.question} />
            </div>
            <div
              className="font-semibold text-[#3c3607] font-anaheim [&_p]:m-0"
              style={{ fontSize: vw(20), lineHeight: 1.5 }}
            >
              <LexicalRenderer content={currentSlide.answer} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
