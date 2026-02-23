"use client"

import React, { useMemo, useState, useEffect } from "react"
import { HeroSection } from "@/components/one-stop/sections/HeroSection"
import { ValuePropositionSection } from "@/components/one-stop/sections/ValuePropositionSection"
import { AdvantagesSection } from "@/components/one-stop/sections/AdvantagesSection"
import { PurchaseProcessSection } from "@/components/one-stop/sections/PurchaseProcessSection"
import { CategoriesGridSection } from "@/components/one-stop/sections/CategoriesGridSection"
import { TrustSection } from "@/components/one-stop/sections/TrustSection"

import { HighlightShowcaseSection } from "@/components/one-stop/sections/HighlightShowcaseSection"
import { ProductSeriesShowcaseSection } from "@/components/one-stop/sections/ProductSeriesShowcaseSection"
import { BrandHighlightsSection } from "@/components/one-stop/sections/BrandHighlightsSection"
import { CtaSection } from "@/components/one-stop/sections/CtaSection"
import { ApplicationsSection } from "@/components/one-stop/sections/ApplicationsSection"
import { OemOdmGuideSection } from "@/components/one-stop/sections/OemOdmGuideSection"

interface MediaObject {
  id: string
  url: string
  alt?: string
}

interface OneStopShopTemplateProps {
  locale: string
  pageContent: {
    title: string
    content?: { root?: { children?: any[] } } | null
    contentTranslation?: { root?: { children?: any[] } } | null
    mediaData?: Record<string, MediaObject>
    formConfig?: any
  }
}

/**
 * 核心逻辑：工具函数
 */
function isMarkerNode(node: any, markerId: string) {
  if (!node) return false
  const text = node.children?.map((c: any) => c.text || "").join("") || ""
  const isLexicalMarker = node.format === 16 || node.children?.some((c: any) => c.format === 16)
  return isLexicalMarker || text.includes(markerId)
}

/**
 * 提取特定“领土”内的所有数据项及其标题
 * Territory 定义：由相邻的 quote 分割而成的区域
 */
function extractSection(children: any[], markerId: string, mediaData: Record<string, MediaObject>) {
  // 1. 分割区域
  const sections: any[][] = []
  let currentSection: any[] = []
  for (const node of children) {
    if (node.type === "quote") {
      if (currentSection.length > 0) sections.push(currentSection)
      currentSection = [node]
    } else {
      currentSection.push(node)
    }
  }
  if (currentSection.length > 0) sections.push(currentSection)

  // 2. 找到包含 marker 的区域
  const targetSection = sections.find(sec => JSON.stringify(sec).includes(markerId))
  if (!targetSection) return { title: "", subtitle: "", items: [], titleNodes: [] }

  const items = extractItems(targetSection, -1, mediaData)
  
  // 3. 提取在该区域内且不是 marker 的标题节点
  const titleNodes = targetSection.filter(n => (n.type === "heading" || n.type === "paragraph") && !isMarkerNode(n, markerId))
  
  let title = ""
  let subtitle = ""

  if (titleNodes.length > 0) {
    title = titleNodes[0].children?.map((c: any) => c.type === "linebreak" ? "\n" : c.text || "").join("").trim() || ""
    if (titleNodes.length > 1) {
      subtitle = titleNodes[1].children?.map((c: any) => c.type === "linebreak" ? "\n" : c.text || "").join("").trim() || ""
    }
  }

  return { title, subtitle, items, titleNodes }
}

function extractItems(flatNodes: any[], markerIndex: number, mediaData: Record<string, MediaObject>) {
  const items: any[] = []
  const nodesAfter = flatNodes.slice(markerIndex + 1)
  
  for (const node of nodesAfter) {
    if (node.type === "carousel" && node.data?.slides) {
      items.push(...node.data.slides.map((s: any) => ({
        title: s.title || "",
        description: s.description || "",
        image: s.image ? (mediaData[typeof s.image === 'string' ? s.image : s.image.id] || null) : null,
        sourceType: node.type
      })))
    }

    if (node.type === "custom-image-gallery" && node.data?.images) {
      items.push(...node.data.images.map((g: any) => ({
        id: g.image?.id || g.image,
        image: mediaData[g.image?.id || g.image],
        title: g.title || "",
        link: g.linkUrl || "",
        sourceType: node.type
      })))
    }

    if (node.type === "applicationCarousel" && node.data?.applications) {
      items.push({
        sourceType: node.type,
        applicationIds: node.data.applications.map((a: any) => a.id)
      })
    }

    if (node.type === "list") {
      let currentItem: any = null
      node.children?.forEach((listItem: any) => {
        if (listItem.type === "listitem") {
          const getOwnText = (n: any) => {
            let t = ""
            n.children?.forEach((c: any) => {
              if (c.type === "text") t += c.text
              else if (c.type === "paragraph") t += c.children?.map((pc: any) => pc.text || "").join("")
            })
            return t.trim()
          }
          const ownText = getOwnText(listItem)
          const nestedList = listItem.children?.find((c: any) => c.type === "list")
          if (ownText) {
            currentItem = { title: ownText, description: "", sourceType: node.type }
            items.push(currentItem)
          } 
          if (nestedList) {
            const desc = nestedList.children?.map((li: any) => {
              return li.children?.map((c: any) => {
                if (c.text) return c.text
                if (c.children) return c.children.map((cc: any) => cc.text || "").join("")
                return ""
              }).join("")
            }).join("\n")
            if (currentItem) currentItem.description = desc.trim()
            else if (items.length > 0) items[items.length - 1].description = desc.trim()
          }
        }
      })
    }

    if (node.type === "singleImage" && node.data?.image) {
      items.push({
        image: mediaData[node.data.image.id || node.data.image],
        title: node.data.caption || "",
        sourceType: node.type
      })
    }
    if (node.type === "upload" && node.value) {
      items.push({
        image: mediaData[node.value.id || node.value],
        title: node.label || "",
        sourceType: node.type
      })
    }
  }
  return items
}

export function OneStopShopTemplate({ locale, pageContent }: OneStopShopTemplateProps) {
  const [productsData, setProductsData] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const contentChildren = useMemo(() => 
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [], 
    [pageContent]
  )
  const mediaData = pageContent.mediaData || {}

  const heroData = useMemo(() => extractSection(contentChildren, "one-stop-shop-introduction-carousel", mediaData), [contentChildren, mediaData])
  const problemsData = useMemo(() => extractSection(contentChildren, "one-stop-shop-value-item", mediaData), [contentChildren, mediaData])
  const advantagesData = useMemo(() => extractSection(contentChildren, "one-stop-shop-advantage-item", mediaData), [contentChildren, mediaData])
  const processData = useMemo(() => extractSection(contentChildren, "how-to-make-item", mediaData), [contentChildren, mediaData])
  const showcaseData = useMemo(() => extractSection(contentChildren, "product-show-item", mediaData), [contentChildren, mediaData])
  
  const categoriesTitle = useMemo(() => {
     const res = extractSection(contentChildren, "feature-product-item", mediaData)
     return { title: res.title || "Product Related To", subtitle: res.subtitle || "Busrom", items: res.items }
  }, [contentChildren, mediaData])
  
  const productSeriesData = useMemo(() => extractSection(contentChildren, "product-attribute-title", mediaData), [contentChildren, mediaData])

  // Brand Highlights with special title parsing
  const brandHighlightsData = useMemo(() => {
    const res = extractSection(contentChildren, "brand-highlights-item", mediaData)
    let titleLine1 = ""
    let titleLine2 = ""
    
    // Use the already filtered titleNodes from extractSection
    res.titleNodes.forEach(node => {
      // Small safety check: ensures we don't pick up markers that might have slipped through
      if (isMarkerNode(node, "brand-highlights-item")) return

      node.children?.forEach((child: any) => {
        const isBold = (child.format & 1) === 1
        if (child.type === "linebreak") {
          if (titleLine2) titleLine2 += "\n"
          else if (titleLine1) titleLine1 += "\n"
        } else if (child.text) {
          if (isBold) titleLine1 += child.text
          else titleLine2 += child.text
        }
      })
    })

    return { titleLine1: titleLine1.trim(), titleLine2: titleLine2.trim(), items: res.items }
  }, [contentChildren, mediaData])

  const trustDataRaw = useMemo(() => extractSection(contentChildren, "why-contractors-trust-us-item", mediaData), [contentChildren, mediaData])
  const trustData = useMemo(() => ({
    ...trustDataRaw,
    items: trustDataRaw.items.filter(it => it.title && !it.image)
  }), [trustDataRaw])
  const trustImages = useMemo(() => trustDataRaw.items.filter(it => it.image && it.sourceType === 'custom-image-gallery'), [trustDataRaw])
  
  const trustBgImage = useMemo(() => {
    const bgMarker = "why-contractors-trust-us-bg-image"
    const flatNodes = contentChildren
    const markerIdx = flatNodes.findIndex(n => JSON.stringify(n).includes(bgMarker))
    if (markerIdx !== -1) {
      const nextNode = flatNodes[markerIdx + 1]
      if (nextNode?.data?.image) return mediaData[nextNode.data.image.id || nextNode.data.image]
      if (nextNode?.value?.id) return mediaData[nextNode.value.id]
    }
    return null
  }, [contentChildren, mediaData])

  const ctaData = useMemo(() => {
     const res = extractSection(contentChildren, "contact-form", mediaData)
     const imgRes = extractSection(contentChildren, "contact-form-image", mediaData)
     const image = imgRes.items[0]?.image || null
     return { title: res.title, subtitle: res.subtitle, image }
  }, [contentChildren, mediaData])

  // Applications
  const [allApplications, setAllApplications] = useState<any[]>([])
  const applicationsDataRaw = useMemo(() => extractSection(contentChildren, "applications-item", mediaData), [contentChildren, mediaData])
  
  useEffect(() => {
    const carouselItem = applicationsDataRaw.items.find(it => it.sourceType === 'applicationCarousel')
    if (carouselItem && carouselItem.applicationIds?.length > 0) {
      fetch(`/api/applications?locale=${locale}&limit=100`)
        .then(res => res.json())
        .then(data => setAllApplications(data.docs || []))
    }
  }, [applicationsDataRaw, locale])

  const applicationsData = useMemo(() => {
    const carouselItem = applicationsDataRaw.items.find(it => it.sourceType === 'applicationCarousel')
    if (carouselItem && carouselItem.applicationIds) {
      const items = carouselItem.applicationIds.map((id: any) => {
        const app = allApplications.find(a => String(a.id) === String(id))
        if (!app) return null

        // 提取逻辑：优先主图 -> 其次场景图集第一张 -> 最后列表图
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
      }).filter(Boolean)
      return { title: applicationsDataRaw.title, items }
    }
    return applicationsDataRaw
  }, [applicationsDataRaw, allApplications])

  const oemOdmGuideData = useMemo(() => {
     const res = extractSection(contentChildren, "oem-odm-guide", mediaData)
     
     // Find the title text (the paragraph immediately following oem-odm-guide-title)
     let title = res.title || "READY TO\nJOIN IN BUSROM?"
     const titleMarkerIndex = contentChildren.findIndex(n => JSON.stringify(n).includes("oem-odm-guide-title"))
     if (titleMarkerIndex !== -1 && titleMarkerIndex + 1 < contentChildren.length) {
       const titleNode = contentChildren[titleMarkerIndex + 1]
       if (titleNode && titleNode.children) {
         title = titleNode.children.map((child: any) => {
           if (child.type === 'linebreak') return '\n'
           return child.text || ''
         }).join('')
       }
     }

     // Extract image by checking the node after the marker, or fallback to the first uploaded item in the section
     const bgImageIndex = contentChildren.findIndex(n => JSON.stringify(n).includes("oem-odm-guide-bg-image"))
     let bgImage = null
     if (bgImageIndex !== -1 && bgImageIndex + 1 < contentChildren.length) {
       const nextNode = contentChildren[bgImageIndex + 1]
       if (nextNode.type === "upload" && nextNode.value) {
         bgImage = mediaData[nextNode.value.id || nextNode.value]
       } else if (nextNode.type === "singleImage" && nextNode.data?.image) {
         bgImage = mediaData[nextNode.data.image.id || nextNode.data.image]
       }
     }
     if (!bgImage && res.items.length > 0 && res.items[0].image) {
       bgImage = res.items[0].image
     }
     // Extract CTA Link
     let ctaText = "READ MORE"
     let ctaLink = "/oem-odm"
     const ctaMarkerIndex = contentChildren.findIndex(n => JSON.stringify(n).includes("oem-odm-guide-cta"))
     if (ctaMarkerIndex !== -1 && ctaMarkerIndex + 1 < contentChildren.length) {
       const ctaNode = contentChildren[ctaMarkerIndex + 1]
       if (ctaNode && ctaNode.type === "linkJump" && ctaNode.data) {
         ctaText = ctaNode.data.description || ctaNode.data.title || "READ MORE"
         // Map internal page links to correct path if needed
         if (ctaNode.data.url) {
           ctaLink = ctaNode.data.url.replace('/pages/', '/')
         }
       }
     }

     return { ...res, title, bgImage, ctaText, ctaLink }
  }, [contentChildren, mediaData])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const res = await fetch(`/api/products?locale=${locale}&pageSize=12`)
        const data = await res.json()
        setProductsData(data.products || [])
      } catch (e) { console.error("Fetch failed", e) }
      finally { setLoadingProducts(false) }
    }
    fetchProducts()
  }, [locale])

  return (
    <div className="min-h-screen bg-[#F9F9F5]">
      <HeroSection slides={heroData.items} locale={locale} />
      <ValuePropositionSection title={problemsData.title} subtitle={problemsData.subtitle} problems={problemsData.items} advantages={[]} />
      <AdvantagesSection title={advantagesData.title} advantages={advantagesData.items} />
      <PurchaseProcessSection title={processData.title} slides={processData.items} />
      <CategoriesGridSection title={categoriesTitle.title} subtitle={categoriesTitle.subtitle} products={productsData} locale={locale} loading={loadingProducts} />
      {showcaseData.items.length > 0 && <HighlightShowcaseSection title={showcaseData.title} products={showcaseData.items} locale={locale} />}
      {productsData.length > 0 && <ProductSeriesShowcaseSection title={productSeriesData.title} products={productsData} locale={locale} />}
      {brandHighlightsData.items.length > 0 && <BrandHighlightsSection titleLine1={brandHighlightsData.titleLine1} titleLine2={brandHighlightsData.titleLine2} items={brandHighlightsData.items} />}
      <TrustSection title={trustData.title} items={trustData.items} images={trustImages} bgImage={trustBgImage} />
      <CtaSection title={ctaData.title} subtitle={ctaData.subtitle} image={ctaData.image} formConfig={pageContent.formConfig} />
      {applicationsData.items.length > 0 && <ApplicationsSection title={applicationsData.title} items={applicationsData.items} locale={locale} />}
      <OemOdmGuideSection 
        title={oemOdmGuideData.title} 
        description={oemOdmGuideData.subtitle} 
        bgImage={oemOdmGuideData.bgImage} 
        ctaText={oemOdmGuideData.ctaText}
        ctaLink={oemOdmGuideData.ctaLink}
        locale={locale} 
      />
    </div>
  )
}
