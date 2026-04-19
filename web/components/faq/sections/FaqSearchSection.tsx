"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Icon } from "@iconify/react";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqSearchSectionProps {
  data: {
    title: any[];
    image: any;
    btnText: string;
    bgText?: string;
    placeholder?: string;
    linkJump?: {
      title?: string;
      description?: string;
    };
  };
  locale: string;
}

export function FaqSearchSection({ data, locale }: FaqSearchSectionProps) {
  // Map linkJump fields to tactical UI elements
  const btnText = data.linkJump?.title || data.btnText || "";
  const placeholder = data.linkJump?.description || data.placeholder || "";

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ padding: `${vw(100)} 0` }}
    >
      <div
        className="relative z-10 w-full mx-auto overflow-hidden"
        style={{
          maxWidth: vw(1860),
          height: vw(540),
          borderRadius: vw(60),
        }}
      >
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            image={data.image}
            alt="Search Background"
            className="w-full h-full object-cover"
            size="xlarge"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2.1px]" />
        </div>

        {/* Background Huge Text - Animated Spherical Rolling Gloss Effect */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-10 overflow-hidden">
          <motion.h2
            animate={{
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{
              backgroundPosition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="select-none leading-none text-center font-bold uppercase"
            style={{
              fontFamily: "var(--font-anton), sans-serif",
              fontSize: vw(180),
              letterSpacing: vw(40),
              // Spherical Rolling Gloss Effect
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.5) 100%)",
              backgroundSize: "200% auto",
              backgroundRepeat: "repeat",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.9,
              paddingTop: vw(80),
            }}
          >
            {data.bgText || "BUSROM"}
          </motion.h2>
        </div>

        {/* Content Layer - Explicit distribution */}
        <div
          className="relative z-20 h-full flex flex-col items-center justify-between"
          style={{ padding: `${vw(100)} ${vw(24)} ${vw(50)}` }}
        >
          {/* Section Title - Upper Polar */}
          {data.title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="text-white text-center font-anaheim font-bold uppercase"
                style={{
                  fontSize: vw(52),
                  letterSpacing: vw(10.4),
                  lineHeight: 1.2,
                }}
              >
                {data.title.map((node: any, i: number) => {
                  if (node.type === "text")
                    return <span key={i}>{node.text}</span>;
                  if (node.type === "linebreak") return <br key={i} />;
                  return null;
                })}
              </div>
            </motion.div>
          )}

          {/* Search Bar Group - Lower Polar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center backdrop-blur-[7.7px] shadow-2xl"
            style={{
              width: "100%",
              maxWidth: vw(1604),
              height: vw(142),
              borderRadius: vw(30),
              padding: `0 ${vw(40)}`,
              backgroundColor: "rgba(255, 255, 255, 0.77)",
            }}
          >
            <div className="flex items-center flex-1" style={{ gap: vw(16) }}>
              <div
                className="flex items-center justify-center text-[#756f3f]"
                style={{ width: vw(32), height: vw(32) }}
              >
                <Icon
                  icon="streamline-sharp:magnifying-glass"
                  className="w-full h-full"
                />
              </div>
              <input
                type="text"
                placeholder={placeholder}
                className="bg-transparent border-none outline-none flex-1 text-[#585858] font-anaheim placeholder:text-[#585858]/60"
                style={{ fontSize: vw(20) }}
              />
            </div>

            <button
              className="bg-[#756f3f] text-white font-anaheim font-semibold tracking-widest uppercase hover:bg-[#8a844a] transition-colors flex items-center justify-center"
              style={{
                height: vw(67),
                padding: `0 ${vw(60)}`,
                borderRadius: vw(38.5),
                fontSize: vw(24),
                letterSpacing: vw(4.32),
                gap: vw(8),
              }}
            >
              {btnText}
              <Icon
                icon="ep:top-right"
                style={{ width: vw(24), height: vw(24) }}
              />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
