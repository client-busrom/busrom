// components/HeroBanner/HeroBanner3.tsx
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { getCropStyles, getCropImageUrl, getObjectPosition } from "@/lib/utils";

// --- 基础配置 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
};

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const renderHighlightedText = (text: string | undefined) => {
  if (!text) return null;
  const formatted = formatText(text);
  const trimmed = formatted.trimEnd();
  const lastSpaceIndex = trimmed.lastIndexOf(" ");

  if (lastSpaceIndex === -1) return formatted;

  const mainPart = trimmed.substring(0, lastSpaceIndex);
  const lastWord = trimmed.substring(lastSpaceIndex); // 包含那个空格

  return (
    <>
      {mainPart}
      <span className="text-[#F98538] font-bold">{lastWord}</span>
    </>
  );
};

// ========================================
// 1920x922 设计稿参数配置
// ========================================
const BANNER_3_ASSETS = {
  // 左侧背景装饰
  decorator: {
    width: 959,
    height: 922,
    src: "/home/hero-banner/banner-3/hero-banner-3-decorator.svg",
  },
  // 右侧三柱
  columns: {
    width: 240,
    height: 880,
    gap: 20,
  },
};

// ========================================
// 助手组件：高清图片渲染
// ========================================
const renderImage = (image: any, cropData: any, alt: string) => {
  if (!image) return null;

  const cropStyles = getCropStyles(cropData);
  if (cropStyles && cropData?.croppedAreaPixels) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            ...cropStyles.container,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={getCropImageUrl(image, cropData)}
            alt={alt}
            className="max-w-none"
            style={{
              ...cropStyles.image,
              width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
              height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
              left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
              top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ objectPosition: getObjectPosition(image) }}
    />
  );
};

const HeroBanner3: FC<BannerProps> = ({ data }) => {
  return (
    <section className="relative w-full h-full overflow-hidden bg-[#6E6941]">
      {/* 1. 背景装饰层 (对齐 HeroBanner2 模式) */}
      <div className="absolute top-0 z-0 h-full pointer-events-none opacity-40 xl:opacity-100">
        <div
          className="relative left-0 xl:left-[calc(var(--rpx-hero,1)*96px)]"
          style={{
            width: rpx(BANNER_3_ASSETS.decorator.width),
            height: rpx(BANNER_3_ASSETS.decorator.height),
          }}
        >
          <img
            src={BANNER_3_ASSETS.decorator.src}
            alt=""
            className="w-full h-full object-contain object-left-top"
          />
        </div>
      </div>

      {/* 2. 桌面端布局 (xl: 1280px+) - 对齐 HeroBanner1/2 绝对定位模式 */}
      <div className="hidden xl:block relative z-20 w-full h-full max-w-[1920px] mx-auto">
        {/* 文字内容区: 绝对定位锁定 */}
        <div
          className="absolute z-20 flex flex-col items-start text-left"
          style={{ left: rpx(186), top: rpx(140) }}
        >
          {/* 副标题 */}
          <p
            className="font-montserrat font-normal text-black whitespace-pre-line mb-2"
            style={{ fontSize: rpx(36) }}
          >
            {renderHighlightedText(data.features[1])}
          </p>

          {/* 主标题 */}
          <h1
            className="font-paytone-one text-black whitespace-pre-line leading-[1.1] mb-12"
            style={{
              fontSize: rpx(90),
              WebkitTextStroke: `${rpx(6)} #FDF6C2`,
              paintOrder: "stroke fill",
            }}
          >
            {formatText(data.features[0])}
          </h1>

          {/* Feature 按钮组 */}
          <div className="flex flex-col ml-12" style={{ gap: rpx(24) }}>
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center overflow-hidden shadow-lg"
                  style={{
                    width: rpx(500),
                    height: rpx(80),
                    background:
                      index % 2 === 0
                        ? "linear-gradient(90deg, rgba(249, 133, 56) 0%, rgba(249, 133, 56) 100%)"
                        : "linear-gradient(90deg, rgba(73, 69, 38) 0%, rgba(73, 69, 38) 100%)",
                    borderRadius: rpx(40),
                  }}
                >
                  <p
                    className="font-montserrat font-bold text-[#FFF5AD]"
                    style={{
                      fontSize: rpx(30),
                      letterSpacing: "0.05em",
                    }}
                  >
                    {feature}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* 右侧三柱图片区: 绝对定位锁定 */}
        <div
          className="absolute flex items-center"
          style={{
            right: rpx(120),
            top: rpx(0),
            bottom: rpx(80),
            gap: rpx(BANNER_3_ASSETS.columns.gap),
          }}
        >
          {/* 柱 1: 贴顶 */}
          <div
            className="relative self-start rounded-b-full overflow-hidden"
            style={{
              width: rpx(BANNER_3_ASSETS.columns.width),
              height: rpx(BANNER_3_ASSETS.columns.height),
            }}
          >
            {renderImage(data.images[0], data.imageCropDataList?.[0], "Item 1")}
          </div>

          {/* 柱 2: 贴底 */}
          <div
            className="relative self-start rounded-t-full overflow-hidden"
            style={{
              width: rpx(BANNER_3_ASSETS.columns.width),
              height: rpx(BANNER_3_ASSETS.columns.height),
            }}
          >
            {renderImage(data.images[1], data.imageCropDataList?.[1], "Item 2")}
          </div>

          {/* 柱 3: 贴顶 */}
          <div
            className="relative self-start rounded-b-full overflow-hidden"
            style={{
              width: rpx(BANNER_3_ASSETS.columns.width),
              height: rpx(BANNER_3_ASSETS.columns.height),
            }}
          >
            {renderImage(data.images[2], data.imageCropDataList?.[2], "Item 3")}
          </div>
        </div>
      </div>

      {/* 3. 移动端/平板端布局 (xl: <1280px) */}
      <div className="flex xl:hidden absolute inset-0 z-30 overflow-y-auto w-full h-full">
        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-10 text-center gap-8 md:gap-14">
          {/* 上方部分 (文字内容) */}
          <div className="flex flex-col items-center w-full">
            {/* 副标题 */}
            <p
              className="font-montserrat font-normal text-black whitespace-pre-line mb-3"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)" }}
            >
              {renderHighlightedText(data.features[1])}
            </p>

            {/* 主标题 */}
            <h1
              className="font-paytone-one text-black whitespace-pre-line leading-[1.1] mb-6 md:mb-10"
              style={{
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                WebkitTextStroke: "2px #FDF6C2",
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])}
            </h1>

            {/* Feature 按钮组 */}
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-center h-10 md:h-12 px-6 overflow-hidden shadow-sm"
                    style={{
                      background:
                        index % 2 === 0
                          ? "linear-gradient(90deg, rgba(249, 133, 56, 0.9) 0%, rgba(249, 133, 56, 0.7) 100%)"
                          : "linear-gradient(90deg, rgba(73, 69, 38, 0.9) 0%, rgba(73, 69, 38, 0.7) 100%)",
                      borderRadius: "999px",
                    }}
                  >
                    <p
                      className="font-montserrat font-bold text-[#FFF5AD]"
                      style={{
                        fontSize: "clamp(0.75rem, 2vw, 1rem)",
                      }}
                    >
                      {feature}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* 下方部分 (图片三柱 - 移动端显示为圆角正方形) */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[450px] mt-4">
            {/* 柱 1 */}
            <div className="relative w-full pb-[100%] h-0 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
              <div className="absolute inset-0">
                {renderImage(
                  data.images[0],
                  data.imageCropDataList?.[0],
                  "Item 1",
                )}
              </div>
            </div>
            {/* 柱 2 */}
            <div className="relative w-full pb-[100%] h-0 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
              <div className="absolute inset-0">
                {renderImage(
                  data.images[1],
                  data.imageCropDataList?.[1],
                  "Item 2",
                )}
              </div>
            </div>
            {/* 柱 3 */}
            <div className="relative w-full pb-[100%] h-0 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
              <div className="absolute inset-0">
                {renderImage(
                  data.images[2],
                  data.imageCropDataList?.[2],
                  "Item 3",
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner3;
