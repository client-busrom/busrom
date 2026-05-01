"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

const vw = (px: number) => `${(px / 1920) * 100}vw`;

interface RichTextSegment {
  text: string;
  bold?: boolean;
}

interface FormField {
  fieldName: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  order?: number;
}

interface FormConfig {
  id: string;
  name: string;
  fields: any; // Change to any to handle nested/localized structures
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  data?: { fields: any };
}

interface Props {
  locale?: string;
  bgImage?: string;
  displayImage?: string;
  logoImage?: string;
  richText?: RichTextSegment[];
  formId?: string;
  formConfig?: any;
}

// Custom Dropdown for "Beautification"
function CustomDropdown({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = field.options?.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative w-full font-montserrat">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between cursor-pointer rounded-[15px] font-semibold text-[#3D3708] transition-all hover:bg-[#C9BF99]"
        style={{
          height: vw(51),
          backgroundColor: "#D4CBAF",
          paddingLeft: vw(33),
          paddingRight: vw(33),
        }}
      >
        <span
          className={
            !value ? "text-[#9D9473]/70 truncate flex-1" : "truncate flex-1"
          }
        >
          {selectedOption
            ? selectedOption.label
            : field.label || field.placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#867C5A] flex-shrink-0"
        >
          <ChevronDown size={(vw(18) as any) || 18} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 z-[100] mt-1 rounded-[15px] shadow-2xl overflow-hidden border border-black/5 bg-white"
            style={{ top: "100%" }}
          >
            <div className="py-2 max-h-[300px] overflow-y-auto">
              {field.options?.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className="hover:bg-[#D4CBAF]/30 cursor-pointer text-[#3D3708] font-semibold transition-colors flex items-center justify-between"
                  style={{
                    height: vw(51),
                    paddingLeft: vw(33),
                    paddingRight: vw(33),
                    fontSize: vw(18),
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#756F3F]" />
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

export function ApplicationContactFormSection({
  locale = "en",
  bgImage,
  displayImage,
  logoImage,
  richText,
  formId,
  formConfig: propFormConfig,
}: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [fileName, setFileName] = useState("");

  // Precision CSS Values
  const cardW = 1290;
  const cardH = 800;
  const leftW = 493;
  const rightW = 642;
  const paddingL = 60;
  const paddingR = 57;
  const gapY = 14;
  const gapX = 33;
  const inputPX = 33;
  const marginTopL = 75;
  const marginTopR = 87;

  const formConfig = useMemo(() => {
    return propFormConfig;
  }, [propFormConfig]);

  // Handle initial form data state from fields
  useEffect(() => {
    if (formConfig) {
      const rawFields = formConfig?.fields || formConfig?.data?.fields;
      if (rawFields) {
        const fieldsArr = Array.isArray(rawFields)
          ? rawFields
          : rawFields[locale] || rawFields["en"] || [];
        const initialData: Record<string, any> = {};
        if (Array.isArray(fieldsArr)) {
          fieldsArr.forEach((f: FormField) => {
            initialData[f.fieldName] = "";
          });
          setFormData(initialData);
        }
      }
    }
  }, [formConfig, locale]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          formName: formConfig?.name || "app-form",
          data: formData,
          locale,
          sourcePage: window.location.href,
        }),
      });
      if (res.ok) setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSegment = (segment: RichTextSegment, idx: number) => {
    if (segment.bold) {
      return (
        <span
          key={idx}
          className="text-[#D6CD88] font-cherry-bomb not-italic text-[1.12em] tracking-tight inline whitespace-pre-line"
          style={{
            textShadow:
              "2px 2px 0 #514a0d, -1px -1px 0 #514a0d, 1px -1px 0 #514a0d, -1px 1px 0 #514a0d",
          }}
        >
          {segment.text}
        </span>
      );
    }
    return (
      <span key={idx} className="font-cherry-bomb inline whitespace-pre-line">
        {segment.text}
      </span>
    );
  };

  const renderField = (field: FormField) => {
    const commonStyles: React.CSSProperties = {
      height: vw(51),
      backgroundColor: "#D4CBAF",
      paddingLeft: vw(inputPX),
      paddingRight: vw(inputPX),
      borderRadius: vw(15),
    };

    if (field.fieldType === "select") {
      return (
        <CustomDropdown
          key={field.fieldName}
          field={field}
          value={formData[field.fieldName] || ""}
          onChange={(v) => handleInputChange(field.fieldName, v)}
        />
      );
    }

    if (
      field.fieldName.includes("phone") ||
      field.fieldType === "tel" ||
      field.fieldType === "phone"
    ) {
      return (
        <div key={field.fieldName} className="font-montserrat">
          <PhoneInput
            value={formData[field.fieldName] || ""}
            onChange={(val) => handleInputChange(field.fieldName, val)}
            placeholder={field.placeholder || field.label}
            className="!bg-[#D4CBAF] !rounded-[15px] !h-[51px] border-none"
            inputClassName="!bg-transparent !text-[#3D3708] !font-montserrat !font-semibold !text-base !placeholder-[#9D9473]/60"
          />
        </div>
      );
    }

    if (field.fieldType === "textarea") {
      return (
        <div
          key={field.fieldName}
          className="flex flex-col font-montserrat"
          style={{ gap: vw(10) }}
        >
          <span className="font-bold text-black" style={{ fontSize: vw(20) }}>
            {field.label}
          </span>
          <textarea
            placeholder={field.placeholder}
            className="w-full font-semibold text-[#3D3708] placeholder:text-[#9D9473]/60 outline-none resize-none"
            style={{
              height: vw(130),
              backgroundColor: "#D4CBAF",
              borderRadius: vw(15),
              fontSize: vw(18),
              paddingLeft: vw(33),
              paddingRight: vw(33),
              paddingTop: vw(18),
            }}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
          />
        </div>
      );
    }

    const isScope =
      field.fieldName.includes("scope") || field.label?.includes("Scope");
    return (
      <div
        key={field.fieldName}
        className="flex flex-col font-montserrat"
        style={{ gap: isScope ? vw(10) : 0 }}
      >
        {isScope && (
          <span className="font-bold text-black" style={{ fontSize: vw(20) }}>
            {field.label}
          </span>
        )}
        <input
          type={field.fieldType === "email" ? "email" : "text"}
          placeholder={field.placeholder || field.label}
          className="w-full font-semibold text-[#3D3708] placeholder:text-[#9D9473]/60 outline-none"
          style={{ ...commonStyles, fontSize: vw(18) }}
          value={formData[field.fieldName] || ""}
          onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
        />
      </div>
    );
  };

  const sortedFields = useMemo(() => {
    const rawFields = formConfig?.fields || formConfig?.data?.fields;
    console.log("[ApplicationContactFormSection] Computing sortedFields:", {
      hasFormConfig: !!formConfig,
      rawFieldsPresence: !!rawFields,
      rawFieldsType: typeof rawFields,
    });

    if (!rawFields) return [];

    const fieldsArr = Array.isArray(rawFields)
      ? rawFields
      : rawFields[locale] || rawFields["en"] || [];
    console.log(
      "[ApplicationContactFormSection] Extracted fieldsArr:",
      fieldsArr,
    );

    if (!Array.isArray(fieldsArr)) return [];

    return [...fieldsArr]
      .filter(
        (f) =>
          !f.fieldName?.toLowerCase().includes("upload") &&
          !f.label?.toLowerCase().includes("upload"),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [formConfig, locale]);

  const renderRows = () => {
    const list: React.ReactNode[] = [];
    for (let i = 0; i < sortedFields.length; i++) {
      const f = sortedFields[i];
      const next = sortedFields[i + 1];
      // Pair first 4 short fields
      if (
        i < 4 &&
        i % 2 === 0 &&
        next &&
        ["text", "email", "tel", "phone", "select"].includes(next.fieldType)
      ) {
        list.push(
          <div
            key={`row-${i}`}
            className="grid grid-cols-2"
            style={{ gap: vw(gapX) }}
          >
            {renderField(f)}
            {renderField(next)}
          </div>,
        );
        i++;
      } else {
        list.push(renderField(f));
      }
    }
    return list;
  };

  return (
    <section
      className="relative w-full flex items-start justify-center select-none z-20"
      style={{ height: vw(1080), backgroundColor: "#000000" }}
    >
      <div className="absolute inset-0">
        {bgImage ? (
          <img
            src={bgImage}
            alt="Bg"
            className="w-full h-full object-cover blur-[8px]"
          />
        ) : (
          <div className="w-full h-full bg-[#756F3F]" />
        )}
      </div>
      {logoImage && (
        <div
          className="absolute w-full flex justify-center z-[100] pointer-events-none"
          style={{ bottom: vw(-160) }}
        >
          <img src={logoImage} alt="Logo" className="w-[96%] object-contain" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="relative z-10 flex backdrop-blur-[15px] mt-[60px]"
        style={{
          width: vw(cardW),
          height: vw(cardH),
          borderRadius: vw(59),
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          paddingLeft: vw(paddingL),
          paddingRight: vw(paddingR),
          paddingTop: vw(marginTopL),
        }}
      >
        {/* LEFT COMPONENT */}
        <div className="flex flex-col h-full" style={{ width: vw(leftW) }}>
          <div
            className="font-cherry-bomb italic font-black text-[#1D1A02] leading-[1.2] whitespace-pre-line block"
            style={{ fontSize: vw(34), width: vw(leftW) }}
          >
            {(() => {
              // Filter out the marker text if it's accidentally included in segments
              const displaySegments = (richText || []).filter(
                (s) => s.text && s.text.trim().toLowerCase() !== "contact-form-title"
              );

              if (displaySegments.length > 0 && displaySegments.some((s) => s.text && s.text.trim())) {
                return displaySegments.map((segment, i) => renderSegment(segment, i));
              }
              return (
                <span>
                  Whether For <span className="text-[#D6CD88] font-bold">Engineering Solutions</span> Or Innovative Customization.
                </span>
              );
            })()}
          </div>

          <div
            className="mt-auto overflow-hidden rounded-[35px] border-4 border-[#F6F4ED]"
            style={{ width: vw(493), height: vw(314), marginBottom: vw(60) }}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt="Detail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </div>
        </div>

        <div className="flex-grow" />

        <div
          className="h-full flex flex-col"
          style={{ width: vw(rightW), marginTop: vw(marginTopR - marginTopL) }}
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full font-montserrat"
            style={{ gap: vw(gapY) }}
          >
            {renderRows()}

            <div className="flex items-center" style={{ marginTop: vw(5) }}>
              <label
                className="border border-black/50 rounded-full flex items-center justify-center px-[vw(20)] cursor-pointer hover:bg-black/5 transition-colors"
                style={{ height: vw(46.5), width: vw(205.8) }}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
                <Upload
                  className="mr-2 text-black"
                  size={(vw(18) as any) || 18}
                />
                <span
                  className="font-semibold text-black truncate font-montserrat"
                  style={{ fontSize: vw(18) }}
                >
                  {fileName || "Upload File"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#756F3F] text-white font-montserrat font-bold rounded-full hover:bg-[#464010] shadow-md disabled:opacity-50 transition-all active:scale-[0.98]"
              style={{ height: vw(66), fontSize: vw(34), marginTop: vw(10) }}
            >
              {isSubmitting
                ? "Submitting..."
                : formConfig?.submitButtonText || "Get A Customized Solution"}
            </button>
            {submitStatus === "success" && (
              <p className="text-green-700 text-center font-bold mt-2">
                {formConfig?.successMessage || "Submitted!"}
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </section>
  );
}
