"use client";

import React, { FormEvent, useState, useEffect, useRef } from "react";
import { CUSTOM_ICONS } from "@/lib/icons";
import { AnimatePresence, motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ChevronDown } from "lucide-react";
import { PhoneInput, COUNTRIES } from "@/components/ui/PhoneInput";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountrySelectorList } from "@/components/ui/CountryCodePicker";

import { cn } from "@/lib/utils";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) =>
  `clamp(${px * 0.6}px, ${(px / 390) * 100}vw, ${px}px)`;

interface FaqContactSectionProps {
  data: {
    formConfig: any;
    image: any;
  };
  locale: string;
}

export function FaqContactSection({ data, locale }: FaqContactSectionProps) {
  const { formConfig, image } = data;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyText, setPrivacyText] = useState<string | null>(null);
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

  // WhatsApp / Phone Atomic State
  const [selectedCountry, setSelectedCountry] = useState<
    [string, string, string]
  >(COUNTRIES[0]);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const countrySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countrySelectorRef.current &&
        !countrySelectorRef.current.contains(event.target as Node)
      ) {
        setIsCountrySelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch form config for privacy text and other messages
  useEffect(() => {
    if (!formConfig?.name) return;
    const fetchConfig = async () => {
      try {
        const res = await fetch(
          `/api/form-config/${formConfig.name}?locale=${locale}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.privacyConsentText) {
            setPrivacyText(data.privacyConsentText);
          }
        }
      } catch (error) {
        console.error("Failed to fetch form config:", error);
      }
    };
    fetchConfig();
  }, [formConfig?.name, locale]);

  // Sync with global storage
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

  const titleParts = (formConfig?.displayName || "").split("\n");
  const description = formConfig?.description || "";
  const fileField = formConfig?.fields?.find((f: any) => f.fieldType === "file");

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    field: any,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("formConfigId", formConfig?.id || "");
      uploadData.append("fieldName", fieldName);

      const res = await fetch("/api/form-file-upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({ ...prev, [fieldName]: result.fileUrl }));
      } else {
        setError("File upload failed");
        setFileName("");
      }
    } catch (err) {
      setError("Network error during upload");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    fieldName: string,
  ) => {
    const element = e.target;
    element.style.height = vw(120);
    const newHeight = Math.max(
      element.scrollHeight,
      (120 / DESIGN_WIDTH) * window.innerWidth,
    );
    element.style.height = `${newHeight}px`;

    setFormData({ ...formData, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name,
          data: formData,
          locale,
          sourcePage: typeof window !== "undefined" ? window.location.href : "",
          userLocalTime: new Date().toString(),
        }),
      });

      if (res.ok) {
        // GTM Tracking
        if (typeof window !== "undefined" && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "form_submit_success",
            form_id: formConfig?.name || "faq-contact-form",
            form_name: formConfig?.name || "faq-contact-form",
          });
        }
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to submit");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={
        isMobile
          ? {
              background: "linear-gradient(103deg, #645c1d 0%, #fff587 100%)",
              paddingTop: mvw(80),
              paddingBottom: mvw(100),
            }
          : {
              minHeight: vw(922),
              background: "linear-gradient(113deg, #645c1d 0%, #fff587 100%)",
              paddingTop: vw(80),
              paddingBottom: vw(80),
            }
      }
    >
      <style jsx>{`
        .faq-input-el {
          color: #FFFFFF !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #FFFFFF !important;
        }
        .faq-input-el::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.5) !important;
        }
        .faq-input-el:-webkit-autofill,
        .faq-input-el:-webkit-autofill:hover,
        .faq-input-el:-webkit-autofill:focus {
          -webkit-text-fill-color: #FFFFFF !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        /* 针对下拉菜单选定值后的样式 */
        .faq-dropdown-inner[style*="color: white"] .faq-dropdown-btn-text,
        .faq-dropdown-inner[style*="color: rgb(255, 255, 255)"] .faq-dropdown-btn-text {
          color: #FFFFFF !important;
          opacity: 1 !important;
        }
      `}</style>
      <div
        className={cn(
          "relative z-10 w-full mx-auto flex",
          isMobile ? "flex-col px-[5%]" : "px-[10.8%] gap-[3.8%] items-center",
        )}
      >
        {/* Left Side: Content & Form */}
        <div
          className={cn(
            "flex flex-col relative z-10",
            isMobile ? "w-full max-w-[640px] mx-auto text-center" : "",
          )}
          style={!isMobile ? { width: vw(710) } : {}}
        >
          {/* Titles */}
          <div style={{ marginBottom: isMobile ? mvw(16) : vw(16) }}>
            {titleParts[0] && (
              <svg width="100%" height="100%" viewBox="0 0 1000 120" preserveAspectRatio="xMinYMid meet" className="overflow-visible">
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0.2" x2="0" y2="1">
                    <stop offset="0%" stopColor="#736A2C" />
                    <stop offset="100%" stopColor="#CABC5A" />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B6329" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                </defs>
                <text
                  x={isMobile ? "50%" : "0"}
                  y="90"
                  textAnchor={isMobile ? "middle" : "start"}
                  fill="url(#fillGrad)"
                  stroke="url(#strokeGrad)"
                  strokeWidth={isMobile ? "1" : "2"}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  style={{
                    fontSize: isMobile ? "64px" : "96px",
                    fontWeight: 900,
                    fontFamily: "var(--font-anaheim), sans-serif",
                  }}
                >
                  {titleParts[0].trim()}
                </text>
              </svg>
            )}
            {titleParts[1] && (
              <h3
                className="font-black text-[#fff28d]"
                style={{
                  fontSize: isMobile ? mvw(40) : vw(60),
                  lineHeight: 1.1,
                  fontFamily: "var(--font-anaheim), sans-serif",
                }}
              >
                {titleParts[1].trim()}
              </h3>
            )}
          </div>

          {description && (
            <p
              className="text-white font-semibold whitespace-pre-line"
              style={{
                fontSize: isMobile ? mvw(16) : vw(16),
                lineHeight: 1.3,
                fontFamily: "var(--font-anaheim), sans-serif",
                marginBottom: isMobile ? mvw(24) : vw(16),
              }}
            >
              {description}
            </p>
          )}

          {/* Form */}
          <form
            id={formConfig?.name || "faq-contact-form"}
            onSubmit={handleSubmit}
            className={cn(
              "grid items-end",
              isMobile ? "grid-cols-1 w-full" : "grid-cols-2",
            )}
            style={{
              gap: isMobile ? mvw(12) : vw(12),
              width: !isMobile ? vw(704) : "100%",
            }}
          >
            {formConfig?.fields?.filter((f: any) => f.fieldType !== "file").map((field: any) => (
              <div
                key={field.fieldName}
                className={
                  isMobile || field.width === "full"
                    ? "col-span-2"
                    : "col-span-1"
                }
              >
                {field.fieldType === "select" && (
                  <label
                    className="block font-bold text-left"
                    style={{
                      fontSize: isMobile ? mvw(14) : vw(18),
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: isMobile ? mvw(8) : vw(8),
                      fontFamily: "var(--font-anaheim), sans-serif",
                    }}
                  >
                    {field.label}{" "}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                )}

                {field.fieldType === "textarea" ? (
                  <textarea
                    className="faq-input-el no-scrollbar"
                    style={{
                      width: "100%",
                      height: isMobile ? mvw(100) : vw(120),
                      background: "#211c0b2e",
                      border: "1px solid #ffffff57",
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      padding: isMobile ? mvw(12) : vw(16),
                      resize: "none",
                      overflow: "hidden",
                      color: "white",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                    placeholder={
                      (field.required ? "* " : "") + field.placeholder
                    }
                    required={field.required}
                    spellCheck="false"
                    onChange={(e) => handleTextareaChange(e, field.fieldName)}
                  />
                ) : field.fieldType === "select" ? (
                  <div
                    className="faq-dropdown-wrapper"
                    style={{ height: isMobile ? mvw(50) : vw(60) }}
                  >
                    <CustomDropdown
                      options={field.options}
                      value={formData[field.fieldName]}
                      onChange={(val: string) =>
                        setFormData({ ...formData, [field.fieldName]: val })
                      }
                      placeholder={field.placeholder || "Select..."}
                      className="border-none faq-dropdown-inner"
                      style={{
                        borderRadius: isMobile ? mvw(12) : vw(15),
                        border: "1px solid #ffffff57",
                        background: "#211c0b2e",
                        color: formData[field.fieldName] ? "white" : "rgba(255, 255, 255, 0.5)",
                      }}
                      buttonClassName="!px-4 !font-anaheim !font-semibold faq-dropdown-btn-text"
                      itemClassName="!px-4 !py-3 !font-anaheim !font-semibold text-white/90"
                      listClassName="!bg-[#4d4618] !border-white/20"
                    />
                  </div>
                 ) : field.fieldName === "whatsapp" ||
                  field.fieldType === "tel" ? (
                  <div
                    className="faq-phone-wrapper relative"
                    ref={countrySelectorRef}
                    style={{ height: isMobile ? mvw(50) : vw(60) }}
                  >
                    <div
                      className="flex items-stretch overflow-hidden h-full w-full"
                      style={{
                        borderRadius: isMobile ? mvw(12) : vw(15),
                        border: "1px solid #ffffff57",
                        background: "#211c0b2e",
                        color: "white",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setIsCountrySelectorOpen(!isCountrySelectorOpen)
                        }
                        className="h-full flex items-center justify-center gap-2 border-r border-white/20 transition-all hover:bg-white/5"
                        style={{
                          paddingLeft: isMobile ? mvw(12) : vw(16),
                          paddingRight: isMobile ? mvw(8) : vw(12),
                        }}
                      >
                        <CountryFlag
                          countryCode={selectedCountry[1]}
                          className={isMobile ? "w-5 h-3" : "w-6 h-4"}
                        />
                        <span
                          className="font-semibold"
                          style={{
                            fontSize: isMobile ? mvw(14) : vw(16),
                            color: "white",
                            fontFamily: "var(--font-anaheim), sans-serif",
                          }}
                        >
                          +{selectedCountry[2]}
                        </span>
                        <ChevronDown
                          className={cn(
                            "transition-transform duration-200 text-white/50",
                            isCountrySelectorOpen && "rotate-180",
                          )}
                          size={isMobile ? 14 : 16}
                        />
                      </button>

                      <input
                        type="tel"
                        value={formData[field.fieldName] || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            [field.fieldName]: e.target.value,
                          });
                        }}
                        placeholder={
                          (field.required ? "* " : "") + field.placeholder
                        }
                        className="faq-input-el flex-1 min-w-0 bg-transparent border-none outline-none font-semibold"
                        style={{
                          paddingLeft: isMobile ? mvw(12) : vw(16),
                          paddingRight: isMobile ? mvw(12) : vw(16),
                          color: "white",
                          fontSize: isMobile ? mvw(16) : vw(16),
                          fontFamily: "var(--font-anaheim), sans-serif",
                        }}
                      />
                    </div>

                    {isCountrySelectorOpen && (
                      <div
                        className="absolute left-0 bottom-full mb-2 z-[100]"
                        style={{
                          width: isMobile ? "280px" : "320px",
                        }}
                      >
                        <CountrySelectorList
                          onSelect={(c) => {
                            setSelectedCountry(c);
                            setIsCountrySelectorOpen(false);
                          }}
                          onClose={() => setIsCountrySelectorOpen(false)}
                          className="shadow-xl"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.fieldType}
                    className="faq-input-el"
                    style={{
                      width: "100%",
                      height: isMobile ? mvw(50) : vw(60),
                      background: "#211c0b2e",
                      border: "1px solid #ffffff57",
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      padding: isMobile ? `0 ${mvw(16)}` : `0 ${vw(16)}`,
                      color: "white",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                    placeholder={
                      (field.required ? "* " : "") + field.placeholder
                    }
                    required={field.required}
                    spellCheck="false"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.fieldName]: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}

            <div className="col-span-2">
              <div
                className={cn(
                  "flex",
                  isMobile
                    ? "flex-col gap-4 mb-4"
                    : "flex-row items-center gap-8 mb-6",
                )}
              >
                {fileField && (
                  <div className="flex-shrink-0">
                    <label
                      className="flex items-center cursor-pointer transition-all faq-upload-btn"
                      style={{
                        width: isMobile ? "100%" : "fit-content",
                        height: isMobile ? mvw(50) : vw(60),
                        borderRadius: isMobile ? mvw(50) : vw(65),
                        border: "1px solid #ffffff57",
                        padding: isMobile ? `0 ${mvw(20)}` : `0 ${vw(50)}`,
                        background: "#211c0b2e",
                        gap: isMobile ? mvw(12) : vw(12),
                        justifyContent: isMobile ? "center" : "flex-start",
                      }}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(e, fileField.fieldName, fileField)
                        }
                      />
                      <svg
                        width="25"
                        height="25"
                        viewBox={CUSTOM_ICONS.upload.viewBox}
                        fill="none"
                        className="upload-icon transition-colors flex-shrink-0"
                        style={{
                          width: isMobile ? mvw(16) : vw(16),
                          height: isMobile ? mvw(16) : vw(16),
                          color: fileName
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        <path
                          d={CUSTOM_ICONS.upload.path}
                          fill="currentColor"
                        />
                      </svg>
                      <span
                        className="font-semibold truncate upload-text transition-colors"
                        style={{
                          fontSize: isMobile ? mvw(16) : vw(16),
                          color: fileName
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.5)",
                          fontFamily: "var(--font-anaheim), sans-serif",
                        }}
                      >
                        {uploading
                          ? "..."
                          : fileName ||
                            (fileField.required ? "* " : "") +
                              (fileField.label === "upload file" ||
                              fileField.label === "Attach File"
                                ? fileField.label
                                : fileField.placeholder)}
                      </span>
                    </label>
                  </div>
                )}

                {/* Privacy Consent */}
                {privacyText && (
                  <div
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => handlePrivacyToggle(!privacyAccepted)}
                  >
                    <div
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-all ${
                        privacyAccepted
                          ? "bg-[#d1be2e] border-[#d1be2e]"
                          : "border-white/30 bg-transparent"
                      }`}
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
                    <p className={cn(
                      "text-sm leading-relaxed select-none text-left whitespace-pre-line transition-colors",
                      privacyAccepted ? "text-white" : "text-white/70"
                    )}>
                      {privacyText}
                    </p>
                  </div>
                )}
              </div>
              <motion.button
                className="font-semibold"
                style={{
                  transformOrigin: "center",
                  width: "100%",
                  height: isMobile ? mvw(56) : vw(68),
                  background: "#d1be2e",
                  borderRadius: isMobile ? mvw(56) : vw(63),
                  fontSize: isMobile ? mvw(20) : vw(40),
                  fontWeight: "black",
                  color: "white",
                  fontFamily: "var(--font-anaheim), sans-serif",
                  marginTop: isMobile ? mvw(12) : 0,
                  border: "none",
                  cursor:
                    submitting ||
                    uploading ||
                    (!!privacyText && !privacyAccepted)
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    submitting ||
                    uploading ||
                    (!!privacyText && !privacyAccepted)
                      ? 0.6
                      : 1,
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
                  submitting || uploading || (!!privacyText && !privacyAccepted)
                }
              >
                {submitting
                  ? formConfig?.submittingText || "Submitting..."
                  : formConfig?.submitButtonText || "Get Professional Support"}
              </motion.button>

              {submitted && (
                <p
                  className="text-center text-[#fff28d] mt-4 font-bold"
                  style={{ fontSize: isMobile ? mvw(14) : vw(18) }}
                >
                  {formConfig?.successMessage || "Success!"}
                </p>
              )}
              {error && (
                <p
                  className="text-red-400 text-center mt-2"
                  style={{ fontSize: isMobile ? mvw(14) : vw(16) }}
                >
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Decorative Image with SVG Mask */}
        <div
          className={cn(
            "flex pointer-events-none relative",
            isMobile ? "w-full justify-center mt-12" : "",
          )}
          style={{
            zIndex: 0,
            marginTop: isMobile ? mvw(50) : vw(50),
          }}
        >
          {/* Hidden SVG for defining the clip path */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <clipPath id="faq-mask" clipPathUnits="objectBoundingBox">
                <path
                  d="M850 327.106C866.568 327.106 880 340.538 880 357.106V1057C880 1073.57 866.569 1087 850 1087H30C13.4315 1087 0 1073.57 0 1057V646.47C0.000139075 629.901 13.4315 616.47 30 616.47H417.284C429.577 613.94 442.501 604.325 445.366 587.623V357.106C445.366 340.538 458.798 327.106 475.366 327.106H850ZM406 0C422.569 5.66949e-06 436 13.4315 436 30V577.013C436 593.581 422.568 607.013 406 607.013H30C13.4315 607.013 0.000131829 593.581 0 577.013V30C2.06546e-05 13.4315 13.4315 4.02664e-07 30 0H406ZM850 0C866.569 5.66949e-06 880 13.4315 880 30V287.562C880 304.131 866.568 317.562 850 317.562H474C457.432 317.562 444 304.131 444 287.562V30C444 13.4315 457.431 4.02662e-07 474 0H850Z"
                  transform="scale(0.0011363636, 0.0009199632)"
                />
              </clipPath>
            </defs>
          </svg>

          <div
            style={{
              width: isMobile ? mvw(340) : vw(700),
              height: isMobile ? mvw(390) : vw(804),
              clipPath: "url(#faq-mask)",
              overflow: "hidden",
            }}
          >
            <OptimizedImage
              image={image}
              className="w-full h-full object-cover opacity-80"
              size="large"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        textarea::-webkit-scrollbar {
          display: none;
        }
        textarea {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
        }
        .faq-input-el {
          color: #FFFFFF !important;
          -webkit-text-fill-color: #FFFFFF !important;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
          font-size: ${isMobile ? mvw(16) : vw(16)} !important;
        }

        /* Fix Chrome Autofill Styles */
        .faq-input-el:-webkit-autofill,
        .faq-input-el:-webkit-autofill:hover,
        .faq-input-el:-webkit-autofill:focus {
          -webkit-text-fill-color: #FFFFFF !important;
          transition: background-color 5000000s ease-in-out 0s !important;
          background-color: transparent !important;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
        }

        .faq-submit-btn:hover:not(:disabled) {
          background-color: white !important;
          color: #d1be2e !important;
        }
        .faq-upload-btn:hover {
          background-color: white !important;
          border-color: white !important;
        }
        .faq-upload-btn:hover :global(.upload-icon),
        .faq-upload-btn:hover .upload-text {
          color: #645c1d !important;
        }
        .faq-phone-wrapper:hover :global(.faq-phone-inner),
        .faq-dropdown-wrapper:hover :global(.faq-dropdown-inner) {
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        .faq-phone-wrapper:hover,
        .faq-dropdown-wrapper:hover {
          --text-color: rgba(255, 255, 255, 0.5) !important;
        }
        :global(.faq-phone-inner input),
        :global(.faq-phone-text),
        :global(.faq-dropdown-inner button span) {
          font-size: ${isMobile ? mvw(16) : vw(16)} !important;
        }

        /* Fix Chrome Autofill for PhoneInput specifically */
        :global(.faq-phone-inner input:-webkit-autofill),
        :global(.faq-phone-inner input:-webkit-autofill:hover),
        :global(.faq-phone-inner input:-webkit-autofill:focus),
        :global(.faq-phone-inner input:-webkit-autofill:active),
        :global(.faq-input-el:-webkit-autofill),
        :global(.faq-input-el:-webkit-autofill:hover),
        :global(.faq-input-el:-webkit-autofill:focus),
        :global(.faq-input-el:-webkit-autofill:active) {
          -webkit-text-fill-color: #FFFFFF !important;
          transition: background-color 5000000s ease-in-out 0s !important;
          background-color: transparent !important;
        }

        :global(.faq-dropdown-inner button svg) {
          width: ${isMobile ? mvw(16) : vw(16)} !important;
          height: ${isMobile ? mvw(16) : vw(16)} !important;
        }
      `}</style>
    </section>
  );
}
