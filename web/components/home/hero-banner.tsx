//components/home/hero-banner.tsx
"use client";

import * as React from "react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
  ComponentType,
} from "react";
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
import Autoplay from "embla-carousel-autoplay";

// ⚡ 首屏 Banner 直接导入（只加载第1个）
import HeroBanner1 from "@/components/HeroBanner/HeroBanner1";
import { cn } from "@/lib/utils";

type Props = {
  data: HomeContent["heroBanner"];
  locale: Locale;
  headerTheme?: string;
  className?: string;
};

type BannerData = HomeContent["heroBanner"][number];
type BannerComponentType = ComponentType<{ data: BannerData; locale: Locale }>;

// 延迟加载的 Banner 组件（2-9 延迟加载）
const lazyBanners: Record<
  number,
  () => Promise<{ default: BannerComponentType }>
> = {
  2: () => import("@/components/HeroBanner/HeroBanner2"),
  3: () => import("@/components/HeroBanner/HeroBanner3"),
  4: () => import("@/components/HeroBanner/HeroBanner4"),
  5: () => import("@/components/HeroBanner/HeroBanner5"),
  6: () => import("@/components/HeroBanner/HeroBanner6"),
  7: () => import("@/components/HeroBanner/HeroBanner7"),
  8: () => import("@/components/HeroBanner/HeroBanner8"),
  9: () => import("@/components/HeroBanner/HeroBanner9"),
};

const AUTOPLAY_DELAY = 6000;
const PRELOAD_BEFORE = 2000; // 提前 2 秒预加载下一个 Banner
const MIN_HEIGHT = "min-h-[600px]";
// 方案二核心：移动端 80dvh，桌面端 (xl) 采用 1920x922 的完美设计比例 48vw
const HEIGHT_CLASS = `h-[80dvh] xl:h-[48vw] ${MIN_HEIGHT}`;

// 占位组件 - 用于 Banner 加载中
function BannerPlaceholder() {
  return (
    <div
      className={`w-full h-full ${MIN_HEIGHT} bg-gradient-to-br from-[#F6F4ED] to-[#E8E4D9]`}
    />
  );
}

export default function HeroBanner({
  data,
  locale,
  headerTheme,
  className,
}: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // --- 关键：动态计算 --rpx-hero 比例系数 (基于 1920x922) ---
  useEffect(() => {
    isMounted.current = true;
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const el = sectionRef.current;
      if (!el) return;

      // 1280px 以上必选桌面，768px-1280px 之间只要是横屏 (vw > vh) 就选桌面
      const isDesktopLayout = vw >= 1280 || (vw >= 768 && vw > vh);

      if (isDesktopLayout) {
        const rawScale = vw / 1920;
        const scale = Math.max(rawScale, 0.5);
        // 局部化：只设置在当前组件容器上，防止污染全局
        el.style.setProperty("--rpx-hero", scale.toString());
      } else {
        el.style.setProperty("--rpx-hero", "1");
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // 已加载的 Banner 组件缓存（只有第1个直接可用）
  const [loadedBanners, setLoadedBanners] = useState<
    Record<number, BannerComponentType>
  >({
    1: HeroBanner1,
  });

  // 用 ref 追踪已加载状态，避免重复加载
  const loadedRef = useRef<Set<number>>(new Set([1]));

  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  // 预加载 Banner（不依赖 state，避免无限循环）
  const preloadBanner = useCallback((bannerIndex: number) => {
    if (loadedRef.current.has(bannerIndex) || !lazyBanners[bannerIndex]) return;

    // 标记为正在加载
    loadedRef.current.add(bannerIndex);

    lazyBanners[bannerIndex]().then((module) => {
      if (!isMounted.current) return;
      setLoadedBanners((prev) => ({
        ...prev,
        [bannerIndex]: module.default,
      }));
    });
  }, []);

  // 首次加载后，立即预加载第 2 个 Banner（确保轮播流畅）
  useEffect(() => {
    // 立即预加载 Banner2（下一张）
    const timer1 = setTimeout(() => {
      preloadBanner(2);
    }, 500); // 页面加载后 0.5 秒开始预加载

    // 提前预加载 Banner3
    const timer2 = setTimeout(() => {
      preloadBanner(3);
    }, AUTOPLAY_DELAY - PRELOAD_BEFORE); // 第一次轮播前预加载

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [preloadBanner]);

  // 当轮播切换时，立即加载当前 Banner + 预加载下一个
  useEffect(() => {
    if (!data || data.length <= 1) return;

    const currentIndex = currentSlide + 1; // Banner 索引从 1 开始
    const nextIndex = ((currentSlide + 1) % data.length) + 1;

    // 立即加载当前 Banner（手动切换时需要）
    preloadBanner(currentIndex);

    // 预加载下一个 Banner
    const timer = setTimeout(() => {
      preloadBanner(nextIndex);
    }, AUTOPLAY_DELAY - PRELOAD_BEFORE);

    return () => clearTimeout(timer);
  }, [currentSlide, data, preloadBanner]);

  // 视口检测
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 自动播放控制
  useEffect(() => {
    if (!api || !data || data.length === 0) return;
    const autoplay = autoplayPlugin.current;
    if (autoplay && typeof autoplay.play === "function") {
      if (isVisible) {
        autoplay.play();
      } else {
        autoplay.stop();
      }
    }
  }, [api, isVisible, data]);

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
      // 切换时重置进度条 DOM 样式
      if (progressBarRef.current) {
        progressBarRef.current.style.width = "0%";
      }

      // 重置 Embla Autoplay 内部计时器，防止手动点击切换后计时器未归零导致过快轮播
      const autoplay = autoplayPlugin.current;
      if (autoplay && typeof autoplay.reset === "function") {
        autoplay.reset();
      }
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

  // 进度条动画 - 使用 direct DOM 操作避免 React state 频繁重渲染引发卡顿
  useEffect(() => {
    if (!isVisible || !data || data.length <= 1) {
      if (progressBarRef.current) progressBarRef.current.style.width = "0%";
      return;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = "0%";
    }

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let percentage = (elapsed / AUTOPLAY_DELAY) * 100;
      if (percentage >= 100) percentage = 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${percentage}%`;
      }
    }, 60);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isVisible, currentSlide, data]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  // ⚡ 关键：始终渲染完整结构，避免 hydration mismatch 导致的 CLS
  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full", HEIGHT_CLASS, className)}
      data-header-theme={headerTheme}
    >
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        className={`w-full ${HEIGHT_CLASS}`}
        opts={{ loop: true, align: "start" }}
      >
        <CarouselContent className={`${HEIGHT_CLASS} m-0`}>
          {data && data.length > 0 ? (
            data.map((bannerData, index) => {
              const bannerIndex = index + 1; // Banner 索引从 1 开始
              const BannerComponent = loadedBanners[bannerIndex];

              return (
                <CarouselItem
                  key={index}
                  className={`h-full ${MIN_HEIGHT} p-0 basis-full flex transform-gpu select-none`}
                  style={{ transform: "translateZ(0)", willChange: "transform" }}
                >
                  {BannerComponent ? (
                    <BannerComponent data={bannerData} locale={locale} />
                  ) : (
                    <BannerPlaceholder />
                  )}
                </CarouselItem>
              );
            })
          ) : (
            <CarouselItem
              className={`h-full ${MIN_HEIGHT} p-0 flex items-center justify-center bg-gray-700 text-white`}
            >
              No banner data available.
            </CarouselItem>
          )}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 xl:left-[0.83vw] top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex xl:w-[1.67vw] xl:h-[1.67vw] xl:[&>svg]:w-[1vw] xl:[&>svg]:h-[1vw]" />
        <CarouselNext className="absolute right-4 xl:right-[0.83vw] top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex xl:w-[1.67vw] xl:h-[1.67vw] xl:[&>svg]:w-[1vw] xl:[&>svg]:h-[1vw]" />
      </Carousel>

      {scrollSnaps.length > 0 && (
        <>
          {/* 底部进度条 - 从 left 15% 到 50% */}
          <div
            className="absolute bottom-7 xl:bottom-[1.46vw] z-10 h-[2px] xl:h-[0.1vw] bg-white/50"
            style={{ left: "15%", width: "35%" }}
          >
            <div
              ref={progressBarRef}
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ width: "0%" }}
            />
          </div>

          {/* 页码指示器 - right 15% */}
          <div
            className="absolute bottom-3 xl:bottom-[0.63vw] z-10 flex items-baseline text-white font-anaheim"
            style={{
              right: "15%",
              textShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)",
            }}
          >
            <span className="text-2xl xl:text-[1.25vw] font-bold">
              {String(currentSlide + 1).padStart(2, "0")}
            </span>
            <span className="text-base xl:text-[0.83vw] text-white/80 mx-1 xl:mx-[0.2vw]">/</span>
            <span className="text-base xl:text-[0.83vw] text-white/80">
              {String(scrollSnaps.length).padStart(2, "0")}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
