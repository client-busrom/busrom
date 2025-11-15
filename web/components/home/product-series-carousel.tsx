"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";

type Props = {
  data: HomeContent["productSeriesCarousel"]; // 使用导入的类型
  locale: Locale;
};

// --- 动画 Variants (保持不变，包含4个状态) ---
const variants = {
  hiddenLeft: { left: "-20%", x: "-50%", opacity: 0, scale: 0.8, zIndex: 0 },
  left: (custom: { hoveredIndex: number | null; itemIndex: number; otherItemIndex: number }) => ({
    left: "30%",
    x: "-50%",
    opacity: 1,
    scale: custom.hoveredIndex === custom.otherItemIndex ? 0.9 : custom.hoveredIndex === custom.itemIndex ? 1.1 : 1,
    zIndex: custom.hoveredIndex === custom.itemIndex ? 10 : 1,
    transformOrigin: "bottom",
  }),
  right: (custom: { hoveredIndex: number | null; itemIndex: number; otherItemIndex: number }) => ({
    left: "70%",
    x: "-50%",
    opacity: 1,
    scale: custom.hoveredIndex === custom.otherItemIndex ? 0.9 : custom.hoveredIndex === custom.itemIndex ? 1.1 : 1,
    zIndex: custom.hoveredIndex === custom.itemIndex ? 10 : 1,
    transformOrigin: "bottom",
  }),
  hiddenRight: { left: "120%", x: "-50%", opacity: 0, scale: 0.8, zIndex: 0 },
};

// --- 统一的 Transition 配置 (保持不变) ---
const transitionConfig = {
  duration: 0.5,
  ease: "easeInOut",
} as Transition;

export default function ProductSeriesCarousel({ data, locale }: Props) {
  // --- State (保持不变) ---
  const [[page, direction], setPage] = useState([0, 0]); // [currentIndex, direction: 0=initial, 1=next, -1=prev]
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const seriesCount = data.length;

  // --- paginate 函数 (保持不变) ---
  const paginate = (newDirection: number) => {
    setPage([(page + newDirection + seriesCount) % seriesCount, newDirection]);
    setHoveredIndex(null);
  };

  // --- 计算索引和获取数据 (保持不变) ---
  const leftItemIndex = page;
  const rightItemIndex = (page + 1) % seriesCount;
  const leftItem = useMemo(() => data[leftItemIndex], [data, leftItemIndex]);
  const rightItem = useMemo(() => data[rightItemIndex], [data, rightItemIndex]);

  // --- Custom props (保持不变) ---
  const customPropsLeft = useMemo(
    () => ({ hoveredIndex, itemIndex: leftItemIndex, otherItemIndex: rightItemIndex }),
    [hoveredIndex, leftItemIndex, rightItemIndex]
  );
  const customPropsRight = useMemo(
    () => ({ hoveredIndex, itemIndex: rightItemIndex, otherItemIndex: leftItemIndex }),
    [hoveredIndex, leftItemIndex, rightItemIndex]
  );

  if (seriesCount < 2) {
    /* ... (保持不变) ... */
  }

  return (
    <section className="py-16 bg-brand-secondary text-brand-text-inverse relative" data-header-theme="transparent">
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative h-[700px] md:h-[800px] flex items-center justify-center">
          {/* AnimatePresence (保持不变) */}
          <AnimatePresence initial={false} custom={direction}>
            {/* 左侧 Item */}
            <motion.div
              // 👇 **关键修改：key 使用数据项的唯一 key**
              key={leftItem.key}
              custom={customPropsLeft}
              variants={variants}
              initial={direction > 0 ? "hiddenRight" : "hiddenLeft"} // 进入方向
              animate="left" // 目标位置
              exit={direction > 0 ? "hiddenLeft" : "hiddenRight"} // 退出方向
              transition={transitionConfig}
              className="absolute w-[45%] md:w-2/5 aspect-[1/1] cursor-pointer"
              onMouseEnter={() => setHoveredIndex(leftItemIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ willChange: "transform, opacity, scale, left" }}
            >
              <Link href={leftItem.href}>
                <Image
                  src={leftItem.image.url}
                  alt={leftItem.image.altText || leftItem.name}
                  fill
                  sizes="(max-width: 768px) 40vw, 40vw"
                  className="object-cover"
                  priority={true}
                />
              </Link>
            </motion.div>

            {/* 右侧 Item */}
            <motion.div
              // 👇 **关键修改：key 使用数据项的唯一 key**
              key={rightItem.key}
              custom={customPropsRight}
              variants={variants}
              initial={direction > 0 ? "hiddenRight" : "hiddenLeft"} // 进入方向
              animate="right" // 目标位置
              exit={direction > 0 ? "hiddenLeft" : "hiddenRight"} // 退出方向
              transition={transitionConfig}
              className="absolute w-[45%] md:w-2/5 aspect-[1/1] cursor-pointer"
              onMouseEnter={() => setHoveredIndex(rightItemIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ willChange: "transform, opacity, scale, left" }}
            >
              <Link href={rightItem.href}>
                <Image
                  src={rightItem.image.url}
                  alt={rightItem.image.altText || rightItem.name}
                  fill
                  sizes="(max-width: 768px) 40vw, 40vw"
                  className="object-cover"
                  priority={true}
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- 系列名称显示 (保持不变) --- */}
        <div className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none z-20">
          {/* 移动端 bottom-12, 桌面 bottom-16 */}
          <div className="flex justify-between w-full px-4 space-x-[2rem]">
            {/* 移动端 max-w-lg, 桌面 max-w-4xl */}
            {/* 左侧名称 */}
            <span
              className={cn(
                "w-1/2 text-right font-anaheim font-extrabold transition-all duration-300 ease-in-out",
                // --- 移动端字号 (默认) ---
                hoveredIndex === null ? "text-xl" : hoveredIndex === leftItemIndex ? "text-2xl" : "text-lg",
                // --- 桌面端字号
                hoveredIndex === null ? "lg:text-3xl" : hoveredIndex === leftItemIndex ? "lg:text-4xl" : "lg:text-2xl"
              )}
            >
              {leftItem.name}
            </span>
            {/* 右侧名称 */}
            <span
              className={cn(
                "w-1/2 text-left font-anaheim font-extrabold transition-all duration-300 ease-in-out",
                // --- 移动端字号 (默认) ---
                hoveredIndex === null ? "text-xl" : hoveredIndex === rightItemIndex ? "text-2xl" : "text-lg",
                // --- 桌面端字号
                hoveredIndex === null ? "lg:text-3xl" : hoveredIndex === rightItemIndex ? "lg:text-4xl" : "lg:text-2xl"
              )}
            >
              {rightItem.name}
            </span>
          </div>
        </div>

        {/* --- 导航按钮 (保持不变) --- */}
        <button
          onClick={() => paginate(-1)}
          className="absolute bottom-4 left-4 md:left-8 z-20 cursor-pointer group" // group 用于可能的 hover 效果
          aria-label="Previous series"
        >
          <img
            src="/btnLeft2.svg" // 确认 SVG 在 public 根目录
            alt="Previous"
            className="w-16 h-16 transition-opacity group-hover:opacity-80" // 调整图标大小 w-10 h-10
          />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute bottom-4 right-4 md:right-8 z-20 cursor-pointer group" // group 用于可能的 hover 效果
          aria-label="Next series"
        >
          <img
            src="/btnRight2.svg" // 确认 SVG 在 public 根目录
            alt="Next"
            className="w-16 h-16 transition-opacity group-hover:opacity-80" // 调整图标大小 w-10 h-10
          />
        </button>
      </div>
    </section>
  );
}
