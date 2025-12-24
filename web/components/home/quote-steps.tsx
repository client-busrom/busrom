"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type Props = {
  data: HomeContent["quoteSteps"];
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
 * 设计分辨率: 1920x1720
 * 响应式适配: lg (1024px) 使用比例 1024/1920 ≈ 0.533
 *
 * Figma 关键位置 (基于 1920 宽度):
 * - 标题区域: x=160 (8.3%)
 * - 描述文字: x=1339 (69.7%), 装饰圆点 x=1303 (67.9%)
 * - 步骤序号: x=388 (20.2%)
 * - 步骤文字: x=714 (37.2%)
 * - 图片: x≈1001 (52.1%)
 */
export default function QuoteSteps({ data }: Props) {
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

  // 步骤位置配置 (基于 Figma JSON，调整留白)
  // 增加上下留白，将步骤区域压缩到 30%-88% 范围内
  const stepPositions = [
    { top: "30%", number: "01" },
    { top: "42%", number: "02" },
    { top: "54%", number: "03" },
    { top: "66%", number: "04" },
    { top: "78%", number: "05" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-brand-main overflow-hidden"
      data-header-theme="light"
    >
      {/* ==================== Desktop Layout (md+) ==================== */}
      <div
        className="hidden md:block relative w-full"
        style={{ height: "clamp(700px, 100vw, 1920px)" }} // 桌面端固定高度
      >
        {/* 标题区域 - 左侧 x=160 → 8.3% */}
        <div
          className="absolute"
          style={{
            left: "8.3%", // 160/1920
            top: "5%",
          }}
        >
          {/* 副标题 "Design Project Solutions" - y=0 相对板块 */}
          <h3
            className="font-anaheim font-bold text-stroke-black"
            style={{
              fontSize: "clamp(24px, 2.5vw, 48px)",
              lineHeight: "106px",
              height: "clamp(53px, 5.5vw, 106px)",
            }}
          >
            {data.headerTitle}
          </h3>
          {/* 主标题 "Just Easy 5 Steps" - y=82 相对板块 */}
          <h2
            className="font-anaheim font-extrabold text-brand-text-black"
            style={{
              fontSize: "clamp(48px, 5vw, 96px)",
              lineHeight: "1.1",
            }}
          >
            {parts.map((part, index) => {
              const isNumber = !isNaN(Number(part)) && part.trim() !== "";
              if (isNumber) {
                return (
                  <AnimatedNumber
                    key={index}
                    value={Number(part)}
                    className="text-brand-accent-gold"
                    style={{ fontSize: "clamp(60px, 6.25vw, 120px)" }}
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
              fontSize: "clamp(18px, 1.88vw, 36px)",
              lineHeight: "1.67",
              marginTop: "clamp(8px, 0.8vw, 16px)",
            }}
          >
            {data.headerSubtitle}
          </h3>
        </div>

        {/* 描述文字 - 右侧 x=1339 → 69.7% */}
        <div
          className="absolute"
          style={{
            left: "69.7%", // 1339/1920
            top: "9%",
            width: "clamp(214px, 22.3vw, 428px)", // 428/1920
          }}
        >
          {/* 装饰圆点 x=1303 → 67.9% */}
          <div
            className="absolute bg-[#ECE8D8] rounded-full z-0"
            style={{
              width: "clamp(35px, 3.7vw, 71px)", // 71/1920
              height: "clamp(35px, 3.7vw, 71px)",
              left: "-10%",
              top: "-10%",
            }}
          />
          <p
            className="text-brand-secondary font-anaheim font-medium relative z-10"
            style={{
              fontSize: "clamp(10px, 1.04vw, 20px)", // 20/1920
              lineHeight: "1.5",
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
                  top: pos.top,
                  width: "100%",
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* 步骤序号 x=388 → 20.2% */}
                <span
                  className={cn(
                    "absolute z-10 font-montserrat font-extrabold transition-all duration-300",
                    isActive ? "text-brand-text-black" : "text-stroke-black"
                  )}
                  style={{
                    left: "20.2%", // 388/1920
                    fontSize: "clamp(70px, 7.3vw, 140px)", // 140px
                    lineHeight: "0.82", // 115/140
                  }}
                >
                  {pos.number}/
                </span>

                {/* 步骤文本 x=714 → 37.2% */}
                <p
                  className={cn(
                    "absolute z-10 font-anaheim font-bold transition-colors duration-300",
                    isActive
                      ? "text-brand-text-black"
                      : "text-brand-text-black/80"
                  )}
                  style={{
                    left: "37.2%", // 714/1920
                    top: "clamp(15px, 1.5vw, 30px)", // 与数字顶部对齐
                    fontSize: "clamp(24px, 2.5vw, 48px)", // 48px
                    lineHeight: "0.96", // 46/48
                    whiteSpace: "pre-line",
                  }}
                >
                  {/* 将字面 \n 转换为真正的换行 */}
                  {step.text.replace(/\\n/g, '\n')}
                </p>

                {/* 步骤图片 x≈1001 → 52.1% */}
                <div
                  className={cn(
                    "absolute z-0 transition-all duration-500 overflow-hidden shadow-2xl",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                  style={{
                    left: "52.1%", // 1001/1920
                    top: "50%",
                    width: "clamp(251px, 26.2vw, 503px)", // 503/1920
                    aspectRatio: "503 / 360",
                    borderRadius: "clamp(15px, 1.56vw, 30px)",
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
            const pos = stepPositions[index] || stepPositions[0];

            return (
              <div
                key={step.text}
                className="relative cursor-pointer"
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* 步骤内容 */}
                <div className="flex items-center mb-4">
                  <span
                    className={cn(
                      "text-4xl font-montserrat font-extrabold transition-all duration-300 mr-4 leading-none",
                      "text-stroke-black",
                      { "text-brand-text-black": isActive }
                    )}
                  >
                    {pos.number}/
                  </span>
                  <p
                    className={cn(
                      "text-lg font-anaheim font-bold transition-colors duration-300 leading-tight",
                      isActive
                        ? "text-brand-text-black"
                        : "text-brand-text-black/80"
                    )}
                  >
                    {step.text.replace(/\\n/g, '\n')}
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