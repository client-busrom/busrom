"use client";

import type { HomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  data: HomeContent["simpleCta"];
};

// --- 辅助占位符组件（使用 Padding Hack 确保高度）---
const ImagePlaceholder = ({ ratio, src, alt, className }) => {
  const [w, h] = ratio.split("/").map(Number);
  const paddingBottom = ((h / w) * 100).toFixed(2) + "%";

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg shadow-lg", className)}
      style={{
        paddingBottom: paddingBottom,
        width: "100%",
        height: 0,
      }}
    >
      <Image
        src={src || "/placeholder.jpg"}
        alt={alt || "Layout Image"}
        fill
        sizes="(max-width: 1024px) 90vw, 30vw"
        className="object-cover"
        priority={false}
      />
    </div>
  );
};
// --- 辅助占位符组件结束 ---

export default function SimpleCta({ data }: Props) {
  // 桌面端图片尺寸 (W x H) - **缩小尺寸，增加间距**
  const sizes = {
    bg: { w: 400, h: 400, ratio: "400/400", color: "#F2EEDF" },
    A: { w: 350, h: 220, ratio: "350/220" }, // W: 549 -> 500
    B: { w: 280, h: 350, ratio: "280/350" }, // W: 326 -> 300
    C: { w: 280, h: 450, ratio: "280/450" }, // W: 327 -> 300
  };

  // 容器总宽高比（用于移动端高度自适应）
  const containerRatio = "549/700";
  const gapSize = 32; // 新的 gap-8 像素值
  const bottomGroupWidth = sizes.B.w + sizes.C.w + gapSize; // 底部组新宽度
  const overlapPercentage = "20%"; // ⬅️ **增加错位到 20%**

  return (
    <section className="py-8 bg-brand-main" data-header-theme="light">
      {/* --- 顶部 SVG 横线 --- */}
      <div className="relative min-h-[218px] w-full left-1/2 -translate-x-1/2 overflow-hidden">
        <Image
          src={"BusromLine.svg"}
          alt={"line"}
          fill
          priority={false}
          loading="lazy"
          onError={(e) => {
            console.error(`Failed to load image`);
          }}
        />
      </div>

      <div className="container mx-auto">
        {/* 外层容器：控制左右/上下堆叠 */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* ==================================== */}
          {/* 左侧：图片布局区域 (w-full / lg:w-3/5) */}
          {/* ==================================== */}
          <div
            className={cn(
              // 移动端：w-full，flex-col 堆叠
              "w-full flex flex-col items-center space-y-8",
              `aspect-[${containerRatio}]`, // 移动端使用整体比例控制高度

              // 桌面端：w-3/5，relative 上下文，固定高度
              "lg:w-1/2 lg:h-[700px] lg:relative lg:space-y-0 lg:flex-none"
            )}
          >
            {/* --- 1. 背景矩形 #F2EEDF (546x472) --- */}
            <div
              // 桌面端：绝对定位到中心
              className="bg-[#F2EEDF] w-4/5 h-auto z-10 hidden lg:block lg:absolute 
                         lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
              style={{
                maxWidth: `${sizes.bg.w}px`,
                aspectRatio: sizes.bg.ratio,
              }}
            ></div>

            {/* --- 2. 图片 A (上) (549x324) --- */}
            <div
              // 桌面端：绝对定位到左上方 (更大错位)
              className={cn(
                "w-full z-20", // 移动端基础样式
                "lg:absolute",
                // ⬅️ 更大的偏移量
                `lg:top-[${overlapPercentage}] lg:left-[${overlapPercentage}]`,
                `lg:transform lg:translate-x-[-${overlapPercentage}] lg:translate-y-[-${overlapPercentage}]`
              )}
              style={{
                maxWidth: `${sizes.A.w}px`,
              }}
            >
              <ImagePlaceholder ratio={sizes.A.ratio} src={data.images[0]?.url || "/placeholder.jpg"} alt={data.images[0]?.altText || "上方图"} className={undefined} />
            </div>

            {/* --- 3. 下方图片组容器 (B 和 C) --- */}
            <div
              className={cn(
                // 移动端：w-full, gap-8, 堆叠在图 A 下方
                "w-full flex justify-center gap-8 z-30",

                // 桌面端：绝对定位到右下方，并使用 translate 实现错位
                "lg:absolute lg:flex-row lg:items-center",
                // 【修正 1】：使用 lg:right-0 lg:bottom-0 作为起始点，然后使用负 transform 错位
                "lg:right-0 lg:bottom-0",
                `lg:transform lg:translate-x-[${overlapPercentage}] lg:translate-y-[${overlapPercentage}]`
              )}
              style={{
                width: `${bottomGroupWidth}px`,
                maxWidth: "100%",
                zIndex: 30,
              }}
            >
              {/* 图片 B (左小) */}
              <div style={{ width: `${sizes.B.w}px` }}>
                <ImagePlaceholder ratio={sizes.B.ratio} src={data.images[1]?.url || "/placeholder.jpg"} alt={data.images[1]?.altText || "左下小图"} className={undefined} />
              </div>

              {/* 图片 C (右大) */}
              <div style={{ width: `${sizes.C.w}px` }}>
                <ImagePlaceholder ratio={sizes.C.ratio} src={data.images[2]?.url || "/placeholder.jpg"} alt={data.images[2]?.altText || "右下大图"} className={undefined} />
              </div>
            </div>
          </div>

          {/* ==================================== */}
          {/* 右侧：文本区域 (w-full / lg:w-2/5)   */}
          {/* ==================================== */}
          <div className="w-full lg:w-1/3 text-left space-y-2 lg:space-y-4">
            <h3 className="text-2xl lg:text-3xl font-anaheim font-bold text-brand-text-black">{data.title}</h3>
            <h3 className="text-4xl lg:text-5xl font-anaheim font-bold text-brand-text-black">{data.title2}</h3>
            <h3 className="text-lg lg:text-xl font-anaheim font-bold text-brand-accent-gold-light">{data.subtitle}</h3>
            <p className="text-brand-text-main font-anaheim font-regular leading-relaxed">{data.description}</p>
            <div className="pt-4">
              <Link href="/contact">
                <Button className="rounded-full font-anaheim font-semibold text-md lg:text-lg" size="lg">{data.buttonText}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
