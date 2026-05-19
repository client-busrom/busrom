"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function vw(px: number) {
  return `${(px / 1920) * 100}vw`;
}

// Scale toggle requested by UI to shrink items. Reverted base scale to 1 because we are now scaling the entire group wrapper by 0.54
const SCALE = 1;
const svw = (px: number) => vw(px * SCALE);

const calcSlot = (
  left: number,
  top: number,
  width: number,
  height: number,
) => ({
  left: vw(left + (width - width * SCALE) / 2),
  top: vw(top + (height - height * SCALE) / 2),
  width: vw(width * SCALE),
  height: vw(height * SCALE),
});

const calcLetter = (
  left: number,
  top: number,
  width: number,
  height: number,
  zIndex?: number,
) => {
  const CENTER_X = 957.5; // absolute horizontal center of the carousel slots
  const CENTER_Y = 683; // absolute vertical center of the carousel slots
  const distScale = SCALE; // pull letters proportionally closer to center
  const sizeScale = Math.max(0.8, SCALE); // slightly scale letters, but don't shrink below 0.8

  const cx = left + width / 2;
  const cy = top + height / 2;

  const newCx = CENTER_X + (cx - CENTER_X) * distScale;
  const newCy = CENTER_Y + (cy - CENTER_Y) * distScale;
  const newW = width * sizeScale;
  const newH = height * sizeScale;

  const style: React.CSSProperties = {
    left: vw(newCx - newW / 2),
    top: vw(newCy - newH / 2),
    width: vw(newW),
    height: vw(newH),
  };

  if (zIndex !== undefined) style.zIndex = zIndex;
  return style;
};

interface SlotConfig {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
  bgColor?: string;
  borderColor?: string;
  dropShadow?: string;
}

// Same as the one configured in Figma, but scaled dynamically
const SLOTS: SlotConfig[] = [
  // Slot 0 (Far Left)
  {
    ...calcSlot(135, 1468 - 1404, 919, 742),
    zIndex: 2,
    bgColor: "rgba(199, 182, 141, 0.52)",
  },
  // Slot 1 (Mid Left)
  {
    ...calcSlot(259, 1544 - 1404, 919, 742),
    zIndex: 4,
    bgColor: "rgba(216, 205, 177, 0.42)",
  },
  // Slot 2 (Center)
  {
    ...calcSlot(376, 1617 - 1404, 1163, 940),
    zIndex: 10,
    borderColor: "#C5BD7E",
    dropShadow: "24px 22px 51.2px rgba(0,0,0,0.25)",
  },
  // Slot 3 (Mid Right)
  {
    ...calcSlot(734, 1878 - 1404, 919, 742),
    zIndex: 4,
    bgColor: "rgba(161, 133, 61, 0.28)",
  },
  // Slot 4 (Far Right)
  {
    ...calcSlot(845, 1946 - 1404, 919, 742),
    zIndex: 2,
    bgColor: "rgba(177, 162, 125, 0.63)",
  },
];

export interface ProductNavItem {
  name: string;
  showImage: { url: string } | null;
  slug: string;
  openInNewTab: boolean;
  description: string;
}

export interface ApplicationProductNavigationSectionProps {
  navigationItems: ProductNavItem[];
  ctaText?: string;
  ctaHref?: string;
  locale: string;
}

export function ApplicationProductNavigationSection({
  navigationItems = [],
  ctaText = "VIEW MORE",
  ctaHref = "/cases",
  locale,
}: ApplicationProductNavigationSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0); // tracks which index is the Center (slot 2)
  const products = navigationItems;

  // Automatically cycle (like autoplay in CMS, interval=5s)
  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length, activeIndex]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleManualSwap = (targetSlot: number) => {
    // If they clicked slot 0, it means go back 2 steps
    // Target slot 2 is center. Difference:
    const diff = targetSlot - 2;
    setActiveIndex((prev) => (prev + diff + products.length) % products.length);
  };

  // To map products cleanly into 5 slots based on activeIndex
  // [active-2, active-1, active, active+1, active+2]
  const displayItems = () => {
    if (products.length === 0) return [];
    // If we have fewer than 5 products, we repeat them safely modulus
    const len = products.length;
    return [
      (activeIndex - 2 + len * 2) % len,
      (activeIndex - 1 + len * 2) % len,
      activeIndex,
      (activeIndex + 1) % len,
      (activeIndex + 2) % len,
    ];
  };

  const indices = displayItems();

  if (products.length === 0) return null;

  return (
    <>
      {/* Desktop view */}
      <section
        className="hidden lg:block relative w-full overflow-hidden select-none bg-transparent"
        style={{ height: vw(922) }}
      >
      {/* 1920 container to host exact coordinates */}
      <div
        className="absolute left-1/2 -translate-x-1/2 h-full"
        style={{ width: vw(1920) }}
      >
        {/* ================== CTA TOP RIGHT ================== */}
        <div
          className="absolute"
          style={{ left: vw(1420), top: vw(80), zIndex: 20 }}
        >
          <Link href={ctaHref || "/cases"}>
            <motion.div
              className="relative flex items-center group cursor-pointer no-underline"
              style={{ height: vw(66) }}
              initial="initial"
              whileHover="hover"
            >
              {/* Animated Capsule Background */}
              <motion.div
                className="absolute right-0 bg-[#756F3F]"
                variants={{
                  initial: {
                    width: vw(102),
                    height: "100%",
                    borderRadius: vw(33),
                  },
                  hover: {
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#5D5732",
                    borderRadius: vw(33),
                  },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              <div
                className="relative z-10 flex items-center"
                style={{ paddingLeft: vw(40), paddingRight: vw(40) }}
              >
                <motion.span
                  className="font-anaheim font-semibold whitespace-nowrap"
                  style={{
                    fontSize: vw(32),
                    lineHeight: vw(30),
                    marginRight: vw(35),
                  }}
                  variants={{
                    initial: { color: "#756F3F" },
                    hover: { color: "#FFFFFF" },
                  }}
                >
                  {ctaText}
                </motion.span>
                <div style={{ width: vw(33), height: vw(18) }}>
                  <svg
                    viewBox="0 0 33 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M24 1L31.5 8.5M31.5 8.5L24 16M31.5 8.5H1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* ================== SCALED GROUP (LETTERS, SLOTS, ARROWS) ================== */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: "scale(0.54)",
            transformOrigin: "center center",
            marginTop: vw(-120),
          }}
        >
          {/* We make inner elements pointer-events-auto if they need to be interactive */}
          <div className="relative w-full h-full pointer-events-auto">
            {/* ================== BACKGROUND LETTERS ================== */}
            {[
              { src: "/images/application/letters/r.svg", alt: "R", style: calcLetter(1100, 16, 116, 143), delay: 0 },
              { src: "/images/application/letters/o.svg", alt: "O", style: calcLetter(1453, 156, 127, 141, 15), delay: 0.2 },
              { src: "/images/application/letters/m.svg", alt: "M", style: calcLetter(1600, 430, 160, 144, 3), delay: 0.4 },
              { src: "/images/application/letters/b.svg", alt: "B", style: calcLetter(136, 640, 132, 191, 3), delay: 0.6 },
              { src: "/images/application/letters/u.svg", alt: "U", style: calcLetter(291, 1018, 108, 141, 15), delay: 0.8 },
              { src: "/images/application/letters/s.svg", alt: "S", style: calcLetter(620, 1124, 98, 142), delay: 1.0 },
            ].map((letter, idx) => (
              <motion.div
                key={idx}
                className="absolute pointer-events-none"
                style={letter.style}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: letter.delay,
                }}
              >
                <Image src={letter.src} alt={letter.alt} fill />
              </motion.div>
            ))}

            {/* ================== CAROUSEL SLOTS ================== */}
            {indices.map((productIdx, slotIdx) => {
              const slot = SLOTS[slotIdx];
              const product = products[productIdx];

              if (!product) return null;

              const isCenter = slotIdx === 2;

              return (
                <motion.div
                  key={`nav-product-${productIdx}`}
                  initial={false}
                  animate={{
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                    zIndex: slot.zIndex,
                    boxShadow: slot.dropShadow || "none",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  onClick={() => {
                    if (!isCenter) {
                      handleManualSwap(slotIdx);
                    } else {
                      const url = product.slug.startsWith("/")
                        ? product.slug
                        : `/${locale}/shop/${product.slug}`;
                      if (product.openInNewTab) {
                        window.open(url, "_blank");
                      } else {
                        window.location.href = url;
                      }
                    }
                  }}
                  className="absolute overflow-hidden group cursor-pointer"
                  onMouseEnter={undefined}
                  onMouseLeave={undefined}
                  style={{
                    borderRadius: vw(60 * SCALE),
                    border: slot.borderColor
                      ? `2px solid ${slot.borderColor}`
                      : "none",
                  }}
                >
                  <div className="relative w-full h-full bg-stone-200">
                    {product.showImage?.url ? (
                      <Image
                        src={product.showImage.url}
                        alt={product.name || "Product"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200" />
                    )}

                    {!isCenter && slot.bgColor && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-80"
                        style={{ backgroundColor: slot.bgColor }}
                      />
                    )}

                    {isCenter && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div
                          className="absolute flex items-center justify-center rounded-full border border-white/50"
                          style={{
                            right: svw(40),
                            top: svw(40),
                            width: svw(156),
                            height: svw(156),
                            backgroundColor: "#756F3F",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ width: svw(64), height: svw(64) }}
                          >
                            <path
                              d="M7 17L17 7M17 7H7M17 7V17"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <div
                          className="absolute bottom-0 w-full flex flex-col justify-center"
                          style={{
                            height: svw(304),
                            backgroundColor: "rgba(117, 111, 63, 0.74)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            paddingLeft: svw(72),
                            paddingRight: svw(72),
                            transform: "translateZ(0)",
                            backfaceVisibility: "hidden",
                          }}
                        >
                          <h3
                            className="font-anaheim font-bold text-white truncate"
                            style={{
                              fontSize: svw(64),
                              lineHeight: 1.1,
                              marginBottom: svw(16),
                            }}
                          >
                            {product.name}
                          </h3>

                          {product.description && (
                            <div className="flex flex-col gap-[10px]">
                              {product.description
                                .split("\n")
                                .filter((line: string) => line.trim())
                                .map((line: string, idx: number) => (
                                  <div key={idx} className="flex items-center">
                                    <div
                                      className="relative flex items-center justify-center flex-shrink-0"
                                      style={{
                                        width: svw(18),
                                        height: svw(18),
                                        marginRight: svw(24),
                                      }}
                                    >
                                      <div
                                        className="absolute inset-0 rounded-full border"
                                        style={{ borderColor: "#E4DDA9" }}
                                      />
                                      <div
                                        className="rounded-full"
                                        style={{
                                          width: svw(10),
                                          height: svw(10),
                                          backgroundColor: "#FFE866",
                                        }}
                                      />
                                    </div>
                                    <span
                                      className="font-anaheim font-semibold text-white line-clamp-1"
                                      style={{
                                        fontSize: svw(32),
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {line}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* ================== ARROWS ================== */}
            <button
              className="absolute hover:scale-105 transition-transform"
              style={{
                left: vw(311),
                top: vw(334),
                width: vw(200),
                height: vw(152),
                zIndex: 20,
              }}
              onClick={prevSlide}
            >
              <Image
                src="/images/application/letters/leftarrow.svg"
                alt="Prev"
                fill
              />
            </button>

            <button
              className="absolute hover:scale-105 transition-transform"
              style={{
                left: vw(1408),
                top: vw(917),
                width: vw(200),
                height: vw(152),
                zIndex: 20,
              }}
              onClick={nextSlide}
            >
              <Image
                src="/images/application/letters/rightarrow.svg"
                alt="Next"
                fill
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Mobile and Tablet view */}
    <section className="lg:hidden w-full bg-transparent py-12 px-4 select-none flex flex-col items-center overflow-hidden">
      {/* Title */}
      <div className="w-full max-w-sm flex flex-col items-center mb-8">
        <h4
          className="text-3xl font-extrabold uppercase text-[#756F3F] text-center tracking-wide"
          style={{ fontFamily: "var(--font-anaheim), sans-serif" }}
        >
          {locale === "zh" ? "产品分类" : "PRODUCT CATEGORIES"}
        </h4>
        <span
          className="text-xs font-semibold tracking-[0.2em] text-black/30 mt-2 uppercase font-quicksand"
        >
          BUSROM
        </span>
      </div>

      {/* Carousel Card Container */}
      <div className="relative w-full max-w-sm md:max-w-md flex flex-col items-center">
        {/* Card */}
        <div
          onClick={() => {
            const product = products[activeIndex];
            const url = product.slug.startsWith("/")
              ? product.slug
              : `/${locale}/shop/${product.slug}`;
            if (product.openInNewTab) {
              window.open(url, "_blank");
            } else {
              window.location.href = url;
            }
          }}
          className="relative w-full aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl bg-stone-200 cursor-pointer group"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full relative"
            >
              {/* Product Image */}
              {products[activeIndex]?.showImage?.url ? (
                <Image
                  src={products[activeIndex].showImage.url}
                  alt={products[activeIndex].name || "Product"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-stone-200" />
              )}

              {/* Top Right Arrow Icon */}
              <div
                className="absolute right-6 top-6 w-12 h-12 rounded-full border border-white/50 bg-[#756F3F] flex items-center justify-center text-white shadow-md"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Info Overlay at the bottom */}
              <div
                className="absolute bottom-0 w-full flex flex-col justify-center p-6 pt-8"
                style={{
                  backgroundColor: "rgba(117, 111, 63, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <h3
                  className="font-anaheim font-bold text-white text-2xl truncate mb-3"
                >
                  {products[activeIndex]?.name}
                </h3>

                {products[activeIndex]?.description && (
                  <div className="flex flex-col gap-2">
                    {products[activeIndex].description
                      .split("\n")
                      .filter((line: string) => line.trim())
                      .map((line: string, idx: number) => (
                        <div key={idx} className="flex items-center">
                          {/* Dot Indicator */}
                          <div className="relative w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 mr-3">
                            <div className="w-3 h-3 rounded-full border border-[#E4DDA9]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFE866] absolute" />
                          </div>
                          <span
                            className="font-anaheim font-semibold text-white text-sm line-clamp-1"
                          >
                            {line}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls (Prev/Next buttons & dots) */}
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-black/5 hover:bg-black/10 active:scale-95 transition-all text-[#756F3F]"
          >
            <svg viewBox="0 0 14 24" fill="none" className="w-2.5 h-4 rotate-180">
              <path
                d="M1 23L12 12L1 1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {products.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "bg-[#756F3F] w-4" : "bg-black/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-black/5 hover:bg-black/10 active:scale-95 transition-all text-[#756F3F]"
          >
            <svg viewBox="0 0 14 24" fill="none" className="w-2.5 h-4">
              <path
                d="M1 23L12 12L1 1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* View More Button at the bottom */}
      {ctaHref && (
        <div className="mt-8">
          <Link href={ctaHref}>
            <div
              className="flex items-center justify-center bg-[#756F3F] hover:bg-[#5D5732] text-white px-8 py-3 rounded-full font-anaheim font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="text-sm tracking-widest mr-2">{ctaText}</span>
              <svg
                viewBox="0 0 33 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-3"
              >
                <path
                  d="M24 1L31.5 8.5M31.5 8.5L24 16M31.5 8.5H1"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>
      )}
    </section>
  </>
);
}
