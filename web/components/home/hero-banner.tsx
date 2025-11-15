//components/home/hero-banner.tsx
"use client";

import * as React from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { type CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious, // 内置的左按钮
  CarouselNext,     // 内置的右按钮
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// 动态导入所有 Banner 组件 (或直接 import)
// --- 确保这些路径是正确的 ---
import HeroBanner1 from "@/components/HeroBanner/HeroBanner1";
import HeroBanner2 from "@/components/HeroBanner/HeroBanner2";
import HeroBanner3 from "@/components/HeroBanner/HeroBanner3";
import HeroBanner4 from "@/components/HeroBanner/HeroBanner4";
import HeroBanner5 from "@/components/HeroBanner/HeroBanner5";
import HeroBanner6 from "@/components/HeroBanner/HeroBanner6";
import HeroBanner7 from "@/components/HeroBanner/HeroBanner7";
import HeroBanner8 from "@/components/HeroBanner/HeroBanner8";
import HeroBanner9 from "@/components/HeroBanner/HeroBanner9";
// ---
type Props = {
  data: HomeContent["heroBanner"]; // 确保 data 是数组
  locale: Locale;
};

// 组件映射
const BannerComponents = [
  null, // 索引 0 不用
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

export default function HeroBanner({ data, locale }: Props) {
  // --- 确认传入的数据 ---

  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  // --- 获取轮播图 API 并设置监听器 (使用 reInit 事件) ---
  React.useEffect(() => {
    if (!api) {
      return;
    }

    // 定义事件处理函数
    const onInitOrReinit = () => {
      // 安全检查 api 是否仍然存在
      if (!api) {
        console.error("EventHandler: API became unavailable during onInitOrReinit!");
        return;
      }
      try {
        const snaps = api.scrollSnapList();
        setScrollSnaps(snaps);
        // 同时更新当前 slide，确保初始状态正确
        setCurrentSlide(api.selectedScrollSnap());
      } catch (error) {
        console.error("EventHandler: Error getting snaps or slide index:", error);
      }
    };

    const onSelect = () => {
      // 安全检查 api 是否仍然存在
      if (!api) {
        console.error("EventHandler: API became unavailable during onSelect!");
        return;
      }
      try {
        setCurrentSlide(api.selectedScrollSnap());
      } catch (error) {
        console.error("EventHandler: Error getting selected snap:", error);
      }
    };

    // --- 监听事件 ---
    console.log("useEffect: Adding 'reInit' and 'select' listeners.");
    api.on("reInit", onInitOrReinit);
    api.on("select", onSelect);

    onInitOrReinit();

    // 清理监听器
    return () => {
      // 安全检查 api 是否仍然存在
      if (api) {
        api.off("reInit", onInitOrReinit);
        api.off("select", onSelect);
      }
    };
  }, [api]); // 依赖 api 保持不变

  // 点击小圆点跳转
  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    // 根容器: 确保它定义了高度
    <section className="relative w-full h-screen min-h-[800px]">
      <Carousel
        setApi={setApi}
        // Carousel 容器: 继承 section 的高度
        className="w-full h-screen min-h-[800px]"
        opts={{
          loop: true, 
          align: "start",
        }}
      >
        <CarouselContent 
            // ⬅️ 关键修正：确保 Flex 容器 h-full min-h-[700px]
            // m-0 移除，使用 tailwind 默认的负 margin (如果 carousel 库需要)
            className="h-screen min-h-[800px] m-0" 
        >
          {data && data.length > 0 ? (
            data.map((bannerData, index) => {
              const componentType = index + 1;
              const BannerComponent = BannerComponents[componentType];

              if (!BannerComponent) {
                return (
                  // CarouselItem: 确保其高度继承并设为 flex
                  <CarouselItem 
                    key={`fallback-${index}`} 
                    className="h-full min-h-[800px] p-0 basis-full flex items-center justify-center bg-red-500 text-white"
                  >
                    Error: Banner Component {componentType} missing
                  </CarouselItem>
                );
              }
              return (
                // CarouselItem: 确保其高度继承，并设为 flex 容器
                <CarouselItem 
                    key={index} 
                    className="h-full min-h-[700px] p-0 basis-full flex" // ⬅️ 确保 flex 布局，以便子组件 h-full 有效
                >
                  {/* ⬅️ 关键：BannerComponent 本身必须包含 w-full h-full 或 block/flex 才能继承 700px */}
                  <BannerComponent data={bannerData} locale={locale} /> 
                </CarouselItem>
              );
            })
          ) : (
            <CarouselItem className="h-full min-h-[700px] p-0 flex items-center justify-center bg-gray-700 text-white">
              No banner data available.
            </CarouselItem>
          )}
        </CarouselContent>

        {/* 左右导航按钮 (保持不变) */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex" />

      </Carousel>

      {/* 底部小圆点分页 */}
      {scrollSnaps.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200", // 保持放大尺寸
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