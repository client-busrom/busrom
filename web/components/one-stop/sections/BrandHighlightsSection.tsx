"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";

/**
 * Helper component to render rich titles with selective HollowText for bold parts
 */
const RichTitle = ({
  title,
  defaultText,
  strokeColor = "#756F3F",
}: {
  title?: string;
  defaultText: string;
  strokeColor?: string;
}) => {
  const html = title || defaultText;
  // Split by <b>...</b>, <br /> or \n
  const parts = html.split(/(<b>.*?<\/b>|<br \/>|\n)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("<b>")) {
          const content = part.replace(/<\/?b>/g, "");
          return (
            <HollowText key={i} strokeColor={strokeColor} strokeWidth={1.5}>
              {content}
            </HollowText>
          );
        }
        if (part === "<br />" || part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

interface BrandHighlightItem {
  id: string;
  image: any;
  title?: string;
  description: string;
  summary?: string;
}

interface BrandHighlightsSectionProps {
  items: BrandHighlightItem[];
  titleLine1?: string;
  titleLine1Html?: string;
  titleLine2?: string;
  titleLine2Html?: string;
}

export function BrandHighlightsSection({
  items,
  titleLine1 = "Brand",
  titleLine1Html,
  titleLine2 = "Highlights",
  titleLine2Html,
}: BrandHighlightsSectionProps) {
  const [[index, direction], setIndex] = useState([0, 0]);

  const total = items.length;
  const nextIndex = (index + 1) % total;
  const prevIndex = (index - 1 + total) % total;

  const handleNext = () => {
    setIndex([nextIndex, 1]);
  };

  const handlePrev = () => {
    setIndex([prevIndex, -1]);
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[index];
  const previewItem = items[nextIndex];

  return (
    <section className="relative w-full flex flex-col items-center justify-center py-[120px] md:h-[62.79vw] xl:h-auto">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        <motion.div
          animate={{
            y: [0, -120, 0],
            x: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[45%] top-[5%] w-[450px] h-[450px] rounded-full bg-[#E5E2D0] opacity-[0.4]"
        />
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, 80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute left-[10%] top-[50%] w-[200px] h-[200px] rounded-full bg-[#E5E2D0] opacity-[0.6]"
        />
      </div>

      {/* 1. DESKTOP/TABLET CONTENT (Visible on MD and above) */}
      <div className="hidden md:block relative w-full max-w-[80vw] mx-auto aspect-[1344/845] h-[55vw] xl:h-auto shrink-0 z-10">
        {/* 1. Section Title */}
        <div className="absolute left-[5.96%] top-[9.45%] flex flex-col">
          <h2
            className="text-[6.66vw] xl:text-[5vw] font-extrabold font-anaheim leading-none text-black"
          >
            <RichTitle
              title={titleLine1Html || titleLine1}
              defaultText="Brand"
            />
          </h2>
          {titleLine2 && (
            <h2
              className="text-[5vw] xl:text-[4vw] font-extrabold font-anaheim leading-tight text-black"
            >
              <RichTitle
                title={titleLine2Html || titleLine2}
                defaultText="Highlights"
              />
            </h2>
          )}
        </div>

        {/* 2. Main Description */}
        <div className="absolute left-[5.96%] top-[36%] w-[42.6%] min-h-[25%] lg:min-h-[12.4vw]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction === 1 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 1 ? -40 : 40 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="w-full"
            >
              <p
                className="text-[1.25vw] xl:text-[1vw] font-anaheim font-semibold leading-[1.6] text-black"
              >
                {currentItem.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. Navigation Buttons */}
        <div className="absolute left-[45%] top-[85%] flex gap-[0.5vw] z-30">
          {/* Prev */}
          <button
            onClick={handlePrev}
            className="w-[3.78vw] h-[3.78vw] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95 group"
          >
            <svg width="40%" height="40%" viewBox="0 0 23 40" fill="none">
              <path
                d="M21 2L2 20L21 38"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Next */}
          <button
            onClick={handleNext}
            className="w-[3.78vw] h-[3.78vw] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95 group"
          >
            <svg width="40%" height="40%" viewBox="0 0 23 40" fill="none">
              <path
                d="M2 2L21 20L2 38"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 4. Large Main Image (Right Side) */}
        <div className="absolute left-[63%] top-[22%] w-[34.5%] h-[70%] z-10 pointer-events-none">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction === 1 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 1 ? -100 : 100 }}
              transition={{
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="w-full h-full rounded-[2vw] xl:rounded-[34.2px] overflow-hidden shadow-2xl"
            >
              <OptimizedImage
                image={currentItem.image}
                alt="Highlight Main"
                className="w-full h-full object-cover"
                size="large"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 5. Thumbnail Preview Group (Bottom Left) */}
        <div className="absolute left-[5.96%] top-[60%] w-[14.7%] flex flex-col z-20">
          {/* Thumbnail Image */}
          <div className="w-full aspect-[282/375] rounded-[1.5vw] xl:rounded-[22.8px] overflow-hidden shadow-xl">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={nextIndex}
                initial={{ opacity: 0, x: direction === 1 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? -30 : 30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full h-full rounded-[1.5vw] xl:rounded-[22.8px] overflow-hidden"
              >
                <OptimizedImage
                  image={items[nextIndex].image}
                  alt="Next Preview"
                  className="w-full h-full object-cover"
                  size="medium"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Text Preview (Title) */}
          <div className="mt-4 flex justify-center w-full">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.p
                key={nextIndex}
                initial={{ opacity: 0, x: direction === 1 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? -20 : 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-[92%] text-[1vw] font-[600] leading-[1.3] text-[#626262] line-clamp-2 text-center"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {items[nextIndex].title || items[nextIndex].description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-6 w-full flex flex-col gap-6 mt-12">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-black leading-tight">
            <RichTitle
              title={titleLine1Html || titleLine1}
              defaultText="Brand"
            />
          </h2>
          {titleLine2 && (
            <h2 className="text-4xl font-bold text-black leading-tight">
              <RichTitle
                title={titleLine2Html || titleLine2}
                defaultText="Highlights"
              />
            </h2>
          )}
        </div>
        <div className="min-h-[100px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={index}
              initial={{ opacity: 0, x: direction === 1 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 1 ? -20 : 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-base text-gray-700 leading-relaxed font-semibold"
            >
              {currentItem.description}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="relative w-full max-w-[320px] mx-auto aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction === 1 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 1 ? -50 : 50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full"
            >
              <OptimizedImage
                image={currentItem.image}
                alt="Mobile Main"
                className="w-full h-full object-cover"
                size="large"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Centered Buttons */}
        <div className="flex justify-center items-center gap-8 pt-4">
          <button
            onClick={handlePrev}
            className="w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] active:bg-[#756F3F] active:text-white transition-all shadow-sm"
          >
            <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
              <path
                d="M8 2L2 8L8 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] active:bg-[#756F3F] active:text-white transition-all shadow-sm"
          >
            <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
              <path
                d="M2 2L8 8L2 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
