"use client";

import React from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";

interface HeroBanner2Props {
  data: any;
}

// --- 响应式尺寸函数 ---
const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

// 处理换行符
const formatText = (text: string) => text || "";

// ========================================
// 1920x922 设计稿参数配置
// ========================================
const BANNER_2_ASSETS = {
  // 装饰物 - 巨大渐变背景
  decorator1: {
    width: 1115,
    height: 1227,
    x: 0,
    y: 0,
    zIndex: 5,
    src: "/home/hero-banner/banner-2/hero-banner-2-decorator-1.svg",
  },
  // 边缘装饰条
  edges: {
    top: {
      width: 850,
      height: 75,
      x: 535,
      y: 1,
      src: "/home/hero-banner/banner-2/top.svg",
    },
    bottom: {
      width: 590,
      height: 48,
      x: 1330,
      y: 874,
      src: "/home/hero-banner/banner-2/bottom.svg",
    },
    left: {
      width: 78,
      height: 424,
      x: 0,
      y: 500,
      src: "/home/hero-banner/banner-2/left.svg",
    },
    right: {
      width: 75,
      height: 200,
      x: 1845,
      y: 0,
      src: "/home/hero-banner/banner-2/right.svg",
    },
  },
  // 图片框架
  image1: {
    width: 559,
    height: 510,
    x: 1237,
    y: 295,
    zIndex: 20,
    borderRadius: 34,
    strokeWidth: 20,
  },
  image2: {
    width: 327,
    height: 299,
    x: 1019,
    y: 429,
    zIndex: 25,
    borderRadius: 34,
    strokeWidth: 17,
  },
  // Feature 按钮 (长条状)
  feature: {
    width: 500,
    height: 68,
    x: 207,
    y: 600,
    gap: 32,
  },
};

const HeroBanner2: React.FC<HeroBanner2Props> = ({ data }) => {
  // 图片渲染辅助函数：支持精确裁剪 & 高清规格获取
  const renderImage = (
    image: any,
    cropData: any,
    alt: string,
    className: string = "",
  ) => {
    if (!image) return null;

    const cropStyles = getCropStyles(cropData);
    const imageUrl = getCropImageUrl(image, cropData);

    // 如果有裁剪数据，使用 overflow-hidden 容器 + transform 定位方案
    if (cropStyles) {
      return (
        <div style={cropStyles.container} className="w-full h-full">
          <img
            src={imageUrl}
            alt={alt}
            className={className}
            style={cropStyles.image}
          />
        </div>
      );
    }

    // 无裁剪数据，退回到 object-cover 模式，但使用高清 URL
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        style={{ objectPosition: getObjectPosition(image) }}
      />
    );
  };

  return (
    <section className="relative w-full h-full overflow-hidden bg-[#756F3F]">
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{ filter: "blur(5px)" }}
        >
          {renderImage(
            data.images[0],
            data.imageCropDataList?.[0],
            "Background",
          )}
        </div>
      </div>

      {/* 2. 装饰层 (SVG 装饰物) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* 巨大渐变背景 - 锁定尺寸和定位，不裁剪 */}
        <div
          className="absolute transition-all duration-700 opacity-80 xl:left-0 xl:top-0 right-0 top-0"
          style={{
            width: rpx(BANNER_2_ASSETS.decorator1.width),
            height: rpx(BANNER_2_ASSETS.decorator1.height),
          }}
        >
          <img
            src={BANNER_2_ASSETS.decorator1.src}
            alt=""
            className="w-full h-full object-contain xl:object-left-top object-right-top"
          />
        </div>

        <div className="relative w-full h-full max-w-[1920px] mx-auto">
          {/* 边缘装饰条 - 桌面模式可见 */}
          <div className="hidden xl:block">
            {Object.entries(BANNER_2_ASSETS.edges).map(([key, cfg]) => (
              <div
                key={key}
                className="absolute transition-all duration-500"
                style={{
                  left: rpx(cfg.x),
                  top: rpx(cfg.y),
                  width: rpx(cfg.width),
                  height: rpx(cfg.height),
                }}
              >
                <img
                  src={cfg.src}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 桌面端布局 (1280px 以上) */}
      <div className="hidden xl:block absolute inset-0 z-30 pointer-events-none">
        <div className="relative w-full h-full max-w-[1920px] mx-auto">
          {/* 右侧副标题 (白色) - 提升层级 */}
          <div
            className="absolute text-right z-50"
            style={{
              left: rpx(1243),
              top: rpx(150),
              width: rpx(600),
            }}
          >
            <p
              className="font-paytone-one text-white whitespace-pre-line leading-tight"
              style={{ fontSize: "clamp(1.5rem, 2vw, 2.25rem)" }}
            >
              {formatText(data.features[1])}
            </p>
          </div>

          {/* 左侧主标题 (黑色) - 提升层级 */}
          <div
            className="absolute text-left z-50"
            style={{
              left: rpx(207),
              top: rpx(207),
              width: rpx(900),
            }}
          >
            <h1
              className="font-paytone-one text-black whitespace-pre-line leading-none"
              style={{
                fontSize: "clamp(3.5rem, 5vw, 6rem)",
                WebkitTextStroke: "3px #FDF6C2",
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])}
            </h1>
          </div>

          {/* 左侧 Feature 按钮组 - 提升层级 */}
          <div
            className="absolute flex flex-col pointer-events-auto z-50"
            style={{
              left: rpx(207),
              top: rpx(600),
              gap: rpx(BANNER_2_ASSETS.feature.gap),
            }}
          >
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <MagneticWrapper key={index} strength={0.2}>
                  <div
                    className="relative flex items-center px-12 overflow-hidden shadow-lg group transition-all duration-300 hover:brightness-110"
                    style={{
                      width: rpx(BANNER_2_ASSETS.feature.width),
                      height: rpx(BANNER_2_ASSETS.feature.height),
                      background:
                        "linear-gradient(90deg, #5A4F0E 0%, rgba(192, 169, 29, 0) 100%)",
                      clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%)",
                    }}
                  >
                    <p
                      className="font-montserrat font-semibold text-[#FFF5AD] text-left whitespace-pre-line"
                      style={{
                        fontSize: rpx(30),
                        textShadow: "0 4px 11px rgba(86, 80, 32, 0.5)",
                      }}
                    >
                      {feature}
                    </p>
                  </div>
                </MagneticWrapper>
              ),
            )}
          </div>

          {/* 右侧图片框架 - 大图 (降低层级) */}
          <div
            className="absolute overflow-hidden shadow-2xl transition-all duration-700"
            style={{
              left: rpx(BANNER_2_ASSETS.image1.x),
              top: rpx(BANNER_2_ASSETS.image1.y),
              width: rpx(BANNER_2_ASSETS.image1.width),
              height: rpx(BANNER_2_ASSETS.image1.height),
              borderRadius: rpx(BANNER_2_ASSETS.image1.borderRadius),
              border: `${rpx(BANNER_2_ASSETS.image1.strokeWidth)} solid white`,
              zIndex: 20,
            }}
          >
            {renderImage(
              data.images[1],
              data.imageCropDataList?.[1],
              "Feature Main",
            )}
          </div>

          {/* 右侧图片框架 - 小图 (降低层级) */}
          <div
            className="absolute overflow-hidden shadow-2xl transition-all duration-700"
            style={{
              left: rpx(BANNER_2_ASSETS.image2.x),
              top: rpx(BANNER_2_ASSETS.image2.y),
              width: rpx(BANNER_2_ASSETS.image2.width),
              height: rpx(BANNER_2_ASSETS.image2.height),
              borderRadius: rpx(BANNER_2_ASSETS.image2.borderRadius),
              border: `${rpx(BANNER_2_ASSETS.image2.strokeWidth)} solid white`,
              zIndex: 25,
            }}
          >
            {renderImage(
              data.images[2],
              data.imageCropDataList?.[2],
              "Feature Sub",
            )}
          </div>
        </div>
      </div>

      {/* 4. 移动端/平板端布局 (1280px 以下) */}
      <div className="flex xl:hidden absolute inset-0 z-30 overflow-y-auto w-full h-full">
        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-10 text-center gap-4 md:gap-10">
        {/* 上方部分 (对应桌面右侧内容) */}
        <div className="flex flex-col items-center w-full">
          {/* 副标题 */}
          <p
            className="font-paytone-one text-white whitespace-pre-line mb-3 md:mb-6"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            }}
          >
            {formatText(data.features[1])}
          </p>

          {/* 图片组 (响应式叠加) - 平板端大幅增强尺寸，手机端缩减以适配 SE */}
          <div className="relative w-full max-w-[220px] md:max-w-[600px] h-[150px] md:h-[380px] mb-4 md:mb-8">
            <div
              className="absolute left-0 top-0 w-[75%] h-[85%] border-4 border-white shadow-lg overflow-hidden"
              style={{ borderRadius: "16px" }}
            >
              {renderImage(
                data.images[1],
                data.imageCropDataList?.[1],
                "Feature 1",
              )}
            </div>
            <div
              className="absolute right-0 bottom-0 w-[55%] h-[65%] border-4 border-white shadow-xl overflow-hidden z-10"
              style={{
                borderRadius: "12px",
                transform: "translate(8px, 8px) md:translate(12px, 12px)",
              }}
            >
              {renderImage(
                data.images[2],
                data.imageCropDataList?.[2],
                "Feature 2",
              )}
            </div>
          </div>
        </div>

        {/* 下方部分 (对应桌面左侧内容) */}
        <div className="flex flex-col items-center w-full">
          {/* 主标题 - 尊重换行，全员大字号 */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            {formatText(data.features[0])
              ?.split("\n")
              .map((line, idx) => (
                <h1
                  key={idx}
                  className="font-paytone-one text-black text-center leading-[1.1]"
                  style={{
                    fontSize: "clamp(2.125rem, 5vw, 3.25rem)",
                    WebkitTextStroke: "3px #FDF6C2",
                    paintOrder: "stroke fill",
                    marginTop: idx === 0 ? 0 : "0.5rem",
                  }}
                >
                  {line}
                </h1>
              ))}
          </div>

          {/* Feature 按钮组 (移动端) - 像素级对标桌面端 */}
          <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[300px]">
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <div key={index} className="relative w-full">
                  {/* 背景层 - 80% 不透明度 */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[#948421] to-[#40390F] opacity-80"
                    style={{
                      clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%)",
                    }}
                  />
                  {/* 文字层 */}
                  <div className="relative py-2 md:py-2.5 px-8 font-bold text-[#FDF6C2] text-base md:text-lg text-left">
                    {feature}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        {/* 底部安全留白占位 */}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner2;
