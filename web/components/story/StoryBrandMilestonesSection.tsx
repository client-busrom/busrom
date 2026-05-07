"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

const PATH_D =
  "M390.955 121.966C309.966 104.913 184.718 57.9922 122.606 81.9663C-107.634 258.857 74.3022 515.901 420.606 412.466C780.95 304.838 664.202 325.718 830.545 360.928C1056.28 408.71 1358.82 364.749 1488.11 235.466C1521.11 202.466 1516.11 177.637 1471.61 150.466C1404.84 109.703 978.052 -44.8697 844.22 48.6244C710.387 142.118 492.192 143.283 390.955 121.966Z";

const TimelineIcon = () => (
  <div
    className="flex-shrink-0 flex items-center justify-center"
    style={{ width: vw(20), height: vw(20) }}
  >
    <div className="w-full h-full rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center">
      <div className="w-[45%] h-[45%] rounded-full bg-[#C9B832]" />
    </div>
  </div>
);

interface CarouselSlide {
  title: string;
  description: string;
  image: any;
  buttonText?: string;
}

interface StoryBrandMilestonesSectionProps {
  data: {
    title: string;
    items: CarouselSlide[];
  };
}

export function StoryBrandMilestonesSection({
  data,
}: StoryBrandMilestonesSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [focusSlideIndex, setFocusSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [pathLength, setPathLength] = useState(0);

  const pathRef = useRef<SVGPathElement>(null);
  const [lut, setLut] = useState<{ x: number; y: number }[]>([]);
  const slides = data?.items || [];

  const pathRatios = useMemo(() => [0.2, 0.08, 0.97, 0.84, 0.54, 0.4], []);
  const slotSizes = useMemo(() => [320, 260, 240, 140, 210, 280], []);

  useEffect(() => {
    setIsMounted(true);
    const timeout = setTimeout(() => {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        setPathLength(length);
        const points = [];
        const RESOLUTION = 300;
        for (let i = 0; i <= RESOLUTION; i++) {
          const pt = pathRef.current.getPointAtLength(
            (i / RESOLUTION) * length,
          );
          points.push({ x: pt.x, y: pt.y });
        }
        setLut(points);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const getPointAtRatio = (ratio: number) => {
    if (lut.length === 0) return { x: 0, y: 0 };
    const r = ((ratio % 1) + 1) % 1;
    const idx = r * (lut.length - 1);
    const base = Math.floor(idx);
    const ceil = Math.min(base + 1, lut.length - 1);
    const f = idx - base;
    const p1 = lut[base];
    const p2 = lut[ceil];
    return {
      x: p1.x + (p2.x - p1.x) * f,
      y: p1.y + (p2.y - p1.y) * f,
    };
  };

  const handleNext = () => {
    setDirection(1);
    setFocusSlideIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setFocusSlideIndex((prev) => prev - 1);
  };

  // Helper to interpolate between discrete slot values (ratios or sizes)
  const getInterpolatedValue = (
    slotFloat: number,
    values: number[],
    isRatio = false,
  ) => {
    const n = values.length;
    if (n === 0) return 0;

    // Support full circularity: map any slotFloat (negative or large) to [0, n]
    const modSlot = ((slotFloat % n) + n) % n;
    const i = Math.floor(modSlot);
    const f = modSlot - i;

    const v1 = values[i];
    const v2 = values[(i + 1) % n]; // Circularly wrap to first element

    if (isRatio) {
      let adjustedV2 = v2;
      // Handle the 0.08 -> 0.97 wrap-around logic
      if (v2 > v1 + 0.5) adjustedV2 -= 1;
      if (v2 < v1 - 0.5) adjustedV2 += 1;
      return v1 + (adjustedV2 - v1) * f;
    }
    return v1 + (v2 - v1) * f;
  };

  const focusProgress = useMotionValue(focusSlideIndex);

  useEffect(() => {
    animate(focusProgress, focusSlideIndex, {
      type: "spring",
      stiffness: 40,
      damping: 20,
      mass: 1,
    });
  }, [focusSlideIndex]);

  const n = slides.length || 1;
  const activeIndex = ((focusSlideIndex % n) + n) % n;
  const activeSlideInBox = slides[activeIndex] || slides[0];

  if (!isMounted) return null;

  // Adjustable ratios for the directional arrows along the path
  const arrow1Ratio = 0.76; // 调整这个比例让第一个箭头在线条上滑动
  const arrow2Ratio = 0.48; // 调整这个比例让第二个箭头在线条上滑动

  const arrow1Pos = getPointAtRatio(arrow1Ratio);
  const arrow2Pos = getPointAtRatio(arrow2Ratio);

  return (
    <section
      className="relative w-full bg-[#f6f4ed] overflow-hidden my-20"
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto overflow-hidden">
        {/* New Title Area using SVGs */}
        <div className="absolute z-20" style={{ left: vw(230), top: vw(130) }}>
          <div className="flex items-start gap-12">
            <div style={{ width: vw(48), height: vw(332) }}>
              <img
                src="/assets/story/brand-travel-with.svg"
                className="w-full h-full object-contain"
                alt="With"
              />
            </div>
            <div style={{ width: vw(183), height: vw(600) }}>
              <img
                src="/assets/story/brand-travel-busrom.svg"
                className="w-full h-full object-contain"
                alt="Busrom"
              />
            </div>
          </div>

          {/* Navigation Arrows - Repositioned */}
          {/* Right Arrow (Next) above Busrom SVG */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute cursor-pointer z-30"
            style={{ left: vw(200), top: vw(-60) }}
            onClick={handleNext}
          >
            <img
              src="/assets/story/A8lvX.png"
              alt="Next"
              style={{ width: vw(85) }}
            />
          </motion.div>

          {/* Left Arrow (Prev) at the old right arrow position */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute cursor-pointer z-30"
            style={{ left: vw(180), bottom: vw(-60) }}
            onClick={handlePrev}
          >
            <img
              src="/assets/story/xlzAP.png"
              alt="Prev"
              style={{ width: vw(85) }}
            />
          </motion.div>
        </div>

        {/* Path-Based Trajectory Area */}
        <div
          className="absolute overflow-visible"
          style={{
            left: vw(576),
            top: vw(100),
            width: vw(1344),
            height: vw(456),
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1344 456"
            className="absolute opacity-0 pointer-events-none"
          >
            <path ref={pathRef} d={PATH_D} />
          </svg>

          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/assets/story/brand-travel-line.svg"
              style={{ width: vw(1344), height: vw(456) }}
              alt=""
            />
          </div>

          {/* Path Arrows - Ratio-based Positioning */}
          {lut.length > 0 && (
            <>
              <motion.div
                className="absolute z-30 pointer-events-none"
                animate={{
                  rotate: direction === 1 ? 0 : 180,
                }}
                style={{
                  left: vw(arrow1Pos.x),
                  top: vw(arrow1Pos.y),
                  width: vw(120),
                  height: vw(120),
                  marginLeft: vw(-60),
                  marginTop: vw(-60),
                }}
              >
                <img
                  src="/assets/story/xwx2U.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </motion.div>

              <motion.div
                className="absolute z-30 pointer-events-none"
                animate={{
                  rotate: direction === 1 ? 180 : 0,
                }}
                style={{
                  left: vw(arrow2Pos.x),
                  top: vw(arrow2Pos.y),
                  width: vw(120),
                  height: vw(120),
                  marginLeft: vw(-60),
                  marginTop: vw(-60),
                }}
              >
                <img
                  src="/assets/story/xwx2U.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </>
          )}

          {/* Connector SVG - Lower Layer (z-20) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.8, duration: 0.3 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              className="absolute z-20 pointer-events-none"
              style={{
                // Position relative to the line container (576, 100)
                // Card is at (740, 620), adjust by connector offset (-130, 20)
                left: vw(80),
                top: vw(540),
                width: vw(123),
                height: vw(119),
              }}
            >
              <img
                src="/assets/story/Vector 7.svg"
                alt=""
                className="w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {/* Kinetic Items Loop */}
          {slides.map((item, index) => (
            <SlideItem
              key={index}
              item={item}
              index={index}
              focusProgress={focusProgress}
              pathRatios={pathRatios}
              slotSizes={slotSizes}
              getPointAtRatio={getPointAtRatio}
              getInterpolatedValue={getInterpolatedValue}
              totalItems={slides.length}
            />
          ))}
        </div>

        {/* Narrative Box */}
        <div
          className="absolute z-[600] pointer-events-none"
          style={{ left: vw(800), top: vw(610) }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={focusSlideIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="relative w-fit min-w-[33.9vw] h-full pointer-events-auto overflow-visible"
              style={{ height: vw(280) }}
            >
              <div
                className="absolute inset-0 bg-[#FDF4D7] shadow-xl w-full"
                style={{ borderRadius: vw(30) }}
              />

              {/* Year indicator from backend buttonText */}
              <div
                className="absolute font-josefin-sans font-bold text-[#E5DEB6] select-none pointer-events-none"
                style={{
                  right: vw(20),
                  top: 0,
                  fontSize: vw(84),
                  lineHeight: 1,
                  transform: "translateY(-42%)",
                }}
              >
                {activeSlideInBox?.buttonText}
              </div>

              <div
                className="absolute bg-[#FFFCF0] w-full"
                style={{
                  left: 0,
                  top: vw(110),
                  height: vw(170),
                  borderRadius: `0 0 ${vw(30)} ${vw(30)}`,
                }}
              />
              <div
                className="relative z-10 h-full flex flex-col w-fit"
                style={{
                  paddingTop: vw(32),
                  paddingLeft: vw(32),
                  paddingRight: vw(32),
                }}
              >
                <div
                  className="flex flex-col w-fit"
                  style={{
                    gap: vw(8),
                    marginBottom: vw(16),
                    minHeight: vw(80),
                  }}
                >
                  {activeSlideInBox?.title.split("\n").map((line, idx) => (
                    <div
                      key={idx}
                      className="flex items-center whitespace-nowrap"
                      style={{ gap: vw(16) }}
                    >
                      <div className="relative" style={{ top: vw(-2) }}>
                        <TimelineIcon />
                      </div>
                      <h3
                        className="font-josefin-sans font-bold text-black"
                        style={{ fontSize: vw(22), lineHeight: 1.2 }}
                      >
                        {line}
                      </h3>
                    </div>
                  ))}
                </div>
                <div className="relative flex-1">
                  <p
                    className="font-josefin-sans font-medium text-[#323232] leading-snug"
                    style={{
                      fontSize: vw(18),
                      maxWidth: vw(536),
                      paddingLeft: vw(32),
                      paddingRight: vw(24),
                    }}
                  >
                    {activeSlideInBox?.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Sub-component for individual moving items
function SlideItem({
  item,
  index,
  focusProgress,
  pathRatios,
  slotSizes,
  getPointAtRatio,
  getInterpolatedValue,
  totalItems,
}: any) {
  // Calculate relative slot position
  // If focusProgress is 3, Item 3 should be at Slot 0
  const slotFloat = useTransform(focusProgress, (f: number) => {
    let diff = index - (f % totalItems);
    // Shortest path wrapping logic for infinite circularity
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;
    return diff;
  });

  const ratio = useTransform(slotFloat, (f: number) =>
    getInterpolatedValue(f, pathRatios, true),
  );
  const size = useTransform(slotFloat, (f: number) =>
    getInterpolatedValue(f, slotSizes),
  );

  const x = useTransform(ratio, (r: number) => getPointAtRatio(r).x);
  const y = useTransform(ratio, (r: number) => getPointAtRatio(r).y);

  // High-fidelity active state based on proximity to Slot 0
  const activeWeight = useTransform(slotFloat, [-0.5, 0, 0.5], [0, 1, 0]);
  const zIndex = useTransform(slotFloat, (f: number) =>
    Math.round(500 - Math.abs(f) * 100),
  );

  return (
    <motion.div
      className="absolute flex items-center justify-center p-2"
      style={{
        left: useTransform(x, (v) => vw(v)),
        top: useTransform(y, (v) => vw(v)),
        width: useTransform(size, (v) => vw(v)),
        height: useTransform(size, (v) => vw(v)),
        x: "-50%",
        y: "-50%",
        zIndex,
      }}
    >
      <motion.div
        className="w-full h-full rounded-full transition-all duration-300 flex items-center justify-center p-2"
        style={{
          backgroundColor: useTransform(
            activeWeight,
            [0, 1],
            ["rgba(255,255,255,0.1)", "rgba(255,245,168,1)"],
          ),
          boxShadow: useTransform(
            activeWeight,
            [0, 1],
            ["none", "0px 20px 40px rgba(0,0,0,0.2)"],
          ),
        }}
      >
        <motion.div className="w-full h-full rounded-full overflow-hidden relative">
          <OptimizedImage
            image={item?.image || "/BusromFooterBg_original.webp"}
            alt=""
            size="medium"
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
