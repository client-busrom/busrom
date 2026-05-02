"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ChevronDown, Check } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface CtaSectionProps {
  title?: string;
  description?: string;
  image?: any;
  formConfig?: any;
  locale?: string;
}

/**
 * Premium Custom Dropdown Component
 * Enhanced with data-lenis-prevent and event propagation fixes for smooth scrolling compatibility.
 */
function CustomDropdown({ label, options, placeholder, value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fix Lenis scroll conflict
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isOpen) return;

    const stopPropagation = (e: any) => e.stopPropagation();

    el.addEventListener("wheel", stopPropagation, { passive: false });
    el.addEventListener("touchmove", stopPropagation, { passive: false });

    return () => {
      el.removeEventListener("wheel", stopPropagation);
      el.removeEventListener("touchmove", stopPropagation);
    };
  }, [isOpen]);

  const selectedOption = options?.find((opt: any) => opt.value === value);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-white text-[23px] font-semibold">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[63px] bg-black/40 border ${isOpen ? "border-[#FFF28E]/60 shadow-[0_0_15px_rgba(255,242,142,0.2)]" : "border-white/20"} rounded-[15px] px-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-black/50`}
      >
        <span
          className={`text-[22px] ${selectedOption ? "text-white" : "text-white/40"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 bg-[#2D2D1F] border border-white/10 rounded-[15px] shadow-2xl z-[500] overflow-hidden backdrop-blur-xl"
          >
            {/* data-lenis-prevent added to allow internal scrolling */}
            <div
              ref={listRef}
              data-lenis-prevent
              className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar"
            >
              {options?.map((opt: any) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/5 ${value === opt.value ? "bg-white/10 text-[#FFF28E]" : "text-white/80"}`}
                >
                  <span className="text-[20px] font-medium">{opt.label}</span>
                  {value === opt.value && (
                    <Check className="w-5 h-5 text-[#FFF28E]" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * CtaSection (Contact Form)
 * Refined with Double-Layer Ghosting Effect and Lenis-compatible Dropdown.
 */
export function CtaSection({
  title,
  description,
  image,
  formConfig,
  locale = "en",
}: CtaSectionProps) {
  const [formState, setFormState] = useState<any>({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    "project-type": "",
    "primary-requirement": "",
    "other-primary-requirement": "",
    "specific-requirements-project-description": "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mergedConfig = useMemo(() => {
    return typeof formConfig === "string"
      ? { id: formConfig }
      : formConfig || {};
  }, [formConfig]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false);
  const STORAGE_KEY = "busrom_privacy_consent";

  const showPrivacy = !!mergedConfig?.privacyConsentText;
  const SECTION_HEIGHT = showPrivacy ? 1050 : 922;
  const IMAGE_HEIGHT = SECTION_HEIGHT;
  const IMAGE_WIDTH = 689;
  const BG_TOP_OFFSET_SCALED = 120;

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
      setIsGloballyAccepted(true);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!!mergedConfig?.privacyConsentText && !privacyAccepted) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      let fileUrl = "";
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploadRes = await fetch("/api/media-upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        }
      }

      const submissionData = {
        formId: mergedConfig?.id,
        formName:
          mergedConfig?.name ||
          mergedConfig?.displayName ||
          "One-Stop Solution Contact",
        data: {
          ...formState,
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
      setFormState({
        name: "",
        company: "",
        email: "",
        whatsapp: "",
        "project-type": "",
        "primary-requirement": "",
        "other-primary-requirement": "",
        "specific-requirements-project-description": "",
      });
      setUploadedFile(null);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("[CtaSection] Submission Error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
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

  const fields = mergedConfig?.fields || [];
  const getField = (name: string) =>
    fields.find((f: any) => f.fieldName === name);

  /**
   * Safe Translation Helper
   * If the value is a string, returns it.
   * If it's an object { en, cn, ja... }, picks the correct locale.
   */
  const getTranslation = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val[locale] || val["en"] || Object.values(val)[0] || "";
    }
    return "";
  };

  return (
    <section
      id="cta-section"
      className="relative w-full overflow-hidden flex flex-col items-center bg-transparent z-10 transition-[height] duration-500 ease-in-out justify-start pb-24 xl:pb-0"
      style={{ height: "auto" }}
    >
      <style jsx>{`
        @media (min-width: 1280px) {
          #cta-section {
            height: ${SECTION_HEIGHT}px !important;
          }
        }
      `}</style>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* 1. Green Base Background */}
      <div
        className="absolute inset-x-0 bottom-0 bg-[#5E571F] z-0 hidden xl:block"
        style={{ top: `${BG_TOP_OFFSET_SCALED}px` }}
      />
      <div className="absolute inset-0 bg-[#5E571F] z-0 xl:hidden" />

      {/* 2. Visual Layer: Double-Layer Images (Solid Foreground + Transparent Ghost) - Desktop Only */}
      <div
        className="absolute right-0 bottom-0 z-10 pointer-events-none hidden xl:block"
        style={{
          width: `${IMAGE_WIDTH}px`,
          height: `${IMAGE_HEIGHT}px`,
        }}
      >
        {image && (
          <div className="relative w-full h-full overflow-visible">
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              whileInView={{ opacity: 0.25, x: -80, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <OptimizedImage
                image={image}
                alt="Ghost Layer"
                className="w-full h-full object-cover"
                size="large"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0, y: 30 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-0 z-10"
            >
              <OptimizedImage
                image={image}
                alt="Solid Layer"
                className="w-full h-full object-cover"
                size="large"
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* 3. Mobile Content Container (Responsive Column) */}
      <div className="relative z-20 w-full xl:hidden flex flex-col items-center px-6 py-12 gap-10">
        <div className="w-full max-w-[500px] text-center space-y-4">
          <AnimatePresence>
            {submitStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "mb-4 px-4 py-2 rounded-lg text-center font-bold",
                  submitStatus === "success"
                    ? "bg-[#FFF28E]/10 text-[#FFF28E]"
                    : "bg-red-500/10 text-red-400",
                )}
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {submitStatus === "success"
                  ? getTranslation(mergedConfig?.successMessage)
                  : getTranslation(mergedConfig?.errorNetworkMessage)}
              </motion.div>
            )}
          </AnimatePresence>
          <h2
            className="text-[32px] md:text-[40px] font-extrabold text-[#FFF28E] leading-tight tracking-tighter"
            style={{ fontFamily: "var(--font-anaheim)" }}
          >
            {getTranslation(title || mergedConfig?.displayName)}
          </h2>
          <p
            className="text-[16px] md:text-[18px] font-semibold text-white/90 leading-relaxed"
            style={{ fontFamily: "var(--font-anaheim)" }}
          >
            {getTranslation(description || mergedConfig?.description)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[540px] flex flex-col gap-4"
        >
          <input
            type="text"
            value={formState["name"]}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            placeholder={getTranslation(getField("name")?.placeholder)}
            className="w-full h-[68px] bg-white/5 border border-white/20 rounded-[15px] px-5 text-white text-[18px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
            required
          />
          <input
            type="text"
            value={formState["company"]}
            onChange={(e) =>
              setFormState({ ...formState, company: e.target.value })
            }
            placeholder={getTranslation(getField("company")?.placeholder)}
            className="w-full h-[68px] bg-white/5 border border-white/20 rounded-[15px] px-5 text-white text-[18px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
          />
          <input
            type="email"
            value={formState["email"]}
            onChange={(e) =>
              setFormState({ ...formState, email: e.target.value })
            }
            placeholder={getTranslation(getField("email")?.placeholder)}
            className="w-full h-[68px] bg-white/5 border border-white/20 rounded-[15px] px-5 text-white text-[18px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
            required
          />
          <div className="w-full h-[68px] bg-white/5 border border-white/20 rounded-[15px] overflow-hidden">
            <PhoneInput
              id="whatsapp-mobile"
              value={formState["whatsapp"] || ""}
              onChange={(phone) =>
                setFormState({ ...formState, whatsapp: phone })
              }
              placeholder={getTranslation(getField("whatsapp")?.placeholder)}
              className="!h-full !bg-transparent !w-full"
              buttonClassName="!bg-transparent !border-none !text-white hover:!bg-white/10 !px-4"
              inputClassName="!bg-transparent !text-white !placeholder-white/40 !text-[18px] !h-full !px-1"
              dialCodeClassName="!text-white !text-base"
            />
          </div>

          <div className="flex flex-col gap-4">
            <CustomDropdown
              placeholder={getTranslation(
                getField("project-type")?.placeholder,
              )}
              options={getField("project-type")?.options}
              value={formState["project-type"]}
              onChange={(val: string) =>
                setFormState({ ...formState, "project-type": val })
              }
              className="!h-[68px] !bg-white/5 !border !border-white/20 !rounded-[15px] !text-[18px] !px-5"
            />
            <CustomDropdown
              placeholder={getTranslation(
                getField("primary-requirement")?.placeholder,
              )}
              options={getField("primary-requirement")?.options}
              value={formState["primary-requirement"]}
              onChange={(val: string) =>
                setFormState({ ...formState, "primary-requirement": val })
              }
              className="!h-[68px] !bg-white/5 !border !border-white/20 !rounded-[15px] !text-[18px] !px-5"
            />
          </div>

          <input
            type="text"
            value={formState["other-primary-requirement"]}
            onChange={(e) =>
              setFormState({
                ...formState,
                "other-primary-requirement": e.target.value,
              })
            }
            placeholder={getTranslation(
              getField("other-primary-requirement")?.placeholder,
            )}
            className="w-full h-[68px] bg-white/5 border border-white/20 rounded-[15px] px-5 text-white text-[18px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
          />

          <textarea
            value={formState["specific-requirements-project-description"]}
            onChange={(e) =>
              setFormState({
                ...formState,
                "specific-requirements-project-description": e.target.value,
              })
            }
            placeholder={getTranslation(
              getField("specific-requirements-project-description")
                ?.placeholder,
            )}
            className="w-full h-36 bg-white/5 border border-white/20 rounded-[15px] p-5 text-white text-[18px] focus:border-[#FFF28E] resize-none placeholder:text-white/40"
          />

          <div className="flex flex-col gap-6 mt-4 items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 text-white hover:text-[#FFF28E] transition-all w-fit border border-white/20 rounded-full px-6 py-2.5 hover:bg-white/5"
            >
              <Upload className="w-5 h-5" />
              <span
                className="text-[18px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {uploadedFile
                  ? uploadedFile.name
                  : getTranslation(getField("file")?.label)}
              </span>
            </button>

            {mergedConfig?.privacyConsentText && (
              <div
                className="flex items-start gap-3 cursor-pointer w-full max-w-[320px]"
                onClick={() => handlePrivacyToggle(!privacyAccepted)}
              >
                <div
                  className={cn(
                    "mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all",
                    privacyAccepted
                      ? "bg-[#B2A224] border-[#B2A224]"
                      : "border-white/30 bg-black/30",
                  )}
                >
                  {privacyAccepted && <Check className="w-3 h-3 text-white" />}
                </div>
                <p className="text-[13px] leading-relaxed text-white/70 text-left select-none">
                  {getTranslation(mergedConfig.privacyConsentText)}
                </p>
              </div>
            )}

            <motion.button
              type="submit"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
              whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
              disabled={
                isSubmitting ||
                (!!mergedConfig?.privacyConsentText && !privacyAccepted)
              }
              className={cn(
                "w-full max-w-[320px] bg-[#B2A224] text-white text-[24px] font-black rounded-full shadow-lg transition-colors duration-300",
                "h-14 flex items-center justify-center",
                isSubmitting ||
                  (!!mergedConfig?.privacyConsentText && !privacyAccepted)
                  ? "grayscale opacity-80 cursor-not-allowed"
                  : "hover:bg-white hover:text-[#B2A224]",
              )}
              style={{ fontFamily: "var(--font-anaheim)" }}
            >
              {isSubmitting
                ? getTranslation(mergedConfig?.submittingText)
                : getTranslation(mergedConfig?.submitButtonText)}
            </motion.button>
          </div>
        </form>
      </div>

      {/* 4. Scaled Content Container (Form Area) - Desktop Only */}
      <div
        className="relative z-20 flex-shrink-0 origin-top hidden xl:flex items-start overflow-visible transition-[height] duration-500 ease-in-out"
        style={{
          width: `1920px`,
          height: `${Math.ceil(SECTION_HEIGHT / 0.7)}px`,
          transform: `scale(0.7)`,
        }}
      >
        <div className="pl-[153px] w-[1100px] pt-[350px]">
          <div className="mb-4">
            <AnimatePresence>
              {submitStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={cn(
                    "mb-2 text-[24px] font-bold uppercase tracking-widest",
                    submitStatus === "success"
                      ? "text-[#FFF28E]"
                      : "text-red-400",
                  )}
                  style={{ fontFamily: "var(--font-anaheim)" }}
                >
                  {submitStatus === "success"
                    ? getTranslation(mergedConfig?.successMessage)
                    : getTranslation(mergedConfig?.errorNetworkMessage)}
                </motion.div>
              )}
            </AnimatePresence>
            <h2
              className="text-[60px] font-extrabold text-[#FFF28E] leading-[1.1] mb-6 tracking-tighter"
              style={{ fontFamily: "var(--font-anaheim)" }}
            >
              {getTranslation(title || mergedConfig?.displayName)}
            </h2>
            <p
              className="text-[24px] font-semibold text-white/90 leading-[41px] max-w-[823px]"
              style={{ fontFamily: "var(--font-anaheim)" }}
            >
              {getTranslation(description || mergedConfig?.description)}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-x-12 gap-y-4 w-[773px] relative"
          >
            <input
              type="text"
              value={formState["name"]}
              onChange={(e) =>
                setFormState({ ...formState, name: e.target.value })
              }
              placeholder={getTranslation(getField("name")?.placeholder)}
              className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
              required
            />
            <input
              type="text"
              value={formState["company"]}
              onChange={(e) =>
                setFormState({ ...formState, company: e.target.value })
              }
              placeholder={getTranslation(getField("company")?.placeholder)}
              className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
            />

            <input
              type="email"
              value={formState["email"]}
              onChange={(e) =>
                setFormState({ ...formState, email: e.target.value })
              }
              placeholder={getTranslation(getField("email")?.placeholder)}
              className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
              required
            />
            <PhoneInput
              id="whatsapp"
              value={formState["whatsapp"] || ""}
              onChange={(phone) =>
                setFormState({ ...formState, whatsapp: phone })
              }
              placeholder={getTranslation(getField("whatsapp")?.placeholder)}
              className="!h-[63px] !bg-black/30 !border-white/20 !rounded-[15px] !w-full"
              buttonClassName="!bg-transparent !border-r-0 !text-white hover:!bg-white/10 !rounded-[15px] !px-4 !h-full"
              inputClassName="!bg-transparent !text-white !placeholder-white/40 !font-medium !text-[22px] !h-full !px-2"
              dialCodeClassName="!text-white !text-[20px]"
              containerClassName="!h-[63px]"
            />

            <div className="relative z-[502]">
              <CustomDropdown
                label={getTranslation(getField("project-type")?.label)}
                placeholder={getTranslation(
                  getField("project-type")?.placeholder,
                )}
                options={getField("project-type")?.options}
                value={formState["project-type"]}
                onChange={(val: string) =>
                  setFormState({ ...formState, "project-type": val })
                }
              />
            </div>
            <div className="relative z-[501]">
              <CustomDropdown
                label={getTranslation(getField("primary-requirement")?.label)}
                placeholder={getTranslation(
                  getField("primary-requirement")?.placeholder,
                )}
                options={getField("primary-requirement")?.options}
                value={formState["primary-requirement"]}
                onChange={(val: string) =>
                  setFormState({ ...formState, "primary-requirement": val })
                }
              />
            </div>

            <div />
            <input
              type="text"
              value={formState["other-primary-requirement"]}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  "other-primary-requirement": e.target.value,
                })
              }
              placeholder={getTranslation(
                getField("other-primary-requirement")?.placeholder,
              )}
              className="w-full h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
            />

            <div className="col-span-2">
              <textarea
                value={formState["specific-requirements-project-description"]}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    "specific-requirements-project-description": e.target.value,
                  })
                }
                placeholder={getTranslation(
                  getField("specific-requirements-project-description")
                    ?.placeholder,
                )}
                className="w-full h-[150px] bg-black/30 border border-white/20 rounded-[15px] p-6 text-white text-[20px] focus:border-[#FFF28E] resize-none placeholder:text-white/40"
              />
            </div>

            <div className="flex flex-col gap-4 w-[773px]">
              <div className="flex flex-col gap-4 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 text-white hover:text-[#FFF28E] transition-all w-fit border border-white/20 rounded-full px-8 py-3.5 hover:bg-white/5"
                >
                  <Upload className="w-8 h-8" />
                  <span
                    className="text-[24px] font-bold uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-anaheim)" }}
                  >
                    {uploadedFile
                      ? uploadedFile.name
                      : getTranslation(getField("file")?.label)}
                  </span>
                </button>

                {/* Privacy Consent Checkbox - Always show if text is present */}
                {mergedConfig?.privacyConsentText && (
                  <div
                    className="flex items-start gap-4 cursor-pointer group"
                    onClick={() => handlePrivacyToggle(!privacyAccepted)}
                  >
                    <div
                      className={cn(
                        "mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-all",
                        privacyAccepted
                          ? "bg-[#B2A224] border-[#B2A224]"
                          : "border-white/30 bg-black/30",
                      )}
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
                            strokeWidth={4}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-[18px] leading-relaxed text-white/70 max-w-[700px] whitespace-pre-line select-none text-left">
                      {getTranslation(mergedConfig.privacyConsentText)}
                    </p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: [1, 1.03, 1], rotate: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: 0,
                    transition: { duration: 0.2 },
                    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                  }}
                  whileTap={{
                    scale: 0.96,
                    rotate: 0,
                    transition: { duration: 0.1 },
                  }}
                  disabled={
                    isSubmitting ||
                    (!!mergedConfig?.privacyConsentText && !privacyAccepted)
                  }
                  className={cn(
                    "w-[419px] bg-[#B2A224] text-white text-[40px] font-black rounded-[63px] shadow-2xl transition-colors duration-300 self-center",
                    "min-h-[83px] h-auto py-4 whitespace-pre-line leading-tight px-8",
                    isSubmitting ||
                      (!!mergedConfig?.privacyConsentText && !privacyAccepted)
                      ? "grayscale opacity-80 cursor-not-allowed"
                      : "hover:bg-white hover:text-[#B2A224]",
                  )}
                  style={{ fontFamily: "var(--font-anaheim)" }}
                >
                  {isSubmitting
                    ? getTranslation(mergedConfig?.submittingText)
                    : getTranslation(mergedConfig?.submitButtonText)}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
