"use client"

import { useState, useEffect } from "react"
import type { Locale } from "@/i18n.config"
import { DocumentRenderer } from "@/components/document/DocumentRenderer"
import Link from "next/link"
import Image from "next/image"

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
  content: {
    document: any[]
  } | null
  locale: string
}

interface BlogDetailClientProps {
  locale: Locale
  slug: string
}

export function BlogDetailClient({ locale, slug }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<BlogContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/blog/${slug}?locale=${locale}`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Blog post not found")
          }
          throw new Error(`Failed to fetch blog: ${res.statusText}`)
        }

        const data = await res.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [locale, slug])

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background pt-20" data-header-theme="light">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-16 h-px bg-brand-accent-border mb-6"></div>
            <h1 className="text-brand-text-black text-3xl font-anaheim font-extrabold mb-3">
              {locale === "zh" ? "文章未找到" : "Blog Post Not Found"}
            </h1>
            <p className="text-brand-accent-gold text-base mb-6">
              {error || (locale === "zh" ? "您查找的文章不存在。" : "The blog post you're looking for doesn't exist.")}
            </p>
            <Link
              href={`/${locale}/blog`}
              className="inline-block px-8 py-3 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-colors"
            >
              {locale === "zh" ? "返回博客" : "Back to Blog"}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-background pt-20" data-header-theme="light">
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
            <li>
              <Link href={`/${locale}/blog`} className="hover:text-brand-text-black transition-colors">
                {locale === "zh" ? "博客" : "Blog"}
              </Link>
            </li>
            <li>/</li>
            <li className="text-brand-text-black truncate max-w-[200px]">{blog.title}</li>
          </ol>
        </nav>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Categories */}
        {blog.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 text-xs font-anaheim font-semibold bg-brand-accent-gold/10 text-brand-accent-gold rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-anaheim font-extrabold text-brand-text-black mb-4">
          {blog.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-brand-accent-gold mb-8 pb-8 border-b border-brand-accent-border">
          {blog.author && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {blog.author}
            </span>
          )}
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(blog.publishedAt)}
            </span>
          )}
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-brand-text-black/80 font-anaheim mb-8 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        {blog.content?.document && (
          <div className="prose prose-lg max-w-none">
            <DocumentRenderer
              document={blog.content.document}
              locale={locale}
            />
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-brand-accent-border">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-brand-accent-gold hover:text-brand-text-black transition-colors font-anaheim font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {locale === "zh" ? "返回博客列表" : "Back to Blog"}
          </Link>
        </div>
      </div>
    </article>
  )
}
