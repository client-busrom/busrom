"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqGuideSectionProps {
  data: {
    title: any[];
    subtitle: any[];
    items: any[];
  };
  locale: string;
  onNavigate?: (type: "category" | "contact", id?: string) => void;
}

const STRIPS_CONFIG = [
  { id: 1, w: 267, charX: 156, charY: 52, imgW: 320, imgH: 320, imgX: -1, imgY: 266, charW: 153 },
  { id: 2, w: 265, charX: 14, charY: 397, imgW: 341, imgH: 341, imgX: -33, imgY: 99, charW: 153 },
  { id: 3, w: 265, charX: 95, charY: 73, imgW: 355, imgH: 355, imgX: -44, imgY: 216, charW: 153 },
  { id: 4, w: 265, charX: 20, charY: 440, imgW: 418, imgH: 417, imgX: -86, imgY: 60, charW: 153 },
  { id: 5, w: 265, charX: -32, charY: 56, imgW: 414, imgH: 414, imgX: -47, imgY: 154, charW: 153 },
  { id: 6, w: 288, charX: 59, charY: 161, imgW: 364, imgH: 364, imgX: -76, imgY: 239, charW: 218 },
];

export function FaqGuideSection({ data, locale, onNavigate }: FaqGuideSectionProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const getNodesText = (nodes: any[] | undefined | null): string => {
    if (!nodes || !Array.isArray(nodes)) return "";
    return nodes
      .map((n: any) => {
        if (!n) return "";
        if (n.type === "text") return n.text || "";
        if (n.children) return getNodesText(n.children);
        return "";
      })
      .join("");
  };

  const subtitleText = getNodesText(data.subtitle) || "NAVIGATION";

  return (
    <section className="relative w-full overflow-hidden" style={{ height: vw(922) }}>
      {/* Header Area */}
      <div className="relative w-full" style={{ marginTop: vw(65), marginBottom: vw(60) }}>
        <div className="absolute pointer-events-none select-none right-0 top-0" style={{ marginTop: vw(-60) }}>
          <HollowText
            strokeColor="#c6c091"
            strokeWidth={2}
            className="font-bold uppercase z-0"
            style={{
              fontFamily: "var(--font-anaheim), sans-serif",
              fontSize: vw(130),
              letterSpacing: vw(15),
            }}
          >
            {subtitleText}
          </HollowText>
        </div>

        <div className="relative flex justify-center z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-extrabold text-center"
            style={{
              fontFamily: "var(--font-anaheim), sans-serif",
              fontSize: vw(96),
              color: "#756f3f",
              width: vw(1009),
              letterSpacing: vw(1.92),
              lineHeight: 1.07,
            }}
          >
            {getNodesText(data.title)}
          </motion.h2>
        </div>
      </div>

      {/* The Striped Container */}
      <div className="relative flex justify-center w-full" style={{ marginTop: vw(20) }}>
        <div className="flex bg-transparent">
          {STRIPS_CONFIG.map((config, index) => {
            const item = data.items?.[index];
            if (!item) return null;

            return (
              <React.Fragment key={item.id || index}>
                <div
                  className="relative overflow-hidden cursor-pointer group"
                  style={{ width: vw(config.w), height: vw(670) }}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => {
                    if (index === 5) onNavigate?.("contact");
                    else {
                      // Extract slug from "/faq#faq-collaboration-consultation"
                      const link = item.buttonLink || "";
                      const slug = link.includes("#faq-") ? link.split("#faq-")[1] : item.id;
                      onNavigate?.("category", slug);
                    }
                  }}
                >
                  {/* Giant Letter */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                    transition={{
                      opacity: { duration: 0.8 },
                      scale: { duration: 0.8 },
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
                    }}
                    viewport={{ once: true }}
                    className="absolute select-none pointer-events-none leading-none z-0"
                    style={{
                      fontFamily: "var(--font-abhaya-libre), serif",
                      fontSize: vw(260),
                      color: "#000000",
                      left: vw(config.charX),
                      top: vw(config.charY),
                      width: vw(config.charW),
                      whiteSpace: "nowrap",
                      opacity: 0.8,
                    }}
                  >
                    {item.title}
                  </motion.span>

                  {/* Giant Circle Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    whileInView={{ opacity: 1, y: [0, -15, 0] }}
                    transition={{
                      opacity: { duration: 1 },
                      y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                    }}
                    viewport={{ once: true }}
                    className="absolute rounded-full overflow-hidden shadow-2xl transition-transform duration-1000 group-hover:scale-105 z-10"
                    style={{
                      width: vw(config.imgW),
                      height: vw(config.imgH),
                      left: vw(config.imgX),
                      top: vw(config.imgY),
                    }}
                  >
                    <OptimizedImage
                      image={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[0.2]"
                      size="medium"
                    />

                    {/* Hover Overlay */}
                    <AnimatePresence>
                      {hoverIndex === index && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center rounded-full pointer-events-none"
                        >
                          <div
                            className="absolute flex items-center justify-center text-center"
                            style={{
                              width: vw(config.w),
                              left: vw(-config.imgX),
                              padding: vw(20),
                            }}
                          >
                            <p
                              className="text-white font-medium italic break-words whitespace-normal"
                              style={{
                                fontSize: vw(24),
                                lineHeight: 1.2,
                                fontFamily: "var(--font-lexend-deca), sans-serif",
                                width: vw(220),
                              }}
                            >
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Vertical Stripe Line */}
                {index < data.items.length - 1 && index < 5 && (
                  <div
                    className="z-20"
                    style={{
                      width: vw(2),
                      height: vw(595),
                      backgroundColor: "#383417",
                      marginTop: vw(32),
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
