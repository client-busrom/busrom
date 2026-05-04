"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { ChevronDown } from "lucide-react";
import { uploadFileWithProgress } from "@/lib/upload";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
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
  const [formHeight, setFormHeight] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const STORAGE_KEY = "busrom_privacy_consent";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFormHeight(entry.contentRect.height);
      }
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
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
        height: `calc(${vw(91)} + ${formHeight}px + ${vw(100)})`,
        background: "linear-gradient(118.81deg, #9A9357 0%, #373100 100%)",
      }}
    >
      <div className={cn(
        "relative w-full mx-auto",
        isMobile ? "flex flex-col px-[5%]" : "max-w-[1920px] h-full"
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
          style={!isMobile ? { marginLeft: vw(1289), marginTop: vw(91), width: vw(486) } : {}}
        >
          <form
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
                    className="dynamic-phone-input"
                    style={{ width: "100%", height: isMobile ? mvw(50) : vw(63) }}
                  >
                    <PhoneInput
                      value={formData[field.fieldName] || ""}
                      onChange={(v) => handleInputChange(field.fieldName, v)}
                      placeholder={`${field.label}${field.required ? " *" : ""}`}
                      containerClassName="!h-full !w-full"
                      style={{ height: "100%", borderRadius: isMobile ? mvw(12) : vw(15) }}
                      className={cn(
                        "!bg-[#746D37] border border-white/34 !h-full",
                      )}
                      buttonClassName="!bg-transparent hover:!bg-white/10 !h-full !border-r !border-white/20"
                      dialCodeClassName="!text-white !font-anaheim !font-semibold"
                      inputClassName="!bg-transparent !text-white placeholder:!text-white/50 !font-anaheim !font-semibold !text-lg !px-6 [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                    />
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
                        required={field.required}
                        value={formData[field.fieldName] || ""}
                        onChange={(e) =>
                          handleInputChange(field.fieldName, e.target.value)
                        }
                        className="w-full appearance-none bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 focus:outline-none"
                    style={{
                      height: isMobile ? mvw(50) : vw(63),
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      paddingLeft: isMobile ? mvw(16) : vw(24),
                      fontSize: mvw(16),
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
                  key={field.fieldName}
                  type={field.fieldType === "email" ? "email" : "text"}
                  placeholder={`${field.label}${field.required ? " *" : ""}`}
                  spellCheck="false"
                  className="w-full bg-[#746D37] border border-white/34 rounded-2xl px-6 h-14 text-white focus:outline-none focus:border-white/30 transition-all font-anaheim font-semibold text-lg placeholder:text-white/50 [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  style={{
                    height: isMobile ? mvw(50) : vw(63),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    paddingLeft: isMobile ? mvw(16) : vw(24),
                    fontSize: mvw(16),
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
                  key={field.fieldName}
                  placeholder={`${field.label}${field.required ? " *" : ""}`}
                  value={formData[field.fieldName] || ""}
                  onChange={(e) =>
                    handleInputChange(field.fieldName, e.target.value)
                  }
                  spellCheck="false"
                  className="bg-[#746D37] border border-white/34 text-white font-[family-name:var(--font-anaheim)] font-semibold placeholder:text-white/50 resize-none focus:outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  style={{
                    height: isMobile ? mvw(120) : vw(127),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    paddingLeft: isMobile ? mvw(16) : vw(24),
                    paddingTop: isMobile ? mvw(12) : vw(14),
                    fontSize: mvw(16),
                  }}
                  required={field.required}
                />
              ))}

            {/* Upload */}
            <div className={cn("flex pr-4", isMobile ? "justify-center" : "justify-end")}>
              <label
                className="flex items-center cursor-pointer border border-[#756F3F] rounded-full transition-colors hover:bg-black/10"
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
                <svg width={isMobile ? mvw(20) : vw(20)} height={isMobile ? mvw(20) : vw(20)} viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.9565 11.2384C21.8485 6.45279 17.5857 3.1 12.6316 3.1C8.61842 3.1 5.21053 5.30526 3.42105 8.71579C1.48684 10.7026 0 13.5237 0 16.6316C0 22.8211 5.04737 27.9 11.3158 27.9H22.1184C26.9737 27.9 31 23.9526 31 19.1842C31 14.7342 27.5316 11.5147 22.9565 11.2384ZM12.6316 23.1V16.6316H7.73684L14.2632 8.71579L20.7895 16.6316H15.8947V23.1H12.6316Z" fill="#756F3F" />
                </svg>
                <span
                  className="text-[#756F3F] font-anaheim font-semibold ml-2"
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
                  className="leading-relaxed text-white/70 select-none text-left whitespace-pre-line"
                  style={{ fontSize: isMobile ? mvw(12) : "12px" }}
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
                height: isMobile ? mvw(60) : vw(83),
                borderRadius: isMobile ? mvw(30) : vw(63),
                fontSize: isMobile ? mvw(20) : vw(32),
                marginTop: isMobile ? mvw(10) : 0
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
