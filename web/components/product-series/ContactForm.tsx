"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import type { ContactFormData } from "@/lib/content-parser";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";

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

  // Form config: prioritize pre-populated config from API/Parser, fallback to local fetch
  const formConfig = data.formConfig || fetchedFormConfig;

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
      const minDesignHeight = (DESIGN_HEIGHT / DESIGN_WIDTH) * window.innerWidth;
      
      // Calculate final height: must be at least minDesignHeight
      const calculatedHeight = Math.max(minDesignHeight, formTop + formHeight + bottomPadding);
      setSectionHeight(calculatedHeight);
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(formEl);
    
    // Immediate update after mount
    updateHeight();

    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
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
    if (!formData.name || !formData.email || !formData.message || !privacyAccepted) {
      setError(formConfig?.errorRequiredFields || (locale === 'zh' ? "请填写必填字段" : "Please fill in required fields"));
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
        setError(errorData.error || (formConfig?.errorNetworkMessage || (locale === 'zh' ? "提交失败，请重试" : "Failed to submit form. Please try again.")));
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(formConfig?.errorNetworkMessage || (locale === 'zh' ? "网络错误，请稍后重试" : "An unexpected error occurred. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to calculate position relative to design
  const px = (value: number) => `${(value / DESIGN_WIDTH) * 100}%`;
  const vw = (value: number) => `${(value / DESIGN_WIDTH) * 100}vw`;

  // Input style constants
  const inputBg = "rgba(255, 250, 203, 0.25)";
  const inputBorder = "1px solid rgba(255, 255, 255, 0.34)";

  return (
    <section
      id="contact-form"
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height: sectionHeight > 0 ? `${sectionHeight}px` : vw(DESIGN_HEIGHT),
        marginLeft: px(SECTION_X_OFFSET),
        marginRight: px(SECTION_X_OFFSET),
        width: `calc(100% - ${px(SECTION_X_OFFSET * 2)})`,
        borderRadius: vw(30),
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
          borderRadius: vw(30),
          mixBlendMode: "darken",
        }}
      />

      {/* Title - "Contact Us Get A Quote" at x=153, y=80 (relative to section y=5791) */}
      {/* 双层文字叠加效果：底层白色描边镂空字 + 顶层带光泽动画的填充字 */}
      <h2
        className="absolute font-josefin-sans font-bold whitespace-pre text-left"
        style={{
          left: px(153 - SECTION_X_OFFSET),
          top: vw(80),
          fontSize: vw(86),
          lineHeight: vw(109),
          minWidth: "max-content",
        }}
      >
        {/* 底层：白色描边镂空字，向右下偏移形成立体感 */}
        <span
          className="absolute text-transparent"
          style={{
            WebkitTextStroke: "2px rgba(255, 255, 255, 0.6)",
            top: vw(4),
            left: vw(4),
          }}
        >
          {title}
        </span>
        {/* 顶层：带光泽扫过动画的填充字 */}
        <span className="relative text-shine">
          {title}
        </span>
      </h2>

      {/* Left Tilted Product Image 1 - Rectangle 728 */}
      {/* Fold animation: rotate + translate to center, stack with image 2 */}
      {currentImages[0] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(147 - SECTION_X_OFFSET),
            top: vw(232.5),
            width: vw(306),
            height: vw(399),
            // Folded: rotate to 0 + move right and up to overlap with image 2
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
          {/* Mask overlay - brand color */}
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

      {/* Left Tilted Product Image 2 - Rectangle 729 */}
      {/* Fold animation: rotate + translate to center, stack with image 1 */}
      {currentImages[1] && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(410 - SECTION_X_OFFSET),
            top: vw(190.2),
            width: vw(306),
            height: vw(411),
            // Folded: rotate to 0 + move left and down to overlap with image 1
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
          {/* Mask overlay - brand color */}
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

      {/* Helper Title - "We'd love to hear from you!" */}
      <h3
        className="absolute font-inter font-semibold animate-pulse-scale whitespace-pre-line"
        style={{
          left: px(800 - SECTION_X_OFFSET),
          top: vw(304),
          width: px(391),
          fontSize: vw(40),
          lineHeight: vw(58),
          color: "#FFFF95",
          transformOrigin: "left center",
          zIndex: 10,
        }}
      >
        {helperTitle}
      </h3>

      {/* Helper Text */}
      <p
        className="absolute font-inter whitespace-pre-line"
        style={{
          left: px(800 - SECTION_X_OFFSET),
          top: vw(436),
          width: px(391),
          fontSize: vw(20),
          lineHeight: vw(33),
          color: "#FFFF95",
          zIndex: 10,
        }}
      >
        {helperText}
      </p>

      {/* Form Container - using flex layout for dynamic height */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="absolute flex flex-col"
        style={{
          left: px(1251 - SECTION_X_OFFSET),
          top: vw(107),
          width: vw(486),
          gap: vw(20),
        }}
      >
        {/* Input 1: Name */}
        <input
          type="text"
          name="name"
          placeholder={getFieldConfig('name')?.placeholder || (locale === 'zh' ? "您的姓名 / 公司名称" : "Your Name / Company Name")}
          value={formData.name}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Input 2: Email */}
        <input
          type="email"
          name="email"
          placeholder={getFieldConfig('email')?.placeholder || (locale === 'zh' ? "您的邮箱" : "Your Email")}
          value={formData.email}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Input 3: WhatsApp */}
        <div
          className="dynamic-phone-input"
          style={{
            width: "100%",
            height: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
            overflow: "visible",
          }}
        >
          <PhoneInput
            value={formData.whatsapp || ""}
            onChange={(phone) =>
              setFormData((prev) => ({ ...prev, whatsapp: phone }))
            }
            placeholder={getFieldConfig('whatsapp')?.placeholder || (locale === 'zh' ? "您的 WhatsApp / 电话" : "Your WhatsApp / Phone")}
            disabled={isSubmitting}
            className="!bg-transparent !border-none !h-full !rounded-none"
            buttonClassName="!bg-transparent !border-r-0 !text-white hover:!bg-white/10 !rounded-none !px-4 !h-full"
            inputClassName="!bg-transparent !text-white !placeholder-white/95 !font-anaheim !font-semibold !text-[1.04vw] !h-full"
            dialCodeClassName="!text-white !text-[1.04vw]"
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
              fontSize: vw(20),
              paddingLeft: vw(29),
              paddingRight: vw(40),
              height: vw(63),
              backgroundColor: inputBg,
              border: inputBorder,
              borderRadius: vw(15),
            }}
          >
            <option value="" className="text-black">
              {getFieldConfig('country')?.placeholder || (locale === 'zh' ? "选择国家/地区..." : "Select Country/Region...")}
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
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Input 4: Message (textarea) */}
        <textarea
          name="message"
          placeholder={getFieldConfig('message')?.placeholder || (locale === 'zh' ? "留言" : "Message")}
          value={formData.message}
          onChange={handleInputChange}
          className="bg-transparent text-white/95 placeholder-white/95 outline-none font-anaheim font-semibold resize-y overflow-hidden"
          style={{
            fontSize: vw(20),
            paddingLeft: vw(29),
            paddingTop: vw(16),
            paddingBottom: vw(16),
            minHeight: vw(63),
            backgroundColor: inputBg,
            border: inputBorder,
            borderRadius: vw(15),
          }}
        />

        {/* Privacy Consent Checkbox - Always show if text is present */}
        {privacyText && (
          <div
            className="flex items-start gap-3 mt-2 cursor-pointer group"
            onClick={() => handlePrivacyToggle(!privacyAccepted)}
          >
            <div
              className={`flex-shrink-0 border flex items-center justify-center transition-all ${
                privacyAccepted
                  ? "bg-[#9C9032] border-[#9C9032]"
                  : "border-white/30 bg-transparent"
              }`}
              style={{
                marginTop: vw(4),
                width: vw(20),
                height: vw(20),
                borderRadius: vw(4),
              }}
            >
              {privacyAccepted && (
                <svg
                  style={{ width: vw(14), height: vw(14) }}
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
            <p
              className="font-anaheim text-left select-none text-white/90 whitespace-pre-line"
              style={{
                fontSize: vw(14),
                lineHeight: vw(18),
              }}
            >
              {privacyText}
            </p>
          </div>
        )}

        {/* Upload File Button */}
        <label
          className="flex items-center justify-center gap-2 cursor-pointer self-end transition-all duration-300 hover:opacity-100 hover:bg-white/20 hover:border-white"
          style={{
            width: vw(256),
            height: vw(58),
            border: "1px solid rgba(255, 255, 255, 0.46)",
            borderRadius: vw(33.5),
            opacity: 0.61,
            marginTop: vw(10),
          }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {/* Upload Icon */}
          <Upload
            className="text-white"
            style={{
              width: vw(25),
              height: vw(25),
            }}
          />
          <span
            className="font-anaheim font-semibold text-white"
            style={{ fontSize: vw(24) }}
          >
            {file ? file.name.substring(0, 10) + "..." : (getFieldConfig('file')?.label || (locale === 'zh' ? "上传文件" : "Upload File"))}
          </span>
        </label>

        {/* Status Messages */}
        {submitted && (
          <div
            className="text-green-400 font-anaheim mt-4 text-center w-full"
            style={{ fontSize: vw(18) }}
          >
            {formConfig?.successMessage || (locale === 'zh' ? "询盘发送成功！我们将尽快联系您。" : "Inquiry sent successfully! We will contact you soon.")}
          </div>
        )}
        {error && (
          <div
            className="text-red-400 font-anaheim mt-4 text-center w-full"
            style={{ fontSize: vw(18) }}
          >
            {error}
          </div>
        )}

        {/* Send Inquiry Button */}
        <button
          type="submit"
          disabled={isSubmitting || (!!privacyText && !privacyAccepted)}
          className={`flex items-center justify-center text-white font-anaheim font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-70 animate-pulse-scale whitespace-pre-line leading-tight px-4 py-2 ${
            !!privacyText && !privacyAccepted ? "grayscale opacity-80" : ""
          }`}
          style={{
            width: vw(486),
            minHeight: vw(83),
            height: "auto",
            backgroundColor: "#9C9032",
            borderRadius: vw(63),
            fontSize: vw(32),
            marginTop: vw(10),
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = "#C4B440";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(196, 180, 64, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#9C9032";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
          }}
        >
          {isSubmitting 
            ? (formConfig?.submittingText || (locale === 'zh' ? "发送中..." : "Sending...")) 
            : (formConfig?.submitButtonText || (locale === 'zh' ? "发送询盘" : "Send Inquiry"))}
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
