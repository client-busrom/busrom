"use client"

import React, { useMemo } from "react"
import { ProductOverviewHeroSection } from "../product-overview/HeroSection"
import { SeriesOverviewSection } from "../product-overview/SeriesOverviewSection"
import { ApplicationsSection } from "../product-overview/ApplicationsSection"
import { ExclusiveSolutionsSection } from "../product-overview/ExclusiveSolutionsSection"

import { ProductOverviewData } from "@/types/product-overview"

interface ProductOverviewTemplateProps {
  locale: string;
  data: ProductOverviewData;
}

export function ProductOverviewTemplate({ locale, data }: ProductOverviewTemplateProps) {
  if (!data) return null;

  return (
    <div className="w-full bg-[#F6F4ED]">
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
    </div>
  )
}
