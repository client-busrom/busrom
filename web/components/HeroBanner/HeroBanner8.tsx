// components/HeroBanner/HeroBanner8.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";
import { AutoScaleText } from "@/components/ui/AutoScaleText";

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

const BANNER_8_ASSETS = {
  bgColor: "#544F22",
  bgFrame: { src: "/home/hero-banner/banner-8/hero-banner-8-1.svg", width: 1156, height: 922 },
  mainImage: { mask: "/home/hero-banner/banner-8/hero-banner-8-1-image.svg", width: 1134, height: 922 },
  decorator: { src: "/home/hero-banner/banner-8/hero-banner-8-decorator.svg", width: 1920, height: 922 },
  content: {
    title: { x: 132, y: 85, fontSize: 96 },
    subtitle: { x: 132, y: 124, fontSize: 48 },
    features: { x: 132, y: 560, gap: 16, fontSize: 30 },
  },
  bottomImages: { x: 820, y: 530, gap: 42, width: 318, height: 291, borderWidth: 10 }
};

const HeroBanner8: FC<BannerProps> = ({ data }) => {
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

  const titleLines = formatText(data.features[0]).split("\n");
  const subtitle = data.features[1];
  const featureCapsules = data.features.slice(2, 5).filter(f => f && f.trim());

  return (
    <section className="relative w-full h-full md:aspect-[1920/922] overflow-hidden" style={{ backgroundColor: BANNER_8_ASSETS.bgColor }}>
      
      {/* --- PC/Tablet 端布局 --- */}
      <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: rpx(1920), height: rpx(922) }}>
          <div className="absolute inset-0 z-0 opacity-60"><img src={BANNER_8_ASSETS.decorator.src} className="w-full h-full object-cover" alt="" /></div>
          <div className="absolute right-0 top-0 h-full z-10" style={{ width: rpx(BANNER_8_ASSETS.bgFrame.width) }}><img src={BANNER_8_ASSETS.bgFrame.src} className="w-full h-full object-fill" alt="" /></div>
          <div className="absolute right-0 top-0 h-full z-20" style={{ width: rpx(BANNER_8_ASSETS.mainImage.width), maskImage: `url(${BANNER_8_ASSETS.mainImage.mask})`, WebkitMaskImage: `url(${BANNER_8_ASSETS.mainImage.mask})`, maskSize: "100% 100%", maskRepeat: "no-repeat" }}>{renderImage(data.images[0], data.imageCropDataList?.[0], "", "object-cover", true)}</div>
          <div className="absolute z-30" style={{ left: rpx(BANNER_8_ASSETS.content.title.x), top: rpx(BANNER_8_ASSETS.content.title.y), maxWidth: rpx(800) }}>
            <h1 className="font-paytone-one leading-[1.1] pointer-events-auto" style={{ fontSize: rpx(BANNER_8_ASSETS.content.title.fontSize) }}>
              {titleLines.map((line, idx) => (
                <div key={idx} className={idx === titleLines.length - 1 ? "text-white" : "text-black"} style={{ WebkitTextStroke: `${rpx(6)} #FDF6C2`, paintOrder: "stroke fill", letterSpacing: "0.06em" }}>
                  <AutoScaleText minScale={0.5}>{line}</AutoScaleText>
                </div>
              ))}
            </h1>
          </div>
          <div className="absolute right-0 z-40 bg-[#665F1F] text-[#FEFFD8] rounded-l-full flex items-center justify-center pointer-events-auto" style={{ top: rpx(BANNER_8_ASSETS.content.subtitle.y), padding: `${rpx(30)} ${rpx(60)}`, minWidth: rpx(300) }}>
            <div style={{ width: rpx(740), overflow: "hidden" }}>
              <AutoScaleText minScale={0.4} className="font-paytone-one" style={{ fontSize: rpx(BANNER_8_ASSETS.content.subtitle.fontSize) }}>
                {subtitle}
              </AutoScaleText>
            </div>
          </div>
          <div className="absolute z-40 flex flex-col pointer-events-auto" style={{ left: rpx(BANNER_8_ASSETS.content.features.x), top: rpx(BANNER_8_ASSETS.content.features.y), gap: rpx(BANNER_8_ASSETS.content.features.gap) }}>
             {featureCapsules.map((f, i) => (<div key={i} className="bg-[#FFFB1B]/10 border border-[#CFBC37] flex items-center backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer" style={{ borderRadius: rpx(24), paddingLeft: rpx(32), paddingRight: rpx(32), paddingTop: rpx(8), paddingBottom: rpx(8) }}><span className="font-montserrat font-bold text-[#CFBC37] uppercase tracking-widest" style={{ fontSize: rpx(BANNER_8_ASSETS.content.features.fontSize), textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{f}</span></div>))}
          </div>
          <div className="absolute z-40 flex items-end pointer-events-auto" style={{ left: rpx(BANNER_8_ASSETS.bottomImages.x), top: rpx(BANNER_8_ASSETS.bottomImages.y), gap: rpx(BANNER_8_ASSETS.bottomImages.gap) }}>
             {data.images.slice(1, 4).map((img, i) => (<div key={i} className="relative overflow-hidden bg-white shadow-xl" style={{ width: rpx(BANNER_8_ASSETS.bottomImages.width), height: rpx(BANNER_8_ASSETS.bottomImages.height), borderRadius: rpx(34), border: `${rpx(BANNER_8_ASSETS.bottomImages.borderWidth)} solid white` }}>{renderImage(img, data.imageCropDataList?.[i + 1], "")}</div>))}
          </div>
        </div>
      </div>

      {/* --- Mobile & Tablet 端 (压缩垂直空间) --- */}
      <div className="md:hidden absolute inset-0 z-20 flex flex-col items-center justify-center w-full h-full">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 z-0 scale-110 opacity-40 blur-[10px] brightness-[0.6]">
              {renderImage(data.images[0], data.imageCropDataList?.[0], "")}
           </div>
           <div className="absolute inset-0 z-10 bg-black/20" />
        </div>

        {/* 减小内边距 py-12 -> py-6/py-8 */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-6 py-6 md:py-8 text-center">
          {/* 减小外边距 mb-14 -> mb-6 */}
          <div className="flex flex-col items-center w-full gap-3 md:gap-4 mb-6 md:mb-8">
             <div className="bg-[#665F1F] text-[#FEFFD8] px-5 py-1.5 md:py-2 rounded-full shadow-lg">
                <span className="font-paytone-one text-xs md:text-base">{subtitle}</span>
             </div>
             {/* 略微调小平板字号 md:text-6xl -> md:text-5xl */}
             <h1 className="font-paytone-one leading-tight text-2xl md:text-5xl">
                {titleLines.map((line, i) => (
                  <div key={i} className={i === titleLines.length - 1 ? "text-white" : "text-black"} 
                       style={{ WebkitTextStroke: "1px #FDF6C2", paintOrder: "stroke fill" }}>
                    {line}
                  </div>
                ))}
             </h1>
             <div className="flex flex-col gap-2 w-full max-w-[260px] md:max-w-[400px] mt-1">
                {featureCapsules.map((f, i) => (
                  <div key={i} className="bg-[#FFFB1B]/10 border border-[#CFBC37] rounded-full px-5 py-1.5 md:py-2 backdrop-blur-md hover:scale-105 transition-transform duration-300 cursor-pointer">
                     <span className="font-montserrat font-bold text-[#CFBC37] text-[10px] md:text-sm uppercase tracking-wider">{f}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* 减小图片网格的上边距 mt-16 -> mt-4 */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 w-full max-w-[400px] md:max-w-[650px] shrink-0 mt-4 md:mt-6">
             {data.images.slice(1, 4).map((img, i) => (
               <div key={i} className="relative w-full pb-[100%] h-0 rounded-xl border-2 md:border-4 border-white overflow-hidden shadow-2xl bg-white/10">
                  <div className="absolute inset-0">
                    {renderImage(img, data.imageCropDataList?.[i + 1], "")}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner8;
