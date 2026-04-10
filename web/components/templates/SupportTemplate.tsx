import React from "react"
import { SupportHeroSection } from "@/components/support/SupportHeroSection"
import { SupportCommitmentSection } from "@/components/support/SupportCommitmentSection"
import { SupportCustomizedSection } from "@/components/support/SupportCustomizedSection"
import { SupportQualityControlSection } from "@/components/support/SupportQualityControlSection"
import { SupportDecoratorSection } from "@/components/support/SupportDecoratorSection"
import { SupportRemoteSection } from "@/components/support/SupportRemoteSection"
import { SupportRequestProcessSection } from "@/components/support/SupportRequestProcessSection"
import { SupportMarketingSalesSection } from "@/components/support/SupportMarketingSalesSection"
import { SupportContactFormSection } from "@/components/support/SupportContactFormSection"
import { SupportApplicationsSection } from "@/components/support/SupportApplicationsSection"
import { SupportQuoteSection } from "@/components/support/SupportQuoteSection"
import type { SupportData } from "@/lib/parsers/support-parser"

interface SupportTemplateProps {
  locale: string
  data: SupportData
  resolvedApplications?: any[]
}

export function SupportTemplate({ locale, data, resolvedApplications }: SupportTemplateProps) {
  // Combine extracted items with resolved applications for the applications section
  const applicationsDataWithItems = {
    ...data.applications,
    items: resolvedApplications && resolvedApplications.length > 0 ? resolvedApplications : data.applications.items
  }

  return (
    <main className="relative bg-[#FBF9F1]">
      {data.hero && <SupportHeroSection data={data.hero} />}

      {data.commitment && (
        <SupportCommitmentSection 
          title={data.commitment.mainTitle}
          subtitle={data.commitment.subtitle}
          technical={data.commitment.technical}
          marketing={data.commitment.marketing}
        />
      )}

      {data.customized && (
        <SupportCustomizedSection 
          title={data.customized.mainTitle}
          product={data.customized.product}
          manufacturing={data.customized.manufacturing}
        />
      )}

      {data.qualityControl && (
        <SupportQualityControlSection 
          title={data.qualityControl.title}
          items={data.qualityControl.items}
        />
      )}

      {data.decorator && (
        <SupportDecoratorSection 
          leftText={data.decorator.leftText}
          rightText={data.decorator.rightText}
          image={data.decorator.image}
        />
      )}

      {data.remote && (
        <SupportRemoteSection 
          titleNodes={data.remote.titleNodes}
          descriptionNodes={data.remote.descNodes}
          cta={data.remote.cta}
          image={data.remote.image}
        />
      )}

      {data.process && data.process.items.length > 0 && (
        <SupportRequestProcessSection 
            titleNodes={data.process.titleNodes}
            subtitleNodes={data.process.subtitleNodes}
            items={data.process.items}
        />
      )}

      {data.marketingSales && (
        <SupportMarketingSalesSection data={data.marketingSales} />
      )}

      {data.contactForm && (
        <SupportContactFormSection 
          title={data.contactForm.title}
          description={data.contactForm.description}
          images={data.contactForm.images}
          formConfig={data.contactForm.formConfig}
          locale={locale}
        />
      )}
      
      {(applicationsDataWithItems.items.length > 0 || applicationsDataWithItems.applicationIds.length > 0) && (
        <SupportApplicationsSection 
          items={applicationsDataWithItems.items} 
          carouselConfig={applicationsDataWithItems.carouselConfig}
          locale={locale}
        />
      )}

      {data.quote && (
        <SupportQuoteSection 
          slides={data.quote.slides}
          autoplay={data.quote.autoplay}
          interval={data.quote.interval}
        />
      )}

      {!data.hero && !data.commitment && !data.customized && !data.qualityControl && !data.remote && (
        <div className="py-20 text-center text-gray-500">
           No content identified on this page. Please check CMS markers.
        </div>
      )}
    </main>
  )
}

