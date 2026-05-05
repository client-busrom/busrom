"use client";

import React, { FC } from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";
import { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";

interface HeroBanner2Props {
  data: HomeContent["heroBanner"][number];
  locale: Locale;
}

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

// 处理换行符：支持 /n 和 \n
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

// ========================================
// 1920x922 设计稿参数配置 (HeroBanner2)
// ========================================
const BANNER_2_ASSETS = {
  // 装饰物背景
  decorator1: {
    src: "/home/hero-banner/banner-2/hero-banner-2-decorator-1.svg",
    width: 1115,
    height: 1227,
    x: 0,
    y: 0,
  },
  // 边缘边框
  borderLeft: { width: 78, height: 424, x: 0, y: 500 },
  borderRight: { width: 75, height: 200, x: 1845, y: 0 },
  borderTop: { width: 850, height: 75, x: 535, y: 1 },
  borderBottom: { width: 590, height: 48, x: 1330, y: 874 },
  // 主图 (右侧)
  image1: { width: 559, height: 510, x: 1237, y: 295 },
  image2: { width: 327, height: 299, x: 1019, y: 429 },
};

const HeroBanner2: FC<HeroBanner2Props> = ({ data, locale }) => {
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
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
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
    <section className="relative w-full h-full overflow-hidden bg-[#756F3F]">
      {/* 1. 全局底层背景装饰 (桌面端使用) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 大背景渐变装饰 */}
        <div
          className="absolute z-0 opacity-80"
          style={{
            left: rpx(BANNER_2_ASSETS.decorator1.x),
            top: rpx(BANNER_2_ASSETS.decorator1.y),
            width: rpx(BANNER_2_ASSETS.decorator1.width),
            height: rpx(BANNER_2_ASSETS.decorator1.height),
          }}
        >
          <img
            src={BANNER_2_ASSETS.decorator1.src}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* 边缘边框装饰 - 桌面端精准定位 */}
        <div className="hidden xl:block absolute inset-0 z-10">
          <img
            src="/home/hero-banner/banner-2/left.svg"
            alt=""
            className="absolute"
            style={{
              left: rpx(BANNER_2_ASSETS.borderLeft.x),
              top: rpx(BANNER_2_ASSETS.borderLeft.y),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/right.svg"
            alt=""
            className="absolute"
            style={{
              right: 0, // 修正：锚定到右侧
              top: rpx(BANNER_2_ASSETS.borderRight.y),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/top.svg"
            alt=""
            className="absolute"
            style={{
              left: rpx(BANNER_2_ASSETS.borderTop.x),
              top: rpx(BANNER_2_ASSETS.borderTop.y),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/bottom.svg"
            alt=""
            className="absolute"
            style={{
              left: rpx(BANNER_2_ASSETS.borderBottom.x),
              bottom: 0, // 修正：锚定到地部
            }}
          />
        </div>
      </div>

      {/* 2. 桌面端布局 (1280px 以上 & 1024px+横屏) */}
      <div className="hidden md:landscape:block xl:block relative z-20 w-full h-full max-w-[1920px] mx-auto">
        {/* 文字内容区: 左侧锚定 */}
        <div
          className="absolute z-30 flex flex-col items-start text-left"
          style={{ left: rpx(207), top: rpx(207) }}
        >
          {/* 主标题 */}
          <div className="flex flex-col mb-12">
            {formatText(data.features[0])
              ?.split("\n")
              .map((line, idx) => (
                <h1
                  key={idx}
                  className="font-paytone-one text-black whitespace-pre-line leading-[1.0]"
                  style={{
                    fontSize: rpx(96),
                    WebkitTextStroke: `${rpx(6)} #FDF6C2`,
                    paintOrder: "stroke fill",
                    marginTop: idx === 0 ? 0 : rpx(10),
                  }}
                >
                  {line}
                </h1>
              ))}
          </div>

          {/* Feature 按钮组 */}
          <div className="flex flex-col gap-6">
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <MagneticWrapper key={index} strength={0.2}>
                  <div className="relative group cursor-pointer">
                    {/* 背景层 - 拼图/平行四边形切角效果 */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-[#948421] to-[#40390F] opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%)",
                      }}
                    />
                    {/* 文字内容 */}
                    <div
                      className="relative py-4 px-12 font-bold text-[#FDF6C2] whitespace-nowrap"
                      style={{ fontSize: rpx(30) }}
                    >
                      {formatText(feature).replace(/\n/g, " ")}
                    </div>
                  </div>
                </MagneticWrapper>
              ),
            )}
          </div>
        </div>

        {/* 右侧内容区: 副标题 & 图片组 */}
        {/* 副标题 */}
        <div
          className="absolute z-30 text-right pointer-events-none"
          style={{ right: rpx(124), top: rpx(150) }}
        >
          <p
            className="font-paytone-one text-white whitespace-pre-line leading-[1.1]"
            style={{ fontSize: rpx(36) }}
          >
            {formatText(data.features[1])}
          </p>
        </div>

        {/* 右侧图片框架 - 大图 (右侧锚定) */}
        <div
          className="absolute overflow-hidden shadow-2xl transition-all duration-700 z-10"
          style={{
            right: rpx(124),
            top: rpx(BANNER_2_ASSETS.image1.y),
            width: rpx(BANNER_2_ASSETS.image1.width),
            height: rpx(BANNER_2_ASSETS.image1.height),
            borderRadius: rpx(34),
            border: `${rpx(20)} solid white`,
          }}
        >
          {renderImage(
            data.images[1],
            data.imageCropDataList?.[1],
            "Main Feature",
          )}
        </div>

        {/* 右侧图片框架 - 小图 (悬浮感) */}
        <div
          className="absolute overflow-hidden shadow-2xl transition-all duration-700 z-20"
          style={{
            right: rpx(574), // 基于 image1 的位置计算出的小图偏移
            top: rpx(BANNER_2_ASSETS.image2.y),
            width: rpx(BANNER_2_ASSETS.image2.width),
            height: rpx(BANNER_2_ASSETS.image2.height),
            borderRadius: rpx(34),
            border: `${rpx(17)} solid white`,
          }}
        >
          {renderImage(
            data.images[2],
            data.imageCropDataList?.[2],
            "Secondary Feature",
          )}
        </div>
      </div>

      {/* 3. 移动端/平板端布局 (竖屏) */}
      <div className="flex md:landscape:hidden xl:hidden absolute inset-0 z-30 overflow-y-auto w-full h-full">
        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-8 text-center gap-4 md:gap-6">
          {/* 上方部分 */}
          <div className="flex flex-col items-center w-full">
            {/* 副标题 */}
            <p
              className="font-paytone-one text-white whitespace-pre-line mb-3"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)" }}
            >
              {formatText(data.features[1])}
            </p>

            {/* 图片组 */}
            <div className="relative w-full max-w-[220px] md:max-w-[420px] h-[150px] md:h-[260px] mb-4">
              <div className="absolute left-0 top-0 w-[75%] h-[85%] border-2 md:border-4 border-white shadow-lg overflow-hidden rounded-xl">
                {renderImage(data.images[1], data.imageCropDataList?.[1], "F1")}
              </div>
              <div className="absolute right-0 bottom-0 w-[55%] h-[65%] border-2 md:border-4 border-white shadow-xl overflow-hidden z-10 translate-x-2 translate-y-2 md:translate-x-3 md:translate-y-3 rounded-lg">
                {renderImage(data.images[2], data.imageCropDataList?.[2], "F2")}
              </div>
            </div>
          </div>

          {/* 下方内容 */}
          <div className="flex flex-col items-center w-full">
            {/* 主标题 */}
            <div className="flex flex-col items-center mb-4 md:mb-6">
              {formatText(data.features[0])
                ?.split("\n")
                .map((line, idx) => (
                  <h1
                    key={idx}
                    className="font-paytone-one text-black text-center leading-[1.1]"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 2.75rem)",
                      WebkitTextStroke: "1px #FDF6C2",
                      paintOrder: "stroke fill",
                      marginTop: idx === 0 ? 0 : "0.25rem",
                    }}
                  >
                    {line}
                  </h1>
                ))}
            </div>

            {/* Feature 按钮组 */}
            <div className="flex flex-col gap-3 w-full max-w-[240px] md:max-w-[280px]">
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <div key={index} className="relative w-full h-[44px] md:h-[50px] flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-[#948421] to-[#40390F] opacity-80"
                      style={{ clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%)" }}
                    />
                    <div className="relative font-bold text-[#FDF6C2] text-xs md:text-base px-4">
                      {formatText(feature).replace(/\n/g, " ")}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner2;
