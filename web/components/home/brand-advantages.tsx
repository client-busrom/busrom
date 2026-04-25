"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { OptimizedBackgroundImage } from "@/components/ui/OptimizedImage";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  data: HomeContent["brandAdvantages"];
};

const SECTION_HEIGHT = 2000;
const REVEAL_START_OFFSET = 100;
const HIDE_OFFSET = 500;

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
// Y 偏移量，用于整体调整 item 的垂直位置
const ITEMS_Y_OFFSET = -100;

const ADVANTAGE_POSITIONS_DESIGN = [
  // 0: 左上
  { x: 311, y: 70 + ITEMS_Y_OFFSET },
  // 1: 上中
  { x: 831, y: 0 + ITEMS_Y_OFFSET },
  // 2: 右上
  { x: 1232, y: 85 + ITEMS_Y_OFFSET },
  // 3: 左中
  { x: 43, y: 350 + ITEMS_Y_OFFSET },
  // 4: 左下
  { x: 196, y: 580 + ITEMS_Y_OFFSET },
  // 5: 下中
  { x: 590, y: 750 + ITEMS_Y_OFFSET },
  // 6: 下右
  { x: 1053, y: 700 + ITEMS_Y_OFFSET },
  // 7: 右中
  { x: 1565, y: 320 + ITEMS_Y_OFFSET },
  // 8: 右下
  { x: 1502, y: 550 + ITEMS_Y_OFFSET },
];

// "Busrom" 标题位置 - 视口中心偏上
const TITLE_Y = 278;
const TITLE_FONT_SIZE = 260;

// 图标圆圈尺寸
const ICON_SIZE = 66;

// 右上角 "Brand Advantage" 标题配置
const SECTION_TITLE = {
  x: 140, // 距离右边的距离 (px, 基于 1920)
  y: -220, // 距离顶部的距离 (px, 基于 1080)
  fontSize: 60, // 字体大小 (px, 基于 1920)
  lineHeight: 1.1, // 行高
};

/**
 * Check if a CMS icon value is valid (not empty / not default placeholder)
 */
function isValidCmsIcon(icon: string | undefined): icon is string {
  return !!icon && icon !== "lucide:sparkles";
}

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

    const isScrollingWithinSection =
      scrollY >= stickyStartPoint && scrollY <= sectionBottom;

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

      const scrollProgress = Math.min(
        1,
        Math.max(0, (scrollY - revealStart) / (revealEnd - revealStart)),
      );

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
          <Image
            src={svgSrc}
            alt={"Busrom Band"}
            fill
            sizes="100vw"
            className="object-cover"
          />
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
          {/* ==================== 移动端布局 - 树状分支 ==================== */}
          <div className="lg:hidden h-full flex flex-col items-center pt-6 pb-4 overflow-visible">
            {/* 顶部标题区 - 不受 max-w 限制 */}
            <div className="flex flex-col items-center w-full mb-0 px-4 relative z-10">
              {/* Brand Advantage 标题 */}
              <div className="font-anaheim font-extrabold text-white text-xl text-center leading-tight mb-2">
                <span>Brand Advantage</span>
              </div>
              {/* Busrom */}
              <h1
                className="font-pingfang font-semibold text-white"
                style={{ fontSize: "18vw" }}
              >
                Busrom
              </h1>
            </div>

            {/* 树状分支结构 - 限制最大宽度 */}
            <div className="relative flex-1 w-full max-w-md mx-auto px-4">
              {/* 中央主干线 - 向上延伸连接 Busrom */}
              <div className="absolute left-1/2 -top-4 bottom-0 w-0.5 bg-white/30 -translate-x-1/2" />

              {/* 分支节点 */}
              <div className="relative h-full flex flex-col justify-evenly py-2">
                {data.advantages.map((advantage, index) => {
                  const iconIndex = index + 1;
                  const isLeft = index % 2 === 0;

                  return (
                    <div
                      key={advantage}
                      className={cn(
                        "relative flex items-center gap-2",
                        isLeft
                          ? "flex-row pr-[52%]"
                          : "flex-row-reverse pl-[52%]",
                      )}
                    >
                      {/* 横向分支线 */}
                      <div
                        className={cn(
                          "absolute top-1/2 h-0.5 bg-white/30 -translate-y-1/2",
                          isLeft ? "right-[48%] w-[8%]" : "left-[48%] w-[8%]",
                        )}
                      />

                      {/* 图标 - CMS有值则用Iconify并加圆圈描边，否则用默认SVG */}
                      <div
                        className={cn(
                          "w-8 h-8 flex-shrink-0 relative z-10 flex items-center justify-center",
                          isValidCmsIcon(data.icons[index]) &&
                            "rounded-full border border-white/40",
                        )}
                      >
                        {isValidCmsIcon(data.icons[index]) ? (
                          <IconifyIcon
                            name={data.icons[index]}
                            size={18}
                            className="text-white"
                          />
                        ) : (
                          <Image
                            src={`/brand-adv-${iconIndex}.svg`}
                            alt={`Advantage ${iconIndex}`}
                            width={32}
                            height={32}
                            className="w-full h-full"
                          />
                        )}
                      </div>

                      {/* 文字 */}
                      <span
                        className={cn(
                          "font-anaheim text-white text-xs leading-tight whitespace-pre-line",
                          isLeft ? "text-right" : "text-left",
                        )}
                      >
                        {advantage.replace(/\\n|\/n/g, "\n")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ==================== 桌面端布局 - 按设计稿定位 ==================== */}
          <div
            className="hidden lg:block relative w-full h-full"
            style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
          >
            {/* 右上角 "Brand Advantage" 标题 */}
            <div
              className="absolute font-anaheim font-extrabold text-white text-right"
              style={{
                right: `${(SECTION_TITLE.x / DESIGN_WIDTH) * 100}%`,
                top: `${(SECTION_TITLE.y / DESIGN_HEIGHT) * 100}%`,
                fontSize: `${(SECTION_TITLE.fontSize / DESIGN_WIDTH) * 100}vw`,
                lineHeight: SECTION_TITLE.lineHeight,
              }}
            >
              <div>Brand</div>
              <div>Advantage</div>
            </div>

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
              const pos =
                ADVANTAGE_POSITIONS_DESIGN[
                  index % ADVANTAGE_POSITIONS_DESIGN.length
                ];
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
                  {/* 图标 - CMS有值则用Iconify并加圆圈描边，否则用默认SVG */}
                  <div
                    className={cn(
                      "flex-shrink-0 flex items-center justify-center",
                      isValidCmsIcon(data.icons[index]) &&
                        "rounded-full border border-white/40",
                    )}
                    style={{
                      width: `${(ICON_SIZE / DESIGN_WIDTH) * 100}vw`,
                      height: `${(ICON_SIZE / DESIGN_WIDTH) * 100}vw`,
                    }}
                  >
                    {isValidCmsIcon(data.icons[index]) ? (
                      <IconifyIcon
                        name={data.icons[index]}
                        className="text-white"
                        size={32}
                      />
                    ) : (
                      <Image
                        src={`/brand-adv-${iconIndex}.svg`}
                        alt={`Advantage ${iconIndex}`}
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  {/* 文字 - 支持 \n 和 /n 换行 */}
                  <span
                    className="font-anaheim text-white whitespace-pre-line"
                    style={{
                      fontSize: `${(18 / DESIGN_WIDTH) * 100}vw`,
                      lineHeight: 1.3,
                    }}
                  >
                    {advantage.replace(/\\n|\/n/g, "\n")}
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
