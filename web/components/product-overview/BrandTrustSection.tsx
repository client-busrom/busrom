"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrandTrust } from "@/types/product-overview";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface BrandTrustSectionProps {
  data: BrandTrust;
}

export function BrandTrustSection({ data }: BrandTrustSectionProps) {
  if (!data) return null;

  const renderTitle = (titleStr: string, isMobile = false) => {
    if (!titleStr) return null;
    const parts = titleStr.split(/(<strong>.*?<\/strong>)/gi);
    return parts.map((part, index) => {
      if (
        part.toLowerCase().startsWith("<strong>") &&
        part.toLowerCase().endsWith("</strong>")
      ) {
        const innerText = part.slice(8, -9);
        return (
          <motion.strong
            key={index}
            className="inline-block font-limelight"
            style={
              isMobile
                ? {
                    fontSize: "1.15em",
                    color: "#776D1F",
                    fontWeight: "normal",
                    display: "inline-block",
                    marginLeft: "4px",
                    marginRight: "4px",
                  }
                : {
                    fontSize: vw(96),
                    color: "#776D1F",
                    fontWeight: "normal",
                    display: "inline-block",
                    marginLeft: vw(8),
                    marginRight: vw(8),
                  }
            }
            animate={{
              y: [0, isMobile ? -5 : -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
            dangerouslySetInnerHTML={{ __html: innerText }}
          />
        );
      }
      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  };

  return (
    <section className="relative w-full" id="brand-trust">
      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:block w-full"
        style={{ paddingTop: vw(120), marginBottom: vw(120) }}
      >
        <div 
          className="mx-auto flex items-start relative" 
          style={{ 
            width: vw(1500),
            minHeight: vw(778.2) // Added minimum height to ensure layout stability
          }}
        >
          {/* Background Gradient Block */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0,
              top: 0,
              width: vw(382.2),
              height: '100%', // Dynamically fills the container (at least minHeight)
              background: "linear-gradient(180deg, #756f3f 0%, #dbd076 100%)",
              borderRadius: `0 0 0 ${vw(30)}`,
              zIndex: -1
            }}
          />

          {/* 1. Left Spacer (164.2px offset) */}
          <div className="flex-none" style={{ width: vw(164.2) }} />

          {/* 2. Image Column (413.4px) */}
          <div className="flex-none relative" style={{ width: vw(413.4) }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden shadow-2xl z-10"
              style={{
                width: vw(413.4),
                height: vw(687.9),
                borderRadius: vw(310.5),
                border: `${vw(1)} solid rgba(255, 255, 255, 0.2)`,
              }}
            >
              {data.image && (
                <OptimizedImage
                  image={data.image}
                  alt="Brand Trust"
                  className="w-full h-full object-cover"
                  size="large"
                />
              )}

              {/* Internal Decoration Ring */}
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: vw(249.2),
                  top: vw(460.3),
                  width: vw(268.4),
                  height: vw(268.4),
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full border-2 border-white/30"
                  style={{ transformOrigin: `${vw(180)} ${vw(80)}` }}
                />
              </div>
            </motion.div>

            {/* External Decoration Ring - Positioned relative to image column */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: vw(249.2), // Matched with internal ring for perfect alignment
                top: vw(460.3),
                width: vw(268.4),
                height: vw(268.4),
                zIndex: 0
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border-2 border-[#756f3f] opacity-60"
                style={{ transformOrigin: `${vw(180)} ${vw(80)}` }}
              />
            </div>
          </div>

          {/* 3. Middle Gap (53px) */}
          <div className="flex-none" style={{ width: vw(53) }} />

          {/* 4. Right Side Content Area */}
          <div 
            className="flex-1 flex flex-col items-start"
            style={{ paddingTop: vw(32.1) }}
          >
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="font-limelight text-[#000000] leading-[1.1] z-0 whitespace-pre-line"
              style={{
                fontSize: vw(72),
                width: vw(869.4),
              }}
            >
              {renderTitle(data.title, false)}
            </motion.h2>

            <div
              className="relative"
              style={{
                marginTop: vw(60),
                marginLeft: vw(100),
                width: 'fit-content'
              }}
            >
              <div 
                className="relative w-fit h-auto" 
              >
                {/* Manual SVG Dashed Border with Masked Corner */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: -1 }}
                >
                  <defs>
                    <mask id="corner-mask">
                      <rect width="100%" height="100%" fill="white" />
                      {/* This black circle/rect will "cut" the top-left corner */}
                      <rect x="-10" y="-10" width={vw(100)} height={vw(100)} fill="black" />
                    </mask>
                  </defs>
                  <rect 
                    x={vw(4)} 
                    y={vw(4)} 
                    width={`calc(100% - ${vw(8)})`} 
                    height={`calc(100% - ${vw(8)})`} 
                    rx={vw(40)} 
                    fill="none" 
                    stroke="#756f3f" 
                    strokeWidth={vw(4)} 
                    strokeDasharray={`${vw(16)},${vw(8)}`}
                    mask="url(#corner-mask)"
                  />
                </svg>

                {/* Quote Icon - Rotated 90deg and positioned at the gap */}
                <motion.img 
                  src="/product-overview/product-overview-quote-icon.svg" 
                  alt=""
                  className="absolute pointer-events-none"
                  initial={{ rotate: 90, x: 0 }}
                  animate={{ 
                    x: [0, 15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: vw(-46),
                    top: vw(-20),
                    width: vw(83),
                    height: 'auto',
                    zIndex: 20
                  }}
                />

                <p
                  className="font-josefin-sans text-[#4b4512] leading-[1.5] whitespace-pre-line relative z-10"
                  style={{ 
                    fontSize: vw(24),
                    width: vw(588.9),
                    boxSizing: 'content-box',
                    padding: `${vw(30)} ${vw(20)} ${vw(30)} ${vw(60)}` 
                  }}
                >
                  {data.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout (< md) ==================== */}
      <div 
        className="md:hidden w-full flex flex-col items-center py-16 px-6 relative overflow-hidden rounded-b-[32px]"
        style={{ background: '#fffad3' }}
      >
        {/* Mobile Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="font-limelight text-[#000000] text-4xl leading-tight mb-10 text-center whitespace-pre-line"
        >
          {renderTitle(data.title, true)}
        </motion.h2>

        {/* Dynamic Rotation + Hero Image Area */}
        <div className="relative w-full aspect-square max-w-[340px] mb-12 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-[#756f3f]/30 w-full h-full"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-[70%] h-[92%] rounded-full overflow-hidden shadow-2xl border-4 border-white relative z-10"
          >
            {data.image && (
              <OptimizedImage
                image={data.image}
                alt="Brand Trust Mobile"
                className="w-full h-full object-cover"
                size="large"
              />
            )}

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-[16px] border-white/5 rounded-full pointer-events-none"
            />
          </motion.div>
        </div>

        {/* Mobile Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="w-full bg-white/50 backdrop-blur-md rounded-[32px] p-8 mt-4 border border-white/20 shadow-lg"
        >
          <p className="font-josefin-sans text-[#4b4512] text-lg leading-relaxed whitespace-pre-line text-center">
            {data.content}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
