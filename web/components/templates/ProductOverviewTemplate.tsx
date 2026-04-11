"use client"

import React from "react"
import { ProductOverviewHeroSection } from "@/components/product-overview/HeroSection"
import type { ProductOverviewData } from "@/lib/parsers/product-overview-parser"

interface ProductOverviewTemplateProps {
  locale: string
  data: ProductOverviewData
}

export function ProductOverviewTemplate({ locale, data }: ProductOverviewTemplateProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0D]" data-header-theme="dark">
      <ProductOverviewHeroSection data={data.hero} />
      {/* 
        Other sections will be added here:
        - product-overview
        - applications
        - exclusive-solutions
        - product-guide
        - brand-trust
        - quote
      */}
    </div>
  )
}
