"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { HomeContent, FeaturedProduct } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { AnimatedLinkButton } from "../ui/animated-link-button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type Props = {
  data: HomeContent["featuredProducts"];
  locale: Locale;
};

type ProductCardProps = {
  product: FeaturedProduct;
  index: number;
  isMobile?: boolean;
  locale: Locale;
};

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;

// 阶梯偏移量 (设计稿像素)
const STEP_OFFSETS = [0, 40, 80]; // 左、中、右

// 走马灯配置
const CAROUSEL_SPEED = 30; // 像素/秒
const CAROUSEL_ITEM_GAP = 16; // 间距

// --- 产品卡片组件 ---
const ProductCard = ({ product, index, isMobile = false, locale }: ProductCardProps) => {
  // 计算阶梯偏移 (仅桌面端)
  const stepOffset = STEP_OFFSETS[index % 3];
  const [isHovered, setIsHovered] = useState(false);

  // 产品详情页链接
  const productHref = `/${locale}/shop/${product.slug}`;

  return (
    <Link
      href={productHref}
      className={cn(
        "flex flex-col cursor-pointer",
        "transition-transform duration-500 ease-out",
        // 桌面端有阶梯偏移和 hover 效果
        !isMobile && "origin-top"
      )}
      style={!isMobile ? {
        // 桌面端：结合阶梯偏移和 hover 放大
        transform: `translateY(${(stepOffset / DESIGN_WIDTH) * 100}vw) scale(${isHovered ? 1.05 : 1})`,
      } : undefined}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* 图片容器 */}
      <div
        className={cn(
          "relative w-full rounded-xl overflow-hidden shadow-lg",
          // 移动端: 固定尺寸; 桌面端: 按设计稿比例
          isMobile
            ? "aspect-[3/4] mb-3"
            : "mb-4"
        )}
        style={!isMobile ? {
          // 设计稿卡片宽度约 380px，高度约 480px
          aspectRatio: '380 / 480',
        } : undefined}
      >
        <OptimizedImage
          image={product.image}
          alt={product.image?.altText || product.title}
          size="small"
          className="object-cover absolute inset-0 w-full h-full"
        />
      </div>

      {/* 文本内容 */}
      <div className={cn(isMobile ? "px-1" : "px-2")}>
        <h3 className={cn(
          "font-anaheim font-extrabold text-brand-text-black",
          isMobile ? "text-base mb-1" : "text-lg mb-2"
        )}>
          {product.title}
        </h3>
        {/* 特点列表 */}
        <ul className={cn(
          "space-y-1 text-brand-text-main",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {product.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <svg
                className={cn(
                  "text-brand-secondary flex-shrink-0 mt-0.5",
                  isMobile ? "w-3 h-3 mr-1.5" : "w-4 h-4 mr-2"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};

// --- 走马灯系列标签组件 (CSS 动画版本) ---
const SeriesCarousel = ({
  series,
  activeIndex,
  onSelect,
  isPaused,
  onMouseEnter,
  onMouseLeave,
}: {
  series: { seriesTitle: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isPaused: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const renderItems = (keyPrefix: string) => (
    series.map((s, index) => (
      <button
        key={`${keyPrefix}-${s.seriesTitle}`}
        onClick={() => onSelect(index)}
        className={cn(
          "px-5 py-2 whitespace-nowrap rounded-full text-sm transition-colors duration-300 flex-shrink-0",
          index === activeIndex
            ? "bg-brand-secondary text-white shadow-md"
            : "bg-white/80 border border-brand-text-black/10 text-brand-text-black hover:bg-brand-secondary/10 hover:border-brand-secondary/30"
        )}
      >
        {s.seriesTitle}
      </button>
    ))
  );

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 左右渐变遮罩 */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-main to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-main to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-4 animate-carousel-desktop"
        style={{
          width: 'max-content',
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {renderItems('first')}
        {renderItems('second')}
      </div>
    </div>
  );
};

// --- 移动端系列选择器 (使用 Embla Carousel) ---
const MobileSeriesSelector = ({
  series,
  activeIndex,
  onSelect,
}: {
  series: { seriesTitle: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <div className="relative -mx-4 mb-2">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 px-4">
          {series.map((s, index) => (
            <CarouselItem
              key={s.seriesTitle}
              className="pl-2 basis-auto"
            >
              <button
                onClick={() => onSelect(index)}
                className={cn(
                  "px-4 py-2 whitespace-nowrap rounded-full text-xs transition-colors duration-300",
                  index === activeIndex
                    ? "bg-brand-secondary text-white"
                    : "bg-white/80 border border-brand-text-black/10 text-brand-text-black"
                )}
              >
                {s.seriesTitle}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

// 移动端自动轮播间隔
const MOBILE_AUTOPLAY_DELAY = 4000;

// --- 移动端产品卡片轮播 (Embla Carousel) ---
const MobileProductCarousel = ({
  products,
  locale,
  isVisible,
}: {
  products: FeaturedProduct[];
  locale: Locale;
  isVisible: boolean;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Autoplay 插件
  const autoplayPlugin = useRef(
    Autoplay({
      delay: MOBILE_AUTOPLAY_DELAY,
      stopOnInteraction: false,
    })
  );

  // 监听轮播切换
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // 根据视口可见性控制自动播放
  useEffect(() => {
    if (!api || !products || products.length === 0) return;

    const autoplay = autoplayPlugin.current;
    if (autoplay && typeof autoplay.play === 'function') {
      if (isVisible) {
        autoplay.play();
      } else {
        autoplay.stop();
      }
    }
  }, [api, isVisible, products]);

  // Guard: 如果没有产品，不渲染
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative py-2 -mx-4">
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 px-4">
          {products.map((product, index) => (
            <CarouselItem
              key={product.title}
              className="pl-2 basis-[75%] max-w-[280px]"
            >
              <ProductCard
                product={product}
                index={index}
                isMobile={true}
                locale={locale}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* 轮播指示器 */}
      {products.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-brand-secondary w-4"
                  : "bg-brand-secondary/30"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- 主组件 ---
export default function FeaturedProducts({ data, locale }: Props) {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const productSeries = data?.series || [];

  const featuredItems = useMemo(() => {
    return productSeries[activeSeriesIndex]?.products || [];
  }, [activeSeriesIndex, productSeries]);

  const itemsToDisplay = featuredItems.slice(0, 3);

  // 视口检测 - 不在视口时暂停动画省电
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 暂停走马灯 (悬停时)
  const handleCarouselPause = useCallback(() => {
    setIsCarouselPaused(true);
  }, []);

  // 恢复走马灯
  const handleCarouselResume = useCallback(() => {
    setIsCarouselPaused(false);
  }, []);

  // 选择系列
  const handleSeriesSelect = useCallback((index: number) => {
    setActiveSeriesIndex(index);
  }, []);

  // Guard: if no data, don't render
  if (!data || !data.series || data.series.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-12 lg:py-20 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto px-4 lg:px-8">

        {/* ==================== 移动端布局 ==================== */}
        <div className="lg:hidden">
          {/* 标题区 */}
          <div className="mb-4">
            <p className="font-anaheim text-xs text-brand-secondary mb-1">
              Product Series Introduction
            </p>
            <h2 className="font-anaheim font-extrabold text-2xl text-brand-text-black">
              {data.title || "Hot Products"}
            </h2>
          </div>

          {/* 系列选择器 (横向滚动) */}
          <MobileSeriesSelector
            series={productSeries}
            activeIndex={activeSeriesIndex}
            onSelect={handleSeriesSelect}
          />

          {/* 产品卡片轮播 */}
          <MobileProductCarousel
            products={featuredItems}
            locale={locale}
            isVisible={isVisible}
          />

          {/* View More 按钮 */}
          <div className="text-center mt-4">
            <Button
              variant="outline"
              className="text-brand-secondary border-brand-secondary/30 text-sm"
            >
              View All Products
            </Button>
          </div>
        </div>

        {/* ==================== 桌面端布局 ==================== */}
        <div className="hidden lg:block">
          {/* 顶部区域 */}
          <div className="flex justify-between items-end mb-6">
            {/* 左侧标题 - 设计稿: 副标题 32px, 主标题需要你提供 */}
            <div>
              <p
                className="font-anaheim font-medium text-brand-secondary"
                style={{
                  fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: `${(30 / DESIGN_WIDTH) * 100}vw`,
                  marginBottom: `${(32 / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                Product Series Introduction
              </p>
              <h2
                className="font-anaheim font-extrabold text-brand-text-black"
                style={{
                  fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                {data.title || "Hot Products"}
              </h2>
            </div>

            {/* 右侧按钮 - 设计稿: 32px 字体, Anaheim Medium */}
            <AnimatedLinkButton>
              VIEW MORE INFORMATION
            </AnimatedLinkButton>
          </div>

          {/* 系列走马灯标签 */}
          <div className="mb-8">
            <SeriesCarousel
              series={productSeries}
              activeIndex={activeSeriesIndex}
              onSelect={handleSeriesSelect}
              isPaused={isCarouselPaused || !isVisible}
              onMouseEnter={handleCarouselPause}
              onMouseLeave={handleCarouselResume}
            />
          </div>

          {/* 三栏产品卡片网格 (阶梯状) */}
          <div
            className="grid grid-cols-3 items-start"
            style={{
              gap: `${(48 / DESIGN_WIDTH) * 100}vw`,
              paddingBottom: `${(STEP_OFFSETS[2] / DESIGN_WIDTH) * 100}vw`, // 为最大偏移留空间
            }}
          >
            {itemsToDisplay.map((product, index) => (
              <ProductCard
                key={product.title}
                product={product}
                index={index}
                isMobile={false}
                locale={locale}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
