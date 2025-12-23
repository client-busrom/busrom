// components/HeroBanner/HeroBanner3.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
};

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// 背景配置
const BACKGROUND_CONFIG = {
  backgroundColor: '#756f3f',
};

// UI装饰元素配置
const UI_CONFIG = {
  // 小圆直径 (第一、第四区域)
  circleDiameter: 85,
  // 长方形尺寸 (第二、第三区域) - 设计稿 413x1044
  rectWidth: 413,
  rectHeight: 1044,
  // 装饰颜色
  decorColor: '#fff6ed',
  // 各区域 left 位置
  zone1Left: 24,    // 第一区域
  zone2Left: 96,   // 第二区域
  zone3Left: 516,   // 第三区域
  zone4Left: 996,  // 第四区域
  // 第一区域
  zone1CircleTop: -33,        // 小圆距离顶部
  zone1CircleOffsetX: 5,    // 小圆向右偏移
  zone1SvgTop: 360,          // SVG距离顶部
  // 第四区域
  zone4CircleBottom: -33,     // 小圆距离底部
  zone4CircleOffsetX: 5,    // 小圆向右偏移
  zone4SvgTop: 100,          // SVG距离顶部
  // SVG原始尺寸 (36x248)
  svgWidth: 36,
  svgHeight: 248,
  zIndex: 5,
};

// 配置
const CONFIG = {
  // 右侧三个圆柱图
  imagesContainerRight: 24,  // 距离右边的距离
  imageWidth: 259,
  imageHeight: 1044,
  imageGap: 12,
  // 左侧文字
  subtitleFontSize: 36,
  titleFontSize: 90,  // 设计稿 90px
  featureFontSize: 24,  // 增大字号
  featurePaddingX: 32,  // 增大内边距
  featurePaddingY: 16,
  featureMaxWidth: 420,  // 增大最大宽度
};

// --- HeroBanner3 Component ---
const HeroBanner3: FC<BannerProps> = ({ data }) => {
  // --- Split Feature[1] ---
  const feature1Text = data.features[1] || "";
  const feature1Words = feature1Text.split(" ");
  const feature1LastWord = feature1Words.pop() || "";
  const feature1Rest = feature1Words.join(" ");

  // --- Feature Stack Colors ---
  const featureBgColors = ["#F98538", "#FFF5AD", "#F98538"];
  const featureTextColors = ["#FFF5AD", "#756F3F", "#FFF5AD"];

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans">
      {/* 背景颜色层 */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: BACKGROUND_CONFIG.backgroundColor }}
      />

      {/* 桌面端 UI 装饰元素 - 4个区域绝对定位 */}
      <div
        className="absolute inset-0 hidden md:block pointer-events-none"
        style={{ zIndex: UI_CONFIG.zIndex }}
      >
        {/* 第一区域：上方小圆 + SVG */}
        {/* 小圆 - 偏右 */}
        <div
          className="absolute"
          style={{
            left: rpx(UI_CONFIG.zone1Left + UI_CONFIG.zone1CircleOffsetX),
            top: rpx(UI_CONFIG.zone1CircleTop),
            width: rpx(UI_CONFIG.circleDiameter),
            height: rpx(UI_CONFIG.circleDiameter),
            backgroundColor: UI_CONFIG.decorColor,
            borderRadius: '50%',
          }}
        />
        {/* SVG */}
        <div
          className="absolute"
          style={{
            left: rpx(UI_CONFIG.zone1Left),
            top: rpx(UI_CONFIG.zone1SvgTop),
          }}
        >
          <Image
            src="/hero-banner-3-1.svg"
            alt="decoration"
            width={UI_CONFIG.svgWidth}
            height={UI_CONFIG.svgHeight}
            style={{
              width: rpx(UI_CONFIG.svgWidth),
              height: rpx(UI_CONFIG.svgHeight),
            }}
          />
        </div>

        {/* 第二区域：贴bottom的长方形，上方完整圆角，height用百分比 */}
        <div
          className="absolute bottom-0"
          style={{
            left: rpx(UI_CONFIG.zone2Left),
            width: rpx(UI_CONFIG.rectWidth),
            height: `${(UI_CONFIG.rectHeight / 1080) * 100}%`,
            backgroundColor: UI_CONFIG.decorColor,
            borderTopLeftRadius: rpx(UI_CONFIG.rectWidth / 2),
            borderTopRightRadius: rpx(UI_CONFIG.rectWidth / 2),
          }}
        />

        {/* 第三区域：贴top的长方形，下方完整圆角，height用百分比 */}
        <div
          className="absolute top-0"
          style={{
            left: rpx(UI_CONFIG.zone3Left),
            width: rpx(UI_CONFIG.rectWidth),
            height: `${(UI_CONFIG.rectHeight / 1080) * 100}%`,
            backgroundColor: UI_CONFIG.decorColor,
            borderBottomLeftRadius: rpx(UI_CONFIG.rectWidth / 2),
            borderBottomRightRadius: rpx(UI_CONFIG.rectWidth / 2),
          }}
        />

        {/* 第四区域：上方SVG + 底部小圆 */}
        {/* SVG */}
        <div
          className="absolute"
          style={{
            left: rpx(UI_CONFIG.zone4Left),
            top: rpx(UI_CONFIG.zone4SvgTop),
          }}
        >
          <Image
            src="/hero-banner-3-1.svg"
            alt="decoration"
            width={UI_CONFIG.svgWidth}
            height={UI_CONFIG.svgHeight}
            style={{
              width: rpx(UI_CONFIG.svgWidth),
              height: rpx(UI_CONFIG.svgHeight),
            }}
          />
        </div>
        {/* 小圆 - 偏右 */}
        <div
          className="absolute"
          style={{
            left: rpx(UI_CONFIG.zone4Left + UI_CONFIG.zone4CircleOffsetX),
            bottom: rpx(UI_CONFIG.zone4CircleBottom),
            width: rpx(UI_CONFIG.circleDiameter),
            height: rpx(UI_CONFIG.circleDiameter),
            backgroundColor: UI_CONFIG.decorColor,
            borderRadius: '50%',
          }}
        />
      </div>

      {/* md及以上：左右布局 */}
      <div className="hidden md:flex absolute inset-0 z-20">
        {/* 左侧文字内容 */}
        <div
          className="flex flex-col justify-center h-full text-left px-[5%]"
          style={{ width: '55%' }}
        >
          {/* Feature[1] - 副标题 */}
          <p
            className="font-semibold text-[#000000] mb-4"
            style={{
              fontSize: rpx(CONFIG.subtitleFontSize),
              marginLeft: rpx(24),
              fontWeight: 600,
            }}
          >
            {feature1Rest}{" "}
            <span className="text-[#F98538]">{feature1LastWord}</span>
          </p>
          {/* Feature[0] - 主标题 */}
          <h1
            className="font-poller-one text-[#332E0B] mb-8"
            style={{
              fontSize: rpx(CONFIG.titleFontSize),
              lineHeight: 1.1,
              WebkitTextStroke: '2px #FDF6C2',
              paintOrder: 'stroke fill',
            }}
          >
            {data.features[0]}
          </h1>
          {/* Feature Stack */}
          <div
            className="flex flex-col"
            style={{ gap: `max(12px, ${rpx(16)})`, maxWidth: `max(280px, ${rpx(CONFIG.featureMaxWidth)})` }}
          >
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="rounded-full font-pingfang font-semibold text-center"
                style={{
                  backgroundColor: featureBgColors[index % featureBgColors.length],
                  color: featureTextColors[index % featureTextColors.length],
                  fontSize: `max(16px, ${rpx(CONFIG.featureFontSize)})`,
                  paddingLeft: `max(20px, ${rpx(CONFIG.featurePaddingX)})`,
                  paddingRight: `max(20px, ${rpx(CONFIG.featurePaddingX)})`,
                  paddingTop: `max(10px, ${rpx(CONFIG.featurePaddingY)})`,
                  paddingBottom: `max(10px, ${rpx(CONFIG.featurePaddingY)})`,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧三个圆柱图 */}
        <div
          className="absolute inset-y-0 flex items-stretch pointer-events-none"
          style={{
            right: rpx(CONFIG.imagesContainerRight),
            gap: rpx(CONFIG.imageGap),
          }}
        >
          {/* 第一个：贴顶，下方圆角 */}
          <div
            className="self-start rounded-b-full overflow-hidden"
            style={{
              width: rpx(CONFIG.imageWidth),
              height: `${(CONFIG.imageHeight / 1080) * 100}%`,
            }}
          >
            <OptimizedImage image={data.images[1]} alt="Feature image 1" size="large" className="w-full h-full object-cover" priority />
          </div>
          {/* 第二个：贴底，上方圆角 */}
          <div
            className="self-end rounded-t-full overflow-hidden z-10"
            style={{
              width: rpx(CONFIG.imageWidth),
              height: `${(CONFIG.imageHeight / 1080) * 100}%`,
            }}
          >
            <OptimizedImage image={data.images[2]} alt="Feature image 2" size="large" className="w-full h-full object-cover" priority />
          </div>
          {/* 第三个：贴顶，下方圆角 */}
          <div
            className="self-start rounded-b-full overflow-hidden"
            style={{
              width: rpx(CONFIG.imageWidth),
              height: `${(CONFIG.imageHeight / 1080) * 100}%`,
            }}
          >
            <OptimizedImage image={data.images[3]} alt="Feature image 3" size="large" className="w-full h-full object-cover" priority />
          </div>
        </div>
      </div>

      {/* md以下：上下布局 */}
      <div className="flex md:hidden flex-col absolute inset-0 z-20">
        {/* 上方：装饰元素撑满宽度 + 文字叠加 */}
        <div className="relative flex-1">
          {/* 装饰元素 - 只保留两侧的小圆和SVG */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 左侧：小圆 + SVG */}
            <div className="absolute left-[5%] top-0 bottom-0 w-[40px]">
              {/* 小圆 - 顶部偏右 */}
              <div
                className="absolute"
                style={{
                  left: '60%',
                  top: 16,
                  width: 32,
                  height: 32,
                  backgroundColor: UI_CONFIG.decorColor,
                  borderRadius: '50%',
                }}
              />
              {/* SVG - 中间 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[30%]">
                <Image
                  src="/hero-banner-3-1.svg"
                  alt="decoration"
                  width={UI_CONFIG.svgWidth}
                  height={UI_CONFIG.svgHeight}
                />
              </div>
            </div>

            {/* 右侧：SVG + 小圆 */}
            <div className="absolute right-[5%] top-0 bottom-0 w-[40px]">
              {/* SVG - 中间偏上 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[15%]">
                <Image
                  src="/hero-banner-3-1.svg"
                  alt="decoration"
                  width={UI_CONFIG.svgWidth}
                  height={UI_CONFIG.svgHeight}
                />
              </div>
              {/* 小圆 - 底部偏右 */}
              <div
                className="absolute"
                style={{
                  left: '60%',
                  bottom: 16,
                  width: 32,
                  height: 32,
                  backgroundColor: UI_CONFIG.decorColor,
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>

          {/* 文字内容 - 叠在装饰元素上，居中显示 */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-6">
            {/* Feature[1] - 副标题 */}
            <p className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">
              {feature1Rest}{" "}
              <span className="text-[#F98538]">{feature1LastWord}</span>
            </p>
            {/* Feature[0] - 主标题 */}
            <h1
              className="text-3xl sm:text-4xl font-poller-one text-[#332E0B] mb-6 text-center"
              style={{
                lineHeight: 1.1,
                WebkitTextStroke: '1.5px #FDF6C2',
                paintOrder: 'stroke fill',
              }}
            >
              {data.features[0]}
            </h1>
            {/* Feature Stack */}
            <div className="flex flex-col gap-4 w-full max-w-[340px]">
              {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
                <div
                  key={index}
                  className="px-6 py-4 rounded-full font-pingfang font-semibold text-center text-lg sm:text-xl"
                  style={{
                    backgroundColor: featureBgColors[index % featureBgColors.length],
                    color: featureTextColors[index % featureTextColors.length],
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 下方：三个图片横排，四角小圆边 */}
        <div className="relative h-[45%] flex justify-center items-stretch gap-3 px-4 pb-4">
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
      </div>
    </section>
  );
};

export default HeroBanner3;
