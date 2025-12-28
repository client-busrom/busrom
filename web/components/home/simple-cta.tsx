"use client";

import type { HomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";

type Props = {
  data: HomeContent["simpleCta"];
};

// ============================================================================
// 布局配置参数 - 可自由调整
// ============================================================================
const LAYOUT_CONFIG = {
  // === 整体容器 ===
  section: {
    paddingY: "py-8",                    // 上下内边距
    marginTop: "mt-8 lg:mt-12",          // 内容区域顶部间距
  },

  // === 左右两栏布局 ===
  // 基于 Figma 1920px 设计稿精确计算:
  // 整体: x=186, w=1459 (左701 + 间距161 + 右597)
  // 左侧: 186/1920=9.69% 起点, 701/1920=36.51% 宽度
  // 右侧: 1048/1920=54.58% 起点, 597/1920=31.09% 宽度
  // 间距: 161/1920=8.39%
  columns: {
    // 整体区域占屏幕宽度: 1459/1920 = 76%
    totalWidth: "76%",
    // 左侧起点距屏幕左边: 186/1920 = 9.69%
    leftMargin: "9.69%",
    // 左侧宽度占整体: 701/1459 = 48.05%
    leftWidth: "48.05%",
    // 间距占整体: 161/1459 = 11.03%
    gap: "11.03%",
    // 右侧宽度占整体: 597/1459 = 40.92%
    rightWidth: "40.92%",
  },

  // === 左侧图片区域 - 桌面端 ===
  // 基于 Figma 设计稿精确计算：
  // 整体区域: 左边186, 右边887, 顶3575, 底4427 → 宽701, 高852
  desktop: {
    // 整体容器宽高比
    containerAspectRatio: "701/852",

    // 米色背景矩形: x=274, y=3759, w=546, h=472
    bgRect: {
      width: "77.89%",       // 546/701
      aspectRatio: "546/472",
      left: "12.55%",        // (274-186)/701
      top: "21.60%",         // (3759-3575)/852
    },

    // 图片1 - 上方大图: x=338, y=3575, w=549, h=324
    image1: {
      width: "78.32%",       // 549/701
      left: "21.68%",        // (338-186)/701
      top: "0%",
      ratio: "549/324",
      borderRadius: "rounded-[20px]",
      zIndex: "z-20",
    },

    // 图片2 - 左下图: x=186, y=3992, w=326, h=387
    image2: {
      width: "46.50%",       // 326/701
      left: "0%",            // 186-186=0
      bottom: "5.63%",       // (4427-(3992+387))/852
      ratio: "326/387",
      borderRadius: "rounded-[20px]",
      zIndex: "z-30",
    },

    // 图片3 - 右下图: x=560, y=3945, w=327, h=482
    image3: {
      width: "46.65%",       // 327/701
      left: "53.35%",        // (560-186)/701
      bottom: "0%",
      ratio: "327/482",
      borderRadius: "rounded-[19px]",
      zIndex: "z-30",
    },
  },

  // === 左侧图片区域 - 移动端 ===
  mobile: {
    // 整体容器宽高比 - 使用与桌面端相同的比例保持一致
    containerAspectRatio: "701/852",

    // 米色背景矩形
    bgRect: {
      width: "78%",
      aspectRatio: "546/472",
      left: "12%",
      top: "22%",
    },

    // 图片1 - 上方大图
    image1: {
      width: "78%",
      left: "22%",
      top: "0%",
      ratio: "549/324",
      borderRadius: "rounded-[12px]",
      zIndex: "z-20",
    },

    // 图片2 - 左下图
    image2: {
      width: "46%",
      left: "0%",
      bottom: "6%",
      ratio: "326/387",
      borderRadius: "rounded-[12px]",
      zIndex: "z-30",
    },

    // 图片3 - 右下图
    image3: {
      width: "46%",
      left: "54%",
      bottom: "0%",
      ratio: "327/482",
      borderRadius: "rounded-[12px]",
      zIndex: "z-30",
    },
  },

  // === 右侧文本区域 ===
  // 基于 Figma 精确间距:
  // title1 底边 → title2 顶边: -10px (重叠)
  // title2 底边 → subtitle 顶边: 46px
  // subtitle 底边 → description 顶边: 86px
  // description 底边 → button 顶边: 138px
  text: {
    // 标题第一行 (Ready to Start) - y=3617, h=93, fontSize=64
    title1: {
      fontSize: "text-3xl lg:text-4xl xl:text-5xl 2xl:text-[64px]",
      lineHeight: "leading-tight 2xl:leading-[93px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[-10px]",  // 与 title2 重叠 10px
    },

    // 标题第二行 (Your Project?) - y=3700, h=93, fontSize=96
    title2: {
      fontSize: "text-4xl lg:text-5xl xl:text-6xl 2xl:text-[96px]",
      lineHeight: "leading-none 2xl:leading-[93px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[46px]",   // 与 subtitle 间距 46px
    },

    // 副标题 (Let's Build Something Exceptional!) - y=3839, h=30, fontSize=36
    subtitle: {
      fontSize: "text-xl lg:text-2xl xl:text-3xl 2xl:text-[36px]",
      lineHeight: "leading-tight 2xl:leading-[30px]",
      color: "text-[#978350]",
      marginBottom: "mb-[86px]",   // 与 description 间距 86px
    },

    // 描述文字 - y=3955, h=162, fontSize=32, lineHeight=53
    description: {
      fontSize: "text-base lg:text-lg xl:text-xl 2xl:text-[32px]",
      lineHeight: "leading-relaxed 2xl:leading-[53px]",
      maxWidth: "max-w-[597px]",
      color: "text-[#3C3C3C]",
      marginBottom: "mb-[138px]",  // 与 button 间距 138px
    },
  },

  // === CTA 按钮 ===
  button: {

    // 桌面端按钮尺寸
    desktop: {
      width: "w-[280px] lg:w-[320px] 2xl:w-[372px]",
      height: "h-[52px] lg:h-[58px] 2xl:h-[68px]",
      fontSize: "text-lg lg:text-xl 2xl:text-[32px]",
      borderRadius: "rounded-[34px]",
    },

    // 移动端按钮尺寸
    mobile: {
      width: "w-[240px]",
      height: "h-[48px]",
      fontSize: "text-base",
      borderRadius: "rounded-[34px]",
    },
  },
};

// --- 走马灯组件 ---
const MarqueeText = ({
  direction = "left",
  textColor = "white",
}: {
  direction?: "left" | "right";
  textColor?: string;
}) => {
  const texts = Array(20).fill("Busrom");

  return (
    <div className="flex whitespace-nowrap overflow-hidden">
      <div
        className={cn(
          "flex gap-[65px] animate-marquee",
          direction === "right" && "animate-marquee-reverse"
        )}
        style={{ color: textColor }}
      >
        {texts.map((text, i) => (
          <span
            key={i}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {text}
          </span>
        ))}
      </div>
      <div
        className={cn(
          "flex gap-[65px] animate-marquee",
          direction === "right" && "animate-marquee-reverse"
        )}
        style={{ color: textColor }}
      >
        {texts.map((text, i) => (
          <span
            key={`dup-${i}`}
            className="font-anaheim font-semibold text-[16px] lg:text-[20px]"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- 图片占位符组件 ---
type ImagePlaceholderProps = {
  ratio: string;
  alt: string;
  className: string | undefined;
  image?: any;
};

const ImagePlaceholder = ({ ratio, alt, className, image }: ImagePlaceholderProps) => {
  const [w, h] = ratio.split("/").map(Number);
  const paddingBottom = ((h / w) * 100).toFixed(2) + "%";

  return (
    <div
      className={cn("relative overflow-hidden shadow-lg group", className)}
      style={{
        paddingBottom: paddingBottom,
        width: "100%",
        height: 0,
      }}
    >
      <OptimizedImage
        image={image}
        alt={alt || "Layout Image"}
        size="medium"
        className="object-cover absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
      />
    </div>
  );
};

export default function SimpleCta({ data }: Props) {
  if (!data || !data.images) {
    return null;
  }

  const cfg = LAYOUT_CONFIG;

  // 解析标题（支持 /n 或 \n 换行）
  const titleParts = data.title?.split(/\/n|\n/) || [];
  const firstLine = titleParts[0]?.trim() || '';
  const secondLine = titleParts.slice(1).map(s => s.trim()).join(' ') || '';

  return (
    <section className={cn(cfg.section.paddingY, "bg-brand-main")} data-header-theme="light">
      {/* --- 顶部装饰条（两条交叉的走马灯） --- */}
      <motion.div
        className="relative h-[180px] lg:h-[230px] w-full overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* 下层装饰条 */}
        <motion.div
          className="absolute w-[120%] left-[-10%] flex items-center justify-center"
          style={{
            height: "32px",
            top: "50%",
            backgroundColor: "#EBE6D7",
            transformOrigin: "center center",
          }}
          variants={{
            hidden: { x: "-100%", rotate: 4.53, y: "-50%" },
            visible: { x: 0, rotate: 4.53, y: "-50%" },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MarqueeText direction="right" textColor="#756F3F" />
        </motion.div>

        {/* 上层装饰条 */}
        <motion.div
          className="absolute w-[120%] left-[-10%] flex items-center justify-center"
          style={{
            height: "32px",
            top: "50%",
            backgroundColor: "#756F3F",
            transformOrigin: "center center",
          }}
          variants={{
            hidden: { x: "100%", rotate: -2.78, y: "-50%" },
            visible: { x: 0, rotate: -2.78, y: "-50%" },
          }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <MarqueeText direction="left" textColor="#FFFFFF" />
        </motion.div>
      </motion.div>

      {/* ==================== 移动端布局 ==================== */}
      <div className={cn("lg:hidden px-4", cfg.section.marginTop)}>
        <div className="flex flex-col items-center gap-8">
          {/* 移动端图片区域 */}
          <div className="w-full relative" style={{ aspectRatio: cfg.mobile.containerAspectRatio }}>
            {/* 米色背景 */}
            <div
              className="absolute bg-[#F2EEDF] z-0 rounded-lg"
              style={{
                width: cfg.mobile.bgRect.width,
                aspectRatio: cfg.mobile.bgRect.aspectRatio,
                left: cfg.mobile.bgRect.left,
                top: cfg.mobile.bgRect.top,
              }}
            />
            {/* 图片1 */}
            <div
              className={cn("absolute", cfg.mobile.image1.zIndex)}
              style={{
                width: cfg.mobile.image1.width,
                left: cfg.mobile.image1.left,
                top: cfg.mobile.image1.top,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.mobile.image1.ratio}
                alt={data.images[0]?.altText || "Image 1"}
                className={cfg.mobile.image1.borderRadius}
                image={data.images[0]}
              />
            </div>
            {/* 图片2 */}
            <div
              className={cn("absolute", cfg.mobile.image2.zIndex)}
              style={{
                width: cfg.mobile.image2.width,
                left: cfg.mobile.image2.left,
                bottom: cfg.mobile.image2.bottom,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.mobile.image2.ratio}
                alt={data.images[1]?.altText || "Image 2"}
                className={cfg.mobile.image2.borderRadius}
                image={data.images[1]}
              />
            </div>
            {/* 图片3 */}
            <div
              className={cn("absolute", cfg.mobile.image3.zIndex)}
              style={{
                width: cfg.mobile.image3.width,
                left: cfg.mobile.image3.left,
                bottom: cfg.mobile.image3.bottom,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.mobile.image3.ratio}
                alt={data.images[2]?.altText || "Image 3"}
                className={cfg.mobile.image3.borderRadius}
                image={data.images[2]}
              />
            </div>
          </div>

          {/* 移动端文本区域 */}
          <div className="w-full text-left space-y-4">
            {firstLine && (
              <h3 className="font-anaheim font-bold text-3xl text-brand-text-black leading-tight">
                {firstLine}
              </h3>
            )}
            {secondLine && (
              <h3 className="font-anaheim font-bold text-4xl text-brand-text-black leading-none -mt-2">
                {secondLine}
              </h3>
            )}
            <h4 className="font-anaheim font-bold text-xl text-[#978350] leading-tight">
              {data.subtitle}
            </h4>
            <p className="font-anaheim font-normal text-base text-[#3C3C3C] leading-relaxed">
              {data.description}
            </p>
            <div className="pt-4">
              <Link href="/contact-us">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Button
                    className={cn(
                      "font-anaheim font-semibold flex items-center justify-center",
                      cfg.button.mobile.borderRadius,
                      cfg.button.mobile.fontSize,
                      cfg.button.mobile.width,
                      cfg.button.mobile.height
                    )}
                  >
                    {data.ctaText}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 桌面端布局 ==================== */}
      {/* Figma 1920px: 左侧 x=186 w=701, 右侧 x=1048 w=597, 间距=161 */}
      <div className={cn("hidden lg:block", cfg.section.marginTop)}>
        <div
          className="flex items-start mx-auto"
          style={{
            maxWidth: "1920px",
            paddingLeft: "9.69%",    /* 186/1920 */
            paddingRight: "14.32%",  /* 275/1920 */
            gap: "11.03%",           /* 161/1459 of content area */
          }}
        >
          {/* 左侧图片区域: 701px / (701+161+597) = 48.05% */}
          <div
            className="relative shrink-0"
            style={{
              width: "48.05%",
              aspectRatio: cfg.desktop.containerAspectRatio,
            }}
          >
            {/* 米色背景 */}
            <div
              className="absolute bg-[#F2EEDF] z-0 rounded-lg"
              style={{
                width: cfg.desktop.bgRect.width,
                aspectRatio: cfg.desktop.bgRect.aspectRatio,
                left: cfg.desktop.bgRect.left,
                top: cfg.desktop.bgRect.top,
              }}
            />
            {/* 图片1 */}
            <div
              className={cn("absolute", cfg.desktop.image1.zIndex)}
              style={{
                width: cfg.desktop.image1.width,
                left: cfg.desktop.image1.left,
                top: cfg.desktop.image1.top,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.desktop.image1.ratio}
                alt={data.images[0]?.altText || "Image 1"}
                className={cfg.desktop.image1.borderRadius}
                image={data.images[0]}
              />
            </div>
            {/* 图片2 */}
            <div
              className={cn("absolute", cfg.desktop.image2.zIndex)}
              style={{
                width: cfg.desktop.image2.width,
                left: cfg.desktop.image2.left,
                bottom: cfg.desktop.image2.bottom,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.desktop.image2.ratio}
                alt={data.images[1]?.altText || "Image 2"}
                className={cfg.desktop.image2.borderRadius}
                image={data.images[1]}
              />
            </div>
            {/* 图片3 */}
            <div
              className={cn("absolute", cfg.desktop.image3.zIndex)}
              style={{
                width: cfg.desktop.image3.width,
                left: cfg.desktop.image3.left,
                bottom: cfg.desktop.image3.bottom,
              }}
            >
              <ImagePlaceholder
                ratio={cfg.desktop.image3.ratio}
                alt={data.images[2]?.altText || "Image 3"}
                className={cfg.desktop.image3.borderRadius}
                image={data.images[2]}
              />
            </div>
          </div>

          {/* 右侧文本区域: 597px / (701+161+597) = 40.92% */}
          <div
            className="text-left shrink-0"
            style={{ width: "40.92%" }}
          >

            {/* 标题第一行 - Ready to Start */}
            {firstLine && (
              <h3 className={cn(
                "font-anaheim font-bold",
                cfg.text.title1.fontSize,
                cfg.text.title1.lineHeight,
                cfg.text.title1.color,
                cfg.text.title1.marginBottom
              )}>
                {firstLine}
              </h3>
            )}

            {/* 标题第二行 - Your Project? */}
            {secondLine && (
              <h3 className={cn(
                "font-anaheim font-bold whitespace-nowrap",
                cfg.text.title2.fontSize,
                cfg.text.title2.lineHeight,
                cfg.text.title2.color,
                cfg.text.title2.marginBottom
              )}>
                {secondLine}
              </h3>
            )}

            {/* 副标题 - Let's Build Something Exceptional! */}
            <h4 className={cn(
              "font-anaheim font-bold",
              cfg.text.subtitle.fontSize,
              cfg.text.subtitle.lineHeight,
              cfg.text.subtitle.color,
              cfg.text.subtitle.marginBottom
            )}>
              {data.subtitle}
            </h4>

            {/* 描述文字 */}
            <p className={cn(
              "font-anaheim font-normal",
              cfg.text.description.fontSize,
              cfg.text.description.lineHeight,
              cfg.text.description.maxWidth,
              cfg.text.description.color,
              cfg.text.description.marginBottom
            )}>
              {data.description}
            </p>

            {/* CTA 按钮 */}
            <div>
              <Link href="/contact-us">
                <motion.div
                  className="origin-center inline-block"
                  style={{ transformOrigin: "50% 50%" }}
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.08,
                    transition: { scale: { duration: 0.3, ease: "easeOut" } },
                  }}
                  transition={{
                    rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
                  }}
                >
                  <Button
                    className={cn(
                      "font-anaheim font-semibold flex items-center justify-center",
                      cfg.button.desktop.borderRadius,
                      cfg.button.desktop.fontSize,
                      cfg.button.desktop.width,
                      cfg.button.desktop.height
                    )}
                  >
                    {data.ctaText}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
