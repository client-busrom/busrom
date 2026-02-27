"use client"

import { useState, useEffect, useMemo } from "react"
import type { Locale } from "@/i18n.config"
import { parseContentTranslation, type ParsedProductSeriesContent } from "@/lib/content-parser"
import { HeroCarousel } from "@/components/product-series/HeroCarousel"
import { ProductOverview } from "@/components/product-series/ProductOverview"
import { CoreSellingPoints } from "@/components/product-series/CoreSellingPoints"
import { Applications } from "@/components/product-series/Applications"
import { ContactForm } from "@/components/product-series/ContactForm"
import { MoreSeries } from "@/components/product-series/MoreSeries"
import { Quote } from "@/components/product-series/Quote"

interface ProductSeriesData {
  id: string
  slug: string
  name: string
  description: string
  featuredImage: string | null
  order: number
  status: string
  contentTranslation: any
  mediaData: Record<string, any>
  reusableBlocks: Record<string, any>
  locale: string
}

interface ProductSeriesPageProps {
  locale: Locale
  slug: string
}

export function ProductSeriesPage({ locale, slug }: ProductSeriesPageProps) {
  const [seriesData, setSeriesData] = useState<ProductSeriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSeriesContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/product-series/${slug}?locale=${locale}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch product series: ${res.statusText}`)
        }

        const data = await res.json()
        setSeriesData(data)
      } catch (err) {
        console.error("Error fetching product series content:", err)
        setError(err instanceof Error ? err.message : "Failed to load product series")
      } finally {
        setLoading(false)
      }
    }

    fetchSeriesContent()
  }, [locale, slug])

  // Parse content translation
  const parsedContent = useMemo<ParsedProductSeriesContent>(() => {
    if (!seriesData?.contentTranslation) return {}

    // Build media map from mediaData (full objects)
    const mediaMap = new Map<string, any>()
    if (seriesData.mediaData) {
      Object.entries(seriesData.mediaData).forEach(([id, data]) => {
        mediaMap.set(id, data)
      })
    }

    // Build reusable blocks map
    const reusableBlocksMap = new Map<string, any>()
    if (seriesData.reusableBlocks) {
      Object.entries(seriesData.reusableBlocks).forEach(([id, content]) => {
        reusableBlocksMap.set(id, content)
      })
    }

    return parseContentTranslation(seriesData.contentTranslation, mediaMap, reusableBlocksMap)
  }, [seriesData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black" data-header-theme="transparent">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !seriesData) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              Product Series Not Found
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              {error || "The product series you're looking for doesn't exist."}
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              View All Products
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check if there's any content to display
  const hasContent = parsedContent.heroCarousel ||
    parsedContent.productOverview ||
    parsedContent.coreSellingPoints ||
    parsedContent.applications ||
    parsedContent.contactForm ||
    parsedContent.moreSeries ||
    parsedContent.quote

  // Empty content state
  if (!hasContent) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              {seriesData.name || "Product Series"}
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              Content is being prepared. Please check back later.
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              View All Products
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Render product series content with sections
  return (
    <div className="min-h-screen bg-background" data-header-theme="light">
      {/* Hero Carousel Section */}
      {parsedContent.heroCarousel && (
        <HeroCarousel data={parsedContent.heroCarousel} />
      )}

      {/* Product Overview Section */}
      {parsedContent.productOverview && (
        <ProductOverview data={parsedContent.productOverview} />
      )}

      {/* Core Selling Points Section */}
      {parsedContent.coreSellingPoints && (
        <CoreSellingPoints data={parsedContent.coreSellingPoints} />
      )}

      {/* Applications Section */}
      {parsedContent.applications && (
        <Applications data={parsedContent.applications} />
      )}

      {/* Contact Form Section */}
      {parsedContent.contactForm && (
        <ContactForm data={parsedContent.contactForm} />
      )}

      {/* More Series Section */}
      {parsedContent.moreSeries && (
        <MoreSeries data={parsedContent.moreSeries} currentSlug={slug} />
      )}

      {/* Quote Section */}
      {parsedContent.quote && (
        <Quote data={parsedContent.quote} />
      )}

    </div>
  )
}
