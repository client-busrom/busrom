"use client"

import React from "react"
import { OemOdmValueGuide } from "@/components/oem-odm/OemOdmValueGuide"
import { OemOdmBrandAdvantage } from "@/components/oem-odm/OemOdmBrandAdvantage"
import { OemOdmServiceIntroduction } from "@/components/oem-odm/OemOdmServiceIntroduction"
import { OemOdmWhatIsOem } from "@/components/oem-odm/OemOdmWhatIsOem"
import { OemOdmProductSeries } from "@/components/oem-odm/OemOdmProductSeries"
import { OemOdmPartner } from "@/components/oem-odm/OemOdmPartner"
import { OemAdvantages } from "@/components/oem-odm/OemOdmAdvantages"
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
  data: any // The parsed data from parseOemOdmData
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

export function OemOdmTemplate({ locale, data }: OemOdmTemplateProps) {
  const {
    valueGuide,
    brandAdvantage,
    oemService,
    odmService,
    whatWeOffer,
    customizationProcess,
    contactForm,
    applications,
    productGuide,
  } = data

  return (
    <main className="min-h-screen" data-header-theme="dark">
      {/* Hero Section - Value Guide */}
      <OemOdmValueGuide
        titleLines={valueGuide.titleLines}
        features={valueGuide.features}
        leftDescription={valueGuide.description || undefined}
        rightDescription={valueGuide.rightDescription || undefined}
        leftImage={valueGuide.leftImage}
        rightImage={valueGuide.rightImage}
      />

      {/* Brand Advantage Section */}
      <OemOdmBrandAdvantage
        brandAdvantages={brandAdvantage.items.length > 0 ? brandAdvantage.items : undefined}
        leftImage={brandAdvantage.images[0] || null}
        rightImage={brandAdvantage.images[1] || null}
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
          image={oemService.image}
          topDescriptionSegments={oemService.description.length > 0 ? oemService.description : undefined}
          leftDescriptionSegments={oemService.leftDescription.length > 0 ? oemService.leftDescription : undefined}
        />

        {/* What Is OEM Section */}
        <OemOdmWhatIsOem
          image={oemService.what.image}
          subtitle={oemService.what.subtitle || undefined}
          descriptionSegments={oemService.what.descriptionSegments.length > 0 ? oemService.what.descriptionSegments : undefined}
        />

        {/* OEM Product Series Section */}
        <OemOdmProductSeries
          title={oemService.series.title || undefined}
          description={oemService.series.description || undefined}
          image={oemService.series.image}
        />

        {/* OEM Partner Section */}
        <OemOdmPartner
          title={oemService.partner.title || undefined}
          items={oemService.partner.items.length > 0 ? oemService.partner.items.map((item: any) => ({ title: item })) : undefined}
          images={oemService.partner.images}
        />

        {/* OEM Advantages Section */}
        <OemAdvantages
          title={oemService.advantages.title || undefined}
          items={oemService.advantages.items.length > 0 ? oemService.advantages.items : undefined}
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
          image={odmService.image}
          topDescriptionSegments={odmService.description.length > 0 ? odmService.description : undefined}
          leftDescriptionSegments={odmService.leftDescription.length > 0 ? odmService.leftDescription : undefined}
        />

        {/* What Is ODM Section */}
        <OdmWhatIsOdm
          image={odmService.what.image}
          subtitle={odmService.what.subtitle || undefined}
          descriptionSegments={odmService.what.descriptionSegments.length > 0 ? odmService.what.descriptionSegments : undefined}
        />

        {/* ODM Product Series Section */}
        <OdmProductSeries
          title={odmService.series.title || undefined}
          description={odmService.series.description || undefined}
          image={odmService.series.image}
        />

        {/* ODM Partner Section */}
        <OdmPartner
          title={odmService.partner.title || undefined}
          items={odmService.partner.items.length > 0 ? odmService.partner.items.map((item: any) => ({ title: item })) : undefined}
          images={odmService.partner.images}
        />

        {/* ODM Advantages Section */}
        <OdmAdvantages
          title={odmService.advantages.title || undefined}
          items={odmService.advantages.items.length > 0 ? odmService.advantages.items : undefined}
        />
      </div>

      {/* Common Sections */}
      <OemOdmWhatWeOffer
        title={whatWeOffer.title || undefined}
        items={whatWeOffer.items}
      />

      <OemOdmCustomizationProcess
        title={customizationProcess.title || undefined}
        tips={customizationProcess.subtitle || undefined}
        hint={customizationProcess.hint || undefined}
        steps={customizationProcess.steps}
      />

      <OemOdmContactForm
        title={contactForm.title || undefined}
        description={contactForm.description || undefined}
        image={contactForm.image}
        formConfig={contactForm.formConfig}
      />

      <OemOdmApplications
        applicationIds={applications}
        findOutMoreText={data.applicationsData?.findOutMoreText} 
        nextText={data.applicationsData?.nextText}
      />

      <OemOdmProductGuide
        title={productGuide.title || undefined}
        description={productGuide.description || undefined}
        buttonText={productGuide.buttonText || undefined}
        buttonLink={productGuide.buttonLink || undefined}
        exploreText={productGuide.exploreText || undefined}
      />
    </main>
  )
}

export default OemAdvantages
