"use client"

import type { Locale } from "@/i18n.config"
import { LexicalRenderer } from "@/components/lexical/LexicalRenderer"
import { ProductAttributesSection } from "@/components/shop/ProductAttributesSection"
import { SixCoreStrengthsSection } from "@/components/shop/SixCoreStrengthsSection"
import { ProductFeaturesSection } from "@/components/shop/ProductFeaturesSection"
import { ProductDetailFeaturesSection } from "@/components/shop/ProductDetailFeaturesSection"
import { ProductCoreAdvantagesSection } from "@/components/shop/ProductCoreAdvantagesSection"
import { ProductApplicationsSection } from "@/components/shop/ProductApplicationsSection"
import { BusromMainFeaturesSection } from "@/components/shop/BusromMainFeaturesSection"
import { AboutBusromSection } from "@/components/shop/AboutBusromSection"
import { BusromSupportSection } from "@/components/shop/BusromSupportSection"
import { WhyChooseUsSection } from "@/components/shop/WhyChooseUsSection"
import { WhyChooseUsReasonSection } from "@/components/shop/WhyChooseUsReasonSection"
import { ProductCustomizationFlowSection } from "@/components/shop/ProductCustomizationFlowSection"
import { TransportationSection } from "@/components/shop/TransportationSection"

import {
  parseProductAttributesData,
  parseSixCoreStrengthsData,
  parseProductFeaturesData,
  parseProductDetailFeaturesData,
  parseProductCoreAdvantagesData,
  parseProductApplicationsData,
  parseBusromMainFeaturesData,
  parseAboutBusromData,
  parseBusromSupportData,
  parseWhyChooseUsData,
  parseWhyChooseUsReasonData,
  parseProductCustomizationFlowData,
  parseTransportationData,
  type ParsedSection,
} from "./parseSectionData"

interface SectionRendererProps {
  section: ParsedSection
  sectionIndex: number
  locale: Locale
}

export function SectionRenderer({
  section,
  sectionIndex,
  locale,
}: SectionRendererProps) {
  // Product Attributes Section
  if (section.id === 'product-attributes') {
    const data = parseProductAttributesData(section.content)
    return (
      <ProductAttributesSection
        key={sectionIndex}
        title={data.title}
        image={data.image}
        imageLink={data.imageLink}
        attributes={data.attributes || []}
      />
    )
  }

  // Six Core Strengths Section
  if (section.id === 'six-core-strengths') {
    const data = parseSixCoreStrengthsData(section.content)
    return (
      <SixCoreStrengthsSection
        key={sectionIndex}
        subtitle={data.subtitle}
        title={data.title}
        items={data.items}
        image={data.image}
        imageLink={data.imageLink}
      />
    )
  }

  // Product Features Section
  if (section.id === 'product-features') {
    const data = parseProductFeaturesData(section.content)
    return (
      <ProductFeaturesSection
        key={sectionIndex}
        title={data.title}
        items={data.items}
        image={data.image}
        imageLink={data.imageLink}
      />
    )
  }

  // Product Detail Features Section (three-column layout via block node)
  if (section.id === 'product-detail-features') {
    const data = parseProductDetailFeaturesData(section.content)
    return (
      <ProductDetailFeaturesSection
        key={sectionIndex}
        title={data.title}
        items={data.items}
        image={data.image}
        imageLink={data.imageLink}
      />
    )
  }

  // Product Core Advantages Section
  if (section.id === 'product-core-advantages') {
    const data = parseProductCoreAdvantagesData(section.content)
    return (
      <ProductCoreAdvantagesSection
        key={sectionIndex}
        title={data.title}
        images={data.images}
        items={data.items}
      />
    )
  }

  // Product Applications Section
  if (section.id === 'applications') {
    const data = parseProductApplicationsData(section.content)
    return (
      <ProductApplicationsSection
        key={sectionIndex}
        locale={locale}
        title={data.title}
        applicationIds={data.applicationIds}
      />
    )
  }

  // Busrom Main Features Section
  if (section.id === 'busrom-main-features') {
    const data = parseBusromMainFeaturesData(section.content)
    return (
      <BusromMainFeaturesSection
        key={sectionIndex}
        title={data.title}
        subtitle={data.subtitle}
        cards={data.cards}
      />
    )
  }

  // About Busrom Section
  if (section.id === 'about-busrom') {
    const data = parseAboutBusromData(section.content)
    return (
      <AboutBusromSection
        key={sectionIndex}
        title={data.title}
        image={data.image}
        imageLink={data.imageLink}
        services={data.services}
      />
    )
  }

  // Busrom Support Section
  if (section.id === 'busrom-support') {
    const data = parseBusromSupportData(section.content)
    return (
      <BusromSupportSection
        key={sectionIndex}
        title={data.title}
        cards={data.cards}
      />
    )
  }

  // Why Choose Us Section (Flow chart with 12 process items)
  if (section.id === 'why-choose-us') {
    const data = parseWhyChooseUsData(section.content)
    return (
      <WhyChooseUsSection
        key={sectionIndex}
        title={data.title}
        subtitle={data.subtitle}
        items={data.items}
      />
    )
  }

  // Why Choose Us Reason Section (carousel with title, description, images)
  if (section.id === 'why-choose-us-reason') {
    const data = parseWhyChooseUsReasonData(section.content)
    return (
      <WhyChooseUsReasonSection
        key={sectionIndex}
        items={data.items}
        nextButtonText={data.nextButtonText}
      />
    )
  }

  // Product Customization Flow Section
  if (section.id === 'product-customization-flow') {
    const data = parseProductCustomizationFlowData(section.content)
    return (
      <ProductCustomizationFlowSection
        key={sectionIndex}
        title={data.title}
        descriptions={data.descriptions}
        steps={data.steps}
      />
    )
  }

  // Transportation Section
  if (section.id === 'transportation') {
    const data = parseTransportationData(section.content)
    return (
      <TransportationSection
        key={sectionIndex}
        title={data.title}
        image={data.image}
        imageLink={data.imageLink}
      />
    )
  }

  // Scrolling Link Section - renders marqueeLinks block directly (full-width, no container)
  if (section.id === 'scrolling-link') {
    return (
      <div key={sectionIndex} className="w-full">
        <LexicalRenderer content={section.content} />
      </div>
    )
  }

  // Default: render with LexicalRenderer in a container
  return (
    <div key={sectionIndex} className="container mx-auto px-6 md:px-8 lg:px-12 py-8">
      <div className="space-y-6">
        {section.id && (
          <h2 className="font-anaheim font-extrabold text-2xl md:text-3xl text-brand-text-black mb-4">
            {section.id}
          </h2>
        )}
        <LexicalRenderer content={section.content} />
      </div>
    </div>
  )
}
