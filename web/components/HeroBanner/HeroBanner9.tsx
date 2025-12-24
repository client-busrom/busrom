// components/HeroBanner/HeroBanner9.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- 响应式尺寸函数 ---
const rpxHero = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 桌面端配置 (基于 Figma 设计稿 1920x1080) ---
const DESKTOP_CONFIG = {
  // 背景色
  backgroundColor: '#99935f',

  // SVG 遮罩图片配置 (黑色区域用于填充 data.images[0])
  // 黑色多边形大约从 x=-262 到 x=1332，宽度约 1594
  // 高度从 y=-179 到 y=1258，高度约 1437（超出 viewBox）
  maskImage: {
    // 遮罩区域的边界框（用于计算图片容器尺寸）
    // 左边界约 0（clipPath 裁剪），右边界约 1332
    width: 1332,
    aspectRatio: 1332 / 1080,  // 遮罩可见区域宽高比
    svgAspectRatio: 1920 / 1080,  // 完整 SVG 宽高比
  },

  // 装饰 SVG (hero-banner-9-2.svg) 配置
  decorativeSvg: {
    width: 887,            // SVG 原始宽度
    height: 489,           // SVG 原始高度
    bottom: 0,           // 底部定位
    left: 0,            // 左侧定位
  },

  // 左下角菱形图片 (data.images[1])
  diamondImage: {
    size: 400,             // 正方形尺寸
    borderRadius: 80,      // 圆角
    rotation: 45,          // 旋转角度 (正45度形成菱形)
    bottom: -50,          // 底部定位
    left: -20,             // 左侧定位
    imageScale: 1.4,       // 图片缩放比例
    imageOffsetX: 0,       // 图片水平偏移
    imageOffsetY: 0,       // 图片垂直偏移
  },

  // 左下角 Feature 文字 [2,3,4]
  featureText: {
    bottom: 80,            // 底部定位
    left: 450,             // 左侧定位
    fontSize: 32,          // 字体大小
    strokeColor: '#6B4E00', // 描边颜色
    strokeWidth: 2,        // 描边宽度
    gap: 8,                // 文字间距
    color: '#FFA836',      // 文字颜色
  },

  // 左下角元素容器
  leftContainer: {
    width: 900,            // 容器宽度
    height: 600,           // 容器高度
  },

  // 右侧标题区域
  title: {
    fontSize: 100,         // 字体大小
    rotation: -1.81,       // 旋转角度
    lineHeight: 1.1,
    right: '5%',           // 右边距（百分比）
    top: 140,               // 顶部距离
    color: '#3C3712',      // 文字颜色
    strokeColor: '#ffffff', // 描边颜色
    strokeWidth: 2,        // 描边宽度
    // SVG 背景框参数
    svgPaddingLeft: 24,    // 文字左内边距
    svgPaddingRight: 100,  // 文字右内边距
    svgPaddingTop: 16,     // 文字上内边距
    svgPaddingBottom: 16,  // 文字下内边距
    svgOffsetLeft: -30,    // SVG 左偏移
    svgOffsetTop: -20,     // SVG 上偏移
    svgExtraWidth: 160,    // SVG 额外宽度
    svgExtraHeight: 40,    // SVG 额外高度
    gap: 32,               // 行间距
  },

  // 右侧 Feature[1] 文字
  feature1: {
    fontSize: 64,          // 字体大小
    right: '5%',           // 右边距（百分比）
    topOffset: 580,        // 相对标题的顶部偏移
  },
};


// --- 背景 SVG 配置 ---
const BLOCK_SVGS = [
  '/bannerBlock1.svg',
  '/bannerBlock2.svg',
  '/bannerBlock3.svg',
];

// --- 断点缩放比例 ---
const LG_SCALE = 1024 / 1920;  // lg 断点时 (1024px)

// --- FeatureBlock 组件 (右侧标题块，使用 SVG 背景框) ---
type FeatureBlockProps = {
  lines: string[];
  fontSize: number;
  rotation: number;
  lineHeight: number;
  useRpxHero?: boolean;
};

const FeatureBlock: FC<FeatureBlockProps> = ({ lines, fontSize, rotation, lineHeight, useRpxHero = true }) => {
  const config = DESKTOP_CONFIG.title;
  // lg 以上用 rpxHero 缩放，lg 以下用 1024 时的固定像素
  const size = (value: number) => useRpxHero ? rpxHero(value) : `${value * LG_SCALE}px`;

  return (
    <div className="relative inline-block overflow-visible">
      {/* 每行文字 */}
      <div
        className="relative flex flex-col overflow-visible"
        style={{ gap: size(config.gap) }}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className="relative overflow-visible"
          >
            {/* SVG 背景块 - 不旋转 */}
            <img
              src={BLOCK_SVGS[index % BLOCK_SVGS.length]}
              alt=""
              className="absolute object-fill pointer-events-none"
              style={{
                left: size(config.svgOffsetLeft),
                top: size(config.svgOffsetTop),
                width: `calc(100% + ${size(config.svgExtraWidth)})`,
                height: `calc(100% + ${size(config.svgExtraHeight)})`,
              }}
            />
            {/* 文字 - 只有文字旋转 */}
            <h1
              className="relative font-paytone-one font-regular whitespace-nowrap"
              style={{
                fontSize: size(fontSize),
                lineHeight: lineHeight,
                paddingLeft: size(config.svgPaddingLeft),
                paddingRight: size(config.svgPaddingRight),
                paddingTop: size(config.svgPaddingTop),
                paddingBottom: size(config.svgPaddingBottom),
                transform: `rotate(${rotation}deg)`,
                color: config.color,
                WebkitTextStroke: `${config.strokeWidth}px ${config.strokeColor}`,
              }}
            >
              {line}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HeroBanner9 Component ---
const HeroBanner9: FC<BannerProps> = ({ data }) => {
  // --- Split Feature[0] (支持换行: \n, \\n, /n) ---
  const feature0Text = data.features[0] || "";
  const feature0Lines = feature0Text.split(/\n|\\n|\/n/);

  return (
    <section
      className="relative w-full h-full min-h-[700px] overflow-hidden font-sans"
      style={{ backgroundColor: DESKTOP_CONFIG.backgroundColor }}
    >
      {/* Layer 1: SVG 装饰层 (hero-banner-9-1.svg) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/hero-banner-9-1.svg)',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Layer 2: 背景图片 (data.images[0]) 通过 mask 裁剪显示在上层 */}
      <div
        className="absolute left-0 top-0 h-full z-10"
        style={{
          // 宽度 = 高度 × 遮罩区域宽高比
          aspectRatio: DESKTOP_CONFIG.maskImage.aspectRatio,
          maskImage: 'url(/hero-banner-9-mask.svg)',
          WebkitMaskImage: 'url(/hero-banner-9-mask.svg)',
          // 遮罩大小：让 SVG 高度 = 容器高度
          maskSize: `${100 * (1920 / DESKTOP_CONFIG.maskImage.width)}% 100%`,
          WebkitMaskSize: `${100 * (1920 / DESKTOP_CONFIG.maskImage.width)}% 100%`,
          // 遮罩左对齐
          maskPosition: 'left center',
          WebkitMaskPosition: 'left center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        <OptimizedImage
          image={data.images[0]}
          alt="Background"
          size="medium"
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* 左下角元素容器 - lg 及以上固定像素 */}
      <div className="hidden lg:block absolute bottom-0 left-0 z-[15] overflow-visible" style={{ width: DESKTOP_CONFIG.leftContainer.width, height: DESKTOP_CONFIG.leftContainer.height }}>
        {/* Layer 3: 装饰 SVG (hero-banner-9-2.svg) */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: DESKTOP_CONFIG.decorativeSvg.bottom,
            left: DESKTOP_CONFIG.decorativeSvg.left,
            width: DESKTOP_CONFIG.decorativeSvg.width,
            height: DESKTOP_CONFIG.decorativeSvg.height,
            backgroundImage: 'url(/hero-banner-9-2.svg)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Layer 4: 左下角菱形图片 (data.images[1]) */}
        <div
          className="absolute overflow-hidden shadow-2xl z-20"
          style={{
            bottom: DESKTOP_CONFIG.diamondImage.bottom,
            left: DESKTOP_CONFIG.diamondImage.left,
            width: DESKTOP_CONFIG.diamondImage.size,
            height: DESKTOP_CONFIG.diamondImage.size,
            borderRadius: DESKTOP_CONFIG.diamondImage.borderRadius,
            transform: `rotate(${DESKTOP_CONFIG.diamondImage.rotation}deg)`,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `scale(${DESKTOP_CONFIG.diamondImage.imageScale}) translate(${DESKTOP_CONFIG.diamondImage.imageOffsetX}px, ${DESKTOP_CONFIG.diamondImage.imageOffsetY}px)`,
              transformOrigin: 'center center',
            }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Product Focus"
              size="thumbnail"
              className="absolute inset-0 w-full h-full object-cover -rotate-45"
              priority
            />
          </div>
        </div>
        {/* Layer 5: 左下角 Feature 文字 [2,3,4] */}
        <div
          className="absolute z-30 flex flex-col"
          style={{
            bottom: DESKTOP_CONFIG.featureText.bottom,
            left: DESKTOP_CONFIG.featureText.left,
            gap: DESKTOP_CONFIG.featureText.gap,
          }}
        >
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
            <h2
              key={index}
              className="font-paytone-one font-regular text-center"
              style={{
                fontSize: DESKTOP_CONFIG.featureText.fontSize,
                color: DESKTOP_CONFIG.featureText.color,
                WebkitTextStroke: `${DESKTOP_CONFIG.featureText.strokeWidth}px ${DESKTOP_CONFIG.featureText.strokeColor}`,
              }}
            >
              {feature}
            </h2>
          ))}
        </div>
      </div>

      {/* 左下角元素容器 - lg 以下用 LG_SCALE 固定缩放 */}
      <div
        className="lg:hidden absolute bottom-0 left-0 z-[15] origin-bottom-left overflow-visible"
        style={{
          width: DESKTOP_CONFIG.leftContainer.width,
          height: DESKTOP_CONFIG.leftContainer.height,
          transform: `scale(${LG_SCALE})`,
        }}
      >
        {/* Layer 3: 装饰 SVG (hero-banner-9-2.svg) */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: DESKTOP_CONFIG.decorativeSvg.bottom,
            left: DESKTOP_CONFIG.decorativeSvg.left,
            width: DESKTOP_CONFIG.decorativeSvg.width,
            height: DESKTOP_CONFIG.decorativeSvg.height,
            backgroundImage: 'url(/hero-banner-9-2.svg)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Layer 4: 左下角菱形图片 (data.images[1]) */}
        <div
          className="absolute overflow-hidden shadow-2xl z-20"
          style={{
            bottom: DESKTOP_CONFIG.diamondImage.bottom,
            left: DESKTOP_CONFIG.diamondImage.left,
            width: DESKTOP_CONFIG.diamondImage.size,
            height: DESKTOP_CONFIG.diamondImage.size,
            borderRadius: DESKTOP_CONFIG.diamondImage.borderRadius,
            transform: `rotate(${DESKTOP_CONFIG.diamondImage.rotation}deg)`,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `scale(${DESKTOP_CONFIG.diamondImage.imageScale}) translate(${DESKTOP_CONFIG.diamondImage.imageOffsetX}px, ${DESKTOP_CONFIG.diamondImage.imageOffsetY}px)`,
              transformOrigin: 'center center',
            }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Product Focus"
              size="thumbnail"
              className="absolute inset-0 w-full h-full object-cover -rotate-45"
              priority
            />
          </div>
        </div>
        {/* Layer 5: 左下角 Feature 文字 [2,3,4] */}
        <div
          className="absolute z-30 flex flex-col"
          style={{
            bottom: DESKTOP_CONFIG.featureText.bottom,
            left: DESKTOP_CONFIG.featureText.left,
            gap: DESKTOP_CONFIG.featureText.gap,
          }}
        >
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
            <h2
              key={index}
              className="font-paytone-one font-regular text-center"
              style={{
                fontSize: DESKTOP_CONFIG.featureText.fontSize,
                color: DESKTOP_CONFIG.featureText.color,
                WebkitTextStroke: `${DESKTOP_CONFIG.featureText.strokeWidth}px ${DESKTOP_CONFIG.featureText.strokeColor}`,
              }}
            >
              {feature}
            </h2>
          ))}
        </div>
      </div>

      {/* Layer 6: 右侧标题 (Feature[0]) - lg 以上用 rpxHero 缩放 */}
      <div
        className="hidden lg:block absolute z-20"
        style={{
          right: DESKTOP_CONFIG.title.right,
          top: rpxHero(DESKTOP_CONFIG.title.top),
        }}
      >
        <FeatureBlock
          lines={feature0Lines}
          fontSize={DESKTOP_CONFIG.title.fontSize}
          rotation={DESKTOP_CONFIG.title.rotation}
          lineHeight={DESKTOP_CONFIG.title.lineHeight}
          useRpxHero={true}
        />
      </div>

      {/* Layer 6: 右侧标题 (Feature[0]) - lg 以下用 1024 时的固定像素 */}
      <div
        className="lg:hidden absolute z-20"
        style={{
          right: DESKTOP_CONFIG.title.right,
          top: DESKTOP_CONFIG.title.top * LG_SCALE,
        }}
      >
        <FeatureBlock
          lines={feature0Lines}
          fontSize={DESKTOP_CONFIG.title.fontSize}
          rotation={DESKTOP_CONFIG.title.rotation}
          lineHeight={DESKTOP_CONFIG.title.lineHeight}
          useRpxHero={false}
        />
      </div>

      {/* Layer 7: 右侧 Feature[1] 文字 - lg 以上用 rpxHero 缩放 */}
      <div
        className="hidden lg:block absolute z-20"
        style={{
          right: DESKTOP_CONFIG.feature1.right,
          top: rpxHero(DESKTOP_CONFIG.title.top + DESKTOP_CONFIG.feature1.topOffset),
        }}
      >
        <h1
          className="font-paytone-one font-regular text-white text-stroke-custom-white"
          style={{
            fontSize: rpxHero(DESKTOP_CONFIG.feature1.fontSize),
          }}
        >
          {(data.features[1] || "").split(/\n|\\n|\/n/).map((line, index, arr) => (
            <span key={index}>
              {line}
              {index < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </div>

      {/* Layer 7: 右侧 Feature[1] 文字 - lg 以下用 1024 时的固定像素 */}
      <div
        className="lg:hidden absolute z-20"
        style={{
          right: DESKTOP_CONFIG.feature1.right,
          top: (DESKTOP_CONFIG.title.top + DESKTOP_CONFIG.feature1.topOffset) * LG_SCALE,
        }}
      >
        <h1
          className="font-paytone-one font-regular text-white text-stroke-custom-white"
          style={{
            fontSize: DESKTOP_CONFIG.feature1.fontSize * LG_SCALE,
          }}
        >
          {(data.features[1] || "").split(/\n|\\n|\/n/).map((line, index, arr) => (
            <span key={index}>
              {line}
              {index < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </div>

    </section>
  );
};

export default HeroBanner9;
