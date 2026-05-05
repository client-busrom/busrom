"use client";

import React, { FC } from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";
import { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";

interface HeroBanner5Props {
  data: HomeContent["heroBanner"][number];
  locale: Locale;
}

// --- 响应式尺寸函数 ---
const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

// 处理换行符
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

// ========================================
// 1920x922 设计稿参数配置 (HeroBanner5)
// 偏移量说明：dx/dy 是元素中心点相对于画布中心 (960, 461) 的距离
// 已计入 46px 的顶部导航栏偏移
// ========================================
const BANNER_5_ASSETS = {
  // 背景装饰
  decorate: {
    src: "/home/hero-banner/banner-5/hero-banner-5-decorate.svg",
    width: 644,
    height: 644,
    dx: 100,
    dy: 0,
  },
  // Image 1 (Large Right)
  frame1: {
    src: "/home/hero-banner/banner-5/hero-banner-5-1.svg",
    width: 999,
    height: 922,
    dx: 460,
    dy: 0,
  },
  image1: { width: 981, height: 922, ox: 18, oy: 0 },
  // Image 2 (Top Small)
  frame2: {
    src: "/home/hero-banner/banner-5/hero-banner-5-2.svg",
    width: 520,
    height: 388,
    dx: -133,
    dy: -267,
  },
  image2: { width: 488, height: 369, ox: 15, oy: 0 },
  // Image 3 (Bottom Small)
  frame3: {
    src: "/home/hero-banner/banner-5/hero-banner-5-3.svg",
    width: 520,
    height: 388,
    dx: -133,
    dy: 267,
  },
  image3: { width: 488, height: 369, ox: 15, oy: 19 },
  // Feature 按钮
  features: [
    { width: 399, ml: 0 },
    { width: 474, ml: 0 },
    { width: 517, ml: 0 },
  ],
};

const HeroBanner5: FC<HeroBanner5Props> = ({ data, locale }) => {
  const clip1 = "hero-banner-5-clip-1";
  const clip2 = "hero-banner-5-clip-2";
  const clip3 = "hero-banner-5-clip-3";

  // 图片渲染辅助函数
  const renderImage = (
    image: any,
    cropData: any,
    alt: string,
    className: string = "",
  ) => {
    if (!image) return null;

    const cropStyles = getCropStyles(cropData);
    if (cropStyles && cropData?.croppedAreaPixels) {
      return (
        <div className={`relative w-full h-full ${className}`}>
          <div
            className="absolute inset-0 w-full h-full"
            style={cropStyles.container}
          >
            <img
              src={getCropImageUrl(image, cropData)}
              alt={alt}
              style={cropStyles.image}
              className="max-w-none"
            />
          </div>
        </div>
      );
    }

    return (
      <img
        src={image.url || image}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        style={{ objectPosition: getObjectPosition(image) }}
      />
    );
  };

  return (
    <section className="relative w-full h-full overflow-hidden bg-[#FFFBF2]">
      {/* 1. SVG ClipPaths 定义 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clip1} clipPathUnits="objectBoundingBox">
            <path d="M 1 1 H 0.4244 L 0.0405 0.5985 C -0.0135 0.542 -0.0135 0.4503 0.0405 0.3938 L 0.4171 0 H 1 V 1 Z" />
          </clipPath>
          <clipPath id={clip2} clipPathUnits="objectBoundingBox">
            <path d="M 0.3595 0.9229 C 0.4371 1.0257 0.5629 1.0257 0.6405 0.9229 L 0.9418 0.5241 C 1.0194 0.4213 1.0194 0.2547 0.9418 0.1519 L 0.8270 0 H 0.1730 L 0.0582 0.1519 C -0.0194 0.2547 -0.0194 0.4213 0.0582 0.5241 L 0.3595 0.9229 Z" />
          </clipPath>
          <clipPath id={clip3} clipPathUnits="objectBoundingBox">
            <path d="M 0.3595 0.0771 C 0.4371 -0.0257 0.5629 -0.0257 0.6405 0.0771 L 0.9418 0.4759 C 1.0194 0.5787 1.0194 0.7453 0.9418 0.8481 L 0.8270 1 H 0.1730 L 0.0582 0.8481 C -0.0194 0.7453 -0.0194 0.5787 0.0582 0.4759 L 0.3595 0.0771 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* 2. 桌面端布局 */}
      <div className="hidden md:landscape:block xl:block relative z-20 w-full h-full max-w-[1920px] mx-auto">
        {/* 背景装饰物 - 使用 translate(-50%, -50%) 确保中心对齐 */}
        <div
          className="absolute z-1 pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            width: rpx(BANNER_5_ASSETS.decorate.width),
            height: rpx(BANNER_5_ASSETS.decorate.height),
            transform: `translate(calc(-50% + ${rpx(BANNER_5_ASSETS.decorate.dx)}), calc(-50% + ${rpx(BANNER_5_ASSETS.decorate.dy)}))`,
          }}
        >
          <img
            src={BANNER_5_ASSETS.decorate.src}
            alt=""
            className="w-full h-full"
          />
        </div>

        {/* 文字内容区 (解析 feature1 即 features[0]) - 严格遵循后端换行 */}
        {(() => {
          const parts = formatText(data.features[0]).split("\n").map(s => s.trim());
          if (parts.length === 0) return null;

          const line1 = parts[0];
          const lineLast = parts.length > 1 ? parts[parts.length - 1] : "";
          const middleLines = parts.length > 2 ? parts.slice(1, -1).join("\n") : "";

          return (
            <div
              className="absolute z-30"
              style={{ left: rpx(119), top: rpx(166) }}
            >
              {/* 第一行: Pavanam 82px */}
              {line1 && (
                <p
                  className="font-pavanam text-[#433E12] leading-[1.1] mb-2"
                  style={{ 
                    fontSize: rpx(82),
                    WebkitTextStroke: `${rpx(1)} #000000`,
                    paintOrder: "stroke fill"
                  }}
                >
                  {line1}
                </p>
              )}
              {/* 中间行: Paytone One 108px (保留换行) */}
              {middleLines && (
                <h1
                  className="font-paytone-one text-[#433E12] leading-[1.0] mb-2 whitespace-pre-line"
                  style={{ 
                    fontSize: rpx(108),
                    WebkitTextStroke: `${rpx(1)} #000000`,
                    paintOrder: "stroke fill"
                  }}
                >
                  {middleLines}
                </h1>
              )}
              {/* 最后一行: Paytone One 96px */}
              {lineLast && (
                <h2
                  className="font-paytone-one text-[#433E12] leading-[1.1]"
                  style={{ 
                    fontSize: rpx(96),
                    WebkitTextStroke: `${rpx(1)} #000000`,
                    paintOrder: "stroke fill"
                  }}
                >
                  {lineLast}
                </h2>
              )}
            </div>
          );
        })()}

        <div
          className="absolute z-30 text-right"
          style={{ right: rpx(123), top: rpx(621) }}
        >
          <p
            className="font-paytone-one text-white whitespace-pre-line leading-[1.2]"
            style={{
              fontSize: rpx(60),
              WebkitTextStroke: `${rpx(3)} #433E12`,
              paintOrder: "stroke fill",
            }}
          >
            {formatText(data.features[1])}
          </p>
        </div>

        {/* Feature 按钮 */}
        <div
          className="absolute z-30 flex flex-col gap-4"
          style={{ left: rpx(99), top: rpx(629) }}
        >
          {[data.features[2], data.features[3], data.features[4]].map(
            (feature, index) => (
              <MagneticWrapper key={index} strength={0.15}>
                <div
                  className="h-[64px] flex items-center px-10 relative group cursor-pointer"
                  style={{
                    width: rpx(BANNER_5_ASSETS.features[index].width),
                    background:
                      "linear-gradient(90deg, rgba(164, 148, 12, 0.6) 0%, rgba(132, 123, 44, 0) 100%)",
                  }}
                >
                  <span className="font-montserrat font-bold text-black text-[30px] whitespace-nowrap tracking-wider relative z-10">
                    {formatText(feature).replace(/\n/g, " ")}
                  </span>
                </div>
              </MagneticWrapper>
            ),
          )}
        </div>

        {/* 图片组 (中心锚定偏移) */}

        {/* Image 1 (Large Right) */}
        <div
          className="absolute z-10"
          style={{
            left: "50%",
            top: "50%",
            width: rpx(BANNER_5_ASSETS.frame1.width),
            height: rpx(BANNER_5_ASSETS.frame1.height),
            transform: `translate(calc(-50% + ${rpx(BANNER_5_ASSETS.frame1.dx)}), calc(-50% + ${rpx(BANNER_5_ASSETS.frame1.dy)}))`,
          }}
        >
          <img
            src={BANNER_5_ASSETS.frame1.src}
            alt=""
            className="absolute inset-0 w-full h-full z-0"
          />
          <div
            className="absolute z-10"
            style={{
              right: 0,
              top: 0,
              width: rpx(BANNER_5_ASSETS.image1.width),
              height: rpx(BANNER_5_ASSETS.image1.height),
              clipPath: `url(#${clip1})`,
            }}
          >
            {renderImage(data.images[1], data.imageCropDataList?.[1], "Img 1")}
          </div>
        </div>

        {/* Image 2 (Top Small) */}
        <div
          className="absolute z-20"
          style={{
            left: "50%",
            top: "50%",
            width: rpx(BANNER_5_ASSETS.frame2.width),
            height: rpx(BANNER_5_ASSETS.frame2.height),
            transform: `translate(calc(-50% + ${rpx(BANNER_5_ASSETS.frame2.dx)}), calc(-50% + ${rpx(BANNER_5_ASSETS.frame2.dy)}))`,
          }}
        >
          <img
            src={BANNER_5_ASSETS.frame2.src}
            alt=""
            className="absolute inset-0 w-full h-full z-0"
          />
          <div
            className="absolute z-10"
            style={{
              left: rpx(BANNER_5_ASSETS.image2.ox),
              top: rpx(BANNER_5_ASSETS.image2.oy),
              width: rpx(BANNER_5_ASSETS.image2.width),
              height: rpx(BANNER_5_ASSETS.image2.height),
              clipPath: `url(#${clip2})`,
            }}
          >
            {renderImage(data.images[2], data.imageCropDataList?.[2], "Img 2")}
          </div>
        </div>

        {/* Image 3 (Bottom Small) */}
        <div
          className="absolute z-20"
          style={{
            left: "50%",
            top: "50%",
            width: rpx(BANNER_5_ASSETS.frame3.width),
            height: rpx(BANNER_5_ASSETS.frame3.height),
            transform: `translate(calc(-50% + ${rpx(BANNER_5_ASSETS.frame3.dx)}), calc(-50% + ${rpx(BANNER_5_ASSETS.frame3.dy)}))`,
          }}
        >
          <img
            src={BANNER_5_ASSETS.frame3.src}
            alt=""
            className="absolute inset-0 w-full h-full z-0"
          />
          <div
            className="absolute z-10"
            style={{
              left: rpx(BANNER_5_ASSETS.image3.ox),
              top: rpx(BANNER_5_ASSETS.image3.oy),
              width: rpx(BANNER_5_ASSETS.image3.width),
              height: rpx(BANNER_5_ASSETS.image3.height),
              clipPath: `url(#${clip3})`,
            }}
          >
            {renderImage(data.images[3], data.imageCropDataList?.[3], "Img 3")}
          </div>
        </div>
      </div>

      {/* 3. 移动端/平板端布局 */}
      <div className="flex md:landscape:hidden xl:hidden absolute inset-0 z-30 overflow-y-auto w-full h-full">
        {/* 移动端装饰物 - 边缘锚点 */}
        <div className="absolute right-0 top-0 z-0 w-[60%] h-auto opacity-30">
          <img
            src={BANNER_5_ASSETS.decorate.src}
            alt=""
            className="w-full h-auto"
          />
        </div>

        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-10 text-center gap-4 md:gap-8 z-10">
          <div className="flex flex-col items-center w-full px-4">
            {(() => {
              const parts = formatText(data.features[0]).split("\n").map(s => s.trim());
              const line1 = parts[0];
              const lineLast = parts.length > 1 ? parts[parts.length - 1] : "";
              const middleLines = parts.length > 2 ? parts.slice(1, -1).join("\n") : "";

              return (
                <>
                  {line1 && (
                    <p 
                      className="font-pavanam text-[#433E12] text-sm md:text-xl mb-1"
                      style={{ WebkitTextStroke: "0.5px #000000", paintOrder: "stroke fill" }}
                    >
                      {line1}
                    </p>
                  )}
                  {middleLines && (
                    <h1 
                      className="font-paytone-one text-[#433E12] text-3xl md:text-5xl leading-tight mb-1 whitespace-pre-line"
                      style={{ WebkitTextStroke: "1px #000000", paintOrder: "stroke fill" }}
                    >
                      {middleLines}
                    </h1>
                  )}
                  {lineLast && (
                    <h2 
                      className="font-paytone-one text-[#433E12] text-2xl md:text-4xl leading-tight mb-2"
                      style={{ WebkitTextStroke: "1px #000000", paintOrder: "stroke fill" }}
                    >
                      {lineLast}
                    </h2>
                  )}
                </>
              );
            })()}
            <p
              className="font-paytone-one text-[#433E12] text-lg md:text-2xl mt-2"
              style={{
                WebkitTextStroke: "1px white",
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[1])}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full items-center">
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <div
                  key={index}
                  className="flex items-center h-[44px] md:h-[60px] px-6 w-full max-w-[280px] md:max-w-[400px]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(164, 148, 12, 0.6) 0%, rgba(132, 123, 44, 0) 100%)",
                  }}
                >
                  <span className="font-montserrat font-bold text-black text-xs md:text-lg tracking-wider">
                    {formatText(feature).replace(/\n/g, " ")}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="flex flex-row gap-3 w-full justify-center mt-2">
            {[data.images[1], data.images[2], data.images[3]].map(
              (img, idx) => (
                <div
                  key={idx}
                  className="w-[100px] h-[150px] md:w-[160px] md:h-[240px] rounded-xl overflow-hidden border-2 border-white shadow-md bg-white"
                >
                  {renderImage(
                    img,
                    data.imageCropDataList?.[idx + 1],
                    `Img ${idx + 1}`,
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner5;
