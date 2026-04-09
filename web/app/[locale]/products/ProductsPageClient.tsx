"use client"

import { useState, useEffect, useMemo } from "react"
import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import { Applications } from "@/components/product-series/Applications"

interface PageContent {
  id: string
  slug: string
  path: string
  pageType: string
  template: string
  title: string
  status: string
  content: {
    document: any[]
    root?: {
      children: any[]
    }
  }
  mediaData?: any[]
  locale: string
}

interface ProductsPageClientProps {
  locale: Locale
  pageId: string
}

export function ProductsPageClient({ locale, pageId }: ProductsPageClientProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch page by slug
        const res = await fetch(`/api/pages/products?locale=${locale}`)

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
  }, [locale])

  // Parse sections and media mapping
  const { sections, mediaMap } = useMemo(() => {
    const nodes = pageContent?.content?.root?.children || pageContent?.content?.document || []
    const sectionsMap = new Map<string, any[]>()
    
    if (nodes.length === 0) return { sections: sectionsMap, mediaMap: new Map() }
    
    let currentSection: string | null = null
    let currentNodes: any[] = []

    // Build media map for fast lookups
    const mMap = new Map()
    if (pageContent?.mediaData) {
      pageContent.mediaData.forEach((m: any) => mMap.set(String(m.id), m.url))
    }

    for (const node of nodes) {
      if (node.type === 'quote') {
        const text = node.children?.[0]?.text?.trim()
        if (text) {
          if (currentSection) sectionsMap.set(currentSection, currentNodes)
          currentSection = text
          currentNodes = []
          continue
        }
      }
      currentNodes.push(node)
    }
    if (currentSection) sectionsMap.set(currentSection, currentNodes)

    return { sections: sectionsMap, mediaMap: mMap }
  }, [pageContent])

  // Specialized Applications Parser (Fixed Images from Carousel)
  const applicationsData = useMemo(() => {
    if (!sections.has('applications')) return null
    const nodes = sections.get('applications') || []
    const images: string[] = []
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const text = node.children?.[0]?.text?.trim()
      
      // Look for the sentinel
      if (node.type === 'paragraph' && text === 'applications-item') {
        const nextNode = nodes[i + 1]
        // Extract fixed images from carousel slides
        if (nextNode?.type === 'carousel' && nextNode.data?.slides) {
          nextNode.data.slides.forEach((slide: any) => {
            const id = slide.image?.id || slide.image
            if (id) {
              const url = mediaMap.get(String(id)) || `/api/media/${id}`
              images.push(url)
            }
          })
        }
      }
    }
    return images.length > 0 ? { images } : null
  }, [sections, mediaMap])

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

  // Render page content
  return (
    <div className="min-h-screen bg-background pt-20" data-header-theme="light">
      <div className="container mx-auto px-6 md:px-8 lg:px-16 py-12">
        {/* Page Title */}
        {pageContent.title && (
          <h1 className="text-4xl md:text-5xl font-anaheim font-extrabold text-brand-text-black mb-8">
            {pageContent.title}
          </h1>
        )}

        {/* Sectional Rendering */}
        {sections.size > 0 ? (
          Array.from(sections.keys()).map((sectionId, idx) => {
            // Specialized Application Handling
            if (sectionId === 'applications' && applicationsData) {
              return (
                <div key={idx} className="my-12 -mx-6 md:-mx-8 lg:-mx-16">
                  <Applications data={applicationsData} />
                </div>
              )
            }

            // Standard Lexical Rendering for other sections
            const sectionNodes = sections.get(sectionId) || []
            return (
              <div key={idx} className="mb-12">
                <LexicalRenderer
                  content={{ root: { children: sectionNodes, type: 'root', format: '', indent: 0, version: 1 } }}
                  className="prose prose-lg max-w-none"
                />
              </div>
            )
          })
        ) : (
          /* Fallback for unsectioned content */
          pageContent.content && (
            <LexicalRenderer
              content={pageContent.content}
              className="prose prose-lg max-w-none"
            />
          )
        )}
      </div>
    </div>
  )
}
