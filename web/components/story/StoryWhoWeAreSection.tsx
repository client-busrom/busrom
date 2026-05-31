"use client";

import React from "react";
import { useParams } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
    title?: string; // Potential fallback from CMS
    content: string;
    description: string;
    bgImage: any;
  };
}

// Reusable Title Node Renderer to avoid duplication and hardcoding
function TitleNodes({ nodes, isMobile }: { nodes: LexicalTextNode[] | null; isMobile: boolean }) {
  if (!nodes || nodes.length === 0) return null;
  
  return (
    <>
      {nodes.map((node, idx) => {
        if (node.type === "linebreak") return <br key={idx} />;
        const isBold = node.format === 1;
        const filterId = isMobile ? "url(#true-outline-mobile)" : "url(#true-outline)";
        
        return (
          <span
            key={idx}
            className="leading-none transition-all duration-300 font-josefin-sans font-semibold"
            style={{
              fontSize: isMobile 
                ? (isBold ? "min(12vw, 80px)" : "min(8vw, 60px)")
                : (isBold ? vw(110) : vw(80)),
              color: "white",
              filter: isBold ? filterId : "none",
              textShadow: !isBold
                ? (isMobile ? "0 4px 10px rgba(0,0,0,0.3)" : `0 ${vw(4)} ${vw(11)} #565020`)
                : "none",
            }}
          >
            {node.text}
          </span>
        );
      })}
    </>
  );
}

export function StoryWhoWeAreSection({ data }: StoryWhoWeAreSectionProps) {
  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileHook = useIsMobile();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isTabletOrMobile = isMobileHook || (windowWidth > 0 && windowWidth <= 1024);

  if (isTabletOrMobile) {
    return (
      <section className="relative w-full bg-[#57522a] py-[80px] sm:py-[120px] px-6 sm:px-12 overflow-hidden">
        {/* Background Image (Shared) */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            image={data.bgImage}
            alt="Who We Are Background"
            size="xlarge"
            className="absolute inset-0 w-full h-full object-cover opacity-33 blur-[8px]"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* SVG Filter for Bold Title Outline (Shared) */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="true-outline-mobile" x="-20%" y="-20%" width="140%" height="140%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="dilated" />
              <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outline" />
              <feFlood floodColor="white" result="white" />
              <feComposite in="white" in2="outline" operator="in" />
            </filter>
          </defs>
        </svg>

        <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row items-start gap-12 md:gap-20">
          
          {/* Left Block: Title & Description Box */}
          <div className="w-full md:w-[45%] flex flex-col gap-8">
            {/* Title */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-baseline gap-4 font-josefin-sans"
            >
              <TitleNodes nodes={data.titleNodes} isMobile={true} />
            </motion.div>

            {/* Description Box (ehr0Q) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative w-full p-8 sm:p-12 rounded-[40px] border border-[#ffec51] bg-[#3a20008c] shadow-[0_0_12px_#ffbf51]"
            >
              {/* Star Decoration with Animation */}
              <motion.div 
                className="absolute top-[-20px] right-[-20px] w-12 h-12 text-[#ffec51]"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg viewBox="0 0 1000 1000" fill="currentColor">
                  <path d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z" />
                </svg>
              </motion.div>

              {/* Description Text */}
              <div className="font-josefin-sans font-medium text-xl sm:text-2xl text-[#ffec51] leading-relaxed text-shadow-sm">
                {data.description}
              </div>
            </motion.div>
          </div>

          {/* Right Block: Content */}
          <div className="w-full md:w-[55%] pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="font-josefin-sans text-lg sm:text-xl text-white leading-relaxed text-shadow-sm"
            >
              {data.content}
            </motion.div>
          </div>

        </div>
      </section>
    );
  }

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

      <div className="relative z-10 w-full h-full">
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
          <TitleNodes nodes={data.titleNodes} isMobile={false} />
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

          {/* Star Top-Right (ROlZ0) with Animation */}
          <motion.div
            className="absolute"
            style={{
              top: vw(-16),
              right: vw(-16),
              width: vw(59),
              height: vw(59),
            }}
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, 8, -8, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
              <path
                d="M531.07202 33.408c-15.35998-44.544-39.93603-44.544-55.29602 0l-84.992 250.87999c-14.848 44.54401-64 93.18403-108.03202 108.54401l-249.34398 84.99201c-44.544 15.35998-44.544 39.936 0 55.29599l247.808 86.01599c44.54401 15.35998 93.18399 64.51202 108.54398 108.544l86.52801 251.39203c15.35999 44.54398 39.93607 44.54398 55.29606 0l84.47998-249.85602c14.84802-44.544 63.48797-93.18402 108.03198-108.544l252.92804-86.52802c44.54405-15.35998 44.54405-39.936 0-54.78399l-248.83203-83.96799c-44.54401-14.84799-93.18402-63.48801-108.54401-108.03201-1.53601-0.512-88.57599-253.95199-88.57599-253.95199z"
                fill="#ffec51"
              />
            </svg>
          </motion.div>

          {/* Description Text (iAWyA) */}
          <div
            className={`absolute flex flex-col text-left font-josefin-sans ${locale === "en" ? "justify-center" : "overflow-y-auto"}`}
            style={{
              left: vw(30),
              top: vw(31),
              width: vw(482),
              height: vw(157), // The fixed box height, roughly ~3.8 lines
              color: "#ffec51",
              fontSize: vw(32),
              lineHeight: 1.3,
              fontWeight: 500,
              textShadow: `0 ${vw(4)} ${vw(11)} #565020`,
              scrollbarWidth: locale === "en" ? "none" : "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
              paddingRight: locale === "en" ? 0 : "4px"
            }}
          >
            <span className={locale === "en" ? "" : "my-auto"}>{data.description}</span>
          </div>
        </motion.div>

        {/* 4. Content (u8cjx) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`absolute font-josefin-sans text-left ${locale === "en" ? "whitespace-pre-wrap" : "overflow-y-auto"}`}
          style={{
            left: vw(892),
            top: vw(180),
            maxWidth: vw(980), // Keep a safe boundary but allow wide lines
            fontSize: vw(28),
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.9)",
            textShadow: `0 ${vw(4)} ${vw(12)} rgba(0, 0, 0, 0.25)`,
            maxHeight: locale === "en" ? "none" : "14.6em", // 9 lines * 1.6 + breathing room
            scrollbarWidth: locale === "en" ? "none" : "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
            paddingRight: locale === "en" ? 0 : "8px"
          }}
        >
          {data.content}
        </motion.div>
      </div>
    </section>
  );
}
