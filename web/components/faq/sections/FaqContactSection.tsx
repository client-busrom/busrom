"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Upload } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

import { cn } from "@/lib/utils";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;
const mvw = (px: number) => `clamp(${px * 0.6}px, ${(px / 390) * 100}vw, ${px}px)`;

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
      style={isMobile ? {
        background: "linear-gradient(103deg, #645c1d 0%, #fff587 100%)",
        paddingTop: mvw(80),
        paddingBottom: mvw(100),
      } : {
        minHeight: vw(922),
        background: "linear-gradient(103deg, #645c1d 0%, #fff587 100%)",
        paddingTop: vw(80),
        paddingBottom: vw(80),
      }}
    >
      <div
        className={cn(
          "relative z-10 w-full mx-auto flex",
          isMobile ? "flex-col px-[5%]" : "px-[10.8%] gap-[3.8%]"
        )}
      >
        {/* Left Side: Content & Form */}
        <div className={cn("flex flex-col relative z-10", isMobile ? "w-full max-w-[640px] mx-auto text-center" : "")} style={!isMobile ? { width: vw(710) } : {}}>
          {/* Titles */}
          <div style={{ marginBottom: isMobile ? mvw(16) : vw(16) }}>
            {titleParts[0] && (
              <h2
                className="font-black bg-clip-text text-transparent"
                style={{
                  fontSize: isMobile ? mvw(64) : vw(96),
                  lineHeight: 1.05,
                  backgroundImage:
                    "linear-gradient(180deg, #cabc5a 0%, #736a2c 100%)",
                  fontFamily: "var(--font-anaheim), sans-serif",
                  filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.5))",
                  marginBottom: isMobile ? mvw(4) : vw(4),
                }}
              >
                {titleParts[0].trim()}
              </h2>
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
              className="text-white font-semibold"
              style={{
                fontSize: isMobile ? mvw(18) : vw(24),
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
            onSubmit={handleSubmit}
            className={cn(
              "grid items-end",
              isMobile ? "grid-cols-1 w-full" : "grid-cols-2"
            )}
            style={{
              gap: isMobile ? mvw(12) : vw(12),
              width: !isMobile ? vw(704) : "100%",
            }}
          >
            {formConfig?.fields?.map((field: any) => (
              <div
                key={field.fieldName}
                className={isMobile || field.width === "full" ? "col-span-2" : "col-span-1"}
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
                      background: "rgba(33, 28, 11, 0.18)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      padding: isMobile ? mvw(12) : vw(16),
                      resize: "none",
                      overflow: "hidden",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                    placeholder={
                      (field.required ? "* " : "") + field.placeholder
                    }
                    required={field.required}
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
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(33, 28, 11, 0.20)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                      buttonClassName="!px-4 !font-anaheim !font-semibold faq-dropdown-btn-text"
                      itemClassName="!px-4 !py-3 !font-anaheim !font-semibold text-white/90"
                      listClassName="!bg-[#4d4618] !border-white/20"
                    />
                  </div>
                ) : field.fieldType === "file" ? (
                  <div className="flex flex-col items-center">
                    <label
                      className="flex items-center cursor-pointer transition-all faq-upload-btn"
                      style={{
                        width: isMobile ? "100%" : "fit-content",
                        height: isMobile ? mvw(50) : vw(60),
                        borderRadius: isMobile ? mvw(50) : vw(65),
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        padding: isMobile ? `0 ${mvw(20)}` : `0 ${vw(50)}`,
                        background: "rgba(33, 28, 11, 0.18)",
                        gap: isMobile ? mvw(12) : vw(12),
                        justifyContent: isMobile ? "center" : "flex-start",
                      }}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(e, field.fieldName, field)
                        }
                      />
                      <Upload
                        className="upload-icon transition-colors"
                        style={{
                          width: isMobile ? mvw(16) : vw(16),
                          height: isMobile ? mvw(16) : vw(16),
                          color: fileName
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.5)",
                        }}
                      />
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
                            (field.required ? "* " : "") +
                              (field.label === "upload file" ||
                              field.label === "Attach File"
                                ? field.label
                                : field.placeholder)}
                      </span>
                    </label>
                  </div>
                ) : field.fieldName === "whatsapp" ||
                  field.fieldType === "tel" ? (
                  <div className="faq-phone-wrapper" style={{ height: isMobile ? mvw(50) : vw(60) }}>
                    <PhoneInput
                      value={formData[field.fieldName] || ""}
                      onChange={(phone) =>
                        setFormData({ ...formData, [field.fieldName]: phone })
                      }
                      placeholder={
                        (field.required ? "* " : "") + field.placeholder
                      }
                      className="border-none faq-phone-inner"
                      style={{
                        borderRadius: isMobile ? mvw(12) : vw(15),
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(33, 28, 11, 0.20)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                      inputClassName="!bg-transparent !text-white/50 !font-semibold !font-anaheim placeholder:!text-white/50"
                      dialCodeClassName="!font-semibold !font-anaheim !border-none faq-phone-text"
                      dropdownClassName={`!bg-[#3d3713] !border-white/20 !rounded-[${isMobile ? mvw(12) : vw(15)}]`}
                      searchInputClassName="!bg-white/5 !border-white/20 !text-white/50"
                      countryItemClassName="!text-white/80"
                      buttonClassName="!border-none faq-phone-btn"
                    />
                  </div>
                ) : (
                  <input
                    type={field.fieldType}
                    className="faq-input-el"
                    style={{
                      width: "100%",
                      height: isMobile ? mvw(50) : vw(60),
                      background: "rgba(33, 28, 11, 0.18)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: isMobile ? mvw(12) : vw(15),
                      padding: isMobile ? `0 ${mvw(16)}` : `0 ${vw(16)}`,
                      color: "rgba(255, 255, 255, 0.5)",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: isMobile ? mvw(16) : vw(16),
                    }}
                    placeholder={
                      (field.required ? "* " : "") + field.placeholder
                    }
                    required={field.required}
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
              {/* Privacy Consent */}
              {privacyText && (
                <div
                  className="flex items-start gap-3 mb-3 cursor-pointer group"
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
                  <p className="text-sm leading-relaxed text-white/70 select-none text-left whitespace-pre-line">
                    {privacyText}
                  </p>
                </div>
              )}
               <motion.button
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
            isMobile ? "w-full justify-center mt-12" : ""
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
          color: rgba(255, 255, 255, 0.5) !important;
          font-family: var(--font-anaheim), sans-serif !important;
          font-weight: 600 !important;
          font-size: ${isMobile ? mvw(16) : vw(16)} !important;
        }
        
        /* Fix Chrome Autofill Styles */
        .faq-input-el:-webkit-autofill,
        .faq-input-el:-webkit-autofill:hover,
        .faq-input-el:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(255, 255, 255, 0.5) !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(33, 28, 11, 0.18) inset !important;
          transition: background-color 5000s ease-in-out 0s;
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
        :global(.faq-phone-inner input:-webkit-autofill) {
          -webkit-text-fill-color: rgba(255, 255, 255, 0.5) !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(33, 28, 11, 0.20) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        :global(.faq-dropdown-inner button svg) {
          width: ${isMobile ? mvw(16) : vw(16)} !important;
          height: ${isMobile ? mvw(16) : vw(16)} !important;
        }
      `}</style>
    </section>
  );
}
