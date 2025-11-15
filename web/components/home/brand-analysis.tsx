"use client";

import * as React from "react";
// 假设 HomeContent["brandAnalysis"] 的类型
import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// 【新】导入 Fade 插件
import Fade from "embla-carousel-fade";

type Props = {
  data: HomeContent["brandAnalysis"]; // 旧类型
};

// 轮播图 SVG 路径
const svgImages = [
  "/BusromCenter1.svg",
  "/BusromCenter2.svg",
  "/BusromCenter3.svg",
];

export default function BrandAnalysis({ data }: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  // 【新】为 Fade 插件创建一个 ref
  const fadePlugin = React.useRef(
    Fade({
      // crossfade: true, // 您可以取消注释这个来实现交叉淡入淡出
    })
  );

  // ---
  // Carousel API 和同步逻辑 (保持不变)
  // ---
  React.useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <section className="py-16 bg-[#000000] min-h-[100vh]" data-header-theme="transparent">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center mb-24">
          
          {/* 左列: 图片轮播 */}
          <div className="w-full h-[500px]">
            <Carousel
              setApi={setApi}
              // 【已修改】将 aspect-square 移到这里 (动态高度)
              className="w-full h-[500px]"
              // 【已修改】加载 Fade 插件 (淡入淡出效果)
              plugins={[fadePlugin.current]}
            >
              <CarouselContent className="h-full m-0  h-[400px]">
                {data.centers.map((center, index) => (
                  // 【已修改】移除内部 div，并添加 p-0 (插件要求)
                  <CarouselItem key={center.title} className="relative h-full p-0">
                    {/* SVG 图片 */}
                    <Image
                      src={svgImages[index % svgImages.length]}
                      alt={center.title}
                      fill
                      className="object-contain" // SVGs 使用 object-contain
                    />
                    {/* 图片上的标题 (保留您的样式) */}
                    <h3 className="absolute text-center bottom-[34%] right-[13.5%] z-10 text-lg font-bold text-brand-text-inverse">
                      {center.title}
                    </h3>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* 右列: 同步的描述和按钮 (保持不变) */}
          <div className="flex flex-col h-full justify-center">
            <p className="text-brand-text-inverse text-lg mb-8 min-h-[120px] font-anaheim font-medium">
              {data.centers[currentSlide]?.description}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="
                  rounded-full 
                  border-[#756F3F] 
                  text-[#756F3F] 
                  transition-colors 
                  hover:bg-[#756F3F] 
                  hover:text-brand-text-inverse
                "
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="
                  rounded-full 
                  border-[#756F3F] 
                  text-[#756F3F] 
                  transition-colors 
                  hover:bg-[#756F3F] 
                  hover:text-brand-text-inverse
                "
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* 底部 "Bus rom" 部分 (保持不变) */}
        <div className="text-center">
          <div className="text-5xl lg:text-7xl flex justify-center items-center gap-8 font-extrabold font-anaheim">
            <span className="text-brand-text-inverse text-right">
              {data.analysis.title}
            </span>
            <span className="text-left text-transparent [-webkit-text-stroke:1px_#ffffff]">
              {data.analysis.title2}
            </span>
          </div>
          <div className="text-lg lg:text-2xl flex justify-center items-center gap-24 font-anaheim font-semibold">
            <span className="text-right text-transparent [-webkit-text-stroke:1px_#ffffff]">
              {data.analysis.text}
            </span>
            <span className="text-left text-brand-text-inverse">
              {data.analysis.text2}
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}