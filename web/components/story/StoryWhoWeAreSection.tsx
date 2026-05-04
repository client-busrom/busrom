"use client";

import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface LexicalTextNode {
  text: string;
  format?: number;
  type: string;
}

interface StoryWhoWeAreSectionProps {
  data: {
    titleNodes: LexicalTextNode[] | null;
    content: string;
    description: string;
    bgImage: any;
  };
}

export function StoryWhoWeAreSection({ data }: StoryWhoWeAreSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: vw(676),
        backgroundColor: "#57522a", // Consistent with theme
      }}
    >
      {/* 1. Background Image with Blur/Opacity (zfNCh) */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          image={data.bgImage}
          alt="Who We Are Background"
          size="xlarge"
          className="absolute inset-0 w-full h-full object-cover opacity-33 blur-[7.875px]"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto">
        {/* SVG Filter for True Outside Stroke */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter
              id="true-outline"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="1.2"
                result="dilated"
              />
              <feComposite
                in="dilated"
                in2="SourceAlpha"
                operator="out"
                result="outline"
              />
              <feFlood floodColor="white" result="white" />
              <feComposite in="white" in2="outline" operator="in" />
            </filter>
          </defs>
        </svg>

        {/* 2. Title (DTx7j) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute flex items-baseline font-normal font-josefin-sans"
          style={{
            left: vw(140),
            top: vw(102),
            gap: vw(16),
          }}
        >
          {data.titleNodes ? (
            data.titleNodes.map((node, idx) => {
              if (node.type === "linebreak") return <br key={idx} />;
              const isBold = node.format === 1;

              return (
                <span
                  key={idx}
                  className="leading-none transition-all duration-300"
                  style={{
                    fontSize: isBold ? vw(110) : vw(80),
                    fontWeight: 600,
                    color: isBold ? "white" : "#ffffff", // Filter will make bold parts transparent
                    filter: isBold ? "url(#true-outline)" : "none",
                    textShadow: !isBold
                      ? `0 ${vw(4)} ${vw(11)} #565020`
                      : "none",
                  }}
                >
                  {node.text}
                </span>
              );
            })
          ) : (
            <span className="text-white text-[80px] font-semibold">
              Who We Are?
            </span>
          )}
        </motion.div>

        {/* 3. Description Box (ehr0Q) and Text (iAWyA) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute"
          style={{
            left: vw(156),
            top: vw(255),
            width: vw(542),
            height: vw(219),
            zIndex: 5,
          }}
        >
          {/* Rectangle 446 (ehr0Q) */}
          <div className="absolute inset-0 rounded-[49px] border border-[#ffec51] bg-[#3a20008c] shadow-[0_0_12px_#ffbf51]" />

          {/* Star Top-Right (ROlZ0) */}
          <div
            className="absolute"
            style={{
              top: vw(-16),
              right: vw(-16),
              width: vw(59),
              height: vw(59),
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
              <path
                d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
                fill="#ffec51"
              />
            </svg>
          </div>

          {/* Description Text (iAWyA) */}
          <div
            className="absolute flex items-center text-left font-josefin-sans"
            style={{
              left: vw(30),
              top: vw(31),
              width: vw(482),
              height: vw(157),
              color: "#ffec51",
              fontSize: vw(32),
              lineHeight: 1.3,
              fontWeight: 500,
              textShadow: `0 ${vw(4)} ${vw(11)} #565020`,
            }}
          >
            {data.description}
          </div>
        </motion.div>

        {/* 4. Content (u8cjx) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute font-josefin-sans text-left whitespace-pre-wrap"
          style={{
            left: vw(892),
            top: vw(180),
            maxWidth: vw(980), // Keep a safe boundary but allow wide lines
            fontSize: vw(28),
            lineHeight: 1.6,
            color: "#ffffff",
            textShadow: `0 ${vw(4)} ${vw(11)} #565020`,
          }}
        >
          {data.content}
        </motion.div>
      </div>
    </section>
  );
}
