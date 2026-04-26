import type { Locale } from "@/i18n.config";
import type { RichText } from "@/lib/parsers/service-overview-parser";
export type { RichText };

export interface MediaObject {
  id: string;
  url: string;
  alt?: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
  };
  cropFocalPoint?: { x: number; y: number } | null;
  width?: number;
  height?: number;
  enableLink?: boolean;
  linkUrl?: string;
  openInNewTab?: boolean;
}

export interface FormField {
  fieldName: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string; hasCustomInput?: boolean }>;
  order?: number;
  allowMultiple?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
  };
}

export interface FormConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  enableCaptcha: boolean;
  captchaEnabled: boolean;
  captchaSiteKey: string;
  captchaThreshold: number;
  captchaTheme: "light" | "dark" | "auto";
  captchaSize: "normal" | "compact";
  maxTotalFileSize?: number;
  privacyConsentText?: string;
  submittingText?: string;
  errorRequiredFields?: string;
  errorNetworkMessage?: string;
  errorCaptchaMessage?: string;
}

export interface ContactFormSectionProps {
  locale: Locale;
  formName?: string;
  formConfig?: FormConfig;
  backgroundImage?: MediaObject | null;
  title?: RichText[];
  subtitle?: string;
  description?: string;
  footerNote?: string;
  displayName?: string;
  info?: string[];
}
