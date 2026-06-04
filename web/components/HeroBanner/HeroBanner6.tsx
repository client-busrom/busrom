// components/HeroBanner/HeroBanner6.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";
import { AutoScaleText } from "@/components/ui/AutoScaleText";
import { AutoScrollText } from "@/components/ui/AutoScrollText";
import MagneticWrapper from "./MagneticWrapper";

// 处理换行符
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

const BANNER_6_ASSETS = {
  bgColor: "#FFEECA",
  imageLeft: {
    src: "/home/hero-banner/banner-6/hero-banner-6-1-image.svg",
    width: 1253, height: 922, dx: 0, dy: 0, opacity: 0.85, blur: 7,
  },
  imageRight: {
    src: "/home/hero-banner/banner-6/hero-banner-6-2-image.svg",
    width: 957, height: 1121, dx: 0, dy: 0,
  },
  decorator: { width: 85, height: 85, dx: -888.5, dy: -456.5, color: "#FFFAD3" },
  subtitleBg: { width: 704, height: 120, dx: -607, dy: -318 },
  titleGroup: { dx: -200, dy: -50 },
};

const HeroBanner6: FC<BannerProps> = ({ data }) => {
  const titleParts = formatText(data.features[0])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative w-full h-full min-h-[600px] md:min-h-0 md:aspect-[1920/922] overflow-hidden bg-[#FFEECA] font-sans">
      {/* 1. PC/Tablet 端布局 */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: rpx(1920), height: rpx(922) }}>
          <div
            className="absolute left-1/2 top-1/2 rounded-full z-10"
            style={{
              width: rpx(BANNER_6_ASSETS.decorator.width),
              height: rpx(BANNER_6_ASSETS.decorator.height),
              backgroundColor: BANNER_6_ASSETS.decorator.color,
              transform: `translate(calc(-50% + ${rpx(BANNER_6_ASSETS.decorator.dx)}), calc(-50% + ${rpx(BANNER_6_ASSETS.decorator.dy)}))`,
            }}
          />
          <div
            className="absolute left-0 top-0 z-0"
            style={{
              width: rpx(BANNER_6_ASSETS.imageLeft.width),
              height: rpx(BANNER_6_ASSETS.imageLeft.height),
              opacity: BANNER_6_ASSETS.imageLeft.opacity,
              maskImage: `url(${BANNER_6_ASSETS.imageLeft.src})`,
              WebkitMaskImage: `url(${BANNER_6_ASSETS.imageLeft.src})`,
              maskSize: "100% 100%",
            }}
          >
            <div className="w-full h-full bg-white blur-[10px]">
              <ServerImage image={data.images[1] || data.images[0]} alt="" fill size="medium" className="object-cover opacity-60" />
            </div>
          </div>
          <div
            className="absolute right-0 top-0 z-20"
            style={{
              width: rpx(BANNER_6_ASSETS.imageRight.width),
              height: rpx(BANNER_6_ASSETS.imageRight.height),
              maskImage: `url(${BANNER_6_ASSETS.imageRight.src})`,
              WebkitMaskImage: `url(${BANNER_6_ASSETS.imageRight.src})`,
              maskSize: "100% 100%",
            }}
          >
            <ServerImage image={data.images[0]} alt="" fill size="large" className="object-cover" priority />
          </div>
          <div
            className="absolute left-1/2 top-1/2 z-30 opacity-80"
            style={{
              width: rpx(BANNER_6_ASSETS.subtitleBg.width),
              height: rpx(BANNER_6_ASSETS.subtitleBg.height),
              background: "linear-gradient(270deg, #FFFFFF 0%, #FFDE95 100%)",
              borderRadius: `0 ${rpx(61)} ${rpx(61)} 0`,
              transform: `translate(calc(-50% + ${rpx(BANNER_6_ASSETS.subtitleBg.dx)}), calc(-50% + ${rpx(BANNER_6_ASSETS.subtitleBg.dy)}))`,
            }}
          >
            <p className="absolute font-arial font-bold italic text-[#754600] whitespace-nowrap" style={{ fontSize: rpx(36), letterSpacing: "1.8px", right: rpx(80), top: "50%", lineHeight: 0.6 }}>
              {formatText(data.features[1])}
            </p>
          </div>
          <div
            className="absolute z-40 flex flex-col pointer-events-auto items-start"
            style={{ left: rpx(120), top: rpx(240), gap: rpx(16) }}
          >
            {titleParts.map((line, idx) => {
              const isFirst = idx === 0;
              let fontSize = 96;
              let textColor = isFirst ? "#FFFFFF" : "#332E0B";
              let strokeColor = isFirst ? "#443D05" : "#FDF6C2";
              let strokeWidth = isFirst ? 5 : 3;
              return (
                <h1 key={idx} className="font-poller-one leading-none whitespace-nowrap" style={{ fontSize: rpx(fontSize), color: textColor, WebkitTextStroke: `${rpx(strokeWidth)} ${strokeColor}`, paintOrder: "stroke fill" }}>
                  <AutoScaleText minScale={0.5}>{line}</AutoScaleText>
                </h1>
              );
            })}
          </div>
          <div
            className="absolute bottom-0 z-50 pointer-events-auto"
            style={{
              left: rpx(360),
              transform: `translate(calc(-50% + ${rpx(-510)}), calc(-50% + ${rpx(280)}))`,
            }}
          >
            <div className="relative">
              {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
                <div key={index} className="absolute" style={{ left: rpx([0, 180, 360][index]), top: rpx([0, 0, 0][index]), transform: `rotate(-60deg)`, transformOrigin: "left center" }}>
                  <MagneticWrapper strength={0.2}>
                    <div className="flex items-center justify-end bg-[#756F3F] overflow-hidden hover:scale-105 hover:bg-[#A39958] transition-all duration-300 cursor-pointer shadow-lg" style={{ width: rpx(740), height: rpx(100), borderRadius: rpx(71), paddingRight: rpx(40) }}>
                      <div className="overflow-hidden" style={{ maxWidth: rpx(300) }}>
                        <AutoScrollText text={feature} className="font-montserrat font-bold text-[#FFF5AD]" style={{ fontSize: rpx(24) }} />
                      </div>
                    </div>
                  </MagneticWrapper>
                </div>
              ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile / Tablet 端布局 (精致定制版) --- */}
      <div className="md:hidden absolute inset-0 z-30 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full py-6 px-4 gap-5 z-10 relative">

          {/* 左侧延展的渐变副标题条 (贴紧左侧边缘) */}
          <div className="w-full flex justify-start shrink-0 -ml-8 z-20">
            <div
              className="bg-gradient-to-r from-white to-[#FFDE95] text-[#754600] font-bold italic rounded-r-full shadow-sm"
              style={{
                paddingTop: "6px",
                paddingBottom: "6px",
                paddingLeft: "24px",
                paddingRight: "32px",
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              {formatText(data.features[1])}
            </div>
          </div>

          {/* 双色描边标题 */}
          <div className="w-full flex flex-col items-start text-left pl-6 gap-1 shrink-0 z-20">
            {titleParts.map((line, idx) => {
              const isFirst = idx === 0;
              let textColor = isFirst ? "#FFFFFF" : "#332E0B";
              let strokeColor = isFirst ? "#443D05" : "#FDF6C2";
              let strokeWidth = isFirst ? 2.5 : 1.5;
              return (
                <h1
                  key={idx}
                  className="font-poller-one leading-none text-3xl sm:text-4xl"
                  style={{
                    color: textColor,
                    WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
                    paintOrder: "stroke fill",
                    letterSpacing: "0.02em"
                  }}
                >
                  {line}
                </h1>
              );
            })}
          </div>

          {/* 特征标签 (保持7的样式：圆角胶囊与阴影，颜色使用6的) */}
          <div className="w-full flex flex-col items-start gap-2 pl-6 shrink-0 z-20">
            {[data.features[2], data.features[3], data.features[4]].map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#756F3F] px-5 py-2 rounded-full text-[#FFF5AD] shadow-md border border-[#FFF5AD]/10 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <span className="font-montserrat font-bold text-[10px] sm:text-xs tracking-wider block text-left">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* 图像区域 (直接渲染在文字下方，不带SVG蒙版，左右对称圆角) */}
          <div className="flex gap-4 justify-center w-full px-6 z-10 mt-2 pb-4 shrink-0">
            <div className="relative w-[48%] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white/20">
              <ServerImage image={data.images[0]} alt="" fill size="medium" className="object-cover" />
            </div>
            <div className="relative w-[48%] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white/20">
              <ServerImage image={data.images[1] || data.images[0]} alt="" fill size="medium" className="object-cover" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner6;
