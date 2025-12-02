"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/lib/navigation";
import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type Props = {
  data: HomeContent["productSeriesCarousel"];
  locale: Locale;
};

/**
 * Figma 设计稿 (1920 x 1200):
 *
 * 背景: #756F3F
 * 阴影: PNG 内部已绘制，无需 CSS box-shadow
 * 文字锚点: 0.5, 0.5 (居中)
 * 文字 x 中心与图片 x 中心对齐
 *
 * Before (默认状态):
 * - 左图: x:220, y:217, 640x640
 * - 右图: x:1060, y:217, 640x640
 * - 左标题: 64px ExtraBold, x中心对齐图片中心
 * - 右标题: 64px ExtraBold, x中心对齐图片中心
 * - 左按钮: x:205, y:941, 129x129
 * - 右按钮: x:1604, y:941, 129x129
 * - View More 按钮: x:753, y:972, 414x67
 *
 * AfterHover (悬停左侧):
 * - 左图: x:180, y:177, 720x720 (放大)
 * - 右图: x:1140, y:297, 480x480 (缩小)
 * - 左标题: 72px (放大)
 * - 右标题: 48px (缩小)
 */

// 设计稿基准
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

// Before 状态尺寸
const IMG_SIZE_DEFAULT = 640;
const IMG_SIZE_HOVER = 720;
const IMG_SIZE_SHRINK = 480;

// 位置 (Before) - 图片左上角坐标
const LEFT_IMG_X = 220;
const LEFT_IMG_Y = 217;
const RIGHT_IMG_X = 1060;
const RIGHT_IMG_Y = 217;

// 位置 (AfterHover 左侧悬停)
const LEFT_IMG_X_HOVER = 180;
const LEFT_IMG_Y_HOVER = 177;
const RIGHT_IMG_X_HOVER = 1140;
const RIGHT_IMG_Y_HOVER = 297;

// 标题 Y 位置 (原115 + 下移40)
const TITLE_Y = 155;

// 按钮位置 (原941 - 上移80)
const NAV_BTN_Y = 861;
const LEFT_NAV_X = 205;
const RIGHT_NAV_X = 1604;
const NAV_BTN_SIZE = 129;

// View More 按钮 (原972 - 上移80)
const VIEW_BTN_Y = 892;
const VIEW_BTN_W = 414;
const VIEW_BTN_H = 67;

// 字体尺寸
const TITLE_SIZE_DEFAULT = 64;
const TITLE_SIZE_HOVER = 72;
const TITLE_SIZE_SHRINK = 48;

export default function ProductSeriesCarousel({ data }: Props) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const seriesCount = data?.length || 0;

  const paginate = (newDirection: number) => {
    setPage([(page + newDirection + seriesCount) % seriesCount, newDirection]);
    setHoveredIndex(null);
  };

  const leftItemIndex = page;
  const rightItemIndex = (page + 1) % seriesCount;
  const leftItem = useMemo(() => data[leftItemIndex], [data, leftItemIndex]);
  const rightItem = useMemo(() => data[rightItemIndex], [data, rightItemIndex]);

  if (!data || seriesCount < 2 || !leftItem || !rightItem) {
    return null;
  }

  // 计算图片中心 X 坐标
  const getLeftImgCenterX = () => {
    const isHovered = hoveredIndex === leftItemIndex;
    const isOtherHovered = hoveredIndex === rightItemIndex;

    if (isHovered) {
      return LEFT_IMG_X_HOVER + IMG_SIZE_HOVER / 2;
    } else if (isOtherHovered) {
      // 右侧悬停时，左侧缩小并保持中心位置
      return LEFT_IMG_X + 80 + IMG_SIZE_SHRINK / 2;
    }
    return LEFT_IMG_X + IMG_SIZE_DEFAULT / 2;
  };

  const getRightImgCenterX = () => {
    const isHovered = hoveredIndex === rightItemIndex;
    const isOtherHovered = hoveredIndex === leftItemIndex;

    if (isHovered) {
      // 右侧悬停 - 镜像左侧悬停效果
      return DESIGN_WIDTH - LEFT_IMG_X_HOVER - IMG_SIZE_HOVER / 2;
    } else if (isOtherHovered) {
      return RIGHT_IMG_X_HOVER + IMG_SIZE_SHRINK / 2;
    }
    return RIGHT_IMG_X + IMG_SIZE_DEFAULT / 2;
  };

  // 计算尺寸和位置
  const getLeftItemStyle = () => {
    const isHovered = hoveredIndex === leftItemIndex;
    const isOtherHovered = hoveredIndex === rightItemIndex;

    if (isHovered) {
      return {
        left: `${(LEFT_IMG_X_HOVER / DESIGN_WIDTH) * 100}%`,
        top: `${(LEFT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
        width: `${(IMG_SIZE_HOVER / DESIGN_WIDTH) * 100}%`,
      };
    } else if (isOtherHovered) {
      // 右侧悬停时，左侧需要镜像处理（缩小并移动）
      return {
        left: `${((LEFT_IMG_X + 80) / DESIGN_WIDTH) * 100}%`,
        top: `${((LEFT_IMG_Y + 80) / DESIGN_HEIGHT) * 100}%`,
        width: `${(IMG_SIZE_SHRINK / DESIGN_WIDTH) * 100}%`,
      };
    }
    return {
      left: `${(LEFT_IMG_X / DESIGN_WIDTH) * 100}%`,
      top: `${(LEFT_IMG_Y / DESIGN_HEIGHT) * 100}%`,
      width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
    };
  };

  const getRightItemStyle = () => {
    const isHovered = hoveredIndex === rightItemIndex;
    const isOtherHovered = hoveredIndex === leftItemIndex;

    if (isHovered) {
      // 右侧悬停 - 镜像左侧悬停效果
      return {
        left: `${((DESIGN_WIDTH - LEFT_IMG_X_HOVER - IMG_SIZE_HOVER) / DESIGN_WIDTH) * 100}%`,
        top: `${(LEFT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
        width: `${(IMG_SIZE_HOVER / DESIGN_WIDTH) * 100}%`,
      };
    } else if (isOtherHovered) {
      return {
        left: `${(RIGHT_IMG_X_HOVER / DESIGN_WIDTH) * 100}%`,
        top: `${(RIGHT_IMG_Y_HOVER / DESIGN_HEIGHT) * 100}%`,
        width: `${(IMG_SIZE_SHRINK / DESIGN_WIDTH) * 100}%`,
      };
    }
    return {
      left: `${(RIGHT_IMG_X / DESIGN_WIDTH) * 100}%`,
      top: `${(RIGHT_IMG_Y / DESIGN_HEIGHT) * 100}%`,
      width: `${(IMG_SIZE_DEFAULT / DESIGN_WIDTH) * 100}%`,
    };
  };

  const getLeftTitleSize = () => {
    if (hoveredIndex === leftItemIndex) return TITLE_SIZE_HOVER;
    if (hoveredIndex === rightItemIndex) return TITLE_SIZE_SHRINK;
    return TITLE_SIZE_DEFAULT;
  };

  const getRightTitleSize = () => {
    if (hoveredIndex === rightItemIndex) return TITLE_SIZE_HOVER;
    if (hoveredIndex === leftItemIndex) return TITLE_SIZE_SHRINK;
    return TITLE_SIZE_DEFAULT;
  };

  const hoveredItem = hoveredIndex === leftItemIndex ? leftItem : hoveredIndex === rightItemIndex ? rightItem : null;

  return (
    <section
      className="relative bg-[#756F3F] overflow-hidden"
      data-header-theme="transparent"
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* 场景图背景 (hover 时显示) - 叠加在背景色上层，10% 透明度 */}
      <AnimatePresence>
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
              size="xlarge"
              className="object-cover w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 移动端布局 (<1024px) ==================== */}
      <div className="lg:hidden h-full flex flex-col justify-center px-4 py-8">
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* 左侧 Item */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={`mobile-left-${page}`}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-[45%] aspect-square left-[5%]"
            >
              <Link href={leftItem.href} className="block w-full h-full">
                <OptimizedImage
                  image={leftItem.image}
                  alt={leftItem.image?.altText || leftItem.name}
                  size="large"
                  className="object-cover w-full h-full"
                  priority
                />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* 右侧 Item */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={`mobile-right-${page}`}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-[45%] aspect-square right-[5%]"
            >
              <Link href={rightItem.href} className="block w-full h-full">
                <OptimizedImage
                  image={rightItem.image}
                  alt={rightItem.image?.altText || rightItem.name}
                  size="large"
                  className="object-cover w-full h-full"
                  priority
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 移动端标题 */}
        <div className="flex justify-between px-4 mt-4">
          <span className="font-anaheim font-extrabold text-white text-lg">
            {leftItem.name}
          </span>
          <span className="font-anaheim font-extrabold text-white text-lg">
            {rightItem.name}
          </span>
        </div>

        {/* 移动端导航按钮 */}
        <div className="flex justify-between px-4 mt-4">
          <button onClick={() => paginate(-1)} aria-label="Previous">
            <img src="/btnLeft2.svg" alt="Previous" className="w-12 h-12" />
          </button>
          <button onClick={() => paginate(1)} aria-label="Next">
            <img src="/btnRight2.svg" alt="Next" className="w-12 h-12" />
          </button>
        </div>
      </div>

      {/* ==================== 桌面端布局 (>=1024px) - 等比例缩放 ==================== */}
      <div className="hidden lg:block absolute inset-0">
        {/* 左侧标题 - 锚点居中，x中心对齐图片中心 */}
        <motion.h3
          className="absolute font-anaheim font-extrabold text-white whitespace-nowrap"
          style={{
            top: `${(TITLE_Y / DESIGN_HEIGHT) * 100}%`,
            transform: "translate(-50%, -50%)",
            fontWeight: 800,
            lineHeight: 0.47,
          }}
          animate={{
            left: `${(getLeftImgCenterX() / DESIGN_WIDTH) * 100}%`,
            fontSize: `${(getLeftTitleSize() / DESIGN_WIDTH) * 100}vw`,
          }}
          transition={{ duration: 0.3 }}
        >
          {leftItem.name}
        </motion.h3>

        {/* 右侧标题 - 锚点居中，x中心对齐图片中心 */}
        <motion.h3
          className="absolute font-anaheim font-extrabold text-white whitespace-nowrap"
          style={{
            top: `${(TITLE_Y / DESIGN_HEIGHT) * 100}%`,
            transform: "translate(-50%, -50%)",
            fontWeight: 800,
            lineHeight: 0.47,
          }}
          animate={{
            left: `${(getRightImgCenterX() / DESIGN_WIDTH) * 100}%`,
            fontSize: `${(getRightTitleSize() / DESIGN_WIDTH) * 100}vw`,
          }}
          transition={{ duration: 0.3 }}
        >
          {rightItem.name}
        </motion.h3>

        {/* 左侧图片 */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`desktop-left-${page}`}
            className="absolute cursor-pointer"
            initial={{
              left: direction > 0 ? "100%" : "-30%",
              opacity: 0,
            }}
            animate={{
              ...getLeftItemStyle(),
              opacity: 1,
            }}
            exit={{
              left: direction > 0 ? "-30%" : "100%",
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              aspectRatio: "1",
              zIndex: hoveredIndex === leftItemIndex ? 10 : 1,
            }}
            onMouseEnter={() => setHoveredIndex(leftItemIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link href={leftItem.href} className="block w-full h-full">
              <OptimizedImage
                image={leftItem.image}
                alt={leftItem.image?.altText || leftItem.name}
                size="large"
                className="object-cover w-full h-full"
                priority
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* 右侧图片 */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`desktop-right-${page}`}
            className="absolute cursor-pointer"
            initial={{
              left: direction > 0 ? "100%" : "-30%",
              opacity: 0,
            }}
            animate={{
              ...getRightItemStyle(),
              opacity: 1,
            }}
            exit={{
              left: direction > 0 ? "-30%" : "100%",
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              aspectRatio: "1",
              zIndex: hoveredIndex === rightItemIndex ? 10 : 1,
            }}
            onMouseEnter={() => setHoveredIndex(rightItemIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link href={rightItem.href} className="block w-full h-full">
              <OptimizedImage
                image={rightItem.image}
                alt={rightItem.image?.altText || rightItem.name}
                size="large"
                className="object-cover w-full h-full"
                priority
              />
            </Link>
          </motion.div>
        </AnimatePresence>

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

        {/* View More 按钮 - 居中定位，自适应宽度，仅在悬停时显示 */}
        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    </section>
  );
}
