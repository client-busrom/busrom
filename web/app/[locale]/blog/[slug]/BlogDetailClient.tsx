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
          // If 404 or fail, check for Mock Data first
          const mockData = getMockBlog(slug, locale)
          if (mockData) {
            setBlog(mockData)
            return
          }
          
          if (res.status === 404) {
             throw new Error("Blog post not found")
          }
          throw new Error(`Failed to fetch blog: ${res.statusText}`)
        }

        const data = await res.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        // Fallback to Mock Data on ANY error
        const mockData = getMockBlog(slug, locale)
        if (mockData) {
           setBlog(mockData)
        } else {
           setError(err instanceof Error ? err.message : "Failed to load blog")
        }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-anaheim font-extrabold mb-4">
            {locale === "zh" ? "文章未找到" : "Blog Post Not Found"}
          </h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link href={`/${locale}/blog`} className="inline-block px-8 py-3 bg-black text-white rounded-full">
            {locale === "zh" ? "返回知识库" : "Back to Blog"}
          </Link>
        </div>
      </div>
    )
  }

  // Select Template Layout
  if (blog.templateType === 'template2') {
    return <BlogTemplateTwo blog={blog} locale={locale} formatDate={formatDate} />
  }
  
  if (blog.templateType === 'template3') {
    return <BlogTemplateThree blog={blog} locale={locale} formatDate={formatDate} />
  }

  // Default to template1
  return <BlogTemplateOne blog={blog} locale={locale} formatDate={formatDate} />
}

// ==================================================================
// MOCK DATA HELPER
// ==================================================================

function getMockBlog(slug: string, locale: string): BlogContent | null {
  const mocks: Record<string, any> = {
    'finding-balance-modern-reading': {
      templateType: 'template1',
      title: locale === 'zh' ? '寻找平衡：在忙碌的世界中优先考虑自我保健' : 'Finding Balance: Prioritizing Self-Care in a Busy World',
      author: 'Kathryn Jackson',
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: locale === 'zh' 
                ? '在当今快节奏且要求严苛的世界中，优先考虑自我保健对于维持平衡、管理压力和保护身心健康至关重要。' 
                : 'In today\'s fast-paced and demanding world, prioritizing self-care is essential for maintaining balance, managing stress, and preserving your well-being. Despite the pressures of work, family, and other responsibilities, finding time for self-care is crucial for overall health and happiness.' }]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: locale === 'zh' ? '理解自我保健' : 'Understanding Self-Care' }]
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: locale === 'zh'
                ? '自我保健涉及采取有意识的行动来滋养您的身体、心理和情感健康。'
                : 'Self-care involves taking intentional actions to nurture your physical, mental, and emotional well-being. It encompasses a wide range of activities, including exercise, relaxation, hobbies, socializing, and seeking support when needed.' }]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: locale === 'zh' ? '自我保健的重要性' : 'Importance of Self-Care' }]
            },
            {
              type: 'list',
              listType: 'bullet',
              children: [
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '压力管理：自我保健活动有助于降低压力水平。' : 'Stress Management: Self-care activities help reduce stress levels and promote relaxation.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '提高生产力：抽时间进行自我保健可以提高专注力。' : 'Enhanced Productivity: Taking time for self-care can improve focus, concentration, and productivity.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '改善人际关系：当你优先考虑自我保健时，你有更多的精力。' : 'Improved Relationships: When you prioritize self-care, you have more energy and resources to invest in your relationships.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '更好的身体健康：进行规律的锻炼。' : 'Better Physical Health: Engaging in regular exercise, healthy eating, and other practices improves physical health.' }] }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: locale === 'zh' ? '自我保健的实用策略' : 'Practical Strategies for Self-Care' }]
            },
            {
              type: 'list',
              listType: 'bullet',
              children: [
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '设定界限：学会拒绝那些耗尽你精力的活动。' : 'Set Boundaries: Learn to say no to activities or commitments that drain your energy.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '为爱好的活动腾出时间：安排规律的时间。' : 'Make Time for Activities You Enjoy: Schedule regular time for activities that bring you joy.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '练习正念：将冥想或深呼吸等正念练习融入日常。' : 'Practice Mindfulness: Incorporate mindfulness practices such as meditation or deep breathing.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '保证充足睡眠：通过建立规律的睡眠时间表。' : 'Get Enough Sleep: Prioritize quality sleep by establishing a regular sleep schedule.' }] },
                { type: 'listitem', children: [{ type: 'text', text: locale === 'zh' ? '寻求支持：需要时不要犹豫向朋友或家人寻求支持。' : 'Seek Support: Don\'t hesitate to reach out for support from friends, family, or professionals.' }] }
              ]
            },
            {
              type: 'blockquote',
              children: [{ type: 'text', text: locale === 'zh' 
                ? '“自我保健不是自私。它是在繁忙且充满要求的世界中维持平衡的关键。” - 未知' 
                : 'Self-care is not selfish. It\'s essential for maintaining balance, managing stress, and preserving your well-being in a busy and demanding world.' }]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: locale === 'zh' ? '结论' : 'Conclusion' }]
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: locale === 'zh'
                ? '在忙碌的世界中寻找平衡并优先考虑自我保健需要意愿、承诺和自我意识。通过将自我保健作为优先事项并将实用策略融入您的日常生活，您可以培养韧性、管理压力并呵护您的整体健康。请记住，自我保健不是奢侈品；它是过上健康、充实和平衡生活的必需品。'
                : 'Finding balance and prioritizing self-care in a busy world requires intention, commitment, and self-awareness. By making self-care a priority and incorporating practical strategies into your daily life, you can cultivate resilience, manage stress, and nurture your overall well-being. Remember that self-care is not a luxury; it\'s a necessity for living a healthy, fulfilling, and balanced life.' }]
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: locale === 'zh'
                ? '准备好在忙碌的世界中优先考虑自我保健并寻找平衡了吗？今天就开始实施这些策略，见证您的健康和幸福茁壮成长。'
                : 'Ready to prioritize self-care and find balance in your busy world? Start implementing these strategies today and watch as your health and happiness flourish.' }]
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: locale === 'zh' ? '欲了解更多关于自我保健和健康的提示，' : 'For more tips on self-care and well-being, ' },
                { 
                  type: 'link', 
                  fields: {
                    url: '#',
                    newTab: false,
                    linkType: 'custom'
                  },
                  children: [{ type: 'text', text: locale === 'zh' ? '请点击这里。' : 'click here.' }] 
                }
              ]
            }
          ]
        }
      }
    },
    'minimal-review-jules-style': {
      templateType: 'template2',
      title: locale === 'zh' ? '生活与质感：极简主义建筑五金评测' : 'Life & Texture: A Minimalist Architectural Hardware Review',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    },
    'corporate-heavy-reland-style': {
      templateType: 'template3',
      title: locale === 'zh' ? '跨国大中型项目的玻璃系统集成方案' : 'Integrated Glass Systems for Large-Scale Multinational Projects',
      coverImage: 'https://images.unsplash.com/photo-1449156059431-789995fd46cb?auto=format&fit=crop&q=80&w=800',
    }
  }

  const base = mocks[slug]
  if (!base) return null

  return {
    id: 'mock-id',
    slug,
    title: base.title,
    excerpt: locale === 'zh' 
      ? '这是这是一段演示性质的摘要内容，旨在展示在不同排版模板下文字的呼吸感与节奏。Busrom 始终坚持将技术与艺术完美融合。' 
      : 'This is a demonstration excerpt to showcase the breathing room and rhythm of text across different templates. Busrom always strives to blend technology with art.',
    author: base.author || 'Antigravity Demo',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: base.coverImage,
    categories: [{ id: 'c1', name: 'Demo' }],
    templateType: base.templateType,
    content: base.content || {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: locale === 'zh' ? '内容加载中...' : 'Loading Content...' }]
          }
        ]
      }
    },
    locale
  }
}
