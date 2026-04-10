import React from "react"
import { ServiceValueSection } from "@/components/service/ServiceValueSection"
import { BrandServicesSection } from "@/components/service/BrandServicesSection"
import { ContactFormSection } from "@/components/service/ContactFormSection"
import { ApplicationsSection } from "@/components/service/ApplicationsSection"
import { SimpleCtaSection } from "@/components/service/SimpleCtaSection"
import { AnimationSection } from "@/components/service/AnimationSection"
import type { ParsedServiceOverviewData } from "@/lib/parsers/service-overview-parser"

interface ServiceOverviewTemplateProps {
  locale: string
  data: ParsedServiceOverviewData
}

/**
 * ServiceOverviewTemplate - Server Component
 * 
 * This template is now a pure functional component that receives 
 * pre-parsed data from the server, satisfying SEO and performance requirements.
 */
export function ServiceOverviewTemplate({ locale, data }: ServiceOverviewTemplateProps) {
  const { 
    serviceValue, 
    brandServices, 
    contactForm, 
    applications, 
    simpleCta, 
    animation 
  } = data

  return (
    <div className="min-h-screen bg-background" data-header-theme="dark">
      {/* Service Value Section */}
      <ServiceValueSection
        title={serviceValue.title}
        slides={serviceValue.slides}
        backgroundImage={serviceValue.bgImage}
        autoplay={true}
        interval={5}
      />

      {/* Brand Services Section */}
      <div className="mt-8 lg:mt-[72px]">
        <BrandServicesSection
          title={brandServices.title}
          description={brandServices.description}
          categories={brandServices.categories}
          categoryImages={brandServices.categoryImages}
        />
      </div>

      {/* Contact Form Section */}
      <div className="mt-8 lg:mt-[72px]">
        <ContactFormSection
          locale={locale as any}
          formName="service-overview-form"
          formConfig={contactForm.formConfig}
          backgroundImage={contactForm.backgroundImage}
        />
      </div>

      {/* Applications Section */}
      <div className="mt-8 lg:mt-[60px]">
        <ApplicationsSection
          locale={locale}
          titleLine1={applications.titleLine1}
          titleLine2={applications.titleLine2}
          highlightText={applications.highlightText}
          viewMoreLink={applications.viewMoreLink.startsWith('/') ? `/${locale}${applications.viewMoreLink}` : applications.viewMoreLink}
          viewMoreText={applications.viewMoreText}
          applicationIds={applications.applicationIds}
        />
      </div>

      {/* Simple CTA Section */}
      <div className="mt-8 lg:mt-[60px]">
        <SimpleCtaSection
          locale={locale}
          title={simpleCta.title}
          description={simpleCta.description}
          ctaText={simpleCta.ctaText}
          buttonText={simpleCta.buttonText}
          buttonLink={simpleCta.buttonLink}
          images={simpleCta.images}
        />
      </div>

      {/* Animation Section */}
      {animation.backgroundImage && (
        <div className="mt-8 lg:mt-[60px]">
          <AnimationSection
            locale={locale}
            backgroundImage={animation.backgroundImage}
          />
        </div>
      )}
    </div>
  )
}
