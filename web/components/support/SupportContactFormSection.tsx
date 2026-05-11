"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { CUSTOM_ICONS } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { COUNTRIES } from "@/components/ui/PhoneInput";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ChevronDown } from "lucide-react";
import { uploadFileWithProgress } from "@/lib/upload";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`;
const MOBILE_WIDTH = 390;
const mvw = (px: number) => `clamp(${px * 0.8}px, ${(px / MOBILE_WIDTH) * 100}vw, ${px * 1.5}px)`;

interface MediaObject {
  id: string;
  url: string;
  alt?: string;
}

interface FormField {
  fieldName: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: any[];
}

interface SupportContactFormSectionProps {
  title?: string;
  description?: string;
  images?: (MediaObject | null)[];
  formConfig?: any;
  locale?: string;
}

export function SupportContactFormSection({
  title = "Request Technical Marketing Support",
  description = "Please complete the form for your request support. Providing detailed information helps us assist you efficiently and our support team will contact you within 24 business hours.",
  images = [],
  formConfig,
  locale = "en",
}: SupportContactFormSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const STORAGE_KEY = "busrom_privacy_consent";

  const [isMobile, setIsMobile] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c[1] === "US") || COUNTRIES[0],
  );
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  const [fetchedFormConfig, setFetchedFormConfig] = useState<any>(null);

  // Sync with global storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setPrivacyAccepted(true);
      }
    }
  }, []);

  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked);
    if (checked && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(new Event("storage"));
    }
  };

  const getLocalizedString = useCallback((value: any, locale: string) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[locale] || value["en"] || Object.values(value)[0] || null;
    }
    return null;
  }, []);

  // Fetch full config if needed
  useEffect(() => {
    const configId =
      typeof formConfig === "string" ? formConfig : formConfig?.id;
    if (!configId) return;

    const fetchFullConfig = async () => {
      try {
        const res = await fetch(
          `/api/form-configs/${configId}?locale=${locale}`,
        );
        if (res.ok) {
          const data = await res.json();
          setFetchedFormConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch full form config:", error);
      }
    };
    fetchFullConfig();
  }, [formConfig, locale]);

  const mergedConfig = useMemo(() => {
    const baseConfig =
      typeof formConfig === "string" ? { id: formConfig } : formConfig || {};
    return {
      ...baseConfig,
      ...fetchedFormConfig,
    };
  }, [formConfig, fetchedFormConfig]);

  const validImages = useMemo(() => {
    return images.filter((img): img is MediaObject => !!img?.url);
  }, [images]);

  // Image Carousel Logic
  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages.length]);



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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formId = typeof formConfig === "string" ? formConfig : formConfig?.id;
    if (!formId) {
      console.error("Missing formId");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload file if exists
      let fileUrl = "";
      if (uploadedFile) {
        setUploadProgress(0);
        try {
          const uploadResult = await uploadFileWithProgress({
            url: "/api/form-file-upload",
            file: uploadedFile,
            fieldName: "file",
            additionalData: {
              formConfigId: formId,
              fieldName: "attachment",
            },
            onProgress: (event) => {
              setUploadProgress(event.percent);
            },
          });
          fileUrl = uploadResult.fileUrl;
        } catch (e) {
          console.error("FileUpload error:", e);
          throw new Error("Failed to upload file. Please try again.");
        } finally {
          setUploadProgress(0);
        }
      }

      // 2. Submit formal data
      const submissionData = {
        formId,
        formName:
          mergedConfig?.name || formConfig?.name || "Support Contact Form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
        locale,
        sourcePage: typeof window !== "undefined" ? window.location.href : "",
        userLocalTime: new Date().toString(),
      };

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error("Submission failed");

      // Push success event to Google Tag Manager
      if (typeof window !== "undefined") {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: "form_submit_success",
          form_id: mergedConfig?.name || formConfig?.name || "support-form",
          form_name: mergedConfig?.name || formConfig?.name || "Support Contact Form",
        });
      }

      setSubmitStatus("success");
      setFormData({});
      setFileName("");
      setUploadedFile(null);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = useMemo(() => {
    const rawFields = mergedConfig?.fields || mergedConfig?.data?.fields;
    if (!rawFields) return [];

    // Check if fields is an array or a localized object
    const f = Array.isArray(rawFields)
      ? rawFields
      : rawFields[locale] || rawFields["en"] || [];

    return [...f].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [mergedConfig, locale]);

  const submitText = useMemo(() => {
    if (isSubmitting)
      return getLocalizedString(mergedConfig?.submittingText, locale) || "...";
    if (submitStatus === "success")
      return getLocalizedString(mergedConfig?.successMessage, locale) || "OK";
    if (submitStatus === "error")
      return getLocalizedString(mergedConfig?.errorMessage, locale) || "Error";
    return (
      getLocalizedString(mergedConfig?.submitButtonText, locale) || "Submit"
    );
  }, [isSubmitting, submitStatus, mergedConfig, locale, getLocalizedString]);

  return (
    <section
      id="contact-form"
      className="relative w-full overflow-hidden"
      style={isMobile ? {
        paddingTop: mvw(60),
        paddingBottom: mvw(80),
        background: "linear-gradient(118.81deg, #9A9357 0%, #373100 100%)",
      } : {
        minHeight: vw(922),
        paddingTop: vw(100),
        paddingBottom: vw(100),
        background: "linear-gradient(118.81deg, #9A9357 0%, #373100 100%)",
      }}
    >
      <style jsx>{`
        .support-input-el:-webkit-autofill,
        .support-input-el:-webkit-autofill:hover,
        .support-input-el:-webkit-autofill:focus,
        .support-input-el:-webkit-autofill:active {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #746D37 inset !important;
          transition: background-color 5000s ease-in-out 0s;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
          caret-color: white !important;
          outline: none !important;
        }
        .support-input-el:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .support-input-el {
          caret-color: white !important;
          font-size: ${isMobile ? mvw(16) : vw(16)} !important;
        }
        .support-phone-prefix {
          color: #FFFFFF !important;
          font-size: ${isMobile ? mvw(16) : vw(16)} !important;
        }
        .support-input-el::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.5) !important;
        }
        /* Restore scrollbars as requested */
        .support-upload-btn:hover {
          background-color: #756F3F !important;
        }
        .support-upload-btn:hover .upload-text,
        .support-upload-btn:hover .upload-icon {
          color: white !important;
          fill: white !important;
        }
      `}</style>
      <div className={cn(
        "relative w-full mx-auto",
        isMobile ? "flex flex-col px-[5%]" : "max-w-[1920px]"
      )}>
        {/* Decorative / Text Area */}
        <div className={cn(
          isMobile ? "flex flex-col" : "absolute inset-0 pointer-events-none"
        )}>
          {/* Bottom Layer: Clip Path Background Carousel (lvler) */}
          <div
            className={cn(isMobile ? "relative mx-auto my-8" : "absolute")}
            style={isMobile ? {
              width: mvw(340),
              height: mvw(333),
            } : {
              left: vw(396),
              top: vw(75),
              width: vw(771.21),
              height: vw(755.38),
              zIndex: 1
            }}
          >
            {/* Definition of the clip path */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="lvler-clip" clipPathUnits="objectBoundingBox">
                  <path
                    d="M190.00684 0c106.99618 0 193.73428 169.09642 193.73437 377.6875 0 207.77667-86.06161 376.36719-192.48144 377.68066l-1.25293 0.00782 0-303.59082c-17.58527 172.34222-95.32349 302.42968-188.75391 303.583l-1.25293 0.00782 0-755.37598c93.98679 0 172.34215 130.47629 190.00684 303.58594l0-303.58594z m581.20312 755.37598l-1.25293-0.00782c-106.31604-1.31237-192.31293-169.57562-192.48047-377.07324l0 377.08106-1.25293-0.00782c-106.41983-1.31347-192.48242-169.90399-192.48242-377.68066 0.00009-208.59108 86.73917-377.6875 193.73535-377.6875l0 377.07617c0.16938-208.31003 86.84174-377.07617 193.7334-377.07617l0 755.37598z"
                    transform="scale(0.00129666 0.00132384)"
                  />
                </clipPath>
              </defs>
            </svg>

            {/* The actual carousel container clipped by CSS */}
            <div
              className="w-full h-full relative overflow-hidden"
              style={{ clipPath: "url(#lvler-clip)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="w-full h-full"
                >
                  {validImages[currentImageIndex] && (
                    <OptimizedImage
                      image={validImages[currentImageIndex]}
                      alt="Support"
                      className="w-full h-full object-cover"
                      width={isMobile ? 600 : 1000}
                      height={isMobile ? 600 : 1000}
                      priority
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Dark overlay gradient matching lvler fill */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(297.41deg, rgba(0,0,0,0) 32.3%, rgba(0,0,0,1) 100%)",
                }}
              />
            </div>
          </div>

          {/* Middle Layer: Diagonal Icons */}
          {!isMobile && (
            <>
              <div
                className="absolute z-[10]"
                style={{
                  left: vw(126),
                  top: vw(260),
                  width: vw(120),
                  height: vw(160),
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 24.576 49.088" fill="none" preserveAspectRatio="none">
                  <path d="M24.576 0c-3.02933 8.192-6.05867 16.384-9.088 24.576-2.98667 8.14933-5.99467 16.32-9.024 24.51201l-6.464 0c3.02933-8.192 6.03733-16.36267 9.024-24.51201 3.02933-8.192 6.05867-16.384 9.088-24.576l6.464 0z" fill="#FFE83C" />
                </svg>
              </div>
              <div
                className="absolute"
                style={{ left: vw(445), top: vw(620), width: vw(60), height: vw(90) }}
              >
                <svg width="100%" height="100%" viewBox="0 0 24.576 49.088" fill="none" preserveAspectRatio="none">
                  <path d="M24.576 0c-3.02933 8.192-6.05867 16.384-9.088 24.576-2.98667 8.14933-5.99467 16.32-9.024 24.51201l-6.464 0c3.02933-8.192 6.03733-16.36267 9.024-24.51201 3.02933-8.192 6.05867-16.384 9.088-24.576l6.464 0z" fill="#FFE83C" fillOpacity="0.65" />
                </svg>
              </div>
            </>
          )}

          {/* Top Layer: Text */}
          <div
            className={cn(isMobile ? "relative mb-8 mx-auto" : "absolute pointer-events-auto")}
            style={!isMobile ? { left: vw(153), top: vw(177), width: vw(863), zIndex: 10 } : { maxWidth: "640px" }}
          >
            <h2
              className={cn("text-white font-normal", isMobile ? "text-center" : "text-left")}
              style={{
                fontFamily: "var(--font-kaushan-script), cursive",
                fontSize: isMobile ? mvw(36) : vw(96),
                lineHeight: 1.2,
                textShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                whiteSpace: "pre-wrap",
                maxWidth: isMobile ? "100%" : "none",
              }}
            >
              {(() => {
                const rawTitle = (
                  getLocalizedString(mergedConfig?.displayName, locale) ||
                  title ||
                  ""
                ).replace(/\\n/g, "\n");
                return rawTitle.split("\n").map((line: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      paddingLeft: !isMobile && i > 0 ? "1em" : 0,
                    }}
                  >
                    {line.replace(/ /g, "\u00A0")}
                  </span>
                ));
              })()}
            </h2>
            <p
              className={cn("text-white normal-case", isMobile ? "text-center" : "text-left")}
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontSize: isMobile ? mvw(16) : vw(22.8),
                lineHeight: 1.31,
                marginTop: isMobile ? mvw(24) : vw(92),
                maxWidth: isMobile ? "100%" : vw(658),
                whiteSpace: "pre-wrap",
              }}
            >
              {(
                getLocalizedString(mergedConfig?.description, locale) ||
                description ||
                ""
              )
                .replace(/\\n/g, "\n")
                .replace(/ /g, "\u00A0")}
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div
          className={cn(isMobile ? "w-full max-w-[640px] mx-auto" : "relative z-20")}
          style={!isMobile ? { marginLeft: vw(1289), width: vw(486) } : {}}
        >
          <form
            id={mergedConfig?.name || formConfig?.name || "support-form"}
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col"
            style={{ gap: isMobile ? mvw(12) : vw(12) }}
          >
            {fields.map((field) => {
              const isTextarea =
                field.fieldType === "textarea" ||
                field.fieldName.toLowerCase().includes("message");
              const isFile =
                field.fieldType === "file" ||
                field.fieldName.toLowerCase().includes("file") ||
                field.fieldName.toLowerCase().includes("attachment");
              if (isTextarea || isFile) return null;

              const fName = field.fieldName.toLowerCase();
              const isPhone =
                fName.includes("phone") ||
                fName.includes("whatsapp") ||
                field.fieldType === "tel";

              if (isPhone) {
                return (
                  <div
                    key={field.fieldName}
                    className={cn(
                      "flex items-stretch bg-[#746D37] border border-white/34 relative",
                      openCountrySelector ? "z-20" : "z-0"
                    )}
                    ref={countrySelectorRef}
                    style={{ 
                      width: "100%", 
                      height: isMobile ? mvw(50) : vw(63),
                      borderRadius: isMobile ? mvw(12) : vw(15)
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
                      <span className="support-phone-prefix font-anaheim font-semibold">
                        +{selectedCountry[2]}
                      </span>
                    </button>

                      <input
                        id={field.fieldName}
                        name={field.fieldName}
                        type="tel"
                        autoComplete="tel"
                        value={
                          formData[field.fieldName]?.replace(
                            `+${selectedCountry[2]}`,
                            "",
                          ) || ""
                        }
                        onChange={(e) =>
                          handlePhoneChange(field.fieldName, e.target.value)
                        }
                        placeholder={`${field.label}${field.required ? " *" : ""}`}
                        disabled={isSubmitting}
                        className="support-input-el flex-1 bg-transparent px-4 outline-none font-anaheim font-semibold text-white placeholder:text-white/50"
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

              const isSelect = field.fieldType === "select";

              if (isSelect) {
                const label = getLocalizedString(field.label, locale);
                return (
                  <div key={field.fieldName} className="space-y-3">
                    {label && (
                      <label className="block text-white font-anaheim font-semibold text-[18px] ml-1">
                        {label}
                      </label>
                    )}
                    <div className="relative">
                      <select
                        id={field.fieldName}
                        name={field.fieldName}
                        required={field.required}
                        value={formData[field.fieldName] || ""}
                        onChange={(e) =>
                          handleInputChange(field.fieldName, e.target.value)
                        }
                        className="support-input-el w-full appearance-none bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 focus:outline-none"
                    style={{
                      height: isMobile ? mvw(50) : vw(63),
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      paddingLeft: isMobile ? mvw(16) : vw(24),
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                      >
                        <option value="" disabled className="bg-[#746D37]">
                          {getLocalizedString(
                            field.placeholder || field.label,
                            locale,
                          ) || "Select..."}
                        </option>
                        {field.options?.map((opt: any) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-[#746D37]"
                          >
                            {getLocalizedString(opt.label, locale) || opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronDown className="text-white/50" size={20} />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                  <input
                    id={field.fieldName}
                    name={field.fieldName}
                    key={field.fieldName}
                    type={field.fieldType === "email" ? "email" : "text"}
                    autoComplete={field.fieldType === "email" ? "email" : field.fieldName.toLowerCase().includes("name") ? "name" : "on"}
                    placeholder={`${field.label}${field.required ? " *" : ""}`}
                    spellCheck="false"
                    className="support-input-el w-full bg-[#746D37] border border-white/34 px-6 text-white focus:outline-none font-anaheim font-semibold placeholder:text-white/50"
                    style={{
                      height: isMobile ? mvw(50) : vw(63),
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      paddingLeft: isMobile ? mvw(16) : vw(24),
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) =>
                      handleInputChange(field.fieldName, e.target.value)
                    }
                    required={field.required}
                  />
              );
            })}

            {fields
              .filter(
                (f) =>
                  f.fieldType === "textarea" ||
                  f.fieldName.toLowerCase().includes("message"),
              )
              .map((field) => (
                <textarea
                  id={field.fieldName}
                  name={field.fieldName}
                  key={field.fieldName}
                  placeholder={`${field.label}${field.required ? " *" : ""}`}
                  value={formData[field.fieldName] || ""}
                  onChange={(e) =>
                    handleInputChange(field.fieldName, e.target.value)
                  }
                  spellCheck="false"
                  className="support-input-el bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 resize-none focus:outline-none overflow-y-auto"
                  style={{
                    height: isMobile ? mvw(120) : vw(127),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    paddingLeft: isMobile ? mvw(16) : vw(24),
                    paddingTop: isMobile ? mvw(12) : vw(14),
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                  required={field.required}
                />
              ))}

            {/* Upload */}
            <div className={cn("flex pr-4", isMobile ? "justify-center" : "justify-end")}>
              <label
                className="support-upload-btn flex items-center cursor-pointer border border-[#756F3F] rounded-full transition-all duration-300"
                style={{ 
                  height: isMobile ? mvw(50) : vw(59), 
                  borderRadius: isMobile ? mvw(25) : vw(33.5),
                  paddingLeft: isMobile ? mvw(20) : vw(24),
                  paddingRight: isMobile ? mvw(20) : vw(24),
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <svg
                  width={isMobile ? mvw(20) : vw(20)}
                  height={isMobile ? mvw(20) : vw(20)}
                  viewBox={CUSTOM_ICONS.upload.viewBox}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="upload-icon transition-colors duration-300"
                >
                  <path
                    d={CUSTOM_ICONS.upload.path}
                    fill="currentColor"
                  />
                </svg>
                <span
                  className="upload-text text-[#756F3F] font-anaheim font-semibold ml-2 transition-colors duration-300"
                  style={{ fontSize: isMobile ? mvw(18) : vw(24) }}
                >
                  {fileName ||
                    getLocalizedString(mergedConfig?.uploadFileText, locale) ||
                    "Upload File"}
                </span>
              </label>
            </div>

            {/* Privacy Consent */}
            {mergedConfig?.privacyConsentText && (
              <div
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => handlePrivacyToggle(!privacyAccepted)}
                style={{ marginTop: isMobile ? mvw(10) : 0 }}
              >
                <div
                  className={cn(
                    "mt-1 flex-shrink-0 rounded border flex items-center justify-center transition-all",
                    privacyAccepted
                      ? "bg-[#FFE83C] border-[#FFE83C]"
                      : "border-white/30 bg-transparent",
                  )}
                  style={{ 
                    width: isMobile ? mvw(18) : 20, 
                    height: isMobile ? mvw(18) : 20 
                  }}
                >
                  {privacyAccepted && (
                    <svg
                      className="w-3.5 h-3.5 text-[#373100]"
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
                    "leading-relaxed transition-opacity duration-300 select-none text-left whitespace-pre-line",
                    privacyAccepted ? "text-white opacity-100" : "text-white opacity-70"
                  )}
                  style={{ fontSize: isMobile ? mvw(12) : "14px" }}
                >
                  {getLocalizedString(mergedConfig.privacyConsentText, locale)}
                </p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              style={{ 
                transformOrigin: "center",
                minHeight: isMobile ? mvw(60) : vw(83),
                padding: isMobile ? `${mvw(10)} ${mvw(20)}` : `${vw(10)} ${vw(20)}`,
                borderRadius: isMobile ? mvw(30) : vw(63),
                fontSize: isMobile ? mvw(20) : vw(32),
                marginTop: isMobile ? mvw(10) : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              initial={{ rotate: 0, scale: 1 }}
              animate={isMobile ? {} : { rotate: [0, -3, 3, -3, 3, 0] }}
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
              disabled={
                isSubmitting ||
                (!!mergedConfig?.privacyConsentText && !privacyAccepted)
              }
              className="bg-[#564D03] text-white font-anaheim font-bold uppercase hover:bg-[#3d3602] disabled:opacity-50"
            >
              {isSubmitting
                ? uploadProgress > 0 && uploadProgress < 100
                  ? `Uploading ${uploadProgress}%...`
                  : submitText
                : submitText}
            </motion.button>
          </form>
        </div>
      </div>
    </section>
  );
}
