"use client";
import React from "react";

import type { HomeContent } from "@/lib/content-data";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer";
import { IconifyIcon } from "@/components/ui/IconifyIcon";

type Props = {
  data: HomeContent["simpleCta"];
  headerTheme?: string;
  className?: string;
};

// ============================================================================
// 布局配置参数 - 可自由调整
// ============================================================================
const LAYOUT_CONFIG = {
  // === 整体容器 ===
  section: {
    paddingY: "py-12 lg:py-[60px]", // 上下内边距
    marginTop: "mt-8 lg:mt-12", // 内容区域顶部间距
  },

  // === 左右两栏布局 ===
  // 基于 Figma 1920px 设计稿，按 90% 缩放，使用实际像素值:
  // 原始: w=1459 → 缩放后: w=1313
  // 原始左侧701 → 631, 间距161 → 145, 右侧597 → 537
  columns: {
    totalWidth: "1313px", // 1459 × 0.9
    leftWidth: "568px", // 631 × 0.9
    gap: "145px", // 161 × 0.9
    rightWidth: "537px", // 597 × 0.9
  },

  // === 左侧图片区域 - 桌面端 ===
  // 在 446df47 基础上再进行 90% 缩放，以优化视觉平衡
  desktop: {
    // 整体容器尺寸: 631 × 0.9 ≈ 568, 767 × 0.9 ≈ 690
    containerWidth: "568px",
    containerHeight: "690px",

    // 米色背景矩形: 491 × 0.9 ≈ 442, 425 × 0.9 ≈ 383
    bgRect: {
      width: "442px",
      height: "383px",
      left: "71px", // 79 × 0.9
      top: "149px", // 166 × 0.9
    },

    // 图片1 - 上方大图: 494 × 0.9 ≈ 445, 292 × 0.9 ≈ 263
    image1: {
      width: "445px",
      height: "263px",
      left: "123px", // 137 × 0.9
      top: "0px",
      borderRadius: "rounded-[16px]", // 18 × 0.9
      zIndex: "z-20",
    },

    // 图片2 - 左下图: 293 × 0.9 ≈ 264, 348 × 0.9 ≈ 313
    image2: {
      width: "264px",
      height: "313px",
      left: "0px",
      bottom: "39px", // 43 × 0.9
      borderRadius: "rounded-[16px]",
      zIndex: "z-30",
    },

    // 图片3 - 右下图: 294 × 0.9 ≈ 265, 434 × 0.9 ≈ 391
    image3: {
      width: "265px",
      height: "391px",
      left: "303px", // 337 × 0.9
      bottom: "0px",
      borderRadius: "rounded-[15px]", // 17 × 0.9
      zIndex: "z-30",
    },
  },

  // === 左侧图片区域 - 移动端 ===
  // 移动端保持百分比以适应不同屏幕宽度
  mobile: {
    containerAspectRatio: "568/690",

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
      fontSize: "text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl",
      lineHeight: "leading-tight 2xl:leading-[84px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[-9px]", // -10 × 0.9
    },

    // 标题第二行 (Your Project?) - fontSize: 96 × 0.9 = 86
    title2: {
      fontSize: "text-4xl lg:text-5xl xl:text-7xl 2xl:text-[86px]",
      lineHeight: "leading-none 2xl:leading-[84px]",
      color: "text-brand-text-black",
      marginBottom: "mb-[41px]", // 46 × 0.9
    },

    // 副标题 (Let's Build Something Exceptional!) - fontSize: 36 × 0.9 = 32
    subtitle: {
      fontSize: "text-xl xl:text-2xl 2xl:text-3xl",
      lineHeight: "leading-tight 2xl:leading-[27px]",
      color: "text-[#978350]",
      marginBottom: "mb-[77px]", // 86 × 0.9
      noWrap: true, // 不换行
    },

    // 描述文字 - fontSize: 32 × 0.9 = 29
    description: {
      fontSize: "text-base lg:text-lg xl:text-xl 2xl:text-[22px]",
      lineHeight: "leading-relaxed 2xl:leading-[48px]",
      maxWidth: "max-w-[537px]", // 597 × 0.9
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

// --- 数据提取逻辑 ---
const extractMarqueeLinks = (content: any) => {
  try {
    const nodes = content?.root?.children || [];
    // 匹配后端传回的 Lexical 块结构
    const blockNode = nodes.find(
      (n: any) => n.type === "marqueeLinks" || (n.type === "block" && n.fields?.blockType === "marqueeLinks")
    );
    const links = blockNode?.data?.links || blockNode?.fields?.links || [];

    return links.map((link: any) => {
      const iconData = link.icon;
      const iconId = typeof iconData === "object" ? iconData.id : (typeof iconData === "string" || typeof iconData === "number" ? iconData : null);
      
      const iconUrl = typeof iconData === "object" 
        ? (iconData.url || iconData.sizes?.thumbnail?.url || iconData.sizes?.card?.url || iconData.variants?.thumbnail?.url) 
        : null;
        
      return {
        title: link.title,
        url: link.url,
        iconName: link.iconName,
        iconUrl: iconUrl,
        iconId: iconId, // 保留 ID 用于后续解析
      };
    });
  } catch (e) {
    console.error("Marquee data extraction failed:", e);
    return [];
  }
};

// --- 走马灯组件 ---
const MarqueeText = ({
  direction = "left",
  textColor = "white",
  items = [],
  mediaCache = {},
}: {
  direction?: "left" | "right";
  textColor?: string;
  items?: any[];
  mediaCache?: Record<string, any>;
}) => {
  const displayItems = items.length > 0 ? items : [{ title: "Busrom", url: "#" }];

  // 增加重复次数以确保滚动流畅
  const repeatCount = Math.max(4, Math.ceil(40 / displayItems.length));
  const fullItems = Array(repeatCount).fill(displayItems).flat();

  const renderItem = (item: any, idx: string | number) => {
    const mediaData = item.iconId ? mediaCache[item.iconId] : null;
    const finalIconUrl = item.iconUrl || mediaData?.url || mediaData?.sizes?.thumbnail?.url || mediaData?.sizes?.card?.url;
    
    const content = (
      <div className="flex items-center gap-4 lg:gap-6 shrink-0 px-6 lg:px-10 py-2 transition-transform hover:scale-105">
        {item.iconName ? (
          <IconifyIcon name={item.iconName} className="w-auto h-5 lg:h-6 min-w-[20px]" />
        ) : finalIconUrl ? (
          <img
            src={finalIconUrl}
            alt=""
            className="h-5 lg:h-6 w-auto object-contain block"
          />
        ) : null}
        <span className="font-anaheim font-semibold text-[16px] lg:text-[20px] uppercase whitespace-nowrap">
          {item.title}
        </span>
      </div>
    );

    if (item.url) {
      return (
        <Link key={idx} href={item.url} className="hover:opacity-80 transition-opacity cursor-pointer">
          {content}
        </Link>
      );
    }

    return <div key={idx}>{content}</div>;
  };

  const animationName = direction === "left" ? "marquee-left" : "marquee-right";
  const uniqueId = React.useId().replace(/:/g, "");
  const containerClass = `marquee-container-${uniqueId}`;

  return (
    <div className="group flex whitespace-nowrap overflow-hidden items-center w-full h-full relative cursor-pointer">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .${containerClass} {
          display: flex;
          width: fit-content;
          animation: ${animationName} 60s linear infinite;
        }
        .group:hover .${containerClass} {
          animation-play-state: paused;
        }
      `}} />
      
      <div className={cn(containerClass, "flex items-center gap-20 lg:gap-32")} style={{ color: textColor }}>
        <div className="flex items-center">
          {fullItems.map((item, i) => renderItem(item, i))}
        </div>
        <div className="flex items-center">
          {fullItems.map((item, i) => renderItem(item, `dup-${i}`))}
        </div>
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

export default function SimpleCta({ data, headerTheme, className }: Props) {
  const [mediaCache, setMediaCache] = React.useState<Record<string, any>>({});
  const cfg = LAYOUT_CONFIG;
  const marqueeLinks = React.useMemo(() => extractMarqueeLinks(data?.marqueeContent), [data?.marqueeContent]);

  // 解析只有 ID 的图标
  React.useEffect(() => {
    const idsToFetch = marqueeLinks
      .filter((item: any) => item.iconId && !item.iconUrl && !mediaCache[item.iconId])
      .map((item: any) => item.iconId);

    if (idsToFetch.length === 0) return;

    const fetchMedia = async () => {
      const newCache: Record<string, any> = {};
      await Promise.all(
        idsToFetch.map(async (id: any) => {
          try {
            const res = await fetch(`/api/payload/media/${id}?depth=0`);
            if (res.ok) {
              const mediaData = await res.json();
              console.log(`[SimpleCta] Resolved media ${id}:`, mediaData);
              newCache[id] = mediaData;
            } else {
              console.error(`[SimpleCta] Failed to fetch media ${id}, status: ${res.status}`);
            }
          } catch (err) {
            console.error(`Failed to fetch marquee icon ${id}:`, err);
          }
        })
      );
      if (Object.keys(newCache).length > 0) {
        setMediaCache(prev => ({ ...prev, ...newCache }));
      }
    };

    fetchMedia();
  }, [marqueeLinks, mediaCache]);

  if (!data || !data.images) {
    return null;
  }

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
      className={cn("py-12 lg:py-[60px] bg-brand-main", className)}
      data-header-theme={headerTheme || "light"}
    >
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
            height: "48px",
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
          <MarqueeText
            direction="left"
            textColor="#756F3F"
            items={marqueeLinks}
            mediaCache={mediaCache}
          />
        </motion.div>

        {/* 上层装饰条 */}
        <motion.div
          className="absolute w-[120%] left-[-10%] flex items-center justify-center"
          style={{
            height: "48px",
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
          <MarqueeText
            direction="right"
            textColor="#FFFFFF"
            items={marqueeLinks}
            mediaCache={mediaCache}
          />
        </motion.div>
      </motion.div>

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
            <p className="font-montserrat font-normal text-base text-[#3C3C3C] leading-relaxed whitespace-pre-line">
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
                      "font-anaheim font-semibold flex items-center justify-center transition-colors duration-300 hover:bg-[#5C5731]",
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
            className="text-left shrink-0 mt-8"
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
                "font-montserrat font-normal whitespace-pre-line",
                cfg.text.description.fontSize,
                cfg.text.description.lineHeight,
                cfg.text.description.maxWidth,
                cfg.text.description.color,
                cfg.text.description.marginBottom,
              )}
            >
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
                      "font-anaheim font-semibold flex items-center justify-center transition-colors duration-300 hover:bg-[#5C5731]",
                      cfg.button.desktop.borderRadius,
                      cfg.button.desktop.fontSize,
                      cfg.button.desktop.width,
                      cfg.button.desktop.height,
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
