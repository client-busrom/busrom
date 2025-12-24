"use client";

import type { BrandValueData } from "@/lib/content-data";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// ---
// 1. 类型定义
// ---
type Props = {
  data: BrandValueData;
};

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;

export default function BrandValue({ data }: Props) {
  // Guard: if no data, don't render
  if (!data || !data.param1 || !data.param2 || !data.slogan || !data.value || !data.vision) {
    return null;
  }

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
    <section className="pt-20 pb-16 md:pt-24 bg-brand-main min-h-[100vh]" data-header-theme="light">
      <div className="container mx-auto">

        {/* 移动端标题 */}
        <div className="flex flex-col md:hidden mb-6">
          <h2 className="font-anaheim font-extrabold text-2xl text-stroke-black mb-1">
            {data.title}
          </h2>
          <p className="font-anaheim font-extrabold text-2xl text-brand-text-black">
            {data.subtitle}
          </p>
        </div>

        {/* 桌面端标题 */}
        <div className="hidden md:block mb-12">
          <h2
            className="font-anaheim font-extrabold text-stroke-black"
            style={{
              fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
              marginBottom: `${(16 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.title}
          </h2>
          <p
            className="font-anaheim font-extrabold text-brand-text-black"
            style={{
              fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.subtitle}
          </p>
        </div>

        {/* ---
          4. 桌面端 "手风琴" 效果 (md 及以上)
           1,3,5 向上延伸，2,4 向下延伸
        --- */}
        <div className="hidden md:flex flex-row gap-4 h-[500px] mt-16 items-center">
          {items.map((item, index) => {
            // 1,3,5 (index 0,2,4) 向上延伸，2,4 (index 1,3) 向下延伸
            const extendsUp = index % 2 === 0;

            return (
              <div
                key={index}
                className={cn(
                  "relative flex-1 rounded-xl overflow-hidden",
                  "transition-[height] duration-500 ease-in-out",
                  "group",
                  "h-[250px]",
                  "hover:h-[500px]",
                  // 向上延伸的从底部开始，向下延伸的从顶部开始
                  extendsUp ? "self-end" : "self-start"
                )}
              >
                {/* 背景图片 */}
                <OptimizedImage
                  image={item.image}
                  alt={item.image?.altText || item.title || item.description}
                  size="small"
                  className="object-cover z-0 transition-transform duration-500 group-hover:scale-105 absolute inset-0 w-full h-full"
                />
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
                {/* 文字内容 - 始终在底部垂直居中 */}
                <div className="absolute bottom-0 left-0 z-20 p-4 w-full h-[250px] flex flex-col items-center justify-center">
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
            );
          })}
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
              <OptimizedImage
                image={item.image}
                alt={item.image?.altText || item.title || item.description}
                size="small"
                className="object-cover object-center z-0 absolute inset-0 w-full h-full"
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