"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Component, Cpu, EyeOff, Factory, Gauge, HelpCircle, LucideIcon, ShieldCheck, Sparkles, Target, Waves } from "lucide-react";

type Props = {
  data: HomeContent["brandAdvantages"];
};

const SECTION_HEIGHT = 3000;
const REVEAL_START_OFFSET = 100;
const HIDE_OFFSET = 400;

const ADVANTAGE_POSITIONS = [
  // 索引 0: Top Left
  { top: "25%", left: "18%", md: "md:top-[25%] md:left-[18%]" },
  // 索引 1: Top Center Left
  { top: "15%", left: "40%", md: "md:top-[15%] md:left-[40%]" },
  // 索引 2: Top Center Right
  { top: "20%", right: "18%", md: "md:top-[25%] md:right-[18%]" },
  // 索引 3: Middle Right
  { top: "30%", right: "10%", md: "md:top-[35%] md:right-[10%]" },
  // 索引 4: Bottom Right
  { bottom: "30%", right: "10%", md: "md:bottom-[30%] md:right-[10%]" },
  // 索引 5: Bottom Center Right
  { bottom: "15%", right: "25%", md: "md:bottom-[15%] md:right-[25%]" },
  // 索引 6: Bottom Center Left
  { bottom: "25%", left: "10%", md: "md:bottom-[25%] md:left-[10%]" },
  // 索引 7: Middle Left
  { top: "35%", left: "10%", md: "md:top-[25%] md:left-[10%]" },
  // 索引 8: Bottom Left
  { bottom: "10%", left: "25%", md: "md:bottom-[10%] md:left-[25%]" },
];

const iconMap: { [key: string]: LucideIcon } = {
  Sparkles,
  Target,
  Component,
  ShieldCheck,
  Gauge,
  EyeOff,
  Waves,
  Cpu,
  Factory,
  default: HelpCircle, // 备用图标
};

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

    const isScrollingWithinSection = scrollY >= stickyStartPoint && scrollY <= sectionBottom;

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

      const scrollProgress = Math.min(1, Math.max(0, (scrollY - revealStart) / (revealEnd - revealStart)));

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

  return (
    <section
      ref={sectionRef}
      className="bg-gray-800 text-white relative"
      data-header-theme="transparent"
      style={{ minHeight: `${SECTION_HEIGHT}px` }}
    >
      <Image src="/BusromBandBg.png" alt="日照金山" fill sizes="100vw" className="object-cover absolute inset-0 z-0" />

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
          <Image src={svgSrc} alt={"Busrom Band"} fill sizes="100vw" className="object-cover" />
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
          <div className="container mx-auto relative h-full">
            {/* 1. H1 中心标题 (作为定位的中心点) */}
            <h1 className="text-center font-pingfang font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
              <span
                className={cn(
                  "text-5xl md:text-7xl opacity-0 md:opacity-100",
                  "md:text-[#FFFFFF] lg:text-[13rem]" // lg 继承 md 的颜色
                )}
              >
                Busrom
              </span>
            </h1>

            {/* 2. Advantages 椭圆形环绕 */}
            <ul
              // ⬅️ 关键修正：移除负 margin m-[-3rem] lg:m-[-5rem]
              className="absolute inset-0 flex flex-col justify-center items-center space-y-4 md:block md:space-y-0"
            >
              {data.advantages.map((advantage, index) => {
                const pos = ADVANTAGE_POSITIONS[index % ADVANTAGE_POSITIONS.length];
                const iconName = data.icons[index];
                const IconComponent = iconMap[iconName] || iconMap.default;
                return (
                  <li
                    key={advantage}
                    className={cn(
                      // ⬅️ 确保放大时不会被相邻元素裁切
                      "p-2 transition-all duration-300 text-center text-sm hover:scale-105 transition-transform z-40 hover:z-50",
                      "w-4/5 max-w-[200px] md:max-w-[250px]",
                      "md:absolute md:text-left",
                      pos.md
                    )}
                    style={{
                      // ⬅️ 注意：由于移除了负 margin，这里的百分比定位现在是相对于 container 内部的
                      top: pos.top,
                      left: pos.left,
                      bottom: pos.bottom,
                      right: pos.right,
                    }}
                  >
                    <span className="flex items-center justify-center md:justify-start">
                      <IconComponent
                        className="w-12 h-12 mr-3 flex-shrink-0 hidden md:block" // 保留原有样式
                        stroke="#FFFFFF"
                        strokeWidth="2" // lucide-react 默认是 2, 这里可以明确指定
                      />
                      <span className="font-anaheim font-angular text-xs md:inline-block md:ml-0">{advantage}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
