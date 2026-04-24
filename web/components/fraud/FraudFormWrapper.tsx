"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Turnstile } from "@/components/ui/turnstile";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface FraudFormWrapperProps {
  contactForm: any;
  locale: string;
  fraudConverters: any;
}

export function FraudFormWrapper({ contactForm, locale, fraudConverters }: FraudFormWrapperProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const STORAGE_KEY = 'busrom_privacy_consent';

  const getLocalizedString = (value: any, loc: string) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[loc] || value['en'] || Object.values(value)[0] || null;
    }
    return null;
  };

  const effectiveTitle = useMemo(() => {
    if (contactForm.title && contactForm.title.length > 0) return null;
    return getLocalizedString(contactForm.formConfig?.displayName, locale) || contactForm.formConfig?.name || "Report Suspicious Activity";
  }, [contactForm.title, contactForm.formConfig, locale]);

  const effectiveDescription = useMemo(() => {
    if (contactForm.description && contactForm.description.length > 0) return null;
    return getLocalizedString(contactForm.formConfig?.description, locale) || "Help us protect the community by reporting any fraudulent behavior.";
  }, [contactForm.description, contactForm.formConfig, locale]);

  const fields = useMemo(() => {
     const rawFields = contactForm.formConfig?.fields || [];
     return Array.isArray(rawFields) ? rawFields : (rawFields[locale] || rawFields['en'] || []);
  }, [contactForm.formConfig, locale]);

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const siteData = await res.json();
          if (siteData.turnstileSiteKey) setTurnstileSiteKey(siteData.turnstileSiteKey);
        }
      } catch (e) {}
    };
    fetchSiteKey();

    // Sync privacy consent from localStorage
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === 'true') {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    }
  }, []);

  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsGloballyAccepted(true);
      window.dispatchEvent(new Event('storage'));
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === 'true') {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (submitStatus === "error") setSubmitStatus("idle");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = fields.filter((f: any) => f.required && !formData[f.fieldName]);
    if (missingFields.length > 0) {
      setSubmitStatus("error");
      setErrorMessage(getLocalizedString(contactForm.formConfig?.errorRequiredFields, locale) || (locale === 'zh' ? '请填写必填项' : 'Please fill in required fields'));
      return;
    }

    if (contactForm.formConfig?.captchaEnabled && turnstileSiteKey && !turnstileToken) {
      setSubmitStatus("error");
      setErrorMessage(getLocalizedString(contactForm.formConfig?.errorCaptchaMessage, locale) || (locale === "zh" ? "请完成人机验证" : "Please complete the captcha verification"));
      return;
    }

    if (getLocalizedString(contactForm.formConfig?.privacyConsentText, locale) && !privacyAccepted) {
      setSubmitStatus("error");
      setErrorMessage(locale === 'zh' ? '请同意隐私政策' : 'Please accept the privacy policy');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      let fileUrl = "";
      if (uploadedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", uploadedFile);
        fileFormData.append("formConfigId", contactForm.formConfig.id.toString());
        fileFormData.append("fieldName", "attachment");

        try {
          const uploadRes = await fetch("/api/form-file-upload", {
            method: "POST",
            body: fileFormData,
          });

          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json();
            fileUrl = uploadResult.fileUrl;
          }
        } catch (e) {
          console.error("FileUpload error:", e);
        }
      }

      const submissionData = {
        formId: contactForm.formConfig.id,
        formName: contactForm.formConfig.name || "fraud-notice-form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
        userLocalTime: new Date().toString(),
        turnstileToken,
      };

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || getLocalizedString(contactForm.formConfig?.errorNetworkMessage, locale) || "Failed to submit form");
      }

      setSubmitStatus("success");
      setFormData({});
      setFileName("");
      setUploadedFile(null);
      setTurnstileToken(null);
      setTurnstileKey(prev => prev + 1);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : (getLocalizedString(contactForm.formConfig?.errorNetworkMessage, locale) || "Failed to submit form."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
       <div className="lg:sticky lg:top-24">
          <div className="prose-none prose-headings:text-4xl prose-headings:md:text-6xl prose-headings:font-black prose-headings:mb-6 prose-headings:tracking-tighter prose-headings:uppercase prose-headings:leading-tight prose-headings:text-white">
             {contactForm.title?.length > 0 ? (
                <RichText data={{ root: { children: contactForm.title } } as any} converters={fraudConverters} />
             ) : (
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-tight">
                   {effectiveTitle}
                </h2>
             )}
          </div>
          <div className="prose-none text-white text-xl leading-relaxed max-w-md">
             {contactForm.description?.length > 0 ? (
                <RichText data={{ root: { children: contactForm.description } } as any} converters={fraudConverters} />
             ) : (
                <p>
                   {effectiveDescription}
                </p>
             )}
          </div>
       </div>

       <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "12px" }}>
          {fields.map((field: any) => {
             const placeholder = `${getLocalizedString(field.placeholder || field.label, locale)}${field.required ? ' *' : ''}`;
             const isTextarea = field.fieldType === 'textarea' || field.fieldName.toLowerCase().includes('message');
             const isFile = field.fieldType === 'file' || field.fieldName.toLowerCase().includes('file') || field.fieldName.toLowerCase().includes('attachment');
             
             if (isTextarea || isFile) return null;

             const isPhone = field.fieldType === 'phone' || field.fieldType === 'tel' || field.fieldName.toLowerCase().includes('phone') || field.fieldName.toLowerCase().includes('whatsapp');
             const isSelect = field.fieldType === 'select';

             const labelText = getLocalizedString(field.label, locale);
             if (isPhone) {
                return (
                   <div key={field.id || field.fieldName} className="space-y-2">
                      {labelText && <label className="block text-white/60 font-anaheim font-semibold text-lg ml-1">{labelText}</label>}
                      <div className="dynamic-phone-input w-full h-14">
                         <PhoneInput 
                            value={formData[field.fieldName] || ""}
                            onChange={(v) => handleInputChange(field.fieldName, v)}
                            placeholder={placeholder}
                            required={field.required}
                            containerClassName="!h-full !w-full"
                            className="!bg-[#746D37] !border-white/34 !rounded-2xl !h-full"
                            buttonClassName="!bg-transparent !border-white/10 !text-white hover:!bg-white/5 !px-6"
                            inputClassName="!bg-transparent !text-white !placeholder-white/50 !font-anaheim !font-semibold !text-lg !px-6"
                            dialCodeClassName="!text-white !text-lg !font-anaheim"
                         />
                      </div>
                   </div>
                );
             }

             if (isSelect) {
                return (
                   <div key={field.id || field.fieldName} className="space-y-2">
                      {labelText && <label className="block text-white font-anaheim font-semibold text-lg ml-1">{labelText}</label>}
                      <div className="relative">
                         <select 
                            required={field.required}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            className="w-full appearance-none bg-[#746D37] border border-white/34 rounded-2xl px-6 h-14 text-white focus:outline-none focus:border-white/30 transition-all font-anaheim font-semibold text-lg placeholder:text-white/50"
                         >
                            <option value="" disabled className="bg-[#746D37]">
                               {placeholder}
                            </option>
                            {field.options?.map((opt: any) => (
                               <option key={opt.value} value={opt.value} className="bg-[#746D37]">
                                  {getLocalizedString(opt.label, locale) || opt.label}
                               </option>
                            ))}
                         </select>
                         <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                            <ChevronDown className="text-white/40" size={20} />
                         </div>
                      </div>
                   </div>
                );
             }

             return (
                <div key={field.id || field.fieldName} className="space-y-2">
                   {labelText && <label className="block text-white/60 font-anaheim font-semibold text-lg ml-1">{labelText}</label>}
                   <input 
                      type={field.fieldType === 'email' ? 'email' : 'text'}
                      placeholder={placeholder}
                      required={field.required}
                      value={formData[field.fieldName] || ""}
                      onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                      className="w-full bg-[#746D37] border border-white/34 rounded-2xl px-6 h-14 text-white focus:outline-none focus:border-white/30 transition-all font-anaheim font-semibold text-lg placeholder:text-white/50"
                   />
                </div>
             );
          })}

          {fields.filter((f: any) => f.fieldType === 'textarea' || f.fieldName.toLowerCase().includes('message')).map((field: any) => {
             const labelText = getLocalizedString(field.label, locale);
             const placeholder = `${getLocalizedString(field.placeholder || field.label, locale)}${field.required ? ' *' : ''}`;
             return (
                <div key={field.id || field.fieldName} className="space-y-2">
                   {labelText && <label className="block text-white font-anaheim font-semibold text-lg ml-1">{labelText}</label>}
                   <textarea 
                      placeholder={placeholder}
                      required={field.required}
                      value={formData[field.fieldName] || ""}
                      onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                      className="w-full bg-[#746D37] border border-white/34 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-all h-32 resize-none scrollbar-hide font-anaheim font-semibold text-lg placeholder:text-white/50"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                   />
                </div>
             );
          })}

          <div className="flex justify-end pr-4">
             <label className="flex items-center gap-3 cursor-pointer border border-[#756F3F] rounded-full px-8 py-3 transition-colors hover:bg-black/10 h-14 group">
                <input type="file" className="hidden" onChange={handleFileChange} />
                <Upload className="text-[#756F3F]" size={20} />
                <span className="text-[#756F3F] font-anaheim font-semibold transition-colors">
                   {fileName || (locale === 'zh' ? '上传文件' : 'Upload File')}
                </span>
             </label>
          </div>

          {contactForm.formConfig?.captchaEnabled && turnstileSiteKey && (
            <div className="mt-2">
              <Turnstile
                key={turnstileKey}
                siteKey={turnstileSiteKey}
                onVerify={setTurnstileToken}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme={contactForm.formConfig?.captchaTheme === 'auto' ? 'dark' : contactForm.formConfig?.captchaTheme || 'dark'}
                size={contactForm.formConfig?.captchaSize || "normal"}
                language={locale === 'zh' ? 'zh-CN' : locale}
              />
            </div>
          )}

          <div className="pt-6">
             <button 
                type="submit" 
                disabled={isSubmitting || (contactForm.formConfig?.captchaEnabled && !turnstileToken) || (!!getLocalizedString(contactForm.formConfig?.privacyConsentText, locale) && !privacyAccepted)}
                className="group flex items-center justify-center gap-4 bg-[#564D03] text-white px-12 h-16 rounded-full font-black uppercase tracking-widest hover:bg-[#3d3602] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
             >
                {isSubmitting 
                  ? (getLocalizedString(contactForm.formConfig?.submittingText, locale) || (locale === 'zh' ? '提交中...' : "Submitting...")) 
                  : (submitStatus === 'success' 
                      ? (getLocalizedString(contactForm.formConfig?.successMessage, locale) || (locale === 'zh' ? '已提交!' : "Submitted")) 
                      : (getLocalizedString(contactForm.formConfig?.submitButtonText, locale) || (locale === 'zh' ? '提交报告' : "Submit Report"))
                    )
                }
             </button>
          </div>

          {getLocalizedString(contactForm.formConfig?.privacyConsentText, locale) && !isGloballyAccepted && (
            <div className="flex items-start gap-3 mt-6 cursor-pointer group/privacy" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
              <div className={cn(
                "mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all",
                privacyAccepted ? "bg-white border-white" : "border-white/20 group-hover/privacy:border-white/40"
              )}>
                {privacyAccepted && (
                  <svg className="w-3.5 h-3.5 text-[#060C14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-[14px] leading-relaxed text-gray-400 select-none group-hover/privacy:text-gray-300 transition-colors">
                {getLocalizedString(contactForm.formConfig?.privacyConsentText, locale)}
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <p className="text-red-400 mt-4 text-sm font-medium">
              {errorMessage || getLocalizedString(contactForm.formConfig?.errorNetworkMessage, locale)}
            </p>
          )}
       </form>
    </div>
  );
}
