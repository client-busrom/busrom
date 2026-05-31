"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { HollowText } from "@/components/common/HollowText";
import useEmblaCarousel from "embla-carousel-react";
import { useOverflow } from "@/lib/hooks/useOverflow";

// Sub-components for handling overflow
const ProductCardTitle = ({ title }: { title: string }) => {
  const { ref, isOverflow } = useOverflow<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="custom-scrollbar pointer-events-auto pr-0 mb-9 max-h-[calc(8.33vw+5px)] xl:max-h-[calc(3.5vw+5px)]"
      data-lenis-prevent={isOverflow ? true : undefined}
      style={{
        overflowY: isOverflow ? "auto" : "hidden",
        overflowX: "hidden",
        overscrollBehavior: isOverflow ? "contain" : "auto",
        paddingTop: "2px",
        paddingBottom: "2px",
      }}
    >
      <h3 className="text-[3.33vw] xl:text-[2.5vw] font-[800] text-[#6D5400] leading-tight font-anaheim break-words m-0">
        {title}
      </h3>
    </div>
  );
};

const ProductCardAttributes = ({ attributes }: { attributes: string[] }) => {
  const { ref, isOverflow } = useOverflow<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="custom-scrollbar pointer-events-auto pr-2 max-h-[calc(10vw+10px)] xl:max-h-[calc(8.5vw+10px)]"
      data-lenis-prevent={isOverflow ? true : undefined}
      style={{
        overflowY: isOverflow ? "auto" : "hidden",
        overflowX: "hidden",
        overscrollBehavior: isOverflow ? "contain" : "auto",
        paddingTop: "2px",
        paddingBottom: "2px",
      }}
    >
      <div className="flex flex-col gap-[0.83vw]">
        {attributes.slice(0, 4).map((attr, i) => (
          <div key={i} className="flex items-start gap-[0.83vw]">
            <div className="w-[1.87vw] h-[2vw] xl:w-[1.5vw] xl:h-[1.5vw] rounded-full bg-[#BCB263] flex items-center justify-center shrink-0 mt-[0.1em]">
              <svg width="50%" height="50%" viewBox="0 0 18 14" fill="none">
                <path
                  d="M1.5 7L6.5 12L16.5 2"
                  stroke="#f2e7c9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[1.25vw] xl:text-[1.04vw] font-semibold text-black font-anaheim leading-snug break-words m-0">
              {attr}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Product {
  id: string;
  name: string;
  slug: string;
  productAttributes?: string | string[];
  mainImage?: any[];
  showImage?: any;
  _carouselItem?: any;
}

interface ProductSeriesShowcaseSectionProps {
  title?: string;
  products: Product[];
  locale: string;
}

export function ProductSeriesShowcaseSection({
  title,
  products,
  locale,
}: ProductSeriesShowcaseSectionProps) {
  const { ref: desktopTitleRef, isOverflow: desktopTitleOverflows } = useOverflow<HTMLDivElement>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldPreload, setShouldPreload] = useState(false);

  useEffect(() => {
    // Delay preloading by 2s to not compete with critical initial page resources
    const timer = setTimeout(() => {
      setShouldPreload(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [layout, setLayout] = useState({
    type: "mobile",
    width: 320,
    gap: 16,
    cardH: 380,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1024) {
        if (w < 640) {
          setLayout({
            type: "mobile",
            width: w * 0.85,
            gap: 16,
            cardH: 420,
          });
        } else {
          setLayout({
            type: "tablet",
            width: w * 0.65,
            gap: 24,
            cardH: 560,
          });
        }
      } else {
        setLayout({ type: "desktop", width: 0, gap: 0, cardH: 0 });
      }
      if (emblaApi) emblaApi.reInit();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [emblaApi]);

  const validProducts = useMemo(() => {
    return products.filter((p) => p.name && p.slug);
  }, [products]);

  const activeProduct = validProducts[currentIndex];

  const displayedImages = useMemo(() => {
    if (!activeProduct) return [null, null];
    const mainImages = (activeProduct as any).mainImage || [];
    const showImgNode = (activeProduct as any).showImage;

    if (mainImages.length > 0) {
      const img1 = mainImages[0];
      const img2 =
        mainImages.length > 1 ? mainImages[1] : showImgNode || mainImages[0];
      return [img1, img2];
    }
    return [showImgNode, showImgNode];
  }, [activeProduct]);

  const attributes = useMemo(() => {
    if (!activeProduct) return [];
    const config = (activeProduct as any)._carouselItem;
    if (config && config.showHighlights === false) return [];

    if (
      Array.isArray(activeProduct.productAttributes) &&
      activeProduct.productAttributes.length > 0
    )
      return activeProduct.productAttributes;
    if (typeof activeProduct.productAttributes === "string") {
      return (activeProduct.productAttributes as string)
        .split("\n")
        .filter((line) => line.trim());
    }
    return [
      "Robust and stable",
      "Resistant to moisture",
      "Minimalist aesthetics",
      "Versatile and adaptable",
    ];
  }, [activeProduct]);

  const nextProduct = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    } else {
      setCurrentIndex((prev) => (prev + 1) % (validProducts.length || 1));
    }
  };

  const prevProduct = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    } else {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + (validProducts.length || 1)) % (validProducts.length || 1),
      );
    }
  };

  const getDisplayName = (product: Product = activeProduct) => {
    if (!product) return "";
    const item = (product as any)._carouselItem;
    const categoryName =
      (product as any).category?.name ||
      (product as any).categoryName ||
      "Category";
    const productName = product.name || "";

    if (item) {
      if (item.customName && item.customName.trim() !== "")
        return item.customName;
      if (item.showCategory === true || item.showName === false)
        return categoryName;
      if (item.showName === true) return productName;
    }
    return (product as any).title || productName;
  };

  if (validProducts.length === 0) return null;

  return (
    <section className="relative w-full bg-transparent flex flex-col items-center py-8 lg:py-[120px] lg:h-[36.4vw]">
      {/* 1. MOBILE VIEW */}
      <div className="lg:hidden w-full flex flex-col items-center gap-6">
        {/* Title */}
        <div className="w-full text-center px-6">
          <HollowText
            strokeColor="#846500"
            strokeWidth={1.5}
            className="block text-3xl sm:text-4xl md:text-5xl font-[900] leading-none pointer-events-none"
            style={{
              fontFamily: "var(--font-anaheim)",
            }}
          >
            {(title || "PRODUCT SERIES").replace(/\n/g, " ")}
          </HollowText>
        </div>

        {/* Carousel - Embla Implementation */}
        <div
          className="relative w-full py-4"
          ref={emblaRef}
        >
          <div className="flex relative items-stretch">
            {validProducts.map((item, idx) => {
              const isActive = idx === currentIndex;

              // Get display name
              const displayName = getDisplayName(item);

              // Get images
              const mainImages = (item as any).mainImage || [];
              const showImgNode = (item as any).showImage;
              let img1 = showImgNode;
              let img2 = showImgNode;
              if (mainImages.length > 0) {
                img1 = mainImages[0];
                img2 = mainImages.length > 1 ? mainImages[1] : showImgNode || mainImages[0];
              }

              // Get attributes
              const config = (item as any)._carouselItem;
              let itemAttributes: string[] = [];
              if (!(config && config.showHighlights === false)) {
                if (Array.isArray(item.productAttributes) && item.productAttributes.length > 0) {
                  itemAttributes = item.productAttributes;
                } else if (typeof item.productAttributes === "string") {
                  itemAttributes = (item.productAttributes as string)
                    .split("\n")
                    .filter((line) => line.trim());
                } else {
                  itemAttributes = [
                    "Robust And Stable",
                    "Resistant To Moisture",
                    "Minimalist Aesthetics",
                    "Versatile And Adaptable",
                  ];
                }
              }

              return (
                <motion.div
                  key={`${item.id}-${idx}`}
                  animate={{
                    scale: isActive ? 1 : 0.95,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#F1E8CA] flex-shrink-0 relative overflow-hidden flex flex-col rounded-[24px] p-6 shadow-xl"
                  style={{
                    width: layout.width,
                    height: layout.cardH,
                    marginRight: layout.gap,
                  }}
                >
                  {/* Two Images Side by Side */}
                  <div className="grid grid-cols-2 gap-3 w-full aspect-[16/10] md:aspect-[16/8] rounded-[16px] overflow-hidden shrink-0 bg-[#F6F4ED]/50">
                    <div className="w-full h-full relative">
                      <OptimizedImage
                        image={img1}
                        alt="Feature 1"
                        className="w-full h-full object-cover"
                        size="medium"
                      />
                    </div>
                    <div className="w-full h-full relative">
                      <OptimizedImage
                        image={img2}
                        alt="Feature 2"
                        className="w-full h-full object-cover"
                        size="medium"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#6D5400] font-anaheim leading-tight mt-4 mb-3">
                    {displayName}
                  </h3>

                  {/* Highlights (Compact lists) */}
                  <div className="flex flex-col gap-1.5 md:gap-2 shrink-0">
                    {itemAttributes.slice(0, 4).map((attr, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#A5A075] flex items-center justify-center shrink-0">
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 18 14"
                            fill="none"
                          >
                            <path
                              d="M1.5 7L6.5 12L16.5 2"
                              stroke="white"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-black font-anaheim leading-none truncate">
                          {attr}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Link Button */}
                  <div className="mt-auto self-end">
                    <Link
                      href={`/${locale}/shop/${item.slug}`}
                      className="flex items-center gap-2 group/see"
                    >
                      <span className="text-[15px] font-bold text-[#756F3F] font-anaheim">
                        {item._carouselItem?.buttonText || "SEE ALL"}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-[#756F3F] flex items-center justify-center text-[#756F3F] group-hover/see:bg-[#756F3F] group-hover/see:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Nav Arrows */}
        <div className="flex justify-center gap-10 mt-2">
          <button
            onClick={prevProduct}
            className="nav-btn-standard w-12 h-12 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] hover:bg-[#756F3F] hover:text-white active:scale-95 transition-all"
          >
            <svg width="10" height="16" viewBox="0 0 17 29" fill="none">
              <path
                d="M15.5 2L3 14.5L15.5 27"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={nextProduct}
            className="nav-btn-standard w-12 h-12 rounded-full border-2 border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] hover:bg-[#756F3F] hover:text-white active:scale-95 transition-all"
          >
            <svg width="10" height="16" viewBox="0 0 17 29" fill="none">
              <path
                d="M1.5 2L14 14.5L1.5 27"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. DESKTOP VIEW */}
      <div className="hidden lg:flex flex-col relative w-full max-w-[83vw] mx-auto z-30 px-[5%]">
        {/* Header Row: Title + Nav Arrows */}
        <div className="flex justify-between items-end -mb-[1.6vw] relative z-10 pointer-events-none">
          <div
            className="flex-1 custom-scrollbar pointer-events-auto text-[6.25vw] xl:text-[5vw] leading-none"
            data-lenis-prevent={desktopTitleOverflows ? true : undefined}
            ref={desktopTitleRef}
            style={{
              maxWidth: "50vw",
              maxHeight: "calc(3em + 10px)",
              overflowY: desktopTitleOverflows ? "auto" : "hidden",
              overflowX: "hidden",
              overscrollBehavior: desktopTitleOverflows ? "contain" : "auto",
              paddingTop: "5px",
              paddingBottom: "5px",
              paddingRight: "16px",
            }}
          >
            <HollowText
              strokeColor="#846500"
              strokeWidth={1.5}
              className="font-anaheim block font-extrabold text-[6.25vw] xl:text-[5vw] leading-none m-0"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {title || "PRODUCT SERIES"}
            </HollowText>
          </div>

          {/* Desktop Nav Arrows */}
          <div className="flex gap-16 pb-24 pointer-events-auto">
            <button
              onClick={prevProduct}
              className="w-[3.85vw] h-[3.85vw] xl:w-[3vw] xl:h-[3vw] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95"
            >
              <svg width="23%" height="40%" viewBox="0 0 17 29" fill="none">
                <path
                  d="M15.5 2L3 14.5L15.5 27"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={nextProduct}
              className="w-[3.85vw] h-[3.85vw] xl:w-[3vw] xl:h-[3vw] rounded-full border-[1.5px] border-[#756F3F] flex items-center justify-center bg-white text-[#756F3F] shadow-lg hover:bg-[#756F3F] hover:text-white transition-all active:scale-95"
            >
              <svg width="23%" height="40%" viewBox="0 0 17 29" fill="none">
                <path
                  d="M1.5 2L14 14.5L1.5 27"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Rail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center items-stretch gap-[1.667vw] z-0"
          >
            {/* Left Beige Card */}
            <div className="w-[40%] rounded-[1.56vw] xl:rounded-[22.8px] bg-[#F1E8CA] py-[4.68%] pl-[4.68%] pr-[2.08%] flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[23.4vw]">
              <div className="relative z-10">
                <ProductCardTitle title={getDisplayName()} />
                <ProductCardAttributes attributes={attributes} />
              </div>

              <div className="self-end relative z-10">
                <Link
                  href={`/${locale}/shop/${activeProduct.slug}`}
                  className="flex items-center gap-[0.78vw] xl:gap-[0.625vw] group/see transition-all duration-300 transform translate-y-[1.56vw]"
                >
                  <span className="text-[1.14vw] xl:text-[1vw] font-bold text-[#756F3F] transition-colors group-hover/see:text-black font-anaheim">
                    {(activeProduct as any)._carouselItem?.buttonText ||
                      "SEE ALL"}
                  </span>
                  <div className="w-[2.97vw] h-[2.97vw] xl:w-[2.375vw] xl:h-[2.375vw] rounded-full border border-[#756F3F] flex items-center justify-center text-[#756F3F] group-hover/see:bg-[#756F3F] group-hover/see:text-white transition-all">
                    <svg
                      width="42%"
                      height="42%"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Image Card 1 */}
            <div className="w-[19.53%] rounded-[1.56vw] xl:rounded-[22.8px] overflow-hidden shadow-2xl border-none">
              <OptimizedImage
                image={displayedImages[0]}
                alt="Showcase 1"
                className="w-full h-full object-cover"
                size="large"
              />
            </div>

            {/* Right Image Card 2 */}
            <div className="w-[19.53%] rounded-[1.56vw] xl:rounded-[22.8px] overflow-hidden shadow-2xl border-none">
              <OptimizedImage
                image={displayedImages[1]}
                alt="Showcase 2"
                className="w-full h-full object-cover"
                size="large"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Client-side dynamic preloader for next and previous slides */}
      {shouldPreload && validProducts.length > 1 && (
        <div className="hidden" aria-hidden="true">
          {(() => {
            const nextIdx = (currentIndex + 1) % validProducts.length;
            const prevIdx = (currentIndex - 1 + validProducts.length) % validProducts.length;
            const preloadIndices = Array.from(new Set([nextIdx, prevIdx]));

            return preloadIndices.map((idx) => {
              const prod = validProducts[idx];
              if (!prod) return null;

              const mainImages = (prod as any).mainImage || [];
              const showImgNode = (prod as any).showImage;
              let img1 = showImgNode;
              let img2 = showImgNode;
              if (mainImages.length > 0) {
                img1 = mainImages[0];
                img2 = mainImages.length > 1 ? mainImages[1] : showImgNode || mainImages[0];
              }

              return (
                <React.Fragment key={`preload-${prod.id}-${idx}`}>
                  <OptimizedImage
                    image={img1}
                    size="large"
                    priority={true}
                  />
                  <OptimizedImage
                    image={img2}
                    size="large"
                    priority={true}
                  />
                </React.Fragment>
              );
            });
          })()}
        </div>
      )}
    </section>
  );
}
