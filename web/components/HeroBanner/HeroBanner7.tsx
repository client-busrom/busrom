// components/HeroBanner/HeroBanner7.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 资产配置：同步合并后的 SVG 尺寸与对齐方式 ---
const BANNER_7_ASSETS = {
  bgColor: "#99935f",
  imageMain: {
    mask: "/home/hero-banner/banner-7/hero-banner-7-1-image.svg",
    x: 0, y: 0, width: 952, height: 922,
  },
  imageBox: {
    x: 235, y: 0, width: 1200, height: 922,
    diamonds: [
      { 
        id: "top", src_idx: 1, 
        frame: "/home/hero-banner/banner-7/hero-banner-7-2.svg", 
        mask: "/home/hero-banner/banner-7/hero-banner-7-2-image.svg",
        x: 190, width: 586, height: 376, 
        maskW: 506, maskH: 336, 
        alignY: "top", innerAlignY: "top", zIndex: 20 
      },
      { 
        id: "middle", src_idx: 2, 
        frame: "/home/hero-banner/banner-7/hero-banner-7-3.svg", 
        mask: "/home/hero-banner/banner-7/hero-banner-7-3-image.svg",
        x: 540.56, width: 411, height: 411, 
        maskW: 338, maskH: 338, 
        alignY: "center", innerAlignY: "center", zIndex: 21 
      },
      { 
        id: "bottom", src_idx: 3, 
        frame: "/home/hero-banner/banner-7/hero-banner-7-4.svg", 
        mask: "/home/hero-banner/banner-7/hero-banner-7-4-image.svg",
        x: 190, width: 586, height: 387, 
        maskW: 506, maskH: 347, 
        alignY: "bottom", innerAlignY: "bottom", zIndex: 22 
      },
    ],
  },
  mobile: {
    frame: "/home/hero-banner/banner-7/hero-banner-7-3.svg",
    mask: "/home/hero-banner/banner-7/hero-banner-7-3-image.svg",
    diamondSize: "44%",
    innerScale: "82.2%", 
  },
  lightBeams: [
    { right: -500, y: -231.01, width: 1538, height: 192, rotation: 45, opacity: 0.44 },
    { right: -200, y: -245.01, width: 942, height: 192, rotation: 45, opacity: 0.44 },
    { right: -400, y: -197.17, width: 942, height: 72, rotation: 45, opacity: 0.44 },
    { right: -300, y: -454, width: 942, height: 72, rotation: 45, opacity: 0.44 },
  ],
  content: {
    titleGroup: { x: 1197, y: 125 },
    featureGroup: { x: 1230, y: 508 },
    subtitle: { x: 79, y: 601 },
  },
};

const HeroBanner7: FC<BannerProps> = ({ data }) => {
  const titleParts = formatText(data.features[0]).split("\n");
  const subtitleParts = formatText(data.features[1]).split("\n");
  const featuresList = data.features.slice(2, 5).filter((f) => f && f.trim());

  return (
    <section className="relative w-full h-full md:aspect-[1920/922] overflow-hidden" style={{ backgroundColor: BANNER_7_ASSETS.bgColor }}>
      {/* --- PC/Tablet 端布局 --- */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: rpx(1920), height: rpx(922) }}>
        
        {/* 光束层 */}
        {BANNER_7_ASSETS.lightBeams.map((beam, index) => (
          <div key={index} className="absolute pointer-events-none" style={{ right: rpx(beam.right), top: rpx(beam.y), width: rpx(beam.width), height: rpx(beam.height), opacity: beam.opacity, transform: `rotate(${beam.rotation}deg)`, transformOrigin: "left top", background: "linear-gradient(to right, transparent, #FFED5B 20%, #FFED5B 80%, transparent)", zIndex: 5 }} />
        ))}

        {/* 左侧主图 */}
        <div className="absolute z-10" style={{ left: rpx(BANNER_7_ASSETS.imageMain.x), top: "50%", transform: "translateY(-50%)", width: rpx(BANNER_7_ASSETS.imageMain.width), height: rpx(BANNER_7_ASSETS.imageMain.height), maskImage: `url(${BANNER_7_ASSETS.imageMain.mask})`, WebkitMaskImage: `url(${BANNER_7_ASSETS.imageMain.mask})`, maskSize: "100% 100%" }}>
          <ServerImage image={data.images[0]} alt="" fill className="object-cover" priority />
        </div>

        {/* 右侧菱形群 */}
        <div className="absolute" style={{ left: rpx(BANNER_7_ASSETS.imageBox.x), top: rpx(BANNER_7_ASSETS.imageBox.y), width: rpx(BANNER_7_ASSETS.imageBox.width), height: rpx(BANNER_7_ASSETS.imageBox.height) }}>
          {BANNER_7_ASSETS.imageBox.diamonds.map((diamond) => (
            <div key={diamond.id} className="absolute" style={{ 
              left: rpx(diamond.x), 
              top: diamond.alignY === "top" ? 0 : diamond.alignY === "center" ? "50%" : "auto", 
              bottom: diamond.alignY === "bottom" ? 0 : "auto", 
              transform: diamond.alignY === "center" ? "translateY(-50%)" : "none", 
              width: rpx(diamond.width), 
              height: rpx(diamond.height), 
              zIndex: diamond.zIndex 
            }}>
               {/* 1. 外框 */}
               <img src={diamond.frame} className="absolute inset-0 w-full h-full object-contain z-0" />
               
               {/* 2. 图片层：应用内对齐方式 */}
               <div className="absolute z-10 left-1/2 -translate-x-1/2" style={{
                  width: rpx(diamond.maskW), 
                  height: rpx(diamond.maskH),
                  top: diamond.innerAlignY === "top" ? 0 : diamond.innerAlignY === "center" ? "50%" : "auto",
                  bottom: diamond.innerAlignY === "bottom" ? 0 : "auto",
                  transform: diamond.innerAlignY === "center" ? "translate(-50%, -50%)" : "translateX(-50%)",
                  maskImage: `url(${diamond.mask})`, WebkitMaskImage: `url(${diamond.mask})`, maskSize: "100% 100%",
               }}>
                  <ServerImage image={data.images[diamond.src_idx]} alt="" fill className="object-cover" />
               </div>
            </div>
          ))}
        </div>

        {/* 文字内容 */}
        <div className="absolute z-40 flex flex-col items-start pointer-events-auto" style={{ left: rpx(BANNER_7_ASSETS.content.titleGroup.x), top: rpx(BANNER_7_ASSETS.content.titleGroup.y) }}>
           <div className="flex flex-col">
            {titleParts.map((line, idx) => (
              <h1 key={idx} className="font-paytone-one leading-[1.1] whitespace-nowrap" style={{ fontSize: rpx(96), color: idx === 0 ? "#FFFFFF" : "#433E12", WebkitTextStroke: `${rpx(4)} #000000`, paintOrder: "stroke fill" }}>
                {idx === 0 ? line.split(/(-)/g).map((part, pIdx) => <span key={pIdx} className={part === '-' ? 'text-[#433E12]' : ''}>{part}</span>) : line}
              </h1>
            ))}
          </div>
        </div>

        <div className="absolute z-40 flex flex-col pointer-events-auto" style={{ left: rpx(BANNER_7_ASSETS.content.featureGroup.x), top: rpx(BANNER_7_ASSETS.content.featureGroup.y), gap: rpx(24) }}>
          {data.features.slice(2, 5).map((feature, idx) => (
            <div key={idx} className="flex items-center justify-center bg-[#E9E2A0] rounded-full" style={{ width: rpx(455), height: rpx(100) }}>
              <span className="font-montserrat font-bold text-black" style={{ fontSize: rpx(30), letterSpacing: '0.06em' }}>{feature}</span>
            </div>
          ))}
        </div>

        <div className="absolute z-40 pointer-events-auto" style={{ left: rpx(BANNER_7_ASSETS.content.subtitle.x), top: rpx(BANNER_7_ASSETS.content.subtitle.y) }}>
          <h2 className="font-paytone-one text-white leading-tight" style={{ fontSize: rpx(60) }}>{subtitleParts.map((line, i) => <div key={i}>{line}</div>)}</h2>
        </div>
      </div>

      {/* --- Mobile 端布局 --- */}
      <div className="md:hidden absolute inset-0 z-30 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full py-6 px-6 gap-5">
          {/* 完美的非对称式重叠主图与菱形群 (完美复刻桌面端风格) */}
          <div className="relative w-full max-w-[340px] aspect-[1200/922] shrink-0 z-10 mx-auto">
            {/* 左侧带蒙版的主图 */}
            <div className="absolute left-0 top-[10%] w-[58%] h-[80%] z-10" style={{ maskImage: `url(${BANNER_7_ASSETS.imageMain.mask})`, WebkitMaskImage: `url(${BANNER_7_ASSETS.imageMain.mask})`, maskSize: "100% 100%" }}>
              <ServerImage image={data.images[0]} alt="" fill className="object-cover" />
            </div>

            {/* 顶部的菱形小图 */}
            <div className="absolute left-[38%] top-[5%] w-[42%] h-[32%] z-20">
              <img src={BANNER_7_ASSETS.imageBox.diamonds[0].frame} className="absolute inset-0 w-full h-full object-contain z-0" />
              <div className="absolute inset-0 z-10 left-1/2 -translate-x-1/2 w-[86%] h-[89%] top-[5%]" style={{ maskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[0].mask})`, WebkitMaskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[0].mask})`, maskSize: "100% 100%" }}>
                <ServerImage image={data.images[1]} alt="" fill className="object-cover" />
              </div>
            </div>

            {/* 中间的菱形小图 */}
            <div className="absolute left-[58%] top-[30%] w-[34%] h-[34%] z-[21]">
              <img src={BANNER_7_ASSETS.imageBox.diamonds[1].frame} className="absolute inset-0 w-full h-full object-contain z-0" />
              <div className="absolute inset-0 z-10 left-1/2 -translate-x-1/2 w-[82%] h-[82%] top-[9%]" style={{ maskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[1].mask})`, WebkitMaskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[1].mask})`, maskSize: "100% 100%" }}>
                <ServerImage image={data.images[2]} alt="" fill className="object-cover" />
              </div>
            </div>

            {/* 底部的菱形小图 */}
            <div className="absolute left-[38%] top-[58%] w-[42%] h-[33%] z-[22]">
              <img src={BANNER_7_ASSETS.imageBox.diamonds[2].frame} className="absolute inset-0 w-full h-full object-contain z-0" />
              <div className="absolute inset-0 z-10 left-1/2 -translate-x-1/2 w-[86%] h-[89%] bottom-[5%]" style={{ maskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[2].mask})`, WebkitMaskImage: `url(${BANNER_7_ASSETS.imageBox.diamonds[2].mask})`, maskSize: "100% 100%" }}>
                <ServerImage image={data.images[3]} alt="" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* 描边特效标题 */}
          <div className="relative z-30 flex flex-col items-center shrink-0">
            {titleParts.map((line, idx) => (
              <h1 
                key={idx} 
                className="font-paytone-one leading-[1.1] text-center text-3xl sm:text-4xl" 
                style={{ 
                  color: idx === 0 ? "#FFFFFF" : "#433E12", 
                  WebkitTextStroke: "1.5px #000000", 
                  paintOrder: "stroke fill" 
                }}
              >
                {idx === 0 
                  ? line.split(/(-)/g).map((part, pIdx) => (
                      <span key={pIdx} className={part === '-' ? 'text-[#433E12]' : ''}>
                        {part}
                      </span>
                    )) 
                  : line
                }
              </h1>
            ))}
          </div>

          {/* 精致的金色特征标签 */}
          <div className="relative z-40 flex flex-wrap justify-center gap-2 w-full shrink-0">
            {featuresList.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-[#E9E2A0] px-5 py-1.5 rounded-full text-black shadow-md border border-[#433E12]/10"
              >
                <span className="font-montserrat font-bold text-[11px] tracking-wider block text-center min-w-[110px]">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* 副标题 */}
          <div className="relative z-30 text-center px-4 pb-8 shrink-0">
            <p className="font-paytone-one text-white text-base sm:text-lg opacity-90 leading-tight">
              {subtitleParts.join(" ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner7;
