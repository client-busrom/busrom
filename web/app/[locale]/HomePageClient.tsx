"use client";

import useSWR from 'swr';
import type { Locale } from "@/i18n.config";
// 1. 导入我们刚刚创建的 HomeContent 类型
import type { HomeContent } from "@/lib/content-data"; 

// --- 2. 导入所有 15 个模块组件 ---
// (你需要确保这些文件都创建在 components/home/ 目录下)
import HeroBanner from "@/components/home/hero-banner";
import ProductSeriesCarousel from "@/components/home/product-series-carousel";
import ServiceFeatures from "@/components/home/service-features";
import Sphere3D from "@/components/home/sphere-3d";
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

// 接收从服务端传来的初始数据和语言
export function HomePageClient({ 
  initialContent, 
  currentLanguage 
}: { 
  initialContent: HomeContent, // 3. 使用严格类型
  currentLanguage: Locale
}) {

  // 4. SWR 逻辑 (保持不变)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const swrKey = `/home?lang=${currentLanguage}`;
  const { data: content, error } = useSWR<HomeContent>(`${apiUrl}/dd/${swrKey}`, { // 5. 为 SWR 添加类型
    fallbackData: initialContent,
  });

  if (error) {
    console.error("SWR failed to re-fetch home content:", error);
  }
  
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
      <div data-header-theme="dark">
        <ProductSeriesCarousel data={content.productSeriesCarousel} locale={currentLanguage} /> 
      </div>

      {/* 模块 3: 服务特色 (浅色背景) */}
      <div data-header-theme="light">
        <ServiceFeatures data={content.serviceFeatures} />
      </div>

      {/* 模块 4: 3D球体 (浅色背景) */}
      <div data-header-theme="light">
        <Sphere3D />
      </div>

      {/* 模块 5: 简易表单跳转 (浅色背景) */}
      <div data-header-theme="light">
        <SimpleCta data={content.simpleCta} />
      </div>

      {/* 模块 6: 系列产品介绍 (深色背景) */}
      <div data-header-theme="dark">
        <SeriesIntro data={content.seriesIntro} />
      </div>

      {/* 模块 7: 精选产品 (浅色背景) */}
      <div data-header-theme="light">
        <FeaturedProducts data={content.featuredProducts} locale={currentLanguage} />
      </div>

      {/* 模块 8: 品牌优势 (图片背景) */}
      <div data-header-theme="transparent">
        <BrandAdvantages data={content.brandAdvantages} />
      </div>

      {/* 模块 9: OEM / ODM合作 (图片背景) */}
      <div data-header-theme="transparent">
        <OemOdm data={content.oemOdm} />
      </div>

      {/* 模块 10: 获取报价五步曲 (浅色背景) */}
      <div data-header-theme="light">
        <QuoteSteps data={content.quoteSteps} />
      </div>

      {/* 模块 11 (Figma #12): 表单 (浅色背景) */}
      <div data-header-theme="transparent">
        <MainForm data={content.mainForm} />
      </div>

      {/* 模块 12 (Figma #13): 为什么选择Busrom (浅色背景) */}
      <div data-header-theme="light">
        <WhyChooseBusrom data={content.whyChooseBusrom} />
      </div>

      {/* 模块 13 (Figma #14): 应用案例轮播 (浅色背景) */}
      <div data-header-theme="light">
        <CaseStudies data={content.caseStudies} />
      </div>

      {/* 模块 14 (Figma #15): 品牌价值植入 (图片背景) */}
      <div data-header-theme="transparent">
        <BrandAnalysis data={content.brandAnalysis} />
      </div>

      {/* 模块 15 (Figma #16): 品牌价值体现 (浅色背景) */}
      <div data-header-theme="light">
        <BrandValue data={content.brandValue} />
      </div>
      
    </main>
  )
}