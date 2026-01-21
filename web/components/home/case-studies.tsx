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

// 布局配置 - 基于 Figma JSON
const LAYOUT = {
  // 整体尺寸
  width: 1920,
  height: 922,
  paddingLeft: 158,

  // 标题
  header: {
    titleY: 21,
    titleFontSize: 80,
    titleLineHeight: 95,
    subtitleY: 135,
    subtitleFontSize: 16,
    subtitleLineHeight: 30,
  },

  // 导航按钮
  nav: {
    y: 62,
    size: 88,
    leftX: 1485,
    rightX: 1673,
    gap: 100, // 1673 - 1485 - 88 = 100
  },

  // 图片区域
  images: {
    mainX: 220,
    mainY: 211,
    mainWidth: 1135,
    mainHeight: 689,
    borderRadius: 30,
    // 小图
    smallX: 1251,
    small1Y: 266,
    small1Width: 446,
    small1Height: 270,
    small2Y: 560,
    small2Width: 446,
    small2Height: 289,
    smallGap: 24, // 560 - 266 - 270 = 24
  },
};

export default function CaseStudies({ data }: Props) {
  // 移动端 Carousel API
  const [mobileApi, setMobileApi] = React.useState<CarouselApi>();
  const [mobileCanScrollPrev, setMobileCanScrollPrev] = React.useState(false);
  const [mobileCanScrollNext, setMobileCanScrollNext] = React.useState(true);

  // 桌面端 Carousel API
  const [desktopApi, setDesktopApi] = React.useState<CarouselApi>();
  const [desktopCanScrollPrev, setDesktopCanScrollPrev] = React.useState(false);
  const [desktopCanScrollNext, setDesktopCanScrollNext] = React.useState(true);

  // 移动端 API 事件
  React.useEffect(() => {
    if (!mobileApi) return;
    const onSelect = () => {
      setMobileCanScrollPrev(mobileApi.canScrollPrev());
      setMobileCanScrollNext(mobileApi.canScrollNext());
    };
    mobileApi.on("select", onSelect);
    mobileApi.on("reInit", onSelect);
    onSelect();
    return () => {
      mobileApi.off("select", onSelect);
      mobileApi.off("reInit", onSelect);
    };
  }, [mobileApi]);

  // 桌面端 API 事件
  React.useEffect(() => {
    if (!desktopApi) return;
    const onSelect = () => {
      setDesktopCanScrollPrev(desktopApi.canScrollPrev());
      setDesktopCanScrollNext(desktopApi.canScrollNext());
    };
    desktopApi.on("select", onSelect);
    desktopApi.on("reInit", onSelect);
    onSelect();
    return () => {
      desktopApi.off("select", onSelect);
      desktopApi.off("reInit", onSelect);
    };
  }, [desktopApi]);

  // Guard: if no data, don't render
  if (!data || !data.applications || data.applications.length === 0) {
    return null;
  }

  // 从每个 application 的 sceneGallery 中提取图片用于展示
  // 取前3个场景，每个场景选第一张图片（确定性选择，便于缓存）
  const getDisplayImages = React.useCallback((app: CaseStudyApplication): ImageObject[] => {
    const images: ImageObject[] = [];
    const scenes = app.sceneGallery || [];

    // 取前3个场景
    for (let i = 0; i < Math.min(3, scenes.length); i++) {
      const scene = scenes[i];
      if (scene.images && scene.images.length > 0) {
        // 选第一张图片（确定性选择，避免每次渲染变化）
        const img = scene.images[0];
        if (img) {
          images.push(img);
        }
      }
    }

    return images;
  }, []);

  // rpx 转换函数
  const rpx = (px: number) => `calc(var(--rpx) * ${px})`;

  return (
    <section
      className="relative bg-brand-main md:py-0 py-12"
      data-header-theme="light"
    >
      {/* ==================== 移动端布局 ==================== */}
      <div className="md:hidden container mx-auto px-4">
        {/* 标题 */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-anaheim font-extrabold text-2xl text-black">
              {data.title}
            </h2>
            <p className="font-anaheim font-medium text-sm text-[#756F3F] mt-2">
              {data.description}
            </p>
          </div>
          {/* 导航按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white disabled:opacity-50"
              onClick={() => mobileApi?.scrollPrev()}
              disabled={!mobileCanScrollPrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-[#756F3F] text-white hover:bg-[#5a5530] disabled:opacity-50"
              onClick={() => mobileApi?.scrollNext()}
              disabled={!mobileCanScrollNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 轮播图 */}
        <Carousel setApi={setMobileApi} opts={{ loop: false, align: "start" }}>
          <CarouselContent>
            {data.applications.map((application, appIndex) => {
              const displayImages = getDisplayImages(application);
              if (displayImages.length === 0) return null;
              return (
                <CarouselItem key={appIndex} className="basis-full">
                  <div className="space-y-3">
                    {/* 主图 */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                      <OptimizedImage
                        image={displayImages[0]}
                        alt={displayImages[0]?.altText || application.name || "Case study"}
                        size="medium"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white font-bold font-anaheim text-lg">{application.name}</h3>
                      </div>
                    </div>
                    {/* 小图 */}
                    {displayImages.length > 1 && (
                      <div className="grid grid-cols-2 gap-3">
                        {displayImages[1] && (
                          <div className="aspect-[3/2] rounded-lg overflow-hidden">
                            <OptimizedImage
                              image={displayImages[1]}
                              alt="Case study detail 1"
                              size="small"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        {displayImages[2] && (
                          <div className="aspect-[3/2] rounded-lg overflow-hidden">
                            <OptimizedImage
                              image={displayImages[2]}
                              alt="Case study detail 2"
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

      {/* ==================== 桌面端布局 ==================== */}
      <div
        className="hidden md:block relative"
        style={{
          height: rpx(LAYOUT.height),
          paddingLeft: rpx(LAYOUT.paddingLeft),
          paddingTop: rpx(LAYOUT.header.titleY),
        }}
      >
        {/* 主标题 */}
        <h2
          className="font-anaheim font-extrabold text-black"
          style={{
            fontSize: rpx(LAYOUT.header.titleFontSize),
            lineHeight: rpx(LAYOUT.header.titleLineHeight),
            WebkitTextStroke: `calc(4 * var(--rpx)) #756f3f`,
            paintOrder: 'stroke fill',
          }}
        >
          {data.title}
        </h2>

        {/* 副标题 */}
        <p
          className="font-anaheim font-medium text-[#756F3F]"
          style={{
            fontSize: rpx(LAYOUT.header.subtitleFontSize),
            lineHeight: rpx(LAYOUT.header.subtitleLineHeight),
            marginTop: rpx(LAYOUT.header.subtitleY - LAYOUT.header.titleY - LAYOUT.header.titleLineHeight),
          }}
        >
          {data.description}
        </p>

        {/* 导航按钮 - 绝对定位 */}
        <div
          className="absolute flex"
          style={{
            top: rpx(LAYOUT.nav.y),
            left: rpx(LAYOUT.nav.leftX),
            gap: rpx(LAYOUT.nav.gap),
          }}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-[#756F3F] text-[#756F3F] transition-colors hover:bg-[#756F3F] hover:text-white disabled:opacity-50"
            style={{
              width: rpx(LAYOUT.nav.size),
              height: rpx(LAYOUT.nav.size),
            }}
            onClick={() => desktopApi?.scrollPrev()}
            disabled={!desktopCanScrollPrev}
          >
            <ChevronLeft style={{ width: rpx(20), height: rpx(34) }} />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            size="icon"
            className="rounded-full bg-[#756F3F] text-white transition-colors hover:bg-[#5a5530] disabled:opacity-50"
            style={{
              width: rpx(LAYOUT.nav.size),
              height: rpx(LAYOUT.nav.size),
            }}
            onClick={() => desktopApi?.scrollNext()}
            disabled={!desktopCanScrollNext}
          >
            <ChevronRight style={{ width: rpx(20), height: rpx(34) }} />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>

        {/* 轮播图区域 */}
        <div
          style={{
            marginTop: rpx(LAYOUT.images.mainY - LAYOUT.header.subtitleY - LAYOUT.header.subtitleLineHeight),
            marginLeft: rpx(LAYOUT.images.mainX - LAYOUT.paddingLeft),
          }}
        >
          <Carousel setApi={setDesktopApi} opts={{ loop: false, align: "start" }}>
            <CarouselContent>
              {data.applications.map((application, appIndex) => {
                const displayImages = getDisplayImages(application);
                if (displayImages.length === 0) return null;

                return (
                  <CarouselItem key={appIndex} className="basis-full">
                    <div
                      className="relative"
                      style={{ height: rpx(LAYOUT.images.mainHeight) }}
                    >
                      {/* 主图 */}
                      <div
                        className="absolute left-0 top-0 overflow-hidden"
                        style={{
                          width: rpx(LAYOUT.images.mainWidth),
                          height: rpx(LAYOUT.images.mainHeight),
                          borderRadius: rpx(LAYOUT.images.borderRadius),
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
                            padding: rpx(32),
                            borderRadius: `0 0 ${rpx(LAYOUT.images.borderRadius)} ${rpx(LAYOUT.images.borderRadius)}`,
                          }}
                        >
                          <h3
                            className="text-white font-bold font-anaheim"
                            style={{ fontSize: rpx(36) }}
                          >
                            {application.name}
                          </h3>
                          {application.category && (
                            <p
                              className="text-white/80 font-anaheim"
                              style={{
                                fontSize: rpx(20),
                                marginTop: rpx(8),
                              }}
                            >
                              {application.category.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 小图区域 */}
                      {displayImages.length > 1 && (
                        <div
                          className="absolute flex flex-col"
                          style={{
                            left: rpx(LAYOUT.images.smallX - LAYOUT.images.mainX),
                            top: rpx(LAYOUT.images.small1Y - LAYOUT.images.mainY),
                            gap: rpx(LAYOUT.images.smallGap),
                          }}
                        >
                          {/* 小图 1 */}
                          {displayImages[1] && (
                            <div
                              className="overflow-hidden"
                              style={{
                                width: rpx(LAYOUT.images.small1Width),
                                height: rpx(LAYOUT.images.small1Height),
                                borderRadius: rpx(LAYOUT.images.borderRadius),
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

                          {/* 小图 2 */}
                          {displayImages[2] && (
                            <div
                              className="overflow-hidden"
                              style={{
                                width: rpx(LAYOUT.images.small2Width),
                                height: rpx(LAYOUT.images.small2Height),
                                borderRadius: rpx(LAYOUT.images.borderRadius),
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
      </div>
    </section>
  );
}
