"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { HomeContent, FeaturedProduct } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
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
const DESIGN_HEIGHT = 922; // 目标可视高度 (1080 - 浏览器UI 112 - 导航栏 46)

// 布局配置 - 基于 Figma JSON (应用64%缩放以适应1920x968屏幕)
// 原始设计稿高度1230，需要在1920宽度下适应968-46=922高度
// 缩放比例 = 1640/1920 * 0.75 ≈ 0.64
const LAYOUT = {
  // 左右边距
  paddingLeft: 120,
  paddingRight: 120,

  // 标题区域
  header: {
    subtitleY: 0,
    titleY: 40,           // 62 * 0.64
    titleFontSize: 61,    // 96 * 0.64
    subtitleFontSize: 20, // 32 * 0.64
  },

  // 分类标签栏
  tags: {
    y: 109,               // 171 * 0.64
    height: 51,           // 80 * 0.64
    borderRadius: 26,     // 40 * 0.64
    fontSize: 15,         // 24 * 0.64
    gap: 19,              // 30 * 0.64
  },

  // 产品卡片
  cards: {
    startY: 180,          // 281 * 0.64
    width: 290,           // 453 * 0.64
    imageHeight: 352,     // 550 * 0.64
    borderRadius: 19,     // 30 * 0.64
    gap: 53,              // 83 * 0.64
    stepOffsets: [0, 44, 86],  // [0, 68, 134] * 0.64
    titleMarginTop: 26,   // 40 * 0.64
    titleFontSize: 20,    // 32 * 0.64
    featureFontSize: 18,  // 28 * 0.64
    featureLineHeight: 31, // 49 * 0.64
  },

  // 右上角 "VIEW MORE"
  viewMore: {
    circleX: 1397,
    circleY: 38,          // 60 * 0.64
    circleSize: 45,       // 71 * 0.64
    textX: 1427,
    textY: 52,            // 81 * 0.64
    fontSize: 20,         // 32 * 0.64
  },

  // 卡片网格最大宽度比例
  gridMaxWidth: 72,       // 85% * 0.85 ≈ 72% (缩小网格区域以适应高度)
};

// --- 产品卡片组件 ---
const ProductCard = ({ product, index, isMobile = false, locale }: ProductCardProps) => {
  // 计算阶梯偏移 (仅桌面端)
  const stepOffset = LAYOUT.cards.stepOffsets[index % 3];
  const [isHovered, setIsHovered] = useState(false);

  // 产品详情页链接
  const productHref = `/${locale}/shop/${product.slug}`;

  // vw 转换函数
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  return (
    <Link
      href={productHref}
      className={cn(
        "flex flex-col cursor-pointer",
        "transition-transform duration-500 ease-out",
        !isMobile && "origin-top"
      )}
      style={!isMobile ? {
        transform: `translateY(${vw(stepOffset)}) scale(${isHovered ? 1.03 : 1})`,
      } : undefined}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* 图片容器 */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-white transition-shadow duration-500",
          !isMobile && (isHovered ? "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]" : "shadow-none"),
          isMobile ? "aspect-[3/4] mb-3 rounded-xl shadow-none" : ""
        )}
        style={!isMobile ? {
          aspectRatio: `${LAYOUT.cards.width} / ${LAYOUT.cards.imageHeight}`,
          borderRadius: vw(LAYOUT.cards.borderRadius),
        } : undefined}
      >
        <OptimizedImage
          image={product.image}
          alt={product.image?.altText || product.title}
          size="medium"
          objectFit="contain"
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* 文本内容 */}
      <div
        className={cn(isMobile ? "px-1" : "")}
        style={!isMobile ? {
          paddingLeft: vw(47),  // 246 - 199 = 47
          marginTop: vw(LAYOUT.cards.titleMarginTop),
        } : undefined}
      >
        <h3
          className={cn(
            "font-semibold text-brand-text-black",
            isMobile ? "text-base mb-1 font-anaheim" : ""
          )}
          style={!isMobile ? {
            fontSize: vw(LAYOUT.cards.titleFontSize),
            marginBottom: vw(15),
          } : undefined}
        >
          {product.title}
        </h3>
        {/* 特点列表 */}
        <ul
          className={cn(
            "text-brand-text-main",
            isMobile ? "space-y-1 text-xs" : ""
          )}
          style={!isMobile ? {
            fontSize: vw(LAYOUT.cards.featureFontSize),
            lineHeight: vw(LAYOUT.cards.featureLineHeight),
          } : undefined}
        >
          {product.features.map((feature, idx) => (
            <li key={idx} className="flex items-center">
              <svg
                className={cn(
                  "flex-shrink-0",
                  isMobile ? "w-4 h-4 mr-1.5" : ""
                )}
                style={!isMobile ? {
                  width: vw(28),
                  height: vw(28),
                  marginRight: vw(14),
                } : undefined}
                viewBox="0 0 28 28"
                fill="none"
              >
                <path d="M14 28C6.2825 28 0 21.7175 0 14C0 6.2825 6.2825 0 14 0C21.7175 0 28 6.2825 28 14C28 21.7175 21.7175 28 14 28Z" fill="#F6F4ED"/>
                <path d="M12.2508 18.1997C12.0758 18.1997 11.9008 18.1297 11.7608 17.9897L8.26078 14.4897C7.98078 14.2097 7.98078 13.7722 8.26078 13.4922C8.54078 13.2122 8.97828 13.2122 9.25828 13.4922L12.7583 16.9922C13.0383 17.2722 13.0383 17.7097 12.7583 17.9897C12.6008 18.1297 12.4258 18.1997 12.2508 18.1997Z" fill="#756F3F"/>
                <path d="M12.2508 18.1997C12.0758 18.1997 11.9008 18.1297 11.7608 17.9897C11.4808 17.7097 11.4808 17.2722 11.7608 16.9922L18.7608 9.99223C19.0408 9.71223 19.4783 9.71223 19.7583 9.99223C20.0383 10.2722 20.0383 10.7097 19.7583 10.9897L12.7583 17.9897C12.6008 18.1297 12.4258 18.1997 12.2508 18.1997Z" fill="#756F3F"/>
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};

// --- 走马灯系列标签组件 (Embla Carousel 版本) ---
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
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps",
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ]
  );

  useEffect(() => {
    if (!emblaApi) return;
    if (isPaused) {
      emblaApi.plugins().autoScroll?.stop();
    } else {
      emblaApi.plugins().autoScroll?.play();
    }
  }, [emblaApi, isPaused]);

  return (
    <div
      className="relative w-full cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        paddingTop: vw(10),
        paddingBottom: vw(10),
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-[1.25vw]">
          {series.map((s, index) => (
            <div 
              key={`${s.seriesTitle}-${index}`}
              className="flex-shrink-0 pl-4 md:pl-[1.25vw] min-w-0"
            >
              <button
                onClick={() => onSelect(index)}
                className={cn(
                  "whitespace-nowrap transition-all duration-300 flex items-center justify-center font-pingfang font-semibold",
                  index === activeIndex
                    ? "bg-brand-secondary text-white shadow-lg scale-105"
                    : "bg-[#f6f4ed] border border-brand-text-black/10 text-[#756F3F] hover:bg-brand-secondary/10 hover:border-brand-secondary/30"
                )}
                style={{
                  height: vw(LAYOUT.tags.height),
                  borderRadius: vw(LAYOUT.tags.borderRadius),
                  fontSize: vw(LAYOUT.tags.fontSize),
                  paddingLeft: vw(40),
                  paddingRight: vw(40),
                  letterSpacing: "0.02em",
                }}
              >
                {s.seriesTitle}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* 左右渐变遮罩 */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-main to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-main to-transparent z-10 pointer-events-none" />

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

    try {
      const autoplay = api?.plugins()?.autoplay;
      if (autoplay && typeof autoplay.play === 'function' && typeof autoplay.stop === 'function') {
        // Check if carousel has slides before playing
        const slideCount = api.scrollSnapList()?.length || 0;
        if (slideCount > 0) {
          if (isVisible) {
            autoplay.play();
          } else {
            autoplay.stop();
          }
        }
      }
    } catch (error) {
      // Silently ignore autoplay errors
      console.warn('Autoplay error:', error);
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

  // vw 转换函数
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

  return (
    <section ref={sectionRef} className="py-12 lg:py-0 bg-brand-main" >
      <div className="container mx-auto px-4 lg:px-0" style={{ maxWidth: '100%' }}>

        {/* ==================== 移动端布局 ==================== */}
        <div className="lg:hidden">
          {/* 标题区 */}
          <div className="mb-4">
            <p className="font-anaheim text-xs text-brand-secondary mb-1">
              {data.description || "Product Series Introduction"}
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
              className="text-brand-secondary border-brand-secondary/30 text-sm flex items-center gap-1 mx-auto"
            >
              {data.viewAllButton || "View All Products"}
              <span>»</span>
            </Button>
          </div>
        </div>

        {/* ==================== 桌面端布局 ==================== */}
        <div
          className="hidden lg:block"
          style={{
            paddingLeft: vw(LAYOUT.paddingLeft),
            paddingRight: vw(LAYOUT.paddingRight),
            paddingTop: vw(50),      // 80 * 0.64
            paddingBottom: vw(80),   // 底部间距
            position: 'relative',
          }}
        >
          {/* 顶部区域 - Header */}
          <div
            className="flex justify-between items-end mx-auto"
            style={{ maxWidth: `${LAYOUT.gridMaxWidth}%` }}
          >
            {/* 左侧标题 */}
            <div>
              <p
                className="font-anaheim font-medium text-brand-secondary"
                style={{
                  fontSize: vw(LAYOUT.header.subtitleFontSize),
                  lineHeight: '1.2',
                  marginBottom: vw(20),  // 32 * 0.64
                }}
              >
                {data.description || "Product Series Introduction"}
              </p>
              <h2
                className="font-anaheim font-extrabold text-brand-text-black"
                style={{
                  fontSize: vw(LAYOUT.header.titleFontSize),
                  lineHeight: '1',
                }}
              >
                {data.title || "Hot Products"}
              </h2>
            </div>

            {/* 右侧 VIEW MORE */}
            <AnimatedLinkButton>
              {data.viewAllButton || "VIEW MORE INFORMATION"}
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">»</span>
            </AnimatedLinkButton>
          </div>

          {/* 系列走马灯标签 */}
          <div
            style={{
              marginTop: vw(LAYOUT.tags.y - LAYOUT.header.titleY - 67), // 定位到 y=171
            }}
          >
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
            className="grid grid-cols-3 items-start mx-auto"
            style={{
              gap: vw(LAYOUT.cards.gap),
              marginTop: vw(13),   // 20 * 0.64
              maxWidth: `${LAYOUT.gridMaxWidth}%`,
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
