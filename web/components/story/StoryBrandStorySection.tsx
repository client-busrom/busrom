"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { HollowText } from "@/components/common/HollowText";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface BrandStoryItem {
  title: string;
  image: MediaObject | null;
  description?: string;
}

interface MediaObject {
  url: string;
  id: string;
}

interface StoryBrandStorySectionProps {
  data: {
    title: string;
    subtitle: string;
    bgTextTop: string;
    bgTextBottom: string;
    items: {
      slides: BrandStoryItem[];
      autoplay: boolean;
      interval: number;
    };
    bgImage: any;
  };
}

export function StoryBrandStorySection({ data }: StoryBrandStorySectionProps) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive Pixel Function with Guard
  const rpx = useCallback(
    (px: number) => {
      if (windowWidth === 0) return `${px}px`;

      let base = 1920;
      if (windowWidth > 767 && windowWidth < 1440) {
        // When on tablet/small desktop, use a smaller base to make items relatively larger
        base = 1360;
      }

      const val = (px / base) * windowWidth;
      return `${val}px`;
    },
    [windowWidth],
  );

  const [orderedSlides, setOrderedSlides] = useState<BrandStoryItem[]>(
    data.items.slides || [],
  );

  // Embla setup for desktop/tablet
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );

  // Separate Embla for mobile
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [AutoScroll({ speed: 1, stopOnInteraction: false })],
  );

  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  useEffect(() => {
    if (!mobileEmblaApi) return;
    mobileEmblaApi.on("select", () => {
      setMobileActiveIndex(mobileEmblaApi.selectedScrollSnap());
    });
  }, [mobileEmblaApi]);

  const handleItemSwap = (clickedSIdx: number) => {
    const ACTIVE_SLIDE_IDX = 2;
    if (clickedSIdx === ACTIVE_SLIDE_IDX) return;

    setOrderedSlides((prev) => {
      const newSlides = [...prev];
      const clickedContent = newSlides[clickedSIdx];
      const activeContent = newSlides[ACTIVE_SLIDE_IDX];

      newSlides[clickedSIdx] = activeContent;
      newSlides[ACTIVE_SLIDE_IDX] = clickedContent;
      return newSlides;
    });
  };

  const columns = useMemo(() => {
    const s = (idx: number) => orderedSlides[idx % orderedSlides.length];

    return [
      {
        id: "col0",
        step: 602,
        items: [{ type: "image", sIdx: 0, data: s(0), y: 182, w: 610, h: 610 }],
      },
      {
        id: "col1",
        step: 340,
        items: [
          { type: "image", sIdx: 1, data: s(1), y: 196, w: 291, h: 291 },
          {
            type: "brand",
            text: data.subtitle,
            color: "#92c741",
            y: 501,
            w: 291,
            h: 291,
          },
        ],
      },
      {
        id: "col2-active",
        step: 548,
        items: [
          {
            type: "image",
            sIdx: 2,
            data: s(2),
            y: 137,
            w: 610,
            h: 610,
            isActive: true,
          },
        ],
      },
      {
        id: "col3",
        step: 303,
        items: [
          { type: "image", sIdx: 3, data: s(3), y: 501, w: 291, h: 291 },
          {
            type: "brand",
            text: data.title,
            color: "#ffeb4b",
            y: 196,
            w: 291,
            h: 291,
          },
        ],
      },
      {
        id: "col4",
        step: 279,
        items: [
          { type: "image", sIdx: 4, data: s(4), y: 189, w: 291, h: 291 },
          { type: "image", sIdx: 5, data: s(5), y: 501, w: 291, h: 291 },
        ],
      },
      {
        id: "col5",
        step: 600,
        items: [{ type: "image", sIdx: 6, data: s(6), y: 182, w: 610, h: 610 }],
      },
    ];
  }, [orderedSlides, data.subtitle, data.title]);

  const isMobile = windowWidth > 0 && windowWidth <= 767;

  if (isMobile) {
    return (
      <section className="relative w-full bg-[#464010] py-16 px-0 overflow-hidden min-h-[650px]">
        {/* Mobile BG Text - Refined Scale */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10">
            <HollowText strokeColor="#ffffff" strokeWidth={1} className="text-7xl tracking-widest uppercase">
              {data.bgTextTop}
            </HollowText>
          </div>
          <div className="absolute -bottom-10 -left-10">
            <HollowText strokeColor="#ffffff" strokeWidth={1} className="text-7xl tracking-widest uppercase">
              {data.bgTextBottom}
            </HollowText>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="relative z-10 px-6 mb-10">
          <h2 className="font-josefin-sans font-bold text-3xl text-[#ffeb4b] uppercase tracking-tighter leading-none">
            {data.title}
          </h2>
          <div className="w-12 h-1 bg-[#92c741] my-4" />
          <p className="font-josefin-sans text-[#92c741] text-base font-bold italic opacity-90">
            {data.subtitle}
          </p>
        </div>

        {/* Mobile Carousel - Improved Card UI */}
        <div className="relative z-10 overflow-hidden px-4" ref={mobileEmblaRef}>
          <div className="flex">
            {data.items.slides.map((item, idx) => (
              <div key={idx} className="flex-[0_0_82%] px-3 min-w-0">
                <div className="flex flex-col bg-black/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                  {/* Fixed Height Image */}
                  <div className="w-full h-[240px] overflow-hidden relative">
                    <OptimizedImage
                      image={item.image}
                      size="medium"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6">
                    <h3 className="text-[#ffeb4b] font-josefin-sans font-bold text-lg mb-3 tracking-wide">
                      {item.title}
                    </h3>
                    
                    {/* Fixed Height Scrollable Description */}
                    <div className="h-[90px] overflow-y-auto custom-scrollbar-none">
                      <p className="text-white/80 font-josefin-sans text-[12px] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: rpx(922) }}
    >
      {/* 1. Background Masking */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          image={data.bgImage}
          alt="Brand Story Background"
          size="large"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[#464010]"
          style={{ opacity: 0.82 }}
        />
      </div>

      {/* 2. Hollow Typography Background */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden uppercase">
        <div
          className="absolute font-josefin-sans font-bold leading-none select-none text-right"
          style={{ right: vw(-75), top: vw(54) }}
        >
          <HollowText
            strokeColor="#ffffff"
            strokeWidth={1.2}
            className="whitespace-pre-line"
            style={{ fontSize: vw(240), letterSpacing: "0.2em" }}
          >
            {data.bgTextTop}
          </HollowText>
        </div>
        <div
          className="absolute font-josefin-sans font-bold leading-none select-none"
          style={{ left: vw(22), top: vw(649) }}
        >
          <HollowText
            strokeColor="#ffffff"
            strokeWidth={1.2}
            className="whitespace-pre-line"
            style={{ fontSize: vw(240), letterSpacing: "0.2em" }}
          >
            {data.bgTextBottom}
          </HollowText>
        </div>
      </div>

      {/* Scaling Guard Wrapper - Removed max-w to prevent clipping on large screens */}
      <div
        className="relative z-10 w-full h-full"
      >
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full items-start">
            {columns.map((col, idx) => (
              <div
                key={`${col.id}-${idx}`}
                className="relative flex-shrink-0 h-full"
                style={{ width: vw(col.step) }}
              >
                {col.items.map((item: any, itemIdx) => (
                  <div
                    key={`${col.id}-item-${itemIdx}`}
                    className="absolute cursor-pointer"
                    onClick={() => {
                      if (item.type === "image") handleItemSwap(item.sIdx);
                    }}
                    style={{
                      top: vw(item.y),
                      width: vw(item.w),
                      height: vw(item.h),
                      borderRadius: "50%",
                      zIndex: item.isActive ? 50 : 20,
                      backgroundColor:
                        item.type === "brand" ? item.color : "transparent",
                    }}
                  >
                    {item.type === "brand" ? (
                      <div
                        className="w-full h-full flex items-center justify-center rounded-full overflow-hidden"
                        style={{ padding: vw(32) }}
                      >
                        <h3
                          className="m-0 font-josefin-sans font-bold text-black text-center whitespace-pre-line leading-[1.2] relative top-[0.2em] w-full"
                          style={{ fontSize: vw(48) }}
                        >
                          {item.text}
                        </h3>
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <OptimizedImage
                            image={item.data?.image}
                            alt={item.data?.title}
                            size="medium"
                            className="object-cove w-full h-full"
                          />

                  <AnimatePresence>
                    {item.isActive && (
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div 
                          className="w-full h-full overflow-y-auto custom-scrollbar-none cursor-grab active:cursor-grabbing select-none"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => {
                            const el = e.currentTarget;
                            const startY = e.pageY - el.offsetTop;
                            const scrollTop = el.scrollTop;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const y = moveEvent.pageY - el.offsetTop;
                              const walk = (y - startY) * 2; // Scroll speed
                              el.scrollTop = scrollTop - walk;
                            };

                            const onMouseUp = () => {
                              window.removeEventListener("mousemove", onMouseMove);
                              window.removeEventListener("mouseup", onMouseUp);
                            };

                            window.addEventListener("mousemove", onMouseMove);
                            window.addEventListener("mouseup", onMouseUp);
                          }}
                          data-lenis-prevent
                          style={{ clipPath: "circle(50% at 50% 50%)", overscrollBehavior: "contain" }}
                        >
                          <div className="min-h-full flex flex-col items-center justify-center py-[30%] px-[15%]">
                            <h4
                              className="font-josefin-sans font-bold mb-6 text-white text-center leading-tight"
                              style={{ fontSize: rpx(48) }}
                            >
                              {item.data?.title}
                            </h4>
                            <p
                              className="font-josefin-sans font-normal text-white/90 text-center"
                              style={{
                                fontSize: rpx(24),
                                lineHeight: 1.6,
                              }}
                            >
                              {item.data?.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                        </div>

                        {item.isActive && (
                          <div
                            className="absolute inset-0 border-[5px] border-[#ffe830] rounded-full z-20 pointer-events-none"
                            style={{
                              boxShadow: `0 ${vw(4)} ${vw(14.5)} ${vw(8)} #FFF6AA`,
                            }}
                          />
                        )}
                        {!item.isActive && (
                          <div className="absolute inset-0 rounded-full bg-black/20 hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
