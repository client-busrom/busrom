"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Upload, ChevronDown, Check } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import type { ContactFormData } from "@/lib/content-parser";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";

/**
 * Contact Form Section
 *
 * Based on Figma design:
 * - Full width background image with blur overlay
 * - Title on the left side
 * - 4 input fields on the right (stacked vertically)
 * - Helper text in the middle
 * - Two tilted product images on the left
 * - Upload file button and Send Inquiry button
 */

// Design constants
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 696;
const MOBILE_DESIGN_WIDTH = 390; // Standard mobile width for scaling
const SECTION_X_OFFSET = 30; // The group starts at x=30

interface ContactFormProps {
  data: ContactFormData & { privacyConsentText?: string };
  className?: string;
}

// Image switch interval in milliseconds
const IMAGE_SWITCH_INTERVAL = 4000;
// Animation duration for fold/unfold effect
const ANIMATION_DURATION = 600;

export function ContactForm({ data, className }: ContactFormProps) {
  if (!data) return null;

  const {
    title = "",
    backgroundImage = "",
    helperTitle = "",
    helperText = "",
    productImages = [],
    formId = "",
  } = data;

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    message: "",
  });
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Responsive state
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Tablet and mobile
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const STORAGE_KEY = "busrom_privacy_consent";

  // Check global consent status on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const accepted = localStorage.getItem(STORAGE_KEY) === "true";
      if (accepted) {
        setPrivacyAccepted(true);
        setIsGloballyAccepted(true);
      }
    }
  }, []);

  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Fetch form config dynamically using formId (from contact-form-block marker)
  const [fetchedFormConfig, setFetchedFormConfig] = React.useState<any>(null);
  React.useEffect(() => {
    // Only fetch if we have a formId and NO pre-populated formConfig
    if (formId && !data.formConfig) {
      const fetchFormConfig = async () => {
        try {
          // Use formId directly for the request
          const res = await fetch(
            `/api/form-configs/${formId}?locale=${locale}`,
          );
          if (res.ok) {
            const config = await res.json();
            setFetchedFormConfig(config);
          }
        } catch (error) {
          console.error("Failed to fetch form config:", error);
        }
      };
      fetchFormConfig();
    }
  }, [formId, locale]);

  // Form config: prioritize full config from data, otherwise use fetched config
  const formConfig = (data.formConfig && data.formConfig.fields) ? data.formConfig : (fetchedFormConfig || data.formConfig);

  const privacyText = React.useMemo(() => {
    return data.privacyConsentText || formConfig?.privacyConsentText || "";
  }, [data.privacyConsentText, formConfig?.privacyConsentText]);

  const getFieldConfig = (fieldName: string) => {
    return formConfig?.fields?.find((f: any) => f.fieldName === fieldName);
  };

  // Sync with global storage when accepted in this form
  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsGloballyAccepted(true);
      // Trigger a storage event for other components to update
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Listen for storage events from other components
  React.useEffect(() => {
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

  // Track form height to adjust section height
  const formRef = React.useRef<HTMLFormElement>(null);

  // Track which images to display (separate from currentGroupIndex for animation timing)
  const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isFolded, setIsFolded] = React.useState(false);

  // Calculate number of groups (pairs of images)
  const imageGroups = React.useMemo(() => {
    const groups: Array<[string, string]> = [];
    for (let i = 0; i < productImages.length; i += 2) {
      if (productImages[i] && productImages[i + 1]) {
        groups.push([productImages[i], productImages[i + 1]]);
      } else if (productImages[i]) {
        // If odd number of images, pair last one with first
        groups.push([productImages[i], productImages[0] || productImages[i]]);
      }
    }
    return groups.length > 0
      ? groups
      : [[productImages[0] || "", productImages[1] || ""]];
  }, [productImages]);

  // Track which images to display (separate from currentGroupIndex for animation timing)
  const [displayedGroupIndex, setDisplayedGroupIndex] = React.useState(0);
  // Track mask visibility for card flip effect
  const [showMask, setShowMask] = React.useState(false);

  // Auto-switch images with fold animation
  React.useEffect(() => {
    if (imageGroups.length <= 1) return;

    const interval = setInterval(() => {
      // Step 1: Start fold animation (old images fold inward)
      setIsAnimating(true);
      setIsFolded(true);

      // Step 2: After fold completes, show mask to cover images
      setTimeout(() => {
        setShowMask(true);

        // Step 3: After mask appears, switch images
        setTimeout(() => {
          setCurrentGroupIndex((prev) => (prev + 1) % imageGroups.length);
          setDisplayedGroupIndex((prev) => (prev + 1) % imageGroups.length);

          // Step 4: Hide mask to reveal new images
          setTimeout(() => {
            setShowMask(false);

            // Step 5: Unfold with new images
            setTimeout(() => {
              setIsFolded(false);

              // Step 6: Animation complete
              setTimeout(() => {
                setIsAnimating(false);
              }, ANIMATION_DURATION);
            }, 100);
          }, 150);
        }, 150);
      }, ANIMATION_DURATION);
    }, IMAGE_SWITCH_INTERVAL);

    return () => clearInterval(interval);
  }, [imageGroups.length]);

  // Get current image pair to display
  const currentImages = imageGroups[displayedGroupIndex] || [
    productImages[0],
    productImages[1],
  ];

  // Initial height based on design ratio to avoid 0px on mount
  const [sectionHeight, setSectionHeight] = React.useState<number>(0);

  React.useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    const updateHeight = () => {
      const formTop = (107 / DESIGN_WIDTH) * window.innerWidth;
      const bottomPadding = (50 / DESIGN_WIDTH) * window.innerWidth;
      const formHeight = formEl.getBoundingClientRect().height;
      const minDesignHeight =
        (DESIGN_HEIGHT / DESIGN_WIDTH) * window.innerWidth;

      // Calculate final height: must be at least minDesignHeight
      const calculatedHeight = Math.max(
        minDesignHeight,
        formTop + formHeight + bottomPadding,
      );
      setSectionHeight(calculatedHeight);
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(formEl);

    // Immediate update after mount
    updateHeight();

    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !privacyAccepted
    ) {
      setError(
        formConfig?.errorRequiredFields ||
          (locale === "zh"
            ? "请填写必填字段"
            : "Please fill in required fields"),
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let attachmentUrl = "";
      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const uploadRes = await fetch("/api/form-file-upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: "product-series-inquiry-form",
          data: formData,
          attachments: attachmentUrl ? [attachmentUrl] : [],
          locale,
          sourcePage: window.location.href,
          userLocalTime: new Date().toString(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Push success event to Google Tag Manager
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "form_submit_success",
            form_id: formConfig?.name || "product-series-inquiry-form",
            form_name: formConfig?.name || "Product Series Inquiry Form",
          });
        }
        setFormData({
          name: "",
          email: "",
          whatsapp: "",
          country: "",
          message: "",
        });
        setFile(null);

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        const errorData = await res.json();
        setError(
          errorData.error ||
            formConfig?.errorNetworkMessage ||
            (locale === "zh"
              ? "提交失败，请重试"
              : "Failed to submit form. Please try again."),
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        formConfig?.errorNetworkMessage ||
          (locale === "zh"
            ? "网络错误，请稍后重试"
            : "An unexpected error occurred. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to calculate position relative to design
  const px = (value: number) =>
    isMobile
      ? `${(value / MOBILE_DESIGN_WIDTH) * 100}%`
      : `${(value / DESIGN_WIDTH) * 100}%`;
  const vw = (value: number) => `${(value / DESIGN_WIDTH) * 100}vw`;
  // Use clamp to prevent items from becoming too large on iPad/Tablet
  const mvw = (value: number) =>
    `clamp(${value * 0.8}px, ${(value / MOBILE_DESIGN_WIDTH) * 100}vw, ${value * 1.15}px)`;

  // Input style constants
  const inputBg = "rgba(255, 250, 203, 0.25)";
  const inputBorder = "1px solid rgba(255, 255, 255, 0.34)";

  return (
    <section
      id="contact-form"
      className={cn(
        "relative w-full overflow-hidden flex flex-col lg:block",
        className,
      )}
      style={{
        height: isMobile
          ? "auto"
          : sectionHeight > 0
            ? `${sectionHeight}px`
            : vw(DESIGN_HEIGHT),
        marginLeft: isMobile ? mvw(20) : px(SECTION_X_OFFSET),
        marginRight: isMobile ? mvw(20) : px(SECTION_X_OFFSET),
        width: isMobile
          ? `calc(100% - ${mvw(40)})`
          : `calc(100% - ${px(SECTION_X_OFFSET * 2)})`,
        borderRadius: isMobile ? mvw(20) : vw(30),
        paddingBottom: isMobile ? mvw(40) : 0,
      }}
    >
      {/* Background Image - Rectangle 395 */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <OptimizedImage
            image={backgroundImage}
            alt=""
            size="xlarge"
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
        </div>
      )}

      {/* Blur Overlay - Rectangle 727 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.09)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderRadius: isMobile ? mvw(20) : vw(30),
          mixBlendMode: "darken",
        }}
      />

      {/* Title - "Contact Us Get A Quote" */}
      <h2
        className={cn(
          "font-josefin-sans font-bold text-left",
          isMobile
            ? "relative z-10 w-full whitespace-pre-wrap"
            : "absolute whitespace-pre",
        )}
        style={{
          left: isMobile ? 0 : px(153 - SECTION_X_OFFSET),
          top: isMobile ? 0 : vw(80),
          fontSize: isMobile ? mvw(28) : vw(86),
          lineHeight: isMobile ? mvw(36) : vw(109),
          padding: isMobile ? `${mvw(40)} ${mvw(24)} ${mvw(10)}` : 0,
          minWidth: isMobile ? "auto" : "max-content",
        }}
      >
        <span
          className="absolute text-transparent"
          style={{
            WebkitTextStroke: isMobile
              ? `1px rgba(255, 255, 255, 0.6)`
              : `2px rgba(255, 255, 255, 0.6)`,
            top: isMobile ? mvw(41.5) : vw(4),
            left: isMobile ? mvw(25.5) : vw(4),
          }}
        >
          {title}
        </span>
        <span className="relative text-shine">{title}</span>
      </h2>

      {/* Product Images - Hidden on Mobile to save space, or moved if needed */}
      {!isMobile && (
        <>
          {/* Left Tilted Product Image 1 */}
          {currentImages[0] && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: px(147 - SECTION_X_OFFSET),
                top: vw(232.5),
                width: vw(306),
                height: vw(399),
                transform: isFolded
                  ? `translate(${(131.5 / DESIGN_WIDTH) * 100}vw, ${(-18 / DESIGN_WIDTH) * 100}vw) rotate(6deg)`
                  : "translate(0, 0) rotate(-3.23deg)",
                transformOrigin: "center center",
                borderRadius: vw(30),
                transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                zIndex: 1,
              }}
            >
              <OptimizedImage
                image={currentImages[0]}
                alt=""
                size="thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: "#756F3F",
                  opacity: showMask ? 1 : 0,
                  transition: "opacity 150ms ease-in-out",
                  borderRadius: vw(30),
                }}
              />
            </div>
          )}

          {/* Left Tilted Product Image 2 */}
          {currentImages[1] && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: px(410 - SECTION_X_OFFSET),
                top: vw(190.2),
                width: vw(306),
                height: vw(411),
                transform: isFolded
                  ? `translate(${(-131.5 / DESIGN_WIDTH) * 100}vw, ${(18 / DESIGN_WIDTH) * 100}vw) rotate(6deg)`
                  : "translate(0, 0) rotate(15.15deg)",
                transformOrigin: "center center",
                borderRadius: vw(30),
                transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                zIndex: 2,
              }}
            >
              <OptimizedImage
                image={currentImages[1]}
                alt=""
                size="thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: "#756F3F",
                  opacity: showMask ? 1 : 0,
                  transition: "opacity 150ms ease-in-out",
                  borderRadius: vw(30),
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Main Content Area - Mobile Stack */}
      <div
        className={cn(
          isMobile
            ? "relative z-10 flex flex-col px-6 items-center lg:items-start"
            : "contents",
        )}
      >
        {/* Helper Title */}
        <h3
          className={cn(
            "font-inter font-semibold animate-pulse-scale whitespace-pre-line",
            isMobile
              ? "relative mb-2 w-full max-w-[600px] text-left"
              : "absolute",
          )}
          style={{
            left: isMobile ? 0 : px(800 - SECTION_X_OFFSET),
            top: isMobile ? 0 : vw(304),
            width: isMobile ? "100%" : px(391),
            fontSize: isMobile ? mvw(18) : vw(40),
            lineHeight: isMobile ? mvw(26) : vw(58),
            color: "#FFFF95",
            transformOrigin: "left center",
            zIndex: 10,
          }}
        >
          {helperTitle}
        </h3>

        {/* Helper Text */}
        <p
          className={cn(
            "font-inter whitespace-pre-line",
            isMobile
              ? "relative mb-8 w-full max-w-[600px] text-left"
              : "absolute",
          )}
          style={{
            left: isMobile ? 0 : px(800 - SECTION_X_OFFSET),
            top: isMobile ? 0 : vw(436),
            width: isMobile ? "100%" : px(391),
            fontSize: isMobile ? mvw(14) : vw(20),
            lineHeight: isMobile ? mvw(22) : vw(33),
            color: "#FFFF95",
            zIndex: 10,
          }}
        >
          {helperText}
        </p>

        {/* Form Container */}
        <form
          id={formConfig?.name || "product-series-inquiry-form"}
          ref={formRef}
          onSubmit={handleSubmit}
          className={cn(
            "flex flex-col",
            isMobile ? "relative w-full max-w-[600px]" : "absolute",
          )}
          style={{
            left: isMobile ? 0 : px(1251 - SECTION_X_OFFSET),
            top: isMobile ? 0 : vw(107),
            width: isMobile ? "100%" : vw(486),
            gap: isMobile ? mvw(16) : vw(20),
          }}
        >
          {/* Input 1: Name */}
          <input
            type="text"
            name="name"
            placeholder={
              getFieldConfig("name")?.placeholder ||
              (locale === "zh"
                ? "您的姓名 / 公司名称"
                : "Your Name / Company Name")
            }
            value={formData.name}
            onChange={handleInputChange}
            spellCheck="false"
            className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
            style={{
              fontSize: isMobile ? mvw(16) : vw(16),
              paddingLeft: isMobile ? mvw(24) : vw(29),
              height: isMobile ? mvw(50) : vw(63),
              backgroundColor: inputBg,
              border: inputBorder,
              borderRadius: isMobile ? mvw(12) : vw(15),
            }}
          />

          {/* Input 2: Email */}
          <input
            type="email"
            name="email"
            placeholder={
              getFieldConfig("email")?.placeholder ||
              (locale === "zh" ? "您的邮箱" : "Your Email")
            }
            value={formData.email}
            onChange={handleInputChange}
            spellCheck="false"
            className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
            style={{
              fontSize: isMobile ? mvw(16) : vw(16),
              paddingLeft: isMobile ? mvw(24) : vw(29),
              height: isMobile ? mvw(50) : vw(63),
              backgroundColor: inputBg,
              border: inputBorder,
              borderRadius: isMobile ? mvw(12) : vw(15),
            }}
          />

          {/* Input 3: WhatsApp */}
          <div
            className="relative"
            style={{
              width: "100%",
              height: isMobile ? mvw(50) : vw(63),
              backgroundColor: inputBg,
              border: inputBorder,
              borderRadius: isMobile ? mvw(12) : vw(15),
              overflow: "visible",
            }}
          >
            <PhoneInput
              value={formData.whatsapp || ""}
              onChange={(phone) =>
                setFormData((prev) => ({ ...prev, whatsapp: phone }))
              }
              placeholder={
                getFieldConfig("whatsapp")?.placeholder ||
                (locale === "zh"
                  ? "您的 WhatsApp / 电话"
                  : "Your WhatsApp / Phone")
              }
              disabled={isSubmitting}
              className="!bg-transparent !border-none !h-full"
              buttonClassName="!bg-transparent !border-r-0 !text-white hover:!bg-white/10 !px-4 !h-full"
              inputClassName={cn(
                "!bg-transparent !text-white !placeholder-white/95 !font-anaheim !font-semibold !h-full [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
                isMobile ? "!pl-2" : "!text-[0.833vw]",
              )}
              inputStyle={{
                fontSize: isMobile ? mvw(16) : vw(16),
              }}
              dialCodeClassName={cn(
                "!text-white",
                !isMobile && "!text-[0.833vw]",
              )}
              dialCodeStyle={{
                fontSize: isMobile ? mvw(16) : vw(16),
              }}
            />
          </div>

          {/* Input: Country/Region */}
          <div className="relative">
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold appearance-none focus:outline-none transition-colors"
              style={{
                fontSize: isMobile ? mvw(16) : vw(16),
                paddingLeft: isMobile ? mvw(24) : vw(29),
                paddingRight: isMobile ? mvw(40) : vw(40),
                height: isMobile ? mvw(50) : vw(63),
                backgroundColor: inputBg,
                border: inputBorder,
                borderRadius: isMobile ? mvw(12) : vw(15),
              }}
            >
              <option value="" className="text-black">
                {getFieldConfig("country")?.placeholder ||
                  (locale === "zh"
                    ? "选择国家/地区..."
                    : "Select Country/Region...")}
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
              <ChevronDown size={isMobile ? 18 : 20} />
            </div>
          </div>

          {/* Input 4: Message (textarea) */}
          <textarea
            name="message"
            placeholder={
              getFieldConfig("message")?.placeholder ||
              (locale === "zh" ? "留言" : "Message")
            }
            value={formData.message}
            onChange={handleInputChange}
            spellCheck="false"
            className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold resize-y overflow-hidden [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
            style={{
              fontSize: isMobile ? mvw(16) : vw(16),
              paddingLeft: isMobile ? mvw(24) : vw(29),
              paddingTop: isMobile ? mvw(12) : vw(16),
              paddingBottom: isMobile ? mvw(12) : vw(16),
              minHeight: isMobile ? mvw(50) : vw(63),
              backgroundColor: inputBg,
              border: inputBorder,
              borderRadius: isMobile ? mvw(12) : vw(15),
            }}
          />

          {/* Privacy Consent Checkbox */}
          {privacyText && (
            <div
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => handlePrivacyToggle(!privacyAccepted)}
            >
              <div
                className={`flex-shrink-0 border flex items-center justify-center transition-all ${
                  privacyAccepted
                    ? "bg-[#9C9032] border-[#9C9032]"
                    : "border-white/30 bg-transparent"
                }`}
                style={{
                  marginTop: isMobile ? mvw(4) : vw(4),
                  width: isMobile ? mvw(20) : vw(20),
                  height: isMobile ? mvw(20) : vw(20),
                  borderRadius: isMobile ? mvw(4) : vw(4),
                }}
              >
                {privacyAccepted && (
                  <svg
                    style={{
                      width: isMobile ? mvw(14) : vw(14),
                      height: isMobile ? mvw(14) : vw(14),
                    }}
                    className="text-white"
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
              <div
                className="font-anaheim text-left select-none text-white/90 whitespace-pre-line prose-none rich-text-privacy [&_p]:m-0"
                style={{
                  fontSize: isMobile ? mvw(14) : "14px",
                  lineHeight: isMobile ? mvw(18) : vw(18),
                }}
              >
                {typeof privacyText === "object" ? (
                  <RichText data={privacyText as any} />
                ) : (
                  privacyText
                )}
              </div>
            </div>
          )}

          {/* Upload File Button */}
          <label
            className={cn(
              "flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:opacity-100 hover:bg-white/20 hover:border-white",
              isMobile ? "self-start w-full" : "self-end",
            )}
            style={{
              width: isMobile ? "100%" : vw(256),
              height: isMobile ? mvw(50) : vw(58),
              border: "1px solid rgba(255, 255, 255, 0.46)",
              borderRadius: isMobile ? mvw(25) : vw(33.5),
              opacity: 0.61,
            }}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Upload
              className="text-white"
              style={{
                width: isMobile ? mvw(20) : vw(25),
                height: isMobile ? mvw(20) : vw(25),
              }}
            />
            <span
              className="font-anaheim font-semibold text-white"
              style={{ fontSize: isMobile ? mvw(18) : vw(24) }}
            >
              {file
                ? file.name.substring(0, 15) + "..."
                : getFieldConfig("file")?.label ||
                  (locale === "zh" ? "上传文件" : "Upload File")}
            </span>
          </label>

          {/* Status Messages */}
          {submitted && (
            <div
              className="text-green-400 font-anaheim text-center w-full"
              style={{ fontSize: isMobile ? mvw(16) : vw(18) }}
            >
              {formConfig?.successMessage ||
                (locale === "zh"
                  ? "询盘发送成功！我们将尽快联系您。"
                  : "Inquiry sent successfully! We will contact you soon.")}
            </div>
          )}
          {error && (
            <div
              className="text-red-400 font-anaheim text-center w-full"
              style={{ fontSize: isMobile ? mvw(16) : vw(18) }}
            >
              {error}
            </div>
          )}

          {/* Send Inquiry Button */}
          <motion.button
            style={{
              transformOrigin: "center",
              width: "100%",
              minHeight: isMobile ? mvw(60) : vw(83),
              height: "auto",
              backgroundColor: "#9C9032",
              borderRadius: isMobile ? mvw(30) : vw(63),
              fontSize: isMobile ? mvw(24) : vw(32),
              gap: isMobile ? mvw(16) : vw(20),
              marginTop: 0,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
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
            disabled={isSubmitting || (!!privacyText && !privacyAccepted)}
            className={`flex items-center justify-center text-white font-anaheim font-semibold transition-colors duration-300 disabled:opacity-70 whitespace-pre-line leading-tight px-4 py-2 ${
              !!privacyText && !privacyAccepted ? "grayscale opacity-80" : ""
            }`}
          >
            {isSubmitting
              ? formConfig?.submittingText ||
                (locale === "zh" ? "发送中..." : "Sending...")
              : formConfig?.submitButtonText ||
                (locale === "zh" ? "发送询盘" : "Send Inquiry")}
          </motion.button>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
