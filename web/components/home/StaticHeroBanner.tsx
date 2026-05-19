// components/home/StaticHeroBanner.tsx
// 纯静态首屏 Banner - 无 JS，无 "use client"
// 用于 SSG/SSR 首屏渲染，提升 LCP 和 TBT

import type { HomeContent } from "@/lib/content-data";
import type { Locale } from "@/i18n.config";
import HeroBanner1 from "@/components/HeroBanner/HeroBanner1";

type Props = {
  data: HomeContent["heroBanner"];
  locale: Locale;
};

const MIN_HEIGHT = "min-h-[700px]";
const HEIGHT_CLASS = `h-screen ${MIN_HEIGHT}`;

/**
 * 静态版 HeroBanner
 * - 只渲染第一个 Banner（LCP 关键）
 * - 无轮播、无自动播放、无交互
 * - 纯 HTML + CSS，零 JS 执行
 */
export default function StaticHeroBanner({ data, locale }: Props) {
  const firstBanner = data?.[0];
  const totalCount = data?.length || 1;

  if (!firstBanner) {
    return (
      <section className={`relative w-full ${HEIGHT_CLASS} flex items-center justify-center bg-gray-700 text-white`}>
        No banner data available.
      </section>
    );
  }

  return (
    <section className={`relative w-full ${HEIGHT_CLASS}`}>
      {/* 只渲染第一个 Banner - LCP 关键内容 */}
      <div className={`w-full ${HEIGHT_CLASS}`}>
        <HeroBanner1 data={firstBanner} />
      </div>

      {/* 静态进度条 - 显示 1/N */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-white/30">
        <div
          className="h-full bg-white"
          style={{ width: `${(1 / totalCount) * 100}%` }}
        />
      </div>

      {/* 静态页码指示器 */}
      <div
        className="absolute bottom-6 right-8 z-10 flex items-baseline text-white font-anaheim"
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)',
        }}
      >
        <span className="text-2xl font-bold">01</span>
        <span className="text-base text-white/80 mx-1">/</span>
        <span className="text-base text-white/80">
          {String(totalCount).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}
