"use client"

import React from "react"
import { ApplicationHeroSection } from "@/components/application/sections/ApplicationHeroSection"
import { ApplicationProductNavigationSection } from "@/components/application/sections/ApplicationProductNavigationSection"
import { ApplicationEngineerSaidSection } from "@/components/application/sections/ApplicationEngineerSaidSection"
import { ApplicationWhyChooseUsSection } from "../application/sections/ApplicationWhyChooseUsSection"
import { ApplicationCasesSection, ApplicationCase } from "../application/sections/ApplicationCasesSection"
import { ApplicationMoreCasesSection } from "../application/sections/ApplicationMoreCasesSection"
import { ApplicationContactFormSection } from "../application/sections/ApplicationContactFormSection"
import { ApplicationGuideSection } from "../application/sections/ApplicationGuideSection"
import { ApplicationData } from "@/lib/parsers/application-parser"

interface ApplicationTemplateProps {
  locale: string
  data: ApplicationData
  applications: ApplicationCase[]
  moreApplications: any[]
}

export function ApplicationTemplate({ locale, data, applications, moreApplications }: ApplicationTemplateProps) {
  const { 
    hero,
    productNavigation,
    engineerSaid,
    whyChooseUs,
    applicationCases,
    moreApplications: moreApps,
    contactForm,
    guide
  } = data

  return (
    <div className="flex flex-col min-h-screen">
      <ApplicationHeroSection
        title={hero.titleText || "APPLICATION"}
        topSubtitle={hero.topSubtitleText || "CASES"}
        rightBoxText={hero.rightBoxText || "APPLICATION CASES"}
        bottomBoxText={hero.bottomBoxText || "VIEW MORE"}
        seeAllText={hero.seeAllText || "SEE ALL"}
        seeAllHref={hero.seeAllHref}
        slides={hero.slides}
        images={hero.images}
        locale={locale}
      />
      <ApplicationProductNavigationSection
        navigationItems={productNavigation.navigationItems}
        ctaText={productNavigation.ctaText}
        ctaHref={productNavigation.ctaHref}
        locale={locale}
      />
      <ApplicationEngineerSaidSection 
        title={engineerSaid?.title}
        mainQuote={engineerSaid.mainQuote}
        leftQuote={engineerSaid.leftQuote}
        rightQuote={engineerSaid.rightQuote}
        ctaText={engineerSaid.ctaText}
        ctaHref={engineerSaid.ctaHref}
        engineerImage={engineerSaid.engineerImageUrl}
        workImage={engineerSaid.workImageUrl}
      />
      <ApplicationWhyChooseUsSection 
        decorate={whyChooseUs.decorate}
        title={whyChooseUs.title}
        items={whyChooseUs.items.length > 0 ? whyChooseUs.items : undefined}
      />
      <ApplicationCasesSection 
        title={applicationCases.title || undefined}
        subtitle={applicationCases.subtitle || undefined}
        titleImage={applicationCases.titleImage}
        cases={applications.length > 0 ? applications : undefined}
      />
      {moreApps.hasMore && (
        <ApplicationMoreCasesSection 
          locale={locale} 
          data={{
            ...moreApps,
            applications: moreApplications
          }} 
        />
      )}
      <ApplicationContactFormSection 
        locale={locale} 
        bgImage={contactForm.bgImage}
        displayImage={contactForm.displayImage}
        logoImage={contactForm.logoImage}
        richText={contactForm.richText}
        formId={contactForm.formId}
        formConfig={contactForm.formConfig}
      />
      <ApplicationGuideSection 
        title={guide.title}
        image={guide.image}
        description={guide.description}
        serviceCta={guide.serviceCta}
        oemCta={guide.oemCta}
      />
    </div>
  )
}

export default ApplicationTemplate
