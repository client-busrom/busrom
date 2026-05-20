"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface BrandStrengthItem {
  title: string;
  description?: string;
  image: MediaObject | null;
}

interface MediaObject {
  url: string;
  id: string;
}

interface StoryBrandStrengthsSectionProps {
  data: {
    title: string;
    items: {
      slides: BrandStrengthItem[];
    };
  };
}

/**
 * StrengthOrbit
 * Memoized decorative orbit to prevent re-renders.
 */
const StrengthOrbit = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const uniqueId = React.useId().replace(/:/g, "");
  const animationName = `orbit-${uniqueId}`;

  const keyframesCSS = React.useMemo(() => {
    const steps = 60;
    
    // Scale dimensions based on mobile/desktop
    const a = isMobile ? 100 : 150; 
    const b = isMobile ? 40 : 60;
    const rot = -22.02 * (Math.PI / 180);
    const centerX = isMobile ? 100 : 150;
    const centerY = isMobile ? 40 : 60;

    let css = `@keyframes ${animationName} {\n`;
    for (let i = 0; i <= steps; i++) {
      const pct = ((i / steps) * 100).toFixed(2);
      const t = (i / steps) * 2 * Math.PI;
      const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot);
      const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot);
      const xVal = isMobile ? `${centerX + x}px` : vw(centerX + x);
      const yVal = isMobile ? `${centerY + y}px` : vw(centerY + y);
      const rotation = ((i / steps) * 360).toFixed(1);
      
      css += `  ${pct}% { transform: translate3d(${xVal}, ${yVal}, 0) rotate(${rotation}deg); }\n`;
    }
    css += "}";
    return css;
  }, [isMobile, animationName]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        right: isMobile ? -20 : vw(40),
        top: isMobile ? -50 : vw(-40),
        width: isMobile ? 200 : vw(300),
        height: isMobile ? 80 : vw(120),
        zIndex: 5,
      }}
    >
      <style>{keyframesCSS}</style>
      <div
        className="absolute inset-0 border border-[#C9C177]"
        style={{
          borderRadius: "50%",
          transform: "rotate(-22.02deg)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: isMobile ? 20 : vw(28),
          height: isMobile ? 20 : vw(28),
          left: 0,
          top: 0,
          marginLeft: isMobile ? -10 : vw(-14),
          marginTop: isMobile ? -10 : vw(-14),
          zIndex: 8,
          animation: `${animationName} 8s linear infinite`,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
          <path
            d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
            fill="#C9C177"
          />
        </svg>
      </div>
    </div>
  );
});

export function StoryBrandStrengthsSection({
  data,
}: StoryBrandStrengthsSectionProps) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rpx = useCallback(
    (px: number) => {
      if (windowWidth === 0) return `${px}px`;
      let base = 1920;
      if (windowWidth > 767 && windowWidth < 1440) {
        base = 1360;
      }
      const val = (px / base) * windowWidth;
      return `${val}px`;
    },
    [windowWidth],
  );

  const isMobile = windowWidth > 0 && windowWidth < 768;
  const slides = data?.items?.slides || [];

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length, isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length, isAnimating]);

  const visibleSlides = useMemo(() => {
    if (slides.length === 0) return [];
    const prev = (activeIndex - 1 + slides.length) % slides.length;
    const next = (activeIndex + 1) % slides.length;
    return [
      { ...slides[prev], originalIdx: prev, type: "left" },
      { ...slides[activeIndex], originalIdx: activeIndex, type: "middle" },
      { ...slides[next], originalIdx: next, type: "right" },
    ];
  }, [activeIndex, slides]);

  // ------------------------------------------------------------------------------------------------
  // MOBILE RENDER (Completely Independent)
  // ------------------------------------------------------------------------------------------------
  if (isMobile) {
    return (
      <section className="relative w-full overflow-hidden bg-[#f6f4ed] pb-10">
        <div className="px-6 pt-10 text-left">
          <h2 className="font-josefin-sans font-bold text-[#574f0e] text-[32px] leading-tight">
            {data?.title}
          </h2>
        </div>

        <div className="mt-8 px-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                const swipeThreshold = 50;
                if (info.offset.x < -swipeThreshold) {
                  handleNext();
                } else if (info.offset.x > swipeThreshold) {
                  handlePrev();
                }
              }}
              onAnimationComplete={() => setIsAnimating(false)}
              className="w-full bg-white rounded-[24px] shadow-md flex flex-col cursor-grab active:cursor-grabbing"
            >
              {/* Image Area: Smaller height and top-only rounded corners */}
              <div className="w-full aspect-[16/9] relative bg-[#d9d9d9] rounded-t-[24px] overflow-hidden">
                <OptimizedImage
                  image={
                    slides[activeIndex]?.image ||
                    "/BusromFooterBg_original.webp"
                  }
                  alt=""
                  size="medium"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col items-start relative">
                <h3 className="font-josefin-sans font-bold text-black text-[20px] mb-2">
                  {slides[activeIndex]?.title}
                </h3>
                <p className="font-josefin-sans font-light text-black/70 text-[14px] leading-relaxed">
                  {slides[activeIndex]?.description}
                </p>

                {/* Orbiting Star Effect for Mobile */}
                {mounted && <StrengthOrbit isMobile={true} />}

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile Navigation Dots & Arrows */}
          <div className="flex justify-between items-center mt-6">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[#756f3f] rounded-full active:bg-[#756f3f]/10"
              onClick={handlePrev}
            >
              <svg
                className="w-5 h-5 rotate-180 text-[#756f3f]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? "bg-[#756f3f] w-3" : "bg-[#756f3f]/30"}`}
                />
              ))}
            </div>

            <div
              className="w-10 h-10 flex items-center justify-center border border-[#756f3f] rounded-full active:bg-[#756f3f]/10"
              onClick={handleNext}
            >
              <svg
                className="w-5 h-5 text-[#756f3f]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f4ed] my-20"
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full text-black">
        {/* 1. Header Title - Case Sensitive and Line-Break Persistent */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{ left: vw(317), top: vw(51.5) }}
        >
          <h2
            className="font-josefin-sans font-bold text-[#574f0e] whitespace-pre-wrap"
            style={{ fontSize: vw(80), lineHeight: 0.9, textTransform: "none" }}
          >
            {data?.title}
          </h2>
        </div>

        {/* Three colored balls - top right decoration (Floating staggered animation) */}
        <div
          className="absolute flex gap-[6px]"
          style={{ left: vw(1263), top: vw(62) }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full shadow-sm"
            style={{
              width: vw(18),
              height: vw(18),
              backgroundColor: "#756F3F",
            }}
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="rounded-full shadow-sm"
            style={{
              width: vw(18),
              height: vw(18),
              backgroundColor: "#DAC99E",
            }}
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
            className="rounded-full border border-black/10 shadow-sm"
            style={{
              width: vw(18),
              height: vw(18),
              backgroundColor: "#F6F4ED",
            }}
          />
        </div>

        {/* 2. Navigation Buttons */}
        {/* 2. Navigation Buttons - Standardized Hollow-to-Filled Hover */}
        <div
          className="group absolute z-[100] flex items-center justify-center cursor-pointer border border-[#756f3f] bg-transparent rounded-full hover:bg-[#756f3f] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-lg"
          style={{ left: vw(400), top: vw(295), width: vw(60), height: vw(60) }}
          onClick={handlePrev}
        >
          <svg
            style={{ width: vw(30), height: vw(30) }}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-180 text-[#756f3f] group-hover:text-white transition-colors duration-300"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          className="group absolute z-[100] flex items-center justify-center cursor-pointer border border-[#756f3f] bg-transparent rounded-full hover:bg-[#756f3f] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-lg"
          style={{
            right: vw(240),
            bottom: vw(84),
            width: vw(60),
            height: vw(60),
          }}
          onClick={handleNext}
        >
          <svg
            style={{ width: vw(30), height: vw(30) }}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#756f3f] group-hover:text-white transition-colors duration-300"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 3. Ladder Carousel */}
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleSlides.map((slide) => {
              const isMiddle = slide.type === "middle";
              const isLeft = slide.type === "left";
              const isRight = slide.type === "right";

              // Dimensions
              let width = 586;
              let height = 344;
              let imageWidth = 586;

              if (isMiddle) {
                width = 1068;
                height = 628;
                imageWidth = 469;
              } else if (isLeft) {
                width = 438;
                height = 327;
                imageWidth = 163;
              }

              // Positions
              let top = 242.5;
              if (isLeft) top = 543.5;

              let leftPos = 503; // Middle
              if (isLeft) leftPos = 35;
              if (isRight) leftPos = 1601;

              return (
                <motion.div
                  key={slide.originalIdx}
                  initial={{
                    opacity: 0,
                    left: vw(leftPos + (isRight ? 100 : isLeft ? -100 : 0)),
                    top: vw(top),
                  }}
                  animate={{
                    opacity: 1,
                    left: vw(leftPos),
                    top: vw(top),
                    width: vw(width),
                    height: vw(height),
                    zIndex: isMiddle ? 50 : 20,
                  }}
                  exit={{ opacity: 0, scale: 0.95, zIndex: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  onAnimationComplete={() => isMiddle && setIsAnimating(false)}
                  className="absolute pointer-events-auto cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 shadow-xl ${isMiddle ? "" : "overflow-hidden"} ${isLeft ? "" : "bg-white"}`}
                    style={{
                      borderRadius: vw(60),
                      backgroundColor: isLeft
                        ? "#B9B380"
                        : isMiddle
                          ? "#ffffff"
                          : "transparent",
                    }}
                    onClick={() => {
                      if (isAnimating) return;
                      if (isLeft) handlePrev();
                      if (isRight) handleNext();
                    }}
                  >
                    {isLeft ? (
                      <div className="relative w-full h-full p-[vw(20)]">
                        <div
                          className="absolute overflow-hidden"
                          style={{
                            top: vw(22),
                            left: vw(30),
                            width: vw(163),
                            height: vw(194),
                            borderRadius: vw(30),
                          }}
                        >
                          <OptimizedImage
                            image={
                              slide.image || "/BusromFooterBg_original.webp"
                            }
                            alt=""
                            size="small"
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div
                          className="absolute text-[#eee8b3] opacity-80"
                          style={{
                            top: vw(30),
                            right: vw(30),
                            width: vw(26),
                            height: vw(26),
                          }}
                        >
                          <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 1000 1000"
                            fill="currentColor"
                          >
                            <path d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" />
                          </svg>
                        </div>

                        <div
                          className="absolute w-full"
                          style={{
                            bottom: vw(40),
                            left: 0,
                            paddingLeft: vw(30),
                            paddingRight: vw(30),
                          }}
                        >
                          <h4
                            className="font-josefin-sans font-bold line-clamp-1 text-[16px] lg:text-[24px]"
                            style={{
                              color: "#dbd7bc",
                              WebkitTextStroke: "1px black",
                              paintOrder: "stroke fill",
                              textTransform: "uppercase",
                            }}
                          >
                            {slide.title}
                          </h4>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full h-full">
                        <motion.div
                          className="relative h-full flex-shrink-0 bg-[#d9d9d9] overflow-hidden"
                          style={{
                            borderTopLeftRadius: vw(60),
                            borderBottomLeftRadius: vw(60),
                          }}
                          animate={{ width: vw(imageWidth) }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 20,
                          }}
                        >
                          <OptimizedImage
                            image={
                              slide.image || "/BusromFooterBg_original.webp"
                            }
                            alt=""
                            size="medium"
                            className="object-cover w-full h-full"
                          />

                          {isRight && (
                            <div
                              className="absolute inset-0 bg-black/30 flex flex-col justify-end"
                              style={{
                                paddingLeft: vw(32),
                                paddingRight: vw(32),
                                paddingBottom: vw(40),
                                paddingTop: vw(32),
                              }}
                            >
                              <h4
                                className="font-josefin-sans font-bold text-white/50"
                                style={{ fontSize: vw(32) }}
                              >
                                {slide.title}
                              </h4>
                            </div>
                          )}

                          {isRight && (
                            <div
                              className="absolute top-8 right-8 text-[#eee8b3] opacity-60"
                              style={{ width: 26, height: 26 }}
                            >
                              <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 1000 1000"
                                fill="currentColor"
                              >
                                <path d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" />
                              </svg>
                            </div>
                          )}
                        </motion.div>

                        {isMiddle && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: vw(599) }}
                            transition={{
                              type: "spring",
                              stiffness: 100,
                              damping: 20,
                            }}
                            className="h-full flex flex-col justify-start bg-transparent relative z-20 overflow-hidden"
                            style={{
                              borderTopRightRadius: vw(60),
                              borderBottomRightRadius: vw(60),
                            }}
                          >
                            <div
                              style={{
                                width: vw(599),
                                paddingTop: vw(60),
                                paddingLeft: vw(51),
                                paddingRight: vw(40),
                              }}
                            >
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={slide.originalIdx}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <h3
                                    className="font-josefin-sans font-bold text-black"
                                    style={{
                                      fontSize: vw(28),
                                      lineHeight: 1.1,
                                      maxWidth: vw(483),
                                      marginBottom: vw(72),
                                    }}
                                  >
                                    {slide.title}
                                  </h3>
                                  <p
                                    className="font-josefin-sans font-light text-black/80"
                                    style={{
                                      fontSize: vw(36),
                                      lineHeight: 1.1,
                                      maxWidth: vw(508),
                                    }}
                                  >
                                    {slide.description}
                                  </p>
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Orbiting Star Effect inside Middle Item (behind text, but above white card bg) */}
                    {isMiddle && mounted && <StrengthOrbit isMobile={false} />}
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
