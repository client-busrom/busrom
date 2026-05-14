"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import Link from "next/link"
import { BlogTemplateOne } from "@/components/blog/templates/BlogTemplateOne"
import { BlogTemplateTwo } from "@/components/blog/templates/BlogTemplateTwo"
import { BlogTemplateThree } from "@/components/blog/templates/BlogTemplateThree"

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
}

export function BlogDetailClient({ locale, slug, blog, config }: BlogDetailClientProps) {
  const loading = false;
  const error = !blog ? "Blog post not found" : null;

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
          <Link href={`/${locale}/blog`} className="inline-block px-8 py-3 bg-[#B06E4E] text-white rounded-full">
            {locale === "zh" ? "返回博客" : "Back to Blog"}
          </Link>
        </div>
      </div>
    )
  }

  if (blog.templateType === 'template2') {
    return <BlogTemplateTwo blog={blog} locale={locale} formatDate={formatDate} config={config} />
  }
  
  if (blog.templateType === 'template3') {
    return <BlogTemplateThree blog={blog} locale={locale} formatDate={formatDate} config={config} />
  }

  return <BlogTemplateOne blog={blog} locale={locale} formatDate={formatDate} config={config} />
}
