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

type Props = {
  locale: Locale;
  showForm?: boolean; 
};

export default function Footer({ locale, showForm = true }: Props) {
  const content = useMemo(() => getHomeContent(locale).footer, [locale]);

  // States
  const [footerData, setFooterData] = useState<FooterApiData | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Footer GLobal (contains formConfigName)
        const footerRes = await fetch(`/api/footer?locale=${locale}`);
        let currentFormName = 'footer-form'; // Fallback

        if (footerRes.ok) {
          const data = await footerRes.json();
          setFooterData(data);
          if (data.formConfigName) {
            currentFormName = data.formConfigName; // --- 解决本地和线上表单名不一致的关键 ---
          }
        }

        // 2. Fetch Form Config & Site Config in parallel
        const [siteRes, formRes] = await Promise.all([
          fetch('/api/site-config'),
          fetch(`/api/form-config/${currentFormName}?locale=${locale}`)
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
        console.error('[Footer] Failed to fetch layout data:', error);
      }
    };

    fetchAllData();
  }, [locale]);

  const handleFormSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };

  // Loading state (Optional: could also render FooterSimple with placeholders)
  if (showForm === false && footerData) {
    return <FooterSimple footerData={footerData} locale={locale} siteLogoUrl={siteLogoUrl} />;
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
        className="relative bg-gray-900 text-white flex flex-col justify-end"
        style={{ minHeight: 'calc(var(--rpx) * 1000)' }}
        data-header-theme="transparent"
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/BusromFooterBg.webp)' }}
          aria-hidden="true"
        />

        <div
          className="
            relative z-10 bg-brand-secondary
            w-[92%] sm:w-[88%] md:w-[90%] lg:w-[820px] xl:w-[1000px] 2xl:w-[1200px]
            mx-auto
            mt-[280px] sm:mt-[320px] md:mt-[380px] lg:mt-[200px] xl:mt-[100px] 2xl:mt-0
            mb-8 md:mb-12 lg:mb-20
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

        <FooterBottom footerData={footerData} siteLogoUrl={siteLogoUrl} centered />
      </footer>
    </>
  );
}
