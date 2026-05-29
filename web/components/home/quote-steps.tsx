"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { StepNumber } from "./StepNumbers";

type Props = {
  data: HomeContent["quoteSteps"];
  headerTheme?: string;
  className?: string;
};

// 数字弹跳动画组件
function AnimatedNumber({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn("inline-block animate-bounce-number", className)}
      style={style}
    >
      {value}
    </span>
  );
}

const AUTO_SCROLL_INTERVAL = 4000; // 4 秒自动轮播
const ROTATION_DEGREES = -15; // 逆时针旋转 15 度

/**
 * Quote Steps Section
 *
 * 设计分辨率: 1920 宽度，内容区域 1607x1273 居中
 *
 * Figma 关键位置 (基于 1920 宽度):
 * - 内容区域左边距: 160px (8.33%)
 * - "Design Project Solutions": x=160, y=0 (相对 section)
 * - "Just Easy 5 Steps": x=160, y=82
 * - "From concept to reality...": x=160, y=201
 * - 描述文字: x=1339 (69.74%), 装饰圆点 x=1303 (67.86%)
 * - 步骤区域: y=358 (相对 section top)
 * - 步骤序号: x=425 (22.14%)
 * - 步骤文字: x=735 (38.28%)
 */
export default function QuoteSteps({ data, headerTheme, className }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const title2Text = data.headerTitle2 || "";
  // 使用正则表达式匹配第一个数字或数字串
  const parts = title2Text.split(/(\d+)/);

  const activeIndexToDisplay = hoveredIndex !== -1 ? hoveredIndex : activeIndex;

  // --- 轮播控制函数 ---
  const handleNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % data.steps.length);
  }, [data.steps.length]);

  // 视口检测 - 不在视口时暂停轮播省电
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

  // --- 自动轮播 (仅在视口内运行) ---
  useEffect(() => {
    if (!isVisible) return;

    // 自动轮播定时器
    const startInterval = () => {
      intervalRef.current = setInterval(handleNext, AUTO_SCROLL_INTERVAL);
    };
    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    startInterval();

    return () => {
      stopInterval();
    };
  }, [handleNext, isVisible]);

  // --- 交互处理 ---
  const handleMouseEnter = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    if (!intervalRef.current && isVisible) {
      intervalRef.current = setInterval(handleNext, AUTO_SCROLL_INTERVAL);
    }
    setHoveredIndex(-1);
  };

  // Guard: if no data, don't render
  if (!data || !data.steps || data.steps.length === 0) {
    return null;
  }

  // 设计稿尺寸
  const DESIGN_WIDTH = 1920;
  const PADDING_TOP = 100; // 上方留白
  const PADDING_BOTTOM = 150; // 下方留白
  const STEPS_OFFSET = 100; // 步骤区域与标题的额外间距
  const CONTENT_HEIGHT = 1273; // 原始内容区域高度
  const DESIGN_HEIGHT = CONTENT_HEIGHT + PADDING_TOP + PADDING_BOTTOM + STEPS_OFFSET; // 总高度

  // 步骤位置配置 (基于 Figma JSON + 上方留白 + 额外间距)
  // 步骤区域起始 y=358 (相对于 section top = 11111-10753)
  // 每个步骤间距约 194-202px
  const stepPositions = [
    { top: 358 + PADDING_TOP + STEPS_OFFSET, number: "01" },
    { top: 560 + PADDING_TOP + STEPS_OFFSET, number: "02" },
    { top: 762 + PADDING_TOP + STEPS_OFFSET, number: "03" },
    { top: 957 + PADDING_TOP + STEPS_OFFSET, number: "04" },
    { top: 1152 + PADDING_TOP + STEPS_OFFSET, number: "05" },
  ];

  return (
    <section
      ref={sectionRef}
      className={cn("relative bg-brand-main overflow-hidden py-12 lg:py-[60px]", className)}
      data-header-theme={headerTheme}
      
    >
      {/* ==================== Desktop Layout (md+) ==================== */}
      <div
        className="hidden md:block relative w-full"
        style={{
          height: `calc(${DESIGN_HEIGHT} / ${DESIGN_WIDTH} * 100vw)`,
          maxHeight: `${DESIGN_HEIGHT}px`,
        }}
      >
        {/* 标题区域 - 左侧 x=160 → 8.33% */}
        <div
          className="absolute"
          style={{
            left: `${(160 / DESIGN_WIDTH) * 100}%`,
            top: `${(PADDING_TOP / DESIGN_HEIGHT) * 100}%`,
            maxWidth: `${((1200 - 160) / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          {/* 副标题 "Design Project Solutions" - y=0 */}
          <h3
            className="font-anaheim font-bold text-stroke-black"
            style={{
              fontSize: `${(48 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(48 / DESIGN_WIDTH) * 100}vw`,
              marginBottom: `${(10 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.headerTitle}
          </h3>
          {/* 主标题 "Just Easy 5 Steps" - y=82 */}
          <h2
            className="font-anaheim font-extrabold text-brand-text-black"
            style={{
              fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(96 / DESIGN_WIDTH) * 100}vw`,
              marginBottom: `${(10 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {parts.map((part, index) => {
              const isNumber = !isNaN(Number(part)) && part.trim() !== "";
              if (isNumber) {
                return (
                  <AnimatedNumber
                    key={index}
                    value={Number(part)}
                    className="text-brand-accent-gold mx-[0.15em]"
                    style={{ fontSize: `${(120 / DESIGN_WIDTH) * 100}vw` }}
                  />
                );
              }
              return (
                <span key={index} className="inline">
                  {part}
                </span>
              );
            })}
          </h2>
          {/* 副标题 "From concept to reality..." - y=201 */}
          <h3
            className="font-anaheim font-bold text-brand-text-black"
            style={{
              fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(60 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.headerSubtitle}
          </h3>
        </div>

        {/* 装饰圆点 x=1303, y=42 (10795-10753) + padding */}
        <div
          className="absolute bg-[#ECE8D8] rounded-full z-0"
          style={{
            left: `${(1303 / DESIGN_WIDTH) * 100}%`,
            top: `${((16 + PADDING_TOP) / DESIGN_HEIGHT) * 100}%`,
            width: `${(71 / DESIGN_WIDTH) * 100}vw`,
            height: `${(71 / DESIGN_WIDTH) * 100}vw`,
          }}
        />

        {/* 描述文字 - 右侧 x=1339, y=68 (10821-10753) + padding */}
        <div
          className="absolute overflow-y-auto"
          data-lenis-prevent
          style={{
            left: `${(1339 / DESIGN_WIDTH) * 100}%`,
            top: `${((40 + PADDING_TOP) / DESIGN_HEIGHT) * 100}%`,
            width: `${(428 / DESIGN_WIDTH) * 100}vw`,
            maxHeight: `calc(${(30 / DESIGN_WIDTH) * 100}vw * 6)`,
            overscrollBehavior: "contain",
            msOverflowStyle: "scrollbar",
          }}
        >
          <p
            className="text-brand-secondary font-anaheim font-medium relative z-10"
            style={{
              fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(30 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.headerDescription}
          </p>
        </div>

        {/* 步骤列表 */}
        <div
          className="absolute w-full h-full"
          onMouseLeave={handleMouseLeave}
        >
          {data.steps.map((step, index) => {
            const isActive = index === activeIndexToDisplay;
            const pos = stepPositions[index] || stepPositions[0];

            return (
              <div
                key={step.text}
                className="absolute cursor-pointer transition-all duration-300"
                style={{
                  left: "0",
                  top: `${(pos.top / DESIGN_HEIGHT) * 100}%`,
                  width: "100%",
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* 步骤序号 */}
                <div
                  className={cn(
                    "absolute z-10 transition-all duration-300",
                    isActive ? "text-brand-text-black" : "text-brand-text-black/20"
                  )}
                  style={{
                    left: `${(500 / DESIGN_WIDTH) * 100}%`,
                    width: `${(180 / DESIGN_WIDTH) * 100}vw`,
                    height: `${(90 / DESIGN_WIDTH) * 100}vw`,
                  }}
                >
                  <StepNumber step={(index + 1) as 1 | 2 | 3 | 4 | 5} filled={isActive} />
                </div>

                {/* 步骤文本 */}
                <div
                  className={cn(
                    "absolute z-10 overflow-y-auto",
                    isActive
                      ? "text-brand-text-black"
                      : "text-brand-text-black/80"
                  )}
                  data-lenis-prevent
                  style={{
                    left: `${(735 / DESIGN_WIDTH) * 100}%`,
                    top: `${(40 / DESIGN_WIDTH) * 100}vw`,
                    fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
                    lineHeight: `${(36 / DESIGN_WIDTH) * 100}vw`,
                    width: `${(609 / DESIGN_WIDTH) * 100}vw`,
                    maxHeight: `calc(${(36 / DESIGN_WIDTH) * 100}vw * 3)`,
                    overscrollBehavior: "contain",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }}
                >
                  <p className="font-anaheim font-bold whitespace-pre-line">
                    {step.text.replace(/\\n|\/n/g, '\n')}
                  </p>
                </div>

                {/* 步骤图片 - 位于右侧 */}
                <div
                  className={cn(
                    "absolute z-0 transition-all duration-500 overflow-hidden shadow-2xl",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                  style={{
                    left: `${(1000 / DESIGN_WIDTH) * 100}%`,
                    top: "50%",
                    width: `${(377 / DESIGN_WIDTH) * 100}vw`,
                    aspectRatio: "503 / 360",
                    borderRadius: `${(22 / DESIGN_WIDTH) * 100}vw`,
                    transformOrigin: "center center",
                    transform: isActive
                      ? `translateY(-50%) rotate(${ROTATION_DEGREES}deg)`
                      : `translateY(-50%) rotate(0deg)`,
                  }}
                >
                  <OptimizedImage
                    image={step.image}
                    alt={step.image?.altText || step.text}
                    size="small"
                    className="object-cover absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== Mobile Layout ==================== */}
      <div className="md:hidden relative px-6 pt-16 pb-12">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-anaheim font-bold text-stroke-black mb-2">
            {data.headerTitle}
          </h3>
          <h2 className="text-4xl font-anaheim font-extrabold text-brand-text-black">
            {parts.map((part, index) => {
              const isNumber = !isNaN(Number(part)) && part.trim() !== "";
              if (isNumber) {
                return (
                  <AnimatedNumber
                    key={index}
                    value={Number(part)}
                    className="text-brand-accent-gold"
                  />
                );
              }
              return (
                <span key={index} className="inline">
                  {part}
                </span>
              );
            })}
          </h2>
        </div>

        {/* 描述文字 */}
        <div className="relative mb-10 px-4">
          <div
            className="absolute w-10 h-10 bg-[#ECE8D8] rounded-full z-0"
            style={{ left: "0", top: "0", transform: "translate(-30%, -30%)" }}
          />
          <p className="text-brand-secondary font-anaheim font-medium text-sm leading-relaxed relative z-10">
            {data.headerDescription}
          </p>
        </div>

        {/* 步骤列表 - 移动端垂直排列 */}
        <div className="space-y-8" onMouseLeave={handleMouseLeave}>
          {data.steps.map((step, index) => {
            const isActive = index === activeIndexToDisplay;

            return (
              <div
                key={step.text}
                className="relative cursor-pointer"
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* 步骤内容 */}
                <div className="flex items-center mb-4">
                  <div
                    className={cn(
                      "w-[80px] h-[40px] mr-4 transition-all duration-300",
                      isActive ? "text-brand-text-black" : "text-brand-text-black/20"
                    )}
                  >
                    <StepNumber step={(index + 1) as 1 | 2 | 3 | 4 | 5} filled={isActive} />
                  </div>
                  <p
                    className={cn(
                      "text-lg font-anaheim font-bold transition-colors duration-300 leading-tight whitespace-pre-line",
                      isActive
                        ? "text-brand-text-black"
                        : "text-brand-text-black/80"
                    )}
                  >
                    {step.text.replace(/\\n|\/n/g, '\n')}
                  </p>
                </div>

                {/* 步骤图片 */}
                <div
                  className={cn(
                    "w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300",
                    isActive ? "opacity-100" : "opacity-40"
                  )}
                  style={{
                    transform: isActive
                      ? `rotate(${ROTATION_DEGREES / 2}deg)`
                      : "rotate(0deg)",
                  }}
                >
                  <OptimizedImage
                    image={step.image}
                    alt={step.image?.altText || step.text}
                    size="small"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}