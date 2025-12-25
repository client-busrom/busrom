"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import FeatureImageLayout from "./FeatureImageLayout";

type Props = {
  data: HomeContent["serviceFeatures"];
};

const featureTransition = { duration: 0.5, ease: "easeInOut" };
const CAROUSEL_DURATION = 5000; // 轮播间隔时间（毫秒）

export default function ServiceFeatures({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 进度 0-100
  const [isVisible, setIsVisible] = useState(false); // 是否在视口内
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
      { threshold: 0.1 }
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

    // 只在可见时启动轮播
    if (isVisible) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => stopInterval();
  }, [featuresLength, isVisible]);

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
    <section ref={sectionRef} className="py-16 lg:py-24 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto px-4">
        {/* 主容器：米色圆角背景 */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] lg:rounded-[30px]",
            "bg-[#F0EBDB]", // 米色背景
            "w-full max-w-[1860px] mx-auto"
          )}
        >
          {/* 装饰性模糊椭圆 - 只在桌面端显示 */}
          <div
            className="hidden lg:block absolute pointer-events-none"
            style={{
              left: "62px",
              top: "197px",
              width: "1571px",
              height: "392px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1), rgba(218,201,142,1))",
              filter: "blur(67px)",
              borderRadius: "50%",
            }}
          />

          {/* 内容布局：桌面左右，移动上下 */}
          <div className="relative z-10 flex flex-col lg:flex-row py-8 lg:py-12">
            {/* === 左侧固定内容区域 === */}
            <div
              className={cn(
                "flex flex-col justify-center",
                "px-6 py-8",
                "lg:px-10 lg:py-0 lg:w-[380px] lg:flex-shrink-0",
                "xl:px-14 xl:w-[440px]",
                "2xl:px-[80px] 2xl:w-[520px]"
              )}
            >
              {/* 主标题 */}
              <h2
                className={cn(
                  "font-anaheim font-extrabold text-black",
                  "text-2xl leading-tight",
                  "lg:text-[32px] lg:leading-[42px]",
                  "xl:text-[40px] xl:leading-[52px]",
                  "2xl:text-[48px] 2xl:leading-[62px]"
                )}
              >
                {data.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < data.title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h2>

              {/* 副标题 */}
              <p
                className={cn(
                  "font-anaheim font-medium text-[#756F3F]",
                  "text-sm leading-relaxed mt-4",
                  "lg:text-[14px] lg:leading-[22px] lg:mt-4",
                  "xl:text-[16px] xl:leading-[24px]",
                  "2xl:text-[18px] 2xl:leading-[28px]",
                  "max-w-[320px]"
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
                "lg:pr-4 xl:pr-6 2xl:pr-10"
              )}
            >
              {/* 白色圆角卡片 - 桌面端固定高度 */}
              <div
                className={cn(
                  "bg-white rounded-[20px] lg:rounded-[24px]",
                  "w-full",
                  "lg:h-[420px] xl:h-[480px] 2xl:h-[560px]",
                  "flex flex-col",
                  "shadow-lg"
                )}
              >
                {/* 卡片内容区域 */}
                <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-0">
                  {/* 文字内容区 */}
                  <div
                    className={cn(
                      "flex flex-col justify-start flex-shrink-0",
                      "lg:w-[340px] lg:pt-[50px] lg:pl-[30px] lg:pr-4",
                      "xl:w-[380px] xl:pt-[60px] xl:pl-[40px]",
                      "2xl:w-[440px] 2xl:pt-[70px] 2xl:pl-[50px]"
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
                          <div className="bg-[#7E7A4F] w-[50px] h-[10px] lg:w-[60px] lg:h-[11px] 2xl:w-[73px] 2xl:h-[13px] mb-4 lg:mb-6" />

                          {/* 标题 */}
                          <h3
                            className={cn(
                              "font-anaheim font-extrabold text-black",
                              "text-xl leading-tight mb-3",
                              "lg:text-[22px] lg:leading-[28px] lg:mb-3",
                              "xl:text-[26px] xl:leading-[32px]",
                              "2xl:text-[32px] 2xl:leading-[40px] 2xl:mb-4"
                            )}
                          >
                            {activeFeature.title}
                          </h3>

                          {/* 描述 */}
                          <p
                            className={cn(
                              "font-anaheim font-medium text-black",
                              "text-sm leading-relaxed",
                              "lg:text-[14px] lg:leading-[21px]",
                              "xl:text-[16px] xl:leading-[24px]",
                              "2xl:text-[18px] 2xl:leading-[27px]"
                            )}
                          >
                            {activeFeature.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 图片区域 - 顶部与左侧装饰线对齐 */}
                  <div
                    className={cn(
                      "flex-1 flex items-start justify-center",
                      "mt-4 lg:mt-0",
                      "lg:pt-[50px] lg:pr-[16px] lg:pb-[8px]",
                      "xl:pt-[60px] xl:pr-[20px] xl:pb-[10px]",
                      "2xl:pt-[70px] 2xl:pr-[24px] 2xl:pb-[12px]"
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
                          const nextDotPos = activeIndex === featuresLength - 1 ? 100 : dotPositions[activeIndex + 1];
                          // 当前段的长度
                          const currentSegmentLength = nextDotPos - currentDotPos;

                          // 进度条宽度 = 当前点位置 + 当前段进度
                          const progressWidth = currentDotPos + (progress / 100) * currentSegmentLength;
                          return `${progressWidth}%`;
                        })()
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
                              transform: "translateX(-50%)"
                            }}
                          >
                            {/* 标签文字 - 移动端隐藏，桌面端活跃时有上下浮动动画 */}
                            <motion.span
                              className={cn(
                                "hidden lg:block",
                                "text-[12px] xl:text-[14px] font-anaheim font-semibold",
                                "whitespace-nowrap mb-2",
                                "text-[#756F3F]"
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
                                  : "bg-[#D9D9D9] group-hover:bg-[#756F3F]"
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
