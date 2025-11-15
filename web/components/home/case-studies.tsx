"use client";

import * as React from "react";
import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

type Props = {
  data: HomeContent["caseStudies"];
};

type Application = HomeContent["caseStudies"]["applications"][number];

export default function CaseStudies({ data }: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect(); // 初始设置
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
    <section className="py-16 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        {/* --- 1. 顶部控制/标题区 (保持不变) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold font-anaheim text-brand-text-black mb-2">{data.title}</h2>
            <p className="text-brand-secondary font-anaheim font-medium max-w-lg">{data.description}</p>
          </div>
          <div className="flex gap-4">
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
              <ChevronLeft className="h-8 w-8" />
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
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </div>

        {/* --- 2. 轮播图 --- */}
        <Carousel setApi={setApi} opts={{ loop: false, align: "start" }}>
          <CarouselContent>
            {data.applications.map((application: Application, appIndex) => (
              <CarouselItem key={appIndex}>
                {/* 【修复 1】
                  添加这个 "content-wrapper" div。
                  CarouselItem 负责 flex 布局, 这个 div 负责 aspect-ratio。
                  我们使用 1920x750 (来自您设计稿的场景总宽和主图高)
                  或者一个更宽的比例，比如 2.3:1
                */}
                <div className="relative w-full aspect-[2.3/1]">
                  {/* 1. 主图 (z-0) - 使用 items[0] */}
                  {/* 【已修改】宽度 70%, 高度 100% (相对于 wrapper) */}
                  <div className="absolute left-0 top-0 w-[75%] h-full">
                    <Image
                      src={application.items[0]?.image.url || "/case-studies/1.jpg"}
                      alt={application.items[0]?.image.altText || application.items[0]?.series || "Case study main"}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* 2. 小图栈 (z-10) - 使用 items[1] 和 items[2] */}
                  <div
                    className={
                      "absolute z-10 h-[90%] top-1/2 -translate-y-1/2 " +
                      "flex flex-col lg:gap-4 gap-2 " +
                      // 【修复 2】
                      // 明确设置宽度和位置以创建重叠
                      // w-[45%] + right-[5%] = 从右侧 5% 处开始，宽度 45%
                      "w-[30%] right-[0%]"
                    }
                  >
                    {/* 小图 1 - 使用 items[1] */}
                    {/* 【已修改】让图片去填充一个具有正确比例的盒子 */}
                    <div className="relative w-full h-1/2 shadow-lg">
                      <Image
                        src={application.items[1]?.image.url || "/case-studies/2.jpg"}
                        alt={application.items[1]?.image.altText || application.items[1]?.series || "Case study detail 1"}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    {/* 小图 2 - 使用 items[2] */}
                    <div className="relative w-full h-1/2 shadow-lg">
                      <Image
                        src={application.items[2]?.image.url || "/case-studies/3.jpg"}
                        alt={application.items[2]?.image.altText || application.items[2]?.series || "Case study detail 2"}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
