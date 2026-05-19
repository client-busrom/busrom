import React, { useState, useEffect } from "react";
import {
  OptimizedImage,
  OptimizedBackgroundImage,
} from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { HollowText } from "@/components/common/HollowText";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface BrandPositionItem {
  title: string;
  description?: string;
  image: MediaObject | null;
  link?: string;
}

interface MediaObject {
  url: string;
  id: string;
  alt?: string;
  altText?: string;
  variants?: any;
}

interface StoryBrandPositionSectionProps {
  data: {
    title: string;
    subtitle: string;
    description: string;
    items: {
      slides: BrandPositionItem[];
      autoplay: boolean;
      interval: number;
    };
    image: any;
  };
}

/**
 * OrbitDecoration
 * Memoized component for the orbiting star and ellipse to prevent re-renders.
 */
const OrbitDecoration = React.memo(() => {
  const points = React.useMemo(() => {
    const xPoints = [];
    const yPoints = [];
    const steps = 60;
    const a = 204;
    const b = 84;
    const rot = -22.02 * (Math.PI / 180);
    const centerX = 192.065;
    const centerY = 109.16;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const x = a * Math.cos(t) * Math.cos(rot) - b * Math.sin(t) * Math.sin(rot);
      const y = a * Math.cos(t) * Math.sin(rot) + b * Math.sin(t) * Math.cos(rot);
      xPoints.push(vw(centerX + x));
      yPoints.push(vw(centerY + y));
    }
    return { x: xPoints, y: yPoints };
  }, []);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: vw(1370),
        top: vw(710),
        width: vw(384.13),
        height: vw(218.32),
        zIndex: 1,
      }}
    >
      <div
        className="absolute border border-[#C9C177]"
        style={{
          width: vw(408),
          height: vw(168),
          left: "50%",
          top: "50%",
          borderRadius: "50%",
          transform: "translate(-50%, -50%) rotate(-22.02deg)",
        }}
      />
      <motion.div
        className="absolute"
        style={{
          width: vw(38),
          height: vw(38),
          marginLeft: vw(-19),
          marginTop: vw(-19),
          zIndex: 3,
        }}
        animate={{
          left: points.x,
          top: points.y,
          rotate: 360,
        }}
        transition={{
          duration: 8,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
          <path
            d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
            fill="#C9C177"
          />
        </svg>
      </motion.div>
    </div>
  );
});

/**
 * CapsuleActiveIndicator
 * Implements the rotating spheres around a pill-shaped track.
 */
function CapsuleActiveIndicator() {
  const width = 291;
  const height = 431;
  const radius = width / 2;
  const straightH = height - width; // 140 for height 431
  const topY = radius;
  const bottomY = height - radius;

  const pointsData = React.useMemo(() => {
    const generatePoints = (startOffset: number) => {
      const xPoints = [];
      const yPoints = [];
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const p = ((i / steps) * 100 + startOffset) % 100;
        let x = 0, y = 0;
        if (p < 25) {
          const angle = (180 + (p / 25) * 180) * (Math.PI / 180);
          x = radius + radius * Math.cos(angle);
          y = topY + radius * Math.sin(angle);
        } else if (p < 50) {
          const t = (p - 25) / 25;
          x = width; y = topY + t * straightH;
        } else if (p < 75) {
          const angle = (0 + ((p - 50) / 25) * 180) * (Math.PI / 180);
          x = radius + radius * Math.cos(angle);
          y = bottomY + radius * Math.sin(angle);
        } else {
          const t = (p - 75) / 25;
          x = 0; y = bottomY - t * straightH;
        }
        xPoints.push(vw(x));
        yPoints.push(vw(y));
      }
      return { x: xPoints, y: yPoints };
    };
    return { p1: generatePoints(0), p2: generatePoints(50) };
  }, [radius, topY, bottomY, width, straightH]);

  const { p1, p2 } = pointsData;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: vw(width),
        height: vw(height),
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* The Capsule Border (Rectangle 451) */}
      <div
        className="absolute inset-0 border border-[#b1ac7f]"
        style={{ borderRadius: vw(225) }}
      />

      {/* Rotating Sphere 1 (Ellipse 114) */}
      <motion.div
        className="absolute rounded-full bg-[#b1ac7f]"
        style={{
          width: vw(13),
          height: vw(13),
          marginLeft: vw(-6.5),
          marginTop: vw(-6.5),
        }}
        animate={{
          left: p1.x,
          top: p1.y,
        }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />

      {/* Rotating Sphere 2 (Ellipse 113) */}
      <motion.div
        className="absolute rounded-full bg-[#b1ac7f]"
        style={{
          width: vw(21),
          height: vw(21),
          marginLeft: vw(-10.5),
          marginTop: vw(-10.5),
        }}
        animate={{
          left: p2.x,
          top: p2.y,
        }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function StoryBrandPositionSection({
  data,
}: StoryBrandPositionSectionProps) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Embla setup for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [
      Autoplay({
        delay: data.items.interval || 4000,
        stopOnInteraction: false,
      }),
    ],
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Desktop Auto-play Logic
  useEffect(() => {
    if (windowWidth <= 1024) return;
    const { autoplay, interval, slides } = data.items;
    if (!autoplay || isPaused || slides.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [data.items, isPaused, windowWidth]);

  const isMobile = windowWidth > 0 && windowWidth <= 767;

  if (isMobile) {
    return (
      <section className="relative w-full bg-[#f2efd8] pb-20 px-6 sm:px-12">
        {/* Title Area (Perfectly Bridging Sections - No-animation Positioning) */}
        <div className="absolute left-6 sm:left-12 top-0 z-30 -translate-y-[28%]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start gap-1"
          >
            {data.title.split(" ").map((word, idx) => {
              if (idx === 0) {
                return (
                  <div
                    key={idx}
                    className="relative inline-block font-josefin-sans font-bold leading-none"
                    style={{ fontSize: "min(16vw, 100px)" }}
                  >
                    {/* Top Part (White) - Will be in the section above */}
                    <div
                      className="absolute text-white overflow-hidden whitespace-nowrap"
                      style={{ height: "42%", width: "100%", top: 0 }}
                    >
                      {word}
                    </div>
                    {/* Bottom Part (Olive) - Will be in this section */}
                    <div
                      className="absolute text-[#756f3f] overflow-hidden whitespace-nowrap"
                      style={{ height: "58%", bottom: 0, width: "100%" }}
                    >
                      <div style={{ transform: "translateY(-42%)" }}>
                        {word}
                      </div>
                    </div>
                    {/* Invisible Placeholder for spacing */}
                    <div className="opacity-0 whitespace-nowrap">{word}</div>
                  </div>
                );
              }
              return (
                <span
                  key={idx}
                  className="text-[#756f3f] font-josefin-sans font-bold tracking-widest uppercase"
                  style={{ fontSize: "min(5vw, 20px)" }}
                >
                  {word}
                </span>
              );
            })}
          </motion.div>
        </div>

        {/* Carousel Spacer - to avoid title overlap */}
        <div className="pt-24 sm:pt-32" />

        {/* Mobile Embla Carousel */}
        <div className="relative mb-20 overflow-hidden" ref={emblaRef}>
          <div className="flex items-center">
            {data.items.slides.map((item, i) => (
              <div
                key={i}
                className="flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_40%] px-4 min-w-0"
              >
                <div className="flex flex-col items-center">
                  {/* Oval Card */}
                  <div
                    className={`relative overflow-hidden bg-[#d9d9d9] border border-black/5 transition-all duration-500 rounded-full aspect-[2/3] w-full max-w-[280px] ${
                      i === activeIndex ? "shadow-xl" : "opacity-40"
                    }`}
                  >
                    <OptimizedImage
                      image={item.image}
                      size="medium"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Label */}
                  <div
                    className={`mt-8 font-bold font-josefin-sans text-center text-xl sm:text-2xl text-black transition-opacity duration-300 ${
                      i === activeIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.title}
                  </div>

                  {/* Description */}
                  {i === activeIndex && item.description && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 font-josefin-sans text-center text-[#6b6744] text-sm sm:text-base max-w-[260px]"
                    >
                      {item.description}
                    </motion.p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stack: Philosophy & Content */}
        <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-16">
          {/* Philosophy Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-[600px] aspect-[1.6] rounded-[200px] overflow-hidden border border-[#b1ac7f] p-4"
          >
            <div className="w-full h-full rounded-[180px] overflow-hidden">
              <OptimizedImage
                image={data.image}
                alt="Philosophy"
                size="large"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Subtitle & Description */}
          <div className="flex flex-col items-center text-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <HollowText
                strokeWidth={1}
                strokeColor="#524d20"
                className="text-6xl sm:text-8xl leading-none"
              >
                {data.subtitle.split(" ")[0]}
              </HollowText>
              <span className="text-6xl sm:text-8xl text-[#524d20] leading-none -mt-4">
                {data.subtitle.split(" ").slice(1).join(" ")}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="font-josefin-sans text-lg sm:text-xl text-[#6b6744] leading-relaxed max-w-[700px]"
            >
              {data.description}
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full"
      style={{
        height: vw(1160),
        backgroundColor: "#f2efd8",
      }}
    >
      <div className="relative z-10 w-full h-full overflow-visible">
        {mounted && <OrbitDecoration />}


        {/* 1. Split-Color Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="absolute z-20 font-josefin-sans font-bold flex items-baseline"
          style={{
            left: vw(148),
            top: vw(-62),
            lineHeight: 1,
          }}
        >
          {data.title.split(" ").map((word, idx) => {
            if (idx === 0) {
              return (
                <div
                  key={idx}
                  className="relative inline-block mr-8"
                  style={{ fontSize: vw(140), width: "max-content" }}
                >
                  <div
                    className="absolute text-white overflow-hidden whitespace-pre-line"
                    style={{ height: "42%", width: "max-content", top: 0 }}
                  >
                    {word}
                  </div>
                  <div
                    className="absolute text-[#756f3f] overflow-hidden whitespace-pre-line"
                    style={{ height: "58%", bottom: 0, width: "max-content" }}
                  >
                    <div style={{ transform: "translateY(-42%)" }}>{word}</div>
                  </div>
                  <div className="opacity-0 whitespace-pre-line">{word}</div>
                </div>
              );
            }
            return (
              <span
                key={idx}
                className="text-[#756f3f] font-josefin-sans tracking-tight"
                style={{ fontSize: vw(48) }}
              >
                {word.toUpperCase()}
              </span>
            );
          })}
        </motion.div>

        {/* 2. Carousel Items Area */}
        <div
          className="absolute"
          style={{ left: vw(0), right: vw(0), top: vw(80), height: vw(500) }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="relative w-full h-full flex justify-center items-end"
            style={{ gap: vw(20) }}
          >
            {data.items.slides.map((item, i) => {
              const isActive = i === activeIndex;

              return (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className="relative flex flex-col items-center flex-shrink-0 cursor-pointer"
                  style={{ width: vw(322) }}
                >
                  {/* Indicator goes behind item but centered */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-0"
                        style={{ top: "40%", transform: "translateY(-50%)" }}
                      >
                        {mounted && <CapsuleActiveIndicator />}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Oval Card Container */}
                  <div
                    className="relative z-10 overflow-hidden bg-[#d9d9d9] border border-black/5"
                    style={{
                      width: isActive ? vw(247) : vw(219),
                      height: isActive ? vw(334) : vw(296),
                      borderRadius: isActive ? vw(123.5) : vw(109.5),
                      boxShadow: isActive
                        ? "0 9px 15px rgba(0,0,0,0.4)"
                        : "none",
                    }}
                  >
                    <OptimizedImage
                      image={item.image}
                      size="small"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Text Label */}
                  <div
                    className={`mt-10 font-bold font-josefin-sans text-center transition-all duration-300`}
                    style={{
                      fontSize: isActive ? vw(32) : vw(24),
                      color: "#000000",
                      width: vw(322),
                      lineHeight: 1.1,
                    }}
                  >
                    {item.title}
                  </div>
                  {isActive && item.description && (
                    <div
                      className="mt-4 font-josefin-sans text-center text-[#6b6744] transition-all duration-300"
                      style={{
                        fontSize: vw(18),
                        width: vw(300),
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Philosophy Graphic */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute"
          style={{
            left: vw(160),
            top: vw(642),
            width: vw(709),
            height: vw(433),
          }}
        >
          <div
            className="absolute inset-0 border border-[#b1ac7f]"
            style={{ borderRadius: vw(216.5) }}
          />
          <div
            className="absolute overflow-hidden"
            style={{
              left: vw(63),
              top: vw(22),
              width: vw(709),
              height: vw(389),
              borderRadius: vw(194.5),
            }}
          >
            <OptimizedImage
              image={data.image}
              alt="Philosophy image"
              size="medium"
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute font-josefin-sans font-bold"
          style={{
            left: vw(811),
            top: vw(719),
            width: vw(887),
            height: vw(162),
          }}
        >
          <div className="absolute left-0 top-0 z-10">
            <HollowText
              strokeWidth={1}
              strokeColor="#524d20"
              className="leading-none whitespace-pre-line"
              style={{ fontSize: vw(128) }}
            >
              {data.subtitle.split(" ")[0]}
            </HollowText>
          </div>
          <div className="absolute z-0" style={{ left: vw(193), top: vw(54) }}>
            <span
              className="leading-none text-[#524d20] whitespace-pre-line"
              style={{ fontSize: vw(128) }}
            >
              {data.subtitle.split(" ").slice(1).join(" ")}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="absolute z-30 font-josefin-sans text-left whitespace-pre-line"
          style={{
            left: vw(966),
            top: vw(910),
            width: vw(664),
            fontSize: vw(32),
            lineHeight: 1.4,
            color: "#6b6744",
          }}
        >
          {data.description}
        </motion.div>
      </div>
    </section>
  );
}
