"use client";

import React from "react";
import { ServerImage } from "@/components/ui/ServerImage";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
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
  // 辅助函数：将一段文字尽量从中间拆分成两行
  const wrapTextOnce = (text?: string) => {
    if (!text) return "";
    if (text.includes("\n")) return text;
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return text;
    const mid = Math.ceil(words.length / 2);
    return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ");
  };

  const formatText = (text: string) => text || "";

  // 图片渲染辅助函数：支持精确裁剪 & 高清规格获取
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
    <section className="relative w-full h-full overflow-hidden bg-white">
      {/* 1. 背景层 - 基础氛围 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ filter: "blur(5px)" }}
        >
          {renderImage(
            data.images[0],
            data.imageCropDataList?.[0],
            "Background",
            "",
            true
          )}
        </div>
      </div>

      {/* 2. 精准装饰层 (始终渲染，自动缩放) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          {/* --- 1. 右上装饰 (Decorator 1) --- */}
          <div
            className="absolute origin-top-right transition-transform duration-500 scale-[0.4] md:scale-100"
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
            className="absolute origin-bottom-left transition-transform duration-500 scale-[0.4] md:scale-100"
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
              className="absolute origin-top-left transition-transform duration-500 scale-[0.4] md:scale-100"
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
                {renderImage(
                  data.images[1],
                  data.imageCropDataList?.[1],
                  "Frame 1 Content",
                  "",
                  true
                )}
              </div>
            </div>
          )}

          {/* --- 4. 右下框架 (Frame 2 + Image 2) --- */}
          {data.images[2] && (
            <div
              className="absolute origin-bottom-right transition-transform duration-500 scale-[0.4] md:scale-100"
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
                {renderImage(
                  data.images[2],
                  data.imageCropDataList?.[2],
                  "Frame 2 Content",
                  "",
                  true
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 桌面端大屏内容层 (768px 以上触发) */}
      <div className="hidden md:block absolute inset-0 z-30 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex flex-col justify-center items-center px-12">
            {/* 副标题 */}
            <p
              className="font-paytone-one text-[#FFBC5F] text-center whitespace-nowrap"
              style={{
                fontSize: rpx(36),
                marginBottom: rpx(16),
                WebkitTextStroke: `${rpx(2.5)} #75703F`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[1])}
            </p>

            <h1
              className="font-paytone-one text-black text-center whitespace-nowrap leading-none"
              style={{
                fontSize: rpx(72),
                WebkitTextStroke: `${rpx(6)} #FDF6C2`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])?.split("\n")[0]}
            </h1>

            <span
              className="font-paytone-one text-black text-center whitespace-nowrap leading-none block"
              style={{
                fontSize: rpx(96),
                marginTop: rpx(16),
                WebkitTextStroke: `${rpx(8)} #FDF6C2`,
                paintOrder: "stroke fill",
              }}
            >
              {formatText(data.features[0])?.split("\n").slice(1).join(" ")}
            </span>

            <div
              className="flex pointer-events-auto"
              style={{ gap: rpx(24), marginTop: rpx(50) }} // 匹配 200x124 尺寸的紧凑间距
            >
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <MagneticWrapper key={index} strength={0.3}>
                    <div
                      className="flex items-center justify-center border-[3px] border-white bg-[#756F3F] hover:scale-105 transition-transform duration-300 cursor-pointer"
                      style={{
                        width: rpx(200), // 设计稿精确宽度
                        height: rpx(124), // 设计稿精确高度
                        borderRadius: rpx(62),
                      }}
                    >
                      <p
                        className="font-montserrat font-bold text-white text-center whitespace-pre-line"
                        style={{
                          fontSize: rpx(24),
                          lineHeight: "1.4",
                        }}
                      >
                        {wrapTextOnce(feature)}
                      </p>
                    </div>
                  </MagneticWrapper>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 移动端/小屏内容层 (768px 以下触发) */}
      <div className="flex md:hidden absolute inset-0 z-20 flex-col items-center justify-center w-full h-full px-6 text-center">
        {/* 副标题 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center mb-2"
          style={{
            fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
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
                      ? "clamp(2rem, 5vw, 3.5rem)"
                      : "clamp(2.5rem, 7vw, 4.5rem)",
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
                className="bg-[#756F3F] text-white py-4 rounded-full font-bold border-2 border-white shadow-lg text-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
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
