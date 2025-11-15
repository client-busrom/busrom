"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { DocumentRenderer } from "@/components/document/DocumentRenderer"

interface ProductSeriesContent {
  id: string
  slug: string
  name: string
  description: string
  featuredImage: string | null
  order: number
  status: string
  content: {
    document: any[]
  }
  locale: string
}

interface ProductSeriesPageProps {
  locale: Locale
  slug: string
}

export function ProductSeriesPage({ locale, slug }: ProductSeriesPageProps) {
  const [seriesContent, setSeriesContent] = useState<ProductSeriesContent | null>(null)
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
        setSeriesContent(data)
      } catch (err) {
        console.error("Error fetching product series content:", err)
        setError(err instanceof Error ? err.message : "Failed to load product series")
      } finally {
        setLoading(false)
      }
    }

    fetchSeriesContent()
  }, [locale, slug])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !seriesContent) {
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

  // Render product series content
  return (
    <div className="min-h-screen bg-background pt-20" data-header-theme="light">
      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
        {/* Series Name */}
        {seriesContent.name && (
          <h1 className="text-4xl md:text-5xl font-anaheim font-extrabold text-brand-text-black mb-4">
            {seriesContent.name}
          </h1>
        )}

        {/* Series Description */}
        {seriesContent.description && (
          <p className="text-lg text-brand-accent-gold mb-8">
            {seriesContent.description}
          </p>
        )}

        {/* Featured Image */}
        {seriesContent.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={seriesContent.featuredImage}
              alt={seriesContent.name}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Document Content */}
        {seriesContent.content?.document && (
          <div className="prose prose-lg max-w-none">
            <DocumentRenderer
              document={seriesContent.content.document}
              locale={locale}
            />
          </div>
        )}

        {/* Placeholder notice for UI design */}
        <div className="mt-12 p-6 bg-brand-accent-gold/10 border border-brand-accent-gold/30 rounded-lg">
          <p className="text-brand-text-black font-anaheim">
            <strong>🎨 UI Design Pending:</strong> This product series page is using a template placeholder.
            Custom UI design will be implemented based on the PDF framework provided.
          </p>
        </div>

        {/* Back to Products Link */}
        <div className="mt-8">
          <a
            href="/products"
            className="inline-flex items-center text-brand-accent-gold hover:text-brand-text-black transition-colors font-anaheim font-bold"
          >
            ← Back to All Products
          </a>
        </div>
      </div>
    </div>
  )
}
