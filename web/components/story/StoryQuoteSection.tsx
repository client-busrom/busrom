"use client";

import React, { useState, useEffect } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface QuoteSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
  openInNewTab: boolean;
  image: any;
}

interface StoryQuoteSectionProps {
  data: {
    slides: QuoteSlide[];
    autoplay: boolean;
    interval: number;
  };
}

export function StoryQuoteSection({ data }: StoryQuoteSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const slides = data.slides || [];
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data.autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, data.interval * 1000);

    return () => clearInterval(timer);
  }, [data.autoplay, data.interval, slides.length, activeIndex]);

  if (slides.length === 0) return null;

  const isMobile = windowWidth > 0 && windowWidth < 768;

  if (isMobile) {
    return (
      <section className="relative w-full bg-[#f2efd8] py-16 px-6 flex flex-col items-center">
        {/* Mobile Navigation (Tabs) */}
        <div className="w-full flex flex-wrap justify-center gap-3 mb-10">
          {slides.map((slide, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 font-josefin-sans text-sm ${
                  isActive 
                    ? "bg-[#756f3f] text-white border-transparent" 
                    : "bg-transparent text-[#756f3f] border-[#756f3f]"
                }`}
              >
                {slide.title}
              </button>
            );
          })}
        </div>

        {/* Mobile Image */}
        <div className="w-full max-w-[400px] aspect-[2/3] mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full rounded-2xl overflow-hidden shadow-xl"
            >
              <OptimizedImage
                image={activeSlide?.image}
                alt={activeSlide?.title}
                size="medium"
                className="object-cover w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Content */}
        <div className="w-full flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <h2 className="font-josefin-sans font-bold text-[#574f0e] text-3xl mb-6">
                {activeSlide?.title}
              </h2>
              <p className="font-josefin-sans font-medium text-[#574f0e]/80 text-lg leading-relaxed whitespace-pre-line mb-10">
                {activeSlide?.description}
              </p>

              {activeSlide?.showButton && activeSlide?.buttonText && (
                <a
                  href={activeSlide.buttonLink || "#"}
                  target={activeSlide.openInNewTab ? "_blank" : undefined}
                  rel={activeSlide.openInNewTab ? "noopener noreferrer" : undefined}
                  className="group/quote-btn block w-full max-w-[320px]"
                >
                  <div className="relative flex items-center justify-between bg-transparent group-hover/quote-btn:bg-[#756f3f] border border-[#756f3f] rounded-full py-2 pl-6 pr-2 transition-all duration-300">
                    <span className="font-josefin-sans text-xl font-medium text-[#565020] group-hover/quote-btn:text-white transition-colors duration-300">
                      {activeSlide.buttonText}
                    </span>
                    <div className="bg-[#756f3f] group-hover/quote-btn:bg-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white group-hover/quote-btn:text-[#756f3f]">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full bg-[#f2efd8] overflow-hidden"
      style={{ height: vw(922) }}
    >
      <div className="relative z-10 w-full h-full  flex items-center">
        <div
          className="w-[40%] flex flex-col justify-center"
          style={{ paddingLeft: vw(124) }}
        >
          <div className="flex flex-col items-start" style={{ gap: vw(24) }}>
            {slides.map((slide, idx) => {
              const isActive = activeIndex === idx;
              return (
                <motion.button
                  key={idx}
                  layout
                  onClick={() => setActiveIndex(idx)}
                  className="flex items-center justify-center relative transition-all duration-500 overflow-hidden"
                  style={{
                    width: isActive ? vw(640) : vw(540),
                    height: isActive ? vw(136) : vw(86),
                    borderRadius: vw(20),
                    backgroundColor: isActive ? "#756f3f" : "transparent",
                    border: isActive ? "none" : `${vw(2)} solid #756f3f`,
                    marginLeft: isActive ? 0 : vw(40),
                    cursor: "pointer",
                    paddingLeft: vw(30),
                    paddingRight: vw(30),
                    paddingTop: vw(10),
                    paddingBottom: 0,
                  }}
                  initial={false}
                >
                  <motion.span
                    layout="position"
                    className="font-josefin-sans transition-colors duration-500 whitespace-normal line-clamp-2"
                    style={{
                      fontSize: isActive ? vw(48) : vw(32),
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#ffffff" : "#000000",
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    {slide.title}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Middle: Featured Image */}
        <div className="w-[30%] h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden shadow-2xl"
              style={{ width: vw(400), height: vw(600), borderRadius: vw(24) }}
            >
              <OptimizedImage
                image={activeSlide?.image}
                alt={activeSlide?.title}
                size="medium"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/5" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Content (Title, Description, Button) */}
        <div
          className="w-[35%] flex flex-col justify-center"
          style={{ paddingRight: vw(124), paddingLeft: vw(40) }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              <motion.h2
                className="font-josefin-sans font-bold text-[#574f0e]"
                style={{ fontSize: vw(64), lineHeight: 1.1 }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {activeSlide?.title}
              </motion.h2>
              <p
                className="font-josefin-sans font-medium text-[#574f0e]/80 mt-12 whitespace-pre-line"
                style={{ fontSize: vw(24), lineHeight: 1.6, maxWidth: vw(450) }}
              >
                {activeSlide?.description}
              </p>

              {activeSlide?.showButton && activeSlide?.buttonText && (
                <a
                  href={activeSlide.buttonLink || "#"}
                  target={activeSlide.openInNewTab ? "_blank" : undefined}
                  rel={
                    activeSlide.openInNewTab ? "noopener noreferrer" : undefined
                  }
                  className="group/quote-btn block"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.03, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center bg-transparent group-hover/quote-btn:bg-[#756f3f] border border-[#756f3f] transition-all duration-300"
                    style={{
                      width: vw(420),
                      minHeight: vw(96),
                      height: "auto",
                      borderRadius: vw(48),
                      marginTop: vw(50),
                      marginLeft: vw(-30),
                      paddingTop: vw(12),
                      paddingBottom: vw(12),
                      paddingLeft: vw(40),
                      paddingRight: vw(8),
                    }}
                  >
                    <span
                      className="font-josefin-sans text-[#565020] group-hover/quote-btn:text-white transition-colors duration-300 whitespace-normal leading-tight"
                      style={{
                        fontSize: vw(32),
                        fontWeight: 500,
                        textAlign: 'left',
                        lineHeight: 1.2,
                        flex: 1,
                      }}
                    >
                      {activeSlide.buttonText}
                    </span>

                    {/* Circle Arrow Icon at the Right Edge */}
                    <div
                      className="bg-[#756f3f] group-hover/quote-btn:bg-white rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{
                        width: vw(76),
                        height: vw(76),
                      }}
                    >
                      <svg
                        style={{ width: vw(28), height: vw(28) }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          stroke="currentColor"
                          className="text-white group-hover/quote-btn:text-[#756f3f] transition-colors duration-300"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div
        className="absolute w-full h-full bg-[#f2efd8]/30 z-0 bottom-0 translate-y-1/2 rounded-[50%]"
        style={{ height: vw(2000), width: vw(3000), left: vw(-500) }}
      />
    </section>
  );
}
