// components/home/FeatureImageLayout.tsx
"use client";

import Image from "next/image";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureImageLayoutProps {
  activeFeature: any;
  activeIndex: number;
}

const layoutTransition = { duration: 0.5, ease: "easeInOut" } as Transition;

// 基础样式：保持不变，包含背景、边框（现在用 outline）、阴影
const imageContainerBaseStyle =
  "relative block overflow-hidden rounded-lg outline outline-4 outline-[#CDC094] outline-offset-[-4px] shadow-[0_5px_15px_rgba(0,0,0,0.3)] bg-gray-100";
// 非梯形布局的圆角和边框（使用 outline）
const nonTrapezoidStyle = "rounded-lg outline outline-4 outline-[#CDC094] outline-offset-[-4px]"; // 使用 outline

export default function FeatureImageLayout({ activeFeature, activeIndex }: FeatureImageLayoutProps) {
  // --- (数据检查逻辑保持不变) ---
  if (!activeFeature || !activeFeature.images || activeFeature.images.length === 0) {
    return <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "w-full h-full flex ...")}>Image Data Missing</div>;
  }
  const layoutType = activeIndex % 5;
  const images = activeFeature.images;
  const requiredImages =
    layoutType === 0 ? 4 : layoutType === 1 ? 2 : layoutType === 2 ? 6 : layoutType === 3 ? 2 : layoutType === 4 ? 2 : 0; // 索引 4 也需要 2 张图 (与索引 3 相同)
  const hasEnoughImages = images.length >= requiredImages;
  if (!hasEnoughImages && requiredImages > 0) {
    return <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "w-full h-full flex ...")}>Incorrect Image Count...</div>;
  }

  // --- (SVG 定义保持不变) ---
  const borderColor = "#CDC094";
  const borderWidth = "4px"; // 现在只用于梯形布局
  const clipPathIdLeft = `trapezoidClipLeft`;
  const clipPathIdRight = `trapezoidClipRight`;
  const svgPathData =
    "M122.8 2H338.8C356.38 2 369.27 18.5401 364.98 35.5901L271.39 407.59C268.37 419.59 257.58 428 245.2 428H29.1999C11.6199 428 -1.27 411.46 3.02 394.41L96.61 22.4099C99.59 10.5999 110.09 2.26001 122.22 2.01001L122.8 2Z";
  const svgPathDataRight =
    "M122.8 2H338.8C356.38 2 369.27 18.5401 364.98 35.5901L271.39 407.59C268.37 419.59 257.58 428 245.2 428H29.1999C11.6199 428 -1.27 411.46 3.02 394.41L96.61 22.4099C99.59 10.5999 110.09 2.26001 122.22 2.01001L122.8 2Z";

  return (
    // 👇 外层容器：使用 padding 来控制整体大小和居中，移除 h-full
    <div className="w-full h-auto flex items-center justify-center p-4 md:p-8">
      {/* SVG Defs (保持不变) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipPathIdLeft} clipPathUnits="objectBoundingBox">
            <path d={svgPathData} transform="scale(0.002717, 0.002325)" />
          </clipPath>
          <clipPath id={clipPathIdRight} clipPathUnits="objectBoundingBox">
            <path d={svgPathDataRight} transform="scale(0.002717, 0.002325)" />
          </clipPath>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        {/* 👇 motion.div: 移除 absolute inset-0，让它由内容撑开 */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={layoutTransition}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Layout 1: 2x2 Asymmetric */}
          {layoutType === 0 && (
            <div
              className={cn(
                "flex flex-col gap-y-2 w-full",
                "aspect-[728/400]",
                "md:gap-y-4 md:w-full md:max-w-[400px] md:h-[400px] md:aspect-auto"
              )}
            >
              {/* --- 第一行 Div --- */}
              <div
                className={cn(
                  "flex gap-x-2 items-start grow",
                  "lg:gap-x-4"
                )}
              >
                {/* 左上角图片：原宽度比例 242 / (242+350) ≈ 41% */}
                <div
                  className={cn(
                    imageContainerBaseStyle,
                    nonTrapezoidStyle,
                    "h-full flex-shrink grow-[242] basis-0",
                    "lg:aspect-auto"
                  )}
                >
                  <FeatureImage src={images[0]?.url || "/placeholder.jpg"} alt={images[0]?.altText || `${activeFeature.title} 1`} sizes="(max-width: 1024px) 45vw, 242px" />
                </div>
                {/* 右上角图片：原宽度比例 350 / (242+350) ≈ 59% */}
                <div
                  className={cn(
                    imageContainerBaseStyle,
                    nonTrapezoidStyle,
                    "h-full flex-shrink grow-[350] basis-0",
                    "lg:aspect-auto"
                  )}
                >
                  <FeatureImage src={images[1]?.url || "/placeholder.jpg"} alt={images[1]?.altText || `${activeFeature.title} 2`} sizes="(max-width: 1024px) 45vw, 350px" />
                </div>
              </div>

              {/* --- 第二行 Div --- */}
              <div
                className={cn(
                  "flex gap-x-2 items-start grow",
                  "lg:gap-x-4"
                )}
              >
                <div
                  className={cn(
                    imageContainerBaseStyle,
                    nonTrapezoidStyle,
                    "h-full flex-shrink grow-[412] basis-0",
                    "lg:aspect-auto"
                  )}
                >
                  <FeatureImage src={images[2]?.url || "/placeholder.jpg"} alt={images[2]?.altText || `${activeFeature.title} 3`} sizes="(max-width: 1024px) 45vw, 412px" />
                </div>
                <div
                  className={cn(
                    imageContainerBaseStyle,
                    nonTrapezoidStyle,
                    "h-full flex-shrink grow-[181] basis-0",
                    "lg:aspect-auto"
                  )}
                >
                  <FeatureImage src={images[3]?.url || "/placeholder.jpg"} alt={images[3]?.altText || `${activeFeature.title} 4`} sizes="(max-width: 1024px) 45vw, 181px" />
                </div>
              </div>
            </div>
          )}

          {/* Layout 2: 1x2 */}
          {layoutType === 1 && (
            <div className="grid grid-cols-2 gap-2 md:gap-4 w-full max-w-md md:max-w-xl lg:max-w-2xl">
              {" "}
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[290/483]")}>
                <FeatureImage src={images[0]?.url || "/placeholder.jpg"} alt={images[0]?.altText || `${activeFeature.title} 1`} sizes="(max-width: 768px) 45vw, 290px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[290/483]")}>
                <FeatureImage src={images[1]?.url || "/placeholder.jpg"} alt={images[1]?.altText || `${activeFeature.title} 2`} sizes="(max-width: 768px) 45vw, 290px" />
              </div>
            </div>
          )}

          {/* Layout 3: 2x3 */}
          {layoutType === 2 && (
            // 使用 Grid
            <div className="grid grid-cols-3 gap-2 md:gap-4 w-full max-w-md md:max-w-xl lg:max-w-2xl">
              {" "}
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[0]?.url || "/placeholder.jpg"} alt={images[0]?.altText || `${activeFeature.title} 1`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[1]?.url || "/placeholder.jpg"} alt={images[1]?.altText || `${activeFeature.title} 2`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[2]?.url || "/placeholder.jpg"} alt={images[2]?.altText || `${activeFeature.title} 3`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[3]?.url || "/placeholder.jpg"} alt={images[3]?.altText || `${activeFeature.title} 4`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[4]?.url || "/placeholder.jpg"} alt={images[4]?.altText || `${activeFeature.title} 5`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
              <div className={cn(imageContainerBaseStyle, nonTrapezoidStyle, "aspect-[180/199]")}>
                <FeatureImage src={images[5]?.url || "/placeholder.jpg"} alt={images[5]?.altText || `${activeFeature.title} 6`} sizes="(max-width: 768px) 30vw, 180px" />
              </div>
            </div>
          )}

          {/* Layout 4: 1x2 Trapezoid */}
          {(layoutType === 3 || layoutType === 4) && (
            <div
              className={cn(
                "grid grid-cols-2 w-full max-w-lg", // 移动端
                "md:max-w-2xl",
                "lg:max-w-3xl" // 桌面端
              )}
            >
              <div
                className="relative shadow-[...] aspect-[368/430] -mr-4"
                style={{ backgroundColor: borderColor, clipPath: `url(#${clipPathIdLeft})` }}
              >
                <div className="absolute overflow-hidden bg-gray-100" style={{ inset: borderWidth, clipPath: `url(#${clipPathIdLeft})` }}>
                  <FeatureImage
                    src={images[0]?.url || "/placeholder.jpg"}
                    alt={images[0]?.altText || `${activeFeature.title} 1`}
                    sizes="(max-width: 768px) 48vw, (max-width: 1024px) 45vw, 450px"
                  />
                </div>
              </div>
              {/* --- 右侧梯形 --- */}
              <div
                className={cn("relative shadow-[...] aspect-[368/430]", "-ml-4")}
                style={{ backgroundColor: borderColor, clipPath: `url(#${clipPathIdRight})` }}
              >
                <div className="absolute overflow-hidden bg-gray-100" style={{ inset: borderWidth, clipPath: `url(#${clipPathIdRight})` }}>
                  <FeatureImage
                    src={images[1]?.url || "/placeholder.jpg"}
                    alt={images[1]?.altText || `${activeFeature.title} 2`}
                    sizes="(max-width: 768px) 48vw, (max-width: 1024px) 45vw, 450px"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const FeatureImage = ({ src, alt, sizes }: { src: string; alt: string; sizes: string }) => (
  <Image
    src={src}
    alt={alt}
    fill
    sizes={sizes}
    className="object-cover"
    priority={false}
    loading="lazy"
    onError={(e) => {
      console.error(`Failed to load image: ${src}`);
    }}
  />
);
