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

interface OneStopSolutionTemplateProps {
  locale: string
  pageContent: any
}

/**
 * 核心逻辑：工具函数
 */
function isMarkerNode(node: any, markerId: string) {
  if (!node) return false
  const text = node.children?.[0]?.text || ""
  const isLexicalMarker = node.format === 16 || node.children?.some((c: any) => c.format === 16)
  return isLexicalMarker && text === markerId
}

/**
 * 判断是否为任何 Marker 节点（格式为 16）
 */
function isAnyMarkerNode(node: any) {
  if (!node) return false
  return node.format === 16 || node.children?.some((c: any) => c.format === 16)
}

/**
 * 递归抓取节点下所有文本（深度优先），处理深度嵌套的 List 结构
 */
function getDeepText(node: any): string {
  if (!node) return ""
  if (typeof node === "string") return node
  if (node.text !== undefined) return node.text

  if (node.children && Array.isArray(node.children)) {
    return node.children
      .map((child: any) => {
        if (child.type === "linebreak") return "\n"
        return getDeepText(child)
      })
      .join("")
  }
  return ""
}

/**
 * 从 Applications 数据结构中随机抓取一张图片 (Double-Random 逻辑)
 * 1. 随机选一个有图的场景 (sceneGallery)
 * 2. 从该场景中随机选一张图 (images)
 */
function getRandomAppImage(app: any) {
  if (!app?.sceneGallery || app.sceneGallery.length === 0) return null
  
  const validScenes = app.sceneGallery.filter((s: any) => s.images && s.images.length > 0)
  if (validScenes.length === 0) return null
  
  // 1. 随机场景
  const randomScene = validScenes[Math.floor(Math.random() * validScenes.length)]
  // 2. 随机图片
  const randomImage = randomScene.images[Math.floor(Math.random() * randomScene.images.length)]
  
  return randomImage
}


/**
 * 专门解析 TrustSection 的“奇偶配对”有序列表
 * 奇数项（1, 3, 5...）为 Title
 * 偶数项（2, 4, 6...）为包含嵌套内容的 Description
 */
function parseTrustItems(nodes: any[]): { title: string; description: string }[] {
  const listNode = nodes.find((n) => n.type === "list")
  if (!listNode || !listNode.children) return []

  const pairs: { title: string; description: string }[] = []
  const listItems = listNode.children

  // 步长为 2 遍历直接子项（listitem）
  for (let i = 0; i < listItems.length; i += 2) {
    const titleItem = listItems[i]
    const contentItem = listItems[i + 1]

    if (titleItem) {
      const title = getDeepText(titleItem).trim()
      // 如果没有偶数项，或者偶数项为空，description 留空
      const description = contentItem ? getDeepText(contentItem).trim() : ""
      
      if (title || description) {
        pairs.push({ title, description })
      }
    }
  }
  return pairs
}

/**
 * 提取特定“领土”内的所有数据项及其标题
 */
function extractSection(children: any[], markerId: string, mediaData: Record<string, MediaObject>) {
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

  const targetSection = sections.find(sec => JSON.stringify(sec).includes(markerId))
  if (!targetSection) return { title: "", subtitle: "", items: [], titleNodes: [], autoplay: false, interval: 5 }

  const carouselNode = targetSection.find(n => n.type === "carousel")
  const autoplay = carouselNode?.data?.autoplay ?? false
  const interval = carouselNode?.data?.interval ?? 5

  const items: any[] = []
  targetSection.forEach(node => {
    if (node.type === "carousel" && node.data?.slides) {
      items.push(...node.data.slides.map((s: any) => ({
        title: s.title || "",
        description: s.description || "",
        image: s.image ? (mediaData[typeof s.image === 'object' && s.image ? s.image.id : String(s.image)] || null) : null,
        sourceType: node.type
      })))
    }
    if (node.type === "custom-image-gallery" && node.data?.images) {
      items.push(...node.data.images.map((g: any) => ({
        id: typeof g.image === 'object' && g.image ? g.image.id : String(g.image || ""),
        image: mediaData[typeof g.image === 'object' && g.image ? g.image.id : String(g.image || "")],
        title: g.title || "",
        link: g.linkUrl || "",
        sourceType: node.type
      })))
    }
    if (node.type === "productCarousel") {
      items.push({
        sourceType: "productCarousel",
        carouselItems: node.data?.items || []
      })
    }
    if (node.type === "applicationCarousel") {
      const appIds = node.data?.applicationIds || node.data?.applications;
      if (appIds) {
        items.push({
          sourceType: "applicationCarousel",
          applicationIds: appIds
        })
      }
    }
  })
  
  const titleNodes = targetSection.filter(n => (n.type === "heading" || n.type === "paragraph") && !isMarkerNode(n, markerId) && !isAnyMarkerNode(n))
  let title = ""
  let subtitle = ""
  if (titleNodes.length > 0) {
    title = titleNodes[0].children?.map((c: any) => c.type === "linebreak" ? "\n" : c.text || "").join("").trim() || ""
    if (titleNodes.length > 1) {
      subtitle = titleNodes[1].children?.map((c: any) => c.type === "linebreak" ? "\n" : c.text || "").join("").trim() || ""
    }
  }

  return { title, subtitle, items, titleNodes, autoplay, interval }
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  const markerIndex = children.findIndex((node: any) => isMarkerNode(node, markerId))
  if (markerIndex === -1) return []
  return children.slice(markerIndex + 1)
}

export function OneStopSolutionTemplate({ locale, pageContent }: OneStopSolutionTemplateProps) {
  const [productsData, setProductsData] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [carouselProductsData, setCarouselProductsData] = useState<Record<string, any[]>>({})
  
  const contentChildren = useMemo(() => 
    pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [], 
    [pageContent]
  )
  const mediaData = pageContent.mediaData || {}

  const heroData = useMemo(() => extractSection(contentChildren, "one-stop-shop-introduction-carousel", mediaData), [contentChildren, mediaData])
  const problemsData = useMemo(() => extractSection(contentChildren, "one-stop-shop-value-item", mediaData), [contentChildren, mediaData])
  const advantagesData = useMemo(() => extractSection(contentChildren, "one-stop-shop-advantage-item", mediaData), [contentChildren, mediaData])
  const processData = useMemo(() => extractSection(contentChildren, "how-to-make-item", mediaData), [contentChildren, mediaData])
  
  const showcaseData = useMemo(() => {
    const res = extractSection(contentChildren, "product-show-item", mediaData)
    let viewMoreText = "VIEW MORE"
    let viewMoreLink = `/${locale}/shop`
    const btnMarkerIndex = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("product-show-btn"))
    if (btnMarkerIndex !== -1 && btnMarkerIndex + 1 < contentChildren.length) {
      const btnNode = contentChildren[btnMarkerIndex + 1]
      if (btnNode.type === "linkJump" && btnNode.data) {
        viewMoreText = (btnNode.data.title || btnNode.data.description || "VIEW MORE").toUpperCase()
        if (btnNode.data.url) {
          viewMoreLink = btnNode.data.url.replace('/pages/', '/')
          if (viewMoreLink.startsWith('/') && !viewMoreLink.startsWith(`/${locale}`)) {
            viewMoreLink = `/${locale}${viewMoreLink}`
          }
        }
      }
    }
    return { ...res, viewMoreText, viewMoreLink }
  }, [contentChildren, mediaData, locale])
  
  const categoriesTitle = useMemo(() => {
     const res = extractSection(contentChildren, "feature-product-item", mediaData)
     return { title: res.title || "Product Related To", subtitle: res.subtitle || "Busrom", items: res.items }
  }, [contentChildren, mediaData])
  
  const productSeriesData = useMemo(() => extractSection(contentChildren, "product-attribute", mediaData), [contentChildren, mediaData])

  const brandHighlightsData = useMemo(() => {
    const res = extractSection(contentChildren, "brand-highlights-item", mediaData)
    let titleLine1 = ""
    let titleLine2 = ""
    res.titleNodes.forEach(node => {
      if (isMarkerNode(node, "brand-highlights-item")) return
      node.children?.forEach((child: any) => {
        const isBold = (child.format & 1) === 1
        if (child.type === "linebreak") {
          if (titleLine2) titleLine2 += "\n"; else if (titleLine1) titleLine1 += "\n";
        } else if (child.text) {
          if (isBold) titleLine1 += child.text; else titleLine2 += child.text;
        }
      })
    })
    return { titleLine1: titleLine1.trim(), titleLine2: titleLine2.trim(), items: res.items }
  }, [contentChildren, mediaData])

  const trustData = useMemo(() => {
    const nodes = extractAfterMarker(contentChildren, "why-contractors-trust-us-item")
    const resBase = extractSection(contentChildren, "why-contractors-trust-us-item", mediaData)
    const items = parseTrustItems(nodes)
    return { ...resBase, items }
  }, [contentChildren, mediaData])

  const trustImages = useMemo(() => {
    // 依然保留从 extractSection 获取图片的逻辑，因为图片通常在 custom-image-gallery 块中
    const res = extractSection(contentChildren, "why-contractors-trust-us-item", mediaData)
    return res.items.filter(it => it.image && it.sourceType === 'custom-image-gallery')
  }, [contentChildren, mediaData])
  
  const trustBgImage = useMemo(() => {
    const bgMarker = "why-contractors-trust-us-bg-image"
    const markerIdx = contentChildren.findIndex((n: any) => JSON.stringify(n).includes(bgMarker))
    if (markerIdx !== -1 && markerIdx + 1 < contentChildren.length) {
      const node = contentChildren[markerIdx + 1]
      const id = node.data?.image?.id || node.value?.id || String(node.value || "")
      return mediaData[id] || null
    }
    return null
  }, [contentChildren, mediaData])

  // 1. Initial Extraction (confirming the user's log: formNode exists, but no fields)
  const rawCtaData = useMemo(() => {
    const nodesAfterImg = extractAfterMarker(contentChildren, "contact-form-image");
    const nodesAfterForm = extractAfterMarker(contentChildren, "contact-form-block");
    const imageNode = nodesAfterImg.find(n => n.type === "singleImage");
    const formNode = nodesAfterForm.find(n => n.type === "formBlock");
    const resBase = extractSection(contentChildren, "contact-form", mediaData);
    
    const rawImageId = imageNode?.data?.image?.id || null;
    const image = rawImageId ? mediaData[rawImageId] : null;
    
    const blockFormConfig = formNode?.data?.formConfig || formNode?.data || null;
    const initialFormConfig = (blockFormConfig?.fields ? blockFormConfig : (pageContent as any).formConfig) || blockFormConfig;

    return { title: resBase.title, description: resBase.subtitle, image, formConfig: initialFormConfig };
  }, [contentChildren, mediaData, pageContent.formConfig]);

  // 2. Async Patch: If fields are still missing (as seen in user log), fetch them manually
  const [fetchedFields, setFetchedFields] = useState<any[] | null>(null);

  useEffect(() => {
    const formId = rawCtaData.formConfig?.id;
    if (formId && !rawCtaData.formConfig?.fields && !fetchedFields) {
      fetch(`/api/form-configs/${formId}?depth=2&locale=${locale}`)
        .then(res => res.json())
        .then(data => {
          const config = data?.fields ? data : (data?.data?.fields ? data.data : data);
          if (config?.fields) setFetchedFields(config.fields);
        })
        .catch(err => console.error("Form Config Patch Fetch Error:", err));
    }
  }, [rawCtaData.formConfig?.id, rawCtaData.formConfig?.fields, locale, fetchedFields]);

  // 3. Final Merged Data
  const ctaData = useMemo(() => {
    const finalConfig = fetchedFields 
      ? { ...rawCtaData.formConfig, fields: fetchedFields } 
      : rawCtaData.formConfig;
    return { ...rawCtaData, formConfig: finalConfig };
  }, [rawCtaData, fetchedFields]);

  // Applications
  const [allApplications, setAllApplications] = useState<any[]>([])
  const applicationsDataRaw = useMemo(() => extractSection(contentChildren, "applications-item", mediaData), [contentChildren, mediaData])
  
  useEffect(() => {
    const carouselItem = applicationsDataRaw.items.find(it => it.sourceType === 'applicationCarousel')
    const applicationIds = carouselItem?.applicationIds || []
    
    if (applicationIds.length > 0) {
      const ids = applicationIds.map((item: any) => typeof item === 'object' ? item.id : item).filter(Boolean).join(',')
      if (ids) {
        fetch(`/api/applications?locale=${locale}&ids=${ids}`)
          .then(res => res.json())
          .then(data => setAllApplications(data.docs || []))
          .catch(err => console.error("Failed to fetch applications:", err))
      }
    }
  }, [applicationsDataRaw, locale])

  const applicationsData = useMemo(() => {
    const carouselItem = applicationsDataRaw.items.find(it => it.sourceType === 'applicationCarousel')
    if (carouselItem && carouselItem.applicationIds) {
      const items = carouselItem.applicationIds.map((item: any) => {
        const id = typeof item === 'object' ? item.id : item;
        if (!id) return null
        const app = allApplications.find(a => String(a.id) === String(id))
        if (!app) return null
        return {
          id: String(app.id),
          title: app.name || "",
          description: app.shortDescription || "",
          image: app.image,
          link: `/${locale}/application/${app.slug}`
        }
      }).filter(Boolean)
      return { ...applicationsDataRaw, items }
    }
    return applicationsDataRaw
  }, [applicationsDataRaw, allApplications, locale])

  const oemOdmGuideData = useMemo(() => {
     const res = extractSection(contentChildren, "oem-odm-guide", mediaData)
     let title = res.title || "READY TO\nJOIN IN BUSROM?"
     const titleMarkerIndex = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("oem-odm-guide-title"))
     if (titleMarkerIndex !== -1 && titleMarkerIndex + 1 < contentChildren.length) {
       const titleNode = contentChildren[titleMarkerIndex + 1]
       if (titleNode && titleNode.children) {
         title = titleNode.children.map((child: any) => child.type === 'linebreak' ? '\n' : child.text || '').join('')
       }
     }
     const bgImageIndex = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("oem-odm-guide-bg-image"))
     let bgImage = null
     if (bgImageIndex !== -1 && bgImageIndex + 1 < contentChildren.length) {
       const nextNode = contentChildren[bgImageIndex + 1]
       const id = nextNode.data?.image?.id || nextNode.value?.id || String(nextNode.value || "")
       bgImage = mediaData[id]
     }
     if (!bgImage && res.items.length > 0 && res.items[0].image) bgImage = res.items[0].image
     let ctaText = "READ MORE"
     let ctaLink = "/oem-odm"
     const ctaMarkerIndex = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("oem-odm-guide-cta"))
     if (ctaMarkerIndex !== -1 && ctaMarkerIndex + 1 < contentChildren.length) {
       const ctaNode = contentChildren[ctaMarkerIndex + 1]
       if (ctaNode && ctaNode.type === "linkJump" && ctaNode.data) {
         ctaText = ctaNode.data.description || ctaNode.data.title || "READ MORE"
         if (ctaNode.data.url) ctaLink = ctaNode.data.url.replace('/pages/', '/')
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
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [locale])

  useEffect(() => {
    const carouselItems = contentChildren.filter((n: any) => n.type === 'productCarousel')
    carouselItems.forEach(async (node: any) => {
        const items = node.data?.items || []
        if (items.length === 0) return

        const manualIds = items.filter((it: any) => it.selectionMode === 'manual' && it.product).map((it: any) => typeof it.product === 'object' ? it.product.id : it.product)
        const autoSeriesIds = items.filter((it: any) => it.selectionMode === 'auto' && it.productSeries).map((it: any) => typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries)
        const blockKey = [...manualIds, ...autoSeriesIds].sort().join(',')

        if (blockKey && !carouselProductsData[blockKey]) {
            try {
                let url = `/api/products?locale=${locale}`
                if (manualIds.length > 0) url += `&ids=${manualIds.join(',')}`
                if (autoSeriesIds.length > 0) url += `&seriesIds=${autoSeriesIds.join(',')}`
                
                const res = await fetch(url)
                const data = await res.json()
                setCarouselProductsData(prev => ({ ...prev, [blockKey]: data.products || [] }))
            } catch (err) {
                console.error("Failed to fetch carousel products:", err)
            }
        }
    })
  }, [contentChildren, locale])

  const mapProductsWithCarouselConfig = (products: any[], carouselItems: any[] = []) => {
    const usedProductIds = new Set<string>()

    return carouselItems.map((item: any) => {
      let product = null
      if (item.selectionMode === 'manual') {
        const targetId = typeof item.product === 'object' ? item.product.id : item.product
        product = products.find(p => String(p.id) === String(targetId))
      } else {
        const targetSeriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries
        // 查找属于该系列且未被使用的产品
        product = products.find(p => {
          const pSeriesId = p.series?.id || p.series
          return String(pSeriesId) === String(targetSeriesId) && !usedProductIds.has(p.id)
        })
      }

      if (!product) return null
      usedProductIds.add(product.id)

      const getDisplayName = (item: any, productName: string, categoryName: string) => {
        if (item?.customName?.trim()) return item.customName
        if (item?.showCategory === true || item?.showName === false) return categoryName
        return productName
      }

      return {
        ...product,
        _carouselItem: item,
        title: getDisplayName(item, product.name, product.category?.name || ""),
        showName: item.showName !== false,
        showCategory: !!item.showCategory,
        categoryName: product.category?.name || ""
      }
    }).filter(Boolean)
  }

  const mappedShowcaseProducts = useMemo(() => {
    const carouselItem = showcaseData.items.find((it: any) => it.sourceType === 'productCarousel')
    if (carouselItem && carouselProductsData[carouselItem.carouselItems?.[0]?.id || 'default']) {
      return mapProductsWithCarouselConfig(
        carouselProductsData[carouselItem.carouselItems?.[0]?.id || 'default'] || [], 
        carouselItem.carouselItems
      )
    }
    return showcaseData.items.filter((it: any) => it.sourceType !== 'productCarousel').map((it: any, idx: number) => ({
      id: String(idx), image: it.image, title: it.title, link: it.link
    }))
  }, [showcaseData, carouselProductsData, locale])

  const gridProducts = useMemo(() => {
    const carouselItem = categoriesTitle.items.find((it: any) => it.sourceType === 'productCarousel')
    if (carouselItem) {
      const items = carouselItem.carouselItems || []
      const manualIds = items.filter((it: any) => it.selectionMode === 'manual' && it.product).map((it: any) => typeof it.product === 'object' ? it.product.id : it.product)
      const autoSeriesIds = items.filter((it: any) => it.selectionMode === 'auto' && it.productSeries).map((it: any) => typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries)
      const blockKey = [...manualIds, ...autoSeriesIds].sort().join(',')
      
      if (carouselProductsData[blockKey]) {
        return mapProductsWithCarouselConfig(carouselProductsData[blockKey], items)
      }
      return [] // If carousel is present but not loaded yet
    }
    // 回落模式：分类名 > 产品名
    return productsData.map(p => ({
      ...p,
      title: p.category?.name || p.name
    }))
  }, [categoriesTitle, productsData, carouselProductsData])

  const seriesProducts = useMemo(() => {
    const carouselItem = productSeriesData.items.find((it: any) => it.sourceType === 'productCarousel')
    if (carouselItem) {
      const items = carouselItem.carouselItems || []
      const manualIds = items.filter((it: any) => it.selectionMode === 'manual' && it.product).map((it: any) => typeof it.product === 'object' ? it.product.id : it.product)
      const autoSeriesIds = items.filter((it: any) => it.selectionMode === 'auto' && it.productSeries).map((it: any) => typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries)
      const blockKey = [...manualIds, ...autoSeriesIds].sort().join(',')
      
      if (carouselProductsData[blockKey]) {
        return mapProductsWithCarouselConfig(carouselProductsData[blockKey], items)
      }
      return []
    }
    // 回落模式：分类名 > 产品名
    return productsData.map(p => ({
      ...p,
      title: p.category?.name || p.name
    }))
  }, [productSeriesData, productsData, carouselProductsData])

  return (
    <div className="min-h-screen bg-[#f6f4ed] select-none">
      <style jsx global>{`
        img {
          -webkit-user-drag: none; -khtml-user-drag: none; -moz-user-drag: none; -o-user-drag: none; user-drag: none;
        }
      `}</style>
      <HeroSection slides={heroData.items} locale={locale} />
      <ValuePropositionSection 
        title={problemsData.title} subtitle={problemsData.subtitle} 
        problems={problemsData.items} advantages={[]} 
        autoplay={problemsData.autoplay} interval={problemsData.interval}
      />
      <AdvantagesSection title={advantagesData.title} advantages={advantagesData.items} />
      <PurchaseProcessSection title={processData.title} slides={processData.items} />
      <CategoriesGridSection title={categoriesTitle.title} subtitle={categoriesTitle.subtitle} products={gridProducts} locale={locale} loading={loadingProducts} />
      {showcaseData.items.length > 0 && (
        <HighlightShowcaseSection 
          title={showcaseData.title} products={mappedShowcaseProducts as any} locale={locale} 
          viewMoreText={showcaseData.viewMoreText} viewMoreLink={showcaseData.viewMoreLink}
        />
      )}
      {productsData.length > 0 && <ProductSeriesShowcaseSection title={productSeriesData.title} products={seriesProducts} locale={locale} />}
      {brandHighlightsData.items.length > 0 && <BrandHighlightsSection titleLine1={brandHighlightsData.titleLine1} titleLine2={brandHighlightsData.titleLine2} items={brandHighlightsData.items} />}
      <TrustSection title={trustData.title} items={trustData.items} images={trustImages} bgImage={trustBgImage} />
      <CtaSection title={ctaData.title} description={ctaData.description} image={ctaData.image} formConfig={ctaData.formConfig} />
      {applicationsData.items.length > 0 && <ApplicationsSection title={applicationsData.title} items={applicationsData.items} locale={locale} />}
      <OemOdmGuideSection 
        title={oemOdmGuideData.title} description={oemOdmGuideData.subtitle} 
        bgImage={oemOdmGuideData.bgImage} ctaText={oemOdmGuideData.ctaText}
        ctaLink={oemOdmGuideData.ctaLink} locale={locale} 
      />
    </div>
  )
}
