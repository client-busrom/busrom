"use client";

import React, { FormEvent, useState } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Upload } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

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
      className="relative w-full overflow-hidden py-20"
      style={{
        minHeight: vw(922),
        height: "auto",
        background: "linear-gradient(103deg, #645c1d 0%, #fff587 100%)",
      }}
    >
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
          font-size: vw(20) !important;
        }
        .faq-submit-btn {
          transition: all 0.3s ease;
        }
        .faq-submit-btn:hover:not(:disabled) {
          background-color: white !important;
          color: #d1be2e !important;
        }
        .faq-upload-btn {
          transition: all 0.3s ease;
        }
        .faq-upload-btn :global(.upload-icon) {
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.3s ease;
        }
        .faq-upload-btn .upload-text {
          transition: color 0.3s ease;
        }
        .faq-upload-btn:hover {
          background-color: white !important;
          border-color: white !important;
        }
        .faq-upload-btn:hover :global(.upload-icon),
        .faq-upload-btn:hover .upload-text {
          color: #645c1d !important;
        }
        .faq-phone-wrapper,
        .faq-dropdown-wrapper {
          transition: all 0.3s ease !important;
        }
        .faq-phone-wrapper:hover :global(.faq-phone-inner),
        .faq-dropdown-wrapper:hover :global(.faq-dropdown-inner) {
          /* 移除变白逻辑，仅保持轻微提亮或不动 */
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        /* 移除强制黑字的变量修改 */
        .faq-phone-wrapper:hover,
        .faq-dropdown-wrapper:hover {
          --text-color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>

      <div
        className="flex w-full min-h-full"
        style={{
          paddingLeft: vw(208),
          paddingRight: vw(208),
          paddingTop: vw(38),
          gap: vw(73),
        }}
      >
        {/* Left Side: Content & Form */}
        <div className="flex flex-col relative z-10" style={{ width: vw(710) }}>
          {/* Titles */}
          <div style={{ marginBottom: vw(40) }}>
            {titleParts[0] && (
              <h2
                className="font-black leading-tight bg-clip-text text-transparent"
                style={{
                  fontSize: vw(96),
                  backgroundImage:
                    "linear-gradient(180deg, #cabc5a 0%, #736a2c 100%)",
                  fontFamily: "var(--font-anaheim), sans-serif",
                  filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.5))",
                  marginBottom: vw(10),
                }}
              >
                {titleParts[0].trim()}
              </h2>
            )}
            {titleParts[1] && (
              <h3
                className="font-black text-[#fff28d] leading-tight"
                style={{
                  fontSize: vw(60),
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
                fontSize: vw(24),
                lineHeight: 1.7,
                fontFamily: "var(--font-anaheim), sans-serif",
                marginBottom: vw(50),
              }}
            >
              {description}
            </p>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 items-end"
            style={{
              gap: vw(20),
              width: vw(704),
            }}
          >
            {formConfig?.fields?.map((field: any) => (
              <div
                key={field.fieldName}
                className={field.width === "full" ? "col-span-2" : "col-span-1"}
              >
                {field.fieldType === "select" && (
                  <label
                    className="block font-bold"
                    style={{
                      fontSize: vw(18),
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: vw(8),
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
                      height: vw(120),
                      background: "rgba(33, 28, 11, 0.18)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: vw(15),
                      padding: vw(16),
                      resize: "none",
                      overflow: "hidden",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: vw(20),
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
                    style={{ height: vw(60) }}
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
                        borderRadius: vw(15),
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(33, 28, 11, 0.20)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                      buttonClassName="!px-[vw(16)] !font-anaheim !text-[vw(20)] !font-semibold"
                      itemClassName="!px-[vw(16)] !py-[vw(12)] !font-anaheim !font-semibold !text-[vw(18)] !text-white/90"
                      listClassName="!bg-[#4d4618] !border-white/20"
                    />
                  </div>
                ) : field.fieldType === "file" ? (
                  <div className="flex flex-col">
                    <label
                      className="flex items-center cursor-pointer transition-all faq-upload-btn"
                      style={{
                        width: "fit-content",
                        height: vw(60),
                        borderRadius: vw(65),
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        padding: `0 ${vw(50)}`,
                        background: "rgba(33, 28, 11, 0.18)",
                        gap: vw(12),
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
                        style={{ width: vw(20), height: vw(20) }}
                      />
                      <span
                        className="font-semibold truncate upload-text transition-colors"
                        style={{
                          fontSize: vw(20),
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
                  <div className="faq-phone-wrapper" style={{ height: vw(60) }}>
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
                        borderRadius: vw(15),
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        background: "rgba(33, 28, 11, 0.20)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                      inputClassName="!bg-transparent !text-white/50 !font-semibold !font-anaheim !text-[vw(20)] placeholder:!text-white/50"
                      dialCodeClassName="!font-semibold !font-anaheim !text-[vw(20)] !border-none faq-phone-text"
                      dropdownClassName="!bg-[#3d3713] !border-white/20 !rounded-[vw(15)]"
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
                      height: vw(60),
                      background: "rgba(33, 28, 11, 0.18)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: vw(15),
                      padding: `0 ${vw(16)}`,
                      color: "rgba(255, 255, 255, 0.5)",
                      fontFamily: "var(--font-anaheim), sans-serif",
                      fontWeight: 600,
                      fontSize: vw(20),
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
              <button
                type="submit"
                disabled={submitting || uploading}
                className="faq-submit-btn"
                style={{
                  width: "100%",
                  height: vw(68),
                  background: "#d1be2e",
                  borderRadius: vw(63),
                  fontSize: vw(40),
                  fontWeight: "black",
                  color: "white",
                  fontFamily: "var(--font-anaheim), sans-serif",
                  marginTop: vw(20),
                  border: "none",
                  cursor: submitting || uploading ? "not-allowed" : "pointer",
                }}
              >
                {submitting
                  ? formConfig?.submittingText || "Submitting..."
                  : formConfig?.submitButtonText || "Get Professional Support"}
              </button>

              {submitted && (
                <p
                  className="text-center text-[#fff28d] mt-4 font-bold"
                  style={{ fontSize: vw(18) }}
                >
                  {formConfig?.successMessage || "Success!"}
                </p>
              )}
              {error && (
                <p
                  className="text-red-400 text-center mt-2"
                  style={{ fontSize: vw(16) }}
                >
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Decorative Image with SVG Mask */}
        <div
          className="flex pointer-events-none relative"
          style={{
            zIndex: 0,
            marginTop: vw(21),
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
              width: vw(700),
              height: vw(804),
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
    </section>
  );
}
