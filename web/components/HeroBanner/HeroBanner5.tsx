// components/HeroBanner/HeroBanner5.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// --- BannerProps Definition ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// 响应式尺寸函数 - 使用 CSS 变量 --rpx-hero
// 直接传入设计稿像素值，自动按比例缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// 移动端固定尺寸 (基于 1024px 断点计算的固定值)
const DESIGN_WIDTH = 1920;
const LG_BREAKPOINT = 1024;
const mobileFixedSize = (designValue: number) => {
  return `${((designValue / DESIGN_WIDTH) * LG_BREAKPOINT).toFixed(2)}px`;
};


// --- 文字配置 (基于 Figma 设计稿 1920x1080) ---
const TEXT_CONFIG = {
  // 左侧内容区域
  contentLeft: 130,              // 左边距
  contentTop: 180,               // 顶部距离 (原221，上移)
  // 第一行: "Design-forward" (Pavanam)
  line1FontSize: 90,
  line1LineHeight: 106,
  // 第二行: "Waterproof Bathroom" (Paytone One) - 两行
  line2FontSize: 120,
  line2LineHeight: 106,
  // 第三行: "Glass Clip" (Paytone One)
  line3FontSize: 90,
  line3LineHeight: 106,
  // Feature 背景条
  featureHeight: 75,
  featureWidths: [399, 474, 517],  // 递增宽度
  featureFontSize: 40,
  featureLineHeight: 91,
  featureGap: 20,                 // 间距
  // 右侧文字 (百分比定位)
  rightTextFontSize: 64,
  rightTextLineHeight: 81,
  rightTextRight: 5,              // 距离右边百分比
  rightTextTop: 66,               // 距离顶部百分比 (712/1080 ≈ 66%)
  rightTextMaxWidth: 586,         // 最大宽度，控制换行
};

// 移动端文字配置 (lg 以下)
const MOBILE_TEXT_CONFIG = {
  contentLeft: 24,
  contentTop: 80,                 // 距离顶部 (原40，下移)
  line1FontSize: 32,
  line1LineHeight: 40,
  line2FontSize: 48,
  line2LineHeight: 52,
  line3FontSize: 36,
  line3LineHeight: 44,
  featureHeight: 48,
  featureWidths: [260, 300, 340],
  featureFontSize: 18,
  featureLineHeight: 48,
  featureGap: 12,
  rightTextFontSize: 24,
  rightTextLineHeight: 32,
};

// --- 菱形配置 ---
// 注意: imageScale 最小值应为 √2 ≈ 1.42，否则旋转45度后图片无法完全覆盖菱形
const DIAMOND_CONFIG = {
  // 中间纯色菱形 (无图片) - 居右定位
  center: {
    size: 600,           // 正方形边长
    top: 50,             // 距离顶部百分比
    right: 20,            // 距离右边百分比
    borderRadius: 100,    // 圆角
    backgroundColor: '#AEA76D',
  },
  // 左上角图片菱形
  topLeft: {
    size: 470,
    top: -5,             // 距离顶部百分比
    left: 47,            // 距离左边百分比
    borderRadius: 100,
    borderWidth: 19,
    borderColor: '#756F3F',
    imageScale: 1.5,     // 图片缩放
    imageOffsetX: 0,     // 图片水平偏移 (负值往左，正值往右，百分比)
    imageOffsetY: 0,     // 图片垂直偏移 (负值往上，正值往下，百分比)
  },
  // 左下角图片菱形
  bottomLeft: {
    size: 470,
    bottom: -5,          // 距离底部百分比
    left: 47,            // 距离左边百分比
    borderRadius: 100,
    borderWidth: 19,
    borderColor: '#756F3F',
    imageScale: 1.5,
    imageOffsetX: 0,
    imageOffsetY: 0,
  },
  // 右边大图片菱形
  right: {
    size: 1060,
    top: 50,             // 距离顶部百分比 (垂直居中)
    right: -18,          // 桌面端距离右边百分比
    rightMobile: -30,    // 移动端距离右边百分比 (lg以下)
    borderRadius: 100,
    borderWidth: 23,
    borderColor: '#756F3F',
    imageScale: 1.42,
    imageOffsetX: -20,     // 图片水平偏移 (负值往左，正值往右，百分比)
    imageOffsetY: 0,     // 图片垂直偏移 (负值往上，正值往下，百分比)
  },
};

// --- HeroBanner5 Component ---
const HeroBanner5: FC<BannerProps> = ({ data }) => {
  // --- Split Feature[0] ---
  // 格式: "Design-forward  Waterproof /nBathroom  Glass Clip"
  // 用双空格分隔各部分，/n 表示换行
  // line1: Design-forward (Pavanam 90px)
  // line2: Waterproof /n Bathroom (Paytone One 120px)
  // line3: Glass Clip (Paytone One 90px)
  const feature0Text = data.features[0] || "";
  const parts = feature0Text.split(/\s{2,}/);  // 按双空格或更多空格分割
  const titleLine1 = parts[0] || "";  // Design-forward
  const titleLine2 = (parts[1] || "").replace(/\/n/g, '\n');  // Waterproof /n Bathroom -> 换行
  const titleLine3 = parts[2] || "";  // Glass Clip

  return (
    <section className="relative w-full h-full overflow-hidden font-sans">
      {/* 背景颜色层 */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: '#fffbf2' }}
      />

      {/* 菱形元素容器 - 桌面端 (lg及以上) */}
      <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
        {/* 中间纯色菱形 - 居右定位 */}
        <div
          className="absolute"
          style={{
            width: rpx(DIAMOND_CONFIG.center.size),
            height: rpx(DIAMOND_CONFIG.center.size),
            top: `${DIAMOND_CONFIG.center.top}%`,
            right: `${DIAMOND_CONFIG.center.right}%`,
            transform: 'translateY(-50%) rotate(45deg)',
            borderRadius: rpx(DIAMOND_CONFIG.center.borderRadius),
            backgroundColor: DIAMOND_CONFIG.center.backgroundColor,
          }}
        />

        {/* 左上图片菱形 - 按vw缩放 */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: rpx(DIAMOND_CONFIG.topLeft.size),
            height: rpx(DIAMOND_CONFIG.topLeft.size),
            top: `${DIAMOND_CONFIG.topLeft.top}%`,
            left: `${DIAMOND_CONFIG.topLeft.left}%`,
            transform: 'translate(-50%, 0) rotate(45deg)',
            borderRadius: rpx(DIAMOND_CONFIG.topLeft.borderRadius),
            borderWidth: rpx(DIAMOND_CONFIG.topLeft.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.topLeft.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.topLeft.imageScale}) translate(${DIAMOND_CONFIG.topLeft.imageOffsetX}%, ${DIAMOND_CONFIG.topLeft.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Top left image"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 左下图片菱形 - 按vw缩放 */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: rpx(DIAMOND_CONFIG.bottomLeft.size),
            height: rpx(DIAMOND_CONFIG.bottomLeft.size),
            bottom: `${DIAMOND_CONFIG.bottomLeft.bottom}%`,
            left: `${DIAMOND_CONFIG.bottomLeft.left}%`,
            transform: 'translate(-50%, 0) rotate(45deg)',
            borderRadius: rpx(DIAMOND_CONFIG.bottomLeft.borderRadius),
            borderWidth: rpx(DIAMOND_CONFIG.bottomLeft.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.bottomLeft.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.bottomLeft.imageScale}) translate(${DIAMOND_CONFIG.bottomLeft.imageOffsetX}%, ${DIAMOND_CONFIG.bottomLeft.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[2]}
              alt="Bottom left image"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 右边大图片菱形 - 继续缩放 */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: rpx(DIAMOND_CONFIG.right.size),
            height: rpx(DIAMOND_CONFIG.right.size),
            top: `${DIAMOND_CONFIG.right.top}%`,
            right: `${DIAMOND_CONFIG.right.right}%`,
            transform: 'translateY(-50%) rotate(45deg)',
            borderRadius: rpx(DIAMOND_CONFIG.right.borderRadius),
            borderWidth: rpx(DIAMOND_CONFIG.right.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.right.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.right.imageScale}) translate(${DIAMOND_CONFIG.right.imageOffsetX}%, ${DIAMOND_CONFIG.right.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[3]}
              alt="Right large image"
              size="xlarge"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 菱形元素容器 - 移动端 (lg以下) */}
      <div className="lg:hidden absolute inset-0 z-10 pointer-events-none">
        {/* 中间纯色菱形 - 居右定位 */}
        <div
          className="absolute"
          style={{
            width: mobileFixedSize(DIAMOND_CONFIG.center.size),
            height: mobileFixedSize(DIAMOND_CONFIG.center.size),
            top: `${DIAMOND_CONFIG.center.top}%`,
            right: `${DIAMOND_CONFIG.center.right}%`,
            transform: 'translateY(-50%) rotate(45deg)',
            borderRadius: mobileFixedSize(DIAMOND_CONFIG.center.borderRadius),
            backgroundColor: DIAMOND_CONFIG.center.backgroundColor,
          }}
        />

        {/* 左上图片菱形 - 移动端固定尺寸 (基于1024px断点缩放) */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: mobileFixedSize(DIAMOND_CONFIG.topLeft.size),
            height: mobileFixedSize(DIAMOND_CONFIG.topLeft.size),
            top: `${DIAMOND_CONFIG.topLeft.top}%`,
            left: `${DIAMOND_CONFIG.topLeft.left}%`,
            transform: 'translate(-50%, 0) rotate(45deg)',
            borderRadius: mobileFixedSize(DIAMOND_CONFIG.topLeft.borderRadius),
            borderWidth: mobileFixedSize(DIAMOND_CONFIG.topLeft.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.topLeft.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.topLeft.imageScale}) translate(${DIAMOND_CONFIG.topLeft.imageOffsetX}%, ${DIAMOND_CONFIG.topLeft.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[1]}
              alt="Top left image"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 左下图片菱形 - 移动端固定尺寸 (基于1024px断点缩放) */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: mobileFixedSize(DIAMOND_CONFIG.bottomLeft.size),
            height: mobileFixedSize(DIAMOND_CONFIG.bottomLeft.size),
            bottom: `${DIAMOND_CONFIG.bottomLeft.bottom}%`,
            left: `${DIAMOND_CONFIG.bottomLeft.left}%`,
            transform: 'translate(-50%, 0) rotate(45deg)',
            borderRadius: mobileFixedSize(DIAMOND_CONFIG.bottomLeft.borderRadius),
            borderWidth: mobileFixedSize(DIAMOND_CONFIG.bottomLeft.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.bottomLeft.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.bottomLeft.imageScale}) translate(${DIAMOND_CONFIG.bottomLeft.imageOffsetX}%, ${DIAMOND_CONFIG.bottomLeft.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[2]}
              alt="Bottom left image"
              size="large"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 右边大图片菱形 - 移动端使用 rightMobile */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: rpx(DIAMOND_CONFIG.right.size),
            height: rpx(DIAMOND_CONFIG.right.size),
            top: `${DIAMOND_CONFIG.right.top}%`,
            right: `${DIAMOND_CONFIG.right.rightMobile}%`,
            transform: 'translateY(-50%) rotate(45deg)',
            borderRadius: rpx(DIAMOND_CONFIG.right.borderRadius),
            borderWidth: rpx(DIAMOND_CONFIG.right.borderWidth),
            borderStyle: 'solid',
            borderColor: DIAMOND_CONFIG.right.borderColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(-45deg) scale(${DIAMOND_CONFIG.right.imageScale}) translate(${DIAMOND_CONFIG.right.imageOffsetX}%, ${DIAMOND_CONFIG.right.imageOffsetY}%)`,
            }}
          >
            <OptimizedImage
              image={data.images[3]}
              alt="Right large image"
              size="xlarge"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 内容层 - 桌面端 (lg及以上) */}
      <div className="hidden lg:block relative z-30 h-full w-full">
        {/* --- Left Column (Text) - 垂直居中 --- */}
        <div
          className="absolute flex flex-col justify-center text-left h-full"
          style={{
            left: rpx(TEXT_CONFIG.contentLeft),
            top: 0,
          }}
        >
          {/* Feature[0] - 标题区域 */}
          <h1 className="text-[#433E12]">
            {/* 第一行: Design-forward (Pavanam) */}
            <div
              className="font-pavanam font-normal"
              style={{
                fontSize: rpx(TEXT_CONFIG.line1FontSize),
                lineHeight: rpx(TEXT_CONFIG.line1LineHeight),
              }}
            >
              {titleLine1}
            </div>
            {/* 第二行: Waterproof Bathroom (Paytone One 120px) */}
            <div
              className="font-paytone-one font-normal whitespace-pre-line"
              style={{
                fontSize: rpx(TEXT_CONFIG.line2FontSize),
                lineHeight: rpx(TEXT_CONFIG.line2LineHeight),
              }}
            >
              {titleLine2}
            </div>
            {/* 第三行: Glass Clip (Paytone One 90px) */}
            <div
              className="font-paytone-one font-normal"
              style={{
                fontSize: rpx(TEXT_CONFIG.line3FontSize),
                lineHeight: rpx(TEXT_CONFIG.line3LineHeight),
              }}
            >
              {titleLine3}
            </div>
          </h1>

          {/* Feature Stack (渐变背景条) */}
          <div
            className="flex flex-col"
            style={{
              gap: rpx(TEXT_CONFIG.featureGap),
              marginTop: rpx(20),
            }}
          >
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="flex items-center"
                style={{
                  width: rpx(TEXT_CONFIG.featureWidths[index]),
                  height: rpx(TEXT_CONFIG.featureHeight),
                  background: 'linear-gradient(to right, rgba(164, 148, 12, 0.52) 0%, rgba(132, 123, 44, 0) 100%)',
                }}
              >
                <p
                  className="font-pingfang font-semibold text-black"
                  style={{
                    fontSize: rpx(TEXT_CONFIG.featureFontSize),
                    lineHeight: rpx(TEXT_CONFIG.featureLineHeight),
                    paddingLeft: rpx(16),
                  }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Side (Feature[1]) --- */}
        <div
          className="absolute"
          style={{
            right: `${TEXT_CONFIG.rightTextRight}%`,
            top: `${TEXT_CONFIG.rightTextTop}%`,
            maxWidth: rpx(TEXT_CONFIG.rightTextMaxWidth),
          }}
        >
          <p
            className="font-paytone-one font-normal text-white text-stroke-custom-white text-left"
            style={{
              fontSize: rpx(TEXT_CONFIG.rightTextFontSize),
              lineHeight: rpx(TEXT_CONFIG.rightTextLineHeight),
            }}
          >
            {data.features[1]?.replace(/\/n/g, '\n')}
          </p>
        </div>
      </div>

      {/* 内容层 - 移动端 (lg以下) */}
      <div className="lg:hidden relative z-30 h-full w-full">
        {/* --- Left Column (Text) --- */}
        <div
          className="absolute flex flex-col text-left"
          style={{
            left: `${MOBILE_TEXT_CONFIG.contentLeft}px`,
            top: `${MOBILE_TEXT_CONFIG.contentTop}px`,
          }}
        >
          {/* Feature[0] - 标题区域 */}
          <h1 className="text-[#433E12]">
            <div
              className="font-pavanam font-normal"
              style={{
                fontSize: `${MOBILE_TEXT_CONFIG.line1FontSize}px`,
                lineHeight: `${MOBILE_TEXT_CONFIG.line1LineHeight}px`,
              }}
            >
              {titleLine1}
            </div>
            <div
              className="font-paytone-one font-normal whitespace-pre-line"
              style={{
                fontSize: `${MOBILE_TEXT_CONFIG.line2FontSize}px`,
                lineHeight: `${MOBILE_TEXT_CONFIG.line2LineHeight}px`,
              }}
            >
              {titleLine2}
            </div>
            <div
              className="font-paytone-one font-normal"
              style={{
                fontSize: `${MOBILE_TEXT_CONFIG.line3FontSize}px`,
                lineHeight: `${MOBILE_TEXT_CONFIG.line3LineHeight}px`,
              }}
            >
              {titleLine3}
            </div>
          </h1>

          {/* Feature Stack (渐变背景条) */}
          <div
            className="flex flex-col"
            style={{
              gap: `${MOBILE_TEXT_CONFIG.featureGap}px`,
              marginTop: '16px',
            }}
          >
            {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
              <div
                key={index}
                className="flex items-center"
                style={{
                  width: `${MOBILE_TEXT_CONFIG.featureWidths[index]}px`,
                  height: `${MOBILE_TEXT_CONFIG.featureHeight}px`,
                  background: 'linear-gradient(to right, rgba(164, 148, 12, 0.52) 0%, rgba(132, 123, 44, 0) 100%)',
                }}
              >
                <p
                  className="font-pingfang font-semibold text-black"
                  style={{
                    fontSize: `${MOBILE_TEXT_CONFIG.featureFontSize}px`,
                    lineHeight: `${MOBILE_TEXT_CONFIG.featureLineHeight}px`,
                    paddingLeft: '12px',
                  }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Bottom (Feature[1]) - 移动端 --- */}
        <div
          className="absolute right-4 bottom-8"
        >
          <p
            className="font-paytone-one font-normal text-white text-stroke-custom-white whitespace-pre-line text-right"
            style={{
              fontSize: `${MOBILE_TEXT_CONFIG.rightTextFontSize}px`,
              lineHeight: `${MOBILE_TEXT_CONFIG.rightTextLineHeight}px`,
            }}
          >
            {data.features[1]}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner5;
