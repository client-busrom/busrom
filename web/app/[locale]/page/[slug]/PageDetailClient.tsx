"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import Link from "next/link"
import { TemplateSwitcher } from "@/components/templates/TemplateSwitcher"

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
  locale: string
  applications?: any[]
  products?: any[]
}

interface PageDetailClientProps {
  locale: Locale
  slug: string
}

/**
 * PageDetailClient - Now uses TemplateSwitcher to handle all rendering based on template identifiers.
 */
export function PageDetailClient({ locale, slug }: PageDetailClientProps) {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/pages/${slug}?locale=${locale}`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Page not found")
          }
          throw new Error(`Failed to fetch page: ${res.statusText}`)
        }

        const data = await res.json()
        setPage(data)
      } catch (err) {
        console.error("Error fetching page:", err)
        setError(err instanceof Error ? err.message : "Failed to load page")
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
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
  if (error || !page) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              {locale === "zh" ? "页面未找到" : "Page Not Found"}
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              {error || (locale === "zh" ? "您查找的页面不存在。" : "The page you're looking for doesn't exist.")}
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              {locale === "zh" ? "返回首页" : "Go Home"}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <TemplateSwitcher locale={locale} rawData={page} />
}
