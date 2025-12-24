"use client";

import { motion, AnimatePresence, Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface FeatureImageLayoutProps {
  activeFeature: any;
  activeIndex: number;
}

const layoutTransition = { duration: 0.5, ease: "easeInOut" } as Transition;

// 图片容器基础样式
const imageContainerBaseStyle =
  "relative block overflow-hidden bg-gray-100";

// 普通矩形图片样式（带圆角和边框）- 4px 边框
const rectangleImageStyle =
  "rounded-[12px] lg:rounded-[16px] border-[4px] border-[#CDC094] shadow-[0_4px_7px_rgba(0,0,0,0.25)]";

// 平行四边形 SVG viewBox 尺寸
const TRAPEZOID_WIDTH = 300;
const TRAPEZOID_HEIGHT = 500;
const CORNER_RADIUS = 16; // 圆角更小
const SLANT = 54; // 向右倾斜量

// 平行四边形：整体向右倾斜
// 左上角钝角，右上角锐角，左下角锐角，右下角钝角
//     ________
//    /       /
//   /       /
//  /       /
// /_______/

const parallelogramPath = `
  M ${SLANT + CORNER_RADIUS} 0
  L ${TRAPEZOID_WIDTH - CORNER_RADIUS} 0
  Q ${TRAPEZOID_WIDTH} 0 ${TRAPEZOID_WIDTH} ${CORNER_RADIUS}
  L ${TRAPEZOID_WIDTH - SLANT} ${TRAPEZOID_HEIGHT - CORNER_RADIUS}
  Q ${TRAPEZOID_WIDTH - SLANT} ${TRAPEZOID_HEIGHT} ${TRAPEZOID_WIDTH - SLANT - CORNER_RADIUS} ${TRAPEZOID_HEIGHT}
  L ${CORNER_RADIUS} ${TRAPEZOID_HEIGHT}
  Q 0 ${TRAPEZOID_HEIGHT} 0 ${TRAPEZOID_HEIGHT - CORNER_RADIUS}
  L ${SLANT} ${CORNER_RADIUS}
  Q ${SLANT} 0 ${SLANT + CORNER_RADIUS} 0
  Z
`;

// 两张图都用同样的平行四边形
const trapezoidLeftPath = parallelogramPath;
const trapezoidRightPath = parallelogramPath;

export default function FeatureImageLayout({ activeFeature, activeIndex }: FeatureImageLayoutProps) {
  if (!activeFeature || !activeFeature.images || activeFeature.images.length === 0) {
    return (
      <div className={cn(imageContainerBaseStyle, rectangleImageStyle, "w-full h-[400px] flex items-center justify-center")}>
        <span className="text-gray-400">Image Data Missing</span>
      </div>
    );
  }

  const layoutType = activeIndex % 5;
  const images = activeFeature.images;
  const requiredImages = layoutType === 0 ? 4 : layoutType === 1 ? 2 : layoutType === 2 ? 6 : 2;

  if (images.length < requiredImages) {
    return (
      <div className={cn(imageContainerBaseStyle, rectangleImageStyle, "w-full h-[400px] flex items-center justify-center")}>
        <span className="text-gray-400">Need {requiredImages} images, got {images.length}</span>
      </div>
    );
  }

  // 统一的图片区域高度 - 增大图片，留出阴影空间
  const containerHeight = "h-[210px] lg:h-[280px] xl:h-[320px] 2xl:h-[370px]";
  const containerWidth = "w-full max-w-[280px] lg:max-w-[360px] xl:max-w-[420px] 2xl:max-w-[500px]";

  return (
    <div className={cn("w-full flex items-start justify-center", containerHeight)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={layoutTransition}
          className="w-full h-full flex items-start justify-center"
        >
          {/* Layout 0: 2x2 不规则网格 (4张图) */}
          {layoutType === 0 && (
            <div className={cn(containerWidth, "h-full pb-2")}>
              <div className="flex flex-col gap-[6px] lg:gap-[8px] xl:gap-[10px] 2xl:gap-[12px] h-full">
                {/* 第一行 - 42% 高度 */}
                <div className="flex gap-[6px] lg:gap-[8px] xl:gap-[10px] 2xl:gap-[12px]" style={{ height: "42%" }}>
                  <div
                    className={cn(imageContainerBaseStyle, rectangleImageStyle, "h-full")}
                    style={{ flex: "242 1 0" }}
                  >
                    <FeatureImage
                      image={images[0]}
                      alt={images[0]?.altText || `${activeFeature.title} 1`}
                    />
                  </div>
                  <div
                    className={cn(imageContainerBaseStyle, rectangleImageStyle, "h-full")}
                    style={{ flex: "350 1 0" }}
                  >
                    <FeatureImage
                      image={images[1]}
                      alt={images[1]?.altText || `${activeFeature.title} 2`}
                    />
                  </div>
                </div>
                {/* 第二行 - 58% 高度 */}
                <div className="flex gap-[6px] lg:gap-[8px] xl:gap-[10px] 2xl:gap-[12px]" style={{ height: "55%" }}>
                  <div
                    className={cn(imageContainerBaseStyle, rectangleImageStyle, "h-full")}
                    style={{ flex: "412 1 0" }}
                  >
                    <FeatureImage
                      image={images[2]}
                      alt={images[2]?.altText || `${activeFeature.title} 3`}
                    />
                  </div>
                  <div
                    className={cn(imageContainerBaseStyle, rectangleImageStyle, "h-full")}
                    style={{ flex: "181 1 0" }}
                  >
                    <FeatureImage
                      image={images[3]}
                      alt={images[3]?.altText || `${activeFeature.title} 4`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout 1: 1x2 垂直并排 (2张图) */}
          {layoutType === 1 && (
            <div className={cn(containerWidth, "h-full pb-2 flex gap-[6px] lg:gap-[8px] xl:gap-[10px] 2xl:gap-[12px]")}>
              <div className={cn(imageContainerBaseStyle, rectangleImageStyle, "flex-1 h-full")}>
                <FeatureImage
                  image={images[0]}
                  alt={images[0]?.altText || `${activeFeature.title} 1`}
                />
              </div>
              <div className={cn(imageContainerBaseStyle, rectangleImageStyle, "flex-1 h-full")}>
                <FeatureImage
                  image={images[1]}
                  alt={images[1]?.altText || `${activeFeature.title} 2`}
                />
              </div>
            </div>
          )}

          {/* Layout 2: 2x3 网格 (6张图) */}
          {layoutType === 2 && (
            <div className={cn(containerWidth, "h-full pb-2 grid grid-cols-3 grid-rows-2 gap-[6px] lg:gap-[8px] xl:gap-[10px] 2xl:gap-[12px]")}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={cn(imageContainerBaseStyle, rectangleImageStyle)}
                >
                  <FeatureImage
                    image={images[idx]}
                    alt={images[idx]?.altText || `${activeFeature.title} ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Layout 3 & 4: 平行四边形布局 (2张图) */}
          {(layoutType === 3 || layoutType === 4) && (
            <div className={cn(containerWidth, "h-full pb-2 flex items-start")}>
              {/* 左侧平行四边形 */}
              <div className="relative h-full flex-1 -mr-[5px] lg:-mr-[9px] xl:-mr-[13px] 2xl:-mr-[17px]">
                <TrapezoidImage
                  image={images[0]}
                  alt={images[0]?.altText || `${activeFeature.title} 1`}
                  direction="left"
                />
              </div>
              {/* 右侧平行四边形 */}
              <div className="relative h-full flex-1 -ml-[5px] lg:-ml-[9px] xl:-ml-[13px] 2xl:-ml-[17px]">
                <TrapezoidImage
                  image={images[1]}
                  alt={images[1]?.altText || `${activeFeature.title} 2`}
                  direction="right"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// 普通图片组件
const FeatureImage = ({ image, alt }: { image: any; alt: string }) => (
  <OptimizedImage
    image={image}
    alt={alt}
    size="small"
    className="object-cover absolute inset-0 w-full h-full"
  />
);

// 平行四边形图片组件（SVG 实现带圆角）
// 倾斜比例：约 15% 的宽度
const TrapezoidImage = ({
  image,
  alt,
  direction
}: {
  image: any;
  alt: string;
  direction: "left" | "right"
}) => {
  const clipPathId = `trapezoid-${direction}-${Math.random().toString(36).substring(2, 11)}`;

  // 使用百分比坐标的 SVG path，倾斜 15%
  // viewBox 100x100 便于百分比计算
  const r = 8; // 圆角半径（相对于100的比例）
  const slant = 15; // 倾斜量 15%

  // 平行四边形向右倾斜
  // 左上(slant,0) -> 右上(100,0) -> 右下(100-slant,100) -> 左下(0,100)
  const path = `
    M ${slant + r} 0
    L ${100 - r} 0
    Q 100 0 100 ${r}
    L ${100 - slant} ${100 - r}
    Q ${100 - slant} 100 ${100 - slant - r} 100
    L ${r} 100
    Q 0 100 0 ${100 - r}
    L ${slant} ${r}
    Q ${slant} 0 ${slant + r} 0
    Z
  `;

  return (
    <div
      className="h-full w-full relative"
      style={{
        filter: "drop-shadow(0px 4px 7px rgba(0,0,0,0.25))"
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox" transform="scale(0.01)">
            <path d={path} />
          </clipPath>
        </defs>
        {/* 边框背景 */}
        <path d={path} fill="#CDC094" />
      </svg>

      {/* 图片层 */}
      <div
        className="absolute bg-gray-100 overflow-hidden"
        style={{
          clipPath: `url(#${clipPathId})`,
          top: "4px",
          left: "4px",
          right: "4px",
          bottom: "4px"
        }}
      >
        <OptimizedImage
          image={image}
          alt={alt}
          size="small"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};
