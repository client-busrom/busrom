"use client";

import React, { FC } from "react";
import { ServerImage } from "@/components/ui/ServerImage";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";
import { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";

interface HeroBanner4Props {
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
// 1920x922 设计稿参数配置 (AhvvG)
// ========================================
const BANNER_4_ASSETS = {
  // 装饰物
  decoratorLarge: {
    src: "/home/hero-banner/banner-4/hero-banner-4-1.svg", // 右上大装饰
    width: 1500,
    height: 690,
  },
  decoratorSmall: {
    src: "/home/hero-banner/banner-4/hero-banner-4-2.svg", // 左下小装饰
    width: 140,
    height: 150,
  },
  // 主图
  image1: { width: 549, height: 727, x: 585, y: 38 },
  image2: { width: 548, height: 727, x: 945, y: 164 },
  image3: { width: 549, height: 727, x: 1194, y: 38 },
  // Feature 按钮 (拼图样式)
  feature: {
    x: 100,
    y: 568,
    gap: 18,
    height: 92,
    puzzleLeft: "/home/hero-banner/banner-4/hero-banner-4-feature-1.svg",
    puzzleRight: "/home/hero-banner/banner-4/hero-banner-4-feature-2.svg",
  },
};

const HeroBanner4: FC<HeroBanner4Props> = ({ data, locale }) => {
  const clipPathId = "hero-banner-4-image-clip";
  
  // 副标题渲染：支持换行且第二行缩进
  const renderSubtitle = (text: string | undefined) => {
    if (!text) return null;
    const formattedText = formatText(text);
    const lines = formattedText.split("\n");
    return lines.map((line, index) => (
      <span 
        key={index} 
        className="block" 
        style={{ paddingLeft: index === 1 ? "2em" : "0" }}
      >
        {line}
      </span>
    ));
  };

  // 图片渲染辅助函数
  const renderImage = (
    image: any,
    cropData: any,
    alt: string,
    className: string = "",
    priority: boolean = false
  ) => {
    if (!image) return null;
    return (
      <ServerImage
        image={image}
        cropData={cropData}
        alt={alt}
        fill
        className={className || "object-cover"}
        priority={priority}
      />
    );
  };

  return (
    <section className="relative w-full h-full overflow-hidden bg-[#FFF8E5]">
      {/* 0. SVG ClipPath 定义 (仅桌面端使用) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path
              d="M0.00414282 0.05327C-0.0101661 0.0280483 0.0143487 0 0.0507018 0H0.425344C0.44561 0 0.463925 0.00911812 0.471903 0.023179L0.995858 0.94673C1.01017 0.971952 0.985651 1 0.949298 1H0.574656C0.55439 1 0.536075 0.990882 0.528097 0.976821L0.00414282 0.05327Z"
              transform="scale(1 1)"
            />
          </clipPath>
        </defs>
      </svg>

      {/* 2. 桌面端布局 (768px 以上) */}
      <div className="hidden md:block relative z-20 w-full h-full">
        {/* 背景装饰物 - 桌面端锚点优化 */}
        {/* 右上大装饰 */}
        <div
          className="absolute right-0 top-0 z-0 pointer-events-none"
          style={{
            width: rpx(BANNER_4_ASSETS.decoratorLarge.width),
            height: rpx(BANNER_4_ASSETS.decoratorLarge.height),
          }}
        >
          <img src={BANNER_4_ASSETS.decoratorLarge.src} alt="" className="w-full h-full object-contain object-right-top" />
        </div>
        {/* 左下小装饰 */}
        <div
          className="absolute left-0 bottom-0 z-0 pointer-events-none"
          style={{
            width: rpx(BANNER_4_ASSETS.decoratorSmall.width),
            height: rpx(BANNER_4_ASSETS.decoratorSmall.height),
          }}
        >
          <img src={BANNER_4_ASSETS.decoratorSmall.src} alt="" className="w-full h-full object-contain object-left-bottom" />
        </div>

        {/* 文字内容区 */}
        <div
          className="absolute z-30 flex flex-col items-start text-left"
          style={{ left: rpx(100), top: rpx(113) }}
        >
          {/* 副标题 */}
          <div
            className="font-paytone-one font-normal text-white mb-4"
            style={{
              fontSize: rpx(48),
              WebkitTextStroke: `${rpx(6)} #6B4E00`,
              paintOrder: "stroke fill",
              lineHeight: 1.2
            }}
          >
            {renderSubtitle(data.features[1])}
          </div>

          {/* 主标题 */}
          <h1
            className="font-paytone-one font-normal text-black whitespace-pre-line leading-[1.1] mb-12"
            style={{
              fontSize: rpx(96),
              WebkitTextStroke: `${rpx(6)} #FDF6C2`,
              paintOrder: "stroke fill",
              marginTop: rpx(-20),
            }}
          >
            {formatText(data.features[0])}
          </h1>

          {/* Feature 按钮组 */}
          <div
            className="flex flex-col"
            style={{ gap: rpx(BANNER_4_ASSETS.feature.gap) }}
          >
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <MagneticWrapper key={index} strength={0.2}>
                  <div
                    className="flex items-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                    style={{ 
                      height: rpx(BANNER_4_ASSETS.feature.height),
                      marginLeft: index === 1 ? rpx(16) : index === 2 ? rpx(32) : 0
                    }}
                  >
                    <img
                      src={BANNER_4_ASSETS.feature.puzzleLeft}
                      alt=""
                      className="h-full w-auto block"
                    />
                    <div
                      className="bg-[#FFD978] h-full flex items-center justify-center font-montserrat font-bold text-[#000000] whitespace-nowrap"
                      style={{
                        padding: `0 ${rpx(10)}`,
                        fontSize: rpx(30),
                        marginLeft: "-1px",
                        marginRight: "-1px",
                      }}
                    >
                      {formatText(feature).replace(/\n/g, " ")}
                    </div>
                    <img
                      src={BANNER_4_ASSETS.feature.puzzleRight}
                      alt=""
                      className="h-full w-auto block"
                    />
                  </div>
                </MagneticWrapper>
              ),
            )}
          </div>
        </div>

        {/* 图片组 */}
        <div
          className="absolute transition-all duration-700 z-10"
          style={{
            left: rpx(BANNER_4_ASSETS.image1.x),
            top: rpx(BANNER_4_ASSETS.image1.y),
            width: rpx(BANNER_4_ASSETS.image1.width),
            height: rpx(BANNER_4_ASSETS.image1.height),
            clipPath: `url(#${clipPathId})`,
          }}
        >
          {renderImage(data.images[1], data.imageCropDataList?.[1], "Feature 1")}
        </div>
        <div
          className="absolute transition-all duration-700 z-20"
          style={{
            left: rpx(BANNER_4_ASSETS.image2.x),
            top: rpx(BANNER_4_ASSETS.image2.y),
            width: rpx(BANNER_4_ASSETS.image2.width),
            height: rpx(BANNER_4_ASSETS.image2.height),
            clipPath: `url(#${clipPathId})`,
          }}
        >
          {renderImage(data.images[2], data.imageCropDataList?.[2], "Feature 2")}
        </div>
        <div
          className="absolute transition-all duration-700 z-15"
          style={{
            left: rpx(BANNER_4_ASSETS.image3.x),
            top: rpx(BANNER_4_ASSETS.image3.y),
            width: rpx(BANNER_4_ASSETS.image3.width),
            height: rpx(BANNER_4_ASSETS.image3.height),
            clipPath: `url(#${clipPathId})`,
          }}
        >
          {renderImage(data.images[3], data.imageCropDataList?.[3], "Feature 3")}
        </div>
      </div>

      {/* 3. 移动端/平板端布局 (竖屏) */}
      <div className="flex md:hidden absolute inset-0 z-30 overflow-y-auto w-full h-full">
        {/* 移动端装饰物 - 边缘锚点 */}
        <div className="absolute right-0 top-0 z-0 w-[60%] h-auto opacity-50">
          <img src={BANNER_4_ASSETS.decoratorLarge.src} alt="" className="w-full h-auto" />
        </div>
        <div className="absolute left-0 bottom-0 z-0 w-[80px] h-auto">
          <img src={BANNER_4_ASSETS.decoratorSmall.src} alt="" className="w-full h-auto" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-8 text-center gap-4 md:gap-8 z-10">
          {/* 文字部分 */}
          <div className="flex flex-col items-center w-full">
            <div
              className="font-paytone-one text-white mb-2"
              style={{
                fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
                WebkitTextStroke: "1px #6B4E00",
                paintOrder: "stroke fill",
              }}
            >
              {renderSubtitle(data.features[1])}
            </div>
            <h1
              className="font-paytone-one text-black whitespace-pre-line leading-[1.1] mb-4"
              style={{
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                WebkitTextStroke: "1px #FDF6C2",
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])}
            </h1>
          </div>

          {/* 按钮部分 */}
          <div className="flex flex-col gap-3 w-full items-center">
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center h-[44px] md:h-[60px] hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{
                    marginLeft: index === 1 ? "16px" : index === 2 ? "32px" : "0"
                  }}
                >
                  <img src={BANNER_4_ASSETS.feature.puzzleLeft} alt="" className="h-full w-auto" />
                  <div className="bg-[#FFD978] h-full flex items-center justify-center font-montserrat font-bold text-[#000000] px-4 whitespace-nowrap text-xs md:text-base -mx-[1px]">
                    {formatText(feature).replace(/\n/g, " ")}
                  </div>
                  <img src={BANNER_4_ASSETS.feature.puzzleRight} alt="" className="h-full w-auto" />
                </div>
              ),
            )}
          </div>

          {/* 图片组 */}
          <div className="flex flex-row gap-4 w-full mt-2 justify-center">
            {[data.images[1], data.images[2], data.images[3]].map((img, idx) => (
              <div 
                key={idx}
                className="w-[100px] h-[180px] md:w-[160px] md:h-[280px] rounded-xl overflow-hidden border-2 border-white shadow-md bg-white"
              >
                {renderImage(img, data.imageCropDataList?.[idx + 1], `Img ${idx + 1}`)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner4;
