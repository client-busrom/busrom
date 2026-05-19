"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ApplicationItem {
  id: string;
  title: string;
  description?: string;
  image: any;
  link?: string;
}

interface ApplicationsSectionProps {
  title?: string;
  items: ApplicationItem[];
  locale: string;
}

export function ApplicationsSection({
  title,
  items,
  locale,
}: ApplicationsSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1025);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Figma Constants (1920px base)
  const DESIGN_WIDTH = 1920;
  // Layout vw helper
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 1.2,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );

  const applyParallax = useCallback(() => {
    if (!emblaApi) return;

    const scrollProgress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    const slideNodes = emblaApi.slideNodes();

    slideNodes.forEach((slide, index) => {
      let diffToTarget = scrollProgress - snaps[index];

      // Loop normalization
      if (diffToTarget > 0.5) diffToTarget -= 1;
      if (diffToTarget < -0.5) diffToTarget += 1;

      // distFromCenter 0 = Center (Low point), 1 = Edges (High point)
      // Multiplier increased to 3.2 to ensure it reaches 'High' plateau faster toward the edges
      const distFromCenter = Math.abs(diffToTarget * 8);
      const clampedDist = Math.max(0, Math.min(1, distFromCenter));

      // Trajectory function: Sharp Parabolic
      // Offset = MAX_Y_OFFSET at 0, 0 at 1
      const baseOffset = isMobile ? 60 : 196;
      const maxOffsetPx = isMobile
        ? baseOffset
        : (baseOffset / DESIGN_WIDTH) * window.innerWidth;
      const yOffset = maxOffsetPx * (1 - Math.pow(clampedDist, 2));

      const card = slide.querySelector(".carousel-item-card") as HTMLElement;
      if (card) {
        card.style.transform = `translateY(${yOffset}px)`;
      }
    });
  }, [emblaApi, isMobile]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("scroll", applyParallax);
    emblaApi.on("reInit", applyParallax);
    window.addEventListener("resize", applyParallax);

    applyParallax();

    return () => {
      window.removeEventListener("resize", applyParallax);
    };
  }, [emblaApi, applyParallax]);

  const lastClickTime = useRef(0);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    const now = Date.now();
    if (now - lastClickTime.current < 250) return;
    lastClickTime.current = now;

    emblaApi.plugins().autoScroll?.stop();
    emblaApi.scrollPrev();
    setTimeout(() => emblaApi.plugins().autoScroll?.play(), 2000);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    const now = Date.now();
    if (now - lastClickTime.current < 250) return;
    lastClickTime.current = now;

    emblaApi.plugins().autoScroll?.stop();
    emblaApi.scrollNext();
    setTimeout(() => emblaApi.plugins().autoScroll?.play(), 2000);
  }, [emblaApi]);

  if (!items || items.length === 0) return null;

  const displayItems =
    items.length < 8
      ? [...items, ...items, ...items, ...items]
      : [...items, ...items, ...items];

  return (
    <section
      className={`relative w-full bg-[#F6F4ED] flex flex-col items-center overflow-hidden ${isMobile ? "py-10 h-[650px]" : ""}`}
    >
      <style jsx>{`
        .embla__viewport {
          width: 100%;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 auto;
          padding-right: ${isMobile ? "20px" : vw(29)};
        }
        .carousel-item-card {
          transition: transform 0.05s linear;
          will-change: transform;
        }
      `}</style>

      <div
        className={`relative w-full flex-shrink-0 z-10 ${isMobile ? "h-[650px]" : ""}`}
        style={isMobile ? {} : { marginTop: vw(120), marginBottom: vw(120) }}
      >

        <div className="relative text-center select-none">

          {/* 把小球放进标题容器里！锚定在标题的顶部正中心 */}
          {!isMobile && (
            // 去掉 inset-x-0，直接用 left-[50%] 找准标题中线
            <div className="absolute top-0 left-[50%] w-0 h-0 pointer-events-none overflow-visible z-[-1]">

              {/* 1. 标题左侧偏下方 (Figma 397) */}
              <motion.div
                animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bg-[#ECE8D8] rounded-full"
                style={{ left: vw(397 - 660), top: vw(36), width: vw(71), height: vw(71) }}
              />

              {/* 2. 标题右下方 (Figma 815) */}
              <motion.div
                animate={{ y: [0, 20, 0], x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bg-[#ECE8D8] rounded-full"
                style={{ left: vw(815 - 660), top: vw(147), width: vw(36), height: vw(36) }}
              />

              {/* 3. 标题右侧偏上 (Figma 833) */}
              <motion.div
                animate={{ y: [0, -10, 0], x: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bg-[#ECE8D8] rounded-full"
                style={{ left: vw(833 - 660), top: vw(-7), width: vw(57), height: vw(57) }}
              />

              {/* 4. 标题左上方 (Figma 545) */}
              <motion.div
                animate={{ y: [0, 12, 0], x: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute bg-[#ECE8D8] rounded-full"
                style={{ left: vw(545 - 660), top: vw(-53), width: vw(20), height: vw(20) }}
              />
            </div>
          )}

          {/* 1. Underlying Stroke Layer */}
          <h2
            className="absolute inset-x-0 whitespace-pre-line font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-anaheim)",
              fontSize: isMobile ? "32px" : vw(67),
              lineHeight: isMobile ? "38px" : vw(74),
              color: "transparent",
              WebkitTextStroke: isMobile ? "1px #756F3F" : `${vw(3)} #756F3F`,
              transform: `translateY(${isMobile ? "2px" : vw(3)})`,
              zIndex: 0,
              top: 0,
            }}
          >
            {title || "Application\nscenarios"}
          </h2>

          {/* 2. Middle Offset Fill Layer */}
          <h2
            className="absolute inset-x-0 whitespace-pre-line font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-anaheim)",
              fontSize: isMobile ? "32px" : vw(67),
              lineHeight: isMobile ? "38px" : vw(74),
              color: "#F6F4ED",
              transform: `translateY(${isMobile ? "2px" : vw(3)})`,
              zIndex: 1,
              top: 0,
            }}
          >
            {title || "Application\nscenarios"}
          </h2>

          {/* 3. Foreground Main Layer */}
          <h2
            className="relative whitespace-pre-line font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-anaheim)",
              fontSize: isMobile ? "32px" : vw(67),
              lineHeight: isMobile ? "38px" : vw(74),
              color: "#645C1F",
              zIndex: 2,
            }}
          >
            {title || "Application\nscenarios"}
          </h2>
        </div>

        {/* Carousel */}
        <div
          className={`${isMobile ? "absolute inset-x-0" : "relative w-full"} embla__viewport`}
          style={isMobile
            ? { top: "160px", height: "400px" }
            : { height: vw(654) }
          }
          ref={emblaRef}
        >
          <div className="embla__container">
            {displayItems.map((item, i) => (
              <div key={`${item.id}-${i}`} className="embla__slide">
                <div
                  className="carousel-item-card relative overflow-hidden group"
                  style={{
                    width: isMobile ? "220px" : vw(261),
                    height: isMobile ? "340px" : vw(458),
                    borderRadius: isMobile ? "16px" : vw(21),
                    boxShadow: isMobile
                      ? "0px 8px 16px rgba(0,0,0,0.1)"
                      : `0px ${vw(11)} ${vw(17)} rgba(0, 0, 0, 0.12)`,
                  }}
                >
                  <OptimizedImage
                    image={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    size="medium"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3
                      className="text-white font-bold"
                      style={{
                        fontSize: isMobile ? "16px" : vw(17),
                        fontFamily: "var(--font-anaheim)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-white/80 mt-1 lg:mt-2 line-clamp-2"
                      style={{ fontSize: isMobile ? "12px" : vw(11) }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - Hidden on mobile */}
        {!isMobile && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-[5vw] flex items-center justify-center hover:bg-[#756f3f] hover:text-white transition-all z-50 bg-white/10 text-[#756f3f] rounded-full border-2 border-[#756f3f]"
              style={{ width: vw(57), height: vw(57), top: vw(60) }}
            >
              <ChevronLeft style={{ width: vw(28), height: vw(28) }} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-[5vw] flex items-center justify-center hover:bg-[#756f3f] hover:text-white transition-all z-50 bg-white/10 text-[#756f3f] rounded-full border-2 border-[#756f3f]"
              style={{ width: vw(57), height: vw(57), top: vw(60) }}
            >
              <ChevronRight style={{ width: vw(28), height: vw(28) }} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
