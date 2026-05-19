// components/HeroBanner/HeroBanner2.tsx
import React, { FC } from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";
import { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

interface HeroBanner2Props {
  data: HomeContent["heroBanner"][number];
  locale: Locale;
}

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const BANNER_2_ASSETS = {
  decorator1: {
    src: "/home/hero-banner/banner-2/hero-banner-2-decorator-1.svg",
    width: 1115,
    height: 1227,
    x: 0,
    y: 0,
  },
  borderLeft: { width: 78, height: 424, x: 0, y: 500 },
  borderRight: { width: 75, height: 200, x: 1845, y: 0 },
  borderTop: { width: 850, height: 75, x: 535, y: 1 },
  borderBottom: { width: 590, height: 48, x: 1330, y: 874 },
};

const HeroBanner2: FC<HeroBanner2Props> = ({ data, locale }) => {
  return (
    <section className="relative w-full h-full overflow-hidden bg-[#756F3F]">
      {/* 0. 底层：清晰背景图 (保持 59% 透明度) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-full opacity-[0.59]">
          <ServerImage
            image={data.images[0]}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* 1. 核心：穿透式局部模糊层 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
        style={{
          // 蒙版形状
          maskImage: `url(${BANNER_2_ASSETS.decorator1.src})`,
          WebkitMaskImage: `url(${BANNER_2_ASSETS.decorator1.src})`,
          maskPosition: `${rpx(BANNER_2_ASSETS.decorator1.x)} ${rpx(BANNER_2_ASSETS.decorator1.y)}`,
          WebkitMaskPosition: `${rpx(BANNER_2_ASSETS.decorator1.x)} ${rpx(BANNER_2_ASSETS.decorator1.y)}`,
          maskSize: `${rpx(BANNER_2_ASSETS.decorator1.width)} ${rpx(BANNER_2_ASSETS.decorator1.height)}`,
          WebkitMaskSize: `${rpx(BANNER_2_ASSETS.decorator1.width)} ${rpx(BANNER_2_ASSETS.decorator1.height)}`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          // 强力穿透模糊
          backdropFilter: "blur(80px) brightness(0.95)",
          WebkitBackdropFilter: "blur(80px) brightness(0.95)",
          // 关键：必须有背景色才能触发 backdrop-filter 的渲染
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }}
      />

      {/* 2. 装饰物色彩层：被您注释掉后我帮您重新打开，并设为半透明 */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <div
          className="absolute"
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
            className="w-full h-full object-contain opacity-100"
          />
        </div>
      </div>

      {/* 3. 其余装饰与内容逻辑保持不变 */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div className="hidden md:block absolute inset-0">
          <img
            src="/home/hero-banner/banner-2/left.svg"
            alt=""
            className="absolute"
            style={{
              left: 0,
              top: rpx(BANNER_2_ASSETS.borderLeft.y),
              width: rpx(BANNER_2_ASSETS.borderLeft.width),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/right.svg"
            alt=""
            className="absolute"
            style={{
              right: 0,
              top: 0,
              width: rpx(BANNER_2_ASSETS.borderRight.width),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/top.svg"
            alt=""
            className="absolute"
            style={{
              left: rpx(BANNER_2_ASSETS.borderTop.x),
              top: 0,
              width: rpx(BANNER_2_ASSETS.borderTop.width),
            }}
          />
          <img
            src="/home/hero-banner/banner-2/bottom.svg"
            alt=""
            className="absolute"
            style={{
              right: 0,
              bottom: 0,
              width: rpx(BANNER_2_ASSETS.borderBottom.width),
            }}
          />
        </div>
      </div>

      <div className="hidden md:block relative z-40 w-full h-full">
        <div
          className="absolute z-30 flex flex-col items-start text-left"
          style={{ left: rpx(207), top: rpx(207) }}
        >
          <div className="flex flex-col" style={{ marginBottom: rpx(48) }}>
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
          <div className="flex flex-col" style={{ gap: rpx(24) }}>
            {[data.features[2], data.features[3], data.features[4]].map(
              (feature, index) => (
                <MagneticWrapper key={index} strength={0.2}>
                  <div className="relative group cursor-pointer">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-[#5A4F0E] to-[#C0A91D]/0 group-hover:from-[#5A4F0E] group-hover:to-[#C0A91D]/20 transition-all duration-300"
                      style={{
                        clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
                      }}
                    />
                    <div
                      className="relative font-bold text-[#FDF6C2] whitespace-nowrap"
                      style={{
                        fontSize: rpx(30),
                        paddingTop: rpx(16),
                        paddingBottom: rpx(16),
                        paddingLeft: rpx(48),
                        paddingRight: rpx(48),
                      }}
                    >
                      {formatText(feature).replace(/\n/g, " ")}
                    </div>
                  </div>
                </MagneticWrapper>
              ),
            )}
          </div>
        </div>

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

        <div
          className="absolute overflow-hidden shadow-2xl z-10"
          style={{
            right: rpx(124),
            top: rpx(295),
            width: rpx(559),
            height: rpx(510),
            borderRadius: rpx(34),
            border: `${rpx(20)} solid white`,
          }}
        >
          <ServerImage
            image={data.images[1]}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div
          className="absolute overflow-hidden shadow-2xl z-20"
          style={{
            right: rpx(574),
            top: rpx(429),
            width: rpx(327),
            height: rpx(299),
            borderRadius: rpx(34),
            border: `${rpx(17)} solid white`,
          }}
        >
          <ServerImage
            image={data.images[2]}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex md:hidden absolute inset-0 z-50 w-full h-full bg-[#756F3F]/20 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-8 text-center gap-4 md:gap-6">
          <div className="flex flex-col items-center w-full">
            <p
              className="font-paytone-one text-white whitespace-pre-line mb-3"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)" }}
            >
              {formatText(data.features[1])}
            </p>
            <div className="relative w-full max-w-[220px] md:max-w-[420px] h-[150px] md:h-[260px] mb-4">
              <div className="absolute left-0 top-0 w-[75%] h-[85%] border-2 md:border-4 border-white shadow-lg overflow-hidden rounded-xl">
                <ServerImage
                  image={data.images[1]}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute right-0 bottom-0 w-[55%] h-[65%] border-2 md:border-4 border-white shadow-xl overflow-hidden z-10 translate-x-2 translate-y-2 md:translate-x-3 md:translate-y-3 rounded-lg">
                <ServerImage
                  image={data.images[2]}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
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
            <div className="flex flex-col gap-3 w-full max-w-[240px] md:max-w-[280px]">
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="relative w-full h-[44px] md:h-[50px] flex items-center justify-center"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-[#5A4F0E] to-[#C0A91D]/0"
                      style={{
                        clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
                      }}
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
