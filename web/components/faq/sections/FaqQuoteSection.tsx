"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { HollowText } from "@/components/common/HollowText";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface FaqQuoteSectionProps {
  data: {
    image: any;
    title: any[];
    description: any[];
    iconList: any;
    decoratorText: string;
  };
  locale: string;
}

export function FaqQuoteSection({ data, locale }: FaqQuoteSectionProps) {
  const getNodesText = (nodes: any[] | undefined | null): string => {
    if (!nodes || !Array.isArray(nodes)) return "";
    return nodes
      .map((n: any) => {
        if (!n) return "";
        if (n.type === "text") return n.text || "";
        if (n.type === "linebreak") return "\n";
        if (n.children) return getNodesText(n.children);
        return "";
      })
      .join("");
  };

  const exitLinks = data.iconList?.items || [];
  const decoratorChars = (data.decoratorText || "BUSROM").split("");

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f4ed]"
      style={{ height: vw(922) }}
    >
      {/* Top Banner Image with Floating Decorators */}
      <div
        className="absolute left-0 overflow-hidden"
        style={{ width: vw(1737), height: vw(268), top: vw(48) }}
      >
        <OptimizedImage
          image={data.image}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-[#464010] opacity-30 z-10" />

        {/* Floating Background Decorators - Inside Image */}
        <div className="absolute inset-y-0 left-0 right-0 opacity-100 pointer-events-none flex justify-center items-center z-20 overflow-hidden">
          <div className="flex items-center">
            {decoratorChars.map((letter, i) => (
              <motion.div
                key={i}
                animate={{
                  y:
                    i % 2 === 0
                      ? [vw(-50), vw(50), vw(-50)]
                      : [vw(50), vw(-50), vw(50)],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="font-normal font-tenor-sans"
                style={{
                  fontSize: vw(280),
                  color: "#f6f4ed",
                  marginLeft: i === 0 ? 0 : vw(40),
                }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="container mx-auto h-full flex items-center relative z-10"
        style={{
          paddingLeft: vw(220),
          paddingRight: vw(220),
          paddingTop: vw(200),
          gap: vw(160),
        }}
      >
        {/* Left: Slogan Text */}
        <div
          className="flex flex-col"
          style={{ width: "fit-content", minWidth: vw(737) }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[#363105] whitespace-pre-line"
            style={{
              fontSize: vw(78),
              lineHeight: 1.08,
              fontFamily: "var(--font-agbalumo), cursive",
              marginBottom: vw(30),
            }}
          >
            {getNodesText(data.title) ||
              "Every Detail Is The\nBeginning Of Better\nCooperation"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#797133] font-medium whitespace-pre-line"
            style={{
              fontSize: vw(24),
              lineHeight: 1.7,
              fontFamily: "var(--font-agbalumo), cursive",
            }}
          >
            {getNodesText(data.description) ||
              "At Busrom, We Don't Just Solve Problems—We're Committed To Providing\nLong-Term, Reliable Support And Collaboration."}
          </motion.p>
        </div>

        {/* Right: Exit Navigation Buttons */}
        <div className="flex flex-col flex-1 items-end" style={{ gap: vw(36) }}>
          {exitLinks.map((link: any, i: number) => (
            <motion.a
              key={i}
              href={link.url || "#"}
              target={link.openInNewTab ? "_blank" : undefined}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center justify-between bg-[#756f3f] hover:bg-[#58542f] transition-all rounded-full relative group cursor-pointer"
              style={{
                width: vw(517),
                height: vw(89),
                paddingLeft: vw(48),
                paddingRight: vw(30),
              }}
            >
              <span
                className="text-white font-semibold"
                style={{
                  fontSize: vw(32),
                  fontFamily: "var(--font-anaheim), sans-serif",
                }}
              >
                {link.title || link.label}
              </span>
              <div
                className="bg-white rounded-full flex items-center justify-center transition-transform group-hover:rotate-[45deg] shrink-0"
                style={{
                  width: vw(72),
                  height: vw(72),
                  marginRight: vw(-20), // 让圆圈稍微更靠右一点，贴合边缘感
                }}
              >
                <IconifyIcon
                  name="lucide:arrow-up-right"
                  color="#756f3f"
                  size={vw(42)}
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
