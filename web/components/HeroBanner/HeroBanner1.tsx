"use client";

import React from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";
import MagneticWrapper from "./MagneticWrapper";

// ========================================
// 方案二实现：基于 1920x922 设计稿的绝对定位 + 流体缩放
// ========================================

interface HeroBanner1Props {
  data: any;
}

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，增加 px 单位并提供 fallback
const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

// 设计稿基准尺寸 (基于 1920x922)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 922;

// SVG UI 元素配置 (基于设计稿 hero-banner-1，尺寸匹配导出 SVG)
const BANNER_1_ASSETS = {
  // 左上角图片框架 (hero-banner-1-1)
  frame1: {
    width: 740,
    height: 696,
    maskWidth: 666,
    maskHeight: 627,
    x: 0,
    y: 0,
    zIndex: 10,
    src: "/home/hero-banner/banner-1/hero-banner-1-1.svg",
    mask: "/home/hero-banner/banner-1/hero-banner-1-1-image.svg",
  },
  // 右下角图片框架 (hero-banner-1-2)
  frame2: {
    width: 664,
    height: 742,
    maskWidth: 583,
    maskHeight: 691,
    x: 1256,
    y: 180,
    zIndex: 10,
    src: "/home/hero-banner/banner-1/hero-banner-1-2.svg",
    mask: "/home/hero-banner/banner-1/hero-banner-1-2-image.svg",
  },
  // 装饰物 1 (右上角)
  decorator1: {
    width: 306,
    height: 51,
    x: 1449,
    y: 0,
    zIndex: 15,
    src: "/home/hero-banner/banner-1/hero-banner-1-decorator-1.svg",
  },
  // 装饰物 2 (左下角)
  decorator2: {
    width: 288,
    height: 38,
    x: 203,
    y: 884,
    zIndex: 15,
    src: "/home/hero-banner/banner-1/hero-banner-1-decorator-2.svg",
  },
};
// ========================================

const HeroBanner1: React.FC<HeroBanner1Props> = ({ data }) => {
  const formatText = (text: string) => text || "";

  return (
    <section className="relative w-full h-full overflow-hidden bg-white">
      {/* 1. 背景层 - 基础氛围 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ filter: "blur(5px)" }}
        >
          {(() => {
            const cropData = data.imageCropDataList?.[0];
            if (cropData) {
              return (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={getCropImageUrl(data.images[0], cropData)}
                    alt=""
                    className="absolute max-w-none"
                    style={{
                      width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                      height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                      left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                      top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                    }}
                  />
                </div>
              );
            }
            return (
              <ServerImage
                image={data.images[0]}
                alt=""
                fill
                className="object-cover"
              />
            );
          })()}
        </div>
      </div>

      {/* 2. 精准装饰层 (始终渲染，自动缩放) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full max-w-[1920px] mx-auto">
          {/* --- 1. 右上装饰 (Decorator 1) --- */}
          <div
            className="absolute origin-top-right transition-transform duration-500 scale-[0.4] lg:scale-100"
            style={{
              right: 0,
              top: 0,
              width: rpx(BANNER_1_ASSETS.decorator1.width),
              height: rpx(BANNER_1_ASSETS.decorator1.height),
              zIndex: BANNER_1_ASSETS.decorator1.zIndex,
            }}
          >
            <img
              src={BANNER_1_ASSETS.decorator1.src}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          {/* --- 2. 左下装饰 (Decorator 2) --- */}
          <div
            className="absolute origin-bottom-left transition-transform duration-500 scale-[0.4] lg:scale-100"
            style={{
              left: 0,
              bottom: 0,
              width: rpx(BANNER_1_ASSETS.decorator2.width),
              height: rpx(BANNER_1_ASSETS.decorator2.height),
              zIndex: BANNER_1_ASSETS.decorator2.zIndex,
            }}
          >
            <img
              src={BANNER_1_ASSETS.decorator2.src}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          {/* --- 3. 左上框架 (Frame 1 + Image 1) --- */}
          {data.images[1] && (
            <div
              className="absolute origin-top-left transition-transform duration-500 scale-[0.4] lg:scale-100"
              style={{
                left: 0,
                top: 0,
                width: rpx(BANNER_1_ASSETS.frame1.width),
                height: rpx(BANNER_1_ASSETS.frame1.height),
                zIndex: BANNER_1_ASSETS.frame1.zIndex,
              }}
            >
              <img
                src={BANNER_1_ASSETS.frame1.src}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: rpx(BANNER_1_ASSETS.frame1.maskWidth),
                  height: rpx(BANNER_1_ASSETS.frame1.maskHeight),
                  maskImage: `url(${BANNER_1_ASSETS.frame1.mask})`,
                  maskSize: "100% 100%",
                  WebkitMaskImage: `url(${BANNER_1_ASSETS.frame1.mask})`,
                  WebkitMaskSize: "100% 100%",
                }}
              >
                {(() => {
                  const cropData = data.imageCropDataList?.[1];
                  if (cropData) {
                    return (
                      <img
                        src={getCropImageUrl(data.images[1], cropData)}
                        alt=""
                        className="absolute max-w-none"
                        style={{
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                        }}
                      />
                    );
                  }
                  return (
                    <ServerImage
                      image={data.images[1]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {/* --- 4. 右下框架 (Frame 2 + Image 2) --- */}
          {data.images[2] && (
            <div
              className="absolute origin-bottom-right transition-transform duration-500 scale-[0.4] lg:scale-100"
              style={{
                right: 0,
                bottom: 0,
                width: rpx(BANNER_1_ASSETS.frame2.width),
                height: rpx(BANNER_1_ASSETS.frame2.height),
                zIndex: BANNER_1_ASSETS.frame2.zIndex,
              }}
            >
              <img
                src={BANNER_1_ASSETS.frame2.src}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div
                className="absolute right-0 bottom-0 overflow-hidden"
                style={{
                  width: rpx(BANNER_1_ASSETS.frame2.maskWidth),
                  height: rpx(BANNER_1_ASSETS.frame2.maskHeight),
                  maskImage: `url(${BANNER_1_ASSETS.frame2.mask})`,
                  maskSize: "100% 100%",
                  WebkitMaskImage: `url(${BANNER_1_ASSETS.frame2.mask})`,
                  WebkitMaskSize: "100% 100%",
                }}
              >
                {(() => {
                  const cropData = data.imageCropDataList?.[2];
                  if (cropData) {
                    return (
                      <img
                        src={getCropImageUrl(data.images[2], cropData)}
                        alt=""
                        className="absolute max-w-none"
                        style={{
                          width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
                          height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
                          left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
                          top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
                        }}
                      />
                    );
                  }
                  return (
                    <ServerImage
                      image={data.images[2]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 桌面端大屏内容层 (1024px 以上触发) */}
      <div className="hidden lg:block absolute inset-0 z-30 pointer-events-none">
        <div className="relative w-full h-full max-w-[1920px] mx-auto">
          <div className="absolute inset-0 flex flex-col justify-center items-center px-12">
            <p
              className="font-paytone-one text-[#FFBC5F] text-center whitespace-nowrap mb-[1vh]"
              style={{
                fontSize: "clamp(1.5rem, 2vw, 2.25rem)",
                WebkitTextStroke: `${rpx(2.5)} #75703F`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[1])}
            </p>

            <h2
              className="font-paytone-one text-black text-center whitespace-nowrap leading-none"
              style={{
                fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
                WebkitTextStroke: `${rpx(6)} #FDF6C2`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])?.split("\n")[0]}
            </h2>

            <h1
              className="font-paytone-one text-black text-center whitespace-nowrap mt-[1vh] leading-none"
              style={{
                fontSize: "clamp(3.5rem, 5.5vw, 6rem)",
                WebkitTextStroke: `${rpx(8)} #FDF6C2`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])?.split("\n").slice(1).join(" ")}
            </h1>

            <div
              className="flex pointer-events-auto mt-[5vh]"
              style={{ gap: rpx(24) }} // 匹配 200x124 尺寸的紧凑间距
            >
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <MagneticWrapper key={index} strength={0.3}>
                    <div
                      className="flex items-center justify-center border-[3px] border-white bg-[#756F3F]"
                      style={{
                        width: rpx(200), // 设计稿精确宽度
                        height: rpx(124), // 设计稿精确高度
                        borderRadius: rpx(62),
                      }}
                    >
                      <p
                        className="font-montserrat font-bold text-[#FDF6C2] text-center whitespace-pre-line"
                        style={{
                          fontSize: rpx(24),
                          lineHeight: "1.4",
                        }}
                      >
                        {feature}
                      </p>
                    </div>
                  </MagneticWrapper>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 移动端/小屏内容层 (1024px 以下触发) */}
      <div className="flex lg:hidden absolute inset-0 z-20 flex-col items-center justify-center w-full h-full px-6 text-center">
        {/* 副标题 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center mb-1"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.5rem)", // 在手机和平板间平滑过渡
            WebkitTextStroke: "1px #75703F",
            paintOrder: "stroke fill",
          }}
        >
          {formatText(data.features[1])}
        </p>

        {/* 主标题 - 分行显示并添加描边 */}
        <div className="flex flex-col items-center mb-8 md:mb-12">
          {formatText(data.features[0])
            ?.split("\n")
            .map((line, idx) => (
              <h1
                key={idx}
                className="font-paytone-one text-black text-center leading-[1.1]"
                style={{
                  fontSize:
                    idx === 0
                      ? "clamp(1.75rem, 4vw, 3rem)" // 手机28px -> 平板48px
                      : "clamp(2.25rem, 5vw, 4rem)", // 手机36px -> 平板64px
                  WebkitTextStroke: idx === 0 ? "2px #FDF6C2" : "3px #FDF6C2",
                  paintOrder: "stroke fill",
                  marginTop: idx === 0 ? 0 : "0.25rem",
                }}
              >
                {line}
              </h1>
            ))}
        </div>

        {/* 按钮组 */}
        <div className="flex flex-col gap-4 w-full max-w-xs px-4">
          {[data.features[2], data.features[3], data.features[4]].map(
            (feature, index) => (
              <div
                key={index}
                className="bg-[#756F3F] text-[#FDF6C2] py-4 rounded-full font-bold border-2 border-white shadow-lg text-lg"
              >
                {feature}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
