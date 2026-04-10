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
    if (ssrData?.products && ssrData.products.length > 0) {
      const items: ProductShowItem[] = ssrData.products.map((product: any, index: number) => ({
        id: product.id || index,
        sku: product.sku || "",
        title: product.name || "",
        categoryName: product.category?.name || "",
        image: product.showImage || null,
        link: product.slug ? `/shop/${product.slug}` : undefined,
        buttonText: product._carouselItem?.buttonText || "View More",
        showName: product._carouselItem?.showName !== false,
        showCategory: !!product._carouselItem?.showCategory,
        showButton: product._carouselItem?.showButton !== false,
        showHighlights: !!product._carouselItem?.showHighlights,
        highlightsCount: product._carouselItem?.highlightsCount || 3,
        productAttributes: product.productAttributes || null,
      }))
      setProductShowItems(items)
      return
    }

    const fetchProductData = async () => {
      if (!data.productShow.rawCarouselItems || data.productShow.rawCarouselItems.length === 0) return

      try {
        const response = await fetch("/api/products/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: data.productShow.rawCarouselItems,
            locale,
          }),
        })

        if (!response.ok) return

        const result = await response.json()
        const products = result.products || []

        const items: ProductShowItem[] = products.map((product: any, index: number) => ({
          id: product.id || index,
          sku: product.sku || "",
          title: product.name || "",
          categoryName: product.category?.name || "",
          image: product.showImage || null,
          link: product.slug ? `/shop/${product.slug}` : undefined,
          buttonText: product._carouselItem?.buttonText || "View More",
          showName: product._carouselItem?.showName !== false,
          showCategory: !!product._carouselItem?.showCategory,
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
  }, [ssrData?.products, data.productShow.rawCarouselItems, locale])

  // Merge SSR form config if provided
  const finalFormConfig = ssrData?.formConfig || data.contactForm.formConfig

  return (
    <div className="min-h-screen bg-background" data-header-theme="dark">
      {/* Hero Section */}
      <ContactHeroSection
        buttonText={data.hero.buttonText || "Get A Quote"}
        buttonLink={data.hero.buttonLink || "#contact-form"}
        heroImage={data.hero.heroImage}
        subtitle={data.hero.subtitle || undefined}
      />

      {/* Support Narrative Section */}
      <SupportNarrativeSection
        title={data.supportNarrative.title || undefined}
        cards={data.supportNarrative.cards}
      />

      {/* Product Series Entry Section */}
      <ProductSeriesEntrySection
        titleLeft={data.productSeries.titleLeft || undefined}
        titleLeftSuperscript={data.productSeries.titleLeftSuperscript || undefined}
        titleRightBold={data.productSeries.titleRightBold || undefined}
        titleRightNormal={data.productSeries.titleRightNormal || undefined}
        products={data.productSeries.products}
      />

      {/* Gradient Background Area */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(180deg, #FFFDE9 0%, #FFF8DC 100%)",
        }}
      >
        {/* Project Communication Guide Section */}
        <ProjectCommunicationGuideSection
          title={data.projectGuide.title || undefined}
          subtitle={data.projectGuide.subtitle || undefined}
          description={data.projectGuide.description || undefined}
          image={data.projectGuide.image}
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
  )
}
