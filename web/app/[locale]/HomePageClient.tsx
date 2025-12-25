"use client";

import { memo, useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import type { Locale } from "@/i18n.config";
// 1. 导入我们刚刚创建的 HomeContent 类型
import type { HomeContent } from "@/lib/content-data";
import { LazySection } from "@/components/ui/LazySection";

// --- 2. 导入组件 ---
// 首屏组件直接导入（首屏性能关键）- 只保留不使用 framer-motion 的组件
import HeroBanner from "@/components/home/hero-banner";

// 使用 framer-motion 的组件动态导入，避免首屏加载 framer-motion (54KB gzip)
// 这样可以显著减少首屏 JS 执行时间 (Speed Index)
const ProductSeriesCarousel = dynamic(() => import("@/components/home/product-series-carousel"));
const ServiceFeatures = dynamic(() => import("@/components/home/service-features"));

// 非首屏组件动态导入，减少首屏 JS 体积
// 注意：动态导入的组件在加载期间高度为0，需要设置 min-height
const SimpleCta = dynamic(() => import("@/components/home/simple-cta"));
const SeriesIntro = dynamic(() => import("@/components/home/series-intro"));
const FeaturedProducts = dynamic(() => import("@/components/home/featured-products"));
const BrandAdvantages = dynamic(() => import("@/components/home/brand-advantages"));
const OemOdm = dynamic(() => import("@/components/home/oem-odm"));
const QuoteSteps = dynamic(() => import("@/components/home/quote-steps"));
const MainForm = dynamic(() => import("@/components/home/main-form"));
const WhyChooseBusrom = dynamic(() => import("@/components/home/why-choose-busrom"));
const CaseStudies = dynamic(() => import("@/components/home/case-studies"));
const BrandAnalysis = dynamic(() => import("@/components/home/brand-analysis"));
const BrandValue = dynamic(() => import("@/components/home/brand-value"));

// Sphere3D 使用动态导入（因为包含 WebGL，需要 ssr: false）
const Sphere3D = dynamic(() => import("@/components/home/sphere-3d"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-[#020408]" />,
});

// 延迟渲染组件 - 只在接近视口时才开始加载 Three.js
// 这样可以避免首屏加载时下载和执行大量 JS
function DeferredSphere3D() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) return;

    // 使用 Intersection Observer 检测是否接近视口
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // 提前 200px 开始加载
        threshold: 0,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="w-full h-screen bg-[#020408]">
      {shouldLoad && <Sphere3D />}
    </div>
  );
}

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
      
      {/* 模块 1: Hero Banner (图片背景) */}
      <div data-header-theme="transparent">
        <HeroBanner data={content.heroBanner} locale={currentLanguage} />
      </div>

      {/* 模块 2: 产品系列轮播 (浅色背景) */}
      <div data-header-theme="transparent">
        <ProductSeriesCarousel data={content.productSeriesCarousel} locale={currentLanguage} /> 
      </div>

      {/* 模块 3: 服务特色 (浅色背景) */}
      <div data-header-theme="light">
        <ServiceFeatures data={content.serviceFeatures} />
      </div>

      {/* 模块 4: 3D球体 - 延迟加载 */}
      <div data-header-theme="transparent">
        <DeferredSphere3D />
      </div>

      {/* 模块 5: 简易表单跳转 - 懒加载 */}
      {content.simpleCta?.images && (
        <LazySection minHeight="600px" headerTheme="light">
          <MemoizedSimpleCta data={content.simpleCta} />
        </LazySection>
      )}

      {/* 模块 6: 系列产品介绍 - 懒加载 */}
      {content.seriesIntro && (
        <LazySection minHeight="800px" headerTheme="dark">
          <MemoizedSeriesIntro data={content.seriesIntro} />
        </LazySection>
      )}

      {/* 模块 7: 精选产品 - 懒加载 */}
      {content.featuredProducts?.series?.length > 0 && (
        <LazySection minHeight="600px" headerTheme="light">
          <FeaturedProducts data={content.featuredProducts} locale={currentLanguage} />
        </LazySection>
      )}

      {/* 模块 8: 品牌优势 - 懒加载 */}
      {content.brandAdvantages?.advantages && content.brandAdvantages?.icons && (
        <LazySection minHeight="500px" headerTheme="transparent">
          <MemoizedBrandAdvantages data={content.brandAdvantages} />
        </LazySection>
      )}

      {/* 模块 9: OEM / ODM合作 - 懒加载 */}
      {content.oemOdm?.oem && content.oemOdm?.odm && (
        <LazySection minHeight="600px" headerTheme="transparent">
          <MemoizedOemOdm data={content.oemOdm} />
        </LazySection>
      )}

      {/* 模块 10: 获取报价五步曲 - 懒加载 */}
      {content.quoteSteps?.steps?.length > 0 && (
        <LazySection minHeight="800px" headerTheme="light">
          <MemoizedQuoteSteps data={content.quoteSteps} />
        </LazySection>
      )}

      {/* 模块 11: 表单 - 懒加载 */}
      {content.mainForm && (
        <LazySection minHeight="600px" headerTheme="transparent">
          <MainForm data={content.mainForm} locale={currentLanguage} />
        </LazySection>
      )}

      {/* 模块 12: 为什么选择Busrom - 懒加载 */}
      {content.whyChooseBusrom?.reasons?.length > 0 && (
        <LazySection minHeight="500px" headerTheme="light">
          <MemoizedWhyChooseBusrom data={content.whyChooseBusrom} />
        </LazySection>
      )}

      {/* 模块 13: 应用案例轮播 - 懒加载 */}
      {content.caseStudies?.applications?.length > 0 && (
        <LazySection minHeight="600px" headerTheme="light">
          <MemoizedCaseStudies data={content.caseStudies} />
        </LazySection>
      )}

      {/* 模块 14: 品牌价值植入 - 懒加载 */}
      {content.brandAnalysis?.centers && content.brandAnalysis?.analysis && (
        <LazySection minHeight="800px" headerTheme="transparent">
          <MemoizedBrandAnalysis data={content.brandAnalysis} />
        </LazySection>
      )}

      {/* 模块 15: 品牌价值体现 - 懒加载 */}
      {content.brandValue?.param1 && content.brandValue?.slogan && (
        <LazySection minHeight="600px" headerTheme="light">
          <MemoizedBrandValue data={content.brandValue} />
        </LazySection>
      )}
      
    </main>
  )
}