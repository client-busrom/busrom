"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { CaseStudiesData, CaseStudyApplication, ImageObject } from "@/lib/content-data";

type Props = {
  data: CaseStudiesData;
};

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

  // Guard: if no data, don't render
  if (!data || !data.applications || data.applications.length === 0) {
    return null;
  }

  // 从每个 application 的 sceneGallery 中提取图片用于展示
  // 取前3个场景，每个场景随机选一张图片
  const getDisplayImages = React.useCallback((app: CaseStudyApplication): ImageObject[] => {
    const images: ImageObject[] = [];
    const scenes = app.sceneGallery || [];

    // 取前3个场景
    for (let i = 0; i < Math.min(3, scenes.length); i++) {
      const scene = scenes[i];
      if (scene.images && scene.images.length > 0) {
        // 随机选一张图片
        const randomIndex = Math.floor(Math.random() * scene.images.length);
        const img = scene.images[randomIndex];
        if (img) {
          images.push(img);
        }
      }
    }

    return images;
  }, []);

  return (
    <section
      className="relative bg-brand-main"
      data-header-theme="light"
      style={{
        height: 'calc(var(--rpx) * 1080)',
        paddingLeft: 'calc(var(--rpx) * 156)',
        paddingTop: 'calc(var(--rpx) * 43)',
      }}
    >
      {/* 标题区域 */}
      {/* 主标题 - Figma: x=156, y=43, 80px ExtraBold, 行高 95px */}
      <h2
        className="font-anaheim font-extrabold text-black"
        style={{
          fontSize: 'calc(var(--rpx) * 80)',
          lineHeight: 'calc(var(--rpx) * 95)',
        }}
      >
        {data.title}
      </h2>

      {/* 副标题 - Figma: x=156, y=157, 32px Medium, 颜色 #756F3F, 行高 30px */}
      {/* y=157 - y=43 - 95 = 19px 间距 */}
      <p
        className="font-anaheim font-medium text-[#756F3F]"
        style={{
          fontSize: 'calc(var(--rpx) * 32)',
          lineHeight: 'calc(var(--rpx) * 30)',
          marginTop: 'calc(var(--rpx) * 19)',
        }}
      >
        {data.description}
      </p>

      {/* 导航按钮 - 移动端固定尺寸，桌面端按 Figma 定位 */}
      <div
        className="absolute flex gap-3 md:gap-4 right-4 md:right-6 top-4 lg:top-[calc(var(--rpx)*84)] lg:right-[calc(var(--rpx)*157)] lg:gap-[calc(var(--rpx)*100)]"
      >
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 md:w-14 md:h-14 lg:w-[calc(var(--rpx)*88)] lg:h-[calc(var(--rpx)*88)] rounded-full border-[#756F3F] text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white disabled:opacity-50"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 md:w-14 md:h-14 lg:w-[calc(var(--rpx)*88)] lg:h-[calc(var(--rpx)*88)] rounded-full bg-[#756F3F] text-white transition-colors hover:bg-[#5a5530] disabled:opacity-50"
          onClick={scrollNext}
          disabled={!canScrollNext}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      {/* 轮播图区域 - Figma: 主图 y=287, 副标题底部 y=157+30=187, 间距=100px */}
      <div style={{ marginTop: 'calc(var(--rpx) * 100)' }}>
          <Carousel setApi={setApi} opts={{ loop: false, align: "start" }}>
            <CarouselContent>
              {data.applications.map((application, appIndex) => {
                const displayImages = getDisplayImages(application);

                // 需要至少1张图片才显示
                if (displayImages.length === 0) return null;

                return (
                  <CarouselItem key={appIndex}>
                    {/* 图片容器 - Figma: 主图 x=156(已通过padding处理), y=287 */}
                    {/* 小图 x=1278, 相对于主图左边缘: 1278-156=1122 */}
                    <div
                      className="relative"
                      style={{ height: 'calc(var(--rpx) * 750)' }}
                    >
                      {/* 主图 - Figma: 1235x750, 圆角 30px */}
                      <div
                        className="absolute left-0 top-0 overflow-hidden"
                        style={{
                          width: 'calc(var(--rpx) * 1235)',
                          height: 'calc(var(--rpx) * 750)',
                          borderRadius: 'calc(var(--rpx) * 30)',
                        }}
                      >
                        <OptimizedImage
                          image={displayImages[0]}
                          alt={displayImages[0]?.altText || application.name || "Case study main"}
                          size="large"
                          className="object-cover w-full h-full"
                        />
                        {/* 应用名称覆盖层 */}
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent"
                          style={{
                            padding: 'calc(var(--rpx) * 32)',
                            borderRadius: '0 0 calc(var(--rpx) * 30) calc(var(--rpx) * 30)',
                          }}
                        >
                          <h3
                            className="text-white font-bold font-anaheim"
                            style={{ fontSize: 'calc(var(--rpx) * 36)' }}
                          >
                            {application.name}
                          </h3>
                          {application.category && (
                            <p
                              className="text-white/80 font-anaheim"
                              style={{
                                fontSize: 'calc(var(--rpx) * 20)',
                                marginTop: 'calc(var(--rpx) * 8)',
                              }}
                            >
                              {application.category.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 小图区域 - Figma: x=1278, 相对主图左边缘1122px */}
                      {/* 小图1: y=347, 相对主图顶部: 347-287=60 */}
                      {/* 小图2: y=667, 小图1底部: 347+294=641, 间距: 667-641=26 */}
                      {displayImages.length > 1 && (
                        <div
                          className="absolute flex flex-col"
                          style={{
                            left: 'calc(var(--rpx) * 1122)', // 1278 - 156 = 1122
                            top: 'calc(var(--rpx) * 60)', // 347 - 287 = 60
                            gap: 'calc(var(--rpx) * 26)', // 667 - 641 = 26
                          }}
                        >
                          {/* 小图 1 - Figma: 485x294, 圆角 30px */}
                          {displayImages[1] && (
                            <div
                              className="overflow-hidden"
                              style={{
                                width: 'calc(var(--rpx) * 485)',
                                height: 'calc(var(--rpx) * 294)',
                                borderRadius: 'calc(var(--rpx) * 30)',
                              }}
                            >
                              <OptimizedImage
                                image={displayImages[1]}
                                alt={displayImages[1]?.altText || "Case study detail 1"}
                                size="small"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}

                          {/* 小图 2 - Figma: 485x315, 圆角 30px */}
                          {displayImages[2] && (
                            <div
                              className="overflow-hidden"
                              style={{
                                width: 'calc(var(--rpx) * 485)',
                                height: 'calc(var(--rpx) * 315)',
                                borderRadius: 'calc(var(--rpx) * 30)',
                              }}
                            >
                              <OptimizedImage
                                image={displayImages[2]}
                                alt={displayImages[2]?.altText || "Case study detail 2"}
                                size="small"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
    </section>
  );
}
