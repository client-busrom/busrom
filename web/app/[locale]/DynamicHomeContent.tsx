"use client";

import { useState, useEffect, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import type { Locale } from "@/i18n.config";
import type { HomeContent } from "@/lib/content-data";
import { LazySection } from "@/components/ui/LazySection";

// 动态导入所有非首屏组件
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
function DeferredSphere3D() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
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

// Memo 包装
const MemoizedSimpleCta = memo(SimpleCta);
const MemoizedSeriesIntro = memo(SeriesIntro);
const MemoizedBrandAdvantages = memo(BrandAdvantages);
const MemoizedOemOdm = memo(OemOdm);
const MemoizedQuoteSteps = memo(QuoteSteps);
const MemoizedWhyChooseBusrom = memo(WhyChooseBusrom);
const MemoizedCaseStudies = memo(CaseStudies);
const MemoizedBrandAnalysis = memo(BrandAnalysis);
const MemoizedBrandValue = memo(BrandValue);

type Props = {
  initialContent: HomeContent;
  currentLanguage: Locale;
};

/**
 * 动态首页内容
 * - 只在用户滚动或 2 秒后才加载
 * - 减少首屏 JS 执行时间
 */
export function DynamicHomeContent({ initialContent, currentLanguage }: Props) {
  const [shouldRender, setShouldRender] = useState(false);
  const content = initialContent;

  useEffect(() => {
    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      setShouldRender(true);
      // 刷新 Lenis
      requestAnimationFrame(() => {
        if (typeof window !== "undefined" && (window as any).lenis) {
          (window as any).lenis.resize();
        }
      });
    };

    // 方式1: 用户开始滚动时立即加载
    const handleScroll = () => {
      load();
      window.removeEventListener('scroll', handleScroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 方式2: 2秒后自动加载（兜底）
    const timer = setTimeout(load, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // 未触发加载时，不渲染任何内容
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* 模块 4: 3D球体 */}
      <div data-header-theme="transparent">
        <DeferredSphere3D />
      </div>

      {/* 模块 5: 简易表单跳转 */}
      {content.simpleCta?.images && (
        <LazySection headerTheme="light">
          <MemoizedSimpleCta data={content.simpleCta} />
        </LazySection>
      )}

      {/* 模块 6: 系列产品介绍 */}
      {content.seriesIntro && (
        <LazySection headerTheme="dark">
          <MemoizedSeriesIntro data={content.seriesIntro} />
        </LazySection>
      )}

      {/* 模块 7: 精选产品 */}
      {content.featuredProducts?.series?.length > 0 && (
        <LazySection headerTheme="light">
          <FeaturedProducts data={content.featuredProducts} locale={currentLanguage} />
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

      {/* Footer */}
      <Footer locale={currentLanguage} showForm={true} />
    </>
  );
}
