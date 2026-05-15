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
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 xl:px-[152px] pt-[84px] pb-12" data-header-theme="dark">
      {/* Main Product Section - Left fluid, Right fixed 348px */}
      <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12 xl:gap-[48px]">
        
        {/* Left Column - Gallery + Sections (Fluidly shrinks) */}
        <div className="w-full flex-1 min-w-0 md:sticky md:top-[calc(var(--header-height,46px)+3rem)] md:h-fit">
          {/* Gallery */}
          <div className="mb-8">
            <ProductGallery images={images} productName={displayName} />
          </div>

          {/* Strength Badges */}
          <div className="mb-10 max-w-4xl">
            <StrengthBadges items={strengthData?.items} />
          </div>

        </div>

        {/* Right Column - Product Info (Fixed Width: 348px) */}
        <div className="w-full md:w-[348px] md:flex-shrink-0 flex flex-col gap-y-6" data-right-column>
          {/* Header Area */}
          <div className="flex flex-col gap-2 pt-1.5">
            <h1 className="text-2xl lg:text-[32px] font-semibold text-brand-text-black opacity-80 leading-tight tracking-tight">
              {displayName}
            </h1>

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

