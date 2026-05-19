"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Link } from "@/lib/navigation";
import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";
import {
  getCropStyles,
  getCropImageUrl,
  getVariantUrl,
  getObjectPosition,
  cn,
} from "@/lib/utils";

type Props = {
  data: HomeContent["productSeriesCarousel"];
  locale: Locale;
  headerTheme?: string;
  className?: string;
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
const POSITIONS: Record<
  number,
  { x: number; y: number; scale: number; opacity: number }
> = {
  [-1]: { x: -1400, y: 358, scale: 0.7, opacity: 0 }, // 更远左侧
  [0]: { x: -700, y: 310, scale: 0.85, opacity: 0 }, // 屏外左
  [1]: { x: 220, y: 262, scale: 1, opacity: 1 }, // 屏内左
  [2]: { x: 1060, y: 262, scale: 1, opacity: 1 }, // 屏内右
  [3]: { x: 1980, y: 310, scale: 0.85, opacity: 0 }, // 屏外右
  [4]: { x: 2680, y: 358, scale: 0.7, opacity: 0 }, // 更远右侧
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
    opacity: 0,
  }),
};

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

export default function ProductSeriesCarousel({
  data,
  headerTheme,
  className,
}: Props) {
  // currentIndex 表示当前在"屏内左"位置的 item 索引
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null); // 1 或 2（屏内的两个位置）
  const [isAnimating, setIsAnimating] = useState(false); // 动画锁
  const [direction, setDirection] = useState(0); // 轮播方向：1=向右, -1=向左
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 专属自定义光标状态
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  // 调紧弹簧配置：stiffness 加大，damping 减小，使其更跟手
  const springConfig = { damping: 20, stiffness: 400, mass: 0.1 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 更新坐标 (MotionValue 是非响应式的，不会触发重绘)
      cursorX.set(x);
      cursorY.set(y);

      // 只在跨越中线时更新状态，避免无效重绘
      const newPos = x < rect.width / 2 ? 1 : 2;
      setHoveredPosition(prev => prev === newPos ? prev : newPos);
    },
    [cursorX, cursorY],
  );

  const seriesCount = data?.length || 0;

  // 清理 timeout 防止内存泄漏
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 预加载所有图片（产品封面图 + 悬停场景图）- 确保轮播切换与悬停切换秒出
  useEffect(() => {
    if (!data || data.length === 0) return;

    data.forEach((item) => {
      // 1. 预加载产品封面图 (item.image)
      if (item.image) {
        const cropData = item.imageCropDataList?.[0];
        const imageUrl = cropData
          ? getCropImageUrl(item.image, cropData)
          : getVariantUrl(item.image, "medium");
        if (imageUrl && !imageUrl.includes("placeholder")) {
          const img = new Image();
          img.src = imageUrl;
        }
      }

      // 2. 预加载悬停场景背景图 (item.sceneImage)
      if (item.sceneImage) {
        const sceneUrl = getVariantUrl(item.sceneImage, "large");
        if (sceneUrl && !sceneUrl.includes("placeholder")) {
          const img = new Image();
          img.src = sceneUrl;
        }
      }
    });
  }, [data]);

  const paginate = useCallback(
    (dir: number) => {
      if (isAnimating) return; // 动画进行中，忽略点击

      setIsAnimating(true);
      setDirection(dir);
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
    },
    [seriesCount, isAnimating],
  );

  // 获取指定位置的 item 索引
  const getItemIndex = useCallback(
    (position: number) => {
      // position: 0=屏外左, 1=屏内左, 2=屏内右, 3=屏外右
      // currentIndex 是屏内左(position 1)的 item
      const offset = position - 1;
      return (currentIndex + offset + seriesCount) % seriesCount;
    },
    [currentIndex, seriesCount],
  );

  // 获取 4 个位置的 item
  const visibleItems = useMemo(() => {
    return [0, 1, 2, 3].map((pos) => ({
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

    const baseStyle = {
      left: `${(basePos.x / DESIGN_WIDTH) * 100}%`,
      top: `${(basePos.y / DESIGN_HEIGHT) * 100}%`,
      width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
      opacity: basePos.opacity,
      scale: basePos.scale,
      x: "0vw",
      transformOrigin: position <= 1 ? "left center" : "right center",
    };

    // 只有屏内的两个位置(1和2)才有 hover 效果
    if (position === 1) {
      // 屏内左
      const isHovered = hoveredPosition === 1;
      const isOtherHovered = hoveredPosition === 2;

      if (isHovered) {
        return { ...baseStyle, scale: 1.15 };
      } else if (isOtherHovered) {
        // 当右边悬停时 左侧item: transform: scale(0.85) translateX(3vw)
        return { ...baseStyle, scale: 0.85, x: "3vw" };
      }
    }

    if (position === 2) {
      // 屏内右
      const isHovered = hoveredPosition === 2;
      const isOtherHovered = hoveredPosition === 1;

      if (isHovered) {
        return { ...baseStyle, scale: 1.15 };
      } else if (isOtherHovered) {
        // 当悬停左边时 右边item: transform: scale(0.85) translateX(-3vw)
        return { ...baseStyle, scale: 0.85, x: "-3vw" };
      }
    }

    // 默认返回基础位置
    return baseStyle;
  };

  // 计算每个 item 当前应该在哪个位置
  // 返回 0-3 的位置，或者 -1/4（隐藏在更远的地方）
  const getItemPosition = useCallback(
    (itemIndex: number): number => {
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
    },
    [currentIndex, seriesCount],
  );

  const hoveredItem = useMemo(() => {
    // 移动端/平板端 (宽度小于 1025px)：始终显示当前项的背景图
    if (typeof window !== "undefined" && window.innerWidth < 1025) {
      return data[currentIndex];
    }
    // 桌面端：显示悬停项的背景图
    if (hoveredPosition === 1) return visibleItems[1]?.item;
    if (hoveredPosition === 2) return visibleItems[2]?.item;
    return null;
  }, [hoveredPosition, visibleItems, data, currentIndex]);

  // 弧线动画配置
  const arcTransition = {
    duration: 0.35,
    ease: "easeOut" as const,
  };

  return (
    <section
      className={cn(
        "relative bg-[#756F3F] overflow-hidden max-lg:min-h-[580px] lg:aspect-[1920/1080] lg:py-[60px]",
        className
      )}
      data-header-theme={headerTheme}
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

      {/* ==================== 移动端/平板端布局 ==================== */}
      <div className="lg:hidden relative w-full h-[580px] flex flex-col py-8 items-center justify-between select-none overflow-hidden">
        {/* 产品系列展示区 */}
        <div className="w-full flex-1 flex items-center justify-center px-6 relative">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`mobile-carousel-${currentIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(e, { offset }) => {
                const swipeThreshold = 50;
                if (offset.x < -swipeThreshold) {
                  paginate(1);
                } else if (offset.x > swipeThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full max-w-[320px] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* 产品名称 */}
              <h3 className="font-anaheim font-extrabold text-white text-xl mb-4 tracking-wide text-center">
                {data[currentIndex]?.name}
              </h3>

              {/* 封面图片 */}
              <Link
                href={data[currentIndex]?.href || "#"}
                className="block w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              >
                {(() => {
                  const item = data[currentIndex];
                  if (!item) return null;
                  const cropData = item.imageCropDataList?.[0];
                  const cropStyles = getCropStyles(cropData);
                  if (cropStyles && cropData && cropData.croppedAreaPixels) {
                    return (
                      <div
                        className="relative w-full h-full overflow-hidden"
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
                      size="medium"
                      className="object-cover w-full h-full"
                      objectPosition={getObjectPosition(item.image)}
                    />
                  );
                })()}
              </Link>

              {/* CTA 按钮 */}
              <Link
                href={data[currentIndex]?.href || "#"}
                className="mt-6 px-6 py-2 bg-[#d4cc8e] text-[#625d2f] hover:bg-[#625d2f] hover:text-[#d4cc8e] rounded-full font-anaheim font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all"
              >
                {data[currentIndex]?.buttonText || `View More`}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部导航区域 */}
        <div className="w-full flex items-center justify-between px-10 mt-4 z-10">
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 分页指示器 (Dots) */}
          <div className="flex items-center gap-1.5">
            {data.map((_, idx) => (
              <div
                key={`dot-${idx}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentIndex ? "w-4 bg-[#d4cc8e]" : "w-1.5 bg-white/30"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => paginate(1)}
            aria-label="Next"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ==================== 桌面端布局 - 旋转木马 ==================== */}
      <div
        className="hidden lg:block absolute inset-0 cursor-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringContainer(true)}
        onMouseLeave={() => setIsHoveringContainer(false)}
      >
        {/* 自定义跟随光标 */}
        <motion.div
          className="pointer-events-none absolute z-50 flex items-center justify-center rounded-full backdrop-blur-md"
          style={{
            width: 120,
            height: 120,
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: "-50%",
            translateY: "-50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            opacity: isHoveringContainer ? 1 : 0,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </motion.div>
        {/* 所有 item - 根据当前位置动画移动 */}
        {data.map((item, itemIndex) => {
          const position = getItemPosition(itemIndex);
          const style = getPositionStyle(position);
          const isOnScreen = position === 1 || position === 2;

          return (
            <motion.div
              key={`carousel-item-${itemIndex}`}
              className="absolute cursor-none"
              animate={{
                left: style.left,
                top: style.top,
                width: style.width,
                opacity: style.opacity,
                scale: style.scale,
                x: style.x,
              }}
              transition={{
                ...arcTransition,
                // 使用更舒缓的 tween 动画，匹配比亚迪那种缓慢、优雅的过渡感
                scale: {
                  type: "tween",
                  duration: 0.75,
                  ease: [0.25, 0.1, 0.25, 1],
                },
                x: {
                  type: "tween",
                  duration: 0.75,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
              style={{
                aspectRatio: "1",
                zIndex: hoveredPosition === position ? 10 : isOnScreen ? 5 : 1,
                pointerEvents: isOnScreen ? "auto" : "none",
                transformOrigin: style.transformOrigin,
              }}
            >
              {/* 标题移入容器内部，利用 scale 属性实现真正的“共进退” */}
              <h3
                className={`absolute font-anaheim font-extrabold text-white whitespace-nowrap z-20 transition-opacity duration-300 ${isOnScreen ? "opacity-100" : "opacity-0"
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

              <Link
                href={item.href}
                className="block w-full h-full cursor-none"
              >
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
          className="absolute z-20 cursor-none group transition-transform duration-150 active:scale-90"
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
          className="absolute z-20 cursor-none group transition-transform duration-150 active:scale-90"
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
              className="flex items-center justify-center font-anaheim font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 bg-[#d4cc8e] text-[#625d2f] hover:bg-[#625d2f] hover:text-[#d4cc8e] cursor-none"
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
