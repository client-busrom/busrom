"use client"

import React, { useMemo } from "react"
import { ProductOverviewHeroSection } from "../product-overview/HeroSection"
import { SeriesOverviewSection } from "../product-overview/SeriesOverviewSection"

interface ProductOverviewTemplateProps {
  locale: string;
  data: any;
}

export function ProductOverviewTemplate({ locale, data }: ProductOverviewTemplateProps) {
  if (!data) return null;

  return (
    <div className="w-full bg-[#F6F4ED]">
      {/* 1. Hero Section */}
      <ProductOverviewHeroSection data={data.hero} />

      {/* 2. Series Overview Section */}
      <SeriesOverviewSection data={data.seriesOverview} />

      {/* Placeholder for future sections */}
      <div className="h-[200px]" />
    </div>
  )
}
