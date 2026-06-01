"use client";

import React from "react";
import { motion } from "framer-motion";
import { QuoteSection as QuoteSectionType } from "@/types/product-overview";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface QuoteSectionProps {
  data: QuoteSectionType;
}

export function QuoteSection({ data }: QuoteSectionProps) {
  const params = useParams();
  const locale = params?.locale as string || "en";

  if (!data) return null;

  return (
    <section className="relative w-full overflow-hidden" id="quote-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-show-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .hover-show-scrollbar:hover {
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .hover-show-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
        }
        .hover-show-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
        }
        `
      }} />

      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:block relative w-full"
        style={{ height: vw(900) }}
      >
        <div className="mx-auto relative h-full" style={{ width: vw(1920) }}>
          {/* 1. Title: Rich text rendering with specific bold color */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="absolute font-limelight text-[#000000] leading-[1.15] whitespace-pre"
            style={{
              fontSize: vw(90),
              left: vw(185),
              top: vw(86),
            }}
          >
            {Array.isArray(data.title)
              ? data.title.map((part: any, idx: number) => {
                if (part.linebreak) return <br key={idx} />;
                return (
                  <span
                    key={idx}
                    className={part.bold ? "font-bold" : ""}
                    style={{ color: part.bold ? "#756F3F" : "inherit" }}
                  >
                    {part.text}
                  </span>
                );
              })
              : data.title}
          </motion.h2>

          {/* 2. Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`absolute font-anaheim text-[#000000] leading-[1.37] font-medium hover-show-scrollbar ${locale === 'en' ? 'whitespace-pre-line' : 'whitespace-normal text-balance break-words'}`}
            style={{
              fontSize: vw(32),
              left: vw(187),
              top: vw(355),
              width: vw(750),
              maxHeight: vw(32 * 1.37 * 4),
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: vw(10), // scrollbar padding
              overscrollBehavior: "contain",
            }}
            data-lenis-prevent
          >
            {locale === 'en' ? data.description : data.description.replace(/<br\s*\/?>/gi, ' ').replace(/\n/g, ' ')}
          </motion.p>

          {/* 3. CTA Button - No entrance animation, only hover breathing effect */}
          <div
            className="absolute"
            style={{ left: vw(982), top: vw(376) }}
          >
            <Link
              href={data.cta.url}
              target={data.cta.openInNewTab ? "_blank" : undefined}
              className="group/btn cursor-pointer block"
            >
              <motion.div
                whileHover={{
                  scale: [1, 1.05, 1],
                  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative flex gap-x-4 items-center justify-between bg-[#756f3f] rounded-full border border-white/10 transition-colors duration-300 group-hover/btn:bg-white group-hover/btn:border-[#756f3f]"
                style={{
                  height: vw(86),
                  paddingLeft: vw(48),
                  paddingRight: vw(8),
                }}
              >
                <span
                  className="text-white font-josefin-sans font-medium tracking-wider transition-colors duration-300 group-hover/btn:text-[#756f3f]"
                  style={{
                    fontSize: vw(24),
                    paddingLeft: vw(8),
                    paddingRight: vw(8),
                  }}
                >
                  {data.cta.title}
                </span>
                <div
                  className="bg-white rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 group-hover/btn:bg-[#756f3f]"
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
                      className="transition-colors duration-300 group-hover/btn:stroke-white"
                    />
                  </svg>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* 4. Capsule Image & Quote Icon */}
          <div
            className="absolute"
            style={{
              right: vw(50),
              top: vw(1),
              width: vw(520),
              height: vw(715),
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden"
              style={{
                left: vw(1422 - 1400),
                width: vw(494),
                height: vw(698),
                borderRadius: vw(247),
                border: `${vw(1)} solid rgba(0,0,0,0.1)`,
              }}
            >
              {data.image && (
                <OptimizedImage
                  image={data.image}
                  alt="Quote"
                  className="w-full h-full object-cover"
                  size="large"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute z-10"
              style={{
                left: vw(0),
                top: vw(18),
                width: vw(130),
                height: vw(127),
              }}
            >
              <img
                src="/product-overview/product-overview-quote-icon.svg"
                alt="Quote Icon"
                className="w-full h-full pointer-events-none"
              />
            </motion.div>
          </div>

          {/* 5. Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: vw(0),
              bottom: vw(-10),
              width: vw(1688),
              height: vw(348),
            }}
          >
            {data.logo && (
              <OptimizedImage
                image={data.logo}
                alt="Decorative Logo"
                className="w-full h-full object-contain"
                size="large"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout (< md) ==================== */}
      <div className="md:hidden w-full flex flex-col items-center pt-16 pb-32 px-6 relative overflow-hidden">
        {/* Mobile Capsule Image & Quote Icon */}
        <div className="relative w-[280px] h-[360px] mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-full h-full rounded-full overflow-hidden border border-black/5 shadow-2xl relative z-10"
          >
            {data.image && (
              <OptimizedImage
                image={data.image}
                alt="Quote Mobile"
                className="w-full h-full object-cover"
                size="large"
              />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -left-6 -top-4 w-16 h-16 z-20"
          >
            <img
              src="/product-overview/product-overview-quote-icon.svg"
              alt="Quote"
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Mobile Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="font-limelight text-[36px] leading-tight text-black text-center mb-6"
        >
          {Array.isArray(data.title)
            ? data.title.map((part: any, idx: number) => {
              if (part.linebreak && idx > 0) return <br key={idx} />;
              return (
                <span
                  key={idx}
                  className={part.bold ? "font-bold" : ""}
                  style={{ color: part.bold ? "#756F3F" : "inherit" }}
                >
                  {part.text}
                </span>
              );
            })
            : data.title}
        </motion.h2>

        {/* Mobile Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`font-anaheim text-lg text-black/80 font-medium text-center leading-relaxed mb-10 max-w-[90%] hover-show-scrollbar ${locale === 'en' ? 'whitespace-pre-line' : 'whitespace-normal text-balance break-words'}`}
          style={{
            maxHeight: "calc(1.125rem * 1.625 * 4)", // 4 lines using text-lg and leading-relaxed
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px",
            overscrollBehavior: "contain",
          }}
        >
          {locale === 'en' ? data.description : data.description.replace(/<br\s*\/?>/gi, ' ').replace(/\n/g, ' ')}
        </motion.p>

        {/* Mobile CTA - No entrance animation, only breathing effect */}
        <div className="relative">
          <Link
            href={data.cta.url}
            target={data.cta.openInNewTab ? "_blank" : undefined}
            className="group/mob-btn flex items-center gap-6 bg-[#756f3f] text-white rounded-full pl-8 pr-2 py-2 shadow-xl active:scale-95 transition-colors duration-300 hover:bg-white border border-transparent hover:border-[#756f3f]"
          >
            <span className="font-josefin-sans font-medium tracking-wider text-lg transition-colors duration-300 group-hover/mob-btn:text-[#756f3f]">
              {data.cta.title}
            </span>
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 group-hover/mob-btn:bg-[#756f3f]">
              <Icon
                icon="lucide:arrow-up-right"
                className="text-[#756f3f] text-2xl transition-colors duration-300 group-hover/mob-btn:text-white"
              />
            </div>
          </Link>
        </div>

        {/* Mobile Decorative Logo - Full width at bottom */}
        <div className="absolute left-0 bottom-0 w-full h-[100px] opacity-20 pointer-events-none px-4">
          {data.logo && (
            <OptimizedImage
              image={data.logo}
              alt="Decorative Logo Mobile"
              className="w-full h-full object-contain object-bottom"
              size="large"
            />
          )}
        </div>
      </div>
    </section>
  );
}
