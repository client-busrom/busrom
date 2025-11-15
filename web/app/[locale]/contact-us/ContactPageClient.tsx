"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { DocumentRenderer } from "@/components/document/DocumentRenderer"

interface PageData {
  id: string
  slug: string
  path: string
  pageType: string
  template: string
  title: string
  status: string
  content: {
    document: any[]
  }
  locale: string
}

interface ContactPageClientProps {
  locale: Locale
}

export function ContactPageClient({ locale }: ContactPageClientProps) {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch page content from CMS
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/contact-us?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          setPageData(data)
        } else {
          setError("Failed to load page content")
        }
      } catch (err) {
        console.error("Error fetching page:", err)
        setError("Failed to load page")
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-16 text-center">
          <h1 className="text-3xl font-anaheim font-bold text-brand-text-black mb-4">
            Page Not Found
          </h1>
          <p className="text-brand-accent-gold">
            {error || "The page you are looking for does not exist."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20" data-header-theme="light">
      {/* Page Header */}
      <div className="border-b border-brand-accent-border">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <h1 className="text-4xl md:text-5xl font-anaheim font-extrabold text-brand-text-black">
            {pageData.title}
          </h1>
        </div>
      </div>

      {/* Page Content - Rendered from CMS */}
      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-16">
        <DocumentRenderer
          document={pageData.content.document}
          locale={locale}
        />
      </div>
    </div>
  )
}
