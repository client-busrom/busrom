"use client";

import React from "react";
import { motion } from "framer-motion";
import { QuoteSection as QuoteSectionType } from "@/types/product-overview";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import Link from "next/link";
import { Icon } from "@iconify/react";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface QuoteSectionProps {
  data: QuoteSectionType;
}

export function QuoteSection({ data }: QuoteSectionProps) {
  if (!data) return null;

  return (
    <section className="relative w-full overflow-hidden" id="quote-section">
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
            className="absolute font-anaheim text-[#000000] leading-[1.37] font-medium whitespace-pre-line"
            style={{
              fontSize: vw(32),
              left: vw(187),
              top: vw(355),
            }}
          >
            {data.description}
          </motion.p>

          {/* 3. CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute"
            style={{ left: vw(982), top: vw(376) }}
          >
            <Link
              href={data.cta.url}
              target={data.cta.openInNewTab ? "_blank" : undefined}
              className="group/btn cursor-pointer transition-transform hover:scale-105 block"
            >
              <div
                className="relative flex gap-x-4 items-center justify-between bg-[#756f3f] rounded-full border border-white/10"
                style={{
                  height: vw(86),
                  paddingLeft: vw(36),
                  paddingRight: vw(8),
                }}
              >
                <span
                  className="text-white font-josefin-sans font-medium tracking-wider"
                  style={{ fontSize: vw(24) }}
                >
                  {data.cta.title}
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
              </div>
            </Link>
          </motion.div>

          {/* 4. Capsule Image & Quote Icon */}
          <div
            className="absolute"
            style={{
              right: vw(4),
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
              top: vw(551),
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
          className="font-anaheim text-lg text-black/80 font-medium text-center leading-relaxed mb-10 max-w-[90%]"
        >
          {data.description}
        </motion.p>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href={data.cta.url}
            target={data.cta.openInNewTab ? "_blank" : undefined}
            className="flex items-center gap-6 bg-[#756f3f] text-white rounded-full pl-8 pr-2 py-2 shadow-xl active:scale-95 transition-transform"
          >
            <span className="font-josefin-sans font-medium tracking-wider text-lg">
              {data.cta.title}
            </span>
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center">
              <Icon
                icon="lucide:arrow-up-right"
                className="text-[#756f3f] text-2xl"
              />
            </div>
          </Link>
        </motion.div>

        {/* Mobile Decorative Logo */}
        <div className="absolute left-0 bottom-0 w-[200%] h-[120px] opacity-20 pointer-events-none translate-x-[-10%]">
          {data.logo && (
            <OptimizedImage
              image={data.logo}
              alt="Decorative Logo Mobile"
              className="w-full h-full object-contain object-left-bottom"
              size="large"
            />
          )}
        </div>
      </div>
    </section>
  );
}
