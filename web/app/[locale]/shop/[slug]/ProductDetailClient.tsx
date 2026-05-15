"use client"

import { useState, useEffect, useRef } from "react"
import type { Locale } from "@/i18n.config"
import Link from 'next/link'
import { FullInquiryModal } from "@/components/shop/FullInquiryModal"
import { ProductDetailSkeleton } from "@/components/shop/ProductDetailSkeleton"
import { SectionRenderer } from "./SectionRenderer"
import { parseLexicalSections, parseMainContentStrengthData } from "./parseSectionData"
import { ProductMainContent } from "./ProductMainContent"

interface ProductDetailClientProps {
  locale: Locale
  slug: string
  footerHint?: string
  initialData?: any
}

export function ProductDetailClient({ locale, slug, footerHint, initialData }: ProductDetailClientProps) {
  const [product, setProduct] = useState<any>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [isFullFormOpen, setIsFullFormOpen] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Record<string, any>>({})
  const [formConfig, setFormConfig] = useState<any>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // If we have initialData, we still might need to fetch formConfig 
        // but we can skip the main product fetch if we already have it.
        // However, the useEffect logic also handles formConfig fetching.
        // To keep it simple and robust, we skip the main fetch if initialData is there
        // but we need to ensure formConfig logic still runs.
        
        let currentProduct = product

        if (!initialData) {
          const res = await fetch(`/api/products/${slug}?locale=${locale}`)

          if (res.status === 404) {
            setError("Product not found")
            return
          }

          if (!res.ok) {
            setError("Failed to load product")
            return
          }

          currentProduct = await res.json()
          setProduct(currentProduct)
        }

        if (!currentProduct) return

        const data = currentProduct

        // 1. Check for directly linked form (higher priority)
        let formConfigToUse = null
        let formConfigId = null

        if (data.linkedForm) {
          if (typeof data.linkedForm === 'object' && data.linkedForm.id) {
            formConfigToUse = data.linkedForm
            formConfigId = data.linkedForm.id
          } else {
            formConfigId = data.linkedForm
          }
        }

        // 2. Fallback to form block in content if no direct link
        if (!formConfigId) {
          const formBlocks = data.content?.root?.children?.filter((n: any) =>
            n.type === 'formBlock' || (n.type === 'block' && n.fields?.blockType === 'form-block')
          ) || []

          if (formBlocks.length > 0) {
            formConfigId = formBlocks[0].data?.formConfig?.id || formBlocks[0].fields?.formConfig?.id
          }
        }

        // Fetch form config if we have an ID but not the full object
        if (formConfigId) {
          if (formConfigToUse) {
            setFormConfig(formConfigToUse)
          } else {
            try {
              const formRes = await fetch(`/api/form-configs/${formConfigId}?locale=${locale}`)
              if (formRes.ok) {
                const formData = await formRes.json()
                setFormConfig(formData)
              }
            } catch (err) {
              console.error('[ProductDetailClient] Failed to fetch form config:', err)
            }
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
  const { parsedSection } = parseLexicalSections(product.content, product.reusableBlocks)

  // Use ONLY Attribute Page data for core strengths (badges below gallery)
  const strengthData = parseMainContentStrengthData(product.productAttributes, product.customAttributes, product.reusableBlocks)

  return (
    <div className="min-h-screen bg-brand-main">
      {/* Main Content */}
      <ProductMainContent
        product={product}
        images={images}
        displayName={displayName}
        strengthData={strengthData}
        locale={locale}
        formConfig={formConfig}
        footerHint={footerHint}
        setInitialFormData={setInitialFormData}
        setIsFullFormOpen={setIsFullFormOpen}
      />

      {/* Sections - Rendered based on section type */}
      {parsedSection.map((section: any, sectionIndex: number) => {
        return (
          <SectionRenderer
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            locale={locale}
            productName={displayName}
            mediaData={product.mediaData}
            reusableBlocks={product.reusableBlocks}
          />
        )
      })}

      {/* Full Inquiry Modal */}
      {formConfig && (
        <FullInquiryModal
          isOpen={isFullFormOpen}
          onClose={() => setIsFullFormOpen(false)}
          formConfig={formConfig}
          locale={locale}
          productSeries={product.series?.slug}
          initialData={initialFormData}
        />
      )}

    </div>
  )
}
