// components/HeroBanner/HeroBanner9.tsx
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { FC } from "react";
import Image from "next/image";
import { cn, getObjectPosition } from "@/lib/utils"; // 假设您有 cn 实用工具

// ------------------------------------------------------------------
// 类型定义
// ------------------------------------------------------------------
type BannerProps = {
  data: HomeContent["heroBanner"][number];
  locale: Locale;
  // 假设父组件传入 className
  className?: string; 
};

// ------------------------------------------------------------------
// 样式常量
// ------------------------------------------------------------------
const TEXT_DARK = "#3C3712"; // 右上角文字颜色
const TEXT_ACCENT = "#FFA836"; // 左下角 Feature[0] 颜色

const BLOCK_SVGS = [
    'bannerBlock1.svg',
    'bannerBlock2.svg',
    'bannerBlock3.svg',
];

// ------------------------------------------------------------------
// 辅助组件：右侧特色块
// ------------------------------------------------------------------

type FeatureBlockProps = {
    feature: string;
    bgColor: string;
    textColor: string;
    className?: string;
    bgImageUrl?: string;
};

const FeatureBlock: FC<FeatureBlockProps> = ({ feature, bgColor, textColor, className, bgImageUrl }) => (
    <div className={cn(
        "relative p-4 flex flex-col justify-center h-[100px]", 
        className
    )}>
        {/* 背景 SVG 遮罩/图 (如果存在) */}
        {bgImageUrl && (
            <div className="absolute inset-0 z-0">
                <Image
                    src={bgImageUrl}
                    alt="Background Block"
                    fill
                    className="object-fit"
                />
            </div>
        )}
        
        <div className="px-2 mt-4 z-10">
             <h3 className="text-4xl lg:text-5xl font-paytone-one text-stroke-custom-light font-regular" style={{ color: textColor }}>
                {feature}
             </h3>
        </div>
    </div>
);


// ------------------------------------------------------------------
// 主组件：HeroBanner9
// ------------------------------------------------------------------

const HeroBanner9: FC<BannerProps> = ({ data, locale, className }) => {
  const title = data.title || "Banner Title";
  const words = data.features[0].split("\n");

  // 假设 data.image 包含背景图 URL，data.mask 包含遮罩 SVG URL
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg";
  const svgUrl: string = "HeroBanner9.svg";

  return (
    // 确保根元素 w-full h-full 继承父组件 HeroBanner 的尺寸
    <div className={cn("relative w-full h-full overflow-hidden", className)}>

      {/* Layer 1: Background Image (z-0) */}
      <Image
        src={imageUrl}
        alt="Background"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover z-0"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
        priority
      />

        {/* 遮罩 SVG */}
      {/* Layer 2: SVG Mask (z-10) */}
      <Image
        src={svgUrl}
        alt="Mask"
        fill
        sizes="100vw"
        className="object-cover z-10 pointer-events-none" // Adjust object-position if needed
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />

      {/* --- 2. 布局主体 (容器) --- */}
      <div className="container mx-auto relative z-10 h-full flex">
        <div className="ml-auto w-full max-w-[400px] flex flex-col justify-start lg:justify-between py-12 lg:py-12">
            
            <div className="grid grid-rows-3 gap-2 mb-8">
              {words.map((feature, index) => (
                <FeatureBlock
                        key={index}
                        feature={feature}
                        bgColor="bg-white/70"
                        textColor={TEXT_DARK}
                        bgImageUrl={BLOCK_SVGS[index % 3]} // 循环使用背景 SVG
                    />
              ))}
                    
            </div>

            {/* 2. 右下方：feature[1] */}
            <h1 className="text-brand-text-inverse text-stroke-custom-white font-paytone-one font-regular text-2xl md:text-3xl lg:text-4xl text-left">{data.features[1]}</h1>
            
        </div>

      </div>

      {/* --- A. 左侧内容 (左下角绝对定位) --- */}
      <div className="absolute bottom-[-106px] left-[144px] z-20">
        {/* 1. 旋转的图片容器 */}
        <div className="relative w-[320px] h-[320px] transform -rotate-45 origin-bottom-left
                      rounded-[80px] shadow-2xl overflow-hidden flex-shrink-0">
            {/* ⬅️ 图片本身：应用 rotate-45 抵消外部容器的旋转，使其保持正直 */}
            <Image
                src={data.images[1]?.url || "/placeholder.jpg"}
                alt="Product Focus"
                fill
                className="object-cover transform rotate-45 scale-[1.4]" // 旋转45度抵消，并略微放大以覆盖边缘
            />
              {/* 底部遮挡：由于 origin-bottom-left，图片上半部分会被外部 div 裁剪，符合需求 */}
        </div>
      </div>

        {/* 2. 左侧文字 Feature[0] */}
        <div className="absolute bottom-[80px] left-[360px] space-y-2 z-30">
            <h2 className="text-lg md:text-2xl font-paytone-one font-regular" style={{ color: TEXT_ACCENT }}>
                {data.features[2]}
            </h2>
            <h2 className="text-lg md:text-2xl font-paytone-one font-regular" style={{ color: TEXT_ACCENT }}>
                {data.features[3]}
            </h2>
            <h2 className="text-lg md:text-2xl font-paytone-one font-regular" style={{ color: TEXT_ACCENT }}>
                {data.features[4]}
            </h2>
        </div>
    </div>
  );
}

export default HeroBanner9;