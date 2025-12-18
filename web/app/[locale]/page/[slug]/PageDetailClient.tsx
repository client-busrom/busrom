"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { DocumentRenderer } from "@/components/document/DocumentRenderer"
import Link from "next/link"
import Image from "next/image"

interface PageContent {
  id: string
  slug: string
  path: string
  pageType: string
  template: string
  title: string
  status: string
  heroText?: string
  heroSubtitle?: string
  heroMediaPreview?: { url: string }[]
  content: {
    document: any[]
  } | null
  locale: string
}

interface PageDetailClientProps {
  locale: Locale
  slug: string
}

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

  return (
    <div className="min-h-screen bg-background pt-20" data-header-theme="light">
      {/* Hero Section (if has hero content) */}
      {(page.heroText || page.heroMediaPreview?.length) && (
        <div className="relative bg-brand-secondary text-white py-16 md:py-24">
          {page.heroMediaPreview?.[0]?.url && (
            <Image
              src={page.heroMediaPreview[0].url}
              alt={page.title || ""}
              fill
              className="object-cover opacity-30"
            />
          )}
          <div className="container mx-auto px-6 md:px-8 lg:px-16 relative z-10">
            {page.heroText && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-anaheim font-extrabold mb-4">
                {page.heroText}
              </h1>
            )}
            {page.heroSubtitle && (
              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                {page.heroSubtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-brand-accent-gold">
            <li>
              <Link href={`/${locale}`} className="hover:text-brand-text-black transition-colors">
                {locale === "zh" ? "首页" : "Home"}
              </Link>
            </li>
            <li>/</li>
            <li className="text-brand-text-black truncate max-w-[200px]">{page.title}</li>
          </ol>
        </nav>

        {/* Page Title (if no hero) */}
        {!page.heroText && page.title && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-anaheim font-extrabold text-brand-text-black mb-8">
            {page.title}
          </h1>
        )}

        {/* Content */}
        {page.content?.document && (
          <div className="prose prose-lg max-w-none">
            <DocumentRenderer
              document={page.content.document}
              locale={locale}
            />
          </div>
        )}

        {/* No content placeholder */}
        {!page.content?.document && (
          <div className="py-12 text-center">
            <p className="text-brand-accent-gold">
              {locale === "zh" ? "此页面暂无内容。" : "This page has no content yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
