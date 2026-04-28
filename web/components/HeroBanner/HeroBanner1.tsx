// components/HeroBanner/HeroBanner1.tsx
// ⚡ SSR Component - No "use client" for LCP optimization
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";
import MagneticWrapper from "./MagneticWrapper";

// 处理换行符：支持 /n 和 \n，并去除每行首尾空格
const formatText = (text: string | undefined) => {
  if (!text) return "";
  return text
    .replace(/\/n|\\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
};

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// 设计稿基准尺寸 (用于百分比计算)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// SVG UI 元素配置
const SVG_1_CONFIG = {
  // hero-banner-1-1.svg 左上角 (740x693)
  width: 740,
  height: 693,
  left: 0,
  top: 0,
  zIndex: 10,
};

const SVG_2_CONFIG = {
  // hero-banner-1-2.svg 右下角 (701x776)
  width: 701,
  height: 776,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

// hero-banner-1-1-image.svg 图片 clipPath (666x634)
const IMAGE_CLIP_1_CONFIG = {
  width: 666,
  height: 634,
  zIndex: 12,
};

// hero-banner-1-2-image.svg 图片 clipPath (617x722)
const IMAGE_CLIP_2_CONFIG = {
  width: 617,
  height: 722,
  zIndex: 12,
};

// 椭圆装饰配置
const ELLIPSE_1_CONFIG = {
  // 右上角椭圆
  right: 160, // 右边距 (负值超出边界)
  top: -56, // 上边距 (负值超出边界)
  width: 312, // 宽度
  height: 125, // 高度
  // 圆角 (50% = 完美椭圆，可以用不同值创建不规则形状)
  borderRadius: "50%", // 或 '50% 50% 50% 50%' 分别设置四角
  backgroundColor: "#756F3F",
  opacity: 1,
  rotate: 0, // 旋转角度
  zIndex: 15,
};

const ELLIPSE_2_CONFIG = {
  // 左下角椭圆
  left: 200, // 左边距 (负值超出边界)
  bottom: -80, // 下边距 (负值超出边界)
  width: 312, // 宽度
  height: 125, // 高度
  // 圆角 (50% = 完美椭圆，可以用不同值创建不规则形状)
  borderRadius: "50%", // 或 '50% 50% 50% 50%' 分别设置四角
  backgroundColor: "#756F3F",
  opacity: 1,
  rotate: 0, // 旋转角度
  zIndex: 15,
};
// ========================================

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
  headerTheme?: string;
};

// --- HeroBanner1 组件 ---
const HeroBanner1: FC<BannerProps> = ({ data, headerTheme }) => {
  return (
    <section
      className="relative w-full h-full min-h-[700px] overflow-hidden font-sans flex items-center justify-center text-center"
      data-header-theme={headerTheme}
    >
      {/* 背景容器 - 白色底 + 45%透明图片 + 11px模糊 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          filter: "blur(5px)",
        }}
      >
        {/* 白色底层 100% */}
        <div className="absolute inset-0 bg-white" />
        {/* 图片层 45% 透明度 */}
        <div className="absolute inset-0" style={{ opacity: 0.45 }}>
          {(() => {
            const cropData = data.imageCropDataList?.[0];
            const cropStyles = getCropStyles(cropData);
            if (cropStyles && cropData) {
              // 有裁剪数据 — 使用裁剪渲染
              return (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    ...cropStyles.container,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={getCropImageUrl(data.images[0], cropData)}
                    alt="背景图"
                    style={{
                      ...cropStyles.image,
                      // 背景图需要 cover 整个容器，所以用百分比缩放
                      width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                      height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                      left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                      top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                    }}
                  />
                </div>
              );
            }
            // 无裁剪数据 — 使用旧的焦点位置方式
            return (
              <ServerImage
                image={data.images[0]}
                alt="背景图"
                size="large"
                fill
                className="absolute inset-0 w-full h-full object-cover"
                objectPosition={getObjectPosition(data.images[0])}
                priority
              />
            );
          })()}
        </div>
      </div>

      {/* 椭圆装饰1 - 右上角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          right: rpx(ELLIPSE_1_CONFIG.right),
          top: rpx(ELLIPSE_1_CONFIG.top),
          width: rpx(ELLIPSE_1_CONFIG.width),
          height: rpx(ELLIPSE_1_CONFIG.height),
          borderRadius: ELLIPSE_1_CONFIG.borderRadius,
          backgroundColor: ELLIPSE_1_CONFIG.backgroundColor,
          opacity: ELLIPSE_1_CONFIG.opacity,
          transform: `rotate(${ELLIPSE_1_CONFIG.rotate}deg)`,
          zIndex: ELLIPSE_1_CONFIG.zIndex,
        }}
      />
      {/* 椭圆装饰1 - 右上角 - 移动端 */}
      <div
        className="md:hidden absolute right-[15%] -top-8 w-32 h-12 sm:w-40 sm:h-14 rounded-full"
        style={{
          backgroundColor: ELLIPSE_1_CONFIG.backgroundColor,
          zIndex: ELLIPSE_1_CONFIG.zIndex,
        }}
      />

      {/* 椭圆装饰2 - 左下角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          left: rpx(ELLIPSE_2_CONFIG.left),
          bottom: rpx(ELLIPSE_2_CONFIG.bottom),
          width: rpx(ELLIPSE_2_CONFIG.width),
          height: rpx(ELLIPSE_2_CONFIG.height),
          borderRadius: ELLIPSE_2_CONFIG.borderRadius,
          backgroundColor: ELLIPSE_2_CONFIG.backgroundColor,
          opacity: ELLIPSE_2_CONFIG.opacity,
          transform: `rotate(${ELLIPSE_2_CONFIG.rotate}deg)`,
          zIndex: ELLIPSE_2_CONFIG.zIndex,
        }}
      />
      {/* 椭圆装饰2 - 左下角 - 移动端 */}
      <div
        className="md:hidden absolute left-[15%] -bottom-8 w-32 h-12 sm:w-40 sm:h-14 rounded-full"
        style={{
          backgroundColor: ELLIPSE_2_CONFIG.backgroundColor,
          zIndex: ELLIPSE_2_CONFIG.zIndex,
        }}
      />

      {/* ===== 左上角区域 — 新方案: SVG clipPath 裁切图片 + 装饰层 ===== */}

      {/* 图片层 - 桌面端 — 用 hero-banner-1-1-image.svg 的 path 做 clipPath */}
      {data.images[1] && (
        <div
          className="hidden md:block absolute"
          style={{
            left: 0,
            top: 0,
            width: rpx(IMAGE_CLIP_1_CONFIG.width),
            aspectRatio: `${IMAGE_CLIP_1_CONFIG.width} / ${IMAGE_CLIP_1_CONFIG.height}`,
            zIndex: IMAGE_CLIP_1_CONFIG.zIndex,
          }}
        >
          {/* SVG clipPath 定义 + 被裁切的图片 */}
          <svg
            viewBox={`0 0 ${IMAGE_CLIP_1_CONFIG.width} ${IMAGE_CLIP_1_CONFIG.height}`}
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="hero1-clip-left-desktop">
                <path d="M589.755 0C670.243 76.4486 690.517 200.879 631.775 300.626L452.879 604.404C436.344 632.482 400.178 641.839 372.101 625.304L0 406.172V0H589.755Z" />
              </clipPath>
            </defs>
            <foreignObject
              x="0"
              y="0"
              width={IMAGE_CLIP_1_CONFIG.width}
              height={IMAGE_CLIP_1_CONFIG.height}
              clipPath="url(#hero1-clip-left-desktop)"
            >
              {(() => {
                const cropData = data.imageCropDataList?.[1];
                if (cropData?.croppedAreaPixels?.width) {
                  // 有裁剪数据
                  return (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={getCropImageUrl(data.images[1], cropData)}
                        alt="装饰图1"
                        style={{
                          position: "absolute",
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  );
                }
                // 无裁剪数据 — object-cover + focalPoint
                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <ServerImage
                      image={data.images[1]}
                      alt="装饰图1"
                      size="medium"
                      fill
                      className="object-cover"
                      objectPosition={getObjectPosition(data.images[1])}
                    />
                  </div>
                );
              })()}
            </foreignObject>
          </svg>
        </div>
      )}

      {/* SVG UI 元素1 - 左上角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          left: 0,
          top: 0,
          width: rpx(SVG_1_CONFIG.width),
          aspectRatio: `${SVG_1_CONFIG.width} / ${SVG_1_CONFIG.height}`,
          zIndex: SVG_1_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-1.svg"
          alt="左上装饰"
          fill
          className="object-contain object-left-top"
        />
      </div>

      {/* SVG UI 元素1 + 装饰图片1 - 左上角 - 移动端 */}
      <div
        className="md:hidden absolute left-0 top-0 w-[55%] sm:w-[50%]"
        style={{
          aspectRatio: `${SVG_1_CONFIG.width} / ${SVG_1_CONFIG.height}`,
          zIndex: SVG_1_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-1.svg"
          alt="左上装饰"
          fill
          className="object-contain object-left-top"
        />
        {/* 装饰图片1 - 相对于SVG容器定位 */}
        {data.images[1] && (
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              aspectRatio: `${IMAGE_CLIP_1_CONFIG.width} / ${IMAGE_CLIP_1_CONFIG.height}`,
              zIndex: IMAGE_CLIP_1_CONFIG.zIndex,
            }}
          >
            <svg
              viewBox={`0 0 ${IMAGE_CLIP_1_CONFIG.width} ${IMAGE_CLIP_1_CONFIG.height}`}
              className="absolute inset-0 w-full h-full"
              style={{ overflow: "visible" }}
            >
              <defs>
                <clipPath id="hero1-clip-left-mobile">
                  <path d="M589.755 0C670.243 76.4486 690.517 200.879 631.775 300.626L452.879 604.404C436.344 632.482 400.178 641.839 372.101 625.304L0 406.172V0H589.755Z" />
                </clipPath>
              </defs>
              <foreignObject
                x="0"
                y="0"
                width={IMAGE_CLIP_1_CONFIG.width}
                height={IMAGE_CLIP_1_CONFIG.height}
                clipPath="url(#hero1-clip-left-mobile)"
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {(() => {
                    const cropData = data.imageCropDataList?.[1];
                    const cropStyles = getCropStyles(cropData);
                    if (cropStyles && cropData && cropData.croppedAreaPixels) {
                      return (
                        <img
                          src={getCropImageUrl(data.images[1], cropData)}
                          alt="装饰图1"
                          style={{
                            ...cropStyles.image,
                            width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                            height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                            left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                            top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                            maxWidth: "none",
                          }}
                        />
                      );
                    }
                    return (
                      <ServerImage
                        image={data.images[1]}
                        alt="装饰图1"
                        size="small"
                        fill
                        className="object-cover"
                        objectPosition={getObjectPosition(data.images[1])}
                      />
                    );
                  })()}
                </div>
              </foreignObject>
            </svg>
          </div>
        )}
      </div>

      {/* ===== 右下角区域 — 新方案: SVG clipPath 裁切图片 + 装饰层 ===== */}

      {/* 图片层 - 桌面端 — 用 hero-banner-1-2-image.svg 的 path 做 clipPath */}
      {data.images[2] && (
        <div
          className="hidden md:block absolute"
          style={{
            right: 0,
            bottom: 0,
            width: rpx(IMAGE_CLIP_2_CONFIG.width),
            aspectRatio: `${IMAGE_CLIP_2_CONFIG.width} / ${IMAGE_CLIP_2_CONFIG.height}`,
            zIndex: IMAGE_CLIP_2_CONFIG.zIndex,
          }}
        >
          {/* SVG clipPath 定义 + 被裁切的图片 */}
          <svg
            viewBox={`0 0 ${IMAGE_CLIP_2_CONFIG.width} ${IMAGE_CLIP_2_CONFIG.height}`}
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="hero1-clip-right-desktop">
                <path d="M258.85 23.7684C278.31 -2.36723 315.272 -7.77954 341.408 11.6805L616.505 216.513V721.687H197.31L98.2949 647.963C-9.79138 567.484 -32.1721 414.621 48.3066 306.535L258.85 23.7684Z" />
              </clipPath>
            </defs>
            <foreignObject
              x="0"
              y="0"
              width={IMAGE_CLIP_2_CONFIG.width}
              height={IMAGE_CLIP_2_CONFIG.height}
              clipPath="url(#hero1-clip-right-desktop)"
            >
              {(() => {
                const cropData = data.imageCropDataList?.[2];
                if (cropData?.croppedAreaPixels?.width) {
                  // 有裁剪数据
                  return (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={getCropImageUrl(data.images[2], cropData)}
                        alt="装饰图2"
                        style={{
                          position: "absolute",
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  );
                }
                // 无裁剪数据 — object-cover + focalPoint
                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <ServerImage
                      image={data.images[2]}
                      alt="装饰图2"
                      size="medium"
                      fill
                      className="object-cover"
                      objectPosition={getObjectPosition(data.images[2])}
                    />
                  </div>
                );
              })()}
            </foreignObject>
          </svg>
        </div>
      )}

      {/* 装饰层 SVG - 右下角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          right: 0,
          bottom: 0,
          width: rpx(SVG_2_CONFIG.width),
          aspectRatio: `${SVG_2_CONFIG.width} / ${SVG_2_CONFIG.height}`,
          zIndex: SVG_2_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-2.svg"
          alt="右下装饰"
          fill
          className="object-contain object-right-bottom"
        />
      </div>

      {/* 右下角 - 移动端 */}
      <div
        className="md:hidden absolute right-0 bottom-0 w-[55%] sm:w-[50%]"
        style={{
          zIndex: SVG_2_CONFIG.zIndex,
        }}
      >
        {/* 图片层 */}
        {data.images[2] && (
          <div
            className="absolute right-0 bottom-0 w-full"
            style={{
              aspectRatio: `${IMAGE_CLIP_2_CONFIG.width} / ${IMAGE_CLIP_2_CONFIG.height}`,
              zIndex: IMAGE_CLIP_2_CONFIG.zIndex,
            }}
          >
            <svg
              viewBox={`0 0 ${IMAGE_CLIP_2_CONFIG.width} ${IMAGE_CLIP_2_CONFIG.height}`}
              className="absolute inset-0 w-full h-full"
              style={{ overflow: "visible" }}
            >
              <defs>
                <clipPath id="hero1-clip-right-mobile">
                  <path d="M258.85 23.7684C278.31 -2.36723 315.272 -7.77954 341.408 11.6805L616.505 216.513V721.687H197.31L98.2949 647.963C-9.79138 567.484 -32.1721 414.621 48.3066 306.535L258.85 23.7684Z" />
                </clipPath>
              </defs>
              <foreignObject
                x="0"
                y="0"
                width={IMAGE_CLIP_2_CONFIG.width}
                height={IMAGE_CLIP_2_CONFIG.height}
                clipPath="url(#hero1-clip-right-mobile)"
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {(() => {
                    const cropData = data.imageCropDataList?.[2];
                    const cropStyles = getCropStyles(cropData);
                    if (cropStyles && cropData && cropData.croppedAreaPixels) {
                      return (
                        <img
                          src={getCropImageUrl(data.images[2], cropData)}
                          alt="装饰图2"
                          style={{
                            ...cropStyles.image,
                            width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                            height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                            left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                            top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                            maxWidth: "none",
                          }}
                        />
                      );
                    }
                    return (
                      <ServerImage
                        image={data.images[2]}
                        alt="装饰图2"
                        size="small"
                        fill
                        className="object-cover"
                        objectPosition={getObjectPosition(data.images[2])}
                      />
                    );
                  })()}
                </div>
              </foreignObject>
            </svg>
          </div>
        )}
        {/* 装饰层 */}
        <div
          style={{
            aspectRatio: `${SVG_2_CONFIG.width} / ${SVG_2_CONFIG.height}`,
          }}
        >
          <Image
            src="/hero-banner-1-2.svg"
            alt="右下装饰"
            fill
            className="object-contain object-right-bottom"
          />
        </div>
      </div>

      {/* 内容容器 - 桌面端 (md+) */}
      <div
        className="hidden md:flex relative z-30 flex-col items-center w-full"
        style={{ marginTop: rpx(-100) }}
      >
        {/* Feature[1] - 顶部标语 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center whitespace-pre-line"
          style={{
            fontSize: rpx(48),
            lineHeight: 1.2,
            marginTop: rpx(60),
            marginBottom: rpx(10),
            WebkitTextStroke: `${rpx(3.5)} #75703F`,
            paintOrder: "stroke fill",
            textShadow: "0 -1px 0 #75703F",
          }}
        >
          {formatText(data.features[1])}
        </p>

        {/* Feature[0] - 主标题（按换行符拆分，第一行小字，第二行大字） */}
        {(() => {
          const lines = formatText(data.features[0])?.split("\n") || [];
          const firstLine = lines[0] || "";
          const restLines = lines.slice(1).join(" ");
          return (
            <>
              <h2
                className="font-paytone-one text-black text-center"
                style={{
                  fontSize: rpx(86),
                  lineHeight: rpx(125),
                  marginTop: rpx(0),
                  marginBottom: rpx(0),
                  WebkitTextStroke: `${rpx(8)} #FDF6C2`,
                  paintOrder: "stroke fill",
                }}
              >
                {firstLine}
              </h2>
              <h1
                className="font-paytone-one text-black text-center"
                style={{
                  fontSize: rpx(120),
                  lineHeight: rpx(125),
                  WebkitTextStroke: `${rpx(8)} #FDF6C2`,
                  paintOrder: "stroke fill",
                }}
              >
                {restLines}
              </h1>
            </>
          );
        })()}

        {/* 三个特性按钮 */}
        <div
          className="flex flex-row justify-center"
          style={{
            gap: rpx(123),
            marginTop: rpx(80),
          }}
        >
          {[data.features[2], data.features[3], data.features[4]].map(
            (feature, index) => {
              const words = feature?.split(" ") || [];
              const textWithNewlines = words.join("\n");
              return (
                <MagneticWrapper key={index} strength={0.3}>
                  <div
                    className="flex items-center justify-center border border-white border-[3px] bg-[#756F3F]"
                    style={{
                      width: rpx(242),
                      height: rpx(150),
                      borderRadius: rpx(75),
                    }}
                  >
                    <p
                      className="font-montserrat font-bold text-[#FDF6C2] text-center whitespace-pre-line"
                      style={{
                        fontSize: rpx(28),
                        lineHeight: 1.4,
                        letterSpacing: "0.06em",
                        textShadow: "0 4px 12px rgba(86, 80, 32, 1)",
                      }}
                    >
                      {textWithNewlines}
                    </p>
                  </div>
                </MagneticWrapper>
              );
            },
          )}
        </div>
      </div>

      {/* 内容容器 - 移动端 (md以下) */}
      <div className="flex md:hidden relative z-30 flex-col items-center w-full px-4 py-8">
        {/* Feature[1] - 顶部标语 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center text-lg whitespace-pre-line"
          style={{
            textShadow: "0 0 10px rgba(117, 112, 63, 0.5)",
            WebkitTextStroke: "1px #75703F",
            paintOrder: "stroke fill",
          }}
        >
          {formatText(data.features[1])}
        </p>

        {/* Feature[0] - 主标题 (不拆分，自动换行) */}
        <h1
          className="font-paytone-one text-black text-center text-3xl mt-4 whitespace-pre-line"
          style={{
            WebkitTextStroke: "2px #FDF6C2",
            paintOrder: "stroke fill",
          }}
        >
          {formatText(data.features[0])}
        </h1>

        {/* 三个特性按钮 - 垂直排列 */}
        <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
          {[data.features[2], data.features[3], data.features[4]].map(
            (feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center border border-white bg-[#756F3F] rounded-full py-3 px-6"
              >
                <p
                  className="text-[#FDF6C2] text-center font-montserrat font-bold text-sm"
                  style={{
                    textShadow: "0 4px 12px rgba(86, 80, 32, 1)",
                  }}
                >
                  {feature}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
