// components/HeroBanner/HeroBanner7.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { cn, getObjectPosition } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner7 Component ---
const HeroBanner7: FC<BannerProps> = ({ data, locale }) => {
  const svgUrl: string = "/HeroBanner7.svg";

  // --- Split Feature[0] ---
  const feature0Text = data.features[0] || "";
  const words = feature0Text.split("\n");
  const titleLine1 = words[0];
  const titleLine2 = words[1];

  // --- Common styles for rotated divs ---
  // Responsive border and rounding from previous example
  const rotatedDivBaseClasses = cn(
    "absolute overflow-hidden z-20 rotate-45",
    "border-[4px] md:border-[7px] lg:border-[10px] border-[#756F3F]",
  );
  // Responsive sizing (example, adjust as needed)
  const rotatedDivSizeClasses = "w-80 h-80";
  const ovalClipId = "ovalClipHero7"; // 唯一 ID

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* 【新增】椭圆 clipPath */}
          {/* 使用 ellipse 和 objectBoundingBox 可以简单创建填满元素的椭圆 */}
          <clipPath id={ovalClipId} clipPathUnits="objectBoundingBox">
             <ellipse cx="0.5" cy="0.5" rx="0.5" ry="0.5" />
             {/* cx/cy=0.5 (中心), rx/ry=0.5 (半径为一半) */}
          </clipPath>
        </defs>
      </svg>
      {/* Layer 1: Background Image (z-0) */}
      <OptimizedImage
        image={data.images[0]}
        alt="Background"
        size="xlarge"
        className="absolute inset-0 w-full h-full object-cover z-0"
        objectPosition={getObjectPosition(data.images[0])}
        priority
      />
      {/* Layer 2: SVG Mask (z-10) */}
      <Image
        src={svgUrl}
        alt="Mask"
        fill
        sizes="100vw"
        className="object-cover z-10 pointer-events-none"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />

      {/* Layer 3: Rotated Image Divs (z-20) */}
      {/* Top Rotated Div */}
      <div
        className={cn(
          rotatedDivBaseClasses,
          rotatedDivSizeClasses,
          "rounded-[60px] top-[-8%] left-[38%] transform -translate-x-1/2"
        )}
      >
        <div className="relative w-full h-full">
          <OptimizedImage image={data.images[1]} alt="Top rotated image" size="large" className="absolute inset-0 w-full h-full object-cover -rotate-45 scale-150" />
        </div>
      </div>
      {/* Bottom Rotated Div */}
      <div
        className={cn(
          rotatedDivBaseClasses,
          rotatedDivSizeClasses,
          "rounded-[60px] bottom-[-6%] left-[39%] transform -translate-x-1/2"
        )}
      >
         <div className="relative w-full h-full">
          <OptimizedImage image={data.images[3]} alt="Bottom rotated image" size="large" className="absolute inset-0 w-full h-full object-cover -rotate-45 scale-150" />
        </div>
      </div>
      {/* Middle Rotated Div */}
      <div
        className={cn(
          rotatedDivBaseClasses,
          "w-48 h-48 rounded-[60px]",
          "top-[49%] left-[48%] transform -translate-x-1/2 -translate-y-1/2"
        )}
      >
         <div className="relative w-full h-full">
          <OptimizedImage image={data.images[2]} alt="Middle rotated image" size="medium" className="absolute inset-0 w-full h-full object-cover -rotate-45 scale-150" />
        </div>
      </div>


      {/* Layer 4: Content Grid (z-30) */}
      <div className="relative z-30 container mx-auto grid grid-cols-1 md:grid-cols-2 h-full w-full items-center p-8 md:p-16 lg:px-16">

        {/* --- Left Column (Feature[1] at bottom) --- */}
        <div className="flex flex-col justify-end items-start h-full pb-8 md:pb-16 w-2/3">
          <p className="text-2xl md:text-4xl font-paytone-one font-regular text-white text-stroke-custom-white">
            {data.features[1]}
          </p>
        </div>

        <div className="flex flex-col justify-center h-full items-center py-8 md:py-16 md:pl-16 lg:pl-36"> 

          {/* Top: Feature[0] */}
          <h1 className="text-left text-4xl md:text-6xl font-paytone-one font-regular text-stroke-black text-[#FFFFFF] leading-tight"> 
            <div>{titleLine1}</div>
            <div className="text-[#433E12]">{titleLine2}</div>
          </h1>

          {/* Bottom: Feature Stack (Oval shapes) */}
          <div className="space-y-6 w-fit mt-16"> 
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#E9E2A0] px-10 py-5 flex items-center justify-center" 
                style={{ clipPath: `url(#${ovalClipId})` }} 
              >
                <p className="text-sm md:text-base font-pingfang font-semibold text-[#000000]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner7;