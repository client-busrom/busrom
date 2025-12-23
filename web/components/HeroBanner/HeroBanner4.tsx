// components/HeroBanner/HeroBanner4.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// --- HeroBanner4 组件 ---
const HeroBanner4: FC<BannerProps> = ({ data, locale }) => {
  // --- 拆分 Feature[0] ---
  const feature0Text = data.features[0] || "";
  const feature0Words = feature0Text.split("\n");
  const feature0FirstPart = feature0Words[0];
  const feature0SecondPart = feature0Words[1];

  // --- SVG clipPath 定义 (右侧平行四边形图片) ---
  const clipPathId = `trapezoidClipHero4`;
  const svgPathData =
    "M2.45086 41.8012C-6.01835 22.0071 8.50246 0 30.0322 0H261.26C273.273 0 284.127 7.16624 288.847 18.2132L609.712 769.213C618.168 789.006 603.648 811 582.125 811H351.36C339.353 811 328.502 803.84 323.779 792.801L2.45086 41.8012Z";
  const scaleX = 1 / 613;
  const scaleY = 1 / 811;
  const svgTransform = `scale(${scaleX.toFixed(6)} ${scaleY.toFixed(6)})`;

  // --- Feature Stack 的 SVG clipPath 定义 (平行四边形) ---
  const featureStackClipId = `featureStackClip`;
  const featureStackSvgPathData =
    "M1.6745 25.535C-3.8235 13.609 4.8885 0 18.0215 0H493.242C500.266 0 506.649 4.08603 509.589 10.465L535.633 66.965C541.131 78.891 532.419 92.5 519.286 92.5H44.0655C37.0415 92.5 30.6585 88.414 27.7185 82.035L1.6745 25.535Z";
  const featureStackScaleX = 1 / 538;
  const featureStackScaleY = 1 / 93;
  const featureStackSvgTransform = `scale(${featureStackScaleX.toFixed(7)} ${featureStackScaleY.toFixed(7)})`;

  // --- 左侧文字配置 (基于 Figma 设计稿) ---
  const TEXT_CONFIG = {
    // 副标题 (features[1])
    subtitleFontSize: 48,
    // 主标题 (features[0])
    titleFontSize: 96,
    titleLineHeight: 99,
    // Feature 按钮配置 (平行四边形)
    featureFontSize: 36,
    featureHeight: 92,
    // Feature 宽度 (递减)
    feature1Width: 558,
    feature2Width: 368,
    feature3Width: 296,
    // Feature 左边距 (递增，形成阶梯效果)
    feature1MarginLeft: 0,
    feature2MarginLeft: 56,
    feature3MarginLeft: 110,
    // 间距
    featureGap: 18,
  };

  // --- 右侧三个图片配置 ---
  const IMAGES_CONFIG = {
    containerWidth: 1318,
    imageWidth: 38,
    image1Left: 20,
    image2Left: 44,
    image3Left: 59.5,
    image1Top: 5,
    image2Top: 20,
    image3Top: 5,
    image1Bottom: 20,
    image2Bottom: 5,
    image3Bottom: 20,
    image1Scale: 1.1,
    image2Scale: 1.1,
    image3Scale: 1.1,
  };

  // Feature 配置数组
  const featureConfigs = [
    { width: TEXT_CONFIG.feature1Width, marginLeft: TEXT_CONFIG.feature1MarginLeft },
    { width: TEXT_CONFIG.feature2Width, marginLeft: TEXT_CONFIG.feature2MarginLeft },
    { width: TEXT_CONFIG.feature3Width, marginLeft: TEXT_CONFIG.feature3MarginLeft },
  ];

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans">
      {/* --- SVG 定义 (隐藏在布局外) --- */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox" transform={svgTransform}>
            <path d={svgPathData} />
          </clipPath>
          <clipPath id={featureStackClipId} clipPathUnits="objectBoundingBox" transform={featureStackSvgTransform}>
            <path d={featureStackSvgPathData} />
          </clipPath>
        </defs>
      </svg>
      {/* 背景颜色层 */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: '#fff8e4' }}
      />

      {/* 右上装饰 SVG - 桌面端 */}
      <div className="absolute top-0 right-0 z-[1] pointer-events-none hidden lg:block">
        <Image
          src="/hero-banner-4-1.svg"
          alt="decoration"
          width={1536}
          height={690}
          style={{ width: '80vw', height: 'auto' }}
        />
      </div>
      {/* 右上装饰 SVG - 移动端 (固定宽度80vw，高度自动，不再缩小) */}
      <div className="absolute top-0 right-0 z-[1] pointer-events-none lg:hidden">
        <Image
          src="/hero-banner-4-1.svg"
          alt="decoration"
          width={1536}
          height={690}
          style={{ width: 'max(80vw, 819px)', height: 'auto' }}
        />
      </div>

      {/* 左下装饰 SVG - 固定尺寸 */}
      <div className="absolute -bottom-[100px] left-0 z-[1] pointer-events-none">
        <Image
          src="/hero-banner-4-2.svg"
          alt="decoration"
          width={220}
          height={188}
        />
      </div>
      {/* 桌面端三个平行四边形图片 */}
      <div
        className="absolute inset-y-0 right-0 h-full hidden lg:block z-20 pointer-events-none"
        style={{ width: `${IMAGES_CONFIG.containerWidth}px` }}
      >
        {/* --- 图片 1 --- */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${IMAGES_CONFIG.image1Left}%`,
            width: `${IMAGES_CONFIG.imageWidth}%`,
            top: `${IMAGES_CONFIG.image1Top}%`,
            bottom: `${IMAGES_CONFIG.image1Bottom}%`,
            clipPath: `url(#${clipPathId})`
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transform: `scale(${IMAGES_CONFIG.image1Scale})` }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Feature image 1"
              size="large"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* --- 图片 2 --- */}
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            left: `${IMAGES_CONFIG.image2Left}%`,
            width: `${IMAGES_CONFIG.imageWidth}%`,
            top: `${IMAGES_CONFIG.image2Top}%`,
            bottom: `${IMAGES_CONFIG.image2Bottom}%`,
            clipPath: `url(#${clipPathId})`
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transform: `scale(${IMAGES_CONFIG.image2Scale})` }}
          >
            <OptimizedImage
              image={data.images[2]}
              alt="Feature image 2"
              size="large"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* --- 图片 3 --- */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${IMAGES_CONFIG.image3Left}%`,
            width: `${IMAGES_CONFIG.imageWidth}%`,
            top: `${IMAGES_CONFIG.image3Top}%`,
            bottom: `${IMAGES_CONFIG.image3Bottom}%`,
            clipPath: `url(#${clipPathId})`
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transform: `scale(${IMAGES_CONFIG.image3Scale})` }}
          >
            <OptimizedImage
              image={data.images[3]}
              alt="Feature image 3"
              size="large"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
      {/* --- 桌面端内容 (lg及以上) --- */}
      <div className="hidden lg:flex absolute inset-0 z-30">
        {/* 左侧文字内容 */}
        <div
          className="flex flex-col justify-center h-full text-left"
          style={{ paddingLeft: rpx(114), width: '55%' }}
        >
          {/* Feature[1] - 副标题 (支持换行和缩进) */}
          <p
            className="font-paytone-one font-regular text-white text-stroke-custom-white whitespace-pre-wrap"
            style={{
              fontSize: rpx(TEXT_CONFIG.subtitleFontSize),
              marginBottom: rpx(32),
              lineHeight: rpx(66),
            }}
          >
            {data.features[1]?.replace(/\/n/g, '\n        ')}
          </p>
          {/* Feature[0] - 主标题 */}
          <h1
            className="font-paytone-one font-regular"
            style={{
              fontSize: rpx(TEXT_CONFIG.titleFontSize),
              lineHeight: rpx(TEXT_CONFIG.titleLineHeight),
              marginBottom: rpx(48),
            }}
          >
            <div className="text-[#FFB800] text-stroke-custom-light">{feature0FirstPart}</div>
            {feature0SecondPart && <div className="text-[#000000] text-stroke-custom-light">{feature0SecondPart}</div>}
          </h1>
          {/* Feature Stack (阶梯状平行四边形) */}
          <div className="flex flex-col" style={{ gap: rpx(TEXT_CONFIG.featureGap) }}>
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFD978] flex items-center justify-center font-pingfang font-semibold text-[#000000]"
                style={{
                  width: rpx(featureConfigs[index].width),
                  height: rpx(TEXT_CONFIG.featureHeight),
                  marginLeft: rpx(featureConfigs[index].marginLeft),
                  clipPath: `url(#${featureStackClipId})`,
                  fontSize: rpx(TEXT_CONFIG.featureFontSize),
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 移动端内容 (lg以下) --- */}
      <div className="lg:hidden flex flex-col absolute inset-0 z-30">
        {/* 上方图片区域 */}
        <div className="h-[40%] flex justify-center items-stretch gap-3 px-4 pt-4">
          <div className="flex-1 overflow-hidden rounded-2xl">
            <OptimizedImage image={data.images[1]} alt="Feature image 1" size="medium" className="w-full h-full object-cover" priority />
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl">
            <OptimizedImage image={data.images[2]} alt="Feature image 2" size="medium" className="w-full h-full object-cover" priority />
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl">
            <OptimizedImage image={data.images[3]} alt="Feature image 3" size="medium" className="w-full h-full object-cover" priority />
          </div>
        </div>

        {/* 下方文字区域 */}
        <div className="flex-1 flex flex-col justify-center items-start px-6 pb-8">
          {/* Feature[1] - 副标题 */}
          <p className="font-paytone-one font-regular text-3xl text-white text-stroke-custom-white mb-4 whitespace-pre-wrap text-left">
            {data.features[1]?.replace(/\/n/g, '\n        ')}
          </p>
          {/* Feature[0] - 主标题 */}
          <h1 className="font-paytone-one font-regular text-5xl sm:text-6xl mb-8 text-left">
            <div className="text-[#FFB800] text-stroke-custom-light">{feature0FirstPart}</div>
            {feature0SecondPart && <div className="text-[#000000] text-stroke-custom-light">{feature0SecondPart}</div>}
          </h1>
          {/* Feature Stack (移动端平行四边形 - 阶梯递减效果) */}
          <div className="flex flex-col gap-3 w-full items-center">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
              // 移动端宽度递减
              const mobileWidths = ['300px', '240px', '200px'];
              const mobileMarginLeft = [0, 24, 48];
              return (
                <div
                  key={index}
                  className="bg-[#FFD978] h-14 flex items-center justify-center font-pingfang font-semibold text-lg text-[#000000]"
                  style={{
                    width: mobileWidths[index],
                    marginLeft: `${mobileMarginLeft[index]}px`,
                    clipPath: `url(#${featureStackClipId})`,
                  }}
                >
                  {feature}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner4;
