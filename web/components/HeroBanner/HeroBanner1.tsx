// components/HeroBanner/HeroBanner1.tsx
// ⚡ SSR Component - No "use client" for LCP optimization
import type { FC } from "react";
import Image from "next/image";
import type { HomeContent } from "@/lib/content-data";
import { Locale } from "@/i18n.config";
import { getObjectPosition } from "@/lib/utils";
import { ServerImage } from "@/components/ui/ServerImage";

// 处理换行符：支持 /n 和 \n
const formatText = (text: string | undefined) => text?.replace(/\/n|\\n/g, '\n') || '';

// --- 响应式尺寸函数 ---
// 使用 CSS 变量 --rpx-hero，在宽屏幕上按宽度缩放，在高屏幕上按高度缩放
const rpx = (designValue: number) => `calc(var(--rpx-hero) * ${designValue})`;

// 设计稿基准尺寸 (用于百分比计算)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// ========================================
// 装饰图片配置 - 可在这里调整参数
// ========================================
const IMAGE_1_CONFIG = {
  // 位置 (基于1920x1080设计稿的像素值)
  left: -134,      // 左边距 (负值表示超出左边界)
  top: -164,       // 上边距 (负值表示超出上边界)
  // 尺寸
  width: 800,      // 宽度
  height: 700,     // 高度
  // 旋转角度 (正值顺时针，负值逆时针)
  rotate: 30,      // 旋转角度
  // 图片缩放 (用于填满旋转后的容器)
  imageScale: 1.2,
  // 图片偏移 (用于调整图片在框内的位置)
  imageOffsetX: 0, // 负值往左，正值往右 (百分比)
  imageOffsetY: 12, // 负值往上，正值往下 (百分比)
  // 边框
  borderWidth: 24, // 边框宽度
  borderColor: '#FDF6C2',
  // 圆角 (左上 右上 右下 左下)
  borderRadius: '0% 35% 10% 0%',
  // z-index (在SVG上层)
  zIndex: 15,
};

const IMAGE_2_CONFIG = {
  // 位置 (基于1920x1080设计稿的像素值)
  right: -138,     // 右边距
  bottom: -138,    // 下边距
  // 尺寸
  width: 700,      // 宽度
  height: 800,     // 高度
  // 旋转角度 (正值顺时针，负值逆时针)
  rotate: 126,     // 旋转角度
  // 图片缩放 (用于填满旋转后的容器)
  imageScale: 1.05,
  // 图片偏移 (用于调整图片在框内的位置)
  imageOffsetX: -10, // 负值往左，正值往右 (百分比)
  imageOffsetY: -10, // 负值往上，正值往下 (百分比)
  // 边框
  borderWidth: 24,  // 边框宽度
  borderColor: '#FDF6C2',
  // 圆角 (左上 右上 右下 左下)
  borderRadius: '0% 0% 35% 10%',
  // z-index (在SVG上层)
  zIndex: 15,
};

// SVG UI 元素配置
const SVG_1_CONFIG = {
  // hero-banner-1-1.svg 左上角 (830x716)
  width: 830,
  height: 716,
  left: 0,
  top: 0,
  zIndex: 10,
};

const SVG_2_CONFIG = {
  // hero-banner-1-2.svg 右下角 (799x799)
  width: 799,
  height: 799,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

// 椭圆装饰配置
const ELLIPSE_1_CONFIG = {
  // 右上角椭圆
  right: 160,     // 右边距 (负值超出边界)
  top: -56,        // 上边距 (负值超出边界)
  width: 312,      // 宽度
  height: 125,     // 高度
  // 圆角 (50% = 完美椭圆，可以用不同值创建不规则形状)
  borderRadius: '50%', // 或 '50% 50% 50% 50%' 分别设置四角
  backgroundColor: '#756F3F',
  opacity: 1,
  rotate: 0,       // 旋转角度
  zIndex: 15,
};

const ELLIPSE_2_CONFIG = {
  // 左下角椭圆
  left: 200,      // 左边距 (负值超出边界)
  bottom: -80,     // 下边距 (负值超出边界)
  width: 312,      // 宽度
  height: 125,     // 高度
  // 圆角 (50% = 完美椭圆，可以用不同值创建不规则形状)
  borderRadius: '50%', // 或 '50% 50% 50% 50%' 分别设置四角
  backgroundColor: '#756F3F',
  opacity: 1,
  rotate: 0,       // 旋转角度
  zIndex: 15,
};
// ========================================

// --- BannerProps 定义 ---
type BannerData = HomeContent["heroBanner"][number];
type BannerProps = {
  data: BannerData;
  locale: Locale;
};

// --- HeroBanner1 组件 ---
const HeroBanner1: FC<BannerProps> = ({ data }) => {
  return (
    <section className="relative w-full h-full min-h-[700px] overflow-hidden font-sans flex items-center justify-center text-center">
      {/* 背景容器 - 白色底 + 45%透明图片 + 11px模糊 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          filter: 'blur(5px)',
        }}
      >
        {/* 白色底层 100% */}
        <div className="absolute inset-0 bg-white" />
        {/* 图片层 45% 透明度 */}
        <div className="absolute inset-0" style={{ opacity: 0.45 }}>
          <ServerImage
            image={data.images[0]}
            alt="背景图"
            size="large"
            fill
            className="absolute inset-0 w-full h-full object-cover"
            objectPosition={getObjectPosition(data.images[0])}
            priority
          />
        </div>
      </div>

      {/* 椭圆装饰1 - 右上角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          right: rpx(ELLIPSE_1_CONFIG.right),
          top: rpx(ELLIPSE_1_CONFIG.top),
          width: rpx(ELLIPSE_1_CONFIG.width),
          height: rpx(ELLIPSE_1_CONFIG.height),
          borderRadius: ELLIPSE_1_CONFIG.borderRadius,
          backgroundColor: ELLIPSE_1_CONFIG.backgroundColor,
          opacity: ELLIPSE_1_CONFIG.opacity,
          transform: `rotate(${ELLIPSE_1_CONFIG.rotate}deg)`,
          zIndex: ELLIPSE_1_CONFIG.zIndex,
        }}
      />
      {/* 椭圆装饰1 - 右上角 - 移动端 */}
      <div
        className="md:hidden absolute right-[15%] -top-8 w-32 h-12 sm:w-40 sm:h-14 rounded-full"
        style={{
          backgroundColor: ELLIPSE_1_CONFIG.backgroundColor,
          zIndex: ELLIPSE_1_CONFIG.zIndex,
        }}
      />

      {/* 椭圆装饰2 - 左下角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          left: rpx(ELLIPSE_2_CONFIG.left),
          bottom: rpx(ELLIPSE_2_CONFIG.bottom),
          width: rpx(ELLIPSE_2_CONFIG.width),
          height: rpx(ELLIPSE_2_CONFIG.height),
          borderRadius: ELLIPSE_2_CONFIG.borderRadius,
          backgroundColor: ELLIPSE_2_CONFIG.backgroundColor,
          opacity: ELLIPSE_2_CONFIG.opacity,
          transform: `rotate(${ELLIPSE_2_CONFIG.rotate}deg)`,
          zIndex: ELLIPSE_2_CONFIG.zIndex,
        }}
      />
      {/* 椭圆装饰2 - 左下角 - 移动端 */}
      <div
        className="md:hidden absolute left-[15%] -bottom-8 w-32 h-12 sm:w-40 sm:h-14 rounded-full"
        style={{
          backgroundColor: ELLIPSE_2_CONFIG.backgroundColor,
          zIndex: ELLIPSE_2_CONFIG.zIndex,
        }}
      />

      {/* 装饰图片1 - 左上角 - 桌面端 (独立定位，不受SVG容器限制) */}
      {data.images[1] && (
        <div
          className="hidden md:block absolute overflow-hidden"
          style={{
            left: rpx(IMAGE_1_CONFIG.left),
            top: rpx(IMAGE_1_CONFIG.top),
            width: rpx(IMAGE_1_CONFIG.width),
            height: rpx(IMAGE_1_CONFIG.height),
            transform: `rotate(${IMAGE_1_CONFIG.rotate}deg)`,
            border: `${rpx(IMAGE_1_CONFIG.borderWidth)} solid ${IMAGE_1_CONFIG.borderColor}`,
            borderRadius: IMAGE_1_CONFIG.borderRadius,
            zIndex: IMAGE_1_CONFIG.zIndex,
          }}
        >
          {/* 图片反向旋转，保持水平，并应用偏移 */}
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(${-IMAGE_1_CONFIG.rotate}deg) scale(${IMAGE_1_CONFIG.imageScale}) translate(${IMAGE_1_CONFIG.imageOffsetX}%, ${IMAGE_1_CONFIG.imageOffsetY}%)`,
            }}
          >
            <ServerImage
              image={data.images[1]}
              alt="装饰图1"
              size="small"
              fill
              className="w-full h-full object-cover"
              objectPosition="center center"
              priority
            />
          </div>
        </div>
      )}

      {/* SVG UI 元素1 - 左上角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          left: 0,
          top: 0,
          width: rpx(SVG_1_CONFIG.width),
          aspectRatio: `${SVG_1_CONFIG.width} / ${SVG_1_CONFIG.height}`,
          zIndex: SVG_1_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-1.svg"
          alt="左上装饰"
          fill
          className="object-contain object-left-top"
        />
      </div>

      {/* SVG UI 元素1 + 装饰图片1 - 左上角 - 移动端 */}
      <div
        className="md:hidden absolute left-0 top-0 w-[55%] sm:w-[50%]"
        style={{
          aspectRatio: `${SVG_1_CONFIG.width} / ${SVG_1_CONFIG.height}`,
          zIndex: SVG_1_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-1.svg"
          alt="左上装饰"
          fill
          className="object-contain object-left-top"
        />
        {/* 装饰图片1 - 相对于SVG容器定位 */}
        {data.images[1] && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: `${(IMAGE_1_CONFIG.left / SVG_1_CONFIG.width) * 100}%`,
              top: `${(IMAGE_1_CONFIG.top / SVG_1_CONFIG.height) * 100}%`,
              width: `${(IMAGE_1_CONFIG.width / SVG_1_CONFIG.width) * 100}%`,
              height: `${(IMAGE_1_CONFIG.height / SVG_1_CONFIG.height) * 100}%`,
              transform: `rotate(${IMAGE_1_CONFIG.rotate}deg)`,
              border: `8px solid ${IMAGE_1_CONFIG.borderColor}`,
              borderRadius: IMAGE_1_CONFIG.borderRadius,
              zIndex: IMAGE_1_CONFIG.zIndex,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                transform: `rotate(${-IMAGE_1_CONFIG.rotate}deg) scale(${IMAGE_1_CONFIG.imageScale}) translate(${IMAGE_1_CONFIG.imageOffsetX}%, ${IMAGE_1_CONFIG.imageOffsetY}%)`,
              }}
            >
              <ServerImage
                image={data.images[1]}
                alt="装饰图1"
                size="small"
                fill
                className="w-full h-full object-cover"
                objectPosition="center center"
              />
            </div>
          </div>
        )}
      </div>

      {/* 装饰图片2 - 右下角 - 桌面端 (独立定位，不受SVG容器限制) */}
      {data.images[2] && (
        <div
          className="hidden md:block absolute overflow-hidden"
          style={{
            right: rpx(IMAGE_2_CONFIG.right),
            bottom: rpx(IMAGE_2_CONFIG.bottom),
            width: rpx(IMAGE_2_CONFIG.width),
            height: rpx(IMAGE_2_CONFIG.height),
            transform: `rotate(${IMAGE_2_CONFIG.rotate}deg)`,
            border: `${rpx(IMAGE_2_CONFIG.borderWidth)} solid ${IMAGE_2_CONFIG.borderColor}`,
            borderRadius: IMAGE_2_CONFIG.borderRadius,
            zIndex: IMAGE_2_CONFIG.zIndex,
          }}
        >
          {/* 图片反向旋转，保持水平，并应用偏移 */}
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(${-IMAGE_2_CONFIG.rotate}deg) scale(${IMAGE_2_CONFIG.imageScale}) translate(${IMAGE_2_CONFIG.imageOffsetX}%, ${IMAGE_2_CONFIG.imageOffsetY}%)`,
            }}
          >
            <ServerImage
              image={data.images[2]}
              alt="装饰图2"
              size="small"
              fill
              className="w-full h-full object-cover"
              objectPosition="center center"
              priority
            />
          </div>
        </div>
      )}

      {/* SVG UI 元素2 - 右下角 - 桌面端 */}
      <div
        className="hidden md:block absolute"
        style={{
          right: 0,
          bottom: 0,
          width: rpx(SVG_2_CONFIG.width),
          aspectRatio: `${SVG_2_CONFIG.width} / ${SVG_2_CONFIG.height}`,
          zIndex: SVG_2_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-2.svg"
          alt="右下装饰"
          fill
          className="object-contain object-right-bottom"
        />
      </div>

      {/* SVG UI 元素2 + 装饰图片2 - 右下角 - 移动端 */}
      <div
        className="md:hidden absolute right-0 bottom-0 w-[55%] sm:w-[50%]"
        style={{
          aspectRatio: `${SVG_2_CONFIG.width} / ${SVG_2_CONFIG.height}`,
          zIndex: SVG_2_CONFIG.zIndex,
        }}
      >
        <Image
          src="/hero-banner-1-2.svg"
          alt="右下装饰"
          fill
          className="object-contain object-right-bottom"
        />
        {/* 装饰图片2 - 相对于SVG容器定位 */}
        {data.images[2] && (
          <div
            className="absolute overflow-hidden"
            style={{
              right: `${(IMAGE_2_CONFIG.right / SVG_2_CONFIG.width) * 100}%`,
              bottom: `${(IMAGE_2_CONFIG.bottom / SVG_2_CONFIG.height) * 100}%`,
              width: `${(IMAGE_2_CONFIG.width / SVG_2_CONFIG.width) * 100}%`,
              height: `${(IMAGE_2_CONFIG.height / SVG_2_CONFIG.height) * 100}%`,
              transform: `rotate(${IMAGE_2_CONFIG.rotate}deg)`,
              border: `8px solid ${IMAGE_2_CONFIG.borderColor}`,
              borderRadius: IMAGE_2_CONFIG.borderRadius,
              zIndex: IMAGE_2_CONFIG.zIndex,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                transform: `rotate(${-IMAGE_2_CONFIG.rotate}deg) scale(${IMAGE_2_CONFIG.imageScale}) translate(${IMAGE_2_CONFIG.imageOffsetX}%, ${IMAGE_2_CONFIG.imageOffsetY}%)`,
              }}
            >
              <ServerImage
                image={data.images[2]}
                alt="装饰图2"
                size="small"
                fill
                className="w-full h-full object-cover"
                objectPosition="center center"
              />
            </div>
          </div>
        )}
      </div>

      {/* 内容容器 - 桌面端 (md+) */}
      <div
        className="hidden md:flex relative z-30 flex-col items-center w-full"
        style={{ marginTop: rpx(-100) }}
      >
        {/* Feature[1] - 顶部标语 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center whitespace-pre-line"
          style={{
            fontSize: rpx(48),
            lineHeight: rpx(116),
            marginTop: rpx(60),
            marginBottom: rpx(10),
            WebkitTextStroke: `${rpx(3.5)} #75703F`,
            paintOrder: 'stroke fill',
            textShadow: '0 -1px 0 #75703F',
          }}
        >
          {formatText(data.features[1])}
        </p>

        {/* Feature[0] - 主标题第一行 */}
        <h2
          className="font-paytone-one text-black text-center whitespace-pre-line"
          style={{
            fontSize: rpx(86),
            lineHeight: rpx(125),
            marginTop: rpx(0),
            marginBottom: rpx(0),
            WebkitTextStroke: `${rpx(8)} #FDF6C2`,
            paintOrder: 'stroke fill',
          }}
        >
          {formatText(data.features[0])?.split(' ').slice(0, 2).join(' ')}
        </h2>

        {/* Feature[0] - 主标题第二行 */}
        <h1
          className="font-paytone-one text-black text-center whitespace-pre-line"
          style={{
            fontSize: rpx(120),
            lineHeight: rpx(125),
            WebkitTextStroke: `${rpx(8)} #FDF6C2`,
            paintOrder: 'stroke fill',
          }}
        >
          {formatText(data.features[0])?.split(' ').slice(2).join(' ')}
        </h1>

        {/* 三个特性按钮 */}
        <div
          className="flex flex-row justify-center"
          style={{
            gap: rpx(123),
            marginTop: rpx(80),
          }}
        >
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => {
            const words = feature?.split(' ') || [];
            const textWithNewlines = words.join('\n');
            return (
              <div
                key={index}
                className="flex items-center justify-center border border-white bg-[#756F3F]"
                style={{
                  width: rpx(242),
                  height: rpx(150),
                  borderRadius: rpx(75),
                }}
              >
                <p
                  className="font-montserrat font-bold text-[#FDF6C2] text-center whitespace-pre-line"
                  style={{
                    fontSize: rpx(28),
                    lineHeight: 1.4,
                    letterSpacing: '0.06em',
                    textShadow: '0 4px 12px rgba(86, 80, 32, 1)',
                  }}
                >
                  {textWithNewlines}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 内容容器 - 移动端 (md以下) */}
      <div className="flex md:hidden relative z-30 flex-col items-center w-full px-4 py-8">
        {/* Feature[1] - 顶部标语 */}
        <p
          className="font-paytone-one text-[#FFBC5F] text-center text-lg whitespace-pre-line"
          style={{
            textShadow: '0 0 10px rgba(117, 112, 63, 0.5)',
            WebkitTextStroke: '1px #75703F',
            paintOrder: 'stroke fill',
          }}
        >
          {formatText(data.features[1])}
        </p>

        {/* Feature[0] - 主标题 (不拆分，自动换行) */}
        <h1
          className="font-paytone-one text-black text-center text-3xl mt-4 whitespace-pre-line"
          style={{
            WebkitTextStroke: '2px #FDF6C2',
            paintOrder: 'stroke fill',
          }}
        >
          {formatText(data.features[0])}
        </h1>

        {/* 三个特性按钮 - 垂直排列 */}
        <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
          {[data.features[2], data.features[3], data.features[4]].map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-center border border-white bg-[#756F3F] rounded-full py-3 px-6"
            >
              <p
                className="text-[#FDF6C2] text-center font-montserrat font-bold text-sm"
                style={{
                  textShadow: '0 4px 12px rgba(86, 80, 32, 1)',
                }}
              >
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
