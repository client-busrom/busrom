import React from "react"
import { HeroSection } from "@/components/one-stop/sections/HeroSection"
import { ValuePropositionSection } from "@/components/one-stop/sections/ValuePropositionSection"
import { AdvantagesSection } from "@/components/one-stop/sections/AdvantagesSection"
import { PurchaseProcessSection } from "@/components/one-stop/sections/PurchaseProcessSection"
import { CategoriesGridSection } from "@/components/one-stop/sections/CategoriesGridSection"
import { TrustSection } from "@/components/one-stop/sections/TrustSection"
import { HighlightShowcaseSection } from "@/components/one-stop/sections/HighlightShowcaseSection"
import { ProductSeriesShowcaseSection } from "@/components/one-stop/sections/ProductSeriesShowcaseSection"
import { BrandHighlightsSection } from "@/components/one-stop/sections/BrandHighlightsSection"
import { CtaSection } from "@/components/one-stop/sections/CtaSection"
import { ApplicationsSection } from "@/components/one-stop/sections/ApplicationsSection"
import { OemOdmGuideSection } from "@/components/one-stop/sections/OemOdmGuideSection"
import type { ParsedOneStopData } from "@/lib/parsers/one-stop-solution-parser"

interface OneStopSolutionTemplateProps {
  locale: string
  data: ParsedOneStopData
}

/**
 * OneStopSolutionTemplate - Server Component
 * 
 * Migrated from CSR to SSR for performance and GSEO compliance.
 * Receives pre-parsed and pre-fetched data from the server.
 */
export function OneStopSolutionTemplate({ locale, data }: OneStopSolutionTemplateProps) {
  const {
    hero,
    problems,
    advantages,
    process,
    showcase,
    categories,
    productSeries,
    brandHighlights,
    trust,
    cta,
    applications,
    oemOdmGuide
  } = data

  return (
    <div className="min-h-screen bg-[#f6f4ed] select-none" data-header-theme="dark">
      <style dangerouslySetInnerHTML={{ __html: `
        img {
          -webkit-user-drag: none; -khtml-user-drag: none; -moz-user-drag: none; -o-user-drag: none; user-drag: none;
        }
      `}} />

      {/* Hero Section */}
      <HeroSection slides={hero.items} locale={locale} />

      {/* Wrapper to contain the transition background ball and prevent layout overflow */}
      <div className="relative overflow-hidden w-full">
        {/* Value Proposition Section */}
        <ValuePropositionSection 
          title={problems.title} 
          subtitle={problems.subtitle} 
          problems={problems.items} 
          advantages={[]} 
          autoplay={problems.autoplay} 
          interval={problems.interval}
        />

        {/* Advantages Section */}
        <AdvantagesSection title={advantages.title} advantages={advantages.items} />
      </div>

      {/* Purchase Process Section */}
      <PurchaseProcessSection title={process.title} slides={process.items} />

      {/* Categories Grid Section */}
      <CategoriesGridSection 
        title={categories.title} 
        subtitle={categories.subtitle} 
        products={categories.products as any} 
        locale={locale} 
        loading={false} 
      />

      {/* Highlight Showcase Section */}
      {showcase.items.length > 0 && (
        <HighlightShowcaseSection 
          title={showcase.title} 
          titleHtml={showcase.titleHtml}
          products={showcase.products as any} 
          locale={locale} 
          viewMoreText={showcase.viewMoreText} 
          viewMoreLink={showcase.viewMoreLink}
        />
      )}

      {/* Wrapper to contain the transition background ball and prevent layout overflow */}
      <div className="relative overflow-hidden w-full">
        {/* Product Series Showcase Section */}
        {productSeries.products.length > 0 && (
          <ProductSeriesShowcaseSection 
            title={productSeries.title} 
            products={productSeries.products as any} 
            locale={locale} 
          />
        )}

        {/* Brand Highlights Section */}
        {brandHighlights.items.length > 0 && (
          <BrandHighlightsSection 
            titleLine1={brandHighlights.titleLine1} 
            titleLine1Html={brandHighlights.titleLine1Html}
            titleLine2={brandHighlights.titleLine2} 
            titleLine2Html={brandHighlights.titleLine2Html}
            items={brandHighlights.items} 
          />
        )}
      </div>

      {/* Trust Section */}
      <TrustSection 
        title={trust.title} 
        items={trust.items} 
        images={trust.images} 
        bgImage={trust.bgImage as any} 
      />

      {/* CTA Section */}
      <CtaSection 
        title={cta.title} 
        description={cta.description || ""} 
        image={cta.image as any} 
        formConfig={cta.formConfig} 
        locale={locale}
      />

      {/* Applications Section */}
      {applications.items.length > 0 && (
        <ApplicationsSection 
          title={applications.title} 
          items={applications.items as any} 
          locale={locale} 
        />
      )}

      {/* OEM/ODM Guide Section */}
      <OemOdmGuideSection 
        title={oemOdmGuide.title} 
        description={oemOdmGuide.description} 
        bgImage={oemOdmGuide.bgImage as any} 
        ctaText={oemOdmGuide.ctaText}
        ctaLink={oemOdmGuide.ctaLink} 
        locale={locale} 
      />
    </div>
  )
}
