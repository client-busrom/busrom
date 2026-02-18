"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import type { Locale } from "@/i18n.config"
import { ProductGallery } from "@/components/shop/ProductGallery"
import { SimplifiedInquiryForm } from "@/components/shop/SimplifiedInquiryForm"
import { FullInquiryModal } from "@/components/shop/FullInquiryModal"
import { ProductDetailSkeleton } from "@/components/shop/ProductDetailSkeleton"
import { StickyProductInfo } from "@/components/shop/StickyLeftColumn"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import { ProductHeroSection } from "@/components/shop/ProductHeroSection"
import { StrengthBadges } from "@/components/shop/StrengthBadges"
import { SectionRenderer } from "./SectionRenderer"
import { parseLexicalSections, parseMainContentStrengthData } from "./parseSectionData"

// Description component with 3-line clamp and expand button
function DescriptionWithExpand({ description }: { description: string | any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsExpand, setNeedsExpand] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      // Check if text is clamped (content height > visible height)
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight)
      const maxHeight = lineHeight * 3
      setNeedsExpand(textRef.current.scrollHeight > maxHeight + 2) // +2 for tolerance
    }
  }, [description])

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
          className="mt-2 text-sm text-brand-accent-gold hover:text-brand-secondary transition-colors"
        >
          {isExpanded ? "Show less" : "Learn more"}
        </button>
      )}
    </div>
  )
}

interface ProductDetailClientProps {
  locale: Locale
  slug: string
}

export function ProductDetailClient({ locale, slug }: ProductDetailClientProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullFormOpen, setIsFullFormOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [initialFormData, setInitialFormData] = useState<Record<string, any>>({})
  const [formConfig, setFormConfig] = useState<any>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}?locale=${locale}`)

        if (res.status === 404) {
          setError("Product not found")
          return
        }

        if (!res.ok) {
          setError("Failed to load product")
          return
        }

        const data = await res.json()
        setProduct(data)

        // Extract formConfig ID from content and fetch formConfig data
        const formBlocks = data.content?.root?.children?.filter((n: any) =>
          n.type === 'formBlock' || (n.type === 'block' && n.fields?.blockType === 'form-block')
        ) || []

        if (formBlocks.length > 0) {
          const formConfigId = formBlocks[0].data?.formConfig?.id || formBlocks[0].fields?.formConfig?.id
          if (formConfigId) {
            try {
              const formRes = await fetch(`/api/form-configs/${formConfigId}`)
              if (formRes.ok) {
                const formData = await formRes.json()
                setFormConfig(formData)
              } else {
                console.error('[ProductDetailClient] Failed to fetch formConfig:', formRes.status)
              }
            } catch (err) {
              console.error('[ProductDetailClient] Failed to fetch form config:', err)
            }
          } else {
            console.error('[ProductDetailClient] No formConfigId found in formBlock')
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug, locale])

  // Loading state - Show skeleton
  if (loading) {
    return <ProductDetailSkeleton />
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Product not found"}</h1>
          <p className="text-gray-600 mb-4">The product you are looking for does not exist.</p>
          <Link
            href={`/${locale}/shop`}
            className="inline-block px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const images = product.mainImage || (product.showImage ? [product.showImage] : [])
  const displayName = product.localizedName || product.sku

  // Parse Lexical content structure using extracted function
  const { preFormSections, formBlock, postFormSections } = parseLexicalSections(product.content)

  // Find and parse main-content-strength section from preFormSections
  const strengthSection = preFormSections.find((s: any) => s.title === 'main-content-strength')
  const strengthData = strengthSection ? parseMainContentStrengthData(strengthSection.content) : null

  // Get the first main image for the hero section
  const heroImage = images.length > 0 ? images[0] : null

  return (
    <div className="min-h-screen bg-brand-main">
      {/* Main Content */}
      <div className="max-w-[1195px] mx-auto px-6 md:px-8 lg:px-12 pt-[78px] pb-8" data-header-theme="light">
        {/* Main Product Section */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 mb-12">
          {/* Left Column - Gallery + Sections (70% width) - Sticky with GSAP */}
          <StickyProductInfo>
            {/* Gallery */}
            <div className="mb-4">
              <ProductGallery images={images} productName={displayName} />
            </div>

            {/* Strength Badges - Below Gallery */}
            <div className="mb-6">
              <StrengthBadges items={strengthData?.items} />
            </div>

            {/* Section Buttons - Click to open modal (Desktop only - md+) */}
            {preFormSections.filter((s: any) => s.title !== 'main-content-strength').length > 0 && (
              <div className="hidden md:block space-y-3 md:space-y-4">
                {preFormSections.filter((s: any) => s.title !== 'main-content-strength').map((section: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSection(section)}
                    className="w-full bg-white border-2 border-brand-accent-border rounded-lg px-5 py-2 md:px-6 md:py-3 hover:bg-brand-cream hover:border-brand-secondary transition-all duration-300 hover:shadow-md flex justify-between items-center text-left"
                  >
                    <h3 className="text-base md:text-lg font-anaheim font-extrabold text-brand-text-black">{section.title}</h3>
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-brand-accent-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </StickyProductInfo>

          {/* Right Column - Product Info (40% width) - Normal scroll */}
          <div className="w-full md:w-[40%] flex-shrink-0" data-right-column>
            <div className="space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="font-anaheim font-extrabold text-2xl md:text-3xl lg:text-4xl text-brand-text-black mb-3">
                {displayName}
              </h1>
              {product.series && (
                <Link
                  href={`/${locale}/products/${product.series.slug}`}
                  className="inline-flex items-center gap-1 text-sm md:text-base text-brand-accent-gold underline hover:text-brand-secondary hover:no-underline transition-colors group"
                >
                  View {product.series.localizedName || product.series.name} Series
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Description */}
            {product.localizedDescription && (
              <DescriptionWithExpand description={product.localizedDescription} />
            )}

            {/* Specifications */}
            {(() => {
              // 支持两种格式: 直接数组 [...] 或按语言分组 {en: [...], zh: [...]}
              const specs = Array.isArray(product.specifications)
                ? product.specifications
                : (product.specifications?.[locale] || product.specifications?.["en"] || [])

              return specs && specs.length > 0 && (
                <div className="pt-4 space-y-6">
                  {specs.map((spec: any, idx: number) => (
                    <div key={idx}>
                      {/* Group title with description style */}
                      <p className="text-sm md:text-base text-brand-text-main mb-3">
                        <span className="font-semibold">{spec.text || spec.name?.[locale] || spec.name?.en || ""}</span>
                      </p>
                      {/* Grid layout: 2 columns on mobile, 3 columns if more items */}
                      <div className="grid grid-cols-2 gap-2">
                        {(spec.items || spec.options || []).map((item: any, itemIdx: number) => {
                          const hasImage = item.image
                          const imageUrl = hasImage
                            ? `/api/media/${item.image}/file?width=200`
                            : null

                          return (
                            <div
                              key={itemIdx}
                              className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-brand-secondary transition-colors cursor-pointer"
                            >
                              {/* Only show image if media ID exists */}
                              {imageUrl && (
                                <div className="w-12 h-12 mb-2 flex items-center justify-center">
                                  <img
                                    src={imageUrl}
                                    alt={item.text || ""}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              )}
                              {/* Item text */}
                              <span className="text-xs md:text-sm text-center text-brand-text-black leading-tight">
                                {item.text || item.value?.[locale] || item.value?.en || ""}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Simplified Inquiry Form (Required fields only) */}
            {formBlock && formConfig && (() => {
              const configData = formConfig?.data || formConfig
              const formDisplayName = configData?.displayName || "Product Inquiry"
              const formDescription = configData?.description || ""

              return (
                <div className="pt-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-anaheim font-extrabold text-lg md:text-xl text-brand-text-black mb-2">{formDisplayName}</h3>
                    {formDescription && (
                      <p className="text-sm text-gray-500 mb-4 whitespace-pre-line">{formDescription}</p>
                    )}
                    <SimplifiedInquiryForm
                      formConfig={formConfig}
                      locale={locale}
                      productSeries={product.series?.slug}
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

        {/* Section Buttons - Click to open modal (Mobile only - below md) */}
        {preFormSections.filter((s: any) => s.title !== 'main-content-strength').length > 0 && (
          <div className="block md:hidden mb-12 space-y-3">
            {preFormSections.filter((s: any) => s.title !== 'main-content-strength').map((section: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedSection(section)}
                className="w-full bg-white border-2 border-brand-accent-border rounded-lg px-5 py-2 hover:bg-brand-cream hover:border-brand-secondary transition-all duration-300 hover:shadow-md flex justify-between items-center text-left"
              >
                <h3 className="text-base font-anaheim font-extrabold text-brand-text-black">{section.title}</h3>
                <svg
                  className="w-5 h-5 text-brand-accent-gold flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* First scrolling-link section - Before Hero */}
      {postFormSections.length > 0 && postFormSections[0].id === 'scrolling-link' && (
        <SectionRenderer
          section={postFormSections[0]}
          sectionIndex={0}
          locale={locale}
        />
      )}

      {/* Hero Section - Full Width */}
      <ProductHeroSection
        productName={displayName}
        description={product.localizedShortDescription || product.localizedDescription || ""}
        heroImage={heroImage}
      />

      {/* Post-form Sections - Rendered based on section type (skip first if it was scrolling-link) */}
      {postFormSections.map((section: any, sectionIndex: number) => {
        // Skip first section if it was already rendered as scrolling-link before hero
        if (sectionIndex === 0 && section.id === 'scrolling-link') return null
        return (
          <SectionRenderer
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            locale={locale}
            />
        )
      })}

      {/* Full Inquiry Modal */}
      {formBlock && formConfig && (
        <FullInquiryModal
          isOpen={isFullFormOpen}
          onClose={() => setIsFullFormOpen(false)}
          formConfig={formConfig}
          locale={locale}
          productSeries={product.series?.slug}
          initialData={initialFormData}
        />
      )}

      {/* Section Content Modal */}
      {selectedSection && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSection(null)}
        >
          <div
            className="bg-brand-main rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-brand-accent-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-secondary border-b-2 border-brand-accent-border px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-anaheim font-extrabold text-brand-cream">{selectedSection.title}</h2>
              <button
                onClick={() => setSelectedSection(null)}
                className="p-2 hover:bg-brand-secondary/80 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              <div className="text-brand-text-main prose prose-sm md:prose-base max-w-none space-y-3">
                <LexicalRenderer content={selectedSection.content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
