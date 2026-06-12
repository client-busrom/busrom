import React from "react";
import { notFound } from "next/navigation";
import { getRandomAppImage } from "@/lib/image-utils";
import { PAGE_TEMPLATES } from "@/lib/constants";
import { ApplicationTemplate } from "./ApplicationTemplate";
import { ContactUsTemplate } from "./ContactUsTemplate";
import { FaqTemplate } from "./FaqTemplate";
import { OemOdmTemplate } from "./OemOdmTemplate";
import { OneStopSolutionTemplate } from "./OneStopSolutionTemplate";
import { OurStoryTemplate } from "./OurStoryTemplate";
import { PrivacyPolicyTemplate } from "./PrivacyPolicyTemplate";
import { ProductOverviewTemplate } from "./ProductOverviewTemplate";
import { ServiceOverviewTemplate } from "./ServiceOverviewTemplate";
import { SupportTemplate } from "./SupportTemplate";
import { FraudNoticeTemplate } from "./FraudNoticeTemplate";
import type { ApplicationCase } from "../application/sections/ApplicationCasesSection";

// Parsers
import { parseApplicationData } from "@/lib/parsers/application-parser";
import { parseContactUsData } from "@/lib/parsers/contact-us-parser";
import { parseFaqData } from "@/lib/parsers/faq-parser";
import { parseOemOdmData } from "@/lib/parsers/oem-odm-parser";
import { parseOneStopData } from "@/lib/parsers/one-stop-solution-parser";
import { parseOurStoryData } from "@/lib/parsers/our-story-parser";
import { parseProductOverviewData } from "@/lib/parsers/product-overview-parser";
import { parseServiceOverviewData } from "@/lib/parsers/service-overview-parser";
import { parseSupportData } from "@/lib/parsers/support-parser";
import { parseFraudNoticeData } from "@/lib/parsers/fraud-notice-parser";

interface TemplateSwitcherProps {
  locale: string;
  rawData: any;
}

/**
 * TemplateSwitcher - Centralized routing for page templates based on CMS template identifiers
 */
import WaterfallHeroWrapper from "@/components/common/WaterfallHero";

export function TemplateSwitcher({ locale, rawData }: TemplateSwitcherProps) {
  const template = rawData.template;

  const renderTemplate = () => {
    switch (template) {
      case PAGE_TEMPLATES.APPLICATION: {
        const parsedData = parseApplicationData(locale, rawData);
        const allApplications = rawData.applications || [];
        
        const applications = (parsedData.applicationCases?.applicationIds || [])
          .map((id: string): ApplicationCase | null => {
            const app = allApplications.find((a: any) => String(a.id) === String(id));
            if (!app) return null;
            let appImage = app.image || getRandomAppImage(app);
            return {
              id: String(app.id),
              title: app.title || app.name || "",
              image: appImage,
              category: app.subtitle || app.shortDescription || "",
            };
          })
          .filter((app): app is ApplicationCase => app !== null);

        return (
          <ApplicationTemplate
            locale={locale}
            data={parsedData}
            applications={applications}
            moreApplications={rawData.applications || []}
          />
        );
      }

      case PAGE_TEMPLATES.CONTACT_US: {
        const parsedData = parseContactUsData(rawData.content || rawData.contentTranslation, rawData.mediaData);
        const ssrData = {
          products: rawData.products,
          applications: rawData.applications,
          formConfig: rawData.formConfig,
        };
        return <ContactUsTemplate locale={locale} data={parsedData} ssrData={ssrData} />;
      }

      case PAGE_TEMPLATES.FAQ: {
        const parsedData = parseFaqData(locale, rawData);
        return <FaqTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.FRAUD_NOTICE: {
        const parsedData = parseFraudNoticeData(locale, rawData);
        return <FraudNoticeTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.OEM_ODM: {
        const parsedData = parseOemOdmData(rawData, locale);
        return <OemOdmTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.ONE_STOP_SOLUTION: {
        const parsedData = parseOneStopData(rawData, locale);
        return <OneStopSolutionTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.OUR_STORY: {
        const parsedData = parseOurStoryData(locale, rawData);
        const allApplications = rawData.applications || [];
        
        const applications = (parsedData.applications?.applicationIds || [])
          .map((id: string): any => {
            const app = allApplications.find((a: any) => String(a.id) === String(id));
            if (!app) return null;
            let appImage = app.image || getRandomAppImage(app);
            return {
              id: String(app.id),
              title: app.title || app.name || "",
              image: appImage,
              category: app.subtitle || app.shortDescription || "",
            };
          })
          .filter((app) => app !== null);

        const sphere3dData = {
          title: "GLOBAL NETWORK",
          description: "Serving Customers Worldwide From Guangdong, China",
        };

        return <OurStoryTemplate locale={locale} data={parsedData} applications={applications as any[]} sphere3dData={sphere3dData} />;
      }

      case PAGE_TEMPLATES.PRIVACY_POLICY: {
        return <PrivacyPolicyTemplate locale={locale} data={rawData} />;
      }

      case PAGE_TEMPLATES.PRODUCT_OVERVIEW: {
        const parsedData = parseProductOverviewData(locale, rawData);
        return <ProductOverviewTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.SERVICE_OVERVIEW: {
        const parsedData = parseServiceOverviewData(rawData);
        return <ServiceOverviewTemplate locale={locale} data={parsedData} />;
      }

      case PAGE_TEMPLATES.SUPPORT: {
        const parsedData = parseSupportData(locale, rawData);
        const allApplications = rawData.applications || [];
        
        const resolvedApplications = (parsedData.applications?.applicationIds || [])
          .map((id: string): any => {
            const app = allApplications.find((a: any) => String(a.id || a) === String(id));
            if (!app) return null;
            let appImage = app.image || getRandomAppImage(app);
            return {
              id: String(app.id),
              title: app.title || app.name || "",
              image: appImage,
              category: app.subtitle || app.shortDescription || "",
            };
          })
          .filter((app) => app !== null);

        return <SupportTemplate locale={locale} data={parsedData} resolvedApplications={resolvedApplications as any[]} />;
      }

      default:
        // Fallback for generic Lexical content if no specific template is matched
        return <PrivacyPolicyTemplate locale={locale} data={rawData} />;
    }
  };

  return (
    <>
      {/* Universal Waterfall Hero applicable to ALL template pages */}
      <WaterfallHeroWrapper pageData={rawData} locale={locale} />
      {renderTemplate()}
    </>
  );
}
