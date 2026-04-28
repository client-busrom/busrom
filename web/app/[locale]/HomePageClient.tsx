"use client";

import { memo, useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import type { Locale } from "@/i18n.config";
// 1. 导入我们刚刚创建的 HomeContent 类型
import type { HomeContent } from "@/lib/content-data";
import { LazySection, DeferredContent } from "@/components/ui/LazySection";

// --- 2. 导入组件 ---
// 首屏组件直接导入（首屏性能关键）- 只保留不使用 framer-motion 的组件
import HeroBanner from "@/components/home/hero-banner";

// 使用 framer-motion 的组件动态导入，避免首屏加载 framer-motion (54KB gzip)
// 这样可以显著减少首屏 JS 执行时间 (Speed Index)
// 设置 loading 占位符避免闪白屏
const ProductSeriesCarousel = dynamic(
  () => import("@/components/home/product-series-carousel"),
  { loading: () => <div className="w-full min-h-[600px] bg-brand-main" /> }
);
const ServiceFeatures = dynamic(
  () => import("@/components/home/service-features"),
  { loading: () => <div className="w-full min-h-[800px] bg-brand-main" /> }
);

// 非首屏组件动态导入，减少首屏 JS 体积
// 设置 loading 占位符避免闪白屏 (Next.js 要求 options 必须是字面量)
const SimpleCta = dynamic(() => import("@/components/home/simple-cta"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const SeriesIntro = dynamic(() => import("@/components/home/series-intro"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});
const FeaturedProducts = dynamic(() => import("@/components/home/featured-products"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const BrandAdvantages = dynamic(() => import("@/components/home/brand-advantages"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});
const OemOdm = dynamic(() => import("@/components/home/oem-odm"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});
const QuoteSteps = dynamic(() => import("@/components/home/quote-steps"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const MainForm = dynamic(() => import("@/components/home/main-form"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});
const WhyChooseBusrom = dynamic(() => import("@/components/home/why-choose-busrom"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const CaseStudies = dynamic(() => import("@/components/home/case-studies"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const BrandAnalysis = dynamic(() => import("@/components/home/brand-analysis"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});
const BrandValue = dynamic(() => import("@/components/home/brand-value"), {
  loading: () => <div className="w-full min-h-[400px] bg-brand-main" />
});
const Footer = dynamic(() => import("@/components/layout/footer"), {
  loading: () => <div className="w-full min-h-[400px] bg-[#020408]" />
});

// Sphere3D 使用动态导入（因为包含 WebGL，需要 ssr: false）
const Sphere3D = dynamic(() => import("@/components/home/sphere-3d"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-[#020408]" />,
});

// 延迟渲染组件 - 只在接近视口时才开始加载 Three.js
// 这样可以避免首屏加载时下载和执行大量 JS
const MemoizedDeferredSphere3D = memo(function DeferredSphere3D({ data }: { data: { title: string; description: string } | null }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (shouldLoad) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observerRef.current?.disconnect();
          observerRef.current = null;
        }
      },
      {
        rootMargin: '500px 0px',
        threshold: 0,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="w-full h-screen bg-[#020408]">
      {shouldLoad && <Sphere3D data={data} />}
    </div>
  );
});

// 使用 memo 包装纯展示组件，避免父组件更新时不必要的重渲染
// 注意：动态导入的组件已内置缓存，不需要额外 memo
const MemoizedSimpleCta = memo(SimpleCta);
const MemoizedSeriesIntro = memo(SeriesIntro);
const MemoizedBrandAdvantages = memo(BrandAdvantages);
const MemoizedOemOdm = memo(OemOdm);
const MemoizedQuoteSteps = memo(QuoteSteps);
const MemoizedWhyChooseBusrom = memo(WhyChooseBusrom);
const MemoizedCaseStudies = memo(CaseStudies);
const MemoizedBrandAnalysis = memo(BrandAnalysis);
const MemoizedBrandValue = memo(BrandValue);

// 接收从服务端传来的初始数据和语言
export function HomePageClient({
  initialContent,
  currentLanguage
}: {
  initialContent: HomeContent, // 3. 使用严格类型
  currentLanguage: Locale
}) {

  // 4. SWR 逻辑 - 使用 initialContent 作为数据源，不再重复请求
  // 因为 SWR 直接获取的是原始 CMS 数据，没有经过 getHomeContent() 转换
  // 所以我们禁用 SWR 的自动刷新，只使用服务端渲染的数据
  const { data: content } = useSWR<HomeContent>(
    `home-${currentLanguage}`, // 只作为缓存 key，不是真正的 URL
    null, // 不需要 fetcher
    {
      fallbackData: initialContent,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );



  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // 6. 渲染所有 15 个模块，并为每个模块添加 'data-header-theme'
  return (
    <main className="min-h-screen">

      {/* 模块 1: Hero Banner (图片背景) - z-20 确保始终在懒加载内容上层 */}
      <div data-header-theme="light" className="relative z-20 mt-[46px]">
        <HeroBanner data={content.heroBanner} locale={currentLanguage} />
      </div>

      {/* 模块 2: 产品系列轮播 - 设为 transparent (白色字) */}
      <div data-header-theme="transparent" className="relative z-10">
        <ProductSeriesCarousel data={content.productSeriesCarousel} locale={currentLanguage} />
      </div>

      {/* 模块 3: 服务特色 (浅色背景) - z-10 */}
      <div data-header-theme="light" className="relative z-10 bg-brand-main">
        <ServiceFeatures data={content.serviceFeatures} />
      </div>

      {/* 模块 4: 3D 地球 - 移出延迟加载，让其内部的 IntersectionObserver 自行决定加载时机 */}
      <div data-header-theme="transparent">
        <MemoizedDeferredSphere3D data={content.sphere3d} />
      </div>
      
      {/* 首屏之后的内容 - 延迟加载，z-0 确保在首屏下层 */}
      <DeferredContent>
        {/* 模块 5: 简易表单跳转 */}
        {content.simpleCta?.images && (
          <LazySection headerTheme="light">
            <MemoizedSimpleCta data={content.simpleCta} />
          </LazySection>
        )}

        {/* 模块 6: 精选产品 */}
        {content.featuredProducts?.series?.length > 0 && (
          <LazySection headerTheme="light">
            <FeaturedProducts data={content.featuredProducts} locale={currentLanguage} />
          </LazySection>
        )}

        {/* 模块 7: 系列产品介绍 */}
        {content.seriesIntro && (
          <LazySection headerTheme="dark">
            <MemoizedSeriesIntro data={content.seriesIntro} />
          </LazySection>
        )}

        {/* 模块 8: 品牌优势 */}
        {content.brandAdvantages?.advantages && content.brandAdvantages?.icons && (
          <LazySection headerTheme="transparent">
            <MemoizedBrandAdvantages data={content.brandAdvantages} />
          </LazySection>
        )}

        {/* 模块 9: OEM / ODM合作 */}
        {content.oemOdm?.oem && content.oemOdm?.odm && (
          <LazySection headerTheme="transparent">
            <MemoizedOemOdm data={content.oemOdm} />
          </LazySection>
        )}

        {/* 模块 10: 获取报价五步曲 */}
        {content.quoteSteps?.steps?.length > 0 && (
          <LazySection headerTheme="light">
            <MemoizedQuoteSteps data={content.quoteSteps} />
          </LazySection>
        )}

        {/* 模块 11: 表单 */}
        {content.mainForm && (
          <LazySection headerTheme="transparent">
            <MainForm data={content.mainForm} locale={currentLanguage} />
          </LazySection>
        )}

        {/* 模块 12: 为什么选择Busrom */}
        {content.whyChooseBusrom?.reasons?.length > 0 && (
          <LazySection headerTheme="light">
            <MemoizedWhyChooseBusrom data={content.whyChooseBusrom} />
          </LazySection>
        )}

        {/* 模块 13: 应用案例轮播 */}
        {content.caseStudies?.applications?.length > 0 && (
          <LazySection headerTheme="light">
            <MemoizedCaseStudies data={content.caseStudies} />
          </LazySection>
        )}

        {/* 模块 14: 品牌价值植入 */}
        {content.brandAnalysis?.centers?.length > 0 && (
          <LazySection headerTheme="transparent">
            <MemoizedBrandAnalysis data={content.brandAnalysis} />
          </LazySection>
        )}

        {/* 模块 15: 品牌价值体现 */}
        {content.brandValue?.param1 && content.brandValue?.slogan && (
          <LazySection headerTheme="light">
            <MemoizedBrandValue data={content.brandValue} />
          </LazySection>
        )}

        {/* Footer - 首页专用 */}
        <div data-header-theme="transparent">
          <Footer locale={currentLanguage} showForm={true} />
        </div>
      </DeferredContent>

    </main>
  )
}