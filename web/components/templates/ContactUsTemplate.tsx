"use client"

import React, { useMemo } from "react"
import { ContactHeroSection } from "@/components/contact/ContactHeroSection"
import { SupportNarrativeSection, SupportCardData } from "@/components/contact/SupportNarrativeSection"
import { ProductSeriesEntrySection, ProductSeriesItem } from "@/components/contact/ProductSeriesEntrySection"

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
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface ContactUsTemplateProps {
  locale: string
  pageContent: {
    title: string
    content?: {
      root?: {
        children?: any[]
      }
      document?: any[]
    } | null
    contentTranslation?: {
      root?: {
        children?: any[]
      }
    } | null
    mediaData?: Record<string, MediaObject>
  }
}

// Helper function to extract data after a specific marker
function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false
  const result: any[] = []

  for (const node of children) {
    // Look for paragraph or quote with marker text
    if (node.type === "paragraph" || node.type === "quote") {
      const text = node.children?.[0]?.text || ""
      if (text === markerId) {
        foundMarker = true
        continue
      }
      // If we find a new marker, stop
      if (foundMarker && node.children?.[0]?.format === 16 && text.includes("-")) {
        break
      }
    }

    if (foundMarker) {
      result.push(node)
    }
  }

  return result
}

// Helper function to extract single image after a marker
function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "singleImage" && node.data?.image) {
      const image = node.data.image
      const imageId = typeof image === "string" ? image : image?.id
      if (imageId && mediaData[imageId]) {
        return mediaData[imageId]
      }
    }
  }
  return null
}

// Helper function to extract text after a marker (for descriptions)
// 支持 shift+enter 换行 (linebreak 节点)
function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let text = ""
      for (const child of node.children) {
        if (child.type === "linebreak") {
          text += "\n"
        } else if (child.text !== undefined) {
          text += child.text
        }
      }
      if (text.trim()) return text
    }
  }
  return null
}

// 提取带格式的文本，返回 { text, superscript }
// format: 64 是上标
function extractTextWithFormatAfterMarker(children: any[], markerId: string): { text: string; superscript: string | null } {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let text = ""
      let superscript: string | null = null
      for (const child of node.children) {
        if (child.type === "linebreak") {
          text += "\n"
        } else if (child.text !== undefined) {
          // format 64 是上标
          if (child.format === 64) {
            superscript = child.text
          } else {
            text += child.text
          }
        }
      }
      // 保留换行符，只去掉首尾空格
      const trimmedText = text.replace(/^[ \t]+|[ \t]+$/gm, "").trim()
      if (trimmedText) return { text: trimmedText, superscript }
    }
  }
  return { text: "", superscript: null }
}

// 提取右侧标题，分离加粗部分（镂空）和普通部分（实心）
// format: 1 是加粗，linebreak 之后的是普通文本
function extractTitleRightAfterMarker(children: any[], markerId: string): { boldText: string; normalText: string } {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let boldText = ""
      let normalText = ""
      let foundLinebreak = false

      for (const child of node.children) {
        if (child.type === "linebreak") {
          foundLinebreak = true
        } else if (child.text !== undefined) {
          if (foundLinebreak) {
            // linebreak 之后的都是普通文本
            normalText += child.text
          } else if ((child.format & 1) === 1) {
            // linebreak 之前的加粗文本
            boldText += child.text
          }
          // 忽略 linebreak 之前的非加粗文本（如空格）
        }
      }
      return { boldText: boldText.trim(), normalText: normalText.trim() }
    }
  }
  return { boldText: "", normalText: "" }
}

export function ContactUsTemplate({ locale, pageContent }: ContactUsTemplateProps) {
  // API transforms contentTranslation to content, so check both
  const contentChildren = useMemo(() =>
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [],
    [pageContent]
  )

  const mediaData = pageContent.mediaData || {}

  // Extract Hero section data
  const heroData = useMemo(() => {
    const heroImage = extractImageAfterMarker(contentChildren, "business-hero-image", mediaData)
    const subtitle = extractTextAfterMarker(contentChildren, "business-hero-subtitle")
    const buttonText = extractTextAfterMarker(contentChildren, "business-hero-button-text")
    const buttonLink = extractTextAfterMarker(contentChildren, "business-hero-button-link")

    return {
      heroImage,
      subtitle,
      buttonText,
      buttonLink,
    }
  }, [contentChildren, mediaData])

  // Extract Support Narrative section data
  const supportNarrativeData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "support-narrative-title")
    const nodesAfterMarker = extractAfterMarker(contentChildren, "support-narrative-item")
    const cards: SupportCardData[] = []

    for (const node of nodesAfterMarker) {
      // 有序列表
      if (node.type === "list" && node.children) {
        for (const listItem of node.children) {
          if (listItem.type === "listitem" && listItem.children) {
            let text = ""
            for (const child of listItem.children) {
              if (child.text) {
                text += child.text
              }
              // 处理软换行 (shift+enter 在Lexical中是 linebreak)
              if (child.type === "linebreak") {
                text += "\n"
              }
            }
            if (text.trim()) {
              cards.push({
                id: cards.length + 1,
                title: text,
              })
            }
          }
        }
      }
    }

    return { title, cards }
  }, [contentChildren])

  // Extract Product Series Entry section data
  const productSeriesData = useMemo(() => {
    const titleLeftData = extractTextWithFormatAfterMarker(contentChildren, "product-series-entry-title-left")
    const titleLeft = titleLeftData.text
    const titleLeftSuperscript = titleLeftData.superscript
    const titleRightData = extractTitleRightAfterMarker(contentChildren, "product-series-entry-title-right")
    const titleRightBold = titleRightData.boldText
    const titleRightNormal = titleRightData.normalText
    const nodesAfterMarker = extractAfterMarker(contentChildren, "product-series-entry-item")
    const products: ProductSeriesItem[] = []

    for (const node of nodesAfterMarker) {
      // carousel 轮播图块
      if (node.type === "carousel" && node.data?.slides) {
        for (const slide of node.data.slides) {
          const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id
          products.push({
            id: products.length + 1,
            title: slide.title || "",
            image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
            link: slide.buttonLink || slide.link || undefined,
            buttonText: slide.buttonText || "",
          })
        }
      }
    }

    return { titleLeft, titleLeftSuperscript, titleRightBold, titleRightNormal, products }
  }, [contentChildren, mediaData])

  return (
    <div className="min-h-screen bg-background" data-header-theme="dark">
      {/* Hero Section */}
      <ContactHeroSection
        buttonText={heroData.buttonText || "Get A Quote"}
        buttonLink={heroData.buttonLink || "#contact-form"}
        heroImage={heroData.heroImage}
        subtitle={heroData.subtitle || undefined}
      />

      {/* Support Narrative Section */}
      <SupportNarrativeSection
        title={supportNarrativeData.title || undefined}
        cards={supportNarrativeData.cards}
      />

      {/* Product Series Entry Section */}
      <ProductSeriesEntrySection
        titleLeft={productSeriesData.titleLeft || undefined}
        titleLeftSuperscript={productSeriesData.titleLeftSuperscript || undefined}
        titleRightBold={productSeriesData.titleRightBold || undefined}
        titleRightNormal={productSeriesData.titleRightNormal || undefined}
        products={productSeriesData.products}
      />

      {/* Contact Form Section will be added later */}
      <div id="contact-form" className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-20">
          <h2 className="text-4xl font-anaheim font-bold text-brand-text-black mb-4">
            Contact Form Section
          </h2>
          <p className="text-brand-accent-gold">Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
