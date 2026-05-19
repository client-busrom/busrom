"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatedLinkButton } from "@/components/ui/animated-link-button";

// Viewport width conversion utility based on 1920px design width
const vw = (px: number) => `${(px / 1920) * 100}vw`;

interface HighlightProduct {
  id: string;
  image: any;
  title?: string;
  link?: string;
}

interface HighlightShowcaseSectionProps {
  title?: string;
  titleHtml?: string;
  products: HighlightProduct[];
  locale: string;
  viewMoreText?: string;
  viewMoreLink?: string;
}

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

export function HighlightShowcaseSection({
  title,
  titleHtml,
  products,
  locale,
  viewMoreText,
  viewMoreLink,
}: HighlightShowcaseSectionProps) {
  // Use Embla for the slider effect as the width exceeds the 1860 container in JSON
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [mobileIndex, setMobileIndex] = useState(0);
  const [layout, setLayout] = useState({
    width: 300,
    gap: 16,
    cardH: 200,
  });

  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!mobileEmblaApi) return;
    setMobileIndex(mobileEmblaApi.selectedScrollSnap());
  }, [mobileEmblaApi]);

  useEffect(() => {
    if (!mobileEmblaApi) return;
    onSelect();
    mobileEmblaApi.on("select", onSelect);
    mobileEmblaApi.on("reInit", onSelect);
  }, [mobileEmblaApi, onSelect]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1024) {
        if (w < 640) {
          setLayout({
            width: w * 0.82,
            gap: 16,
            cardH: (w * 0.82) * 0.625, // 16:10 ratio
          });
        } else {
          setLayout({
            width: w * 0.55,
            gap: 24,
            cardH: (w * 0.55) * 0.625,
          });
        }
      }
      if (mobileEmblaApi) mobileEmblaApi.reInit();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileEmblaApi]);

  return (
    <section className="relative w-full bg-transparent py-20 lg:py-0 lg:h-[vw(1120)] overflow-hidden flex flex-col items-center justify-center">
      {/* 1. MOBILE VIEW: Horizontal Card Carousel - Visible below lg */}
      <div className="lg:hidden w-full flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col gap-4 px-6">
          <h2 className="font-anaheim font-bold text-[#756F3F] text-xl md:text-5xl tracking-wider">
            <RichTitle
              title={titleHtml || title}
              defaultText="Highlight Showcase"
            />
          </h2>
          <div className="h-1 w-20 bg-[#C7BB5D]" />
        </div>

        {/* Embla Carousel Viewport */}
        <div className="relative w-full py-4" ref={mobileEmblaRef}>
          <div className="flex relative items-stretch">
            {products.map((item, index) => {
              const isActive = index === mobileIndex;
              return (
                <motion.div
                  key={`${item.id}-${index}`}
                  animate={{
                    scale: isActive ? 1 : 0.95,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.4 }}
                  className="flex-shrink-0 relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-black/5"
                  style={{
                    width: layout.width,
                    height: layout.cardH,
                    marginRight: layout.gap,
                  }}
                >
                  <Link href={item.link || "#"} className="relative w-full h-full block group">
                    {/* The Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <OptimizedImage
                        image={item.image}
                        alt={item.title || ""}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        size="large"
                      />
                    </div>
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent z-10" />

                    {/* Overlay Content */}
                    <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex justify-between items-end">
                      <h4 className="text-white font-extrabold text-[16px] sm:text-[18px] font-anaheim uppercase max-w-[75%] drop-shadow-md leading-snug">
                        {item.title}
                      </h4>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 transition-all group-hover:bg-[#C7BB5D] group-hover:border-transparent group-hover:scale-105 active:scale-95 shrink-0">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="text-white"
                          strokeWidth="2.5"
                        >
                          <path d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pagination Indicator Dots */}
        <div className="flex justify-center gap-2 mt-1">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => mobileEmblaApi && mobileEmblaApi.scrollTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === mobileIndex ? "w-6 bg-[#C7BB5D]" : "w-2 bg-[#756F3F]/30"
              }`}
            />
          ))}
        </div>

        {/* Mobile View More */}
        <div className="mt-4 flex justify-center">
          <Link
            href={viewMoreLink || `/${locale}/shop`}
            className="flex items-center gap-4"
          >
            <AnimatedLinkButton
              variant="light"
              className="text-[#756F3F]"
              ballColor="#ECE8D8"
              style={{
                fontSize: "16px",
                height: "44px",
                paddingLeft: "24px",
                paddingRight: "16px",
              }}
            >
              {viewMoreText || "VIEW MORE"}
            </AnimatedLinkButton>
          </Link>
        </div>
      </div>

      {/* 2. DESKTOP VIEW: High-Fidelity 3D Carousel - Visible only on lg */}
      <div
        className="hidden lg:block relative"
        style={{
          width: vw(1860),
          height: vw(860),
          borderRadius: vw(30),
          overflow: "visible", // Changed to visible for shadow/glow overflow
          background: "linear-gradient(180deg, #756F3F 0%, #C0B985 100%)",
          zIndex: 0,
        }}
      >
        {/* Section Title */}
        <div
          className="absolute flex justify-center w-full"
          style={{ top: vw(100) }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-bold text-[#FFFED7]"
            style={{
              fontSize: vw(64),
              width: vw(1193),
              fontFamily: "var(--font-anaheim)",
              lineHeight: vw(102),
            }}
          >
            <RichTitle
              title={titleHtml || title}
              defaultText="You Might Be Looking For..."
              strokeColor="#FFFED7"
            />
          </motion.h2>
        </div>

        {/* View More Button (Group 186) */}
        <Link
          href={viewMoreLink || `/${locale}/shop`}
          className="absolute z-20 flex items-center group"
          style={{ top: vw(160), right: vw(160), gap: vw(15) }}
        >
          <AnimatedLinkButton
            variant="dark"
            className="text-white"
            ballColor="#ABA465"
          >
            {viewMoreText || "VIEW MORE"}
          </AnimatedLinkButton>
          <div
            className="relative transition-transform duration-300 group-hover:translate-x-2"
            style={{ width: vw(32), height: vw(26) }}
          >
            <Image
              src="/images/service-icons/view-more-arrow.svg"
              alt="View More"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
        </Link>

        {/* Cards Area (Slider Layout) */}
        <div
          className="absolute w-full"
          style={{ top: vw(280), height: vw(676) }}
          ref={emblaRef}
        >
          <div className="flex justify-center" style={{ gap: 0 }}>
            {products.map((item, index) => {
              const isStraight = index % 2 !== 0;
              const rotation = !isStraight ? (index === 0 ? -4.38 : 4.38) : 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50, rotate: rotation }}
                  whileInView={{ opacity: 1, y: 0, rotate: rotation }}
                  whileHover={{
                    y: vw(-80),
                    rotate: 0,
                    zIndex: 100,
                    transition: { type: "spring", stiffness: 260, damping: 20 },
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="flex-shrink-0 relative group"
                  style={{
                    width: vw(525),
                    height: isStraight ? vw(676) : vw(656),
                    marginTop: isStraight ? "0px" : vw(90),
                    marginLeft: index === 0 ? 0 : vw(-80),
                    zIndex: index === 1 ? 30 : index === 0 ? 10 : 20,
                  }}
                >
                  {/* Glow Effects */}
                  <div className="absolute inset-[5%] bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-[60px] translate-y-32 pointer-events-none group-hover:scale-[1.2] z-0 rounded-[vw(30)]" />

                  <Link
                    href={item.link || "#"}
                    className="block w-full h-full relative z-10"
                  >
                    <div
                      className="absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 group-hover:scale-[1.04]"
                      style={{ borderRadius: vw(30) }}
                    >
                      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                        <OptimizedImage
                          image={item.image}
                          alt={item.title || ""}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                          size="large"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                        <h4
                          className="text-white font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,1)] font-anaheim uppercase text-center"
                          style={{ fontSize: vw(32), lineHeight: 1.2 }}
                        >
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
