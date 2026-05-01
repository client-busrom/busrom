"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// 996px tall section in design = 51.875vw
const vw = (px: number) => `${(px / 1920) * 100}vw`;

export interface ApplicationCase {
  id: string | number;
  title: string;
  category: string;
  image: any;
}

interface Props {
  title?: string;
  subtitle?: string;
  titleImage?: string;
  cases?: ApplicationCase[];
}

const DEFAULT_CASES: ApplicationCase[] = [
  {
    id: "1",
    title: "Glass Railing Solution",
    category: "Commercial",
    image: "",
  },
  {
    id: "2",
    title: "Spider Fitting Project",
    category: "Hospitality",
    image: "",
  },
  { id: "3", title: "Floor Spring System", category: "Retail", image: "" },
  {
    id: "4",
    title: "Shower Door Hardware",
    category: "Residential",
    image: "",
  },
  { id: "5", title: "Patch Fitting Office", category: "Corporate", image: "" },
];

export function ApplicationCasesSection({
  title,
  subtitle = "Busrom",
  titleImage,
  cases = DEFAULT_CASES,
}: Props) {
  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dragDirection, setDragDirection] = useState<"none" | "left" | "right">(
    "none",
  );
  const lastClickTime = React.useRef(0);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 150) return;
    lastClickTime.current = now;
    setDirection(1);
    setOffset((o) => o + 1);
  }, []);

  const handlePrev = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 150) return;
    lastClickTime.current = now;
    setDirection(-1);
    setOffset((o) => o - 1);
  }, []);

  const visibleItems = useMemo(() => {
    if (cases.length === 0) return [];
    // Always render 5 predictable positions to ensure slots are never empty
    // and complex custom SVG masks map safely to DOM positions.
    return [-2, -1, 0, 1, 2].map((i) => {
      const p = offset + i;
      // safe modulo for negative numbers
      const caseIdx = ((p % cases.length) + cases.length) % cases.length;
      return { p, caseIdx, slotIdx: i + 2 };
    });
  }, [offset, cases.length]);

  const activeCaseIdx = useMemo(() => {
    if (cases.length === 0) return 0;
    return ((offset % cases.length) + cases.length) % cases.length;
  }, [offset, cases.length]);

  if (cases.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ height: vw(996) }}
    >
      {/* Background "Busrom" Ghost Text - SVG for Gradient Stroke support */}
      <div
        id="applications-subtitle"
        className="absolute font-quicksand font-semibold select-none pointer-events-none"
        style={{
          left: vw(250),
          top: vw(60),
          zIndex: 1,
          transform: "scaleY(1)",
          transformOrigin: "top",
        }}
      >
        <svg width="100%" height={vw(120)} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient
              id="strokeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#000000" />
              <stop offset="100%" stopColor="#B3B3B3" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y={vw(90)}
            style={{
              fontSize: vw(120),
              fill: "#f6f4ed",
              stroke: "url(#strokeGradient)",
              strokeWidth: vw(3),
              paintOrder: "stroke fill",
            }}
          >
            {subtitle}
          </text>
        </svg>
      </div>

      {/* Content Wrapper to push everything towards center while maintaining hierarchy */}
      <div className="flex flex-col items-center w-full">
        {/* Main Title "OUR CASES" - applications-title */}
        <div
          id="applications-title"
          className="relative mb-[vw(40)] flex flex-col items-center z-10"
          style={{
            paddingTop: vw(0),
            transform: `translateX(${vw(90)})  translateY(${vw(-140)})`,
          }}
        >
          {titleImage && (
            <img
              src={titleImage}
              alt={title || "Applications Title"}
              className="object-contain"
              style={{
                width: vw(896.54),
                height: "auto",
                filter: `drop-shadow(0 ${vw(12)} ${vw(12)} rgba(84, 79, 37, 0.2))`,
              }}
            />
          )}
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full flex justify-center items-center"
          style={{ height: vw(420) }}
        >
          <AnimatePresence initial={false}>
            {visibleItems.map(({ p, caseIdx, slotIdx }) => {
              const item = cases[caseIdx];
              const isCenter = slotIdx === 2;

              // Precise Configuration from User's Vector JSON
              const configs = [
                {
                  x: -506.14,
                  y: -92.24,
                  w: 200.28,
                  h: 395.28,
                  z: 1,
                  mask: "url(/images/application/cases/mask1.png)",
                },
                {
                  x: -278.38,
                  y: -77.18,
                  w: 222.11,
                  h: 451.0,
                  z: 4,
                  mask: "url(/images/application/cases/mask2.png)",
                },
                {
                  x: 0,
                  y: 0,
                  w: 300.42,
                  h: 475.85,
                  z: 10,
                  mask: "url(/images/application/cases/mask3.png)",
                },
                {
                  x: 278.38,
                  y: -77.18,
                  w: 222.11,
                  h: 451.0,
                  z: 4,
                  mask: "url(/images/application/cases/mask4.png)",
                },
                {
                  x: 506.14,
                  y: -92.24,
                  w: 200.28,
                  h: 395.28,
                  z: 1,
                  mask: "url(/images/application/cases/mask5.png)",
                },
              ];

              const config = configs[slotIdx];

              return (
                <motion.div
                  key={item.id + "-" + (caseIdx % cases.length)}
                  initial={{
                    x: direction > 0 ? vw(800) : vw(-800),
                    y: vw(-92.24),
                    width: vw(200.28),
                    height: vw(395.28),
                    opacity: 0,
                    scale: 0.8,
                    zIndex: 0,
                  }}
                  animate={{
                    x: vw(config.x),
                    y: vw(config.y),
                    width: vw(config.w),
                    height: vw(config.h),
                    zIndex: config.z,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: direction > 0 ? vw(-800) : vw(800),
                    y: vw(-92.24),
                    width: vw(200.28),
                    height: vw(395.28),
                    opacity: 0,
                    scale: 0.8,
                    zIndex: 0,
                  }}
                  transition={{
                    x: {
                      type: "spring",
                      stiffness: 250,
                      damping: 30,
                      mass: 0.8,
                    },
                    y: {
                      type: "spring",
                      stiffness: 250,
                      damping: 30,
                      mass: 0.8,
                    },
                    width: {
                      type: "spring",
                      stiffness: 250,
                      damping: 30,
                      mass: 0.8,
                    },
                    height: {
                      type: "spring",
                      stiffness: 250,
                      damping: 30,
                      mass: 0.8,
                    },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                  }}
                  className="absolute overflow-hidden cursor-pointer"
                  style={{
                    WebkitMaskImage: config.mask,
                    WebkitMaskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskImage: config.mask,
                    maskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    borderRadius: vw(30),
                    boxShadow: isCenter
                      ? `0 ${vw(20)} ${vw(40)} rgba(84, 79, 37, 0.45)`
                      : "none",
                    willChange: "transform, opacity, width, height",
                  }}
                  onClick={() => {
                    if (slotIdx < 2) handlePrev();
                    if (slotIdx > 2) handleNext();
                  }}
                >
                  {/* Image Component */}
                  <div
                    className="relative w-full h-full bg-[#D6D3C2]"
                    style={{ willChange: "transform, opacity" }}
                  >
                    {item.image ? (
                      <OptimizedImage
                        image={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        size="large"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 border-2 border-[#756F3F]/20 rounded-full mb-4 animate-pulse" />
                        <span className="text-[#544F25]/30 uppercase font-anaheim text-[vw(12)] text-center tracking-widest">
                          {item.title}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arc & Controls */}
      <div
        className="absolute bottom-0 w-full flex justify-center items-center"
        style={{ height: vw(360), marginBottom: vw(20) }}
      >
        {/* Arc Visual Rail - SVG */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-0">
          <div className="w-[85vw]" style={{ opacity: 0.8 }}>
            <svg
              viewBox="0 0 1257 102"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <path
                d="M465.482 91.7556C508.976 94.7219 553.759 96.5481 599.551 97.1287C600.093 97.1352 641.132 96.8238 655.752 97.1287C697.336 96.7537 738.147 95.3547 777.967 93.0095V97.534C743.33 99.5699 707.95 100.891 671.971 101.447C669.738 101.495 666.786 101.534 663.35 101.565C660.834 101.595 658.314 101.624 655.792 101.646C655.675 101.647 655.56 101.636 655.448 101.62C632.8 101.74 599.954 101.652 599.494 101.646C553.733 101.066 508.97 99.2451 465.482 96.2849V91.7556Z"
                fill="#756F3F"
              />
              <path
                d="M1253.58 3.70778C1254.75 3.26528 1256.05 3.85228 1256.5 5.01833C1256.94 6.18437 1256.35 7.48866 1255.19 7.93142C1169.86 40.3141 1062.04 65.9623 939.848 82.2V77.6424C1061.5 61.4388 1168.77 35.8964 1253.58 3.70778Z"
                fill="#756F3F"
              />
              <path
                d="M0.156898 1.43337C0.613017 0.27227 1.92353 -0.299075 3.08463 0.157002C84.3231 32.0702 186.843 57.7685 303.601 74.7039V79.2693C186.283 62.2928 83.1918 36.4786 1.43327 4.3611C0.272269 3.90502 -0.298958 2.5944 0.156898 1.43337Z"
                fill="#756F3F"
              />
            </svg>
          </div>
        </div>

        {/* UI Controls Container - Absolutely positioned over the line's gaps */}
        <div className="absolute inset-0 flex justify-center items-center z-20">
          {/* PREV: Left Button */}
          <button
            onClick={handlePrev}
            className="group absolute flex items-center justify-center transition-transform duration-300 active:scale-95"
            aria-label="Previous Case"
            // Adjust this offset specifically to sit inside the nav-line left gap
            style={{
              width: vw(160),
              height: vw(100),
              left: `calc(50% - ${vw(400)})`,
              top: `calc(50% + ${vw(50)})`,
              transform: `translateY(-50%)`,
            }}
          >
            {/* Background Highlight Box */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${dragDirection === "left" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              style={{
                backgroundColor: "#CFC57360",
                borderRadius: vw(160),
                transform: "rotate(6deg)",
                zIndex: -1,
              }}
            />

            <div className="absolute w-[60%] h-[60%] transition-all duration-300">
              <svg
                viewBox="0 0 106 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M104.233 16.1344L101.089 12.0485L72.8304 33.2602L94.8915 60.8606L98.9565 57.6902L80.4407 34.2264L104.233 16.1344Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                />
                <path
                  d="M69.3669 11.7074L66.2234 7.62155L37.9645 28.8332L60.0256 56.4336L64.0906 53.2632L45.5749 29.7994L69.3669 11.7074Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                />
                <path
                  d="M34.5012 7.28041L31.3577 3.19454L3.09881 24.4062L25.1599 52.0066L29.2249 48.8362L10.7091 25.3724L34.5012 7.28041Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </button>

          {/* DRAGGABLE HANDLE (SVG) */}
          <div
            className="absolute z-30"
            style={{
              width: vw(75),
              height: vw(75),
              left: "50%",
              top: `calc(50% + ${vw(63)})`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: -150, right: 150 }}
              dragElastic={0.1}
              dragSnapToOrigin
              onDrag={(event, info) => {
                if (info.offset.x < -50) setDragDirection("left");
                else if (info.offset.x > 50) setDragDirection("right");
                else setDragDirection("none");
              }}
              onDragEnd={(event, info) => {
                if (info.offset.x < -100) handlePrev();
                else if (info.offset.x > 100) handleNext();
                setDragDirection("none");
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <svg
                  viewBox="0 0 62 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full opacity-100"
                >
                  <circle
                    cx="30.5997"
                    cy="30.5997"
                    r="28.0997"
                    fill="#544F25"
                    stroke="#756F3F"
                    strokeWidth="5"
                  />
                  <path
                    d="M37.6798 21.2158L36.2648 22.6709L35.921 23.0234L36.2687 23.3721L44.2238 31.3525L36.2687 39.333L35.921 39.6816L36.2648 40.0342L37.6798 41.4893L38.0314 41.8516L38.3898 41.4961L48.2687 31.708L48.6271 31.3525L48.2687 30.9971L38.3898 21.209L38.0314 20.8545L37.6798 21.2158Z"
                    fill="white"
                    stroke="white"
                  />
                  <path
                    d="M23.5195 21.2158L24.9346 22.6709L25.2783 23.0234L24.9307 23.3721L16.9756 31.3525L24.9307 39.333L25.2783 39.6816L24.9346 40.0342L23.5195 41.4893L23.168 41.8516L22.8096 41.4961L12.9307 31.708L12.5723 31.3525L12.9307 30.9971L22.8096 21.209L23.168 20.8545L23.5195 21.2158Z"
                    fill="white"
                    stroke="white"
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* NEXT: Right Button */}
          <button
            onClick={handleNext}
            className="group absolute flex items-center justify-center transition-transform duration-300 active:scale-95"
            aria-label="Next Case"
            // Adjust this offset specifically to sit inside the nav-line right gap
            style={{
              width: vw(160),
              height: vw(100),
              left: `calc(50% + ${vw(380)})`,
              top: `calc(50% + ${vw(50)})`,
              transform: `translate(-100%, -50%)`,
            }}
          >
            {/* Background Highlight Box */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${dragDirection === "right" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              style={{
                backgroundColor: "#CFC57360",
                borderRadius: vw(160),
                transform: "rotate(-6deg)",
                zIndex: -1,
              }}
            />

            <div className="absolute w-[60%] h-[60%] transition-all duration-300">
              <svg
                viewBox="0 0 106 62"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M0.999933 16.1339L4.14342 12.0481L32.4023 33.2597L10.3412 60.8601L6.27617 57.6897L24.7919 34.2259L0.999933 16.1339Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M35.8657 11.7069L39.0091 7.62106L67.268 28.8327L45.2069 56.4331L41.1419 53.2627L59.6577 29.7989L35.8657 11.7069Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M70.7314 7.28041L73.8749 3.19454L102.134 24.4062L80.0726 52.0066L76.0076 48.8362L94.5234 25.3724L70.7314 7.28041Z"
                  fill="#756F3F"
                  stroke="#756F3F"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
