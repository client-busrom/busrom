"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/navigation";
import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type Props = {
  data: HomeContent["productSeriesCarousel"];
  locale: Locale;
};

// 设计稿基准
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

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
  [-1]: { x: -1400, y: 300, scale: 0.7, opacity: 0 },  // 更远左侧
  [0]: { x: -700, y: 260, scale: 0.85, opacity: 0 },   // 屏外左
  [1]: { x: 220, y: 217, scale: 1, opacity: 1 },       // 屏内左
  [2]: { x: 1060, y: 217, scale: 1, opacity: 1 },      // 屏内右
  [3]: { x: 1980, y: 260, scale: 0.85, opacity: 0 },   // 屏外右
  [4]: { x: 2680, y: 300, scale: 0.7, opacity: 0 },    // 更远右侧
};

// Hover 时的位置调整
const LEFT_IMG_X_HOVER = 180;
const LEFT_IMG_Y_HOVER = 177;
const RIGHT_IMG_X_HOVER = 1140;
const RIGHT_IMG_Y_HOVER = 297;

// 标题位置
const TITLE_Y = 155;

// 按钮位置
const NAV_BTN_Y = 861;
const LEFT_NAV_X = 205;
const RIGHT_NAV_X = 1604;
const NAV_BTN_SIZE = 129;

// View More 按钮
const VIEW_BTN_Y = 892;
const VIEW_BTN_W = 414;
const VIEW_BTN_H = 67;

// 字体尺寸
const TITLE_SIZE_DEFAULT = 64;
const TITLE_SIZE_HOVER = 72;
const TITLE_SIZE_SHRINK = 48;

export default function ProductSeriesCarousel({ data }: Props) {
  // currentIndex 表示当前在"屏内左"位置的 item 索引
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null); // 1 或 2（屏内的两个位置）
  const [isAnimating, setIsAnimating] = useState(false); // 动画锁

  const seriesCount = data?.length || 0;

  const paginate = useCallback((dir: number) => {
    if (isAnimating) return; // 动画进行中，忽略点击

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + dir + seriesCount) % seriesCount);
    setHoveredPosition(null);

    // 动画结束后解锁（与动画时长匹配）
    setTimeout(() => {
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
          left: `${(LEFT_IMG_X_HOVER / DESIGN_WIDTH) * 100}%`,
          top: `${(LEFT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_HOVER / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1,
        };
      } else if (isOtherHovered) {
        return {
          left: `${((220 + 80) / DESIGN_WIDTH) * 100}%`,
          top: `${((217 + 80) / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_SHRINK / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1,
        };
      }
    }

    if (position === 2) {
      // 屏内右
      const isHovered = hoveredPosition === 2;
      const isOtherHovered = hoveredPosition === 1;

      if (isHovered) {
        return {
          left: `${((DESIGN_WIDTH - LEFT_IMG_X_HOVER - IMG_SIZE_HOVER) / DESIGN_WIDTH) * 100}%`,
          top: `${(LEFT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_HOVER / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1,
        };
      } else if (isOtherHovered) {
        return {
          left: `${(RIGHT_IMG_X_HOVER / DESIGN_WIDTH) * 100}%`,
          top: `${(RIGHT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
          width: `${(IMG_SIZE_SHRINK / DESIGN_WIDTH) * 100}%`,
          opacity: 1,
          scale: 1,
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

  // 获取标题位置和大小
  const getTitleStyle = (position: number) => {
    const baseX = position === 1 ? 220 + IMG_SIZE_DEFAULT / 2 : 1060 + IMG_SIZE_DEFAULT / 2;
    let fontSize = TITLE_SIZE_DEFAULT;
    let x = baseX;

    if (position === 1) {
      if (hoveredPosition === 1) {
        fontSize = TITLE_SIZE_HOVER;
        x = LEFT_IMG_X_HOVER + IMG_SIZE_HOVER / 2;
      } else if (hoveredPosition === 2) {
        fontSize = TITLE_SIZE_SHRINK;
        x = 220 + 80 + IMG_SIZE_SHRINK / 2;
      }
    } else if (position === 2) {
      if (hoveredPosition === 2) {
        fontSize = TITLE_SIZE_HOVER;
        x = DESIGN_WIDTH - LEFT_IMG_X_HOVER - IMG_SIZE_HOVER / 2;
      } else if (hoveredPosition === 1) {
        fontSize = TITLE_SIZE_SHRINK;
        x = RIGHT_IMG_X_HOVER + IMG_SIZE_SHRINK / 2;
      }
    }

    return {
      left: `${(x / DESIGN_WIDTH) * 100}%`,
      fontSize: `${(fontSize / DESIGN_WIDTH) * 100}vw`,
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
          <OptimizedImage
            image={hoveredItem.sceneImage}
            alt={hoveredItem.sceneImage.altText || "Scene"}
            size="large"
            className="object-cover w-full h-full"
          />
        </motion.div>
      )}

      {/* ==================== 移动端布局 ==================== */}
      <div className="lg:hidden h-full flex flex-col justify-center px-4 py-8">
        <div className="relative flex-1 flex items-center justify-center">
          {/* 左侧 */}
          <div className="w-[45%] aspect-square left-[5%] absolute">
            <Link href={visibleItems[1]?.item?.href || "#"} className="block w-full h-full">
              <OptimizedImage
                image={visibleItems[1]?.item?.image}
                alt={visibleItems[1]?.item?.image?.altText || visibleItems[1]?.item?.name || ""}
                size="small"
                className="object-cover w-full h-full"
                priority
              />
            </Link>
          </div>
          {/* 右侧 */}
          <div className="w-[45%] aspect-square right-[5%] absolute">
            <Link href={visibleItems[2]?.item?.href || "#"} className="block w-full h-full">
              <OptimizedImage
                image={visibleItems[2]?.item?.image}
                alt={visibleItems[2]?.item?.image?.altText || visibleItems[2]?.item?.name || ""}
                size="small"
                className="object-cover w-full h-full"
                priority
              />
            </Link>
          </div>
        </div>

        <div className="flex justify-between px-4 mt-4">
          <span className="font-anaheim font-extrabold text-white text-lg">
            {visibleItems[1]?.item?.name}
          </span>
          <span className="font-anaheim font-extrabold text-white text-lg">
            {visibleItems[2]?.item?.name}
          </span>
        </div>

        <div className="flex justify-between px-4 mt-4">
          <button onClick={() => paginate(-1)} aria-label="Previous">
            <img src="/btnLeft2.svg" alt="Previous" className="w-12 h-12" />
          </button>
          <button onClick={() => paginate(1)} aria-label="Next">
            <img src="/btnRight2.svg" alt="Next" className="w-12 h-12" />
          </button>
        </div>
      </div>

      {/* ==================== 桌面端布局 - 旋转木马 ==================== */}
      <div className="hidden lg:block absolute inset-0">
        {/* 标题 - 屏内左 */}
        {visibleItems[1]?.item && (
          <motion.h3
            className="absolute font-anaheim font-extrabold text-white whitespace-nowrap z-20"
            style={{
              top: `${(TITLE_Y / DESIGN_HEIGHT) * 100}%`,
              transform: "translate(-50%, -50%)",
              fontWeight: 800,
              lineHeight: 0.47,
            }}
            animate={getTitleStyle(1)}
            transition={{ duration: 0.3 }}
          >
            {visibleItems[1].item.name}
          </motion.h3>
        )}

        {/* 标题 - 屏内右 */}
        {visibleItems[2]?.item && (
          <motion.h3
            className="absolute font-anaheim font-extrabold text-white whitespace-nowrap z-20"
            style={{
              top: `${(TITLE_Y / DESIGN_HEIGHT) * 100}%`,
              transform: "translate(-50%, -50%)",
              fontWeight: 800,
              lineHeight: 0.47,
            }}
            animate={getTitleStyle(2)}
            transition={{ duration: 0.3 }}
          >
            {visibleItems[2].item.name}
          </motion.h3>
        )}

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
              onMouseEnter={() => isOnScreen && setHoveredPosition(position)}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              <Link href={item.href} className="block w-full h-full">
                <OptimizedImage
                  image={item.image}
                  alt={item.image?.altText || item.name}
                  size="medium"
                  className="object-cover w-full h-full"
                  priority={isOnScreen}
                />
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
              className="flex items-center justify-center font-anaheim font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                minWidth: `${(VIEW_BTN_W / DESIGN_WIDTH) * 100}vw`,
                height: `${(VIEW_BTN_H / DESIGN_HEIGHT) * 100}vh`,
                paddingLeft: `${(40 / DESIGN_WIDTH) * 100}vw`,
                paddingRight: `${(40 / DESIGN_WIDTH) * 100}vw`,
                borderRadius: `${(VIEW_BTN_H / 2 / DESIGN_WIDTH) * 100}vw`,
                backgroundColor: "#d4cc8e",
                color: "#625d2f",
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
