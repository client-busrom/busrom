"use client";

import { useState, useEffect, useRef } from "react"; // 导入 Hooks
import Image from "next/image";
import { motion, AnimatePresence, Transition } from "framer-motion"; // 导入 Framer Motion
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import FeatureImageLayout from "./FeatureImageLayout";

type Props = {
  data: HomeContent["serviceFeatures"];
};

const featureTransition = { duration: 0.5, ease: "easeInOut" };

export default function ServiceFeatures({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0); // 当前激活的 feature 索引
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // 用于存储轮播定时器
  const progressBarRef = useRef<HTMLDivElement>(null); // Ref for progress bar container

  const features = data.features; // 类型断言（如果 image 是可选的）

  // --- 自动轮播逻辑 ---
  useEffect(() => {
    // 启动定时器
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
      }, 5000); // 每 5 秒切换一次
    };

    // 清除定时器
    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startInterval(); // 组件加载时启动

    // 组件卸载时清除定时器
    return () => stopInterval();
  }, [features.length]); // 依赖项为 features 长度

  // --- 处理悬停 ---
  const handleHover = (index: number) => {
    // 清除自动轮播定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // 设置当前激活索引
    setActiveIndex(index);
  };

  // --- 处理鼠标离开进度条区域 ---
  const handleMouseLeave = () => {
    // 如果没有定时器在运行，则重新启动
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
      }, 5000);
    }
  };

  // 获取当前激活的 feature
  const activeFeature = features[activeIndex];

  return (
    <section className="py-16 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        {/* --- 主体 Flex 布局 --- */}
        <div className="flex flex-col lg:flex-row lg:gap-16">
          {/* --- 左侧 Title/Subtitle --- */}
          <div className="w-full lg:w-1/4 mb-8 lg:mb-0 flex flex-col justify-center">
            {/* 确保字体类名正确 */}
            <h2 className="font-anaheim font-extrabold text-3xl lg:text-4xl text-brand-text-black mb-4">{data.title}</h2>
            {/* 确保字体类名正确 */}
            <p className="font-anaheim font-medium text-muted-foreground text-sm">{data.subtitle}</p>
          </div>

          {/* --- 右侧内容区域 --- */}
          <div className="w-full lg:w-3/4">
            {/* 白色圆角背景框 */}
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 lg:p-10 flex flex-col min-h-[450px] lg:min-h-[500px]">
              {/* --- 上方：Feature 内容 + 图片 --- */}
              <div className="flex flex-col md:flex-row flex-grow gap-6 md:gap-8">
                {/* 左侧：文字内容 */}
                <div className="w-full md:w-1/3 flex flex-col justify-start">
                  <AnimatePresence mode="wait">
                    {/* 检查 activeFeature 是否存在 */}
                    {activeFeature && (
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={featureTransition as Transition}
                      >
                        {/* 👇 新增方块，直接使用颜色值 */}
                        <div className="bg-[#7E7A4F] w-[73px] h-[13px] mb-5"></div>

                        {/* 调整标题下方间距 */}
                        <h3 className="text-2xl font-anaheim font-extrabold text-brand-text-black mb-5">{activeFeature.title}</h3>
                        <p className="font-anaheim font-medium text-brand-text-main leading-relaxed">{activeFeature.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* 右侧：图片 */}
                <div className="w-full md:w-2/3 relative aspect-video md:aspect-auto rounded-md">
                  <div
                    className={cn(
                      "w-full relative rounded-md", // 保持 relative
                      "min-h-[250px] md:min-h-[450px] md:max-h-[450px]"
                    )}
                  >
                    <FeatureImageLayout activeFeature={activeFeature} activeIndex={activeIndex} />
                  </div>
                </div>
              </div>

              <div
                // 进度条外层容器 (负边距和内边距的修正方案不变)
                className={cn(
                  "mt-auto pt-6", // 垂直间距不变
                  "px-8 md:px-12 lg:px-14",
                )}
                ref={progressBarRef}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-end justify-between relative">
                  <div className="absolute left-0 right-0 -mx-8 bottom-4 h-[2px] bg-[#D9D9D9] z-0"></div>
                  {features &&
                    features.map((feature, index) => (
                      <button
                        key={feature.title}
                        className="flex-shrink-0 group relative pb-4" // 【修正 1】：移除 flex-1
                        onMouseEnter={() => handleHover(index)}
                      >
                        {/* 节点标题 (文字不占流内空间) */}
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors duration-300 block truncate mb-2",
                            "absolute left-1/2 -translate-x-1/2 bottom-full whitespace-nowrap", // bottom-full 定位到按钮上方

                            activeIndex === index
                              ? "text-brand-text-main" // 激活时显示
                              : "text-transparent group-hover:text-brand-text-main" // 默认透明，悬停时变色
                          )}
                        >
                          {feature.shortTitle}
                        </span>

                        <div className="relative h-[2px] w-2">
                          <div
                            className={cn(
                              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300 z-10",
                              activeIndex === index ? "bg-brand-secondary" : "bg-[#D9D9D9] group-hover:bg-brand-secondary"
                            )}
                          />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
