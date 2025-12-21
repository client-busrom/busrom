// components/HeroBanner/HeroBanner8.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- 响应式尺寸函数 ---
const rpxHero = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;
// 带最小值的版本，防止在中等屏幕下缩放太严重
const rpxHeroMin = (designValue: number, minValue: number) => `max(${minValue}px, calc(var(--rpx-hero) * ${designValue}))`;

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 桌面端配置 (基于 Figma 设计稿 1920x1080) ---
const DESKTOP_CONFIG = {
  // 背景色
  backgroundColor: '#544F22',

  // SVG 遮罩图片配置 (黑色区域用于填充 data.images[0])
  // SVG viewBox 1920x1080，黑色路径从 x≈865 到右边缘
  maskImage: {
    // 用宽高比来计算，这样不受地址栏影响
    aspectRatio: 1055 / 1080,  // 遮罩可见区域宽高比
    svgAspectRatio: 1920 / 1080,  // 完整 SVG 宽高比
  },

  // 左侧内容区域
  leftContent: {
    left: '6%',            // 左边距（百分比）
    top: 120,              // 顶部距离
  },

  // 标题配置
  title: {
    fontSize: 100,         // 字体大小 - xl及以上
    fontSizeSmall: 72,     // 字体大小 - lg到xl
    lineHeight: 1.1,
  },

  // Feature 胶囊配置 [2,3,4]
  featureCards: {
    bottom: 100,           // 底部距离（固定像素）
    width: 500,            // 卡片宽度（固定像素） - xl及以上
    widthSmall: 340,       // 卡片宽度（固定像素） - lg到xl
    height: 80,            // 卡片高度（固定像素）
    heightSmall: 56,       // 卡片高度 - lg到xl
    gap: 20,               // 卡片间距（固定像素）
    gapSmall: 12,          // 卡片间距 - lg到xl
    fontSize: 36,          // 字体大小（固定像素）
    fontSizeSmall: 24,     // 字体大小 - lg到xl
    borderRadius: 16,      // 圆角
    borderWidth: 2,
  },

  // 右上角 Feature[1] 胶囊
  feature1: {
    top: 120,              // 顶部距离
    paddingX: 48,          // 水平内边距
    paddingY: 24,          // 垂直内边距
    fontSize: 48,          // 字体大小
    borderRadius: 100,     // 左侧圆角 (rounded-l-full)
  },

  // 底部三张图片
  bottomImages: {
    bottom: 100,           // 底部距离
    right: 80,             // 右边距
    gap: 24,               // 图片间距
    width: 280,            // 单张图片宽度
    height: 220,           // 单张图片高度
    borderRadius: 34,      // 圆角
    borderWidth: 6,        // 边框宽度
  },
};

// --- 移动端配置 ---
const MOBILE_CONFIG = {
  // 顶部内容区域
  topPadding: 120,

  // 标题
  title: {
    fontSize: 'text-4xl',
  },

  // Feature 胶囊
  featureCards: {
    marginTop: 24,
    fontSize: 'text-lg',
  },

  // Feature[1] 右上角
  feature1: {
    top: 60,
    fontSize: 'text-xl',
  },

  // 底部图片
  bottomImages: {
    height: 140,
    borderRadius: 20,
    borderWidth: 3,
    gap: 8,
  },
};

// --- HeroBanner8 Component ---
const HeroBanner8: FC<BannerProps> = ({ data }) => {
  // --- Split Feature[0] (支持换行: \n, \\n, /n) ---
  const feature0Text = data.features[0] || "";
  const feature0Lines = feature0Text.split(/\n|\\n|\/n/);

  return (
    <section
      className="relative w-full h-full min-h-[700px] overflow-hidden font-sans"
      style={{ backgroundColor: DESKTOP_CONFIG.backgroundColor }}
    >
      {/* Layer 1: 背景图片 (data.images[0]) - 桌面端 */}
      {/* 图片容器只覆盖遮罩可见区域，这样图片中心在遮罩中心 */}
      <div
        className="hidden md:block absolute right-0 top-0 h-full z-0"
        style={{
          // 宽度 = 高度 × 遮罩区域宽高比 (1055/1080)
          aspectRatio: DESKTOP_CONFIG.maskImage.aspectRatio,
          maskImage: 'url(/hero-banner-8-mask.svg)',
          WebkitMaskImage: 'url(/hero-banner-8-mask.svg)',
          // 遮罩大小：SVG 原始比例 (1920/1080)，高度 100%
          maskSize: `${100 * (1920 / 1055)}% 100%`,
          WebkitMaskSize: `${100 * (1920 / 1055)}% 100%`,
          // 遮罩右对齐，让黑色区域和容器对齐
          maskPosition: 'right center',
          WebkitMaskPosition: 'right center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        <OptimizedImage
          image={data.images[0]}
          alt="Background"
          size="xlarge"
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Layer 1.5: SVG 装饰层（白边 + 装饰元素）- 桌面端 */}
      <div
        className="hidden md:block absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/hero-banner-8-1.svg?v=2)',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Layer 2: 右上角 Feature[1] 胶囊 - 桌面端 */}
      <div
        className="hidden md:block absolute right-0 z-20"
        style={{ top: rpxHeroMin(DESKTOP_CONFIG.feature1.top, 80) }}
      >
        <div
          className="bg-[#665F1F] text-[#FEFFD8]"
          style={{
            paddingLeft: rpxHeroMin(DESKTOP_CONFIG.feature1.paddingX, 24),
            paddingRight: rpxHeroMin(DESKTOP_CONFIG.feature1.paddingX, 24),
            paddingTop: rpxHeroMin(DESKTOP_CONFIG.feature1.paddingY, 12),
            paddingBottom: rpxHeroMin(DESKTOP_CONFIG.feature1.paddingY, 12),
            borderTopLeftRadius: rpxHeroMin(DESKTOP_CONFIG.feature1.borderRadius, 50),
            borderBottomLeftRadius: rpxHeroMin(DESKTOP_CONFIG.feature1.borderRadius, 50),
            fontSize: rpxHeroMin(DESKTOP_CONFIG.feature1.fontSize, 24),
          }}
        >
          <p className="font-paytone-one font-regular">
            {data.features[1]}
          </p>
        </div>
      </div>

      {/* Layer 3: 标题 - md及以上 使用带最小值的 rpxHero 缩放 */}
      <div
        className="hidden md:block absolute z-20"
        style={{
          left: DESKTOP_CONFIG.leftContent.left,
          top: rpxHeroMin(DESKTOP_CONFIG.leftContent.top, 80),
        }}
      >
        <h1
          className="font-paytone-one font-regular leading-tight"
          style={{
            fontSize: rpxHeroMin(DESKTOP_CONFIG.title.fontSizeSmall, 48),
            lineHeight: DESKTOP_CONFIG.title.lineHeight,
          }}
        >
          {feature0Lines.map((line, index) => {
            const isLastLine = feature0Lines.length > 1 && index === feature0Lines.length - 1;
            return (
              <div
                key={index}
                className={isLastLine ? 'text-[#FDF6C2]' : 'text-black'}
                style={{
                  WebkitTextStroke: isLastLine ? '2px #000000' : '2px #FDF6C2',
                }}
              >
                {line}
              </div>
            );
          })}
        </h1>
      </div>

      {/* Layer 3.5: Feature 卡片 - md及以上 使用带最小值的 rpxHero 缩放 */}
      <div
        className="hidden md:flex absolute z-20 flex-col"
        style={{
          left: DESKTOP_CONFIG.leftContent.left,
          bottom: rpxHeroMin(DESKTOP_CONFIG.featureCards.bottom, 60),
          gap: rpxHeroMin(DESKTOP_CONFIG.featureCards.gapSmall, 10),
        }}
      >
        {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
          <div
            key={index}
            className="bg-[#FFFB1B]/20 border border-[#CFBC37] flex items-center"
            style={{
              width: rpxHeroMin(DESKTOP_CONFIG.featureCards.widthSmall, 260),
              height: rpxHeroMin(DESKTOP_CONFIG.featureCards.heightSmall, 44),
              borderRadius: rpxHeroMin(DESKTOP_CONFIG.featureCards.borderRadius, 12),
              borderWidth: `max(1.5px, ${rpxHero(DESKTOP_CONFIG.featureCards.borderWidth)})`,
              paddingLeft: rpxHeroMin(16, 12),
              paddingRight: rpxHeroMin(16, 12),
            }}
          >
            <p
              className="font-phudu font-semibold text-[#CFBC37] text-stroke-custom-gold text-left"
              style={{ fontSize: rpxHeroMin(DESKTOP_CONFIG.featureCards.fontSizeSmall, 18) }}
            >
              {feature}
            </p>
          </div>
        ))}
      </div>

      {/* Layer 4: 底部三张图片 - 桌面端 */}
      <div
        className="hidden md:flex absolute z-20"
        style={{
          bottom: rpxHeroMin(DESKTOP_CONFIG.bottomImages.bottom, 60),
          right: rpxHeroMin(DESKTOP_CONFIG.bottomImages.right, 40),
          gap: rpxHeroMin(DESKTOP_CONFIG.bottomImages.gap, 12),
        }}
      >
        {[data.images[1], data.images[2], data.images[3]].map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden border-white"
            style={{
              width: rpxHeroMin(DESKTOP_CONFIG.bottomImages.width, 160),
              height: rpxHeroMin(DESKTOP_CONFIG.bottomImages.height, 130),
              borderRadius: rpxHeroMin(DESKTOP_CONFIG.bottomImages.borderRadius, 20),
              borderWidth: `max(3px, ${rpxHero(DESKTOP_CONFIG.bottomImages.borderWidth)})`,
              borderStyle: 'solid',
            }}
          >
            <OptimizedImage
              image={image}
              alt={`Feature image ${index + 1}`}
              size="medium"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* ==================== 移动端布局 ==================== */}

      {/* 移动端: 右上角 Feature[1] */}
      <div
        className="md:hidden absolute right-0 z-20"
        style={{ top: MOBILE_CONFIG.feature1.top }}
      >
        <div className="bg-[#665F1F] text-[#FEFFD8] rounded-l-full px-6 py-3">
          <p className={`${MOBILE_CONFIG.feature1.fontSize} font-paytone-one font-regular`}>
            {data.features[1]}
          </p>
        </div>
      </div>

      {/* 移动端: 主内容区域 */}
      <div className="md:hidden relative z-20 flex flex-col h-full px-6">
        {/* 上部：标题 + Feature 卡片 */}
        <div
          className="flex flex-col justify-center"
          style={{ paddingTop: MOBILE_CONFIG.topPadding }}
        >
          {/* 标题 */}
          <h1 className={`${MOBILE_CONFIG.title.fontSize} font-paytone-one font-regular leading-tight`}>
            {feature0Lines.map((line, index) => {
              const isLastLine = feature0Lines.length > 1 && index === feature0Lines.length - 1;
              return (
                <div
                  key={index}
                  className={isLastLine ? 'text-[#FDF6C2]' : 'text-black'}
                  style={{
                    WebkitTextStroke: isLastLine ? '1.5px #000000' : '1.5px #FDF6C2',
                  }}
                >
                  {line}
                </div>
              );
            })}
          </h1>

          {/* Feature 卡片 */}
          <div
            className="flex flex-col gap-3 w-full max-w-sm"
            style={{ marginTop: MOBILE_CONFIG.featureCards.marginTop }}
          >
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFFB1B]/20 border border-[#CFBC37] rounded-lg px-4 py-2"
              >
                <p className={`${MOBILE_CONFIG.featureCards.fontSize} font-phudu font-semibold text-[#CFBC37] text-stroke-custom-gold text-left`}>
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 下部：横图 + 三张小图 */}
        <div className="flex-1 flex flex-col mt-6 gap-3 pb-4">
          {/* 横向大图 16:9 */}
          <div
            className="relative w-full rounded-2xl overflow-hidden border-white"
            style={{
              aspectRatio: '16/9',
              borderWidth: MOBILE_CONFIG.bottomImages.borderWidth,
              borderStyle: 'solid',
            }}
          >
            <OptimizedImage
              image={data.images[0]}
              alt="Background"
              size="large"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* 底部三张图片 */}
          <div
            className="flex justify-center"
            style={{ gap: MOBILE_CONFIG.bottomImages.gap }}
          >
            {[data.images[1], data.images[2], data.images[3]].map((image, index) => (
              <div
                key={index}
                className="relative flex-1 overflow-hidden border-white"
                style={{
                  height: MOBILE_CONFIG.bottomImages.height,
                  borderRadius: MOBILE_CONFIG.bottomImages.borderRadius,
                  borderWidth: MOBILE_CONFIG.bottomImages.borderWidth,
                  borderStyle: 'solid',
                }}
              >
                <OptimizedImage
                  image={image}
                  alt={`Feature image ${index + 1}`}
                  size="small"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner8;
