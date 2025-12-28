"use client";

import * as React from "react";
import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedBackgroundImage } from "@/components/ui/OptimizedImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Fade from "embla-carousel-fade";

type Props = {
  data: HomeContent["brandAnalysis"];
};

/**
 * Figma 设计稿 (1920px 宽度):
 *
 * BrandAnalysis: 1920 x 1449
 * - 背景: 黑色 + 图片
 *
 * Top 区域: x:160, y:215, 1607 x 555
 * - 大圆 (Ellipse 43): x:0, y:0, 555x555
 * - 外环 (Ellipse 44): x:441, y:29, 498x498, 白色描边
 * - 小圆 (Ellipse 45): x:606, y:194, 168x168
 * - 标题: x:597, y:406, 186x31, 32px Bold 居中
 * - 描述: x:1030, y:62, 577x231, 28px Medium 两端对齐 行高46px
 * - 左按钮: x:1118, y:422, 88x88, opacity 0.23
 * - 右按钮: x:1177, y:422, 88x88, opacity 0.54
 *
 * Bottom 区域: x:384, y:985, 1153 x 236
 * - Bus: x:250, y:3, 293x127, 128px ExtraBold 白色填充 右对齐
 * - rom: x:663, y:0, 333x127, 128px ExtraBold 白色描边 左对齐
 * - Buffer & Bridge: x:0, y:186, 543x47, 64px SemiBold 白色描边 右对齐
 * - Room & Space: x:663, y:189, 490x47, 64px SemiBold 白色填充 左对齐
 */

// 设计稿基准宽度
const DESIGN_WIDTH = 1920;
const TOP_WIDTH = 1607;
const TOP_HEIGHT = 555;
const BOTTOM_WIDTH = 1153;
const BOTTOM_HEIGHT = 236;

export default function BrandAnalysis({ data }: Props) {
  // 移动端 Carousel API
  const [mobileApi, setMobileApi] = React.useState<CarouselApi>();
  // 桌面端 Carousel API
  const [desktopApi, setDesktopApi] = React.useState<CarouselApi>();

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const fadePluginMobile = React.useRef(Fade({}));
  const fadePluginDesktop = React.useRef(Fade({}));

  // 移动端 API 事件
  React.useEffect(() => {
    if (!mobileApi) return;
    const onSelect = () => {
      setCurrentSlide(mobileApi.selectedScrollSnap());
      setCanScrollPrev(mobileApi.canScrollPrev());
      setCanScrollNext(mobileApi.canScrollNext());
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
      setCurrentSlide(desktopApi.selectedScrollSnap());
      setCanScrollPrev(desktopApi.canScrollPrev());
      setCanScrollNext(desktopApi.canScrollNext());
    };
    desktopApi.on("select", onSelect);
    desktopApi.on("reInit", onSelect);
    onSelect();
    return () => {
      desktopApi.off("select", onSelect);
      desktopApi.off("reInit", onSelect);
    };
  }, [desktopApi]);

  if (!data || !data.centers) {
    return null;
  }

  const currentCenter = data.centers[currentSlide];

  return (
    <section
      className="relative bg-black overflow-hidden"
      data-header-theme="transparent"
    >
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        {data.backgroundImage && (
          <OptimizedBackgroundImage
            image={data.backgroundImage}
            size="large"
            className="absolute inset-0 z-0"
          />
        )}
      </div>

      {/* ==================== 移动端布局 (<1024px) ==================== */}
      <div className="lg:hidden relative px-4 pt-16 pb-12 overflow-hidden">
        {/* 图形区域 - 与桌面端结构一致，圆心水平对齐，整体居中 */}
        <div className="relative w-full mb-4" style={{ aspectRatio: "1 / 0.55" }}>
          <Carousel
            setApi={setMobileApi}
            className="w-full h-full"
            plugins={[fadePluginMobile.current]}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent className="h-full m-0">
              {data.centers.map((center, index) => (
                <CarouselItem
                  key={center.title || index}
                  className="relative h-full p-0"
                >
                  <div className="relative w-full h-full">
                    {/*
                      圆心水平对齐计算（居中布局）：
                      - 整体宽度约 85%，left 偏移 7.5% 实现居中
                      - 大圆: 50% 宽度
                      - 外环: 38% 宽度
                      - 小圆: 14% 宽度，在外环中心
                    */}
                    {/* 大圆 */}
                    <div
                      className="absolute rounded-full overflow-hidden bg-[#d9d9d9]"
                      style={{
                        width: "50%",
                        aspectRatio: "1",
                        left: "8%",
                        top: "50%",
                        transform: "translateY(-50%)"
                      }}
                    >
                      {center.largeImage && (
                        <Image
                          src={center.largeImage}
                          alt={center.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* 外环 */}
                    <div
                      className="absolute rounded-full border border-white"
                      style={{
                        width: "38%",
                        aspectRatio: "1",
                        left: "46%",
                        top: "50%",
                        transform: "translateY(-50%)"
                      }}
                    />

                    {/* 小圆 - 在外环中心 */}
                    <div
                      className="absolute rounded-full overflow-hidden bg-[#d9d9d9]"
                      style={{
                        width: "14%",
                        aspectRatio: "1",
                        left: "58%",
                        top: "50%",
                        transform: "translateY(-50%)"
                      }}
                    >
                      {center.smallImage && (
                        <Image
                          src={center.smallImage}
                          alt={`${center.title} detail`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* 标题 - 图形下方 */}
        <h3 className="font-anaheim font-bold text-white text-center capitalize text-xl mb-4">
          {currentCenter?.title}
        </h3>

        {/* 描述文字 - 两侧padding */}
        <p className="text-white font-anaheim font-medium text-base leading-relaxed mb-6 text-justify px-4">
          {currentCenter?.description}
        </p>

        {/* 按钮 - 居中 */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => mobileApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(255, 255, 255, 0.23)" }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => mobileApi?.scrollNext()}
            disabled={!canScrollNext}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(255, 255, 255, 0.54)" }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bus rom 底部 - 使用 SVG 图片，左右分开 */}
        <div className="relative w-full px-4 flex justify-center gap-4">
          <img
            src="/CenterLabel1.svg"
            alt="Bus - Buffer & Bridge"
            className="h-auto w-[42%] max-w-[180px]"
          />
          <img
            src="/CenterLabel2.svg"
            alt="rom - Room & Space"
            className="h-auto w-[42%] max-w-[180px]"
          />
        </div>
      </div>

      {/* ==================== 桌面端布局 (>=1024px) - 等比例缩放 ==================== */}
      <div
        className="hidden lg:block relative"
        style={{ aspectRatio: `${DESIGN_WIDTH} / 1150` }}
      >
        {/* Top 区域容器 - 基于设计稿等比例定位 */}
        {/* 设计稿: x:160, y:100 相对于 1920x1150 */}
        <div
          className="absolute"
          style={{
            left: `${(160 / DESIGN_WIDTH) * 100}%`,
            top: `${(100 / 1150) * 100}%`,
            width: `${(TOP_WIDTH / DESIGN_WIDTH) * 100}%`,
            aspectRatio: `${TOP_WIDTH} / ${TOP_HEIGHT}`,
          }}
        >
          {/* 轮播图形区域 - 只包含圆形图片部分，宽度为 939px (大圆555 + 小圆到右边界) */}
          <div
            className="absolute"
            style={{
              left: "0%",
              top: "0%",
              width: `${(939 / TOP_WIDTH) * 100}%`,
              height: "100%",
            }}
          >
            <Carousel
              setApi={setDesktopApi}
              className="w-full h-full"
              plugins={[fadePluginDesktop.current]}
            >
              <CarouselContent className="h-full m-0">
                {data.centers.map((center, index) => (
                  <CarouselItem
                    key={center.title || index}
                    className="relative h-full p-0"
                  >
                    <div className="relative w-full h-full">
                      {/* 大圆 - x:0, y:0, 555x555 相对于 939x555 容器 */}
                      <div
                        className="absolute rounded-full overflow-hidden bg-[#d9d9d9]"
                        style={{
                          left: "0%",
                          top: "0%",
                          width: `${(555 / 939) * 100}%`,
                          height: "100%",
                        }}
                      >
                        {center.largeImage && (
                          <Image
                            src={center.largeImage}
                            alt={center.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* 外环 - x:441, y:29, 498x498 */}
                      <div
                        className="absolute rounded-full border border-white"
                        style={{
                          left: `${(441 / 939) * 100}%`,
                          top: `${(29 / TOP_HEIGHT) * 100}%`,
                          width: `${(498 / 939) * 100}%`,
                          height: `${(498 / TOP_HEIGHT) * 100}%`,
                        }}
                      />

                      {/* 小圆 - x:606, y:194, 168x168 */}
                      <div
                        className="absolute rounded-full overflow-hidden bg-[#d9d9d9]"
                        style={{
                          left: `${(606 / 939) * 100}%`,
                          top: `${(194 / TOP_HEIGHT) * 100}%`,
                          width: `${(168 / 939) * 100}%`,
                          height: `${(168 / TOP_HEIGHT) * 100}%`,
                        }}
                      >
                        {center.smallImage && (
                          <Image
                            src={center.smallImage}
                            alt={`${center.title} detail`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* 标题 - x:597, y:406, 32px */}
                      <h3
                        className="absolute font-anaheim font-bold text-white text-center capitalize"
                        style={{
                          left: `${(597 / 939) * 100}%`,
                          top: `${(406 / TOP_HEIGHT) * 100}%`,
                          fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
                        }}
                      >
                        {center.title}
                      </h3>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* 描述文字 - x:1030, y:62, 577x231, 28px */}
          <p
            className="absolute text-white font-anaheim font-medium capitalize"
            style={{
              left: `${(1030 / TOP_WIDTH) * 100}%`,
              top: `${(62 / TOP_HEIGHT) * 100}%`,
              width: `${(577 / TOP_WIDTH) * 100}%`,
              fontSize: `${(28 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${46 / 28}`,
              textAlign: "justify",
            }}
          >
            {currentCenter?.description}
          </p>

          {/* 按钮区域 - 左按钮 x:1118, 右按钮 x:1177, y:422, 88x88 */}
          <div
            className="absolute flex"
            style={{
              left: `${(1118 / TOP_WIDTH) * 100}%`,
              top: `${(422 / TOP_HEIGHT) * 100}%`,
              gap: `${(88 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            <button
              onClick={() => desktopApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="rounded-full flex items-center justify-center disabled:opacity-30"
              style={{
                width: `${(88 / DESIGN_WIDTH) * 100}vw`,
                height: `${(88 / DESIGN_WIDTH) * 100}vw`,
                background: "rgba(255, 255, 255, 0.23)",
              }}
            >
              <ChevronLeft className="w-[35%] h-[35%] text-white" />
            </button>
            <button
              onClick={() => desktopApi?.scrollNext()}
              disabled={!canScrollNext}
              className="rounded-full flex items-center justify-center disabled:opacity-30"
              style={{
                width: `${(88 / DESIGN_WIDTH) * 100}vw`,
                height: `${(88 / DESIGN_WIDTH) * 100}vw`,
                background: "rgba(255, 255, 255, 0.54)",
              }}
            >
              <ChevronRight className="w-[35%] h-[35%] text-white" />
            </button>
          </div>
        </div>

        {/* Bottom 区域容器 - Bus rom SVG 图片，左右分开 */}
        {/* 设计稿: x:384, y:780, 1153x236 相对于 1920x1150 */}
        <div
          className="absolute flex justify-center"
          style={{
            left: `${(384 / DESIGN_WIDTH) * 100}%`,
            top: `${(780 / 1150) * 100}%`,
            width: `${(BOTTOM_WIDTH / DESIGN_WIDTH) * 100}%`,
            aspectRatio: `${BOTTOM_WIDTH} / ${BOTTOM_HEIGHT}`,
            gap: `${(120 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          {/* CenterLabel1: Bus + Buffer & Bridge (左侧) */}
          <img
            src="/CenterLabel1.svg"
            alt="Bus - Buffer & Bridge"
            className="h-full w-auto object-contain"
          />
          {/* CenterLabel2: rom + Room & Space (右侧) */}
          <img
            src="/CenterLabel2.svg"
            alt="rom - Room & Space"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
