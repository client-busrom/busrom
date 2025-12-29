// components/HeroBanner/HeroBanner7.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// 处理换行符：支持 /n 和 \n
const formatText = (text: string | undefined) => text?.replace(/\/n|\\n/g, '\n') || '';

// --- 响应式尺寸函数 ---
// 使用 --rpx-hero 来适应实际视口高度
const rpxHero = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 桌面端 Feature[1] 文字配置 (基于 Figma 设计稿 1920x1080) ---
const DESKTOP_FEATURE1_CONFIG = {
  left: 118,              // 左边距 (设计稿像素)
  bottom: 220,             // 底部距离 (设计稿像素)
  fontSize: 64,           // 字体大小 (设计稿像素)
};

// --- 桌面端右侧内容配置 (基于 Figma 设计稿 1920x1080) ---
const DESKTOP_RIGHT_CONTENT_CONFIG = {
  titleFontSize: 100,     // 标题字体大小 (设计稿像素)
  right: 80,             // 右边距 (设计稿像素)
  // Feature 胶囊配置
  featureFontSize: 40,    // Feature 字体大小 (设计稿像素)
  featureWidth: 455,      // 椭圆宽度 (设计稿像素)
  featureHeight: 111,     // 椭圆高度 (设计稿像素)
  featureOffsetLeft: 60,  // 胶囊左偏移 (与标题第二个字母对齐)
};

// --- 遮罩图片配置 (基于 Figma 设计稿 1920x1080) ---
const MASK_IMAGE_CONFIG = {
  // 遮罩容器位置和尺寸 (SVG viewBox: 0 0 865 1080)
  width: 865,
  height: 1080,
  left: 0,
  centerY: true,          // 垂直居中
  // 图片在遮罩内的缩放和偏移
  imageScale: 1.2,          // 图片缩放比例
  imageOffsetX: -70,     // 图片水平偏移 (设计稿像素)
  imageOffsetY: 0,        // 图片垂直偏移 (设计稿像素)
  imagePositionX: 50,     // object-position X (%)
  imagePositionY: 50,     // object-position Y (%)
  useCMSFocalPoint: true, // 是否使用 CMS 的焦点
};

// --- 菱形图片配置 (基于 Figma 设计稿 1920x1080) ---
// 顶部菱形 (data.images[1])
const DIAMOND_TOP_CONFIG = {
  // 位置 (设计稿像素)
  left: 540,              // 左边距
  centerY: true,          // 垂直居中
  offsetY: -440,          // 居中后的垂直偏移 (设计稿像素，负值往上)
  // 尺寸
  size: 420,              // 菱形边长
  // 边框
  borderWidth: 11,        // 边框宽度
  borderColor: '#756F3F', // 边框颜色
  borderRadius: 97,       // 圆角大小
  // 图片
  imageScale: 1.42,        // 图片缩放比例
  imageOffsetX: 0,        // 图片水平偏移 (设计稿像素)
  imageOffsetY: 0,        // 图片垂直偏移 (设计稿像素)
  imagePositionX: 50,     // object-position X (%)
  imagePositionY: 50,     // object-position Y (%)
  useCMSFocalPoint: true,
  zIndex: 20,
};

// 中间菱形 (data.images[2])
const DIAMOND_MIDDLE_CONFIG = {
  // 位置 (设计稿像素)
  left: 800,              // 左边距
  centerY: true,          // 垂直居中
  offsetY: -10,             // 居中后的垂直偏移 (设计稿像素)
  // 尺寸
  size: 288,              // 菱形边长
  // 边框
  borderWidth: 11,        // 边框宽度
  borderColor: '#756F3F', // 边框颜色
  borderRadius: 88,       // 圆角大小
  // 图片
  imageScale: 1.5,        // 图片缩放比例
  imageOffsetX: 0,        // 图片水平偏移 (设计稿像素)
  imageOffsetY: 0,        // 图片垂直偏移 (设计稿像素)
  imagePositionX: 50,     // object-position X (%)
  imagePositionY: 50,     // object-position Y (%)
  useCMSFocalPoint: true,
  zIndex: 20,
};

// 底部菱形 (data.images[3])
const DIAMOND_BOTTOM_CONFIG = {
  // 位置 (设计稿像素)
  left: 550,              // 左边距
  centerY: true,          // 垂直居中
  offsetY: 440,           // 居中后的垂直偏移 (设计稿像素，正值往下)
  // 尺寸
  size: 420,              // 菱形边长
  // 边框
  borderWidth: 11,        // 边框宽度
  borderColor: '#756F3F', // 边框颜色
  borderRadius: 97,       // 圆角大小
  // 图片
  imageScale: 1.42,        // 图片缩放比例
  imageOffsetX: 0,        // 图片水平偏移 (设计稿像素)
  imageOffsetY: 0,        // 图片垂直偏移 (设计稿像素)
  imagePositionX: 50,     // object-position X (%)
  imagePositionY: 50,     // object-position Y (%)
  useCMSFocalPoint: true,
  zIndex: 20,
};

// --- 光柱配置 (4条斜向渐变光柱，45度旋转) ---
// 基于 Figma 设计稿 1920x1080
// 注意：Figma 的 -45 度在 CSS 中是 45 度（方向相反）
const LIGHT_BEAMS = [
  // Rectangle 181 - 最长最粗的光柱
  {
    left: 700,
    top: -160,
    width: 1538,
    height: 192,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',      // #FFED5B
    gradientTo: 'rgba(211, 205, 153, 0)',       // 透明
    zIndex: 5,
  },
  // Rectangle 178 - 第二粗的光柱
  {
    left: 1050,
    top: -170,
    width: 942,
    height: 192,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
    zIndex: 5,
  },
  // Rectangle 179 - 细光柱
  {
    left: 1320,
    top: -100,
    width: 1040,
    height: 72,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
    zIndex: 5,
  },
  // Rectangle 180 - 细光柱
  {
    left: 1500,
    top: -100,
    width: 942,
    height: 72,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
    zIndex: 5,
  },
];

// --- 移动端光柱配置 (从右上角斜向左下) ---
const MOBILE_LIGHT_BEAMS = [
  {
    left: 20,              // 最长最粗的光柱
    top: -80,
    width: 500,
    height: 50,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
  },
  {
    left: 130,              // 第二粗的光柱
    top: -60,
    width: 350,
    height: 50,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
  },
  {
    left: 215,              // 细光柱
    top: -30,
    width: 400,
    height: 20,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
  },
  {
    left: 255,              // 细光柱
    top: -40,
    width: 250,
    height: 20,
    rotation: 45,
    opacity: 0.44,
    gradientFrom: 'rgba(255, 237, 91, 1)',
    gradientTo: 'rgba(211, 205, 153, 0)',
  },
];

// --- 移动端配置 (md以下) ---
const MOBILE_CONFIG = {
  // 顶部内容区域
  topPadding: 340,          // 顶部留白 (px)

  // SVG 遮罩图片
  // 高度100%，宽度按比例自动，贴左下角，但内容从右侧对齐
  svg: {
    height: '100%',           // 高度100%
    aspectRatio: 865 / 1080,  // SVG 宽高比
    maskSize: '100% 100%',    // 遮罩撑满
    maskPosition: 'left bottom',
    imagePosition: 'right center',
    imageScale: 1.2,          // 图片缩放比例
  },

  // 顶部菱形 (固定位置，不随缩放移动)
  diamondTop: {
    left: 310,              // 左边距 (px) - 固定
    top: -50,               // 顶部距离 (px) - 固定
    size: 240,              // 尺寸 (px) - 固定
    borderWidth: 8,         // 边框宽度 (px)
    borderRadius: 60,       // 圆角 (px)
    imageScale: 1.4,        // 图片缩放
  },

  // 中间菱形 (百分比定位，随缩放移动)
  diamondMiddle: {
    left: '63%',            // 左边距 (%)
    top: '49%',             // 顶部距离 (%) - 会居中
    size: '32%',            // 尺寸 (%)
    borderWidth: 6,         // 边框宽度 (px)
    borderRadius: '25%',    // 圆角 (%)
    imageScale: 1.5,        // 图片缩放
  },

  // 底部菱形 (固定位置，不随缩放移动)
  diamondBottom: {
    left: 320,              // 左边距 (px) - 固定
    bottom: -50,            // 底部距离 (px) - 固定
    size: 240,              // 尺寸 (px) - 固定
    borderWidth: 6,         // 边框宽度 (px)
    borderRadius: 60,       // 圆角 (px)
    imageScale: 1.4,        // 图片缩放
  },

  // 底部文字
  featureText: {
    left: 32,               // 左边距 (px)
    bottom: 220,             // 底部距离 (px)
    fontSize: 'text-2xl',  // 字体大小 class
  },
};

// --- 计算图片位置的辅助函数 ---
const getImagePosition = (
  config: { useCMSFocalPoint: boolean; imagePositionX: number; imagePositionY: number },
  image?: BannerData['images'][number]
) => {
  if (config.useCMSFocalPoint && image?.cropFocalPoint) {
    return `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`;
  }
  return `${config.imagePositionX}% ${config.imagePositionY}%`;
};

// --- HeroBanner7 Component ---
const HeroBanner7: FC<BannerProps> = ({ data, locale }) => {
  // --- 计算各图片位置 ---
  const maskImagePosition = getImagePosition(MASK_IMAGE_CONFIG, data.images[0]);
  const diamondTopPosition = getImagePosition(DIAMOND_TOP_CONFIG, data.images[1]);
  const diamondMiddlePosition = getImagePosition(DIAMOND_MIDDLE_CONFIG, data.images[2]);
  const diamondBottomPosition = getImagePosition(DIAMOND_BOTTOM_CONFIG, data.images[3]);

  // --- Split Feature[0] (支持换行: \n, \\n, /n，支持多行) ---
  const feature0Text = formatText(data.features[0]);
  const feature0Lines = feature0Text.split('\n');

  // --- Split Feature[1] (支持换行: \n, \\n, /n) ---
  const feature1Text = formatText(data.features[1]);
  const feature1Lines = feature1Text.split('\n');

  const ovalClipId = "ovalClipHero7"; // 唯一 ID

  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans bg-[#99935f]">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* 【新增】椭圆 clipPath */}
          {/* 使用 ellipse 和 objectBoundingBox 可以简单创建填满元素的椭圆 */}
          <clipPath id={ovalClipId} clipPathUnits="objectBoundingBox">
             <ellipse cx="0.5" cy="0.5" rx="0.5" ry="0.5" />
             {/* cx/cy=0.5 (中心), rx/ry=0.5 (半径为一半) */}
          </clipPath>
        </defs>
      </svg>
      {/* Layer 0.5: Light Beams (光柱，在背景之上，图片文字之下) - 桌面端 */}
      {LIGHT_BEAMS.map((beam, index) => (
        <div
          key={`light-beam-${index}`}
          className="hidden md:block absolute pointer-events-none"
          style={{
            left: rpxHero(beam.left),
            top: rpxHero(beam.top),
            transform: `rotate(${beam.rotation}deg)`,
            transformOrigin: 'left center',
            width: rpxHero(beam.width),
            height: rpxHero(beam.height),
            opacity: beam.opacity,
            background: `linear-gradient(to right, ${beam.gradientFrom}, ${beam.gradientTo})`,
            zIndex: beam.zIndex,
          }}
        />
      ))}

      {/* Layer 1: Background Image with mask (z-0) - 桌面端 */}
      <div
        className="hidden md:block absolute z-0"
        style={{
          width: rpxHero(MASK_IMAGE_CONFIG.width),
          height: rpxHero(MASK_IMAGE_CONFIG.height),
          left: rpxHero(MASK_IMAGE_CONFIG.left),
          top: '50%',
          transform: 'translateY(-50%)',
          maskImage: 'url(/hero-banner-7-1.svg)',
          WebkitMaskImage: 'url(/hero-banner-7-1.svg)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${MASK_IMAGE_CONFIG.imageScale}) translate(${rpxHero(MASK_IMAGE_CONFIG.imageOffsetX)}, ${rpxHero(MASK_IMAGE_CONFIG.imageOffsetY)})`,
            transformOrigin: 'center center',
          }}
        >
          <OptimizedImage
            image={data.images[0]}
            alt="Background"
            size="medium"
            className="w-full h-full object-cover"
            objectPosition={maskImagePosition}
            priority
          />
        </div>
      </div>

      {/* Layer 3: Rotated Image Divs (菱形图片) - 桌面端 */}
      {/* 顶部菱形 (data.images[1]) */}
      <div
        className="hidden md:block absolute overflow-hidden"
        style={{
          left: rpxHero(DIAMOND_TOP_CONFIG.left),
          top: '50%',
          transform: `translateY(-50%) translateY(${rpxHero(DIAMOND_TOP_CONFIG.offsetY)}) rotate(45deg)`,
          width: rpxHero(DIAMOND_TOP_CONFIG.size),
          height: rpxHero(DIAMOND_TOP_CONFIG.size),
          boxShadow: `0 0 0 ${rpxHero(11)} ${DIAMOND_TOP_CONFIG.borderColor}`,
          borderRadius: rpxHero(DIAMOND_TOP_CONFIG.borderRadius),
          zIndex: DIAMOND_TOP_CONFIG.zIndex,
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${DIAMOND_TOP_CONFIG.imageScale}) translate(${rpxHero(DIAMOND_TOP_CONFIG.imageOffsetX)}, ${rpxHero(DIAMOND_TOP_CONFIG.imageOffsetY)})`,
            transformOrigin: 'center center',
          }}
        >
          <OptimizedImage
            image={data.images[1]}
            alt="Top rotated image"
            size="large"
            className="absolute inset-0 w-full h-full object-cover -rotate-45"
            objectPosition={diamondTopPosition}
            priority
          />
        </div>
      </div>

      {/* 中间菱形 (data.images[2]) */}
      <div
        className="hidden md:block absolute overflow-hidden"
        style={{
          left: rpxHero(DIAMOND_MIDDLE_CONFIG.left),
          top: '50%',
          transform: `translateY(-50%) translateY(${rpxHero(DIAMOND_MIDDLE_CONFIG.offsetY)}) rotate(45deg)`,
          width: rpxHero(DIAMOND_MIDDLE_CONFIG.size),
          height: rpxHero(DIAMOND_MIDDLE_CONFIG.size),
          boxShadow: `0 0 0 ${rpxHero(11)} ${DIAMOND_MIDDLE_CONFIG.borderColor}`,
          borderRadius: rpxHero(DIAMOND_MIDDLE_CONFIG.borderRadius),
          zIndex: DIAMOND_MIDDLE_CONFIG.zIndex,
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${DIAMOND_MIDDLE_CONFIG.imageScale}) translate(${rpxHero(DIAMOND_MIDDLE_CONFIG.imageOffsetX)}, ${rpxHero(DIAMOND_MIDDLE_CONFIG.imageOffsetY)})`,
            transformOrigin: 'center center',
          }}
        >
          <OptimizedImage
            image={data.images[2]}
            alt="Middle rotated image"
            size="large"
            className="absolute inset-0 w-full h-full object-cover -rotate-45"
            objectPosition={diamondMiddlePosition}
            priority
          />
        </div>
      </div>

      {/* 底部菱形 (data.images[3]) */}
      <div
        className="hidden md:block absolute overflow-hidden"
        style={{
          left: rpxHero(DIAMOND_BOTTOM_CONFIG.left),
          top: '50%',
          transform: `translateY(-50%) translateY(${rpxHero(DIAMOND_BOTTOM_CONFIG.offsetY)}) rotate(45deg)`,
          width: rpxHero(DIAMOND_BOTTOM_CONFIG.size),
          height: rpxHero(DIAMOND_BOTTOM_CONFIG.size),
          boxShadow: `0 0 0 ${rpxHero(11)} ${DIAMOND_BOTTOM_CONFIG.borderColor}`,
          borderRadius: rpxHero(DIAMOND_BOTTOM_CONFIG.borderRadius),
          zIndex: DIAMOND_BOTTOM_CONFIG.zIndex,
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${DIAMOND_BOTTOM_CONFIG.imageScale}) translate(${rpxHero(DIAMOND_BOTTOM_CONFIG.imageOffsetX)}, ${rpxHero(DIAMOND_BOTTOM_CONFIG.imageOffsetY)})`,
            transformOrigin: 'center center',
          }}
        >
          <OptimizedImage
            image={data.images[3]}
            alt="Bottom rotated image"
            size="large"
            className="absolute inset-0 w-full h-full object-cover -rotate-45"
            objectPosition={diamondBottomPosition}
            priority
          />
        </div>
      </div>


      {/* Layer 4: Desktop Content (md及以上) */}
      <div className="hidden md:block relative z-30 h-full w-full">
        {/* Feature[1] - 绝对定位到板块左下角 */}
        <div
          className="absolute"
          style={{
            left: rpxHero(DESKTOP_FEATURE1_CONFIG.left),
            bottom: rpxHero(DESKTOP_FEATURE1_CONFIG.bottom),
          }}
        >
          <p
            className="font-paytone-one font-regular text-white text-left"
            style={{
              fontSize: rpxHero(DESKTOP_FEATURE1_CONFIG.fontSize),
              WebkitTextStroke: `${rpxHero(6)} #6B4E00`,
              paintOrder: 'stroke fill',
            }}
          >
            {feature1Lines.map((line, index) => (
              <span key={index}>
                {line}
                {index < feature1Lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {/* 右侧内容区域 - 垂直居中 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-start"
          style={{ right: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.right) }}
        >

          {/* Top: Feature[0] - 支持多行，第一行白色（但-号用深色），其他行深色 */}
          <h1
            className="text-left font-paytone-one font-regular leading-tight"
            style={{
              fontSize: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.titleFontSize),
              WebkitTextStroke: `${rpxHero(4)} #000000`,
              paintOrder: 'stroke fill',
            }}
          >
            {feature0Lines.map((line, index) => (
              <div key={index} className={index === 0 ? 'text-[#FFFFFF]' : 'text-[#433E12]'}>
                {index === 0 ? (
                  // 第一行：把 - 号单独用深色
                  line.split(/(-)/g).map((part, partIndex) => (
                    part === '-' ? (
                      <span key={partIndex} className="text-[#433E12]">-</span>
                    ) : (
                      <span key={partIndex}>{part}</span>
                    )
                  ))
                ) : (
                  line
                )}
              </div>
            ))}
          </h1>

          {/* Bottom: Feature Stack (Oval shapes) */}
          <div
            className="space-y-6 w-fit mt-16"
            style={{ marginLeft: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.featureOffsetLeft) }}
          >
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#E9E2A0] flex items-center justify-center"
                style={{
                  width: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.featureWidth),
                  height: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.featureHeight),
                  clipPath: `url(#${ovalClipId})`,
                }}
              >
                <p
                  className="font-pingfang font-semibold text-[#000000]"
                  style={{
                    fontSize: rpxHero(DESKTOP_RIGHT_CONTENT_CONFIG.featureFontSize),
                    letterSpacing: '0.06em',
                  }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 4: Mobile Content (md以下) - 上下布局 */}
      <div className="md:hidden relative z-30 flex flex-col h-full">
        {/* 移动端光柱 */}
        {MOBILE_LIGHT_BEAMS.map((beam, index) => (
          <div
            key={`mobile-light-beam-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: beam.left,
              top: beam.top,
              transform: `rotate(${beam.rotation}deg)`,
              transformOrigin: 'left center',
              width: beam.width,
              height: beam.height,
              opacity: beam.opacity,
              background: `linear-gradient(to right, ${beam.gradientFrom}, ${beam.gradientTo})`,
              zIndex: 1,
            }}
          />
        ))}

        {/* 上部：标题 + Features - 使用配置的顶部留白 */}
        <div
          className="relative z-10 flex flex-col items-center justify-center px-6 pb-4"
          style={{ minHeight: MOBILE_CONFIG.topPadding }}
        >
          {/* 标题 - 支持多行，第一行白色（但-号用深色），其他行深色 */}
          <h1
            className="text-center text-3xl sm:text-4xl font-paytone-one font-regular leading-tight mb-4"
            style={{
              WebkitTextStroke: '2px #000000',
              paintOrder: 'stroke fill',
            }}
          >
            {feature0Lines.map((line, index) => (
              <div key={index} className={index === 0 ? 'text-[#FFFFFF]' : 'text-[#433E12]'}>
                {index === 0 ? (
                  // 第一行：把 - 号单独用深色
                  line.split(/(-)/g).map((part, partIndex) => (
                    part === '-' ? (
                      <span key={partIndex} className="text-[#433E12]">-</span>
                    ) : (
                      <span key={partIndex}>{part}</span>
                    )
                  ))
                ) : (
                  line
                )}
              </div>
            ))}
          </h1>

          {/* Feature 胶囊 */}
          <div className="flex flex-wrap justify-center gap-2">
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="bg-[#E9E2A0] px-4 py-2 flex items-center justify-center rounded-full"
              >
                <p className="text-xs font-pingfang font-semibold text-[#000000]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 下部：图片组合区域（撑满剩余空间） */}
        <div className="flex-1 relative w-full overflow-visible">
          {/* SVG 遮罩图片 - 贴左下角 */}
          <div
            className="absolute left-0 bottom-0"
            style={{
              height: MOBILE_CONFIG.svg.height,
              aspectRatio: MOBILE_CONFIG.svg.aspectRatio,
              maskImage: 'url(/hero-banner-7-1.svg)',
              WebkitMaskImage: 'url(/hero-banner-7-1.svg)',
              maskSize: MOBILE_CONFIG.svg.maskSize,
              WebkitMaskSize: MOBILE_CONFIG.svg.maskSize,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: MOBILE_CONFIG.svg.maskPosition,
              WebkitMaskPosition: MOBILE_CONFIG.svg.maskPosition,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                transform: `scale(${MOBILE_CONFIG.svg.imageScale})`,
                transformOrigin: 'center center',
              }}
            >
              <OptimizedImage
                image={data.images[0]}
                alt="Background"
                size="thumbnail"
                className="w-full h-full object-cover"
                objectPosition={MOBILE_CONFIG.svg.imagePosition}
              />
            </div>
          </div>

          {/* 菱形图片 */}
          {/* 顶部菱形 - 固定位置 */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: MOBILE_CONFIG.diamondTop.left,
              top: MOBILE_CONFIG.diamondTop.top,
              width: MOBILE_CONFIG.diamondTop.size,
              height: MOBILE_CONFIG.diamondTop.size,
              boxShadow: `0 0 0 ${MOBILE_CONFIG.diamondTop.borderWidth}px ${DIAMOND_TOP_CONFIG.borderColor}`,
              borderRadius: MOBILE_CONFIG.diamondTop.borderRadius,
              transform: 'rotate(45deg)',
              zIndex: 20,
            }}
          >
            <div className="relative w-full h-full" style={{ transform: `scale(${MOBILE_CONFIG.diamondTop.imageScale})` }}>
              <OptimizedImage
                image={data.images[1]}
                alt="Top rotated image"
                size="large"
                className="absolute inset-0 w-full h-full object-cover -rotate-45"
                objectPosition={diamondTopPosition}
                priority
              />
            </div>
          </div>

          {/* 中间菱形 */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: MOBILE_CONFIG.diamondMiddle.left,
              top: MOBILE_CONFIG.diamondMiddle.top,
              transform: 'translateY(-50%) rotate(45deg)',
              width: MOBILE_CONFIG.diamondMiddle.size,
              aspectRatio: '1',
              boxShadow: `0 0 0 ${MOBILE_CONFIG.diamondMiddle.borderWidth}px ${DIAMOND_MIDDLE_CONFIG.borderColor}`,
              borderRadius: MOBILE_CONFIG.diamondMiddle.borderRadius,
              zIndex: 20,
            }}
          >
            <div className="relative w-full h-full" style={{ transform: `scale(${MOBILE_CONFIG.diamondMiddle.imageScale})` }}>
              <OptimizedImage
                image={data.images[2]}
                alt="Middle rotated image"
                size="large"
                className="absolute inset-0 w-full h-full object-cover -rotate-45"
                objectPosition={diamondMiddlePosition}
                priority
              />
            </div>
          </div>

          {/* 底部菱形 - 固定位置 */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: MOBILE_CONFIG.diamondBottom.left,
              bottom: MOBILE_CONFIG.diamondBottom.bottom,
              width: MOBILE_CONFIG.diamondBottom.size,
              height: MOBILE_CONFIG.diamondBottom.size,
              boxShadow: `0 0 0 ${MOBILE_CONFIG.diamondBottom.borderWidth}px ${DIAMOND_BOTTOM_CONFIG.borderColor}`,
              borderRadius: MOBILE_CONFIG.diamondBottom.borderRadius,
              transform: 'rotate(45deg)',
              zIndex: 20,
            }}
          >
            <div className="relative w-full h-full" style={{ transform: `scale(${MOBILE_CONFIG.diamondBottom.imageScale})` }}>
              <OptimizedImage
                image={data.images[3]}
                alt="Bottom rotated image"
                size="large"
                className="absolute inset-0 w-full h-full object-cover -rotate-45"
                objectPosition={diamondBottomPosition}
                priority
              />
            </div>
          </div>

          {/* Feature[1] 文字 - 放在SVG区域内左下角 */}
          <div
            className="absolute z-30"
            style={{
              left: MOBILE_CONFIG.featureText.left,
              bottom: MOBILE_CONFIG.featureText.bottom,
            }}
          >
            <p
              className={`${MOBILE_CONFIG.featureText.fontSize} font-paytone-one font-regular text-white text-left`}
              style={{
                WebkitTextStroke: '2px #6B4E00',
                paintOrder: 'stroke fill',
              }}
            >
              {feature1Lines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < feature1Lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner7;