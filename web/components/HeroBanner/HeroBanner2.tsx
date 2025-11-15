// components/HeroBanner/HeroBanner2.tsx
import Image from "next/image";
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data"; // Ensure path is correct
import { Locale } from "@/i18n.config"; // Ensure path is correct
import { getObjectPosition } from "@/lib/utils"; // Import getObjectPosition

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner2 Component ---
const HeroBanner2: FC<BannerProps> = ({ data, locale }) => {
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg";
  const svgUrl: string = "HeroBanner2.svg";
  const imageLargeUrl = data.images[1]?.url || "/placeholder.jpg";
  const imageSmallUrl = data.images[2]?.url || "/placeholder.jpg";

  const parallelogramClipPath = "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)";

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* Background Image */}
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
      {/* SVG 遮罩 */}
      <Image
        src={svgUrl}
        alt="mask"
        fill // 使用 fill
        sizes="100vw"
        className="object-cover z-10" // object-cover
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
              <Image
                src={imageLargeUrl}
                alt="Large feature image"
                fill
                sizes="(max-width: 768px) 70vw, 30vw"
                className="object-cover"
              />
            </div>
            {/* Small Image (Top Right, Overlapping) */}
            <div className="absolute top-1/3 left-[0%] w-1/2 h-1/2 rounded-xl overflow-hidden shadow-lg z-20 border-8 border-white"> {/* Optional border */}
              <Image
                src={imageSmallUrl}
                alt="Small feature image"
                fill
                sizes="(max-width: 768px) 45vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner2;