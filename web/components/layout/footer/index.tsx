"use client";

import { useMemo, useState, useEffect } from "react";
import type { Locale } from "@/i18n.config";
import { getHomeContent } from "@/lib/content-data";
import { FooterApiData, FormConfig } from "./types";
import FooterContact from "./FooterContact";
import FooterForm from "./FooterForm";
import FooterSimple from "./FooterSimple";
import FooterBottom from "./FooterBottom";
import SuccessModal from "./SuccessModal";
import { cn } from "@/lib/utils";
import { useSeoDataAttr } from "@/components/product-series/SeoKeywordProvider";

type Props = {
  locale: Locale;
  showForm?: boolean;
  ssrData?: FooterApiData | null;
  headerTheme?: string;
  className?: string;
};

export default function Footer({
  locale,
  showForm = true,
  ssrData,
  headerTheme,
  className,
}: Props) {
  const content = useMemo(() => getHomeContent(locale).footer, [locale]);

  // States initialized with SSR data if available
  const [footerData, setFooterData] = useState<FooterApiData | null>(
    ssrData || null,
  );
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let currentFormName = footerData?.formConfigName || "footer-form";

        // Only fetch if we don't have footerData from SSR
        if (!ssrData) {
          const footerRes = await fetch(`/api/footer?locale=${locale}`);
          if (footerRes.ok) {
            const data = await footerRes.json();
            setFooterData(data);
            if (data.formConfigName) {
              currentFormName = data.formConfigName;
            }
          }
        }

        // 2. Fetch Form Config & Site Config in parallel
        const [siteRes, formRes] = await Promise.all([
          fetch("/api/site-config"),
          fetch(`/api/form-config/${currentFormName}?locale=${locale}`),
        ]);

        if (siteRes.ok) {
          const data = await siteRes.json();
          setTurnstileSiteKey(data.turnstileSiteKey || null);
          setSiteLogoUrl(data.logoUrl || null);
        }

        if (formRes.ok) {
          const data = await formRes.json();
          setFormConfig(data);
        }
      } catch (error) {
        console.error("[Footer] Failed to fetch layout data:", error);
      }
    };

    fetchAllData();
  }, [locale, ssrData]);

  const handleFormSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };

  // Loading state (Optional: could also render FooterSimple with placeholders)
  if (showForm === false && footerData) {
    return (
      <FooterSimple
        footerData={footerData}
        locale={locale}
        siteLogoUrl={siteLogoUrl}
      />
    );
  }

  // Handle Home Footer (with Form)
  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <footer
        className={cn(
          "relative bg-gray-900 text-white flex flex-col",
          className,
        )}
        style={{ minHeight: "calc(var(--rpx) * 1000)" }}
        data-header-theme={headerTheme || "transparent"}
        data-seo-tag={useSeoDataAttr() || undefined}
      >
        <img
          src={footerData?.backgroundImage || "/BusromFooterBg.webp"}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-[1] bg-black/50" />

        <div className="flex-1 flex flex-col justify-center relative z-10 py-12 md:py-20 lg:py-28 pb-24">
          <div
            className="
              bg-brand-secondary
              w-[92%] sm:w-[88%] md:w-[90%] lg:w-[1000px] xl:w-[1200px] 2xl:w-[1400px]
              mx-auto
              p-6 sm:p-8 md:p-10 lg:py-16 lg:px-16 xl:py-20 xl:px-20
              rounded-[40px] sm:rounded-[50px] md:rounded-[60px] lg:rounded-[60px]
            "
          >
            <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between lg:gap-8 xl:gap-12">
              <FooterContact footerData={footerData} content={content} />

              <div className="hidden lg:block w-px self-stretch bg-[#E3DEBB]"></div>
              <div className="lg:hidden w-full h-px bg-white/30 my-6"></div>

              <FooterForm
                locale={locale}
                formConfig={formConfig}
                content={content}
                turnstileSiteKey={turnstileSiteKey}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <FooterBottom
            footerData={footerData}
            siteLogoUrl={siteLogoUrl}
            centered
          />
        </div>
      </footer>
    </>
  );
}
