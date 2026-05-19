"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

interface MediaObject {
  id?: string;
  url: string;
  alt?: string;
}

interface Slide {
  title: string;
  description: string;
  image: MediaObject | null | any;
}

interface HeroSectionProps {
  slides: Slide[];
  locale: string;
}

// Response size helper
const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

export function HeroSection({ slides, locale }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(1.2);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setIsMobile(vw < 768);
      const isDesktopLayout = vw >= 1280 || (vw >= 768 && vw > vh);
      setIsDesktop(isDesktopLayout);

      const el = sectionRef.current;
      if (!el) return;

      if (isDesktopLayout) {
        const rawScale = vw / 1920;
        const baseScale = Math.max(rawScale, 0.5);
        // Multiply by 0.7 scale factor to match the design's desktop layout proportions
        el.style.setProperty("--rpx-hero", (baseScale * 0.7).toString());
        setStrokeWidth(1.2 * baseScale);
      } else {
        el.style.setProperty("--rpx-hero", "1");
        setStrokeWidth(1.2);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  // Card stack rotations from Figma
  const cardRotations = [11.02, 5.41, -12.4, -6.65, 0];

  // Design values
  const overlayColor = "rgba(53, 47, 3, 0.47)";
  const titleColor = "#FFF499";
  const titleShadowColor = "rgba(86, 80, 31, 1)";
  const textBoxColor = "rgba(39, 35, 2, 0.48)";

  const getSlideInStack = (offset: number) => {
    return slides[(currentIndex + offset) % slides.length];
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#352F03] flex justify-center items-center h-[80dvh] lg:h-[48vw] lg:min-h-[720px] mt-[2.4vw] lg:mt-[2.4vw]"
      style={{
        paddingTop: isDesktop ? rpx(46) : "46px",
      }}
      data-header-theme="light"
    >
      {/* 1. Global Background Image - Large Optimized Variant */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={getSlideInStack(0).image?.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <OptimizedImage
              image={getSlideInStack(0).image}
              size="xlarge"
              className="w-full h-full object-cover select-none"
              priority // LCP element
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Global Blur Overlay */}
      <div
        className="absolute inset-0 z-10 backdrop-blur-[8px]"
        style={{ backgroundColor: overlayColor }}
      />

      {/* 3. Stacked Items Container - Scaled on Desktop */}
      <div className="relative z-20 w-full h-full flex items-center justify-center pointer-events-none px-4 md:px-8">
        <div
          className="relative w-full h-auto origin-center transition-all duration-500"
          style={{
            width: isDesktop ? rpx(1429) : "100%",
            maxWidth: isDesktop ? undefined : "680px",
            minHeight: isDesktop ? rpx(720) : "450px",
          }}
        >
          {/* Back Cards - Hide on mobile if too cluttered */}
          <AnimatePresence>
            {[3, 2, 1].map((offset) => {
              const slide = getSlideInStack(offset);
              const rotation = cardRotations[offset - 1];

              return (
                <motion.div
                  key={`${slide.title}-${currentIndex}-${offset}`}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 0.5, rotate: rotation }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 overflow-hidden border border-white/10 hidden md:block"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: isDesktop ? rpx(267) : "100px",
                  }}
                >
                  {slide.image && (
                    <OptimizedImage
                      image={slide.image}
                      size="xlarge"
                      className="w-full h-full object-cover opacity-50 grayscale-[0.3]"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Top Primary Card - Large Optimized Variant */}
          <AnimatePresence mode="popLayout" initial={false}>
            {slides.map(
              (slide, i) =>
                i === currentIndex && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: -100, rotate: 2 }}
                    transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                    className="relative w-full h-auto border-[2px] border-[#FDF6C2] shadow-[18px_33px_17.4px_rgba(0,0,0,0.48)] overflow-hidden pointer-events-auto bg-[#272302]"
                    style={{
                      minHeight: isDesktop ? rpx(720) : "450px",
                      borderRadius: isDesktop ? rpx(267) : "60px",
                    }}
                  >
                    {/* Card Image and Gradient */}
                    <div className="absolute inset-0 z-0">
                      <OptimizedImage
                        image={slide.image}
                        size="xlarge"
                        className="w-full h-full object-cover"
                        priority
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(198, 191, 137, 0) 0%, rgba(39, 35, 2, 1) 100%)",
                          opacity: 0.7,
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className="relative z-10 w-full h-full px-6 md:px-0"
                      style={{
                        paddingTop: isDesktop ? rpx(297) : "100px",
                        paddingBottom: isDesktop ? rpx(60) : "50px",
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex flex-col justify-start w-full backdrop-blur-[10px]"
                        style={{
                          backgroundColor: textBoxColor,
                          width: isDesktop ? rpx(958) : "100%",
                          minHeight: isDesktop ? rpx(285) : "180px",
                          marginLeft: isDesktop ? rpx(-36) : "0px",
                          padding: isMobile
                            ? "20px 16px"
                            : isDesktop
                            ? `${rpx(48)} ${rpx(48)} ${rpx(48)} ${rpx(140)}`
                            : "48px 48px 48px 140px",
                        }}
                      >
                        <div
                          className="relative"
                          style={{
                            marginBottom: isDesktop ? rpx(24) : "16px",
                          }}
                        >
                          {/* 1. Behind Layer (HollowText Stroke) - 2px Offset */}
                          <div
                            className="absolute w-full font-normal leading-tight text-center md:text-left"
                            style={{
                              left: isDesktop ? rpx(2) : "2px",
                              top: isDesktop ? rpx(2) : "2px",
                              fontSize: isDesktop ? rpx(60) : "clamp(24px, 6vw, 36px)",
                              fontFamily: "var(--font-paytone-one)",
                              zIndex: 0,
                            }}
                          >
                            <HollowText strokeColor="#FFF499" strokeWidth={strokeWidth}>
                              {slide.title}
                            </HollowText>
                          </div>

                          {/* 2. Top Primary Layer */}
                          <h1
                            className="relative font-normal leading-tight text-center md:text-left"
                            style={{
                              fontSize: isDesktop ? rpx(60) : "clamp(24px, 6vw, 36px)",
                              fontFamily: "var(--font-paytone-one)",
                              color: titleColor,
                              textShadow: `0 4px 12.6px ${titleShadowColor}`,
                              zIndex: 1,
                            }}
                          >
                            {slide.title}
                          </h1>
                        </div>

                        <div className="text-center md:text-left">
                          <p
                            className="text-white font-semibold leading-normal tracking-tight"
                            style={{
                              fontSize: isDesktop ? rpx(33) : "clamp(13px, 3.5vw, 18px)",
                              fontFamily: "var(--font-anaheim)",
                              textShadow: "0 4px 7.8px rgba(0,0,0,0.71)",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: (slide.description || "").replace(
                                /\n/g,
                                "<br />",
                              ),
                            }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Controls */}
      <div
        className="absolute z-30 flex items-center bg-black/20 backdrop-blur-md rounded-full border border-white/10"
        style={{
          bottom: isDesktop ? rpx(48) : "24px",
          gap: isDesktop ? rpx(24) : "24px",
          padding: isDesktop ? `${rpx(16)} ${rpx(24)}` : "16px 24px",
          transform: isDesktop ? undefined : "scale(0.9)",
        }}
      >
        <button
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + slides.length) % slides.length,
            )
          }
          className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: isDesktop ? rpx(24) : "24px",
              height: isDesktop ? rpx(24) : "24px",
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div
          className="flex"
          style={{ gap: isDesktop ? rpx(8) : "8px" }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-500 rounded-full ${i === currentIndex ? "bg-[#FFF499]" : "bg-white/20"}`}
              style={{
                height: isDesktop ? rpx(4) : "4px",
                width: i === currentIndex ? (isDesktop ? rpx(32) : "32px") : (isDesktop ? rpx(8) : "8px"),
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: isDesktop ? rpx(24) : "24px",
              height: isDesktop ? rpx(24) : "24px",
            }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
