'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ProductGallery } from "@/components/shop/ProductGallery"
import { StrengthBadges } from "@/components/shop/StrengthBadges"
import { ProductSpecifications } from "@/components/shop/ProductSpecifications"
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { SimplifiedInquiryForm } from "@/components/shop/SimplifiedInquiryForm"
import type { Locale } from "@/i18n.config"

// Description component with 3-line clamp and expand button
function DescriptionWithExpand({ description, locale }: { description: string | any, locale: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsExpand, setNeedsExpand] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight)
      const maxHeight = lineHeight * 3
      setNeedsExpand(textRef.current.scrollHeight > maxHeight + 2)
    }
  }, [description])

  const label = locale === 'zh' ? (isExpanded ? "收起" : "展开详情") : (isExpanded ? "Show Less" : "Learn more")

  if (typeof description !== "string") {
    return (
      <div className="text-brand-text-main prose prose-sm md:prose-base max-w-none">
        <div>{JSON.stringify(description)}</div>
      </div>
    )
  }

  return (
    <div className="text-brand-text-main">
      <div
        ref={textRef}
        className={`text-sm md:text-base leading-relaxed whitespace-pre-line ${
          !isExpanded ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </div>
      {needsExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-brand-accent-gold text-sm font-medium mt-2 hover:text-brand-secondary transition-colors underline underline-offset-4"
        >
          {label}
        </button>
      )}
    </div>
  )
}

interface ProductMainContentProps {
  product: any
  images: any[]
  displayName: string
  strengthData: any
  locale: Locale
  formConfig: any
  footerHint?: string
  setInitialFormData: (data: any) => void
  setIsFullFormOpen: (open: boolean) => void
}

export const ProductMainContent: React.FC<ProductMainContentProps> = ({
  product,
  images,
  displayName,
  strengthData,
  locale,
  formConfig,
  footerHint,
  setInitialFormData,
  setIsFullFormOpen
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-[152px] pt-[84px] pb-12" data-header-theme="light">
      {/* Main Product Section - Using items-start for sticky to work correctly */}
      <div className="flex flex-col md:flex-row items-start gap-[48px]">
        
        {/* Left Column - Gallery + Sections (Native CSS Sticky) */}
        <div className="flex-1 min-w-0 md:sticky md:top-[calc(var(--header-height,46px)+3rem)] md:h-fit">
          {/* Gallery */}
          <div className="mb-8">
            <ProductGallery images={images} productName={displayName} />
          </div>

          {/* Strength Badges */}
          <div className="mb-10 max-w-4xl">
            <StrengthBadges items={strengthData?.items} />
          </div>

        </div>

        {/* Right Column - Product Info (Fixed Width Matching Competitor) */}
        <div className="w-full md:w-[348px] md:flex-shrink-0 flex flex-col gap-y-6" data-right-column>
          {/* Header Area */}
          <div className="flex flex-col gap-2 pt-1.5">
            <h1 className="text-2xl lg:text-3xl font-semibold text-brand-text-black opacity-80 leading-tight tracking-tight">
              {displayName}
            </h1>
            
            {/* Review Area (gap-xs equivalent) */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[#ffc107] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[13px] font-medium text-brand-text-main opacity-60 underline underline-offset-2 cursor-pointer">1,098 reviews</span>
            </div>

            {/* Description Area */}
            {product.localizedDescription && (
              <div className="">
                <DescriptionWithExpand description={product.localizedDescription} locale={locale} />
              </div>
            )}
          </div>


          {/* Specifications / Variants */}
          <ProductSpecifications 
            specifications={product.specifications}
            locale={locale}
          />

          {/* Inquiry Form Section */}
          {formConfig && (() => {
            const configData = formConfig?.data || formConfig
            const formDisplayName = configData?.displayName || (locale === 'zh' ? "产品咨询" : "Product Inquiry")
            const formDescription = configData?.description || ""

            return (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-brand-accent-border/40 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-brand-text-black mb-1">{formDisplayName}</h3>
                  {formDescription && (
                    <p className="text-sm text-brand-text-main opacity-70 mb-6 leading-relaxed">{formDescription}</p>
                  )}
                  <SimplifiedInquiryForm
                    formConfig={formConfig}
                    locale={locale}
                    productSeries={product.series?.slug}
                    footerHint={footerHint}
                    onOpenFullForm={(data) => {
                      setInitialFormData(data)
                      setIsFullFormOpen(true)
                    }}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

