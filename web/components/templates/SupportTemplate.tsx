"use client"

import React, { useMemo } from "react"
import { SupportHeroSection } from "@/components/support/SupportHeroSection"
import { SupportCommitmentSection } from "@/components/support/SupportCommitmentSection"
import { SupportCustomizedSection } from "@/components/support/SupportCustomizedSection"
import { SupportQualityControlSection } from "@/components/support/SupportQualityControlSection"
import { SupportDecoratorSection } from "@/components/support/SupportDecoratorSection"
import { SupportRemoteSection } from "@/components/support/SupportRemoteSection"
import { SupportRequestProcessSection } from "@/components/support/SupportRequestProcessSection"
import { SupportMarketingSalesSection } from "@/components/support/SupportMarketingSalesSection"
import { SupportContactFormSection } from "@/components/support/SupportContactFormSection"

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

interface SupportTemplateProps {
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
  if (node.type === "linebreak") return "\n"
  if (node.type === "paragraph" || node.type === "quote" || node.type === "heading") return getNodeTotalText(node.children) + "\n"
  if (node.text) return node.text
  if (node.children) return getNodeTotalText(node.children)
  return ""
}

/**
 * Improved marker extraction:
 * 1. Markers are usually Paragraph/Quote/Code blocks with text matching exactly or format 16.
 * 2. We stop at the NEXT node that also looks like a marker (contains hyphens or matches a known pattern).
 * 3. We collect all nodes in between, including custom types like 'iconList'.
 */
function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false
  const result: any[] = []
  const target = markerId.toLowerCase().trim()

  for (const node of children) {
    const totalText = getNodeTotalText(node).trim().toLowerCase()
    
    // Check for marker in Paragraph/Quote/Code block
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      totalText === target

    if (isMarkerBlock) {
      if (foundMarker) break // Stop on NEXT section
      foundMarker = true
      continue
    }

    // Stop if we see a node that clearly starts a NEW section
    const isNewMarker = 
      foundMarker && 
      (node.type === "paragraph" || node.type === "code" || node.type === "quote") && 
      (node.children?.[0]?.format === 16 || (totalText.includes("-") && totalText.length > 5 && !totalText.includes(" ") && !totalText.startsWith(target + "-")))

    if (isNewMarker) break

    if (foundMarker) result.push(node)
  }
  
  // Fallback for subtitle if specific marker fails
  if (result.length === 0 && markerId === "support-request-process-subtitle") {
    // Look for any paragraph with bold 'Process' after title marker
    let startCollecting = false
    for (const node of children) {
        const text = getNodeTotalText(node).toLowerCase()
        if (text.includes("process-title")) { startCollecting = true; continue; }
        if (text.includes("process-item")) break
        if (startCollecting && text.includes("process")) {
            result.push(node)
            break
        }
    }
  }

  return result
}

export function SupportTemplate({ locale, pageContent }: SupportTemplateProps) {
  const children = useMemo(() => {
    return pageContent.contentTranslation?.root?.children || 
           pageContent.content?.root?.children || 
           (pageContent as any).content?.children || []
  }, [pageContent])

  const mediaData = pageContent.mediaData || {}

  // 1. Hero Section Extraction
  const heroData = useMemo(() => {
    const hasHeroMarker = children.some((node: any) => {
      const txt = getNodeTotalText(node).trim()
      return txt === "hero-section" || (node.children?.[0]?.format === 16 && txt === "hero-section")
    })
    
    if (!hasHeroMarker) return null

    // Title
    const titleNodes = extractAfterMarker(children, "hero-section-title")
    let title: any[] = []
    titleNodes.forEach(node => {
      if (node.children) title = [...title, ...node.children]
      else if (node.text || node.type === "linebreak") title.push(node)
    })

    const tips = getNodeTotalText(extractAfterMarker(children, "hero-section-title-tips"))
    const subtitle = getNodeTotalText(extractAfterMarker(children, "hero-section-subtitle"))
    const ctaTitle = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-title"))
    const ctaContent = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-content"))
    const ctaBtn = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-btn"))

    const imgNodes = extractAfterMarker(children, "hero-section-image")
    const imgId = imgNodes.length > 0 && imgNodes[0].type === "singleImage" 
       ? imgNodes[0].data?.image?.id 
       : null
    const image = imgId ? mediaData[imgId] : null

    return {
      title,
      tips,
      subtitle,
      cta: { title: ctaTitle, content: ctaContent, buttonText: ctaBtn },
      image
    }
  }, [children, mediaData])

  // 2. Support Commitment Extraction
  const commitmentData = useMemo(() => {
    const mainTitleNodes = extractAfterMarker(children, "support-commitment-title")
    const mainTitleStr = getNodeTotalText(mainTitleNodes)
    const subtitleNodes = extractAfterMarker(children, "support-commitment-subtitle")
    
    // Technical group
    const techTitle = getNodeTotalText(extractAfterMarker(children, "support-commitment-technical-title"))
    const techItemNodes = extractAfterMarker(children, "support-commitment-technical-item")
    const techItems: any[] = []
    
    techItemNodes.forEach(node => {
      if (node.type === "iconList" && node.data?.items) {
        techItems.push(...node.data.items)
      }
    })

    // Marketing group
    const marketTitle = getNodeTotalText(extractAfterMarker(children, "support-commitment-marketing-title"))
    const marketItemNodes = extractAfterMarker(children, "support-commitment-marketing-item")
    const marketItems: any[] = []
    
    marketItemNodes.forEach(node => {
      if (node.type === "iconList" && node.data?.items) {
        marketItems.push(...node.data.items)
      }
    })

    if (!mainTitleStr && techItems.length === 0 && marketItems.length === 0) return null

    return { 
      mainTitle: mainTitleNodes, 
      subtitle: subtitleNodes, 
      technical: { title: techTitle, items: techItems }, 
      marketing: { title: marketTitle, items: marketItems } 
    }
  }, [children])

  // 3. Support Customized Extraction
  const customizedData = useMemo(() => {
    const mainTitleNodes = extractAfterMarker(children, "support-customized-title")
    if (mainTitleNodes.length === 0) return null

    // Product Group
    const productTitleNodes = extractAfterMarker(children, "support-customized-product-title")
    const productTitleStr = getNodeTotalText(productTitleNodes)
    const productItemNodes = extractAfterMarker(children, "support-customized-product-item")
    const productItems: any[] = []
    productItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        productItems.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: item.image?.id ? mediaData[item.image.id] : null
        })))
      }
    })

    // Manufacturing Group
    const manufactureTitleNodes = extractAfterMarker(children, "support-customized-manufacturing-title")
    const manufactureTitleStr = getNodeTotalText(manufactureTitleNodes)
    const manufactureItemNodes = extractAfterMarker(children, "support-customized-manufacturing-item")
    const manufactureItems: any[] = []
    manufactureItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        manufactureItems.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: item.image?.id ? mediaData[item.image.id] : null
        })))
      }
    })

    return {
      mainTitle: mainTitleNodes,
      product: { title: productTitleStr, items: productItems },
      manufacturing: { title: manufactureTitleStr, items: manufactureItems }
    }
  }, [children, mediaData])

  // 4. Support Quality Control Extraction
  const qualityControlData = useMemo(() => {
    // Try both with and without 'support-' prefix
    let titleNodes = extractAfterMarker(children, "support-quality-control-title")
    if (titleNodes.length === 0) titleNodes = extractAfterMarker(children, "quality-control-title")

    let itemNodes = extractAfterMarker(children, "support-quality-control-item")
    if (itemNodes.length === 0) itemNodes = extractAfterMarker(children, "quality-control-item")
    if (itemNodes.length === 0) itemNodes = extractAfterMarker(children, "support-quality-control-slides")

    const items: any[] = []
    itemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        items.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          buttonText: item.buttonText,
          image: item.image?.id ? mediaData[item.image.id] : null
        })))
      }
    })

    const found = titleNodes.length > 0 || items.length > 0
    console.log("[SupportTemplate] Quality Control data status:", { found, titleCount: titleNodes.length, itemCount: items.length })

    if (!found) return null

    return {
      title: titleNodes,
      items
    }
  }, [children, mediaData])

  // 5. Support Decorator Extraction
  const decoratorData = useMemo(() => {
    let leftNodes = extractAfterMarker(children, "support-decorator-left")
    let rightNodes = extractAfterMarker(children, "support-decorator-right")
    let imageNodes = extractAfterMarker(children, "support-decorator-image")

    const leftText = leftNodes.length > 0 ? getNodeTotalText(leftNodes[0]) : "busrom"
    const rightText = rightNodes.length > 0 ? getNodeTotalText(rightNodes[0]) : "support"
    
    let image = null
    const imgNode = imageNodes.find(n => n.type === "image" || n.type === "singleImage")
    if (imgNode) {
        const id = imgNode.type === "singleImage" 
            ? imgNode.data?.image?.id 
            : imgNode.image?.id
        if (id) {
            image = mediaData[id]
        }
    }

    return { leftText, rightText, image }
  }, [children, mediaData])

  // 6. Support Remote Extraction
  const remoteData = useMemo(() => {
    const titleNodes = extractAfterMarker(children, "support-remote-title")
    const descNodes = extractAfterMarker(children, "support-remote-description")
    const ctaNodes = extractAfterMarker(children, "support-remote-cta")
    const imageNodes = extractAfterMarker(children, "support-remote-image")

    let cta = { title: "24H Response", description: "Lightning-Fast Resolution", url: "/support" }
    const ctaNode = ctaNodes.find(n => n.type === "linkJump")
    if (ctaNode?.data) {
        cta = {
            title: ctaNode.data.title || "24H Response",
            description: ctaNode.data.description || "Lightning-Fast Resolution",
            url: ctaNode.data.url || "/support"
        }
    }

    let image = null
    const imgNode = imageNodes.find(n => n.type === "singleImage" || n.type === "image")
    if (imgNode) {
        const id = imgNode.type === "singleImage" ? imgNode.data?.image?.id : (imgNode as any).image?.id
        if (id) image = mediaData[id]
    }

    // Force return even if markers are missing for diagnostic visibility
    return { titleNodes, descNodes, cta, image }
  }, [children, mediaData])

  // 7. Support Request Process Extraction
  const processData = useMemo(() => {
    const titleNodes = extractAfterMarker(children, "support-request-process-title")
    const subtitleNodes = extractAfterMarker(children, "support-request-process-subtitle")
    
    // The items are now in a single iconList following the marker
    const itemNodes = extractAfterMarker(children, "support-request-process-item")
    const items: any[] = []
    
    const iconListNode = itemNodes.find(n => n.type === "iconList")
    if (iconListNode?.data?.items) {
      iconListNode.data.items.forEach((item: any, idx: number) => {
        items.push({
          id: `item-${idx + 1}`,
          title: item.title,
          content: [{ type: "text", text: item.title, format: 0 }], // Convert title to node format for rendering
          icon: item.icon ? { url: item.icon } : null
        })
      })
    }

    const found = titleNodes.length > 0 || subtitleNodes.length > 0 || items.length > 0
    if (!found) return null

    console.log("Process Data Debug:", { 
      hasTitle: titleNodes.length > 0, 
      hasSubtitle: subtitleNodes.length > 0, 
      subtitleText: subtitleNodes[0]?.children?.[0]?.text || "none" 
    })

    return { titleNodes, subtitleNodes, items }
  }, [children])

  // 8. Marketing and Sales Extraction
  const marketingData = useMemo(() => {
    // Top level guard - check for any marketing marker if title specifically fails
    let titleNodes = extractAfterMarker(children, "marketing-and-sales-title")
    if (titleNodes.length === 0) {
        // Try fallback to just 'marketing-and-sales'
        const guardNodes = extractAfterMarker(children, "marketing-and-sales")
        if (guardNodes.length === 0) return null
        
        // If we found the guard but not the title yet, try to find the title within the following nodes
        // But for simplicity, if 'marketing-and-sales' is present, we should proceed.
    }

    const titleStr = getNodeTotalText(titleNodes)

    // Area 1
    const area1TitleStr = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-area1-title"))
    const area1ItemNodes = extractAfterMarker(children, "marketing-and-sales-area1-item")
    const area1Items: any[] = []
    
    area1ItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        area1Items.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: item.image?.id ? mediaData[item.image.id] : null
        })))
      }
    })

    // Area 2
    const area2TitleStr = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-area2-title"))
    const area2ItemNodes = extractAfterMarker(children, "marketing-and-sales-area2-item")
    const area2Items: any[] = []
    
    area2ItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        area2Items.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: item.image?.id ? mediaData[item.image.id] : null
        })))
      }
    })

    // Decorator text
    const decoratorStr = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-decorator"))

    return {
      title: titleStr,
      decoratorText: decoratorStr || "SUPPORT",
      area1: { title: area1TitleStr, items: area1Items },
      area2: { title: area2TitleStr, items: area2Items }
    }
  }, [children, mediaData])

  // 9. Contact Form Extraction
  const contactFormData = useMemo(() => {
    // 1. Get the territory (marker-based) or use all children as scope
    const territoryNodes = extractAfterMarker(children, "contact-form")
    const searchScope = territoryNodes.length > 0 ? territoryNodes : children

    // 2. Sub-extraction from the relevant scope
    const title = getNodeTotalText(extractAfterMarker(searchScope, "contact-form-title"))
    const description = getNodeTotalText(extractAfterMarker(searchScope, "contact-form-description"))
    
    // Images from carousel or gallery in the marker territory or scope
    const imgNodes = extractAfterMarker(searchScope, "contact-form-image")
    // If no specific image marker, we also scavenge for gallery blocks in the scope
    const scavengedImgNodes = imgNodes.length > 0 ? imgNodes : searchScope

    const images: any[] = []
    
    // First try the specific marker territory
    scavengedImgNodes.forEach((node: any) => {
      if (node.type === "carousel" && node.data?.slides) {
        images.push(...node.data.slides.map((s: any) => {
          const imgRef = s.image?.id || s.image
          return imgRef ? (typeof imgRef === 'string' || typeof imgRef === 'number' ? mediaData[imgRef] : imgRef) : null
        }))
      }
      if (node.type === "custom-image-gallery" && node.data?.images) {
        images.push(...node.data.images.map((s: any) => {
          const imgRef = s.image?.id || s.image || s.media?.id || s.media
          return imgRef ? (typeof imgRef === 'string' || typeof imgRef === 'number' ? mediaData[imgRef] : imgRef) : null
        }))
      }
    })

    // FALLBACK: If still no images, search the ENTIRE children list for any gallery
    if (images.length === 0) {
      console.log("[SupportTemplate] No images found in marker territory. Scavenging entire children list...")
      children.forEach((node: any) => {
        if (node.type === "custom-image-gallery" && node.data?.images) {
          console.log("[SupportTemplate] Globally found gallery:", JSON.stringify(node.data))
          images.push(...node.data.images.map((s: any) => {
            const imgRef = s.image?.id || s.image || s.media?.id || s.media
            return imgRef ? (typeof imgRef === 'string' || typeof imgRef === 'number' ? mediaData[imgRef] : imgRef) : null
          }))
        }
      })
    }

    // Find form block in the scope
    const formNode = searchScope.find((n: any) => n.type === "formBlock")
    const blockFormConfig = formNode?.data?.formConfig || formNode?.data || null
    // Fallback to global formConfig if the block one is just an ID (missing fields)
    const formConfig = (blockFormConfig?.fields ? blockFormConfig : (pageContent as any).formConfig) || blockFormConfig

    // Require at least a form config or images to render
    if (images.length === 0 && !formConfig) return null

    return { 
      title: title || undefined, 
      description: description || undefined, 
      images, 
      formConfig 
    }
  }, [children, mediaData])

  console.log("[SupportTemplate] Sections found:", { 
    hero: !!heroData, 
    commitment: !!commitmentData, 
    customized: !!customizedData, 
    qualityControl: !!qualityControlData,
    decorator: !!decoratorData,
    remote: !!remoteData,
    process: !!processData,
    marketing: !!marketingData
  })

  return (
    <main className="w-full">
      {heroData && <SupportHeroSection data={heroData} />}
      
      {commitmentData && (
        <SupportCommitmentSection 
          title={commitmentData.mainTitle}
          subtitle={commitmentData.subtitle}
          technical={commitmentData.technical}
          marketing={commitmentData.marketing}
        />
      )}

      {customizedData && (
        <SupportCustomizedSection 
          title={customizedData.mainTitle}
          product={customizedData.product}
          manufacturing={customizedData.manufacturing}
        />
      )}

      {qualityControlData && (
        <SupportQualityControlSection 
          title={qualityControlData.title}
          items={qualityControlData.items}
        />
      )}

      {decoratorData && (
        <SupportDecoratorSection 
          leftText={decoratorData.leftText}
          rightText={decoratorData.rightText}
          image={decoratorData.image}
        />
      )}

      {remoteData && (
        <SupportRemoteSection 
          titleNodes={remoteData.titleNodes}
          descriptionNodes={remoteData.descNodes}
          cta={remoteData.cta}
          image={remoteData.image}
        />
      )}

      {processData && processData.items.length > 0 && (
        <SupportRequestProcessSection 
            titleNodes={processData.titleNodes}
            subtitleNodes={processData.subtitleNodes}
            items={processData.items}
        />
      )}

      {marketingData && (
        <SupportMarketingSalesSection data={marketingData} />
      )}

      {contactFormData && (
        <SupportContactFormSection 
          title={contactFormData.title}
          description={contactFormData.description}
          images={contactFormData.images}
          formConfig={contactFormData.formConfig}
          locale={locale}
        />
      )}
      
      {!heroData && !commitmentData && !customizedData && !qualityControlData && !remoteData && (
        <div className="py-20 text-center text-gray-500">
           No content identified on this page. Please check CMS markers.
        </div>
      )}
    </main>
  )
}
