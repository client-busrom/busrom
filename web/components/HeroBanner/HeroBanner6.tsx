// components/HeroBanner/HeroBanner6.tsx
import type { FC } from "react";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { ServerImage } from "@/components/ui/ServerImage";

// 处理换行符：支持 /n 和 \n
const formatText = (text: string | undefined) =>
  text?.replace(/\/n|\\n/g, "\n") || "";

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- 响应式尺寸函数 ---
const rpx = (designValue: number) => `calc(var(--rpx) * ${designValue})`;

// --- 资产配置 (基于 1920x922 画布，中心点 960, 461) ---
const BANNER_6_ASSETS = {
  bgColor: "#FFEECA",
  // 左侧异形图 (6-1)
  imageLeft: {
    src: "/home/hero-banner/banner-6/hero-banner-6-1-image.svg",
    width: 1253,
    height: 922,
    dx: 0,
    dy: 0,
    opacity: 0.85,
    blur: 7,
  },
  // 右侧异形图 (6-2)
  imageRight: {
    src: "/home/hero-banner/banner-6/hero-banner-6-2-image.svg",
    width: 957,
    height: 1121,
    dx: 0,
    dy: 0,
  },
  // 左上角装饰圆
  decorator: {
    width: 85,
    height: 85,
    dx: -888.5,
    dy: -456.5,
    color: "#FFFAD3",
  },
  // 副标题胶囊背景
  subtitleBg: {
    width: 704,
    height: 120,
    dx: -607,
    dy: -318,
  },
  // 标题组位置
  titleGroup: {
    dx: -450,
    dy: -50,
  },
};

const HeroBanner6: FC<BannerProps> = ({ data }) => {
  // 解析标题
  const titleParts = formatText(data.features[0])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#FFEECA] font-sans">
      {/* 1. PC 端布局 (中心锚定引擎) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2">
          {/* 左上角装饰圆 */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full z-10"
            style={{
              width: rpx(BANNER_6_ASSETS.decorator.width),
              height: rpx(BANNER_6_ASSETS.decorator.height),
              backgroundColor: BANNER_6_ASSETS.decorator.color,
              transform: `translate(calc(-50% + ${rpx(BANNER_6_ASSETS.decorator.dx)}), calc(-50% + ${rpx(BANNER_6_ASSETS.decorator.dy)}))`,
            }}
          />

          {/* 左侧模糊背景异形图 (6-1) */}
          <div
            className="absolute left-0 top-0 z-0"
            style={{
              width: rpx(BANNER_6_ASSETS.imageLeft.width),
              height: rpx(BANNER_6_ASSETS.imageLeft.height),
              opacity: BANNER_6_ASSETS.imageLeft.opacity,
              maskImage: `url(${BANNER_6_ASSETS.imageLeft.src})`,
              WebkitMaskImage: `url(${BANNER_6_ASSETS.imageLeft.src})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          >
            <div className="w-full h-full bg-white blur-[10px]">
              <ServerImage
                image={data.images[1] || data.images[0]}
                alt=""
                fill
                size="medium"
                className="object-cover opacity-60"
              />
            </div>
          </div>

          {/* 右侧主展示异形图 (6-2) */}
          <div
            className="absolute right-0 top-0 z-20"
            style={{
              width: rpx(BANNER_6_ASSETS.imageRight.width),
              height: rpx(BANNER_6_ASSETS.imageRight.height),
              maskImage: `url(${BANNER_6_ASSETS.imageRight.src})`,
              WebkitMaskImage: `url(${BANNER_6_ASSETS.imageRight.src})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          >
            <ServerImage
              image={data.images[0]}
              alt=""
              fill
              size="large"
              className="object-cover"
              priority
            />
          </div>

          {/* 副标题区域 (背景框 + 文字) */}
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
            <p
              className="absolute font-arial font-bold italic text-[#754600] whitespace-nowrap"
              style={{
                fontSize: rpx(36),
                letterSpacing: "1.8px",
                right: rpx(80), // 相对于背景框 x:1 的偏移
                top: "50%",
                lineHeight: 0.6,
              }}
            >
              {formatText(data.features[1])}
            </p>
          </div>

          {/* 主标题文字内容区域 */}
          <div
            className="absolute left-1/2 top-1/2 z-40 flex flex-col pointer-events-auto items-start"
            style={{
              transform: `translate(calc(-50% + ${rpx(BANNER_6_ASSETS.titleGroup.dx)}), calc(-50% + ${rpx(BANNER_6_ASSETS.titleGroup.dy)}))`,
            }}
          >
            {/* 主标题 (阶梯样式) */}
            <div className="flex flex-col gap-4">
              {titleParts.map((line, idx) => {
                const isFirst = idx === 0;

                // 默认配置 (后续行)
                let fontSize = 96;
                let textColor = "#332E0B";
                let strokeColor = "#FDF6C2";
                let strokeWidth = 3;

                // 第一行特殊配置
                if (isFirst) {
                  fontSize = 96;
                  textColor = "#FFFFFF";
                  strokeColor = "#443D05";
                  strokeWidth = 5;
                }

                return (
                  <h1
                    key={idx}
                    className="font-poller-one leading-none"
                    style={{
                      fontSize: rpx(fontSize),
                      color: textColor,
                      WebkitTextStroke: `${rpx(strokeWidth)} ${strokeColor}`,
                      paintOrder: "stroke fill",
                    }}
                  >
                    {line}
                  </h1>
                );
              })}
            </div>
          </div>

          {/* 底部三个特性按钮 */}
          <div
            className="absolute left-[360px] bottom-0 z-50 pointer-events-auto"
            style={{
              transform: `translate(calc(-50% + ${rpx(-510)}), calc(-50% + ${rpx(280)}))`,
            }}
          >
            <div className="relative">
              {[data.features[2], data.features[3], data.features[4]].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="absolute flex items-center justify-end bg-[#756F3F]"
                    style={{
                      left: rpx([0, 180, 360][index]),
                      top: rpx([0, 0, 0][index]),
                      width: rpx(740),
                      height: rpx(100),
                      borderRadius: rpx(71),
                      transform: `rotate(-60deg)`,
                      transformOrigin: "left center",
                    }}
                  >
                    <span
                      className="font-montserrat font-bold text-[#FFF5AD] pr-10"
                      style={{ fontSize: rpx(24) }}
                    >
                      {feature}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 移动端/平板端布局 */}
      <div className="lg:hidden absolute inset-0 z-30 overflow-hidden flex flex-col pt-10">
        <div className="relative w-full h-[40%]">
          <ServerImage
            image={data.images[0]}
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-start px-6 text-center gap-6 mt-10">
          <p className="font-arial font-bold italic text-[#754600] text-lg bg-white/80 px-6 py-2 rounded-full">
            {formatText(data.features[1])}
          </p>

          <div className="flex flex-col items-center gap-2">
            {titleParts.map((line, idx) => {
              const isFirst = idx === 0;

              // 移动端/平板端 样式配置
              let fontSize = isFirst ? 36 : 48; // 第一行稍小，后续行稍大
              let textColor = isFirst ? "#FFFFFF" : "#332E0B";
              let strokeColor = isFirst ? "#443D05" : "#FDF6C2";
              let strokeWidth = isFirst ? 2 : 1.5; // 移动端描边减薄

              return (
                <h1
                  key={idx}
                  className="font-poller-one text-center leading-tight"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
                    paintOrder: "stroke fill",
                  }}
                >
                  {line}
                </h1>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[data.features[2], data.features[3], data.features[4]].map(
              (f, i) => (
                <div
                  key={i}
                  className="bg-[#756F3F] text-[#FFF5AD] px-4 py-2 rounded-full text-xs font-bold"
                >
                  {f}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner6;
