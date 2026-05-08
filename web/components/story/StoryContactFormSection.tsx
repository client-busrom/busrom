"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Turnstile } from "@/components/ui/turnstile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { HollowText } from "@/components/common/HollowText";
import { COUNTRIES } from "@/components/ui/PhoneInput";

const DESIGN_WIDTH = 1920;
const MOBILE_WIDTH = 390;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) =>
  `clamp(${px * 0.8}px, ${(px / MOBILE_WIDTH) * 100}vw, ${px * 1.5}px)`;
const DEFAULT_TEXTAREA_HEIGHT = 166;

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
}

interface FormConfigData {
  id: string;
  name: string;
  description?: string | Record<string, string>;
  fields: Record<string, FormField[]> | FormField[];
}

interface StoryContactFormSectionProps {
  data: {
    title: string;
    subtitle: string;
    description: string;
    locale: string;
    images: (MediaObject | null)[];
    formConfig?: {
      id?: string;
      data?: FormConfigData;
      privacyConsentText?: string;
      submitButtonText?: string;
      submittingText?: string;
    } | null;
  };
}

export function StoryContactFormSection({
  data,
}: StoryContactFormSectionProps) {
  const {
    title,
    subtitle,
    description,
    formConfig,
    images = [],
    locale = "en",
  } = data;

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const STORAGE_KEY = "busrom_privacy_consent";

  // Image Gallery State
  const validImages = images.filter(
    (img): img is MediaObject => img !== null && img !== undefined,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  // Slider variants for circular gallery
  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
      opacity: 0,
    }),
  };

  // Auto interval switching
  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [validImages.length, currentImageIndex]);

  const handlePrevImage = () => {
    if (validImages.length <= 1) return;
    setDirection(-1);
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : validImages.length - 1,
    );
  };

  const handleNextImage = () => {
    if (validImages.length <= 1) return;
    setDirection(1);
    setCurrentImageIndex((prev) =>
      prev < validImages.length - 1 ? prev + 1 : 0,
    );
  };

  // Turnstile & Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Atomic Phone Input State
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<[string, string, string]>(
    COUNTRIES.find(c => c[1].toLowerCase() === (locale === "zh" ? "cn" : "us")) || COUNTRIES[0]
  );
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  // Close selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countrySelectorRef.current && !countrySelectorRef.current.contains(event.target as Node)) {
        setOpenCountrySelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [extraHeight, setExtraHeight] = useState(0);
  const [privacyHeight, setPrivacyHeight] = useState(0);
  const privacyRef = useRef<HTMLDivElement>(null);

  const getLocalizedString = (value: any, loc: string) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[loc] || value["en"] || Object.values(value)[0] || null;
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent === "true") {
        setIsGloballyAccepted(true);
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
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
  }, []);

  const mergedConfig = typeof formConfig === "string" ? { id: formConfig } : formConfig || {};

  const effectivePrivacyText = getLocalizedString((mergedConfig as any)?.privacyConsentText || (mergedConfig as any)?.data?.privacyConsentText, locale || "en");

  useEffect(() => {
    if (!effectivePrivacyText) {
      setPrivacyHeight(0);
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // mt-2 is roughly 8px, adding it to the tracked height
        setPrivacyHeight(entry.contentRect.height + 8);
      }
    });
    if (privacyRef.current) {
      observer.observe(privacyRef.current);
    }
    return () => observer.disconnect();
  }, [effectivePrivacyText]);

  const effectiveDescription = getLocalizedString(((mergedConfig as any)?.data || mergedConfig)?.description || (mergedConfig as any)?.description, locale || "en") || description;

  const effectiveSubmitText = getLocalizedString((mergedConfig as any)?.submitButtonText || (mergedConfig as any)?.data?.submitButtonText, locale || "en") || (locale === "zh" ? "提交咨询" : "Send Inquiry");

  const effectiveSubmittingText = getLocalizedString((mergedConfig as any)?.submittingText || (mergedConfig as any)?.data?.submittingText, locale || "en") || (locale === "zh" ? "发送中..." : "Sending...");

  const effectiveSuccessMessage = getLocalizedString((mergedConfig as any)?.successMessage || (mergedConfig as any)?.data?.successMessage, locale || "en") || (locale === "zh" ? "提交成功，我们会尽快联系您！" : "Thank you for reaching out. We will get back to you soon!");

  const effectiveErrorMessage = getLocalizedString((mergedConfig as any)?.errorNetworkMessage || (mergedConfig as any)?.data?.errorNetworkMessage, locale || "en") || (locale === "zh" ? "提交失败，请重试。" : "Failed to submit form. Please try again.");

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const siteData = await res.json();
          if (siteData.turnstileSiteKey) {
            setTurnstileSiteKey(siteData.turnstileSiteKey);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Turnstile site key:", error);
      }
    };
    fetchSiteKey();
  }, []);

  const configData = (mergedConfig?.data || mergedConfig) as any;
  const fields =
    configData?.fields?.[locale] ||
    configData?.fields?.["en"] ||
    (Array.isArray(configData?.fields) ? configData.fields : []);
  const sortedFields = [...fields].sort(
    (a: FormField, b: FormField) => (a.order || 0) - (b.order || 0),
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
        const fileFormData = new FormData();
        fileFormData.append("file", uploadedFile);
        fileFormData.append("formConfigId", formId);
        fileFormData.append("fieldName", "attachment");

        // Wait... standard file upload takes fieldName "attachment" ...
        const uploadRes = await fetch("/api/form-file-upload", {
          method: "POST",
          body: fileFormData,
        });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          fileUrl = uploadResult.fileUrl;
        }
      }

      const submissionData = {
        formId: formId,
        formName:
          (mergedConfig as any)?.name || configData?.name || "contact-form",
        data: {
          ...formData,
          ...(fileUrl ? { attachment: fileUrl } : {}),
        },
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
        throw new Error(error.message || effectiveErrorMessage);
      }

      // GTM Tracking
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "form_submit_success",
          form_id:
            (mergedConfig as any)?.name || configData?.name || "contact-form",
          form_name:
            (mergedConfig as any)?.name || configData?.name || "contact-form",
        });
      }

      setSubmitStatus("success");
      setFormData({});
      setFileName("");
      setUploadedFile(null);
      setTurnstileToken(null);
      setTurnstileKey((prev) => prev + 1);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : effectiveErrorMessage,
      );
      setTurnstileToken(null);
      setTurnstileKey((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLines = title.split("\n");

  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden flex flex-col items-center"
      style={
        isMobile
          ? {
              background:
                "linear-gradient(to bottom, #756f3f 0%, #dbd076 180%)",
              paddingTop: mvw(40),
              paddingBottom: mvw(80),
            }
          : {
              background:
                "linear-gradient(to bottom, #756f3f 0%, #dbd076 180%)",
              height: vw(1180),
            }
      }
    >
      <div
        className={cn(
          "relative z-10 w-full mx-auto",
          isMobile ? "flex flex-col" : "h-full max-w-[1920px]",
        )}
      >
        {/* Hero Section: Layered Title and Image for Mobile */}
        <div
          className={cn(
            "relative w-full",
            isMobile
              ? "flex flex-col items-center justify-center min-h-[80vw] mb-4"
              : "contents",
          )}
        >
          {/* 1. Image Gallery (The Layer Below) */}
          <div
            className={cn(
              "flex items-center justify-center",
              isMobile ? "absolute inset-0 z-0 opacity-40" : "absolute",
            )}
            style={
              !isMobile
                ? {
                    left: vw(521),
                    top: vw(167),
                    width: vw(751),
                    height: vw(643),
                  }
                : { width: "100%", height: "100%" }
            }
          >
            {!isMobile && (
              <div
                className="absolute rounded-full"
                style={{
                  left: 0,
                  top: 0,
                  width: vw(291),
                  height: vw(291),
                  backgroundColor: "#FFE85699",
                  mixBlendMode: "multiply",
                  zIndex: 2,
                }}
              />
            )}

            <div className="relative flex items-center justify-center w-full h-full">
              {/* Image Controls (Now inside the gallery container) */}
              {validImages.length > 1 && (
                <div
                  className={cn(
                    "absolute z-30 flex w-full pointer-events-none",
                    isMobile ? "px-4" : "contents",
                  )}
                >
                  <button
                    onClick={handlePrevImage}
                    className={cn(
                      "hover:scale-110 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto",
                      !isMobile && "absolute",
                    )}
                    style={
                      isMobile
                        ? {
                            width: mvw(50),
                            height: mvw(50),
                            transform: "rotate(-45deg)",
                          }
                        : {
                            left: vw(-190),
                            top: vw(50),
                            width: vw(76.56),
                            height: vw(76.56),
                            transform: "rotate(-45deg)",
                          }
                    }
                    aria-label="Previous Image"
                  >
                    <svg
                      width={isMobile ? "50%" : "100%"}
                      height={isMobile ? "50%" : "100%"}
                      viewBox="0 0 77 77"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#ffffff"
                        d="M75.17835 76.56344c0.27404 0.00005 0.54193-0.08118 0.7698-0.23341 0.22787-0.15223 0.40548-0.36861 0.51035-0.62179 0.10487-0.25317 0.13231-0.53177 0.07884-0.80054-0.05347-0.26877-0.18546-0.51564-0.37925-0.7094l-71.42781-71.4275 10.50912 0c0.36743 0 0.71981-0.14596 0.97963-0.40577 0.25981-0.25981 0.40577-0.61219 0.40577-0.97963 0-0.36743-0.14596-0.71981-0.40577-0.97963-0.25981-0.25981-0.6122-0.40577-0.97963-0.40577l-13.86223 0c-0.36458 0.00216-0.71362 0.14795-0.97142 0.40575-0.2578 0.2578-0.40359 0.60684-0.40575 0.97142l0 13.86223c0 0.36743 0.14596 0.71981 0.40577 0.97963 0.25981 0.25981 0.61219 0.40577 0.97963 0.40577 0.36743 0 0.71981-0.14596 0.97963-0.40577 0.25981-0.25981 0.40577-0.6122 0.40577-0.97963l0-10.50956 71.42782 71.42794c0.12852 0.12883 0.28124 0.231 0.44937 0.30061 0.16814 0.06962 0.34838 0.10532 0.53036 0.10505z"
                      />
                    </svg>
                  </button>
                  <div className={isMobile ? "flex-grow" : ""} />
                  <button
                    onClick={handleNextImage}
                    className={cn(
                      "hover:scale-110 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto",
                      !isMobile && "absolute",
                    )}
                    style={
                      isMobile
                        ? {
                            width: mvw(50),
                            height: mvw(50),
                            transform: "rotate(135deg)",
                          }
                        : {
                            left: vw(716),
                            top: vw(672),
                            width: vw(76.56),
                            height: vw(76.56),
                            transform: "rotate(135deg)",
                          }
                    }
                    aria-label="Next Image"
                  >
                    <svg
                      width={isMobile ? "50%" : "100%"}
                      height={isMobile ? "50%" : "100%"}
                      viewBox="0 0 77 77"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill={isMobile ? "#ffffff" : "#d3c976"}
                        d="M75.17835 76.56344c0.27404 0.00005 0.54193-0.08118 0.7698-0.23341 0.22787-0.15223 0.40548-0.36861 0.51035-0.62179 0.10487-0.25317 0.13231-0.53177 0.07884-0.80054-0.05347-0.26877-0.18546-0.51564-0.37925-0.7094l-71.42781-71.4275 10.50912 0c0.36743 0 0.71981-0.14596 0.97963-0.40577 0.25981-0.25981 0.40577-0.61219 0.40577-0.97963 0-0.36743-0.14596-0.71981-0.40577-0.97963-0.25981-0.25981-0.6122-0.40577-0.97963-0.40577l-13.86223 0c-0.36458 0.00216-0.71362 0.14795-0.97142 0.40575-0.2578 0.2578-0.40359 0.60684-0.40575 0.97142l0 13.86223c0 0.36743 0.14596 0.71981 0.40577 0.97963 0.25981 0.25981 0.61219 0.40577 0.97963 0.40577 0.36743 0 0.71981-0.14596 0.97963-0.40577 0.25981-0.25981 0.40577-0.6122 0.40577-0.97963l0-10.50956 71.42782 71.42794c0.12852 0.12883 0.28124 0.231 0.44937 0.30061 0.16814 0.06962 0.34838 0.10532 0.53036 0.10505z"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: isMobile ? mvw(340) : vw(643),
                  height: isMobile ? mvw(340) : vw(643),
                  zIndex: 1,
                }}
              >
                <AnimatePresence initial={false} custom={direction}>
                  {validImages[currentImageIndex] && (
                    <motion.div
                      key={currentImageIndex}
                      custom={direction}
                      variants={sliderVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute w-full h-full"
                    >
                      <OptimizedImage
                        image={validImages[currentImageIndex].url}
                        alt={
                          validImages[currentImageIndex].alt || "Gallery Image"
                        }
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 2. Content Area (Title, Subtitle - The Layer Above) */}
          <div
            className={cn(
              isMobile
                ? "relative z-10 flex flex-col text-center px-4"
                : "absolute",
            )}
            style={
              !isMobile
                ? { left: vw(153), top: vw(315), zIndex: 10, width: "100%" }
                : { maxWidth: "640px", width: "100%" }
            }
          >
            {subtitle && (
              <div
                className={cn(isMobile ? "mb-2" : "absolute")}
                style={!isMobile ? { left: vw(259), top: vw(-120) } : {}}
              >
                <h3
                  className="font-josefin-sans font-medium text-white"
                  style={{
                    fontSize: isMobile ? mvw(24) : vw(40),
                    lineHeight: 1.2,
                  }}
                >
                  {subtitle}
                </h3>
              </div>
            )}

            <h2
              className={cn(
                "font-josefin-sans font-semibold flex flex-col",
                isMobile ? "" : "",
              )}
              style={{
                fontSize: isMobile ? mvw(64) : vw(128),
                lineHeight: 0.99,
              }}
            >
              {titleLines[0] && (
                <HollowText
                  strokeColor="#ffffff"
                  strokeWidth={isMobile ? 1 : 2}
                >
                  {titleLines[0]}
                </HollowText>
              )}
              {titleLines[1] && (
                <span className="text-white">{titleLines[1]}</span>
              )}
            </h2>
          </div>
        </div>

        {/* Description (Stays Below the Hero area on mobile) */}
        {isMobile && effectiveDescription && (
          <div className="w-full max-w-[640px] mx-auto text-center px-4 mb-8">
            <p
              className="font-josefin-sans font-medium"
              style={{ fontSize: mvw(16), lineHeight: 1.4, color: "#fff287" }}
            >
              {effectiveDescription}
            </p>
          </div>
        )}

        {!isMobile && (
          <p
            className="absolute font-josefin-sans font-medium"
            style={{
              left: vw(155),
              top: vw(612),
              width: vw(444),
              fontSize: vw(20),
              lineHeight: 1.35,
              color: "#fff287",
              zIndex: 10,
            }}
          >
            {effectiveDescription}
          </p>
        )}

        {/* 3. Right Form Area */}
        <div
          className={cn(isMobile ? "w-full max-w-[640px] mx-auto" : "absolute")}
          style={
            !isMobile
              ? { left: vw(1359), top: vw(206), width: vw(366), zIndex: 20 }
              : {}
          }
        >
          <form
            id={
              (mergedConfig as any)?.name || configData?.name || "contact-form"
            }
            onSubmit={handleSubmit}
            className="flex flex-col"
            style={{ gap: isMobile ? mvw(12) : vw(20) }}
          >
            {sortedFields.length > 0 ? (
              <>
                {sortedFields.map((field) => {
                  const isTextarea =
                    field.fieldType === "textarea" ||
                    field.fieldName === "message";
                  if (isTextarea) {
                    return (
                        <textarea
                          key={field.fieldName}
                          ref={textareaRef}
                          placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                          value={formData[field.fieldName] || ""}
                          onChange={(e) =>
                            handleInputChange(field.fieldName, e.target.value)
                          }
                          spellCheck="false"
                          className="font-anaheim font-semibold text-white placeholder:text-white/50 resize-none outline-none transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                        style={{
                          width: "100%",
                          minHeight: isMobile ? mvw(120) : vw(103),
                          maxHeight: isMobile ? mvw(300) : vw(250),
                          borderRadius: isMobile ? mvw(12) : vw(15),
                          backgroundColor: "#746d37",
                          border: "1px solid rgba(255, 255, 255, 0.34)",
                          paddingLeft: isMobile ? mvw(16) : vw(23),
                          paddingRight: isMobile ? mvw(16) : vw(23),
                          paddingTop: isMobile ? mvw(16) : vw(20),
                          fontSize: isMobile ? mvw(16) : vw(16),
                          lineHeight: 1.5,
                        }}
                        required={field.required}
                        disabled={isSubmitting}
                      />
                    );
                  }

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
                    const currentValue = formData[field.fieldName] || "";
                    const dialCode = selectedCountry[2];
                    const pureNumber = currentValue.startsWith(`+${dialCode}`)
                      ? currentValue.slice(dialCode.length + 1)
                      : currentValue;

                    const handlePhoneChange = (newPureNumber: string) => {
                      const digits = newPureNumber.replace(/[^\d]/g, "");
                      const fullNumber = `+${selectedCountry[2]}${digits}`;
                      handleInputChange(field.fieldName, fullNumber);
                    };

                    return (
                      <div
                        key={field.fieldName}
                        className="relative w-full"
                        ref={countrySelectorRef}
                      >
                        <div
                          className="flex items-stretch overflow-visible w-full transition-colors"
                          style={{
                            height: isMobile ? mvw(50) : vw(63),
                            borderRadius: isMobile ? mvw(12) : vw(15),
                            backgroundColor: "#746d37",
                            border: "1px solid rgba(255, 255, 255, 0.34)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCountrySelector(!openCountrySelector);
                            }}
                            className="flex items-center gap-2 px-3 hover:bg-white/5 transition-colors border-r border-white/10 flex-shrink-0"
                            disabled={isSubmitting}
                          >
                            <div
                              style={{
                                width: isMobile ? mvw(24) : vw(32),
                                height: isMobile ? mvw(16) : vw(20),
                              }}
                              className="flex-shrink-0"
                            >
                              <CountryFlag
                                countryCode={selectedCountry[1]}
                                className="w-full h-full rounded-[2px] object-cover"
                              />
                            </div>
                            <span
                              className="text-white font-anaheim font-semibold"
                              style={{ fontSize: isMobile ? mvw(16) : vw(16) }}
                            >
                              +{selectedCountry[2]}
                            </span>
                            <ChevronDown
                              className={cn(
                                "text-white/50 transition-transform",
                                isMobile ? "w-4 h-4" : "w-5 h-5",
                                openCountrySelector && "rotate-180"
                              )}
                            />
                          </button>

                          <input
                            type="tel"
                            placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                            value={pureNumber}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            required={field.required}
                            disabled={isSubmitting}
                            className="flex-1 min-w-0 bg-transparent px-4 text-white placeholder:text-white/50 font-anaheim font-semibold outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#746d37_inset!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                            style={{ fontSize: isMobile ? mvw(16) : vw(16) }}
                          />
                        </div>

                        <AnimatePresence>
                          {openCountrySelector && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute z-[100] left-0 mt-2"
                              style={{ width: isMobile ? "280px" : "300px" }}
                            >
                              <CountrySelectorList
                                onSelect={(country) => {
                                  setSelectedCountry(country);
                                  const newFullNumber = `+${country[2]}${pureNumber.replace(/[^\d]/g, "")}`;
                                  handleInputChange(field.fieldName, newFullNumber);
                                  setOpenCountrySelector(false);
                                }}
                                onClose={() => setOpenCountrySelector(false)}
                                className={cn(
                                  "shadow-2xl !bg-[#4b4724] border border-white/20",
                                  isMobile ? "!rounded-xl" : "!rounded-[15px]"
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          className="font-anaheim font-semibold appearance-none bg-[#746d37] text-white w-full placeholder:text-white/50 focus:outline-none transition-colors"
                          style={{
                            height: isMobile ? mvw(50) : vw(63),
                            borderRadius: isMobile ? mvw(12) : vw(15),
                            border: "1px solid rgba(255, 255, 255, 0.34)",
                            paddingLeft: isMobile ? mvw(16) : vw(23),
                            paddingRight: isMobile ? mvw(32) : vw(40),
                            fontSize: isMobile ? mvw(16) : vw(16),
                          }}
                        >
                          <option value="" className="text-black">
                            Select Country/Region...
                          </option>
                          {COUNTRIES.map(([name, iso2, dialCode]) => (
                            <option
                              key={iso2}
                              value={name}
                              className="text-black"
                            >
                              {name} (+{dialCode})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/50">
                          <ChevronDown size={isMobile ? 18 : 20} />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <input
                      key={field.fieldName}
                      type={field.fieldType}
                      placeholder={`${field.placeholder?.trim() || field.label}${field.required ? " *" : ""}`}
                      value={formData[field.fieldName] || ""}
                      onChange={(e) =>
                        handleInputChange(field.fieldName, e.target.value)
                      }
                      spellCheck="false"
                      className="font-anaheim font-semibold text-white placeholder:text-white/50 outline-none transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                      style={{
                        width: "100%",
                        height: isMobile ? mvw(50) : vw(63),
                        borderRadius: isMobile ? mvw(12) : vw(15),
                        backgroundColor: "#746d37",
                        border: "1px solid rgba(255, 255, 255, 0.34)",
                        paddingLeft: isMobile ? mvw(16) : vw(23),
                        fontSize: isMobile ? mvw(16) : vw(16),
                      }}
                      required={field.required}
                      disabled={isSubmitting}
                    />
                  );
                })}
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  spellCheck="false"
                  className="font-anaheim font-semibold text-white placeholder:text-white/50 outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill:active]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  style={{
                    width: "100%",
                    height: isMobile ? mvw(50) : vw(63),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    backgroundColor: "#746d37",
                    border: "1px solid rgba(255, 255, 255, 0.34)",
                    paddingLeft: isMobile ? mvw(16) : vw(23),
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  required
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  spellCheck="false"
                  className="font-anaheim font-semibold text-white placeholder:text-white/50 outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  style={{
                    width: "100%",
                    height: isMobile ? mvw(50) : vw(63),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    backgroundColor: "#746d37",
                    border: "1px solid rgba(255, 255, 255, 0.34)",
                    paddingLeft: isMobile ? mvw(16) : vw(23),
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                />
                <div className="dynamic-phone-input w-full">
                  <div
                    className="flex items-stretch overflow-visible transition-colors"
                    style={{
                      height: isMobile ? mvw(50) : vw(63),
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      backgroundColor: "#746d37",
                      border: "1px solid rgba(255, 255, 255, 0.34)",
                    }}
                  >
                    <div
                      className="relative h-full flex-shrink-0"
                      ref={countrySelectorRef}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCountrySelector(!openCountrySelector);
                        }}
                        disabled={isSubmitting}
                        className="h-full flex items-center justify-center border-r border-white/20 transition-all hover:bg-white/5"
                        style={{
                          paddingLeft: isMobile ? mvw(12) : vw(16),
                          paddingRight: isMobile ? mvw(6) : vw(8),
                        }}
                      >
                        <div
                          style={{
                            width: isMobile ? mvw(24) : vw(32),
                            height: isMobile ? mvw(16) : vw(20),
                          }}
                          className="flex-shrink-0"
                        >
                          <CountryFlag
                            countryCode={selectedCountry[1]}
                            className="w-full h-full rounded-[2px] object-cover"
                          />
                        </div>
                        <span
                          className="font-anaheim font-semibold text-white"
                          style={{
                            fontSize: isMobile ? mvw(16) : vw(16),
                            marginLeft: isMobile ? mvw(6) : vw(8),
                          }}
                        >
                          +{selectedCountry[2]}
                        </span>
                        <ChevronDown
                          className={cn(
                            "transition-transform text-white/50",
                            isMobile ? "w-4 h-4" : "w-5 h-5",
                            openCountrySelector && "rotate-180",
                          )}
                          style={{ marginLeft: isMobile ? mvw(4) : vw(4) }}
                        />
                      </button>
                      <AnimatePresence>
                        {openCountrySelector && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-[100] left-0 mt-2"
                            style={{ width: isMobile ? "280px" : "300px" }}
                          >
                            <CountrySelectorList
                              onSelect={(country) => {
                                setSelectedCountry(country);
                                setOpenCountrySelector(false);
                              }}
                              onClose={() => setOpenCountrySelector(false)}
                              className={cn(
                                "shadow-2xl !bg-[#4b4724] border border-white/20",
                                isMobile ? "!rounded-xl" : "!rounded-[15px]"
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <input
                      type="tel"
                      placeholder="Your WhatsApp"
                      value={formData.whatsapp || ""}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1 min-w-0 bg-transparent outline-none font-anaheim font-semibold text-white placeholder:text-white/50 [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#746d37_inset!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                      style={{
                        fontSize: isMobile ? mvw(16) : vw(16),
                        paddingLeft: isMobile ? mvw(12) : vw(15),
                      }}
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Message"
                  rows={4}
                  value={formData.message || ""}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  spellCheck="false"
                  className="font-anaheim font-semibold text-white placeholder:text-white/50 resize-none outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:white!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  style={{
                    width: "100%",
                    minHeight: isMobile ? mvw(120) : vw(103),
                    borderRadius: isMobile ? mvw(12) : vw(15),
                    backgroundColor: "#746d37",
                    border: "1px solid rgba(255, 255, 255, 0.34)",
                    paddingLeft: isMobile ? mvw(16) : vw(23),
                    paddingTop: isMobile ? mvw(16) : vw(20),
                    fontSize: isMobile ? mvw(16) : vw(16),
                  }}
                />
              </>
            )}

            {/* Turnstile */}
            {turnstileSiteKey && (
              <div style={{ marginTop: isMobile ? mvw(8) : vw(5) }}>
                <Turnstile
                  key={turnstileKey}
                  siteKey={turnstileSiteKey}
                  onVerify={handleTurnstileSuccess}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  theme="dark"
                  size="compact"
                  language={locale === "zh" ? "zh-CN" : locale}
                />
              </div>
            )}

            {/* Privacy Checkbox */}
            {effectivePrivacyText && (
              <div
                ref={privacyRef}
                className="flex items-start gap-2 mt-2 cursor-pointer"
                onClick={() => handlePrivacyToggle(!privacyAccepted)}
              >
                <div
                  className={cn(
                    "mt-1 flex-shrink-0 rounded border flex items-center justify-center transition-all",
                    privacyAccepted
                      ? "bg-[#564d03] border-[#564d03]"
                      : "border-white/30 bg-transparent",
                  )}
                  style={{
                    width: isMobile ? mvw(16) : 16,
                    height: isMobile ? mvw(16) : 16,
                  }}
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
                    "leading-relaxed whitespace-pre-line select-none flex-1 transition-all duration-300",
                    privacyAccepted ? "text-white opacity-100" : "text-white/70"
                  )}
                  style={{ fontSize: isMobile ? mvw(14) : "14px" }}
                >
                  {effectivePrivacyText}
                </p>
              </div>
            )}

            {submitStatus === "success" && (
              <p className="text-green-400 text-sm mt-2">
                {effectiveSuccessMessage}
              </p>
            )}

            {/* Submit Button */}
            <motion.button
              style={{
                transformOrigin: "center",
                marginTop: isMobile ? mvw(20) : vw(23),
                width: "100%",
                height: isMobile ? mvw(60) : vw(83),
                borderRadius: isMobile ? mvw(30) : vw(63),
                fontSize: isMobile ? mvw(20) : vw(32),
                lineHeight: 1.2,
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
              type="submit"
              disabled={
                isSubmitting || (!!effectivePrivacyText && !privacyAccepted)
              }
              className="w-full bg-[#564d03] text-white font-anaheim font-semibold text-center transition-colors duration-300 hover:bg-black disabled:opacity-50"
            >
              {isSubmitting
                ? effectiveSubmittingText
                : effectiveSubmitText}
            </motion.button>

            {/* Error Status */}
            {submitStatus === "error" && (
              <div
                className="text-red-300 text-center mt-2 font-anaheim"
                style={{ fontSize: isMobile ? mvw(12) : "14px" }}
              >
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
