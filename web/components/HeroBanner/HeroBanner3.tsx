// components/HeroBanner/HeroBanner3.tsx
import Image from "next/image";
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data"; // Ensure path is correct
import { Locale } from "@/i18n.config"; // Ensure path is correct
import { cn, getObjectPosition } from "@/lib/utils"; // Import cn and getObjectPosition

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner3 Component ---
const HeroBanner3: FC<BannerProps> = ({ data, locale }) => {
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg"; // <-- Confirm base path
  // Image paths for the right column
  const image1Url = data.images[1]?.url || "/placeholder.jpg";// Adjust paths - ensure base path if necessary
  const image2Url = data.images[2]?.url || "/placeholder.jpg";
  const image3Url = data.images[3]?.url || "/placeholder.jpg";

  // --- Split Feature[1] ---
  const feature1Text = data.features[1] || "";
  const feature1Words = feature1Text.split(" ");
  const feature1LastWord = feature1Words.pop() || "";
  const feature1Rest = feature1Words.join(" ");

  // --- Feature Stack Colors ---
  const featureBgColors = ["#F98538", "#FFF5AD", "#F98538"];
  const featureTextColors = ["#FFF5AD", "#756F3F", "#FFF5AD"];

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* 背景图 (z-0) */}
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
      {/* SVG 遮罩 (z-10) */}
      <Image
        src="/HeroBanner3.svg" // Changed SVG name
        alt="mask"
        fill
        sizes="100vw"
        className="object-cover z-10 pointer-events-none"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />

      <div className="absolute inset-y-0 right-0 w-[650px] h-full hidden lg:block z-20 pointer-events-none"> {/* 示例宽度 */}
        <div className="absolute inset-y-0 left-0 w-[31%] rounded-b-full overflow-hidden">
           <Image src={image1Url} alt="Feature image 1" fill sizes="238px" className="object-cover" /> {/* 768 * 0.31 */}
        </div>
        <div className="absolute inset-y-0 left-[34.5%] w-[31%] rounded-t-full overflow-hidden z-10">
           <Image src={image2Url} alt="Feature image 2" fill sizes="238px" className="object-cover" /> {/* 768 * 0.31 */}
        </div>
        <div className="absolute inset-y-0 right-0 w-[31%] rounded-b-full overflow-hidden">
           <Image src={image3Url} alt="Feature image 3" fill sizes="238px" className="object-cover" /> {/* 768 * 0.31 */}
        </div>
      </div>

      {/* --- 内容 Grid 容器 (z-30) --- */}
      <div className="relative z-30 container mx-auto grid grid-cols-1 md:grid-cols-2 h-full items-center gap-8 md:gap-16 lg:gap-24 px-24">

        {/* --- 左侧文本列 --- */}
        <div className="flex flex-col justify-center h-full text-left">
          {/* Feature[1] */}
          <p className="text-xl lg:text-4xl md:text-3xl font-regular text-[#000000] ml-6 mb-8">
            {feature1Rest}{" "}
            <span className="text-[#F98538]">{feature1LastWord}</span>
          </p>
          {/* Feature[0] */}
          <h1 className="text-4xl lg:text-7xl md:text-6xl font-poller-one font-regular text-stroke-custom-light text-[#332E0B] mb-12">
            {data.features[0]}
          </h1>
          {/* Feature Stack */}
          <div className="space-y-4 max-w-sm">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "px-3 py-3 rounded-full",
                  "md:text-lg font-pingfang font-semibold text-center"
                )}
                style={{
                  backgroundColor: featureBgColors[index % featureBgColors.length],
                  color: featureTextColors[index % featureTextColors.length]
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner3;