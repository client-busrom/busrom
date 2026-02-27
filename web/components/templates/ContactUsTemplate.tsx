"use client"

import React, { useMemo, useState, useEffect } from "react"
import { ContactHeroSection } from "@/components/contact/ContactHeroSection"
import { SupportNarrativeSection, SupportCardData } from "@/components/contact/SupportNarrativeSection"
import { ProductSeriesEntrySection, ProductSeriesItem } from "@/components/contact/ProductSeriesEntrySection"
import { ProjectCommunicationGuideSection } from "@/components/contact/ProjectCommunicationGuideSection"
import { KeyValuesCooperationSection, KeyValuesCooperationItem } from "@/components/contact/KeyValuesCooperationSection"
import { TypicalCollaborationSection, TypicalCollaborationItem } from "@/components/contact/TypicalCollaborationSection"
import { CooperationProcessSection, CooperationProcessStep } from "@/components/contact/CooperationProcessSection"
import { ContactFormSection } from "@/components/contact/ContactFormSection"
import { ProductShowSection, ProductShowItem } from "@/components/contact/ProductShowSection"
import { QuoteImageSection } from "@/components/contact/QuoteImageSection"

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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
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
      const imageId = typeof image === "object" && image ? image.id : String(image || "")
      if (imageId && mediaData[imageId]) {
        const mediaObj = { ...mediaData[imageId] }
        if (node.data.enableLink) {
          mediaObj.enableLink = true
          mediaObj.linkUrl = node.data.linkUrl
          mediaObj.openInNewTab = node.data.openInNewTab
        }
        return mediaObj
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

// 提取带加粗格式的文本片段
// format: 1 是加粗
interface TextSegment {
  text: string
  bold?: boolean
}

function extractSegmentsAfterMarker(children: any[], markerId: string): TextSegment[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      const segments: TextSegment[] = []
      for (const child of node.children) {
        if (child.type === "linebreak") {
          // 换行作为普通文本
          if (segments.length > 0) {
            segments[segments.length - 1].text += "\n"
          }
        } else if (child.text !== undefined) {
          // format: 1 是加粗
          const isBold = child.format === 1
          segments.push({ text: child.text, bold: isBold })
        }
      }
      if (segments.length > 0) return segments
    }
  }
  return []
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

// 提取带加粗标记的文本，将加粗部分用 **text** 包裹
// format: 1 是加粗
function extractTextWithBoldMarkers(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let result = ""
      for (const child of node.children) {
        if (child.type === "linebreak") {
          result += "\n"
        } else if (child.text !== undefined) {
          // format 1 是加粗
          if ((child.format & 1) === 1) {
            result += `**${child.text}**`
          } else {
            result += child.text
          }
        }
      }
      if (result.trim()) return result
    }
  }
  return null
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

  // Extract Project Communication Guide section data
  const projectGuideData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "project-communication-guide-title")
    const subtitle = extractTextWithBoldMarkers(contentChildren, "project-communication-guide-subtitle")
    const description = extractTextWithBoldMarkers(contentChildren, "project-communication-guide-description")
    const image = extractImageAfterMarker(contentChildren, "project-communication-guide-image", mediaData)

    return { title, subtitle, description, image }
  }, [contentChildren, mediaData])

  // Extract Key Values Cooperation section data
  const keyValuesData = useMemo(() => {
    const label = extractTextAfterMarker(contentChildren, "key-values-cooperation-label")
    const nodesAfterItemMarker = extractAfterMarker(contentChildren, "key-values-cooperation-item")
    const nodesAfterImageMarker = extractAfterMarker(contentChildren, "key-values-cooperation-image")

    // 提取图片列表
    const images: (MediaObject | null)[] = []
    for (const node of nodesAfterImageMarker) {
      // 单张图片
      if (node.type === "singleImage" && node.data?.image) {
        const image = node.data.image
        const imageId = typeof image === "object" && image ? image.id : String(image || "")
        if (imageId && mediaData[imageId]) {
          const mediaObj = { ...mediaData[imageId] }
          if (node.data.enableLink) {
            mediaObj.enableLink = true
            mediaObj.linkUrl = node.data.linkUrl
            mediaObj.openInNewTab = node.data.openInNewTab
          }
          images.push(mediaObj)
        }
      }
      // 自定义图片画廊
      if (node.type === "custom-image-gallery" && node.data?.images) {
        for (const galleryItem of node.data.images) {
          const imageId = typeof galleryItem?.image === "object" && galleryItem.image ? galleryItem.image.id : String(galleryItem?.image || "")
          if (imageId && mediaData[imageId]) {
            const mediaObj = { ...mediaData[imageId] }
            if (galleryItem.enableLink) {
              mediaObj.enableLink = true
              mediaObj.linkUrl = galleryItem.linkUrl
              mediaObj.openInNewTab = galleryItem.openInNewTab
            }
            images.push(mediaObj)
          }
        }
      }
    }

    // 提取轮播项目（有序列表）
    // 数据结构：每个item分成两个listitem，一个是标题（带link），下一个是要点列表（嵌套list）
    const items: KeyValuesCooperationItem[] = []
    for (const node of nodesAfterItemMarker) {
      if (node.type === "list" && node.children) {
        let currentItem: { title: string; link: string; points: string[] } | null = null

        for (const listItem of node.children) {
          if (listItem.type === "listitem" && listItem.children) {
            const firstChild = listItem.children[0]

            // 检查是否是标题（带 link）
            if (firstChild?.type === "link") {
              // 如果有之前的item，先保存
              if (currentItem) {
                const itemIndex = items.length
                const itemImages = images.slice(itemIndex * 2, itemIndex * 2 + 2)
                items.push({
                  id: items.length + 1,
                  title: currentItem.title,
                  link: currentItem.link || undefined,
                  images: [itemImages[0] || null, itemImages[1] || null],
                  points: currentItem.points.slice(0, 3),
                })
              }

              // 开始新的item
              let title = ""
              for (const textChild of firstChild.children || []) {
                if (textChild.text) {
                  title += textChild.text
                }
              }

              // 提取链接 - 支持 internal link (doc.value.path) 或 external link (url)
              let link = ""
              if (firstChild.fields?.linkType === "internal" && firstChild.fields?.doc?.value?.path) {
                link = firstChild.fields.doc.value.path
              } else if (firstChild.fields?.url) {
                link = firstChild.fields.url
              }

              currentItem = { title: title.trim(), link, points: [] }
            }
            // 检查是否是嵌套列表（要点）
            else if (firstChild?.type === "list" && currentItem) {
              for (const nestedItem of firstChild.children || []) {
                if (nestedItem.type === "listitem" && nestedItem.children) {
                  let pointText = ""
                  for (const pointChild of nestedItem.children) {
                    if (pointChild.text) {
                      pointText += pointChild.text
                    }
                  }
                  if (pointText.trim()) {
                    currentItem.points.push(pointText.trim())
                  }
                }
              }
            }
          }
        }

        // 保存最后一个item
        if (currentItem) {
          const itemIndex = items.length
          const itemImages = images.slice(itemIndex * 2, itemIndex * 2 + 2)
          items.push({
            id: items.length + 1,
            title: currentItem.title,
            link: currentItem.link || undefined,
            images: [itemImages[0] || null, itemImages[1] || null],
            points: currentItem.points.slice(0, 3),
          })
        }
      }
    }

    return { label, items }
  }, [contentChildren, mediaData])

  // Extract Typical Collaboration section data
  const typicalCollaborationData = useMemo(() => {
    const sectionTitle = extractTextAfterMarker(contentChildren, "typical-collaboration-title")
    const nodesAfterMarker = extractAfterMarker(contentChildren, "typical-collaboration-item")
    const items: TypicalCollaborationItem[] = []

    for (const node of nodesAfterMarker) {
      // carousel 轮播图块
      if (node.type === "carousel" && node.data?.slides) {
        for (const slide of node.data.slides) {
          const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id
          items.push({
            id: items.length + 1,
            // 使用 description 字段作为标题，支持换行
            title: slide.description || slide.title || "",
            image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
          })
        }
      }
    }

    return { sectionTitle, items }
  }, [contentChildren, mediaData])

  // Extract Cooperation Process section data
  const cooperationProcessData = useMemo(() => {
    const titleLine1 = extractTextAfterMarker(contentChildren, "cooperation-process-title-line1")
    const titleLine2 = extractTextAfterMarker(contentChildren, "cooperation-process-title-line2")
    const nodesAfterMarker = extractAfterMarker(contentChildren, "cooperation-process-item")
    const steps: CooperationProcessStep[] = []

    // 递归提取文本，处理 linebreak 节点
    const extractTextWithLinebreaks = (node: any): string => {
      if (node.type === "linebreak") {
        return "\n"
      }
      if (node.type === "text" && node.text) {
        return node.text
      }
      if (node.children) {
        return node.children.map((child: any) => extractTextWithLinebreaks(child)).join("")
      }
      return ""
    }

    for (const node of nodesAfterMarker) {
      // 有序列表
      if (node.type === "list" && node.children) {
        for (const listItem of node.children) {
          if (listItem.type === "listitem" && listItem.children) {
            const text = extractTextWithLinebreaks(listItem)
            if (text.trim()) {
              steps.push({
                id: steps.length + 1,
                title: text.trim(),
              })
            }
          }
        }
      }
    }

    const buttonText = extractTextAfterMarker(contentChildren, "cooperation-process-connect")

    return { titleLine1, titleLine2, steps, buttonText }
  }, [contentChildren])

  // Extract Contact Form section data
  const contactFormData = useMemo(() => {
    // 查找 contact-form 区块后的 block 节点
    const nodesAfterContactForm = extractAfterMarker(contentChildren, "contact-form")

    // 从 block 节点的 mainContent 和 sidebarContent 中提取数据
    const images: (MediaObject | null)[] = []
    let blockMainContent: any[] = []
    let blockSidebarContent: any[] = []

    for (const node of nodesAfterContactForm) {
      if (node.type === "block" && node.fields) {
        blockMainContent = node.fields.mainContent?.root?.children || []
        blockSidebarContent = node.fields.sidebarContent?.root?.children || []
        break
      }
    }

    // 从 blockMainContent 中提取 marker 数据
    // contact-form-title = 竖排文字 "Get A Quote"
    const verticalTitle = extractTextAfterMarker(blockMainContent, "contact-form-title")
    // contact-form-subtitle = 横排标题 "Warmly Welcome To Send Us Inquiry!"
    const title = extractTextAfterMarker(blockMainContent, "contact-form-subtitle")
    // contact-form-description = 副标题 "Based On Your Specific Needs..."
    const subtitle = extractSegmentsAfterMarker(blockMainContent, "contact-form-description")

    // 从 mainContent 中提取轮播图
    for (const node of blockMainContent) {
      // carousel 轮播图块
      if (node.type === "carousel" && node.data?.slides) {
        for (const slide of node.data.slides) {
          const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id
          if (imageId && mediaData[imageId]) {
            images.push(mediaData[imageId])
          }
        }
      }
      // 单张图片
      if (node.type === "singleImage" && node.data?.image) {
        const image = node.data.image
        const imageId = typeof image === "object" && image ? image.id : String(image || "")
        if (imageId && mediaData[imageId]) {
          const mediaObj = { ...mediaData[imageId] }
          if (node.data.enableLink) {
            mediaObj.enableLink = true
            mediaObj.linkUrl = node.data.linkUrl
            mediaObj.openInNewTab = node.data.openInNewTab
          }
          images.push(mediaObj)
        }
      }
      // 自定义图片画廊
      if (node.type === "custom-image-gallery" && node.data?.images) {
        for (const galleryItem of node.data.images) {
          const imageId = typeof galleryItem?.image === "object" && galleryItem.image ? galleryItem.image.id : String(galleryItem?.image || "")
          if (imageId && mediaData[imageId]) {
            const mediaObj = { ...mediaData[imageId] }
            if (galleryItem.enableLink) {
              mediaObj.enableLink = true
              mediaObj.linkUrl = galleryItem.linkUrl
              mediaObj.openInNewTab = galleryItem.openInNewTab
            }
            images.push(mediaObj)
          }
        }
      }
    }

    // 从 sidebarContent 中提取表单配置和提示
    let formConfig: any = null
    const tips: string[] = []

    for (const sidebarNode of blockSidebarContent) {
      // formBlock 节点
      if (sidebarNode.type === "formBlock" && sidebarNode.data?.formConfig) {
        formConfig = sidebarNode.data.formConfig
      }
      // 无序列表 - 提示
      if (sidebarNode.type === "list" && sidebarNode.children) {
        for (const listItem of sidebarNode.children) {
          if (listItem.type === "listitem" && listItem.children) {
            let text = ""
            for (const child of listItem.children) {
              if (child.text) {
                text += child.text
              }
              if (child.type === "linebreak") {
                text += "\n"
              }
            }
            if (text.trim()) {
              tips.push(text.trim())
            }
          }
        }
      }
    }

    return { verticalTitle, title, subtitle, images, formConfig, tips }
  }, [contentChildren, mediaData])

  // Extract Product Show section data - 提取原始 carousel items
  const productShowRawData = useMemo(() => {
    // 背景图
    const backgroundImage = extractImageAfterMarker(contentChildren, "product-show-image-bg", mediaData)

    // 原始 carousel items (需要通过 API 获取产品数据)
    const rawCarouselItems: any[] = []
    const nodesAfterMarker = extractAfterMarker(contentChildren, "product-show-item")

    for (const node of nodesAfterMarker) {
      // productCarousel 轮播组件
      if (node.type === "productCarousel" && node.data) {
        const carouselItems = node.data.items || []
        for (const item of carouselItems) {
          rawCarouselItems.push({
            id: item.id,
            selectionMode: item.selectionMode || "auto",
            product: item.product,
            productSeries: item.productSeries ? String(item.productSeries) : undefined,
            showName: item.showName !== false,
            showDescription: item.showDescription !== false,
            showButton: item.showButton !== false,
            showHighlights: !!item.showHighlights,
            highlightsCount: item.highlightsCount || 3,
            buttonText: item.buttonText || "View More",
            openInNewTab: item.openInNewTab || false,
          })
        }
      }
    }

    return { backgroundImage, rawCarouselItems }
  }, [contentChildren, mediaData])

  // Extract Quote Image section data
  const quoteImageData = useMemo(() => {
    const image = extractImageAfterMarker(contentChildren, "quote-image", mediaData)
    const titleLine1 = extractTextAfterMarker(contentChildren, "quote-title-top")
    const titleLine2 = extractTextAfterMarker(contentChildren, "quote-title-bottom")
    const subtitle = extractTextAfterMarker(contentChildren, "quote-subtitle")

    // 提取 CTA 按钮块
    const nodesAfterCta = extractAfterMarker(contentChildren, "quote-cta")
    let buttonText = ""
    let buttonLink = ""

    for (const node of nodesAfterCta) {
      // 查找 ctaButton 自定义块
      if (node.type === "ctaButton" && node.data) {
        buttonText = node.data.text || node.data.buttonText || ""
        buttonLink = node.data.link || node.data.url || node.data.href || ""
        break
      }
    }

    return { image, titleLine1, titleLine2, subtitle, buttonText, buttonLink }
  }, [contentChildren, mediaData])

  // 通过 API 获取产品数据并转换为 ProductShowItem 格式
  const [productShowItems, setProductShowItems] = useState<ProductShowItem[]>([])

  useEffect(() => {
    const fetchProductData = async () => {
      if (productShowRawData.rawCarouselItems.length === 0) return

      try {
        const response = await fetch("/api/products/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: productShowRawData.rawCarouselItems,
            locale,
          }),
        })

        if (!response.ok) {
          console.error("Failed to fetch product carousel data:", response.statusText)
          return
        }

        const data = await response.json()
        const products = data.products || []

        // 转换为 ProductShowItem 格式
        const items: ProductShowItem[] = products.map((product: any, index: number) => ({
          id: product.id || index,
          title: product.name || "",
          image: product.showImage || null,
          link: product.slug ? `/shop/${product.slug}` : undefined,
          buttonText: product._carouselItem?.buttonText || "View More",
          showName: product._carouselItem?.showName !== false,
          showButton: product._carouselItem?.showButton !== false,
          showHighlights: !!product._carouselItem?.showHighlights,
          highlightsCount: product._carouselItem?.highlightsCount || 3,
          productAttributes: product.productAttributes || null,
        }))

        setProductShowItems(items)
      } catch (error) {
        console.error("Error fetching product carousel data:", error)
      }
    }

    fetchProductData()
  }, [productShowRawData.rawCarouselItems, locale])

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

      {/* 渐变背景区域 - 从第四板块到第七板块 */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(180deg, #FFFDE9 0%, #FFF8DC 100%)",
        }}
      >
        {/* Project Communication Guide Section */}
        <ProjectCommunicationGuideSection
          title={projectGuideData.title || undefined}
          subtitle={projectGuideData.subtitle || undefined}
          description={projectGuideData.description || undefined}
          image={projectGuideData.image}
        />

        {/* Key Values Cooperation Section */}
        <KeyValuesCooperationSection
          label={keyValuesData.label || undefined}
          items={keyValuesData.items}
        />

        {/* Typical Collaboration Section */}
        <TypicalCollaborationSection
          sectionTitle={typicalCollaborationData.sectionTitle || undefined}
          items={typicalCollaborationData.items}
        />

        {/* Cooperation Process Section */}
        <CooperationProcessSection
          titleLine1={cooperationProcessData.titleLine1 || undefined}
          titleLine2={cooperationProcessData.titleLine2 || undefined}
          steps={cooperationProcessData.steps}
          buttonText={cooperationProcessData.buttonText || undefined}
        />
      </div>

      {/* Contact Form Section */}
      <ContactFormSection
        verticalTitle={contactFormData.verticalTitle || undefined}
        title={contactFormData.title || undefined}
        subtitle={contactFormData.subtitle || undefined}
        images={contactFormData.images}
        formConfig={contactFormData.formConfig}
        tips={contactFormData.tips}
        locale={locale}
      />

      {/* Product Show Section */}
      <ProductShowSection
        backgroundImage={productShowRawData.backgroundImage}
        items={productShowItems}
      />

      {/* Quote Image Section */}
      <QuoteImageSection
        image={quoteImageData.image}
        titleLine1={quoteImageData.titleLine1 || undefined}
        titleLine2={quoteImageData.titleLine2 || undefined}
        subtitle={quoteImageData.subtitle || undefined}
        buttonText={quoteImageData.buttonText || undefined}
        buttonLink={quoteImageData.buttonLink || undefined}
      />
    </div>
  )
}
