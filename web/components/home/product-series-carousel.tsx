"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/navigation";
import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";
import { getCropStyles, getCropImageUrl, getObjectPosition } from "@/lib/utils";

type Props = {
  data: HomeContent["productSeriesCarousel"];
  locale: Locale;
};

// 设计稿基准
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 922;

// 图片尺寸
const IMG_SIZE_DEFAULT = 640;
const IMG_SIZE_HOVER = 720;
const IMG_SIZE_SHRINK = 480;

// 6个位置的坐标（图片左边缘）
// 位置 -1: 更远的左侧屏外（隐藏）
// 位置 0: 屏外左（即将进入）
// 位置 1: 屏内左
// 位置 2: 屏内右
// 位置 3: 屏外右（即将退出）
// 位置 4: 更远的右侧屏外（隐藏）
const POSITIONS: Record<number, { x: number; y: number; scale: number; opacity: number }> = {
  [-1]: { x: -1400, y: 358, scale: 0.7, opacity: 0 },  // 更远左侧
  [0]: { x: -700, y: 310, scale: 0.85, opacity: 0 },   // 屏外左
  [1]: { x: 220, y: 262, scale: 1, opacity: 1 },       // 屏内左
  [2]: { x: 1060, y: 262, scale: 1, opacity: 1 },      // 屏内右
  [3]: { x: 1980, y: 310, scale: 0.85, opacity: 0 },   // 屏外右
  [4]: { x: 2680, y: 358, scale: 0.7, opacity: 0 },    // 更远右侧
};

// Hover 时的位置调整 (比例参考比亚迪: Active 1.15, Inactive 0.85; 锚点为底部)
// Base y: 262, Base size: 640 => Bottom: 902
const POS1_HOVER_X = 268;
const POS1_HOVER_Y = 214;
const POS1_SHRINK_X = 172;
const POS1_SHRINK_Y = 310;

const POS2_HOVER_X = 1012;
const POS2_HOVER_Y = 214;
const POS2_SHRINK_X = 1108;
const POS2_SHRINK_Y = 310;

// 标题基准相对位置 (距离图片顶部)
const TITLE_Y = 155;

// 按钮位置
const NAV_BTN_Y = 550;
const LEFT_NAV_X = 60;
const RIGHT_NAV_X = 1796;
const NAV_BTN_SIZE = 64;

// View More 按钮
const VIEW_BTN_Y = 830;
const VIEW_BTN_W = 414;
const VIEW_BTN_H = 67;

// 字体尺寸
const TITLE_SIZE_DEFAULT = 64;

export default function ProductSeriesCarousel({ data }: Props) {
  // currentIndex 表示当前在"屏内左"位置的 item 索引
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null); // 1 或 2（屏内的两个位置）
  const [isAnimating, setIsAnimating] = useState(false); // 动画锁
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const seriesCount = data?.length || 0;

  // 清理 timeout 防止内存泄漏
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 预加载所有场景图 (sceneImage) - 悬停时需要秒出
  useEffect(() => {
    if (!data || data.length === 0) return;

    data.forEach((item) => {
      if (item.sceneImage) {
        // 使用大型变体作为预加载场景图
        const url = item.sceneImage.variants?.large || item.sceneImage.url;
        if (url && !url.includes('placeholder')) {
          const img = new Image();
          img.src = url;
        }
      }
    });
  }, [data]);

  const paginate = useCallback((dir: number) => {
    if (isAnimating) return; // 动画进行中，忽略点击

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + dir + seriesCount) % seriesCount);
    setHoveredPosition(null);

    // 清理之前的 timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // 动画结束后解锁（与动画时长匹配）
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 350); // 与 arcTransition.duration 一致
  }, [seriesCount, isAnimating]);

  // 获取指定位置的 item 索引
  const getItemIndex = useCallback((position: number) => {
    // position: 0=屏外左, 1=屏内左, 2=屏内右, 3=屏外右
    // currentIndex 是屏内左(position 1)的 item
    const offset = position - 1;
    return (currentIndex + offset + seriesCount) % seriesCount;
  }, [currentIndex, seriesCount]);

  // 获取 4 个位置的 item
  const visibleItems = useMemo(() => {
    return [0, 1, 2, 3].map(pos => ({
      position: pos,
      index: getItemIndex(pos),
      item: data[getItemIndex(pos)],
    }));
  }, [getItemIndex, data]);

  if (!data || seriesCount < 2) {
    return null;
  }

  // 计算某个位置的样式（考虑 hover）
  const getPositionStyle = (position: number) => {
    const basePos = POSITIONS[position] || POSITIONS[position > 2 ? 4 : -1];

    // 只有屏内的两个位置(1和2)才有 hover 效果
    if (position === 1) {
      // 屏内左
      const isHovered = hoveredPosition === 1;
      const isOtherHovered = hoveredPosition === 2;

      if (isHovered) {
        return {
          left: `${(POS1_HOVER_X / DESIGN_WIDTH) * 100}%`,
          top: `${(POS1_HOVER_Y / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1.125,
        };
      } else if (isOtherHovered) {
        return {
          left: `${(POS1_SHRINK_X / DESIGN_WIDTH) * 100}%`,
          top: `${(POS1_SHRINK_Y / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 0.75,
        };
      }
    }

    if (position === 2) {
      // 屏内右
      const isHovered = hoveredPosition === 2;
      const isOtherHovered = hoveredPosition === 1;

      if (isHovered) {
        return {
          left: `${(POS2_HOVER_X / DESIGN_WIDTH) * 100}%`,
          top: `${(POS2_HOVER_Y / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1.125,
        };
      } else if (isOtherHovered) {
        return {
          left: `${(POS2_SHRINK_X / DESIGN_WIDTH) * 100}%`,
          top: `${(POS2_SHRINK_Y / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 0.75,
        };
      }
    }

    // 默认返回基础位置
    return {
      left: `${(basePos.x / DESIGN_WIDTH) * 100}%`,
      top: `${(basePos.y / DESIGN_HEIGHT) * 100}%`,
      width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
      opacity: basePos.opacity,
      scale: basePos.scale,
    };
  };


  // 计算每个 item 当前应该在哪个位置
  // 返回 0-3 的位置，或者 -1/4（隐藏在更远的地方）
  const getItemPosition = useCallback((itemIndex: number): number => {
    // currentIndex 是在位置 1 (屏内左) 的 item
    const diff = (itemIndex - currentIndex + seriesCount) % seriesCount;

    // diff: 0 -> 位置 1 (屏内左)
    // diff: 1 -> 位置 2 (屏内右)
    if (diff === 0) return 1;
    if (diff === 1) return 2;

    // 特殊处理：当只有 2 个 item 时，不需要其他位置
    if (seriesCount === 2) return -1;

    // 特殊处理：当只有 3 个 item 时
    // diff = 2 同时是 "屏外右" 和 "屏外左"（seriesCount-1）
    // 根据方向选择：让它从左边进入，从右边退出
    if (seriesCount === 3) {
      // diff = 2 既是下一个要进入的，也是刚退出的
      // 让它显示在右边（位置 3），这样动画更自然
      return 3;
    }

    // 4 个及以上的 item
    // diff: seriesCount-1 -> 位置 0 (屏外左，即将进入)
    // diff: 2 -> 位置 3 (屏外右，刚退出)
    if (diff === seriesCount - 1) return 0;
    if (diff === 2) return 3;

    // 其他 item：根据距离决定放在哪个屏外位置
    // diff 较小（3,4,5...）-> 右侧更远处 (位置 4)
    // diff 较大 (seriesCount-2, seriesCount-3...) -> 左侧更远处 (位置 -1)
    if (diff <= seriesCount / 2) {
      return 4; // 右侧更远
    } else {
      return -1; // 左侧更远
    }
  }, [currentIndex, seriesCount]);

  const hoveredItem = hoveredPosition === 1
    ? visibleItems[1]?.item
    : hoveredPosition === 2
      ? visibleItems[2]?.item
      : null;

  // 弧线动画配置
  const arcTransition = {
    duration: 0.35,
    ease: "easeOut" as const,
  };

  return (
    <section
      className="relative bg-[#756F3F] overflow-hidden"
      data-header-theme="transparent"
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) {
          setHoveredPosition(1);
        } else {
          setHoveredPosition(2);
        }
      }}
      onMouseLeave={() => setHoveredPosition(null)}
    >
      {/* 场景图背景 - 全屏显示需要 large 尺寸 */}
      {hoveredItem?.sceneImage && (
        <motion.div
          key={hoveredItem.key + "-scene"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-0"
        >
          {(() => {
            const cropData = hoveredItem.imageCropDataList?.[1];
            const cropStyles = getCropStyles(cropData);
            if (cropStyles && cropData && cropData.croppedAreaPixels) {
              return (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    ...cropStyles.container,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={getCropImageUrl(hoveredItem.sceneImage, cropData)}
                    alt={hoveredItem.sceneImage.altText || "Scene"}
                    style={{
                      ...cropStyles.image,
                      width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                      height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                      left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                      top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                      maxWidth: "none",
                    }}
                  />
                </div>
              );
            }
            return (
              <ServerImage
                image={hoveredItem.sceneImage}
                alt={hoveredItem.sceneImage.altText || "Scene"}
                size="large"
                fill
                className="object-cover w-full h-full"
                objectPosition={getObjectPosition(hoveredItem.sceneImage)}
              />
            );
          })()}
        </motion.div>
      )}

      {/* ==================== 移动端布局 ==================== */}
      <div className="lg:hidden absolute inset-0 flex flex-col py-4">
        {/* 图片区域 - 占据大部分空间 */}
        <div className="flex-1 flex items-center justify-center gap-2 px-2">
          {/* 左侧图片 + 标题 */}
          <div className="flex flex-col items-center w-[45%]">
            <Link href={visibleItems[1]?.item?.href || "#"} className="block w-full">
              {(() => {
                const item = visibleItems[1]?.item;
                if (!item) return null;
                const cropData = item.imageCropDataList?.[0];
                const cropStyles = getCropStyles(cropData);
                if (cropStyles && cropData && cropData.croppedAreaPixels) {
                  return (
                    <div
                      className="relative w-full aspect-square overflow-hidden"
                      style={cropStyles.container}
                    >
                      <img
                        src={getCropImageUrl(item.image, cropData)}
                        alt={item.image?.altText || item.name || ""}
                        style={{
                          ...cropStyles.image,
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <ServerImage
                    image={item.image}
                    alt={item.image?.altText || item.name || ""}
                    size="small"
                    className="w-full h-auto"
                    objectPosition={getObjectPosition(item.image)}
                  />
                );
              })()}
            </Link>
            <span className="font-anaheim font-extrabold text-white text-xs mt-2 text-center">
              {visibleItems[1]?.item?.name}
            </span>
          </div>
          {/* 右侧图片 + 标题 */}
          <div className="flex flex-col items-center w-[45%]">
            <Link href={visibleItems[2]?.item?.href || "#"} className="block w-full">
              {(() => {
                const item = visibleItems[2]?.item;
                if (!item) return null;
                const cropData = item.imageCropDataList?.[0];
                const cropStyles = getCropStyles(cropData);
                if (cropStyles && cropData && cropData.croppedAreaPixels) {
                  return (
                    <div
                      className="relative w-full aspect-square overflow-hidden"
                      style={cropStyles.container}
                    >
                      <img
                        src={getCropImageUrl(item.image, cropData)}
                        alt={item.image?.altText || item.name || ""}
                        style={{
                          ...cropStyles.image,
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <ServerImage
                    image={item.image}
                    alt={item.image?.altText || item.name || ""}
                    size="small"
                    className="w-full h-auto"
                    objectPosition={getObjectPosition(item.image)}
                  />
                );
              })()}
            </Link>
            <span className="font-anaheim font-extrabold text-white text-xs mt-2 text-center">
              {visibleItems[2]?.item?.name}
            </span>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-between px-6 pb-2">
          <button onClick={() => paginate(-1)} aria-label="Previous" suppressHydrationWarning>
            <img src="/btnLeft2.svg" alt="Previous" className="w-10 h-10" suppressHydrationWarning />
          </button>
          <button onClick={() => paginate(1)} aria-label="Next" suppressHydrationWarning>
            <img src="/btnRight2.svg" alt="Next" className="w-10 h-10" suppressHydrationWarning />
          </button>
        </div>
      </div>

      {/* ==================== 桌面端布局 - 旋转木马 ==================== */}
      <div className="hidden lg:block absolute inset-0">
        {/* 所有 item - 根据当前位置动画移动 */}
        {data.map((item, itemIndex) => {
          const position = getItemPosition(itemIndex);
          const style = getPositionStyle(position);
          const isOnScreen = position === 1 || position === 2;

          return (
            <motion.div
              key={`carousel-item-${itemIndex}`}
              className="absolute cursor-pointer"
              animate={{
                left: style.left,
                top: style.top,
                width: style.width,
                opacity: style.opacity,
                scale: style.scale,
              }}
              transition={arcTransition}
              style={{
                aspectRatio: "1",
                zIndex: hoveredPosition === position ? 10 : isOnScreen ? 5 : 1,
                pointerEvents: isOnScreen ? "auto" : "none",
              }}
            >
              {/* 标题移入容器内部，利用 scale 属性实现真正的“共进退” */}
              <h3
                className={`absolute font-anaheim font-extrabold text-white whitespace-nowrap z-20 transition-opacity duration-300 ${
                  isOnScreen ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  top: `${(-62 / IMG_SIZE_DEFAULT) * 100}%`, // 距离顶部 62px
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontWeight: 800,
                  lineHeight: 0.47,
                  fontSize: `${(TITLE_SIZE_DEFAULT / DESIGN_WIDTH) * 100}vw`,
                }}
              >
                {item.name}
              </h3>

              <Link href={item.href} className="block w-full h-full">
                {(() => {
                  const cropData = item.imageCropDataList?.[0];
                  const cropStyles = getCropStyles(cropData);
                  if (cropStyles && cropData && cropData.croppedAreaPixels) {
                    return (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          ...cropStyles.container,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <img
                          src={getCropImageUrl(item.image, cropData)}
                          alt={item.image?.altText || item.name}
                          style={{
                            ...cropStyles.image,
                            width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                            height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                            left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                            top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                            maxWidth: "none",
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <ServerImage
                      image={item.image}
                      alt={item.image?.altText || item.name}
                      size="medium"
                      fill
                      className="object-cover w-full h-full"
                      objectPosition={getObjectPosition(item.image)}
                      priority={isOnScreen}
                    />
                  );
                })()}
              </Link>
            </motion.div>
          );
        })}

        {/* 左导航按钮 */}
        <button
          onClick={() => paginate(-1)}
          className="absolute z-20 cursor-pointer group transition-transform duration-150 active:scale-90"
          style={{
            left: `${(LEFT_NAV_X / DESIGN_WIDTH) * 100}%`,
            top: `${(NAV_BTN_Y / DESIGN_HEIGHT) * 100}%`,
            width: `${(NAV_BTN_SIZE / DESIGN_WIDTH) * 100}%`,
            aspectRatio: "1",
          }}
          aria-label="Previous series"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
          >
            <circle
              cx="50"
              cy="50"
              r="49.5"
              className="stroke-[#FFFAD3] group-hover:stroke-[#756F3F] group-hover:fill-[#E2DEB6] transition-all duration-300"
            />
            <path
              d="M67 38.5L60.5 49L56 46C49.5 42 34 29.5 33.5 16C29.5 26.5 25 51 51.5 65.5L45.5 75.5L75 67.5L67 38.5Z"
              className="fill-[#FFFAD3] group-hover:fill-[#756F3F] transition-all duration-300"
            />
          </svg>
        </button>

        {/* 右导航按钮 */}
        <button
          onClick={() => paginate(1)}
          className="absolute z-20 cursor-pointer group transition-transform duration-150 active:scale-90"
          style={{
            left: `${(RIGHT_NAV_X / DESIGN_WIDTH) * 100}%`,
            top: `${(NAV_BTN_Y / DESIGN_HEIGHT) * 100}%`,
            width: `${(NAV_BTN_SIZE / DESIGN_WIDTH) * 100}%`,
            aspectRatio: "1",
          }}
          aria-label="Next series"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
          >
            <circle
              cx="50"
              cy="50"
              r="49.5"
              className="stroke-[#FFFAD3] group-hover:stroke-[#756F3F] group-hover:fill-[#E2DEB6] transition-all duration-300"
            />
            <path
              d="M38.45 38.5L44.95 49L49.45 46C55.95 42 71.45 29.5 71.95 16C75.95 26.5 80.45 51 53.95 65.5L59.95 75.5L30.45 67.5L38.45 38.5Z"
              className="fill-[#FFFAD3] group-hover:fill-[#756F3F] transition-all duration-300"
            />
          </svg>
        </button>

        {/* View More 按钮 */}
        {hoveredItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            transition={{ duration: 0.2 }}
            className="absolute z-20"
            style={{
              left: "50%",
              top: `${(VIEW_BTN_Y / DESIGN_HEIGHT) * 100}%`,
            }}
          >
            <Link
              href={hoveredItem.href}
              className="flex items-center justify-center font-anaheim font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 bg-[#d4cc8e] text-[#625d2f] hover:bg-[#625d2f] hover:text-[#d4cc8e]"
              style={{
                minWidth: `${(VIEW_BTN_W / DESIGN_WIDTH) * 100}vw`,
                height: `${(VIEW_BTN_H / DESIGN_HEIGHT) * 100}vh`,
                paddingLeft: `${(40 / DESIGN_WIDTH) * 100}vw`,
                paddingRight: `${(40 / DESIGN_WIDTH) * 100}vw`,
                borderRadius: `${(VIEW_BTN_H / 2 / DESIGN_WIDTH) * 100}vw`,
                fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              }}
            >
              {hoveredItem.buttonText || `View More ${hoveredItem.name}`}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
