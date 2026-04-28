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
  headerTheme?: string;
  className?: string;
};

// 响应式布局配置
const LAYOUT = {
  container: "max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 2xl:px-[186px]",
  imageSection: "relative w-full lg:w-[calc(701*var(--rpx))] aspect-[631/767] lg:aspect-auto lg:h-[calc(852*var(--rpx))]",
  textSection: "w-full lg:w-[calc(597*var(--rpx))] text-left flex flex-col justify-center",
};

export default function SimpleCta({ data, headerTheme, className }: Props) {
  if (!data || !data.images) return null;

  const titleParts = data.title?.split(/\/n|\n/) || [];
  const firstLine = titleParts[0]?.trim() || "";
  const secondLine = titleParts.slice(1).map((s) => s.trim()).join(" ") || "";

  return (
    <section
      className={cn("pb-8 bg-brand-main overflow-hidden", className)}
      data-header-theme={headerTheme}
    >
      {/* 跑马灯带 */}
      <div className="w-full overflow-hidden">
        <LexicalRenderer content={data.marqueeContent} />
      </div>

      <div className={cn(LAYOUT.container, "mt-8 lg:mt-24 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-[calc(161*var(--rpx))]")}>
        
        {/* 左侧图片叠放区域 - 合并了移动端和桌面端逻辑 */}
        <div className={LAYOUT.imageSection}>
          {/* 米色背景装饰块 */}
          <div className="absolute bg-[#F2EEDF] z-0 rounded-lg top-[21%] left-[12%] w-[78%] aspect-[491/425] lg:top-[calc(184*var(--rpx))] lg:left-[calc(88*var(--rpx))] lg:w-[calc(546*var(--rpx))] lg:h-[calc(472*var(--rpx))]" />
          
          {/* 图片 1 - 上方大图 */}
          <div className="absolute z-20 top-0 left-[22%] w-[78%] lg:left-[calc(152*var(--rpx))] lg:w-[calc(549*var(--rpx))] lg:h-[calc(324*var(--rpx))] overflow-hidden rounded-[12px] lg:rounded-[20px] shadow-lg group">
            <OptimizedImage
              image={data.images[0]}
              alt={data.images[0]?.altText || "Image 1"}
              size="medium"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* 图片 2 - 左下 */}
          <div className="absolute z-30 bottom-[5%] left-0 w-[46%] lg:bottom-[calc(48*var(--rpx))] lg:w-[calc(326*var(--rpx))] lg:h-[calc(387*var(--rpx))] overflow-hidden rounded-[12px] lg:rounded-[20px] shadow-lg group">
            <OptimizedImage
              image={data.images[1]}
              alt={data.images[1]?.altText || "Image 2"}
              size="medium"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* 图片 3 - 右下 */}
          <div className="absolute z-30 bottom-0 left-[53%] w-[46%] lg:left-[calc(374*var(--rpx))] lg:w-[calc(327*var(--rpx))] lg:h-[calc(482*var(--rpx))] overflow-hidden rounded-[11px] lg:rounded-[19px] shadow-lg group">
            <OptimizedImage
              image={data.images[2]}
              alt={data.images[2]?.altText || "Image 3"}
              size="medium"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>

        {/* 右侧文本区域 */}
        <div className={LAYOUT.textSection}>
          <div className="space-y-4 lg:space-y-0">
            {firstLine && (
              <h3 className="font-anaheim font-bold text-3xl lg:text-4xl xl:text-[48px] 2xl:text-[58px] text-brand-text-black leading-tight 2xl:leading-[84px] lg:mb-[-10px]">
                {firstLine}
              </h3>
            )}
            {secondLine && (
              <h3 className="font-anaheim font-bold text-4xl lg:text-5xl xl:text-[72px] 2xl:text-[86px] text-brand-text-black leading-none 2xl:leading-[84px] lg:mb-[46px]">
                {secondLine}
              </h3>
            )}
            <h4 className="font-anaheim font-bold text-xl lg:text-2xl xl:text-[28px] 2xl:text-[32px] text-[#978350] leading-tight 2xl:leading-[27px] lg:mb-[86px] lg:whitespace-nowrap">
              {data.subtitle}
            </h4>
            <p className="font-montserrat font-normal text-base lg:text-lg xl:text-[20px] 2xl:text-[24px] text-[#3C3C3C] leading-relaxed 2xl:leading-[38px] lg:mb-[138px] whitespace-pre-wrap">
              {data.description}
            </p>
            
            <div className="pt-4 lg:pt-0">
              <Link href={data.ctaLink || "/contact-us"}>
                <Magnetic strength={0.2}>
                  <motion.div
                    className="origin-center inline-block"
                    animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                    whileHover={{ scale: 1.08, rotate: 0 }}
                    transition={{ rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" } }}
                  >
                    <Button className="font-anaheim font-semibold flex items-center justify-center rounded-[31px] w-[216px] h-[43px] text-sm lg:w-[288px] lg:h-[52px] lg:text-lg 2xl:w-[335px] 2xl:h-[61px] 2xl:text-[29px]">
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
