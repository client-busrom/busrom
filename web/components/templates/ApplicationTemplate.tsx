"use client"

import React, { useMemo, useState, useEffect } from "react"
import { ApplicationHeroSection, HeroSlide } from "@/components/application/sections/ApplicationHeroSection"
import { ApplicationProductNavigationSection } from "@/components/application/sections/ApplicationProductNavigationSection"
import { ApplicationEngineerSaidSection } from "@/components/application/sections/ApplicationEngineerSaidSection"
import { ApplicationWhyChooseUsSection, WhyChooseUsItem } from "../application/sections/ApplicationWhyChooseUsSection"
import { ApplicationCasesSection, ApplicationCase } from "../application/sections/ApplicationCasesSection"
import { ApplicationMoreCasesSection } from "../application/sections/ApplicationMoreCasesSection"

interface MediaObject {
  id: string
  url: string
  alt?: string
  [key: string]: any
}

interface ApplicationTemplateProps {
  locale: string
  pageContent: {
    title: string
    content?: { root?: { children?: any[] } } | null
    contentTranslation?: { root?: { children?: any[] } } | null
    mediaData?: Record<string, MediaObject>
    formConfig?: any | null
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flattenChildren(children: any[]): any[] {
  const result: any[] = []
  for (const node of children) {
    if (node.type === "layout" && node.columns) {
      for (const col of node.columns) {
        if (col.children) result.push(...flattenChildren(col.children))
      }
    } else {
      result.push(node)
    }
  }
  return result
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  const flat = flattenChildren(children)
  let found = false
  const result: any[] = []
  for (const node of flat) {
    if (node.type === "paragraph" || node.type === "quote") {
      const t = node.children?.[0]?.text || ""
      if (t === markerId) { found = true; continue }
      if (found && node.children?.[0]?.format === 16 && t.includes("-")) break
    }
    if (found) result.push(node)
  }
  return result
}

/** Parse hero-section-item list into slides.
 *  Structure: pairs of listItems — odd = title (bold=gradientTitle, plain=mainTitle), even = subtitle (nested list) */
function parseHeroSlides(nodes: any[]): HeroSlide[] {
  const listNode = nodes.find(n => n.type === "list")
  if (!listNode) return []

  const items: any[] = listNode.children || []
  const slides: HeroSlide[] = []

  for (let i = 0; i < items.length; i += 2) {
    const titleItem = items[i]
    const subtitleItem = items[i + 1]
    if (!titleItem) break

    let gradientTitle = ""
    let mainTitle = ""

    for (const child of titleItem.children || []) {
      if (child.type === "text") {
        if (child.format === 1) gradientTitle += child.text   // bold = gradient ghost
        else mainTitle += child.text                           // normal = gold main
      }
    }

    let subtitle = ""
    if (subtitleItem) {
      const nestedList = subtitleItem.children?.find((c: any) => c.type === "list")
      if (nestedList) {
        subtitle = (nestedList.children?.[0]?.children || [])
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")
      } else {
        subtitle = (subtitleItem.children || [])
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")
      }
    }

    slides.push({
      gradientTitle: gradientTitle.trim(),
      mainTitle: mainTitle.trim(),
      subtitle: subtitle.trim(),
    })
  }

  return slides
}

// ─── Extraction ───────────────────────────────────────────────────────────────

function parseWhyChooseUsItems(nodes: any[], imgNodes: any[], mediaData: any): WhyChooseUsItem[] {
  const listNode = nodes.find(n => n.type === "list")
  if (!listNode) return []
  
  const galleryNode = imgNodes.find(n => n.type === "custom-image-gallery")
  const rawImages = galleryNode?.data?.images || []
  
  const items: WhyChooseUsItem[] = []
  const listItems = listNode.children || []
  
  // Logic: Odd index (1st, 3rd...) for title, Even index (2nd, 4th...) for content
  // In 0-indexed code: i for title, i+1 for description
  for (let i = 0; i < listItems.length; i += 2) {
    const titleItem = listItems[i]
    const contentItem = listItems[i + 1]
    if (!titleItem) break
    
    const title = (titleItem.children || [])
      .map((c: any) => {
        if (c.type === 'linebreak') return '\n'
        return c.text || ''
      })
      .join("")
      
    const descriptionParts: { text: string, bold?: boolean }[] = []
    if (contentItem) {
      const children = contentItem.children || []
      const nestedList = children.find((c: any) => c.type === "list")
      
      let targetNodes: any[] = []
      if (nestedList) {
        const listItems = nestedList.children || []
        listItems.forEach((li: any, liIdx: number) => {
          if (li.children) targetNodes.push(...li.children)
          // Add a newline between list items
          if (liIdx < listItems.length - 1) {
            targetNodes.push({ type: 'linebreak' })
          }
        })
      } else {
        targetNodes = children
      }
      
      targetNodes.forEach((node: any) => {
        if (node.type === 'text') {
          descriptionParts.push({
            text: node.text,
            bold: (node.format & 1) === 1
          })
        } else if (node.type === 'linebreak') {
          descriptionParts.push({ text: '\n' })
        }
      })
    }
    
    const description = descriptionParts.map(p => p.text).join("")
    
    const itemIdx = i / 2
    const item1 = rawImages[itemIdx * 2]
    const item2 = rawImages[itemIdx * 2 + 1]
    const img1Id = typeof item1?.image === 'object' && item1.image ? item1.image.id : String(item1?.image || "")
    const img2Id = typeof item2?.image === 'object' && item2.image ? item2.image.id : String(item2?.image || "")
    
    items.push({
      id: String(itemIdx + 1),
      number: String(itemIdx + 1).padStart(2, '0'),
      title,
      description,
      descriptionParts,
      imageLeft: img1Id ? mediaData[img1Id]?.url : "",
      imageRight: img2Id ? mediaData[img2Id]?.url : ""
    })
  }
  
  return items
}

function extractSections(pageContent: any) {
  const root = pageContent?.contentTranslation?.root || pageContent?.content?.root
  const children: any[] = root?.children || []
  const mediaData: Record<string, MediaObject> = pageContent?.mediaData || {}

  // Slides
  const heroItemNodes = extractAfterMarker(children, "hero-section-item")
  const slides = parseHeroSlides(heroItemNodes)

  // Images (custom-image-gallery)
  const heroImgNodes = extractAfterMarker(children, "hero-section-image")
  const galleryNode = heroImgNodes.find(n => n.type === "custom-image-gallery")
  const rawImages: any[] = galleryNode?.data?.images || []
  const images = rawImages.map((img: any) => {
    const id = typeof img.image === 'object' && img.image ? img.image.id : String(img.image || "")
    return mediaData[id] || (id ? { id, url: "" } : null)
  }).filter(Boolean)

  // Title label (hero-section-title)
  const titleNodes = extractAfterMarker(children, "hero-section-title")
  const titleText = (titleNodes[0]?.children || []).map((c: any) => c.text).join("").trim()

  // Top subtitle label (hero-section-subtitle)
  const subtitleNodes = extractAfterMarker(children, "hero-section-subtitle")
  const topSubtitleText = subtitleNodes?.length ? (subtitleNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  // Right box label (hero-section-right-box-text)
  const rightBoxNodes = extractAfterMarker(children, "hero-section-right-box-text")
  const rightBoxText = rightBoxNodes?.length ? (rightBoxNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  // Bottom box label (hero-section-bottom-box-text)
  const bottomBoxNodes = extractAfterMarker(children, "hero-section-bottom-box-text")
  const bottomBoxText = bottomBoxNodes?.length ? (bottomBoxNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  // See All CTA (hero-section-cta)
  const ctaNodes = extractAfterMarker(children, "hero-section-cta")
  const ctaNode = ctaNodes.find((n: any) => n.type === "linkJump")
  const seeAllText = ctaNode?.data?.title || ""
  const seeAllHref = ctaNode?.data?.url || ""

  // Product Navigation
  const navCtaNodes = extractAfterMarker(children, "product-navigation-cta")
  const navCtaNode = navCtaNodes.find((n: any) => n.type === "linkJump")
  const navCtaText = navCtaNode?.data?.title || "VIEW MORE"
  const navCtaHref = navCtaNode?.data?.url || ""

  const navItemNodes = extractAfterMarker(children, "product-navigation-item")
  const carouselNode = navItemNodes.find((n: any) => n.type === "productCarousel")
  const carouselItems = carouselNode?.data?.items || []

  // Engineer Said Section
  const engMainNodes = extractAfterMarker(children, "engineer-said-center")
  const engineerMainQuote = engMainNodes?.length ? (engMainNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : undefined

  const engLeftNodes = extractAfterMarker(children, "engineer-said-left")
  const engineerLeftQuote = engLeftNodes?.length ? (engLeftNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : undefined

  const engRightNodes = extractAfterMarker(children, "engineer-said-right")
  const engineerRightQuote = engRightNodes?.length ? (engRightNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : undefined

  const engCtaNodes = extractAfterMarker(children, "engineer-said-cta")
  const engCtaNode = engCtaNodes.find((n: any) => n.type === "linkJump")
  const engineerCtaText = engCtaNode?.data?.description || engCtaNode?.data?.title || "Explore\nMore"
  const engineerCtaHref = engCtaNode?.data?.url || ""

  const engImgNodes = extractAfterMarker(children, "engineer-said-image")
  const engUploadNode = engImgNodes.find((n: any) => n.type === "upload")
  const engImgId = typeof engUploadNode?.value === 'object' && engUploadNode.value ? engUploadNode.value.id : String(engUploadNode?.value || "")
  const engineerImageUrl = (engImgId && mediaData[engImgId]) ? mediaData[engImgId].url : undefined

  const workImgNodes = extractAfterMarker(children, "engineer-said-work")
  const workUploadNode = workImgNodes.find((n: any) => n.type === "upload")
  const workImgId = typeof workUploadNode?.value === 'object' && workUploadNode.value ? workUploadNode.value.id : String(workUploadNode?.value || "")
  const workImageUrl = (workImgId && mediaData[workImgId]) ? mediaData[workImgId].url : undefined

  // Why Choose Us
  const whyItemNodes = extractAfterMarker(children, "why-contractors-choose-us-item")
  const whyImgNodes = extractAfterMarker(children, "why-contractors-choose-us-image")
  const whyChooseUsItems = parseWhyChooseUsItems(whyItemNodes, whyImgNodes, mediaData)

  // Application Cases Container
  const applicationCasesNodes = extractAfterMarker(children, "applications-item")
  const applicationCarouselNode = applicationCasesNodes.find((n: any) => n.type === "applicationCarousel")
  const applicationIds = applicationCarouselNode?.data?.applications?.map((a: any) => a.id) || []
  
  // More Applications Marker
  const allNodesFlat = flattenChildren(children)
  const hasMoreApplications = allNodesFlat.some(fn => {
    const text = fn.children?.[0]?.text || ""
    return (fn.type === "paragraph" || fn.type === "quote") && text.trim() === "more-applications"
  })
  
  return {
    slides, 
    images, 
    titleText, 
    topSubtitleText, 
    rightBoxText, 
    bottomBoxText, 
    seeAllText, 
    seeAllHref,
    navCtaText, 
    navCtaHref, 
    carouselItems,
    engineerMainQuote, 
    engineerLeftQuote, 
    engineerRightQuote, 
    engineerCtaText, 
    engineerCtaHref, 
    engineerImageUrl, 
    workImageUrl,
    whyChooseUsItems,
    applicationIds,
    hasMoreApplications
  }
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function ApplicationTemplate({ locale, pageContent }: ApplicationTemplateProps) {
  const { 
    slides, images, titleText, topSubtitleText, rightBoxText, bottomBoxText, seeAllText, seeAllHref, 
    navCtaText, navCtaHref, carouselItems,
    engineerMainQuote, engineerLeftQuote, engineerRightQuote, engineerCtaText, engineerCtaHref, engineerImageUrl, workImageUrl,
    whyChooseUsItems,
    applicationIds,
    hasMoreApplications
  } = useMemo(() => extractSections(pageContent), [pageContent])

  const [allApplications, setAllApplications] = useState<any[]>([])

  useEffect(() => {
    if (applicationIds && applicationIds.length > 0) {
      fetch(`/api/applications?locale=${locale}&limit=100`)
        .then(res => res.json())
        .then(data => setAllApplications(data.docs || []))
    }
  }, [applicationIds, locale])

  const applicationCases = useMemo(() => {
    if (!applicationIds || applicationIds.length === 0) return []
    return applicationIds.map((id: any) => {
      const app = allApplications.find((a: any) => String(a.id) === String(id))
      if (!app) return null

      // Logic: Main Image -> First Scene Image -> List Image
      let appImage = app.mainImage
      if (!appImage && app.sceneGallery?.length > 0) {
        const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
        if (firstGroup) appImage = firstGroup.images[0].image || firstGroup.images[0]
      }
      if (!appImage && app.images?.length > 0) {
        appImage = app.images[0].image || app.images[0]
      }

      const imageUrl = typeof appImage === 'string' ? appImage : (appImage?.url || "")

      return {
        id: app.id,
        title: app.title || app.name || "",
        image: imageUrl,
        category: app.category?.title || app.category?.name || "Application"
      }
    }).filter(Boolean) as ApplicationCase[]
  }, [applicationIds, allApplications])

  return (
    <div className="flex flex-col min-h-screen">
      <ApplicationHeroSection
        title={titleText || "APPLICATION"}
        topSubtitle={topSubtitleText || "CASES"}
        rightBoxText={rightBoxText || "APPLICATION CASES"}
        bottomBoxText={bottomBoxText || "VIEW MORE"}
        seeAllText={seeAllText || "SEE ALL"}
        seeAllHref={seeAllHref}
        slides={slides}
        images={images}
        locale={locale}
      />
      <ApplicationProductNavigationSection
        carouselItems={carouselItems}
        ctaText={navCtaText}
        ctaHref={navCtaHref}
        locale={locale}
      />
      <ApplicationEngineerSaidSection
        mainQuote={engineerMainQuote}
        leftQuote={engineerLeftQuote}
        rightQuote={engineerRightQuote}
        ctaText={engineerCtaText}
        ctaHref={engineerCtaHref}
        engineerImage={engineerImageUrl}
        workImage={workImageUrl}
      />
      <ApplicationWhyChooseUsSection 
        items={whyChooseUsItems.length > 0 ? whyChooseUsItems : undefined}
      />
      <ApplicationCasesSection 
        cases={applicationCases.length > 0 ? applicationCases : undefined}
      />
      {hasMoreApplications && <ApplicationMoreCasesSection locale={locale} />}
      {/* More sections coming soon */}
    </div>
  )
}
