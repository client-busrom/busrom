import type { Locale } from "@/i18n.config";

export interface FooterApiData {
  formConfigName?: string;
  backgroundImage?: string | null;
  contact: {
    title: string;
    emailLabel: string;
    email: string;
    afterSalesLabel: string;
    afterSales: string;
    whatsappLabel: string;
    whatsapp: string;
    addressLabel?: string;
    address?: string;
    workingHoursLabel?: string;
    workingHours?: string;
  };
  notice: {
    title: string;
    lines: string[];
  };
  navigationMenus: Array<{
    slug: string;
    name: string;
    link: string;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  copyrightText?: string;
  legalLinks?: Array<{
    label: string;
    url: string;
  }>;
}

export interface FormConfig {
  name?: string;
  errorCaptchaMessage?: string;
  errorRequiredFields?: string;
  errorNetworkMessage?: string;
  successMessage?: string;
  submitButtonText?: string;
  submittingText?: string;
  privacyConsentText?: string;
}
