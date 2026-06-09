"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
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

// --- 优化1: 文字内容拆分为独立memo组件，避免整树重建 ---

interface FeatureTextProps {
  title: string;
  description: string;
}

const FeatureTextContent = memo(function FeatureTextContent({
  title,
  description,
}: FeatureTextProps) {
  return (
    <>
      {/* 装饰线条 */}
      <div className="bg-[#7E7A4F] w-[50px] h-[10px] lg:w-[calc(73*var(--rpx))] lg:h-[calc(13*var(--rpx))] mb-4 lg:mb-[calc(24*var(--rpx))]" />

      {/* 标题 - 最多4行，超出内部滚动 */}
      <h3
        className={cn(
          "font-anaheim font-extrabold text-black whitespace-pre-wrap",
          "text-xl leading-tight mb-3",
          "lg:text-[calc(32*var(--rpx))] lg:leading-[calc(44*var(--rpx))] lg:mb-[calc(40*var(--rpx))]",
          "lg:max-h-[calc(176*var(--rpx))] lg:overflow-y-auto",
        )}
        data-lenis-prevent
        style={{
          overscrollBehavior: "contain",
          msOverflowStyle: "scrollbar",
        }}
      >
        {title}
      </h3>

      {/* 描述 - 超出内部滚动 */}
      <p
        className={cn(
          "font-anaheim font-medium text-black whitespace-pre-wrap",
          "text-sm leading-relaxed mb-6",
          "lg:text-[calc(16*var(--rpx))] lg:leading-[calc(24*var(--rpx))] lg:mb-[calc(32*var(--rpx))]",
          "lg:max-h-[calc(200*var(--rpx))] lg:overflow-y-auto",
        )}
        data-lenis-prevent
        style={{
          overscrollBehavior: "contain",
          msOverflowStyle: "scrollbar",
        }}
      >
        {description}
      </p>

      {/* 占位 */}
      <div className="mt-auto lg:mt-[calc(40*var(--rpx))] pb-6 lg:pb-[calc(40*var(--rpx))]" />
    </>
  );
});

// 左侧固定标题区
const LeftSection = memo(function LeftSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-4",
        "px-6 py-8",
        "lg:px-[calc(80*var(--rpx))] lg:py-0 lg:w-[calc(520*var(--rpx))] lg:flex-shrink-0 lg:gap-[calc(76*var(--rpx))]",
      )}
    >
      <h2
        className={cn(
          "font-anaheim font-extrabold text-black whitespace-pre-wrap",
          "text-2xl leading-tight",
          "lg:text-[calc(48*var(--rpx))] lg:leading-[calc(62*var(--rpx))]",
          "lg:max-h-[calc(280*var(--rpx))] lg:overflow-y-auto",
        )}
        data-lenis-prevent
        style={{
          overscrollBehavior: "contain",
          msOverflowStyle: "scrollbar",
        }}
      >
        {title}
      </h2>

      <p
        className={cn(
          "font-anaheim font-medium text-[#756F3F] whitespace-pre-wrap",
          "text-sm leading-relaxed",
          "lg:text-[calc(18*var(--rpx))] lg:leading-[calc(28*var(--rpx))]",
          "max-w-[320px] md:max-w-xl lg:max-w-none",
          "lg:max-h-[calc(280*var(--rpx))] lg:overflow-y-auto",
        )}
        data-lenis-prevent
        style={{
          overscrollBehavior: "contain",
          msOverflowStyle: "scrollbar",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
});

export default function ServiceFeatures({
  data,
  headerTheme,
  className,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const features = data?.features || [];
  const featuresLength = features.length;

  // 给子组件传递所有features用于预加载
  const featuresWithParent = features.map((f) => ({
    ...f,
    __parentFeatures: features,
  }));
  const activeFeature = featuresWithParent[activeIndex];

  // 视口检测
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
  const startProgress = useCallback(() => {
    setProgress(0);
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / CAROUSEL_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressRef.current = setTimeout(updateProgress, 16);
      }
    };

    progressRef.current = setTimeout(updateProgress, 16);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) {
      clearTimeout(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  // --- 自动轮播逻辑 ---
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

    if (isVisible && !isHovering) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => stopInterval();
  }, [featuresLength, isVisible, isHovering, startProgress, stopProgress]);

  // --- 处理点击导航点 ---
  const handleDotClick = useCallback(
    (index: number) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopProgress();
      setActiveIndex(index);
      startProgress();
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % featuresLength);
        startProgress();
      }, CAROUSEL_DURATION);
    },
    [featuresLength, startProgress, stopProgress],
  );

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={cn("py-12 lg:py-[60px] bg-brand-main", className)}
      data-header-theme={headerTheme}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 2xl:px-[80px]">
        {/* 主容器：米色圆角背景 */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] lg:rounded-[calc(30*var(--rpx))]",
            "bg-[#F0EBDB]",
            "w-full lg:max-w-[calc(1860*var(--rpx))] mx-auto",
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* 装饰性背景 SVG */}
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
            <LeftSection title={data.title} subtitle={data.subtitle} />

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
                {/* Item 背景层 */}
                <div className="item-bg absolute inset-0 pointer-events-none z-0" />

                {/* 卡片内容区域 */}
                <div className="relative z-10 flex-1 min-h-0 flex flex-col md:flex-row p-4 md:p-8 lg:p-0">
                  {/* 文字内容区 */}
                  <div
                    className={cn(
                      "flex flex-col justify-start flex-shrink-0 w-full md:w-[42%] md:pr-4",
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
                          <FeatureTextContent
                            title={activeFeature.title}
                            description={activeFeature.description}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 图片区域 */}
                  <div
                    className={cn(
                      "flex-1 min-h-0 flex items-start justify-center",
                      "mt-4 md:mt-0 lg:mt-0",
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
                  <div className="relative h-[36px] lg:h-[40px] flex items-end">
                    {/* 背景线 */}
                    <div className="absolute left-0 right-0 bottom-[5px] h-[2px] bg-[#D9D9D9]" />

                    {/* 进度填充线 */}
                    <div
                      className="absolute bottom-[5px] h-[2px] bg-[#756F3F] transition-none"
                      style={{
                        left: 0,
                        width: (() => {
                          const dotPositions = [10, 30, 50, 70, 90];
                          const currentDotPos = dotPositions[activeIndex];
                          const nextDotPos =
                            activeIndex === featuresLength - 1
                              ? 100
                              : dotPositions[activeIndex + 1];
                          const currentSegmentLength =
                            nextDotPos - currentDotPos;
                          const progressWidth =
                            currentDotPos +
                            (progress / 100) * currentSegmentLength;
                          return `${progressWidth}%`;
                        })(),
                      }}
                    />

                    {/* 导航点 */}
                    <div className="relative w-full h-full">
                      {features.map((feature, index) => {
                        const isActive = activeIndex === index;
                        const isPassed = index < activeIndex;
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
                            aria-label={feature.title}
                          >
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
                                  ? { opacity: 1, y: [0, -3, 0] }
                                  : { opacity: 0, y: 0 }
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
