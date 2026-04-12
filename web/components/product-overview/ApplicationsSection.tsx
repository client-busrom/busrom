"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

// Precise card slot definitions from .pen
const SLOTS = [
  { w: 390, h: 522, x: 0, y: 334, z: 10, opacity: 0.8 }, // Left
  { w: 512, h: 743, x: 451, y: 0, z: 30, opacity: 1 }, // Center
  { w: 307, h: 374, x: 1023, y: 184, z: 10, opacity: 0.6 }, // Right
];

import { ProductOverviewData } from "@/types/product-overview";

interface ApplicationsSectionProps {
  data: ProductOverviewData["applications"];
}

export function ApplicationsSection({ data }: ApplicationsSectionProps) {
  const [offset, setOffset] = useState(0);
  const isMoving = useRef(false);

  const { items, title, subtitle, cta } = data;

  const handleNext = useCallback(() => {
    if (isMoving.current) return;
    isMoving.current = true;
    setOffset((prev) => prev + 1);
    setTimeout(() => {
      isMoving.current = false;
    }, 600);
  }, []);

  const handlePrev = useCallback(() => {
    if (isMoving.current) return;
    isMoving.current = true;
    setOffset((prev) => prev - 1);
    setTimeout(() => {
      isMoving.current = false;
    }, 600);
  }, []);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];
    return [-1, 0, 1].map((i) => {
      const pos = offset + i;
      const index = ((pos % items.length) + items.length) % items.length;
      return { pos, index, slotIdx: i + 1 };
    });
  }, [offset, items.length]);

  if (items.length === 0) return null;

  return (
    <section
      className="relative w-full bg-[#f6f4ed] overflow-hidden select-none"
      id="applications"
      style={{ userSelect: "none" }}
    >
      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:block w-full relative"
        style={{ height: vw(922) }}
      >
        {/* ─── Titles (Limelight Staggered) ─── */}
        <div className="absolute left-0 top-0 w-full z-20 pointer-events-none">
          <h2
            className="absolute font-limelight text-[#464010] uppercase"
            style={{
              fontSize: vw(96),
              left: vw(156),
              top: vw(74),
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </h2>
          <h2
            className="absolute font-limelight text-[#464010] uppercase"
            style={{
              fontSize: vw(96),
              left: vw(373),
              top: vw(183),
              letterSpacing: "0.06em",
            }}
          >
            {subtitle}
          </h2>
        </div>

        {/* ─── CTA Button ─── */}
        <div className="absolute z-30" style={{ left: vw(156), top: vw(385) }}>
          <Link
            href={cta.url}
            target={cta.openInNewTab ? "_blank" : undefined}
            rel={cta.openInNewTab ? "noopener noreferrer" : undefined}
            className="group relative flex gap-x-4 items-center justify-between bg-[#756f3f] rounded-full border border-white/10 transition-all duration-300 hover:scale-105"
            style={{
              height: vw(86),
              paddingLeft: vw(36),
              paddingRight: vw(8),
            }}
          >
            <span
              className="font-josefin-sans font-medium text-white tracking-wider"
              style={{ fontSize: vw(24) }}
            >
              {cta.title}
            </span>

            <div
              className="bg-white rounded-full flex items-center justify-center shrink-0"
              style={{ width: vw(70), height: vw(70) }}
            >
              <svg
                style={{ width: vw(28), height: vw(28) }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="#756f3f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* ─── Carousel (Asymmetrical Layout) ─── */}
        <div
          className="absolute"
          style={{
            left: vw(590),
            top: vw(33),
            width: vw(1330),
            height: vw(800),
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visibleItems.map(({ pos, index, slotIdx }) => {
              const item = items[index];
              const config = SLOTS[slotIdx];

              return (
                <motion.div
                  key={`${item.id}-${pos}`}
                  initial={{
                    x: pos > offset ? vw(1200) : vw(-600),
                    y: vw(config.y),
                    width: vw(config.w),
                    height: vw(config.h),
                    opacity: 0,
                    zIndex: 0,
                    borderRadius: vw(60),
                  }}
                  animate={{
                    x: vw(config.x),
                    y: vw(config.y),
                    width: vw(config.w),
                    height: vw(config.h),
                    zIndex: config.z,
                    opacity: config.opacity,
                    borderRadius: vw(60),
                  }}
                  exit={{
                    x: pos < offset ? vw(-600) : vw(1200),
                    opacity: 0,
                    zIndex: 0,
                    borderRadius: vw(60),
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 28,
                    mass: 0.8,
                  }}
                  className="absolute overflow-hidden cursor-pointer"
                  style={{
                    boxShadow:
                      slotIdx === 1
                        ? `0 ${vw(40)} ${vw(80)} rgba(70, 64, 16, 0.2)`
                        : "none",
                  }}
                  onClick={() => {
                    if (slotIdx === 0) handlePrev();
                    if (slotIdx === 2) handleNext();
                  }}
                >
                  <div className="relative w-full h-full bg-[#D6D3C2] rounded-[vw(60)] overflow-hidden group">
                    <OptimizedImage
                      image={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 rounded-[vw(60)]"
                      size="large"
                    />
                    {/* Overlay for center item */}
                    {slotIdx === 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex flex-col justify-end">
                        <div
                          style={{
                            paddingBottom: vw(50),
                            paddingLeft: vw(50),
                            paddingRight: vw(50),
                          }}
                        >
                          <h3
                            className="text-white font-anaheim font-bold"
                            style={{ fontSize: vw(36) }}
                          >
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p
                              className="text-white/80 font-anaheim font-medium mt-[vw(8)]"
                              style={{ fontSize: vw(20) }}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ─── Navigation Arrows ─── */}
        <div
          className="absolute left-0 w-full flex justify-between items-center pointer-events-none z-40"
          style={{ top: vw(644) }}
        >
          <button
            onClick={handlePrev}
            className="group pointer-events-auto flex items-center justify-center transition-all active:scale-95"
            style={{ width: vw(82), height: vw(82), marginLeft: "8vw" }}
          >
            <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
              <ChevronLeft
                style={{ width: vw(32), height: vw(32) }}
                className="text-[#464010] group-hover:text-white transition-colors"
              />
            </div>
          </button>

          <button
            onClick={handleNext}
            className="group pointer-events-auto flex items-center justify-center transition-all active:scale-95"
            style={{ width: vw(82), height: vw(82), marginRight: "8vw" }}
          >
            <div className="w-full h-full rounded-full border border-[#464010] flex items-center justify-center transition-all duration-300 group-hover:bg-[#464010]">
              <ChevronRight
                style={{ width: vw(32), height: vw(32) }}
                className="text-[#464010] group-hover:text-white transition-colors"
              />
            </div>
          </button>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout (< md) ==================== */}
        <div className="md:hidden w-full flex flex-col bg-[#f6f4ed] overflow-hidden pt-12 pb-16 px-6">
        <div className="w-full max-w-[480px] mx-auto">
          {/* Mobile Titles */}
          <div className="flex flex-col mb-8 text-center sm:text-left">
            <h2 className="font-limelight text-[#464010] uppercase text-4xl tracking-wide leading-tight">
              {title}
            </h2>
            <h2 className="font-limelight text-[#464010] uppercase text-4xl tracking-wide leading-tight mt-1">
              {subtitle}
            </h2>
          </div>

          {/* Mobile Header Actions: CTA + Arrows */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <Link
              href={cta.url}
              target={cta.openInNewTab ? "_blank" : undefined}
              rel={cta.openInNewTab ? "noopener noreferrer" : undefined}
              className="flex-1 max-w-[220px] h-12 pl-5 pr-1.5 flex items-center justify-between bg-[#756f3f] rounded-full transition-all active:scale-95"
            >
              <span className="font-josefin-sans font-medium text-white tracking-wider text-[13px]">
                {cta.title}
              </span>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                <ChevronRight size={18} className="text-[#756f3f]" />
              </div>
            </Link>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-[#464010] flex items-center justify-center bg-white shadow-sm active:scale-90"
              >
                <ChevronLeft size={20} className="text-[#464010]" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-[#464010] flex items-center justify-center bg-white shadow-sm active:scale-90"
              >
                <ChevronRight size={20} className="text-[#464010]" />
              </button>
            </div>
          </div>

          {/* Mobile Single Card Carousel */}
          <div className="relative w-full aspect-[4/5] bg-[#D6D3C2]/20 rounded-[40px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={visibleItems[1].index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="relative w-full h-full bg-[#D6D3C2]">
                  <OptimizedImage
                    image={items[visibleItems[1].index].image}
                    alt={items[visibleItems[1].index].title}
                    className="w-full h-full object-cover"
                    size="large"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-white font-anaheim font-bold text-2xl">
                      {items[visibleItems[1].index].title}
                    </h3>
                    {items[visibleItems[1].index].subtitle && (
                      <p className="text-white/80 font-anaheim font-medium mt-2 text-sm">
                        {items[visibleItems[1].index].subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
