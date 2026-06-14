"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"
import { BlogTemplateOne } from "@/components/blog/templates/BlogTemplateOne"
import { BlogTemplateTwo } from "@/components/blog/templates/BlogTemplateTwo"
import { BlogTemplateThree } from "@/components/blog/templates/BlogTemplateThree"
import { useRouter } from "next/navigation"

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"

interface BlogContent {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  status: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  coverImage: string
  categories: { id: string; name: string }[]
  templateType: string
  content: {
    root: {
      children: any[]
    }
  } | null
  locale: string
}

interface BlogDetailClientProps {
  locale: Locale
  slug: string
  blog: any
  config: any
  isDraftMode?: boolean
}

export function BlogDetailClient({ locale, slug, blog, config, isDraftMode }: BlogDetailClientProps) {
  const router = useRouter()
  const loading = false;
  const error = !blog ? "Blog post not found" : null;

  useEffect(() => {
    if (!isDraftMode) return

    let refreshTimeout: NodeJS.Timeout

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'payload-live-preview') {
        // Debounce the refresh to prevent infinite loops / multiple fast saves
        clearTimeout(refreshTimeout)
        refreshTimeout = setTimeout(() => {
          console.log('[Live Preview] Refreshing Next.js route due to CMS update...')
          router.refresh()
        }, 500)
      }
    }

    window.addEventListener('message', handleMessage)

    // Notify Payload CMS that the iframe is ready to receive messages
    if (window.parent) {
      window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*')
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(refreshTimeout)
    }
  }, [isDraftMode, router])

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1ED] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#B06E4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#F4F1ED] pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-montserrat text-[#000000] mb-4">
            {locale === "zh" ? "文章未找到" : "Blog Post Not Found"}
          </h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link href={`/${locale}/knowledge-base-blog`} className="inline-block px-8 py-3 bg-[#B06E4E] text-white rounded-full">
            {locale === "zh" ? "返回博客" : "Back to Blog"}
          </Link>
        </div>
      </div>
    )
  }

  const renderTemplate = () => {
    if (blog.templateType === 'template2') {
      return <BlogTemplateTwo blog={blog} locale={locale} formatDate={formatDate} config={config} />
    }

    if (blog.templateType === 'template3') {
      return <BlogTemplateThree blog={blog} locale={locale} formatDate={formatDate} config={config} />
    }

    return <BlogTemplateOne blog={blog} locale={locale} formatDate={formatDate} config={config} />
  }

  return (
    <>
      {isDraftMode && (
        <div className="fixed top-0 left-0 w-full bg-[#B06E4E] text-white py-2 px-4 z-[9999] flex justify-between items-center text-sm font-medium">
          <span>👀 Preview Mode Active (Auto-refreshes on Save)</span>
          <a
            href="/api/exit-preview"
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            Exit Preview
          </a>
        </div>
      )}

      {renderTemplate()}
    </>
  )
}
