"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { CUSTOM_ICONS } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { cn } from "@/lib/utils";
import { trackUetConversion } from "@/lib/analytics/uet";
import { COUNTRIES } from "@/components/ui/PhoneInput";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Info } from "lucide-react";
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
  title = "",
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
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c[1] === "US") || COUNTRIES[0],
  );
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  const verticalTitleScrollRef1 = useRef<HTMLDivElement>(null);
  const verticalTitleScrollRef2 = useRef<HTMLDivElement>(null);

  const handleVerticalTitleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (verticalTitleScrollRef2.current) {
      verticalTitleScrollRef2.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1025);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        countrySelectorRef.current &&
        !countrySelectorRef.current.contains(event.target as Node)
      ) {
        setOpenCountrySelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const titleEl = verticalTitleScrollRef1.current;
    const handleTitleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        titleEl!.scrollLeft -= e.deltaY;
      }
    };
    if (titleEl) {
      titleEl.addEventListener("wheel", handleTitleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
      if (titleEl) {
        titleEl.removeEventListener("wheel", handleTitleWheel);
      }
    };
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
  const [direction, setDirection] = useState(0);
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
    const raw = mergedConfig?.privacyConsentText || mergedConfig?.data?.privacyConsentText;
    return getLocalizedString(raw, locale || "en");
  }, [mergedConfig, locale]);

  const effectiveSubmitText = useMemo(() => {
    return (
      submitButtonText ||
      getLocalizedString(mergedConfig?.submitButtonText || mergedConfig?.data?.submitButtonText, locale || "en")
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
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % validImagesForEffect.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImagesForEffect.length, autoPlayKey]);

  const handlePrevImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : validImagesForEffect.length - 1,
    );
    setAutoPlayKey((prev) => prev + 1);
  };

  const handleNextImage = () => {
    setDirection(1);
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
        borderRadius: mvw(40),
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
        {/* 隐藏的预加载层 - 确保所有图片都被浏览器提前缓存 */}
        <div className="hidden" aria-hidden="true">
          {validImages.map((img, idx) => (
            <OptimizedImage key={`preload-${idx}`} image={img as any} size="medium" priority={true} />
          ))}
        </div>

        {/* 幻灯片横切动画容器 */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={currentImageIndex}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? "100%" : "-100%",
                  opacity: 0
                }),
                center: {
                  x: 0,
                  opacity: 1
                },
                exit: (direction: number) => ({
                  x: direction < 0 ? "100%" : "-100%",
                  opacity: 0
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              <OptimizedImage
                image={validImagesForEffect[currentImageIndex] as any}
                alt="Contact form image"
                size="medium"
                priority={true}
                className="w-full h-full object-cover"
                objectPosition={
                  validImages[currentImageIndex]?.cropFocalPoint
                    ? `${validImages[currentImageIndex].cropFocalPoint.x}% ${validImages[currentImageIndex].cropFocalPoint.y}%`
                    : "center"
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>

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
  };

  const handlePhoneChange = (fieldName: string, value: string) => {
    const digits = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: digits ? `+${selectedCountry[2]}${digits}` : "",
    }));
  };

  const handleStatusReset = () => {
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
      trackUetConversion("Submit", "Request_Quote", 5, "Lead");
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
          <span
            key={index}
            className="relative inline-block font-bold text-[#FFA600]"
            style={{
              textShadow: `
                ${vw(1)} ${vw(1)} 0 #FFEB6B,
                ${vw(2)} ${vw(2)} 0 #FFEB6B,
                ${vw(3)} ${vw(3)} ${vw(4)} rgba(0,0,0,0.3)
              `,
              WebkitTextStroke: isMobile ? "0.5px #FFEB6B" : "1px #FFEB6B",
              paintOrder: "stroke fill"
            }}
          >
            {segment.text}
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
        minHeight: sectionHeight,
        height: "auto",
        background: "linear-gradient(180deg, #FFF9E8 0%, #F9E8A7 100%)",
      }}
    >
      <style jsx>{`
        .contact-input-el {
          color: #FFFFFF !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #FFFFFF !important;
          caret-color: white !important;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
        }
        .contact-input-el::placeholder {
          color: rgba(255, 255, 255, 0.95) !important;
          opacity: 1 !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.95) !important;
        }
        .contact-input-el:-webkit-autofill,
        .contact-input-el:-webkit-autofill:hover,
        .contact-input-el:-webkit-autofill:focus,
        .contact-input-el:-webkit-autofill:active {
          -webkit-text-fill-color: #FFFFFF !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: white !important;
        }
        .contact-input-el:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .contact-input-el option {
          color: #302C06 !important;
          background-color: #FFFFFF !important;
        }
        .hover-show-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .hover-show-scrollbar:hover {
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }
        .hover-show-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
          transition: background 0.3s;
        }
        .hover-show-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }

        .contact-submit-btn:hover:not(:disabled) {
          background-color: #FFF8DC !important;
          color: #7B6100 !important;
          transform: scale(1.05);
        }
        .contact-upload-btn:hover {
          background-color: #6B5500 !important;
          color: white !important;
          border-color: #6B5500 !important;
        }
        .contact-upload-btn:hover :global(.upload-icon),
        .contact-upload-btn:hover .upload-text {
          color: white !important;
        }
      `}</style>

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
              width: vw(720),
            }
            : { maxWidth: "640px" }
        }
      >
        <div
          className={cn("relative", !isMobile && "hover-show-scrollbar")}
          data-lenis-prevent={!isMobile ? "true" : undefined}
          style={!isMobile ? {
            maxHeight: vw(104), // 2 lines
            overflowY: "auto",
            overscrollBehavior: "contain",
            paddingRight: vw(10),
          } : {}}
        >
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
          className="absolute font-moul hover-show-scrollbar"
          data-lenis-prevent="true"
          style={{
            left: vw(372),
            top: vw(210),
            width: vw(720),
            maxHeight: vw(160), // 4 lines
            overflowY: "auto",
            overscrollBehavior: "contain",
            fontSize: vw(26),
            lineHeight: vw(40),
            color: "#4B3A02",
            paddingRight: vw(10),
            margin: 0,
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
            : "relative",
        )}
        style={
          !isMobile
            ? {
              marginLeft: vw(1188),
              paddingTop: vw(60),
              paddingBottom: vw(60), // 底部间距
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
                    <div
                      key={field.fieldName}
                      className={cn(
                        "flex items-stretch bg-[#B4A25F] border border-white/34 relative transition-all",
                        openCountrySelector ? "z-20" : "z-0"
                      )}
                      ref={countrySelectorRef}
                      style={{
                        width: "100%",
                        height: isMobile ? mvw(50) : vw(50),
                        borderRadius: isMobile ? mvw(12) : vw(12)
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenCountrySelector(!openCountrySelector)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 hover:bg-white/10 transition-colors border-r border-white/20 flex-shrink-0"
                      >
                        <div className="w-6 h-4 md:w-8 md:h-5 flex-shrink-0">
                          <CountryFlag
                            countryCode={selectedCountry[1]}
                            className="w-full h-full rounded-[2px] object-cover"
                          />
                        </div>
                        <span className="text-white font-anaheim font-semibold text-base">
                          +{selectedCountry[2]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-white/70 ml-1 flex-shrink-0" />
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
                        placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                        disabled={isSubmitting}
                        className="contact-input-el flex-1 bg-transparent px-4 outline-none text-base"
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
                        className="contact-input-el font-anaheim font-semibold appearance-none bg-[#B4A25F] border border-white/34 text-white w-full focus:outline-none focus:border-white/60 transition-colors"
                        style={{
                          height: isMobile ? mvw(50) : vw(50),
                          borderRadius: isMobile ? mvw(12) : vw(12),
                          paddingLeft: isMobile ? mvw(24) : vw(24),
                          paddingRight: isMobile ? mvw(40) : vw(40),
                          fontSize: isMobile ? mvw(18) : vw(16),
                        }}
                      >
                        <option value="">
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
                    className="contact-input-el font-anaheim font-semibold"
                    style={{
                      width: isMobile ? "100%" : vw(486),
                      height: isMobile ? mvw(50) : vw(50),
                      borderRadius: isMobile ? mvw(12) : vw(12),
                      backgroundColor: "#B4A25F",
                      border: "1px solid rgba(255, 255, 255, 0.34)",
                      paddingLeft: isMobile ? mvw(24) : vw(24),
                      fontSize: isMobile ? mvw(18) : vw(16),
                      lineHeight: isMobile ? mvw(36) : vw(36),
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
                    className="contact-input-el font-anaheim font-semibold resize-none overflow-y-auto"
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
                className="contact-input-el font-anaheim font-semibold"
                style={{
                  width: isMobile ? "100%" : vw(486),
                  height: isMobile ? mvw(50) : vw(50),
                  borderRadius: isMobile ? mvw(12) : vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: isMobile ? mvw(24) : vw(24),
                  fontSize: isMobile ? mvw(18) : vw(16),
                  lineHeight: isMobile ? mvw(36) : vw(36),
                }}
                id="name"
                name="name"
                autoComplete="name"
                required
                disabled={isSubmitting}
              />
              <input
                id="email"
                name="email"
                autoComplete="email"
                type="email"
                placeholder="Your Email *"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                spellCheck="false"
                className="contact-input-el font-anaheim font-semibold"
                style={{
                  width: isMobile ? "100%" : vw(486),
                  height: isMobile ? mvw(50) : vw(50),
                  borderRadius: isMobile ? mvw(12) : vw(12),
                  backgroundColor: "#B4A25F",
                  border: "1px solid rgba(255, 255, 255, 0.34)",
                  paddingLeft: isMobile ? mvw(24) : vw(24),
                  fontSize: isMobile ? mvw(18) : vw(16),
                  lineHeight: isMobile ? mvw(36) : vw(36),
                }}
                required
                disabled={isSubmitting}
              />
              <div className="relative w-full" ref={countrySelectorRef}>
                <div
                  className={cn(
                    "flex items-stretch bg-[#B4A25F] border border-white/34 overflow-hidden transition-all",
                    openCountrySelector ? "z-20" : "z-0"
                  )}
                  style={{
                    width: "100%",
                    height: isMobile ? mvw(50) : vw(50),
                    borderRadius: isMobile ? mvw(12) : vw(12)
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenCountrySelector(!openCountrySelector)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 hover:bg-white/10 transition-colors border-r border-white/20 flex-shrink-0"
                  >
                    <div className="w-5 h-3 md:w-6 md:h-4 flex-shrink-0">
                      <CountryFlag
                        countryCode={selectedCountry[1]}
                        className="w-full h-full rounded-[1px] object-cover"
                      />
                    </div>
                    <span className="text-white font-anaheim font-semibold text-base">
                      +{selectedCountry[2]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/70 ml-1 flex-shrink-0" />
                  </button>

                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    autoComplete="tel"
                    value={
                      formData.whatsapp?.replace(
                        `+${selectedCountry[2]}`,
                        "",
                      ) || ""
                    }
                    onChange={(e) =>
                      handlePhoneChange("whatsapp", e.target.value)
                    }
                    placeholder="Your WhatsApp / WeChat"
                    disabled={isSubmitting}
                    className="contact-input-el flex-1 bg-transparent px-4 outline-none font-anaheim font-semibold text-base"
                  />
                </div>

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
              <div className="relative">
                <select
                  id="country"
                  name="country"
                  value={formData.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="contact-input-el font-anaheim font-semibold appearance-none bg-[#B4A25F] border border-white/34 w-full focus:outline-none focus:border-white/60 transition-colors"
                  style={{
                    height: isMobile ? mvw(50) : vw(50),
                    borderRadius: isMobile ? mvw(12) : vw(12),
                    paddingLeft: isMobile ? mvw(24) : vw(24),
                    paddingRight: isMobile ? mvw(40) : vw(40),
                    fontSize: isMobile ? mvw(18) : vw(16),
                  }}
                >
                  <option value="">
                    Select Country/Region...
                  </option>
                  {COUNTRIES.map(([name, iso2, dialCode]) => {
                    return (
                      <option key={iso2} value={name}>
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
                id="message"
                name="message"
                ref={textareaRef}
                placeholder="Please Briefly Describe Your Project Requirements Or Customization Ideas."
                value={formData.message || ""}
                spellCheck="false"
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="contact-input-el font-anaheim font-semibold resize-none overflow-y-auto"
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
                }}
                disabled={isSubmitting}
              />
            </>
          )}

          {/* Upload File 按钮 - 在 textarea 下方右侧 */}
          <div className="flex justify-end" style={{ marginTop: vw(8) }}>
            <label
              className="contact-upload-btn group flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#6B5500]"
              style={{
                width: isMobile ? mvw(180) : vw(248),
                height: isMobile ? mvw(45) : vw(59),
                borderRadius: isMobile ? mvw(22.5) : vw(33.5),
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
                className="upload-icon transition-colors duration-300 text-[#6B5500] group-hover:text-white"
                style={{
                  width: isMobile ? mvw(18) : vw(25),
                  height: isMobile ? mvw(18) : vw(25),
                }}
              >
                <path
                  d={CUSTOM_ICONS.upload.path}
                  fill="currentColor"
                />
              </svg>
              <span
                className="upload-text font-anaheim font-semibold truncate transition-colors duration-300 text-[#6B5500] group-hover:text-white"
                style={{
                  fontSize: isMobile ? mvw(16) : vw(24),
                  lineHeight: isMobile ? mvw(22) : vw(40),
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
              <p
                className={cn(
                  "text-[12px] md:text-[14px] leading-relaxed text-left whitespace-pre-line select-none transition-opacity duration-300",
                  privacyAccepted ? "text-[#4B3A02] opacity-100" : "text-[#4B3A02] opacity-70"
                )}
              >
                {effectivePrivacyText}
              </p>
            </div>
          )}

          {/* Submit 按钮 */}
          <motion.button
            className="contact-submit-btn font-anaheim font-semibold transition-colors duration-300 disabled:opacity-50"
            style={{
              width: isMobile ? "100%" : vw(486),
              minHeight: isMobile ? mvw(60) : vw(83),
              borderRadius: isMobile ? mvw(30) : vw(63),
              fontSize: isMobile ? mvw(24) : vw(32),
              marginTop: isMobile ? mvw(10) : vw(10),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            initial={{ rotate: 0, scale: 1, backgroundColor: "#7B6100", color: "#FFFFFF" }}
            animate={{
              rotate: [0, -3, 3, -3, 3, 0],
              backgroundColor: submitStatus === "success" ? "#4CAF50" : "#7B6100",
              color: "#FFFFFF"
            }}
            type="submit"
            disabled={
              isSubmitting || (!!effectivePrivacyText && !privacyAccepted)
            }
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
          {/* 底层 - 深色文字 */}
          <div
            ref={verticalTitleScrollRef1}
            onScroll={handleVerticalTitleScroll}
            data-lenis-prevent="true"
            className="absolute overflow-x-auto overflow-y-hidden no-scrollbar"
            style={{
              left: vw(180),
              top: vw(580),
              width: vw(580),
              height: vw(100),
              transform: "rotate(-90deg)",
              transformOrigin: "top left",
            }}
          >
            <span
              className="font-moul whitespace-nowrap"
              style={{
                fontSize: vw(80),
                lineHeight: vw(80),
                color: "#302C06",
                display: "block",
                paddingRight: vw(40),
              }}
            >
              {verticalTitle}
            </span>
          </div>
          {/* 上层 - 白色文字（只在图片区域显示） */}
          <div
            className="absolute overflow-hidden pointer-events-none"
            style={{
              left: vw(4),
              top: vw(420),
              width: vw(760),
              height: vw(340),
              borderRadius: vw(260),
            }}
          >
            <div
              ref={verticalTitleScrollRef2}
              className="absolute overflow-x-hidden overflow-y-hidden no-scrollbar"
              style={{
                left: vw(176),
                top: vw(160),
                width: vw(580),
                height: vw(100),
                transform: "rotate(-90deg)",
                transformOrigin: "top left",
              }}
            >
              <span
                className="font-moul whitespace-nowrap"
                style={{
                  fontSize: vw(80),
                  lineHeight: vw(80),
                  color: "white",
                  display: "block",
                  paddingRight: vw(40),
                }}
              >
                {verticalTitle}
              </span>
            </div>
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

        .contact-form-input:focus,
        .contact-form-input:focus-visible,
        .contact-form-input:active {
          outline: none !important;
          box-shadow: none !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }

        .contact-form-input::placeholder {
          color: rgba(255, 255, 255, 0.95) !important;
        }
      `}</style>
    </section>
  );
}
