"use client";

import React from "react";
import { OemOdmValueGuide } from "@/components/oem-odm/OemOdmValueGuide";
import { OemOdmBrandAdvantage } from "@/components/oem-odm/OemOdmBrandAdvantage";
import { OemOdmServiceIntroduction } from "@/components/oem-odm/OemOdmServiceIntroduction";
import { OemOdmWhatIsOem } from "@/components/oem-odm/OemOdmWhatIsOem";
import { OemOdmProductSeries } from "@/components/oem-odm/OemOdmProductSeries";
import { OemOdmPartner } from "@/components/oem-odm/OemOdmPartner";
import { OemAdvantages } from "@/components/oem-odm/OemAdvantages";
// ODM components
import { OdmServiceIntroduction } from "@/components/oem-odm/OdmServiceIntroduction";
import { OdmWhatIsOdm } from "@/components/oem-odm/OdmWhatIsOdm";
import { OdmProductSeries } from "@/components/oem-odm/OdmProductSeries";
import { OdmPartner } from "@/components/oem-odm/OdmPartner";
import { OdmAdvantages } from "@/components/oem-odm/OdmAdvantages";
// Common components
import { OemOdmWhatWeOffer } from "@/components/oem-odm/OemOdmWhatWeOffer";
import { OemOdmCustomizationProcess } from "@/components/oem-odm/OemOdmCustomizationProcess";
import { OemOdmContactForm } from "@/components/oem-odm/OemOdmContactForm";
import { OemOdmApplications } from "@/components/oem-odm/OemOdmApplications";
import { OemOdmProductGuide } from "@/components/oem-odm/OemOdmProductGuide";

// MediaObject interface moved to @/lib/lexical-utils

interface OemOdmTemplateProps {
  locale: string;
  data: any; // The parsed data from parseOemOdmData
}

// ========================================
// OemOdmTemplate 组件
// ========================================

export function OemOdmTemplate({ locale, data }: OemOdmTemplateProps) {
  const {
    valueGuide,
    brandAdvantage,
    oemService,
    odmService,
    whatWeOffer,
    customizationProcess,
    contactForm,
    applications,
    productGuide,
  } = data;

  return (
    <main className="min-h-screen" data-header-theme="dark">
      {/* Hero Section - Value Guide */}
      <OemOdmValueGuide
        titleLines={valueGuide.titleLines}
        features={valueGuide.features}
        leftDescription={valueGuide.description || undefined}
        rightDescription={valueGuide.rightDescription || undefined}
        leftImage={valueGuide.leftImage}
        rightImage={valueGuide.rightImage}
      />

      {/* Brand Advantage Section */}
      <OemOdmBrandAdvantage
        brandAdvantages={
          brandAdvantage.items.length > 0 ? brandAdvantage.items : undefined
        }
        leftImage={brandAdvantage.images[0] || null}
        rightImage={brandAdvantage.images[1] || null}
        onOemClick={() => {
          document
            .getElementById("oem-service-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onOdmClick={() => {
          document
            .getElementById("odm-service-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* OEM Sections - 统一背景色 #756f3f */}
      <div id="oem-service-section" style={{ backgroundColor: "#756f3f" }}>
        {/* OEM Service Introduction Section */}
        <OemOdmServiceIntroduction
          image={oemService.image}
          topDescriptionSegments={
            oemService.description.length > 0
              ? oemService.description
              : undefined
          }
          leftDescriptionSegments={
            oemService.leftDescription.length > 0
              ? oemService.leftDescription
              : undefined
          }
        />

        {/* What Is OEM Section */}
        <OemOdmWhatIsOem
          image={oemService.what.image}
          subtitle={oemService.what.subtitle || undefined}
          descriptionSegments={
            oemService.what.descriptionSegments.length > 0
              ? oemService.what.descriptionSegments
              : undefined
          }
        />

        {/* OEM Product Series Section */}
        <OemOdmProductSeries
          title={oemService.series.title || undefined}
          description={oemService.series.description || undefined}
          image={oemService.series.image}
          viewMoreText={oemService.series.linkText || undefined}
          viewMoreLink={oemService.series.linkUrl || undefined}
        />

        {/* OEM Partner Section */}
        <OemOdmPartner
          title={oemService.partner.title || undefined}
          items={
            oemService.partner.items.length > 0
              ? oemService.partner.items.map((item: any) => ({ title: item }))
              : undefined
          }
          images={oemService.partner.images}
        />

        {/* OEM Advantages Section */}
        <OemAdvantages
          title={oemService.advantages.title || undefined}
          items={
            oemService.advantages.items.length > 0
              ? oemService.advantages.items
              : undefined
          }
        />
      </div>

      {/* ODM Sections - 渐变背景 from #EDE9C7 to #F6F4ED */}
      <div
        id="odm-service-section"
        style={{
          background: "linear-gradient(180deg, #EDE9C7 0%, #F6F4ED 82.36%)",
        }}
      >
        {/* ODM Service Introduction Section */}
        <OdmServiceIntroduction
          image={odmService.image}
          topDescriptionSegments={
            odmService.description.length > 0
              ? odmService.description
              : undefined
          }
          leftDescriptionSegments={
            odmService.leftDescription.length > 0
              ? odmService.leftDescription
              : undefined
          }
        />

        {/* What Is ODM Section */}
        <OdmWhatIsOdm
          image={odmService.what.image}
          subtitle={odmService.what.subtitle || undefined}
          descriptionSegments={
            odmService.what.descriptionSegments.length > 0
              ? odmService.what.descriptionSegments
              : undefined
          }
        />

        {/* ODM Product Series Section */}
        <OdmProductSeries
          title={odmService.series.title || undefined}
          description={odmService.series.description || undefined}
          image={odmService.series.image}
          viewMoreText={odmService.series.linkText || undefined}
          viewMoreLink={odmService.series.linkUrl || undefined}
        />

        {/* ODM Partner Section */}
        <OdmPartner
          title={odmService.partner.title || undefined}
          items={
            odmService.partner.items.length > 0
              ? odmService.partner.items.map((item: any) => ({ title: item }))
              : undefined
          }
          images={odmService.partner.images}
        />

        {/* ODM Advantages Section */}
        <OdmAdvantages
          title={odmService.advantages.title || undefined}
          items={
            odmService.advantages.items.length > 0
              ? odmService.advantages.items
              : undefined
          }
        />
      </div>

      {/* Common Sections */}
      <OemOdmWhatWeOffer
        title={whatWeOffer.title || undefined}
        items={whatWeOffer.items}
      />

      <OemOdmCustomizationProcess
        title={customizationProcess.title || undefined}
        tips={customizationProcess.subtitle || undefined}
        hint={customizationProcess.hint || undefined}
        steps={customizationProcess.steps}
      />

      <OemOdmContactForm
        title={contactForm.title || undefined}
        description={contactForm.description || undefined}
        image={contactForm.image}
        formConfig={contactForm.formConfig}
      />

      <OemOdmApplications
        applicationIds={applications}
        locale={locale as any}
        findOutMore={data.applicationsData?.findOutMore}
        nextText={data.applicationsData?.nextText}
      />

      <OemOdmProductGuide
        title={productGuide.title || undefined}
        description={productGuide.description || undefined}
        buttonText={productGuide.buttonText || undefined}
        buttonLink={productGuide.buttonLink || undefined}
        exploreText={productGuide.exploreText || undefined}
      />
    </main>
  );
}

export default OemOdmTemplate;
