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
  };
  locale: string;
}

const EXIT_LINKS = [
  { id: "cta-1", label: "Explore Our Product Range" },
  { id: "cta-2", label: "Learn About Busrom Service" },
  { id: "cta-3", label: "Discover Busrom Brand" }
];

export function FaqQuoteSection({ data, locale }: FaqQuoteSectionProps) {
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

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#f6f4ed]"
      style={{ height: vw(922) }}
    >
      {/* Background Decorators (B-U-S-R-O-m Vectors) */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none flex justify-center"
        style={{ top: vw(23) }}
      >
         <div className="flex gap-[vw(100)]">
           {["B", "U", "S", "R", "O", "M"].map((letter, i) => (
             <HollowText
                key={i}
                strokeColor="#756f3f"
                strokeWidth={1}
                style={{ fontSize: vw(220), fontFamily: "var(--font-anaheim), sans-serif" }}
                className="font-black"
             >
               {letter}
             </HollowText>
           ))}
         </div>
      </div>

      {/* Top Banner Image */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-[vw(48)] rounded-[30px] overflow-hidden"
        style={{ width: vw(1737), height: vw(268) }}
      >
        <div className="absolute inset-0 bg-[#464010] opacity-30 z-10" />
        <OptimizedImage 
          image={data.image} 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto h-full flex items-center px-[vw(220)] pt-[vw(200)] gap-[vw(160)] relative z-10">
        {/* Left: Slogan Text */}
        <div className="flex flex-col w-[vw(737)]">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[#363105] mb-[vw(30)]"
            style={{ 
              fontSize: vw(78), 
              lineHeight: 1.08, 
              fontFamily: "var(--font-agbalumo), cursive" 
            }}
          >
            {getNodesText(data.title) || "Every Detail Is The Beginning Of Better Cooperation"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#797133] font-medium"
            style={{ 
              fontSize: vw(24), 
              lineHeight: 1.7, 
              fontFamily: "var(--font-agbalumo), cursive" 
            }}
          >
            {getNodesText(data.description) || "At Busrom, We Don't Just Solve Problems—We're Committed To Providing Long-Term, Reliable Support And Collaboration."}
          </motion.p>
        </div>

        {/* Right: Exit Navigation Buttons */}
        <div className="flex flex-col gap-[vw(40)] flex-1">
          {EXIT_LINKS.map((link, i) => (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center justify-between bg-[#756f3f] hover:bg-[#58542f] transition-all rounded-[44.5px] px-[vw(36)] relative group"
              style={{ width: vw(517), height: vw(89) }}
            >
              <span 
                className="text-white font-semibold"
                style={{ fontSize: vw(32), fontFamily: "var(--font-anaheim), sans-serif" }}
              >
                {link.label}
              </span>
              <div 
                className="bg-white rounded-full flex items-center justify-center transition-transform group-hover:rotate-[-12deg]"
                style={{ width: vw(50), height: vw(50) }}
              >
                <IconifyIcon name="lucide:arrow-up-right" color="#756f3f" size={24} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
