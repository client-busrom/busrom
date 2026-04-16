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
}

export function BlogDetailClient({ locale, slug }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 1. Fetch Blog
        const blogRes = await fetch(`/api/blog/${slug}?locale=${locale}`)
        let blogData = null
        if (blogRes.ok) {
          blogData = await blogRes.json()
        } else {
          blogData = getMockBlog(slug, locale)
        }

        // 2. Fetch Settings (Increase depth to 2 to get post/category details)
        const configRes = await fetch(`/api/payload/globals/knowledge-base-settings?locale=${locale}&depth=2`)
        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig(configData)
        }

        if (blogData) {
          setBlog(blogData)
        } else {
          setError("Blog post not found")
        }
      } catch (err) {
        console.error("Error fetching blog data:", err)
        setError("Failed to load blog data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [locale, slug])

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
          <h1 className="text-3xl font-serif text-[#474642] mb-4">
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

function getMockBlog(slug: string, locale: string): BlogContent | null {
  const mocks: Record<string, any> = {
    'minimal-review-jules-style': {
      id: 'jules-style',
      title: 'Full Kitchen Tour | Intentional Organization, Design Inspo, & Favorite Products',
      author: 'Jules Acree',
      publishedAt: '2023-07-15T12:00:00Z',
      categories: [{ name: 'Mindful Home' }],
      templateType: 'template2',
      coverImage: 'https://images.unsplash.com/photo-1556911220-e1502434938a?auto=format&fit=crop&q=80&w=1600',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Welcome to my kitchen! I’m excited to dive in and do a full on, in-depth kitchen tour today.', version: 1 }
              ],
              version: 1
            }
          ]
        }
      }
    },
    'modern-architecture-reland-style': {
      id: 'reland-style',
      title: 'The Future of Modern Architecture: Reland\'s Innovative Approach',
      author: 'S. Thompson',
      publishedAt: '2024-03-20T10:00:00Z',
      categories: [{ name: 'Architecture' }],
      templateType: 'template3',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Reland represents a shift in modern corporate identity. We don\'t just build spaces; we cultivate environments where ideas can breathe and structures can evolve.', version: 1 }
              ],
              version: 1
            }
          ]
        }
      }
    }
  }

  const base = mocks[slug]
  if (!base) return null

  return {
    id: 'mock-id',
    slug,
    title: base.title,
    excerpt: 'Kitchen tour demonstration content showing intentional organization and design inspiration.',
    author: base.author,
    status: 'published',
    publishedAt: base.publishedAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: base.coverImage,
    categories: base.categories,
    templateType: base.templateType,
    content: base.content,
    locale
  }
}
