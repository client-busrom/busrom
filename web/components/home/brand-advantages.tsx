"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { OptimizedBackgroundImage } from "@/components/ui/OptimizedImage";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  data: HomeContent["brandAdvantages"];
};

const SECTION_HEIGHT = 2000;
const REVEAL_START_OFFSET = 100;
const HIDE_OFFSET = 400;

// 设计稿基准尺寸 - 基于视口高度 (100vh ≈ 1080px)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080; // 视口高度

// 从设计稿提取的精确位置
// Figma 原始坐标 (基于1382高度的设计)，缩放到1080视口
// Figma Group 161 高度=1382, 缩放系数 = 1080/1382 = 0.7814
// Busrom 在 Figma 中 y=204 (相对于 section top), 缩放后 = 159
// 将 Busrom 放在视口中心偏上位置 (约 35% = 378)
// 偏移量 = 378 - 159 = 219

// 各 item 原始相对位置 (相对于 section top) + 缩放 + 偏移
const ADVANTAGE_POSITIONS_DESIGN = [
  // 0: 左上
  { x: 311, y: 70 },
  // 1: 上中
  { x: 831, y: 0 },
  // 2: 右上
  { x: 1232, y: 85 },
  // 3: 左中
  { x: 43, y: 350 },
  // 4: 左下
  { x: 196, y: 580 },
  // 5: 下中
  { x: 590, y: 750 },
  // 6: 下右
  { x: 1053, y: 700 },
  // 7: 右中
  { x: 1565, y: 320 },
  // 8: 右下
  { x: 1502, y: 550 },
];

// "Busrom" 标题位置 - 视口中心偏上
const TITLE_Y = 378;
const TITLE_FONT_SIZE = 300;

// 图标圆圈尺寸
const ICON_SIZE = 66;

export default function BrandAdvantages({ data }: Props) {
  const isMobile = useIsMobile(); // ⬅️ 引入移动端判断

  const [isSticky, setIsSticky] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const svgSrc = isMobile ? "BusromBandMobile.svg" : "BusromBand.svg";

  const handleScroll = useCallback(() => {
    if (!sectionRef.current || !imageWrapperRef.current) return;

    const sectionEl = sectionRef.current;

    const imageEl = imageWrapperRef.current;

    const scrollY = window.scrollY;

    const sectionTop = sectionEl.offsetTop;

    const sectionBottom = sectionTop + sectionEl.offsetHeight;

    const imageOriginalHeight = imageEl.offsetHeight;

    const stickyStartPoint = sectionTop;

    const stickyEndPoint = sectionBottom - imageOriginalHeight - HIDE_OFFSET;

    const isScrollingWithinSection = scrollY >= stickyStartPoint && scrollY <= sectionBottom;

    if (isScrollingWithinSection) {
      if (scrollY >= stickyStartPoint && scrollY < stickyEndPoint) {
        setIsSticky(true);

        setIsHidden(false);
      } else if (scrollY >= stickyEndPoint) {
        setIsSticky(false);

        setIsHidden(true);
      } else {
        setIsSticky(false);

        setIsHidden(false);
      }

      const revealStart = stickyEndPoint - REVEAL_START_OFFSET;

      const revealEnd = stickyEndPoint;

      const scrollProgress = Math.min(1, Math.max(0, (scrollY - revealStart) / (revealEnd - revealStart)));

      setContentOpacity(scrollProgress);
    } else if (scrollY < stickyStartPoint) {
      setIsSticky(false);

      setIsHidden(false);

      setContentOpacity(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const imageStyle = {
    position: isSticky ? "fixed" : "relative",

    top: isSticky ? 0 : "auto",

    opacity: isHidden ? 0 : 1,

    transition: "opacity 0.3s",
  } as React.CSSProperties;

  if (isSticky === false && isHidden === true) {
    imageStyle.position = "absolute";

    imageStyle.top = `${SECTION_HEIGHT - imageWrapperRef.current!.offsetHeight - HIDE_OFFSET}px`;

    imageStyle.opacity = 0;
  }

  const imageSpacerStyle = {
    height: isSticky ? imageWrapperRef.current?.offsetHeight : "auto",
  };

  // Guard: if no data, don't render
  if (!data || !data.advantages || !data.icons) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="bg-gray-800 text-white relative"
      data-header-theme="transparent"
      style={{ minHeight: `${SECTION_HEIGHT}px` }}
    >
      {data.image?.url && (
        <OptimizedBackgroundImage
          image={data.image}
          size="xlarge"
          className="absolute inset-0 z-0"
        />
      )}

      <div className="w-full">
        {/* 1. 磁吸图片容器 */}
        <div
          ref={imageWrapperRef}
          className={cn("w-full h-[100vh] z-30", {
            relative: !isSticky && !isHidden,
            fixed: isSticky,
            "top-0": isSticky,
            "pointer-events-none": contentOpacity > 0,
          })}
          style={imageStyle}
        >
          {isSticky && <div style={imageSpacerStyle} />}
          <Image src={svgSrc} alt={"Busrom Band"} fill sizes="100vw" className="object-cover" />
        </div>

        {/* 2. 下方内容区域 (揭示文字) */}
        <div
          className="absolute bottom-0 w-full z-10 h-[100vh]"
          style={{
            bottom: `0px`,
            opacity: contentOpacity,
            transition: "opacity 0.5s",
          }}
        >
          {/* ==================== 移动端布局 ==================== */}
          <div className="lg:hidden h-full flex flex-col justify-center items-center px-6 py-8">
            {/* 移动端标题 */}
            <h1 className="text-center font-pingfang font-semibold text-white text-7xl mb-8">
              Busrom
            </h1>

            {/* 移动端 advantages 列表 - 两列网格 */}
            <ul className="grid grid-cols-2 gap-4 w-full max-w-md">
              {data.advantages.map((advantage, index) => {
                const iconIndex = index + 1;
                return (
                  <li
                    key={advantage}
                    className="flex items-center gap-2 p-2"
                  >
                    <div className="w-10 h-10 flex-shrink-0">
                      <Image
                        src={`/brand-adv-${iconIndex}.svg`}
                        alt={`Advantage ${iconIndex}`}
                        width={40}
                        height={40}
                        className="w-full h-full"
                      />
                    </div>
                    <span className="font-anaheim text-white text-xs leading-tight whitespace-pre-line">
                      {advantage.replace(/\\n|\/n/g, '\n')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ==================== 桌面端布局 - 按设计稿定位 ==================== */}
          <div
            className="hidden lg:block relative w-full h-full"
            style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
          >
            {/* 中心 "Busrom" 标题 */}
            <h1
              className="absolute font-pingfang font-semibold text-white whitespace-nowrap"
              style={{
                left: "50%",
                top: `${(TITLE_Y / DESIGN_HEIGHT) * 100}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${(TITLE_FONT_SIZE / DESIGN_WIDTH) * 100}vw`,
                lineHeight: 1,
              }}
            >
              Busrom
            </h1>

            {/* Advantages 按设计稿位置分布 */}
            {data.advantages.map((advantage, index) => {
              const pos = ADVANTAGE_POSITIONS_DESIGN[index % ADVANTAGE_POSITIONS_DESIGN.length];
              const iconIndex = index + 1; // SVG 文件从 1 开始编号

              return (
                <div
                  key={advantage}
                  className="absolute flex items-center gap-3 hover:scale-105 transition-transform duration-300"
                  style={{
                    left: `${(pos.x / DESIGN_WIDTH) * 100}%`,
                    top: `${(pos.y / DESIGN_HEIGHT) * 100}%`,
                  }}
                >
                  {/* SVG 图标 */}
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: `${(ICON_SIZE / DESIGN_WIDTH) * 100}vw`,
                      height: `${(ICON_SIZE / DESIGN_WIDTH) * 100}vw`,
                    }}
                  >
                    <Image
                      src={`/brand-adv-${iconIndex}.svg`}
                      alt={`Advantage ${iconIndex}`}
                      width={ICON_SIZE}
                      height={ICON_SIZE}
                      className="w-full h-full"
                    />
                  </div>
                  {/* 文字 - 支持 \n 和 /n 换行 */}
                  <span
                    className="font-anaheim text-white whitespace-pre-line"
                    style={{
                      fontSize: `${(18 / DESIGN_WIDTH) * 100}vw`,
                      lineHeight: 1.3,
                    }}
                  >
                    {advantage.replace(/\\n|\/n/g, '\n')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
