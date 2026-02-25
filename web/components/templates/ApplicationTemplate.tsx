"use client"

import React, { useMemo } from "react"
import { ApplicationHeroSection, HeroSlide } from "@/components/application/sections/ApplicationHeroSection"
import { ApplicationProductNavigationSection } from "@/components/application/sections/ApplicationProductNavigationSection"
import { ApplicationEngineerSaidSection } from "@/components/application/sections/ApplicationEngineerSaidSection"

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
    const id = img.image
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
  const engineerCtaText = engCtaNode?.data?.title || "Explore\nMore"
  const engineerCtaHref = engCtaNode?.data?.url || ""

  const engImgNodes = extractAfterMarker(children, "engineer-said-image")
  const engUploadNode = engImgNodes.find((n: any) => n.type === "upload")
  const engImgId = engUploadNode?.value?.id || engUploadNode?.value
  const engineerImageUrl = engImgId ? mediaData[engImgId]?.url : undefined

  const workImgNodes = extractAfterMarker(children, "engineer-said-work")
  const workUploadNode = workImgNodes.find((n: any) => n.type === "upload")
  const workImgId = workUploadNode?.value?.id || workUploadNode?.value
  const workImageUrl = workImgId ? mediaData[workImgId]?.url : undefined

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
    workImageUrl
  }
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function ApplicationTemplate({ locale, pageContent }: ApplicationTemplateProps) {
  const { 
    slides, images, titleText, topSubtitleText, rightBoxText, bottomBoxText, seeAllText, seeAllHref, 
    navCtaText, navCtaHref, carouselItems,
    engineerMainQuote, engineerLeftQuote, engineerRightQuote, engineerCtaText, engineerCtaHref, engineerImageUrl, workImageUrl
  } = useMemo(() => extractSections(pageContent), [pageContent])

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
      {/* More sections coming soon */}
    </div>
  )
}
