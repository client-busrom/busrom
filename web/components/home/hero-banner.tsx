//components/home/hero-banner.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { type CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

// ⚡ 首屏 Banner 直接导入（SSR 关键）
import HeroBanner1 from "@/components/HeroBanner/HeroBanner1";

// 非首屏 Banner 动态导入
const HeroBanner2 = dynamic(() => import("@/components/HeroBanner/HeroBanner2"));
const HeroBanner3 = dynamic(() => import("@/components/HeroBanner/HeroBanner3"));
const HeroBanner4 = dynamic(() => import("@/components/HeroBanner/HeroBanner4"));
const HeroBanner5 = dynamic(() => import("@/components/HeroBanner/HeroBanner5"));
const HeroBanner6 = dynamic(() => import("@/components/HeroBanner/HeroBanner6"));
const HeroBanner7 = dynamic(() => import("@/components/HeroBanner/HeroBanner7"));
const HeroBanner8 = dynamic(() => import("@/components/HeroBanner/HeroBanner8"));
const HeroBanner9 = dynamic(() => import("@/components/HeroBanner/HeroBanner9"));

type Props = {
  data: HomeContent["heroBanner"];
  locale: Locale;
};

const BannerComponents = [
  null,
  HeroBanner1,
  HeroBanner2,
  HeroBanner3,
  HeroBanner4,
  HeroBanner5,
  HeroBanner6,
  HeroBanner7,
  HeroBanner8,
  HeroBanner9,
];

const AUTOPLAY_DELAY = 6000;
const MIN_HEIGHT = "min-h-[700px]";
const HEIGHT_CLASS = `h-screen ${MIN_HEIGHT}`;

export default function HeroBanner({ data, locale }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  // 视口检测
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 自动播放控制
  useEffect(() => {
    if (!api) return;
    const autoplay = autoplayPlugin.current;
    if (isVisible) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
  }, [api, isVisible]);

  // Carousel API 事件
  useEffect(() => {
    if (!api) return;

    const onInitOrReinit = () => {
      if (!api) return;
      setScrollSnaps(api.scrollSnapList());
      setCurrentSlide(api.selectedScrollSnap());
    };

    const onSelect = () => {
      if (!api) return;
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("reInit", onInitOrReinit);
    api.on("select", onSelect);
    onInitOrReinit();

    return () => {
      if (api) {
        api.off("reInit", onInitOrReinit);
        api.off("select", onSelect);
      }
    };
  }, [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  // ⚡ 关键：始终渲染完整结构，避免 hydration mismatch 导致的 CLS
  return (
    <section ref={sectionRef} className={`relative w-full ${HEIGHT_CLASS}`}>
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        className={`w-full ${HEIGHT_CLASS}`}
        opts={{ loop: true, align: "start" }}
      >
        <CarouselContent className={`${HEIGHT_CLASS} m-0`}>
          {data && data.length > 0 ? (
            data.map((bannerData, index) => {
              const BannerComponent = BannerComponents[index + 1];
              if (!BannerComponent) return null;

              return (
                <CarouselItem key={index} className={`h-full ${MIN_HEIGHT} p-0 basis-full flex`}>
                  <BannerComponent data={bannerData} locale={locale} />
                </CarouselItem>
              );
            })
          ) : (
            <CarouselItem className={`h-full ${MIN_HEIGHT} p-0 flex items-center justify-center bg-gray-700 text-white`}>
              No banner data available.
            </CarouselItem>
          )}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex" />
      </Carousel>

      {scrollSnaps.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200",
                index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
