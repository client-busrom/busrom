"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { HomeContent, FeaturedProduct } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Props = {
  data: HomeContent["featuredProducts"];
  locale: Locale;
};

type ProductCardProps = {
  product: FeaturedProduct;
  stepTransform: string;
};

// --- 阶梯错位映射 (应用到卡片本身) ---
const STEPPED_TRANSFORMS = [
  "lg:translate-y-0",  // 左侧最高
  "lg:translate-y-8",  // 中间向下偏移 32px
  "lg:translate-y-16", // 右侧向下偏移 64px
];
// 统一图片尺寸（示例：更宽的比例，并缩小 max-width）
const IMAGE_ASPECT_RATIO = "aspect-[3/4]";
const CARD_MAX_WIDTH = "max-w-xs"; // ⬅️ 限制图片宽度，使其比现在小


// --- 辅助组件：产品卡片 ---
const ProductCard = ({ product, stepTransform }: ProductCardProps) => ( 
  // ⬅️ 关键修改：添加 hover:scale-105 和 transition/duration
  <div 
    className={cn(
        "flex flex-col h-full", 
        stepTransform,
        "transition-transform duration-700 origin-top-left ease-in-out hover:scale-[1.05] transform" // ⬅️ 1.03 或 1.05 都可以，选择一个轻微的
    )}
  > 
    {/* 图片容器 - 统一尺寸 */}
    <div 
      className={cn(
        "relative w-full rounded-xl overflow-hidden shadow-lg mb-4",
        IMAGE_ASPECT_RATIO, 
        CARD_MAX_WIDTH 
      )}
    >
      <Image
        src={product.image?.url || "/placeholder.jpg"}
        alt={product.image?.altText || product.title}
        fill
        sizes="(max-width: 768px) 90vw, 30vw"
        className="object-cover"
      />
    </div>
    
    {/* 文本内容 */}
    <div className="px-2">
      <h3 className="font-anaheim font-extrabold text-brand-text-black text-lg mb-1">
        Short title
      </h3>
      {/* 特点列表 */}
      <ul className="text-sm space-y-1 text-brand-text-main">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-brand-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            <span className="truncate">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
// --- 产品卡片结束 ---

export default function FeaturedProducts({ data, locale }: Props) {
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0); 

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);


  // --- 拖拽滚动处理函数 ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    scrollContainerRef.current.style.cursor = 'grabbing'; // 改变鼠标指针
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault(); // 阻止文本选择等默认行为
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // 滚动速度倍数
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab'; // 恢复鼠标指针
  }, []);

  // ⬅️ 挂载全局事件监听器以确保鼠标离开容器后拖拽仍能停止
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  const productSeries = data.series || []; 
  
  const featuredItems = useMemo(() => {
    return productSeries[activeSeriesIndex]?.products || [];
  }, [activeSeriesIndex, productSeries]);

  const itemsToDisplay = featuredItems.slice(0, 3);


  return (
    <section className="py-16 bg-brand-main" data-header-theme="light">
      <div className="container mx-auto">
        
        {/* --- 顶部控制/标题区 (保持不变) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
          
          {/* 左侧：Product Series Introduction & Hot Products */}
          <div className="mb-4 md:mb-0">
            <p className="font-medium font-anaheim font-medium text-sm text-brand-secondary">Product Series Introduction</p>
            <h2 className="font-extrabold text-5xl font-anaheim font-extrabold text-brand-text-black">{data.title || "Hot Products"}</h2>
          </div>

          {/* 右侧：View More Information 按钮 */}
          <Button className="flex relative items-center justify-center font-anaheim font-medium text-brand-secondary h-10 px-4 text-sm bg-transparent hover:bg-transparent">
            {/* 1. 绝对定位的圆形背景 */}
            <div 
              className="absolute w-12 h-12 bg-[#ECE8D8] rounded-full z-0"
              style={{
                // ⬅️ 调整 top 和 left/transform 来定位圆圈
                // 大概让 'VIEW' 单词在圆内
                top: '50%',          // 垂直居中
                left: '1px',        // 根据实际文本长度和圆圈大小调整
                transform: 'translateY(-50%)', // 垂直居中微调
              }}
            ></div>
            
            {/* 2. 文本内容，确保在圆圈之上 */}
            <span className="relative z-10">VIEW MORE INFORMATION</span>
          </Button>
        </div>

        {/* --- 产品系列导航标签 (保持不变) --- */}
        <div 
          ref={scrollContainerRef} // ⬅️ 关联 Ref
          onMouseDown={handleMouseDown} // ⬅️ 启用拖拽
          onMouseLeave={handleMouseUp} // ⬅️ 鼠标离开时停止拖拽 (作为备用)
          
          // ⬅️ 关键修正：添加 cursor-grab 样式，并允许水平滚动
          className="flex flex-row flex-nowrap gap-x-4 gap-y-2 mb-4 overflow-x-auto pb-2 scrollbar-hide cursor-grab select-none"
        >
          {productSeries.map((series, index) => (
            <button 
              key={series.seriesTitle}
              // ⬅️ 确保在拖拽模式下，onMouseEnter 事件不会被触发
              onMouseEnter={() => !isDragging && setActiveSeriesIndex(index)}
              className={cn(
                "px-5 py-2 whitespace-nowrap rounded-full text-sm transition-colors",
                index === activeSeriesIndex
                  ? "bg-brand-secondary text-white" 
                  : "bg-transparent border border-brand-text-black/20 text-brand-text-black hover:bg-brand-secondary/10"
              )}
            >
              {series.seriesTitle}
            </button>
          ))}
        </div>

        {/* --- 三栏产品卡片网格 (阶梯状) --- */}
        <div 
          // ⬅️ 关键：使用 items-start 确保所有卡片从顶部开始对齐
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 items-start mb-8"
        >
          {itemsToDisplay.map((product, index) => (
            <ProductCard 
                key={product.title} 
                product={{
                  ...product,
                }}
                // ⬅️ 关键：应用阶梯 transform 类
                stepTransform={STEPPED_TRANSFORMS[index % 3]} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}