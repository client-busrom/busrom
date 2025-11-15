"use client";

import { useState, useEffect, useRef } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LucideIcon, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // 导入 cn

type Props = {
  data: HomeContent["whyChooseBusrom"];
};

// 占位符图标映射
const iconMap: { [key: string]: LucideIcon } = {
  default: HelpCircle,
};

// 自动轮播间隔（毫秒）
const CAROUSEL_INTERVAL_MS = 3000;

export default function WhyChooseBusrom({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 自动轮播的核心逻辑 (保持不变)
  useEffect(() => {
    if (isHovering) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % data.reasons.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovering, data.reasons.length]);

  return (
    <section className="py-16 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        {/* --- 1. 顶部控制/标题区 (保持不变) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          {/* ... 标题和按钮 ... */}
          <div className="mb-4 md:mb-0">
            <p className="font-medium font-anaheim text-sm text-brand-secondary">
              Product Series Introduction
            </p>
            <h2 className="mt-2 font-extrabold text-5xl font-anaheim text-brand-text-black">
              {data.title} <span className="text-stroke-black">{data.title2}</span>
            </h2>
          </div>
          <Button className="flex relative items-center justify-center font-anaheim font-medium text-brand-secondary h-10 px-4 text-sm bg-transparent hover:bg-transparent">
            <div
              className="absolute w-12 h-12 bg-[#ECE8D8] rounded-full z-0"
              style={{
                top: "50%",
                left: "1px",
                transform: "translateY(-50%)",
              }}
            ></div>
            <span className="relative z-10">VIEW MORE INFORMATION</span>
          </Button>
        </div>

        {/* --- 2. 桌面端: 手风琴轮播图 (md 及以上) --- */}
        <div
          className="hidden md:flex w-full h-[500px] gap-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {data.reasons.map((reason, index) => {
            const isExpanded = activeIndex === index;
            const flex = isExpanded ? "8 1 0%" : "3 1 0%";
            const IconComponent = iconMap[reason.title] || iconMap.default;

            return (
              <div
                key={reason.title}
                className="relative overflow-hidden transition-all duration-500 ease-in-out cursor-pointer group rounded-lg" // 容器动画
                style={{ flex: flex }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* 1. 背景图 (保持不变) */}
                <Image
                  src={data.reasons[index].image.url}
                  alt={data.reasons[index].image.altText || reason.title}
                  fill
                  className="object-cover object-center z-0 transition-transform duration-500 ease-in-out group-hover:scale-105"
                />

                {/* 2. 阴影渐变 (z-10) */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-1/2 z-10",
                    "bg-gradient-to-t from-black/80 to-transparent",
                    "transition-opacity ease-in-out", // 基础过渡
                    // 【已修改】
                    isExpanded
                      ? "opacity-100 duration-200 delay-300" // 渐显: 延迟300ms, 动画200ms
                      : "opacity-0 duration-200" // 渐隐: 立即, 动画200ms
                  )}
                />

                {/* 3. 渐显的文字内容 (z-20) */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-full z-20 p-6",
                    "flex flex-col items-center justify-end text-center",
                    "transition-opacity ease-in-out", // 基础过渡
                    // 【已修改】
                    isExpanded
                      ? "opacity-100 duration-200 delay-300" // 渐显: 延迟300ms, 动画200ms
                      : "opacity-0 duration-200" // 渐隐: 立即, 动画200ms
                  )}
                >
                  <div className="w-12 h-12 mb-4 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{reason.title}</h3>
                  <p className="text-white/90">{reason.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* --- 3. 移动端: 垂直堆叠卡片 (md 以下) --- */}
        <div className="grid md:hidden grid-cols-1 gap-6">
          {data.reasons.map((reason, index) => {
            const IconComponent = iconMap[reason.title] || iconMap.default;
            return (
              // (移动端卡片布局保持不变)
              <div
                key={reason.title}
                className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
              >
                <Image
                  src={data.reasons[index].image.url}
                  alt={data.reasons[index].image.altText || reason.title}
                  fill
                  className="object-cover object-center z-0"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative z-20 h-full p-6 flex flex-col items-center justify-end text-center">
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{reason.title}</h3>
                  <p className="text-white/90 text-sm">{reason.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}