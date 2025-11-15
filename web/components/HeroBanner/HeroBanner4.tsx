// components/HeroBanner/HeroBanner4.tsx
import Image from "next/image";
import type { FC } from "react";
// 确保 HomeContent 和 Locale 的导入路径正确
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { cn, getObjectPosition } from "@/lib/utils"; // 导入 cn 和 getObjectPosition

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner4 组件 ---
const HeroBanner4: FC<BannerProps> = ({ data, locale }) => {
  // --- 图片路径 ---
  const imageUrl: string = data.images[0]?.url || "/placeholder.jpg";
  const svgUrl: string = "/HeroBanner4.svg"; // 假设的 SVG 遮罩
  const image1Url = data.images[1]?.url || "/placeholder.jpg";
  const image2Url = data.images[2]?.url || "/placeholder.jpg";
  const image3Url = data.images[3]?.url || "/placeholder.jpg";

  // --- 拆分 Feature[0] (保持不变) ---
  const feature0Text = data.features[0] || "";
  const feature0Words = feature0Text.split("\n");
  const feature0FirstPart = feature0Words[0];
  const feature0SecondPart = feature0Words[1];

  // --- Feature Stack (左侧文本) 颜色 (保持不变) ---
  const featureBgColor = "#FFD978";
  const featureTextColor = "#000000";

  // --- 【已更新】SVG clipPath 定义 ---
  const borderColor = "#CDC094"; // 边框颜色
  const borderWidth = "4px"; // 边框宽度
  const clipPathId = `trapezoidClipHero4`; // 唯一 ID

  // 【已更新】使用您提供的 path 数据
  const svgPathData =
    "M2.45086 41.8012C-6.01835 22.0071 8.50246 0 30.0322 0H261.26C273.273 0 284.127 7.16624 288.847 18.2132L609.712 769.213C618.168 789.006 603.648 811 582.125 811H351.36C339.353 811 328.502 803.84 323.779 792.801L2.45086 41.8012Z";

  // 【已更新】根据 613x811 更新缩放因子
  const scaleX = 1 / 613; // ≈ 0.001631
  const scaleY = 1 / 811; // ≈ 0.001233
  const svgTransform = `scale(${scaleX.toFixed(6)} ${scaleY.toFixed(6)})`;

  // --- 【新增】Feature Stack 的 SVG clipPath 定义 ---
  const featureStackClipId = `featureStackClip`; // 新的 ID
  // 【新增】使用您提供的 path 数据
  const featureStackSvgPathData =
    "M1.6745 25.535C-3.8235 13.609 4.8885 0 18.0215 0H493.242C500.266 0 506.649 4.08603 509.589 10.465L535.633 66.965C541.131 78.891 532.419 92.5 519.286 92.5H44.0655C37.0415 92.5 30.6585 88.414 27.7185 82.035L1.6745 25.535Z";
  // 【新增】根据 538x93 更新缩放因子
  const featureStackScaleX = 1 / 538; // ≈ 0.0018587
  const featureStackScaleY = 1 / 93; // ≈ 0.0107527
  const featureStackSvgTransform = `scale(${featureStackScaleX.toFixed(7)} ${featureStackScaleY.toFixed(7)})`;

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* --- SVG 定义 (隐藏在布局外) --- */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox" transform={svgTransform}>
            <path d={svgPathData} /> {/* <-- 使用您提供的路径 */}
          </clipPath>
          {/* 【新增】左侧 Feature Stack 的形状 */}
          <clipPath id={featureStackClipId} clipPathUnits="objectBoundingBox" transform={featureStackSvgTransform}>
             <path d={featureStackSvgPathData} />
          </clipPath>
        </defs>
      </svg>
      {/* 背景图 (z-0) */}
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
      {/* SVG 遮罩 (z-10) */}
      <Image
        src={svgUrl}
        alt="mask"
        fill
        sizes="100vw"
        className="object-cover z-10 pointer-events-none"
        style={{ objectPosition: getObjectPosition(data.images[0]) }}
      />
      <div className="absolute inset-y-0 right-0 w-[1000px] h-full hidden lg:block z-20 pointer-events-none">
        {/* --- 图片 1 (高) --- */}
        {/* 【已修改】移除 inset-y-0, 添加 top-0 bottom-[10%] */}
        <div
          className="absolute left-0 w-[40%] top-[5%] bottom-[25%]"
          style={{ backgroundColor: borderColor, clipPath: `url(#${clipPathId})` }}
        >
          <div className="absolute overflow-hidden" style={{ inset: borderWidth, clipPath: `url(#${clipPathId})` }}>
            <Image src={image1Url} alt="Feature image 1" fill sizes="200px" className="object-cover" />
          </div>
        </div>

        {/* --- 图片 2 (低) --- */}
        {/* 【已修改】移除 inset-y-0, 添加 top-[15%] bottom-0 */}
        <div
          className="absolute left-[30%] w-[40%] top-[20%] bottom-[10%] z-10"
          style={{ backgroundColor: borderColor, clipPath: `url(#${clipPathId})` }}
        >
          <div className="absolute overflow-hidden" style={{ inset: borderWidth, clipPath: `url(#${clipPathId})` }}>
            <Image src={image2Url} alt="Feature image 2" fill sizes="200px" className="object-cover" />
          </div>
        </div>

        {/* --- 图片 3 (高) --- */}
        {/* 【已修改】移除 inset-y-0, 添加 top-0 bottom-[10%] */}
        <div
          className="absolute left-[50%] w-[40%] top-[5%] bottom-[25%]"
          style={{ backgroundColor: borderColor, clipPath: `url(#${clipPathId})` }}
        >
          <div className="absolute overflow-hidden" style={{ inset: borderWidth, clipPath: `url(#${clipPathId})` }}>
            <Image src={image3Url} alt="Feature image 3" fill sizes="200px" className="object-cover" />
          </div>
        </div>
      </div>
      {/* --- 主要内容网格容器 (z-30) --- */}
      <div className="relative z-30 container mx-auto grid grid-cols-1 lg:grid-cols-2 h-full w-full items-center">
        <div className="flex flex-col justify-center h-full p-8 md:p-16 lg:px-16 max-w-xl lg:max-w-none text-left">
          {/* Feature[1] */}
          <p className="font-regular font-paytone-one text-xl md:text-2xl text-white text-stroke-custom-white mb-8">{data.features[1]}</p>
          {/* Feature[0] */}
          <h1 className="text-4xl md:text-6xl font-paytone-one font-regular mb-12">
            <div className="text-[#FFB800] text-stroke-custom-light">{feature0FirstPart}</div>
            {feature0SecondPart && <div className="text-[#000000] text-stroke-custom-light"> {feature0SecondPart}</div>}
          </h1>
          {/* Feature Stack (阶梯状排列) */}
          <div className="w-full max-w-md">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
              // 根据 index 确定 margin-left
              let marginLeftClass = "";
              if (index === 1) {
                marginLeftClass = "md:ml-8"; // 第二个 item 右移 (只在 md 及以上生效)
              } else if (index === 2) {
                marginLeftClass = "md:ml-16"; // 第三个 item 再右移 (只在 md 及以上生效)
              }

              return (
                <div
                  key={index}
                  // 【已修改】添加 mb-4 和 marginLeftClass
                  className={cn(
                    "bg-[#FFD978] px-8 h-12 flex items-center justify-start", // 固定高度和 flex 布局
                    "mb-4", // 添加底部间距
                    marginLeftClass // 添加条件性的左边距
                  )}
                  style={{ clipPath: `url(#${featureStackClipId})` }} // 应用 SVG clipPath
                >
                  <p className="font-pingfang md:text-lg font-semibold text-[#000000] text-left">
                    {feature}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        {/* --- 右侧文本列 (占位) --- */}
        <div className="relative h-full hidden md:block"></div> {/* (保持不变) */}
      </div>{" "}
      {/* <-- 主要内容网格容器结束 */}
    </section>
  );
};

export default HeroBanner4;
