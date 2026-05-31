"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import useEmblaCarousel from "embla-carousel-react";
import { useOverflow } from "@/lib/hooks/useOverflow";

interface SectionSlide {
  title: string;
  description: string;
  image: { url: string } | any;
}

interface ValuePropositionProps {
  title?: string;
  subtitle?: string;
  problems: SectionSlide[];
  advantages: SectionSlide[];
  autoplay?: boolean;
  interval?: number;
}

// Viewport width conversion utility based on 1920px design width (scaled by 0.7 to fix oversized design draft values)
const vw = (px: number) => `${(px / 1920) * 100}vw`;

/**
 * Sub-component to handle overflow for the active text with AnimatePresence
 */
const DesktopActiveText = ({ text }: { text: string }) => {
  const { ref, isOverflow } = useOverflow<HTMLParagraphElement>();

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="font-semibold leading-relaxed text-black custom-scrollbar pointer-events-auto pr-2"
      data-lenis-prevent
      style={{
        fontFamily: "var(--font-anaheim)",
        fontSize: vw(20),
        maxHeight: `calc(${vw(130)} + 10px)`, // 4 lines * 1.625 * 20vw = 130vw
        paddingTop: "5px",
        paddingBottom: "5px",
        overflowY: isOverflow ? "auto" : "hidden",
        overflowX: "hidden",
        overscrollBehavior: "contain",
      }}
    >
      {text}
    </motion.p>
  );
};

/**
 * ValuePropositionSection - The Value of One-Stop Procurement
 */
export function ValuePropositionSection({
  title,
  subtitle,
  problems,
  advantages,
  autoplay,
  interval = 5,
}: ValuePropositionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [layout, setLayout] = useState({
    type: "mobile",
    width: 0,
    gap: 16,
    padding: 0,
    cardH: 300,
  });

  const { ref: desktopTitleRef, isOverflow: desktopTitleOverflows } = useOverflow<HTMLDivElement>();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (idx: number) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const desktop = w >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        if (w < 640) {
          setLayout({
            type: "mobile",
            width: w * 0.75,
            gap: 16,
            padding: 0,
            cardH: 300,
          });
        } else {
          setLayout({
            type: "tablet",
            width: w * 0.45,
            gap: 24,
            padding: 0,
            cardH: 330,
          });
        }
      } else {
        setLayout({ type: "desktop", width: 0, gap: 0, padding: 0, cardH: 0 });
      }
      if (emblaApi) emblaApi.reInit();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [emblaApi]);

  const data = problems.length > 0 ? problems : advantages;
  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  }, [data.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  // Autoplay Effect (Desktop only)
  useEffect(() => {
    if (!isDesktop || !autoplay || data.length <= 1) return;

    const timer = setInterval(
      () => {
        handleNext();
      },
      (interval || 5) * 1000,
    );

    return () => clearInterval(timer);
  }, [isDesktop, autoplay, interval, data.length, handleNext]);

  const mobileHeader = React.useMemo(() => (
    <div className="w-full text-center px-6">
      <h2
        className="font-extrabold leading-tight text-[#78713A] tracking-[0.05em] mb-3"
        style={{
          fontFamily: "var(--font-anaheim)",
          fontSize: "clamp(24px, 7.46vw, 32px)",
        }}
        dangerouslySetInnerHTML={{
          __html: (title || "The Value Of One-Stop Procurement").replace(
            /\n/g,
            "<br />",
          ),
        }}
      />
      <h3
        className="font-semibold leading-tight text-[#756F3F] opacity-60 mb-4"
        style={{
          fontFamily: "var(--font-anaheim)",
          fontSize: "clamp(16px, 4.8vw, 20px)",
        }}
        dangerouslySetInnerHTML={{
          __html: (subtitle || "Problems To Be Solved").replace(
            /\n/g,
            "<br />",
          ),
        }}
      />
    </div>
  ), [title, subtitle]);

  const desktopHeader = useMemo(() => (
    <>
      {/* 1. Header Area */}
      <div
        className="hidden lg:block absolute z-50 text-left pointer-events-auto"
        style={{ left: vw(192), top: vw(120), width: vw(1200) }}
      >
        <div
          ref={desktopTitleRef}
          className="custom-scrollbar"
          data-lenis-prevent
          style={{
            maxHeight: `calc(${vw(160)} + 10px)`, // Huge buffer for 2 lines (visual vw(140)) to completely bypass font bounding box overflows, while still < 3 lines (vw(211)).
            paddingTop: "5px",
            paddingBottom: "5px",
            fontSize: vw(64),
            overflowY: desktopTitleOverflows ? "auto" : "hidden",
            overflowX: "hidden",
            overscrollBehavior: "contain",
          }}
        >
          <h2
            className="font-extrabold leading-[1.1] text-[#78713A] tracking-[0.05em] m-0"
            style={{
              fontFamily: "var(--font-anaheim)",
            }}
            dangerouslySetInnerHTML={{
              __html: (
                title || "The Value Of One-Stop<br />Procurement"
              ).replace(/\n/g, "<br />"),
            }}
          />
        </div>
      </div>

      {/* 2. Sub-indicator Area */}
      <div
        className="hidden lg:flex absolute flex-col items-end z-50 pointer-events-none"
        style={{ right: vw(150), top: vw(140) }}
      >
        <div className="relative mb-2">
          <motion.div
            animate={{
              x: [0, 60, -60, 0],
              y: [0, -40, 40, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="bg-[#EDEBD8] rounded-full absolute -top-4 right-[64px] -z-10 opacity-70"
            style={{ width: vw(80), height: vw(80) }}
          />
          <h3
            className="font-semibold leading-tight text-[#756F3F] text-right opacity-60"
            style={{
              fontFamily: "var(--font-anaheim)",
              fontSize: vw(32),
            }}
            dangerouslySetInnerHTML={{
              __html: (subtitle || "Problems<br />To Be Solved").replace(
                /\n/g,
                "<br />",
              ),
            }}
          />
        </div>
      </div>
    </>
  ), [title, subtitle, desktopTitleOverflows]);

  if (data.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent flex justify-center items-center py-12 lg:py-0"
      style={{
        height: isDesktop ? vw(883.2) : "auto",
        minHeight: isDesktop ? vw(600) : "600px",
      }}
    >
      {/* Unified Container */}
      <div
        className="relative w-full h-auto flex-shrink-0 flex flex-col lg:block"
        style={{
          height: isDesktop ? vw(806.4) : "auto",
        }}
      >
        {/* === MOBILE ONLY CONTENT (< 1024px) === */}
        <div className="flex lg:hidden flex-col w-full px-0 gap-6">
          {/* Header */}
          {mobileHeader}

          {/* Carousel - Embla Implementation */}
          <div
            className="relative w-full h-auto"
            ref={emblaRef}
          >
            <div className="flex relative items-stretch">
              {data.map((item, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <motion.div
                    key={idx}
                    animate={{
                      boxShadow: isActive
                        ? "0px 15px 15px rgba(0, 0, 0, 0.12)"
                        : "0px 4px 15px rgba(0, 0, 0, 0.04)",
                      scale: isActive ? 1 : 0.96,
                      opacity: isActive ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.4 }}
                    className="bg-white flex-shrink-0 relative flex flex-col cursor-grab active:cursor-grabbing shadow-md border border-black/5"
                    style={{
                      width: layout.width,
                      height: layout.cardH,
                      borderRadius: "20px",
                      padding: "16px",
                      marginRight: layout.gap,
                    }}
                    onClick={() => scrollTo(idx)}
                  >
                    {/* Card Image */}
                    <div
                      className="shadow-[0_6px_6px_rgba(0,0,0,0.1)] overflow-hidden bg-gray-50 pointer-events-none shrink-0"
                      style={{
                        width: "100%",
                        height: "120px",
                        marginBottom: "12px",
                        borderRadius: "14px",
                      }}
                    >
                      <OptimizedImage
                        image={item.image}
                        size="medium"
                        priority={idx < 2}
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="w-full h-full object-cover"
                        alt={`Slide ${idx}`}
                      />
                    </div>

                    {/* Description Text */}
                    <div
                      className="w-full flex-1 pointer-events-auto pr-1 select-text custom-scrollbar"
                      data-lenis-prevent
                      style={{
                        WebkitOverflowScrolling: "touch",
                        fontSize: "13.5px",
                        maxHeight: "calc(6.5em + 10px)", // 4 lines * 1.625 leading + 10px padding
                        paddingTop: "5px",
                        paddingBottom: "5px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        overscrollBehavior: "contain",
                      }}
                    >
                      <p
                        className="font-semibold leading-relaxed text-[#7A7A7A] text-justify m-0"
                        style={{
                          fontFamily: "var(--font-anaheim)",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-2">
            {data.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="transition-all duration-300 rounded-full h-1.5"
                style={{
                  width: i === currentIndex ? "18px" : "6px",
                  backgroundColor: i === currentIndex ? "#756F3F" : "#D4CFA5",
                }}
              />
            ))}
          </div>
        </div>

        {/* === DESKTOP ONLY CONTENT (>= 1024px) === */}

        {desktopHeader}

        {/* 3 & 6. Background Box + Navigation Controls - Grouped as a single unit */}
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{
            left: vw(300),
            top: vw(260),
            width: vw(700),
            height: vw(500),
          }}
        >
          {/* Static Background Box - z-0 to stay behind scrolling images */}
          <div
            className="absolute inset-0 shadow-[0_40px_35px_rgba(0,0,0,0.04)] bg-gradient-to-b from-[#F6F4ED] to-white z-0"
            style={{ borderRadius: vw(30) }}
          />

          {/* Navigation Controls - Bound to box coordinates, z-30 to be clickable above scrolling images */}
          <div
            className="absolute flex justify-start z-30 pointer-events-auto"
            style={{
              right: vw(20),
              bottom: vw(80),
            }}
          >
            <button
              onClick={handlePrev}
              className="group flex items-center justify-center bg-transparent transition-colors"
              style={{ width: vw(78), height: vw(77) }}
            >
              <svg
                width={vw(42)}
                height={vw(42)}
                viewBox="0 0 78 77"
                fill="none"
              >
                <path
                  d="M30.4609 38.4697L45.6807 53.3662L47.8604 51.1514L35.0645 38.4697L47.8604 25.7881L45.6807 23.5732L30.4609 38.4697Z"
                  className="fill-[#B0B0B0] group-hover:fill-[#756F3F] transition-colors duration-300"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="group flex items-center justify-center bg-transparent transition-colors"
              style={{ width: vw(78), height: vw(77) }}
            >
              <svg
                width={vw(42)}
                height={vw(42)}
                viewBox="0 0 78 77"
                fill="none"
              >
                <path
                  d="M47.5391 38.4697L32.3193 53.3662L30.1396 51.1514L42.9355 38.4697L30.1396 25.7881L32.3193 23.5732L47.5391 38.4697Z"
                  className="fill-[#B0B0B0] group-hover:fill-[#756F3F] transition-colors duration-300"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 4. Scrolling Area */}
        <div className="hidden lg:block absolute inset-0 z-10">
          <motion.div
            className="absolute flex"
            style={{ top: vw(300), left: vw(350) }}
            animate={{ x: isDesktop ? `-${currentIndex * parseFloat(vw(420))}vw` : 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            {data.map((item, idx) => (
              <div
                key={idx}
                className="overflow-hidden shadow-lg flex-shrink-0 relative group cursor-pointer"
                style={{
                  width: vw(400),
                  height: vw(260),
                  marginRight: vw(20),
                  borderRadius: vw(30),
                }}
                onClick={() => setCurrentIndex(idx)}
              >
                <OptimizedImage
                  image={item.image}
                  size="large"
                  className={`w-full h-full object-cover transition-all duration-700 ${idx !== currentIndex ? "grayscale opacity-50" : "grayscale-0 opacity-100"}`}
                  alt={`Slide ${idx}`}
                />
                {idx === currentIndex && (
                  <motion.div
                    layoutId="active-border"
                    className="absolute inset-0 border-[#756F3F] z-10"
                    style={{ borderWidth: vw(4), borderRadius: vw(30) }}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* 5. Active Text */}
          <div
            className="absolute text-left"
            style={{ left: vw(369), top: vw(600), width: vw(450) }}
          >
            <AnimatePresence mode="wait">
              <DesktopActiveText key={currentIndex} text={data[currentIndex].description} />
            </AnimatePresence>
          </div>
        </div>

        {/* 7. Footer Decorative Elements */}
        <div
          className="hidden lg:flex absolute py-4 gap-1 opacity-50 z-20"
          style={{ left: vw(140), bottom: isDesktop ? vw(30) : "6%" }}
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <motion.svg
              key={i}
              viewBox="0 0 16 24"
              fill="none"
              className="flex-shrink-0"
              style={{ width: "16px", height: "24px" }}
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            >
              <path
                d="M4 4L12 12L4 20"
                stroke="#756F3F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
        </div>

        {/* 8. Slide Number & Decorative Slash - Grouped for Locked Position */}
        <div
          className="hidden lg:block absolute z-20 pointer-events-none"
          style={{ right: vw(140), bottom: isDesktop ? vw(50) : "10%" }}
        >
          <div className="relative">
            {/* Slide Number */}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="block font-bold text-[#D7D1A8] leading-none"
                style={{
                  fontFamily: "var(--font-anaheim)",
                  fontSize: vw(100),
                }}
              >
                0{currentIndex + 1}
              </motion.span>
            </AnimatePresence>

            {/* Decorative Slash - Positioned relative to the number */}
            <div
              className="absolute bg-[#D7D1A8] origin-bottom rotate-[44deg] z-10"
              style={{
                right: vw(150),
                bottom: vw(40),
                width: vw(3),
                height: vw(120),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
