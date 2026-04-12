"use client"

import React, { useMemo } from "react"
import { ProductOverviewHeroSection } from "../product-overview/HeroSection"
import { SeriesOverviewSection } from "../product-overview/SeriesOverviewSection"
import { ApplicationsSection } from "../product-overview/ApplicationsSection"
import { ExclusiveSolutionsSection } from "../product-overview/ExclusiveSolutionsSection"
import { SelectionGuideSection } from "../product-overview/SelectionGuideSection"
import { BrandTrustSection } from "../product-overview/BrandTrustSection"

import { ProductOverviewData } from "@/types/product-overview"

const DESIGN_WIDTH = 1920
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

interface ProductOverviewTemplateProps {
  locale: string;
  data: ProductOverviewData;
}

export function ProductOverviewTemplate({ locale, data }: ProductOverviewTemplateProps) {
  if (!data) return null;

  return (
    <div className="w-full bg-[#F6F4ED]" data-header-theme="dark">
      {/* 1. Hero Section */}
      <ProductOverviewHeroSection data={data.hero} />

      {/* 2. Series Overview Section */}
      <SeriesOverviewSection data={data.seriesOverview} />

      {/* 3. Applications Section */}
      {data.applications?.items?.length > 0 && (
        <ApplicationsSection data={data.applications} />
      )}

      {/* 4. Exclusive Solutions Section */}
      {data.exclusiveSolutions && (
        <ExclusiveSolutionsSection data={data.exclusiveSolutions} />
      )}

      {/* 5. Selection Guide & Brand Trust - Shared Background */}
      {(data.selectionGuide || data.brandTrust) && (
        <div 
          className="relative w-full overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, #756f3f 0%, #fffad3 100%)',
            paddingTop: vw(150),
            paddingBottom: vw(100)
          }}
        >
          {data.selectionGuide && (
            <SelectionGuideSection data={data.selectionGuide} />
          )}
          
          <div style={{ height: vw(150) }} /> {/* Spacer between sections */}

          {data.brandTrust && (
            <BrandTrustSection data={data.brandTrust} />
          )}
        </div>
      )}
    </div>
  )
}
