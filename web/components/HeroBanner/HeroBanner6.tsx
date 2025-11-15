// components/HeroBanner/HeroBanner1.tsx
import Image from "next/image";
import type { FC, ReactNode } from "react";
import type { HomeContent } from "@/lib/content-data"; // 确保路径正确
import { Locale } from "@/i18n.config"; // 确保路径正确
import { cn, getObjectPosition } from "@/lib/utils"; // 导入 cn 和 getObjectPosition

// --- BannerProps 定义 ---
// 假设 data prop 接收 homeContent.heroBanner 数组中的一项
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- FeaturePill 辅助组件 (保持不变) ---
interface FeaturePillProps {
  children: ReactNode;
}
const FeaturePill: FC<FeaturePillProps> = ({ children }) => (
  <div
    className={cn( // 使用 cn
      "flex items-center justify-end",
      "text-[#FFF5AD] font-pingfang font-semibold tracking-[2px]",
      "text-sm sm:text-sm md:text-lg",
      "bg-[#756F3F] rounded-full px-6 py-3",
      "origin-bottom-left shadow-lg",
      "min-w-[400px]",
      "rotate-[-60deg]"
    )}
  >
    {children}
  </div>
);

// --- HeroBanner1 组件 ---
const HeroBanner6: FC<BannerProps> = ({ data, locale }) => {
  // 【已修改】从 data 获取图片路径 (假设需要添加基础路径)
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg";
  const svgUrl: string = "HeroBanner6.svg"; // 保持不变

  // --- 拆分标题 ---
  // 简单的按第一个空格拆分，如果标题格式固定
  const fullFeatureTitle = data.features[0] || ""; // 获取第一个 feature 字符串
  const words = fullFeatureTitle.split("\n");     // 分割成所有单词
  const titleLine1 = words[0] || "";             // 第一个单词作为第一行
  // 从第二个单词开始，获取剩余所有单词，并用空格连接
  const titleLine2 = words.slice(1).join(" ");   // 剩余单词作为第二行
  // 如果需要更复杂的拆分，可以在这里添加逻辑

  return (
    // 【已修改】移除 absolute, 使用 h-full w-full
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* 背景图 */}
      <Image
        src={imageUrl}
        alt="背景图"
        fill // 使用 fill 替代 layout="fill" objectFit="cover"
        sizes="100vw" // fill 时建议提供 sizes
        quality={90}
        className="object-cover z-0" // object-cover
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
        priority // 首屏 Banner 建议添加 priority
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

      {/* 内容容器 */}
      <div className="relative z-20 h-full flex">
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start pt-[76px]">
          {/* 右上角标语 */}
          <div className="w-72 flex justify-end bg-gradient-to-l from-white to-[#FFDE95] rounded-r-full px-5 py-2 shadow-md">
            <p className="font-arial font-bold italic text-[#754600] text-sm sm:text-sm md:text-lg">
              {/* 【已修改】从 data.features 获取 */}
              {data.features[1]}
            </p>
          </div>

          {/* 主标题 */}
          <div className="mt-[30px] text-stone-800 p-2 sm:p-4 md:px-8 ">
            <h1 className="leading-tight text-stroke-custom text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-poller-one font-normal">
              {/* 【已修改】使用拆分后的标题 */}
              {titleLine1}
            </h1>
            <h1 className="text-stroke-custom-light text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#332E0B] font-poller-one font-normal leading-tight drop-shadow-sm">
              {/* 【已修改】使用拆分后的标题 */}
              {titleLine2}
            </h1>
          </div>

          {/* 底部倾斜标签 */}
          {/* 【已修改】稍微调整定位以适应 h-full */}
          <div className="absolute -bottom-16 md:-bottom-16 left-4 md:left-4 z-20 flex flex-row space-x-[-260px]">
            {/* 【已修改】从 data.features 获取 */}
            <FeaturePill>{data.features[2]}</FeaturePill>
            <FeaturePill>{data.features[3]}</FeaturePill>
            <FeaturePill>{data.features[4]}</FeaturePill>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner6;