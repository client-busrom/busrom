"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import useEmblaCarousel from "embla-carousel-react";

interface SectionSlide {
  title: string;
  description: string;
  image: { url: string } | any;
  icon?: string;
}

interface PurchaseProcessSectionProps {
  title?: string;
  slides: SectionSlide[];
}

const vw = (px: number) => `${(px / 1920) * 100}vw`;

import { useOverflow } from "@/lib/hooks/useOverflow";

export function PurchaseProcessSection({
  title,
  slides,
}: PurchaseProcessSectionProps) {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [layout, setLayout] = useState({
    type: "mobile",
    width: 0,
    gap: 16,
    padding: 0,
    cardH: 330,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
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

  const { ref: titleRef, isOverflow: titleOverflows } = useOverflow<HTMLDivElement>();

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
            cardH: 330,
          });
        } else {
          setLayout({
            type: "tablet",
            width: w * 0.45,
            gap: 24,
            padding: 0,
            cardH: 360,
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

  // Auto-play interval (Desktop only)
  useEffect(() => {
    if (!isDesktop || !slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides, isDesktop]);

  if (!slides || slides.length === 0) return null;

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const getVisibleSteps = () => {
    const prev = (index - 1 + slides.length) % slides.length;
    const next = (index + 1) % slides.length;
    return [
      {
        id: prev + 1,
        data: slides[prev],
        active: false,
        pos: "top",
        onClick: prevSlide,
      },
      {
        id: index + 1,
        data: slides[index],
        active: true,
        pos: "middle",
        onClick: undefined,
      },
      {
        id: next + 1,
        data: slides[next],
        active: false,
        pos: "bottom",
        onClick: nextSlide,
      },
    ];
  };

  const visibleSteps = getVisibleSteps();

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent flex justify-center items-center py-12 lg:py-0"
      style={{
        height: isDesktop ? vw(922) : "auto",
      }}
    >
      <div
        className="relative w-full flex flex-col lg:block items-center px-0 lg:px-0 mx-auto"
        style={{
          width: isDesktop ? vw(1444) : "100%",
          height: isDesktop ? vw(672) : "auto",
        }}
      >
        {/* Decorative Dashed Curves - Bottom Layer - PROPORTIONAL */}
        <div
          className="hidden lg:block absolute pointer-events-none z-0"
          style={{
            left: vw(189),
            top: vw(192),
            width: vw(468),
            height: vw(317),
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 672 457"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M477.085 415.852C567.699 467.2 728.744 508.855 648.016 264.692"
              stroke="#756F3F"
              strokeWidth="3"
              strokeDasharray="10 14"
              className="animate-dash-flow-reverse"
            />
            <circle cx="475.954" cy="415.029" r="8.23762" fill="#756F3F" />
          </svg>
        </div>

        {/* Decorative Dashed Curves - TOP Layer - PROPORTIONAL */}
        <div
          className="hidden lg:block absolute pointer-events-none z-20"
          style={{
            left: vw(189),
            top: vw(192),
            width: vw(468),
            height: vw(317),
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 672 457"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M20.7206 298.054C-7.14999 199.203 -25.9867 1.5 121.632 1.5C269.25 1.5 442.624 111.61 510.859 166.664"
              stroke="#756F3F"
              strokeWidth="3"
              strokeDasharray="10 14"
              className="animate-dash-flow"
            />
            <circle cx="645.649" cy="260.161" r="8.23762" fill="#756F3F" />
            <circle cx="22.0609" cy="299.702" r="8.23762" fill="#756F3F" />
            <circle cx="511.376" cy="166.252" r="8.23762" fill="#756F3F" />
          </svg>
        </div>

        {/* === MOBILE ONLY CONTENT (< 1024px) === */}
        <div className="flex lg:hidden flex-col w-full px-0 gap-6">
          {/* Header */}
          <div className="w-full text-center px-6">
            <h2
              className="text-[32px] font-extrabold leading-tight text-[#78713A] tracking-[0.05em] mb-3"
              style={{
                fontFamily: "var(--font-anaheim)",
                background:
                  "linear-gradient(135deg, #756F3F 40%, rgba(117, 111, 63, 0.35) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              dangerouslySetInnerHTML={{
                __html: (
                  title || "How To Make<br />One-Stop Purchases"
                ).replace(/\n/g, "<br />"),
              }}
            />
            <div className="w-16 h-1 bg-[#756F3F] mx-auto rounded-full opacity-60 mb-4" />
          </div>

          {/* Carousel - Embla Implementation */}
          <div
            className="relative w-full h-auto"
            ref={emblaRef}
          >
            <div className="flex relative items-stretch">
              {slides.map((step, idx) => {
                const isActive = idx === index;

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
                      height: "auto",
                      borderRadius: "20px",
                      padding: "16px",
                      marginRight: layout.gap,
                    }}
                    onClick={() => scrollTo(idx)}
                  >
                    {/* Card Header */}
                    <div
                      className="relative pointer-events-none"
                      style={{
                        height: "36px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bg-[#BCB158] rounded-full shrink-0 z-0 flex items-center justify-center text-white font-extrabold text-[13px]"
                        style={{
                          width: "32px",
                          height: "32px",
                          fontFamily: "var(--font-anaheim)",
                        }}
                      >
                        0{idx + 1}
                      </div>
                      <h3
                        className={`relative z-10 leading-snug transition-all duration-300 ${isActive ? "font-bold text-black" : "font-medium text-[#4A4A4A]"}`}
                        style={{
                          fontSize: "16px",
                          fontFamily: "var(--font-anaheim)",
                          paddingTop: "4px",
                          paddingLeft: "42px",
                        }}
                      >
                        {step.title}
                      </h3>
                    </div>

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
                        image={step.image}
                        size="medium"
                        priority={idx < 2}
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="w-full h-full object-cover"
                        alt={step.title}
                      />
                    </div>

                    {/* Description Text */}
                    <div className="w-full flex-1 select-text">
                      <p
                        className="font-medium leading-relaxed text-[#7A7A7A] text-justify"
                        style={{
                          fontSize: "13.5px",
                          fontFamily: "var(--font-anaheim)",
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="transition-all duration-300 rounded-full h-1.5"
                style={{
                  width: i === index ? "18px" : "6px",
                  backgroundColor: i === index ? "#756F3F" : "#D4CFA5",
                }}
              />
            ))}
          </div>
        </div>

        {/* 1. Title - Fluid & Aligned */}
        <div
          className="hidden lg:block relative lg:absolute z-30 mb-10 lg:mb-0 text-center lg:text-left"
          style={{ left: vw(60), top: vw(-50) }}
        >
          <div
            ref={titleRef}
            className="custom-scrollbar pointer-events-auto"
            data-lenis-prevent
            style={{
              maxWidth: vw(400),
              maxHeight: "calc(3.6em + 10px)",
              fontSize: isDesktop ? vw(48) : "32px",
              paddingTop: "5px",
              paddingBottom: "5px",
              overflowY: titleOverflows ? "auto" : "hidden",
              overflowX: "hidden",
              overscrollBehavior: "contain",
              wordBreak: "break-word",
            }}
          >
            <h2
              className="font-semibold tracking-wide m-0"
              style={{
                fontFamily: "var(--font-anaheim)",
                background:
                  "linear-gradient(135deg, #756F3F 40%, rgba(117, 111, 63, 0.35) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: isDesktop ? 1.2 : undefined,
              }}
              dangerouslySetInnerHTML={{
                __html: (
                  title ||
                  '<span class="opacity-100">How To Make</span><br /><span class="opacity-100">One-Stop<br />Purchases</span>'
                ).replace(/\n/g, "<br />"),
              }}
            />
          </div>
        </div>

        {/* 2. Central Image (Capsule) - DESKTOP ONLY */}
        <div
          className="hidden lg:block absolute z-10"
          style={{ left: vw(240), top: vw(20), perspective: "1200px" }}
        >
          <AnimatePresence mode="wait">
            {slides.map(
              (slide, i) =>
                i === index && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden shadow-2xl bg-white/50"
                    style={{
                      width: vw(365),
                      height: vw(620),
                      borderRadius: vw(183),
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <OptimizedImage
                      image={slide.image}
                      size="medium"
                      priority={true}
                      className="w-full h-full object-cover"
                      alt={`Step ${i}`}
                    />
                  </motion.div>
                ),
            )}
          </AnimatePresence>
        </div>

        {/* 3. Circular Flow Diagram - DESKTOP ONLY */}
        <div
          className="hidden lg:block absolute"
          style={{
            left: vw(709),
            top: vw(48),
            width: vw(596),
            height: vw(596),
          }}
        >
          {/* SOLID OUTER RING */}
          <div className="absolute inset-0 rounded-full border border-[#756F3F] opacity-30 pointer-events-none" />

          {/* SMALL DASHED INNER RING */}
          <div
            className="absolute pointer-events-none z-0"
            style={{ inset: vw(60) }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 710 710"
              fill="none"
              className="rotate-infinite"
            >
              <circle
                cx="355"
                cy="355"
                r="350"
                stroke="#756F3F"
                strokeWidth="2.5"
                strokeDasharray="12 16"
                opacity="0.45"
                className="animate-dash-flow"
              />
            </svg>
          </div>

          <div className="relative block">
            {visibleSteps.map((step) => {
              let top = 298;
              let left = 60;
              if (step.pos === "top") {
                left = 120;
                top = 110;
              }
              if (step.pos === "middle") {
                left = 70;
                top = 280;
              }
              if (step.pos === "bottom") {
                left = 120;
                top = 460;
              }

              return (
                <div
                  key={step.id}
                  className="absolute"
                  style={{
                    left: vw(left),
                    top: vw(top),
                  }}
                >
                  {step.active ? (
                    <div className="flex flex-col items-start relative">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex absolute bg-[#756F3F] rounded-full items-center justify-center shadow-xl z-20"
                        style={{
                          left: vw(-32),
                          top: vw(-5),
                          width: vw(48),
                          height: vw(48),
                        }}
                      >
                        {step.data.icon ? (
                          <IconifyIcon name={step.data.icon} className="w-[60%] h-[60%] text-white" />
                        ) : (
                          <svg
                            width="60%"
                            height="60%"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2C10.9 2 10 2.9 10 4V6H7C5.9 6 5 6.9 5 8V11C5 12.1 5.9 13 7 13H17C18.1 13 19 12.1 19 11V8C19 6.9 18.1 6 17 6H14V4C14 2.9 13.1 2 12 2Z"
                              fill="white"
                            />
                            <rect
                              x="7"
                              y="14"
                              width="10"
                              height="8"
                              rx="1"
                              fill="white"
                            />
                          </svg>
                        )}
                      </motion.div>

                      <div
                        className="flex items-center gap-4 mb-2"
                        style={{ paddingLeft: isDesktop ? vw(32) : undefined }}
                      >
                        <span
                          className="font-bold text-[#141414] tracking-widest"
                          style={{
                            fontFamily: "var(--font-anaheim)",
                            fontSize: isDesktop ? vw(28) : "18px",
                          }}
                        >
                          {step.id}. {step.data.title}
                        </span>
                      </div>
                      <div style={{ paddingLeft: isDesktop ? vw(32) : undefined }}>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, x: -7 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-medium text-[#7A7A7A] leading-[1.6] text-left"

                            style={{
                              fontSize: vw(16),
                              fontFamily: "var(--font-anaheim)",
                              maxWidth: isDesktop ? vw(320) : undefined,
                            }}
                          >
                            {step.data.description}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={step.onClick}
                      className="group flex items-center justify-start gap-4 transition-opacity duration-300 opacity-100"
                    >
                      <div
                        className="bg-white border border-[#756F3F]/40 group-hover:bg-[#756F3F] group-hover:border-[#756F3F] rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                        style={{
                          width: vw(34),
                          height: vw(34),
                        }}
                      >
                        {step.data.icon ? (
                          <IconifyIcon name={step.data.icon} className="w-[50%] h-[50%] text-[#756F3F] group-hover:text-white transition-colors duration-300" />
                        ) : (
                          <svg
                            width="60%"
                            height="60%"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-[#756F3F] group-hover:text-white transition-colors duration-300"
                          >
                            <path
                              d={
                                step.pos === "top"
                                  ? "M7 17L17 7M17 7H7M17 7V17"
                                  : "M7 7L17 17M17 17V7M17 17H7"
                              }
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className="font-bold text-[#141414] tracking-widest uppercase transition-colors duration-300 group-hover:text-[#756F3F]"

                        style={{
                          fontFamily: "var(--font-anaheim)",
                          fontSize: isDesktop ? vw(22) : "15px",
                        }}
                      >
                        {step.id}. {step.data.title}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
