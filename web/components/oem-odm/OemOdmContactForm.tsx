"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { uploadFileWithProgress } from "@/lib/upload";
import type { Locale } from "@/i18n.config";
import { PhoneInput } from "@/components/ui/PhoneInput";

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
    getLocalizedString(
      configData?.submitButtonText || configData?.data?.submitButtonText,
    ) || "";

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
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
      f.fieldName !== "othersIndicate",
  );
  const selectFields = sortedFields.filter((f) => f.fieldType === "select");
  const textareaFields = sortedFields.filter((f) => f.fieldType === "textarea");
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
    <section className="w-full overflow-hidden py-10 md:py-20 font-anaheim">
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
                  <h1 className="text-xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-line">
                    {title}
                  </h1>
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
                          backgroundColor: "#F3EDD4",
                          border: "1px solid rgba(117, 111, 63, 0.1)",
                        }}
                        className="rounded-[10px] h-[50px] flex items-center"
                      >
                        {isPhone ? (
                          <PhoneInput
                            id={field.fieldName}
                            value={formData[field.fieldName] || ""}
                            onChange={(phone) =>
                              handleChange(field.fieldName, phone)
                            }
                            placeholder={
                              field.placeholder?.trim() || field.label
                            }
                            disabled={submitting}
                            className="!bg-transparent !border-none !h-full !rounded-[10px]"
                            buttonClassName="!bg-transparent !border-r-0 hover:!bg-black/5 !rounded-none !px-3 !h-full [&_img]:!w-6 [&_img]:!h-auto [&_svg]:!w-6 [&_svg]:!h-auto [&_svg]:!text-[#756F3F] [&_.PhoneInputCountrySelectArrow]:!border-t-[#756F3F] [&_.PhoneInputCountrySelectArrow]:!opacity-70"
                            style={{ color: "rgba(117, 111, 63, 0.7)" }}
                            inputClassName="!bg-transparent !placeholder-[rgba(117,111,63,0.4)] !font-anaheim !font-semibold !text-[16px] !h-full !pl-0 [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                            dialCodeClassName="!text-[rgba(117,111,63,0.7)] !text-[16px]"
                            containerClassName="!h-full w-full"
                          />
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
                            className="w-full h-full px-6 bg-transparent outline-none font-semibold text-base placeholder-[rgba(117,111,63,0.4)] [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
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
                        className="w-full h-full px-6 bg-transparent outline-none font-semibold text-base appearance-none cursor-pointer"
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
                      className="w-full h-full bg-transparent outline-none font-semibold text-base placeholder-[rgba(117, 111, 63, 0.4)] resize-none [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117, 111, 63, 0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117, 111, 63, 0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117, 111, 63, 0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117, 111, 63, 0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
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
                        viewBox="0 0 25 25"
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <path
                          d="M6.90476 0C7.03571 0 7.14286 0.107143 7.14286 0.238095V1.54762C7.14286 1.61077 7.11777 1.67133 7.07312 1.71598C7.02847 1.76063 6.96791 1.78571 6.90476 1.78571H4.7619C3.99496 1.78576 3.25764 2.08187 2.7037 2.6123C2.14977 3.14272 1.82198 3.86652 1.78869 4.63274L1.78571 4.7619V20.2381C1.78576 21.005 2.08187 21.7424 2.6123 22.2963C3.14272 22.8502 3.86652 23.178 4.63274 23.2113L4.7619 23.2143H20.2381C21.005 23.2142 21.7424 22.9181 22.2963 22.3877C22.8502 21.8573 23.178 21.1335 23.2113 20.3673L23.2143 20.2381V4.7619C23.2142 3.99496 22.9181 3.25764 22.3877 2.7037C21.8573 2.14977 21.1335 1.82198 20.3673 1.78869L20.2381 1.78571H18.6905C18.6592 1.78571 18.6282 1.77956 18.5994 1.76759C18.5705 1.75563 18.5442 1.73809 18.5221 1.71598C18.5 1.69387 18.4825 1.66762 18.4705 1.63873C18.4585 1.60985 18.4524 1.57889 18.4524 1.54762V0.238095C18.4524 0.107143 18.5595 0 18.6905 0H20.2381C21.501 0 22.7122 0.501699 23.6053 1.39473C24.4983 2.28776 25 3.49897 25 4.7619V20.2381C25 21.501 24.4983 22.7122 23.6053 23.6053C22.7122 24.4983 21.501 25 20.2381 25H4.7619C3.49897 25 2.28776 24.4983 1.39473 23.6053C0.501699 22.7122 0 21.501 0 20.2381V4.7619C0 3.49897 0.501699 2.28776 1.39473 1.39473C2.28776 0.501699 3.49897 0 4.7619 0H6.90476ZM12.8238 0L12.894 0.00833337C13.0095 0.0291667 13.1202 0.0839286 13.2095 0.173214L18.3821 5.34583C18.4044 5.36798 18.4221 5.39432 18.4342 5.42334C18.4462 5.45235 18.4524 5.48346 18.4524 5.51488V7.36667C18.4524 7.41378 18.4385 7.45985 18.4123 7.49904C18.3862 7.53823 18.349 7.56878 18.3054 7.58681C18.2619 7.60485 18.214 7.60957 18.1678 7.60036C18.1216 7.59116 18.0791 7.56845 18.0458 7.53512L13.6905 3.17976V15.875C13.6905 15.9063 13.6843 15.9372 13.6724 15.9661C13.6604 15.995 13.6428 16.0212 13.6207 16.0434C13.5986 16.0655 13.5724 16.083 13.5435 16.095C13.5146 16.1069 13.4836 16.1131 13.4524 16.1131H12.1429C12.0797 16.1131 12.0191 16.088 11.9745 16.0434C11.9298 15.9987 11.9048 15.9381 11.9048 15.875V3.1619L7.54941 7.51726C7.51611 7.5506 7.47366 7.5733 7.42745 7.58251C7.38124 7.59171 7.33334 7.58699 7.28981 7.56896C7.24628 7.55092 7.20908 7.52037 7.18292 7.48119C7.15676 7.442 7.14282 7.39593 7.14286 7.34881V5.49762C7.14283 5.46634 7.14897 5.43537 7.16092 5.40646C7.17287 5.37756 7.1904 5.35129 7.2125 5.32917L12.3679 0.173214C12.4708 0.0700321 12.6081 0.00836919 12.7536 0H12.8238Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>
                        {uploadedFiles.length > 0
                          ? `${uploadedFiles.length} file(s) selected`
                          : "Upload File"}
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
                        <p className="text-sm md:text-base text-[#756F3F] leading-snug">
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
                      {(formData[checkboxFields[0].fieldName] || []).some(
                        (v: string) => v.toLowerCase().includes("other"),
                      ) && (
                        <input
                          type="text"
                          value={formData["othersIndicate"] || ""}
                          spellCheck="false"
                          onChange={(e) =>
                            handleChange("othersIndicate", e.target.value)
                          }
                          className="w-full bg-[#F3EDD4] border border-[rgba(117,111,63,0.1)] rounded-[10px] px-6 h-[50px] text-base font-semibold text-[rgba(117,111,63,0.7)] outline-none placeholder-[rgba(117,111,63,0.4)] [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:rgba(117,111,63,0.7)!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                          placeholder={
                            (sortedFields.find(f => f.fieldName === "othersIndicate")?.placeholder) || 
                            checkboxFields[0].placeholder || 
                            "Please indicate here"
                          }
                        />
                      )}
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
