// components/HeroBanner/HeroBanner7.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

// 处理换行符
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

// --- 响应式尺寸函数 (基于 1920x922 画布) ---
const rpx = (designValue: number) => `calc(var(--rpx) * ${designValue})`;

type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 资产配置 ---
const BANNER_7_ASSETS = {
  bgColor: "#99935F",
  // 左侧异形底图 (7-1)
  imageLeft: {
    src: "/home/hero-banner/banner-7/hero-banner-7-1.svg",
    x: 0,
    y: 0,
    width: 952,
    height: 922,
  },
  // 菱形图片组 (Diamonds)
  diamonds: [
    {
      id: "top",
      src_idx: 1,
      x: 752,
      y: -210,
      size: 414,
      borderRadius: 97,
      zIndex: 20,
    },
    {
      id: "middle",
      src_idx: 2,
      x: 992,
      y: 256,
      size: 290,
      borderRadius: 88,
      zIndex: 21,
    },
    {
      id: "bottom",
      src_idx: 3,
      x: 727,
      y: 535,
      size: 414,
      borderRadius: 97,
      zIndex: 22,
    },
  ],
  // 光柱装饰 (计算绝对坐标：lightline 组 x:845.82 + 子节点相对坐标，并转为 right 定位)
  lightBeams: [
    {
      right: -500,
      y: -231.01,
      width: 1538,
      height: 192,
      rotation: 45,
      opacity: 0.44,
    },
    {
      right: -200,
      y: -245.01,
      width: 942,
      height: 192,
      rotation: 45,
      opacity: 0.44,
    },
    {
      right: -400,
      y: -197.17,
      width: 942,
      height: 72,
      rotation: 45,
      opacity: 0.44,
    },
    {
      right: -300,
      y: -454,
      width: 942,
      height: 72,
      rotation: 45,
      opacity: 0.44,
    },
  ],
  // 内容区域
  content: {
    titleGroup: { x: 1197, y: 125 },
    featureGroup: { x: 1230, y: 508 },
    subtitle: { x: 79, y: 601 },
  },
};

const HeroBanner7: FC<BannerProps> = ({ data }) => {
  const titleParts = formatText(data.features[0]).split("\n");
  const subtitleParts = formatText(data.features[1]).split("\n");
  const features = [data.features[2], data.features[3], data.features[4]];

  return (
    <section
      className="relative w-full h-full min-h-[600px] lg:min-h-0 lg:aspect-[1920/922] overflow-hidden"
      style={{ backgroundColor: BANNER_7_ASSETS.bgColor }}
    >
      {/* --- PC 端布局 (1920x922 居中容器) --- */}
      <div
        className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: rpx(1920), height: rpx(922) }}
      >
        {/* 1. 光柱装饰层 (CSS 渐变) */}
        {BANNER_7_ASSETS.lightBeams.map((beam, index) => (
          <div
            key={index}
            className="absolute pointer-events-none"
            style={{
              right: rpx(beam.right),
              top: rpx(beam.y),
              width: rpx(beam.width),
              height: rpx(beam.height),
              opacity: beam.opacity,
              transform: `rotate(${beam.rotation}deg)`,
              transformOrigin: "left top",
              background:
                "linear-gradient(to right, transparent, #FFED5B 20%, #FFED5B 80%, transparent)",
              zIndex: 5,
            }}
          />
        ))}

        {/* 2. 左侧底图 */}
        <div
          className="absolute z-10"
          style={{
            left: rpx(BANNER_7_ASSETS.imageLeft.x),
            top: rpx(BANNER_7_ASSETS.imageLeft.y),
            width: rpx(BANNER_7_ASSETS.imageLeft.width),
            height: rpx(BANNER_7_ASSETS.imageLeft.height),
            maskImage: `url(${BANNER_7_ASSETS.imageLeft.src})`,
            WebkitMaskImage: `url(${BANNER_7_ASSETS.imageLeft.src})`,
            maskSize: "100% 100%",
          }}
        >
          <ServerImage
            image={data.images[0]}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 3. 菱形图片组 */}
        {BANNER_7_ASSETS.diamonds.map((diamond) => (
          <div
            key={diamond.id}
            className="absolute overflow-hidden"
            style={{
              left: rpx(diamond.x),
              top: rpx(diamond.y),
              width: rpx(diamond.size),
              height: rpx(diamond.size),
              borderRadius: rpx(diamond.borderRadius),
              border: `${rpx(11)} solid #756F3F`,
              zIndex: diamond.zIndex,
              transform: "rotate(45deg)",
            }}
          >
            <div className="w-full h-full -rotate-45 scale-[1.4]">
              <ServerImage
                image={data.images[diamond.src_idx]}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}

        {/* 4. 主标题内容区域 */}
        <div
          className="absolute z-40 flex flex-col items-start pointer-events-auto"
          style={{
            left: rpx(BANNER_7_ASSETS.content.titleGroup.x),
            top: rpx(BANNER_7_ASSETS.content.titleGroup.y),
          }}
        >
          <div className="flex flex-col">
            {titleParts.map((line, idx) => {
              const isFirst = idx === 0;
              return (
                <h1
                  key={idx}
                  className="font-paytone-one leading-[1.1] whitespace-nowrap"
                  style={{
                    fontSize: rpx(96),
                    color: isFirst ? "#FFFFFF" : "#433E12",
                    WebkitTextStroke: `${rpx(4)} #000000`,
                    paintOrder: "stroke fill",
                  }}
                >
                  {isFirst
                    ? line.split(/(-)/g).map((part, pIdx) => (
                        <span
                          key={pIdx}
                          className={part === "-" ? "text-[#433E12]" : ""}
                        >
                          {part}
                        </span>
                      ))
                    : line}
                </h1>
              );
            })}
          </div>
        </div>

        {/* 5. 特性胶囊组 */}
        <div
          className="absolute z-40 flex flex-col gap-6 pointer-events-auto"
          style={{
            left: rpx(BANNER_7_ASSETS.content.featureGroup.x),
            top: rpx(BANNER_7_ASSETS.content.featureGroup.y),
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center bg-[#E9E2A0] rounded-full"
              style={{ width: rpx(455), height: rpx(100) }}
            >
              <span
                className="font-montserrat font-bold text-black"
                style={{ fontSize: rpx(30), letterSpacing: "0.06em" }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* 6. 副标题 */}
        <div
          className="absolute z-40 pointer-events-auto"
          style={{
            left: rpx(BANNER_7_ASSETS.content.subtitle.x),
            top: rpx(BANNER_7_ASSETS.content.subtitle.y),
          }}
        >
          <h2
            className="font-paytone-one text-white leading-tight"
            style={{ fontSize: rpx(60) }}
          >
            {subtitleParts.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </h2>
        </div>
      </div>

      {/* --- Mobile/Tablet 端布局 (Vertical Stack) --- */}
      <div className="lg:hidden relative flex flex-col items-center pt-20 pb-10 px-6 gap-8">
        <div
          className="absolute inset-0 z-0 opacity-30 pointer-events-none"
          style={{ background: "linear-gradient(45deg, #FFED5B, transparent)" }}
        />
        <div className="relative z-10 flex flex-col items-center">
          {titleParts.map((line, idx) => (
            <h1
              key={idx}
              className="font-paytone-one text-center leading-tight"
              style={{
                fontSize: "42px",
                color: idx === 0 ? "#FFFFFF" : "#433E12",
                WebkitTextStroke: "1px #000000",
                paintOrder: "stroke fill",
              }}
            >
              {line}
            </h1>
          ))}
        </div>
        <div className="relative w-64 h-64 rotate-45 overflow-hidden rounded-[40px] border-4 border-[#756F3F] z-10">
          <div className="w-full h-full -rotate-45 scale-125">
            <ServerImage
              image={data.images[2]}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap justify-center gap-2">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[#E9E2A0] px-4 py-2 rounded-full">
              <span className="font-montserrat font-bold text-xs text-black uppercase tracking-wider">
                {feature}
              </span>
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center">
          <p className="font-paytone-one text-white text-xl">
            {subtitleParts.join(" ")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner7;
