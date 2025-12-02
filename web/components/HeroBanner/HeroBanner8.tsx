// components/HeroBanner/HeroBanner8.tsx
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

// --- HeroBanner8 Component ---
const HeroBanner8: FC<BannerProps> = ({ data, locale }) => {
  const svgUrl: string = "/HeroBanner8.svg";

  // --- Split Feature[0] ---
  const feature0Text = data.features[0] || "";
  const words = feature0Text.split("\n");

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
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

      <div className="absolute top-16 md-24 lg:top-36 right-0 z-20"> {/* 控制垂直位置 */}
        <div className="bg-[#665F1F] text-[#FEFFD8] rounded-l-full px-6 py-3 md:py-6 w-full text-right"> {/* 限制最大宽度 */}
          <p className="text-2xl md:text-4xl font-paytone-one font-regular">
            {data.features[1]}
          </p>
        </div>
      </div>

      {/* Layer 3: Content Grid (z-20) */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-[40%_60%] h-full w-full items-stretch px-8 md:px-16 lg:px-24">

        {/* --- Left Column (40%) --- */}
        <div className="flex flex-col justify-center items-start h-full py-8 md:py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-regular font-paytone-one leading-tight text-stroke-custom-light">
              <div className="text-[#433E12]">{words[0]}</div>
              <div className="text-white">{words[1]}</div>
          </h1>

          {/* Bottom: Feature Stack [2,3,4] */}
          <div className="space-y-3 w-full max-w-sm mt-8 md:mt-24">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFFB1B]/20 border border-[#CFBC37] rounded-lg px-4 py-2"
              >
                <p className="text-lg md:text-2xl font-phudu font-semibold text-[#CFBC37] text-stroke-custom-gold text-left">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Column (60%) --- */}
         {/* (内部 padding 可能需要微调) */}
        <div className="relative flex flex-col justify-between items-end h-full py-8 md:py-16">

          {/* Bottom: Three Images */}
          {/* (现在会更靠近右边缘) */}
          <div className="absolute md:right-[-10%] bottom-[15%] flex gap-2 md:gap-4 w-full mt-8">
            {/* Image 1 Wrapper */}
            <div className="relative flex-1 w-64 h-56 rounded-[34px] border-[3px] lg:border-[6px] border-white overflow-hidden">
              <OptimizedImage image={data.images[1]} alt="Feature image 1" size="medium" className="absolute inset-0 w-full h-full object-cover" />
            </div>
             {/* Image 2 Wrapper */}
            <div className="relative flex-1 w-64 h-56 rounded-[34px] border-[3px] lg:border-[6px] border-white overflow-hidden">
              <OptimizedImage image={data.images[2]} alt="Feature image 2" size="medium" className="absolute inset-0 w-full h-full object-cover" />
            </div>
             {/* Image 3 Wrapper */}
            <div className="relative flex-1 w-64 h-56 rounded-[34px] border-[3px] lg:border-[6px] border-white overflow-hidden">
              <OptimizedImage image={data.images[3]} alt="Feature image 3" size="medium" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner8;