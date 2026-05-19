"use client";

import * as React from "react";
import { CUSTOM_ICONS } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ChevronDown, Check } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import type { ContactFormData } from "@/lib/content-parser";
import { COUNTRIES } from "@/components/ui/PhoneInput";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";

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
  const [selectedCountry, setSelectedCountry] = React.useState(
    COUNTRIES.find((c) => c[1] === "US") || COUNTRIES[0],
  );
  const [openCountrySelector, setOpenCountrySelector] = React.useState(false);
  const countrySelectorRef = React.useRef<HTMLDivElement>(null);

  // Responsive state
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1025); // Tablet and mobile
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

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
          // Use form-config API directly for the request to support slug lookup properly
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

  // Safely extract localized string or valid Lexical AST from multilingual map or raw text
  const getLocalizedString = React.useCallback((val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      // Check if it's a Lexical rich text object (has root property)
      if (val.root) return val;
      // Otherwise it's a multilingual map { en: '...', zh: '...' }
      return val[locale] || val["en"] || "";
    }
    return "";
  }, [locale]);

  const privacyText = React.useMemo(() => {
    const rawPrivacy = data.privacyConsentText || formConfig?.privacyConsentText || formConfig?.data?.privacyConsentText || "";
    return getLocalizedString(rawPrivacy);
  }, [data.privacyConsentText, formConfig, getLocalizedString]);

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

  const handlePhoneChange = (name: string, value: string) => {
    const digits = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: digits ? `+${selectedCountry[2]}${digits}` : "",
    }));
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

        .contact-submit-btn:hover:not(:disabled) {
          background-color: white !important;
          color: #756F3F !important;
          transform: scale(1.05);
        }
        .contact-upload-btn:hover {
          background-color: white !important;
          color: #756F3F !important;
        }
        .contact-upload-btn:hover :global(.upload-icon),
        .contact-upload-btn:hover .upload-text {
          color: #756F3F !important;
        }
      `}</style>
      {/* Background Image - Rectangle 395 */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <OptimizedImage
            image={backgroundImage}
            alt=""
            size="large"
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
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: isMobile ? mvw(20) : vw(30),
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

      {/* Product Images - Hidden on Mobile to save space, perfectly aligned and downward adjusted on Desktop */}
      {!isMobile && (
        <>
          {/* Left Tilted Product Image 1 */}
          {currentImages[0] && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: vw(147 - SECTION_X_OFFSET), // Use vw() to match translate/width units perfectly
                top: vw(275), // Adjusted downward by 42.5px
                width: vw(306),
                height: vw(405), // Standardized height for perfect fold stacking
                transform: isFolded
                  ? `translate(${vw(131.5)}, ${vw(-21.5)}) rotate(6deg)`
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
                size="large" // Upgraded clarity
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
                left: vw(410 - SECTION_X_OFFSET), // Use vw() to match translate/width units perfectly
                top: vw(232), // Adjusted downward by 41.8px
                width: vw(306),
                height: vw(405), // Standardized height for perfect fold stacking
                transform: isFolded
                  ? `translate(${vw(-131.5)}, ${vw(21.5)}) rotate(6deg)`
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
                size="large" // Upgraded clarity
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
            autoComplete="name"
            placeholder={
              getFieldConfig("name")?.placeholder ||
              (locale === "zh"
                ? "您的姓名 / 公司名称"
                : "Your Name / Company Name")
            }
            value={formData.name}
            onChange={handleInputChange}
            spellCheck="false"
            className="contact-input-el bg-transparent placeholder-white/95 outline-none font-anaheim font-semibold"
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
            autoComplete="email"
            placeholder={
              getFieldConfig("email")?.placeholder ||
              (locale === "zh" ? "您的邮箱" : "Your Email")
            }
            value={formData.email}
            onChange={handleInputChange}
            spellCheck="false"
            className="contact-input-el bg-transparent placeholder-white/95 outline-none font-anaheim font-semibold"
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
          <div className="relative w-full" ref={countrySelectorRef}>
            <div
              className={cn(
                "flex items-stretch relative transition-all overflow-hidden",
                openCountrySelector ? "z-20" : "z-0"
              )}
              style={{
                width: "100%",
                height: isMobile ? mvw(50) : vw(63),
                backgroundColor: inputBg,
                border: inputBorder,
                borderRadius: isMobile ? mvw(12) : vw(15),
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
                placeholder={
                  getFieldConfig("whatsapp")?.placeholder ||
                  (locale === "zh"
                    ? "您的 WhatsApp / 电话"
                    : "Your WhatsApp / Phone")
                }
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

          {/* Input: Country/Region */}
          <div className="relative">
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="contact-input-el w-full bg-transparent placeholder-white/95 outline-none font-anaheim font-semibold appearance-none focus:outline-none transition-colors"
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
            className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold resize-none overflow-y-auto [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#756F3F_inset!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
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
                className={cn(
                  "font-anaheim text-left select-none whitespace-pre-line prose-none rich-text-privacy [&_p]:m-0 transition-opacity duration-300",
                  privacyAccepted ? "text-white opacity-100" : "text-white opacity-70"
                )}
                style={{
                  fontSize: isMobile ? mvw(12) : "14px",
                  lineHeight: isMobile ? mvw(18) : vw(24),
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

          {/* Upload and Submit Section - Stacked Layout */}
          <div className="flex flex-col gap-4 w-full">
            {/* Upload Button - Top Right */}
            <div className="flex justify-end w-full">
              <label
                className="contact-upload-btn group flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/34"
                style={{
                  width: isMobile ? "100%" : vw(256),
                  height: isMobile ? mvw(50) : vw(60),
                  borderRadius: isMobile ? mvw(25) : vw(33.5),
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <svg
                  viewBox={CUSTOM_ICONS.upload.viewBox}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="upload-icon text-white group-hover:text-[#756F3F] transition-colors"
                  style={{
                    width: isMobile ? mvw(20) : vw(25),
                    height: isMobile ? mvw(20) : vw(25),
                  }}
                >
                  <path
                    d={CUSTOM_ICONS.upload.path}
                    fill="currentColor"
                  />
                </svg>
                <span className="upload-text text-white font-anaheim font-semibold text-lg transition-colors">
                  {file
                    ? file.name.substring(0, 15) + "..."
                    : getFieldConfig("attachment")?.placeholder ||
                      (locale === "zh" ? "上传文件" : "Upload File")}
                </span>
              </label>
            </div>

            {/* Submit Button - Bottom Full Width */}
            <button
              type="submit"
              disabled={isSubmitting || (!!privacyText && !privacyAccepted)}
              className={cn(
                "contact-submit-btn w-full flex items-center justify-center gap-2 font-anaheim font-bold text-white transition-all disabled:opacity-50",
                !!privacyText && !privacyAccepted ? "grayscale opacity-80" : ""
              )}
              style={{
                width: "100%",
                height: isMobile ? mvw(60) : vw(83),
                backgroundColor: "#756F3F",
                borderRadius: isMobile ? mvw(30) : vw(63),
                fontSize: isMobile ? mvw(24) : vw(32),
              }}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {formConfig?.submitButtonText ||
                    (locale === "zh" ? "提交咨询" : "Send Inquiry")}
                </span>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {submitted && (
            <div
              className="text-green-400 font-anaheim text-center w-full mt-4"
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
              className="text-red-400 font-anaheim text-center w-full mt-4"
              style={{ fontSize: isMobile ? mvw(16) : vw(18) }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
