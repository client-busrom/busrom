"use client";

import { memo } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import type { Locale } from "@/i18n.config";
// 1. 导入我们刚刚创建的 HomeContent 类型
import type { HomeContent } from "@/lib/content-data";

// --- 2. 导入所有 15 个模块组件 ---
// 首屏组件直接导入
import HeroBanner from "@/components/home/hero-banner";
import ProductSeriesCarousel from "@/components/home/product-series-carousel";
import ServiceFeatures from "@/components/home/service-features";

// 非首屏组件直接导入（动态导入会导致加载期间高度为0，影响header主题检测）
import SimpleCta from "@/components/home/simple-cta";
import SeriesIntro from "@/components/home/series-intro";
import FeaturedProducts from "@/components/home/featured-products";
import BrandAdvantages from "@/components/home/brand-advantages";
import OemOdm from "@/components/home/oem-odm";
import QuoteSteps from "@/components/home/quote-steps";
import MainForm from "@/components/home/main-form";
import WhyChooseBusrom from "@/components/home/why-choose-busrom";
import CaseStudies from "@/components/home/case-studies";
import BrandAnalysis from "@/components/home/brand-analysis";
import BrandValue from "@/components/home/brand-value";

// Sphere3D 使用动态导入（因为包含 WebGL，需要 ssr: false）
const Sphere3D = dynamic(() => import("@/components/home/sphere-3d"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-[#020408]" />,
});

// 使用 memo 包装纯展示组件，避免父组件更新时不必要的重渲染
const MemoizedServiceFeatures = memo(ServiceFeatures);
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
        <MemoizedServiceFeatures data={content.serviceFeatures} />
      </div>

      {/* 模块 4: 3D球体 */}
      <div data-header-theme="transparent">
        <Sphere3D />
      </div>

      {/* 模块 5: 简易表单跳转 */}
      {content.simpleCta?.images && (
        <div data-header-theme="light">
          <MemoizedSimpleCta data={content.simpleCta} />
        </div>
      )}

      {/* 模块 6: 系列产品介绍 */}
      {content.seriesIntro && (
        <div data-header-theme="dark">
          <MemoizedSeriesIntro data={content.seriesIntro} />
        </div>
      )}

      {/* 模块 7: 精选产品 */}
      {content.featuredProducts?.series?.length > 0 && (
        <div data-header-theme="light">
          <FeaturedProducts data={content.featuredProducts} locale={currentLanguage} />
        </div>
      )}

      {/* 模块 8: 品牌优势 */}
      {content.brandAdvantages?.advantages && content.brandAdvantages?.icons && (
        <div data-header-theme="transparent">
          <MemoizedBrandAdvantages data={content.brandAdvantages} />
        </div>
      )}

      {/* 模块 9: OEM / ODM合作 */}
      {content.oemOdm?.oem && content.oemOdm?.odm && (
        <div data-header-theme="transparent">
          <MemoizedOemOdm data={content.oemOdm} />
        </div>
      )}

      {/* 模块 10: 获取报价五步曲 */}
      {content.quoteSteps?.steps?.length > 0 && (
        <div data-header-theme="light">
          <MemoizedQuoteSteps data={content.quoteSteps} />
        </div>
      )}

      {/* 模块 11: 表单 */}
      {content.mainForm && (
        <div data-header-theme="transparent">
          <MainForm data={content.mainForm} locale={currentLanguage} />
        </div>
      )}

      {/* 模块 12: 为什么选择Busrom */}
      {content.whyChooseBusrom?.reasons?.length > 0 && (
        <div data-header-theme="light">
          <MemoizedWhyChooseBusrom data={content.whyChooseBusrom} />
        </div>
      )}

      {/* 模块 13: 应用案例轮播 */}
      {content.caseStudies?.applications?.length > 0 && (
        <div data-header-theme="light">
          <MemoizedCaseStudies data={content.caseStudies} />
        </div>
      )}

      {/* 模块 14: 品牌价值植入 */}
      {content.brandAnalysis?.centers && content.brandAnalysis?.analysis && (
        <div data-header-theme="transparent">
          <MemoizedBrandAnalysis data={content.brandAnalysis} />
        </div>
      )}

      {/* 模块 15: 品牌价值体现 */}
      {content.brandValue?.param1 && content.brandValue?.slogan && (
        <div data-header-theme="light">
          <MemoizedBrandValue data={content.brandValue} />
        </div>
      )}
      
    </main>
  )
}