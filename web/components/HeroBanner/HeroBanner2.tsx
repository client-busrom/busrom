// components/HeroBanner/HeroBanner2.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { getObjectPosition } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
};

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// 移动端配置
const MOBILE_CONFIG = {
  titleFontSize: 'text-3xl sm:text-4xl md:text-5xl',
  itemFontSize: 'text-base sm:text-lg md:text-xl',
  itemPadding: 'px-5 py-3 sm:px-6 sm:py-4',
};

// 背景图片配置
const BACKGROUND_CONFIG = {
  backgroundColor: '#756f3f',  // 背景颜色
  imageOpacity: 0.59,          // 背景图片透明度
  blurAmount: 5,               // 模糊程度 (px)
};

// SVG装饰元素配置 (左下角)
const SVG_CONFIG = {
  width: 1135,
  zIndex: 5,
};

// 左侧文字内容配置 (左下定位)
const LEFT_CONTENT_CONFIG = {
  left: '10.4%',      // 200/1920
  bottom: '16.7%',    // 从底部定位
  titleFontSize: 80,
  titleMaxWidth: 720,
  titleMarginBottom: 120,
  itemFontSize: 32,
  itemGap: 16,
  itemPaddingX: 36,
  itemPaddingY: 14,
};

// 3个角落装饰元素配置 (只有一个角是圆角)
// 颜色: rgba(255, 236, 130, 0.85) - #FFEC82 85%透明度
const CORNER_COLOR = 'rgba(255, 236, 130, 0.85)';
const CORNER_RADIUS = 34;

// 角落装饰配置
const CORNER_TOP_RIGHT = { width: 60, height: 220 };
const CORNER_BOTTOM_RIGHT = { width: 550, height: 60 };
const CORNER_BOTTOM_LEFT = { width: 60, height: 460 };
const CORNER_TOP_CENTER = { left: '25.5%', width: '49%', height: 70 }; // 百分比居中

// 右侧内容配置 (右上定位)
const RIGHT_CONTENT_CONFIG = {
  // 整个右侧内容区域定位
  contentRight: '5.4%',
  contentTop: '10%',
  // 标题
  titleFontSize: 54,
  titleMarginBottom: 40,       // 标题和图片的间距 (px)
  // 小图 (前景，左上) - 相对大图偏移
  smallImageOffsetRight: 350,  // 相对大图往左偏移 (加大间距)
  smallImageOffsetTop: 140,    // 相对大图往上偏移
  smallImageWidth: 360,
  smallImageHeight: 329,
  // 大图尺寸
  largeImageWidth: 616,
  largeImageHeight: 563,
  // 共用
  borderRadius: 34,
  borderWidth: 10,
};

// --- HeroBanner2 Component ---
const HeroBanner2: FC<BannerProps> = ({ data }) => {
  const svgUrl: string = "/hero-banner-2-1.svg";

  const parallelogramClipPath = "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)";

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans">
      {/* 背景颜色层 */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: BACKGROUND_CONFIG.backgroundColor }}
      />

      {/* Background Image - 带透明度和模糊 */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          opacity: BACKGROUND_CONFIG.imageOpacity,
          filter: `blur(${BACKGROUND_CONFIG.blurAmount}px)`,
        }}
      >
        <OptimizedImage
          image={data.images[0]}
          alt="Background"
          size="small"
          className="absolute inset-0 w-full h-full object-cover"
          objectPosition={getObjectPosition(data.images[0])}
          priority
        />
      </div>

      {/* SVG 装饰元素 - 桌面端 */}
      <div
        className="hidden lg:block absolute"
        style={{
          left: 0,
          bottom: 0,
          width: rpx(SVG_CONFIG.width),
          height: '100%',
          zIndex: SVG_CONFIG.zIndex,
        }}
      >
        <Image
          src={svgUrl}
          alt="decoration"
          fill
          sizes={rpx(SVG_CONFIG.width)}
          className="object-contain object-left-bottom"
        />
      </div>
      {/* SVG 装饰元素 - 移动端 */}
      <div
        className="lg:hidden absolute left-0 bottom-0 w-[85%] sm:w-[80%] md:w-[75%] h-full"
        style={{ zIndex: SVG_CONFIG.zIndex }}
      >
        <Image
          src={svgUrl}
          alt="decoration"
          fill
          sizes="85vw"
          className="object-contain object-left-bottom"
        />
      </div>

      {/* 左侧文字内容 - 桌面端 (lg+) */}
      <div
        className="hidden lg:flex absolute flex-col"
        style={{
          left: LEFT_CONTENT_CONFIG.left,
          bottom: LEFT_CONTENT_CONFIG.bottom,
          zIndex: 6,
        }}
      >
        {/* 标题文字 */}
        <p
          className="font-paytone-one font-regular text-[#000000] text-stroke-custom-light"
          style={{
            fontSize: rpx(LEFT_CONTENT_CONFIG.titleFontSize),
            lineHeight: 1.15,
            marginBottom: rpx(LEFT_CONTENT_CONFIG.titleMarginBottom),
            maxWidth: rpx(LEFT_CONTENT_CONFIG.titleMaxWidth),
          }}
        >
          {data.features[0]}
        </p>

        {/* 三个平行四边形条目 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: rpx(LEFT_CONTENT_CONFIG.itemGap),
          }}
        >
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
            const transparencyMaskStyle = {
              maskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
            };

            return (
              <div
                key={index}
                className="bg-gradient-to-r from-[#5A4F0E] to-[#C0A91D]"
                style={{
                  clipPath: parallelogramClipPath,
                  ...transparencyMaskStyle,
                  paddingLeft: rpx(LEFT_CONTENT_CONFIG.itemPaddingX),
                  paddingRight: rpx(LEFT_CONTENT_CONFIG.itemPaddingX * 2),
                  paddingTop: rpx(LEFT_CONTENT_CONFIG.itemPaddingY),
                  paddingBottom: rpx(LEFT_CONTENT_CONFIG.itemPaddingY),
                }}
              >
                <p
                  className="font-medium text-[#FFF5AD]"
                  style={{
                    fontSize: rpx(LEFT_CONTENT_CONFIG.itemFontSize),
                    paddingLeft: rpx(16),
                    textShadow: `0 ${rpx(4)} ${rpx(12.6)} #565020`,
                  }}
                >
                  {feature}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 左侧文字内容 - 移动端 (< lg) */}
      <div className="lg:hidden absolute flex flex-col left-6 sm:left-8 md:left-10 bottom-20 sm:bottom-24 md:bottom-28 z-[6]">
        {/* 标题文字 */}
        <p className={`font-paytone-one font-regular text-[#000000] text-stroke-custom-light ${MOBILE_CONFIG.titleFontSize} leading-tight mb-8 sm:mb-10 max-w-[320px] sm:max-w-[400px] md:max-w-[500px]`}>
          {data.features[0]}
        </p>

        {/* 三个条目 - 移动端使用圆角矩形 */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r from-[#5A4F0E] to-[#C0A91D] rounded-full ${MOBILE_CONFIG.itemPadding}`}
              style={{
                maskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
              }}
            >
              <p className={`font-medium text-[#FFF5AD] ${MOBILE_CONFIG.itemFontSize} pl-3`}
                style={{ textShadow: '0 2px 6px #565020' }}
              >
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 右上角装饰 - 桌面端 */}
      <div
        className="hidden lg:block absolute top-0 right-0 z-[4]"
        style={{
          width: rpx(CORNER_TOP_RIGHT.width),
          height: rpx(CORNER_TOP_RIGHT.height),
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 0 0 ${CORNER_RADIUS}px`,
        }}
      />
      {/* 右上角装饰 - 移动端 */}
      <div
        className="lg:hidden absolute top-0 right-0 z-[4] w-8 h-24 sm:w-10 sm:h-32"
        style={{
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 0 0 ${CORNER_RADIUS}px`,
        }}
      />

      {/* 右下角装饰 - 桌面端 */}
      <div
        className="hidden lg:block absolute bottom-0 right-0 z-[4]"
        style={{
          width: rpx(CORNER_BOTTOM_RIGHT.width),
          height: rpx(CORNER_BOTTOM_RIGHT.height),
          backgroundColor: CORNER_COLOR,
          borderRadius: `${CORNER_RADIUS}px 0 0 0`,
        }}
      />
      {/* 右下角装饰 - 移动端 */}
      <div
        className="lg:hidden absolute bottom-0 right-0 z-[4] w-32 h-6 sm:w-48 sm:h-8"
        style={{
          backgroundColor: CORNER_COLOR,
          borderRadius: `${CORNER_RADIUS}px 0 0 0`,
        }}
      />

      {/* 左下角装饰 - 桌面端 */}
      <div
        className="hidden lg:block absolute bottom-0 left-0 z-[4]"
        style={{
          width: rpx(CORNER_BOTTOM_LEFT.width),
          height: rpx(CORNER_BOTTOM_LEFT.height),
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 ${CORNER_RADIUS}px 0 0`,
        }}
      />
      {/* 左下角装饰 - 移动端 */}
      <div
        className="lg:hidden absolute bottom-0 left-0 z-[4] w-6 h-32 sm:w-8 sm:h-48"
        style={{
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 ${CORNER_RADIUS}px 0 0`,
        }}
      />

      {/* 顶部居中装饰 - 桌面端 */}
      <div
        className="hidden lg:block absolute top-0 z-[4]"
        style={{
          left: CORNER_TOP_CENTER.left,
          width: CORNER_TOP_CENTER.width,
          height: rpx(CORNER_TOP_CENTER.height),
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 0 ${CORNER_RADIUS}px ${CORNER_RADIUS}px`,
        }}
      />
      {/* 顶部居中装饰 - 移动端 */}
      <div
        className="lg:hidden absolute top-0 left-[20%] w-[60%] h-8 sm:h-10 z-[4]"
        style={{
          backgroundColor: CORNER_COLOR,
          borderRadius: `0 0 ${CORNER_RADIUS}px ${CORNER_RADIUS}px`,
        }}
      />

      {/* 右侧内容区域 - 桌面端 (lg+) */}
      <div
        className="hidden lg:flex absolute z-10 flex-col items-end"
        style={{
          right: RIGHT_CONTENT_CONFIG.contentRight,
          top: RIGHT_CONTENT_CONFIG.contentTop,
        }}
      >
        {/* 右侧标题 */}
        <h1
          className="font-paytone-one font-regular text-white text-left"
          style={{
            fontSize: rpx(RIGHT_CONTENT_CONFIG.titleFontSize),
            textShadow: '0 2px 4px rgba(117, 112, 63, 0.5)',
            marginBottom: rpx(RIGHT_CONTENT_CONFIG.titleMarginBottom),
          }}
        >
          {data.features[1]}
        </h1>

        {/* 右侧图片组 */}
        <div className="relative">
        {/* 大图 (背景) */}
        <div
          className="overflow-hidden shadow-lg bg-white"
          style={{
            width: rpx(RIGHT_CONTENT_CONFIG.largeImageWidth),
            height: rpx(RIGHT_CONTENT_CONFIG.largeImageHeight),
            padding: rpx(RIGHT_CONTENT_CONFIG.borderWidth),
            borderRadius: rpx(RIGHT_CONTENT_CONFIG.borderRadius),
          }}
        >
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: rpx(RIGHT_CONTENT_CONFIG.borderRadius - RIGHT_CONTENT_CONFIG.borderWidth),
            }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Large feature image"
              size="small"
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* 小图 (前景，相对大图偏移) */}
        <div
          className="absolute overflow-hidden shadow-lg bg-white z-20"
          style={{
            right: rpx(RIGHT_CONTENT_CONFIG.smallImageOffsetRight),
            top: rpx(RIGHT_CONTENT_CONFIG.smallImageOffsetTop),
            width: rpx(RIGHT_CONTENT_CONFIG.smallImageWidth),
            height: rpx(RIGHT_CONTENT_CONFIG.smallImageHeight),
            padding: rpx(RIGHT_CONTENT_CONFIG.borderWidth),
            borderRadius: rpx(RIGHT_CONTENT_CONFIG.borderRadius),
          }}
        >
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: rpx(RIGHT_CONTENT_CONFIG.borderRadius - RIGHT_CONTENT_CONFIG.borderWidth),
            }}
          >
            <OptimizedImage
              image={data.images[2]}
              alt="Small feature image"
              size="small"
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
          </div>
        </div>
        </div>
      </div>

      {/* 右侧内容区域 - 移动端 (< lg) */}
      <div className="lg:hidden absolute z-10 right-4 sm:right-6 md:right-8 top-20 sm:top-24 md:top-28 flex flex-col items-end">
        {/* 右侧标题 */}
        <h1 className="font-paytone-one font-regular text-white text-right text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-5"
          style={{ textShadow: '0 2px 4px rgba(117, 112, 63, 0.5)' }}
        >
          {data.features[1]}
        </h1>

        {/* 右侧图片组 - 移动端简化布局 */}
        <div className="relative">
          {/* 大图 */}
          <div className="overflow-hidden shadow-lg bg-white p-2 sm:p-2.5 rounded-2xl w-44 h-40 sm:w-56 sm:h-52 md:w-72 md:h-64">
            <div className="relative w-full h-full overflow-hidden rounded-xl">
              <OptimizedImage
                image={data.images[1]}
                alt="Large feature image"
                size="thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* 小图 - 移动端偏移较小 */}
          <div className="absolute overflow-hidden shadow-lg bg-white z-20 p-1.5 sm:p-2 rounded-xl -left-20 sm:-left-28 md:-left-36 top-12 sm:top-16 md:top-20 w-32 h-28 sm:w-40 sm:h-36 md:w-48 md:h-44">
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <OptimizedImage
                image={data.images[2]}
                alt="Small feature image"
                size="thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner2;