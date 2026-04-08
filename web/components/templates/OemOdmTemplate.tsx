"use client"

import React, { useMemo } from "react"
import { OemOdmValueGuide } from "@/components/oem-odm/OemOdmValueGuide"
import { OemOdmBrandAdvantage } from "@/components/oem-odm/OemOdmBrandAdvantage"
import { OemOdmServiceIntroduction } from "@/components/oem-odm/OemOdmServiceIntroduction"
import { OemOdmWhatIsOem } from "@/components/oem-odm/OemOdmWhatIsOem"
import { OemOdmProductSeries } from "@/components/oem-odm/OemOdmProductSeries"
import { OemOdmPartner } from "@/components/oem-odm/OemOdmPartner"
import { OemOdmAdvantages } from "@/components/oem-odm/OemOdmAdvantages"
// ODM components
import { OdmServiceIntroduction } from "@/components/oem-odm/OdmServiceIntroduction"
import { OdmWhatIsOdm } from "@/components/oem-odm/OdmWhatIsOdm"
import { OdmProductSeries } from "@/components/oem-odm/OdmProductSeries"
import { OdmPartner } from "@/components/oem-odm/OdmPartner"
import { OdmAdvantages } from "@/components/oem-odm/OdmAdvantages"
// Common components
import { OemOdmWhatWeOffer } from "@/components/oem-odm/OemOdmWhatWeOffer"
import { OemOdmCustomizationProcess } from "@/components/oem-odm/OemOdmCustomizationProcess"
import { OemOdmContactForm } from "@/components/oem-odm/OemOdmContactForm"
import { OemOdmApplications } from "@/components/oem-odm/OemOdmApplications"
import { OemOdmProductGuide } from "@/components/oem-odm/OemOdmProductGuide"
import { 
  flattenLexicalChildren as flattenChildren, 
  extractNodesAfterMarker as extractAfterMarker, 
  resolveMediaFromNodes,
  MediaObject
} from "@/lib/lexical-utils"

// MediaObject interface moved to @/lib/lexical-utils


interface FormField {
  label: string
  fieldName: string
  fieldType: "text" | "email" | "tel" | "textarea" | "checkbox" | "select"
  placeholder?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
}

interface FormConfigData {
  id: string
  name: string
  location: string
  displayName?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  fields: {
    [locale: string]: FormField[]
  }
}

interface FormConfig {
  id?: string
  label?: string
  data?: FormConfigData
  fields?: {
    [locale: string]: FormField[]
  }
  name?: string
  location?: string
  displayName?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
}

interface OemOdmTemplateProps {
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
    formConfig?: FormConfig | null
  }
}

// ========================================
// Helper 函数 - 解析 CMS 富文本内容
// ========================================

// Helpers moved to @/lib/lexical-utils or simplified
function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodes = extractAfterMarker(children, markerId)
  const resolved = resolveMediaFromNodes(nodes, mediaData)
  return resolved[0] || null
}


// 文本片段接口 - 支持格式化
interface TextSegment {
  text: string
  bold?: boolean
  underline?: boolean
}

// 提取标记符之后的格式化文本片段
// format: 1 = 加粗, 8 = 下划线, 9 = 加粗+下划线
function extractFormattedTextAfterMarker(children: any[], markerId: string): TextSegment[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const segments: TextSegment[] = []

  for (const node of nodesAfterMarker) {
    if ((node.type === "paragraph" || node.type === "heading") && node.children) {
      for (const child of node.children) {
        if (child.type === "linebreak") {
          segments.push({ text: "\n" })
        } else if (child.text !== undefined) {
          const format = child.format || 0
          segments.push({
            text: child.text,
            bold: (format & 1) === 1,
            underline: (format & 8) === 8,
          })
        }
      }
      if (segments.length > 0) return segments
    }
  }
  return segments
}

// 递归提取节点中的文本（支持换行）
function extractTextFromNode(node: any): string {
  if (!node) return ""

  // 如果是文本节点
  if (node.text !== undefined) {
    return node.text
  }

  // 如果是换行节点
  if (node.type === "linebreak") {
    return "\n"
  }

  // 如果有子节点，递归处理
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((child: any) => extractTextFromNode(child)).join("")
  }

  return ""
}

// 提取标记符之后的文本（支持换行）
function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId)

  for (const node of nodesAfterMarker) {
    if ((node.type === "paragraph" || node.type === "heading") && node.children) {
      const text = extractTextFromNode(node)
      if (text.trim()) return text
    }
  }
  return null
}

// 提取标记符之后的所有文本行（多段落支持）
function extractAllTextAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const lines: string[] = []

  for (const node of nodesAfterMarker) {
    if ((node.type === "paragraph" || node.type === "heading") && node.children) {
      let text = ""
      for (const child of node.children) {
        if (child.type === "linebreak") {
          text += "\n"
        } else if (child.text !== undefined) {
          text += child.text
        }
      }
      if (text.trim()) {
        // 按换行分割
        const splitLines = text.split("\n").filter(l => l.trim())
        lines.push(...splitLines)
      }
    }
  }
  return lines
}

// 提取标记符之后的有序列表项
function extractListItemsAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const items: string[] = []

  for (const node of nodesAfterMarker) {
    if (node.type === "list" && node.children) {
      for (const listItem of node.children) {
        if (listItem.type === "listitem" && listItem.children) {
          let text = ""
          for (const child of listItem.children) {
            if (child.text !== undefined) {
              text += child.text
            }
            if (child.type === "linebreak") {
              text += "\n"
            }
          }
          if (text.trim()) {
            items.push(text.trim())
          }
        }
      }
    }
  }
  return items
}

// 提取2层有序列表（标题+描述）- 用于 What We Offer 板块
// indent=0 是标题，indent=1 是描述
interface TwoLevelListItem {
  title: string
  description: string
}

function extractTwoLevelListAfterMarker(children: any[], markerId: string): TwoLevelListItem[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const items: TwoLevelListItem[] = []

  for (const node of nodesAfterMarker) {
    if (node.type === "list" && node.children) {
      let currentTitle = ""

      for (const listItem of node.children) {
        if (listItem.type === "listitem" && listItem.children) {
          const indent = listItem.indent || 0

          if (indent === 0) {
            // 检查第一个子元素是否是文本（标题）还是嵌套列表（描述）
            const firstChild = listItem.children[0]

            if (firstChild?.type === "list") {
              // 这是嵌套的描述列表
              for (const nestedItem of firstChild.children) {
                if (nestedItem.type === "listitem" && nestedItem.children) {
                  let descText = ""
                  for (const child of nestedItem.children) {
                    if (child.text !== undefined) {
                      descText += child.text
                    }
                  }
                  if (descText.trim() && currentTitle) {
                    // 找到对应的item并添加描述
                    const lastItem = items[items.length - 1]
                    if (lastItem && !lastItem.description) {
                      lastItem.description = descText.trim()
                    }
                  }
                }
              }
            } else {
              // 这是标题
              let titleText = ""
              for (const child of listItem.children) {
                if (child.text !== undefined) {
                  titleText += child.text
                }
              }
              if (titleText.trim()) {
                currentTitle = titleText.trim()
                items.push({ title: currentTitle, description: "" })
              }
            }
          }
        }
      }
    }
  }
  return items
}

// 提取图片画廊（多张图片）
function extractGalleryAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject[] {
  const nodes = extractAfterMarker(children, markerId)
  return resolveMediaFromNodes(nodes, mediaData)
}


// 提取带图片的列表项（用于 Advantages 板块）
// 支持 carousel 类型的 slides 数据结构
interface AdvantageItemWithImage {
  title: string
  description: string
  image: MediaObject | null
}

function extractAdvantageItemsAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): AdvantageItemWithImage[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId)
  const items: AdvantageItemWithImage[] = []

  for (let i = 0; i < nodesAfterMarker.length; i++) {
    const node = nodesAfterMarker[i]

    // 处理 carousel 类型 - slides 数组
    if (node.type === "carousel" && node.data?.slides) {
      for (const slide of node.data.slides) {
        const imageId = typeof slide.image === "object" && slide.image ? slide.image.id : String(slide.image || "")
        items.push({
          title: slide.title || "",
          description: slide.description || "",
          image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
        })
      }
    }

    // 查找列表项（备用方案）
    if (node.type === "list" && node.children) {
      for (let j = 0; j < node.children.length; j++) {
        const listItem = node.children[j]
        if (listItem.type === "listitem" && listItem.children) {
          let text = ""
          for (const child of listItem.children) {
            if (child.text !== undefined) {
              text += child.text
            }
          }
          if (text.trim()) {
            // 解析格式 "title::description"
            const [title, description] = text.split("::")
            items.push({
              title: title?.trim() || "",
              description: description?.trim() || "",
              image: null,
            })
          }
        }
      }
    }

    // 查找图片并关联到对应的item（备用方案）
    if (node.type === "singleImage" && node.data?.image && items.length > 0) {
      const image = node.data.image
      const imageId = typeof image === "object" && image ? image.id : String(image || "")
      if (imageId && mediaData[imageId]) {
        for (let k = items.length - 1; k >= 0; k--) {
          if (!items[k].image) {
            items[k].image = mediaData[imageId]
            break
          }
        }
      }
    }
  }

  return items
}

// ========================================
// OemOdmTemplate 组件
// ========================================

export function OemOdmTemplate({ locale, pageContent }: OemOdmTemplateProps) {
  // 获取内容节点
  const contentChildren = useMemo(() =>
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [],
    [pageContent]
  )

  const mediaData = pageContent.mediaData || {}

  // ========================================
  // 提取 Value Guide (Hero) Section 数据
  // 对应 CMS 中的 oem-odm-value-guide 板块
  // ========================================
  const heroData = useMemo(() => {
    // 提取标题 - 需要分割成多行
    const titleText = extractTextAfterMarker(contentChildren, "oem-odm-value-guide-title")
    const titleLines = titleText ? titleText.split("\n").filter(l => l.trim()) : []

    // 提取副标题/特性 - "Professional Efficient Reliable" 需要分割
    const subtitleText = extractTextAfterMarker(contentChildren, "oem-odm-value-guide-subtitle")
    const features = subtitleText ? subtitleText.split("\n").filter(l => l.trim()) : []

    // 左侧和右侧描述
    const descriptionLeft = extractTextAfterMarker(contentChildren, "oem-odm-value-guide-description-left")
    const descriptionRight = extractTextAfterMarker(contentChildren, "oem-odm-value-guide-description-right")

    // 图片 - 从图片画廊中获取（第一张为左图，第二张为右图）
    const galleryImages = extractGalleryAfterMarker(contentChildren, "oem-odm-value-guide-image", mediaData)
    const leftImage = galleryImages[0] || null
    const rightImage = galleryImages[1] || null

    return {
      titleLines,
      features,
      description: descriptionLeft,
      rightDescription: descriptionRight,
      leftImage,
      rightImage,
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 Brand Advantage Section 数据
  // 对应 CMS 中的 oem-odm-brand-advantage 板块
  // ========================================
  const brandAdvantageData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "oem-odm-brand-advantage-title")
    const items = extractListItemsAfterMarker(contentChildren, "oem-odm-brand-advantage-item")
    const tagOem = extractTextAfterMarker(contentChildren, "oem-odm-brand-advantage-tag-oem")
    const tagOdm = extractTextAfterMarker(contentChildren, "oem-odm-brand-advantage-tag-odm")
    const tagTips = extractTextAfterMarker(contentChildren, "oem-odm-brand-advantage-tag-tips")
    const images = extractGalleryAfterMarker(contentChildren, "oem-odm-brand-advantage-tag-image", mediaData)

    return {
      title,
      items,
      tagOem,
      tagOdm,
      tagTips,
      images,
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 OEM Service Introduction Section 数据
  // 注意：设计稿命名为 oem-service-introduction (少了一个 i)
  // ========================================
  const oemServiceData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "oem-service-introduction-title")
    const subtitle = extractTextAfterMarker(contentChildren, "oem-service-introduction-subtitle")
    // 右上角描述文字 - 支持加粗和下划线格式
    const description = extractFormattedTextAfterMarker(contentChildren, "oem-service-introduction-description")
    const image = extractImageAfterMarker(contentChildren, "oem-service-introduction-image", mediaData)

    // 左下角描述文字 - 支持加粗和下划线格式（使用 subtitle 标记）
    const leftDescription = extractFormattedTextAfterMarker(contentChildren, "oem-service-introduction-subtitle")

    // What Is OEM 子板块
    const whatTitle = extractTextAfterMarker(contentChildren, "oem-service-introduction-what-title")
    const whatSubtitle = extractTextAfterMarker(contentChildren, "oem-service-introduction-what-subtitle")
    const whatDescriptionSegments = extractFormattedTextAfterMarker(contentChildren, "oem-service-introduction-what-description")
    const whatImage = extractImageAfterMarker(contentChildren, "oem-service-introduction-what-image", mediaData)

    // Series of Products 子板块
    const seriesTitle = extractTextAfterMarker(contentChildren, "oem-service-introduction-series-title")
    const seriesDescription = extractTextAfterMarker(contentChildren, "oem-service-introduction-series-description")
    const seriesImage = extractImageAfterMarker(contentChildren, "oem-service-introduction-series-image", mediaData)

    // Partner 子板块
    const partnerTitle = extractTextAfterMarker(contentChildren, "oem-service-introduction-partner-title")
    const partnerItems = extractListItemsAfterMarker(contentChildren, "oem-service-introduction-partner-item")
    const partnerImages = extractGalleryAfterMarker(contentChildren, "oem-service-introduction-partner-image", mediaData)

    return {
      title,
      subtitle,
      description,
      image,
      leftDescription,
      what: {
        title: whatTitle,
        subtitle: whatSubtitle,
        descriptionSegments: whatDescriptionSegments,
        image: whatImage,
      },
      series: {
        title: seriesTitle,
        description: seriesDescription,
        image: seriesImage,
      },
      partner: {
        title: partnerTitle,
        items: partnerItems,
        images: partnerImages,
      },
      // Advantages 子板块 - 每个item带有自己的图片
      advantages: {
        title: extractTextAfterMarker(contentChildren, "oem-service-introduction-advantages-title"),
        items: extractAdvantageItemsAfterMarker(contentChildren, "oem-service-introduction-advantages-item", mediaData),
      }
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 ODM Service Introduction Section 数据
  // ========================================
  const odmServiceData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "odm-service-introduction-title")
    const subtitle = extractTextAfterMarker(contentChildren, "odm-service-introduction-subtitle")
    // 右上角描述文字 - 支持加粗和下划线格式
    const description = extractFormattedTextAfterMarker(contentChildren, "odm-service-introduction-description")
    const image = extractImageAfterMarker(contentChildren, "odm-service-introduction-image", mediaData)

    // 左下角描述文字 - 支持加粗和下划线格式（使用 subtitle 标记）
    const leftDescription = extractFormattedTextAfterMarker(contentChildren, "odm-service-introduction-subtitle")

    // What Is ODM 子板块
    const whatTitle = extractTextAfterMarker(contentChildren, "odm-service-introduction-what-title")
    const whatSubtitle = extractTextAfterMarker(contentChildren, "odm-service-introduction-what-subtitle")
    const whatDescriptionSegments = extractFormattedTextAfterMarker(contentChildren, "odm-service-introduction-what-description")
    const whatImage = extractImageAfterMarker(contentChildren, "odm-service-introduction-what-image", mediaData)

    // Series of Products 子板块
    const seriesTitle = extractTextAfterMarker(contentChildren, "odm-service-introduction-series-title")
    const seriesDescription = extractTextAfterMarker(contentChildren, "odm-service-introduction-series-description")
    const seriesImage = extractImageAfterMarker(contentChildren, "odm-service-introduction-series-image", mediaData)

    // Partner 子板块
    const partnerTitle = extractTextAfterMarker(contentChildren, "odm-service-introduction-partner-title")
    const partnerItems = extractListItemsAfterMarker(contentChildren, "odm-service-introduction-partner-item")
    const partnerImages = extractGalleryAfterMarker(contentChildren, "odm-service-introduction-partner-image", mediaData)

    return {
      title,
      subtitle,
      description,
      image,
      leftDescription,
      what: {
        title: whatTitle,
        subtitle: whatSubtitle,
        descriptionSegments: whatDescriptionSegments,
        image: whatImage,
      },
      series: {
        title: seriesTitle,
        description: seriesDescription,
        image: seriesImage,
      },
      partner: {
        title: partnerTitle,
        items: partnerItems,
        images: partnerImages,
      },
      // Advantages 子板块 - 每个item带有自己的图片
      advantages: {
        title: extractTextAfterMarker(contentChildren, "odm-service-introduction-advantages-title"),
        items: extractAdvantageItemsAfterMarker(contentChildren, "odm-service-introduction-advantages-item", mediaData),
      }
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 What We Offer You Section 数据
  // ========================================
  const whatWeOfferData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "what-we-offer-title")

    // 从图片画廊获取卡片图片（3张）
    const images = extractGalleryAfterMarker(contentChildren, "what-we-offer-image", mediaData)
    const item1Image = images[0] || null
    const item2Image = images[1] || null
    const item3Image = images[2] || null

    // 提取2层有序列表（标题+描述）
    const listItems = extractTwoLevelListAfterMarker(contentChildren, "what-we-offer-item")

    return {
      title,
      items: [
        {
          number: "01",
          title: listItems[0]?.title || "Product Development",
          description: listItems[0]?.description || "",
          image: item1Image,
        },
        {
          number: "02",
          title: listItems[1]?.title || "Experienced Experts",
          description: listItems[1]?.description || "",
          image: item2Image,
        },
        {
          number: "03",
          title: listItems[2]?.title || "Marketing Support",
          description: listItems[2]?.description || "",
          image: item3Image,
        },
      ],
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 Customization Process Section 数据
  // ========================================
  const customizationProcessData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "customization-process-title")
    const subtitle = extractTextAfterMarker(contentChildren, "customization-process-subtitle")
    const hint = extractTextAfterMarker(contentChildren, "customization-process-hint")
    const stepItems = extractListItemsAfterMarker(contentChildren, "customization-process-step")

    // 将步骤解析为多行格式
    const steps = stepItems.map(item => {
      // 按换行符分割成多行
      const lines = item.split("\n").filter(l => l.trim())
      return {
        title: item,
        lines: lines.length > 1 ? lines : undefined,
      }
    })

    return {
      title,
      subtitle,
      hint,
      steps,
    }
  }, [contentChildren])

  // ========================================
  // 提取 Contact Form Section 数据
  // ========================================
  const contactFormData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "contact-form-title")
    const description = extractTextAfterMarker(contentChildren, "contact-form-description")
    const image = extractImageAfterMarker(contentChildren, "contact-form-image", mediaData)

    // 从 formBlock 节点提取 formConfig ID
    let formConfigId: string | null = null
    const blockMarkerNodes = extractAfterMarker(contentChildren, "contact-form-block")
    const formNode = blockMarkerNodes.find(n => n.type === "formBlock") || extractAfterMarker(contentChildren, "contact-form").find(n => n.type === "formBlock")
    
    if (formNode?.data?.formConfig?.id || formNode?.data?.id || formNode?.id) {
      formConfigId = formNode.data?.formConfig?.id || formNode.data?.id || formNode.id
    }

    return {
      title,
      description,
      image,
      formConfigId,
    }
  }, [contentChildren, mediaData])

  // ========================================
  // 提取 Applications Section 数据
  // 使用 applicationCarousel 类型
  // ========================================
  const applicationsData = useMemo(() => {
    const applicationIds: number[] = []

    // 直接遍历所有节点查找 applicationCarousel，因为它在 applications 标记后但会被子标记中断
    for (const node of contentChildren) {
      // 处理 applicationCarousel 类型 - applications 数组包含 {id: number}
      if (node.type === "applicationCarousel" && node.data?.applications) {
        for (const app of node.data.applications) {
          if (app.id) {
            applicationIds.push(app.id)
          }
        }
        break // 只取第一个 applicationCarousel
      }
    }

    // 提取 Find Out More 和 Next 文本
    const findOutMoreText = extractTextAfterMarker(contentChildren, "applications-find-out-more")
    const nextText = extractTextAfterMarker(contentChildren, "applications-next")

    return { applicationIds, findOutMoreText, nextText }
  }, [contentChildren])

  // ========================================
  // 提取 Product Guide Section 数据
  // 图片从产品 API 获取，不从 CMS 标记获取
  // ========================================
  const productGuideData = useMemo(() => {
    const title = extractTextAfterMarker(contentChildren, "product-guide-title")
    const description = extractTextAfterMarker(contentChildren, "product-guide-description")
    const buttonText = extractTextAfterMarker(contentChildren, "product-guide-button")
    const buttonLink = extractTextAfterMarker(contentChildren, "product-guide-link")
    const exploreText = extractTextAfterMarker(contentChildren, "product-guide-explore")

    return {
      title,
      description,
      buttonText,
      buttonLink,
      exploreText,
    }
  }, [contentChildren])

  return (
    <main className="min-h-screen" data-header-theme="dark">
      {/* Hero Section - Value Guide */}
      <OemOdmValueGuide
        titleLines={heroData.titleLines}
        features={heroData.features}
        leftDescription={heroData.description || undefined}
        rightDescription={heroData.rightDescription || undefined}
        leftImage={heroData.leftImage}
        rightImage={heroData.rightImage}
      />

      {/* Brand Advantage Section */}
      <OemOdmBrandAdvantage
        brandAdvantages={brandAdvantageData.items.length > 0 ? brandAdvantageData.items : undefined}
        leftImage={brandAdvantageData.images[0] || null}
        rightImage={brandAdvantageData.images[1] || null}
        onOemClick={() => {
          document.getElementById('oem-service-section')?.scrollIntoView({ behavior: 'smooth' })
        }}
        onOdmClick={() => {
          document.getElementById('odm-service-section')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* OEM Sections - 统一背景色 #756f3f */}
      <div id="oem-service-section" style={{ backgroundColor: "#756f3f" }}>
        {/* OEM Service Introduction Section */}
        <OemOdmServiceIntroduction
          image={oemServiceData.image}
          topDescriptionSegments={oemServiceData.description.length > 0 ? oemServiceData.description : undefined}
          leftDescriptionSegments={oemServiceData.leftDescription.length > 0 ? oemServiceData.leftDescription : undefined}
        />

        {/* What Is OEM Section */}
        <OemOdmWhatIsOem
          image={oemServiceData.what.image}
          subtitle={oemServiceData.what.subtitle || undefined}
          descriptionSegments={oemServiceData.what.descriptionSegments.length > 0 ? oemServiceData.what.descriptionSegments : undefined}
        />

        {/* OEM Product Series Section */}
        <OemOdmProductSeries
          title={oemServiceData.series.title || undefined}
          description={oemServiceData.series.description || undefined}
          image={oemServiceData.series.image}
        />

        {/* OEM Partner Section */}
        <OemOdmPartner
          title={oemServiceData.partner.title || undefined}
          items={oemServiceData.partner.items.length > 0 ? oemServiceData.partner.items.map(item => ({ title: item })) : undefined}
          images={oemServiceData.partner.images}
        />

        {/* OEM Advantages Section */}
        <OemOdmAdvantages
          title={oemServiceData.advantages.title || undefined}
          items={oemServiceData.advantages.items.length > 0 ? oemServiceData.advantages.items : undefined}
        />
      </div>

      {/* ODM Sections - 渐变背景 from #EDE9C7 to #F6F4ED */}
      <div
        id="odm-service-section"
        style={{
          background: "linear-gradient(180deg, #EDE9C7 0%, #F6F4ED 82.36%)",
        }}
      >
        {/* ODM Service Introduction Section */}
        <OdmServiceIntroduction
          image={odmServiceData.image}
          topDescriptionSegments={odmServiceData.description.length > 0 ? odmServiceData.description : undefined}
          leftDescriptionSegments={odmServiceData.leftDescription.length > 0 ? odmServiceData.leftDescription : undefined}
        />

        {/* What Is ODM Section */}
        <OdmWhatIsOdm
          image={odmServiceData.what.image}
          subtitle={odmServiceData.what.subtitle || undefined}
          descriptionSegments={odmServiceData.what.descriptionSegments.length > 0 ? odmServiceData.what.descriptionSegments : undefined}
        />

        {/* ODM Product Series Section */}
        <OdmProductSeries
          title={odmServiceData.series.title || undefined}
          description={odmServiceData.series.description || undefined}
          image={odmServiceData.series.image}
        />

        {/* ODM Partner Section */}
        <OdmPartner
          title={odmServiceData.partner.title || undefined}
          items={odmServiceData.partner.items.length > 0 ? odmServiceData.partner.items.map(item => ({ title: item })) : undefined}
          images={odmServiceData.partner.images}
        />

        {/* ODM Advantages Section */}
        <OdmAdvantages
          title={odmServiceData.advantages.title || undefined}
          items={odmServiceData.advantages.items.length > 0 ? odmServiceData.advantages.items : undefined}
        />
      </div>

      {/* What We Offer You Section */}
      <OemOdmWhatWeOffer
        title={whatWeOfferData.title || undefined}
        items={whatWeOfferData.items}
      />

      {/* Customization Process Section */}
      <OemOdmCustomizationProcess
        title={customizationProcessData.title || undefined}
        tips={customizationProcessData.subtitle || undefined}
        hint={customizationProcessData.hint || undefined}
        steps={customizationProcessData.steps.length > 0 ? customizationProcessData.steps : undefined}
      />

      {/* Contact Form Section */}
      <OemOdmContactForm
        title={contactFormData.title || undefined}
        description={contactFormData.description || undefined}
        image={contactFormData.image}
        formConfig={pageContent.formConfig}
        locale={locale as any}
      />

      {/* Applications Section */}
      <OemOdmApplications
        applicationIds={applicationsData.applicationIds}
        locale={locale as any}
        findOutMoreText={applicationsData.findOutMoreText || undefined}
        nextText={applicationsData.nextText || undefined}
      />

      {/* Product Guide Section */}
      <OemOdmProductGuide
        title={productGuideData.title || undefined}
        description={productGuideData.description || undefined}
        buttonText={productGuideData.buttonText || undefined}
        buttonLink={productGuideData.buttonLink || undefined}
        exploreText={productGuideData.exploreText || undefined}
        locale={locale as any}
      />
    </main>
  )
}

export default OemOdmTemplate
