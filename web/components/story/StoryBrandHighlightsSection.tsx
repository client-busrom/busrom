"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) => `calc((${px} / 390) * 100vw)`;

interface MediaObject {
  url: string;
  id: string;
}

interface BrandHighlightItem {
  title: any;
  content: any;
  images: MediaObject[];
}

interface StoryBrandHighlightsSectionProps {
  data: {
    title: string;
    slides: BrandHighlightItem[];
  };
}

export function StoryBrandHighlightsSection({
  data,
}: StoryBrandHighlightsSectionProps) {
  const isMobileHook = useIsMobile();
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderLexicalNodes = (nodes: any[]): React.ReactNode => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map((node, index) => {
      if (node.type === "text") {
        const text = node.text || "";
        // format 1 is Bold in Lexical
        if (node.format & 1) {
          return (
            <strong key={index} className="text-[1.15em] text-[#574f0e] font-bold">
              {text}
            </strong>
          );
        }
        return <span key={index}>{text}</span>;
      }
      if (node.type === "linebreak") {
        return <br key={index} />;
      }
      if (node.children) {
        return <React.Fragment key={index}>{renderLexicalNodes(node.children)}</React.Fragment>;
      }
      return null;
    });
  };


  const isTabletOrMobile = windowWidth > 0 && windowWidth <= 1024;

  const slides = (data?.slides || []).slice(0, 4);
  const currentSlide = slides[activeSlideIdx];
  const images = currentSlide?.images || [];
  const imageCount = images.length;

  const handleNextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveSlideIdx((prev) => (prev + 1) % slides.length);
    setActiveImageIdx(0);
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
    setActiveImageIdx(0);
  }, [slides.length]);

  useEffect(() => {
    if (!isInView || imageCount <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % imageCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView, imageCount, activeImageIdx, activeSlideIdx]);

  const toggleImage = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % imageCount);
  }, [imageCount]);

  const formatIndex = (idx: number) => (idx + 1).toString().padStart(2, "0");

  if (!slides.length) return null;

  // --- MOBILE / TABLET LAYOUT ---
  if (isTabletOrMobile) {
    return (
      <section ref={sectionRef} className="relative w-full py-10 px-5 bg-[#f6f4ed]">
        <div className="text-center font-josefin-sans font-bold text-3xl mb-8 text-[#3b3b3b]">
          {data?.title || "Brand Highlights"}
        </div>

        <div className="relative w-full max-w-[420px] md:max-w-[500px] mx-auto aspect-[350/560] rounded-[40px] overflow-hidden shadow-xl bg-white group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlideIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleNextSlide();
                if (info.offset.x > 50) handlePrevSlide();
              }}
            >
              {/* Background Layer: Image 2 + Blur */}
              <div className="absolute inset-0 z-0">
                {currentSlide?.images?.[1] ? (
                  <OptimizedImage
                    image={currentSlide.images[1]}
                    alt=""
                    className="object-cover w-full h-full blur-2xl scale-110 opacity-30"
                  />
                ) : (
                  currentSlide?.images?.[0] && (
                    <OptimizedImage
                      image={currentSlide.images[0]}
                      alt=""
                      className="object-cover w-full h-full blur-2xl scale-110 opacity-20"
                    />
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />
              </div>

              {/* Content Layer */}
              <div className="relative z-10 h-full p-8 flex flex-col items-center">
                {/* Index Indicator */}
                <div className="w-full flex justify-end mb-4">
                  <span className="font-josefin-sans font-bold text-2xl text-[#756f3f]/40 italic">
                    {formatIndex(activeSlideIdx)}
                  </span>
                </div>

                {/* Small Square Image: Image 1 */}
                <div className="w-[200px] aspect-[200/280] rounded-[32px] overflow-hidden shadow-xl mb-8 bg-gray-100 border-4 border-white">
                  {currentSlide?.images?.[0] && (
                    <OptimizedImage
                      image={currentSlide.images[0]}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>

                {/* Text Content */}
                <div className="font-josefin-sans font-bold text-2xl text-[#574f0e] text-center mb-4 leading-tight">
                  {renderLexicalNodes(currentSlide?.title)}
                </div>
                <div className="font-josefin-sans font-semibold text-[#756f3f] text-center text-sm leading-relaxed px-4 overflow-y-auto max-h-[180px]">
                  {renderLexicalNodes(currentSlide?.content)}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="mt-auto w-full flex justify-between items-center px-4 pb-4">
                  <button
                    onClick={handlePrevSlide}
                    className="w-12 h-12 rounded-full border border-[#756f3f] flex items-center justify-center hover:bg-[#756f3f] group/btn transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="rotate-180 group-hover/btn:stroke-white stroke-[#756f3f]"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                      />
                    </svg>
                  </button>

                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          activeSlideIdx === i
                            ? "bg-[#574f0e] w-4"
                            : "bg-[#574f0e]/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextSlide}
                    className="w-12 h-12 rounded-full border border-[#756f3f] flex items-center justify-center hover:bg-[#756f3f] group/btn transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="group-hover/btn:stroke-white stroke-[#756f3f]"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <section
      ref={sectionRef}
      className="relative w-full mx-auto overflow-hidden my-[60px]"
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full mx-auto">
        {/* 1. Section Title: Precise Position (x:331, y:11) */}
        <div
          className="absolute font-josefin-sans font-bold text-[#3b3b3b] flex items-center justify-center text-center"
          style={{
            left: vw(331),
            top: vw(11),
            width: vw(588.65),
            height: vw(135.15),
            fontSize: vw(72),
            lineHeight: 1,
          }}
        >
          {data?.title || "Brand Highlights"}
        </div>

        {/* 2. Left Double-Layered Image Area (x:301, y:146) */}
        <div
          className="absolute"
          style={{
            left: vw(301),
            top: vw(146),
            width: vw(560),
            height: vw(740),
          }}
        >
          {/* Layer 1: Blurred Backdrop (Rectangle 455 & 461) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: vw(60) }}
          >
            <motion.div
              className="absolute inset-x-0 h-full flex"
              animate={{ x: `-${activeImageIdx * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ width: "100%" }}
            >
              {(images || []).map((img, i) => (
                <div
                  key={`bg-${activeSlideIdx}-${i}`}
                  className="relative flex-shrink-0 w-full h-full"
                >
                  <div className="absolute inset-0 z-0">
                    <OptimizedImage
                      image={img}
                      alt=""
                      size="medium"
                      className="object-cover w-full h-full blur-[10px] scale-110 opacity-70"
                      priority={i === 0}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[40.25px]" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Layer 2: Pill-Shaped Image (k5ZiGO) */}
          <div
            className="absolute shadow-2xl z-10 overflow-hidden cursor-pointer"
            style={{
              left: vw(123.05),
              top: vw(167.08),
              width: vw(319.45),
              height: vw(471.19),
              borderRadius: vw(248),
            }}
            onClick={toggleImage}
          >
            <motion.div
              className="absolute inset-x-0 h-full flex"
              animate={{ x: `-${activeImageIdx * 100}%` }}
              drag={imageCount > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -30 && activeImageIdx < imageCount - 1)
                  setActiveImageIdx(1);
                else if (info.offset.x > 30 && activeImageIdx > 0)
                  setActiveImageIdx(0);
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ width: "100%" }}
            >
              {(images || []).map((img, i) => (
                <div
                  key={`fg-${activeSlideIdx}-${i}`}
                  className="relative flex-shrink-0 w-full h-full"
                >
                  <OptimizedImage
                    image={img}
                    alt=""
                    size="medium"
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div
            className="absolute z-30 w-full flex justify-between items-center pointer-events-none"
            style={{
              left: 0,
              top: vw(44.21),
              paddingLeft: vw(40),
              paddingRight: vw(40),
            }}
          >
            <button
              onClick={handlePrevSlide}
              className="rounded-full border border-black flex items-center justify-center hover:bg-[#756f3f] hover:border-[#756f3f] group transition-all duration-300 shadow-sm pointer-events-auto"
              style={{ width: vw(60), height: vw(60) }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="rotate-180 group-hover:stroke-white stroke-black transition-all duration-300 group-hover:scale-125"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="currentColor"
                />
              </svg>
            </button>

            <button
              onClick={handleNextSlide}
              className="rounded-full border border-black flex items-center justify-center hover:bg-[#756f3f] hover:border-[#756f3f] group transition-all duration-300 shadow-sm pointer-events-auto"
              style={{ width: vw(60), height: vw(60) }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="group-hover:stroke-white stroke-black transition-all duration-300 group-hover:scale-125"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Pagination Dots */}
          <div
            className="absolute z-20 flex gap-[10px]"
            style={{ left: vw(261.72), top: vw(670.95) }}
          >
            {images.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`cursor-pointer transition-all duration-300 ${activeImageIdx === i ? "bg-white" : "bg-white/30"}`}
                style={{ width: vw(12), height: vw(12), borderRadius: "50%" }}
              />
            ))}
          </div>

          {/* Index Counter */}
          <div
            className="absolute z-20 font-josefin-sans font-semibold text-white text-center"
            style={{
              left: vw(483),
              top: vw(687),
              fontSize: vw(36),
              lineHeight: 1,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {formatIndex(activeSlideIdx)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Right Content Area (Bottom-Up growth to protect thumbnails) */}
        <div
          className="absolute flex flex-col justify-end"
          style={{
            left: vw(921),
            top: vw(146),
            height: vw(652 - 146 - 40),
            width: vw(692),
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlideIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div
                className="font-josefin-sans font-bold text-[#574f0e] leading-[1.25] whitespace-pre-wrap"
                style={{ fontSize: vw(48) }}
              >
                {renderLexicalNodes(currentSlide?.title)}
              </div>
              <div
                className="font-josefin-sans font-semibold text-[#756f3f] text-center"
                style={{ marginTop: vw(12), fontSize: vw(16), lineHeight: 1.4 }}
              >
                {renderLexicalNodes(currentSlide?.content)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Thumbnail Preview Area (Fixed at y:652) */}
        <div
          className="absolute flex"
          style={{ left: vw(921), top: vw(652), gap: vw(12) }}
        >
          {slides.map((item, index) => {
            const isActive = index === activeSlideIdx;
            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ width: vw(164) }}
              >
                <div
                  onClick={() => !isActive && setActiveSlideIdx(index)}
                  className={`relative w-full flex flex-col items-center transition-all duration-300 ${
                    isActive
                      ? "opacity-0 pointer-events-none"
                      : "cursor-pointer group"
                  }`}
                >
                  <div
                    className="relative w-full aspect-[164/189] overflow-hidden mb-3 border border-black/5"
                    style={{ borderRadius: vw(31) }}
                  >
                    {item.images?.[0] && (
                      <OptimizedImage
                        image={item.images[0]}
                        alt=""
                        size="small"
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div
                    className="font-helvetica font-bold text-[#514a0d] text-center"
                    style={{ fontSize: vw(16), lineHeight: 1.1875 }}
                  >
                    {renderLexicalNodes(item.title)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
