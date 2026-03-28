"use client"

import React, { useMemo } from "react"
import { StoryHeroSection } from "@/components/story/StoryHeroSection"
import { StoryWhoWeAreSection } from "@/components/story/StoryWhoWeAreSection"
import { StoryBrandPositionSection } from "@/components/story/StoryBrandPositionSection"
import { StoryBrandStorySection } from "@/components/story/StoryBrandStorySection"
import { StoryBrandHighlightsSection } from "@/components/story/StoryBrandHighlightsSection"
import { StoryBrandStrengthsSection } from "@/components/story/StoryBrandStrengthsSection"
import { StoryBrandMilestonesSection } from "@/components/story/StoryBrandMilestonesSection"
import { StoryBrandSustainabilitySection } from "@/components/story/StoryBrandSustainabilitySection"
import { StoryBrandProspectSection } from "@/components/story/StoryBrandProspectSection"
import { StoryContactFormSection } from "@/components/story/StoryContactFormSection"
import { StoryApplicationsSection } from "@/components/story/StoryApplicationsSection"
import { StoryQuoteSection } from "@/components/story/StoryQuoteSection"

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
}

interface LexicalTextNode {
  text: string
  format?: number // 1 = Bold, etc.
  type: string
}

interface OurStoryTemplateProps {
  locale: string
  pageContent: {
    title: string
    content?: {
      root?: {
        children?: any[]
      }
    } | null
    contentTranslation?: {
      root?: {
        children?: any[]
      }
    } | null
    mediaData?: Record<string, MediaObject>
  }
}

// Helper: Recursively extract all text from a node or node list
function getNodeTotalText(node: any): string {
  if (!node) return ""
  if (Array.isArray(node)) return node.map(getNodeTotalText).join("")
  if (typeof node === "string") return node
  if (node.text) return node.text
  if (node.children) return getNodeTotalText(node.children)
  return ""
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false
  const result: any[] = []

  for (const node of children) {
    const totalText = getNodeTotalText(node)
    
    // Check for marker in Paragraph/Quote/Code block
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      totalText.includes(markerId)

    if (isMarkerBlock) {
      if (foundMarker) break // Stop on NEXT marker
      foundMarker = true
      continue
    }

    // Stop if we see a code-formatted block that looks like a DIFFERENT marker
    // (Only if we already found our marker)
    if (foundMarker && (node.children?.[0]?.format === 16 || node.type === "code") && totalText.includes("-") && !totalText.includes(markerId)) {
      break
    }

    if (foundMarker) {
      result.push(node)
    }
  }
  return result
}

// Find node after marker and return its children (for styled text)
function extractNodeChildrenAfterMarker(children: any[], markerId: string): any[] | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  return nodesAfterMarker.length > 0 ? nodesAfterMarker[0].children : null
}

function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  if (nodesAfterMarker.length === 0) return null
  
  return nodesAfterMarker
    .filter(node => node.type === "paragraph" || node.type === "heading" || node.type === "quote" || node.type === "list")
    .map(node => extractListItemText(node.children || [node])) // Handle list nodes which have children that are listitems
    .join("\n")
}

function extractListItemText(children: any[]): string {
  if (!children) return ""
  return children
    .map((child: any) => {
      if (child.type === "text") return child.text || ""
      if (child.type === "linebreak") return "\n"
      if (child.type === "paragraph" || child.type === "list" || child.type === "listitem") {
        return extractListItemText(child.children || [])
      }
      return ""
    })
    .join("")
}

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => extractListItemText(li.children))
    }
  }
  return []
}

function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  for (const node of nodesAfterMarker) {
    if (node.type === "singleImage" && node.data?.image) {
      const imageId = typeof node.data.image === "object" ? node.data.image.id : String(node.data.image || "")
      if (imageId && mediaData[imageId]) {
        return mediaData[imageId]
      }
    }
  }
  return null
}

// Helper to extract Carousel data (slides + settings)
function extractCarouselAfterMarker(children: any[], markerId: string, mediaData: Record<string, MediaObject>) {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  for (const node of nodesAfterMarker) {
    if (node.type === "carousel" && node.data?.slides) {
      const slides = node.data.slides.map((slide: any) => {
        const imageId = typeof slide.image === "object" ? slide.image.id : String(slide.image || "")
        return {
          title: slide.title || "",
          description: slide.description || slide.content || "",
          image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
          link: slide.link || slide.buttonLink || ""
        }
      })
      return {
        slides,
        autoplay: node.data.autoplay !== false,
        interval: node.data.autoplayInterval || 4000
      }
    }
  }
  return { slides: [], autoplay: false, interval: 4000 }
}

function extractPairedListAfterMarker(children: any[], markerId: string) {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      const listItems = node.children || []
      const pairs = []
      for (let i = 0; i < listItems.length; i += 2) {
        if (listItems[i]) {
          const title = extractListItemText(listItems[i].children || [])
          const content = listItems[i+1] ? extractListItemText(listItems[i+1].children || []) : ""
          pairs.push({ title, content })
        }
      }
      return pairs
    }
  }
  return []
}

function extractCustomGalleryAfterMarker(children: any[], markerId: string, mediaData: Record<string, MediaObject>) {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  for (const node of nodesAfterMarker) {
    if (node.type === 'custom-image-gallery' && node.data?.images) {
      return node.data.images.map((img: any) => {
        const imageId = String(img.image?.id || img.image || "")
        return imageId && mediaData[imageId] ? mediaData[imageId] : null
      }).filter(Boolean)
    }
  }
  return []
}

// --------------------------------------------------------------------------
// Template Component
// --------------------------------------------------------------------------

export function OurStoryTemplate({ locale, pageContent }: OurStoryTemplateProps) {
  const contentChildren = useMemo(() => 
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [],
    [pageContent]
  )
  const mediaData = pageContent.mediaData || {}

  // Hero Section Data
  const heroData = useMemo(() => {
    // 1. Text for hero-section-title (with bold parsing)
    const titleNodes = extractNodeChildrenAfterMarker(contentChildren, "hero-section-title")
    
    // 2. Subtitle 
    const subtitle = extractTextAfterMarker(contentChildren, "hero-section-subtitle") || "Make Projects"
    
    // 3. Content
    const content = extractTextAfterMarker(contentChildren, "hero-section-content") || ""
    
    // 4. Description styled nodes
    const descriptionNodes = extractNodeChildrenAfterMarker(contentChildren, "hero-section-description")
    
    // 5. Items (Ordered List)
    const items = extractListAfterMarker(contentChildren, "hero-section-item")
    
    // 6. Image
    const backgroundImage = extractImageAfterMarker(contentChildren, "hero-section-image", mediaData)

    return {
      titleNodes,
      subtitle,
      content,
      descriptionNodes,
      items,
      heroImage: backgroundImage?.url || "/BusromFooterBg_original.webp"
    }
  }, [contentChildren, mediaData])

  // Who We Are Section Data
  const whoWeAreData = useMemo(() => {
    const titleNodes = extractNodeChildrenAfterMarker(contentChildren, "who-we-are-title")
    const content = extractTextAfterMarker(contentChildren, "who-we-are-content") || ""
    const description = extractTextAfterMarker(contentChildren, "who-we-are-description") || 
                        extractTextAfterMarker(contentChildren, "who-we-are-descripition") || ""
    const backgroundImage = extractImageAfterMarker(contentChildren, "who-we-are-bg-image", mediaData)

    return {
      titleNodes,
      content,
      description,
      bgImage: backgroundImage?.url || "/BusromFooterBg_original.webp"
    }
  }, [contentChildren, mediaData])

  // Brand Position Section Data
  const brandPositionData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-position-title") || "Brand Positioning"
    const subtitle = extractTextAfterMarker(contentChildren, "brand-position-subtitle") || "BRAND Philosophy"
    const description = extractTextAfterMarker(contentChildren, "brand-position-description") || ""
    // Use the new Carousel extractor
    const items = extractCarouselAfterMarker(contentChildren, "brand-position-item", mediaData)
    const image = extractImageAfterMarker(contentChildren, "brand-position-image", mediaData)

    return {
      titleGraphic: "/assets/our-story/HtKNi.png",
      title,
      subtitle,
      description,
      items,
      image: image?.url || "/BusromFooterBg_original.webp"
    }
  }, [contentChildren, mediaData])

  // Brand Story Section Data
  const brandStoryData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-story-title") || "Brand Story"
    const subtitle = extractTextAfterMarker(contentChildren, "brand-story-subtitle") || "Busrom"
    const bgTextTop = extractTextAfterMarker(contentChildren, "brand-story-bg-text-top") || "HISTORY"
    const bgTextBottom = extractTextAfterMarker(contentChildren, "brand-story-bg-text-bottom") || "STORY"
    const items = extractCarouselAfterMarker(contentChildren, "brand-story-item", mediaData)
    const image = extractImageAfterMarker(contentChildren, "brand-story-bg-image", mediaData)

    return {
      title,
      subtitle,
      bgTextTop,
      bgTextBottom,
      items,
      bgImage: image?.url || "/BusromFooterBg_original.webp"
    }
  }, [contentChildren, mediaData])

  // Brand Highlights Section Data
  const brandHighlightsData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-highlights-title") || "Brand Highlights"
    const items = extractPairedListAfterMarker(contentChildren, "brand-highlights-item")
    
    // Extract images for each item (max 4 items supported by design)
    const galleries = [
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-1", mediaData),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-2", mediaData),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-3", mediaData),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-4", mediaData),
    ]

    // Merge nested list data with images
    const slides = items.map((item: { title: string; content: string }, i: number) => ({
      ...item,
      images: (galleries[i] || []) as MediaObject[]
    }))

    return {
      title,
      slides
    }
  }, [contentChildren, mediaData])

  // Brand Strengths Section Data
  const brandStrengthsData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-strengths-title") || "Brand Strengths"
    const items = extractCarouselAfterMarker(contentChildren, "brand-strengths-item", mediaData)

    return {
      title,
      items
    }
  }, [contentChildren, mediaData])

  // Brand Travel Section Data
  const brandTravelData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-travel-title") || "Brand Journey"
    const image = extractImageAfterMarker(contentChildren, "brand-travel-image", mediaData)
    const items = extractCarouselAfterMarker(contentChildren, "brand-travel-item", mediaData)

    return {
      title,
      image: image?.url || "/BusromFooterBg_original.webp",
      items: items.slides
    }
  }, [contentChildren, mediaData])

  // Sustainability Section Data
  const sustainabilityData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "sustainable-commitment-title") || "Sustainable Commitment"
    const description = extractTextAfterMarker(contentChildren, "sustainable-commitment-description") || ""
    const images = extractCustomGalleryAfterMarker(contentChildren, "sustainable-commitment-image", mediaData)
    const content1 = extractTextAfterMarker(contentChildren, "sustainable-commitment-content-1") || "Manufacturing For The Future — Durable & Low Carbon Production"
    const content2 = extractTextAfterMarker(contentChildren, "sustainable-commitment-content-2") || "Delivering Traceable Quality Assurance and Sustainable Solution"
    const tips = extractTextAfterMarker(contentChildren, "sustainable-commitment-tips") || "ABOUT BUSROM"

    return {
      title,
      description,
      images,
      content1,
      content2,
      tips
    }
  }, [contentChildren, mediaData])

  // Future Prospect Section Data
  const prospectData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "future-prospect-title") || "Future Prospect"
    const items = extractCarouselAfterMarker(contentChildren, "future-prospect-item", mediaData)
    const logoImage = extractImageAfterMarker(contentChildren, "future-prospect-logo-image", mediaData)
    const tips = extractTextAfterMarker(contentChildren, "future-prospect-tips") || "Our Vision"

    return {
      title,
      items,
      logoImage,
      tips
    }
  }, [contentChildren, mediaData])

  // Contact Form Section Data
  const contactFormData = useMemo(() => {
    // Basic texts
    const subtitle = extractTextAfterMarker(contentChildren, "contact-form-title") || "Contact Us"
    const description = extractTextAfterMarker(contentChildren, "form-description") || ""

    // Contact form images
    const images = extractCustomGalleryAfterMarker(contentChildren, "contact-form-image", mediaData)

    // Form config
    let formConfig = null
    const formNodes = extractAfterMarker(contentChildren, "contact-form-title")
    for (const node of formNodes) {
      if (node.type === "formBlock" && node.data?.formConfig) {
        formConfig = node.data.formConfig
        break
      }
    }

    // Attempt to fall back to the generic `contact-form` block strategy if formBlock isn't found
    if (!formConfig) {
      const nodesAfterForm = extractAfterMarker(contentChildren, "contact-form")
      for (const node of nodesAfterForm) {
        if (node.type === "block" && node.fields) {
           const blockSidebar = node.fields.sidebarContent?.root?.children || []
           for (const sidebarNode of blockSidebar) {
             if (sidebarNode.type === "formBlock" && sidebarNode.data?.formConfig) {
               formConfig = sidebarNode.data.formConfig
               break
             }
           }
        }
      }
    }

    return {
      title: "Get A \nQuote", // Default multi-line title from Pencil design
      subtitle, 
      description,
      formConfig,
      images,
      locale
    }
  }, [contentChildren, mediaData, locale])

  // Applications Section Data
  const applicationsData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "applications-title") || "Applications"
    const description = extractTextAfterMarker(contentChildren, "applications-description") || ""
    const items = extractCarouselAfterMarker(contentChildren, "applications-item", mediaData)

    return {
      title,
      description,
      items
    }
  }, [contentChildren, mediaData])

  // Quote Section Data
  const quoteData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "quote-item-title") || "One-stop Shop"
    const description = extractTextAfterMarker(contentChildren, "quote-item-description") || ""
    const buttonText = extractTextAfterMarker(contentChildren, "quote-item-btn") || "Learn More"

    return {
      title,
      description,
      buttonText
    }
  }, [contentChildren])

  return (
    <div className="min-h-screen bg-black" data-header-theme="dark">
      <StoryHeroSection data={heroData} />
      <StoryWhoWeAreSection data={whoWeAreData} />
      <div className="mt-[-1px]">
        <StoryBrandPositionSection data={brandPositionData} />
      </div>
      <StoryBrandStorySection data={brandStoryData} />
      <StoryBrandHighlightsSection data={brandHighlightsData} />
      <StoryBrandStrengthsSection data={brandStrengthsData} />
      <StoryBrandMilestonesSection data={brandTravelData} />
      <StoryBrandSustainabilitySection data={sustainabilityData} />
      <StoryBrandProspectSection data={prospectData} />
      <StoryContactFormSection data={contactFormData} />
      <StoryApplicationsSection data={applicationsData} />
      <StoryQuoteSection data={quoteData} />
    </div>
  )
}
