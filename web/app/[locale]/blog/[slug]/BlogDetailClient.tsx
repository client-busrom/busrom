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
          const mockData = getMockBlog(slug, locale)
          if (mockData) {
            setBlog(mockData)
            return
          }
          if (res.status === 404) throw new Error("Blog post not found")
          throw new Error(`Failed to fetch blog: ${res.statusText}`)
        }
        const data = await res.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        const mockData = getMockBlog(slug, locale)
        if (mockData) setBlog(mockData)
        else setError(err instanceof Error ? err.message : "Failed to load blog")
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
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
    return <BlogTemplateTwo blog={blog} locale={locale} formatDate={formatDate} />
  }
  
  if (blog.templateType === 'template3') {
    return <BlogTemplateThree blog={blog} locale={locale} formatDate={formatDate} />
  }

  return <BlogTemplateOne blog={blog} locale={locale} formatDate={formatDate} />
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
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'I will walk you through everything from the custom woodworking, my favorite appliances, my coffee and matcha corner, and speak more on the decor and choices we made to bring the space to life. I\'ll be sure to link* as much as I can below! (*may contain affiliate links)', version: 1 }
              ],
              version: 1
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Be sure to watch the full video to catch all of the deets!', version: 1 }
              ],
              version: 1
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                { type: 'text', text: 'Island', version: 1 }
              ],
              version: 1,
              direction: 'ltr'
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'First we\'ll start with the island. I really love our island. It fits four people comfortably and we customized it to warm up the space.', version: 1 }
              ],
              version: 1
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Custom Woodworking:', bold: true, $: { color: 'brand-secondary' }, version: 1 },
                { type: 'text', text: ' When we first moved into the house, the island was white drywall. We knew that we wanted to add wood to help add some depth to the kitchen and ground the space a little bit more. We ended up finding a woodworker here in Austin and we installed white oak panels around the entire thing.', version: 1 }
              ],
              version: 1
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                { type: 'text', text: 'The Fridge', version: 1 }
              ],
              version: 1,
              direction: 'ltr'
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Fridge Drawer:', bold: true, $: { color: 'brand-secondary' }, version: 1 },
                { type: 'text', text: ' We decided to go with the Dacor brand for all of our appliances. The fridge has been a game-changer with its flex-zone drawer where I keep all of our favorite beverages and snacks organized and within reach.', version: 1 }
              ],
              version: 1
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                { type: 'text', text: 'Coffee & Matcha Corner', version: 1 }
              ],
              version: 1,
              direction: 'ltr'
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'It wouldn\'t be a kitchen tour without showing my favorite nook. This is where I start every morning. I love having everything in one place, from the espresso machine to my favorite matcha bowls.', version: 1 }
              ],
              version: 1
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                { type: 'text', text: 'Dining Area', version: 1 }
              ],
              version: 1,
              direction: 'ltr'
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Dining Table:', bold: true, $: { color: 'brand-secondary' }, version: 1 },
                { type: 'text', text: ' This is where we host most of our friends. It fits 8 people comfortably and the light fixture above adds that cozy, intentional touch to every meal.', version: 1 }
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
