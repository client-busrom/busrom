// components/HeroBanner/HeroBanner6.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

// 处理换行符
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

const rpx = (designValue: number) => `calc(var(--rpx) * ${designValue})`;

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
  titleGroup: { dx: -450, dy: -50 },
};

const HeroBanner6: FC<BannerProps> = ({ data }) => {
  const titleParts = formatText(data.features[0])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#FFEECA] font-sans">
      {/* 1. PC 端布局 */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2">
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
            className="absolute left-1/2 top-1/2 z-40 flex flex-col pointer-events-auto items-start"
            style={{ transform: `translate(calc(-50% + ${rpx(BANNER_6_ASSETS.titleGroup.dx)}), calc(-50% + ${rpx(BANNER_6_ASSETS.titleGroup.dy)}))` }}
          >
            <div className="flex flex-col" style={{ gap: rpx(16) }}>
              {titleParts.map((line, idx) => {
                const isFirst = idx === 0;
                let fontSize = 96;
                let textColor = isFirst ? "#FFFFFF" : "#332E0B";
                let strokeColor = isFirst ? "#443D05" : "#FDF6C2";
                let strokeWidth = isFirst ? 5 : 3;
                return (
                  <h1 key={idx} className="font-poller-one leading-none" style={{ fontSize: rpx(fontSize), color: textColor, WebkitTextStroke: `${rpx(strokeWidth)} ${strokeColor}`, paintOrder: "stroke fill" }}>
                    {line}
                  </h1>
                );
              })}
            </div>
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
                  <div key={index} className="absolute flex items-center justify-end bg-[#756F3F]" style={{ left: rpx([0, 180, 360][index]), top: rpx([0, 0, 0][index]), width: rpx(740), height: rpx(100), borderRadius: rpx(71), transform: `rotate(-60deg)`, transformOrigin: "left center" }}>
                    <span className="font-montserrat font-bold text-[#FFF5AD]" style={{ fontSize: rpx(24), paddingRight: rpx(40) }}>{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile / Tablet 端布局 (瘦身版) --- */}
      <div className="lg:hidden absolute inset-0 z-30 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full py-4 px-6 gap-4">
          
          <div className="relative w-full max-w-[500px] h-[200px] md:h-[320px] shrink-0 z-10">
            <ServerImage
              image={data.images[0]}
              alt=""
              fill
              size="large"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col items-center justify-start text-center gap-4 shrink-0 z-20">
            <p className="font-arial font-bold italic text-[#754600] text-lg md:text-2xl bg-white/80 px-6 py-1.5 rounded-full shadow-sm">
              {formatText(data.features[1])}
            </p>

            <div className="flex flex-col items-center gap-1.5">
              {titleParts.map((line, idx) => {
                const isFirst = idx === 0;
                let textColor = isFirst ? "#FFFFFF" : "#332E0B";
                let strokeColor = isFirst ? "#443D05" : "#FDF6C2";
                let strokeWidth = isFirst ? 2 : 1.5;
                return (
                  <h1 key={idx} className="font-poller-one text-center leading-tight text-3xl md:text-5xl" style={{ color: textColor, WebkitTextStroke: `${strokeWidth}px ${strokeColor}`, paintOrder: "stroke fill" }}>
                    {line}
                  </h1>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-4 pb-12">
              {[data.features[2], data.features[3], data.features[4]].map((f, i) => (
                  <div key={i} className="bg-[#756F3F] text-[#FFF5AD] px-4 py-1.5 md:px-8 md:py-3 rounded-full text-xs md:text-lg font-bold shadow-sm">
                    {f}
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

export default HeroBanner6;
