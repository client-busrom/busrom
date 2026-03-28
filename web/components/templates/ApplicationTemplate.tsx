"use client"

import React, { useMemo, useState, useEffect } from "react"
import { ApplicationHeroSection, HeroSlide } from "@/components/application/sections/ApplicationHeroSection"
import { ApplicationProductNavigationSection } from "@/components/application/sections/ApplicationProductNavigationSection"
import { ApplicationEngineerSaidSection } from "@/components/application/sections/ApplicationEngineerSaidSection"
import { ApplicationWhyChooseUsSection, WhyChooseUsItem } from "../application/sections/ApplicationWhyChooseUsSection"
import { ApplicationCasesSection, ApplicationCase } from "../application/sections/ApplicationCasesSection"
import { ApplicationMoreCasesSection } from "../application/sections/ApplicationMoreCasesSection"
import { ApplicationContactFormSection } from "../application/sections/ApplicationContactFormSection"
import { ApplicationGuideSection } from "../application/sections/ApplicationGuideSection"

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
  const targetMarker = markerId.toLowerCase().trim()
  for (const node of flat) {
    if (node.type === "paragraph" || node.type === "quote") {
      const t = (node.children || []).map((c: any) => c.text || "").join("").trim().toLowerCase()
      if (t === targetMarker) { 
        found = true
        continue 
      }
      // If we see another marker (format 16 AND contains -), we stop unless we just started
      if (found && (node.children?.[0]?.format === 16 || node.format === 16) && t.includes("-") && !t.startsWith("more-applications-")) {
          // Check if we already found SOMETHING meaningful before stopping
          if (result.length > 0) break
      }
    }
    if (found) result.push(node)
  }
  return result
}

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
        if (child.format === 1) gradientTitle += child.text
        else mainTitle += child.text
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

function parseWhyChooseUsItems(nodes: any[], imgNodes: any[], mediaData: any): WhyChooseUsItem[] {
  const listNode = nodes.find(n => n.type === "list")
  if (!listNode) return []
  
  const galleryNode = imgNodes.find(n => n.type === "custom-image-gallery")
  const rawImages = galleryNode?.data?.images || []
  
  const items: WhyChooseUsItem[] = []
  const listItems = listNode.children || []
  
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

  const heroItemNodes = extractAfterMarker(children, "hero-section-item")
  const slides = parseHeroSlides(heroItemNodes)

  const heroImgNodes = extractAfterMarker(children, "hero-section-image")
  const galleryNode = heroImgNodes.find(n => n.type === "custom-image-gallery")
  const rawImages: any[] = galleryNode?.data?.images || []
  const images = rawImages.map((img: any) => {
    const id = typeof img.image === 'object' && img.image ? img.image.id : String(img.image || "")
    return mediaData[id] || (id ? { id, url: "" } : null)
  }).filter(Boolean)

  const titleNodes = extractAfterMarker(children, "hero-section-title")
  const titleText = (titleNodes[0]?.children || []).map((c: any) => c.text).join("").trim()

  const subtitleNodes = extractAfterMarker(children, "hero-section-subtitle")
  const topSubtitleText = subtitleNodes?.length ? (subtitleNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  const rightBoxNodes = extractAfterMarker(children, "hero-section-right-box-text")
  const rightBoxText = rightBoxNodes?.length ? (rightBoxNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  const bottomBoxNodes = extractAfterMarker(children, "hero-section-bottom-box-text")
  const bottomBoxText = bottomBoxNodes?.length ? (bottomBoxNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""

  const ctaNodes = extractAfterMarker(children, "hero-section-cta")
  const ctaNode = ctaNodes.find((n: any) => n.type === "linkJump")
  const seeAllText = ctaNode?.data?.title || ""
  const seeAllHref = ctaNode?.data?.url || ""

  const navCtaNodes = extractAfterMarker(children, "product-navigation-cta")
  const navCtaNode = navCtaNodes.find((n: any) => n.type === "linkJump")
  const navCtaText = navCtaNode?.data?.title || "VIEW MORE"
  const navCtaHref = navCtaNode?.data?.url || ""

  const navItemNodes = extractAfterMarker(children, "product-navigation-item")
  const carouselNode = navItemNodes.find((n: any) => n.type === "productCarousel")
  const carouselItems = carouselNode?.data?.items || []

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

  const whyItemNodes = extractAfterMarker(children, "why-contractors-choose-us-item")
  const whyImgNodes = extractAfterMarker(children, "why-contractors-choose-us-image")
  const whyChooseUsItems = parseWhyChooseUsItems(whyItemNodes, whyImgNodes, mediaData)

  const getImageFromNodes = (nodes: any[]) => {
    // Look for any node that might be an image container
    const uploadNode = nodes.find(n => 
      n.type === 'upload' || n.type === 'image' || n.type === 'custom-image' || n.type === 'singleImage' || n.type === 'custom-image-gallery'
    )
    if (!uploadNode) return undefined
    
    const resolveMedia = (val: any) => {
      if (!val) return undefined
      if (typeof val === 'string' && val.startsWith('http')) return val
      if (val.url) return val.url
      const id = typeof val === 'object' ? val.id : String(val)
      return (id && mediaData[id]) ? mediaData[id].url : undefined
    }

    // Try multiple paths used in different Lexical blocks
    return resolveMedia(uploadNode.value) || 
           resolveMedia(uploadNode.data?.image) || 
           resolveMedia(uploadNode.data?.images?.[0]?.image) ||
           resolveMedia(uploadNode.url)
  }

  const findImgUrlByMarker = (marker: string) => {
    // Strategy 1: Standard extraction
    const nodes = extractAfterMarker(children, marker)
    let url = getImageFromNodes(nodes)
    if (url) return url

    // Strategy 2: Direct neighbor (from OneStopShopTemplate pattern)
    const flat = flattenChildren(children)
    const mid = marker.toLowerCase().trim()
    const idx = flat.findIndex(n => JSON.stringify(n).toLowerCase().includes(mid))
    if (idx !== -1 && idx + 1 < flat.length) {
      // Look at the next few nodes in case there's an empty paragraph
      for (let i = 1; i <= 3 && idx + i < flat.length; i++) {
        const next = flat[idx + i]
        const nextUrl = getImageFromNodes([next])
        if (nextUrl) return nextUrl
      }
    }
    return undefined
  }

  const contactBgUrl = findImgUrlByMarker("contact-form-bg-image")
  const contactDisplayUrl = findImgUrlByMarker("contact-form-image") || findImgUrlByMarker("contact-form-display-image")
  const contactLogoUrl = findImgUrlByMarker("contact-form-logo")

  const contactTextNodes = extractAfterMarker(children, "contact-form-title")
  const contactRichText = contactTextNodes.length ? contactTextNodes.filter(n => n.type !== 'formBlock' && n.type !== 'paragraph' || (n.children && n.children.length > 0 && n.children[0].text && !n.children[0].text.includes('-'))).flatMap((n: any) => n.children || []).map((c: any) => ({
    text: c.text,
    bold: (c.format & 1) === 1
  })).filter(s => s.text) : []

  const contactFormBlock = contactTextNodes.find(n => n.type === 'formBlock')

  const applicationCasesNodes = extractAfterMarker(children, "applications-item")
  const applicationCarouselNode = applicationCasesNodes.find((n: any) => n.type === "applicationCarousel")
  const applicationIds = applicationCarouselNode?.data?.applications?.map((a: any) => a.id) || []
  
  const moreAppNodesRaw = extractAfterMarker(children, "more-applications")
  
  const findSubContent = (nodes: any[], marker: string) => {
    const idx = nodes.findIndex(n => {
      const text = (n.children || []).map((c: any) => c.text || "").join("").trim()
      return text === marker
    })
    if (idx === -1) return []
    const result: any[] = []
    for (let i = idx + 1; i < nodes.length; i++) {
      const node = nodes[i]
      const text = (node.children || []).map((c: any) => c.text || "").join("").trim()
      if (text.startsWith("more-applications-")) break
      result.push(node)
    }
    return result
  }
  
  const moreTitleNodes = findSubContent(moreAppNodesRaw, "more-applications-title")
  const moreAppTitle = moreTitleNodes.length ? (moreTitleNodes[0]?.children || []).map((c: any) => ({
    text: c.text,
    bold: (c.format & 1) === 1
  })) : []
  
  const moreTipsNodes = findSubContent(moreAppNodesRaw, "more-applications-tips")
  const moreAppTips = moreTipsNodes.length ? (moreTipsNodes[0]?.children || []).map((c: any) => c.text).join("").trim() : ""
  
  const ctaSearchNodes = findSubContent(moreAppNodesRaw, "more-applications-cta")
  const moreAppCtaNode = ctaSearchNodes.find((n: any) => n.type === "linkJump")
  const moreAppCtaText = moreAppCtaNode?.data?.title || "VIEW MORE"
  const moreAppCtaHref = moreAppCtaNode?.data?.url || ""
  
  const moreAppCarouselNode = moreAppNodesRaw.find((n: any) => 
    n.type === "applicationCarousel" || n.type === "productCarousel" || n.type === "application-carousel"
  )
  const moreAppIds = moreAppCarouselNode?.data?.applications?.map((a: any) => a.id) || []
  
  const hasMoreApplications = moreAppNodesRaw.length > 0
  
  const findRichTextByMarker = (marker: string) => {
    const nodes = extractAfterMarker(children, marker)
    if (nodes.length === 0) {
      // Neighbor search fallback
      const flat = flattenChildren(children)
      const mid = marker.toLowerCase().trim()
      const idx = flat.findIndex(n => JSON.stringify(n).toLowerCase().includes(mid))
      if (idx !== -1 && idx + 1 < flat.length) {
        nodes.push(flat[idx + 1])
      }
    }

    return nodes.map(n => n.children || []).flat().map((c: any) => ({
      text: c.text || "",
      bold: !!c.format && (c.format & 1) !== 0,
      italic: !!c.format && (c.format & 2) !== 0,
      linebreak: c.type === 'linebreak'
    }))
  }

  const findLinkByMarker = (marker: string) => {
    const nodes = extractAfterMarker(children, marker)
    const linkNode = nodes.find(n => n.type === 'linkJump')
    if (linkNode) return { title: linkNode.data?.title || linkNode.data?.description || "", url: linkNode.data?.url || "" }
    
    // Neighbor search
    const flat = flattenChildren(children)
    const mid = marker.toLowerCase().trim()
    const idx = flat.findIndex(n => JSON.stringify(n).toLowerCase().includes(mid))
    if (idx !== -1 && idx + 1 < flat.length) {
      const next = flat[idx + 1]
      if (next.type === 'linkJump') return { title: next.data?.title || next.data?.description || "", url: next.data?.url || "" }
    }
    return undefined
  }

  const guideTitle = findRichTextByMarker("application-guide-title")
  const guideImage = findImgUrlByMarker("application-guide-image")
  const guideDescription = findRichTextByMarker("application-guide-description")
  const guideServiceCta = findLinkByMarker("application-guide-cta-service")
  const guideOemCta = findLinkByMarker("application-guide-cta-oem-odm")

  return {
    slides, images, titleText, topSubtitleText, rightBoxText, bottomBoxText, seeAllText, seeAllHref,
    navCtaText, navCtaHref, carouselItems,
    engineerMainQuote, engineerLeftQuote, engineerRightQuote, engineerCtaText, engineerCtaHref, engineerImageUrl, workImageUrl,
    whyChooseUsItems,
    applicationIds,
    hasMoreApplications,
    moreApplicationsData: {
      title: moreAppTitle,
      tips: moreAppTips,
      ctaText: moreAppCtaText,
      ctaHref: moreAppCtaHref,
      applicationIds: moreAppIds
    },
    contactBgUrl,
    contactDisplayUrl,
    contactLogoUrl,
    contactRichText,
    contactFormBlock,
    guideData: {
      title: guideTitle,
      image: guideImage,
      description: guideDescription,
      serviceCta: guideServiceCta,
      oemCta: guideOemCta
    },
    applicationTitle: findRichTextByMarker("applications-title").map(t => t.text).join(""),
    applicationSubtitle: findRichTextByMarker("applications-subtitle").map(t => t.text).join(""),
    applicationTitleImage: findImgUrlByMarker("applications-title-image"),
    whyChooseUsDecorate: findRichTextByMarker("why-contractors-choose-us-decorate").map(t => t.text).join(""),
    whyChooseUsTitle: findRichTextByMarker("why-contractors-choose-us-title").map(t => t.text).join("")
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
    hasMoreApplications,
    moreApplicationsData,
    contactBgUrl,
    contactDisplayUrl,
    contactLogoUrl,
    contactRichText,
    contactFormBlock,
    guideData,
    applicationTitle,
    applicationSubtitle,
    applicationTitleImage,
    whyChooseUsDecorate,
    whyChooseUsTitle
  } = useMemo(() => extractSections(pageContent), [pageContent])

  const [allApplications, setAllApplications] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/applications?locale=${locale}&limit=100`)
      .then(res => res.json())
      .then(data => setAllApplications(data.docs || []))
  }, [locale])

  const applicationCases = useMemo(() => {
    if (!applicationIds || applicationIds.length === 0) return []
    return applicationIds.map((id: any) => {
      const app = allApplications.find((a: any) => String(a.id) === String(id))
      if (!app) return null
      let appImage = app.mainImage
      if (!appImage && app.images?.length > 0) {
        appImage = app.images[0].image || app.images[0]
      }
      if (!appImage && app.sceneGallery?.length > 0) {
        const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
        if (firstGroup) {
          const firstImg = firstGroup.images[0]
          appImage = firstImg.image || firstImg
        }
      }
      const imageUrl = (typeof appImage === 'string' ? appImage : (appImage?.url || ""))
      return {
        id: app.id,
        title: app.title || app.name || "",
        image: imageUrl,
        category: app.category?.title || app.category?.name || "Application"
      }
    }).filter(Boolean) as ApplicationCase[]
  }, [applicationIds, allApplications])

  const moreApplicationCases = useMemo(() => {
    const ids = moreApplicationsData?.applicationIds || []
    if (ids.length === 0) return []
    return ids.map((id: any) => {
      const targetId = typeof id === 'object' ? (id.id || id.value) : id
      const app = allApplications.find((a: any) => String(a.id) === String(targetId))
      if (!app) return null
      
      let appImage = app.mainImage
      if (!appImage && app.images?.length > 0) {
        appImage = app.images[0].image || app.images[0]
      }
      if (!appImage && app.sceneGallery?.length > 0) {
        const firstGroup = app.sceneGallery.find((g: any) => g.images?.length > 0)
        if (firstGroup) {
          const firstImg = firstGroup.images[0]
          appImage = firstImg.image || firstImg
        }
      }
      const imageUrl = (typeof appImage === 'string' ? appImage : (appImage?.url || ""))
      return {
        id: String(app.id),
        title: app.title || app.name || "",
        image: imageUrl
      }
    }).filter(Boolean)
  }, [moreApplicationsData, allApplications])

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
        decorate={whyChooseUsDecorate || undefined}
        title={whyChooseUsTitle || undefined}
        items={whyChooseUsItems.length > 0 ? whyChooseUsItems : undefined}
      />
      <ApplicationCasesSection 
        title={applicationTitle || undefined}
        subtitle={applicationSubtitle || undefined}
        titleImage={applicationTitleImage}
        cases={applicationCases.length > 0 ? applicationCases : undefined}
      />
      {hasMoreApplications && <ApplicationMoreCasesSection locale={locale} data={moreApplicationsData} />}
      <ApplicationContactFormSection 
        locale={locale} 
        bgImage={contactBgUrl}
        displayImage={contactDisplayUrl}
        logoImage={contactLogoUrl}
        richText={contactRichText}
        formId={contactFormBlock?.formConfig?.id}
      />
      <ApplicationGuideSection 
        title={guideData.title}
        image={guideData.image}
        description={guideData.description}
        serviceCta={guideData.serviceCta}
        oemCta={guideData.oemCta}
      />
    </div>
  )
}
