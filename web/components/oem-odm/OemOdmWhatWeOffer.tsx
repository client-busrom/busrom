"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 设计稿基准尺寸 (已按0.7缩放)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 844; // 920 * 0.7 + 200

// 响应式尺寸函数
const rpx = (designValue: number) =>
  `calc(var(--rpx-what-we-offer) * ${designValue})`;

// ============ 可调整的位置参数 ============
const CARD_HEIGHT = 550;
const CARD_WIDTH = 280;

// 第一个卡片 (左侧 - 上圆下方)
const CARD1_LEFT = 237;
const CARD1_TEXT_LEFT = 339;
const CARD1_TEXT_TOP = 294; // 844 - 550 = 294
const CARD1_DESC_LEFT = 336;
const CARD1_DESC_TOP = 488; // 294 + 194

// 第二个卡片 (中间 - 上方下圆) - 文字初始在底部，悬停时上移
const CARD2_LEFT = 529;
const CARD2_TEXT_LEFT = 636;
const CARD2_TEXT_TOP_DEFAULT = 615; // 底部位置
const CARD2_TEXT_TOP_HOVER = 421; // 悬停时上移位置
const CARD2_DESC_LEFT = 631;
const CARD2_DESC_TOP = 615;

// 第三个卡片 (右侧 - 上圆下方)
const CARD3_LEFT = 820;
const CARD3_TEXT_LEFT = 936;
const CARD3_TEXT_TOP = 294;
const CARD3_DESC_LEFT = 929;
const CARD3_DESC_TOP = 488;
// ==========================================

// ============ 滑轨门动画参数 ============
const HEADER_HEIGHT = 46;
const OPEN_SCROLL = 500; // 开门滚动距离
const PAUSE_SCROLL = 200; // 停留滚动距离（门全开）
const CLOSE_SCROLL = 500; // 关门滚动距离
const TOTAL_SCROLL = OPEN_SCROLL + PAUSE_SCROLL + CLOSE_SCROLL;
// ==========================================

interface MediaObject {
  id: string;
  url: string;
  alt?: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
  };
  cropFocalPoint?: { x: number; y: number } | null;
  width?: number;
  height?: number;
}

interface OfferItem {
  number: string;
  title: string;
  description: string;
  image?: MediaObject | null;
}

interface OemOdmWhatWeOfferProps {
  // 主标题
  title?: string;
  // 三个服务项
  items?: OfferItem[];
}

const defaultContent = {
  title: "What We Offer You",
  items: [
    {
      number: "01",
      title: "Product Development",
      description:
        "We constantly develop new products based on market feedback and customer demand.",
    },
    {
      number: "02",
      title: "Experienced Experts",
      description:
        "Our team of experienced experts provides professional guidance and support.",
    },
    {
      number: "03",
      title: "Marketing Support",
      description:
        "We offer comprehensive marketing support to help you succeed in the market.",
    },
  ],
};

export function OemOdmWhatWeOffer({
  title = defaultContent.title,
  items = defaultContent.items,
}: OemOdmWhatWeOfferProps) {
  // 当前悬停的卡片索引 (null表示没有悬停)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // 滑轨门动画 refs
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const leftClipRef = useRef<HTMLDivElement>(null);
  const rightClipRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger — 滑轨门开关动画（仅 PC 端）
  useEffect(() => {
    // 仅在 PC 端且 DOM 就绪后初始化
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const section = sectionRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const leftClip = leftClipRef.current;
    const rightClip = rightClipRef.current;
    if (!section || !leftDoor || !rightDoor || !leftClip || !rightClip) return;

    // 延迟初始化确保 DOM 完全加载（与项目中其他 ScrollTrigger 用法一致）
    const timeoutId = setTimeout(() => {
      if (
        !sectionRef.current ||
        !leftDoorRef.current ||
        !rightDoorRef.current ||
        !leftClipRef.current ||
        !rightClipRef.current
      )
        return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top top+=${HEADER_HEIGHT}`,
          end: `+=${TOTAL_SCROLL}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      // 阶段1：开门 (时间轴 0 → 0.417)
      const openDuration = OPEN_SCROLL / TOTAL_SCROLL;
      tl.to(
        [leftDoorRef.current, leftClipRef.current],
        {
          x: "-100%",
          duration: openDuration,
          ease: "power2.inOut",
        },
        0,
      ).to(
        [rightDoorRef.current, rightClipRef.current],
        {
          x: "100%",
          duration: openDuration,
          ease: "power2.inOut",
        },
        0,
      );

      // 阶段3：关门 (0.583 → 1.0)
      const closeStart = (OPEN_SCROLL + PAUSE_SCROLL) / TOTAL_SCROLL;
      const closeDuration = CLOSE_SCROLL / TOTAL_SCROLL;
      tl.to(
        [leftDoorRef.current, leftClipRef.current],
        {
          x: "0%",
          duration: closeDuration,
          ease: "power2.inOut",
        },
        closeStart,
      ).to(
        [rightDoorRef.current, rightClipRef.current],
        {
          x: "0%",
          duration: closeDuration,
          ease: "power2.inOut",
        },
        closeStart,
      );

      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      // 清理当前页面的所有 ScrollTrigger
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        ["--rpx-what-we-offer" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* ========== PC端布局 ========== */}
      <div
        className="hidden md:block relative w-full overflow-hidden"
        style={{ height: rpx(DESIGN_HEIGHT) }}
      >
        {/* z-0：背景层 - 全屏宽度背景图片 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/oem-odm/what-we-offer-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* z-10：标题 - What We Offer You - 双层文字效果 */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            top: rpx(120), // 75 * 0.7 + 100
            width: rpx(688), // 983 * 0.7
            height: rpx(74), // 106 * 0.7
            zIndex: 10,
          }}
        >
          {/* 下层 - 实心填充，向下偏移4px，与背景墨绿色相近 */}
          <motion.h2
            className="absolute font-anaheim font-extrabold text-center w-full"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(68),
              color: "#4A5D4A",
              WebkitTextStroke: `2px #FFDB4A`,
              top: rpx(5), // 4 * 0.7
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          {/* 上层 - 白色填充 */}
          <motion.h2
            className="absolute font-anaheim font-extrabold text-white text-center w-full"
            style={{
              fontSize: rpx(60),
              lineHeight: rpx(68),
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
        </div>

        {/* z-20：居中内容容器（三张卡片） */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: rpx(1344), // 1920 * 0.7
            height: rpx(DESIGN_HEIGHT),
            zIndex: 20,
          }}
        >
          {/* 第一个卡片 - 左侧 Product Development (上圆下方) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(CARD1_LEFT),
              bottom: 0,
              width: rpx(CARD_WIDTH),
              height: rpx(CARD_HEIGHT),
              borderRadius: `${rpx(140)} ${rpx(140)} 0 0`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[0]?.image?.url
                  ? `url(${items[0].image.variants?.large || items[0].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[0]?.image?.url ? undefined : "#92400e",
              }}
              animate={{
                scale: hoveredCard === 0 ? 1.1 : 1,
                filter: hoveredCard === 0 ? "grayscale(0)" : "grayscale(1)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 - 悬停时隐藏 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
              }}
              animate={{ opacity: hoveredCard === 0 ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          {/* 第一个卡片文字内容 - 独立定位避免被overflow-hidden截断 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: rpx(CARD1_TEXT_LEFT),
              top: rpx(CARD1_TEXT_TOP),
              width: rpx(218), // 312 * 0.7
              zIndex: 20,
            }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90), // 128 * 0.7
                lineHeight: rpx(93), // 133 * 0.7
              }}
            >
              {items[0]?.number || "01"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34), // 48 * 0.7
                lineHeight: rpx(38), // 54 * 0.7
                marginTop: rpx(13), // 18 * 0.7
                width: rpx(224), // 320 * 0.7
                marginLeft: rpx(-6), // -8 * 0.7
              }}
            >
              {items[0]?.title || "Product Development"}
            </h3>
          </div>
          {/* 第一个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 0 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(CARD1_DESC_LEFT),
                  top: rpx(CARD1_DESC_TOP),
                  width: rpx(221),
                  fontSize: rpx(14),
                  lineHeight: rpx(26),
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {items[0]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 第二个卡片 - 中间 Experienced Experts (上方下圆) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(CARD2_LEFT),
              bottom: 0,
              width: rpx(CARD_WIDTH),
              height: rpx(CARD_HEIGHT),
              borderRadius: `0 0 ${rpx(140)} ${rpx(140)}`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[1]?.image?.url
                  ? `url(${items[1].image.variants?.large || items[1].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[1]?.image?.url ? undefined : "#b45309",
              }}
              animate={{
                scale: hoveredCard === 1 ? 1.1 : 1,
                filter: hoveredCard === 1 ? "grayscale(0)" : "grayscale(1)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 - 悬停时隐藏 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
              }}
              animate={{ opacity: hoveredCard === 1 ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          {/* 第二个卡片文字内容 - 初始在底部，悬停时上移 */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: rpx(CARD2_TEXT_LEFT),
              width: rpx(218),
              zIndex: 20,
            }}
            animate={{
              top:
                hoveredCard === 1
                  ? rpx(CARD2_TEXT_TOP_HOVER)
                  : rpx(CARD2_TEXT_TOP_DEFAULT),
            }}
            transition={{ duration: 0.3 }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90),
                lineHeight: rpx(93),
              }}
            >
              {items[1]?.number || "02"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34),
                lineHeight: rpx(38),
                marginTop: rpx(0),
                width: rpx(224),
                marginLeft: rpx(-6),
              }}
            >
              {items[1]?.title || "Experienced Experts"}
            </h3>
          </motion.div>
          {/* 第二个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 1 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(CARD2_DESC_LEFT),
                  top: rpx(CARD2_DESC_TOP),
                  width: rpx(221),
                  fontSize: rpx(14),
                  lineHeight: rpx(26),
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {items[1]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 第三个卡片 - 右侧 Marketing Support (上圆下方) */}
          <motion.div
            className="absolute cursor-pointer overflow-hidden"
            style={{
              left: rpx(CARD3_LEFT),
              bottom: 0,
              width: rpx(CARD_WIDTH),
              height: rpx(CARD_HEIGHT),
              borderRadius: `${rpx(140)} ${rpx(140)} 0 0`,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 背景图片 */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: items[2]?.image?.url
                  ? `url(${items[2].image.variants?.large || items[2].image.url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: items[2]?.image?.url ? undefined : "#92400e",
              }}
              animate={{
                scale: hoveredCard === 2 ? 1.1 : 1,
                filter: hoveredCard === 2 ? "grayscale(0)" : "grayscale(1)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* 渐变遮罩 - 悬停时隐藏 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
              }}
              animate={{ opacity: hoveredCard === 2 ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          {/* 第三个卡片文字内容 - 独立定位避免被overflow-hidden截断 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: rpx(CARD3_TEXT_LEFT),
              top: rpx(CARD3_TEXT_TOP),
              width: rpx(218), // 311 * 0.7
              zIndex: 20,
            }}
          >
            {/* 序号 */}
            <span
              className="block font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(90), // 128 * 0.7
                lineHeight: rpx(93), // 133 * 0.7
              }}
            >
              {items[2]?.number || "03"}
            </span>
            {/* 标题 */}
            <h3
              className="font-anaheim font-extrabold text-white text-right"
              style={{
                fontSize: rpx(34), // 48 * 0.7
                lineHeight: rpx(38), // 54 * 0.7
                marginTop: rpx(13), // 18 * 0.7
                width: rpx(224), // 320 * 0.7
                marginLeft: rpx(-6), // -9 * 0.7
              }}
            >
              {items[2]?.title || "Marketing Support"}
            </h3>
          </div>
          {/* 第三个卡片描述文字 - 悬停时显示 */}
          <AnimatePresence>
            {hoveredCard === 2 && (
              <motion.p
                className="absolute font-anaheim font-semibold text-white text-right pointer-events-none"
                style={{
                  left: rpx(CARD3_DESC_LEFT),
                  top: rpx(CARD3_DESC_TOP),
                  width: rpx(221), // 316 * 0.7
                  fontSize: rpx(14), // 20 * 0.7
                  lineHeight: rpx(26), // 37 * 0.7
                  zIndex: 20,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {items[2]?.description || ""}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ====== 滑轨门系统 ====== */}
        {/* 所有 SVG 已按 1920×844 设计稿重新导出，直接用原始尺寸 + rpx() */}

        {/* Layer 0 (z-25)：固定侧面磨砂玻璃墙板 — 440×845 */}
        <img
          src="/images/oem-odm/sliding-door/rectangle-398.svg"
          alt=""
          className="absolute top-0 left-0"
          style={{ width: rpx(440), height: rpx(845), zIndex: 25 }}
          aria-hidden="true"
        />
        <img
          src="/images/oem-odm/sliding-door/rectangle-399.svg"
          alt=""
          className="absolute top-0 right-0"
          style={{ width: rpx(440), height: rpx(845), zIndex: 25 }}
          aria-hidden="true"
        />

        {/* Layer 1 (z-26)：滑动门扇 — 600×845
            左门：right:50% 右边缘对齐中心线
            右门：left:50% 左边缘对齐中心线 */}
        <div
          ref={leftDoorRef}
          className="absolute top-0"
          style={{
            right: "50%",
            width: rpx(600),
            height: rpx(845),
            zIndex: 26,
            willChange: "transform",
          }}
        >
          {/* 磨砂玻璃遮罩 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
            }}
          />
          <img
            src="/images/oem-odm/sliding-door/left-door.svg"
            alt=""
            className="w-full h-full relative z-10"
            aria-hidden="true"
          />
        </div>
        <div
          ref={rightDoorRef}
          className="absolute top-0"
          style={{
            left: "50%",
            width: rpx(600),
            height: rpx(845),
            zIndex: 26,
            willChange: "transform",
          }}
        >
          {/* 磨砂玻璃遮罩 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
            }}
          />
          <img
            src="/images/oem-odm/sliding-door/right-door.svg"
            alt=""
            className="w-full h-full relative z-10"
            aria-hidden="true"
          />
        </div>

        {/* Layer 2 (z-27)：导轨横杆 — 1920×42（固定不动，下移20px） */}
        <img
          src="/images/oem-odm/sliding-door/stick.svg"
          alt=""
          className="absolute left-0"
          style={{
            top: rpx(50),
            width: rpx(1920),
            height: rpx(42),
            zIndex: 27,
          }}
          aria-hidden="true"
        />

        {/* Layer 3 (z-28)：滑轮夹扣 — 460×76，跟门板一起滑动
            wrapper 宽度与对应门板一致(600)，确保 x:"-100%" 滑动距离相同
            clip 图片定位在 wrapper 靠中缝一侧 */}
        <div
          ref={leftClipRef}
          className="absolute pointer-events-none"
          style={{
            top: rpx(20),
            right: "50%",
            width: rpx(600),
            height: rpx(76),
            zIndex: 28,
            willChange: "transform",
          }}
        >
          <img
            src="/images/oem-odm/sliding-door/left-clip.svg"
            alt=""
            className="absolute top-0 right-0"
            style={{ width: rpx(460), height: rpx(76) }}
            aria-hidden="true"
          />
        </div>
        <div
          ref={rightClipRef}
          className="absolute pointer-events-none"
          style={{
            top: rpx(20),
            left: "50%",
            width: rpx(600),
            height: rpx(76),
            zIndex: 28,
            willChange: "transform",
          }}
        >
          <img
            src="/images/oem-odm/sliding-door/right-clip.svg"
            alt=""
            className="absolute top-0 left-0"
            style={{ width: rpx(460), height: rpx(76) }}
            aria-hidden="true"
          />
        </div>

        {/* ====== 滑轨门系统结束 ====== */}
      </div>

      {/* ========== 移动端布局 ========== */}
      <div className="block md:hidden px-5 py-10">
        {/* 背景 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(32, 30, 14, 0.95)",
          }}
        />

        {/* 内容 */}
        <div className="relative z-10">
          {/* 标题 */}
          <h2 className="font-anaheim font-extrabold text-white text-2xl text-center mb-8">
            {title}
          </h2>

          {/* 卡片列表 */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden"
                style={{ height: "280px" }}
              >
                {/* 背景图片 */}
                {item.image ? (
                  <OptimizedImage
                    image={item.image as any}
                    alt={item.title}
                    size="medium"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900" />
                )}
                {/* 渐变遮罩 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 30%, rgba(32, 30, 14, 0.95) 100%)",
                  }}
                />
                {/* 内容 */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-anaheim font-extrabold text-white text-5xl leading-none">
                      {item.number}
                    </span>
                    <h3 className="font-anaheim font-extrabold text-white text-xl leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-anaheim font-semibold text-white text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OemOdmWhatWeOffer;
