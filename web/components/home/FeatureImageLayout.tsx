"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { cn, getCropStyles, getObjectPosition } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";

interface FeatureImageLayoutProps {
  activeFeature: any;
  activeIndex: number;
}

const layoutTransition = { duration: 0.5, ease: "easeInOut" } as Transition;

/**
 * 通用图片项组件
 * 使用 SVG 作为遮罩/边框
 */
const FeatureImageItem = ({
  image,
  alt,
  cropData,
  svgMask,
  className,
  style,
  isSpecialLayout4 = false,
}: {
  image: any;
  alt: string;
  cropData?: any;
  svgMask?: string;
  className?: string;
  style?: React.CSSProperties;
  isSpecialLayout4?: boolean;
}) => {
  const cropStyles = getCropStyles(cropData);

  if (isSpecialLayout4) {
    // Layout 4 特殊处理：边框 352x408，图片 346x400
    return (
      <div
        className={cn("relative flex-shrink-0", className)}
        style={{
          ...style,
          width: "calc(352 * var(--rpx))",
          height: "calc(408 * var(--rpx))",
        }}
      >
        {/* 图片层 - 使用 346x400 遮罩，居中于 352x408 边框 */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            ...cropStyles?.container,
            width: "calc(346 * var(--rpx))",
            height: "calc(400 * var(--rpx))",
            maskImage: `url(/service-features/feature-image-layout-4-image.svg)`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url(/service-features/feature-image-layout-4-image.svg)`,
            WebkitMaskSize: "100% 100%",
          }}
        >
          <ServerImage
            image={image}
            alt={alt}
            size="medium"
            className={cn("w-full h-full", !cropStyles && "object-cover")}
            style={{
              ...cropStyles?.image,
              objectPosition: getObjectPosition(image),
            }}
          />
        </div>
        {/* 边框层 - 在最上方 352x408 */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url(/service-features/feature-image-layout-4.svg)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    );
  }

  // 普通布局 (Layout 1, 2, 3)
  return (
    <div
      className={cn("relative overflow-hidden group", className)}
      style={{
        ...style,
        border: "calc(4 * var(--rpx)) solid #CDC094",
        borderRadius: "calc(31 * var(--rpx))",
      }}
    >
      {/* 图片层 */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={cropStyles?.container}
      >
        <ServerImage
          image={image}
          alt={alt}
          size="medium"
          className={cn(
            "w-full h-full transition-transform duration-500 group-hover:scale-105",
            !cropStyles && "object-cover"
          )}
          style={{
            ...cropStyles?.image,
            objectPosition: getObjectPosition(image),
          }}
        />
      </div>
    </div>
  );
};

// 提取布局渲染逻辑为独立组件，避免重复创建
const LayoutContent = memo(function LayoutContent({
  layoutType,
  images,
  cropDataList,
}: {
  layoutType: number;
  images: any[];
  cropDataList: any[];
}) {
  switch (layoutType) {
    case 0:
      return (
        <div
          className="w-full h-full flex flex-col"
          style={{ gap: "calc(18 * var(--rpx))" }}
        >
          <div
            className="w-full flex"
            style={{ flex: "170 1 0", gap: "calc(18 * var(--rpx))" }}
          >
            <FeatureImageItem
              image={images[0]}
              alt={images[0]?.alt || "Feature 1"}
              cropData={cropDataList[0]}
              svgMask="feature-image-layout-1-1.svg"
              style={{ flex: "243 1 0" }}
              className="h-full"
            />
            <FeatureImageItem
              image={images[1]}
              alt={images[1]?.alt || "Feature 2"}
              cropData={cropDataList[1]}
              svgMask="feature-image-layout-1-2.svg"
              style={{ flex: "332 1 0" }}
              className="h-full"
            />
          </div>
          <div
            className="w-full flex"
            style={{ flex: "232 1 0", gap: "calc(18 * var(--rpx))" }}
          >
            <FeatureImageItem
              image={images[2]}
              alt={images[2]?.alt || "Feature 3"}
              cropData={cropDataList[2]}
              svgMask="feature-image-layout-1-3.svg"
              style={{ flex: "382 1 0" }}
              className="h-full"
            />
            <FeatureImageItem
              image={images[3]}
              alt={images[3]?.alt || "Feature 4"}
              cropData={cropDataList[3]}
              svgMask="feature-image-layout-1-4.svg"
              style={{ flex: "192 1 0" }}
              className="h-full"
            />
          </div>
        </div>
      );
    case 1:
      return (
        <div
          className="w-full h-full flex"
          style={{ gap: "calc(18 * var(--rpx))" }}
        >
          <FeatureImageItem
            image={images[0]}
            alt={images[0]?.alt || "Feature 1"}
            cropData={cropDataList[0]}
            svgMask="feature-image-layout-2.svg"
            className="flex-1 h-full"
          />
          <FeatureImageItem
            image={images[1]}
            alt={images[1]?.alt || "Feature 2"}
            cropData={cropDataList[1]}
            svgMask="feature-image-layout-2.svg"
            className="flex-1 h-full"
          />
        </div>
      );
    case 2:
      return (
        <div
          className="w-full h-full grid grid-cols-3 grid-rows-2"
          style={{ gap: "calc(18 * var(--rpx))" }}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <FeatureImageItem
              key={idx}
              image={images[idx]}
              alt={images[idx]?.alt || `Feature ${idx + 1}`}
              cropData={cropDataList[idx]}
              svgMask="feature-image-layout-3.svg"
              className="w-full h-full"
            />
          ))}
        </div>
      );
    case 3:
      return (
        <div className="w-full h-full flex" style={{ gap: 0 }}>
          <FeatureImageItem
            image={images[0]}
            alt={images[0]?.alt || "Feature 1"}
            cropData={cropDataList[0]}
            isSpecialLayout4={true}
            style={{ marginLeft: "calc(20 * var(--rpx))" }}
          />
          <FeatureImageItem
            image={images[1]}
            alt={images[1]?.alt || "Feature 2"}
            cropData={cropDataList[1]}
            isSpecialLayout4={true}
            style={{ marginLeft: "calc(-56 * var(--rpx))" }}
          />
        </div>
      );
    default:
      return null;
  }
});

// 预加载 hook
function usePreloadImages(features: any[]) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    features.forEach((feature) => {
      if (!feature?.images) return;
      feature.images.forEach((img: any) => {
        if (!img?.url) return;
        const url = img.url;
        if (preloadedRef.current.has(url)) return;
        preloadedRef.current.add(url);
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }, [features]);
}

export default function FeatureImageLayout({
  activeFeature,
  activeIndex,
}: FeatureImageLayoutProps) {
  // 预加载所有图片
  const allFeatures = activeFeature?.__parentFeatures || [];
  usePreloadImages(allFeatures);

  if (
    !activeFeature ||
    !activeFeature.images ||
    activeFeature.images.length === 0
  ) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-[31px]">
        <span className="text-gray-400">Image Data Missing</span>
      </div>
    );
  }

  const layoutMap = [0, 1, 2, 3, 3];
  const layoutType = layoutMap[activeIndex] ?? 0;
  const images = activeFeature.images;
  const cropDataList = activeFeature.imageCropDataList || [];

  const layoutDimensions = [
    { w: 593, h: 420 },
    { w: 614, h: 416 },
    { w: 600, h: 424 },
    { w: 722, h: 408 },
  ];
  const { w: nativeW, h: nativeH } = layoutDimensions[layoutType];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={layoutTransition}
          className="w-full flex items-center justify-center"
          style={{ height: "100%" }}
        >
          <div
            className="feature-img-container relative flex justify-center items-center w-full"
            style={{
              aspectRatio: `${nativeW} / ${nativeH}`,
              width: "100%",
              height: "auto",
              maxHeight: "100%",
              maxWidth: `calc(${nativeW} * var(--rpx))`,
            }}
          >
            <div
              className="w-full h-full relative"
              style={{
                containerType: "inline-size",
                ["--rpx" as any]: `calc(100cqw / ${nativeW})`,
              }}
            >
              <LayoutContent
                layoutType={layoutType}
                images={images}
                cropDataList={cropDataList}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <style jsx>{`
        @media (max-width: 1024px) {
          :global(.feature-img-container) {
            max-width: 100% !important;
            max-height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
