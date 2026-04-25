// components/home/StaticProductSeries.tsx
// 纯静态产品系列展示 - 无 JS，无 "use client"
// 用于 SSG/SSR 首屏渲染，提升 LCP 和 TBT

import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import Link from "next/link";
import { ServerImage } from "@/components/ui/ServerImage";
import { getCropStyles, getCropImageUrl, getObjectPosition } from "@/lib/utils";

type Props = {
  data: HomeContent["productSeriesCarousel"];
  locale: Locale;
};

/**
 * 静态版产品系列展示
 * - 只显示前两个系列（屏内可见）
 * - 无动画、无 hover 效果、无轮播
 * - 纯 HTML + CSS，零 JS 执行
 */
export default function StaticProductSeries({ data, locale }: Props) {
  if (!data || data.length === 0) {
    return null;
  }

  // 只取前两个系列
  const visibleSeries = data.slice(0, 2);

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[800px] bg-brand-main overflow-hidden py-12 lg:py-0">
      {/* 标题区域 */}
      <div className="text-center pt-8 lg:pt-16 pb-6 lg:pb-12">
        <h2 className="text-3xl lg:text-5xl font-bold text-black">
          Product Series
        </h2>
      </div>

      {/* 产品卡片容器 */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-12 px-4 lg:px-8">
        {visibleSeries.map((series, index) => (
          <Link
            key={series.key || index}
            href={`/${locale}/product-series/${series.key}`}
            className="group relative block w-full max-w-[500px] lg:w-[480px] aspect-square"
          >
            {/* 图片容器 */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-lg">
              {series.image && (() => {
                  const cropData = series.imageCropDataList?.[0];
                  const cropStyles = getCropStyles(cropData);
                  if (cropStyles && cropData && cropData.croppedAreaPixels) {
                    return (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          ...cropStyles.container,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <img
                          src={getCropImageUrl(series.image, cropData)}
                          alt={series.name || `Series ${index + 1}`}
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
                    <ServerImage
                      image={series.image}
                      alt={series.name || `Series ${index + 1}`}
                      size="medium"
                      fill
                      className="object-cover w-full h-full"
                      objectPosition={getObjectPosition(series.image)}
                    />
                  );
                })()}

              {/* 底部渐变遮罩 */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

              {/* 标题 */}
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-2xl lg:text-3xl font-bold drop-shadow-lg">
                  {series.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View More 按钮 */}
      <div className="flex justify-center mt-8 lg:mt-12 pb-8 lg:pb-16">
        <Link
          href={`/${locale}/product-series`}
          className="inline-flex items-center justify-center px-8 py-3 bg-[#756F3F] text-white rounded-full text-base font-medium hover:bg-[#5d5832] transition-colors"
        >
          View All Series
        </Link>
      </div>

      {/* 导航箭头占位（静态，无功能） */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center rounded-full border-2 border-[#756F3F]/30 text-[#756F3F]/50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center rounded-full border-2 border-[#756F3F]/30 text-[#756F3F]/50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </section>
  );
}
