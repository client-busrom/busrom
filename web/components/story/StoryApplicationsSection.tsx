"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { HollowText } from "@/components/common/HollowText";
import { useIsMobile } from "@/hooks/use-mobile";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface ApplicationItem {
  id?: number;
  title: string;
  image: MediaObject | null;
  description?: string;
}

interface MediaObject {
  url: string;
  id: string;
}

interface StoryApplicationsSectionProps {
  data: {
    title: string;
    titleNodes?: any[];
    description: string;
    descriptionNodes?: any[];
    viewButtonText?: string;
    viewButtonLink?: string;
    viewButtonNewTab?: boolean;
    items: {
      slides: ApplicationItem[];
      autoplay: boolean;
      interval: number;
    };
  };
}

export function StoryApplicationsSection({
  data,
}: StoryApplicationsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const lastActionTimeRef = React.useRef(0);
  const ACTION_THROTTLE = 300;

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = data.items.slides || [];
  const totalSlides = slides.length;

  const renderTitleNodes = (nodes?: any[], isMobile = false) => {
    if (!nodes || nodes.length === 0) return data.title;
    return nodes.map((n, i) => {
      if (n.type === "text") {
        const isBold = n.format & 1;
        const isEngineering = n.text.toLowerCase().includes("engineering");

        if (isMobile) {
          return (
            <div key={i} className="font-josefin-sans font-bold text-center leading-tight">
              {isBold ? (
                <HollowText strokeColor="#756f3f" strokeWidth={1} className="text-4xl">
                  {n.text}
                </HollowText>
              ) : (
                <span className="text-[#574f0e] text-5xl">{n.text}</span>
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            className="absolute whitespace-nowrap font-josefin-sans font-bold"
            style={{
              top: isEngineering ? vw(54) : vw(0),
              left: isEngineering ? 0 : vw(146),
              fontSize: isEngineering ? vw(80) : vw(120),
              zIndex: isBold ? 1 : 2,
            }}
          >
            {isBold ? (
              <HollowText strokeColor="#756f3f" strokeWidth={1}>
                {n.text}
              </HollowText>
            ) : (
              <span className="text-[#574f0e]">{n.text}</span>
            )}
          </div>
        );
      }
      return null;
    });
  };

  const renderDescriptionNodes = (nodes?: any[], isMobile = false) => {
    if (!nodes || nodes.length === 0) return data.description;
    return nodes.map((n: any, i: number) => {
      if (n.type === "text") {
        const isBold = n.format & 1;
        if (isBold) {
          return (
            <span
              key={i}
              className="text-[#ffbd23] font-bold"
              style={{ fontSize: isMobile ? "1.2rem" : vw(29) }}
            >
              {n.text}
            </span>
          );
        }
        return (
          <span
            key={i}
            className="text-[#574f0e] font-semibold"
            style={{ fontSize: isMobile ? "1rem" : vw(24) }}
          >
            {n.text}
          </span>
        );
      }
      if (n.type === "linebreak") return <br key={i} />;
      return null;
    });
  };

  const handlePrev = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return;
    lastActionTimeRef.current = now;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) return;
    lastActionTimeRef.current = now;
    setActiveIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  // Autoplay
  useEffect(() => {
    if (!data.items.autoplay || totalSlides <= 1) return;
    const interval = setInterval(
      () => {
        setActiveIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
      },
      (data.items.interval || 5) * 1000,
    );
    return () => clearInterval(interval);
  }, [data.items.autoplay, data.items.interval, totalSlides, activeIndex]);

  const isMobileHook = useIsMobile();
  const isMobile = isMobileHook || (windowWidth > 0 && windowWidth < 768);

  const visibleItems = useMemo(() => {
    if (totalSlides === 0) return [];
    const list = [];
    // Show current index and surrounding
    for (let i = -1; i <= 4; i++) {
      const idx = (activeIndex + i + totalSlides) % totalSlides;
      list.push({ originalIdx: idx, relativeIdx: i });
    }
    return list;
  }, [activeIndex, totalSlides]);

  if (isMobile) {
    return (
      <section id="applications" className="relative w-full bg-[#f6f4ed] py-16 px-6 flex flex-col items-center">
        {/* Mobile Title */}
        <div className="w-full mb-8 flex flex-col gap-2">
          {renderTitleNodes(data.titleNodes, true)}
        </div>

        {/* Mobile Description */}
        <div className="w-full mb-10 text-center font-josefin-sans leading-relaxed whitespace-pre-line px-2">
          {renderDescriptionNodes(data.descriptionNodes, true)}
        </div>

        {/* Mobile Carousel (Single Image) */}
        <div className="w-full aspect-[4/3] relative mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full rounded-2xl overflow-hidden shadow-xl"
            >
              {slides[activeIndex]?.image && (
                <OptimizedImage
                  image={slides[activeIndex].image}
                  alt={slides[activeIndex].title}
                  size="medium"
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-[#756f3f] w-6" : "bg-[#756f3f]/30"}`} 
              />
            ))}
          </div>
        </div>

        {/* Mobile Controls & CTA */}
        <div className="w-full flex flex-col items-center gap-10">
          {/* Arrows */}
          <div className="flex gap-10">
            <button onClick={handlePrev} className="w-12 h-12 rounded-full border border-[#756f3f] flex items-center justify-center text-[#756f3f]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(180deg)" }}>
                <path d="M8.5 20.5l8-8.5-8-8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={handleNext} className="w-12 h-12 rounded-full border border-[#756f3f] flex items-center justify-center text-[#756f3f]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8.5 20.5l8-8.5-8-8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* CTA Button */}
          <a
            href={data.viewButtonLink || "#"}
            target={data.viewButtonNewTab ? "_blank" : undefined}
            rel={data.viewButtonNewTab ? "noopener noreferrer" : undefined}
            className="group/btn block w-full max-w-[320px]"
          >
            <div className="relative flex items-center justify-between bg-transparent group-hover/btn:bg-[#756f3f] border border-[#756f3f] rounded-full py-2 pl-6 pr-2 transition-all duration-300">
              <span className="font-josefin-sans text-xl font-medium text-[#756f3f] group-hover/btn:text-white transition-colors duration-300">
                {data.viewButtonText}
              </span>
              <div className="bg-[#756f3f] group-hover/btn:bg-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white group-hover/btn:text-[#756f3f]">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </section>
    );
  }



  return (
    <section
      id="applications"
      className="relative w-full bg-[#f6f4ed] my-20 overflow-hidden"
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        {/* 1. Title Area */}
        <div className="absolute" style={{ left: vw(200), top: vw(65) }}>
          <h2 className="relative" style={{ height: vw(140), width: vw(750) }}>
            {renderTitleNodes(data.titleNodes)}
          </h2>
        </div>

        {/* 2. Description Area */}
        <div
          className="absolute"
          style={{ right: vw(200), top: vw(72), width: vw(750) }}
        >
          <div className="font-josefin-sans leading-[1.4] text-left whitespace-pre-line">
            {renderDescriptionNodes(data.descriptionNodes)}
          </div>
        </div>

        {/* 3. Carousel Area */}
        <div className="absolute w-full" style={{ left: vw(39), top: vw(303) }}>
          <AnimatePresence initial={false}>
            {slides.map((item, idx) => {
              // Calculate the visual position relative to activeIndex
              // We want the active item to be at visual index 1
              const relativeIdx =
                (idx - activeIndex + totalSlides) % totalSlides;

              // Show items in the visible range
              const isVisible = relativeIdx >= 0 && relativeIdx <= 4;
              if (!isVisible) return null;

              const isActive = relativeIdx === 1;

              let xPos = 0;
              if (relativeIdx === 0) xPos = 0;
              else if (relativeIdx === 1) xPos = 467;
              else if (relativeIdx === 2) xPos = 934;
              else if (relativeIdx === 3) xPos = 1400;
              else xPos = 1400 + (relativeIdx - 3) * 467;

              return (
                <motion.div
                  key={`slide-${idx}`}
                  initial={false}
                  animate={{
                    height: isActive ? vw(575) : vw(403),
                    opacity: 1,
                  }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute overflow-hidden shadow-xl"
                  style={{
                    width: vw(442),
                    left: vw(xPos),
                    top: 0,
                    borderRadius: vw(30),
                    zIndex: isActive ? 10 : 1,
                    transition: `left 0.6s cubic-bezier(0.32, 0.72, 0, 1)`,
                  }}
                >
                  {item.image && (
                    <OptimizedImage
                      image={item.image}
                      alt={item.title}
                      size="medium"
                      loading="eager"
                      containerClassName="w-full h-full absolute inset-0"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* View Button - Fixed at bottom-right of item 2 position */}
          <motion.div
            key={`view-btn-${activeIndex}`}
            className="absolute z-20"
            initial={{ scale: 0.85, opacity: 0.6, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: 0.15,
            }}
            style={{
              left: vw(940),
              top: vw(500),
            }}
          >
            <a
              href={data.viewButtonLink || "#"}
              target={data.viewButtonNewTab ? "_blank" : undefined}
              rel={data.viewButtonNewTab ? "noopener noreferrer" : undefined}
              className="group/btn cursor-pointer block"
            >
              <div
                className="relative flex items-center w-auto gap-4 justify-between bg-transparent hover:bg-[#756f3f] rounded-full border border-[#756f3f] transition-all duration-300"
                style={{
                  height: vw(71),
                  paddingLeft: vw(24),
                  paddingRight: vw(6),
                }}
              >
                <span
                  className="text-[#756f3f] group-hover/btn:text-white font-josefin-sans font-medium whitespace-nowrap transition-colors duration-300"
                  style={{ fontSize: vw(20) }}
                >
                  {data.viewButtonText}
                </span>
                <div
                  className="bg-[#756f3f] group-hover/btn:bg-white rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                  style={{ width: vw(58), height: vw(58) }}
                >
                  <svg
                    style={{ width: vw(20), height: vw(20) }}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      className="text-white group-hover/btn:text-[#756f3f] transition-colors duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute" style={{ left: vw(1555), top: vw(800) }}>
          <div className="flex" style={{ gap: vw(22) }}>
            <button
              onClick={handlePrev}
              className="group rounded-full border border-[#b9b092] bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-[#c5b77e] hover:border-[#c5b77e] hover:shadow-lg hover:scale-105"
              style={{ width: vw(62), height: vw(62) }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-[#b9b092] group-hover:stroke-white transition-colors"
                style={{
                  width: vw(14),
                  height: vw(24),
                  transform: "scale(1.2) rotate(180deg)",
                }}
              >
                <path
                  d="M8.5 20.5l8-8.5-8-8.5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="group rounded-full border border-[#b9b092] bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-[#c5b77e] hover:border-[#c5b77e] hover:shadow-lg hover:scale-105"
              style={{ width: vw(62), height: vw(62) }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-[#b9b092] group-hover:stroke-white transition-colors duration-300"
                style={{
                  width: vw(14),
                  height: vw(24),
                  transform: "scale(1.2)",
                }}
              >
                <path
                  d="M8.5 20.5l8-8.5-8-8.5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
