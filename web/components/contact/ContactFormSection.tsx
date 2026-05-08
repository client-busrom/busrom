"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { CUSTOM_ICONS } from "@/lib/icons";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { cn } from "@/lib/utils";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";
import { uploadFileWithProgress } from "@/lib/upload";

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920;
const SECTION_HEIGHT = 1000;
const DEFAULT_TEXTAREA_HEIGHT = 100; // 默认 textarea 高度

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
}

interface FormField {
  fieldName: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

interface FormConfigData {
  id: string;
  name: string;
  fields: Record<string, FormField[]>;
}

// 副标题文本片段，支持加粗标记
interface SubtitleSegment {
  text: string;
  bold?: boolean;
}

interface ContactFormSectionProps {
  // 主要内容区域
  verticalTitle?: string; // 竖排文字 "Get A Quote"
  title?: string; // 横排标题 "Warmly Welcome To Send Us Inquiry!"
  subtitle?: SubtitleSegment[]; // 副标题，支持加粗片段
  // 左下角轮播图
  images?: (MediaObject | null)[];
  // 表单配置（从侧边栏 formBlock 获取）
  formConfig?: {
    id?: string;
    data?: FormConfigData;
    privacyConsentText?: string;
    submitButtonText?: string;
    submittingText?: string;
  } | null;
  // 底部提示（无序列表）
  tips?: string[];
  // locale
  locale?: string;
  submitButtonText?: string;
}

const defaultSubtitle: SubtitleSegment[] = [
  { text: "Based On Your " },
  { text: "Specific Needs", bold: true },
  {
    text: ", We Will Provide A Customized Quote Or Solution And Send It Directly To Your Email.",
  },
];

export function ContactFormSection({
  verticalTitle = "Get A Quote",
  title = "Warmly Welcome To Send Us Inquiry!",
  subtitle = defaultSubtitle,
  images = [],
  formConfig,
  tips = [],
  locale = "en",
  submitButtonText,
}: ContactFormSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const STORAGE_KEY = "busrom_privacy_consent";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Helper to handle localized strings
  const getLocalizedString = (value: any, locale: string) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[locale] || value["en"] || Object.values(value)[0] || null;
    }
    return null;
  };

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

  // Sync with global storage when accepted in this form
  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHoveringControl, setIsHoveringControl] = useState(false);

  // Textarea 高度追踪
  const [extraHeight, setExtraHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || isMobile) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const currentHeight = entry.contentRect.height;
        const defaultHeightPx =
          (DEFAULT_TEXTAREA_HEIGHT / DESIGN_WIDTH) * window.innerWidth;
        const extra = Math.max(0, currentHeight - defaultHeightPx);
        setExtraHeight(extra);
      }
    });

    observer.observe(textarea);
    return () => observer.disconnect();
  }, [isMobile]);

  // Turnstile
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const mergedConfig = useMemo(() => {
    return typeof formConfig === "string"
      ? { id: formConfig }
      : formConfig || {};
  }, [formConfig]);

  const effectivePrivacyText = useMemo(() => {
    return getLocalizedString(mergedConfig?.privacyConsentText, locale || "en");
  }, [mergedConfig, locale]);

  const effectiveSubmitText = useMemo(() => {
    return (
      submitButtonText ||
      getLocalizedString(mergedConfig?.submitButtonText, locale || "en")
    );
  }, [mergedConfig, submitButtonText, locale]);

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

  const validImagesForEffect = images.filter(
    (img): img is MediaObject => img !== null && img !== undefined,
  );
  const [autoPlayKey, setAutoPlayKey] = useState(0);

  useEffect(() => {
    if (validImagesForEffect.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImagesForEffect.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImagesForEffect.length, autoPlayKey]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : validImagesForEffect.length - 1,
    );
    setAutoPlayKey((prev) => prev + 1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < validImagesForEffect.length - 1 ? prev + 1 : 0,
    );
    setAutoPlayKey((prev) => prev + 1);
  };

  // Helper to calculate position relative to design
  const px = (value: number) => isMobile ? `${(value / 390) * 100}%` : `${(value / 1920) * 100}%`;
  const vw = (value: number) => `${(value / 1920) * 100}vw`;
  // Use clamp to prevent items from becoming too large on iPad/Tablet
  const mvw = (value: number) => `clamp(${value * 0.8}px, ${(value / 390) * 100}vw, ${value * 1.15}px)`;
  // 渲染轮播图组件
  const renderImageCarousel = (mobile: boolean) => {
    if (validImagesForEffect.length === 0) return null;

    const containerStyle = mobile
      ? {
          width: "100%",
          height: mvw(220),
          borderRadius: mvw(110),
          backgroundColor: "#D9D9D9",
          marginTop: mvw(20),
          marginBottom: mvw(20),
          position: "relative" as const,
          overflow: "hidden" as const,
        }
      : {
          left: vw(4),
          top: vw(420),
          width: vw(780),
          height: vw(340),
          borderRadius: vw(260),
          backgroundColor: "#D9D9D9",
          position: "absolute" as const,
          overflow: "hidden" as const,
        };

    return (
      <div
        style={containerStyle}
        className={
          !mobile
            ? "absolute overflow-hidden"
            : "relative mx-auto overflow-hidden max-w-[640px]"
        }
      >
        {/* 轮播图 */}
        {validImages[currentImageIndex] && (
          <OptimizedImage
            image={validImages[currentImageIndex] as any}
            alt="Contact form image"
            size="xlarge"
            className="w-full h-full object-cover transition-opacity duration-500"
            objectPosition={
              validImages[currentImageIndex]?.cropFocalPoint
                ? `${validImages[currentImageIndex].cropFocalPoint!.x}% ${validImages[currentImageIndex].cropFocalPoint!.y}%`
                : "center"
            }
          />
        )}

        {/* 圆环装饰 - 在图片内部 */}
        <div
          className="absolute rounded-full border-2"
          style={
            mobile
              ? {
                  left: mvw(120),
                  top: mvw(160),
                  width: mvw(60),
                  height: mvw(60),
                  borderColor: "white",
                }
              : {
                  left: vw(420),
                  top: vw(290),
                  width: vw(140),
                  height: vw(140),
                  borderColor: "white",
                }
          }
        />

        {/* 移动端切换按钮 */}
        {mobile && validImages.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={handlePrevImage}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextImage}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };


  // 获取表单字段配置
  const configData = mergedConfig?.data;
  const fieldsData = (configData?.fields?.[locale] ||
    configData?.fields?.["en"] ||
    (Array.isArray(configData?.fields)
      ? configData.fields
      : [])) as FormField[];
  const sortedFields = [...fieldsData].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (submitStatus === "error") {
      setSubmitStatus("idle");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitStatus("error");
      setErrorMessage(
        locale === "zh"
          ? "请完成人机验证"
          : "Please complete the captcha verification",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      let fileUrl = "";
      const formId = mergedConfig?.id || configData?.id;
      if (uploadedFile && formId) {
        setUploadProgress(0);
        try {
          const uploadResult = await uploadFileWithProgress({
            url: "/api/form-file-upload",
            file: uploadedFile,
            fieldName: "file",
            additionalData: { formConfigId: formId, fieldName: "attachment" },
            onProgress: (event) => setUploadProgress(event.percent),
          });
          fileUrl = uploadResult.fileUrl;
        } catch (uploadErr) {
          throw new Error("Failed to upload file. Please try again.");
        } finally {
          setUploadProgress(0);
        }
      }

      const submissionData = {
        formId: formId,
        formName: configData?.name || "contact-form",
        data: { ...formData, ...(fileUrl ? { attachment: fileUrl } : {}) },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
        userLocalTime:
          typeof window !== "undefined" ? new Date().toString() : "",
        turnstileToken,
      };

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      setSubmitStatus("success");
      // Push success event to Google Tag Manager
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "form_submit_success",
          form_id: configData?.name || "contact-form",
          form_name: configData?.name || "contact-form",
        });
      }
      setFormData({});
      setFileName("");
      setUploadedFile(null);
      setTurnstileToken(null);
      setTurnstileKey((prev) => prev + 1);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit form. Please try again.",
      );
      setTurnstileToken(null);
      setTurnstileKey((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubtitle = () => {
    return subtitle.map((segment, index) => {
      if (segment.bold) {
        return (
          <span key={index} className="relative inline-block">
            <span style={{ color: "#FFA600" }}>{segment.text}</span>
            <span
              className="absolute inset-0"
              style={{
                color: "transparent",
                WebkitTextStroke: isMobile ? "0.5px #825500" : "1px #825500",
              }}
            >
              {segment.text}
            </span>
          </span>
        );
      }
      return <span key={index}>{segment.text}</span>;
    });
  };

  const validImages = images.filter(
    (img): img is MediaObject => img !== null && img !== undefined,
  );
  const sectionHeight = isMobile
    ? "auto"
    : `calc(${vw(SECTION_HEIGHT)} + ${extraHeight}px)`;

  return (
    <section
      id="contact-form"
      className={cn(
        "relative w-full",
        isMobile ? "flex flex-col py-16 px-5" : "",
      )}
      style={{
        height: sectionHeight,
        background: "linear-gradient(180deg, #FFF9E8 0%, #F9E8A7 100%)",
      }}
    >
      {/* 左侧深色渐变条 (PC Only) */}
      {!isMobile && (
        <div
          className="absolute"
          style={{
            left: vw(1),
            top: 0,
            width: vw(322),
            height: "100%",
            background: "linear-gradient(180deg, #FAF3BB 0%, #B8AF6C 100%)",
          }}
        />
      )}

      {/* 标题区域 */}
      <div
        className={cn(
          isMobile ? "relative mb-8 mx-auto text-center" : "absolute",
        )}
        style={
          !isMobile
            ? {
                left: vw(373),
                top: vw(70),
                width: vw(520),
              }
            : { maxWidth: "640px" }
        }
      >
        <div className="relative">
          {/* 标题阴影层 */}
          <h2
            className={cn("font-moul", !isMobile ? "absolute" : "hidden")}
            style={{
              top: vw(4),
              fontSize: isMobile ? mvw(32) : vw(40),
              lineHeight: isMobile ? 1.2 : vw(52),
              color: "#4B3A02",
            }}
          >
            {title}
          </h2>
          {/* 标题主层 */}
          <h2
            className="relative font-moul"
            style={{
              fontSize: isMobile ? mvw(32) : vw(40),
              lineHeight: isMobile ? 1.2 : vw(52),
              color: "#B08B07",
            }}
          >
            {title}
          </h2>
        </div>

        {/* 移动端轮播图 */}
        {isMobile && renderImageCarousel(true)}

        {/* 副标题 (Mobile version) */}
        {isMobile && (
          <p
            className="font-moul mt-4 text-[#4B3A02]"
            style={{
              fontSize: mvw(18),
              lineHeight: 1.4,
            }}
          >
            {renderSubtitle()}
          </p>
        )}
      </div>

      {/* 副标题 (PC Only) */}
      {!isMobile && (
        <p
          className="absolute font-moul"
          style={{
            left: vw(372),
            top: vw(210),
            width: vw(520),
            fontSize: vw(26),
            lineHeight: vw(40),
            color: "#4B3A02",
          }}
        >
          {renderSubtitle()}
        </p>
      )}

      {/* 右侧表单区域 */}
      <div
        className={cn(
          isMobile
            ? "relative w-full max-w-[640px] mx-auto mt-8 order-last"
            : "absolute",
        )}
        style={
          !isMobile
            ? {
                left: vw(1188),
                top: vw(60),
                width: vw(486),
              }
            : {}
        }
      >
        <form
          id={configData?.name || "contact-form"}
          onSubmit={handleSubmit}
          className="flex flex-col w-full"
          style={{
            gap: isMobile ? mvw(12) : vw(12),
          }}
        >
          {/* 动态渲染表单字段 */}
          {sortedFields.length > 0 ? (
            <>
              {sortedFields.slice(0, 4).map((field) => {
                const isTextarea =
                  field.fieldType === "textarea" ||
                  field.fieldName === "message";
                if (isTextarea) return null;

                const fieldTypeLower = field.fieldType?.toLowerCase();
                const fieldNameLower = field.fieldName?.toLowerCase();
                const isPhoneField =
                  fieldTypeLower === "phone" ||
                  fieldTypeLower === "tel" ||
                  fieldNameLower?.includes("phone") ||
                  fieldNameLower?.includes("whatsapp");
                const isCountryField =
                  fieldTypeLower === "country" ||
                  fieldNameLower?.includes("country") ||
                  fieldNameLower?.includes("region");
                if (isPhoneField) {
                  return (
                    <div key={field.fieldName} style={{ width: "100%" }}>
                      <PhoneInput
                        value={formData[field.fieldName] || ""}
                        onChange={(phone) =>
                          handleInputChange(field.fieldName, phone)
                        }
                        placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                        required={field.required}
                        disabled={isSubmitting}
                        className="!bg-[#B4A25F] !border-white/34"
                        style={{
                          height: isMobile ? mvw(50) : vw(50),
                          width: "100%",
                          borderRadius: isMobile ? mvw(12) : vw(12),
                        }}
                        buttonClassName="!bg-transparent !border-none hover:!bg-white/5"
                        inputClassName={cn(
                          "!bg-transparent !text-white !placeholder-white/95 !font-anaheim !font-semibold !h-full [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
                          isMobile ? "!pl-2" : "!pl-6",
                        )}
                        inputStyle={{
                          fontSize: isMobile ? mvw(16) : vw(16),
                        }}
                        dialCodeClassName="!text-white"
                        dialCodeStyle={{
                          fontSize: isMobile ? mvw(16) : vw(16),
                        }}
                      />
                    </div>
                  );
                }

                if (isCountryField) {
                  return (
                    <div key={field.fieldName} className="relative">
                      <select
                        id={field.fieldName}
                        name={field.fieldName}
                        value={formData[field.fieldName] || ""}
                        onChange={(e) =>
                          handleInputChange(field.fieldName, e.target.value)
                        }
                        required={field.required}
                        className="font-anaheim font-semibold appearance-none bg-[#B4A25F] border border-white/34 text-white w-full placeholder:text-white/95 focus:outline-none focus:border-white/60 transition-colors contact-form-input"
                        style={{
                          height: isMobile ? mvw(50) : vw(50),
                          borderRadius: isMobile ? mvw(12) : vw(12),
                          paddingLeft: isMobile ? mvw(24) : vw(24),
                          paddingRight: isMobile ? mvw(40) : vw(40),
                          fontSize: isMobile ? mvw(18) : vw(16),
                        }}
                      >
                        <option value="" className="text-black">
                          Select Country/Region...
                        </option>
                        {COUNTRIES.map(([name, iso2, dialCode]) => {
                          return (
                            <option
                              key={iso2}
                              value={name}
                              className="text-black"
                            >
                              {name} (+{dialCode})
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/70">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  );
                }

                return (
                  <input
                    key={field.fieldName}
                    type={field.fieldType === "email" ? "email" : "text"}
                    placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) =>
                      handleInputChange(field.fieldName, e.target.value)
                    }
                    spellCheck="false"
                    className="font-anaheim font-semibold placeholder:text-white/95 [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                    style={{
                      width: isMobile ? "100%" : vw(486),
                      height: isMobile ? mvw(50) : vw(50),
                      borderRadius: isMobile ? mvw(12) : vw(12),
                      backgroundColor: "#B4A25F",
                      border: "1px solid rgba(255, 255, 255, 0.34)",
                      paddingLeft: isMobile ? mvw(24) : vw(24),
                      fontSize: isMobile ? mvw(18) : vw(16),
                      lineHeight: isMobile ? mvw(36) : vw(36),
                      color: "white",
                    }}
                    required={field.required}
                    disabled={isSubmitting}
                  />
                );
              })}
              {/* Textarea */}
              {sortedFields
                .filter(
                  (f) =>
                    f.fieldType === "textarea" || f.fieldName === "message",
                )
                .map((field) => (
                  <textarea
                    key={field.fieldName}
                    ref={textareaRef}
                    placeholder={field.placeholder?.trim() || field.label}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) =>
                      handleInputChange(field.fieldName, e.target.value)
                    }
                    spellCheck="false"
                    className="font-anaheim font-semibold placeholder:text-white/95 resize-y [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                    style={{
                      width: isMobile ? "100%" : vw(486),
                      minHeight: isMobile ? mvw(100) : vw(100),
                      maxHeight: isMobile ? mvw(250) : vw(250),
                      borderRadius: isMobile ? mvw(12) : vw(12),
                      backgroundColor: "#B4A25F",
                      border: "1px solid rgba(255, 255, 255, 0.34)",
                      paddingLeft: isMobile ? mvw(24) : vw(24),
                      paddingRight: isMobile ? mvw(24) : vw(24),
                      paddingTop: isMobile ? mvw(14) : vw(14),
                      fontSize: isMobile ? mvw(18) : vw(16),
                      lineHeight: isMobile ? mvw(22) : vw(22),
                      color: "white",
                    }}
                    required={field.required}
                    disabled={isSubmitting}
                  />
                ))}
            </>
          ) : (
            // 默认表单字段
            <>
              <input
                type="text"
                placeholder="Your Name / Company Name *"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                spellCheck="false"
                className="font-anaheim font-semibold placeholder:text-white/95 contact-form-input"
                style={{
                  width: isMobile ? "100%" : vw(486),
                  height: isMobile ? mvw(50) : vw(50),
                  borderRadius: isMobile ? mvw(12) : vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: isMobile ? mvw(24) : vw(24),
                  fontSize: isMobile ? mvw(18) : vw(16),
                  lineHeight: isMobile ? mvw(36) : vw(36),
                  color: "white",
                }}
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                spellCheck="false"
                className="font-anaheim font-semibold placeholder:text-white/95 contact-form-input"
                style={{
                  width: isMobile ? "100%" : vw(486),
                  height: isMobile ? mvw(50) : vw(50),
                  borderRadius: isMobile ? mvw(12) : vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: isMobile ? mvw(24) : vw(24),
                  fontSize: isMobile ? mvw(18) : vw(16),
                  lineHeight: isMobile ? mvw(36) : vw(36),
                  color: "white",
                }}
                required
                disabled={isSubmitting}
              />
              <div style={{ width: "100%" }}>
                <PhoneInput
                  value={formData.whatsapp || ""}
                  onChange={(phone) => handleInputChange("whatsapp", phone)}
                  placeholder="Your WhatsApp / WeChat"
                  disabled={isSubmitting}
                  className="!bg-[#B4A25F] !border-white/34"
                  style={{
                    height: isMobile ? mvw(50) : vw(50),
                    width: "100%",
                    borderRadius: isMobile ? mvw(12) : vw(12),
                  }}
                  buttonClassName="!bg-transparent !border-none hover:!bg-white/5"
                  inputClassName={cn(
                    "!bg-transparent !text-white !placeholder-white/95 !font-anaheim !font-semibold !text-base contact-form-input",
                    isMobile ? "!pl-6" : "!pl-6",
                  )}
                  inputStyle={{
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                  dialCodeClassName="!text-white !font-anaheim !text-base"
                  dialCodeStyle={{
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                />
              </div>
              <div className="relative">
                <select
                  id="country"
                  name="country"
                  value={formData.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="font-anaheim font-semibold appearance-none bg-[#B4A25F] border border-white/34 text-white w-full placeholder:text-white/95 focus:outline-none focus:border-white/60 transition-colors contact-form-input"
                  style={{
                    height: isMobile ? mvw(50) : vw(50),
                    borderRadius: isMobile ? mvw(12) : vw(12),
                    paddingLeft: isMobile ? mvw(24) : vw(24),
                    paddingRight: isMobile ? mvw(40) : vw(40),
                    fontSize: isMobile ? mvw(18) : vw(16),
                  }}
                >
                  <option value="" className="text-black">
                    Select Country/Region...
                  </option>
                  {COUNTRIES.map(([name, iso2, dialCode]) => {
                    return (
                      <option key={iso2} value={name} className="text-black">
                        {name} (+{dialCode})
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/70">
                  <ChevronDown size={18} />
                </div>
              </div>
              <textarea
                ref={textareaRef}
                placeholder="Please Briefly Describe Your Project Requirements Or Customization Ideas."
                value={formData.message || ""}
                spellCheck="false"
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="font-anaheim font-semibold placeholder:text-white/95 resize-y contact-form-input"
                style={{
                  width: isMobile ? "100%" : vw(486),
                  minHeight: isMobile ? mvw(100) : vw(100),
                  maxHeight: isMobile ? mvw(250) : vw(250),
                  borderRadius: isMobile ? mvw(12) : vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: isMobile ? mvw(24) : vw(24),
                  paddingRight: isMobile ? mvw(24) : vw(24),
                  paddingTop: isMobile ? mvw(14) : vw(14),
                  fontSize: isMobile ? mvw(18) : vw(16),
                  lineHeight: isMobile ? mvw(22) : vw(22),
                  color: "white",
                }}
                disabled={isSubmitting}
              />
            </>
          )}

          {/* Upload File 按钮 - 在 textarea 下方右侧 */}
          <div className="flex justify-end" style={{ marginTop: vw(8) }}>
            <label
              className="flex items-center justify-center gap-2 cursor-pointer group transition-colors duration-300 hover:bg-[#6B5500]"
              style={{
                width: isMobile ? mvw(180) : vw(248),
                height: isMobile ? mvw(45) : vw(59),
                borderRadius: isMobile ? mvw(22.5) : vw(33.5),
                border: "1px solid #6B5500",
                backgroundColor: "transparent",
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <svg
                viewBox={CUSTOM_ICONS.upload.viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-colors duration-300 group-hover:text-white"
                style={{
                  width: isMobile ? mvw(18) : vw(25),
                  height: isMobile ? mvw(18) : vw(25),
                  color: "#6B5500",
                }}
              >
                <path
                  d={CUSTOM_ICONS.upload.path}
                  fill="currentColor"
                />
              </svg>
              <span
                className="font-anaheim font-semibold truncate transition-colors duration-300 group-hover:text-white"
                style={{
                  fontSize: isMobile ? mvw(16) : vw(24),
                  lineHeight: isMobile ? mvw(22) : vw(40),
                  color: "#6B5500",
                  maxWidth: isMobile ? mvw(120) : vw(150),
                }}
              >
                {fileName || "Upload File"}
              </span>
            </label>
          </div>

          {/* Turnstile 验证 */}
          {turnstileSiteKey && (
            <div style={{ marginTop: isMobile ? mvw(10) : vw(10) }}>
              <Turnstile
                key={turnstileKey}
                siteKey={turnstileSiteKey}
                onVerify={handleTurnstileSuccess}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme="light"
                size="compact"
                language={locale === "zh" ? "zh-CN" : locale}
              />
            </div>
          )}

          {/* Privacy Consent Checkbox - Only show if not already globally accepted */}
          {effectivePrivacyText && (
            <div
              className="flex items-start gap-2 my-2 group cursor-pointer"
              onClick={() => handlePrivacyToggle(!privacyAccepted)}
            >
              <div
                className={cn(
                  "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                  privacyAccepted
                    ? "bg-[#7B6100] border-[#7B6100]"
                    : "border-white/30 bg-transparent",
                )}
              >
                {privacyAccepted && (
                  <svg
                    className="w-3 h-3 text-white"
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
              <p className="text-[12px] md:text-[14px] leading-relaxed text-[#4B3A02]/80 text-left whitespace-pre-line select-none">
                {effectivePrivacyText}
              </p>
            </div>
          )}

          {/* Submit 按钮 */}
          <motion.button
            style={{
              transformOrigin: "center",
              width: isMobile ? "100%" : vw(486),
              minHeight: isMobile ? mvw(60) : vw(83),
              borderRadius: isMobile ? mvw(30) : vw(63),
              backgroundColor:
                submitStatus === "success" ? "#4CAF50" : "#7B6100",
              fontSize: isMobile ? mvw(24) : vw(32),
              marginTop: isMobile ? mvw(10) : vw(10),
            }}
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
            whileHover={{
              rotate: 0,
              scale: 1.05,
              transition: { scale: { duration: 0.3, ease: "easeOut" } },
            }}
            transition={{
              rotate: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "linear",
              },
            }}
            type="submit"
            disabled={
              isSubmitting || (!!effectivePrivacyText && !privacyAccepted)
            }
            className={cn(
              "font-anaheim font-semibold text-white transition-colors duration-300 disabled:opacity-50 hover:bg-[#5A4800] hover:shadow-lg",
              "h-auto whitespace-pre-line leading-tight px-6 py-4",
              !!formConfig?.privacyConsentText &&
                !privacyAccepted &&
                "grayscale opacity-80",
            )}
          >
            {isSubmitting
              ? uploadProgress > 0 && uploadProgress < 100
                ? `Uploading ${uploadProgress}%...`
                : mergedConfig?.submittingText || "Submitting..."
              : submitStatus === "success"
                ? locale === "zh"
                  ? "已提交!"
                  : "Submitted!"
                : effectiveSubmitText || "Submit Your Project"}
          </motion.button>

          {/* 错误提示 */}
          {submitStatus === "error" && (
            <div
              className="font-anaheim text-red-600"
              style={{
                width: isMobile ? "100%" : vw(486),
                fontSize: isMobile ? mvw(14) : vw(16),
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* 底部提示信息 */}
          {tips.length > 0 && (
            <div
              className="flex flex-col"
              style={{
                marginLeft: isMobile ? mvw(24) : vw(24),
                width: isMobile ? "100%" : vw(430),
                gap: isMobile ? mvw(10) : vw(10),
              }}
            >
              {tips.map((tip, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="rounded-full bg-black shrink-0"
                    style={{
                      width: isMobile ? mvw(6) : vw(6),
                      height: isMobile ? mvw(6) : vw(6),
                      marginRight: isMobile ? mvw(12) : vw(12),
                    }}
                  />
                  <span
                    className="font-anaheim font-medium text-black"
                    style={{
                      fontSize: isMobile ? mvw(16) : vw(16),
                      lineHeight: isMobile ? mvw(22) : vw(22),
                    }}
                  >
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* 左下角图片区域 (PC Only) */}
      {!isMobile && renderImageCarousel(false)}

      {/* 竖排文字 (PC Only) */}
      {!isMobile && (
        <>
          {/* 底层 - 深色文字（完整显示） */}
          <span
            className="absolute font-moul whitespace-nowrap"
            style={{
              left: vw(180),
              top: vw(580),
              width: vw(80),
              height: vw(600),
              fontSize: vw(80),
              lineHeight: vw(75),
              transform: "rotate(-90deg)",
              transformOrigin: "top left",
              color: "#302C06",
            }}
          >
            {verticalTitle}
          </span>
          {/* 上层 - 白色文字（只在图片区域显示） */}
          <div
            className="absolute overflow-hidden pointer-events-none"
            style={{
              left: vw(4),
              top: vw(420),
              width: vw(780),
              height: vw(340),
              borderRadius: vw(260),
            }}
          >
            <span
              className="absolute font-moul whitespace-nowrap"
              style={{
                left: vw(176),
                top: vw(160),
                width: vw(80),
                height: vw(600),
                fontSize: vw(80),
                lineHeight: vw(75),
                transform: "rotate(-90deg)",
                transformOrigin: "top left",
                color: "white",
              }}
            >
              {verticalTitle}
            </span>
          </div>
        </>
      )}

      {/* 轮播控制区域 (PC Only) */}
      {!isMobile && validImages.length > 1 && (
        <>
          {/* 圆环控制器 - 悬停显示箭头 */}
          <div
            className="absolute rounded-full border group cursor-pointer"
            style={{
              left: vw(424),
              top: vw(710),
              width: vw(140),
              height: vw(140),
              borderColor: "#464010",
            }}
            onMouseEnter={() => setIsHoveringControl(true)}
            onMouseLeave={() => setIsHoveringControl(false)}
          >
            {/* 默认状态 - 中间小圆点 */}
            <div
              className={`absolute rounded-full bg-[#464010] transition-opacity duration-300 ${isHoveringControl ? "opacity-0" : "opacity-100"}`}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: vw(24),
                height: vw(24),
              }}
            />
            {/* 悬停状态 - 左右箭头 */}
            <div
              className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${isHoveringControl ? "opacity-100" : "opacity-0"}`}
            >
              {/* 左箭头 */}
              <button
                onClick={handlePrevImage}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#464010]/10 transition-colors"
              >
                <ChevronLeft
                  className="w-6 h-6"
                  style={{ color: "#464010" }}
                  strokeWidth={2}
                />
              </button>
              {/* 右箭头 */}
              <button
                onClick={handleNextImage}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#464010]/10 transition-colors"
              >
                <ChevronRight
                  className="w-6 h-6"
                  style={{ color: "#464010" }}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* 进度条背景 */}
          <div
            className="absolute"
            style={{
              left: vw(140),
              top: vw(800),
              width: vw(240),
              height: vw(3),
              backgroundColor: "#464010",
              opacity: 0.3,
              borderRadius: vw(2),
            }}
          />
          {/* 进度条前景 */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: vw(140),
              top: vw(800),
              width: `calc(${vw(240)} * ${(currentImageIndex + 1) / validImages.length})`,
              height: vw(3),
              backgroundColor: "#464010",
              borderRadius: vw(2),
            }}
          />
          {/* 进度条末端装饰 */}
          <div
            className="absolute"
            style={{
              left: vw(368),
              top: vw(798),
              width: vw(14),
              height: vw(6),
              backgroundColor: "#464010",
              borderRadius: vw(2),
            }}
          />
        </>
      )}

      {/* 无轮播时的装饰元素 (PC Only) */}
      {!isMobile && validImages.length <= 1 && (
        <>
          <div
            className="absolute rounded-full border"
            style={{
              left: vw(424),
              top: vw(710),
              width: vw(140),
              height: vw(140),
              borderColor: "#464010",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: vw(482),
              top: vw(768),
              width: vw(20),
              height: vw(20),
              backgroundColor: "#464010",
            }}
          />
          <div
            className="absolute"
            style={{
              left: vw(140),
              top: vw(800),
              width: vw(240),
              height: vw(1),
              backgroundColor: "#464010",
            }}
          />
          <div
            className="absolute"
            style={{
              left: vw(368),
              top: vw(798),
              width: vw(14),
              height: vw(5),
              backgroundColor: "#464010",
            }}
          />
        </>
      )}
      <style jsx global>{`
        /* Ensure autofill styles match the design */
        input.contact-form-input:-webkit-autofill,
        input.contact-form-input:-webkit-autofill:hover,
        input.contact-form-input:-webkit-autofill:focus,
        input.contact-form-input:-webkit-autofill:active,
        textarea.contact-form-input:-webkit-autofill,
        textarea.contact-form-input:-webkit-autofill:hover,
        textarea.contact-form-input:-webkit-autofill:focus,
        textarea.contact-form-input:-webkit-autofill:active,
        select.contact-form-input:-webkit-autofill,
        select.contact-form-input:-webkit-autofill:hover,
        select.contact-form-input:-webkit-autofill:focus,
        select.contact-form-input:-webkit-autofill:active {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #B4A25F inset !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        .contact-form-input::placeholder {
          color: rgba(255, 255, 255, 0.95) !important;
        }
      `}</style>
    </section>
  );
}
