"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HomeContent } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  data: HomeContent["quoteSteps"];
};

const AUTO_SCROLL_INTERVAL = 4000; // 4 秒自动轮播
const STEP_SUB_TEXT = "Send Detail"; 
const ROTATION_DEGREES = -15; // 逆时针旋转 20 度

export default function QuoteSteps({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const title2Text = data.title2 || "";
  // 使用正则表达式匹配第一个数字或数字串
  const parts = title2Text.split(/(\d+)/);

  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [imagePositions, setImagePositions] = useState<Array<{ left: number; top: number; }>>([]);
  
  const activeIndexToDisplay = hoveredIndex !== -1 ? hoveredIndex : activeIndex;

  // --- 轮播控制函数 ---
  const handleNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % data.steps.length);
  }, [data.steps.length]);

  // --- 测量函数：计算图片定位点 (在 li 内部的绝对像素位置) ---
  const measurePositions = useCallback(() => {
    if (!textRefs.current.every(ref => ref)) return; 

    const newPositions = textRefs.current.map((textDiv, index) => {
      const liEl = textDiv?.closest('li');
      const textRect = textDiv?.getBoundingClientRect();
      const liRect = liEl?.getBoundingClientRect();
      
      if (!textRect || !liRect) return { left: 0, top: 0 };
      
      // 目标点：文本容器的右下角 (textRect.right, textRect.bottom)
      
      // 计算相对于 li (relative) 的 top 和 left 像素值
      const targetLeft = textRect.right - liRect.left;
      const targetTop = textRect.bottom - liRect.top;

      // 我们将图片的左上角定位到这个点。
      return { left: targetLeft, top: targetTop };
    });
    
    // 确保我们只更新有效值
    if (newPositions.every(pos => pos.left !== undefined)) {
        setImagePositions(newPositions as { left: number; top: number; }[]);
    }
  }, [textRefs, data.steps.length]); // 依赖 steps.length 确保只在数据加载后测量

  // --- 滚动/激活监听器 ---
  useEffect(() => {
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

    // 测量 DOM 元素位置
    measurePositions();
    window.addEventListener('resize', measurePositions);
    
    return () => {
        stopInterval();
        window.removeEventListener('resize', measurePositions);
    };
  }, [handleNext, measurePositions]);
  
  // --- 交互处理 ---
  const handleMouseEnter = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoveredIndex(index);
  };
  
  const handleMouseLeave = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(handleNext, AUTO_SCROLL_INTERVAL);
    }
    setHoveredIndex(-1);
  };

  return (
    <section className="py-16 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        
        {/* --- 顶部内容区：左右分栏 (保持不变) --- */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12 items-start">
          
          <div className="w-full md:w-1/2 text-center md:text-left space-y-2">
            <h2 className={cn(
                "text-4xl font-anaheim font-bold",
                "text-stroke-black",
              )}>{data.title}</h2>
            <h2 className="text-6xl font-anaheim font-extrabold text-brand-text-black">
                {parts.map((part, index) => {
                  // 检查：如果 part 是数字 (即 index 是奇数，且内容为数字)
                  const isNumber = !isNaN(Number(part)) && part.trim() !== '';

                  return (
                    <span 
                      key={index}
                      className={cn(
                        "inline",
                        { "text-brand-accent-gold": isNumber } // ⬅️ 应用金色强调色
                      )}
                    >
                      {part}
                    </span>
                  );
                })}
              </h2>
            <h3 className="text-xl text-brand-secondary">{data.subtitle}</h3>
          </div>

          <div className="w-full md:w-1/2 relative flex justify-center md:justify-start">
            <div className="relative max-w-lg text-center md:text-left pt-6 md:pt-8">
              <div 
                className="absolute w-12 h-12 bg-[#ECE8D8] rounded-full z-0"
                style={{ top: '30%', left: '0', transform: 'translateX(-50%) translateY(-50%)' }}
              ></div>
              <p className="text-brand-secondary font-anaheim font-medium relative z-10">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        {/* --- 下方：步骤列表 (Steps) --- */}
        <ol 
          className="relative flex py-32 flex-col justify-start space-y-[132px] min-h-[300px]"
          onMouseLeave={handleMouseLeave}
        >
          {data.steps.map((step, index) => {
            const isActive = index === activeIndexToDisplay;
            const pos = imagePositions[index] || { left: 0, top: 0 }; // ⬅️ 获取动态位置

            return (
              <li 
                key={step.text} 
                className="w-full relative transition-all duration-300 group cursor-pointer p-2"
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* 1. 序号和文本内容容器 (居中) */}
                <div className="flex items-center space-x-6 mx-auto max-w-lg md:max-w-2xl relative z-10"> 
                    
                    {/* 1. 步骤序号 (01/) */}
                    <span 
                        className={cn(
                            "text-6xl font-montserrat font-extrabold transition-all duration-300 flex-shrink-0",
                            "text-stroke-black",
                            { 'text-brand-text-black': isActive }
                        )}
                        style={{ lineHeight: 1 }}
                    >
                        0{index + 1}/
                    </span>
                
                    {/* 2. 步骤文本 (小字+大字) - 使用 Ref 测量 */}
                    <div 
                      ref={(el: HTMLDivElement | null) => { 
                        textRefs.current[index] = el;
                      }} 
                      className="text-left"
                    >
                        <p 
                            className={cn(
                                "text-sm font-anaheim font-regular mb-1 transition-colors duration-300",
                                isActive ? "text-brand-text-black" : "text-brand-text-black/50"
                            )}
                        >
                            {STEP_SUB_TEXT}
                        </p>
                        <p 
                            className={cn(
                                "text-lg md:text-2xl font-anaheim font-bold transition-colors duration-300",
                                isActive ? "text-brand-text-black" : "text-brand-text-black/80"
                            )}
                        >
                            {step.text}
                        </p>
                    </div>
                </div>

                {/* 3. 步骤图片 (绝对定位) */}
                <div
                  className={cn(
                    "absolute z-0 transition-opacity duration-300",
                    "md:w-[400px] w-[200px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl",
                    isActive ? "opacity-100" : "opacity-0 pointer-events-none" 
                  )}
                  style={{
                    left: pos.left - 100,
                    top: pos.top,
                    transformOrigin: '50% 50%', 
                    transform: isActive 
                        ? `translateY(-60%) rotate(${ROTATION_DEGREES}deg)`
                        : `translateY(-60%) rotate(0deg)`,
                    transitionProperty: 'transform, opacity', 
                    transitionDuration: '500ms',
                  }}
                >
                    <Image
                        src={step.image.url}
                        alt={step.image.altText || step.text}
                        fill
                        sizes="150px"
                        className="object-cover"
                    />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}