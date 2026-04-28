"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import FeatureImageLayout from "./FeatureImageLayout";

type Props = {
  data: HomeContent["serviceFeatures"];
  headerTheme?: string;
  className?: string;
};

const featureTransition = { duration: 0.5, ease: "easeInOut" };
const CAROUSEL_DURATION = 5000; // 轮播间隔时间（毫秒）

export default function ServiceFeatures({
  data,
  headerTheme,
  className,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 进度 0-100
  const [isVisible, setIsVisible] = useState(false); // 是否在视口内
  const [isHovering, setIsHovering] = useState(false); // 鼠标悬停暂停
  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const features = data?.features || [];
  const featuresLength = features.length;

  // 视口检测 - 不在视口时暂停轮播省电
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // --- 进度条动画逻辑 ---
  const startProgress = () => {
    setProgress(0);
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / CAROUSEL_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressRef.current = setTimeout(updateProgress, 16); // ~60fps
      }
    };

    progressRef.current = setTimeout(updateProgress, 16);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearTimeout(progressRef.current);
      progressRef.current = null;
    }
  };

  // --- 自动轮播逻辑 (仅在视口内运行) ---
  useEffect(() => {
    if (featuresLength === 0) return;

    const startInterval = () => {
      startProgress();
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % featuresLength);
        startProgress();
      }, CAROUSEL_DURATION);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopProgress();
    };

    // 只在可见且不悬停时启动轮播
    if (isVisible && !isHovering) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => stopInterval();
  }, [featuresLength, isVisible, isHovering]);

  // --- 处理点击导航点 ---
  const handleDotClick = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopProgress();
    setActiveIndex(index);
    startProgress();
    // 重新启动定时器
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % featuresLength);
      startProgress();
    }, CAROUSEL_DURATION);
  };

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const activeFeature = features[activeIndex];

  return (
    <section
      ref={sectionRef}
      className={cn("py-12 lg:py-[60px] bg-brand-main", className)}
      data-header-theme={headerTheme}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 2xl:px-[80px]">
        {/* 主容器：米色圆角背景 */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] lg:rounded-[calc(30*var(--rpx))]",
            "bg-[#F0EBDB]", // 米色背景
            "w-full lg:max-w-[calc(1860*var(--rpx))] mx-auto",
          )}
        >
          {/* 装饰性背景 SVG - 替代原有的模糊椭圆 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/service-features/service-feature-bg.svg)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />

          {/* 内容布局：桌面左右，移动上下 */}
          <div className="relative z-10 flex flex-col lg:flex-row py-8 lg:py-12">
            {/* === 左侧固定内容区域 === */}
            <div
              className={cn(
                "flex flex-col justify-center gap-4",
                "px-6 py-8",
                "lg:px-[calc(80*var(--rpx))] lg:py-0 lg:w-[calc(520*var(--rpx))] lg:flex-shrink-0 lg:gap-[calc(76*var(--rpx))]",
              )}
            >
              {/* 主标题 */}
              <h2
                className={cn(
                  "font-anaheim font-extrabold text-black whitespace-pre-wrap",
                  "text-2xl leading-tight",
                  "lg:text-[calc(48*var(--rpx))] lg:leading-[calc(62*var(--rpx))]",
                )}
              >
                {data.title}
              </h2>

              <p
                className={cn(
                  "font-anaheim font-medium text-[#756F3F] whitespace-pre-wrap",
                  "text-sm leading-relaxed",
                  "lg:text-[calc(18*var(--rpx))] lg:leading-[calc(28*var(--rpx))]",
                  "max-w-[320px] lg:max-w-none",
                )}
              >
                {data.subtitle}
              </p>
            </div>

            {/* === 右侧轮播区域 === */}
            <div
              className={cn(
                "flex-1 flex items-stretch",
                "px-4 lg:px-0",
                "lg:pr-[calc(40*var(--rpx))]",
              )}
            >
              <div
                className={cn(
                  "item-box relative bg-white rounded-[20px] lg:rounded-[calc(24*var(--rpx))]",
                  "w-full h-auto",
                  "lg:w-[calc(1123*var(--rpx))] lg:h-[calc(622*var(--rpx))]",
                  "flex flex-col flex-shrink-0",
                  "shadow-lg overflow-hidden",
                )}
              >
                {/* Item 背景层 - 可选装饰 */}
                <div className="item-bg absolute inset-0 pointer-events-none z-0" />

                {/* 卡片内容区域 */}
                <div className="relative z-10 flex-1 flex flex-col lg:flex-row p-4 lg:p-0">
                  {/* 文字内容区 */}
                  <div
                    className={cn(
                      "flex flex-col justify-start flex-shrink-0",
                      "lg:w-[calc(401*var(--rpx))] lg:pt-[calc(80*var(--rpx))] lg:pl-[calc(40*var(--rpx))] lg:pr-[calc(10*var(--rpx))]",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {activeFeature && (
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={featureTransition as Transition}
                        >
                          {/* 装饰线条 */}
                          <div className="bg-[#7E7A4F] w-[50px] h-[10px] lg:w-[calc(73*var(--rpx))] lg:h-[calc(13*var(--rpx))] mb-4 lg:mb-[calc(24*var(--rpx))]" />

                          {/* 标题 */}
                          <h3
                            className={cn(
                              "font-anaheim font-extrabold text-black whitespace-pre-wrap",
                              "text-xl leading-tight mb-3",
                              "lg:text-[calc(32*var(--rpx))] lg:leading-[calc(40*var(--rpx))] lg:mb-[calc(40*var(--rpx))]",
                            )}
                          >
                            {activeFeature.title}
                          </h3>

                          {/* 描述 */}
                          <p
                            className={cn(
                              "font-anaheim font-medium text-black whitespace-pre-wrap",
                              "text-sm leading-relaxed mb-6",
                              "lg:text-[calc(16*var(--rpx))] lg:leading-[calc(24*var(--rpx))] lg:mb-[calc(32*var(--rpx))]",
                            )}
                          >
                            {activeFeature.description}
                          </p>

                          {/* 更多按钮 */}
                          <div className="mt-auto lg:mt-[calc(40*var(--rpx))] pb-6 lg:pb-[calc(40*var(--rpx))]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 图片区域 - 顶部与左侧装饰线对齐 */}
                  <div
                    className={cn(
                      "flex-1 flex items-start justify-center",
                      "mt-4 lg:mt-0",
                      "lg:pt-[calc(70*var(--rpx))] lg:pb-[calc(12*var(--rpx))]",
                    )}
                  >
                    <FeatureImageLayout
                      activeFeature={activeFeature}
                      activeIndex={activeIndex}
                    />
                  </div>
                </div>

                {/* 底部导航指示器 */}
                <div className="flex-shrink-0 px-4 lg:px-[30px] xl:px-[40px] 2xl:px-[50px] pb-6 lg:pb-12">
                  {/*
                    进度条设计：7个点，显示中间5个（点2-6），隐藏点1和点7
                    6段线段：第1段和第6段各占10%，中间4段各占20%
                    点的位置：10%, 30%, 50%, 70%, 90%

                    进度流程：
                    - item 0: 进度从10%走到30%
                    - item 1: 进度从30%走到50%
                    - item 2: 进度从50%走到70%
                    - item 3: 进度从70%走到90%
                    - item 4: 进度从90%走到100%，然后重置到0%走到10%（回到item 0）
                  */}
                  <div className="relative h-[36px] lg:h-[40px] flex items-end">
                    {/* 背景线 */}
                    <div className="absolute left-0 right-0 bottom-[5px] h-[2px] bg-[#D9D9D9]" />

                    {/* 进度填充线 */}
                    <div
                      className="absolute bottom-[5px] h-[2px] bg-[#756F3F] transition-none"
                      style={{
                        left: 0,
                        width: (() => {
                          // 每个点的位置：10%, 30%, 50%, 70%, 90%
                          // 每段20%（除了首尾各10%）
                          const dotPositions = [10, 30, 50, 70, 90];
                          const segmentSize = 20; // 每段20%

                          // 当前点的位置
                          const currentDotPos = dotPositions[activeIndex];
                          // 下一个点的位置（最后一个item特殊处理）
                          const nextDotPos =
                            activeIndex === featuresLength - 1
                              ? 100
                              : dotPositions[activeIndex + 1];
                          // 当前段的长度
                          const currentSegmentLength =
                            nextDotPos - currentDotPos;

                          // 进度条宽度 = 当前点位置 + 当前段进度
                          const progressWidth =
                            currentDotPos +
                            (progress / 100) * currentSegmentLength;
                          return `${progressWidth}%`;
                        })(),
                      }}
                    />

                    {/* 导航点 - 使用绝对定位放置在正确位置 */}
                    <div className="relative w-full h-full">
                      {features.map((feature, index) => {
                        const isActive = activeIndex === index;
                        const isPassed = index < activeIndex;
                        // 点的位置：10%, 30%, 50%, 70%, 90%
                        const dotPosition = 10 + index * 20;

                        return (
                          <button
                            key={feature.title}
                            onClick={() => handleDotClick(index)}
                            className="absolute bottom-0 flex flex-col items-center group"
                            style={{
                              left: `${dotPosition}%`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            {/* 标签文字 - 移动端隐藏，桌面端活跃时有上下浮动动画 */}
                            <motion.span
                              className={cn(
                                "hidden lg:block",
                                "text-[12px] xl:text-[14px] font-anaheim font-semibold",
                                "whitespace-nowrap mb-2",
                                "text-[#756F3F]",
                              )}
                              initial={false}
                              animate={
                                isActive
                                  ? {
                                      opacity: 1,
                                      y: [0, -3, 0],
                                    }
                                  : {
                                      opacity: 0,
                                      y: 0,
                                    }
                              }
                              whileHover={{ opacity: 1 }}
                              transition={
                                isActive
                                  ? {
                                      opacity: { duration: 0.3 },
                                      y: {
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      },
                                    }
                                  : { duration: 0.3 }
                              }
                            >
                              {feature.shortTitle}
                            </motion.span>

                            {/* 圆点 */}
                            <div
                              className={cn(
                                "w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full transition-colors duration-300",
                                isActive || isPassed
                                  ? "bg-[#756F3F]"
                                  : "bg-[#D9D9D9] group-hover:bg-[#756F3F]",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
