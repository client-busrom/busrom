"use client";

import { useState, useEffect, useRef } from "react";
import type { HomeContent } from "@/lib/content-data";
import { AnimatedLinkButton } from "@/components/ui/animated-link-button";
import { LucideIcon, HelpCircle, Lightbulb, ShieldCheck, Factory, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils"; // 导入 cn
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type Props = {
  data: HomeContent["whyChooseBusrom"];
};

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;

// 图标映射 - 根据 reason title 匹配对应图标
const iconMap: { [key: string]: LucideIcon } = {
  "Original & Proprietary Design": Lightbulb,
  "Relentless Quality & Integration": ShieldCheck,
  "Factory-direct Production": Factory,
  "Years of Global Expertise": Globe,
  "Collaborative R&D Partnership": Users,
  // 中文映射
  "原创与专有设计": Lightbulb,
  "严格质量与整合": ShieldCheck,
  "工厂直接生产": Factory,
  "多年全球专业经验": Globe,
  "合作研发伙伴关系": Users,
  default: HelpCircle,
};

// 自动轮播间隔（毫秒）
const CAROUSEL_INTERVAL_MS = 3000;

export default function WhyChooseBusrom({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const reasonsLength = data?.reasons?.length || 0;

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

  // 自动轮播的核心逻辑 (仅在视口内运行)
  useEffect(() => {
    if (isHovering || reasonsLength === 0 || !isVisible) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % reasonsLength);
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovering, reasonsLength, isVisible]);

  // Guard: if no data, don't render
  if (!data || !data.reasons || data.reasons.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="pt-20 pb-16 md:pt-24 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        {/* --- 1. 顶部控制/标题区 --- */}
        {/* 移动端标题 */}
        <div className="flex flex-col md:hidden mb-6">
          <h2 className="font-anaheim font-extrabold text-2xl text-brand-text-black">
            {data.title} <span className="text-stroke-black">{data.title2}</span>
          </h2>
        </div>

        {/* 桌面端标题 */}
        <div className="hidden md:flex justify-between items-end mb-12">
          <div>
            <h2
              className="font-anaheim font-extrabold text-brand-text-black"
              style={{
                fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
              }}
            >
              {data.title} <span className="text-stroke-black">{data.title2}</span>
            </h2>
          </div>

          {/* 右侧按钮 */}
          <AnimatedLinkButton>
            VIEW MORE INFORMATION
          </AnimatedLinkButton>
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
                <OptimizedImage
                  image={data.reasons[index].image}
                  alt={data.reasons[index].image?.altText || reason.title}
                  size="small"
                  className="object-cover object-center z-0 transition-transform duration-500 ease-in-out group-hover:scale-105 absolute inset-0 w-full h-full"
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
                <OptimizedImage
                  image={data.reasons[index].image}
                  alt={data.reasons[index].image?.altText || reason.title}
                  size="small"
                  className="object-cover object-center z-0 absolute inset-0 w-full h-full"
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