"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Locale } from "@/i18n.config"
import { ProductGallery } from "@/components/shop/ProductGallery"
import { ProductCard } from "@/components/shop/ProductCard"
import { SimplifiedInquiryForm } from "@/components/shop/SimplifiedInquiryForm"
import { FullInquiryModal } from "@/components/shop/FullInquiryModal"
import { ProductDetailSkeleton } from "@/components/shop/ProductDetailSkeleton"
import { StickyProductInfo } from "@/components/shop/StickyLeftColumn"
import { renderSection } from "@/components/shop/ProductContentRenderer"
import type { Product } from "@/lib/types/product"

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

  // Parse content sections
  const contentDocument = product.contentTranslation?.content?.document
  let preFormSections: any[] = []
  let formBlock: any = null
  let postFormSections: any[] = [] // Changed from postFormContent to postFormSections

  if (contentDocument) {
    let currentSection: any = null
    let foundForm = false

    for (let i = 0; i < contentDocument.length; i++) {
      const node = contentDocument[i]

      // Found the form block
      if (node.type === "component-block" && node.component === "formBlock") {
        if (currentSection) {
          preFormSections.push(currentSection)
          currentSection = null
        }
        formBlock = node
        foundForm = true
        continue
      }

      // Before form: collect blockquote sections
      if (!foundForm) {
        if (
          node.type === "blockquote" &&
          node.children[0]?.type === "code" &&
          node.children[0].children[0]?.text
        ) {
          if (currentSection) {
            preFormSections.push(currentSection)
          }
          const titleText = node.children[0].children[0].text
          currentSection = {
            title: titleText,
            content: [],
          }
          continue
        }

        if (currentSection && node.type !== "divider") {
          currentSection.content.push(node)
        }
      } else {
        // After form: Parse sections based on divider + blockquote pattern
        // Check if this is a section divider (divider followed by blockquote with code)
        if (node.type === "divider" && i + 1 < contentDocument.length) {
          const nextNode = contentDocument[i + 1]
          if (
            nextNode.type === "blockquote" &&
            nextNode.children[0]?.type === "code" &&
            nextNode.children[0].children[0]?.text
          ) {
            // Save current section if exists
            if (currentSection) {
              postFormSections.push(currentSection)
            }
            // Start new section (title is not displayed, only used as identifier)
            currentSection = {
              id: nextNode.children[0].children[0].text,
              content: [],
            }
            // Skip the next node (blockquote) since we already processed it
            i++
            continue
          }
        }

        // Add content to current section
        if (currentSection && node.type !== "divider") {
          currentSection.content.push(node)
        }
      }
    }

    if (currentSection && !foundForm) {
      preFormSections.push(currentSection)
    }

    // Don't forget to add the last post-form section
    if (currentSection && foundForm) {
      postFormSections.push(currentSection)
    }
  }

  return (
    <div className="min-h-screen bg-brand-main pt-20" data-header-theme="light">
      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-8">
        {/* Main Product Section - Shopify Style */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 mb-12">
          {/* Left Column - Gallery + Sections (70% width) - Sticky with GSAP */}
          <StickyProductInfo>
            {/* Gallery */}
            <div className="mb-6">
              <ProductGallery images={images} productName={displayName} />
            </div>

            {/* Section Buttons - Click to open modal (Desktop only - md+) */}
            {preFormSections.length > 0 && (
              <div className="hidden md:block space-y-3 md:space-y-4">
                {preFormSections.map((section: any, index: number) => (
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

          {/* Right Column - Product Info (30% width) - Normal scroll */}
          <div className="w-full md:w-[30%] flex-shrink-0" data-right-column>
            <div className="space-y-6">
            {/* Product Name & SKU */}
            <div>
              <p className="text-sm md:text-base text-brand-accent-gold-light mb-2">SKU: {product.sku}</p>
              <h1 className="font-anaheim font-extrabold text-2xl md:text-3xl lg:text-4xl text-brand-text-black mb-3">
                {displayName}
              </h1>
              {product.series && (
                <Link
                  href={`/${locale}/products/${product.series.slug}`}
                  className="text-sm md:text-base text-brand-accent-gold hover:text-brand-secondary transition-colors hover:underline"
                >
                  View {product.series.localizedName} Series
                </Link>
              )}
            </div>

            {/* Description */}
            {product.localizedDescription && (
              <div className="text-brand-text-main prose prose-sm md:prose-base max-w-none">
                {typeof product.localizedDescription === "string" ? (
                  <p className="text-sm md:text-base leading-relaxed">{product.localizedDescription}</p>
                ) : (
                  <div>{JSON.stringify(product.localizedDescription)}</div>
                )}
              </div>
            )}

            {/* Specifications */}
            {(() => {
              const specs = product.specifications?.[locale] || product.specifications?.["en"] || []

              return specs && specs.length > 0 && (
                <div className="border-t-2 border-brand-accent-border pt-6">
                  <h3 className="font-anaheim font-extrabold text-lg md:text-xl text-brand-text-black mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {specs.map((spec: any, idx: number) => (
                    <div key={idx}>
                      <p className="text-sm md:text-base font-medium text-brand-text-main mb-2">
                        {spec.text || spec.name?.[locale] || spec.name?.en || ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(spec.items || spec.options || []).map((item: any, itemIdx: number) => (
                          <span
                            key={itemIdx}
                            className="px-3 py-1.5 bg-brand-cream-dark text-brand-text-black text-xs md:text-sm rounded-full border border-brand-accent-border"
                          >
                            {item.text || item.value?.[locale] || item.value?.en || ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Simplified Inquiry Form (Required fields only) */}
            {formBlock && formBlock.props?.formConfig?.value && (
              <div className="border-t-2 border-brand-accent-border pt-6">
                <h3 className="font-anaheim font-extrabold text-lg md:text-xl text-brand-text-black mb-4">Product Inquiry</h3>
                <SimplifiedInquiryForm
                  formConfig={formBlock.props.formConfig.value}
                  locale={locale}
                  productSeries={product.series?.slug}
                  onOpenFullForm={(data) => {
                    setInitialFormData(data)
                    setIsFullFormOpen(true)
                  }}
                />
              </div>
            )}

            {/* Product Features - Additional content to make right side taller */}
            <div className="border-t-2 border-brand-accent-border pt-6">
              <h3 className="font-anaheim font-extrabold text-lg md:text-xl text-brand-text-black mb-4">Key Features</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-cream flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-brand-text-black">Premium Quality Materials</p>
                    <p className="text-xs md:text-sm text-brand-text-main mt-1">Built with high-grade components for lasting durability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-cream flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-brand-text-black">Easy Installation</p>
                    <p className="text-xs md:text-sm text-brand-text-main mt-1">Simple setup process with included instructions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-cream flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-brand-text-black">Warranty Included</p>
                    <p className="text-xs md:text-sm text-brand-text-main mt-1">Comprehensive coverage for peace of mind</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-cream flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-brand-text-black">Fast Shipping</p>
                    <p className="text-xs md:text-sm text-brand-text-main mt-1">Quick delivery to your location</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us - More content */}
            <div className="border-t-2 border-brand-accent-border pt-6">
              <h3 className="font-anaheim font-extrabold text-lg md:text-xl text-brand-text-black mb-4">Why Choose This Product</h3>
              <div className="prose prose-sm md:prose-base text-brand-text-main">
                <p className="mb-3 text-sm md:text-base leading-relaxed">
                  This product represents the perfect balance of quality, functionality, and value.
                  Designed with attention to detail and built to last.
                </p>
                <p className="mb-3 text-sm md:text-base leading-relaxed">
                  Our commitment to excellence ensures that every unit meets rigorous quality standards
                  before reaching your hands.
                </p>
                <p className="text-sm md:text-base leading-relaxed">
                  Join thousands of satisfied customers who have already made the smart choice.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t-2 border-brand-accent-border pt-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-brand-cream rounded-lg border border-brand-accent-border">
                  <div className="text-xl md:text-2xl font-anaheim font-extrabold text-brand-secondary">10+</div>
                  <div className="text-xs md:text-sm text-brand-text-main mt-1">Years Experience</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-brand-cream rounded-lg border border-brand-accent-border">
                  <div className="text-xl md:text-2xl font-anaheim font-extrabold text-brand-secondary">5000+</div>
                  <div className="text-xs md:text-sm text-brand-text-main mt-1">Happy Customers</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-brand-cream rounded-lg border border-brand-accent-border">
                  <div className="text-xl md:text-2xl font-anaheim font-extrabold text-brand-secondary">24/7</div>
                  <div className="text-xs md:text-sm text-brand-text-main mt-1">Customer Support</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-brand-cream rounded-lg border border-brand-accent-border">
                  <div className="text-xl md:text-2xl font-anaheim font-extrabold text-brand-secondary">100%</div>
                  <div className="text-xs md:text-sm text-brand-text-main mt-1">Satisfaction</div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Section Buttons - Click to open modal (Mobile only - below md) */}
        {preFormSections.length > 0 && (
          <div className="block md:hidden mb-12 space-y-3">
            {preFormSections.map((section: any, index: number) => (
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

        {/* Post-form Sections */}
        {postFormSections.length > 0 && (
          <div className="space-y-8 mb-12">
            {postFormSections.map((section: any, sectionIndex: number) => (
              <div key={sectionIndex} className="space-y-6">
                {renderSection(section)}
              </div>
            ))}
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <h2 className="font-anaheim font-extrabold text-2xl md:text-3xl text-brand-text-black mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct: Product) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {formBlock && formBlock.props?.formConfig?.value && (
        <FullInquiryModal
          isOpen={isFullFormOpen}
          onClose={() => setIsFullFormOpen(false)}
          formConfig={formBlock.props.formConfig.value}
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
                {selectedSection.content.map((node: any, nodeIdx: number) => {
                  if (node.type === "paragraph") {
                    return (
                      <p key={nodeIdx} className="text-sm md:text-base leading-relaxed">
                        {node.children.map((child: any, childIdx: number) => {
                          if (child.bold) return <strong key={childIdx} className="text-brand-text-black font-semibold">{child.text}</strong>
                          if (child.italic) return <em key={childIdx}>{child.text}</em>
                          return <span key={childIdx}>{child.text}</span>
                        })}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
