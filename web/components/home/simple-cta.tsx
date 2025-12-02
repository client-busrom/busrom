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

// --- 走马灯组件 ---
const MarqueeText = ({
  direction = "left",
  textColor = "white",
}: {
  direction?: "left" | "right";
  textColor?: string;
}) => {
  // 生成足够多的文字填满屏幕
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
      {/* 复制一份实现无缝滚动 */}
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

// --- 辅助占位符组件（使用 Padding Hack 确保高度）---
type ImagePlaceholderProps = {
  ratio: string;
  src: string;
  alt: string;
  className: string | undefined;
};

const ImagePlaceholder = ({ ratio, src, alt, className, image }: ImagePlaceholderProps & { image?: any }) => {
  const [w, h] = ratio.split("/").map(Number);
  const paddingBottom = ((h / w) * 100).toFixed(2) + "%";

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg shadow-lg", className)}
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
        className="object-cover absolute inset-0 w-full h-full"
      />
    </div>
  );
};
// --- 辅助占位符组件结束 ---

export default function SimpleCta({ data }: Props) {
  // Guard: if no data, don't render
  if (!data || !data.images) {
    return null;
  }

  return (
    <section className="py-8 bg-brand-main" data-header-theme="light">
      {/* --- 顶部装饰条（两条交叉的走马灯） --- */}
      <motion.div
        className="relative h-[180px] lg:h-[230px] w-full overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* 下层装饰条：浅米色，从左侧飞入，文字从左向右滚动 */}
        <motion.div
          className="absolute w-[120%] left-[-10%] flex items-center justify-center"
          style={{
            height: "32px",
            top: "50%",
            backgroundColor: "#EBE6D7",
            transformOrigin: "center center",
          }}
          variants={{
            hidden: {
              x: "-100%",
              rotate: 4.53,
              y: "-50%",
            },
            visible: {
              x: 0,
              rotate: 4.53,
              y: "-50%",
            },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MarqueeText direction="right" textColor="#756F3F" />
        </motion.div>

        {/* 上层装饰条：深橄榄绿，从右侧飞入，文字从右向左滚动 */}
        <motion.div
          className="absolute w-[120%] left-[-10%] flex items-center justify-center"
          style={{
            height: "32px",
            top: "50%",
            backgroundColor: "#756F3F",
            transformOrigin: "center center",
          }}
          variants={{
            hidden: {
              x: "100%",
              rotate: -2.78,
              y: "-50%",
            },
            visible: {
              x: 0,
              rotate: -2.78,
              y: "-50%",
            },
          }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <MarqueeText direction="left" textColor="#FFFFFF" />
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-4 -mt-8 lg:-mt-16">
        {/* 外层容器：移动端上下，桌面端左右 */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">

          {/* ==================================== */}
          {/* 左侧：图片布局区域 */}
          {/* ==================================== */}
          <div className="w-full lg:w-1/2 relative">
            {/*
              Figma 设计尺寸（基于 1920px）：
              - 图片区域整体：701 x 852px
              - Screen 图片：549 x 324px，位于左上
              - MainLayers 图片：326 x 387px，位于左下
              - EditContent 图片：327 x 482px，位于右下
              - 米色背景：546 x 472px

              按比例缩放到 lg (1024px) 基准
            */}

            {/* 移动端：与桌面端一致的错落布局 */}
            <div className="lg:hidden relative" style={{ aspectRatio: "701/700" }}>
              {/* 米色背景矩形 */}
              <div
                className="absolute bg-[#F2EEDF] z-0 rounded-lg"
                style={{
                  width: "60%",
                  aspectRatio: "546/400",
                  left: "12%",
                  top: "30%",
                }}
              />

              {/* Screen 图片 - 左上 */}
              <div
                className="absolute z-20"
                style={{
                  width: "72%",
                  left: "8%",
                  top: "0",
                }}
              >
                <ImagePlaceholder
                  ratio="549/324"
                  src=""
                  alt={data.images[0]?.altText || "Screen"}
                  className="rounded-[12px]"
                  image={data.images[0]}
                />
              </div>

              {/* MainLayers 图片 - 左下 */}
              <div
                className="absolute z-30"
                style={{
                  width: "44%",
                  left: "0",
                  bottom: "5%",
                }}
              >
                <ImagePlaceholder
                  ratio="326/387"
                  src=""
                  alt={data.images[1]?.altText || "MainLayers"}
                  className="rounded-[12px]"
                  image={data.images[1]}
                />
              </div>

              {/* EditContent 图片 - 右下 */}
              <div
                className="absolute z-30"
                style={{
                  width: "44%",
                  right: "0",
                  bottom: "0",
                }}
              >
                <ImagePlaceholder
                  ratio="327/482"
                  src=""
                  alt={data.images[2]?.altText || "EditContent"}
                  className="rounded-[12px]"
                  image={data.images[2]}
                />
              </div>
            </div>

            {/* 桌面端：绝对定位错落布局 */}
            <div className="hidden lg:block relative h-[500px] xl:h-[600px] 2xl:h-[700px]">
              {/* 米色背景矩形 */}
              <div
                className="absolute bg-[#F2EEDF] z-0"
                style={{
                  width: "65%",
                  aspectRatio: "546/472",
                  left: "10%",
                  top: "35%",
                }}
              />

              {/* Screen 图片 - 左上 */}
              <div
                className="absolute z-20"
                style={{
                  width: "70%",
                  left: "15%",
                  top: "0",
                }}
              >
                <ImagePlaceholder
                  ratio="549/324"
                  src=""
                  alt={data.images[0]?.altText || "Screen"}
                  className="rounded-[20px]"
                  image={data.images[0]}
                />
              </div>

              {/* MainLayers 图片 - 左下 */}
              <div
                className="absolute z-30"
                style={{
                  width: "42%",
                  left: "0",
                  bottom: "0",
                }}
              >
                <ImagePlaceholder
                  ratio="326/387"
                  src=""
                  alt={data.images[1]?.altText || "MainLayers"}
                  className="rounded-[20px]"
                  image={data.images[1]}
                />
              </div>

              {/* EditContent 图片 - 右下 */}
              <div
                className="absolute z-30"
                style={{
                  width: "42%",
                  right: "0",
                  bottom: "-5%",
                }}
              >
                <ImagePlaceholder
                  ratio="327/482"
                  src=""
                  alt={data.images[2]?.altText || "EditContent"}
                  className="rounded-[20px]"
                  image={data.images[2]}
                />
              </div>
            </div>
          </div>

          {/* ==================================== */}
          {/* 右侧：文本区域 */}
          {/* ==================================== */}
          <div className="w-full lg:w-1/2 text-left space-y-4 lg:space-y-6 pl-4 lg:pl-8">
            {/* Ready to Start - 64px in Figma */}
            <h3 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-[64px] font-anaheim font-bold text-brand-text-black leading-tight">
              {data.title}
            </h3>

            {/* Your Project? - 96px in Figma (更大) */}
            <h3 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-[96px] font-anaheim font-bold text-brand-text-black leading-none -mt-2">
              {data.title2}
            </h3>

            {/* Let's Build Something Exceptional! - 36px, 棕黄色 */}
            <h4 className="text-xl lg:text-2xl xl:text-3xl 2xl:text-[36px] font-anaheim font-bold text-[#978350] leading-tight">
              {data.subtitle}
            </h4>

            {/* 描述文字 - 32px, 行高 53px */}
            <p className="text-base lg:text-lg xl:text-xl 2xl:text-[32px] text-[#3C3C3C] font-anaheim font-normal leading-relaxed 2xl:leading-[53px] max-w-[600px]">
              {data.description}
            </p>

            {/* CTA 按钮 - 372x68px, 圆角 34px */}
            <div className="pt-4 lg:pt-8">
              <Link href="/contact">
                {/* 移动端：呼吸效果 */}
                <motion.div
                  className="lg:hidden"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Button
                    className="rounded-full font-anaheim font-semibold text-lg px-8 py-4 h-auto"
                    size="lg"
                  >
                    {data.buttonText}
                  </Button>
                </motion.div>

                {/* 桌面端：铃响效果，悬停时呼吸效果 */}
                <motion.div
                  className="hidden lg:block origin-center"
                  style={{ transformOrigin: "50% 50%" }}
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{
                    rotate: [0, -3, 3, -3, 3, 0],
                  }}
                  whileHover={{
                    rotate: 0,
                    scale: [1, 1.05, 1],
                    transition: {
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    },
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
                    className="rounded-full font-anaheim font-semibold text-xl 2xl:text-[32px] px-12 py-6 2xl:px-16 2xl:py-8 h-auto"
                    size="lg"
                  >
                    {data.buttonText}
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
