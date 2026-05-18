// components/HeroBanner/HeroBanner9.tsx
import React, { FC } from "react";
import { getObjectPosition, getCropStyles, getCropImageUrl } from "@/lib/utils";
import MagneticWrapper from "./MagneticWrapper";
import { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

interface HeroBanner9Props {
  data: HomeContent["heroBanner"][number];
  locale: Locale;
}

const rpx = (designValue: number) =>
  `calc(var(--rpx-hero, 1) * ${designValue}px)`;

const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

const BANNER_9_ASSETS = {
  decoratorTop: "/home/hero-banner/banner-9/hero-banner-9-decorator.svg",
  mask1: "/home/hero-banner/banner-9/hero-banner-9-1-image.svg",
  border1: "/home/hero-banner/banner-9/hero-banner-9-1.svg",
  mask2: "/home/hero-banner/banner-9/hero-banner-9-2-image.svg",
  border2: "/home/hero-banner/banner-9/hero-banner-9-2.svg",
  blocks: [
    { src: "/home/hero-banner/banner-9/bannerBlock1.svg", w: 748, h: 162 },
    { src: "/home/hero-banner/banner-9/bannerBlock2.svg", w: 748, h: 173 },
    { src: "/home/hero-banner/banner-9/bannerBlock3.svg", w: 748, h: 156 },
  ],
};

const RenderCroppedImage = ({
  image,
  cropData,
  alt = "",
  className = "object-cover",
}: {
  image: any;
  cropData: any;
  alt?: string;
  className?: string;
}) => {
  const cropStyles = getCropStyles(cropData);
  if (cropStyles && cropData && cropData.croppedAreaPixels) {
    return (
      <div
        className="absolute inset-0 w-full h-full"
        style={{ ...cropStyles.container }}
      >
        <img
          src={getCropImageUrl(image, cropData)}
          alt={alt}
          style={{
            ...cropStyles.image,
            width: `${(cropData.variantWidth / cropData.croppedAreaPixels.width) * 100}%`,
            height: `${(cropData.variantHeight / cropData.croppedAreaPixels.height) * 100}%`,
            left: `${(-cropData.croppedAreaPixels.x / cropData.croppedAreaPixels.width) * 100}%`,
            top: `${(-cropData.croppedAreaPixels.y / cropData.croppedAreaPixels.height) * 100}%`,
            maxWidth: "none",
          }}
        />
      </div>
    );
  }
  return (
    <ServerImage image={image} alt={alt} fill className={className} priority />
  );
};

const TitleLine: FC<{ text: string; index: number; isMobile?: boolean }> = ({
  text,
  index,
  isMobile,
}) => {
  const rotation = -1.81;
  const block = BANNER_9_ASSETS.blocks[index % 3];

  if (isMobile) {
    return (
      <div
        className="relative mb-2 last:mb-0"
        style={{ width: "280px", aspectRatio: `${block.w}/${block.h}` }}
      >
        <img
          src={block.src}
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-start px-8">
          <h1
            className="font-paytone-one text-[#3C3712] text-[22px] leading-none text-left"
            style={{
              transform: `rotate(${rotation}deg)`,
              WebkitTextStroke: "0.5px #FFFFFF",
            }}
          >
            {text}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        width: rpx(block.w),
        height: rpx(block.h),
      }}
    >
      <img
        src={block.src}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div
        className="absolute inset-0 flex items-center justify-start overflow-visible"
        style={{ paddingLeft: rpx(40) }}
      >
        <h1
          className="font-paytone-one text-[#3C3712] whitespace-nowrap leading-none lg:text-[calc(var(--rpx-hero)*96px)] md:text-[24px]"
          style={{
            fontSize: rpx(96),
            transform: `rotate(${rotation}deg) translateY(${index === 0 ? rpx(-10) : "0"})`,
            WebkitTextStroke: `${rpx(6)} #FFFFFF`,
            paintOrder: "stroke fill",
          }}
        >
          {text}
        </h1>
      </div>
    </div>
  );
};

const HeroBanner9: FC<HeroBanner9Props> = ({ data, locale }) => {
  const feature0Lines = formatText(data.features[0]).split("\n");

  return (
    <section className="relative w-full h-full bg-[#99935F]">
      {/* 1. 桌面端 & 平板端 */}
      <div className="hidden md:block relative w-full h-full overflow-hidden">
        <div className="absolute top-0 right-0 z-0 pointer-events-none opacity-30 lg:opacity-100">
          <img
            src={BANNER_9_ASSETS.decoratorTop}
            alt=""
            style={{ width: rpx(682), height: rpx(833) }}
            className="object-contain"
          />
        </div>
        <div className="absolute left-0 top-0 z-0 pointer-events-none">
          <img
            src={BANNER_9_ASSETS.border1}
            alt=""
            style={{ width: rpx(1349), height: rpx(922) }}
            className="object-contain object-left"
          />
        </div>
        <div
          className="absolute left-0 top-0 z-10"
          style={{
            width: rpx(1292),
            height: rpx(922),
            maskImage: `url(${BANNER_9_ASSETS.mask1})`,
            WebkitMaskImage: `url(${BANNER_9_ASSETS.mask1})`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        >
          <RenderCroppedImage
            image={data.images[0]}
            cropData={data.imageCropDataList?.[0]}
            alt="Main BG"
          />
        </div>
        <div
          className="absolute bottom-0 left-0 z-20 md:scale-[0.65] lg:scale-100 origin-bottom-left"
          style={{ width: rpx(824), height: rpx(411) }}
        >
          <img
            src={BANNER_9_ASSETS.border2}
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div
            className="absolute z-10"
            style={{
              bottom: 0,
              left: 0,
              width: rpx(433),
              height: rpx(400),
              maskImage: `url(${BANNER_9_ASSETS.mask2})`,
              WebkitMaskImage: `url(${BANNER_9_ASSETS.mask2})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
            }}
          >
            <RenderCroppedImage
              image={data.images[1]}
              cropData={data.imageCropDataList?.[1]}
              alt="Feature BG"
            />
          </div>
          <div
            className="absolute z-20 flex flex-col items-center"
            style={{ bottom: rpx(80), left: rpx(440), gap: rpx(12) }}
          >
            {[data.features[2], data.features[3], data.features[4]].map(
              (f, i) => (
                <h2
                  key={i}
                  className="font-montserrat font-bold text-[#FFA836] whitespace-nowrap md:text-[18px] lg:text-[calc(var(--rpx-hero)*30px)]"
                  style={{
                    fontSize: rpx(30),
                    letterSpacing: "0.03em",
                    WebkitTextStroke: `${rpx(4)} #6B4E00`,
                    paintOrder: "stroke fill",
                  }}
                >
                  {f}
                </h2>
              ),
            )}
          </div>
        </div>
        <div
          className="absolute z-30 flex flex-col items-start text-left md:scale-[0.65] lg:scale-100 origin-top-right"
          style={{
            right: rpx(35),
            top: rpx(130),
          }}
        >
          <div className="flex flex-col items-start" style={{ marginBottom: rpx(83.5) }}>
            {feature0Lines.map((line, idx) => (
              <TitleLine key={idx} text={line} index={idx} />
            ))}
          </div>
          <h1
            className="font-paytone-one text-white whitespace-pre-line leading-tight text-left md:text-[28px] lg:text-[calc(var(--rpx-hero)*60px)]"
            style={{
              fontSize: rpx(60),
              width: rpx(697),
              marginLeft: rpx(104),
              WebkitTextStroke: `${rpx(7)} #6B4E00`,
              paintOrder: "stroke fill",
            }}
          >
            {formatText(data.features[1])}
          </h1>
        </div>
      </div>

      {/* 2. 移动端：全 Absolute 定位模式 */}
      <div className="md:hidden relative w-full h-full max-h-screen bg-[#99935F] overflow-hidden">
        {/* 背景纹理层 */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src={BANNER_9_ASSETS.border1}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Layer 0: 边框底座 */}
        <img
          src={BANNER_9_ASSETS.border1}
          alt=""
          className="absolute top-0 left-0 w-full aspect-[1349/922] object-contain object-top z-10 pointer-events-none"
        />

        {/* Layer 1: 裁切主图 */}
        <div
          className="absolute top-0 left-0 w-full aspect-[1349/922] z-20"
          style={{
            maskImage: `url(${BANNER_9_ASSETS.mask1})`,
            WebkitMaskImage: `url(${BANNER_9_ASSETS.mask1})`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        >
          <RenderCroppedImage
            image={data.images[0]}
            cropData={data.imageCropDataList?.[0]}
            alt="Mobile Main"
          />
        </div>

        {/* Layer 2: 叠放标题块 - 大幅拉开间距 */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-full flex flex-col items-center z-30 scale-[0.85]">
          {feature0Lines.map((line, idx) => (
            <TitleLine key={idx} text={line} index={idx} isMobile />
          ))}
          {/* 副标题与装饰块 */}
          <p
            className="font-paytone-one text-white text-[19px] text-center whitespace-pre-line leading-tight"
            style={{ WebkitTextStroke: "1px #6B4E00", letterSpacing: "0.03em" }}
          >
            {formatText(data.features[1])}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full max-w-[340px] aspect-[824/411] z-20">
          <img
            src={BANNER_9_ASSETS.border2}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <div
            className="absolute bottom-0 left-0 w-[53%] h-[96%]"
            style={{
              maskImage: `url(${BANNER_9_ASSETS.mask2})`,
              WebkitMaskImage: `url(${BANNER_9_ASSETS.mask2})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
            }}
          >
            <ServerImage
              image={data.images[1]}
              alt="Mobile Feature Focus"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-0 right-[4%] w-[42%] h-full flex flex-col justify-center items-center gap-1">
            {[data.features[2], data.features[3], data.features[4]].map(
              (f, i) => (
                <h2
                  key={i}
                  className="font-montserrat font-bold text-[#FFA836] text-[9px] whitespace-nowrap text-center"
                  style={{
                    letterSpacing: "0.01em",
                    WebkitTextStroke: "0.6px #6B4E00",
                    paintOrder: "stroke fill",
                  }}
                >
                  {f}
                </h2>
              ),
            )}
          </div>
        </div>
      </div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hero9DiamondClip" clipPathUnits="objectBoundingBox">
            <path d="M0.256977 0.0706721C0.344459 -0.0235574 0.486297 -0.0235573 0.57378 0.0706721L0.933325 0.45794C1.02081 0.55217 1.02081 0.704948 0.933325 0.799178L0.747293 0.999554H0.0834656L0 0.909653V0.347466L0.256977 0.0706721Z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
};

export default HeroBanner9;
