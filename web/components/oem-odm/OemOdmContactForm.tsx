"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CUSTOM_ICONS } from "@/lib/icons";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { uploadFileWithProgress } from "@/lib/upload";
import type { Locale } from "@/i18n.config";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";

interface MediaObject {
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

interface FormField {
  label: string;
  fieldName: string;
  fieldType: string;
  placeholder?: string;
  required?: boolean;
  order?: number;
  options?: Array<{ label: string; value: string }>;
}

interface FormConfig {
  id?: string;
  name?: string;
  displayName?: string;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  fields?: FormField[] | Record<string, FormField[]>;
  privacyConsentText?: string;
  data?: any;
}

interface OemOdmContactFormProps {
  title?: string;
  description?: string;
  image?: MediaObject | null;
  formConfig?: FormConfig | null;
  locale?: Locale;
}

export function OemOdmContactForm({
  title = "",
  description = "",
  image,
  formConfig,
  locale = "en",
}: OemOdmContactFormProps) {
  // 处理表单配置数据结构
  const configData = formConfig?.data || formConfig;
  const rawFields = configData?.fields;
  const fields: FormField[] = Array.isArray(rawFields)
    ? rawFields
    : rawFields?.[locale] || rawFields?.["en"] || [];
  const sortedFields = [...fields].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  // Helper function to extract localized string
  const getLocalizedString = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val[locale] || val["en"] || "";
    }
    return "";
  };

  const privacyText = getLocalizedString(configData?.privacyConsentText);
  const submitText =
    getLocalizedString(configData?.submitButtonText) ||
    (locale === "zh" ? "提交" : "Submit");
  const submittingText =
    getLocalizedString(configData?.submittingText) ||
    (locale === "zh" ? "提交中..." : "Submitting...");

  const UPLOAD_TEXT: Record<string, string> = {
    zh: "上传文件",
    es: "Subir archivo",
    pt: "Carregar arquivo",
    en: "Upload File"
  };

  const getFilesSelectedText = (count: number, loc: string) => {
    if (loc === "zh") return `已选择 ${count} 个文件`;
    if (loc === "es") return `${count} archivo(s) seleccionado(s)`;
    if (loc === "pt") return `${count} arquivo(s) selecionado(s)`;
    return `${count} file(s) selected`;
  };

  const uploadLabel = UPLOAD_TEXT[locale] || UPLOAD_TEXT.en;

  // 表单数据状态
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const STORAGE_KEY = "busrom_privacy_consent";

  // Check global consent status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    }
  }, []);

  // Sync with global storage
  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsGloballyAccepted(true);
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setIsGloballyAccepted(true);
        setPrivacyAccepted(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 文件上传
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Turnstile captcha
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c[1] === "US") || COUNTRIES[0],
  );
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  // Click outside to close country selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countrySelectorRef.current &&
        !countrySelectorRef.current.contains(event.target as Node)
      ) {
        setOpenCountrySelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (fieldName: string, value: string) => {
    // Only keep digits
    const digits = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: digits ? `+${selectedCountry[2]}${digits}` : "",
    }));
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1025);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 初始化表单数据
  useEffect(() => {
    if (fields.length > 0) {
      const initialData: Record<string, any> = {};
      fields.forEach((field: FormField) => {
        if (
          field.fieldType === "select" &&
          field.options &&
          field.options.length > 0
        ) {
          initialData[field.fieldName] = field.options[0].value;
        } else {
          initialData[field.fieldName] =
            field.fieldType === "checkbox" ? [] : "";
        }
      });
      setFormData(initialData);
    }
  }, [fields.length]);

  // 获取 Turnstile site key
  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const data = await res.json();
          if (data.turnstileSiteKey) {
            setTurnstileSiteKey(data.turnstileSiteKey);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Turnstile site key:", error);
      }
    };
    fetchSiteKey();
  }, []);

  // Turnstile callbacks
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setError("Captcha verification failed. Please try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  // 处理输入变化
  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // 处理复选框变化
  const handleCheckboxChange = (
    fieldName: string,
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentValues = Array.isArray(prev[fieldName])
        ? prev[fieldName]
        : [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v: string) => v !== value),
        };
      }
    });
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const missingFields: string[] = [];
      sortedFields.forEach((field) => {
        if (field.required && field.fieldType !== "file") {
          const value = formData[field.fieldName];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field.label);
          }
        }
      });

      if (missingFields.length > 0) {
        setError(
          `Please fill in required fields (${missingFields.join(", ")}) before selecting files.`,
        );
        return;
      }
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const missingFields: string[] = [];
      sortedFields.forEach((field) => {
        if (field.required) {
          const value = formData[field.fieldName];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field.label);
          }
        }
      });

      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(", ")}`);
        setSubmitting(false);
        return;
      }

      if (turnstileSiteKey && !turnstileToken) {
        setError("Please complete the captcha verification");
        setSubmitting(false);
        return;
      }

      const attachments: any[] = [];
      if (uploadedFiles.length > 0) {
        const fileField = fields.find((f: FormField) => f.fieldType === "file");
        const fileFieldName = fileField?.fieldName || "attachment";

        const uploadPromises = uploadedFiles.map(async (file, index) => {
          return uploadFileWithProgress({
            url: "/api/form-file-upload",
            file: file,
            fieldName: "file",
            additionalData: {
              formConfigId: formConfig?.id || configData?.id || "",
              fieldName: fileFieldName,
            },
            onProgress: (event) => {
              setUploadProgress(event.percent);
            },
          });
        });

        try {
          const results = await Promise.all(uploadPromises);
          attachments.push(
            ...results.map((res) => ({
              fieldName: fileFieldName,
              fileName: res.fileName,
              fileUrl: res.fileUrl,
              fileSize: res.fileSize,
              fileType: res.fileType,
              uploadedAt: res.uploadedAt,
            })),
          );
        } catch (uploadErr) {
          throw new Error("Failed to upload files. Please try again.");
        }
      }

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id || configData?.id,
          formName: configData?.name,
          data: formData,
          attachments,
          locale,
          sourcePage: typeof window !== "undefined" ? window.location.href : "",
          turnstileToken,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Push success event to Google Tag Manager
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "form_submit_success",
            form_id: configData?.name || "oem-odm-form",
            form_name: configData?.name || "OEM/ODM Contact Form",
          });
        }
        setTurnstileToken(null);
        setTurnstileKey((prev) => prev + 1);
        setTimeout(() => {
          setSubmitted(false);
          setUploadedFiles([]);
        }, 5000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || configData?.errorMessage || "Failed");
      }
    } catch (err) {
      setError("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  // 分离字段
  const textFields = sortedFields.filter(
    (f) =>
      ["text", "email", "tel", "phone"].includes(f.fieldType) &&
      f.fieldName !== "others-indicate",
  );
  const selectFields = sortedFields.filter((f) => f.fieldType === "select");
  const textareaFields = sortedFields.filter(
    (f) => f.fieldType === "textarea" && f.fieldName !== "others-indicate",
  );
  const checkboxFields = sortedFields.filter((f) => f.fieldType === "checkbox");

  // 加载动画圆圈组件
  const LoadingCircles = () => (
    <div className="flex items-end gap-1">
      {[0, 0.15, 0.3, 0.45].map((delay, i) => (
        <motion.div
          key={i}
          className={`relative overflow-hidden ${
            i === 0
              ? "w-6 h-6 md:w-12 md:h-12 rounded-full"
              : "w-1.5 h-6 md:w-3 md:h-12"
          }`}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay }}
        >
          <div
            className="absolute right-0 w-6 h-6 md:w-12 md:h-12 rounded-full"
            style={{
              backgroundColor:
                i === 0
                  ? "white"
                  : `rgba(255, 255, 255, ${0.6 - (i - 1) * 0.15})`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );

  // 提交成功或空配置提示
  if (!formConfig || fields.length === 0 || submitted) {
    return (
      <section className="w-full max-w-[1440px] mx-auto px-4 py-20">
        <div className="bg-white rounded-[30px] border border-[#cfcaa2] p-20 flex flex-col items-center justify-center min-h-[400px] text-center">
          {submitted ? (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-anaheim font-bold text-green-700">
                {configData?.successMessageTitle}
              </h3>
              <p className="text-green-600 text-lg">
                {configData?.successMessageDescription}
              </p>
            </div>
          ) : (
            <p className="text-yellow-700">
              {configData?.formErrorMessage || "Form configuration missing."}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section 
      id="contact-form"
      className="w-full overflow-hidden py-10 md:py-20 font-anaheim"
    >
      <div className="max-w-[1500px] mx-auto px-4 md:px-8">
        <div className="flex flex-col">
          {/* ========== Hero Header ========== */}
          <div className="md:mx-[-20px] rounded-[20px] overflow-hidden shadow-sm relative z-20">
            <div className="relative min-h-[280px] h-auto md:h-[260px] overflow-hidden">
              {image ? (
                <OptimizedImage
                  image={image as any}
                  alt="OEM/ODM Contact"
                  size="xlarge"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-black" />
              )}
              <div className="absolute inset-0 bg-black/60" />

              <div className="relative z-10 h-full flex flex-col md:flex-row items-start md:items-end justify-start px-6 md:px-24 py-6 md:py-10 gap-2 md:gap-24">
                {/* Left Title Box */}
                <motion.div
                  className="relative border border-white/50 p-3 min-w-[180px] md:min-w-[300px]"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-line">
                    {title}
                  </h2>
                  {/* Decorative Circles */}
                  <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-10">
                    <LoadingCircles />
                  </div>
                </motion.div>

                {/* Right Description */}
                <div className="relative flex flex-col gap-2 max-w-2xl mb-4">
                  {/* Yellow Accent Line */}
                  <div className="w-8 h-1.5 bg-[#FFF49F]" />
                  <motion.p
                    className="text-white text-sm md:text-xl font-semibold leading-relaxed whitespace-pre-line"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {description}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Form Content ========== */}
          <div className="bg-white border-2 border-[#cfcaa2] rounded-[20px] rounded-t-none border-t-0 shadow-sm relative z-10">
            <form
              id={configData?.name || "oem-odm-form"}
              onSubmit={handleSubmit}
              className="px-8 py-8 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16"
            >
              {/* Main Form Area (Left 8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <motion.h2
                  className="text-4xl md:text-4xl font-extrabold text-[#6F6200] whitespace-pre-line"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  {configData?.displayName}
                </motion.h2>

                {/* Text Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textFields.map((field, idx) => {
                    const isPhone =
                      field.fieldType === "tel" ||
                      field.fieldType === "phone" ||
                      field.fieldName.toLowerCase().includes("phone") ||
                      field.fieldName.toLowerCase().includes("whatsapp");

                    return (
                      <div
                        key={field.fieldName}
                        style={{
                          backgroundColor: "#F3F1EA",
                          border: "1px solid rgba(117, 111, 63, 0.1)",
                        }}
                        className="rounded-[10px] h-[50px] flex items-center"
                      >
                        {isPhone ? (
                          <div 
                            className={cn(
                              "flex-1 h-full flex items-stretch relative",
                              openCountrySelector ? "z-20" : "z-0"
                            )} 
                            ref={countrySelectorRef}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenCountrySelector(!openCountrySelector)}
                              disabled={submitting}
                              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 hover:bg-black/5 transition-colors border-r border-[#756F3F]/10 flex-shrink-0"
                            >
                              <div className="w-6 h-4 md:w-8 md:h-5 flex-shrink-0">
                                <CountryFlag
                                  countryCode={selectedCountry[1]}
                                  className="w-full h-full rounded-[2px] object-cover"
                                />
                              </div>
                              <span
                                className="font-anaheim font-semibold"
                                style={{
                                  fontSize: isMobile ? "14px" : "16px",
                                  color: "rgba(117, 111, 63, 0.7)",
                                }}
                              >
                                +{selectedCountry[2]}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "transition-transform flex-shrink-0",
                                  openCountrySelector && "rotate-180"
                                )}
                                size={isMobile ? 14 : 16}
                                style={{ color: "rgba(117, 111, 63, 0.5)" }}
                              />
                            </button>

                            <input
                              type="tel"
                              value={
                                formData[field.fieldName]?.replace(
                                  `+${selectedCountry[2]}`,
                                  "",
                                ) || ""
                              }
                              onChange={(e) =>
                                handlePhoneChange(field.fieldName, e.target.value)
                              }
                              placeholder={
                                field.placeholder?.trim() || field.label
                              }
                              disabled={submitting}
                              className="flex-1 bg-transparent px-4 outline-none font-anaheim font-semibold text-base placeholder-[rgba(117,111,63,0.4)] [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#F3F1EA_inset!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                              style={{ color: "rgba(117, 111, 63, 0.7)" }}
                            />

                            {openCountrySelector && (
                              <div className="absolute left-0 top-full mt-2 z-[100]">
                                <CountrySelectorList
                                  onSelect={(country) => {
                                    setSelectedCountry(country);
                                    setOpenCountrySelector(false);
                                  }}
                                  onClose={() => setOpenCountrySelector(false)}
                                  className="shadow-2xl"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type={
                              field.fieldType === "email" ? "email" : "text"
                            }
                            value={formData[field.fieldName] || ""}
                            onChange={(e) =>
                              handleChange(field.fieldName, e.target.value)
                            }
                            spellCheck="false"
                            className="w-full h-full px-6 bg-transparent outline-none font-anaheim font-semibold text-base placeholder-[rgba(117,111,63,0.4)] [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                            style={{ color: "rgba(117, 111, 63, 0.7)" }}
                            placeholder={
                              field.placeholder?.trim() || field.label
                            }
                            disabled={submitting}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Select Field */}
                {selectFields[0] && (
                  <div className="space-y-4">
                    <label className="text-xl md:text-2xl font-semibold text-[#756F3F] block mt-4">
                      {selectFields[0].label}
                    </label>
                    <div
                      className="relative rounded-[10px] h-[50px]"
                      style={{
                        backgroundColor: "#F3F1EA",
                        border: "1px solid rgba(117, 111, 63, 0.1)",
                      }}
                    >
                      <select
                        value={formData[selectFields[0].fieldName] || ""}
                        onChange={(e) =>
                          handleChange(
                            selectFields[0].fieldName,
                            e.target.value,
                          )
                        }
                        className="w-full h-full px-6 bg-transparent outline-none font-anaheim font-semibold text-base appearance-none cursor-pointer"
                        style={{ color: "rgba(117, 111, 63, 0.7)" }}
                        disabled={submitting}
                      >
                        {selectFields[0].options?.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            style={{
                              backgroundColor: "#F3F1EA",
                              color: "#756F3F",
                            }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          width="24"
                          height="12"
                          viewBox="0 0 31 14"
                          fill="none"
                        >
                          <path
                            d="M15.5138 11.3538L2.24596 0.319738C1.73241 -0.106579 0.899394 -0.106579 0.385165 0.319738C-0.128388 0.747503 -0.128388 1.44023 0.385165 1.86788L14.4787 13.5871C14.5088 13.6191 14.542 13.6504 14.5774 13.6797C15.0917 14.1068 15.9246 14.1068 16.4382 13.6797L30.6144 1.89054C31.1285 1.4629 31.1285 0.770169 30.6144 0.343084C30.1015 -0.0839129 29.2686 -0.0839129 28.7543 0.343084L15.5138 11.3538Z"
                            fill="#756F3F"
                            fillOpacity="0.7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                {textareaFields[0] && (
                  <div
                    className="rounded-[10px] p-5 min-h-[80px]"
                    style={{
                      backgroundColor: "#F3F1EA",
                      border: "1px solid rgba(117, 111, 63, 0.1)",
                    }}
                  >
                    <textarea
                      value={formData[textareaFields[0].fieldName] || ""}
                      onChange={(e) =>
                        handleChange(
                          textareaFields[0].fieldName,
                          e.target.value,
                        )
                      }
                      spellCheck="false"
                      className="w-full h-full bg-transparent outline-none font-anaheim font-semibold text-base placeholder-[rgba(117,111,63,0.4)] resize-none [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                      style={{ color: "rgba(117, 111, 63, 0.7)" }}
                      placeholder={
                        textareaFields[0].placeholder?.trim() ||
                        textareaFields[0].label
                      }
                      disabled={submitting}
                      rows={2}
                    />
                  </div>
                )}

                {/* Footer Actions (Upload, Privacy, Captcha, Submit) */}
                <div className="flex flex-col gap-0 pt-2">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Upload Button */}
                    <div
                      className="flex items-center justify-center px-8 py-3 rounded-full border border-[#756F3F] text-[#756F3F] hover:bg-[#756F3F] hover:text-white transition-all cursor-pointer group gap-3 text-lg md:text-xl font-semibold whitespace-nowrap h-[50px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox={CUSTOM_ICONS.upload.viewBox}
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <path
                          d={CUSTOM_ICONS.upload.path}
                          fill="currentColor"
                        />
                      </svg>
                      <span>
                        {uploadedFiles.length > 0
                          ? getFilesSelectedText(uploadedFiles.length, locale)
                          : uploadLabel}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Privacy Consent */}
                    {privacyText && (
                      <div
                        className="flex items-start gap-4 cursor-pointer"
                        onClick={() => handlePrivacyToggle(!privacyAccepted)}
                      >
                        <div
                          className={`w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center transition-all ${privacyAccepted ? "bg-[#756F3F] border-[#756F3F]" : "border-[#756F3F]/30"}`}
                        >
                          {privacyAccepted && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <p 
                          className={cn(
                            "text-[#756F3F] leading-snug transition-opacity duration-300",
                            privacyAccepted ? "opacity-100" : "opacity-70"
                          )}
                          style={{ fontSize: isMobile ? "12px" : "14px" }}
                        >
                          {privacyText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Turnstile & Submit */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4 md:mt-4">
                    {turnstileSiteKey && (
                      <Turnstile
                        key={turnstileKey}
                        siteKey={turnstileSiteKey}
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileExpire}
                        theme="light"
                        language={locale === "zh" ? "zh-CN" : locale}
                      />
                    )}
                    {error && <p className="text-red-600 font-bold">{error}</p>}
                    <motion.button
                      type="submit"
                      style={{ transformOrigin: "center" }}
                      initial={{ rotate: 0, scale: 1 }}
                      animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                      whileHover={{
                        rotate: 0,
                        scale: 1.05,
                        transition: {
                          scale: { duration: 0.3, ease: "easeOut" },
                        },
                      }}
                      transition={{
                        rotate: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "linear",
                        },
                      }}
                      disabled={
                        submitting || (!!privacyText && !privacyAccepted)
                      }
                      className="w-full md:w-[400px] py-4 rounded-full bg-[#756F3F] text-white text-3xl font-extrabold flex items-center justify-center hover:bg-[#FBF6E4] hover:text-[#756F3F] border border-[#756F3F] transition-colors disabled:opacity-50"
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting
                        ? "..."
                        : configData?.submitButtonText || "Submit"}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Sidebar (Right 4 cols) */}
              <div className="lg:col-span-4 h-fit">
                {checkboxFields[0] && (
                  <div className="bg-[#FBF6E4] rounded-[30px] p-10 space-y-8 border border-white/34 shadow-sm">
                    <h3 className="text-2xl md:text-[28px] font-bold text-[#6F6200] leading-tight">
                      {checkboxFields[0].label}
                    </h3>
                    <div className="space-y-4">
                      {checkboxFields[0].options?.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-4 cursor-pointer group"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${(formData[checkboxFields[0].fieldName] || []).includes(opt.value) ? "border-[#6F6200]" : "border-[#9C9667]"}`}
                          >
                            {(
                              formData[checkboxFields[0].fieldName] || []
                            ).includes(opt.value) && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#6F6200]" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={(
                              formData[checkboxFields[0].fieldName] || []
                            ).includes(opt.value)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                checkboxFields[0].fieldName,
                                opt.value,
                                e.target.checked,
                              )
                            }
                          />
                          <span className="text-lg md:text-xl font-semibold text-[#6F6200] group-hover:opacity-70">
                            {opt.label}
                          </span>
                        </label>
                      ))}

                      {/* Others Input - Nested for consistent spacing */}
                      {(() => {
                        const othersField = sortedFields.find(
                          (f) => f.fieldName === "others-indicate",
                        );
                        const isOtherSelected = (
                          formData[checkboxFields[0].fieldName] || []
                        ).some(
                          (v: string) =>
                            v.toLowerCase() === "others" ||
                            v.toLowerCase().includes("other"),
                        );

                        if (isOtherSelected && othersField) {
                          return (
                            <textarea
                              value={formData["others-indicate"] || ""}
                              spellCheck="false"
                              onChange={(e) =>
                                handleChange("others-indicate", e.target.value)
                              }
                              className="w-full bg-[#F3EDD4] border border-[rgba(117,111,63,0.1)] rounded-[10px] px-6 py-3 text-base font-semibold text-[rgba(117,111,63,0.7)] outline-none placeholder-[rgba(117,111,63,0.4)] resize-none h-[53px] [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                              placeholder={
                                othersField.placeholder || othersField.label
                              }
                            />
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OemOdmContactForm;
