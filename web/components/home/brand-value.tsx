"use client";

import type { HomeContent } from "@/lib/content-data";
import Image from "next/image";
import { cn } from "@/lib/utils"; // 导入 cn

// ---
// 1. 类型定义 (保持不变)
// ---
type BrandValueItem = {
  title: string;
  description: string;
  image: string;
};

type BrandValueData = {
  title: string;
  subtitle: string;
  param1: BrandValueItem;
  param2: BrandValueItem;
  slogan: BrandValueItem;
  value: BrandValueItem;
  vision: BrandValueItem;
};

type Props = {
  data: BrandValueData;
};

export default function BrandValue({ data }: Props) {
  // ---
  // 2. 将数据对象转换为数组 (保持不变)
  // ---
  const items = [
    data.param1,
    data.param2,
    data.slogan,
    data.value,
    data.vision,
  ];

  return (
    <section className="py-20 bg-brand-main min-h-[100vh]" data-header-theme="light">
      <div className="container mx-auto">
        
      {/* 标题部分 (保持不变) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-6 md:mb-0">
            <h2 className="font-extrabold text-5xl font-anaheim font-extrabold text-stroke-black mb-2">{data.title}</h2>
            <p className="font-extrabold text-5xl font-anaheim font-extrabold text-brand-text-black max-w-lg">{data.subtitle}</p>
          </div>
        </div>

        {/* --- 
          4. 桌面端 "手风琴" 效果 (md 及以上)
           【已修改】使用 hidden md:flex 
        --- */}
        <div className="hidden md:flex flex-row gap-4 items-end h-[400px]">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "relative flex-1 rounded-xl overflow-hidden", // 桌面端均分宽度
                "transition-all duration-500 ease-in-out",
                "group",
                "h-[200px]", // 桌面端初始高度
                "hover:h-[400px]" // 桌面端悬停效果
              )}
            >
              {/* 背景图片 */}
              <Image
                src={item.image.url}
                alt={item.image.altText || item.title || item.description}
                fill
                sizes="(max-width: 1200px) 20vw, 250px"
                className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
              {/* 文字内容 */}
              <div className="absolute bottom-0 left-0 z-20 p-4 w-full">
                {item.title && (
                  <h3 className="text-center text-sm font-anaheim font-semibold text-brand-text-inverse tracking-wider">
                    {item.title}
                  </h3>
                )}
                <p className={cn(
                  "text-center text-brand-text-inverse text-sm font-anaheim font-semibold",
                  item.title ? "mt-1" : "mt-0"
                )}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- 
          5. 移动端 垂直卡片 (md 以下)
           【已修改】使用 grid md:hidden, 布局参考 WhyChooseBusrom
        --- */}
        <div className="grid md:hidden grid-cols-1 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="md:py-0 py-16 relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
            >
              {/* 背景图片 */}
              <Image
                src={item.image.url}
                alt={item.image.altText || item.title || item.description}
                fill
                sizes="100vw"
                className="object-cover object-center z-0"
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
              {/* 文字内容 */}
              <div className="relative z-20 h-full p-6 flex flex-col items-center justify-end text-center">
                {item.title && (
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                )}
                <p className={cn(
                  "text-white/90 text-sm",
                  item.title ? "mt-1" : "mt-0"
                )}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}