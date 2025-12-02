// components/HeroBanner/HeroBanner2.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { getObjectPosition } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner2 Component ---
const HeroBanner2: FC<BannerProps> = ({ data, locale }) => {
  const svgUrl: string = "/HeroBanner2.svg";

  const parallelogramClipPath = "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)";

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* Background Image */}
      <OptimizedImage
        image={data.images[0]}
        alt="Background"
        size="xlarge"
        className="absolute inset-0 w-full h-full object-cover z-0"
        objectPosition={getObjectPosition(data.images[0])}
        priority
      />
      {/* SVG 遮罩 */}
      <Image
        src={svgUrl}
        alt="mask"
        fill
        sizes="100vw"
        className="object-cover z-10"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />

      {/* Content Grid Container */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full items-center gap-8 p-16 md:p-24">
        
        {/* --- Left Column --- */}
        <div className="flex flex-col justify-center h-full text-left">
          {/* Feature[1] - Top Text */}
          <p className="text-3xl lg:text-6xl md:text-5xl font-paytone-one font-regular text-[#000000] text-stroke-custom-light mb-8">
            {data.features[0]}
          </p>

          {/* Feature Stack (Parallelograms with Transparency Gradient) */}
          <div className="space-y-4">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
              // 定义透明度蒙版的样式
              const transparencyMaskStyle = {
                maskImage: 'linear-gradient(to right, black 0%, transparent 100%)', // 左黑 (不透明) -> 右透明
                WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)', // Safari 兼容
              };

              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-[#5A4F0E] to-[#C0A91D] px-6 py-3" // 保留颜色渐变
                  style={{
                    clipPath: parallelogramClipPath, // 保留形状
                    ...transparencyMaskStyle        // 应用透明度蒙版
                  }} 
                >
                  <p className="text-base md:text-lg font-medium text-[#FFF5AD] pl-4">
                    {feature}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Right Column --- */}
        <div className="flex flex-col justify-center h-full text-left md:text-right items-end">
          {/* Feature[0] - Top Title */}
          <h1 className="text-2xl md:text-4xl font-paytone-one font-regular text-white mb-4 md:mb-6">
            {data.features[1]}
          </h1>

          <div className="relative w-full max-w-lg h-64 md:h-80 lg:h-96">
            {/* Large Image (Bottom Left) */}
            <div className="absolute bottom-0 right-[0%] w-4/5 h-4/5 rounded-xl overflow-hidden shadow-lg z-10 border-8 border-white">
              <OptimizedImage
                image={data.images[1]}
                alt="Large feature image"
                size="large"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {/* Small Image (Top Right, Overlapping) */}
            <div className="absolute top-1/3 left-[0%] w-1/2 h-1/2 rounded-xl overflow-hidden shadow-lg z-20 border-8 border-white">
              <OptimizedImage
                image={data.images[2]}
                alt="Small feature image"
                size="medium"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner2;