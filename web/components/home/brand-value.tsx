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
  if (
    !data ||
    !data.param1 ||
    !data.param2 ||
    !data.slogan ||
    !data.value ||
    !data.vision
  ) {
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
    <section
      className="pt-20 pb-16 lg:pt-24 lg:pb-16 bg-brand-main"
      data-header-theme="light"
    >
      <div className="container mx-auto">
        {/* 移动端标题 */}
        <div className="flex flex-col md:hidden mb-6">
          <h2 className="font-anaheim font-extrabold text-xl text-stroke-black mb-1">
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
              fontSize: `${(70 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
              marginBottom: `${(16 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.title}
          </h2>
          <p
            className="font-anaheim font-extrabold text-brand-text-black"
            style={{
              fontSize: `${(80 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(67 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {data.subtitle}
          </p>
        </div>

        {/* ---
          4. 桌面端 "手风琴" 效果 (lg 及以上)
           容器高度 785，五个 item 初始在容器中间
           1,3,5 向上延伸，2,4 向下延伸
           文字独立在图片外层，不受图片伸展影响
        --- */}
        <div
          className="hidden md:flex flex-row gap-4 mt-16 items-center justify-center -translate-y-[50px]"
          style={{ height: `${(785 / DESIGN_WIDTH) * 100}vw` }}
        >
          {items.map((item, index) => {
            // 1,3,5 (index 0,2,4) 向上延伸，2,4 (index 1,3) 向下延伸
            const extendsDown = index % 2 === 1;
            const imageContainerId = `brand-value-image-${index}`;

            return (
              // 外层容器：固定尺寸，hover 事件在这里处理以避免闪烁
              <div
                key={index}
                className={cn(
                  "relative flex flex-col items-center justify-center group",
                  extendsDown ? "self-end" : "self-start",
                )}
                style={{
                  width: `${(304 / DESIGN_WIDTH) * 100}vw`,
                  height: `${(262 / DESIGN_WIDTH) * 100}vw`,
                  // 初始位置在容器中间
                  marginTop: !extendsDown
                    ? `${(261.5 / DESIGN_WIDTH) * 100}vw`
                    : undefined,
                  marginBottom: extendsDown
                    ? `${(261.5 / DESIGN_WIDTH) * 100}vw`
                    : undefined,
                }}
              >
                {/* 图片容器：只改变 height，定位从一开始就固定 */}
                <div
                  id={imageContainerId}
                  className={cn(
                    "absolute left-0 right-0 rounded-xl overflow-hidden transition-[height] duration-500 ease-in-out",
                    extendsDown ? "top-0" : "bottom-0",
                  )}
                  style={{ height: `${(262 / DESIGN_WIDTH) * 100}vw` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.height = `${(523 / DESIGN_WIDTH) * 100}vw`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.height = `${(262 / DESIGN_WIDTH) * 100}vw`;
                  }}
                >
                  <OptimizedImage
                    image={item.image}
                    alt={item.image?.altText || item.title || item.description}
                    size="medium"
                    className="object-cover z-0 transition-transform duration-500 group-hover:scale-105 absolute inset-0 w-full h-full object-center"
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* 文字：固定在外层容器中，不随图片移动，不阻止悬停，初始隐藏悬停显示 */}
                <div className="relative z-20 flex flex-col items-center justify-center text-center p-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {item.title && (
                    <h3
                      className="font-anaheim font-semibold text-white tracking-wider whitespace-pre-line"
                      style={{ fontSize: `${(20 / DESIGN_WIDTH) * 100}vw` }}
                    >
                      {item.title.replace(/\\n|\/n/g, "\n")}
                    </h3>
                  )}
                  <p
                    className="font-anaheim font-medium text-white whitespace-pre-line"
                    style={{
                      fontSize: item.title
                        ? `${(16 / DESIGN_WIDTH) * 100}vw`
                        : `${(20 / DESIGN_WIDTH) * 100}vw`,
                      marginTop: item.title
                        ? `${(4 / DESIGN_WIDTH) * 100}vw`
                        : 0,
                    }}
                  >
                    {item.description.replace(/\\n|\/n/g, "\n")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---
          5. 移动端 垂直卡片 (md 以下)
        --- */}
        <div className="grid md:hidden grid-cols-1 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg"
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
                <p
                  className={cn(
                    "text-white/90 text-sm",
                    item.title ? "mt-1" : "mt-0",
                  )}
                >
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
