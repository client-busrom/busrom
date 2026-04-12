"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import Link from "next/link";
import Image from "next/image";
import { ProductOverviewData } from "@/types/product-overview";

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

  if (fullPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * fullPool.length);
    const selected = fullPool[randomIndex];
    return selected.image || selected;
  }

  return item.featuredImage || item.image || null;
}

const MaskedImage = ({
  item,
  index,
  config,
}: {
  item: any;
  index: number;
  config: any;
}) => {
  const resolvedImage = useMemo(() => resolveProductImage(item), [item]);
  const maskUrl = `/product-overview/product-overview-svg-${index + 1}.svg`;

  if (!resolvedImage) return null;

  const Content = (
    <>
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          WebkitMaskImage: `url(${maskUrl})`,
          maskImage: `url(${maskUrl})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <OptimizedImage
          image={resolvedImage}
          alt={item.title || "Product"}
          size="large"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 1, ease: "easeOut" }}
      className="absolute group pointer-events-auto z-20"
      style={{
        left: config.left,
        top: config.top,
        width: config.width,
        height: config.height,
      }}
    >
      {item.href ? (
        <Link href={item.href} className="block w-full h-full">
          {Content}
        </Link>
      ) : (
        Content
      )}
    </motion.div>
  );
};

export function ProductOverviewHeroSection({
  data,
}: ProductOverviewHeroSectionProps) {
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

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
      const shuffled = [...data.productItems].sort(() => Math.random() - 0.5);
      setSelectedItems(shuffled.slice(0, 5));
    }
  }, [data.productItems]);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => (prev + 1) % 3);
  };

  const cur = steps[step];

  return (
    <section
      className="relative w-full bg-[#FFFCE2] flex flex-col items-center overflow-visible select-none"
      style={{
        height: "auto",
        minHeight: "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* ==================== 1. Desktop Layout (>= md) ==================== */}
      <div
        className="hidden md:flex flex-col items-center w-full relative"
        style={{ height: vw(968), minHeight: vw(968), paddingTop: vw(128) }}
      >
        {/* Floating Icons - Desktop Only */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(84), left: vw(169), width: vw(70), height: vw(70) }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/product-overview/icon-1.svg"
            alt=""
            width={70}
            height={70}
            className="w-full h-full"
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(84), right: vw(104), width: vw(70), height: vw(70) }}
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/product-overview/icon-2.svg"
            alt=""
            width={70}
            height={70}
            className="w-full h-full"
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(309), left: vw(270), width: vw(70), height: vw(70) }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/product-overview/icon-3.svg"
            alt=""
            width={70}
            height={70}
            className="w-full h-full"
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none"
          style={{ top: vw(309), right: vw(202), width: vw(70), height: vw(70) }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/product-overview/icon-4.svg"
            alt=""
            width={70}
            height={70}
            className="w-full h-full"
          />
        </motion.div>

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
                style={{ fontSize: vw(96), marginBottom: vw(16) }}
              >
                {cur.titleL}
              </h1>

              <div
                className="flex items-center w-full"
                style={{ gap: vw(40), marginBottom: vw(32) }}
              >
                <div className="h-[1px] flex-1 bg-[#BAB377]/40" />
                <h2
                  className="font-bagel-fat-one text-[#464010] whitespace-nowrap leading-none"
                  style={{ fontSize: vw(60) }}
                >
                  {cur.titleM}
                </h2>
                <div className="h-[1px] flex-1 bg-[#BAB377]/40" />
              </div>

              <p
                className="font-anaheim text-[#464010]/80 leading-snug whitespace-pre-line text-center"
                style={{ fontSize: vw(36), maxWidth: vw(1000) }}
              >
                {cur.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Link - Desktop */}
          <div className="relative" style={{ marginTop: vw(56) }}>
            <Link
              href={data.cta.url}
              onClick={handleCtaClick}
              target={data.cta.openInNewTab ? "_blank" : undefined}
              className="group relative inline-flex items-center"
            >
              <svg
                style={{ width: vw(284), height: vw(92) }}
                className="group-hover:scale-105 transition-transform duration-500"
                viewBox="0 0 284 92"
                fill="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="282"
                  height="90"
                  rx="45"
                  fill="none"
                  stroke="#756F3F"
                  strokeWidth="1.5"
                />
                <g transform="translate(196.5, 7.5)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.9353 5.88882C35.8602 -5.38303 59.5289 0.0103798 70.8008 17.9353C82.0727 35.8602 76.6794 59.5289 58.7544 70.8008C40.8294 82.0727 17.1607 76.6794 5.88882 58.7544C-5.38299 40.8294 0.0102997 17.1607 17.9353 5.88882ZM49.4602 27.6917L49.4269 27.6881L34.4336 26.4551C33.4521 26.3745 32.5921 27.1049 32.5123 28.0866L32.5097 28.116C32.4469 29.0854 33.1734 29.931 34.1451 30.0111L45.135 30.9148L26.7966 46.4845C26.1703 47.0162 26.0937 47.9561 26.6259 48.583L26.761 48.742C27.2961 49.3514 28.2225 49.4211 28.8425 48.8948L47.1819 33.3253L46.291 44.3161C46.2114 45.2978 46.9424 46.1589 47.9239 46.2397C48.9056 46.3205 49.7664 45.5902 49.8461 44.6084L51.0618 29.6121L51.064 29.5806C51.0706 29.4754 51.0677 29.3698 51.0557 29.2652L51.0528 29.2385L51.0527 29.2434C51.031 28.9264 50.9081 28.6243 50.702 28.3823L50.5835 28.2431L50.5685 28.2257C50.3695 27.998 50.106 27.8358 49.8127 27.762L49.8004 27.7592C49.6895 27.7256 49.5755 27.7033 49.4602 27.6917Z"
                    fill="#756F3F"
                  />
                </g>
              </svg>
              <span
                className="absolute text-[#756F3F] font-josefin-sans font-medium tracking-wider"
                style={{ left: vw(30), fontSize: vw(29) }}
              >
                {data.cta.title}
              </span>
            </Link>
          </div>
        </div>

        {/* Gallery Area - Desktop */}
        <div className="absolute inset-x-0 top-0 w-full h-full pointer-events-none">
          <AnimatePresence>
            {selectedItems.map((item, idx) => (
              <MaskedImage
                key={item.id || idx}
                item={item}
                index={idx}
                config={GALLERY_LAYOUT[idx]}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== 2. Mobile Layout (< md) ==================== */}
      <div className="md:hidden w-full flex flex-col items-center px-6 pt-24 pb-20 overflow-hidden relative">
        {/* Floating Icons - Mobile version (simpler) */}
        <div className="absolute top-14 left-4 w-10 h-10 opacity-60">
          <Image
            src="/product-overview/icon-1.svg"
            alt=""
            width={40}
            height={40}
          />
        </div>
        <div className="absolute top-40 right-4 w-10 h-10 opacity-60">
          <Image
            src="/product-overview/icon-3.svg"
            alt=""
            width={40}
            height={40}
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
            className="font-anaheim text-[#464010]/80 text-lg leading-snug px-4"
          >
            {cur.desc}
          </motion.p>

          <div className="mt-8">
            <Link
              href={data.cta.url}
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#756F3F] text-white rounded-full font-josefin-sans text-xl font-medium tracking-wider shadow-lg active:scale-95 transition-transform"
            >
              {data.cta.title}
            </Link>
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
                  className="flex-shrink-0 w-[75vw] md:w-[400px] aspect-[4/5] relative snap-center"
                >
                  <div className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                    <OptimizedImage
                      image={resolved}
                      alt={item.title || "Product"}
                      className="w-full h-full object-cover"
                      size="large"
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
