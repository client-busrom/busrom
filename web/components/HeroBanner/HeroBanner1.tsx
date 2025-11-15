// components/HeroBanner/HeroBanner1.tsx
import Image from "next/image";
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data"; // 确保路径正确
import { Locale } from "@/i18n.config"; // 确保路径正确
import { cn, getObjectPosition } from "@/lib/utils"; // 导入 cn 和 getObjectPosition

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner1 组件 ---
const HeroBanner1: FC<BannerProps> = ({ data, locale }) => {
  console.log(data);
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg"; // <-- 使用ImageObject.url
  const svgUrl: string = data.images[1]?.url || "/HeroBanner1.svg"; // 使用 data.images[1] 作为 SVG

  // 【新增】额外的图片路径
  const topLeftImageUrl: string = data.images[2]?.url || "/placeholder.jpg";

  return (
    <section className="relative w-full h-full overflow-hidden font-sans flex items-center justify-center text-center">
      {/* 背景图 */}
      <Image
        src={imageUrl}
        alt="背景图"
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
        style={{ objectPosition: getObjectPosition(data.images[1]) }}
      />

      {/* 示例尺寸，请根据需要调整 */}
      <Image
        src={topLeftImageUrl}
        alt="Decorative Top Left"
        fill
        sizes="100vw"
        className="object-cover z-10" // object-cover
        style={{ objectPosition: getObjectPosition(data.images[2]) }}
      />

      {/* 内容容器 */}
      <div className="relative z-30 flex flex-col items-center p-4">
        {" "}
        {/* 将内容容器的 z-index 提高，确保它在最上层 */}
        {/* Feature[1] - 顶部标语 */}
        <p className="font-regular font-paytone-one text-xl md:text-4xl text-[#FFBC5F] text-stroke-custom-orange mb-4">
          {data.features[1]}
        </p>
        {/* Feature[0] - 主标题 */}
        <h1 className="text-4xl w-[50%] md:text-6xl font-regular font-paytone-one text-[#000000] text-stroke-custom-light mb-8">
          {data.features[0]}
        </h1>
        {/* 三个特性 - 横向排布 */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-10">
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
            const words = feature.split(" ");
            const textWithNewlines = words.join("\n");
            return (
              <div
                key={index}
                className={cn("rounded-full border border-[#FDF6C2] bg-[#756F3F] px-4 py-2 md:px-6 md:py-3", "w-full", "text-center")}
              >
                <p className="text-sm md:text-base font-medium text-[#FDF6C2] whitespace-pre-line">{textWithNewlines}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
