"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { ProductOverviewData } from "@/types/product-overview";
import OptimizedImage from "../ui/OptimizedImage";

interface ProductOverviewHeroSectionProps {
  data: ProductOverviewData["hero"];
}

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

// Gallery layout positions exact pixels from design map to vw
const GALLERY_LAYOUT = [
  { left: vw(0), top: vw(630), width: vw(408), height: vw(499) },
  { left: vw(420), top: vw(630), width: vw(357), height: vw(438) },
  { left: vw(791), top: vw(736), width: vw(372), height: vw(370) },
  { left: vw(1173), top: vw(653), width: vw(476), height: vw(477) },
  { left: vw(1659), top: vw(601), width: vw(259), height: vw(502) },
];

/**
 * Resolve a random image from mainImage, gallery, or images array.
 * Skips showImage per user request.
 */
function resolveProductImage(item: any) {
  const mainPool = Array.isArray(item.mainImage)
    ? item.mainImage
    : item.mainImage
      ? [item.mainImage]
      : [];
  const galleryPool = item.gallery || [];
  const imagesPool = item.images
    ? item.images.map((img: any) => img.image || img)
    : [];

  const fullPool = [...mainPool, ...galleryPool, ...imagesPool];
  // Ensure we only select resolved objects with URLs, not string IDs
  const validPool = fullPool.filter(img => img && typeof img === 'object' && img.url);

  if (validPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * validPool.length);
    const selected = validPool[randomIndex];
    return selected.image || selected;
  }

  // Fallback to the first mainImage if available
  return Array.isArray(item.mainImage) && item.mainImage.length > 0 ? item.mainImage[0] : null;
}

// SVG viewBox dimensions and clipPath data for each mask
const MASK_SVGS = [
  "/product-overview/product-overview-svg-1.svg",
  "/product-overview/product-overview-svg-2.svg",
  "/product-overview/product-overview-svg-3.svg",
  "/product-overview/product-overview-svg-4.svg",
  "/product-overview/product-overview-svg-5.svg",
];

const MaskedImage = ({
  item,
  index,
  isCarousel = false,
}: {
  item: any;
  index: number;
  isCarousel?: boolean;
}) => {
  const resolvedImage = useMemo(() => resolveProductImage(item), [item]);
  if (!resolvedImage) return null;

  const maskSvg = MASK_SVGS[index % 5];

  const Content = (
    <div
      className="relative w-full h-full"
      style={{
        maskImage: `url(${maskSvg})`,
        WebkitMaskImage: `url(${maskSvg})`,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    >
      <div className="w-full h-full transition-transform duration-1000 group-hover:scale-110">
        <OptimizedImage
          image={resolvedImage}
          alt={item.title || "Product"}
          size="medium"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "group pointer-events-auto",
        isCarousel ? "relative flex-shrink-0" : "absolute z-20"
      )}
      style={!isCarousel ? {
        left: GALLERY_LAYOUT[index % 5].left,
        top: GALLERY_LAYOUT[index % 5].top,
        width: GALLERY_LAYOUT[index % 5].width,
        height: GALLERY_LAYOUT[index % 5].height,
      } : {
        width: GALLERY_LAYOUT[index % 5].width,
        height: GALLERY_LAYOUT[index % 5].height,
        marginRight: vw(13)
      }}
    >
      {item.href ? (
        <Link href={item.href} className="block w-full h-full">
          {Content}
        </Link>
      ) : (
        Content
      )}
    </div>
  );
};

export function ProductOverviewHeroSection({
  data,
}: ProductOverviewHeroSectionProps) {
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // 桌面端轮播初始化
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps"
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, playOnInit: true })]
  );

  const steps = useMemo(() => {
    const fmt = (list: string[]) => ({
      titleL: list[0] || "",
      titleM: list[1] || "",
      desc: list[2] || "",
    });
    return [fmt(data.content1), fmt(data.content2), fmt(data.content3)];
  }, [data]);

  useEffect(() => {
    if (data.productItems.length > 0) {
      // 不再随机打乱，直接使用全部
      setSelectedItems(data.productItems);
    }
  }, [data.productItems]);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => (prev + 1) % 3);
  };

  const cur = steps[step];

  return (
    <section
      className="relative w-full flex flex-col items-center overflow-hidden select-none z-[20]"
      style={{
        height: "auto",
        minHeight: "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* Background Layers */}
      <div className="absolute top-0 left-0 w-full bg-[#FFFCE2] -z-10 block md:hidden h-full" />
      <div className="absolute top-0 left-0 w-full bg-[#FFFCE2] -z-10 hidden md:block" style={{ height: vw(968) }} />

      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:flex flex-col items-center w-full relative"
        style={{ height: vw(1154), minHeight: vw(1154), paddingTop: vw(128) }}
      >
        {/* Floating Icons - Desktop Only */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(84), left: vw(180), width: vw(70), height: vw(70) }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <img
            src="/product-overview/icon-1.svg"
            alt=""
            className="w-full h-full"
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(84), right: vw(180), width: vw(70), height: vw(70) }}
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <img
            src="/product-overview/icon-2.svg"
            alt=""
            className="w-full h-full"
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(309), left: vw(300), width: vw(70), height: vw(70) }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/product-overview/icon-3.svg"
            alt=""
            className="w-full h-full"
          />
        </motion.div>
        <motion.button
          onClick={handleCtaClick}
          className="absolute group z-50 flex items-center justify-center rounded-full border border-[#756F3F] transition-all duration-300 hover:bg-[#756F3F]"
          style={{ top: vw(309), right: vw(300), width: vw(70), height: vw(70) }}
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon
            icon="maki:arrow"
            className="transition-colors duration-300 rotate-[135deg] text-[#756F3F] group-hover:text-[#F6F4ED]"
            style={{ width: vw(32), height: vw(32) }}
          />
        </motion.button>

        {/* Text Content Area - Desktop */}
        <div className="z-10 relative flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <h1
                className="font-bagel-fat-one text-[#464010] leading-none tracking-tight"
                style={{ fontSize: vw(96), marginBottom: vw(40) }}
              >
                {cur.titleL}
              </h1>

              <div
                className="flex items-center w-full"
                style={{ gap: vw(40), marginBottom: vw(60) }}
              >
                <div className="h-[1px] flex-1 bg-[#BAB377]/40" style={{ transform: `translateY(${vw(-10)})` }} />
                <h2
                  className="font-bagel-fat-one text-[#464010] whitespace-nowrap leading-none"
                  style={{ fontSize: vw(60) }}
                >
                  {cur.titleM}
                </h2>
                <div className="h-[1px] flex-1 bg-[#BAB377]/40" style={{ transform: `translateY(${vw(-10)})` }} />
              </div>

              <p
                className="font-anaheim text-[#464010] leading-snug whitespace-pre-line text-center"
                style={{ fontSize: vw(36), maxWidth: vw(1000), marginBottom: vw(30) }}
              >
                {cur.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Link - Desktop */}
          <div className="relative">
            <motion.div
              whileHover={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            >
              <Link
                href={data.cta.url}
                target={data.cta.openInNewTab ? "_blank" : undefined}
                className="group relative inline-flex items-center rounded-full border-[1.5px] border-[#756F3F] transition-all duration-500 hover:bg-[#756F3F]"
                style={{ padding: `${vw(0)} ${vw(0)} ${vw(0)} ${vw(21)}`, gap: vw(10) }}
              >
                <span
                  className="text-[#756F3F] font-josefin-sans font-medium tracking-wider transition-colors duration-500 group-hover:text-white"
                  style={{ fontSize: vw(29) }}
                >
                  {data.cta.title}
                </span>
                <svg
                  style={{ width: vw(76), height: vw(76), flexShrink: 0 }}
                  viewBox="-6 -6 94 94"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.9353 5.88882C35.8602 -5.38303 59.5289 0.0103798 70.8008 17.9353C82.0727 35.8602 76.6794 59.5289 58.7544 70.8008C40.8294 82.0727 17.1607 76.6794 5.88882 58.7544C-5.38299 40.8294 0.0102997 17.1607 17.9353 5.88882ZM49.4602 27.6917L49.4269 27.6881L34.4336 26.4551C33.4521 26.3745 32.5921 27.1049 32.5123 28.0866L32.5097 28.116C32.4469 29.0854 33.1734 29.931 34.1451 30.0111L45.135 30.9148L26.7966 46.4845C26.1703 47.0162 26.0937 47.9561 26.6259 48.583L26.761 48.742C27.2961 49.3514 28.2225 49.4211 28.8425 48.8948L47.1819 33.3253L46.291 44.3161C46.2114 45.2978 46.9424 46.1589 47.9239 46.2397C48.9056 46.3205 49.7664 45.5902 49.8461 44.6084L51.0618 29.6121L51.064 29.5806C51.0706 29.4754 51.0677 29.3698 51.0557 29.2652L51.0528 29.2385L51.0527 29.2434C51.031 28.9264 50.9081 28.6243 50.702 28.3823L50.5835 28.2431L50.5685 28.2257C50.3695 27.998 50.106 27.8358 49.8127 27.762L49.8004 27.7592C49.6895 27.7256 49.5755 27.7033 49.4602 27.6917Z"
                    fill="#756F3F"
                    className="transition-colors duration-500 group-hover:fill-white"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Gallery Area - Desktop (Refactored to Carousel) */}
        <div
          className="absolute inset-x-0 bottom-0 w-full pointer-events-auto"
          style={{ height: vw(620) }}
        >
          <div className=" h-full" ref={emblaRef} style={{ willChange: 'transform' }}>
            <div className="flex h-full items-end pb-[vw(40)]">
              {selectedItems.map((item, idx) => (
                <MaskedImage
                  key={item.id || idx}
                  item={item}
                  index={idx}
                  isCarousel={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ==================== 2. Mobile Layout (< md) ==================== */}
      <div className="md:hidden w-full flex flex-col items-center px-6 pt-24 pb-20 overflow-hidden relative">
        {/* Floating Icons - Mobile version (simpler) */}
        <div className="absolute top-14 left-4 w-10 h-10 opacity-60">
          <img
            src="/product-overview/icon-1.svg"
            alt=""
            className="w-full h-full"
          />
        </div>

        {/* Text Content - Mobile */}
        <div className="flex flex-col items-center text-center z-10 w-full mb-12">
          <motion.h1
            key={`m-t1-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bagel-fat-one text-[#464010] text-4xl mb-2"
          >
            {cur.titleL}
          </motion.h1>

          <motion.div
            key={`m-t2-${step}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center w-full gap-3 mb-4"
          >
            <div className="h-[1px] flex-1 bg-[#BAB377]/40" />
            <h2 className="font-bagel-fat-one text-[#464010] text-xl whitespace-nowrap">
              {cur.titleM}
            </h2>
            <div className="h-[1px] flex-1 bg-[#BAB377]/40" />
          </motion.div>

          <motion.p
            key={`m-d-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-amiri text-[#464010] text-lg leading-snug px-4"
          >
            {cur.desc}
          </motion.p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href={data.cta.url}
              target={data.cta.openInNewTab ? "_blank" : undefined}
              rel={data.cta.openInNewTab ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#756F3F] text-white rounded-full font-josefin-sans text-xl font-medium tracking-wider shadow-lg active:scale-95 transition-transform"
            >
              {data.cta.title}
            </Link>

            {/* Switcher Icon - Mobile (Next to CTA) */}
            <motion.button
              onClick={handleCtaClick}
              className="flex items-center justify-center rounded-full border border-[#756F3F] transition-all duration-300 active:bg-[#756F3F] active:scale-90 flex-shrink-0"
              style={{ width: 44, height: 44 }}
            >
              <Icon
                icon="maki:arrow"
                className="transition-colors duration-300 rotate-[135deg] text-[#756F3F] active:text-[#F6F4ED]"
                style={{ width: 20, height: 20 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Gallery Carousel - Mobile (Horizontal Snap) */}
        <div className="w-full mt-4">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-10 pb-10"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none"
            }}
          >
            {selectedItems.map((item, idx) => {
              const resolved = resolveProductImage(item);
              if (!resolved) return null;
              return (
                <motion.div
                  key={`m-img-${item.id || idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[80vw] md:w-[400px] aspect-[4/5] relative snap-center"
                >
                  <div className="w-full h-full rounded-[40px] overflow-hidden shadow-lg border-4 border-white">
                    <OptimizedImage
                      image={resolved}
                      alt={item.title || "Product"}
                      className="w-full h-full object-cover"
                      size="medium"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
