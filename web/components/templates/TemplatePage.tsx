"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"

interface PageContent {
  id: string
  slug: string
  path: string
  pageType: string
  template: string
  title: string
  status: string
  content: {
    document?: any[]
    root?: {
      children?: any[]
    }
  }
  contentTranslation?: {
    root?: {
      children?: any[]
    }
  }
  mediaData?: Record<string, any>
  formConfig?: any
  locale: string
}

interface TemplatePageProps {
  locale: Locale
  slug: string
  template?: string
}

/**
 * TemplatePage - Legacy Generic Template Router (CSR)
 * Now primarily acts as a fallback for pages that haven't been migrated to SSR.
 */
export function TemplatePage({ locale, slug, template }: TemplatePageProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/pages/${slug}?locale=${locale}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch page: ${res.statusText}`)
        }

        const data = await res.json()
        setPageContent(data)
      } catch (err) {
        console.error("Error fetching page content:", err)
        setError(err instanceof Error ? err.message : "Failed to load page")
      } finally {
        setLoading(false)
      }
    }

    fetchPageContent()
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
  if (error || !pageContent) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              Page Not Found
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              {error || "The page you're looking for doesn't exist."}
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Default fallback to document renderer
  return (
    <div className="min-h-screen bg-[#f6f4ed] pt-20" data-header-theme="light">
      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
        {/* Template identifier removed */}

        {(pageContent.content || pageContent.contentTranslation) ? (
          <div className="prose prose-lg max-w-none">
            <LexicalRenderer 
              content={pageContent.content || pageContent.contentTranslation} 
              mediaData={pageContent.mediaData} 
            />
          </div>
        ) : (
          /* Placeholder notice only if no content exists */
          <div className="mt-12 p-6 bg-brand-accent-gold/10 border border-brand-accent-gold/30 rounded-lg">
            <p className="text-brand-text-black font-anaheim">
              <strong>🎨 UI Design Pending:</strong> This page is using a template placeholder.
              Custom UI design will be implemented based on client requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
