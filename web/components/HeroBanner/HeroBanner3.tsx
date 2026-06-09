// components/HeroBanner/HeroBanner3.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { getCropStyles, getCropImageUrl, getObjectPosition } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";

// --- 基础配置 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
};

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const renderHighlightedText = (text: string | undefined) => {
  if (!text) return null;
  const formatted = formatText(text);
  const trimmed = formatted.trimEnd();
  const lastSpaceIndex = trimmed.lastIndexOf(" ");

  if (lastSpaceIndex === -1) return formatted;

  const mainPart = trimmed.substring(0, lastSpaceIndex);
  const lastWord = trimmed.substring(lastSpaceIndex);

  return (
    <>
      {mainPart}
      <span className="text-[#F98538] font-bold">{lastWord}</span>
    </>
  );
};

const BANNER_3_ASSETS = {
  decorator: { width: 959, height: 922, src: "/home/hero-banner/banner-3/hero-banner-3-decorator.svg" },
  columns: { width: 240, height: 880, gap: 20 },
};

const HeroBanner3: FC<BannerProps> = ({ data }) => {
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

  const subtitle = data.features[1];
  const featureCapsules = [data.features[2], data.features[3], data.features[4]];

  return (
    <section className="relative w-full h-full overflow-hidden bg-[#6E6941]">

      {/* --- 桌面端装饰层 --- */}
      <div className="absolute top-0 z-0 h-full pointer-events-none opacity-40 md:opacity-100">
        <div className="relative left-0 md:left-[calc(var(--rpx-hero,1)*96px)]"
          style={{ width: rpx(BANNER_3_ASSETS.decorator.width), height: rpx(BANNER_3_ASSETS.decorator.height) }}>
          <img src={BANNER_3_ASSETS.decorator.src} alt="" className="w-full h-full object-contain object-left-top" />
        </div>
      </div>

      {/* --- 桌面端布局 --- */}
      <div className="hidden md:block relative z-20 w-full h-full">
        <div className="absolute z-20 flex flex-col items-start text-left" style={{ left: rpx(186), top: rpx(140) }}>
          <p className="font-montserrat font-normal text-black whitespace-pre-line" style={{ fontSize: rpx(36), marginBottom: rpx(8) }}>{renderHighlightedText(subtitle)}</p>
          <h1 className="font-poller-one font-regular text-black whitespace-pre-line leading-[1.1]" style={{ fontSize: rpx(90), WebkitTextStroke: `${rpx(6)} #FDF6C2`, paintOrder: "stroke fill", marginBottom: rpx(48) }}>{formatText(data.features[0])}</h1>
          <div className="flex flex-col" style={{ gap: rpx(24), marginLeft: rpx(48) }}>
            {featureCapsules.map((feature, index) => (
              <div key={index} className="relative flex items-center justify-center overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer" style={{ width: rpx(500), height: rpx(80), background: index % 2 === 0 ? "linear-gradient(90deg, rgba(249, 133, 56) 0%, rgba(249, 133, 56) 100%)" : "linear-gradient(90deg, rgba(73, 69, 38) 0%, rgba(73, 69, 38) 100%)", borderRadius: rpx(40) }}>
                <p className="font-montserrat font-bold text-[#FFF5AD]" style={{ fontSize: rpx(30), letterSpacing: "0.05em" }}>{feature}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute flex items-center" style={{ right: rpx(120), top: rpx(0), bottom: rpx(80), gap: rpx(BANNER_3_ASSETS.columns.gap) }}>
          {[1, 2, 3].map(i => (
            <div key={i} className={`relative self-start overflow-hidden ${i % 2 === 1 ? "rounded-t-full" : "rounded-b-full"}`} style={{ width: rpx(BANNER_3_ASSETS.columns.width), height: rpx(BANNER_3_ASSETS.columns.height) }}>
              {renderImage(data.images[i], data.imageCropDataList?.[i], `Hero Banner Image ${i}`)}
            </div>
          ))}
        </div>
      </div>

      {/* --- 移动端/平板端布局 (移除内部滚动) --- */}
      <div className="md:hidden absolute inset-0 z-30 flex flex-col items-center justify-center w-full h-full">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-0 scale-110 opacity-40 blur-[10px] brightness-[0.6]">
            {renderImage(data.images[0], data.imageCropDataList?.[0], "Hero Banner Background")}
          </div>
          <div className="absolute inset-0 z-10 bg-black/20" />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-6 py-12 text-center">
          <div className="flex flex-col items-center w-full gap-4 md:gap-8 mb-8 md:mb-14">
            <p className="font-montserrat font-normal text-black mb-3" style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)" }}>{renderHighlightedText(subtitle)}</p>
            <h1 className="font-paytone-one text-black whitespace-pre-line leading-[1.1] mb-6 md:mb-10" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", WebkitTextStroke: "2px #FDF6C2", paintOrder: "stroke fill" }}>{formatText(data.features[0])}</h1>
            <div className="flex flex-col gap-3 w-full max-w-[280px] md:max-w-[450px]">
              {featureCapsules.map((feature, index) => (
                <div key={index} className="relative flex items-center justify-center h-10 md:h-12 px-6 overflow-hidden shadow-sm backdrop-blur-md hover:scale-105 transition-transform duration-300 cursor-pointer" style={{ background: index % 2 === 0 ? "linear-gradient(90deg, rgba(249, 133, 56, 0.9) 0%, rgba(249, 133, 56, 0.7) 100%)" : "linear-gradient(90deg, rgba(73, 69, 38, 0.9) 0%, rgba(73, 69, 38, 0.7) 100%)", borderRadius: "999px" }}>
                  <p className="font-montserrat font-bold text-[#FFF5AD]" style={{ fontSize: "clamp(0.75rem, 2vw, 1rem)" }}>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-[450px] md:max-w-[800px] shrink-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative w-full pb-[100%] h-0 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                <div className="absolute inset-0">
                  {renderImage(data.images[i], data.imageCropDataList?.[i], `Hero Banner Image ${i}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner3;
