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
  // 设计稿尺寸: 644 x 811, 向右倾斜
  // 平行四边形: 左上(0,0) → 右上(310,0) → 右下(644,811) → 左下(334,811)
  // 右上角和左下角有圆角
  const clipPathId = `trapezoidClipHero4`;
  const svgPathData =
    "M2.5 41.8C-6 22 8.5 0 30 0H280C292 0 303 7.2 308 18.2L641.5 769.2C650 789 635.5 811 614 811H364C352 811 341 803.8 336 792.8L2.5 41.8Z";
  const scaleX = 1 / 644;
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

  // --- 右侧三个图片配置 (基于 1920x1080 设计稿，使用 rpx 等比例缩放) ---
  // 图片1: x=579, y=82, 644x811
  // 图片2: x=980, y=223, 643x811
  // 图片3: x=1258, y=82, 644x811
  // 向右偏移 100px 以适配实际显示
  const IMAGES_CONFIG = {
    imageWidth: 644,
    imageHeight: 811,
    image1Left: 679,
    image2Left: 1080,
    image3Left: 1358,
    image1Top: 82,
    image2Top: 223,
    image3Top: 82,
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
      <div
        className="absolute inset-0 z-[1] pointer-events-none hidden lg:block overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-banner-4-1.svg"
          alt="decoration"
          className="absolute"
          style={{
            width: '3732px',
            height: '1622px',
            right: '-15%',
            bottom: '-10%',
          }}
        />
      </div>
      

      {/* 左下装饰 SVG - 固定尺寸 */}
      <div className="absolute bottom-0 left-0 z-[1] pointer-events-none">
        <Image
          src="/hero-banner-4-2.svg"
          alt="decoration"
          width={220}
          height={188}
        />
      </div>
      {/* 桌面端三个平行四边形图片 */}
      <div
        className="absolute inset-0 hidden lg:block z-20 pointer-events-none"
      >
        {/* --- 图片 1 --- */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(IMAGES_CONFIG.image1Left),
            top: rpx(IMAGES_CONFIG.image1Top),
            width: rpx(IMAGES_CONFIG.imageWidth),
            height: rpx(IMAGES_CONFIG.imageHeight),
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
              size="medium"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* --- 图片 2 --- */}
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            left: rpx(IMAGES_CONFIG.image2Left),
            top: rpx(IMAGES_CONFIG.image2Top),
            width: rpx(IMAGES_CONFIG.imageWidth),
            height: rpx(IMAGES_CONFIG.imageHeight),
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
              size="medium"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* --- 图片 3 --- */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: rpx(IMAGES_CONFIG.image3Left),
            top: rpx(IMAGES_CONFIG.image3Top),
            width: rpx(IMAGES_CONFIG.imageWidth),
            height: rpx(IMAGES_CONFIG.imageHeight),
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
              size="medium"
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
            className="font-paytone-one font-normal text-white whitespace-pre-wrap antialiased"
            style={{
              fontSize: rpx(48),
              marginBottom: rpx(32),
              marginLeft: rpx(5),
              marginTop: rpx(5),
              lineHeight: `${rpx(66)}`,
              WebkitTextStroke: `${rpx(6)} #6B4E00`,
              paintOrder: 'stroke fill',
            }}
          >
            {data.features[1]?.replace(/\/n/g, '\n          ')}
          </p>
          {/* Feature[0] - 主标题 */}
          <h1
            className="font-paytone-one font-normal antialiased"
            style={{
              fontSize: rpx(96),
              lineHeight: rpx(TEXT_CONFIG.titleLineHeight),
              marginBottom: rpx(48),
              marginLeft: rpx(30),
              marginTop: rpx(-20),
              WebkitTextStroke: `${rpx(6)} #FDF6C2`,
              paintOrder: 'stroke fill',
            }}
          >
            <div className="text-[#FFB800]">{feature0FirstPart}</div>
            {feature0SecondPart && <div className="text-[#000000]">{feature0SecondPart}</div>}
          </h1>
          {/* Feature Stack (阶梯状平行四边形) */}
          <div className="flex flex-col" style={{ gap: rpx(TEXT_CONFIG.featureGap), marginLeft: rpx(40), transform: `translateY(${rpx(70)})` }}>
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
            <OptimizedImage image={data.images[1]} alt="Feature image 1" size="small" className="w-full h-full object-cover" priority />
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl">
            <OptimizedImage image={data.images[2]} alt="Feature image 2" size="small" className="w-full h-full object-cover" priority />
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl">
            <OptimizedImage image={data.images[3]} alt="Feature image 3" size="small" className="w-full h-full object-cover" priority />
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
