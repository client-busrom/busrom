"use client"

import React, { useMemo, useState, useEffect } from "react"
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

function extractCustomGalleryAfterMarker(children: any[], markerId: string, mediaData: Record<string, MediaObject>, allApplications: any[] = []) {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const images: MediaObject[] = []

  function getAppImage(app: any) {
    if (!app) return null
    let appImage = app.mainImage
    if (!appImage && app.images?.length > 0) {
      appImage = app.images[0].image || app.images[0]
    }
    if (!appImage && app.sceneGallery?.length > 0) {
      const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
      if (firstGroup) {
        // In our API transformation, g.images is an array of already-normalized media objects
        appImage = firstGroup.images[0]
      }
    }
    if (!appImage) return null

    // If it's already a normalized object with a URL, return it directly
    if (typeof appImage === 'object' && appImage.url) {
      return appImage as MediaObject
    }

    const id = typeof appImage === 'object' ? appImage.id : String(appImage)
    return mediaData[id] || (typeof appImage === 'object' ? appImage : { id, url: "" })
  }

  function traverseAndExtract(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'custom-image-gallery' && node.data?.images) {
        const glry = node.data.images.map((img: any) => {
          if (img.sourceType === "application" && img.application) {
            const appId = typeof img.application === "object" ? img.application.id : String(img.application)
            const app = allApplications.find(a => String(a.id) === appId)
            return getAppImage(app)
          }
          const imageId = String(img.image?.id || img.image || "")
          return imageId && mediaData[imageId] ? mediaData[imageId] : null
        }).filter(Boolean)
        images.push(...glry)
      } else if (node.type === "block" && node.fields?.blockType === "imageGallery" && node.fields?.images) {
        const glry = node.fields.images.map((item: any) => {
          if (item.sourceType === "media" && item.image) {
            const imageId = String(item.image.id || item.image)
            return mediaData[imageId] || (typeof item.image === "object" ? item.image : null)
          } else if (item.sourceType === "application" && item.application) {
            const appId = typeof item.application === "object" ? item.application.id : String(item.application)
            const app = allApplications.find(a => String(a.id) === appId)
            return getAppImage(app)
          }
          return null
        }).filter(Boolean)
        images.push(...glry)
      } else if (node.type === "carousel" && node.data?.slides) {
        const glry = node.data.slides.map((slide: any) => {
          const imageId = String(slide.image?.id || slide.image || "")
          return imageId && mediaData[imageId] ? mediaData[imageId] : null
        }).filter(Boolean)
        images.push(...glry)
      } else if (node.type === "singleImage" && node.data?.image) {
         const imageId = String(node.data.image?.id || node.data.image || "")
         if (imageId && mediaData[imageId]) {
           images.push(mediaData[imageId])
         }
      } else if (node.type === "block" && node.fields?.blockType === "singleImage" && node.fields?.image) {
         const item = node.fields.image
         const imageId = String(item.id || item)
         if (imageId && mediaData[imageId]) {
           images.push(mediaData[imageId])
         }
      } else if (node.type === "upload" && node.value) {
         const imageId = String(node.value.id || node.value)
         if (imageId && mediaData[imageId]) {
           images.push(mediaData[imageId])
         }
      }

      // Check for nested layouts/columns block
      if (node.type === "layout" && node.columns) {
        node.columns.forEach((col: any) => {
          if (col.children) {
            traverseAndExtract(col.children)
          }
        })
      }
      
      // Standard Lexical children
      if (node.children) {
        traverseAndExtract(node.children)
      }
    }
  }

  traverseAndExtract(nodesAfterMarker)
  return images
}

// --------------------------------------------------------------------------
// Template Component
// --------------------------------------------------------------------------

export function OurStoryTemplate({ locale, pageContent }: OurStoryTemplateProps) {
  const [allApplications, setAllApplications] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/applications?locale=${locale}&limit=100`)
      .then(res => res.json())
      .then(data => setAllApplications(data.docs || []))
  }, [locale])

  const contentChildren = useMemo(() => 
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [],
    [pageContent]
  )
  const mediaData = pageContent.mediaData || {}

  // --------------------------------------------------------------------------
  // Global Helpers for OurStoryTemplate
  // --------------------------------------------------------------------------
  
  // Robust image resolver for Application or Media sources
  const resolveImage = useMemo(() => (source: any, sourceType: "application" | "media" = "media") => {
    if (!source) return null

    if (sourceType === "application") {
      const appId = typeof source === "object" ? source.id : String(source)
      const app = allApplications.find((a: any) => String(a.id) === appId)
      if (!app) return null

      // Check sceneGallery (Normalized by our /api/applications)
      const firstImage = app.sceneGallery?.[0]?.images?.[0]
      if (firstImage?.url) return firstImage as MediaObject
      
      // Check mainImage
      if (app.mainImage?.url) return app.mainImage as MediaObject
      return null
    }

    // Default: Media source
    const imageId = typeof source === "object" ? source.id : String(source)
    return mediaData[imageId] || (typeof source === "object" && source.url ? source : null)
  }, [allApplications, mediaData])

  // Helper to find specific block types within a major section, ignoring sub-markers
  const findBlocksInSection = useMemo(() => (sectionPrefix: string, blockTypes: string[]) => {
    const results: any[] = []
    let inSection = false

    for (const node of contentChildren) {
      const text = getNodeTotalText(node)
      const isMarker = (node.type === "code" || node.children?.[0]?.format === 16) && text.includes("-")
      
      if (isMarker && inSection && !text.startsWith(sectionPrefix)) break
      if (isMarker && text.startsWith(sectionPrefix)) inSection = true

      if (inSection) {
        const scanner = (n: any) => {
          if (blockTypes.includes(n.type)) results.push(n)
          if (n.type === "block" && blockTypes.includes(n.fields?.blockType)) results.push(n.fields)
          if (n.columns) n.columns.forEach((c: any) => c.children?.forEach(scanner))
          if (n.children) n.children.forEach(scanner)
        }
        scanner(node)
      }
    }
    return results
  }, [contentChildren])

  // Extract images from gallery/carousel/upload nodes using our robust resolver
  const extractImagesFromBlocks = useMemo(() => (blocks: any[]) => {
    const images: MediaObject[] = []
    blocks.forEach(node => {
      // 1. custom-image-gallery
      if (node.type === "custom-image-gallery" && node.data?.images) {
        const glry = node.data.images.map((img: any) => 
          resolveImage(img.application || img.image, img.sourceType || "media")
        ).filter(Boolean)
        images.push(...glry)
      }
      // 2. imageGallery block
      else if (node.blockType === "imageGallery" && node.images) {
        const glry = node.images.map((item: any) => 
          resolveImage(item.application || item.image, item.sourceType || "media")
        ).filter(Boolean)
        images.push(...glry)
      }
      // 3. carousel/carouselBlock
      else if ((node.type === "carousel" && node.data?.slides) || (node.blockType === "carousel" && node.slides)) {
        const slides = node.data?.slides || node.slides
        const glry = slides.map((s: any) => resolveImage(s.image, "media")).filter(Boolean)
        images.push(...glry)
      }
      // 4. singleImage
      else if ((node.type === "singleImage" && node.data?.image) || (node.blockType === "singleImage" && node.image)) {
        const img = resolveImage(node.data?.image || node.image, "media")
        if (img) images.push(img)
      }
    })
    return images
  }, [resolveImage])

  // --------------------------------------------------------------------------
  // Section Memos
  // --------------------------------------------------------------------------

  // Hero Section Data
  const heroData = useMemo(() => {
    const titleNodes = extractNodeChildrenAfterMarker(contentChildren, "hero-section-title")
    const subtitle = extractTextAfterMarker(contentChildren, "hero-section-subtitle") || "Make Projects"
    const content = extractTextAfterMarker(contentChildren, "hero-section-content") || ""
    const descriptionNodes = extractNodeChildrenAfterMarker(contentChildren, "hero-section-description")
    const items = extractListAfterMarker(contentChildren, "hero-section-item")
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
    
    const galleries = [
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-1", mediaData, allApplications),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-2", mediaData, allApplications),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-3", mediaData, allApplications),
      extractCustomGalleryAfterMarker(contentChildren, "brand-highlights-image-4", mediaData, allApplications),
    ]

    const slides = items.map((item: { title: string; content: string }, i: number) => ({
      ...item,
      images: (galleries[i] || []) as MediaObject[]
    }))

    return { title, slides }
  }, [contentChildren, mediaData, allApplications])

  // Brand Strengths Section Data
  const brandStrengthsData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "brand-strengths-title") || "Brand Strengths"
    const items = extractCarouselAfterMarker(contentChildren, "brand-strengths-item", mediaData)
    return { title, items }
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
    const sectionPrefix = "sustainable-commitment"
    const title = extractTextAfterMarker(contentChildren, `${sectionPrefix}-title`) || "Sustainable Commitment"
    const description = extractTextAfterMarker(contentChildren, `${sectionPrefix}-description`) || ""
    const content1 = extractTextAfterMarker(contentChildren, `${sectionPrefix}-content-1`) || ""
    const content2 = extractTextAfterMarker(contentChildren, `${sectionPrefix}-content-2`) || ""
    const tips = extractTextAfterMarker(contentChildren, `${sectionPrefix}-tips`) || "ABOUT BUSROM"

    // Use robust scanners for images/galleries
    const blocks = findBlocksInSection(sectionPrefix, ["custom-image-gallery", "block"])
    const images = extractImagesFromBlocks(blocks)

    return { title, description, images, content1, content2, tips }
  }, [contentChildren, findBlocksInSection, extractImagesFromBlocks])

  // Future Prospect Section Data
  const prospectData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "future-prospect-title") || "Future Prospect"
    const items = extractCarouselAfterMarker(contentChildren, "future-prospect-item", mediaData)
    const logoImage = extractImageAfterMarker(contentChildren, "future-prospect-logo-image", mediaData)
    const tips = extractTextAfterMarker(contentChildren, "future-prospect-tips") || "Our Vision"
    return { title, items, logoImage, tips }
  }, [contentChildren, mediaData])

  // Contact Form Section Data
  const contactFormData = useMemo(() => {
    const sectionPrefix = "contact-form"
    const subtitle = extractTextAfterMarker(contentChildren, `${sectionPrefix}-title`) || "Contact Us"
    const description = extractTextAfterMarker(contentChildren, "form-description") || ""

    const blocks = findBlocksInSection(sectionPrefix, ["custom-image-gallery", "block", "formBlock"])
    const images = extractImagesFromBlocks(blocks)
    const formBlock = blocks.find(b => b.blockType === "formBlock" || b.type === "formBlock")
    const formConfig = formBlock?.formConfig || formBlock?.data?.formConfig

    return {
      title: "Get A \nQuote",
      subtitle, 
      description,
      formConfig,
      images,
      locale
    }
  }, [contentChildren, findBlocksInSection, extractImagesFromBlocks, locale])

  // Applications Section Data
  // (allApplications + setAllApplications already declared at component top and fetched in useEffect above)

  // Extract applicationCarousel node to get application IDs
  const applicationsRawData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "applications-title") || "Applications"
    const titleNodes = extractNodeChildrenAfterMarker(contentChildren, "applications-title") || []
    const description = extractTextAfterMarker(contentChildren, "applications-description") || ""
    const descriptionNodes = extractNodeChildrenAfterMarker(contentChildren, "applications-description") || []
    // Extract linkJump component after applications-btn marker
    let viewButtonText = "View Cases Gallery Now"
    let viewButtonLink = ""
    let viewButtonNewTab = false
    const btnMarkerIdx = contentChildren.findIndex((n: any) => {
      const text = n.children?.map((c: any) => c.text || "").join("") || ""
      return text === "applications-btn"
    })
    if (btnMarkerIdx !== -1 && btnMarkerIdx + 1 < contentChildren.length) {
      const btnNode = contentChildren[btnMarkerIdx + 1]
      if (btnNode && btnNode.type === "linkJump" && btnNode.data) {
        viewButtonText = btnNode.data.description || btnNode.data.title || viewButtonText
        if (btnNode.data.url) {
          viewButtonLink = btnNode.data.url.replace('/pages/', '/')
        }
        viewButtonNewTab = !!btnNode.data.openInNewTab
      }
    }

    // Find the applicationCarousel node after applications-item marker
    let applicationIds: number[] = []
    const markerIdx = contentChildren.findIndex((n: any) => {
      const text = n.children?.map((c: any) => c.text || "").join("") || ""
      return text === "applications-item"
    })
    if (markerIdx !== -1) {
      for (let i = markerIdx + 1; i < contentChildren.length; i++) {
        const node = contentChildren[i]
        if (node.type === "applicationCarousel" && node.data?.applications) {
          applicationIds = node.data.applications.map((a: any) => a.id)
          break
        }
        // Stop if we hit a new section marker (quote)
        if (node.type === "quote" || node.type === "horizontalrule") break
      }
    }

    return { title, titleNodes, description, descriptionNodes, viewButtonText, viewButtonLink, viewButtonNewTab, applicationIds }
  }, [contentChildren])

  // Resolve application IDs to full data
  const applicationsData = useMemo(() => {
    const { title, titleNodes, description, descriptionNodes, viewButtonText, viewButtonLink, viewButtonNewTab, applicationIds } = applicationsRawData
    const slides = applicationIds.map((id: number) => {
      const app = allApplications.find((a: any) => String(a.id) === String(id))
      if (!app) return null

      // Image priority: mainImage -> sceneGallery first -> images first
      let appImage = app.mainImage
      if (!appImage && app.sceneGallery?.length > 0) {
        const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
        if (firstGroup) appImage = firstGroup.images[0]
      }
      if (!appImage && app.images?.length > 0) {
        appImage = app.images[0].image
      }

      return {
        id: app.id,
        title: app.title || app.name || "",
        image: appImage,
        description: app.subtitle || app.shortDescription || ""
      }
    }).filter(Boolean) as any[]

    return { title, titleNodes, description, descriptionNodes, viewButtonText, viewButtonLink, viewButtonNewTab, items: { slides, autoplay: true, interval: 5 } }
  }, [applicationsRawData, allApplications])

  // Quote Section Data (Modified to Carousel)
  const quoteData = useMemo(() => {
    let slides: any[] = []
    let autoplay = true
    let interval = 5

    const markerIdx = contentChildren.findIndex((n: any) => {
      const text = n.children?.map((c: any) => c.text || "").join("") || ""
      return text === "quote-item"
    })

    if (markerIdx !== -1) {
      for (let i = markerIdx + 1; i < contentChildren.length; i++) {
        const node = contentChildren[i]
        if (node.type === "carousel" && node.data?.slides) {
          autoplay = node.data.autoplay !== false
          interval = node.data.interval || 5
          slides = node.data.slides.map((slide: any) => {
            let slideImage = null
            if (slide.image?.id) {
              const mediaId = String(slide.image.id)
              slideImage = mediaData[mediaId] || null
            }

            return {
              title: slide.title || "",
              description: slide.description || "",
              buttonText: slide.buttonText || "",
              buttonLink: slide.buttonLink || slide.link || "",
              showButton: slide.showButton !== false,
              openInNewTab: slide.openInNewTab || false,
              image: slideImage
            }
          })
          break
        }
        if (node.type === "horizontalrule") break
      }
    }

    return { slides, autoplay, interval }
  }, [contentChildren, mediaData])

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
