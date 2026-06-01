"use client"

import React, { useState, useEffect } from "react"
import { ContactHeroSection } from "@/components/contact/ContactHeroSection"
import { SupportNarrativeSection } from "@/components/contact/SupportNarrativeSection"
import { ProductSeriesEntrySection } from "@/components/contact/ProductSeriesEntrySection"
import { ProjectCommunicationGuideSection } from "@/components/contact/ProjectCommunicationGuideSection"
import { KeyValuesCooperationSection } from "@/components/contact/KeyValuesCooperationSection"
import { TypicalCollaborationSection } from "@/components/contact/TypicalCollaborationSection"
import { CooperationProcessSection } from "@/components/contact/CooperationProcessSection"
import { ContactFormSection } from "@/components/contact/ContactFormSection"
import { ProductShowSection, ProductShowItem } from "@/components/contact/ProductShowSection"
import { QuoteImageSection } from "@/components/contact/QuoteImageSection"
import { ContactUsData } from "@/lib/parsers/contact-us-parser"
import { motion } from "framer-motion"

const DESIGN_WIDTH = 1920
const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

interface ContactUsTemplateProps {
  locale: string
  data: ContactUsData
  ssrData?: {
    products?: any[]
    applications?: any[]
    formConfig?: any
  }
}

export function ContactUsTemplate({ locale, data, ssrData }: ContactUsTemplateProps) {
  // Use SSR products if available, otherwise fetch client-side (legacy fallback)
  const [productShowItems, setProductShowItems] = useState<ProductShowItem[]>([])

  useEffect(() => {
    // 1. Prefer items already hydrated in data.productShow.rawCarouselItems (from fetchPageData)
    const rawItems = data.productShow.rawCarouselItems || [];
    const hasFullData = rawItems.length > 0 && rawItems.every(it => it.product && typeof it.product === 'object');

    if (hasFullData) {
      const items: ProductShowItem[] = rawItems.map((it: any, index: number) => {
        const product = it.product;
        const getName = (obj: any) => {
          if (!obj) return "";
          if (typeof obj === "string") return obj;
          if (typeof obj === "object") {
            return obj[locale] || obj.en || obj.zh || "";
          }
          return "";
        };

        const title = getName(product.name) || getName(product.title) || "";
        const category = product.category;
        const categoryName = typeof category === 'object' && category ? (getName(category.name) || getName(category.title)) : "";

        // Handle various image structures
        let image = product.showImage || product.mainImage;
        if (Array.isArray(image)) image = image[0];

        return {
          id: product.id || index,
          sku: product.sku || "",
          title: title,
          categoryName: categoryName,
          image: image,
          link: product.slug ? `/shop/${product.slug}` : undefined,
          buttonText: it.buttonText || "View More",
          showName: it.showName !== false,
          showCategory: !!it.showCategory,
          showButton: it.showButton !== false,
          showHighlights: !!it.showHighlights,
          highlightsCount: it.highlightsCount || 3,
          productAttributes: product.productAttributes || null,
        };
      });
      setProductShowItems(items);
      return;
    }

    // 2. Use SSR products if available
    if (ssrData?.products && ssrData.products.length > 0) {
      const getName = (obj: any) => {
        if (!obj) return ""
        if (typeof obj === "string") return obj
        if (typeof obj === "object") {
          return obj[locale] || obj.en || obj.zh || ""
        }
        return ""
      }

      const products = ssrData.products
      const usedProductIds = new Set<string | number>()

      const items = rawItems.map((item: any, index: number) => {
        let product = null
        if (item.selectionMode === "manual" && item.product) {
          const prodId = typeof item.product === "object" ? item.product.id : item.product
          product = products.find((p: any) => p.id === prodId)
        } else if (item.selectionMode === "auto" && item.productSeries) {
          const seriesId = typeof item.productSeries === "object" ? item.productSeries.id : item.productSeries
          product = products.find((p: any) => {
            const pSeriesId = p.series ? (typeof p.series === "object" ? p.series.id : p.series) : null
            return pSeriesId === seriesId && !usedProductIds.has(p.id)
          })
          if (product) usedProductIds.add(product.id)
        }

        if (!product) return null

        const title = getName(product.name) || getName(product.title) || ""
        const category = product.category
        const categoryName = typeof category === "object" && category ? (getName(category.name) || getName(category.title)) : ""

        let image = product.showImage || product.mainImage
        if (Array.isArray(image)) image = image[0]

        return {
          id: product.id || index,
          sku: product.sku || "",
          title: title,
          categoryName: categoryName,
          image: image,
          link: product.slug ? `/shop/${product.slug}` : undefined,
          buttonText: item.buttonText || "",
          showName: item.showName !== false,
          showCategory: !!item.showCategory,
          showButton: item.showButton !== false,
          showHighlights: !!item.showHighlights,
          highlightsCount: item.highlightsCount || 3,
          openInNewTab: !!item.openInNewTab,
          productAttributes: product.productAttributes || null,
        }
      }).filter(Boolean) as ProductShowItem[]

      if (items.length > 0) {
        setProductShowItems(items)
        return
      }
    }

    // 3. Last resort: Client-side fetch
    const fetchProductData = async () => {
      if (rawItems.length === 0) return

      try {
        const response = await fetch("/api/products/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: rawItems,
            locale,
          }),
        })

        if (!response.ok) return

        const result = await response.json()
        const products = result.products || []

        const items: ProductShowItem[] = products.map((product: any, index: number) => {
          if (!product) return null
          return {
            id: product.id || index,
            sku: product.sku || "",
            title: product.name || "",
            categoryName: product.category?.name || "",
            image: product.showImage || null,
            link: product.slug ? `/shop/${product.slug}` : undefined,
            buttonText: product._carouselItem?.buttonText || "",
            showName: product._carouselItem?.showName !== false,
            showCategory: !!product._carouselItem?.showCategory,
            showButton: product._carouselItem?.showButton !== false,
            showHighlights: !!product._carouselItem?.showHighlights,
            highlightsCount: product._carouselItem?.highlightsCount || 3,
            openInNewTab: !!product._carouselItem?.openInNewTab,
            productAttributes: product.productAttributes || null,
          }
        }).filter(Boolean) as ProductShowItem[]

        setProductShowItems(items)
      } catch (error) {
        console.error("Error fetching product carousel data:", error)
      }
    }

    fetchProductData()
  }, [ssrData?.products, data.productShow.rawCarouselItems, locale])

  // Merge SSR form config if provided
  const finalFormConfig = ssrData?.formConfig || data.contactForm.formConfig

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" data-header-theme="dark">
      <div className="relative z-10">
        {/* Hero Section */}
        <ContactHeroSection
          buttonText={data.hero.buttonText || undefined}
          buttonLink={data.hero.buttonLink || undefined}
          heroImage={data.hero.heroImage}
          subtitle={data.hero.subtitle || "Tell Us Your Business Needs.\nBusrom Will Give You Custom Production Strategies\nTo Match."}
          locale={locale}
        />

        {/* Narrative & Product Series Wrapper with Background Blobs */}
        <div className="relative">
          {/* Background Blobs for this specific area */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* 背景漂浮圆形 - Ellipse 145 大正圆 左下 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: vw(792),
                height: vw(792),
                left: vw(-207),
                top: vw(398), // 相对偏移量回归到原始设计
                backgroundColor: "rgb(255 245 168 / 0.38)",
                filter: `blur(${vw(104)})`,
              }}
              animate={{
                x: [0, 200, 100, 0],
                y: [0, -100, 50, 0],
              }}
              transition={{
                duration: 12,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />

            {/* 背景漂浮圆形 - Ellipse 149 小正圆 右下 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: vw(150),
                height: vw(148),
                left: vw(1196),
                top: vw(724),
                backgroundColor: "rgb(255 245 168 / 0.54)",
                filter: `blur(${vw(104)})`,
              }}
              animate={{
                x: [0, -150, 80, 0],
                y: [0, -120, 60, 0],
              }}
              transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />

            {/* 背景漂浮圆形 - Ellipse 147 椭圆 右上 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: vw(550),
                height: vw(406),
                left: vw(1450),
                top: vw(0),
                backgroundColor: "rgb(255 245 168 / 0.30)",
                filter: `blur(${vw(104)})`,
              }}
              animate={{
                x: [0, -200, 100, 0],
                y: [0, 150, -80, 0],
              }}
              transition={{
                duration: 14,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Support Narrative Section */}
          <SupportNarrativeSection
            title={data.supportNarrative.title || undefined}
            cards={data.supportNarrative.cards}
            locale={locale}
          />

          {/* Product Series Entry Section */}
          <ProductSeriesEntrySection
            titleLeft={data.productSeries.titleLeft || undefined}
            titleLeftSuperscript={data.productSeries.titleLeftSuperscript || undefined}
            titleRightBold={data.productSeries.titleRightBold || undefined}
            titleRightNormal={data.productSeries.titleRightNormal || undefined}
            products={data.productSeries.products}
          />
        </div>

        {/* Gradient Background Area */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(180deg, #FFF7DC 0%, #FFFDE8 30%)",
          }}
        >
          {/* Project Communication Guide Section */}
          <ProjectCommunicationGuideSection
            title={data.projectGuide.title || undefined}
            subtitle={data.projectGuide.subtitle || undefined}
            description={data.projectGuide.description || undefined}
            image={data.projectGuide.image}
            locale={locale}
          />

          {/* Key Values Cooperation Section */}
          <KeyValuesCooperationSection
            label={data.keyValues.label || undefined}
            items={data.keyValues.items}
          />

          {/* Typical Collaboration Section */}
          <TypicalCollaborationSection
            sectionTitle={data.typicalCollaboration.sectionTitle || undefined}
            items={data.typicalCollaboration.items}
          />

          {/* Cooperation Process Section */}
          <CooperationProcessSection
            titleLine1={data.cooperationProcess.titleLine1 || undefined}
            titleLine2={data.cooperationProcess.titleLine2 || undefined}
            steps={data.cooperationProcess.steps}
            buttonText={data.cooperationProcess.buttonText || undefined}
          />
        </div>

        {/* Contact Form Section */}
        <ContactFormSection
          verticalTitle={data.contactForm.verticalTitle || undefined}
          title={data.contactForm.title || "Warmly Welcome To Send Us Inquiry!"}
          subtitle={data.contactForm.subtitle}
          images={data.contactForm.images.filter(Boolean) as any}
          formConfig={finalFormConfig}
          tips={data.contactForm.tips}
        />

        {/* Product Show Section */}
        <ProductShowSection
          backgroundImage={data.productShow.backgroundImage}
          items={productShowItems}
        />

        {/* Quote Image Section */}
        <QuoteImageSection
          image={data.quoteImage.image}
          titleLine1={data.quoteImage.titleLine1 || undefined}
          titleLine2={data.quoteImage.titleLine2 || undefined}
          subtitle={data.quoteImage.subtitle || undefined}
          buttonText={data.quoteImage.buttonText || undefined}
          buttonLink={data.quoteImage.buttonLink || undefined}
        />
      </div>
    </div>
  )
}
