// components/HeroBanner/HeroBanner6.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// 处理换行符：支持 /n 和 \n
const formatText = (text: string | undefined) => text?.replace(/\/n|\\n/g, '\n') || '';

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 响应式尺寸函数 ---
// --rpx: 按宽度缩放（图片遮罩等需要精确对齐的元素）
// --rpx-hero: 按 min(宽度, 高度) 缩放，有最小值防止过度缩小
const rpx = (designValue: number) => `calc(var(--rpx) * ${designValue})`;
const rpxHero = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;
// 用于内容元素，确保在小屏幕上不会重叠
const rpxContent = rpxHero;

// --- 遮罩和图片配置 (基于 Figma 设计稿 1920x1080) ---
// 右侧主图遮罩 (hero-banner-6-1.svg)
const MASK_1_CONFIG = {
  width: 1094,        // 遮罩宽度
  height: 1289,       // 遮罩高度 (SVG viewBox 高度)
  left: 826,          // 1920 - 1094 = 826，贴右边
  top: 0,             // 贴顶部
  // 图片配置
  imageScale: 1,
  imagePositionX: 50,
  imagePositionY: 50,
  useCMSFocalPoint: true,
};

// 左侧模糊图遮罩 (hero-banner-6-2.svg)
const MASK_2_CONFIG = {
  width: 1162,        // SVG 实际宽度
  height: 2026,       // SVG 实际高度
  left: -5,            // 贴左边
  top: -10,             // 贴顶部
  // 图片配置
  imageScale: 0.8,
  imagePositionX: 50,
  imagePositionY: 50,
  useCMSFocalPoint: true,
  // 模糊效果 (CSS filter)
  blur: 7,            // 模糊程度 (px)
  opacity: 0.85,      // 透明度 (提高以减少黄色背景透出)
};

// 左上角小圆装饰
const ELLIPSE_CONFIG = {
  left: 29,           // x 坐标
  top: -33,           // y 坐标 (负值表示超出顶部)
  size: 85,           // 直径
  color: '#FFFAD3',   // 颜色 rgb(1, 0.98, 0.83) ≈ #FFFAD3
};

// 左侧内容配置 (基于 Figma 设计稿)
const CONTENT_CONFIG = {
  // 整体容器
  left: 118,
  top: 86,
  // 顶部标语胶囊 (渐变背景，左边方角右边圆角)
  tagline: {
    top: 84,
    width: 700,
    height: 122,
    fontSize: 40,
    borderRadius: 61,  // 只有右边圆角
  },
  // 主标题
  title: {
    line1Top: 220,      // "Curated"
    line2Top: 340,      // "Details"
    line3Top: 450,      // "Glass Hinge"
    fontSize: 96,
    lineHeight: 107,
  },
  // 底部 Feature 条 (旋转后需要调整位置)
  features: {
    width: 643,
    height: 107,
    borderRadius: 71,
    fontSize: 40,
    rotation: -60,      // 逆时针旋转60度
    // 三个条的左边距 (旋转后的实际位置)
    lefts: [-200, -23, 154],
    // 三个条的底部距离 (旋转后需要更大的值才能在屏幕内)
    bottoms: [100, 100, 100],
  },
};

// --- HeroBanner6 组件 ---
const HeroBanner6: FC<BannerProps> = ({ data }) => {
  // --- 拆分标题 (支持三行: Curated / Details Glass / Hinge) ---
  // 使用 formatText 统一处理换行符
  const fullFeatureTitle = formatText(data.features[0]);
  const lines = fullFeatureTitle.split('\n');
  const titleLine1 = lines[0] || "";  // "Curated"
  const titleLine2 = lines[1] || "";  // "Details Glass"
  const titleLine3 = lines[2] || "";  // "Hinge"

  // --- 计算图片位置 ---
  const image1Position = MASK_1_CONFIG.useCMSFocalPoint && data.images[0]?.cropFocalPoint
    ? `${data.images[0].cropFocalPoint.x}% ${data.images[0].cropFocalPoint.y}%`
    : `${MASK_1_CONFIG.imagePositionX}% ${MASK_1_CONFIG.imagePositionY}%`;

  const image2Position = MASK_2_CONFIG.useCMSFocalPoint && data.images[1]?.cropFocalPoint
    ? `${data.images[1].cropFocalPoint.x}% ${data.images[1].cropFocalPoint.y}%`
    : `${MASK_2_CONFIG.imagePositionX}% ${MASK_2_CONFIG.imagePositionY}%`;

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans">
      {/* z-0: 底色背景 */}
      <div className="absolute inset-0 z-0 bg-[#FFEECA]" />

      {/* z-[15]: 左上角小圆装饰 */}
      <div
        className="absolute rounded-full z-[15]"
        style={{
          left: rpx(ELLIPSE_CONFIG.left),
          top: rpx(ELLIPSE_CONFIG.top),
          width: rpx(ELLIPSE_CONFIG.size),
          height: rpx(ELLIPSE_CONFIG.size),
          backgroundColor: ELLIPSE_CONFIG.color,
        }}
      />

      {/* z-5: 左侧模糊图 (hero-banner-6-2.svg) */}
      <div
        className="absolute z-[5]"
        style={{
          left: rpx(MASK_2_CONFIG.left),
          top: rpx(MASK_2_CONFIG.top),
          width: rpx(MASK_2_CONFIG.width),
          height: rpx(MASK_2_CONFIG.height),
          opacity: MASK_2_CONFIG.opacity,
          maskImage: 'url(/hero-banner-6-2.svg)',
          WebkitMaskImage: 'url(/hero-banner-6-2.svg)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        {/* 白色底色 */}
        <div className="absolute inset-0 bg-white" />
        {/* 模糊图片 */}
        <div
          className="relative"
          style={{
            width: `${MASK_2_CONFIG.imageScale * 100}%`,
            filter: `blur(${MASK_2_CONFIG.blur}px)`,
          }}
        >
          <OptimizedImage
            image={data.images[1]}
            alt="模糊背景图"
            size="medium"
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* z-10: 右侧主图 (hero-banner-6-1.svg) */}
      <div
        className="absolute z-10"
        style={{
          left: rpx(MASK_1_CONFIG.left),
          top: rpx(MASK_1_CONFIG.top),
          width: rpx(MASK_1_CONFIG.width),
          height: rpx(MASK_1_CONFIG.height),
          maskImage: 'url(/hero-banner-6-1.svg)',
          WebkitMaskImage: 'url(/hero-banner-6-1.svg)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `scale(${MASK_1_CONFIG.imageScale})`,
            transformOrigin: image1Position,
          }}
        >
          <OptimizedImage
            image={data.images[0]}
            alt="主图"
            size="large"
            className="w-full h-full object-cover"
            objectPosition={image1Position}
            priority
          />
        </div>
      </div>

      {/* z-20: 桌面端内容 (lg及以上) */}
      <div className="hidden lg:block relative z-20 h-full">
        {/* 顶部标语胶囊 - 渐变背景从白到橙，左边方角右边圆角 */}
        <div
          className="absolute flex items-center justify-end"
          style={{
            left: 0,
            top: rpxContent(CONTENT_CONFIG.tagline.top),
            width: rpxContent(CONTENT_CONFIG.tagline.width),
            height: rpxContent(CONTENT_CONFIG.tagline.height),
            paddingRight: rpxContent(40),
            background: 'linear-gradient(to left, #FFFFFF, #FFDE95)',
            borderRadius: `0 ${rpxContent(CONTENT_CONFIG.tagline.borderRadius)} ${rpxContent(CONTENT_CONFIG.tagline.borderRadius)} 0`,
          }}
        >
          <p
            className="font-arial font-bold italic text-[#754600] whitespace-pre-line"
            style={{ fontSize: rpxContent(CONTENT_CONFIG.tagline.fontSize), letterSpacing: '0.05em' }}
          >
            {formatText(data.features[1])}
          </p>
        </div>

        {/* 主标题第一行 - "Curated" 白色 + #443D05 描边 */}
        <h1
          className="absolute font-poller-one text-white antialiased"
          style={{
            left: rpxContent(CONTENT_CONFIG.left),
            top: rpxContent(CONTENT_CONFIG.title.line1Top),
            fontSize: rpxContent(CONTENT_CONFIG.title.fontSize),
            lineHeight: `${rpxContent(CONTENT_CONFIG.title.lineHeight)}`,
            WebkitTextStroke: `${rpx(10)} #443D05`,
            paintOrder: 'stroke fill',
          }}
        >
          {titleLine1}
        </h1>

        {/* 主标题第二行 - "Details" #322E0B + #FDF6C2 描边 */}
        <h1
          className="absolute font-poller-one text-[#322E0B] antialiased"
          style={{
            left: rpxContent(CONTENT_CONFIG.left),
            top: rpxContent(CONTENT_CONFIG.title.line2Top),
            fontSize: rpxContent(CONTENT_CONFIG.title.fontSize),
            lineHeight: `${rpxContent(CONTENT_CONFIG.title.lineHeight)}`,
            WebkitTextStroke: `${rpx(6)} #FDF6C2`,
            paintOrder: 'stroke fill',
          }}
        >
          {titleLine2}
        </h1>

        {/* 主标题第三行 - "Glass Hinge" #322E0B + #FDF6C2 描边 */}
        {titleLine3 && (
          <h1
            className="absolute font-poller-one text-[#322E0B] antialiased"
            style={{
              left: rpxContent(CONTENT_CONFIG.left),
              top: rpxContent(CONTENT_CONFIG.title.line3Top),
              fontSize: rpxContent(CONTENT_CONFIG.title.fontSize),
              lineHeight: `${rpxContent(CONTENT_CONFIG.title.lineHeight)}`,
              WebkitTextStroke: `${rpx(8)} #FDF6C2`,
              paintOrder: 'stroke fill',
            }}
          >
            {titleLine3}
          </h1>
        )}

        {/* 底部三个旋转的 Feature 条 */}
        {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
          <div
            key={index}
            className="absolute flex items-center justify-end bg-[#756F3F]"
            style={{
              left: rpxContent(CONTENT_CONFIG.features.lefts[index]),
              bottom: rpxContent(CONTENT_CONFIG.features.bottoms[index]),
              width: rpxContent(CONTENT_CONFIG.features.width),
              height: rpxContent(CONTENT_CONFIG.features.height),
              borderRadius: rpxContent(CONTENT_CONFIG.features.borderRadius),
              transform: `rotate(${CONTENT_CONFIG.features.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <span
              className="font-pingfang font-semibold text-[#FFF5AD]"
              style={{ fontSize: rpxContent(CONTENT_CONFIG.features.fontSize), paddingRight: rpxContent(40) }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* z-20: 移动端内容 (lg以下) */}
      <div className="lg:hidden relative z-20 h-full flex flex-col justify-center px-6">
        {/* 顶部标语胶囊 */}
        <div className="flex items-center justify-end rounded-full px-4 py-2 mb-4 self-start"
          style={{ background: 'linear-gradient(to left, #FFFFFF, #FFDE95)' }}
        >
          <p className="font-arial font-bold italic text-[#754600] text-sm whitespace-pre-line" style={{ letterSpacing: '0.05em' }}>
            {formatText(data.features[1])}
          </p>
        </div>

        {/* 主标题 */}
        <h1
          className="font-poller-one text-white text-4xl sm:text-5xl mb-1 antialiased"
          style={{ WebkitTextStroke: '2px #443D05', paintOrder: 'stroke fill' }}
        >
          {titleLine1}
        </h1>
        <h1
          className="font-poller-one text-[#322E0B] text-4xl sm:text-5xl mb-1 antialiased"
          style={{ WebkitTextStroke: '2px #FDF6C2', paintOrder: 'stroke fill' }}
        >
          {titleLine2}
        </h1>
        {titleLine3 && (
          <h1
            className="font-poller-one text-[#322E0B] text-4xl sm:text-5xl mb-8 antialiased"
            style={{ WebkitTextStroke: '2px #FDF6C2', paintOrder: 'stroke fill' }}
          >
            {titleLine3}
          </h1>
        )}

        {/* Feature 列表 - 移动端垂直排列，不旋转 */}
        <div className="flex flex-col gap-3">
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-center bg-[#756F3F] rounded-full px-6 py-3"
            >
              <span className="font-pingfang font-semibold text-[#FFF5AD] text-sm">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner6;