"use client";

import type { HomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import Magnetic from "@/components/common/Magnetic";

type Props = {
  data: HomeContent["simpleCta"];
};

// ============================================================================
// 布局配置参数 - 可自由调整
// ============================================================================
const LAYOUT_CONFIG = {
  // === 整体容器 ===
  section: {
    paddingY: "pb-8", // 上下内边距
    marginTop: "mt-8 lg:mt-24", // 内容区域顶部间距
  },

  // === 左右两栏布局 ===
  // 基于 Figma 1920px 设计稿，按 90% 缩放，使用实际像素值:
  // 原始: w=1459 → 缩放后: w=1313
  // 原始左侧701 → 631, 间距161 → 145, 右侧597 → 537
  columns: {
    totalWidth: "1313px", // 1459 × 0.9
    leftWidth: "631px", // 701 × 0.9
    gap: "145px", // 161 × 0.9
    rightWidth: "580px", // 597 × 0.9
  },

  // === 左侧图片区域 - 桌面端 ===
  // 基于 Figma 设计稿，按 90% 缩放，使用实际像素值:
  // 原始: 宽701, 高852 → 缩放后: 宽631, 高767
  desktop: {
    // 整体容器尺寸
    containerWidth: "631px", // 701 × 0.9
    containerHeight: "767px", // 852 × 0.9

    // 米色背景矩形: 原始 546×472 → 491×425
    bgRect: {
      width: "491px", // 546 × 0.9
      height: "425px", // 472 × 0.9
      left: "79px", // 88 × 0.9 (原始偏移 274-186=88)
      top: "166px", // 184 × 0.9 (原始偏移 3759-3575=184)
    },

    // 图片1 - 上方大图: 原始 549×324 → 494×292
    image1: {
      width: "494px", // 549 × 0.9
      height: "292px", // 324 × 0.9
      left: "137px", // 152 × 0.9 (原始偏移 338-186=152)
      top: "0px",
      borderRadius: "rounded-[18px]", // 20 × 0.9
      zIndex: "z-20",
    },

    // 图片2 - 左下图: 原始 326×387 → 293×348
    image2: {
      width: "293px", // 326 × 0.9
      height: "348px", // 387 × 0.9
      left: "0px",
      bottom: "43px", // 48 × 0.9 (原始偏移 4427-(3992+387)=48)
      borderRadius: "rounded-[18px]",
      zIndex: "z-30",
    },

    // 图片3 - 右下图: 原始 327×482 → 294×434
    image3: {
      width: "294px", // 327 × 0.9
      height: "434px", // 482 × 0.9
      left: "337px", // 374 × 0.9 (原始偏移 560-186=374)
      bottom: "0px",
      borderRadius: "rounded-[17px]", // 19 × 0.9
      zIndex: "z-30",
    },
  },

  // === 左侧图片区域 - 移动端 ===
  // 移动端保持百分比以适应不同屏幕宽度
  mobile: {
    containerAspectRatio: "631/767",

    bgRect: {
      width: "78%",
      aspectRatio: "491/425",
      left: "12.5%",
      top: "21.6%",
    },

    image1: {
      width: "78%",
      left: "22%",
      top: "0%",
      ratio: "494/292",
      borderRadius: "rounded-[12px]",
      zIndex: "z-20",
    },

    image2: {
      width: "46%",
      left: "0%",
      bottom: "5.6%",
      ratio: "293/348",
      borderRadius: "rounded-[12px]",
      zIndex: "z-30",
    },

    image3: {
      width: "46%",
      left: "53.4%",
      bottom: "0%",
      ratio: "294/434",
      borderRadius: "rounded-[11px]",
      zIndex: "z-30",
    },
  },

  // === 右侧文本区域 ===
  // 基于 Figma 精确间距，按 90% 缩放:
  // 原始间距 × 0.9
  text: {
    // 标题第一行 (Ready to Start) - fontSize: 64 × 0.9 = 58
    title1: {
      fontSize: "text-3xl lg:text-4xl xl:text-[48px] 2xl:text-[58px]",
      lineHeight: "leading-tight 2xl:leading-[84px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[-9px]", // -10 × 0.9
    },

    // 标题第二行 (Your Project?) - fontSize: 96 × 0.9 = 86
    title2: {
      fontSize: "text-4xl lg:text-5xl xl:text-[72px] 2xl:text-[86px]",
      lineHeight: "leading-none 2xl:leading-[84px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[41px]", // 46 × 0.9
    },

    // 副标题 (Let's Build Something Exceptional!) - fontSize: 36 × 0.9 = 32
    subtitle: {
      fontSize: "text-xl lg:text-2xl xl:text-[28px] 2xl:text-[32px]",
      lineHeight: "leading-tight 2xl:leading-[27px]",
      color: "text-[#978350]",
      marginBottom: "mb-[77px]", // 86 × 0.9
      noWrap: true, // 不换行
    },

    // 描述文字 - fontSize: 24
    description: {
      fontSize: "text-base lg:text-lg xl:text-[20px] 2xl:text-[24px]",
      lineHeight: "leading-relaxed 2xl:leading-[38px]",
      color: "text-[#3C3C3C]",
      marginBottom: "mb-[124px]", // 138 × 0.9
    },
  },

  // === CTA 按钮 ===
  // 按 90% 缩放
  button: {
    // 桌面端按钮尺寸: 372 × 0.9 = 335, 68 × 0.9 = 61, 32 × 0.9 = 29
    desktop: {
      width: "w-[252px] lg:w-[288px] 2xl:w-[335px]",
      height: "h-[47px] lg:h-[52px] 2xl:h-[61px]",
      fontSize: "text-base lg:text-lg 2xl:text-[29px]",
      borderRadius: "rounded-[31px]",
    },

    // 移动端按钮尺寸
    mobile: {
      width: "w-[216px]",
      height: "h-[43px]",
      fontSize: "text-sm",
      borderRadius: "rounded-[31px]",
    },
  },
};

// --- 跑马灯带组件 ---
const MarqueeBelt = ({ content }: { content: any }) => {
  if (!content) return null;

  return (
    <div className="w-full overflow-hidden">
      <LexicalRenderer content={content} />
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

const ImagePlaceholder = ({
  ratio,
  alt,
  className,
  image,
}: ImagePlaceholderProps) => {
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
  const firstLine = titleParts[0]?.trim() || "";
  const secondLine =
    titleParts
      .slice(1)
      .map((s) => s.trim())
      .join(" ") || "";

  return (
    <section
      className={cn(cfg.section.paddingY, "bg-brand-main")}
      
    >
      {/* --- 跑马灯带 (Marquee Belt) --- */}
      <MarqueeBelt content={data.marqueeContent} />

      {/* ==================== 移动端布局 ==================== */}
      <div className={cn("lg:hidden px-4", cfg.section.marginTop)}>
        <div className="flex flex-col items-center gap-8">
          {/* 移动端图片区域 */}
          <div
            className="w-full relative"
            style={{ aspectRatio: cfg.mobile.containerAspectRatio }}
          >
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
            <h4 className="font-anaheim font-bold text-xl text-[#978350] leading-tight whitespace-nowrap">
              {data.subtitle}
            </h4>
            <p className="font-montserrat font-normal text-base text-[#3C3C3C] leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
            <div className="pt-4">
              <Link href="/contact-us">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Button
                    className={cn(
                      "font-anaheim font-semibold flex items-center justify-center",
                      cfg.button.mobile.borderRadius,
                      cfg.button.mobile.fontSize,
                      cfg.button.mobile.width,
                      cfg.button.mobile.height,
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
          className="flex items-start justify-center mx-auto"
          style={{
            maxWidth: "1920px",
            gap: cfg.columns.gap,
          }}
        >
          {/* 左侧图片区域 */}
          <div
            className="relative shrink-0"
            style={{
              width: cfg.desktop.containerWidth,
              height: cfg.desktop.containerHeight,
            }}
          >
            {/* 米色背景 */}
            <div
              className="absolute bg-[#F2EEDF] z-0 rounded-lg"
              style={{
                width: cfg.desktop.bgRect.width,
                height: cfg.desktop.bgRect.height,
                left: cfg.desktop.bgRect.left,
                top: cfg.desktop.bgRect.top,
              }}
            />
            {/* 图片1 */}
            <div
              className={cn("absolute", cfg.desktop.image1.zIndex)}
              style={{
                width: cfg.desktop.image1.width,
                height: cfg.desktop.image1.height,
                left: cfg.desktop.image1.left,
                top: cfg.desktop.image1.top,
              }}
            >
              <ImagePlaceholder
                ratio="494/292"
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
                height: cfg.desktop.image2.height,
                left: cfg.desktop.image2.left,
                bottom: cfg.desktop.image2.bottom,
              }}
            >
              <ImagePlaceholder
                ratio="293/348"
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
                height: cfg.desktop.image3.height,
                left: cfg.desktop.image3.left,
                bottom: cfg.desktop.image3.bottom,
              }}
            >
              <ImagePlaceholder
                ratio="294/434"
                alt={data.images[2]?.altText || "Image 3"}
                className={cfg.desktop.image3.borderRadius}
                image={data.images[2]}
              />
            </div>
          </div>

          {/* 右侧文本区域 */}
          <div
            className="text-left shrink-0"
            style={{ width: cfg.columns.rightWidth }}
          >
            {/* 标题第一行 - Ready to Start */}
            {firstLine && (
              <h3
                className={cn(
                  "font-anaheim font-bold",
                  cfg.text.title1.fontSize,
                  cfg.text.title1.lineHeight,
                  cfg.text.title1.color,
                  cfg.text.title1.marginBottom,
                )}
              >
                {firstLine}
              </h3>
            )}

            {/* 标题第二行 - Your Project? */}
            {secondLine && (
              <h3
                className={cn(
                  "font-anaheim font-bold whitespace-nowrap",
                  cfg.text.title2.fontSize,
                  cfg.text.title2.lineHeight,
                  cfg.text.title2.color,
                  cfg.text.title2.marginBottom,
                )}
              >
                {secondLine}
              </h3>
            )}

            {/* 副标题 - Let's Build Something Exceptional! */}
            <h4
              className={cn(
                "font-anaheim font-bold whitespace-nowrap",
                cfg.text.subtitle.fontSize,
                cfg.text.subtitle.lineHeight,
                cfg.text.subtitle.color,
                cfg.text.subtitle.marginBottom,
              )}
            >
              {data.subtitle}
            </h4>

            {/* 描述文字 */}
            <p
              className={cn(
                "font-montserrat font-normal whitespace-pre-wrap",
                cfg.text.description.fontSize,
                cfg.text.description.lineHeight,
                cfg.text.description.color,
                cfg.text.description.marginBottom,
              )}
            >
              {data.description}
            </p>

            {/* CTA 按钮 */}
            <div>
              <Link href={data.ctaLink || "/contact-us"}>
                <Magnetic strength={0.2}>
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
                      rotate: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <Button
                      className={cn(
                        "font-anaheim font-semibold flex items-center justify-center",
                        cfg.button.desktop.borderRadius,
                        cfg.button.desktop.fontSize,
                        cfg.button.desktop.width,
                        cfg.button.desktop.height,
                      )}
                    >
                      {data.ctaText}
                    </Button>
                  </motion.div>
                </Magnetic>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
