"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { HollowText } from "@/components/common/HollowText";
import { RichText, defaultJSXConverters } from "@payloadcms/richtext-lexical/react";
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";

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
    title?: any;
    subtitle?: any;
    items?: any[];
    carousel?: {
      slides: FaqPopularItem[];
    };
  };
  locale?: string;
}

const getNodesText = (nodes: any, locale?: string): string => {
  if (!nodes) return "";
  if (typeof nodes === "string") return nodes;

  // Support for localized objects {en: "...", zh: "..."}
  if (typeof nodes === "object" && !Array.isArray(nodes) && (nodes.en || nodes.zh)) {
    return nodes[locale as any] || nodes.en || nodes.zh || "";
  }

  if (Array.isArray(nodes)) {
    return nodes.map((n) => getNodesText(n, locale)).join("");
  }
  if (nodes.text) return nodes.text;
  if (nodes.children) return getNodesText(nodes.children, locale);
  return "";
};

/**
 * Truncate Lexical content at the first horizontalrule
 */
const truncateLexicalContent = (content: any) => {
  if (!content || !content.root || !content.root.children) return content;

  const hrIndex = content.root.children.findIndex(
    (node: any) => node.type === "horizontalrule"
  );

  if (hrIndex === -1) return content;

  // Use shallow copy for the outer structure to be efficient
  return {
    ...content,
    root: {
      ...content.root,
      children: content.root.children.slice(0, hrIndex)
    }
  };
};

/**
 * Custom converters for FAQ popular section
 * Renders bold text as font-anaheim #FFEE53
 */
const faqConverters: JSXConverters = {
  ...defaultJSXConverters,
  text: ({ node }: any) => {
    let text = node.text;
    const format = node.format || 0;

    // Standard Lexical bold format
    if (format & 1) {
      text = (
        <strong key="bold" className="font-anaheim font-bold" style={{ color: "#FFEE53" }}>
          {text}
        </strong>
      );
    }
    // Handle other formats if needed (italic, etc.)
    if (format & 2) text = <em key="italic">{text}</em>;
    if (format & 8)
      text = (
        <span key="underline" style={{ textDecoration: "underline" }}>
          {text}
        </span>
      );

    return text;
  },
};

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { useIsMobile } from "@/hooks/use-mobile";

export function FaqPopularSection({ data, locale = "en" }: FaqPopularSectionProps) {
  const isMobile = useIsMobile();
  const mvw = (px: number) => `${(px / 375) * 100}vw`;
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalIndex, setTotalIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [faqDataCache, setFaqDataCache] = useState<Record<string, any>>({});
  const [mediaCache, setMediaCache] = useState<Record<string, any>>({});
  const fetchingIdsRef = useRef<Set<string>>(new Set());
  const lastClickTimeRef = useRef(0);
  
  // Support both direct items and nested carousel.slides
  const slides = data?.items || data?.carousel?.slides || [];
  
  // Initialize Embla
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  const currentSlide =
    slides[((activeIndex % slides.length) + slides.length) % slides.length];

  // Hydrate ALL FAQ and Media data from slides
  useEffect(() => {
    if (!slides || slides.length === 0) return;

    slides.forEach((slide: any) => {
      // Hydrate FAQ
      const faqId = slide.faq;
      if (faqId && typeof faqId !== "object" && !faqDataCache[faqId] && !fetchingIdsRef.current.has(faqId)) {
        fetchingIdsRef.current.add(faqId);
        fetch(`/api/payload/faq-items/${faqId}?depth=0`)
          .then(res => res.json())
          .then(d => setFaqDataCache(prev => ({ ...prev, [faqId]: d })))
          .catch(err => {
            console.error("FAQ Fetch Error:", err);
            fetchingIdsRef.current.delete(faqId);
          });
      }

      // Hydrate Media
      const imageId = slide.image || slide.image1;
      const idStr = String(imageId);
      if (imageId && typeof imageId !== "object" && !mediaCache[idStr] && !fetchingIdsRef.current.has(idStr)) {
        fetchingIdsRef.current.add(idStr);
        fetch(`/api/payload/media/${imageId}?depth=0`)
          .then(res => res.json())
          .then(d => setMediaCache(prev => ({ ...prev, [idStr]: d })))
          .catch(err => {
            console.error("Media Fetch Error:", err);
            fetchingIdsRef.current.delete(idStr);
          });
      }
    });
  }, [slides]); // Only run when slides change

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    
    // Calculate the shortest path difference for the continuous index
    const diff = newIndex - activeIndex;
    let adjustedDiff = diff;
    if (diff > slides.length / 2) adjustedDiff -= slides.length;
    if (diff < -slides.length / 2) adjustedDiff += slides.length;
    
    setTotalIndex(prev => prev + adjustedDiff);
    setDirection(adjustedDiff > 0 ? 1 : -1);
    setActiveIndex(newIndex);
  }, [emblaApi, activeIndex, slides.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const activeFaqData = currentSlide?.faq && typeof currentSlide.faq !== "object" 
    ? faqDataCache[currentSlide.faq] 
    : (currentSlide?.faq || currentSlide);


  const handlePrev = React.useCallback(() => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 600) return;
    lastClickTimeRef.current = now;

    if (slides.length === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => prev - 1);
  }, [slides.length]);

  const handleNext = React.useCallback(() => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 600) return;
    lastClickTimeRef.current = now;

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

  if (isMobile) {
    return (
      <section className="relative w-full py-12 bg-[#f6f4ed] overflow-hidden">
        {/* Background Section (Decorative only) */}
        <div 
          className="absolute pointer-events-none select-none right-0 top-0 opacity-10" 
          style={{ marginTop: mvw(-20) }}
        >
          <HollowText
            strokeColor="#c6c091"
            strokeWidth={0.5}
            className="font-bold uppercase z-0"
            style={{
              fontFamily: "var(--font-anaheim), sans-serif",
              fontSize: mvw(80),
              letterSpacing: mvw(5),
            }}
          >
            {getNodesText(data.subtitle) || "POPULAR"}
          </HollowText>
        </div>

        <div className="px-8 mb-8 relative z-10 flex flex-col gap-1">
          {data.subtitle && (
            <p
              className="font-bold uppercase text-[#756f3f]/60"
              style={{
                fontFamily: "var(--font-anaheim), sans-serif",
                fontSize: mvw(14),
                letterSpacing: mvw(2),
              }}
            >
              {getNodesText(data.subtitle)}
            </p>
          )}
          <h2
            className="font-extrabold text-[#756f3f]"
            style={{
              fontFamily: "var(--font-anaheim), sans-serif",
              fontSize: mvw(32),
              lineHeight: 1.2,
            }}
          >
            {getNodesText(data.title)}
          </h2>
        </div>

        {/* Mobile Card Carousel */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide: any, index: number) => {
              const slideFaqData = slide.faq && typeof slide.faq !== "object" 
                ? faqDataCache[slide.faq] 
                : (slide.faq || slide);
              
              const slideMediaData = slide.image1 && typeof slide.image1 !== "object"
                ? mediaCache[slide.image1]
                : slide.image1;

              return (
                <div 
                  key={slide.id || index} 
                  className="flex-[0_0_88%] min-w-0 pl-6 last:pr-6"
                >
                  <div 
                    className="rounded-[28px] overflow-hidden flex flex-col h-full"
                    style={{ background: "linear-gradient(180deg, #756f3f 0%, #c0b985 100%)" }}
                  >
                    {/* Image Unit - Fixed Aspect Ratio */}
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <OptimizedImage
                        image={slideMediaData}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content Unit - Light Text on Dark Background */}
                    <div className="p-7 flex flex-col gap-4">
                      <div className="font-anaheim font-bold text-white leading-tight" style={{ fontSize: mvw(22) }}>
                        {typeof slideFaqData?.question === 'string' ? (
                          slideFaqData.question
                        ) : (
                          <RichText 
                            data={truncateLexicalContent(slideFaqData?.question)} 
                            converters={faqConverters} 
                          />
                        )}
                      </div>
                      <div className="font-anaheim font-medium text-white/80 leading-relaxed" style={{ fontSize: mvw(15) }}>
                        <RichText 
                          data={truncateLexicalContent(slideFaqData?.contentTranslation || slideFaqData?.answer)} 
                          converters={faqConverters} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2.5 mt-10">
          {slides.map((_: any, idx: number) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex % slides.length === idx ? "w-8 bg-[#756f3f]" : "w-1.5 bg-[#756f3f]/20"
              }`}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f4ed]"
      style={{ height: vw(1032) }}
    >
      {/* Background Main Card (Embla Viewport) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[30px] shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
        ref={emblaRef}
        style={{
          width: vw(1460),
          height: vw(900),
          top: vw(11.5),
          background: "linear-gradient(180deg, #756f3f 0%, #c0b985 100%)",
        }}
      >
        {/* Embla Container (Hidden Logic for swipe & timer) */}
        <div className="flex h-full">
          {slides.map((_, i) => (
            <div key={i} className="flex-none w-full h-full" />
          ))}
        </div>
        {/* Decorative background Q & A Letters */}
        <div
          className="absolute font-anaheim font-black select-none pointer-events-none text-[#d7d1a8] opacity-40"
          style={{ fontSize: vw(250), right: vw(630), bottom: vw(210) }}
        >
          Q
        </div>
        <div
          className="absolute font-anaheim font-bold select-none pointer-events-none text-[#d7d1a8] opacity-40"
          style={{ 
            fontSize: vw(320), 
            right: vw(50), 
            bottom: vw(-100),
            clipPath: 'inset(0 0 30% 0)' // 这里的 15% 把底部的斜脚切平了
          }}
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
                style={{ fontSize: vw(72), letterSpacing: vw(9) }}
              >
                {getNodesText(data.title) || ""}
              </HollowText>
            </div>

            {/* Foreground Title Text */}
            <div className="relative z-10 flex items-start">
              <div className="flex flex-col">
                <h3
                  className="font-black font-anaheim text-[#58542f]"
                  style={{
                    fontSize: vw(72),
                    letterSpacing: vw(7),
                    WebkitTextStroke: `${vw(3)} #fff23e`,
                    paintOrder: "stroke fill",
                  }}
                >
                  {getNodesText(data.title, locale) || ""}
                </h3>
                <span
                  className="font-extrabold font-anaheim text-white tracking-widest"
                  style={{
                    fontSize: vw(56),
                    marginTop: vw(-40),
                    letterSpacing: vw(10),
                  }}
                >
                  {getNodesText(data.subtitle, locale) || ""}
                </span>
              </div>
              
              {/* Decorative Group: Slant and Arrows */}
              <div 
                className="flex items-end" 
                style={{ marginLeft: vw(-50), marginTop: vw(35) }}
              >
                {/* Decorative Slant SVG */}
                <motion.svg 
                  viewBox="0 0 154 187" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none"
                  style={{ 
                    width: vw(80), 
                    height: 'auto',
                  }}
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <path d="M128.214 0H154L25.786 187H0L128.214 0Z" fill="#9A945E"/>
                </motion.svg>

                {/* Decorative Arrows SVG */}
                <svg 
                  viewBox="0 0 284 38" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none"
                  style={{
                    width: vw(180),
                    height: 'auto',
                    marginLeft: vw(-36),
                    marginBottom: vw(6)
                  }}
                >
                  <defs>
                    <motion.linearGradient 
                      id="shimmerGradient" 
                      gradientUnits="userSpaceOnUse"
                      x1="0%" y1="0%" x2="100%" y2="0%"
                      animate={{
                        gradientTransform: [
                          "translate(-284, 0)",
                          "translate(284, 0)"
                        ]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <stop offset="0%" stopColor="#9A925A" />
                      <stop offset="40%" stopColor="#9A925A" />
                      <stop offset="50%" stopColor="#fff23e" />
                      <stop offset="60%" stopColor="#9A925A" />
                      <stop offset="100%" stopColor="#9A925A" />
                    </motion.linearGradient>
                  </defs>

                  <path d="M263.924 36.7496L282.527 18.8748L263.924 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M116.457 36.7496L135.06 18.8748L116.457 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M235.061 36.7496L253.664 18.8748L235.061 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M87.594 36.7496L106.197 18.8748L87.594 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M206.198 36.7496L224.796 18.8748L206.198 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M58.7307 36.7496L77.3294 18.8748L58.7307 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M177.33 36.7496L195.933 18.8748L177.33 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M29.8633 36.7496L48.4665 18.8748L29.8633 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M148.467 36.7496L167.07 18.8748L148.467 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 36.7496L19.6032 18.8748L1 1" stroke="url(#shimmerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
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
            style={{ width: vw(68), height: vw(68), border: `${vw(2)} solid rgba(255, 255, 255, 0.7)` }}
          >
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 bg-white/70 transition-all duration-300 group-hover:bg-[#756f3f]"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E")`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: vw(30),
              }}
            />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="relative flex items-center justify-center rounded-full transition-all duration-300 group overflow-hidden"
            style={{ width: vw(68), height: vw(68), border: `${vw(2)} solid rgba(255, 255, 255, 0.7)` }}
          >
            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 bg-white/70 transition-all duration-300 group-hover:bg-[#756f3f]"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: vw(30),
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
                  transition={{
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                    // Enlarge: Move then Size
                    width: {
                      delay: isBecomingActive ? 0.1 : 0,
                      duration: isBecomingActive ? 0.3 : 0.5,
                    },
                    height: {
                      delay: isBecomingActive ? 0.1 : 0,
                      duration: isBecomingActive ? 0.3 : 0.5,
                    },
                    // Shrink: Size then Move (Delay pos)
                    left: {
                      delay: isLeavingActive ? 0.1 : 0,
                      duration: isLeavingActive ? 0.3 : 0.5,
                    },
                    top: {
                      delay: isLeavingActive ? 0.1 : 0,
                      duration: isLeavingActive ? 0.3 : 0.5,
                    },
                  }}
                  className="absolute overflow-hidden shadow-2xl -translate-x-1/2"
                  style={{ borderRadius: vw(30) }}
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
              {typeof activeFaqData?.question === 'string' ? (
                <div 
                  className="font-anaheim font-bold leading-tight whitespace-pre-line"
                  style={{ fontSize: vw(48), marginBottom: vw(20) }}
                >
                  {activeFaqData.question}
                </div>
              ) : (
                <RichText 
                  data={truncateLexicalContent(activeFaqData?.question)} 
                  converters={faqConverters} 
                />
              )}
            </div>
            <div
              className="font-semibold text-[#3c3607] font-anaheim [&_p]:m-0"
              style={{ fontSize: vw(24), lineHeight: 1.5 }}
            >
              <RichText 
                data={truncateLexicalContent(activeFaqData?.contentTranslation || activeFaqData?.answer)} 
                converters={faqConverters} 
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
